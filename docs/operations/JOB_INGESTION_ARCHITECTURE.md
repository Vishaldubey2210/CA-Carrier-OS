# CA Career OS — Job Ingestion Architecture & Deduplication Pipeline

## 1. Pipeline Overview

The CA Career OS ingestion system is a modular, provider-independent pipeline designed for high-integrity job discovery across Indian chartered accountancy vacancies.

```
Authorized Sources (ATS APIs / Feeds)
              │
              ▼
   Source-Specific Connectors (Greenhouse, Lever, Ashby, etc.)
              │
              ▼
       Data Validation (Zod Schemas & Security Sanitization)
              │
              ▼
   Job Normalization (CA Taxonomy, Role Classification, Standardized Fields)
              │
              ▼
 Multistage Deduplication Pipeline (Stage 1 Exact → Stage 2 Normalized → Stage 3 Similarity)
              │
              ▼
   Freshness Verification & State Machine (Active / Stale / Expired / Unavailable)
              │
              ▼
   PostgreSQL Storage & Audit Ledger (Prisma ORM with Idempotent Upserts)
              │
              ▼
    Unified Discovery API (/api/v1/jobs?channel=...&opportunityType=...)
              │
              ▼
 Next.js Frontend Discovery Ribbon (Enterprise Mandates vs External Opportunities)
```

---

## 2. Multistage Deduplication Pipeline

When a vacancy is ingested from any external connector or direct employer channel, it passes through an auditable 3-stage deduplication pipeline implemented in `JobDeduplicationService` (`apps/api/src/modules/jobs/job-deduplication.service.ts`):

### Stage 1: Exact Identity Match
- **Provider & External ID Match**: If `sourceProvider` and `externalJobId` match an existing listing, it is identified as an exact update.
- **Canonical URL Match**: Normalized URL matching strips protocols (`http://` vs `https://`), `www.`, tracking query parameters (`utm_*`, `ref`), and trailing slashes.
- **SHA-256 Fingerprint**: Exact match against the deterministic hash:
  `SHA-256(companyName:normalizedTitle:locationCity)`

### Stage 2: Normalized Identity Match
- **Company Name Normalization**: Corporate and firm suffixes are stripped to unify aliases:
  - Tokens stripped: `Private`, `Limited`, `Pvt`, `Ltd`, `LLP`, `& Co`, `Chartered Accountants`, `Associates`, `Technologies`, `Software`, `India`, `Bharat`.
  - Example: `Grant Thornton Bharat LLP` matches `Grant Thornton`.
  - Example: `Deloitte India (Offshore Advisory)` matches `Deloitte`.
- **Title Normalization**: Standardizes role variations into canonical CA pathways:
  - `Statutory Audit Senior` ➔ `Statutory Audit Senior / Manager`
  - `Direct Tax Specialist` ➔ `Direct Tax & Litigation Specialist`
  - `Articleship Assistant` ➔ `CA Article Trainee — Statutory & Tax Audit`
- **Location Equivalence**: Geographic matches account for standard metro regions (e.g. `Delhi NCR` encompassing Delhi, Gurgaon, Noida).

### Stage 3: Similarity-Based Token N-Gram & Description Comparison
- **Calibrated Model**: Built from the deduplication algorithm validated in Notebook 02 (`F1 = 0.909` at `0.50` similarity threshold).
- **Token N-Gram Overlap**: Evaluates word and bigram Jaccard similarity across technical requirements, audit standards (Ind AS 115, SA 700, CARO 2020), and job descriptions.
- **Conservative Suppression**: Distinct vacancies at the same firm (e.g. `Direct Tax Senior` vs `Indirect Tax & GST Associate` at KPMG) are **never** falsely merged, preserving genuine diversity in job discovery.
- **Duplicate Cluster Preservation**: When a duplicate is detected across providers, source provenance and canonical URLs from both sources are retained.

---

## 3. Freshness Verification & State Machine

Being listed on an external board does not guarantee a vacancy is still active. CA Career OS enforces a 6-state freshness lifecycle implemented in `JobFreshnessService`:

```
               ┌───────────────┐
               │ SOURCE_ACTIVE │ (Verified active on source ATS)
               └───────┬───────┘
                       │
       ┌───────────────┼───────────────┐
       │ >30 days old  │ Link 404/410  │ Network failure
       ▼               ▼               ▼
   ┌───────┐      ┌─────────┐    ┌─────────────┐
   │ STALE │      │ EXPIRED │    │ UNAVAILABLE │ (Transient defense)
   └───────┘      └─────────┘    └─────────────┘
       │                               │
       └───────────────┬───────────────┘
                       │ Candidate moderation flag
                       ▼
              ┌─────────────────┐
              │ REVIEW_REQUIRED │
              └─────────────────┘
```

1. **`SOURCE_ACTIVE`**: Authoritatively verified via live ATS API response (e.g., Greenhouse/Lever/Ashby status confirms open requisition).
2. **`ACTIVE_UNCONFIRMED`**: External source does not provide a queryable single-job status API; listing is within its initial 30-day freshness window.
3. **`STALE`**: Listing is older than 30 days without reconfirmation. Displayed with a warning badge to candidates.
4. **`EXPIRED`**: Authoritative source confirms job is closed, application link returns permanent HTTP 404/410, or requisition filled. Suppressed from default search.
5. **`UNAVAILABLE`**: Temporary external network timeout, gateway timeout (504), or provider maintenance. **Guaranteed protection**: A transient network glitch never falsely marks active vacancies expired.
6. **`REVIEW_REQUIRED`**: Triggered by automated fraud-risk scoring or candidate moderation report.

---

## 4. Vercel & Serverless Execution Architecture

The CA Career OS API is designed to deploy seamlessly in serverless environments (e.g., Vercel Functions, AWS Lambda, Google Cloud Run) without relying on persistent local filesystem state:

1. **No Perpetual Background Threads**: Serverless handlers terminate upon request completion. The orchestrator does not spawn perpetual background workers inside request loops.
2. **PostgreSQL as Source of Truth**: All source states, sync checkpoints, job records, and duplicate clusters are persisted in PostgreSQL via Prisma.
3. **Distributed Ingestion Lock**: `JobIngestionOrchestratorService` implements a distributed execution lock with a 5-minute timeout:
   - Prevents overlapping sync jobs from competing or exceeding provider rate limits.
   - Idempotently rejects concurrent runs with `'A synchronization run is already in progress'`.
4. **Bounded Batches & Sub-Request Execution Limits**: Each connector synchronizes in bounded batches (default limit: 50 records per source), keeping total orchestrator runtime under 10 seconds—comfortably within Vercel's standard 15-60 second execution ceiling.
5. **Scheduled Cron Ingestion**: In production, synchronization is triggered by a secure server-to-server Vercel Cron invocation (`CRON_SECRET` header) hitting `POST /api/v1/jobs/sources/sync`.

---

## 5. Candidate Moderation & Quality Controls

To prevent misleading postings, scam deposits, or dead links:
1. **Candidate Report Option**: Every job card provides a `Report Job 🚩` action triggering `POST /api/v1/jobs/:id/report`.
2. **Report Categories**:
   - `SCAM_SUSPICION`: Recruiter asked for payment, registration fee, or security deposit.
   - `EXPIRED_OR_CLOSED`: Application link broken or employer confirms role is filled.
   - `INACCURATE_SALARY_OR_ROLE`: Misleading CTC or fabricated requirements.
   - `IMPERSONATION`: Employer impersonation or fake company profile.
3. **Human Review Escalation**: When a vacancy receives moderation flags or exceeds risk thresholds, its status transitions to `REVIEW_REQUIRED` for administrator audit.
