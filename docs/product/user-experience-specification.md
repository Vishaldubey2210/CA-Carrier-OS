# CA Career OS — User Experience & Information Architecture Specification

> **Document Type:** UX/UI Architecture & Interaction Design Specification  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Senior Frontend Engineers, UX/UI Designers, QA Engineers  

This specification defines the complete information architecture, page routing, responsive layout behavior, design tokens, interactive states, and accessibility standards for CA Career OS.

---

## 1. Information Architecture & Sitemaps

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                    INFORMATION ARCHITECTURE                               |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  [PUBLIC ZONE]                                                                            |
|  ├── / (Marketing Homepage · Product Vision · Core CA Problems · FAQ)                    |
|  ├── /pathways (Informational 6 CA Pathway Explorer)                                      |
|  ├── /ctc-calculator (Free Interactive Public CTC Take-Home Estimator)                    |
|  ├── /auth/login & /auth/register (JWT & Refresh Cookie Authentication)                   |
|  └── /auth/verify-email & /auth/forgot-password                                           |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  [CANDIDATE PERSONAL WORKSPACE] (/app/...)                                                |
|  ├── /app/dashboard (Career Intelligence Overview · Pathway Fit · Active Roadmap Tasks)   |
|  ├── /app/onboarding (Multi-step Articleship & Capability Inventory)                     |
|  ├── /app/jobs (Hybrid Search · Filter by City, Pathway & Salary · Explainable Match)     |
|  ├── /app/jobs/saved (Bookmarked Jobs & Priority Application Pipeline)                    |
|  ├── /app/applications (Kanban Tracking Board · Scheduled Follow-Up Alerts)               |
|  ├── /app/resume (ATS Resume Builder · Role Tailoring · Attestation & PDF/DOCX Export)    |
|  ├── /app/interviews (Technical Mock Lab · Turn-Based Drills · Ind AS Rubric Scorecards)  |
|  ├── /app/skills (Skill-Gap Diagnostic · Bridging Exercises · Financial Modeling Drills)  |
|  ├── /app/offer-compare (CTC Unbundler · Side-by-Side Offer Matrix · Tax Regime Calc)     |
|  ├── /app/mentorship (Verified Senior CA Directory · Slot Booking · Advisory Sessions)    |
|  ├── /app/agent (Conversational AI Career Copilot · Approval Card Drawer)                 |
|  └── /app/settings (Profile · Privacy Shield · Active Sessions · Data Erasure)            |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  [EMPLOYER / CA FIRM ORGANIZATION WORKSPACE] (/org/:slug/...)                             |
|  ├── /org/:slug/dashboard (Hiring Overview · Active Requisitions · Candidate Pipeline)    |
|  ├── /org/:slug/jobs (Create & Manage Requisitions · Ingestion Feed Attribution)         |
|  ├── /org/:slug/pipeline (Kanban Applicant Review Board · Stage Management)               |
|  ├── /org/:slug/team (Member Invites · Role RBAC: Admin, Recruiter, Viewer)               |
|  └── /org/:slug/billing (Subscription Management · Seats · GST-Compliant Invoices)        |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  [INDEPENDENT PRACTICE WORKSPACE] (/practice/:slug/...)                                   |
|  ├── /practice/:slug/checklist (Post-Qual ICAI Form 2 & COP Form 6 Tracker)              |
|  ├── /practice/:slug/clients (Client Master · KYC Records · Engagement Letters)           |
|  ├── /practice/:slug/calendar (Statutory Compliance Deadlines: Income Tax, GST, ROC)      |
|  └── /practice/:slug/cpe (ICAI CPE Credit Tracker · Hours Log)                            |
+───────────────────────────────────────────────────────────────────────────────────────────+
|  [PLATFORM ADMINISTRATION CONSOLE] (/admin/...) [Role: PLATFORM_ADMIN]                    |
|  ├── /admin/telemetry (System Health · Queue Worker Latencies · Ingestion Metrics)        |
|  ├── /admin/audit-logs (Tamper-Evident WORM Audit Log Query Explorer)                     |
|  └── /admin/moderation (Flagged Suspicious Jobs · Provider Quota Alerts)                  |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Navigation, Route Boundaries & Workspace Switching

### Workspace Context Resolver
1. **Context Header:** All authenticated frontend calls transmit the active workspace via `X-Workspace-Id: <uuid>`.
2. **Context Switcher UI:** Located in the global top navigation bar:
   - Personal Workspace (`Vishal Dubey (Personal)`)
   - Organization Workspaces (`Deloitte Tax Team (Org)`, `Dubey & Associates CA (Practice)`)
3. **Route Guard Enforcement:** Attempting to navigate to `/org/:slug/*` while in a `PERSONAL` context automatically triggers the `WorkspaceResolver` to verify active membership before rendering. If membership is absent, returns HTTP 403 Forbidden with a *"Workspace not found or unauthorized"* screen.

### Mobile-Responsive Navigation
- **Desktop ($\ge 1024$px):** Fixed collapsible left sidebar navigation (240px expanded, 72px icon-only rail).
- **Mobile ($< 1024$px):** Sticky top bar with hamburger menu, bottom navigation dock for the 4 core candidate actions: `Dashboard`, `Jobs`, `Resume`, and `AI Agent`.

---

## 3. Comprehensive UX States Specification

Every data-fetching, generative, or mutating screen must explicitly handle all 12 operational UX states:

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                      THE 12 CORE UX STATES                                |
+───────────────────────────────────────────────────────────────────────────────────────────+
| 01. Initial State        | Default clean view prior to user interaction or search input   |
| 02. Loading State        | Pulsing skeleton loaders matching final component layout       |
| 03. Success State        | Populated data view with micro-interaction confirmation badge  |
| 04. Empty State          | Informative graphic, explanation, and clear primary CTA button |
| 05. Validation Error     | Inline field highlight, specific error message, focus jump     |
| 06. Permission Denied    | 403 shield icon, explanation of missing role, context switcher |
| 07. Network Failure      | Offline toast, retry button, preserved draft inputs in memory   |
| 08. Background Process   | Progress bar, queue position, optimistic UI with pending tag   |
| 09. Cancellation State   | Graceful abort animation, zero state mutation confirmation     |
| 10. Retry State          | Exponential backoff countdown with immediate manual retry link |
| 11. Expired Operation    | 410 Gone banner: "Approval expired (15m TTL). Re-initiate?"    |
| 12. Recovery Guidance    | Step-by-step resolution card with direct link to fix issue     |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

### Detailed State Behaviors for Critical Features

#### Feature: Resume Tailoring & Attestation
- **Loading:** Displays an animated 3-step progress spinner: *"Analyzing job description $\rightarrow$ Extracting verified skills $\rightarrow$ Reformulating bullet points"*.
- **Empty:** When no base resume exists: *"No base resume found. Create your Master Resume or upload an existing PDF to begin tailoring."*
- **Validation Error:** If the candidate unchecks attestation: *"You must attest that all statements reflect verified experience before exporting."*
- **Background Processing:** If PDF export takes $>3$ seconds, displays: *"Generating ATS-compliant PDF... (Download will begin automatically)"*.

#### Feature: AI Agent External Action Confirmation
- **Initial:** Interactive Approval Card rendered in chat stream showing action details, target recipient, payload diff, and a 15-minute countdown timer.
- **Success:** Card transforms into green confirmed badge: *"Application submitted to KPMG India. External ID: #KPMG-8819."*
- **Expired:** Card turns muted gray with clock icon: *"Approval token expired after 15 minutes. No action was taken. Ask the agent again to re-initiate."*

---

## 4. Accessibility & UI Consistency Standards (WCAG 2.1 AA)

1. **Accessible Colors & Contrast:**
   - Backgrounds: Dark slate `#0f172a` (surfaces) and `#1e293b` (cards).
   - Text Contrast: Primary text `#f8fafc` ($14.2:1$ contrast ratio); secondary text `#94a3b8` ($5.1:1$ contrast ratio), well exceeding WCAG AAA/AA standards.
   - Interactive Elements: Primary brand blue `#38bdf8` and emerald green `#10b981`.
2. **Keyboard Navigation:**
   - Full tab-index traversal across all interactive cards, filters, and modals.
   - Visible focus rings (`outline: 2px solid #38bdf8; outline-offset: 2px;`).
   - Modal dialogs trap keyboard focus and dismiss on `Escape`.
3. **Form Accessibility:**
   - Every input has an explicitly linked `<label for="id">` element.
   - Error states announce to screen readers using `aria-invalid="true"` and `aria-describedby="error-id"`.
4. **Locale, Currencies & Dates:**
   - Currency formatted in Indian Rupees using Indian comma formatting: `₹12,50,000` (`Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`).
   - Dates formatted in Indian standard order: `DD MMM YYYY` (e.g. `19 Oct 2026`).
   - Timezone: Indian Standard Time (`IST`, `UTC+05:30`).
