# CA Career OS — Feature Traceability Matrix & Gap Register

> **Document Type:** End-to-End Architectural Traceability Matrix & Consistency Audit  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Principal Architects, Engineering Leads, QA Leads, Product Managers  

This document links user pain points to product requirements, UX flows, domain modules, API endpoints, backend services, database entities, permission tiers, security controls, test cases, analytics events, and release phases.

---

## 1. End-to-End Traceability Matrix

| Pain Point | Req ID | UX Flow | Module | API Endpoint | Service Responsibility | Database Entity | Permission Tier | Security Control | Test Case ID | Analytics Event | Phase |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Career Pathway Uncertainty** | `REQ-CAR-001` | Journey 1 & 2 (`/app/onboarding`) | `CareerModule` | `POST /api/v1/career/profile` | `CareerIntelligenceService` | `CandidateProfile`, `CandidateSkill` | `WRITE` | Personal workspace guard | `TC-CAR-001` | `candidate.onboarded` | **MVP** |
| **1. Career Pathway Uncertainty** | `REQ-CAR-002` | Journey 2 (`/app/dashboard`) | `CareerModule` | `POST /api/v1/career/diagnostic` | `SkillAssessmentEngine` | `SkillGapReport` | `WRITE` | Redis rate limiting (10/day) | `TC-CAR-002` | `diagnostic.completed` | **MVP** |
| **2. Articleship Experience Gap** | `REQ-CAR-003` | Journey 3 (`/app/dashboard`) | `CareerModule` | `POST /api/v1/career/roadmaps` | `CareerIntelligenceService` | `LearningTask` | `WRITE` | Workspace scope check | `TC-CAR-003` | `roadmap.generated` | **MVP** |
| **3. Fragmented & Stale Jobs** | `REQ-JOB-001` | Journey 11 (`/org/:slug/jobs`) | `JobsModule` | `POST /api/v1/jobs` | `JobIngestionService` | `Job`, `JobSource`, `Employer` | `WRITE` | HMAC signature & 30d expiry | `TC-JOB-001` | `job.ingested` | **MVP** |
| **3. Fragmented & Stale Jobs** | `REQ-JOB-002` | Journey 4 (`/app/jobs`) | `JobsModule` | `GET /api/v1/jobs` | `HybridSearchMatcher` | `Job`, `JobMatch` | `READ_ONLY` | Current Employer Blindfold | `TC-JOB-002` | `jobs.searched` | **MVP** |
| **4. Generic Resumes Failing ATS** | `REQ-RES-001` | Journey 5 (`/app/resume`) | `ResumeModule` | `POST /api/v1/resumes/tailor` | `ResumeBrandingService` | `Resume`, `ResumeVersion` | `WRITE` | ADR-009 Zero-Fabrication Guard | `TC-RES-001` | `resume.tailored` | **MVP** |
| **4. Generic Resumes Failing ATS** | `REQ-RES-002` | Journey 5 (`/app/resume`) | `ResumeModule` | `POST /api/v1/resumes/:id/attest`| `ProvenanceVerifier` | `ResumeVersion` | `WRITE` | Mandatory candidate attestation | `TC-RES-002` | `resume.attested` | **MVP** |
| **5. Interview Apprehension** | `REQ-INT-001` | Journey 7 (`/app/interviews`) | `InterviewModule`| `POST /api/v1/interviews/sessions`| `InterviewSkillsService` | `InterviewSession`, `InterviewFeedback` | `WRITE` | Prompt injection filter | `TC-INT-001` | `mock_interview.completed`| **MVP** |
| **6. Opaque Compensation Packages** | `REQ-FIN-001` | Journey 8 (`/app/offer-compare`)| `FinancialIntel`| `POST /api/v1/financial/unbundle-ctc`| `FinancialIntelService` | `CandidateProfile` | `WRITE` | KMS encryption on offer data | `TC-FIN-001` | `offer.unbundled` | **MVP** |
| **7. Disjointed Career Tools** | `REQ-JOB-003` | Journey 6 (`/app/applications`)| `JobsModule` | `POST /api/v1/applications` | `JobsRecruitmentService` | `Application` | `WRITE` | Idempotency key verification | `TC-JOB-003` | `application.created` | **MVP** |
| **8. Independent Practice Obstacles**| `REQ-PRC-001` | Journey 10 (`/practice/setup`)| `PracticeModule` | `GET /api/v1/practice/checklists` | `PracticeManagementService`| `PracticeTask`, `FirmRegistration`| `READ_ONLY` | ICAI non-solicitation filter | `TC-PRC-001` | `practice_checklist.viewed`| **Phase 3** |
| **Cross-Cutting AI Safety** | `REQ-AGT-001` | Journey 5, 6 (`/app/agent`) | `AgentModule` | `POST /api/v1/approvals/:id/confirm`| `ApprovalGatewayService` | `ApprovalRequest`, `AuditEvent` | `EXPLICITLY_APPROVED_EXTERNAL` | 15m signed token & Redlock | `TC-AGT-001` | `approval.confirmed` | **MVP** |
| **Tenant Isolation & Privacy** | `REQ-SEC-001` | All Workflows | `WorkspaceModule`| All endpoints | `TenantContextGuard` | `Workspace`, `WorkspaceMembership` | Varies | WorkspaceGuard + Postgres RLS | `TC-SEC-001` | `security.access_denied` | **MVP** |

---

## 2. Requirement Consistency & Gap Register

The forensic audit of requirements against architecture documents reveals the following status:

| Requirement Area | API Contract Status | Data Model Status | Authorization Rule | Test Case Defined | Acceptance Criteria | Implementation Phasing | Open Questions / Gaps Remaining |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Career Diagnostic** | Defined (`POST /api/v1/career/diagnostic`) | Fully modeled (`SkillGapReport`) | Scoped to Personal Workspace | `TC-CAR-002` | Defined (P95 $<1.5$s) | **Phase 1 MVP** | None. Ready for backend implementation. |
| **Hybrid Job Search** | Defined (`GET /api/v1/jobs`) | Fully modeled (`Job.embedding`) | Authenticated read | `TC-JOB-002` | Defined (P95 $<400$ms) | **Phase 1 MVP** | Benchmark memory consumption of HNSW index at 100k job rows. |
| **Resume Tailoring** | Defined (`POST /api/v1/resumes/tailor`) | Fully modeled (`ResumeVersion`) | Personal Workspace owner | `TC-RES-001` | Defined (Zero hallucinated facts) | **Phase 1 MVP** | Validate Puppeteer PDF generation latency in serverless vs containerized NestJS. |
| **Mock Interviews** | Defined (`POST /api/v1/interviews/sessions`)| Fully modeled (`InterviewFeedback`) | Personal Workspace owner | `TC-INT-001` | Defined (8 turns max) | **Phase 1 MVP (Text)** | Voice audio streaming deferred to Phase 2; latency testing spike on 4G networks needed. |
| **CTC Unbundling** | Defined (`POST /api/v1/financial/unbundle-ctc`)| Modeled (`CandidateProfile`) | Personal Workspace owner | `TC-FIN-001` | Defined (Deduction accuracy) | **Phase 1 MVP** | Annual updates required when Union Budget notifies tax changes. |
| **AI External Actions** | Defined (`POST /api/v1/approvals/:id/confirm`)| Fully modeled (`ApprovalRequest`)| Signed token check | `TC-AGT-001` | Defined (15m expiration) | **Phase 1 MVP** | Downstream third-party ATS status check needed before retrying external timed-out calls. |
| **Practice Management**| Partially specified | Modeled for Phase 3 | Org Workspace (Firm) | `TC-PRC-001` | Defined (ICAI ethics alignment)| **Phase 3 (Post-MVP)** | Client KYC document encryption schema to be finalized during Phase 3 spike. |
| **Billing & Payments** | Webhook contracts drafted | Modeled (`Subscription`) | Org Admin / Candidate | `TC-BIL-001` | Defined (HMAC verification) | **Phase 2** | Clarify whether candidate Pro plans will use recurring e-mandates or one-time placement passes. |
