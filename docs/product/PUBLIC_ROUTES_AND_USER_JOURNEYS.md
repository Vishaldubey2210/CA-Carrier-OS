# CA Career OS — Public Routes & User Journeys Specification

> **Document Type:** Route Inventory & End-to-End User Journey Specification  
> **Repository:** `Vishaldubey2210/CA-Carrier-OS`  
> **Audited Workspace:** CA Career OS Monorepo (`main` branch)  
> **Date:** October 2026  
> **Classification:** Production Route Catalog & User Flow Verification

---

## 1. Master Route Directory

### A. Public Website Routes (Indexable & SEO-Optimized)
| Path | Page Title | Primary Component | Layout Wrapper | Key Functional Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Sovereign CA Career Operating System | `PublicMarketingLanding` in `apps/web/src/app/page.tsx` | `PublicHeader` + `PublicFooter` | Hero positioning, 7-pathway highlights, zero-fabrication overview, FAQs, auth CTAs. |
| `/about` | About CA Career OS | `apps/web/src/app/about/page.tsx` | `PublicHeader` + `PublicFooter` | Mission, 4 core ethical principles, target CA lifecycle personas. |
| `/features` | Product Capabilities Catalog | `apps/web/src/app/features/page.tsx` | `PublicHeader` + `PublicFooter` | 9 capability groups with GA vs Sandbox filter pills. |
| `/pricing` | Subscription Pricing Plans | `apps/web/src/app/pricing/page.tsx` | `PublicHeader` + `PublicFooter` | 4 plans, Monthly/Annual switch (~17% discount), GST SAC 998314 invoicing. |
| `/contact` | Contact & Inquiries Desk | `apps/web/src/app/contact/page.tsx` | `PublicHeader` + `PublicFooter` | Structured form connected to `POST /api/v1/support/contact`, rate limiting, ticket ref. |
| `/faq` | Frequently Asked Questions | `apps/web/src/app/faq/page.tsx` | `PublicHeader` + `PublicFooter` | Searchable accordion covering 5 major regulatory and functional domains. |
| `/privacy` | Privacy Policy | `apps/web/src/app/privacy/page.tsx` | `PublicHeader` + `PublicFooter` | Candidate Blindfold guarantee, data retention, zero third-party ad sales. |
| `/terms` | Terms of Service | `apps/web/src/app/terms/page.tsx` | `PublicHeader` + `PublicFooter` | User role obligations, ICAI Code of Ethics Clauses 6 & 7 compliance, refund policies. |
| `/security` | Security Architecture | `apps/web/src/app/security/page.tsx` | `PublicHeader` + `PublicFooter` | Cryptographic multi-tenancy, scrypt hashing, responsible disclosure desk. |
| `/cookies` | Cookie Policy | `apps/web/src/app/cookies/page.tsx` | `PublicHeader` + `PublicFooter` | Exhaustive table of essential session cookies (`refreshToken`); zero ad pixels. |
| `/help` | Help & Knowledge Base | `apps/web/src/app/help/page.tsx` | `PublicHeader` + `PublicFooter` | 4 workflow tutorials with direct deep-links and ticket callout. |
| `/how-it-works`| Operational Architecture | `apps/web/src/app/how-it-works/page.tsx` | `PublicHeader` + `PublicFooter` | 5-step structured walkthrough from articleship to finance leadership. |
| `/careers` | Talent & Culture | `apps/web/src/app/careers/page.tsx` | `PublicHeader` + `PublicFooter` | Honest hiring status, engineering culture, and talent network contact. |

### B. Authentication & Recovery Routes
| Path | Purpose | Primary Component | Backend Hook |
| :--- | :--- | :--- | :--- |
| `/login` | Secure User Login | `apps/web/src/app/login/page.tsx` | `POST /api/v1/auth/login` |
| `/register` | Candidate & Firm Registration | `apps/web/src/app/register/page.tsx` | `POST /api/v1/auth/register` |
| `/forgot-password`| Password Recovery Request | `apps/web/src/app/forgot-password/page.tsx`| `POST /api/v1/auth/forgot-password` |
| `/reset-password` | Scrypt Password Reset | `apps/web/src/app/reset-password/page.tsx` | `POST /api/v1/auth/reset-password` |

### C. Authenticated Application Workspaces
| Path | Purpose | Primary Component | Backend Hook |
| :--- | :--- | :--- | :--- |
| `/` (auth state) | Candidate Command Center | `AuthenticatedDashboard` in `page.tsx` | `/career/profile`, `/career/roadmap`, `/jobs`, `/applications` |
| `/onboarding` | 4-Step Onboarding Wizard | `apps/web/src/app/onboarding/page.tsx` | `POST /api/v1/career/profile` |
| `/career` | Career Intelligence & Milestones| `apps/web/src/app/career/page.tsx` | `/api/v1/career/profile`, `/api/v1/career/diagnostic`, `/api/v1/career/roadmap` |
| `/jobs` | Verified Job Discovery & Tracker| `apps/web/src/app/jobs/page.tsx` | `/api/v1/jobs`, `/api/v1/applications` |
| `/resumes` | Zero-Fabrication Resumes | `apps/web/src/app/resumes/page.tsx` | `/api/v1/resumes` |
| `/interviews` | Mock Interview Simulator | `apps/web/src/app/interviews/page.tsx` | `/api/v1/interviews/sessions`, `/api/v1/interviews/questions` |
| `/growth` | Compensation & Mentorship | `apps/web/src/app/growth/page.tsx` | `/api/v1/financial`, `/api/v1/mentorship`, `/api/v1/community` |
| `/practice` | CA Practice Management OS | `apps/web/src/app/practice/page.tsx` | `/api/v1/practice/checklists`, `/api/v1/practice/clients` |
| `/billing` | Subscriptions & Invoicing | `apps/web/src/app/billing/page.tsx` | `/api/v1/billing/plans`, `/api/v1/billing/checkout` |
| `/settings` | Account, Security & Export | `apps/web/src/app/settings/page.tsx` | `/api/v1/auth`, `/api/v1/workspaces` |

---

## 2. Core End-to-End User Journeys

### Journey 1: Public Discovery to Candidate Registration
1. Visitor lands on `/` and reviews 7 CA career pathways.
2. Visitor navigates to `/features` to inspect capability boundaries (GA vs Sandbox).
3. Visitor clicks **"Create Free Account"** leading to `/register`.
4. Visitor inputs Name, Email, Role (`CANDIDATE`), and 12+ character password.
5. Server validates password strength, hashes via scrypt, provisions personal workspace, and issues HttpOnly refresh cookie.
6. User is redirected to `/onboarding`.

### Journey 2: Guided Onboarding & Profile Activation
1. Candidate arrives at `/onboarding` (Wizard Step 1).
2. Step 1: Selects CA Standing (`QUALIFIED`), enters optional ICAI membership number, and sets final attempts.
3. Step 2: Enters articleship firm name, selects firm tier (`BIG4`, `TOP10`, `MID_SIZE`), and checks exposure areas (Statutory Audit, Form 3CD, GST, M&A).
4. Step 3: Selects financial software proficiencies (SAP ERP, PowerBI, Excel, NetSuite).
5. Step 4: Selects target pathways (FP&A, Audit) and target cities.
6. Step 5: Clicks **"Complete Onboarding"**, dispatching payload to `POST /api/v1/career/profile`.
7. Profile strength calculates to 100%, and user is welcomed into the Command Center.

### Journey 3: Password Recovery & Session Revocation
1. User forgets password and clicks **"Forgot password?"** on `/login`.
2. Lands on `/forgot-password`, enters email, and clicks submit.
3. API rate limits request and logs recovery event in `memResetTokens` or database.
4. User receives token and navigates to `/reset-password?token=...`.
5. User enters 12+ character new password and confirms.
6. API updates scrypt hash, revokes all existing refresh tokens, and prompts user to log in with new credentials.

### Journey 4: Support & Contact Inquiry Flow
1. User navigates to `/contact`.
2. User fills Full Name, Email, Category (`CAREER_SUPPORT`), Subject, and Message (>15 chars).
3. Client validates inputs and posts to `POST /api/v1/support/contact`.
4. API checks connection IP rate limiter (max 5 per 10m).
5. API creates `SupportEnquiryRecord`, assigns reference e.g. `TKT-2026-XXXX`, and logs audit notice.
6. UI displays success confirmation with the generated ticket reference and expected 24–48h turnaround.

### Journey 5: Data Sovereignty & JSON Export
1. Authenticated user navigates to `/settings`.
2. User switches to **"Workspace Privacy & Export"** tab.
3. User verifies Candidate Blindfold status is `ACTIVE`.
4. User clicks **"Export Career Data (JSON)"**.
5. Client packages authenticated profile, articleship records, and workspace metadata into a downloadable JSON file.
