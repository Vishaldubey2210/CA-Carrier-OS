# Runbook: Security Incident Response, Credential Revocation, and Regulatory Breach Notification

**Document ID:** `RB-OPS-006`  
**Severity Level:** P0 / Critical  
**Target Containment SLA:** < 15 Minutes from initial triage  
**Statutory Notification SLA:** Within 6 hours to CERT-In (Indian Computer Emergency Response Team) per cybersecurity directions  
**Applicable Roles:** Incident Commander, Application Security Engineer, Legal & Compliance Officer  
**Related Documents:**
- [Security Threat Model](../docs/architecture/security-threat-model.md)
- [Incident Response Policy](../docs/architecture/incident-response.md)
- [Data Protection & Privacy](../docs/architecture/data-protection.md)
- [Security Boundaries Diagram](../docs/architecture/security-boundaries.mmd)

---

## 1. Trigger Conditions & Incident Classification

Activate this runbook immediately upon confirming any of the following events:
1. **Credential Exposure:** Secret key or database password committed to public repository or detected in public pastebin.
2. **Unauthorized Cross-Tenant Data Access:** Confirmation that User A accessed CandidateProfile or Resumes belonging to User B.
3. **Privileged Account Compromise:** Platform Admin or Database Root account accessed from anomalous IP or without MFA.
4. **Malicious Tool Execution:** AI Career Agent executed write or destructive tool without cryptographic user approval signature.
5. **Data Exfiltration:** Unusually high egress traffic or mass query execution on candidate/employer records.

---

## 2. Step 1: Immediate Containment Procedures

### 2.1 Revoke Compromised User / Admin Sessions
Immediately invalidate all active JWT sessions and refresh tokens across Redis:

```bash
# Revoke all active sessions for a specific compromised user
USER_ID="usr_compromised_12345"
redis-cli -h ${REDIS_HOST} -a ${REDIS_AUTH_TOKEN} --tls <<EOF
DEL "session:user:${USER_ID}"
HDEL "refresh_tokens" "${USER_ID}"
EOF

# For emergency global session revocation (all users forced to re-authenticate):
# Rotate the JWT_SECRET in AWS Secrets Manager and restart API tasks
aws secretsmanager rotate-secret --secret-id ca-career-os/prod/jwt-secret
```

### 2.2 Rotate Compromised Infrastructure Credentials
If a database, AWS, or AI provider key has leaked:

```bash
# 1. Rotate Database User Password
aws rds modify-db-cluster \
  --db-cluster-identifier ca-career-os-prod-db \
  --master-user-password "${NEW_SECURE_PASSWORD}" \
  --apply-immediately

# 2. Rotate Anthropic / OpenAI API Keys in Secrets Manager
aws secretsmanager update-secret \
  --secret-id ca-career-os/prod/ai-keys \
  --secret-string '{"anthropic": "sk-ant-new-key...", "openai": "sk-new-key..."}'

# 3. Invalidate compromised AWS IAM Access Key
aws iam update-access-key \
  --user-name cicd-deployer \
  --access-key-id AKIAEXAMPLEKEY \
  --status Inactive
```

### 2.3 IP and Attack Vector Blocking via AWS WAF
Block offending IP addresses or malicious User-Agent headers at edge CloudFront distribution:

```bash
aws wafv2 update-ip-set \
  --name ca-career-os-blocklist \
  --scope CLOUDFRONT \
  --id 12345678-1234-1234-1234-123456789012 \
  --addresses "203.0.113.45/32" "198.51.100.22/32" \
  --lock-token "${WAF_LOCK_TOKEN}"
```

---

## 3. Step 2: Evidence Preservation & Forensics

Do NOT terminate running instances or delete container volumes before taking forensic snapshots:

1. **VPC Flow Logs & CloudTrail Capture:**
```bash
aws logs create-export-task \
  --task-name "sec-incident-$(date +%s)" \
  --log-group-name "/aws/cloudtrail/ca-career-os-prod" \
  --from $(date -d '24 hours ago' +%s000) \
  --to $(date +%s000) \
  --destination ca-career-os-forensic-vault \
  --destination-prefix "incident-$(date +%Y%m%d)"
```
2. **PostgreSQL Audit Log Extraction:**
Extract append-only records from `AuditEvent` table for the incident timeframe:
```sql
COPY (
  SELECT * FROM "AuditEvent" 
  WHERE "created_at" >= NOW() - INTERVAL '24 hours' 
  ORDER BY "created_at" ASC
) TO '/tmp/audit_evidence.csv' WITH CSV HEADER;
```

---

## 4. Step 3: Statutory & Regulatory Breach Notifications

Under the Indian IT Act and CERT-In Directions (No. 20(3)/2022-CERT-In), cybersecurity incidents must be reported **within 6 hours** of notice.

### 4.1 CERT-In Incident Report Drafting
- **Email:** `incident@cert-in.org.in`
- **Mandatory Fields:**
  - Organization Name: CA Career OS Operating Entity
  - Point of Contact: Designated Security Officer
  - Incident Type: (e.g., Unauthorized Access, Data Compromise, System Outage)
  - Time of Incident Detection (IST)
  - Affected Systems & Measures Taken to Contain
  - Log extracts and source IP hashes

### 4.2 Digital Personal Data Protection (DPDP) Act 2023 Compliance
If Personal Data (PII, resumes, financial info) was accessed:
1. Formulate breach notification to the **Data Protection Board of India**.
2. Notify impacted Data Principals (users) detailing:
   - Nature and extent of personal data breached.
   - Immediate security steps taken by CA Career OS.
   - Recommended actions for users (e.g., password reset, 2FA re-enrollment).

---

## 5. Post-Incident Review and Prevention Checklist

- [ ] Containment confirmed: Zero unauthorized queries or sessions active.
- [ ] Vulnerability patch deployed to production via verified CI/CD pipeline.
- [ ] All rotated credentials verified functional across all backend services.
- [ ] Complete incident timeline compiled with root-cause analysis (RCA).
- [ ] Regression automated tests created in `test/security/` covering the exploit vector.
- [ ] Post-mortem review held with engineering leads within 48 hours.
