# CA Career OS — Engineering Implementation Roadmap & Work Breakdown

> **Document Type:** Engineering Project Management, Sprints & Work Package Breakdown  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Engineering Leads, Project Managers, Staff Engineers, QA Leads  

---

## 1. Phased Implementation Roadmap Overview

```
Phase 1: Foundations & Architecture Baseline
  │
  ▼
Phase 2: Career Launch MVP (Core Candidate & Recruiter Workflows)
  │
  ▼
Phase 3: Career Intelligence & Simulation Expansion
  │
  ▼
Phase 4: Independent Practice Management Suite
  │
  ▼
Phase 5: SaaS Commercialization, Enterprise Scale & Telemetry
```

---

## 2. Detailed Work Package Breakdown

### Phase 1: Foundations & Core Architecture Baseline
- **WP-1.1: Monorepo Scaffolding & CI Pipeline**
  - *Deliverables:* Turborepo monorepo setup (`apps/web`, `apps/api`), ESLint, Prettier, TypeScript configs, GitHub Actions CI.
  - *Responsible Role:* DevSecOps / Platform Engineer.
  - *Acceptance Criteria:* Clean build, lint, and test pass on GitHub Actions.
- **WP-1.2: Identity, Authentication & Multi-Tenant Workspaces**
  - *Deliverables:* Prisma schema migrations for `users`, `workspaces`, `workspace_memberships`; JWT issue & refresh token cookies; `WorkspaceGuard`.
  - *Responsible Role:* Staff Backend Engineer.
  - *Acceptance Criteria:* Passing `TC-SEC-TENANT-001` test suite proving workspace isolation.
- **WP-1.3: Persistence Tier & pgvector Infrastructure**
  - *Deliverables:* Docker Compose with Postgres 16 + `pgvector` and Redis 7; Prisma client generation; HNSW vector index migration.
  - *Responsible Role:* Database Architect.

---

### Phase 2: Career Launch MVP (Phase 1 Baseline)
- **WP-2.1: Candidate Onboarding & Articleship Capability Inventory**
  - *Deliverables:* `/app/onboarding` multi-step UI; `POST /api/v1/career/profile`; skills taxonomy.
  - *Responsible Role:* Full-Stack Engineer.
  - *Acceptance Criteria:* Candidate profile successfully saves within 500ms.
- **WP-2.2: Career Diagnostic & 30/60/90-Day Roadmaps**
  - *Deliverables:* Heuristic & LLM scoring engine across 6 CA pathways; `SkillGapReport` generator.
  - *Responsible Role:* AI / Backend Engineer.
- **WP-2.3: Verified Job Feed Ingestion & Hybrid Search**
  - *Deliverables:* BullMQ ingestion worker; SHA-256 deduplication; `GET /api/v1/jobs` with RRF scoring.
  - *Responsible Role:* Backend Engineer.
  - *Acceptance Criteria:* P95 search latency $<400$ms with Current Employer Blindfold enforced.
- **WP-2.4: ATS Resume Builder with Zero-Fabrication Guard (ADR-009)**
  - *Deliverables:* Resume tailoring engine; provenance verifier; candidate attestation modal; PDF export worker.
  - *Responsible Role:* AI Engineer / Full-Stack Engineer.
  - *Acceptance Criteria:* 100% of resume claims verified before export; unattested export blocked.
- **WP-2.5: Text-Based Technical Mock Interview Drills**
  - *Deliverables:* 8-turn technical drill engine for Ind AS 115 and Transfer Pricing; feedback scorecards.
  - *Responsible Role:* AI Systems Engineer.
- **WP-2.6: AI Agent Deterministic Permission Gateway (ADR-004)**
  - *Deliverables:* `ToolPolicyEngine`; 15-minute signed token Approval Card in chat UI; Redis Redlock.
  - *Responsible Role:* Application Security / Staff Backend Engineer.
  - *Acceptance Criteria:* External actions physically cannot execute without user click.

---

### Phase 3: Career Intelligence & Simulation Expansion
- **WP-3.1: Turn-Based Audio Voice Mock Interviews**
  - *Deliverables:* Browser audio recording; Whisper API transcription; speech synthesis.
- **WP-3.2: Employer ATS Partner Webhooks**
  - *Deliverables:* Webhook listeners for Greenhouse, Lever, Darwinbox with HMAC signature verification.
- **WP-3.3: Practical Skills Modeling Lab**
  - *Deliverables:* Synthetic Excel financial modeling evaluation drills with formula checkers.

---

### Phase 4: Independent Practice Management Suite
- **WP-4.1: Post-Qualification Checklist & COP Guidance**
  - *Deliverables:* Interactive ICAI Form 2 / Form 6 tracker with verified deep-links.
- **WP-4.2: Practice CRM & Client Master**
  - *Deliverables:* Client onboarding, KYC document tracking, SA 210 engagement letter generator.
- **WP-4.3: Statutory Compliance Deadline Calendar**
  - *Deliverables:* GST, Income Tax, and ROC statutory deadline calendar with automated client alerts.

---

### Phase 5: SaaS Commercialization & Enterprise Scale
- **WP-5.1: Razorpay Payment Gateway & Subscription Mandates**
  - *Deliverables:* Candidate Pro plans, Employer team packages, GSTIN-compliant tax invoices.
- **WP-5.2: Enterprise Observability & SIEM WORM Audit Stream**
  - *Deliverables:* OpenTelemetry tracing, Grafana dashboards, S3 Object Lock audit archive.
