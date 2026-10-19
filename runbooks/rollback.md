# Operational Runbook: Emergency Production Rollback

> **Runbook ID:** RB-OPS-002  
> **Target Audience:** On-Call Engineers, DevSecOps Leads  
> **Scope:** Rolling Back ECS Fargate Tasks & Traffic Recovery  

---

## 1. Rollback Triggers

Initiate immediate rollback if any of the following occur within 30 minutes of deployment:
- HTTP 5xx error rate spikes above **1.0%** for more than 3 consecutive minutes.
- Aurora PostgreSQL database CPU exceeds **85%** or active connection pool is exhausted.
- BullMQ worker error rate exceeds **10%** of processed jobs.
- Critical security flaw or unauthorized data access vulnerability discovered.

---

## 2. Fast Rollback Procedure (Container Rollback)

### Step 1: Revert ECS Task Definition to Previous Known Good Revision
```bash
# Example: If current revision is 42, rollback to revision 41
PREV_REVISION=$(aws ecs describe-services --cluster ca-career-os-prod --services api-gateway-service \
  --query "services[0].taskDefinition" --output text | awk -F: '{print $1":"$2":"$3":"$4":"$5":"$6":"$7-1}')

echo "Rolling back to: ${PREV_REVISION}"

aws ecs update-service \
  --cluster ca-career-os-prod \
  --service api-gateway-service \
  --task-definition "${PREV_REVISION}" \
  --force-new-deployment
```

### Step 2: Rollback BullMQ Worker Containers
```bash
aws ecs update-service \
  --cluster ca-career-os-prod \
  --service bullmq-worker-service \
  --task-definition "ca-career-os-workers:PREV_GOOD_TAG" \
  --force-new-deployment
```

---

## 3. Database Schema Rollback Considerations

> **Critical Warning:** If database migrations were executed, **DO NOT run down-migrations blindly** if they drop newly populated columns or cause data loss.

1. Because migrations adhere to the **Expand-Contract Pattern**, previous application container code can safely run against the newly expanded schema.
2. Keep the newly added columns/tables in place.
3. If a lock contention or severe indexing issue was introduced by a migration:
   ```sql
   -- Drop problematic index concurrently without locking table
   DROP INDEX CONCURRENTLY IF EXISTS idx_problematic_migration;
   ```
4. Verify application stability before scheduling maintenance-window schema fixes.
