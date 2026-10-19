# Runbook: Upstream Third-Party Provider Outage and Fallback Management

**Document ID:** `RB-OPS-005`  
**Severity Level:** P1 / High  
**Target MTTR:** < 10 Minutes (Automated or 1-command failover)  
**Applicable Roles:** Platform Engineer, AI Systems Engineer, On-Call Engineer  
**Related Documents:**
- [Integration Register](../docs/architecture/integration-register.md)
- [Reliability & Observability](../docs/architecture/reliability-and-observability.md)
- [System Architecture](../docs/architecture/system-architecture.mmd)

---

## 1. Upstream Dependency Matrix & Failure Modes

| Provider | Core Service | Failure Impact | Automated Circuit Breaker / Fallback |
| :--- | :--- | :--- | :--- |
| **Anthropic (Claude 3.5 Sonnet)** | Resume tailoring, AI mock interview, Career guidance | AI features unavailable / slow | Automated failover to **OpenAI (GPT-4o)** via LLM Provider Abstraction |
| **Resend (Transactional Email)** | Magic links, verification, password reset, alerts | Auth and notifications delayed | Manual/automated switch to **AWS SES** |
| **Razorpay (Payments & Webhooks)** | Subscription upgrades, mentor bookings | Payment checkout errors | Soft entitlement grace period (48h) + queuing webhooks |
| **AWS S3 (Object Storage)** | Resume PDF downloads, document uploads | Document generation stalls | Read retry with exponential backoff; degraded mode banner |

---

## 2. Trigger Conditions & Diagnostics

Activate this procedure when any of the following occur:
1. **AI Latency/Error Surge:** Provider returns HTTP 429 (rate limit), 500, or 503 for > 5% of requests over 3 consecutive minutes, or p95 latency exceeds 12 seconds.
2. **Email Delivery Failure:** Transactional email delivery error rate exceeds 2% over 5 minutes.
3. **Payment Gateway Interruption:** Webhook delivery failures or payment capture timeout rate > 5%.

---

## 3. Step-by-Step Mitigation Procedures

### Procedure 3.1: Switch Primary AI Model Provider
When Anthropic API experiences downtime or major regional latency:

1. Check current circuit breaker status via administrative metrics:
```bash
curl -s -H "Authorization: Bearer ${OPS_ADMIN_KEY}" https://api.cacareeros.com/admin/health/ai-provider
```
2. If circuit breaker has not automatically tripped, manually switch active provider to secondary (OpenAI):
```bash
aws ssm put-parameter \
  --name "/ca-career-os/prod/ai/active-provider" \
  --value "OPENAI" \
  --type "String" \
  --overwrite

# Notify running backend instances to refresh cached SSM configurations
curl -X POST -H "Authorization: Bearer ${OPS_ADMIN_KEY}" https://api.cacareeros.com/admin/config/refresh
```
3. Verify test inference invocation using the fallback provider:
```bash
curl -X POST -H "Authorization: Bearer ${OPS_ADMIN_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Health check inference", "max_tokens": 10}' \
  https://api.cacareeros.com/admin/ai/test-inference
```

### Procedure 3.2: Switch Transactional Email Gateway to AWS SES
If primary provider (Resend) is unreachable:

1. Update configuration parameter in AWS Systems Manager:
```bash
aws ssm put-parameter \
  --name "/ca-career-os/prod/email/active-provider" \
  --value "AWS_SES" \
  --type "String" \
  --overwrite

curl -X POST -H "Authorization: Bearer ${OPS_ADMIN_KEY}" https://api.cacareeros.com/admin/config/refresh
```
2. Trigger test transactional email verification:
```bash
curl -X POST -H "Authorization: Bearer ${OPS_ADMIN_KEY}" \
  -d '{"to": "ops-alerts@cacareeros.com", "template": "system_alert"}' \
  https://api.cacareeros.com/admin/email/test-send
```

### Procedure 3.3: Activate Degraded UI Mode for Payments / AI
If an upstream provider has no immediate fallback (e.g., Razorpay banking network maintenance):

1. Set the system-wide degraded feature flag:
```bash
aws ssm put-parameter \
  --name "/ca-career-os/prod/flags/degraded-payment-mode" \
  --value "true" \
  --type "String" \
  --overwrite
```
2. This activates an informational banner on client frontend:
   > *"Payment services are temporarily undergoing partner bank maintenance. Your active features remain fully unlocked during this period."*
3. Enable 48-hour soft-entitlement extension for recurring subscriptions facing webhook delays.

---

## 4. Post-Incident Restoration & Fallback Reversal

Once upstream status pages and monitoring confirm stable operation for at least 30 minutes:

1. Test primary provider endpoint with canary synthetic requests.
2. Revert active provider parameter back to default:
```bash
aws ssm put-parameter \
  --name "/ca-career-os/prod/ai/active-provider" \
  --value "ANTHROPIC" \
  --type "String" \
  --overwrite
curl -X POST -H "Authorization: Bearer ${OPS_ADMIN_KEY}" https://api.cacareeros.com/admin/config/refresh
```
3. Disable degraded UI banners and verify end-to-end request latencies.
4. Record total duration of outage and model token cost differential in post-mortem documentation.
