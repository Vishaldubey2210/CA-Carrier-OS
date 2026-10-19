# CA Career OS — Data Ownership, Retention & Governance Specification

> **Document Type:** Data Governance, Retention & Privacy Architecture  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Data Protection Officers, Security Engineers, Compliance Auditors  

---

## 1. Data Classification Taxonomy

All data processed within CA Career OS is classified into four distinct security tiers:

| Tier | Classification Level | Data Entities Included | Storage Location | Encryption Standard | Access Control |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | **Confidential / Restricted** | Password hashes, session tokens, signed approval tokens, KMS secret keys. | PostgreSQL / Redis / Secrets Manager | AES-256 at rest, TLS 1.3 in transit, Bcrypt 12 rounds | Internal system processes only; zero user API exposure |
| **Tier 2** | **Personal & Career Private** | Resumes, offer letters, CTC details, mock interview transcripts, learning tasks. | PostgreSQL / S3 (Private buckets) | SSE-KMS with tenant keys, TLS 1.3 | Candidate Personal Workspace owner only |
| **Tier 3** | **Organization & Client Private** | Job postings, applicant tracking records, firm client KYC records, compliance calendars. | PostgreSQL / S3 | AES-256 at rest, TLS 1.3 | Organization Workspace members based on RBAC |
| **Tier 4** | **Public / Non-Sensitive** | Active job postings, public 6-pathway overviews, anonymized aggregated salary bands ($N \ge 15$). | PostgreSQL (Public read) / CDN | Standard at-rest encryption | Public Internet (Unauthenticated access) |

---

## 2. Ownership & Multi-Tenant Partitioning Rules

1. **Candidate Data Sovereignty:** The candidate owns 100% of the data within their `PERSONAL` workspace. No employer or hiring firm has access to a candidate's profile, resumes, or interview scores unless the candidate explicitly submits an application to a job posted by that firm.
2. **Organization Workspace Ownership:** Job requisitions, team notes, and applicant pipeline stages are owned by the hiring organization. If a recruiter leaves the firm, their access is revoked while the firm retains the hiring records.
3. **Practice Management Ownership:** Client master records and audit working paper metadata belong to the licensed CA firm operating the `ORGANIZATION` practice workspace.
4. **Platform Telemetry & Audit Integrity:** The platform owns aggregated operational telemetry and immutable `AuditEvent` records required for statutory compliance.

---

## 3. Retention Schedules & Lifecycle Policies

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                    RETENTION SCHEDULE MATRIX                              |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  Active User Data        | Retained indefinitely while account remains active             |
|  Inactive Job Postings   | Retained for 90 days after expiration, then soft-deleted       |
|  Pre-Signed URLs (S3)    | 15-Minute strict Time-To-Live (TTL); non-renewable            |
|  Approval Tokens (Redis) | 15-Minute strict TTL (900 seconds); auto-evicted on expiry    |
|  Idempotency Keys        | 24-Hour TTL in Redis and PostgreSQL; daily purge cron          |
|  Account Deletion Grace  | 30-Day soft-delete tombstone before physical irreversible purge |
|  Statutory Audit Logs    | 7-Year immutable WORM retention (ICAI & DPDP compliance)       |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 4. Deletion Workflows (Soft Delete vs. Hard Purge)

1. **Soft Deletion (Immediate):**
   - User requests deletion $\rightarrow$ backend sets `User.deletedAt = NOW()`.
   - All active JWT sessions revoked immediately in Redis.
   - User profile and resumes excluded from all platform search indexes.
2. **Grace Period (Day 1 to Day 30):**
   - Candidate can log in and click *"Restore Account"* using email verification.
3. **Hard Purge (Day 31+):**
   - Nightly retention worker identifies records with `deletedAt < NOW() - 30 days`.
   - Physically deletes resume binary files from S3 buckets.
   - Anonymizes relational database records (replaces PII fields with `[DELETED]`).
   - Retains immutable cryptographic transaction hashes in `AuditEvent` table to satisfy statutory legal compliance.

---

## 5. Architectural Controls for the DPDP Act (2023)

- **Consent & Notice:** Explicit opt-in checkboxes on registration for data processing.
- **Right to Access & Correction:** Endpoints `GET /api/v1/users/me/export` (downloads full JSON archive of candidate data) and `PUT /api/v1/career/profile`.
- **Right to Erasure:** Handled via `POST /api/v1/users/me/delete-request` adhering to the 30-day lifecycle.
- **Data Protection Officer (DPO) Contact:** Standardized in privacy policy and API error contacts.
