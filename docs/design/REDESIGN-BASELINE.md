# CA Career OS — Redesign Baseline & Architectural Gap Audit

> **Document Type:** Pre-Redesign Architectural Baseline & Inventory  
> **Repository:** `Vishaldubey2210/CA-Carrier-OS`  
> **Date:** October 21, 2026  
> **Lead Roles:** Principal Product Designer, Senior Full-Stack Engineer, Database Architect  

---

## 1. Route & Component Inventory

| Route | Page File | Intended Role | Current Data Source | Current UI Paradigm |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `apps/web/src/app/page.tsx` | Public Landing / Authenticated Dashboard | Mixed (Static hardcoded metric cards + navigation links) | Monolithic AppShell (Sidebar visible to public visitors) |
| `/login` | `apps/web/src/app/login/page.tsx` | Authentication Sign-In | Dynamic (`POST /api/v1/auth/login`) | Form card inside AppShell with sidebar |
| `/register` | `apps/web/src/app/register/page.tsx` | Account Registration | Dynamic (`POST /api/v1/auth/register`) | Form card inside AppShell with sidebar |
| `/career` | `apps/web/src/app/career/page.tsx` | Career Diagnostic & Roadmap | Dynamic (`GET/PATCH /api/v1/career/roadmap`) + local state | Tabbed diagnostic cards with pre-seeded fallback |
| `/jobs` | `apps/web/src/app/jobs/page.tsx` | Job Search & Application Tracker | Dynamic (`GET /api/v1/jobs`, `GET /api/v1/applications`) | Filter sidebar, job detail modal, tracking tabs |
| `/resumes` | `apps/web/src/app/resumes/page.tsx` | Resume Studio & Form 108 OCR | Dynamic (`POST /api/v1/resumes/upload-document`) + local | Tabbed resume builder, variant cards, OCR upload |
| `/interviews` | `apps/web/src/app/interviews/page.tsx` | Technical Question Bank & Agent | Dynamic (`POST /api/v1/agent/chat`) + local bank | Question grid, 3-question mock runner, chat drawer |
| `/growth` | `apps/web/src/app/growth/page.tsx` | Salary, CTC, Mentorship, Community | Dynamic (`GET /api/v1/financial/...`, mentorship) | Tabbed financial and networking views |
| `/practice` | `apps/web/src/app/practice/page.tsx` | Post-Qualification Checklist & CRM | Dynamic (`GET/POST /api/v1/practice/...`) | Checklist, client table, compliance calendar |
| `/billing` | `apps/web/src/app/billing/page.tsx` | SaaS Subscriptions & Invoices | Dynamic (`GET /api/v1/billing/plans`, checkout) | Pricing tier cards, frequency toggle, invoice table |

---

## 2. Database Model & Migration Reconciliation

In earlier reports, model counts were inconsistently described (e.g. 34 vs 42 models). A definitive parse of [schema.prisma](../../apps/api/prisma/schema.prisma) confirms:
- **Prisma Models (39 total):**
  - *Identity & Workspaces (5):* `User`, `Workspace`, `WorkspaceMembership`, `RefreshToken`, `WorkspaceInvitation`
  - *Billing & Subscriptions (4):* `Subscription`, `PaymentTransaction`, `InvoiceRecord`, `WebhookEventLog`
  - *Career & Profiles (3):* `CandidateProfile`, `CareerRoadmap`, `CareerTask`
  - *Jobs & Applications (5):* `Job`, `SavedJob`, `Application`, `ApplicationStatusHistory`, `FollowUpTask`
  - *Resumes & Portfolio (3):* `Resume`, `ResumeVersion`, `PortfolioEntry`
  - *Interviews & Assessment (2):* `InterviewSession`, `InterviewQuestionItem`
  - *AI Agent & Approvals (3):* `AgentConversation`, `AgentMessage`, `ApprovalRequest`
  - *Security & Audit (1):* `AuditEvent`
  - *Financial Intelligence (2):* `SalaryBenchmark`, `OfferComparison`
  - *Employers & Recruitment (3):* `EmployerProfile`, `EmployerVerificationRequest`, `RecruitmentApplicationReview`
  - *Mentorship (2):* `MentorProfile`, `MentorBooking`
  - *Community (3):* `CommunityPost`, `CommunityReply`, `CommunityReport`
  - *Practice OS (3):* `PostQualificationChecklist`, `PracticeClient`, `PracticeComplianceTask`
- **Prisma Enums (6 total):**
  `UserRole`, `WorkspaceType`, `MemberRole`, `CAPathway`, `ApplicationStatus`, `PermissionTier`.
- **Migration SQL:**
  [20261020000000_init_ca_career_os/migration.sql](../../apps/api/prisma/migrations/20261020000000_init_ca_career_os/migration.sql) contains 1,013 lines of SQL DDL creating all 39 tables, 6 enums, foreign keys, and indexes.

---

## 3. Existing Visual, UX & Data Deficiencies

1. **Monolithic AppShell Rendering:**
   - Currently, `AppShell.tsx` wraps all routes (including `/`, `/login`, `/register`) with the internal candidate `Sidebar` and `Header`.
   - *Fix:* Separate the unauthenticated public marketing experience from the authenticated SaaS application shell.
2. **Hardcoded Demo Data on Homepage:**
   - The root `/` route displayed hardcoded metric cards ("156 / 156 Weeks", "v2.4 Ready", "84 / 100", "92% Fit") regardless of user state.
   - *Fix:* Transform `/` into an editorial public marketing landing page when unauthenticated, and a personalized candidate dashboard rendering genuine user data (or honest empty state) when authenticated.
3. **Emoji Glyphs in Product UI:**
   - Emoji characters were used in place of vector iconography across alerts, chat responses, and status pills.
   - *Fix:* Replace all emoji glyphs with crisp Lucide icons and designed SVG markers.
4. **Ad-Hoc Network Fetching:**
   - Multiple pages used direct `fetch('/api/v1/...')` with inline JSON parsing and duplicate error state logic.
   - *Fix:* Centralize all API calls in a typed client (`apps/web/src/lib/api-client.ts`) that standardizes error handling, credentials, and response envelopes.
5. **Dishonest Fallback States:**
   - In several views, when the server returned empty data, the frontend defaulted to hardcoded fake records (e.g. 3 pre-seeded clients, mock jobs).
   - *Fix:* Replace fake fallback data with designed, high-craft empty states that guide the user on how to take real action.

---

## 4. Prioritized Redesign Implementation Plan

1. **Design System & Typography Tokens:**
   - Modern typography pairing (Inter / Plus Jakarta Sans display with crisp geometric styling).
   - Warm neutral and deep slate backgrounds, distinct indigo/emerald accent palette.
   - Purposeful motion classes (`fade-in-up`, `slide-in-right`, `card-hover`).
2. **Public Marketing Homepage (`/`):**
   - High-impact editorial hero, value proposition, 7 CA pathways showcase, feature highlights, genuine pricing, FAQs, trust & privacy disclosures.
3. **Authenticated Dashboard (`/` when signed in):**
   - Real calculated profile completion, active applications, real roadmap tasks, verified status badges.
4. **Core Application Route Enhancements (`/jobs`, `/career`, `/resumes`, `/interviews`, `/growth`, `/practice`, `/billing`):**
   - Remove emoji glyphs, add real empty states, integrate with centralized `api-client.ts`, add smooth motion transitions.
5. **Quality, Accessibility & Safety Verification:**
   - Validate contrast ratios, `prefers-reduced-motion`, responsive layouts, zero documentation leaks (`scripts/validate-diagrams.mjs`), clean builds, and passing tests.
