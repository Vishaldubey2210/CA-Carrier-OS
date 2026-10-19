# CA Career OS

> **Intelligent Career Management & Professional Growth Workspace for Chartered Accountants**  
> *From CA qualification to career leadership — one integrated, secure workspace.*

[![Status](https://img.shields.io/badge/Status-Architecture%20Blueprint%20%7C%20Implementation%20Pending-yellow.svg)](#8-architecture-status)
[![Security Model](https://img.shields.io/badge/Security-Zero--Trust%20%7C%20Human--in--the--Loop-blue.svg)](#6-security--privacy-principles)
[![Architecture](https://img.shields.io/badge/Pattern-Modular%20Monolith%20(NestJS)-green.svg)](docs/architecture/decisions.md#adr-001-modular-monolith-architecture-over-microservices)
[![Documentation](https://img.shields.io/badge/Docs-Architecture%20Handbook-blueviolet.svg)](docs/architecture/README.md)
[![Diagrams](https://img.shields.io/badge/Mermaid%20Diagrams-18%20Validated-brightgreen.svg)](#5-complete-system-architecture-diagram-gallery)

---

## Table of Contents

- [1. Product Vision & Target Users](#1-product-vision--target-users)
- [2. High-Level System Architecture](#2-high-level-system-architecture)
- [3. AI Agent Permission & Execution Flow](#3-ai-agent-permission--execution-flow)
- [4. Candidate Dual-Pathway User Journey](#4-candidate-dual-pathway-user-journey)
- [5. Complete System Architecture Diagram Gallery (18 Canonical Views)](#5-complete-system-architecture-diagram-gallery)
- [6. Technology Stack Baseline](#6-technology-stack-baseline)
- [7. Security & Privacy Principles](#7-security--privacy-principles)
- [8. Architecture Status](#8-architecture-status)
- [9. Master Documentation & Architecture Blueprint Index](#9-master-documentation--architecture-blueprint-index)
- [10. Team Lead & Engineering Quick Reference](#10-team-lead--engineering-quick-reference)
- [11. License & Professional Ethics Notice](#11-license--professional-ethics-notice)

---

## 1. Product Vision & Target Users

**CA Career OS** is an AI-powered career copilot and professional operations platform engineered specifically for Chartered Accountants in India, with primary focus on candidates who have recently cleared CA Final and newly qualified CAs (0–3 years post-qualification).

Rather than functioning as another passive, unverified job board, CA Career OS provides a unified, intelligent workspace:

```
"From CA qualification to career success — one intelligent workspace."
```

### Target Personas
1. **Newly Qualified CAs (0–3 Years Post-Qualification):** Transitioning from articleship to industry or practice, requiring pathway clarity, ATS-ready resumes, technical mock interviews, and transparent offer evaluations.
2. **CA Final Cleared Candidates:** Awaiting campus placements or lateral recruitment, seeking role-specific skill gap analysis and bridging tasks.
3. **Independent CA Practitioners:** Launching sole proprietorships or partnerships, requiring post-qualification compliance checklists, Certificate of Practice (COP) workflows, and a lightweight client CRM.
4. **Hiring Firms & Corporate Recruiters:** Seeking verified, domain-tested CA talent with verifiable articleship credentials and domain capabilities.

### Core Problems Addressed (Product Hypotheses)
1. **Career Pathway Uncertainty:** Newly qualified CAs face difficulty choosing among Statutory Audit, Direct/Indirect Tax, FP&A, Corporate Finance, Investment Banking, Management Consulting, and Independent Practice.
2. **Articleship Experience Translation Gap:** Practical articleship training is often skewed toward specific compliance tasks (e.g., tax filing or audit vouching), leaving practical readiness gaps for corporate roles.
3. **Fragmented & Stale Job Listings:** CA vacancies are scattered across unverified portals, agency boards, and firm websites with high rates of duplication and obsolete listings.
4. **Generic Resumes Failing ATS Scans:** Standard CA resumes fail Applicant Tracking Systems (ATS) and fail to articulate audit, tax, and modeling achievements effectively.
5. **Interview Anxiety & Lack of Practice:** Candidates lack a realistic, role-tailored technical practice environment for Ind AS, GST, Transfer Pricing, and financial modeling questions.
6. **Opaque Compensation & Offer Comparison:** Comparing CTC packages involving complex variable pay, bonuses, retiral benefits (PF/Gratuity), and city cost-of-living differences is difficult.
7. **Disjointed Career Tools:** Job hunting, resume updating, follow-ups, and learning tasks are scattered across personal spreadsheets and chat notes.
8. **Independent Practice Obstacles:** Candidates who want to start independent practice face regulatory hurdles (COP procedures, ICAI compliance) and lack lightweight client management tools.

---

## 2. High-Level System Architecture

The platform is designed as a **Modular Monolith** using **NestJS** and **TypeScript**, backed by **PostgreSQL 16+** (with `pgvector` for semantic job matching), **Redis 7+** (for caching, rate limiting, and BullMQ queues), and **S3-compatible object storage** for encrypted documents.

<!-- DIAGRAM:system-architecture:START -->
```mermaid
flowchart TB
  classDef layer fill:#1e293b,stroke:#334155,color:#f1f5f9,font-weight:bold
  classDef module fill:#0f172a,stroke:#3b82f6,color:#93c5fd
  classDef external fill:#1c1917,stroke:#78716c,color:#d6d3d1
  classDef store fill:#14532d,stroke:#16a34a,color:#bbf7d0
  classDef security fill:#7f1d1d,stroke:#dc2626,color:#fca5a5
  classDef ai fill:#312e81,stroke:#6366f1,color:#c7d2fe
  classDef worker fill:#1e1b4b,stroke:#8b5cf6,color:#ddd6fe
  classDef obs fill:#1a2035,stroke:#0ea5e9,color:#bae6fd

  subgraph PRESENTATION["Presentation Tier"]
    direction LR
    CAND_APP["Candidate Dashboard\n(Next.js / React / TypeScript)"]
    RECRUITER_PORTAL["Recruiter Portal\n(Next.js)"]
    ADMIN_CONSOLE["Admin Console\n(Next.js / Role-Gated)"]
  end

  subgraph AUTH_LAYER["Authentication & Authorization (Trust Boundary)"]
    direction LR
    AUTH_SVC["Auth Service\nJWT + Refresh Tokens\nOAuth2 Social Login"]
    RBAC["RBAC Engine\nRole x Workspace Permissions\nLeast-Privilege Enforcement"]
    SESSION["Session Store\n(Redis short TTL)"]
  end

  subgraph API_LAYER["API Gateway Layer"]
    direction LR
    REST_API["REST API\n(NestJS Controllers)"]
    TRPC_API["tRPC Router\n(Type-Safe RPC)"]
    RATE_LIMITER["Rate Limiter\n(Redis Token Bucket)"]
    API_GUARD["Request Validator\nZod Schema + JWT Guard"]
  end

  subgraph CAREER_MODULES["Core SaaS Domain Modules (Modular Monolith)"]
    direction TB
    subgraph MOD_A["[A] Career Intelligence"]
      CI["Profile & Skills Inventory\nCareer Path Recommendations\nSkill-Gap Diagnostic\n30/60/90-Day Transition Roadmap"]
    end
    subgraph MOD_B["[B] Jobs & Recruitment"]
      JR["Verified Job Feed Aggregator\nSemantic Search & Match Scoring\nApplication Tracker Pipeline\nRecruiter Posting Portal"]
    end
    subgraph MOD_C["[C] Resume & Branding"]
      RB["ATS-Optimized Resume Builder\nRole-Specific Tailoring Engine\nCover Letter Generator\nLinkedIn Optimization Review"]
    end
    subgraph MOD_D["[D] Interview & Skills Lab"]
      IS["Technical Mock Interviews\nInd AS / Tax Case Simulations\nExcel Modeling Drills\nObjective Scoring Engine"]
    end
    subgraph MOD_E["[E] Career & Financial Intel"]
      CF["Salary Transparency Engine\nFixed vs Variable CTC Unbundler\nOffer Decision Matrix\nMentor Marketplace"]
    end
    subgraph MOD_F["[F] Practice Management"]
      PM["Post-Qualification Checklist\nCOP Application Guide\nOfficial ICAI Links\nPractice CRM & Compliance Tasks"]
    end
  end

  subgraph JOB_AGGREGATION["Job Ingestion & Normalization Worker"]
    direction LR
    JOB_FETCH["Source Fetcher\n(Authorized Feeds Only)"]
    JOB_NORM["Normalizer &\nDeduplicator"]
    JOB_FRESH["Freshness Verifier\n(TTL + 30d Expiry)"]
    JOB_INDEX["pgvector Indexer\n(Embeddings Generation)"]
  end

  subgraph AI_ORCH["AI Agent Orchestration & Policy Gateway"]
    direction TB
    AGENT_CORE["AI Career Agent Core\n(Multi-Turn Workflow Engine)"]
    TOOL_POLICY["Tool Policy Engine\nAllowlist + JSON Schema Guard\nPermission Tier Router"]
    APPROVAL_GW["Human-in-the-Loop Gateway\nSigned Token Approval Queue\nMandatory User Confirmation"]
    LLM_ADAPTER["LLM Provider Adapter\n(Gemini / GPT-4 / Claude)\nStructured JSON Enforcer"]
    RAG_ENGINE["RAG Engine\nVerified Knowledge Chunk Store\nSource Attribution Builder"]
    PROMPT_GUARD["Prompt Guard\nInjection Detector\nUntrusted Document Filter"]
  end

  subgraph BG_WORKERS["Background Workers (BullMQ + Redis)"]
    direction LR
    EMAIL_WORKER["Notification Worker\n(Email & WhatsApp Alerts)"]
    EMBED_WORKER["Vector Embedding Worker\n(Batch Processing)"]
    REMINDER_WORKER["Application Follow-Up\nReminder Worker"]
    AUDIT_WRITER["Audit Event Ingest Worker\n(Append-Only)"]
    CRON_JOBS["Scheduled Cron Tasks\nFeed Refresh · Stale Cleanup"]
  end

  subgraph PERSISTENCE["Persistence & Cache Tier"]
    direction LR
    PG[("PostgreSQL 16+\nApplication Tables\npgvector Index (HNSW)\nTenant Row-Level Security")]
    REDIS_STORE[("Redis 7+\nSessions · Queues\nIdempotency Keys\nDistributed Locks")]
    S3[("Object Storage (S3)\nEncrypted Resumes & Docs\nPre-Signed URLs (15m TTL)")]
  end

  subgraph EXTERNAL["External Integrations (Egress Boundary)"]
    direction LR
    JOB_APIS["Approved Job APIs & Feeds"]
    AI_PROV["AI Model Providers (Gemini / Claude / OpenAI)"]
    NOTIFY["Notification Services (Resend / Twilio)"]
    PAYMENT["Payment Gateway (Razorpay)"]
    ICAI["Official ICAI Resource Links"]
  end

  subgraph OBSERVABILITY["Observability & Audit Sinks"]
    direction LR
    AUDIT_LOG["WORM Audit Log Store\nActor · Tool · Outcome · CorrelationID"]
    METRICS["OpenTelemetry & Prometheus\nLatency · Error Spikes · Tool Rates"]
    ALERTS["Alerting Engine (PagerDuty)"]
    PRIVACY_LOG["Privacy-Filtered App Logs\nZero PII · Zero Raw Resume Text"]
  end

  PRESENTATION --> AUTH_LAYER
  AUTH_LAYER --> API_LAYER
  API_LAYER --> CAREER_MODULES
  API_LAYER --> AI_ORCH
  CAREER_MODULES --> JOB_AGGREGATION
  AI_ORCH --> CAREER_MODULES
  AI_ORCH --> APPROVAL_GW
  CAREER_MODULES --> BG_WORKERS
  AI_ORCH --> BG_WORKERS
  CAREER_MODULES --> PERSISTENCE
  AI_ORCH --> PERSISTENCE
  JOB_AGGREGATION --> PERSISTENCE
  BG_WORKERS --> PERSISTENCE
  BG_WORKERS --> EXTERNAL
  CAREER_MODULES --> EXTERNAL
  AI_ORCH --> EXTERNAL
  BG_WORKERS --> OBSERVABILITY
  CAREER_MODULES --> OBSERVABILITY
  AI_ORCH --> OBSERVABILITY
  API_LAYER --> OBSERVABILITY
```
<!-- DIAGRAM:system-architecture:END -->

---

## 3. AI Agent Permission & Execution Flow

To guarantee safety, predictability, and user trust, all AI Career Agent actions pass through a deterministic, server-side permission gateway before execution. The agent cannot autonomously perform real-world external mutations without explicit human approval.

<!-- DIAGRAM:agent-execution-flow:START -->
```mermaid
flowchart TD
  classDef reqNode fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#bfdbfe,font-weight:bold
  classDef authNode fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#c7d2fe
  classDef policyNode fill:#1c1917,stroke:#f59e0b,stroke-width:2px,color:#fde68a
  classDef readNode fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#bbf7d0
  classDef writeNode fill:#1e3a5f,stroke:#3b82f6,stroke-width:2px,color:#bfdbfe
  classDef extNode fill:#3b1f00,stroke:#f97316,stroke-width:2px,color:#fed7aa
  classDef destNode fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fca5a5
  classDef auditNode fill:#0c1425,stroke:#0ea5e9,stroke-width:2px,color:#bae6fd
  classDef errorNode fill:#3b0764,stroke:#a855f7,stroke-width:2px,color:#e9d5ff
  classDef cacheNode fill:#1a2e1a,stroke:#4ade80,stroke-width:2px,color:#bbf7d0
  classDef userNode fill:#0f2027,stroke:#06b6d4,stroke-width:2px,color:#a5f3fc
  classDef successNode fill:#052e16,stroke:#16a34a,stroke-width:2px,color:#bbf7d0

  USER(["User / AI Agent Tool Call Request"]):::userNode

  AUTH{"Step 1: Authenticate\nJWT Validation"}:::authNode
  AUTH_FAIL(["401 Unauthorized\nInvalid / Expired Token"]):::errorNode

  WS_AUTH{"Step 2: Workspace Auth\nScope & Membership Check"}:::authNode
  WS_FAIL(["403 Forbidden\nWorkspace Access Denied"]):::errorNode

  TOOL_ALLOW{"Step 3: Tool Allowlist\nCheck Tool Registry"}:::policyNode
  TOOL_DENY(["403 Forbidden\nTool Not in Allowlist"]):::errorNode

  SCHEMA_VAL{"Step 4: Schema Validation\nStrict Zod Parse"}:::policyNode
  SCHEMA_FAIL(["400 Bad Request\nMalformed Tool Payload"]):::errorNode

  RATE_CHECK{"Step 5: Rate Limiting\nRedis Token Bucket"}:::policyNode
  RATE_FAIL(["429 Too Many Requests\nRate Limit Exceeded"]):::errorNode

  PERM_ROUTER{"Step 6: Permission\nTier Router"}:::policyNode

  subgraph READ_PATH["READ_ONLY Path (Zero State Mutation)"]
    direction TB
    READ_OPS["Tools: get_user_profile · search_jobs\nget_application_status · get_skill_gap_report"]:::readNode
    READ_CACHE{"Cache Hit in Redis?"}:::cacheNode
    READ_DB["Query DB Replica\nScoped by Workspace ID"]:::readNode
    READ_CACHE_STORE["Cache Sanitized Result (TTL)"]:::cacheNode
  end

  subgraph WRITE_PATH["WRITE Path (Controlled State Mutation)"]
    direction TB
    WRITE_OPS["Tools: create_career_task · update_user_preferences\nsave_job · create_resume_draft"]:::writeNode
    IDEMPOTENCY{"Idempotency Key\nExists in Redis/DB?"}:::cacheNode
    IDEMPOTENCY_REPLAY["Replay Cached Result\n(Prevent Duplicate Writes)"]:::cacheNode
    IDEMPOTENCY_GEN["Generate Distributed Lock\n& Record Key (PROCESSING)"]:::cacheNode
    TXN_EXEC["Execute DB Transaction\n(Prisma + PostgreSQL)"]:::writeNode
    TXN_FAIL(["Transaction Failed\nRollback & Release Lock"]):::errorNode
    IDEMPOTENCY_MARK["Mark Key COMPLETED\nCache Output (24h TTL)"]:::cacheNode
  end

  subgraph EXT_PATH["EXPLICITLY APPROVED EXTERNAL Actions"]
    direction TB
    EXT_OPS["Tools: submit_job_application\nsend_recruiter_message · book_paid_mentorship"]:::extNode
    APPROVAL_CARD["Create ApprovalRequest\nGenerate 15-Minute Signed Token"]:::extNode
    USER_GATE{"Human-in-the-Loop Gate\nUser Action in UI?"}:::extNode
    EXT_EXPIRED(["Approval Expired\n15m TTL Elapsed without Confirmation"]):::errorNode
    EXT_CANCELLED(["Approval Cancelled\nUser Explicitly Rejected Action"]):::errorNode
    EXT_IDEM{"Idempotency Check\nExternal Call Signature"}:::cacheNode
    EXT_EXEC["Execute External Integration\nRate-Limited Egress via Worker"]:::extNode
    EXT_FAIL(["External Service Failed\nEnqueue Dead-Letter / Alert"]):::errorNode
  end

  subgraph DEST_PATH["DESTRUCTIVE Path (Confirmed Deletion)"]
    direction TB
    DEST_OPS["Tools: delete_resume_version\nremove_saved_personal_document · delete_user_data"]:::destNode
    RETENTION_CHECK{"Statutory Legal\nRetention Active?"}:::destNode
    RETENTION_BLOCK(["Deletion Blocked\nStatutory Retention Mandated"]):::errorNode
    CONFIRM_MODAL["Display Two-Step Warning Modal\nRequire Explicit Confirmation"]:::destNode
    DEST_DECISION{"User Confirmed?"}:::destNode
    DEST_CANCEL(["Deletion Cancelled by User"]):::errorNode
    SOFT_DELETE["Soft-Delete Record\nWrite Tombstone & Set 30d Purge Queue"]:::destNode
  end

  subgraph AUDIT_LAYER["Telemetry & Audit Layer (All Execution Outcomes)"]
    direction LR
    AUDIT_EVENT["Immutable Audit Event:\nactorId · workspaceId · toolName · outcome\ncorrelationId · durationMs · timestamp"]:::auditNode
    PRIVACY_FILTER["Privacy Redaction Filter:\nSHA-256 Payload Hashes Only\nZero PII · Zero Raw Resume Text · Zero Tokens"]:::auditNode
    METRICS_EMIT["Emit Prometheus Metrics\n& Alert on Anomalies"]:::auditNode
  end

  SUCCESS(["Return Success Result to Caller"]):::successNode

  USER --> AUTH
  AUTH -- "Invalid" --> AUTH_FAIL
  AUTH -- "Valid" --> WS_AUTH
  WS_AUTH -- "Unauthorized" --> WS_FAIL
  WS_AUTH -- "Authorized" --> TOOL_ALLOW
  TOOL_ALLOW -- "Denied" --> TOOL_DENY
  TOOL_ALLOW -- "Allowed" --> SCHEMA_VAL
  SCHEMA_VAL -- "Invalid" --> SCHEMA_FAIL
  SCHEMA_VAL -- "Valid" --> RATE_CHECK
  RATE_CHECK -- "Exceeded" --> RATE_FAIL
  RATE_CHECK -- "Within Quota" --> PERM_ROUTER

  PERM_ROUTER -- "READ_ONLY" --> READ_OPS
  PERM_ROUTER -- "WRITE" --> WRITE_OPS
  PERM_ROUTER -- "APPROVED EXTERNAL" --> EXT_OPS
  PERM_ROUTER -- "DESTRUCTIVE" --> DEST_OPS

  READ_OPS --> READ_CACHE
  READ_CACHE -- "Hit" --> SUCCESS
  READ_CACHE -- "Miss" --> READ_DB
  READ_DB --> READ_CACHE_STORE --> SUCCESS

  WRITE_OPS --> IDEMPOTENCY
  IDEMPOTENCY -- "Exists (Cached)" --> IDEMPOTENCY_REPLAY --> SUCCESS
  IDEMPOTENCY -- "New Operation" --> IDEMPOTENCY_GEN
  IDEMPOTENCY_GEN --> TXN_EXEC
  TXN_EXEC -- "Error" --> TXN_FAIL
  TXN_EXEC -- "Success" --> IDEMPOTENCY_MARK --> SUCCESS

  EXT_OPS --> APPROVAL_CARD
  APPROVAL_CARD --> USER_GATE
  USER_GATE -- "User Declined" --> EXT_CANCELLED
  USER_GATE -- "Token Expired" --> EXT_EXPIRED
  USER_GATE -- "User Approved" --> EXT_IDEM
  EXT_IDEM -- "Duplicate" --> IDEMPOTENCY_REPLAY
  EXT_IDEM -- "New" --> EXT_EXEC
  EXT_EXEC -- "Error" --> EXT_FAIL
  EXT_EXEC -- "Success" --> SUCCESS

  DEST_OPS --> RETENTION_CHECK
  RETENTION_CHECK -- "Retention Mandated" --> RETENTION_BLOCK
  RETENTION_CHECK -- "Permitted" --> CONFIRM_MODAL
  CONFIRM_MODAL --> DEST_DECISION
  DEST_DECISION -- "Declined" --> DEST_CANCEL
  DEST_DECISION -- "Confirmed" --> SOFT_DELETE
  SOFT_DELETE --> SUCCESS

  SUCCESS --> AUDIT_EVENT
  AUTH_FAIL --> AUDIT_EVENT
  WS_FAIL --> AUDIT_EVENT
  TOOL_DENY --> AUDIT_EVENT
  SCHEMA_FAIL --> AUDIT_EVENT
  RATE_FAIL --> AUDIT_EVENT
  TXN_FAIL --> AUDIT_EVENT
  EXT_EXPIRED --> AUDIT_EVENT
  EXT_CANCELLED --> AUDIT_EVENT
  EXT_FAIL --> AUDIT_EVENT
  RETENTION_BLOCK --> AUDIT_EVENT
  DEST_CANCEL --> AUDIT_EVENT

  AUDIT_EVENT --> PRIVACY_FILTER --> METRICS_EMIT
```
<!-- DIAGRAM:agent-execution-flow:END -->

### Deterministic Permission Tiers

| Permission Tier | Representative Tools | Execution Rule | Safety Guarantee |
| :--- | :--- | :--- | :--- |
| **`READ_ONLY`** | `get_user_profile`, `search_jobs`, `get_application_status`, `get_skill_gap_report` | Direct read via cache or database replica | Zero side effects; scoped to active workspace |
| **`WRITE`** | `create_career_task`, `update_user_preferences`, `save_job`, `create_resume_draft` | Server transaction with idempotency key | Rollback on failure; no duplicate records |
| **`EXPLICITLY_APPROVED_EXTERNAL`** | `submit_job_application`, `send_recruiter_message`, `book_paid_mentorship` | **Mandatory human confirmation in UI (15m TTL)** | Agent cannot autonomously contact third parties or spend funds |
| **`DESTRUCTIVE`** | `delete_resume_version`, `remove_saved_personal_document`, `delete_user_data` | Retention check + two-step confirmation | Soft deletion with 30-day grace period; no accidental hard purge |

---

## 4. Candidate User Journey (Employment & Practice Tracks)

The platform supports two distinct professional trajectories for Chartered Accountants:

<!-- DIAGRAM:user-journey:START -->
```mermaid
flowchart TD
  classDef milestone fill:#1e293b,stroke:#3b82f6,color:#bfdbfe,font-weight:bold
  classDef action    fill:#0f172a,stroke:#64748b,color:#94a3b8
  classDef ai        fill:#312e81,stroke:#6366f1,color:#c7d2fe
  classDef alt       fill:#1c1917,stroke:#d97706,color:#fde68a
  classDef decision  fill:#1e1b4b,stroke:#8b5cf6,color:#ddd6fe

  %% ─── Main Journey ──────────────────────────────────────
  START(["🎓 CA Final Cleared\nor Newly Qualified CA"]):::milestone

  ONBOARD["📋 Onboarding & Profile Setup\n• Qualification details · Articleship area\n• Preferred city · Work type\n• Role interest · Salary expectation"]:::action

  CAREER_DISC["🧭 Career Intelligence\n• AI path recommendations\n• 6 domain pathway options\n• Peer cohort comparison (anonymous)"]:::ai

  SKILL_GAP["📊 Skill-Gap Analysis\n• Role-specific skill inventory\n• Articleship vs. target role delta\n• Prioritised learning plan"]:::ai

  PATH_CHOICE{"Which path?"}:::decision

  %% ─── Employment Path ────────────────────────────────────
  subgraph EMPLOYMENT["💼 Employment Path"]
    direction TB
    JOB_MATCH["🔍 Job Matching\n• Semantic search + score\n• Freshness verified\n• Explainable match reason"]:::ai
    RESUME_TAILOR["📄 Resume Tailoring\n• ATS-optimised per role\n• Verified claims only\n• Cover letter generation"]:::ai
    APP_TRACK["📌 Application Tracking\n• Status per application\n• Follow-up reminders\n• Recruiter interactions"]:::action
    INTERVIEW_PREP["🎤 Interview Preparation\n• Role-specific question bank\n• Mock interview sessions\n• Feedback & progress score"]:::ai
    OFFER_COMPARE["💰 Offer Comparison\n• CTC breakdown\n• Fixed vs. variable analysis\n• Benefits normalisation"]:::action
    JOB_ACCEPT["✅ Job Selection\n• Approved submission\n• Offer letter storage\n• Onboarding checklist"]:::action
    FIRST_90["🚀 First 90 Days\n• Role-specific milestones\n• Learning tasks\n• Mentor access"]:::action
    LONG_TERM["📈 Long-Term Growth\n• Skill upgrades\n• Role re-assessment\n• Community & alumni"]:::action
  end

  %% ─── Practice Path ───────────────────────────────────────
  subgraph PRACTICE["🏢 Independent Practice Path"]
    direction TB
    POST_QUAL["📋 Post-Qualification Checklist\n• ICAI membership steps\n• COP application guidance\n• Official resource links"]:::alt
    PRACTICE_SETUP["⚙️ Practice Setup\n• Office, branding, tools\n• GST, Income Tax registrations\n• Professional indemnity"]:::alt
    CLIENT_CRM["👥 Client Onboarding\n• Engagement letters\n• KYC & document requests\n• Task & deadline reminders"]:::alt
    PRACTICE_GROW["📊 Practice Growth\n• Service expansion planning\n• Staff & partner onboarding\n• Compliance calendar"]:::alt
  end

  %% ─── Flows ─────────────────────────────────────────────
  START --> ONBOARD
  ONBOARD --> CAREER_DISC
  CAREER_DISC --> SKILL_GAP
  SKILL_GAP --> PATH_CHOICE

  PATH_CHOICE -- "Employment" --> JOB_MATCH
  JOB_MATCH --> RESUME_TAILOR
  RESUME_TAILOR --> APP_TRACK
  APP_TRACK --> INTERVIEW_PREP
  INTERVIEW_PREP --> OFFER_COMPARE
  OFFER_COMPARE --> JOB_ACCEPT
  JOB_ACCEPT --> FIRST_90
  FIRST_90 --> LONG_TERM
  LONG_TERM -- "Career pivot\nor advancement" --> CAREER_DISC

  PATH_CHOICE -- "Independent Practice" --> POST_QUAL
  POST_QUAL --> PRACTICE_SETUP
  PRACTICE_SETUP --> CLIENT_CRM
  CLIENT_CRM --> PRACTICE_GROW
  PRACTICE_GROW -- "Add employment\noption later" --> PATH_CHOICE

  %% ─── AI Agent Runs Throughout ───────────────────────────
  AI_AGENT["🤖 AI Career Agent\nAvailable at every stage\nREAD · WRITE · Approved external\nNever acts without permission"]:::ai
  AI_AGENT -.->|"assists"| CAREER_DISC
  AI_AGENT -.->|"assists"| SKILL_GAP
  AI_AGENT -.->|"assists"| JOB_MATCH
  AI_AGENT -.->|"assists"| RESUME_TAILOR
  AI_AGENT -.->|"assists"| INTERVIEW_PREP
  AI_AGENT -.->|"assists"| OFFER_COMPARE
  AI_AGENT -.->|"assists"| FIRST_90
```
<!-- DIAGRAM:user-journey:END -->

---

## 5. Complete System Architecture Diagram Gallery

> **Visual Architecture Gallery:** This gallery provides direct, in-browser visual access to all 18 canonical system architecture diagrams. Each diagram is maintained as an editable canonical `.mmd` file in `docs/architecture/` and is synchronized into this document via automated tooling.

### Gallery Quick Jump Navigation

| # | Diagram Title | Domain Focus | Canonical File | Quick Jump |
| :-: | :--- | :--- | :--- | :-: |
| **01** | System Context | Platform Boundary & Actors | [`system-context.mmd`](docs/architecture/system-context.mmd) | [View Graph](#gallery-01-system-context-diagram) |
| **02** | Container Architecture | Service Tiers & Queues | [`system-architecture.mmd`](docs/architecture/system-architecture.mmd) | [View Graph](#gallery-02-detailed-container-architecture) |
| **03** | Backend Components | NestJS Ingress & Domain Services | [`backend-component-architecture.mmd`](docs/architecture/backend-component-architecture.mmd) | [View Graph](#gallery-03-backend-component-architecture) |
| **04** | Domain Module Dependencies | Modular Monolith Decoupling | [`domain-module-dependencies.mmd`](docs/architecture/domain-module-dependencies.mmd) | [View Graph](#gallery-04-domain-module-dependencies) |
| **05** | AI Agent System | RAG & Context Orchestration | [`ai-agent-system.mmd`](docs/architecture/ai-agent-system.mmd) | [View Graph](#gallery-05-ai-agent-system-architecture) |
| **06** | Agent Execution Flow | 4-Tier Security Router | [`agent-execution-flow.mmd`](docs/architecture/agent-execution-flow.mmd) | [View Graph](#gallery-06-agent-execution-flow) |
| **07** | Human Approval Sequence | 15m Signed Token Cards | [`human-approval-sequence.mmd`](docs/architecture/human-approval-sequence.mmd) | [View Graph](#gallery-07-human-approval-sequence) |
| **08** | Candidate User Journey | Corporate & Practice Paths | [`user-journey.mmd`](docs/architecture/user-journey.mmd) | [View Graph](#gallery-08-candidate-user-journey) |
| **09** | Job Ingestion Pipeline | Deduplication & Vector Indexing | [`job-ingestion-pipeline.mmd`](docs/architecture/job-ingestion-pipeline.mmd) | [View Graph](#gallery-09-job-ingestion-pipeline) |
| **10** | Job Application Workflow | Application Lifecycle States | [`job-application-workflow.mmd`](docs/architecture/job-application-workflow.mmd) | [View Graph](#gallery-10-job-application-lifecycle-state-machine) |
| **11** | Database Architecture (ERD) | 21 Entities & Workspace Scopes | [`data-architecture.mmd`](docs/architecture/data-architecture.mmd) | [View Graph](#gallery-11-database-architecture-erd) |
| **12** | Security Boundaries | Defense-in-Depth & KMS Zones | [`security-boundaries.mmd`](docs/architecture/security-boundaries.mmd) | [View Graph](#gallery-12-security-boundaries--trust-zones) |
| **13** | Background Processing | BullMQ Queues & Retries | [`background-processing.mmd`](docs/architecture/background-processing.mmd) | [View Graph](#gallery-13-background-jobs--asynchronous-queues) |
| **14** | Independent Practice | COP Guide & Client CRM | [`independent-practice-workflow.mmd`](docs/architecture/independent-practice-workflow.mmd) | [View Graph](#gallery-14-independent-practice-workflow) |
| **15** | Deployment Architecture | Multi-AZ ECS Fargate & Cloudflare | [`deployment-architecture.mmd`](docs/architecture/deployment-architecture.mmd) | [View Graph](#gallery-15-deployment-architecture--cloud-topology) |
| **16** | Identity & Access | Workspaces, RBAC & Tokens | [`identity-and-access.mmd`](docs/architecture/identity-and-access.mmd) | [View Graph](#gallery-16-identity-multi-tenancy--access-control) |
| **17** | Billing Lifecycle | Plans, Webhooks & Soft Grace | [`billing-lifecycle.mmd`](docs/architecture/billing-lifecycle.mmd) | [View Graph](#gallery-17-billing-subscriptions--commercial-lifecycle) |
| **18** | Observability Architecture | OpenTelemetry, Logs & Alerts | [`observability-architecture.mmd`](docs/architecture/observability-architecture.mmd) | [View Graph](#gallery-18-observability-telemetry--health-monitoring) |

---

### Gallery 01: System Context Diagram

- **Purpose:** Defines the outermost boundary of CA Career OS, showing candidate, recruiter, and practitioner actors interacting with platform services, persistence stores, AI providers, and external compliance systems.
- **Canonical Source:** [`docs/architecture/system-context.mmd`](docs/architecture/system-context.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#21-system-context-diagram`](docs/architecture/README.md#21-system-context-diagram)

<!-- DIAGRAM:gallery-system-context:START -->
```mermaid
flowchart TB
  classDef userClass fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef appClass fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc
  classDef extClass fill:#1c1917,stroke:#a8a29e,stroke-width:2px,color:#f5f5f4
  classDef dbClass fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5

  subgraph USERS["Platform Users"]
    CANDIDATE["CA Candidate\n(Newly qualified / CA Final cleared)"]:::userClass
    RECRUITER["Recruiter / CA Firm\n(Hiring team & employer)"]:::userClass
    MENTOR["Senior CA Mentor\n(Advisory sessions)"]:::userClass
    ADMIN["Platform Administrator\n(Operational oversight & audit)"]:::userClass
  end

  subgraph PLATFORM["CA Career OS SaaS Platform"]
    WEB_APP["Web Application\n(Next.js / TypeScript / React 19)"]:::appClass
    BACKEND["Core SaaS Backend\n(NestJS Modular Monolith API)"]:::appClass
    AI_AGENT["AI Career Agent\n(Permission-Governed Orchestration)"]:::appClass
  end

  subgraph DATA_STORES["Persistence & Infrastructure"]
    PG[("PostgreSQL\nPrimary Relational Store\npgvector Embeddings")]:::dbClass
    REDIS[("Redis\nSessions · Queues\nIdempotency Keys")]:::dbClass
    S3[("Object Storage\nResumes & Documents\nServer-Side Encrypted")]:::dbClass
  end

  subgraph EXT_SERVICES["External Integrations"]
    JOB_FEEDS["External Job Feeds\n(Approved APIs & Feeds)"]:::extClass
    AI_PROVIDERS["AI Model Providers\n(Gemini / OpenAI / Claude)"]:::extClass
    NOTIFICATIONS["Notification Services\n(Resend / Twilio)"]:::extClass
    PAYMENT_GATEWAY["Payment Gateway\n(Razorpay / Stripe India)"]:::extClass
    ICAI_RESOURCES["ICAI Portal Links\n(Official Regulatory Refs)"]:::extClass
  end

  CANDIDATE -->|"HTTPS"| WEB_APP
  RECRUITER -->|"HTTPS"| WEB_APP
  MENTOR -->|"HTTPS"| WEB_APP
  ADMIN -->|"HTTPS / Role-Gated"| WEB_APP

  WEB_APP -->|"REST / tRPC API"| BACKEND
  BACKEND <-->|"Orchestrates Tools"| AI_AGENT

  BACKEND -->|"Relational & Vector Queries"| PG
  BACKEND -->|"Cache & Queues"| REDIS
  BACKEND -->|"Document Operations"| S3

  AI_AGENT -->|"Inference & Structured JSON"| AI_PROVIDERS
  BACKEND -->|"Ingest Job Feeds"| JOB_FEEDS
  BACKEND -->|"Transactional Alerts"| NOTIFICATIONS
  BACKEND -->|"Billing & Subscriptions"| PAYMENT_GATEWAY
  BACKEND -->|"Reference Verification"| ICAI_RESOURCES
```
<!-- DIAGRAM:gallery-system-context:END -->

---

### Gallery 02: Detailed Container Architecture

- **Purpose:** Multi-tier container architecture detailing Next.js presentation, NestJS API gateway, 6 core domain modules, BullMQ queue workers, and persistence stores.
- **Canonical Source:** [`docs/architecture/system-architecture.mmd`](docs/architecture/system-architecture.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#22-detailed-container-architecture`](docs/architecture/README.md#22-detailed-container-architecture)

<!-- DIAGRAM:gallery-system-architecture:START -->
```mermaid
flowchart TB
  classDef layer fill:#1e293b,stroke:#334155,color:#f1f5f9,font-weight:bold
  classDef module fill:#0f172a,stroke:#3b82f6,color:#93c5fd
  classDef external fill:#1c1917,stroke:#78716c,color:#d6d3d1
  classDef store fill:#14532d,stroke:#16a34a,color:#bbf7d0
  classDef security fill:#7f1d1d,stroke:#dc2626,color:#fca5a5
  classDef ai fill:#312e81,stroke:#6366f1,color:#c7d2fe
  classDef worker fill:#1e1b4b,stroke:#8b5cf6,color:#ddd6fe
  classDef obs fill:#1a2035,stroke:#0ea5e9,color:#bae6fd

  subgraph PRESENTATION["Presentation Tier"]
    direction LR
    CAND_APP["Candidate Dashboard\n(Next.js / React / TypeScript)"]
    RECRUITER_PORTAL["Recruiter Portal\n(Next.js)"]
    ADMIN_CONSOLE["Admin Console\n(Next.js / Role-Gated)"]
  end

  subgraph AUTH_LAYER["Authentication & Authorization (Trust Boundary)"]
    direction LR
    AUTH_SVC["Auth Service\nJWT + Refresh Tokens\nOAuth2 Social Login"]
    RBAC["RBAC Engine\nRole x Workspace Permissions\nLeast-Privilege Enforcement"]
    SESSION["Session Store\n(Redis short TTL)"]
  end

  subgraph API_LAYER["API Gateway Layer"]
    direction LR
    REST_API["REST API\n(NestJS Controllers)"]
    TRPC_API["tRPC Router\n(Type-Safe RPC)"]
    RATE_LIMITER["Rate Limiter\n(Redis Token Bucket)"]
    API_GUARD["Request Validator\nZod Schema + JWT Guard"]
  end

  subgraph CAREER_MODULES["Core SaaS Domain Modules (Modular Monolith)"]
    direction TB
    subgraph MOD_A["[A] Career Intelligence"]
      CI["Profile & Skills Inventory\nCareer Path Recommendations\nSkill-Gap Diagnostic\n30/60/90-Day Transition Roadmap"]
    end
    subgraph MOD_B["[B] Jobs & Recruitment"]
      JR["Verified Job Feed Aggregator\nSemantic Search & Match Scoring\nApplication Tracker Pipeline\nRecruiter Posting Portal"]
    end
    subgraph MOD_C["[C] Resume & Branding"]
      RB["ATS-Optimized Resume Builder\nRole-Specific Tailoring Engine\nCover Letter Generator\nLinkedIn Optimization Review"]
    end
    subgraph MOD_D["[D] Interview & Skills Lab"]
      IS["Technical Mock Interviews\nInd AS / Tax Case Simulations\nExcel Modeling Drills\nObjective Scoring Engine"]
    end
    subgraph MOD_E["[E] Career & Financial Intel"]
      CF["Salary Transparency Engine\nFixed vs Variable CTC Unbundler\nOffer Decision Matrix\nMentor Marketplace"]
    end
    subgraph MOD_F["[F] Practice Management"]
      PM["Post-Qualification Checklist\nCOP Application Guide\nOfficial ICAI Links\nPractice CRM & Compliance Tasks"]
    end
  end

  subgraph JOB_AGGREGATION["Job Ingestion & Normalization Worker"]
    direction LR
    JOB_FETCH["Source Fetcher\n(Authorized Feeds Only)"]
    JOB_NORM["Normalizer &\nDeduplicator"]
    JOB_FRESH["Freshness Verifier\n(TTL + 30d Expiry)"]
    JOB_INDEX["pgvector Indexer\n(Embeddings Generation)"]
  end

  subgraph AI_ORCH["AI Agent Orchestration & Policy Gateway"]
    direction TB
    AGENT_CORE["AI Career Agent Core\n(Multi-Turn Workflow Engine)"]
    TOOL_POLICY["Tool Policy Engine\nAllowlist + JSON Schema Guard\nPermission Tier Router"]
    APPROVAL_GW["Human-in-the-Loop Gateway\nSigned Token Approval Queue\nMandatory User Confirmation"]
    LLM_ADAPTER["LLM Provider Adapter\n(Gemini / GPT-4 / Claude)\nStructured JSON Enforcer"]
    RAG_ENGINE["RAG Engine\nVerified Knowledge Chunk Store\nSource Attribution Builder"]
    PROMPT_GUARD["Prompt Guard\nInjection Detector\nUntrusted Document Filter"]
  end

  subgraph BG_WORKERS["Background Workers (BullMQ + Redis)"]
    direction LR
    EMAIL_WORKER["Notification Worker\n(Email & WhatsApp Alerts)"]
    EMBED_WORKER["Vector Embedding Worker\n(Batch Processing)"]
    REMINDER_WORKER["Application Follow-Up\nReminder Worker"]
    AUDIT_WRITER["Audit Event Ingest Worker\n(Append-Only)"]
    CRON_JOBS["Scheduled Cron Tasks\nFeed Refresh · Stale Cleanup"]
  end

  subgraph PERSISTENCE["Persistence & Cache Tier"]
    direction LR
    PG[("PostgreSQL 16+\nApplication Tables\npgvector Index (HNSW)\nTenant Row-Level Security")]
    REDIS_STORE[("Redis 7+\nSessions · Queues\nIdempotency Keys\nDistributed Locks")]
    S3[("Object Storage (S3)\nEncrypted Resumes & Docs\nPre-Signed URLs (15m TTL)")]
  end

  subgraph EXTERNAL["External Integrations (Egress Boundary)"]
    direction LR
    JOB_APIS["Approved Job APIs & Feeds"]
    AI_PROV["AI Model Providers (Gemini / Claude / OpenAI)"]
    NOTIFY["Notification Services (Resend / Twilio)"]
    PAYMENT["Payment Gateway (Razorpay)"]
    ICAI["Official ICAI Resource Links"]
  end

  subgraph OBSERVABILITY["Observability & Audit Sinks"]
    direction LR
    AUDIT_LOG["WORM Audit Log Store\nActor · Tool · Outcome · CorrelationID"]
    METRICS["OpenTelemetry & Prometheus\nLatency · Error Spikes · Tool Rates"]
    ALERTS["Alerting Engine (PagerDuty)"]
    PRIVACY_LOG["Privacy-Filtered App Logs\nZero PII · Zero Raw Resume Text"]
  end

  PRESENTATION --> AUTH_LAYER
  AUTH_LAYER --> API_LAYER
  API_LAYER --> CAREER_MODULES
  API_LAYER --> AI_ORCH
  CAREER_MODULES --> JOB_AGGREGATION
  AI_ORCH --> CAREER_MODULES
  AI_ORCH --> APPROVAL_GW
  CAREER_MODULES --> BG_WORKERS
  AI_ORCH --> BG_WORKERS
  CAREER_MODULES --> PERSISTENCE
  AI_ORCH --> PERSISTENCE
  JOB_AGGREGATION --> PERSISTENCE
  BG_WORKERS --> PERSISTENCE
  BG_WORKERS --> EXTERNAL
  CAREER_MODULES --> EXTERNAL
  AI_ORCH --> EXTERNAL
  BG_WORKERS --> OBSERVABILITY
  CAREER_MODULES --> OBSERVABILITY
  AI_ORCH --> OBSERVABILITY
  API_LAYER --> OBSERVABILITY
```
<!-- DIAGRAM:gallery-system-architecture:END -->

---

### Gallery 03: Backend Component Architecture

- **Purpose:** Internal NestJS software architecture illustrating request ingress guards, domain services, application repositories, outbox publisher, and database adapters.
- **Canonical Source:** [`docs/architecture/backend-component-architecture.mmd`](docs/architecture/backend-component-architecture.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#23-backend-component-architecture`](docs/architecture/README.md#23-backend-component-architecture)

<!-- DIAGRAM:gallery-backend-component-architecture:START -->
```mermaid
flowchart TB
  classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef gateway fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#bfdbfe
  classDef domain fill:#172554,stroke:#60a5fa,stroke-width:1px,color:#dbeafe
  classDef infra fill:#1e1b4b,stroke:#818cf8,stroke-width:1px,color:#e0e7ff
  classDef data fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5
  classDef ext fill:#1c1917,stroke:#a8a29e,stroke-width:1px,color:#f5f5f4

  subgraph CLIENT_LAYER["Presentation & Client Layer"]
    WEB_CAND["Candidate Web App\n(Next.js App Router / React 19)"]:::client
    WEB_REC["Recruiter & Firm Portal\n(Next.js App Router / React 19)"]:::client
    WEB_ADMIN["Platform Admin Console\n(Next.js Role-Gated)"]:::client
  end

  subgraph INGRESS_LAYER["API Ingress & Gateway Layer (NestJS)"]
    direction LR
    JWT_GUARD["JWT Authentication Guard\n(Bearer Token / HttpOnly Cookie)"]:::gateway
    WS_GUARD["Workspace Context Guard\n(Personal vs Org Workspace Scope)"]:::gateway
    RATE_LIMIT["Rate Limit Interceptor\n(Redis Token Bucket per Tenant)"]:::gateway
    ZOD_PIPE["Zod Validation Pipe\n(Strict Schema Enforcement)"]:::gateway
    LOG_INTERCEPT["Privacy Logging Interceptor\n(Zero-PII Correlation Logger)"]:::gateway
  end

  subgraph DOMAIN_SERVICES["Core Domain Services (Modular Monolith)"]
    direction TB
    CAREER_SVC["CareerIntelligenceService\n• Diagnostics & Roadmaps\n• Skills Inventory & Gap Analysis"]:::domain
    JOBS_SVC["JobsRecruitmentService\n• Job Ingestion & Normalization\n• Hybrid Search (FTS + pgvector)\n• Application Tracker Pipeline"]:::domain
    RESUME_SVC["ResumeBrandingService\n• ATS Builder & Role Tailoring\n• Zero-Fabrication Guard (ADR-009)\n• Candidate Attestation Verifier"]:::domain
    INTERVIEW_SVC["InterviewSkillsService\n• Technical Mock Interviews\n• Ind AS & Tax Synthetic Cases\n• Objective Feedback Engine"]:::domain
    FINANCIAL_SVC["FinancialIntelService\n• CTC Unbundling & Offer Matrix\n• Anonymous Salary Benchmarking\n• Mentor Marketplace Advisory"]:::domain
    PRACTICE_SVC["PracticeManagementService\n• Post-Qual & COP Checklists\n• Client KYC & Onboarding\n• Compliance Deadline Calendar"]:::domain
    WORKSPACE_SVC["WorkspaceIdentityService\n• User Profiles & RBAC\n• Workspace Membership Isolation\n• Tenant Context Resolver"]:::domain
    AUDIT_SVC["AuditLoggingService\n• Tamper-Evident Audit Events\n• WORM Storage Sync\n• SIEM Stream Dispatcher"]:::domain
  end

  subgraph CROSS_CUTTING["Cross-Cutting Infrastructure Services"]
    direction TB
    AGENT_ORCH["AgentOrchestratorService\n• Multi-Turn Context Planner\n• Tool Call Dispatcher"]:::infra
    TOOL_POLICY["ToolPolicyEngine\n• 4-Tier Permission Router\n• Server-Side Tool Allowlist"]:::infra
    APPROVAL_GW["ApprovalGatewayService\n• 15-Minute Signed Token Gate\n• Interactive Approval Cards"]:::infra
    LLM_ADAPTER["LLMProviderAdapter\n• Gemini / Claude / GPT\n• JSON Schema Enforcer\n• PII Redaction Filter"]:::infra
    LOCK_MGR["DistributedLockManager\n• Redis Redlock (30s TTL)\n• Idempotency Deduplication"]:::infra
    QUEUE_MGR["QueueManagerService\n• BullMQ Queue Dispatcher\n• Dead-Letter Queue (DLQ) Handler"]:::infra
    STORAGE_SVC["ObjectStorageService\n• S3 / Cloudflare R2 Client\n• Pre-Signed URLs (15m TTL)\n• KMS Server-Side Encryption"]:::infra
  end

  subgraph PERSISTENCE_LAYER["Persistence & Infrastructure Stores"]
    direction LR
    PG_DB[("PostgreSQL 16+\nPrisma ORM · pgvector\nRow-Level Security")]:::data
    REDIS_STORE[("Redis 7+\nSessions · Queues · Cache\nIdempotency Keys")]:::data
    S3_STORE[("S3-Compatible Object Store\nEncrypted Resumes & Docs")]:::data
  end

  subgraph EXTERNAL_TIER["External Services & APIs"]
    direction LR
    AI_PROVIDERS["AI Model APIs\n(Zero-Data Retention)"]:::ext
    JOB_FEEDS["Verified Employer Feeds\n& Partner ATS Webhooks"]:::ext
    NOTIFY_EXT["Resend / Twilio\nTransactional Alerts"]:::ext
    PAY_GATEWAY["Razorpay Payment Gateway\nGST-Compliant Invoicing"]:::ext
  end

  CLIENT_LAYER --> INGRESS_LAYER
  INGRESS_LAYER --> DOMAIN_SERVICES
  INGRESS_LAYER --> AGENT_ORCH

  DOMAIN_SERVICES --> CROSS_CUTTING
  AGENT_ORCH --> TOOL_POLICY
  TOOL_POLICY --> APPROVAL_GW
  AGENT_ORCH --> LLM_ADAPTER
  AGENT_ORCH --> DOMAIN_SERVICES

  DOMAIN_SERVICES --> PERSISTENCE_LAYER
  CROSS_CUTTING --> PERSISTENCE_LAYER

  CROSS_CUTTING --> EXTERNAL_TIER
  DOMAIN_SERVICES --> EXTERNAL_TIER
```
<!-- DIAGRAM:gallery-backend-component-architecture:END -->

---

### Gallery 04: Domain Module Dependencies

- **Purpose:** Modular monolith dependency graph enforcing unidirectional domain service calls decoupled by an in-process EventEmitter2 domain event bus.
- **Canonical Source:** [`docs/architecture/domain-module-dependencies.mmd`](docs/architecture/domain-module-dependencies.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#24-domain-module-dependencies`](docs/architecture/README.md#24-domain-module-dependencies)

<!-- DIAGRAM:gallery-domain-module-dependencies:START -->
```mermaid
flowchart TB
  classDef foundation fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef business fill:#172554,stroke:#3b82f6,stroke-width:1px,color:#dbeafe
  classDef orch fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#e0e7ff
  classDef infra fill:#064e3b,stroke:#10b981,stroke-width:1px,color:#ecfdf5
  classDef event fill:#451a03,stroke:#f59e0b,stroke-width:1px,stroke-dasharray: 4 4,color:#fef3c7

  subgraph ORCHESTRATION["Orchestration Layer"]
    AGENT_MOD["AgentModule\n(Cross-Module Orchestration & Policy)"]:::orch
  end

  subgraph BUSINESS_MODULES["Core Business Modules (Modular Monolith)"]
    direction TB
    CAREER_MOD["CareerModule\n(Diagnostics · Roadmaps · Skills)"]:::business
    JOBS_MOD["JobsModule\n(Job Feeds · Match Engine · Pipeline)"]:::business
    RESUME_MOD["ResumeModule\n(ATS Tailor · Attestation · PDF/DOCX)"]:::business
    INTERVIEW_MOD["InterviewModule\n(Technical Drills · Case Simulator)"]:::business
    FINANCIAL_MOD["FinancialIntelModule\n(CTC Unbundler · Offer Matrix)"]:::business
    PRACTICE_MOD["PracticeModule\n(COP Checklist · Client CRM)"]:::business
  end

  subgraph FOUNDATION_MODULES["Foundation & Security Modules"]
    direction LR
    IDENTITY_MOD["IdentityModule\n(Auth · Users · Tokens)"]:::foundation
    WORKSPACE_MOD["WorkspaceModule\n(Tenancy · RBAC · Isolation)"]:::foundation
    AUDIT_MOD["AuditModule\n(Tamper-Evident WORM Logging)"]:::foundation
    NOTIFY_MOD["NotificationModule\n(Email · WhatsApp Alert Router)"]:::foundation
  end

  subgraph INFRA_MODULES["Shared Infrastructure Modules"]
    direction LR
    PRISMA_MOD["DatabaseModule\n(Prisma ORM · PostgreSQL · pgvector)"]:::infra
    REDIS_MOD["CacheQueueModule\n(Redis 7+ · BullMQ · Distributed Locks)"]:::infra
    LLM_MOD["LlmAdapterModule\n(Universal Provider Adapter · JSON Contracts)"]:::infra
    STORAGE_MOD["StorageModule\n(S3 / R2 Client · Pre-Signed URLs)"]:::infra
  end

  subgraph EVENT_BUS["Decoupled Domain Event Bus"]
    EVENTS["EventEmitter2\n• job.created\n• application.submitted\n• resume.tailored\n• interview.completed\n• approval.requested"]:::event
  end

  %% Orchestration dependencies
  AGENT_MOD -->|"Inspects & Invokes"| BUSINESS_MODULES
  AGENT_MOD --> LLM_MOD
  AGENT_MOD --> WORKSPACE_MOD
  AGENT_MOD --> AUDIT_MOD

  %% Business module cross-dependencies (Strict & Minimal)
  CAREER_MOD --> WORKSPACE_MOD
  CAREER_MOD --> PRISMA_MOD
  CAREER_MOD -.->|"Emits Profile Events"| EVENTS

  JOBS_MOD --> WORKSPACE_MOD
  JOBS_MOD --> PRISMA_MOD
  JOBS_MOD --> REDIS_MOD
  JOBS_MOD -.->|"Emits Job Events"| EVENTS

  RESUME_MOD --> WORKSPACE_MOD
  RESUME_MOD --> PRISMA_MOD
  RESUME_MOD --> STORAGE_MOD
  RESUME_MOD -.->|"Reads Skills"| CAREER_MOD

  INTERVIEW_MOD --> WORKSPACE_MOD
  INTERVIEW_MOD --> PRISMA_MOD
  INTERVIEW_MOD --> LLM_MOD

  FINANCIAL_MOD --> WORKSPACE_MOD
  FINANCIAL_MOD --> PRISMA_MOD

  PRACTICE_MOD --> WORKSPACE_MOD
  PRACTICE_MOD --> PRISMA_MOD

  %% All modules emit to Event Bus
  BUSINESS_MODULES -.->|"Asynchronous Events"| EVENTS
  EVENTS -.->|"Consumes Events"| NOTIFY_MOD
  EVENTS -.->|"Consumes Events"| AUDIT_MOD
  EVENTS -.->|"Enqueues Jobs"| REDIS_MOD

  %% Foundation dependencies
  IDENTITY_MOD --> PRISMA_MOD
  WORKSPACE_MOD --> IDENTITY_MOD
  WORKSPACE_MOD --> PRISMA_MOD
  AUDIT_MOD --> PRISMA_MOD
  NOTIFY_MOD --> REDIS_MOD
```
<!-- DIAGRAM:gallery-domain-module-dependencies:END -->

---

### Gallery 05: AI Agent System Architecture

- **Purpose:** Multi-turn conversational orchestration engine with RAG knowledge grounding, context assembly, prompt injection filtering, and structured JSON output enforcement.
- **Canonical Source:** [`docs/architecture/ai-agent-system.mmd`](docs/architecture/ai-agent-system.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#25-ai-agent-system-architecture`](docs/architecture/README.md#25-ai-agent-system-architecture)

<!-- DIAGRAM:gallery-ai-agent-system:START -->
```mermaid
flowchart TB
  classDef inputNode fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef contextNode fill:#1e1b4b,stroke:#818cf8,stroke-width:1px,color:#e0e7ff
  classDef modelNode fill:#312e81,stroke:#a78bfa,stroke-width:2px,color:#ede9fe
  classDef policyNode fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fef3c7
  classDef execNode fill:#064e3b,stroke:#10b981,stroke-width:1px,color:#ecfdf5
  classDef humanNode fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fecaca
  classDef auditNode fill:#1a2035,stroke:#0ea5e9,stroke-width:1px,color:#bae6fd

  subgraph INPUT_STAGE["1. Ingestion & Pre-Processing"]
    USER_PROMPT["User Prompt / Chat Message\n(Web Application Client)"]:::inputNode
    PROMPT_GUARD["Prompt Guard & Injection Filter\n• Untrusted text sanitization\n• System prompt boundary isolation"]:::inputNode
  end

  subgraph CONTEXT_STAGE["2. Context Assembly & Grounding"]
    direction TB
    WS_RESOLVER["Workspace Context Resolver\n(Enforces Tenant Scope)"]:::contextNode
    PROFILE_LOADER["Candidate Profile & Skill Snapshot\n(Articleship, Preferences, Active Apps)"]:::contextNode
    RAG_STORE["RAG Domain Knowledge Retriever\n(ICAI Curriculum, Ind AS Summaries, Tax FAQs)"]:::contextNode
  end

  subgraph MODEL_STAGE["3. Model Planning & Structured Inference"]
    direction TB
    PROMPT_BUILDER["System Prompt Assembler\n• Persona: CA Career Mentor\n• Rules: ADR-009 Zero-Fabrication"]:::modelNode
    LLM_ROUTER["Universal LLM Provider Adapter\n• Google Gemini Flash/Pro\n• Anthropic Claude 3.5\n• OpenAI GPT-4o"]:::modelNode
    JSON_CONTRACT["Structured Output & Tool Call Parser\n(Strict JSON Schema Validation)"]:::modelNode
  end

  subgraph POLICY_STAGE["4. Policy Evaluation & Permission Gateway"]
    direction TB
    ALLOWLIST["Tool Registry Allowlist Check\n(Verify registered tool identifier)"]:::policyNode
    TIER_ROUTER{"Permission Tier\nRouter"}:::policyNode
    
    TIER_READ["READ_ONLY\nDirect Query Replica / Cache"]:::execNode
    TIER_WRITE["WRITE\nIdempotent DB Transaction"]:::execNode
    TIER_EXT["EXPLICITLY_APPROVED_EXTERNAL\nHuman Confirmation Required"]:::humanNode
    TIER_DEST["DESTRUCTIVE\nStatutory Check + 2-Step Modal"]:::humanNode
  end

  subgraph APPROVAL_STAGE["5. Human-in-the-Loop Gateway"]
    direction TB
    APPROVAL_CARD["Generate ApprovalRequest\n• Signed Token (15m TTL)\n• Action Preview & Diff"]:::humanNode
    USER_MODAL{"User Action\nin Web UI"}:::humanNode
    APPROVE_EXEC["Execute Authorized Action\n(Rate-Limited External Egress)"]:::execNode
    DECLINE_ABORT["Abort & Record Rejection\n(Zero External Call)"]:::humanNode
  end

  subgraph OUTPUT_STAGE["6. Output Sanitization & Telemetry"]
    direction TB
    REDACT_OUT["PII Redaction & Provenance Verifier\n(Ensures No Fabricated Credentials)"]:::auditNode
    STREAM_RESP["Stream Response to Web UI\n(SSE / Markdown Assistant Message)"]:::auditNode
    AUDIT_SINK["Immutable Audit Event Stream\n(CorrelationId · Actor · Tool · Status)"]:::auditNode
  end

  USER_PROMPT --> PROMPT_GUARD
  PROMPT_GUARD --> WS_RESOLVER
  WS_RESOLVER --> PROFILE_LOADER
  WS_RESOLVER --> RAG_STORE

  PROFILE_LOADER --> PROMPT_BUILDER
  RAG_STORE --> PROMPT_BUILDER
  PROMPT_BUILDER --> LLM_ROUTER
  LLM_ROUTER --> JSON_CONTRACT

  JSON_CONTRACT -->|Plain Text| REDACT_OUT
  JSON_CONTRACT -->|Tool Call| ALLOWLIST
  ALLOWLIST --> TIER_ROUTER

  TIER_ROUTER -->|READ_ONLY| TIER_READ
  TIER_ROUTER -->|WRITE| TIER_WRITE
  TIER_ROUTER -->|APPROVED EXTERNAL| TIER_EXT
  TIER_ROUTER -->|DESTRUCTIVE| TIER_DEST

  TIER_EXT --> APPROVAL_CARD
  APPROVAL_CARD --> USER_MODAL
  USER_MODAL -->|Confirmed| APPROVE_EXEC
  USER_MODAL -->|Declined / Timeout| DECLINE_ABORT

  TIER_READ --> REDACT_OUT
  TIER_WRITE --> REDACT_OUT
  APPROVE_EXEC --> REDACT_OUT
  DECLINE_ABORT --> REDACT_OUT
  TIER_DEST --> REDACT_OUT

  REDACT_OUT --> STREAM_RESP
  REDACT_OUT --> AUDIT_SINK
```
<!-- DIAGRAM:gallery-ai-agent-system:END -->

---

### Gallery 06: Agent Execution Flow

- **Purpose:** Deterministic 4-tier permission router partitioning tools into READ_ONLY, WRITE, EXPLICITLY_APPROVED_EXTERNAL, and DESTRUCTIVE with distributed locks and idempotency.
- **Canonical Source:** [`docs/architecture/agent-execution-flow.mmd`](docs/architecture/agent-execution-flow.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#26-ai-agent-permission--execution-flow`](docs/architecture/README.md#26-ai-agent-permission--execution-flow)

<!-- DIAGRAM:gallery-agent-execution-flow:START -->
```mermaid
flowchart TD
  classDef reqNode fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#bfdbfe,font-weight:bold
  classDef authNode fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#c7d2fe
  classDef policyNode fill:#1c1917,stroke:#f59e0b,stroke-width:2px,color:#fde68a
  classDef readNode fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#bbf7d0
  classDef writeNode fill:#1e3a5f,stroke:#3b82f6,stroke-width:2px,color:#bfdbfe
  classDef extNode fill:#3b1f00,stroke:#f97316,stroke-width:2px,color:#fed7aa
  classDef destNode fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fca5a5
  classDef auditNode fill:#0c1425,stroke:#0ea5e9,stroke-width:2px,color:#bae6fd
  classDef errorNode fill:#3b0764,stroke:#a855f7,stroke-width:2px,color:#e9d5ff
  classDef cacheNode fill:#1a2e1a,stroke:#4ade80,stroke-width:2px,color:#bbf7d0
  classDef userNode fill:#0f2027,stroke:#06b6d4,stroke-width:2px,color:#a5f3fc
  classDef successNode fill:#052e16,stroke:#16a34a,stroke-width:2px,color:#bbf7d0

  USER(["User / AI Agent Tool Call Request"]):::userNode

  AUTH{"Step 1: Authenticate\nJWT Validation"}:::authNode
  AUTH_FAIL(["401 Unauthorized\nInvalid / Expired Token"]):::errorNode

  WS_AUTH{"Step 2: Workspace Auth\nScope & Membership Check"}:::authNode
  WS_FAIL(["403 Forbidden\nWorkspace Access Denied"]):::errorNode

  TOOL_ALLOW{"Step 3: Tool Allowlist\nCheck Tool Registry"}:::policyNode
  TOOL_DENY(["403 Forbidden\nTool Not in Allowlist"]):::errorNode

  SCHEMA_VAL{"Step 4: Schema Validation\nStrict Zod Parse"}:::policyNode
  SCHEMA_FAIL(["400 Bad Request\nMalformed Tool Payload"]):::errorNode

  RATE_CHECK{"Step 5: Rate Limiting\nRedis Token Bucket"}:::policyNode
  RATE_FAIL(["429 Too Many Requests\nRate Limit Exceeded"]):::errorNode

  PERM_ROUTER{"Step 6: Permission\nTier Router"}:::policyNode

  subgraph READ_PATH["READ_ONLY Path (Zero State Mutation)"]
    direction TB
    READ_OPS["Tools: get_user_profile · search_jobs\nget_application_status · get_skill_gap_report"]:::readNode
    READ_CACHE{"Cache Hit in Redis?"}:::cacheNode
    READ_DB["Query DB Replica\nScoped by Workspace ID"]:::readNode
    READ_CACHE_STORE["Cache Sanitized Result (TTL)"]:::cacheNode
  end

  subgraph WRITE_PATH["WRITE Path (Controlled State Mutation)"]
    direction TB
    WRITE_OPS["Tools: create_career_task · update_user_preferences\nsave_job · create_resume_draft"]:::writeNode
    IDEMPOTENCY{"Idempotency Key\nExists in Redis/DB?"}:::cacheNode
    IDEMPOTENCY_REPLAY["Replay Cached Result\n(Prevent Duplicate Writes)"]:::cacheNode
    IDEMPOTENCY_GEN["Generate Distributed Lock\n& Record Key (PROCESSING)"]:::cacheNode
    TXN_EXEC["Execute DB Transaction\n(Prisma + PostgreSQL)"]:::writeNode
    TXN_FAIL(["Transaction Failed\nRollback & Release Lock"]):::errorNode
    IDEMPOTENCY_MARK["Mark Key COMPLETED\nCache Output (24h TTL)"]:::cacheNode
  end

  subgraph EXT_PATH["EXPLICITLY APPROVED EXTERNAL Actions"]
    direction TB
    EXT_OPS["Tools: submit_job_application\nsend_recruiter_message · book_paid_mentorship"]:::extNode
    APPROVAL_CARD["Create ApprovalRequest\nGenerate 15-Minute Signed Token"]:::extNode
    USER_GATE{"Human-in-the-Loop Gate\nUser Action in UI?"}:::extNode
    EXT_EXPIRED(["Approval Expired\n15m TTL Elapsed without Confirmation"]):::errorNode
    EXT_CANCELLED(["Approval Cancelled\nUser Explicitly Rejected Action"]):::errorNode
    EXT_IDEM{"Idempotency Check\nExternal Call Signature"}:::cacheNode
    EXT_EXEC["Execute External Integration\nRate-Limited Egress via Worker"]:::extNode
    EXT_FAIL(["External Service Failed\nEnqueue Dead-Letter / Alert"]):::errorNode
  end

  subgraph DEST_PATH["DESTRUCTIVE Path (Confirmed Deletion)"]
    direction TB
    DEST_OPS["Tools: delete_resume_version\nremove_saved_personal_document · delete_user_data"]:::destNode
    RETENTION_CHECK{"Statutory Legal\nRetention Active?"}:::destNode
    RETENTION_BLOCK(["Deletion Blocked\nStatutory Retention Mandated"]):::errorNode
    CONFIRM_MODAL["Display Two-Step Warning Modal\nRequire Explicit Confirmation"]:::destNode
    DEST_DECISION{"User Confirmed?"}:::destNode
    DEST_CANCEL(["Deletion Cancelled by User"]):::errorNode
    SOFT_DELETE["Soft-Delete Record\nWrite Tombstone & Set 30d Purge Queue"]:::destNode
  end

  subgraph AUDIT_LAYER["Telemetry & Audit Layer (All Execution Outcomes)"]
    direction LR
    AUDIT_EVENT["Immutable Audit Event:\nactorId · workspaceId · toolName · outcome\ncorrelationId · durationMs · timestamp"]:::auditNode
    PRIVACY_FILTER["Privacy Redaction Filter:\nSHA-256 Payload Hashes Only\nZero PII · Zero Raw Resume Text · Zero Tokens"]:::auditNode
    METRICS_EMIT["Emit Prometheus Metrics\n& Alert on Anomalies"]:::auditNode
  end

  SUCCESS(["Return Success Result to Caller"]):::successNode

  USER --> AUTH
  AUTH -- "Invalid" --> AUTH_FAIL
  AUTH -- "Valid" --> WS_AUTH
  WS_AUTH -- "Unauthorized" --> WS_FAIL
  WS_AUTH -- "Authorized" --> TOOL_ALLOW
  TOOL_ALLOW -- "Denied" --> TOOL_DENY
  TOOL_ALLOW -- "Allowed" --> SCHEMA_VAL
  SCHEMA_VAL -- "Invalid" --> SCHEMA_FAIL
  SCHEMA_VAL -- "Valid" --> RATE_CHECK
  RATE_CHECK -- "Exceeded" --> RATE_FAIL
  RATE_CHECK -- "Within Quota" --> PERM_ROUTER

  PERM_ROUTER -- "READ_ONLY" --> READ_OPS
  PERM_ROUTER -- "WRITE" --> WRITE_OPS
  PERM_ROUTER -- "APPROVED EXTERNAL" --> EXT_OPS
  PERM_ROUTER -- "DESTRUCTIVE" --> DEST_OPS

  READ_OPS --> READ_CACHE
  READ_CACHE -- "Hit" --> SUCCESS
  READ_CACHE -- "Miss" --> READ_DB
  READ_DB --> READ_CACHE_STORE --> SUCCESS

  WRITE_OPS --> IDEMPOTENCY
  IDEMPOTENCY -- "Exists (Cached)" --> IDEMPOTENCY_REPLAY --> SUCCESS
  IDEMPOTENCY -- "New Operation" --> IDEMPOTENCY_GEN
  IDEMPOTENCY_GEN --> TXN_EXEC
  TXN_EXEC -- "Error" --> TXN_FAIL
  TXN_EXEC -- "Success" --> IDEMPOTENCY_MARK --> SUCCESS

  EXT_OPS --> APPROVAL_CARD
  APPROVAL_CARD --> USER_GATE
  USER_GATE -- "User Declined" --> EXT_CANCELLED
  USER_GATE -- "Token Expired" --> EXT_EXPIRED
  USER_GATE -- "User Approved" --> EXT_IDEM
  EXT_IDEM -- "Duplicate" --> IDEMPOTENCY_REPLAY
  EXT_IDEM -- "New" --> EXT_EXEC
  EXT_EXEC -- "Error" --> EXT_FAIL
  EXT_EXEC -- "Success" --> SUCCESS

  DEST_OPS --> RETENTION_CHECK
  RETENTION_CHECK -- "Retention Mandated" --> RETENTION_BLOCK
  RETENTION_CHECK -- "Permitted" --> CONFIRM_MODAL
  CONFIRM_MODAL --> DEST_DECISION
  DEST_DECISION -- "Declined" --> DEST_CANCEL
  DEST_DECISION -- "Confirmed" --> SOFT_DELETE
  SOFT_DELETE --> SUCCESS

  SUCCESS --> AUDIT_EVENT
  AUTH_FAIL --> AUDIT_EVENT
  WS_FAIL --> AUDIT_EVENT
  TOOL_DENY --> AUDIT_EVENT
  SCHEMA_FAIL --> AUDIT_EVENT
  RATE_FAIL --> AUDIT_EVENT
  TXN_FAIL --> AUDIT_EVENT
  EXT_EXPIRED --> AUDIT_EVENT
  EXT_CANCELLED --> AUDIT_EVENT
  EXT_FAIL --> AUDIT_EVENT
  RETENTION_BLOCK --> AUDIT_EVENT
  DEST_CANCEL --> AUDIT_EVENT

  AUDIT_EVENT --> PRIVACY_FILTER --> METRICS_EMIT
```
<!-- DIAGRAM:gallery-agent-execution-flow:END -->

---

### Gallery 07: Human Approval Sequence

- **Purpose:** Interactive browser confirmation sequence generating 15-minute HMAC-signed approval tokens for high-stakes external actions.
- **Canonical Source:** [`docs/architecture/human-approval-sequence.mmd`](docs/architecture/human-approval-sequence.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#27-human-in-the-loop-approval-sequence`](docs/architecture/README.md#27-human-in-the-loop-approval-sequence)

<!-- DIAGRAM:gallery-human-approval-sequence:START -->
```mermaid
sequenceDiagram
  autonumber
  actor Candidate as Candidate (Browser UI)
  participant WebApp as Next.js Web App
  participant Gateway as API Gateway & Guards
  participant Agent as Agent Orchestrator
  participant ApprovalGW as Approval Gateway Service
  participant Redis as Redis (State & Locks)
  participant ExtService as External Egress / Worker
  participant Audit as Audit Logging Service

  Note over Candidate, Agent: User requests an external side-effect via chat
  Candidate->>WebApp: "Submit my application to KPMG Statutory Audit"
  WebApp->>Gateway: POST /api/v1/agent/chat (JWT, workspaceId)
  Gateway->>Agent: Process prompt in workspace context
  Agent->>Agent: LLM generates tool call: submit_job_application
  Agent->>ApprovalGW: Evaluate tool: submit_job_application (EXPLICITLY_APPROVED_EXTERNAL)

  Note over ApprovalGW, Redis: Generate 15-Minute Signed Token & Approval Card
  ApprovalGW->>ApprovalGW: Create ApprovalRequest (id, payload, diff)
  ApprovalGW->>Redis: SET approval:{id} (data, status=PENDING, EX=900s)
  ApprovalGW-->>Agent: Return ApprovalRequest metadata
  Agent-->>Gateway: Return assistant message with interactive Approval Card
  Gateway-->>WebApp: Stream response + Approval Card component
  WebApp-->>Candidate: Display Approval Card in Chat UI (Preview resume, job details, 15m countdown)

  alt Case A: Candidate Explicitly Approves
    Candidate->>WebApp: Click "Confirm & Submit Application"
    WebApp->>Gateway: POST /api/v1/approvals/{id}/confirm (Idempotency-Key, SignedToken)
    Gateway->>ApprovalGW: Verify token, workspace scope, and idempotency
    ApprovalGW->>Redis: Check approval:{id} status & acquire Redlock (30s)
    Redis-->>ApprovalGW: Lock acquired, status valid
    ApprovalGW->>ExtService: Enqueue / Execute application submission
    ExtService-->>ApprovalGW: Submission acknowledged (ExternalRef ID)
    ApprovalGW->>Redis: Update approval:{id} (status=COMPLETED), store result
    ApprovalGW->>Audit: Log AuditEvent (tool=submit_job_application, outcome=SUCCESS)
    ApprovalGW-->>Gateway: Return 200 OK (Submission confirmed)
    Gateway-->>WebApp: HTTP 200 (Success payload)
    WebApp-->>Candidate: Update UI: "Application Submitted Successfully!"

  else Case B: Candidate Declines Action
    Candidate->>WebApp: Click "Decline"
    WebApp->>Gateway: POST /api/v1/approvals/{id}/decline
    Gateway->>ApprovalGW: Process cancellation
    ApprovalGW->>Redis: Update approval:{id} (status=CANCELLED)
    ApprovalGW->>Audit: Log AuditEvent (outcome=CANCELLED)
    ApprovalGW-->>WebApp: 200 OK (Cancelled)
    WebApp-->>Candidate: Update UI: "Action cancelled. No application submitted."

  else Case C: Expiration (15-Minute TTL Elapses)
    Note over Redis, ApprovalGW: TTL 900s expires in Redis
    Candidate->>WebApp: Attempts to click confirm after timeout
    WebApp->>Gateway: POST /api/v1/approvals/{id}/confirm
    Gateway->>ApprovalGW: Check approval token
    ApprovalGW->>Redis: GET approval:{id} -> Key Expired / Null
    ApprovalGW-->>Gateway: 410 Gone / 400 Expired
    Gateway-->>WebApp: Error: "Approval request expired. Please re-initiate."
    WebApp-->>Candidate: Display: "Request Expired. Please ask the agent again."
    ApprovalGW->>Audit: Log AuditEvent (outcome=EXPIRED)
  end
```
<!-- DIAGRAM:gallery-human-approval-sequence:END -->

---

### Gallery 08: Candidate User Journey

- **Purpose:** End-to-end candidate lifecycle diagram tracing progression across both corporate employment and independent public practice pathways.
- **Canonical Source:** [`docs/architecture/user-journey.mmd`](docs/architecture/user-journey.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#28-candidate-dual-pathway-user-journey`](docs/architecture/README.md#28-candidate-dual-pathway-user-journey)

<!-- DIAGRAM:gallery-user-journey:START -->
```mermaid
flowchart TD
  classDef milestone fill:#1e293b,stroke:#3b82f6,color:#bfdbfe,font-weight:bold
  classDef action    fill:#0f172a,stroke:#64748b,color:#94a3b8
  classDef ai        fill:#312e81,stroke:#6366f1,color:#c7d2fe
  classDef alt       fill:#1c1917,stroke:#d97706,color:#fde68a
  classDef decision  fill:#1e1b4b,stroke:#8b5cf6,color:#ddd6fe

  %% ─── Main Journey ──────────────────────────────────────
  START(["🎓 CA Final Cleared\nor Newly Qualified CA"]):::milestone

  ONBOARD["📋 Onboarding & Profile Setup\n• Qualification details · Articleship area\n• Preferred city · Work type\n• Role interest · Salary expectation"]:::action

  CAREER_DISC["🧭 Career Intelligence\n• AI path recommendations\n• 6 domain pathway options\n• Peer cohort comparison (anonymous)"]:::ai

  SKILL_GAP["📊 Skill-Gap Analysis\n• Role-specific skill inventory\n• Articleship vs. target role delta\n• Prioritised learning plan"]:::ai

  PATH_CHOICE{"Which path?"}:::decision

  %% ─── Employment Path ────────────────────────────────────
  subgraph EMPLOYMENT["💼 Employment Path"]
    direction TB
    JOB_MATCH["🔍 Job Matching\n• Semantic search + score\n• Freshness verified\n• Explainable match reason"]:::ai
    RESUME_TAILOR["📄 Resume Tailoring\n• ATS-optimised per role\n• Verified claims only\n• Cover letter generation"]:::ai
    APP_TRACK["📌 Application Tracking\n• Status per application\n• Follow-up reminders\n• Recruiter interactions"]:::action
    INTERVIEW_PREP["🎤 Interview Preparation\n• Role-specific question bank\n• Mock interview sessions\n• Feedback & progress score"]:::ai
    OFFER_COMPARE["💰 Offer Comparison\n• CTC breakdown\n• Fixed vs. variable analysis\n• Benefits normalisation"]:::action
    JOB_ACCEPT["✅ Job Selection\n• Approved submission\n• Offer letter storage\n• Onboarding checklist"]:::action
    FIRST_90["🚀 First 90 Days\n• Role-specific milestones\n• Learning tasks\n• Mentor access"]:::action
    LONG_TERM["📈 Long-Term Growth\n• Skill upgrades\n• Role re-assessment\n• Community & alumni"]:::action
  end

  %% ─── Practice Path ───────────────────────────────────────
  subgraph PRACTICE["🏢 Independent Practice Path"]
    direction TB
    POST_QUAL["📋 Post-Qualification Checklist\n• ICAI membership steps\n• COP application guidance\n• Official resource links"]:::alt
    PRACTICE_SETUP["⚙️ Practice Setup\n• Office, branding, tools\n• GST, Income Tax registrations\n• Professional indemnity"]:::alt
    CLIENT_CRM["👥 Client Onboarding\n• Engagement letters\n• KYC & document requests\n• Task & deadline reminders"]:::alt
    PRACTICE_GROW["📊 Practice Growth\n• Service expansion planning\n• Staff & partner onboarding\n• Compliance calendar"]:::alt
  end

  %% ─── Flows ─────────────────────────────────────────────
  START --> ONBOARD
  ONBOARD --> CAREER_DISC
  CAREER_DISC --> SKILL_GAP
  SKILL_GAP --> PATH_CHOICE

  PATH_CHOICE -- "Employment" --> JOB_MATCH
  JOB_MATCH --> RESUME_TAILOR
  RESUME_TAILOR --> APP_TRACK
  APP_TRACK --> INTERVIEW_PREP
  INTERVIEW_PREP --> OFFER_COMPARE
  OFFER_COMPARE --> JOB_ACCEPT
  JOB_ACCEPT --> FIRST_90
  FIRST_90 --> LONG_TERM
  LONG_TERM -- "Career pivot\nor advancement" --> CAREER_DISC

  PATH_CHOICE -- "Independent Practice" --> POST_QUAL
  POST_QUAL --> PRACTICE_SETUP
  PRACTICE_SETUP --> CLIENT_CRM
  CLIENT_CRM --> PRACTICE_GROW
  PRACTICE_GROW -- "Add employment\noption later" --> PATH_CHOICE

  %% ─── AI Agent Runs Throughout ───────────────────────────
  AI_AGENT["🤖 AI Career Agent\nAvailable at every stage\nREAD · WRITE · Approved external\nNever acts without permission"]:::ai
  AI_AGENT -.->|"assists"| CAREER_DISC
  AI_AGENT -.->|"assists"| SKILL_GAP
  AI_AGENT -.->|"assists"| JOB_MATCH
  AI_AGENT -.->|"assists"| RESUME_TAILOR
  AI_AGENT -.->|"assists"| INTERVIEW_PREP
  AI_AGENT -.->|"assists"| OFFER_COMPARE
  AI_AGENT -.->|"assists"| FIRST_90
```
<!-- DIAGRAM:gallery-user-journey:END -->

---

### Gallery 09: Job Ingestion Pipeline

- **Purpose:** Automated ingestion pipeline for verified feeds enforcing schema normalization, SHA-256 deduplication, 30-day freshness expiry, and vector embeddings generation.
- **Canonical Source:** [`docs/architecture/job-ingestion-pipeline.mmd`](docs/architecture/job-ingestion-pipeline.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#29-job-ingestion-pipeline`](docs/architecture/README.md#29-job-ingestion-pipeline)

<!-- DIAGRAM:gallery-job-ingestion-pipeline:START -->
```mermaid
flowchart TB
  classDef source fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef norm fill:#1e1b4b,stroke:#818cf8,stroke-width:1px,color:#e0e7ff
  classDef dedup fill:#312e81,stroke:#a78bfa,stroke-width:2px,color:#ede9fe
  classDef embed fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5
  classDef store fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#bbf7d0
  classDef alert fill:#451a03,stroke:#f59e0b,stroke-width:1px,color:#fef3c7

  subgraph SOURCES["1. Ingestion Sources (Verified Only)"]
    direction LR
    SRC_EMPLOYER["Direct Recruiter Postings\n(Verified Org Workspaces)"]:::source
    SRC_WEBHOOKS["Partner ATS Webhooks\n(Greenhouse · Lever · Darwinbox)"]:::source
    SRC_FEEDS["Authorized Partner Feeds\n(Signed API Integrations)"]:::source
  end

  subgraph STAGE_NORM["2. Normalization & Validation Stage"]
    direction TB
    VALIDATE_SOURCE["Source Authenticator\n• HMAC Signature Verification\n• Source Attribution Tagging"]:::norm
    SCHEMA_NORM["Job Schema Normalizer\n• Standardize Titles & CA Pathways\n• Indian CTC Bounds (Fixed/Variable)\n• City & Work Mode Normalization"]:::norm
  end

  subgraph STAGE_DEDUP["3. Deduplication & Freshness Engine"]
    direction TB
    FINGERPRINT["Generate Job Fingerprint\nSHA-256(Company + NormalizedTitle + City)"]:::dedup
    DEDUP_CHECK{"Duplicate Fingerprint\nin Last 30 Days?"}:::dedup
    DROP_DUP["Discard Duplicate Listing\n(Update Existing Timestamp Only)"]:::dedup
    FRESH_RULE["Apply Freshness Policy\n• Set 30-Day Auto-Expiration Date\n• Flag Stale External Listings"]:::dedup
  end

  subgraph STAGE_EMBED["4. Semantic Embedding & Vectorization"]
    direction TB
    ENQUEUE_EMBED["Enqueue to BullMQ\n(vector-embedding-queue)"]:::embed
    LLM_EMBED["Embedding Worker\n• Generate 1536-Dim Vector\n• Domain Skill Token Extraction"]:::embed
  end

  subgraph STAGE_PERSIST["5. Dual Relational & Vector Persistence"]
    direction LR
    PG_RELATIONAL[("PostgreSQL\nJob & JobSource Records\nStatus: ACTIVE")]:::store
    PG_FTS[("PostgreSQL FTS\nGIN Index on Title & Skills")]:::store
    PG_VECTOR[("pgvector HNSW Index\nCosine Distance Metric")]:::store
  end

  subgraph STAGE_ALERT["6. Matching & Candidate Notification"]
    direction TB
    MATCH_WORKER["Hybrid Match Evaluator\n(Reciprocal Rank Fusion RRF)"]:::alert
    CAND_ALERTS["Dispatch Candidate Alerts\n(Email / In-App Notification)"]:::alert
  end

  SOURCES --> VALIDATE_SOURCE
  VALIDATE_SOURCE --> SCHEMA_NORM
  SCHEMA_NORM --> FINGERPRINT
  FINGERPRINT --> DEDUP_CHECK

  DEDUP_CHECK -- "Duplicate Found" --> DROP_DUP
  DEDUP_CHECK -- "Unique Job" --> FRESH_RULE

  FRESH_RULE --> ENQUEUE_EMBED
  ENQUEUE_EMBED --> LLM_EMBED

  LLM_EMBED --> PG_RELATIONAL
  LLM_EMBED --> PG_FTS
  LLM_EMBED --> PG_VECTOR

  PG_RELATIONAL --> MATCH_WORKER
  PG_VECTOR --> MATCH_WORKER
  MATCH_WORKER --> CAND_ALERTS
```
<!-- DIAGRAM:gallery-job-ingestion-pipeline:END -->

---

### Gallery 10: Job Application Lifecycle State Machine

- **Purpose:** Finite state machine governing job applications from discovery, resume attestation, and draft status to interview scheduling and offer comparison.
- **Canonical Source:** [`docs/architecture/job-application-workflow.mmd`](docs/architecture/job-application-workflow.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#210-job-application-lifecycle-state-machine`](docs/architecture/README.md#210-job-application-lifecycle-state-machine)

<!-- DIAGRAM:gallery-job-application-workflow:START -->
```mermaid
stateDiagram-v2
  [*] --> JobDiscovered : Job ingested from source

  state JobDiscovered {
    [*] --> Normalising
    Normalising --> Deduplicating
    Deduplicating --> FreshnessVerified
    FreshnessVerified --> Indexed
    Indexed --> [*]
  }

  JobDiscovered --> Available : Passes quality checks

  state Available {
    direction LR
    [*] --> Searchable
    Searchable --> SavedByCandidate : Candidate saves job
    Searchable --> AlertSent : Matches job alert
  }

  SavedByCandidate --> ResumeVersionSelected : Candidate picks resume
  AlertSent --> ResumeVersionSelected

  state ResumeVersionSelected {
    [*] --> SelectingVersion
    SelectingVersion --> Tailoring : Candidate requests tailoring
    Tailoring --> TailoredDraftReady
    TailoredDraftReady --> CandidateReviewing
    CandidateReviewing --> ApprovedForApplication : Candidate approves
    CandidateReviewing --> Tailoring : Revise
  }

  ApprovedForApplication --> EligibilityCheck

  state EligibilityCheck {
    [*] --> CheckingRequirements
    CheckingRequirements --> EligibilityMet : Requirements met
    CheckingRequirements --> EligibilityWarning : Partial match
    CheckingRequirements --> EligibilityFailed : Hard requirement missing
    EligibilityWarning --> CandidateProceedsAnyway : User explicitly continues
    EligibilityFailed --> [*] : Blocked — inform candidate
  }

  EligibilityMet --> PendingExplicitApproval
  CandidateProceedsAnyway --> PendingExplicitApproval

  state PendingExplicitApproval {
    [*] --> ShowingApprovalDialog
    ShowingApprovalDialog --> UserConfirmed : "Submit Application" clicked
    ShowingApprovalDialog --> UserDeclined : Cancelled or timeout
    UserDeclined --> [*]
  }

  UserConfirmed --> IdempotencyCheck

  state IdempotencyCheck {
    [*] --> CheckingKey
    CheckingKey --> DuplicateDetected : Key already exists
    CheckingKey --> NewSubmission : First attempt
    DuplicateDetected --> ReplayingResult
    ReplayingResult --> [*]
  }

  NewSubmission --> ApplicationSubmitted : External action via service

  ApplicationSubmitted --> Tracking

  state Tracking {
    direction LR
    [*] --> Applied
    Applied --> AcknowledgedByEmployer : Employer viewed
    Applied --> NoResponse
    AcknowledgedByEmployer --> InterviewInvited
    AcknowledgedByEmployer --> Rejected
    InterviewInvited --> InterviewPrepStarted
    InterviewPrepStarted --> InterviewCompleted
    InterviewCompleted --> OfferReceived
    InterviewCompleted --> Rejected
    NoResponse --> FollowUpSent : Reminder triggered
    FollowUpSent --> AcknowledgedByEmployer
    FollowUpSent --> NoResponseFinal
  }

  OfferReceived --> OfferComparison
  Rejected --> PostMortemFeedback
  NoResponseFinal --> Archived

  state OfferComparison {
    [*] --> CTCAnalysis
    CTCAnalysis --> BenefitsNormalisation
    BenefitsNormalisation --> ComparisonReady
  }

  OfferComparison --> Accepted : Candidate accepts
  OfferComparison --> Declined : Candidate declines

  Accepted --> OfferLetterStored
  Declined --> Archived
  PostMortemFeedback --> Archived

  OfferLetterStored --> [*]
  Archived --> [*]
```
<!-- DIAGRAM:gallery-job-application-workflow:END -->

---

### Gallery 11: Database Architecture (ERD)

- **Purpose:** Relational entity-relationship model comprising 21 core entities, multi-tenant workspace ownership, foreign key relationships, and HNSW vector indexes.
- **Canonical Source:** [`docs/architecture/data-architecture.mmd`](docs/architecture/data-architecture.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#211-database-entity-relationship-diagram`](docs/architecture/README.md#211-database-entity-relationship-diagram)

<!-- DIAGRAM:gallery-data-architecture:START -->
```mermaid
erDiagram
  %% ─── Tenant & Identity ──────────────────────────────────────────
  User {
    uuid id PK
    string email UK
    string hashedPassword "bcrypt, never plain"
    string firstName
    string lastName
    enum role "CANDIDATE | RECRUITER | MENTOR | ORG_ADMIN | PLATFORM_ADMIN"
    boolean emailVerified
    timestamp createdAt
    timestamp updatedAt
    timestamp deletedAt "soft delete"
  }

  Workspace {
    uuid id PK
    enum type "PERSONAL | ORGANIZATION"
    string name
    string slug UK
    uuid ownerId FK
    jsonb settings
    timestamp createdAt
  }

  WorkspaceMembership {
    uuid id PK
    uuid workspaceId FK
    uuid userId FK
    enum memberRole "OWNER | ADMIN | MEMBER | RECRUITER | VIEWER"
    boolean isDefault
    timestamp joinedAt
  }

  Subscription {
    uuid id PK
    uuid workspaceId FK
    enum plan "FREE | PRO | TEAM | ENTERPRISE"
    enum status "ACTIVE | PAST_DUE | CANCELLED | TRIALING"
    string externalSubscriptionId "Payment gateway ref"
    timestamp currentPeriodEnd
    timestamp createdAt
  }

  %% ─── Candidate Profile ──────────────────────────────────────────
  CandidateProfile {
    uuid id PK
    uuid userId FK
    uuid workspaceId FK
    string icaiMembershipNo "Optional, user-provided"
    date qualificationDate
    string articleshipFirm
    string_array articleshipAreas
    string_array targetCities
    enum workType "FULL_TIME | PART_TIME | CONSULTING | PRACTICE"
    integer targetSalaryMin
    integer targetSalaryMax
    string summary
    timestamp updatedAt
  }

  CareerPreference {
    uuid id PK
    uuid candidateProfileId FK
    string_array preferredDomains
    string_array preferredRoles
    string_array preferredSectors
    integer noticePeriodDays
    boolean openToRelocation
    jsonb additionalPreferences
    timestamp updatedAt
  }

  Skill {
    uuid id PK
    string name UK
    string category "domain | tool | soft"
    string normalizedName
  }

  CandidateSkill {
    uuid id PK
    uuid candidateProfileId FK
    uuid skillId FK
    enum proficiency "BEGINNER | INTERMEDIATE | ADVANCED | EXPERT"
    string source "articleship | self-declared | assessed"
    boolean verified
    timestamp addedAt
  }

  SkillGapReport {
    uuid id PK
    uuid candidateProfileId FK
    string targetRole
    jsonb gapAnalysis "required vs present skills"
    jsonb learningPlan
    timestamp generatedAt
    timestamp expiresAt
  }

  %% ─── Jobs & Employers ───────────────────────────────────────────
  Employer {
    uuid id PK
    uuid workspaceId FK "org workspace"
    string name
    string domain UK
    boolean verified
    enum verificationStatus "PENDING | VERIFIED | SUSPENDED"
    string logoUrl "object storage path"
    timestamp verifiedAt
  }

  JobSource {
    uuid id PK
    string name UK
    string type "DIRECT_API | EMPLOYER_FEED | PLATFORM"
    string baseUrl
    boolean active
    jsonb integrationCapabilityCheck "documented at setup time"
    timestamp lastFetchedAt
  }

  Job {
    uuid id PK
    uuid employerId FK
    uuid jobSourceId FK
    string externalId "source-specific ID"
    string title
    string normalizedTitle
    text description
    string_array requiredSkills
    string_array preferredSkills
    string location
    enum workMode "ON_SITE | HYBRID | REMOTE"
    integer salaryMin
    integer salaryMax
    string currency "INR"
    enum status "ACTIVE | EXPIRED | FILLED | REMOVED"
    timestamp postedAt
    timestamp expiresAt
    timestamp lastVerifiedAt
    vector embedding "pgvector 1536-dim"
    timestamp createdAt
  }

  JobMatch {
    uuid id PK
    uuid jobId FK
    uuid candidateProfileId FK
    float matchScore "0.0–1.0"
    jsonb matchReasons "explainable factors"
    boolean shownToCandidate
    timestamp calculatedAt
  }

  %% ─── Resume & Branding ──────────────────────────────────────────
  Resume {
    uuid id PK
    uuid candidateProfileId FK
    uuid workspaceId FK
    string title
    boolean isDefault
    timestamp createdAt
  }

  ResumeVersion {
    uuid id PK
    uuid resumeId FK
    integer versionNumber
    string objectStoragePath "S3 path — access-controlled"
    enum format "PDF | DOCX"
    boolean isTailored
    uuid tailoredForJobId FK "nullable"
    string atsScore "provider-generated, nullable"
    enum status "DRAFT | APPROVED | ARCHIVED | DELETED"
    timestamp createdAt
    timestamp deletedAt "soft delete"
  }

  %% ─── Applications ───────────────────────────────────────────────
  Application {
    uuid id PK
    uuid candidateProfileId FK
    uuid jobId FK
    uuid resumeVersionId FK
    enum status "SAVED | APPLIED | ACKNOWLEDGED | INTERVIEWING | OFFERED | ACCEPTED | REJECTED | WITHDRAWN | ARCHIVED"
    string appliedVia "platform | direct"
    boolean submittedByPlatform
    timestamp appliedAt
    timestamp statusUpdatedAt
    timestamp followUpAt
    text notes "candidate personal notes"
  }

  ApprovalRequest {
    uuid id PK
    uuid userId FK
    uuid workspaceId FK
    string toolName "submit_job_application | send_recruiter_message | book_paid_mentorship"
    jsonb actionPayload
    enum status "PENDING | APPROVED | DENIED | EXPIRED"
    string correlationId
    timestamp requestedAt
    timestamp resolvedAt
    timestamp expiresAt
  }

  %% ─── Interviews & Learning ──────────────────────────────────────
  InterviewSession {
    uuid id PK
    uuid candidateProfileId FK
    uuid jobId FK "nullable — may be general practice"
    string domain
    enum mode "TEXT | VOICE"
    enum status "IN_PROGRESS | COMPLETED | ABANDONED"
    integer durationSeconds
    timestamp startedAt
    timestamp endedAt
  }

  InterviewFeedback {
    uuid id PK
    uuid sessionId FK
    jsonb questionAnswerPairs "synthetic/licensed data only"
    jsonb scores "technical | communication | structure"
    text overallFeedback
    string_array improvementAreas
    timestamp generatedAt
  }

  LearningTask {
    uuid id PK
    uuid candidateProfileId FK
    uuid skillGapReportId FK "nullable"
    string title
    text description
    string resourceUrl "licensed or official source"
    enum status "TODO | IN_PROGRESS | COMPLETED | SKIPPED"
    timestamp dueDate
    timestamp completedAt
  }

  %% ─── Mentorship ─────────────────────────────────────────────────
  MentorBooking {
    uuid id PK
    uuid mentorUserId FK
    uuid candidateUserId FK
    enum status "PENDING | CONFIRMED | COMPLETED | CANCELLED"
    timestamp scheduledAt
    integer durationMinutes
    string meetingLink "nullable"
    boolean isPaid
    string paymentRef "external payment ref, nullable"
    timestamp createdAt
  }

  %% ─── AI Agent Records ───────────────────────────────────────────
  AIConversation {
    uuid id PK
    uuid userId FK
    uuid workspaceId FK
    string title
    jsonb metadata "model used, token counts"
    timestamp startedAt
    timestamp lastActiveAt
  }

  AgentToolExecution {
    uuid id PK
    uuid conversationId FK
    uuid approvalRequestId FK "nullable"
    string toolName
    enum permissionLevel "READ_ONLY | WRITE | EXTERNAL | DESTRUCTIVE"
    enum status "PENDING | COMPLETED | FAILED | REJECTED | REPLAYED"
    string idempotencyKey
    jsonb inputHash "hashed — no PII in logs"
    jsonb outputSummary "non-sensitive summary only"
    integer durationMs
    string correlationId
    timestamp executedAt
  }

  IdempotencyRecord {
    uuid id PK
    string key UK "SHA-256 of operation signature"
    string toolName
    enum status "PROCESSING | COMPLETED | FAILED"
    jsonb cachedResult "sanitised response"
    timestamp createdAt
    timestamp expiresAt
  }

  %% ─── Audit & Compliance ─────────────────────────────────────────
  AuditEvent {
    uuid id PK
    uuid actorId FK "userId or system"
    uuid workspaceId FK
    string operation
    string resourceType
    uuid resourceId
    enum outcome "SUCCESS | FAILURE | DENIED | CANCELLED"
    jsonb metadata "no PII, no secrets"
    string correlationId
    inet ipAddress "hashed in logs"
    string userAgent
    timestamp occurredAt
  }

  %% ─── Relationships ──────────────────────────────────────────────
  User ||--o{ WorkspaceMembership : "belongs to"
  Workspace ||--o{ WorkspaceMembership : "has members"
  Workspace ||--o| Subscription : "has"
  User ||--o| CandidateProfile : "has"
  CandidateProfile ||--o| CareerPreference : "has"
  CandidateProfile ||--o{ CandidateSkill : "has"
  Skill ||--o{ CandidateSkill : "tagged in"
  CandidateProfile ||--o{ SkillGapReport : "has"
  CandidateProfile ||--o{ Resume : "owns"
  Resume ||--o{ ResumeVersion : "has versions"
  CandidateProfile ||--o{ Application : "makes"
  Application ||--|| Job : "targets"
  Application ||--o| ResumeVersion : "uses"
  Job ||--o{ JobMatch : "matched to"
  CandidateProfile ||--o{ JobMatch : "receives"
  Employer ||--o{ Job : "posts"
  JobSource ||--o{ Job : "provides"
  CandidateProfile ||--o{ InterviewSession : "has"
  InterviewSession ||--o| InterviewFeedback : "produces"
  CandidateProfile ||--o{ LearningTask : "assigned"
  User ||--o{ MentorBooking : "as mentor"
  User ||--o{ MentorBooking : "as candidate"
  User ||--o{ AIConversation : "has"
  AIConversation ||--o{ AgentToolExecution : "contains"
  AgentToolExecution ||--o| ApprovalRequest : "may require"
  User ||--o{ ApprovalRequest : "requests"
  User ||--o{ AuditEvent : "generates"
```
<!-- DIAGRAM:gallery-data-architecture:END -->

---

### Gallery 12: Security Boundaries & Trust Zones

- **Purpose:** Four-tier defense-in-depth architecture mapping edge WAF, API gateway trust boundaries, AI policy sandbox, and KMS encryption at rest.
- **Canonical Source:** [`docs/architecture/security-boundaries.mmd`](docs/architecture/security-boundaries.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#212-security-boundaries--trust-zones`](docs/architecture/README.md#212-security-boundaries--trust-zones)

<!-- DIAGRAM:gallery-security-boundaries:START -->
```mermaid
flowchart TB
  classDef boundary fill:#1e293b,stroke:#dc2626,stroke-width:2px,stroke-dasharray: 5 5,color:#f87171
  classDef secureZone fill:#0f172a,stroke:#3b82f6,color:#93c5fd
  classDef extZone fill:#1c1917,stroke:#78716c,color:#d6d3d1
  classDef storageZone fill:#064e3b,stroke:#059669,color:#a7f3d0
  classDef aiZone fill:#312e81,stroke:#6366f1,color:#c7d2fe
  classDef auditZone fill:#1a2035,stroke:#0ea5e9,color:#bae6fd
  classDef controlNode fill:#7f1d1d,stroke:#ef4444,color:#fecaca,font-weight:bold

  subgraph CLIENT_TIER["Client Tier (Untrusted Environment)"]
    BROWSER["Web Browser / Client Device\n• Candidate / Recruiter / Admin / Mentor\n• Local Storage: Short-lived access token only\n• Secure HttpOnly cookie: Refresh token"]
  end

  subgraph EDGE_GATEWAY["Edge & Perimeter Defense  [Trust Boundary 1: Ingress]"]
    WAF["Cloudflare / AWS WAF\n• DDoS Mitigation & IP Reputation\n• TLS 1.3 Termination\n• Edge Rate Limiting (Token Bucket)"]
  end

  subgraph BACKEND_SECURE_ZONE["Backend Secure Zone (Trusted SaaS VPC)"]
    direction TB
    
    subgraph API_INGRESS["API Security Controls"]
      JWT_VAL["JWT Guard & Token Revocation Check\n(Session validation in Redis)"]:::controlNode
      RBAC_GUARD["Workspace Context & RBAC Guard\n(Personal vs Org Workspace Scope)"]:::controlNode
      SCHEMA_VAL["Strict Request Validation\n(Zod Schemas: Strip unknown fields)"]:::controlNode
      API_RATE_LIMIT["Tenant / User Rate Limiter\n(Tier-based throttling)"]:::controlNode
    end

    subgraph CORE_SERVICES["Modular Monolith Services"]
      CAREER_SVC["Career Intelligence & Job Services"]
      RESUME_SVC["Resume & Branding Service\n• PII Redaction Engine before AI ops"]
      AUDIT_SVC["Tamper-evident Audit Service\n• Append-only event queue"]
      CRM_SVC["Practice Management Service\n• Tenant isolated data access"]
    end

    subgraph AI_ORCH_SECURITY["AI Execution Trust Boundary  [Trust Boundary 2: Agent Gateway]"]
      PROMPT_INJECTION_DEF["Prompt Injection & Jailbreak Guard\n• Input Sanitization & Untrusted Document Filter"]:::controlNode
      TOOL_ALLOWLIST["Tool Allowlist & Policy Router\n• Server-Side Permission Verification\n• Scope Constraint Enforcement"]:::controlNode
      IDEMPOTENCY_CTR["Idempotency & Replay Guard\n• SHA-256 Signature Verification\n• Redis distributed locks"]:::controlNode
      APPROVAL_GATEWAY["Human-in-the-Loop Approval Gateway\n• Enforces Explicit User Consent for External Actions\n• Signed approval tokens with 15m expiration"]:::controlNode
      REDACTION_OUT["Output Sanitization & PII Redaction\n• Prevents Model Leakage of Sensitive Info"]:::controlNode
    end
  end

  subgraph PERSISTENCE_SECURITY["Data Persistence Tier (Encrypted at Rest & in Transit)"]
    direction TB
    PG_DB[("PostgreSQL\n• Row-Level Security (RLS) / Tenant IDs\n• AES-256 at-rest encryption\n• TLS in-transit\n• Secrets/Tokens excluded from schema")]:::storageZone
    REDIS_STORE[("Redis In-Memory\n• TLS enabled, Auth protected\n• TTL enforced on all cache/session keys")]:::storageZone
    S3_STORE[("Object Storage (S3)\n• AWS KMS / SSE-S3 Encryption\n• Private buckets, Pre-signed URLs with 5m TTL\n• Anti-virus scan on file upload")]:::storageZone
    SECRETS_VAULT[("Secrets Manager / KMS\n• Encr/Decr of external API keys\n• Database credentials rotation")]:::storageZone
  end

  subgraph EXTERNAL_INTEGRATIONS_TIER["External Integrations  [Trust Boundary 3: Egress]"]
    direction TB
    AI_MODELS["AI Model Providers (Gemini / Claude / OpenAI)\n• Zero Data Retention Agreements\n• No training on customer data\n• TLS 1.3 egress"]:::aiZone
    JOB_PROVIDERS["Authorized Job Providers\n• Verified source attribution\n• Webhook signature verification"]:::extZone
    NOTIFY_GATEWAY["Notification Providers (Resend / Twilio)\n• E.164 phone & email validation\n• Template-based messaging (no arbitrary text)"]:::extZone
    PAY_GATEWAY["PCI-DSS Compliant Payment Gateway\n• Webhook HMAC signature verification\n• Zero credit card data stored locally"]:::extZone
  end

  subgraph AUDIT_MONITORING["Security Operations & Telemetry  [Audit Boundary]"]
    SIEM["SIEM & Audit Event Stream\n• WORM (Write Once Read Many) storage\n• Actor, Workspace, Correlation ID, Timestamp\n• Redacted payload hashes (no raw resume/PII)"]:::auditZone
    TELEMETRY["Prometheus / OpenTelemetry\n• Anomaly detection (unauthorized attempts)\n• Real-time alerting to PagerDuty"]:::auditZone
  end

  %% Relationships and Enforcements
  CLIENT_TIER -->|"HTTPS / TLS 1.3"| EDGE_GATEWAY
  EDGE_GATEWAY -->|"Validated Traffic"| API_INGRESS
  API_INGRESS -->|"Authenticated & Authorized"| CORE_SERVICES
  CORE_SERVICES -->|"AI Requests"| AI_ORCH_SECURITY
  
  AI_ORCH_SECURITY -->|"Sanitized Prompts"| AI_MODELS
  AI_ORCH_SECURITY -->|"Consent Gate"| APPROVAL_GATEWAY
  APPROVAL_GATEWAY -.->|"User Approval Prompt"| BROWSER

  CORE_SERVICES -->|"Tenant-Scoped Queries (TLS)"| PG_DB
  CORE_SERVICES -->|"Session/Lock Operations (TLS)"| REDIS_STORE
  CORE_SERVICES -->|"Encrypted Upload / Pre-signed URLs"| S3_STORE
  CORE_SERVICES -->|"Secret Retrieval"| SECRETS_VAULT

  CORE_SERVICES -->|"Gated External Operations"| EXTERNAL_INTEGRATIONS_TIER
  
  API_INGRESS -.->|"Log Event (Zero PII)"| SIEM
  CORE_SERVICES -.->|"Log Event (Zero PII)"| SIEM
  AI_ORCH_SECURITY -.->|"Tool Execution Audit"| SIEM
  SIEM --> TELEMETRY
```
<!-- DIAGRAM:gallery-security-boundaries:END -->

---

### Gallery 13: Background Jobs & Asynchronous Queues

- **Purpose:** BullMQ asynchronous job processing pipeline detailing queue ownership, concurrency limits, exponential backoff, dead-letter queues, and reconciliation.
- **Canonical Source:** [`docs/architecture/background-processing.mmd`](docs/architecture/background-processing.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#213-background-jobs--asynchronous-queues`](docs/architecture/README.md#213-background-jobs--asynchronous-queues)

<!-- DIAGRAM:gallery-background-processing:START -->
```mermaid
flowchart TB
  classDef trigger fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef queue fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff
  classDef worker fill:#312e81,stroke:#a78bfa,stroke-width:1px,color:#ede9fe
  classDef fail fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fecaca
  classDef store fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5
  classDef ext fill:#1c1917,stroke:#a8a29e,stroke-width:1px,color:#f5f5f4

  subgraph PRODUCERS["1. Event Triggers & Schedulers"]
    CRON_SCHED["Cron Schedulers\n• Every 6h: Job Ingestion\n• Daily 02:00: Freshness Cleanup\n• Hourly: Application Follow-Ups"]:::trigger
    DOMAIN_EVENTS["Domain Event Emitter\n• job.created\n• application.submitted\n• interview.completed"]:::trigger
    API_ASYNC["API Async Mutations\n• Resume PDF Export\n• Heavy AI Diagnostic Tasks"]:::trigger
  end

  subgraph QUEUE_TIER["2. Distributed Task Queues (BullMQ + Redis 7+)"]
    direction TB
    Q_JOB["job-ingestion-queue\n(Priority: Normal, Rate: 50/min)"]:::queue
    Q_EMBED["vector-embedding-queue\n(Priority: High, Rate: 100/min)"]:::queue
    Q_FRESH["job-freshness-queue\n(Priority: Low, Daily Run)"]:::queue
    Q_RESUME["resume-export-queue\n(Priority: High, PDF/DOCX)"]:::queue
    Q_REMIND["reminder-queue\n(Priority: Normal, Hourly)"]:::queue
    Q_AI_EVAL["ai-evaluation-queue\n(Priority: Normal, Scorecards)"]:::queue
    Q_AUDIT["audit-event-queue\n(Priority: Critical, High-Throughput)"]:::queue
  end

  subgraph WORKER_POOL["3. Dedicated Worker Processes"]
    direction TB
    W_INGEST["JobIngestionWorker\n(Concurrency: 2, Timeout: 120s)"]:::worker
    W_EMBED["EmbeddingWorker\n(Concurrency: 5, Timeout: 30s)"]:::worker
    W_FRESH["FreshnessWorker\n(Concurrency: 1, Timeout: 300s)"]:::worker
    W_RESUME["ResumeExportWorker\n(Concurrency: 3, Timeout: 45s)"]:::worker
    W_REMIND["ReminderWorker\n(Concurrency: 4, Timeout: 15s)"]:::worker
    W_AI_EVAL["InterviewEvaluationWorker\n(Concurrency: 3, Timeout: 60s)"]:::worker
    W_AUDIT["AuditWriterWorker\n(Concurrency: 10, Timeout: 5s)"]:::worker
  end

  subgraph RELIABILITY["4. Reliability, Retries & Dead-Letter Handling"]
    direction TB
    RETRY_LOGIC["Exponential Backoff with Jitter\nRetries: 3-5 Attempts\n(Initial: 5s, Factor: 2x)"]:::fail
    DLQ["Dead-Letter Queue (DLQ)\n• Persistent Failure Storage\n• Alerting via PagerDuty"]:::fail
    RECONCILE["Nightly Reconciliation Worker\n• Resolves dangling approval tokens\n• Cross-checks external status"]:::fail
  end

  subgraph TARGETS["5. Target Storage & External Notification"]
    PG[("PostgreSQL 16+\n(Relational Updates & pgvector)")]:::store
    S3[("Object Storage (S3 / R2)\n(Generated PDF/DOCX Resumes)")]:::store
    EXT_NOTIFY["Transactional Notification\n(Resend Email / Twilio Alerts)"]:::ext
    AUDIT_WORM[("Immutable WORM Audit Store\n(SIEM & Compliance Bucket)")]:::store
  end

  PRODUCERS --> QUEUE_TIER

  CRON_SCHED --> Q_JOB
  CRON_SCHED --> Q_FRESH
  CRON_SCHED --> Q_REMIND
  DOMAIN_EVENTS --> Q_EMBED
  DOMAIN_EVENTS --> Q_AUDIT
  API_ASYNC --> Q_RESUME
  API_ASYNC --> Q_AI_EVAL

  Q_JOB --> W_INGEST
  Q_EMBED --> W_EMBED
  Q_FRESH --> W_FRESH
  Q_RESUME --> W_RESUME
  Q_REMIND --> W_REMIND
  Q_AI_EVAL --> W_AI_EVAL
  Q_AUDIT --> W_AUDIT

  WORKER_POOL -.->|"On Unrecoverable Error"| RETRY_LOGIC
  RETRY_LOGIC -.->|"Max Retries Exceeded"| DLQ
  DLQ -.-> RECONCILE

  W_INGEST --> PG
  W_EMBED --> PG
  W_FRESH --> PG
  W_RESUME --> S3
  W_REMIND --> EXT_NOTIFY
  W_AI_EVAL --> PG
  W_AUDIT --> AUDIT_WORM
  RECONCILE --> PG
```
<!-- DIAGRAM:gallery-background-processing:END -->

---

### Gallery 14: Independent Practice Workflow

- **Purpose:** Regulatory and operational workflow guiding CAs into public practice under ICAI Code of Ethics (Clauses 6 & 7) with COP checklists and client KYC.
- **Canonical Source:** [`docs/architecture/independent-practice-workflow.mmd`](docs/architecture/independent-practice-workflow.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#214-independent-practice-workflow`](docs/architecture/README.md#214-independent-practice-workflow)

<!-- DIAGRAM:gallery-independent-practice-workflow:START -->
```mermaid
flowchart TD
  classDef startNode fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef stepNode fill:#1e1b4b,stroke:#818cf8,stroke-width:1px,color:#e0e7ff
  classDef ethicsNode fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fecaca
  classDef firmNode fill:#064e3b,stroke:#10b981,stroke-width:1px,color:#ecfdf5
  classDef crmNode fill:#172554,stroke:#3b82f6,stroke-width:1px,color:#dbeafe
  classDef opsNode fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#bbf7d0

  START(["CA Final Cleared & ICAI Enrolment"]):::startNode

  subgraph REGULATORY_PHASE["1. Regulatory & Statutory Licensing (ICAI SSP Portal)"]
    MEMBERSHIP["Apply for ICAI Associate Membership (ACA)\n(Form 2 Submission)"]:::stepNode
    COP_CHOICE{"Practice Mode Decision"}:::stepNode
    COP_FULL["Apply for Full-Time COP (Form 6)\n(Public Practice License)"]:::stepNode
    COP_PART["Apply for Part-Time COP\n(Subject to ICAI Guidelines)"]:::stepNode
  end

  subgraph ETHICAL_GUARD["2. Professional Ethics Boundary (ICAI Code of Ethics 2020)"]
    direction TB
    ETHICS_CHECK["Ethics Boundary Enforcement\n• Clause 6: Prohibition of Client Solicitation\n• Clause 7: Prohibition of Public Advertisement\n• Platform strictly acts as back-office CRM, NOT an advertising portal"]:::ethicsNode
  end

  subgraph FIRM_SETUP["3. Firm Constitution & Governance"]
    direction TB
    FIRM_TYPE{"Firm Constitution Type"}:::firmNode
    PROP["Sole Proprietorship Firm"]:::firmNode
    PARTNER["CA Partnership Firm"]:::firmNode
    LLP["Limited Liability Partnership (LLP)"]:::firmNode
    NAME_APPROVAL["Firm Name Approval Application\n(ICAI SSP Portal Deep-Link)"]:::firmNode
    MEF_TRACK["Multipurpose Empanelment Form (MEF) Readiness\n(Bank Audit & PSU Empanelment Eligibility)"]:::firmNode
  end

  subgraph CRM_SUITE["4. CA Career OS Practice Operations Suite (Org Workspace)"]
    direction TB
    CLIENT_KYC["Client Master & KYC Verification\n(PAN, GSTIN, CIN, Director KYC Tracker)"]:::crmNode
    ENGAGEMENT_DOC["Standard Engagement Letter Generator\n(Standard Terms under SA 210)"]:::crmNode
    COMPLIANCE_CAL["Statutory Compliance Calendar Engine\n• Income Tax (ITR, TDS, 44AB Tax Audit)\n• GST (GSTR-1, GSTR-3B, GSTR-9/9C)\n• MCA / ROC Filings (AOC-4, MGT-7)"]:::crmNode
    AUDIT_VAULT["Secure Client Working Paper Vault\n(KMS-Encrypted Audit Trails)"]:::crmNode
  end

  subgraph ONGOING_OPS["5. Continuous Compliance & Growth"]
    CPE_TRACKER["ICAI CPE Credit Tracker\n(Monitor Mandatory 30-40 Hours/Year)"]:::opsNode
    RECURRING_ALERTS["Automated Client Compliance Reminders\n(Email / WhatsApp Alerts)"]:::opsNode
  end

  START --> MEMBERSHIP
  MEMBERSHIP --> COP_CHOICE
  COP_CHOICE -- "Full-Time Practice" --> COP_FULL
  COP_CHOICE -- "Part-Time Practice" --> COP_PART

  COP_FULL --> ETHICS_CHECK
  COP_PART --> ETHICS_CHECK

  ETHICS_CHECK --> FIRM_TYPE
  FIRM_TYPE --> PROP
  FIRM_TYPE --> PARTNER
  FIRM_TYPE --> LLP

  PROP --> NAME_APPROVAL
  PARTNER --> NAME_APPROVAL
  LLP --> NAME_APPROVAL

  NAME_APPROVAL --> MEF_TRACK
  MEF_TRACK --> CLIENT_KYC

  CLIENT_KYC --> ENGAGEMENT_DOC
  ENGAGEMENT_DOC --> COMPLIANCE_CAL
  COMPLIANCE_CAL --> AUDIT_VAULT

  AUDIT_VAULT --> CPE_TRACKER
  COMPLIANCE_CAL --> RECURRING_ALERTS
```
<!-- DIAGRAM:gallery-independent-practice-workflow:END -->

---

### Gallery 15: Deployment Architecture & Cloud Topology

- **Purpose:** Multi-AZ AWS ECS Fargate topology with Cloudflare Edge WAF, Application Load Balancers, Aurora PostgreSQL, Redis, and S3 in AWS Mumbai (`ap-south-1`).
- **Canonical Source:** [`docs/architecture/deployment-architecture.mmd`](docs/architecture/deployment-architecture.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#215-deployment-architecture--cloud-topology`](docs/architecture/README.md#215-deployment-architecture--cloud-topology)

<!-- DIAGRAM:gallery-deployment-architecture:START -->
```mermaid
flowchart TB
  classDef edge fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef alb fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#bfdbfe
  classDef compute fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff
  classDef db fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5
  classDef ext fill:#1c1917,stroke:#a8a29e,stroke-width:1px,color:#f5f5f4

  subgraph INTERNET_CLIENTS["1. Internet & Edge Perimeter"]
    CLIENTS["Web & Mobile Browsers\n(Candidates · Recruiters · Mentors)"]:::edge
    CLOUDFLARE["Cloudflare Edge Network\n• Anycast DNS & Edge WAF\n• DDoS Mitigation & IP Reputation\n• TLS 1.3 Termination & Static CDN"]:::edge
  end

  subgraph AWS_VPC["2. AWS Cloud Virtual Private Cloud (VPC) — ap-south-1 (Mumbai)"]
    direction TB

    subgraph PUBLIC_SUBNETS["Public Subnet Tier (Multi-AZ)"]
      ALB["Application Load Balancer (ALB)\n• Path-Based Routing: /api/* -> Backend, /* -> Frontend\n• AWS Certificate Manager (ACM) SSL"]:::alb
      NAT_GW["NAT Gateway (Multi-AZ)\nOutbound Egress for Private Subnets"]:::alb
    end

    subgraph PRIVATE_APP_SUBNETS["Private Application Subnet Tier (Compute)"]
      direction TB
      subgraph ECS_FRONTEND["Next.js Presentation Service"]
        NEXT_CONTAINERS["Next.js SSR Containers (Fargate)\n• React 19 App Router\n• Auto-Scaling: CPU > 70%"]:::compute
      end

      subgraph ECS_BACKEND["NestJS Core API Service"]
        NEST_CONTAINERS["NestJS Modular Monolith (Fargate)\n• REST API Controllers & Domain Services\n• JWT Guards & Zod Validation\n• Auto-Scaling: Min 2, Max 10"]:::compute
      end

      subgraph ECS_WORKERS["Async Processing Workers"]
        WORKER_CONTAINERS["BullMQ Worker Containers (Fargate)\n• Ingestion, Freshness, Embeddings, Reminders\n• Isolated Memory Sandbox"]:::compute
      end
    end

    subgraph PRIVATE_DATA_SUBNETS["Private Isolated Persistence Subnet Tier"]
      direction LR
      AURORA_PG[("Amazon Aurora PostgreSQL 16+\n• Multi-AZ Primary + Read Replica\n• pgvector Extension Enabled\n• AES-256 KMS At-Rest Encryption")]:::db
      ELASTICACHE[("Amazon ElastiCache Redis 7+\n• Multi-AZ Cluster (Primary + Replica)\n• In-Memory Sessions & BullMQ Queues\n• Auth Token & In-Transit TLS")]:::db
      S3_BUCKET[("Amazon S3 / Cloudflare R2\n• Private Resume & Document Bucket\n• SSE-KMS Encryption\n• Pre-Signed URLs (15m TTL)")]:::db
      SECRETS_MGR[("AWS Secrets Manager\n• Automated Credential Rotation\n• Zero Secrets in Code or Docker")]:::db
    end
  end

  subgraph EXTERNAL_SAAS["3. External SaaS Egress (via NAT Gateway)"]
    direction LR
    AI_MODELS["AI Model Providers\n(Gemini · Claude · OpenAI)"]:::ext
    JOB_PARTNERS["Partner ATS Feeds\n(Greenhouse · Lever · Darwinbox)"]:::ext
    COMM_GATEWAYS["Resend (Email)\nTwilio (SMS/WhatsApp)"]:::ext
    PAYMENT_GATEWAY["Razorpay Payment Gateway\n(PCI-DSS Invoicing)"]:::ext
  end

  CLIENTS -->|"HTTPS"| CLOUDFLARE
  CLOUDFLARE -->|"Encrypted Ingress"| ALB
  ALB -->|"/*"| NEXT_CONTAINERS
  ALB -->|"/api/*"| NEST_CONTAINERS

  NEXT_CONTAINERS -->|"Internal API Calls"| NEST_CONTAINERS
  NEST_CONTAINERS -->|"Read / Write"| AURORA_PG
  NEST_CONTAINERS -->|"Cache / Locks / Enqueue"| ELASTICACHE
  NEST_CONTAINERS -->|"Pre-Signed URLs"| S3_BUCKET
  NEST_CONTAINERS -->|"Fetch Config"| SECRETS_MGR

  WORKER_CONTAINERS -->|"Consume Jobs"| ELASTICACHE
  WORKER_CONTAINERS -->|"Batch Updates"| AURORA_PG
  WORKER_CONTAINERS -->|"Upload Rendered PDFs"| S3_BUCKET

  NEST_CONTAINERS -->|"Egress via NAT"| NAT_GW
  WORKER_CONTAINERS -->|"Egress via NAT"| NAT_GW
  NAT_GW --> EXTERNAL_SAAS
```
<!-- DIAGRAM:gallery-deployment-architecture:END -->

---

### Gallery 16: Identity, Multi-Tenancy & Access Control

- **Purpose:** Tenant isolation architecture strictly separating candidate personal workspaces from employer organization workspaces with session revocation lifecycles.
- **Canonical Source:** [`docs/architecture/identity-and-access.mmd`](docs/architecture/identity-and-access.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#216-identity-multi-tenancy--access-control`](docs/architecture/README.md#216-identity-multi-tenancy--access-control)

<!-- DIAGRAM:gallery-identity-and-access:START -->
```mermaid
flowchart TB
  classDef auth fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef token fill:#1e1b4b,stroke:#818cf8,stroke-width:1px,color:#e0e7ff
  classDef rbac fill:#312e81,stroke:#a78bfa,stroke-width:2px,color:#ede9fe
  classDef tenant fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5
  classDef block fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fecaca

  subgraph AUTH_FLOW["1. Authentication & Token Lifecycle"]
    CREDENTIALS["User Credentials\n(Email + Bcrypt Password)"]:::auth
    AUTH_SERVICE["IdentityService.validateCredentials()\n• 12 Rounds Bcrypt Verification\n• Rate Limit: Max 5 Failed Attempts"]:::auth
    TOKEN_GEN["TokenService.generateTokenPair()\n• Access Token: JWT (15m TTL in Memory)\n• Refresh Token: Crypto UUID (7d HttpOnly Cookie)"]:::token
    REFRESH_ROTATION["Refresh Token Rotation\n• Single-Use Invalidation in Redis\n• Token Family Reuse Detection -> Revoke All"]:::token
  end

  subgraph CONTEXT_RESOLUTION["2. Workspace Context & Tenant Resolution"]
    REQ_HEADER["Incoming Request Header:\nX-Workspace-Id: <uuid>"]:::tenant
    WS_GUARD["TenantContextGuard (NestJS)\n• Verifies Workspace Exists\n• Verifies User is Active Member"]:::tenant
    WS_TYPE{"Workspace Type"}:::tenant
    
    PERSONAL_WS["Personal Workspace\n• 1:1 Candidate Privacy Boundary\n• Resumes, Applications, Mock Drills"]:::tenant
    ORG_WS["Organization Workspace\n• 1:N Firm / Employer Workspace\n• Job Requisitions, Applicant Pipeline"]:::tenant
  end

  subgraph RBAC_ENGINE["3. Role-Based Access Control (RBAC) Engine"]
    ROLE_EVAL{"Workspace Member Role"}:::rbac
    ROLE_OWNER["OWNER\nFull Control · Billing · Workspace Deletion"]:::rbac
    ROLE_ADMIN["ADMIN\nMember Invites · Job Management · Pipeline"]:::rbac
    ROLE_REC["RECRUITER\nPost Jobs · Review Applicants · Schedule Interviews"]:::rbac
    ROLE_VIEW["VIEWER\nRead-Only Access to Requisitions & Analytics"]:::rbac
  end

  subgraph BLINDFOLD_RULE["4. Current Employer Privacy Blindfold"]
    BLINDFOLD_CHECK{"Candidate Employed at\nViewing Organization?"}:::block
    BLIND_APPLY["Mask Candidate Identity\n• Exclude from Recruiter Search\n• Zero Visibility into Personal Workspace"]:::block
    PERMIT_VIEW["Allow Authorized Pipeline View\n(Only for Explicit Job Applications)"]:::tenant
  end

  CREDENTIALS --> AUTH_SERVICE
  AUTH_SERVICE --> TOKEN_GEN
  TOKEN_GEN --> REFRESH_ROTATION

  TOKEN_GEN --> REQ_HEADER
  REQ_HEADER --> WS_GUARD
  WS_GUARD --> WS_TYPE

  WS_TYPE -- "PERSONAL" --> PERSONAL_WS
  WS_TYPE -- "ORGANIZATION" --> ORG_WS

  ORG_WS --> ROLE_EVAL
  ROLE_EVAL -- "OWNER" --> ROLE_OWNER
  ROLE_EVAL -- "ADMIN" --> ROLE_ADMIN
  ROLE_EVAL -- "RECRUITER" --> ROLE_REC
  ROLE_EVAL -- "VIEWER" --> ROLE_VIEW

  ORG_WS --> BLINDFOLD_CHECK
  BLINDFOLD_CHECK -- "Yes (Current Employer)" --> BLIND_APPLY
  BLINDFOLD_CHECK -- "No (Legitimate Applicant)" --> PERMIT_VIEW
```
<!-- DIAGRAM:gallery-identity-and-access:END -->

---

### Gallery 17: Billing, Subscriptions & Commercial Lifecycle

- **Purpose:** SaaS billing state machine governing plans, checkout sessions, Razorpay webhook idempotency, 48-hour renewal grace periods, and cancellations.
- **Canonical Source:** [`docs/architecture/billing-lifecycle.mmd`](docs/architecture/billing-lifecycle.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#217-billing-subscriptions--commercial-lifecycle`](docs/architecture/README.md#217-billing-subscriptions--commercial-lifecycle)

<!-- DIAGRAM:gallery-billing-lifecycle:START -->
```mermaid
stateDiagram-v2
  [*] --> FreeTier : User Registration

  state FreeTier {
    [*] --> ActiveFree
    ActiveFree --> UpgradeInitiated : User selects Pro/Team Plan
  }

  UpgradeInitiated --> CheckoutPending : Razorpay Order Created

  state CheckoutPending {
    [*] --> AwaitingPayment
    AwaitingPayment --> PaymentSuccess : Webhook payment.captured
    AwaitingPayment --> PaymentFailed : Webhook payment.failed / Abandoned
    PaymentFailed --> [*] : Order Expired (30m)
  }

  PaymentSuccess --> ActivePaid : Entitlement Granted (PRO / TEAM)

  state ActivePaid {
    [*] --> InGoodStanding
    InGoodStanding --> RenewalApproaching : 3 Days Prior to Billing Cycle
    RenewalApproaching --> AutoDebitAttempted : Recurring Mandate Triggered
    AutoDebitAttempted --> InGoodStanding : Charge Success
    AutoDebitAttempted --> PastDue : Charge Failed (RBI AFA / Funds)
    InGoodStanding --> CancellationRequested : User requests cancel
  }

  PastDue --> GracePeriod : 7-Day Grace Window Active
  state GracePeriod {
    [*] --> RetryAttempt1 : Day 2 Retry
    RetryAttempt1 --> InGoodStanding : Succeeded
    RetryAttempt1 --> RetryAttempt2 : Day 5 Retry
    RetryAttempt2 --> InGoodStanding : Succeeded
    RetryAttempt2 --> GraceExpired : Day 7 Final Notice
  }

  GraceExpired --> DowngradedToFree : Revoke Pro Entitlements
  CancellationRequested --> ActiveUntilPeriodEnd : Preserves Paid Days
  ActiveUntilPeriodEnd --> DowngradedToFree : Billing Period Elapsed

  DowngradedToFree --> FreeTier : Data Preserved in Read-Only
  DowngradedToFree --> UpgradeInitiated : User Reactivates Plan
```
<!-- DIAGRAM:gallery-billing-lifecycle:END -->

---

### Gallery 18: Observability, Telemetry & Health Monitoring

- **Purpose:** Distributed OpenTelemetry tracing, structured JSON logging with Zero-PII filtering, Prometheus metrics, Grafana dashboards, and PagerDuty SLO alerting.
- **Canonical Source:** [`docs/architecture/observability-architecture.mmd`](docs/architecture/observability-architecture.mmd)
- **Handbook Reference:** [`docs/architecture/README.md#218-observability-telemetry--health-monitoring`](docs/architecture/README.md#218-observability-telemetry--health-monitoring)

<!-- DIAGRAM:gallery-observability-architecture:START -->
```mermaid
flowchart TB
  classDef app fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
  classDef filter fill:#1e1b4b,stroke:#818cf8,stroke-width:1px,color:#e0e7ff
  classDef sink fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5
  classDef alert fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fecaca

  subgraph TELEMETRY_SOURCES["1. Telemetry & Event Producers"]
    API_REQ["NestJS API Layer\n• Request Latency & Status Codes\n• CorrelationID Tracking (x-request-id)"]:::app
    DB_METRICS["Prisma & PostgreSQL\n• Connection Pool Saturation\n• Query Latency & HNSW Index Scans"]:::app
    QUEUE_METRICS["BullMQ & Redis\n• Active Jobs, Waiting Depth\n• Failed Job Count & Worker Latency"]:::app
    AI_METRICS["AI Agent Orchestrator\n• Model Latency & Token Usage\n• Tool Execution Rate & Approval TTLs"]:::app
  end

  subgraph PRIVACY_PIPELINE["2. Zero-PII Sanitization & Redaction Engine"]
    direction TB
    PII_SCRUBBER["Privacy Filter (ADR-008)\n• Strips Phone, Email, Postal Addresses\n• Strips Raw Resume Text & CTC Figures\n• Converts Tool Payloads to SHA-256 Hashes"]:::filter
    CORRELATION_TAG["Context Enricher\n• Binds actorId, workspaceId, correlationId\n• Appends ISO-8601 Timestamp"]:::filter
  end

  subgraph OBSERVABILITY_SINKS["3. Persistence & Telemetry Sinks"]
    direction LR
    PROMETHEUS["Prometheus / OpenTelemetry\n• Time-Series Metric Storage\n• SLI/SLO Target Monitoring"]:::sink
    GRAFANA["Grafana Dashboards\n• Real-Time Operations Overview\n• Error Spikes & P95 Latency Views"]:::sink
    WORM_AUDIT[("WORM Audit Log (S3 Object Lock)\n• Immutable Append-Only Compliance Log\n• 7-Year Statutory Audit Retention")]:::sink
  end

  subgraph INCIDENT_ALERTING["4. Anomaly Detection & Incident Response"]
    direction TB
    ALERT_RULES["Alertmanager Rules\n• 5xx Error Spike > 1% in 5m\n• BullMQ DLQ Messages > 5\n• DB Connection Pool > 85%\n• Unauthorized Cross-Tenant Spike"]:::alert
    PAGERDUTY["PagerDuty / Slack Alerts\n(On-Call Engineer Escalation)"]:::alert
  end

  TELEMETRY_SOURCES --> PII_SCRUBBER
  PII_SCRUBBER --> CORRELATION_TAG

  CORRELATION_TAG --> PROMETHEUS
  CORRELATION_TAG --> WORM_AUDIT
  PROMETHEUS --> GRAFANA

  PROMETHEUS --> ALERT_RULES
  ALERT_RULES --> PAGERDUTY
```
<!-- DIAGRAM:gallery-observability-architecture:END -->

---

## 6. Technology Stack Baseline

| Layer | Proposed Technology | Architectural Justification |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router), React 19, TypeScript, Vanilla CSS** | Fast server-side rendering for SEO (job pages), responsive client components, strict TypeScript type safety. |
| **Backend** | **Node.js with NestJS (TypeScript)** | Modular monolith with dependency injection, strict validation pipes, built-in guards, and clean domain encapsulation. |
| **Database** | **PostgreSQL 16+ with `pgvector`** | ACID transactions, row-level security for tenant isolation, and unified relational + vector similarity queries. |
| **ORM** | **Prisma ORM** | Type-safe query building, automated schema migrations, and client generation. |
| **Cache & Queue** | **Redis 7+ & BullMQ** | High-performance session storage, distributed locks, rate limiting, and reliable asynchronous job processing. |
| **AI Abstraction** | **Universal Provider Adapter** | Decouples business logic from vendors; supports Google Gemini, OpenAI, and Anthropic Claude via standard JSON schema contracts. |
| **Object Storage** | **S3-Compatible Storage (AWS S3 / Cloudflare R2)** | Secure, encrypted document storage with short-lived pre-signed URLs (15-minute TTL). |
| **Notifications** | **Resend (Email), Twilio (SMS / WhatsApp Alerts)** | Transactional notifications for application milestones, follow-ups, and approval cards. |

---

## 7. Security & Privacy Principles

1. **Workspace Multi-Tenancy:** Candidates operate in strictly isolated *Personal Workspaces*. Employers operate in *Organization Workspaces*. A candidate's job searches and applications are strictly invisible to their current employer.
2. **Zero-Fabrication Policy (ADR-009):** The resume generation engine is programmatically constrained from fabricating client names, engagement values, or professional metrics. All resume claims require candidate verification and attestation.
3. **No Autonomous External Side Effects:** The AI Career Agent can never submit applications, message recruiters, or book paid sessions without explicit, time-bounded user confirmation in the browser UI.
4. **Zero-PII Audit Logging (ADR-008):** Audit streams record actors, tools, and operation outcomes, but strip PII, credentials, full resume text, and financial numbers from log sinks using SHA-256 hashes.
5. **Data Protection & Legal Review Notice:** Features handling tax, legal, and ICAI regulatory guidelines are designed for alignment with the **Chartered Accountants Act, 1949**, and the **ICAI Code of Ethics (2020)**.

---

## 8. MVP Scope vs. Phased Roadmap

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                    IMPLEMENTATION ROADMAP                                 |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  PHASE 1: MVP (Proposed Baseline)                                                         |
|  • Candidate onboarding, articleship inventory, and career pathway diagnostic             |
|  • Verified direct job postings and approved partner API ingestion                       |
|  • Hybrid job search (Postgres FTS + pgvector) and explainable match scoring              |
|  • ATS resume builder with job-specific tailoring and candidate attestation               |
|  • Unified application tracking board with follow-up task scheduling                      |
|  • Text-based technical mock interviews with Ind AS / Tax question banks                  |
|  • CTC Unbundler and side-by-side offer comparison calculator                             |
|  • AI Career Agent with 4-tier permission router and Human-in-the-Loop approval cards     |
|  • Tamper-evident audit logging and workspace authorization guards                        |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  PHASE 2: ENHANCED INTELLIGENCE & COMMUNITY (Planned)                                     |
|  • Real-time voice mock interviews (turn-based audio pipeline)                            |
|  • ATS partner webhooks (Greenhouse, Lever, Darwinbox)                                    |
|  • Practical skills simulation lab (synthetic Excel financial modeling & audit cases)     |
|  • Mentorship marketplace with calendar scheduling and payment processing                 |
|  • Aggregated salary intelligence engine with sample-size (N) indicators                  |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  PHASE 3: PRACTICE MANAGEMENT & ENTERPRISE (Future)                                       |
|  • Independent Practice Suite: Post-qualification checklist, COP guide, and client CRM    |
|  • Employer hiring analytics and candidate matching pipeline                              |
|  • WhatsApp Business API alerts for urgent interview invites                              |
|  • Continuous Professional Education (CPE) credit tracker                                 |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 9. Architecture Status

| Dimension | Current Status | Notes |
| :--- | :--- | :--- |
| **System Architecture** | **Documented & Blueprinted** | Complete 18-diagram architecture handbook, 9 ADRs, STRIDE threat model, and risk register documented. |
| **Product Specifications** | **Fully Specified (PRD)** | Complete functional requirements, 10 personas, 15 user journeys, 12 UX states, and monetization hypotheses. |
| **Domain Data Model** | **Designed & Specified** | 21 relational entities, multi-tenant boundaries, Prisma models, and retention lifecycles specified. |
| **REST API Contracts** | **Specified & OpenAPI Compliant** | Formal OpenAPI 3.0.3 specification (`api/openapi.yaml`) and REST architectural guidelines documented. |
| **SRE & Operations** | **Runbooks Specified** | 6 operational runbooks covering deployment, rollback, PITR recovery, worker triage, provider failover, and incident response. |
| **Application Code** | **Implementation Pending** | Monorepo scaffolding, database migrations, and service implementations scheduled for Phase 1 MVP sprint. |
| **Verification State** | **Diagrams Parsed & Validated** | All 18 Mermaid diagrams validated via automated parser script (`scripts/validate-diagrams.mjs`). |

---

## 10. Master Documentation & Architecture Blueprint Index

The CA Career OS engineering blueprint is structured across the following master specifications:

### 10.1 Visual Architecture Diagrams (18 Canonical Views)

| # | Diagram | Purpose & Description | Canonical Source |
| :-: | :--- | :--- | :--- |
| **01** | **[System Context Diagram](docs/architecture/system-context.mmd)** | Platform boundary, human actors, persistence, and external SaaS providers. | [`docs/architecture/system-context.mmd`](docs/architecture/system-context.mmd) |
| **02** | **[Container Architecture](docs/architecture/system-architecture.mmd)** | Multi-tier service topology, API layers, domain modules, and queue topology. | [`docs/architecture/system-architecture.mmd`](docs/architecture/system-architecture.mmd) |
| **03** | **[Backend Component Architecture](docs/architecture/backend-component-architecture.mmd)** | NestJS component topology, guards, domain services, repositories, and DB adapters. | [`docs/architecture/backend-component-architecture.mmd`](docs/architecture/backend-component-architecture.mmd) |
| **04** | **[Domain Module Dependencies](docs/architecture/domain-module-dependencies.mmd)** | Modular monolith module dependency graph and decoupled domain event bus. | [`docs/architecture/domain-module-dependencies.mmd`](docs/architecture/domain-module-dependencies.mmd) |
| **05** | **[AI Agent System Architecture](docs/architecture/ai-agent-system.mmd)** | Multi-turn workflow, RAG grounding, context assembly, and safety gates. | [`docs/architecture/ai-agent-system.mmd`](docs/architecture/ai-agent-system.mmd) |
| **06** | **[Agent Execution Flow](docs/architecture/agent-execution-flow.mmd)** | 4-tier permission router, idempotency verification, and human approval gateway. | [`docs/architecture/agent-execution-flow.mmd`](docs/architecture/agent-execution-flow.mmd) |
| **07** | **[Human-Approval Sequence](docs/architecture/human-approval-sequence.mmd)** | Interactive confirmation cards, 15m signed tokens, and cancellation paths. | [`docs/architecture/human-approval-sequence.mmd`](docs/architecture/human-approval-sequence.mmd) |
| **08** | **[Candidate User Journey](docs/architecture/user-journey.mmd)** | Dual candidate lifecycles: corporate employment vs independent practice. | [`docs/architecture/user-journey.mmd`](docs/architecture/user-journey.mmd) |
| **09** | **[Job Ingestion Pipeline](docs/architecture/job-ingestion-pipeline.mmd)** | Ingestion, normalization, SHA-256 deduplication, freshness, and vector indexing. | [`docs/architecture/job-ingestion-pipeline.mmd`](docs/architecture/job-ingestion-pipeline.mmd) |
| **10** | **[Job Application Workflow](docs/architecture/job-application-workflow.mmd)** | State machine tracking discovery, resume tailoring, approval, and offer comparison. | [`docs/architecture/job-application-workflow.mmd`](docs/architecture/job-application-workflow.mmd) |
| **11** | **[Database Architecture (ERD)](docs/architecture/data-architecture.mmd)** | 21 relational entities, foreign keys, and multi-tenant workspace boundaries. | [`docs/architecture/data-architecture.mmd`](docs/architecture/data-architecture.mmd) |
| **12** | **[Security Boundaries Diagram](docs/architecture/security-boundaries.mmd)** | Trust zones, edge WAF, authentication guards, and KMS encryption boundaries. | [`docs/architecture/security-boundaries.mmd`](docs/architecture/security-boundaries.mmd) |
| **13** | **[Background Jobs & Queues](docs/architecture/background-processing.mmd)** | BullMQ queues, worker pool, retry backoff, DLQ, and nightly reconciliation. | [`docs/architecture/background-processing.mmd`](docs/architecture/background-processing.mmd) |
| **14** | **[Independent Practice Workflow](docs/architecture/independent-practice-workflow.mmd)** | COP checklist, firm constitution, ethics boundaries, client KYC, and compliance calendar. | [`docs/architecture/independent-practice-workflow.mmd`](docs/architecture/independent-practice-workflow.mmd) |
| **15** | **[Deployment Architecture](docs/architecture/deployment-architecture.mmd)** | Multi-AZ ECS Fargate, Cloudflare WAF, Aurora PostgreSQL, and Redis in AWS Mumbai. | [`docs/architecture/deployment-architecture.mmd`](docs/architecture/deployment-architecture.mmd) |
| **16** | **[Identity & Access Model](docs/architecture/identity-and-access.mmd)** | User authentication, workspace scopes, RBAC permissions, and session lifecycles. | [`docs/architecture/identity-and-access.mmd`](docs/architecture/identity-and-access.mmd) |
| **17** | **[Billing & Commercial Lifecycle](docs/architecture/billing-lifecycle.mmd)** | Subscription state machine, Razorpay webhooks, idempotency, and grace periods. | [`docs/architecture/billing-lifecycle.mmd`](docs/architecture/billing-lifecycle.mmd) |
| **18** | **[Observability Architecture](docs/architecture/observability-architecture.mmd)** | OpenTelemetry tracing, structured logs, Prometheus metrics, and alert triggers. | [`docs/architecture/observability-architecture.mmd`](docs/architecture/observability-architecture.mmd) |

### 10.2 Product Management & UX Specifications (`docs/product/`)

- [Product Vision & Strategic Scope](docs/product/vision-and-scope.md) — Product promise, scope bounds, and evidence register.
- [Personas & Jobs to be Done](docs/product/personas-and-jobs-to-be-done.md) — 10 detailed personas with JTBD, permissions, and prohibited actions.
- [Product Requirements Specification (PRD)](docs/product/product-requirements.md) — Structured functional requirements with stable IDs (`REQ-CAR-001`, `REQ-JOB-001`, etc.).
- [Monetization & Business Model Hypotheses](docs/product/monetization-hypotheses.md) — 5-tier SaaS business model, unit economics, and billing risks.
- [User Experience & IA Specification](docs/product/user-experience-specification.md) — Information architecture, route boundaries, 12 UX states, and WCAG accessibility.
- [End-to-End User Journeys](docs/product/user-journeys.md) — 15 complete journeys with frontend, backend, DB, auth, and failure behavior.
- [Feature Traceability Matrix & Gap Register](docs/product/feature-traceability.md) — Cross-document requirements traceability matrix.

### 10.3 Technical Architecture Handbooks (`docs/architecture/`)

- [Master Architecture Handbook](docs/architecture/README.md) — Canonical system architecture handbook with all 18 embedded diagrams.
- [Modular Monolith System Overview](docs/architecture/system-overview.md) — Modular monolith topology, module boundaries, and trade-offs.
- [Relational Database Schema](docs/architecture/database-schema.md) — Comprehensive relational schema with 21+ tables and representative Prisma schema.
- [Data Ownership & Retention](docs/architecture/data-ownership-and-retention.md) — Tenant isolation boundaries, retention periods, and DPDP Act 2023 controls.
- [REST API Architecture Guidelines](docs/architecture/api-design.md) — REST conventions, headers, error envelopes, and HTTP status codes.
- [Asynchronous Queue Processing](docs/architecture/async-processing.md) — BullMQ queues, DLQ triage, retries, and Transactional Outbox pattern.
- [STRIDE Security Threat Model](docs/architecture/security-threat-model.md) — Detailed STRIDE threat model, mitigations, and verification tests.
- [Data Protection & File Handling](docs/architecture/data-protection.md) — Pre-signed S3 URLs, document parsing pipeline, and Zero-PII sanitization.
- [Incident Response Policy](docs/architecture/incident-response.md) — P0-P3 severity levels, CERT-In 6-hour reporting mandate, and post-mortem runbooks.
- [Reliability & Observability](docs/architecture/reliability-and-observability.md) — SLIs/SLOs, telemetry pipelines, and failure-handling matrix.
- [Product Analytics Event Taxonomy](docs/architecture/product-analytics.md) — 14 core event schemas, prohibited properties, and product metrics.
- [Testing Strategy & Quality Gates](docs/architecture/testing-strategy.md) — Test pyramid, mandatory negative test cases, and release readiness gates.
- [Deployment & Environment Management](docs/architecture/deployment-and-environments.md) — 4-tier environments, zero-downtime database migrations, and AWS topology.
- [Third-Party Integration Register](docs/architecture/integration-register.md) — Integration catalog covering AI, jobs, email, storage, and payment providers.
- [Implementation Roadmap](docs/architecture/implementation-roadmap.md) — 5 implementation phases, team work packages, and definition of done.
- [Assumptions, Risks & Open Spikes](docs/architecture/assumptions-risks-and-open-questions.md) — Risk register and prioritized engineering spikes.
- [Domain & Architecture Glossary](docs/architecture/glossary.md) — Indian CA domain terminology and software engineering concepts.
- [Architecture Decision Records (ADRs)](docs/architecture/decisions.md) — 9 formal ADRs detailing foundational system decisions.

### 10.4 API Specifications & Contracts (`api/`)

- [OpenAPI 3.0.3 Contract](api/openapi.yaml) — Formal REST API specification defining endpoints, request/response schemas, and auth scopes.

### 10.5 SRE & Operational Runbooks (`runbooks/`)

- [RB-OPS-001: Production Deployment Checklist](runbooks/deployment.md) — Step-by-step deployment procedure and ECS Fargate commands.
- [RB-OPS-002: Production Rollback Procedure](runbooks/rollback.md) — Rollback triggers and automated reversion steps.
- [RB-OPS-003: Database PITR & Disaster Recovery](runbooks/database-recovery.md) — Point-in-time restoration and database failover procedure.
- [RB-OPS-004: Background Worker Failure & DLQ Triage](runbooks/worker-failures.md) — BullMQ stalled jobs, memory exhaustion, and dead-letter queue triage.
- [RB-OPS-005: Upstream Provider Outage & Failover](runbooks/provider-outages.md) — LLM provider failover, email fallback, and degraded mode operation.
- [RB-OPS-006: Security Incident Containment & Breach Filing](runbooks/security-incident.md) — Session revocation, credential rotation, and CERT-In regulatory notification.

---

## 11. Team Lead & Engineering Quick Reference

This quick reference provides direct, authoritative answers to the 14 core engineering questions required for sprint planning and implementation handover:

| # | Engineering Question | Canonical Design Decision | Reference Specification |
| :-: | :--- | :--- | :--- |
| **1** | **What are we building, and for whom?** | An integrated SaaS career operations copilot for Indian CAs (0–3 yrs post-qualification, CA Final cleared, and independent practitioners). | [Vision & Scope](docs/product/vision-and-scope.md) |
| **2** | **Which user problems are we solving?** | Career path confusion, articleship translation gap, stale job feeds, ATS resume rejections, interview anxiety, and opaque CTC packages. | [Product Requirements](docs/product/product-requirements.md) |
| **3** | **What belongs in the MVP?** | 6-pathway diagnostic, verified job feed, ATS resume tailor with attestation, text mock interviews, CTC calculator, and safe AI agent. | [Implementation Roadmap](docs/architecture/implementation-roadmap.md) |
| **4** | **How do system components interact?** | Modular Monolith (NestJS) with in-process event bus; PostgreSQL + `pgvector` persistence; Redis + BullMQ asynchronous workers. | [System Architecture](docs/architecture/system-overview.md) |
| **5** | **How does every major user workflow operate?** | 15 detailed end-to-end user journeys specifying frontend, backend, database writes, auth gates, and failure recovery. | [User Journeys](docs/product/user-journeys.md) |
| **6** | **How is data stored and isolated?** | Tenant-isolated personal workspaces vs organization workspaces; RLS and tenant-scoped Prisma queries. | [Database Schema](docs/architecture/database-schema.md) |
| **7** | **How does the AI agent safely execute tools?** | 4-tier permission router (`READ_ONLY`, `WRITE`, `EXPLICITLY_APPROVED_EXTERNAL`, `DESTRUCTIVE`) with 15m signed token confirmations. | [Agent Execution Flow](docs/architecture/agent-execution-flow.mmd) |
| **8** | **What API contracts must engineers implement?** | RESTful endpoints with Zod schema validation, unified error envelopes, and idempotency headers. | [OpenAPI 3.0 Contract](api/openapi.yaml) |
| **9** | **How are errors, retries, and side effects managed?** | Distributed Redis locks, exponential backoff with jitter in BullMQ, dead-letter queues, and nightly reconciliation. | [Async Processing](docs/architecture/async-processing.md) |
| **10** | **How is the system tested?** | Automated test pyramid (unit, integration, contract, negative security tests) enforcing the strict Definition of Tested. | [Testing Strategy](docs/architecture/testing-strategy.md) |
| **11** | **How is it deployed and recovered?** | ECS Fargate containers, zero-downtime Prisma migrations, and 6 operational runbooks for rollback, PITR, and failover. | [Deployment Guide](docs/architecture/deployment-and-environments.md) |
| **12** | **What risks and decisions remain?** | 3 active research spikes: job feed licensing (SPK-001), voice latency (SPK-002), and payment gateway tax compliance (SPK-003). | [Assumptions & Risks](docs/architecture/assumptions-risks-and-open-questions.md) |
| **13** | **How should implementation work be assigned?** | 5 phased work packages (WP-01 to WP-16) assigned across Lead Backend, Senior Frontend, AI Engineer, and Platform/DevOps. | [Implementation Roadmap](docs/architecture/implementation-roadmap.md) |
| **14** | **What evidence is required to consider a feature complete?** | Green CI tests, passing negative security invariant tests, OpenAPI contract compliance, and Zero-Fabrication guard assertion. | [Testing Strategy](docs/architecture/testing-strategy.md) |

---

## 12. License & Professional Ethics Notice

This design document is developed for educational and architectural planning purposes, with design constraints informed by the **Chartered Accountants Act, 1949**, and the **ICAI Code of Ethics (2020)**. 

The platform does not provide formal legal, statutory audit, or tax advisory opinions, nor does it facilitate public commercial solicitation for practicing members. Applicable statutory and ethical requirements must be validated against current official ICAI regulations prior to production deployment.
