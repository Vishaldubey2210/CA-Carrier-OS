# CA Career OS — Product Requirements Specification (PRD)

> **Document Type:** Comprehensive Engineering Product Requirements Document  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Product Managers, Software Engineers, Test Engineers, Security Architects  

This document defines the formal functional and non-functional requirements for CA Career OS. Each requirement uses a permanent identifier (`REQ-[MODULE]-[ID]`) to ensure end-to-end traceability across API contracts, database entities, security controls, test suites, and product analytics.

---

## 1. Requirement Taxonomy & Conventions

```
Requirement ID Structure: REQ-[MODULE]-[NUMBER]
  • REQ-CAR-xxx : Career Intelligence & Roadmaps
  • REQ-JOB-xxx : Jobs & Recruitment Engine
  • REQ-RES-xxx : Resume & Branding (Zero-Fabrication)
  • REQ-INT-xxx : Technical Mock Interview & Skills Lab
  • REQ-FIN-xxx : Financial Intelligence & CTC Unbundler
  • REQ-PRC-xxx : Post-Qual & Practice Management
  • REQ-AGT-xxx : AI Career Agent & Permission Gateway
  • REQ-SEC-xxx : Security, Identity & Multi-Tenancy
  • REQ-OPS-xxx : Observability & Background Processing
```

---

## 2. Core Functional Requirements

### Module A: Career Intelligence

#### `REQ-CAR-001`: Candidate Onboarding & Articleship Capability Inventory
- **Problem Statement:** Candidates struggle to articulate articleship exposure in structured, searchable, and corporate-relevant terms.
- **User Persona:** Persona 1 (CA Final Cleared) & Persona 2 (Newly Qualified CA).
- **User Story:** *As a newly qualified CA, I want to record my articleship firm tier, audit domains, and software tools so that the platform understands my true capability profile.*
- **Functional Requirement:** The system must provide a multi-step onboarding flow capturing: firm tier (Big 4, Top 20, Mid-Size, Small), primary domains (Stat Audit, Tax, ROC, FP&A), key client industries (BFSI, Manufacturing, IT/SaaS), examination attempt count, and target cities.
- **Inputs:** `articleshipFirmTier`, `articleshipAreas[]`, `targetCities[]`, `qualificationAttempt`, `softwareProficiencies[]`.
- **Outputs:** Created/updated `CandidateProfile` and normalized `CandidateSkill` records.
- **Preconditions:** User is authenticated via JWT and operating in their `PERSONAL` workspace.
- **Business Rules:** Firm tier and domain tags must be selected from a standardized taxonomy; custom tags require normalization.
- **Success Path:** User submits onboarding form $\rightarrow$ system saves profile $\rightarrow$ triggers `REQ-CAR-002` diagnostic calculation $\rightarrow$ redirects to career dashboard.
- **Failure Paths:** Incomplete required fields return HTTP 400 with field-level validation errors.
- **Authorization Requirement:** `CandidateProfile` write access restricted to workspace owner (`memberRole: OWNER` in `PERSONAL` workspace).
- **Data Required:** Standardized skills taxonomy, Indian city lists, ICAI firm tier classifications.
- **Acceptance Criteria:**
  1. Profile saves within 500ms.
  2. All selected domains automatically populate `CandidateSkill` table with `source: articleship`.
  3. Attempting to submit empty domains returns validation error.
- **Related API:** `POST /api/v1/career/profile`.
- **Related Database Entities:** `CandidateProfile`, `CandidateSkill`, `Skill`.
- **Related Security Controls:** Zod schema validation; personal workspace isolation guard.
- **Analytics Event:** `candidate.onboarded`.
- **Dependencies:** None.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

#### `REQ-CAR-002`: 6-Pathway Diagnostic Assessment & Skill-Gap Analysis
- **Problem Statement:** Newly qualified CAs face decision paralysis when choosing between Audit, Tax, FP&A, Corporate Finance, Investment Banking, and Consulting.
- **User Persona:** Persona 1 & Persona 2.
- **User Story:** *As a candidate, I want to evaluate my profile fit against 6 core CA pathways so that I know where I stand and what gaps I must bridge.*
- **Functional Requirement:** System calculates a deterministic fit percentage ($0-100\%$) across 6 pathways based on articleship exposure, technical skills, and candidate preferences, producing an explainable `SkillGapReport`.
- **Inputs:** `CandidateProfile.id`, target role selection.
- **Outputs:** `SkillGapReport` record containing fit percentages, missing core skills, and recommended bridging tasks.
- **Preconditions:** Profile must have completed onboarding (`REQ-CAR-001`).
- **Business Rules:** Scoring must be explainable (e.g. "+30% for Statutory Audit in Big 10; -20% missing 3-statement financial modeling"). No firm disparagement.
- **Success Path:** Candidate requests diagnostic $\rightarrow$ system executes scoring engine $\rightarrow$ caches result in Redis (1h TTL) $\rightarrow$ renders radar chart in UI.
- **Failure Paths:** If scoring engine fails, returns default domain breakdown based on raw articleship domain count.
- **Authorization Requirement:** Scoped strictly to candidate's personal workspace.
- **Data Required:** Role requirement matrices for 6 CA pathways.
- **Acceptance Criteria:**
  1. Diagnostic returns in $<1.5$ seconds.
  2. Every score includes at least 3 explainable match factors.
  3. Skill gaps link to actionable `LearningTask` records.
- **Related API:** `POST /api/v1/career/diagnostic`.
- **Related Database Entities:** `SkillGapReport`, `LearningTask`.
- **Related Security Controls:** Rate limited to 10 diagnostic runs per day per user.
- **Analytics Event:** `diagnostic.completed`.
- **Dependencies:** `REQ-CAR-001`.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

### Module B: Jobs & Recruitment

#### `REQ-JOB-001`: Verified Job Feed Ingestion & Deduplication
- **Problem Statement:** Job seekers waste time on duplicate, expired, and unverified CA job postings across the web.
- **User Persona:** Persona 1, 2, 6, 7.
- **User Story:** *As a job seeker, I want to see only verified, deduplicated, and currently active CA job listings with clear salary and location details.*
- **Functional Requirement:** Background ingestion worker ingests jobs from authorized partner feeds and direct employer postings, normalizes titles, checks SHA-256 fingerprint deduplication, and sets 30-day auto-expiry.
- **Inputs:** Raw job feed payload (JSON/Webhook).
- **Outputs:** Persisted, deduplicated `Job` record with status `ACTIVE`.
- **Preconditions:** Ingestion source must possess verified HMAC signature or authenticated employer workspace.
- **Business Rules:** Unapproved web scraping is strictly blocked; fingerprint = `SHA-256(company + normalizedTitle + city)`; duplicate within 30 days refreshes timestamp only.
- **Success Path:** Worker ingests payload $\rightarrow$ verifies signature $\rightarrow$ checks duplicate hash $\rightarrow$ inserts `Job` $\rightarrow$ triggers vector embedding generation (`REQ-JOB-002`).
- **Failure Paths:** Signature mismatch drops request with HTTP 401; malformed payload enqueued to DLQ.
- **Authorization Requirement:** Recruiter organization workspace or signed webhook worker.
- **Data Required:** Standardized titles taxonomy, Indian cities, employer verification records.
- **Acceptance Criteria:**
  1. Identical job postings from different feeds merge into single listing.
  2. Listings older than 30 days without re-verification automatically marked `EXPIRED`.
- **Related API:** `POST /api/v1/webhooks/jobs/ingest`.
- **Related Database Entities:** `Job`, `JobSource`, `Employer`.
- **Related Security Controls:** HMAC-SHA256 webhook signature validation; rate limiting on ingestion endpoints.
- **Analytics Event:** `job.ingested`, `job.deduplicated`.
- **Dependencies:** BullMQ queue infrastructure.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

#### `REQ-JOB-002`: Hybrid Lexical + Vector Semantic Job Search
- **Problem Statement:** Keyword-only search fails to match conceptual skills (e.g. "FP&A" to "budgeting and financial modeling"), while pure vector search misses exact statutory terms ("Ind AS 115").
- **User Persona:** Persona 1, 2, 3.
- **User Story:** *As a candidate, I want to search jobs using natural keywords or pathway filters and get results ranked by true skill relevance.*
- **Functional Requirement:** Hybrid search engine executing PostgreSQL Full-Text Search (GIN index) and `pgvector` cosine similarity (HNSW index), merged via Reciprocal Rank Fusion (RRF).
- **Inputs:** `query` string, `pathway` filter, `city` filter, `minSalary` filter, pagination parameters.
- **Outputs:** Paginated list of `Job` records with explainable `matchScore` ($0.0-1.0$).
- **Preconditions:** Jobs must be in `ACTIVE` status and within validity window.
- **Business Rules:** Search algorithms strictly exclude the candidate's current articleship/employment firm (Current Employer Blindfold).
- **Success Path:** Candidate submits query $\rightarrow$ backend runs parallel FTS + vector query $\rightarrow$ calculates RRF score $\rightarrow$ returns top 20 ranked jobs.
- **Failure Paths:** If vector query times out (>2s), fall back automatically to pure PostgreSQL FTS.
- **Authorization Requirement:** Authenticated user session.
- **Data Required:** Pre-generated 1536-dimensional job embeddings in `pgvector`.
- **Acceptance Criteria:**
  1. P95 query response time $< 400$ms.
  2. Exact statutory keywords (e.g. "Transfer Pricing") appear in top 3 results.
- **Related API:** `GET /api/v1/jobs`.
- **Related Database Entities:** `Job`, `JobMatch`.
- **Related Security Controls:** SQL injection prevention via Prisma parameterized queries.
- **Analytics Event:** `jobs.searched`, `job.viewed`.
- **Dependencies:** `REQ-JOB-001`, `pgvector` extension.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

### Module C: Resume & Professional Branding

#### `REQ-RES-001`: Job-Tailored ATS Resume Generator with Zero-Fabrication Guard (ADR-009)
- **Problem Statement:** Standard CA resumes get filtered by corporate ATS systems, but generative AI tools often hallucinate non-existent audit clients or false financial metrics, risking ethics violations.
- **User Persona:** Persona 1, 2, 3.
- **User Story:** *As a candidate, I want my resume bullet points tailored to the target role without the AI inventing any fake metrics or unverified facts.*
- **Functional Requirement:** Tailoring engine reformulates candidate's verified profile data to highlight relevance to target `jobId`, enforcing the **Zero-Fabrication Guard**: AI cannot add metrics, certifications, or firm names not in verified profile. Requires explicit candidate claim attestation before PDF export.
- **Inputs:** `baseResumeId`, `targetJobId`, `focusAreas[]`.
- **Outputs:** `ResumeVersion` record in `DRAFT_PENDING_ATTESTATION` state with provenance links.
- **Preconditions:** Candidate must have an existing base resume and verified profile.
- **Business Rules:** Generated bullet points must map to verified `CandidateSkill` or profile entries. The resume **cannot be exported or attached to an application** until the candidate checks the mandatory attestation checkbox: *"I attest that all achievements and metrics represent true, verified experience."*
- **Success Path:** Candidate clicks tailor $\rightarrow$ LLM formats bullet points within strict schema $\rightarrow$ provenance verifier confirms zero added metrics $\rightarrow$ draft saved $\rightarrow$ candidate reviews and attests $\rightarrow$ PDF generated in S3.
- **Failure Paths:** If LLM generates ungrounded metric, provenance verifier flags the line and prompts candidate to enter verified value or discard.
- **Authorization Requirement:** Personal workspace owner only.
- **Data Required:** Candidate verified profile, target job description.
- **Acceptance Criteria:**
  1. 100% of generated bullet points trace back to candidate input data.
  2. Un-attested resumes cannot be downloaded or submitted.
- **Related API:** `POST /api/v1/resumes/tailor`, `POST /api/v1/resumes/:id/attest`.
- **Related Database Entities:** `Resume`, `ResumeVersion`.
- **Related Security Controls:** ADR-009 Zero-Fabrication Guard; S3 pre-signed URLs with 15-minute TTL.
- **Analytics Event:** `resume.tailored`, `resume.attested`.
- **Dependencies:** LLM Provider Adapter, S3 storage client.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

### Module D: Interview & Skills Lab

#### `REQ-INT-001`: Role-Specific Technical Mock Interview Drills
- **Problem Statement:** Newly qualified CAs lack realistic, high-pressure technical interview practice for Ind AS, GST disputes, and financial modeling.
- **User Persona:** Persona 1 & Persona 2.
- **User Story:** *As a candidate, I want to practice interactive technical mock interviews with an AI simulating a Big 4 partner so that I can master technical Ind AS disclosures.*
- **Functional Requirement:** Multi-turn conversational interview engine conducting an 8-turn technical drill based on role and domain (e.g. Ind AS 115 revenue recognition cases), producing an objective feedback scorecard.
- **Inputs:** `targetRole`, `domain: AUDIT | TAX | FPA`, `difficulty: JUNIOR | MID`.
- **Outputs:** `InterviewSession` record, interactive turns, and final `InterviewFeedback` rubric scorecard (Technical Accuracy, Clarity, Regulatory Depth, 0–100).
- **Preconditions:** Candidate is authenticated in Personal Workspace.
- **Business Rules:** Synthetic and properly licensed technical case scenarios only. Transcripts are confidential and inaccessible to employers. Max 8 turns per session.
- **Success Path:** Candidate initiates session $\rightarrow$ AI poses technical scenario $\rightarrow$ candidate submits answer $\rightarrow$ AI evaluates and asks follow-up $\rightarrow$ session completes $\rightarrow$ scorecard generated.
- **Failure Paths:** Inactivity $>15$ minutes marks session as `ABANDONED`; candidate can resume within 1 hour.
- **Authorization Requirement:** Candidate Personal Workspace only.
- **Data Required:** Technical Ind AS/Tax scenario question banks.
- **Acceptance Criteria:**
  1. Each turn responds within 2 seconds.
  2. Feedback scorecard details specific technical strengths and missed disclosure standards.
- **Related API:** `POST /api/v1/interviews/sessions`, `POST /api/v1/interviews/sessions/:id/turns`.
- **Related Database Entities:** `InterviewSession`, `InterviewFeedback`.
- **Related Security Controls:** Session rate limiting (max 5 sessions/day); prompt injection filtering on candidate answers.
- **Analytics Event:** `interview.started`, `interview.completed`.
- **Dependencies:** LLM Provider Adapter.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

### Module E: Financial Intelligence

#### `REQ-FIN-001`: CTC Offer Unbundling & Tax Estimation Calculator
- **Problem Statement:** Corporate job offers present inflated Cost-To-Company (CTC) figures hiding variable bonuses, non-cash perks, and retiral deductions.
- **User Persona:** Persona 1 & Persona 2.
- **User Story:** *As a candidate holding an offer letter, I want to unbundle fixed pay, bonuses, and gratuity so that I know my exact monthly in-hand take-home after tax.*
- **Functional Requirement:** Unbundling engine that breaks down gross CTC into: Fixed Basic Pay, HRA, Special Allowances, Performance Variable Pay, Joining Bonus (with clawback clauses), Employer PF, and Gratuity; computes net take-home under Old vs New Indian Tax Regimes.
- **Inputs:** `grossCtc`, `fixedComponent`, `variableComponent`, `joiningBonus`, `cityTier: METRO | NON_METRO`.
- **Outputs:** Monthly take-home estimate, tax comparison table, and bonus risk rating.
- **Preconditions:** Authenticated user session.
- **Business Rules:** Calculations must explicitly state effective fiscal year tax rules (e.g. Finance Act 2024/2025). Marked as directional calculation, not legal tax advisory.
- **Success Path:** User enters offer terms $\rightarrow$ system calculates deductions $\rightarrow$ displays side-by-side Old vs New regime breakdown.
- **Failure Paths:** Missing fixed component flags validation error; numbers must be positive integers.
- **Authorization Requirement:** Personal Workspace only. Offer data is encrypted at rest via KMS.
- **Data Required:** Indian Income Tax slab rules database (stamped with effective fiscal year).
- **Acceptance Criteria:**
  1. Computation executes in $< 100$ms client/server-side.
  2. Retiral benefits (PF, gratuity) clearly separated from monthly in-hand pay.
- **Related API:** `POST /api/v1/financial/unbundle-ctc`.
- **Related Database Entities:** `CandidateProfile`.
- **Related Security Controls:** KMS encryption on confidential offer terms; zero logging of salary figures in telemetry.
- **Analytics Event:** `ctc.unbundled`.
- **Dependencies:** None.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

### Module F: Post-Qualification & Practice Management

#### `REQ-PRC-001`: Post-Qualification Regulatory Checklist & COP Guidance
- **Problem Statement:** Candidates clearing CA Final lack a single, clear compliance roadmap for ICAI Associate Membership (Form 2) and Certificate of Practice (Form 6).
- **User Persona:** Persona 1 & Persona 5 (Practitioner).
- **User Story:** *As a newly qualified CA planning to practice, I want a verified checklist of ICAI regulatory steps so that I can apply for my COP without procedural errors.*
- **Functional Requirement:** Interactive checklist detailing regulatory milestones: ICAI Form 2 (ACA), Form 6 (Full-time / Part-time COP), regional council registration, firm name approval, and ICAI Code of Ethics compliance rules.
- **Inputs:** `qualificationDate`, `intendedPracticeMode: FULL_TIME | PART_TIME`.
- **Outputs:** Tailored checklist with direct deep-links to official ICAI Self Service Portal (SSP) pages, stamped with retrieval dates.
- **Preconditions:** Authenticated session.
- **Business Rules:** Strictly educational guidance; displays "As of [Date]" stamp. Prohibits any client solicitation or public advertising features (Clauses 6 & 7 of CA Act).
- **Success Path:** User selects practice mode $\rightarrow$ checklist generates $\rightarrow$ user tracks completion of each statutory form.
- **Failure Paths:** None (static schema-driven rules).
- **Authorization Requirement:** Authenticated user.
- **Data Required:** ICAI regulatory timeline database.
- **Acceptance Criteria:**
  1. All links point to verified official `.icai.org` domains.
  2. Disclaimer displayed prominently: *"Informational guidance only; verify against current official ICAI notifications."*
- **Related API:** `GET /api/v1/practice/checklists`.
- **Related Database Entities:** `Workspace`, `FirmRegistration`.
- **Related Security Controls:** Deep-links open with `rel="noopener noreferrer"`.
- **Analytics Event:** `practice_checklist.viewed`.
- **Dependencies:** None.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

### Module G: AI Career Agent & Governance

#### `REQ-AGT-001`: Deterministic 4-Tier Permission Router & Approval Gateway
- **Problem Statement:** Autonomous AI agents executing real-world side effects without human oversight can spam recruiters, apply to wrong jobs, or delete user documents.
- **User Persona:** All Personas.
- **User Story:** *As a candidate, I want my AI career copilot to ask for my explicit confirmation before applying to jobs or messaging recruiters so that I remain in full control.*
- **Functional Requirement:** Server-side gateway enforcing 4 permission tiers (`READ_ONLY`, `WRITE`, `EXPLICITLY_APPROVED_EXTERNAL`, `DESTRUCTIVE`). External actions generate an interactive Approval Card in UI with a signed token and 15-minute expiration timer.
- **Inputs:** Agent tool execution request (tool name, arguments).
- **Outputs:** Direct execution response or interactive `ApprovalRequest` card.
- **Preconditions:** Authenticated user operating within active workspace.
- **Business Rules:**
  - `READ_ONLY`: Executes automatically.
  - `WRITE`: Requires idempotency key and DB transaction.
  - `EXPLICITLY_APPROVED_EXTERNAL`: Requires user click on UI card within 15 minutes.
  - `DESTRUCTIVE`: Requires 2-step confirmation modal and statutory retention check.
- **Success Path (External):** Agent requests `submit_job_application` $\rightarrow$ gateway returns Approval Card $\rightarrow$ candidate clicks "Confirm" in UI $\rightarrow$ gateway validates signed token and executes external action $\rightarrow$ audit log recorded.
- **Failure Paths:** Token expired (>15m) returns HTTP 410 Gone; user clicks "Decline" aborts action with zero external mutation.
- **Authorization Requirement:** Signed token verified against active `workspaceId` and user identity.
- **Data Required:** Tool registry allowlist and JSON schemas.
- **Acceptance Criteria:**
  1. Agent physically cannot execute external action without valid signed token.
  2. Approval tokens automatically expire in Redis after 900 seconds.
- **Related API:** `POST /api/v1/agent/chat`, `POST /api/v1/approvals/:id/confirm`, `POST /api/v1/approvals/:id/decline`.
- **Related Database Entities:** `AgentToolExecution`, `ApprovalRequest`, `AuditEvent`.
- **Related Security Controls:** HMAC-SHA256 signed approval tokens; Redis distributed locking.
- **Analytics Event:** `approval.requested`, `approval.confirmed`, `approval.declined`.
- **Dependencies:** Redis, BullMQ.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.

---

### Module H: Security, Multi-Tenancy & Operations

#### `REQ-SEC-001`: Dual-Workspace Multi-Tenant Isolation & Current Employer Blindfold
- **Problem Statement:** If a candidate's current employer (firm or corporate) uses the platform, the candidate risks career retaliation if their job search activity is visible.
- **User Persona:** Persona 1, 2, 3, 6, 7.
- **User Story:** *As an actively employed candidate, I want complete privacy from my current employer so that they cannot see my job applications or career exploration.*
- **Functional Requirement:** Workspace multi-tenancy model partitioning data into `PERSONAL` (candidate) and `ORGANIZATION` (employer/firm) workspaces. Recruiter searches and recommendations programmatically exclude candidates who have tagged the recruiter's organization as their current employer.
- **Inputs:** `X-Workspace-Id` header, user session token.
- **Outputs:** Filtered, tenant-isolated query results.
- **Preconditions:** Valid user session.
- **Business Rules:** Database queries must enforce `where: { workspaceId }`. Employer organization members can never inspect Personal Workspaces.
- **Success Path:** Request passes `WorkspaceGuard` $\rightarrow$ resolves active tenant context $\rightarrow$ executes scoped query $\rightarrow$ returns isolated data.
- **Failure Paths:** Querying resources with mismatched `workspaceId` returns HTTP 403 Forbidden.
- **Authorization Requirement:** `WorkspaceMembership` validation.
- **Data Required:** `Workspace`, `WorkspaceMembership`, `Employer`.
- **Acceptance Criteria:**
  1. Automated test suite proves Employer A cannot read Candidate B's Personal Workspace data.
  2. Current employer cannot search or view their own employees in candidate search.
- **Related API:** All `/api/v1/*` endpoints.
- **Related Database Entities:** `Workspace`, `WorkspaceMembership`.
- **Related Security Controls:** `WorkspaceGuard`, PostgreSQL Row-Level Security (RLS) baseline.
- **Analytics Event:** `workspace.switched`, `security.access_denied`.
- **Dependencies:** Prisma middleware.
- **Phasing & Status:** **MVP (Phase 1)** | *Implementation Pending*.
