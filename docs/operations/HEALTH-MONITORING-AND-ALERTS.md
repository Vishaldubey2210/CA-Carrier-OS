# CA Career OS — Health Probes, Metrics, and Alerting Specification

**Document Reference:** `docs/operations/HEALTH-MONITORING-AND-ALERTS.md`  
**Endpoint Base:** `https://<api-host>/api/v1/health`  
**Target Environments:** Railway Service Probes & External Synthetic Monitors (Better Stack / Pingdom)  

---

## 1. Health Probe Architecture

CA Career OS cleanly distinguishes between **Liveness** (is the process alive?) and **Readiness** (can the process serve production traffic with required dependencies?).

```
                                  +-----------------------------+
                                  | Railway / Uptime Controller |
                                  +--------------+--------------+
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
             GET /api/v1/health                                 GET /api/v1/health/ready
                       |                                                   |
          +------------v------------+                         +------------v------------+
          |      Liveness Probe     |                         |     Readiness Probe     |
          | - Process uptime        |                         | - Prisma SELECT 1 query |
          | - Memory & Event Loop   |                         | - Latency measurement   |
          | - HTTP 200 (Always)     |                         | - HTTP 200 (Healthy)    |
          +-------------------------+                         | - HTTP 503 (DB Offline) |
                                                              +-------------------------+
```

---

## 2. Endpoint Contracts

### A. Liveness Probe
- **Endpoint:** `GET /api/v1/health`
- **Purpose:** Used by container orchestrators to detect deadlocked or frozen event loops.
- **Expected Status:** `200 OK`
- **Response Payload:**
  ```json
  {
    "status": "healthy",
    "uptimeSeconds": 8420,
    "timestamp": "2026-10-22T21:40:00.000Z"
  }
  ```

### B. Readiness Probe
- **Endpoint:** `GET /api/v1/health/ready`
- **Purpose:** Verifies that mandatory external dependencies (PostgreSQL) are operational before routing client traffic.
- **Expected Status:**
  - `200 OK` when PostgreSQL responds to `SELECT 1`.
  - `503 Service Unavailable` if PostgreSQL connection fails in production.
- **Response Payload:**
  ```json
  {
    "status": "healthy",
    "version": "0.1.0",
    "uptimeSeconds": 8420,
    "environment": "production",
    "timestamp": "2026-10-22T21:40:00.000Z",
    "services": {
      "database": {
        "status": "up",
        "latencyMs": 4,
        "message": "Database operational"
      },
      "redis": {
        "status": "up",
        "message": "Redis queue connection ready"
      }
    }
  }
  ```

---

## 3. Recommended Production Alert Thresholds

| Metric | Condition | Severity | Notification Channel | Action |
| :--- | :--- | :--- | :--- | :--- |
| **Readiness Probe Failure** | `HTTP 503` for > 30s | **P0 - Critical** | PagerDuty / Slack #ops-alerts | Trigger Incident Response Runbook Scenario A (DB Outage). |
| **5xx Error Rate** | `5xx > 1%` of total requests for 5 min | **P1 - High** | Slack #ops-alerts | Inspect Railway error logs filtering by `level:error`. |
| **Database Latency** | `latencyMs > 250ms` for 5 min | **P2 - Medium** | Slack #ops-warning | Inspect PostgreSQL active connections and unindexed query load. |
| **OTP Verification Lockouts** | `> 10 lockout events` in 10 min | **P2 - Security** | Slack #security-alerts | Investigate potential credential stuffing against `/api/v1/auth/verify-otp`. |
| **Webhook Signature Mismatch** | `> 5 signature failures` in 5 min | **P1 - Security** | Slack #security-alerts | Verify `RAZORPAY_WEBHOOK_SECRET` configuration or check for forged payloads. |

---

## 4. Railway Service Configuration

In the Railway Service Settings for `ca-career-os-api`:
- **Healthcheck Path:** `/api/v1/health`
- **Healthcheck Timeout:** `10` seconds
- **Restart Policy:** On Failure (Max Retries: 5)
