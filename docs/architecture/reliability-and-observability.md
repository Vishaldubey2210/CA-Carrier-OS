# CA Career OS — Reliability, Observability & SLI/SLO Framework

> **Document Type:** Production Reliability, Telemetry & Operations Specification  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** DevSecOps Engineers, Site Reliability Engineers (SRE), Backend Leads  

---

## 1. Service Level Indicators (SLIs) & Objectives (SLOs)

> **Measurement Integrity Notice:** The SLI targets and SLO commitments below represent **proposed operational engineering targets**. They will be tracked and validated once telemetry instrumentation is deployed in production.

| Core Workflow | Service Level Indicator (SLI) Formula | Proposed SLO Target | Error Budget (30-Day Rolling) | Measurement Window |
| :--- | :--- | :--- | :--- | :--- |
| **Hybrid Job Search** | $\frac{\text{Successful search requests with latency} < 400\text{ms}}{\text{Total valid search requests}} \times 100$ | **$\ge 99.5\%$** | $0.5\%$ ($\approx 3.6$ hours downtime) | 1-Minute aggregation |
| **Resume Tailoring (AI)** | $\frac{\text{Successful resume drafts generated with latency} < 5\text{s}}{\text{Total resume tailoring requests}} \times 100$ | **$\ge 98.0\%$** | $2.0\%$ ($\approx 14.4$ hours degraded) | 5-Minute aggregation |
| **External Approval Execution** | $\frac{\text{Confirmed approvals executed with latency} < 2\text{s}}{\text{Total confirmed approval requests}} \times 100$ | **$\ge 99.9\%$** | $0.1\%$ ($\approx 43$ minutes downtime) | Real-time event stream |
| **API Availability (Core)** | $\frac{\text{Total requests resulting in non-5xx status codes}}{\text{Total valid HTTP requests}} \times 100$ | **$\ge 99.9\%$** | $0.1\%$ | Monthly rolling window |

---

## 2. Failure-Handling Matrix

| Failure Mode | Detection Mechanism | User-Visible Impact | Safe System Behavior | Retry / Recovery Procedure | Alert Destination | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL Primary Crash** | Aurora cluster health check fails; connection pool drops. | Mutations return HTTP 503; search falls back to read-only replica. | Read operations remain accessible via replica; writes return friendly retry banner. | Aurora Multi-AZ automated failover promotes read replica within 30s. | PagerDuty (P0 Critical) | Database Admin / On-Call |
| **Redis Cache Outage** | Redis client disconnect event; connection timeout $>2$s. | Sessions fall back to DB lookup; BullMQ workers pause execution. | System degrades gracefully; rate limits default to permissive safe mode. | Automated ElastiCache node restart; uncommitted tasks preserved in Postgres outbox. | PagerDuty (P1 High) | SRE Lead |
| **LLM Provider Timeout (Gemini/Claude)** | HTTP 504 Gateway Timeout or client timeout $>10$s. | Mock interview or resume tailoring spinner pauses. | System displays retry button; does not consume user turn quota. | Universal Provider Adapter automatically reroutes inference to secondary provider (GPT-4o). | Slack Ops Channel | Backend Lead |
| **External ATS Webhook Drop** | Webhook listener returns HTTP 5xx or times out. | Partner job postings not immediately visible. | Webhook queue preserves payload; rejects duplicate retransmissions via idempotency key. | Partner ATS automated webhook retry; nightly reconciliation worker flags gaps. | Slack Telemetry | Integration Lead |
| **BullMQ Worker Crash** | Worker process heartbeat stops in Redis monitor. | Background resume exports or reminder alerts delayed. | Active job locks expire; BullMQ reassigns unacknowledged jobs to healthy worker. | Auto-restart container via ECS Fargate task definition; DLQ alert if retries fail. | PagerDuty (P2 Medium) | Backend SRE |

---

## 3. Observability Architecture (Metrics, Logs & Traces)

1. **Structured JSON Logs:**
   - Transported via FluentBit to Amazon CloudWatch and OpenSearch.
   - Enforces `correlationId` propagation across HTTP headers, NestJS context, BullMQ jobs, and database queries.
2. **Prometheus Metrics:**
   - `http_request_duration_seconds_bucket` (P50, P90, P95, P99).
   - `bullmq_job_duration_seconds` and `bullmq_queue_depth`.
   - `ai_agent_tool_executions_total{tool, outcome}`.
3. **Distributed Tracing:**
   - OpenTelemetry (OTel) instrumentation on incoming HTTP requests, Prisma database queries, and external outbound HTTP calls.
