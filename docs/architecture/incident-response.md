# CA Career OS — Security Incident Response & Forensics Protocol

> **Document Type:** Operational Security & Incident Response Protocol  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Security Incident Response Team (SIRT), On-Call Engineers, Leadership  

---

## 1. Incident Severity Classification & Response SLAs

| Severity Level | Definition & Criteria | Target Triage SLA | Target Containment SLA | Responsible Lead |
| :--- | :--- | :--- | :--- | :--- |
| **P0 — Critical** | Active cross-tenant data breach, production database outage, complete authentication failure, or root credential leak. | **$< 15$ Minutes** | **$< 1$ Hour** | Head of Engineering + Incident Commander |
| **P1 — High** | AI tool allowlist bypass, failure of human approval gate, job ingestion worker pipeline failure $> 12$h, or mass rate-limit failure. | **$< 30$ Minutes** | **$< 4$ Hours** | Staff Backend Engineer + Security Lead |
| **P2 — Medium** | Partial degradation of mock interview AI generation, non-critical webhook sync failure, isolated rate-limit false positives. | **$< 2$ Hours** | **$< 24$ Hours** | On-Call Backend Engineer |
| **P3 — Low** | Minor UI rendering discrepancies, individual cosmetic report glitches, non-breaking latency spikes. | **$< 8$ Hours** | **$< 72$ Hours** | Assigned Product Engineer |

---

## 2. Six-Phase Incident Response Lifecycle

```
[1. Detection & Identification] ──► Monitoring alerts, WAF anomaly, user bug report
           │
           ▼
[2. Triage & Severity Assignment] ──► Incident Commander assigned; War Room opened
           │
           ▼
[3. Containment (Immediate)] ──► Revoke active session tokens, isolate tenant, rate-limit IP
           │
           ▼
[4. Eradication & Fix] ──► Deploy hotfix, rotate compromised KMS keys, patch vulnerability
           │
           ▼
[5. Recovery & Verification] ──► Re-enable endpoints, verify health checks, confirm zero data loss
           │
           ▼
[6. Post-Mortem & Blameless Review] ──► 5-Whys root-cause analysis, action items assigned
```

---

## 3. Evidence Preservation & Forensic Log Handling

1. **WORM Storage Integrity:** All `AuditEvent` records and S3 audit streams are configured with Write-Once-Read-Many (WORM) Object Lock, preventing attackers or rogue administrators from modifying or deleting incident evidence.
2. **Snapshotting:** In the event of suspected database tampering, immediate automated EBS/Aurora volume snapshots are triggered before remediation scripts execute.
3. **Chain of Custody:** Audit records exported for forensic investigation are cryptographically signed with SHA-256 hashes and logged with timestamp and investigator identity.

---

## 4. Regulatory & Legal Disclosure Protocols

- **CERT-In (Indian Computer Emergency Response Team):** Cyber security incidents meeting statutory thresholds (e.g. unauthorized access to IT systems, identity theft) must be reported to CERT-In within **6 hours** of notice as mandated by Indian cybersecurity regulations.
- **DPDP Act (2023) Notice:** In the event of a verified personal data breach, affected candidate data principals and the Data Protection Board of India must be notified in accordance with notified statutory timelines and prescribed formats.
- **Customer Transparency:** Candidate personal workspace owners affected by unauthorized access receive direct email notifications detailing: what data was affected, containment actions taken, and recommended security precautions.
