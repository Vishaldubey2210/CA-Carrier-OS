# Operational Runbook: Production Deployment Procedure

> **Runbook ID:** RB-OPS-001  
> **Target Audience:** On-Call Engineers, DevSecOps Leads, Release Managers  
> **Scope:** Production API & Worker Deployment on AWS ECS Fargate  

---

## 1. Pre-Deployment Verification Checklist

Before initiating production deployment:
- [ ] Automated CI pipeline on `main` branch is 100% green (Unit, Integration, Contract tests).
- [ ] All database migrations are backward-compatible (adhere to Expand-Contract pattern).
- [ ] No local filesystem URLs, test scratch paths, or hardcoded secrets exist in the git release tag.
- [ ] Current database automated snapshot is confirmed within the last 4 hours.
- [ ] On-call engineer and deployment commander are present in the `#release-war-room` Slack channel.

---

## 2. Step-by-Step Deployment Execution

### Step 1: Execute Database Migrations (Pre-Deployment Container)
```bash
# Run migration task against Aurora PostgreSQL primary
aws ecs run-task \
  --cluster ca-career-os-prod \
  --task-definition ca-career-os-migration:latest \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-private-1a,subnet-private-1b],securityGroups=[sg-migration]}"
```
*Wait for exit code 0. If migration fails, DO NOT proceed to container deployment.*

### Step 2: Trigger Rolling Deployment of Backend API
```bash
# Update backend service with new container image
aws ecs update-service \
  --cluster ca-career-os-prod \
  --service api-gateway-service \
  --force-new-deployment \
  --desired-count 4
```
*ECS Fargate deploys 2 new containers, verifies ALB target health checks (`/health/live`), and terminates old containers gracefully.*

### Step 3: Update Background Worker Containers
```bash
# Update background task worker service
aws ecs update-service \
  --cluster ca-career-os-prod \
  --service bullmq-worker-service \
  --force-new-deployment
```

---

## 3. Post-Deployment Verification

1. **Synthetic Health Check:**
   ```bash
   curl -s -f https://api.cacareeros.com/health/ready | jq .
   # Expected output: {"status":"ok","database":"connected","redis":"connected"}
   ```
2. **Error Rate Monitoring:** Inspect CloudWatch / Datadog dashboard for 15 minutes. HTTP 5xx error rate must remain $< 0.1\%$.
3. **Queue Health:** Verify that BullMQ waiting queue depth is decreasing and DLQ message count remains `0`.
