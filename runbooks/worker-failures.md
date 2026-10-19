# Runbook: Background Worker Failure, Stalled Jobs, and Dead-Letter Queue (DLQ) Triage

**Document ID:** `RB-OPS-004`  
**Severity Level:** P1 / High (P2 if non-critical queue like marketing notifications)  
**Target MTTR (Mean Time to Resolution):** < 15 Minutes  
**Applicable Roles:** Backend Engineer on Call, Platform Engineer, Incident Lead  
**Related Documents:**
- [Asynchronous Processing Specification](../docs/architecture/async-processing.md)
- [Reliability & Observability](../docs/architecture/reliability-and-observability.md)
- [Background Processing Diagram](../docs/architecture/background-processing.mmd)

---

## 1. Trigger Conditions & Symptoms

Activate this procedure when any of the following alerts trigger:
1. **High Job Latency Alert:** Job waiting time exceeds 120 seconds on `resume-export` or `ai-eval` queues.
2. **Worker Dead-Man Switch Alert:** Desired worker count > 0, but active worker heartbeat absent in Redis for > 60 seconds.
3. **Dead-Letter Queue (DLQ) Surge Alert:** More than 10 jobs routed to dead-letter state within 5 minutes.
4. **Redis Memory Pressure Alert:** Redis ElastiCache memory usage exceeds 80% with queue backlog accumulation.

---

## 2. Queue Classification and Criticality Matrix

| Queue Name | Criticality | Max Waiting Time SLA | Idempotent Replay Safe? |
| :--- | :--- | :--- | :--- |
| `resume-export` | High (User-facing) | 60 seconds | Yes (deterministic S3 write) |
| `ai-eval` | High (User-facing) | 45 seconds | Yes (keyed by `assessment_session_id`) |
| `job-ingestion` | Medium (Batch) | 30 minutes | Yes (deduplicated by `external_hash`) |
| `notifications` | Medium (Transactional) | 120 seconds | Yes (deduplicated by `event_id`) |
| `audit-log` | Critical (Compliance) | 10 seconds | Yes (append-only PostgreSQL insert) |

---

## 3. Step-by-Step Diagnostic and Triage Procedure

### Step 3.1: Inspect Queue Status via Redis CLI
Connect to the Redis cluster via bastion host or use BullMQ CLI to inspect queue depths:

```bash
# Check queue lengths for active, waiting, failed, and delayed jobs
redis-cli -h ${REDIS_HOST} -p 6379 -a ${REDIS_AUTH_TOKEN} --tls <<EOF
INFO memory
LLEN "bull:resume-export:wait"
LLEN "bull:resume-export:active"
ZCARD "bull:resume-export:failed"
LLEN "bull:ai-eval:wait"
ZCARD "bull:ai-eval:failed"
EOF
```

### Step 3.2: Inspect Worker Container Logs
Identify whether workers are encountering OOM (Out Of Memory) kills, unhandled promise rejections, or external API timeouts:

```bash
# Query CloudWatch logs for fatal worker exceptions
aws logs filter-log-events \
  --log-group-name /ecs/ca-career-os-prod-worker \
  --start-time $(date -d '30 mins ago' +%s000) \
  --filter-pattern "ERROR" \
  --query 'events[*].[timestamp, message]' --output text | head -n 25
```

### Step 3.3: Quarantine Poisoned Payloads
If a specific malformed payload is crashing workers on boot (e.g., malformed PDF parsing buffer overflow):

1. Identify the failing job ID from the Redis failed set:
```bash
redis-cli -h ${REDIS_HOST} ZRANGE "bull:resume-export:failed" 0 0
```
2. Retrieve the offending job payload and error stack:
```bash
redis-cli -h ${REDIS_HOST} HGETALL "bull:resume-export:<JOB_ID>"
```
3. Move the job to the quarantine dead-letter set to unblock the worker queue:
```bash
redis-cli -h ${REDIS_HOST} SADD "bull:resume-export:quarantine" "<JOB_ID>"
redis-cli -h ${REDIS_HOST} ZREM "bull:resume-export:failed" "<JOB_ID>"
```

### Step 3.4: Worker Container Autoscaling / Restart
If workers crashed due to transient memory leaks or connection pool exhaustion:

```bash
# Force a clean rolling restart of worker tasks
aws ecs update-service \
  --cluster ca-career-os-prod-cluster \
  --service ca-career-os-prod-worker \
  --force-new-deployment

# If backlog requires rapid catchup, scale desired tasks temporarily from 4 to 10
aws ecs update-service \
  --cluster ca-career-os-prod-cluster \
  --service ca-career-os-prod-worker \
  --desired-count 10
```

### Step 3.5: DLQ Replay After Hotfix or Service Recovery
Once the underlying defect (e.g., downstream S3 permission or LLM timeout) is resolved:

```bash
# Replay failed jobs using BullMQ administrative script
node scripts/replay-failed-jobs.mjs --queue=resume-export --limit=50
```

---

## 4. Post-Recovery Verification Checklist

- [ ] Queue backlogs across all queues decline to near zero (< 5 jobs waiting).
- [ ] Active worker tasks are reporting healthy heartbeats in Redis.
- [ ] Failed job count remains stable without new additions.
- [ ] Temporary scaled worker count is reverted to baseline (4 tasks) after backlog drains.
- [ ] Quarantined payloads are recorded in an issue ticket for regression test case reproduction.
