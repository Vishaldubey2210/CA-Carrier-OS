# CA Career OS — Background Processing & Queue Architecture

> **Document Type:** Asynchronous Processing & Queue Engineering Specification  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Staff Backend Engineers, Platform Engineers, DevSecOps  

---

## 1. Asynchronous Architecture & Queue Topology

CA Career OS utilizes **BullMQ** backed by **Redis 7+** as its distributed task processing engine. Asynchronous tasks handle decoupled operations such as job feed ingestion, semantic embedding generation, PDF rendering, email notifications, and scheduled follow-ups.

### Queue Directory & Responsibilities

| Queue Name | Priority | Concurrency | Timeout | Producer | Consumer / Worker | Payload Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `job-ingestion-queue` | Normal | 2 | 120s | Cron / Webhook | `JobIngestionWorker` | Raw partner job feeds to normalize and deduplicate |
| `vector-embedding-queue` | High | 5 | 30s | Domain Event (`job.created`) | `EmbeddingWorker` | Generates 1536-dim vector for pgvector HNSW index |
| `job-freshness-queue` | Low | 1 | 300s | Cron (Daily 02:00) | `FreshnessWorker` | Re-checks job sources; expires jobs older than 30 days |
| `resume-export-queue` | High | 3 | 45s | API (`POST /resumes/:id/attest`) | `ResumeExportWorker` | Compiles structured JSON into binary PDF via Puppeteer |
| `reminder-queue` | Normal | 4 | 15s | Cron (Hourly) | `ReminderWorker` | Dispatches scheduled follow-up alerts to candidates |
| `ai-evaluation-queue` | Normal | 3 | 60s | Domain Event (`interview.completed`) | `EvaluationWorker` | Generates deep Ind AS technical feedback scorecards |
| `audit-event-queue` | Critical | 10 | 5s | API Interceptor | `AuditWriterWorker` | Writes immutable audit events to PostgreSQL & SIEM |

---

## 2. Job Payload Schemas & Zero-PII Rule

> **Security Mandate:** Queue payloads in Redis **must never contain plaintext PII** (phone numbers, full postal addresses), passwords, financial CTC figures, or raw candidate resumes. Payloads contain strictly UUID foreign keys, task identifiers, and SHA-256 hashes.

### Example: `vector-embedding-queue` Payload
```json
{
  "jobId": "e4b3c2a1-0000-4000-8000-123456789abc",
  "textToEmbed": "Assistant Manager Statutory Audit Deloitte Mumbai Ind AS 115",
  "correlationId": "8f1a3e8b-2c4d-4e6f-9a0b-1c2d3e4f5a6b",
  "timestamp": "2026-10-19T13:00:00.000Z"
}
```

### Example: `resume-export-queue` Payload
```json
{
  "resumeVersionId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "workspaceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "correlationId": "8f1a3e8b-2c4d-4e6f-9a0b-1c2d3e4f5a6b"
}
```

---

## 3. Retry Strategy, Backoff & Dead-Letter Queue (DLQ)

```
[Job Execution Attempt]
           │
           ├────► [Success] ──► [Acknowledge & Evict from Redis]
           │
           └────► [Transient Error (Timeout, Network Drop)]
                        │
                        ▼
                  [Attempt Count < 5?]
                        │
                        ├────► [YES] ──► [Wait with Exponential Backoff + Jitter]
                        │                    Initial: 5s, Factor: 2x, Jitter: ±20%
                        │                    (Attempts: 5s, 10s, 20s, 40s)
                        │
                        └────► [NO: Max Retries Exceeded]
                                     │
                                     ▼
                               [Move to BullMQ Dead-Letter Queue (DLQ)]
                                     │
                                     ▼
                               [Emit High-Severity Alert to PagerDuty]
```

---

## 4. Transactional Outbox Pattern for Critical State Changes

When an API mutation creates a durable business record in PostgreSQL (e.g. `Application.status = APPLIED`) that must trigger an external notification or BullMQ job, relying on direct Redis enqueueing inside the HTTP request risks state divergence if Redis is temporarily unreachable.

### Outbox Pattern Implementation
1. **Single Database Transaction:** The service writes the business entity and an `OutboxMessage` record inside the same PostgreSQL ACID transaction:
   ```prisma
   model OutboxMessage {
     id        String   @id @default(uuid()) @db.Uuid
     topic     String   // e.g. "application.submitted"
     payload   Json
     status    String   @default("PENDING") // PENDING, PUBLISHED, FAILED
     createdAt DateTime @default(now()) @db.Timestamptz
   }
   ```
2. **Outbox Publisher Worker:** A lightweight polling worker running every 500ms reads `PENDING` outbox messages, enqueues them to BullMQ, and marks them `PUBLISHED`.
3. **Recovery Guarantee:** If the worker or Redis crashes mid-flight, uncommitted outbox messages remain safely preserved in PostgreSQL, guaranteeing **at-least-once message dispatch**.
