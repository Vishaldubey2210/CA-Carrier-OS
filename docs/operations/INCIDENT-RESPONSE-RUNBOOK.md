# CA Career OS — Incident Response & Troubleshooting Runbook

**Document Reference:** `docs/operations/INCIDENT-RESPONSE-RUNBOOK.md`  
**Target Roles:** SRE, DevOps, Principal Backend Engineer, Security On-Call  
**Severity Levels:** P0 (Total Outage), P1 (Critical Degradation), P2 (Partial Failure)  

---

## 1. Quick Triage: Investigating an Incident by Correlation ID

When a user reports an issue or an error displays on the UI:
1. Locate the **Incident Reference / Correlation ID** (e.g. `c7e492a1-0988-4e12-8854-1b7e4112e399`).
2. Open Railway API logs:
   - Filter query: `correlationId:"<UUID>"`
   - Locate the initial `HTTP_REQUEST_STARTED` and corresponding `error` log entry.
3. Check the HTTP response status, error name, stack trace (in server logs only), and duration.

---

## 2. Specific Incident Scenarios & Standard Operating Procedures

### Scenario A: Database Connection Failure / Pool Exhaustion (`503 SERVICE_UNAVAILABLE`)
- **Symptoms:** API readiness probe `/api/v1/health/ready` returns 503; users receive `SERVICE_UNAVAILABLE` errors; logs show `P2024` or connection timeout.
- **Root Cause Candidates:**
  - Railway PostgreSQL instance restarted or paused.
  - Connection pool exhausted by unindexed long-running queries.
  - Max client connections reached.
- **Remediation Steps:**
  1. Inspect Railway PostgreSQL metrics (Active connections, Memory, CPU).
  2. If pool exhausted, verify that `DATABASE_URL` specifies proper connection limits:
     ```
     DATABASE_URL="postgresql://user:pass@host:5432/ca_career_os?connection_limit=20&pool_timeout=10"
     ```
  3. Restart the API container to release zombie connection pools if necessary.
  4. Run `pnpm test:db` to verify PostgreSQL persistence health.

### Scenario B: SMTP Delivery Failures (`503 / 500 on Login OTP`)
- **Symptoms:** Users report not receiving login OTP or verification emails; logs show `SMTP connection timeout` or `Invalid login credentials`.
- **Root Cause Candidates:**
  - Provider credentials rotated or expired.
  - Port 587 vs 465 TLS misconfiguration.
  - Sender IP rate-limited by upstream mail provider (e.g. Brevo/SendGrid/SES).
- **Remediation Steps:**
  1. Check Railway environment variables:
     - Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`.
  2. For Port 465, set `SMTP_SECURE=true`. For Port 587, set `SMTP_SECURE=false`.
  3. Inspect logs for masked SMTP error codes (`550`, `421`, `EAUTH`).
  4. If SMTP credentials are down in emergency, verify whether mock mode is active in non-production. Never deploy fake mail delivery to live production.

### Scenario C: Razorpay Webhook Signature Mismatch (`401 UNAUTHORIZED`)
- **Symptoms:** Subscriptions do not activate after checkout; logs show `Invalid Razorpay webhook signature`.
- **Root Cause Candidates:**
  - `RAZORPAY_WEBHOOK_SECRET` does not match the secret in the Razorpay Dashboard.
  - Proxy or body-parser modified the raw webhook body before HMAC calculation.
- **Remediation Steps:**
  1. Verify the configured `RAZORPAY_WEBHOOK_SECRET` matches the webhook endpoint in Razorpay Dashboard.
  2. Inspect the raw request payload; ensure signature verification uses exact unparsed raw bytes.
  3. After fixing secret, use Razorpay Dashboard > Webhooks > "Resend Failed Webhook" to replay events idempotently. (Idempotency prevents duplicate charges).

### Scenario D: Background Job Alert Failures
- **Symptoms:** Job alert emails fail to deliver after 3 attempts; logs show `Permanent job alert delivery failure after 3 attempts`.
- **Remediation Steps:**
  1. Inspect `job-alerts.service.ts` execution logs for the candidate ID.
  2. Verify email address validity (check for mailbox unavailable / hard bounce).
  3. Verify deduplication registry: previously sent jobs are never re-sent.

---

## 3. Rollback & Disaster Recovery Procedures

1. **Frontend (Vercel):**
   - In Vercel Project Dashboard > Deployments > Select previous green deployment > "Rollback". Instant rollback within 5 seconds.
2. **Backend API (Railway):**
   - In Railway Service Dashboard > Deployments > Select previous green deployment > "Redeploy".
3. **Database Migrations:**
   - All Prisma migrations in `apps/api/prisma/migrations/` are forward-additive. Never run destructive reset in production.
