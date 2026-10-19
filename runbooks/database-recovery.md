# Runbook: Database Disaster Recovery and Point-In-Time Restore (PITR)

**Document ID:** `RB-OPS-003`  
**Severity Level:** P0 / Critical  
**Target RTO (Recovery Time Objective):** < 30 Minutes  
**Target RPO (Recovery Point Objective):** < 5 Minutes (continuous WAL streaming)  
**Applicable Roles:** Lead DevOps Engineer, Database Administrator, Incident Commander  
**Related Documents:**
- [System Architecture](../docs/architecture/system-architecture.mmd)
- [Database Schema](../docs/architecture/database-schema.md)
- [Data Ownership & Retention](../docs/architecture/data-ownership-and-retention.md)
- [Incident Response](../docs/architecture/incident-response.md)

---

## 1. Trigger Conditions & Failure Scenarios

Activate this procedure immediately upon confirming any of the following events:
1. **Primary Database Storage or Hardware Crash:** Unresponsive primary database with automatic failover failure.
2. **Catastrophic Human Error / Data Corruption:** Malicious or accidental drop of tables, mass update without `WHERE` clause, or corrupted migration.
3. **Data Integrity Compromise:** Unrecoverable schema deadlock or cryptographic key mismatch preventing reads/writes.

---

## 2. Recovery Scenarios Overview

| Scenario | Target Strategy | Expected Data Loss | Estimated Recovery Time |
| :--- | :--- | :--- | :--- |
| **Primary Node Hardware Failure** | Managed Multi-AZ Failover / Read-Replica Promotion | 0 seconds (synchronous replica) | 2–5 minutes |
| **Accidental Table Drop / Data Corruption** | Point-In-Time Restore (PITR) to New Target Instance | WAL lag (< 5 minutes prior to event) | 15–25 minutes |
| **Regional Cloud Outage** | Cross-Region Snapshot Restoration | Max snapshot frequency (<= 1 hour) | 45–60 minutes |

---

## 3. Step-by-Step Procedure: Point-In-Time Restore (PITR)

### Step 3.1: Declare P0 & Isolate Application Traffic
To prevent corrupted or incomplete writes while restoring:

```bash
# Set maintenance mode on CloudFront / Ingress Load Balancer
aws elbv2 modify-rule \
  --rule-arn arn:aws:elasticloadbalancing:ap-south-1:123456789012:listener-rule/app-maintenance \
  --actions Type=fixed-response,FixedResponseConfig="{StatusCode=503,ContentType=text/plain,MessageBody='System under scheduled database maintenance. Please check back in 15 minutes.'}"

# Scale background workers to 0 to halt pending queue jobs
aws ecs update-service \
  --cluster ca-career-os-prod-cluster \
  --service ca-career-os-prod-worker \
  --desired-count 0
```

### Step 3.2: Determine Recovery Timestamp
Identify the exact ISO timestamp immediately preceding the catastrophic event from the audit log or application error logs:

```bash
# Example target time: 2026-10-19T10:14:00Z
TARGET_RESTORE_TIME="2026-10-19T10:14:00.000Z"
```

### Step 3.3: Initiate Point-in-Time Restore via AWS RDS CLI
Restore the cluster to a new target cluster identifier:

```bash
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier ca-career-os-prod-db \
  --target-db-cluster-identifier ca-career-os-prod-db-restored \
  --restore-type copy-on-write \
  --restore-to-time ${TARGET_RESTORE_TIME} \
  --db-subnet-group-name ca-career-os-db-subnet \
  --vpc-security-group-ids sg-0123456789abcdef0
```

*Note: In local or Docker environments utilizing continuous WAL archiving (pgBackRest / WAL-G):*
```bash
pgbackrest --stanza=ca_career_os --type=time "--target=${TARGET_RESTORE_TIME}" restore
```

### Step 3.4: Verify Data Integrity and Migration State
Once the restored cluster is available, connect via a secure bastion host or administrative proxy to verify core tables:

```sql
-- Connect via psql read-only session
\c ca_career_os_prod;

-- Verify migration state
SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;

-- Verify record counts and latest timestamp on critical candidate tables
SELECT count(*), max(updated_at) FROM "User";
SELECT count(*), max(updated_at) FROM "CandidateProfile";
SELECT count(*), max(updated_at) FROM "Application";
```

### Step 3.5: Update Connection Secrets in AWS Secrets Manager
Update the application connection string to point to the new endpoint:

```bash
NEW_DB_ENDPOINT=$(aws rds describe-db-clusters \
  --db-cluster-identifier ca-career-os-prod-db-restored \
  --query "DBClusters[0].Endpoint" --output text)

aws secretsmanager update-secret \
  --secret-id ca-career-os/prod/database-url \
  --secret-string "postgresql://app_user:${DB_PASSWORD}@${NEW_DB_ENDPOINT}:5432/ca_career_os_prod?sslmode=verify-full&schema=public"
```

### Step 3.6: Restart Backend Containers and Re-enable Traffic
Trigger a rolling redeployment of backend services to pull the updated database secret:

```bash
aws ecs update-service \
  --cluster ca-career-os-prod-cluster \
  --service ca-career-os-prod-api \
  --force-new-deployment

# Verify API health checks return 200 OK
curl -f https://api.cacareeros.com/health/ready

# Scale workers back to normal desired capacity
aws ecs update-service \
  --cluster ca-career-os-prod-cluster \
  --service ca-career-os-prod-worker \
  --desired-count 4

# Restore normal routing on CloudFront / ALB
aws elbv2 modify-rule \
  --rule-arn arn:aws:elasticloadbalancing:ap-south-1:123456789012:listener-rule/app-maintenance \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:ap-south-1:123456789012:targetgroup/ca-prod-tg/abcdef123456
```

---

## 4. Post-Recovery Verification Checklist

- [ ] `/health/ready` endpoint returns HTTP 200 with DB status `"healthy"`.
- [ ] Read and write queries complete within normal latency bounds (< 25ms p95).
- [ ] Background workers successfully process BullMQ queue jobs without deadlocks.
- [ ] No database schema drifts or pending unapplied migrations reported by Prisma.
- [ ] Incident timeline, restored timestamp, and impacted user delta compiled for Incident Commander.
- [ ] Retain original corrupted cluster for 7 days in isolated subnet for root-cause forensic analysis.
