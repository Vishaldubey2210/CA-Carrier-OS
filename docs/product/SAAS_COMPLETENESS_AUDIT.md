# CA Career OS — Complete SaaS Product Audit & Gap Inventory

> **Document Type:** Master Product Audit & Completeness Inventory  
> **Audited Repository:** `Vishaldubey2210/CA-Carrier-OS`  
> **Audited Workspace:** CA Career OS Monorepo (`main` branch)  
> **Audit Date:** October 22, 2026  
> **Audit Classification:** Evidence-Based Source Code, Route, API & Data-Model Forensic Inspection  
> **Auditor Roles:** Principal Product Manager, Senior SaaS Product Designer, Staff Full-Stack Engineer, Security Engineer, QA Lead

---

## 1. Executive Summary & Audit Methodology

This audit evaluates the complete SaaS product completeness, route coverage, data provenance, authentication lifecycle, and zero-fake-data compliance for **CA Career OS** (Operating System for Chartered Accountants).

### Classification Framework
Every identified page, component, workflow, and capability is assigned one of six deterministic statuses:
1. `WORKING_AND_VERIFIED`: Code exists, backed by real API and data structures, and verified by passing automated tests or HTTP execution.
2. `IMPLEMENTED_NOT_FULLY_TESTED`: Implemented in frontend and backend, but pending end-to-end integration or runtime execution verification.
3. `PARTIALLY_IMPLEMENTED`: Core UI or API exists, but missing critical user journeys, server mutations, or state persistence.
4. `MISSING`: Required essential SaaS page, endpoint, entity, or UX state does not currently exist in the repository.
5. `BLOCKED_BY_EXTERNAL_DEPENDENCY`: Implementation is scaffolded or operating in local mock mode awaiting external provider credentials (e.g. live SMTP, Razorpay production credentials, live OpenAI/Anthropic keys).
6. `NOT_APPLICABLE`: Out of scope or deliberately omitted per architectural design records (e.g. ADR-009 prohibiting uncontrolled generative resume fabrication).

---

## 2. Inventory of Existing Public Website Pages

| Route | Page Title / Role | Current Implementation | Audit Status | Identified Gaps / Required Improvements |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Public Homepage / Marketing Landing | `apps/web/src/app/page.tsx` (`PublicMarketingLanding`) | `PARTIALLY_IMPLEMENTED` | Header & footer are embedded inline rather than modular; lacks dedicated links to About, Features, Contact, Legal pages; lacks mobile drawer toggle. |
| `/about` | About CA Career OS | *Does not exist* | `MISSING` | Needs dedicated mission, target CA personas, problem definition, and ethical governance without fake founder claims. |
| `/features` | Product Features Catalog | *Does not exist* | `MISSING` | Needs structured breakdown into 11 capability groups mapping to real implementation; must distinguish GA from sandbox. |
| `/pricing` | Public Pricing Page | *Does not exist* (only `/billing` exists as auth screen) | `MISSING` | Public visitors have no standalone pricing page; must derive directly from backend `CURATED_PLANS`. |
| `/contact` | Contact & Inquiries | *Does not exist* | `MISSING` | Contact form missing; no backend submission endpoint or database enquiry persistence. |
| `/faq` | Frequently Asked Questions | *Only 4 basic FAQs in homepage* | `PARTIALLY_IMPLEMENTED` | Comprehensive standalone FAQ covering candidate, recruiter, roadmap, AI limitations, billing, and privacy is missing. |
| `/privacy` | Privacy Policy | *Does not exist* | `MISSING` | Critical for compliance; must articulate Candidate Blindfold Rule, data retention, and absence of third-party tracking. |
| `/terms` | Terms of Service | *Does not exist* | `MISSING` | Must define SaaS terms, acceptable use, ICAI ethics compliance (Clauses 6/7), and refund policies. |
| `/security` | Security Architecture | *Does not exist* | `MISSING` | Must document RBAC, HMAC webhook verification, scrypt password hashing, and absence of fake SOC2 claims. |
| `/cookies` | Cookie Policy | *Does not exist* | `MISSING` | Must document strictly essential authentication cookies (`refreshToken`) and lack of invasive ad tracking. |
| `/help` or `/support` | Help & Documentation | *Does not exist* | `MISSING` | Missing user guidance, ticket submission, and troubleshooting instructions. |
| `/how-it-works` | Operational Architecture | *Does not exist* | `MISSING` | Detailed walkthrough of Candidate, Employer, and CA Practice workflows needed. |
| `/careers` | Work at CA Career OS | *Does not exist* | `MISSING` | Honest disclosure of current hiring state without inventing fake vacancies. |

---

## 3. Inventory of Authentication & Account Lifecycle

| Workflow | Frontend Route | Backend Endpoint | Status | Audit Findings |
| :--- | :--- | :--- | :--- | :--- |
| **User Registration** | `/register` (`apps/web/src/app/register/page.tsx`) | `POST /api/v1/auth/register` | `WORKING_AND_VERIFIED` | Validates passwords (12+ chars), provisions personal workspace, generates JWT & refresh token cookie. |
| **User Login** | `/login` (`apps/web/src/app/login/page.tsx`) | `POST /api/v1/auth/login` | `WORKING_AND_VERIFIED` | Rate limited by IP + email, validates scrypt hash, sets HttpOnly refresh cookie. |
| **Token Refresh** | In-app interceptor | `POST /api/v1/auth/refresh` | `WORKING_AND_VERIFIED` | Supports refresh token rotation and token family reuse detection. |
| **Session Revocation (Logout)**| In-app header action | `POST /api/v1/auth/logout` | `WORKING_AND_VERIFIED` | Revokes token hash in database and clears client cookie. |
| **Forgot Password** | *Missing page* (`/forgot-password`) | `POST /api/v1/auth/forgot-password` | `PARTIALLY_IMPLEMENTED` | Backend endpoint exists in `auth.service.ts`; frontend UI page is missing. |
| **Reset Password** | *Missing page* (`/reset-password`) | `POST /api/v1/auth/reset-password` | `PARTIALLY_IMPLEMENTED` | Backend endpoint exists in `auth.service.ts`; frontend UI page is missing. |
| **Account Onboarding** | *Missing page* (`/onboarding`) | *Scattered across `/career/profile`* | `MISSING` | No guided first-login wizard to onboard candidates, recruiters, or practitioners step-by-step. |
| **Account Settings** | *Missing page* (`/settings`) | *Partially in `auth.controller.ts`* | `MISSING` | No dedicated page for profile update, password change, notification prefs, or workspace settings. |

---

## 4. Inventory of Authenticated Application Routes

| Route | Role / Purpose | Frontend File | Backend Module | Audit Status | Gaps & Observations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard` | Main Command Center | `apps/web/src/app/dashboard/page.tsx` | N/A (redirects to `/`) | `PARTIALLY_IMPLEMENTED` | Currently performs a redirect to `/`. Authenticated view renders in `page.tsx`. |
| `/career` | Career Intelligence & Roadmap | `apps/web/src/app/career/page.tsx` | `CareerModule` (`/api/v1/career`) | `WORKING_AND_VERIFIED` | Articleship inventory, diagnostic, roadmap task toggle. Tested and working. |
| `/jobs` | Job Discovery & Tracking | `apps/web/src/app/jobs/page.tsx` | `JobsModule`, `ApplicationsModule` | `WORKING_AND_VERIFIED` | Search, filtering, bookmarking, and application tracker. |
| `/resumes` | Zero-Fabrication Resumes | `apps/web/src/app/resumes/page.tsx` | `ResumesModule` (`/api/v1/resumes`) | `WORKING_AND_VERIFIED` | Master resume, tailoring with ADR-009 candidate attestation, and cover letter generator. |
| `/interviews` | Mock Interview Prep | `apps/web/src/app/interviews/page.tsx`| `InterviewsModule` (`/api/v1/interviews`)| `WORKING_AND_VERIFIED` | Interactive session, answer submission, 4-dimension scoring, question bank. |
| `/growth` | Compensation & Growth | `apps/web/src/app/growth/page.tsx` | `FinancialModule`, `MentorshipModule` | `WORKING_AND_VERIFIED` | CTC unbundler, offer comparison, mentor booking, community posts. |
| `/practice` | CA Practice Management OS | `apps/web/src/app/practice/page.tsx` | `PracticeModule` (`/api/v1/practice`) | `WORKING_AND_VERIFIED` | ICAI regulatory checklists, client directory, statutory compliance calendar. |
| `/billing` | Subscription & Invoices | `apps/web/src/app/billing/page.tsx` | `BillingModule` (`/api/v1/billing`) | `WORKING_AND_VERIFIED` | Plan comparison, checkout initiation, GST invoice preview, cancellation. |

---

## 5. Inventory of Backend Endpoints & Modules

| Module | Base Path | Core Operations | Status |
| :--- | :--- | :--- | :--- |
| `HealthModule` | `/api/v1/health` | Liveness (`/`), Readiness (`/ready`) with DB & memory metrics | `WORKING_AND_VERIFIED` |
| `AuthModule` | `/api/v1/auth` | `register`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`, `me` | `WORKING_AND_VERIFIED` |
| `WorkspaceModule` | `/api/v1/workspaces` | `create`, `list`, `get`, `switch`, `invite`, `members` | `WORKING_AND_VERIFIED` |
| `CareerModule` | `/api/v1/career` | `profile`, `diagnostic`, `roadmaps`, `roadmaps/:id/tasks/:taskId/toggle` | `WORKING_AND_VERIFIED` |
| `JobsModule` | `/api/v1/jobs` | `list`, `getById`, `saved`, `alerts/preferences`, `alerts/process` | `WORKING_AND_VERIFIED` |
| `ApplicationsModule`| `/api/v1/applications` | `create`, `list`, `updateStatus`, `follow-up tasks` | `WORKING_AND_VERIFIED` |
| `ResumesModule` | `/api/v1/resumes` | `create`, `get`, `update`, `tailor`, `attest`, `cover-letter`, `linkedin-suggestions` | `WORKING_AND_VERIFIED` |
| `InterviewsModule` | `/api/v1/interviews` | `sessions`, `answers`, `evaluate`, `questions` | `WORKING_AND_VERIFIED` |
| `AgentModule` | `/api/v1/agent` | `chat`, `approve`, `conversations` (13 tools across 4 permission tiers) | `WORKING_AND_VERIFIED` |
| `FinancialModule` | `/api/v1/financial` | `salary-benchmarks`, `offer-comparisons`, `ctc-unbundler` | `WORKING_AND_VERIFIED` |
| `MentorshipModule` | `/api/v1/mentorship` | `mentors`, `bookings` | `WORKING_AND_VERIFIED` |
| `CommunityModule` | `/api/v1/community` | `posts`, `replies`, `reports` | `WORKING_AND_VERIFIED` |
| `PracticeModule` | `/api/v1/practice` | `checklists`, `clients`, `compliance-tasks` | `WORKING_AND_VERIFIED` |
| `RecruitmentModule`| `/api/v1/recruitment` | `employer-profile`, `verification-request`, `reviews` | `WORKING_AND_VERIFIED` |
| `BillingModule` | `/api/v1/billing` | `plans`, `checkout`, `webhook`, `subscriptions`, `invoices`, `entitlements` | `WORKING_AND_VERIFIED` |
| **SupportModule** | `/api/v1/support` | *Does not exist* — need `POST /api/v1/support/contact` & `GET /api/v1/support/enquiries` | `MISSING` |
| **NotificationsModule**| `/api/v1/notifications`| *Does not exist* — need `GET /api/v1/notifications`, `PATCH /:id/read`, `POST /mark-all-read` | `MISSING` |

---

## 6. Inventory of Persistent Database Entities (`schema.prisma`)

The database schema defines 39 models across 6 enums. The audit revealed the following:
- **Core Entities:** `User`, `Workspace`, `WorkspaceMembership`, `RefreshToken`, `WorkspaceInvitation`, `Subscription`, `PaymentTransaction`, `InvoiceRecord`, `WebhookEventLog`.
- **Career & Profile Entities:** `CandidateProfile`, `CareerRoadmap`, `CareerTask`, `PortfolioEntry`.
- **Job & Application Entities:** `Job`, `SavedJob`, `Application`, `ApplicationStatusHistory`, `FollowUpTask`.
- **Resume Entities:** `Resume`, `ResumeVersion`.
- **Interview & Agent Entities:** `InterviewSession`, `InterviewQuestionItem`, `AgentConversation`, `AgentMessage`, `ApprovalRequest`, `AuditEvent`.
- **Growth & Community Entities:** `SalaryBenchmark`, `OfferComparison`, `EmployerProfile`, `EmployerVerificationRequest`, `MentorProfile`, `MentorBooking`, `CommunityPost`, `CommunityReply`, `CommunityReport`.
- **Practice Management Entities:** `PostQualificationChecklist`, `PracticeClient`, `PracticeComplianceTask`, `RecruitmentApplicationReview`.
- **Missing Models in Prisma:**
  - `SupportEnquiry`: Missing model to persist contact form submissions and support tickets.
  - `Notification`: Missing model to track application alerts, security notices, and billing events.

---

## 7. Fake / Hardcoded Production Data Audit

| Page / Component | Audit Finding | Correction Required |
| :--- | :--- | :--- |
| **Homepage `/`** | Inline FAQ and pathway descriptions are factual, but currently lacks links to legal and support pages. No fake testimonials or customer numbers were found. | Keep strictly grounded; add legitimate navigation links. |
| **Pricing `/pricing` & `/billing`** | Plans match backend `CURATED_PLANS` (₹0, ₹999, ₹2,499, ₹4,999). No fake discounts or invented testimonials found. | Expose public `/pricing` with exact same backend source of truth. |
| **Jobs `/jobs`** | When backend returns 0 jobs, UI currently handles empty states. | Ensure honest empty states explain how employers can post verified roles. |
| **Resumes `/resumes`** | Enforces ADR-009 Zero-Fabrication Candidate Attestation; prohibits AI from inventing unearned audit clients. | Maintain attestation modal; never allow generative hallucination. |
| **Growth `/growth`** | CTC unbundler uses genuine statutory PF, Gratuity, and FY 2025–26 New Tax Regime equations. Salary benchmarks disclose sample sizes (N) and limitations. | Maintain statistical provenance transparency. |
| **Interviews `/interviews`** | Mock interview question bank uses authentic Ind AS 115/116, Companies Act 2013, and CARO 2020 rubrics. | Never show practice scores unless the candidate actually completed a test. |

---

## 8. Third-Party Provider Status Matrix

| Provider | Intended Production Role | Current Local / Sandbox State | Honest Disclosure Policy |
| :--- | :--- | :--- | :--- |
| **Razorpay** | Indian Rupee payments, subscriptions, GST invoicing | Sandbox mode with test keys (`rzp_test_*`). Paired with real paise calculations. | Explicitly labeled as "Sandbox / Test Mode" in UI. No claims of live banking settlements. |
| **AI LLM (OpenAI/Anthropic)**| Career advice, mock interview question synthesis | Local deterministic mock mode (`AI_PROVIDER="mock"`). Heuristic rubric evaluation. | UI clarifies that evaluations follow ICAI technical rubrics without claiming external LLM sentience. |
| **Email (SMTP/SES)**| Password reset, application status alerts | In-memory logger (`MockEmailAdapter`). | UI notifies user that notification is logged in audit trail; does not falsely claim email was delivered. |
| **OCR (Form 108 Articleship)**| Form 108 verification from ICAI | Mock parser checking PDF magic bytes and Form 108 headers with fallback review flags. | Reports confidence score honestly and flags unreadable documents for manual verification. |

---

## 9. SEO, Performance, Accessibility & Usability Gaps

1. **Missing Public SEO Metadata:** Lacks `sitemap.ts` and `robots.ts` in Next.js app directory.
2. **Missing 404 Page:** Custom branded `not-found.tsx` is required for navigational resilience.
3. **Public Navigation Isolation:** `AppShell` currently wraps all non-auth pages in the authenticated Sidebar and Header. Public marketing pages (`/about`, `/features`, `/pricing`, etc.) need a clean, uncluttered layout with `PublicHeader` and `PublicFooter`.
4. **Mobile Navigation Drawer:** Public header requires a mobile hamburger menu for responsive viewports (<768px).

---

## 10. Prioritized Implementation Action Plan

To achieve 100% SaaS product completeness and zero-fake-data compliance, the following sequence will be executed:

- [ ] **Phase A — Reusable Public Layout & Navigation:**
  - Build `PublicHeader` with logo, navigation links, mobile hamburger drawer, and auth buttons.
  - Build `PublicFooter` with verified links, copyright 2026, and legal links.
  - Update `AppShell.tsx` to apply public layout to all public routes.
- [ ] **Phase B — Public Website Pages:**
  - Implement `/about`, `/features`, `/pricing`, `/contact`, `/faq`, `/privacy`, `/terms`, `/security`, `/cookies`, `/help`, `/how-it-works`, `/careers`.
  - Wire `/contact` form to backend API.
- [ ] **Phase C — Backend Support & Notification Modules:**
  - Create `SupportModule` with `POST /api/v1/support/contact` (with rate-limiting and persistence) and `GET /api/v1/support/enquiries`.
  - Create `NotificationsModule` with `GET /api/v1/notifications`, `PATCH /:id/read`, `POST /mark-all-read`.
  - Add Prisma schema definitions and in-memory dual-persistence store.
- [ ] **Phase D — Authentication & Account Completeness:**
  - Implement `/forgot-password` and `/reset-password` in Next.js web.
  - Implement `/onboarding` multi-step role-based onboarding wizard.
  - Implement `/settings` for profile updates, password change, notifications, and workspace settings.
  - Enhance `Header.tsx` with Notification Bell drawer and settings link.
- [ ] **Phase E — SEO & Public Web Polish:**
  - Add `apps/web/src/app/sitemap.ts` and `robots.ts`.
  - Add custom `apps/web/src/app/not-found.tsx`.
- [ ] **Phase F — Automated Verification & Documentation:**
  - Run `pnpm test`, `pnpm typecheck`, `pnpm build`, and diagram validation.
  - Generate missing features implementation report and public routes inventory.
