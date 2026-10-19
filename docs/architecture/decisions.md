# Architecture Decision Records (ADRs) — CA Career OS

This document records the foundational architectural decisions made for **CA Career OS**, documenting context, options considered, trade-offs, and rationale.

---

## Index of Decisions

- [ADR-001: Modular Monolith Architecture over Microservices](#adr-001-modular-monolith-architecture-over-microservices)
- [ADR-002: Technology Stack Baseline (Next.js, NestJS, Prisma, PostgreSQL)](#adr-002-technology-stack-baseline-nextjs-nestjs-prisma-postgresql)
- [ADR-003: Multi-Tenant Workspace and Data Isolation Model](#adr-003-multi-tenant-workspace-and-data-isolation-model)
- [ADR-004: Tiered Tool Permissions and Human-in-the-Loop Approval Gateway](#adr-004-tiered-tool-permissions-and-human-in-the-loop-approval-gateway)
- [ADR-005: Interchangeable AI Provider Abstraction and Zero Data Retention](#adr-005-interchangeable-ai-provider-abstraction-and-zero-data-retention)
- [ADR-006: Hybrid Search (PostgreSQL Full-Text Search + pgvector Embeddings)](#adr-006-hybrid-search-postgresql-full-text-search--pgvector-embeddings)
- [ADR-007: Idempotency Keys and Distributed Lock Strategy](#adr-007-idempotency-keys-and-distributed-lock-strategy)
- [ADR-008: Privacy-Preserving Audit Logging and Zero-PII Telemetry](#adr-008-privacy-preserving-audit-logging-and-zero-pii-telemetry)
- [ADR-009: Strict Candidate Verification and Prohibition of AI Fabrication](#adr-009-strict-candidate-verification-and-prohibition-of-ai-fabrication)

---

## ADR-001: Modular Monolith Architecture over Microservices

### Status
**Accepted**

### Context
CA Career OS requires coordination across diverse modules: Career Intelligence, Job Aggregation, AI Resume Builder, Mock Interviews, Practice CRM, and AI Agent Orchestration. Early-stage systems frequently suffer from distributed systems overhead (network latency, distributed transaction rollbacks, deployment complexity, multiple CI/CD pipelines, and high infrastructure costs) when structured as microservices.

### Decision
Adopt a **Modular Monolith** pattern inside a single unified repository and deployable backend application:
- Clear domain boundaries enforced through directory structure and NestJS module encapsulation (`CareerModule`, `JobsModule`, `ResumeModule`, `InterviewModule`, `PracticeModule`, `AgentModule`).
- Inter-module communication via synchronous strongly-typed domain services and internal event emitter (`EventEmitter2`).
- Asynchronous tasks dispatched through BullMQ queues backed by Redis.
- Shared persistence layer with module-level schema boundaries and foreign key constraints.

### Consequences
- **Positive:** Rapid feature velocity, shared type safety across services, zero cross-service RPC overhead, single database transaction boundary when needed, cost-effective infrastructure.
- **Negative:** Requires rigorous architectural discipline to prevent circular dependencies; scaling individual modules independently requires future extraction.
- **Extraction Path:** Each module maintains strict interface contracts. If the Job Aggregation worker or Mock Interview audio engine requires distinct compute scaling, it can be extracted to a standalone service with minimal refactoring.

---

## ADR-002: Technology Stack Baseline (Next.js, NestJS, Prisma, PostgreSQL)

### Status
**Accepted**

### Context
The platform requires high developer ergonomics, robust type safety from database to UI, strong security libraries, and operational simplicity.

### Decision
1. **Frontend:** Next.js (App Router), React 19, TypeScript, Vanilla CSS + Tailwind CSS for design tokens and accessible component styling.
2. **Backend:** Node.js with NestJS (TypeScript), providing dependency injection, built-in validation pipes (Zod / Class-Validator), guards, and interceptors.
3. **Database & ORM:** PostgreSQL 16+ managed via Prisma ORM for type-safe database queries and automated migrations.
4. **Queue & Caching:** Redis 7+ paired with BullMQ for job processing, token bucket rate limiting, and idempotency tracking.
5. **Object Storage:** S3-compatible object storage (AWS S3 or Cloudflare R2) with server-side encryption and short-lived pre-signed URLs.

### Consequences
- **Positive:** End-to-end TypeScript type safety, standard enterprise design patterns in NestJS, battle-tested Prisma ORM, lightweight operational overhead.
- **Negative:** Prisma requires custom extensions for complex pgvector operations; Next.js SSR requires clear boundary definition between client and server components.

---

## ADR-003: Multi-Tenant Workspace and Data Isolation Model

### Status
**Accepted**

### Context
A newly qualified CA holds private career plans, interview feedback, and job applications. Simultaneously, CA firms or corporate employers participate as organizational entities hiring talent, and mentors provide coaching. A candidate must never risk having their employer (if the firm is on the platform) see their personal job applications or career transition exploration.

### Decision
Implement a **dual-workspace multi-tenant architecture**:
1. **Personal Workspace:** Automatically provisioned for every candidate upon registration. Strictly 1:1 with user identity. Owns resumes, applications, interview logs, and career preferences.
2. **Organization Workspace:** Provisioned for CA firms, recruitment agencies, or corporate employers. Supports role-based team memberships (`OWNER`, `ADMIN`, `RECRUITER`, `VIEWER`). Owns job postings, candidate pipelines, and applicant tracking records.
3. **Tenant Context Enforcement:** Every backend request passes through a `WorkspaceGuard` extracting the active `workspaceId` header. Database queries enforce tenancy checks at the service layer, supplemented by PostgreSQL Row-Level Security (RLS) policies for critical candidate tables.
4. **Zero Cross-Contamination:** Platform administrators can only view operational metadata and aggregated analytics by default; accessing candidate private data requires explicit, time-bounded, audited escalation.

### Consequences
- **Positive:** Guaranteed privacy for candidates exploring new jobs while working at participating firms; clean enterprise model for hiring teams.
- **Negative:** API requests must explicitly transmit and validate active workspace headers; candidates who are also firm recruiters must switch workspace contexts.

---

## ADR-004: Tiered Tool Permissions and Human-in-the-Loop Approval Gateway

### Status
**Accepted**

### Context
The AI Career Agent assists candidates across multiple modules. An unconstrained LLM tool execution engine introduces severe risks: accidental job applications, unwanted recruiter messaging, unintended service purchases, or unintended data deletion.

### Decision
Partition all agent tools into four strict permission tiers with deterministic routing:
1. **`READ_ONLY`:** Safe queries with no state mutations (`get_user_profile`, `search_jobs`, `get_skill_gap_report`). Automatically approved if workspace authorization passes.
2. **`WRITE`:** Controlled internal mutations (`create_career_task`, `save_job`, `create_resume_draft`). Requires idempotency validation and database transaction boundaries.
3. **`EXPLICITLY_APPROVED_EXTERNAL_ACTION`:** Real-world side effects (`submit_job_application`, `send_recruiter_message`, `book_paid_mentorship`). **Never executed autonomously.** The agent generates an `ApprovalRequest` record containing full action parameters, payload diffs, and consequences. The user must review and click explicit confirmation in the web application before execution occurs.
4. **`DESTRUCTIVE`:** Deletions (`delete_resume_version`, `remove_saved_personal_document`, `delete_user_data`). Requires verification of statutory retention periods, followed by a non-reversible two-step user confirmation dialog and asynchronous soft deletion.

### Consequences
- **Positive:** Zero probability of rogue autonomous actions by the LLM; complete auditability; high user trust.
- **Negative:** Asynchronous workflow for external actions requires persistent approval state and client UI notification channels.

---

## ADR-005: Interchangeable AI Provider Abstraction and Zero Data Retention

### Status
**Accepted**

### Context
Relying on a single AI model provider introduces vendor lock-in, availability risks, and data compliance concerns. CA resumes and interview dialogues contain personal and financial career data.

### Decision
1. **Provider Abstraction Layer:** Implement an internal `AIEngineAdapter` interface with concrete implementations for Google Gemini, OpenAI, and Anthropic Claude.
2. **Structured Output Enforcement:** Enforce JSON schema validation via instructor or native tool calling features with fallback re-prompting.
3. **Zero Data Retention (ZDR):** Contractually enforce enterprise zero-retention terms with AI providers. Disallow provider training on customer inputs or responses.
4. **Client-Side/Pre-Inference Redaction:** Personal identifiable identifiers (phone numbers, full postal addresses, government IDs) are tokenized or redacted prior to prompt submission to external LLMs.

### Consequences
- **Positive:** Resilience to model outages; ability to select cost-optimal models per task (e.g., faster models for job matching, higher-reasoning models for audit simulations); compliance with Indian DPDP Act.
- **Negative:** Requires maintaining provider adapters and handling subtle variations in prompt adherence.

---

## ADR-006: Hybrid Search (PostgreSQL Full-Text Search + pgvector Embeddings)

### Status
**Accepted**

### Context
Job matching for Chartered Accountants requires both exact keyword matching (e.g., "Ind AS 115", "Transfer Pricing", "Statutory Audit", "Big 4 Articleship", "SAP FICO") and semantic conceptual matching (e.g., matching a candidate with "FP&A background" to "Strategic Financial Planning and Corporate Budgeting").

### Decision
Implement **Hybrid Search** combining:
1. **Lexical Search:** PostgreSQL Full-Text Search with GIN indexes on normalized job titles, required skill sets, and company profiles.
2. **Semantic Search:** `pgvector` extension storing 1536-dimensional embeddings of standardized job descriptions and candidate capability profiles.
3. **Reciprocal Rank Fusion (RRF):** Combine lexical and vector search scores into a single explainable match score (0.0–1.0) with granular explanations (e.g., "Matched 85% on statutory audit skills, partial match on financial modelling").

### Consequences
- **Positive:** Avoids running a separate Elasticsearch or Pinecone cluster; unified database backup and transaction consistency; highly accurate domain matching.
- **Negative:** Vector embedding generation must be handled asynchronously via background workers to keep ingestion latency low.

---

## ADR-007: Idempotency Keys and Distributed Lock Strategy

### Status
**Accepted**

### Context
Network retries, dual user clicks, or agent re-execution could cause duplicate job submissions, double application records, or multiple interview session creations.

### Decision
1. **Idempotency Keys:** Require a unique client-generated or agent-derived `Idempotency-Key` (UUIDv4 or SHA-256 hash of operation payload) for all `WRITE`, `EXTERNAL`, and `DESTRUCTIVE` operations.
2. **Distributed Locks:** Acquire a Redis distributed lock (`SET resource_key token NX EX 30`) during mutation processing.
3. **Replay Strategy:** If an idempotency record exists with status `COMPLETED`, immediately replay the cached sanitized result with HTTP 200 without re-executing database transactions or external API calls.
4. **Time-to-Live:** Store idempotency keys in Redis and the PostgreSQL `IdempotencyRecord` table with a sliding 24-hour expiration.

### Consequences
- **Positive:** Guaranteed once-only execution of side effects; resilience against network drops and aggressive client retries.
- **Negative:** Slight latency overhead for lock acquisition and state verification.

---

## ADR-008: Privacy-Preserving Audit Logging and Zero-PII Telemetry

### Status
**Accepted**

### Context
Compliance, operational security, and debugging demand comprehensive audit trails. However, logging raw resumes, job application notes, or prompt content introduces severe privacy risks and regulatory non-compliance.

### Decision
1. **Structured Audit Events:** Record every consequential action in an immutable `AuditEvent` table and SIEM stream capturing:
   - `actorId` (UUID)
   - `workspaceId` (UUID)
   - `operation` (e.g., `tool:submit_job_application`)
   - `resourceType` and `resourceId`
   - `outcome` (`SUCCESS`, `FAILURE`, `DENIED`, `CANCELLED`)
   - `correlationId` (UUID linking frontend request, agent step, and backend log)
   - `timestamp`
2. **Zero-PII Payload Rule:** Log only SHA-256 hashes of inputs and outputs or sanitized metadata summaries. Never include raw resume text, candidate phone numbers, financial CTC values, or LLM token streams in log sinks.
3. **WORM Storage:** Audit logs are mirrored to an immutable, append-only S3 bucket with Object Lock enabled for legal compliance.

### Consequences
- **Positive:** Complete visibility into user and agent operations without compromising candidate confidentiality; tamper-resistant audit logs.
- **Negative:** Debugging content-specific LLM issues requires relying on reproduction environments rather than inspecting raw production logs.

---

## ADR-009: Strict Candidate Verification and Prohibition of AI Fabrication

### Status
**Accepted**

### Context
A fundamental risk in AI resume building and portfolio generation is the hallucination or fabrication of credentials, audit clients, metrics (e.g., "Saved ₹50 Crore in tax disputes"), or certifications. For Chartered Accountants, representing unearned qualifications violates professional ethics and the ICAI Code of Ethics.

### Decision
1. **No Fabrication Rule:** The AI Resume and Branding engine is programmatically constrained from introducing any factual claims, client names, numerical achievements, or certifications not explicitly provided or verified by the candidate.
2. **Claim Verification Flags:** Generated resume bullet points maintain traceable links to the candidate's verified profile data. If the AI suggests enhancing a bullet point with quantifiable metrics, it must prompt the candidate: *"Did you achieve a measurable outcome here? If yes, please provide the verified number."*
3. **Mandatory Candidate Attestation:** Before any resume version can be marked as `APPROVED` or attached to an application, the candidate must check a mandatory attestation confirming all statements are accurate and compliant with professional standards.

### Consequences
- **Positive:** Upholds professional integrity; protects candidates from ethics violations; builds trusted relationships with verified recruiters.
- **Negative:** Resumes cannot be generated fully autonomously with flashy fictional metrics; requires candidate involvement in metric verification.
