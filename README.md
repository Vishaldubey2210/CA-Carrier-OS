# CA Career OS

> **Intelligent Career Management & Professional Growth Workspace for Chartered Accountants**  
> *From CA qualification to career leadership — one integrated, secure workspace.*

[![Status](https://img.shields.io/badge/Status-Architecture%20Blueprint%20%7C%20Implementation%20Pending-yellow.svg)](#8-architecture-status)
[![Security Model](https://img.shields.io/badge/Security-Zero--Trust%20%7C%20Human--in--the--Loop-blue.svg)](#6-security--privacy-principles)
[![Architecture](https://img.shields.io/badge/Pattern-Modular%20Monolith%20(NestJS)-green.svg)](docs/architecture/decisions.md#adr-001-modular-monolith-architecture-over-microservices)
[![Documentation](https://img.shields.io/badge/Docs-Architecture%20Handbook-blueviolet.svg)](docs/architecture/README.md)
[![Diagrams](https://img.shields.io/badge/Mermaid%20Diagrams-18%20Validated-brightgreen.svg)](docs/architecture/README.md#2-visual-architecture-diagrams-handbook)

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

## 5. Technology Stack Baseline

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

## 6. Security & Privacy Principles

1. **Workspace Multi-Tenancy:** Candidates operate in strictly isolated *Personal Workspaces*. Employers operate in *Organization Workspaces*. A candidate's job searches and applications are strictly invisible to their current employer.
2. **Zero-Fabrication Policy (ADR-009):** The resume generation engine is programmatically constrained from fabricating client names, engagement values, or professional metrics. All resume claims require candidate verification and attestation.
3. **No Autonomous External Side Effects:** The AI Career Agent can never submit applications, message recruiters, or book paid sessions without explicit, time-bounded user confirmation in the browser UI.
4. **Zero-PII Audit Logging (ADR-008):** Audit streams record actors, tools, and operation outcomes, but strip PII, credentials, full resume text, and financial numbers from log sinks using SHA-256 hashes.
5. **Data Protection & Legal Review Notice:** Features handling tax, legal, and ICAI regulatory guidelines are designed for alignment with the **Chartered Accountants Act, 1949**, and the **ICAI Code of Ethics (2020)**.

---

## 7. MVP Scope vs. Phased Roadmap

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

## 8. Architecture Status

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

## 9. Master Documentation & Architecture Blueprint Index

The CA Career OS engineering blueprint is structured across the following master specifications:

### 9.1 Visual Architecture Diagrams (18 Canonical Views)

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

### 9.2 Product Management & UX Specifications (`docs/product/`)

- [Product Vision & Strategic Scope](docs/product/vision-and-scope.md) — Product promise, scope bounds, and evidence register.
- [Personas & Jobs to be Done](docs/product/personas-and-jobs-to-be-done.md) — 10 detailed personas with JTBD, permissions, and prohibited actions.
- [Product Requirements Specification (PRD)](docs/product/product-requirements.md) — Structured functional requirements with stable IDs (`REQ-CAR-001`, `REQ-JOB-001`, etc.).
- [Monetization & Business Model Hypotheses](docs/product/monetization-hypotheses.md) — 5-tier SaaS business model, unit economics, and billing risks.
- [User Experience & IA Specification](docs/product/user-experience-specification.md) — Information architecture, route boundaries, 12 UX states, and WCAG accessibility.
- [End-to-End User Journeys](docs/product/user-journeys.md) — 15 complete journeys with frontend, backend, DB, auth, and failure behavior.
- [Feature Traceability Matrix & Gap Register](docs/product/feature-traceability.md) — Cross-document requirements traceability matrix.

### 9.3 Technical Architecture Handbooks (`docs/architecture/`)

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

### 9.4 API Specifications & Contracts (`api/`)

- [OpenAPI 3.0.3 Contract](api/openapi.yaml) — Formal REST API specification defining endpoints, request/response schemas, and auth scopes.

### 9.5 SRE & Operational Runbooks (`runbooks/`)

- [RB-OPS-001: Production Deployment Checklist](runbooks/deployment.md) — Step-by-step deployment procedure and ECS Fargate commands.
- [RB-OPS-002: Production Rollback Procedure](runbooks/rollback.md) — Rollback triggers and automated reversion steps.
- [RB-OPS-003: Database PITR & Disaster Recovery](runbooks/database-recovery.md) — Point-in-time restoration and database failover procedure.
- [RB-OPS-004: Background Worker Failure & DLQ Triage](runbooks/worker-failures.md) — BullMQ stalled jobs, memory exhaustion, and dead-letter queue triage.
- [RB-OPS-005: Upstream Provider Outage & Failover](runbooks/provider-outages.md) — LLM provider failover, email fallback, and degraded mode operation.
- [RB-OPS-006: Security Incident Containment & Breach Filing](runbooks/security-incident.md) — Session revocation, credential rotation, and CERT-In regulatory notification.

---

## 10. License & Professional Ethics Notice

This design document is developed for educational and architectural planning purposes, with design constraints informed by the **Chartered Accountants Act, 1949**, and the **ICAI Code of Ethics (2020)**. 

The platform does not provide formal legal, statutory audit, or tax advisory opinions, nor does it facilitate public commercial solicitation for practicing members. Applicable statutory and ethical requirements must be validated against current official ICAI regulations prior to production deployment.
