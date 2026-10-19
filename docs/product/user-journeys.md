# CA Career OS — Comprehensive End-to-End User Journeys (15 Scenarios)

> **Document Type:** Interaction Design & System Behavior Workflows  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Senior Frontend Engineers, Backend Engineers, QA Engineers, Product Leads  

This document details 15 complete, production-grade user journeys across CA Career OS. Each journey traces:
1. **Frontend Action:** What the user sees, clicks, or enters.
2. **Backend Operation:** API endpoint called, request validation, business logic executed.
3. **Database Effects:** SQL mutations, table rows created/updated within transactions.
4. **Permission & Security Checks:** JWT validation, workspace context, rate limiting.
5. **Notifications & Side Effects:** Transactional emails, BullMQ async jobs, telemetry logs.
6. **Possible Failure Paths & Recovery:** Error handling, UI recovery guidance.

---

## Journey 1: New Candidate Sign-Up & Personal Workspace Provisioning

- **Frontend Action:** Candidate visits `/auth/register`, inputs email, password (12+ chars), first name, last name, and clicks *"Create Free Account"*.
- **Backend Operation:** `POST /api/v1/auth/register` $\rightarrow$ validates Zod schema $\rightarrow$ hashes password with bcrypt (12 rounds) $\rightarrow$ initiates database transaction.
- **Database Effects:**
  - Creates `User` record (`role: CANDIDATE`, `emailVerified: false`).
  - Automatically provisions a dedicated `Workspace` (`type: PERSONAL`, `slug: user-{uuid}`).
  - Creates `WorkspaceMembership` (`memberRole: OWNER`, `isDefault: true`).
  - Creates baseline `Subscription` (`plan: FREE`, `status: ACTIVE`).
- **Permission & Security Checks:** Public endpoint; Redis rate-limited to 5 registration attempts per hour per IP.
- **Notifications & Side Effects:** Dispatches `auth.registered` event $\rightarrow$ BullMQ enqueues email worker $\rightarrow$ sends email verification link via Resend. Emits `candidate.registered` audit event.
- **Possible Failure Paths & Recovery:**
  - *Email already exists:* Returns HTTP 409 Conflict with *"An account with this email already exists. Log in instead."*
  - *Weak password:* Returns HTTP 400 with missing password criteria.

---

## Journey 2: Completing the Career Capability Diagnostic

- **Frontend Action:** Newly onboarded candidate on `/app/onboarding` selects articleship firm tier (e.g. *"Top 10 Firm"*), domains (*"Statutory Audit"*, *"Direct Tax"*), key client industries (*"BFSI"*, *"Manufacturing"*), target cities (*"Mumbai"*, *"Bengaluru"*), and clicks *"Generate Career Diagnostic"*.
- **Backend Operation:** `POST /api/v1/career/diagnostic` with `X-Workspace-Id` $\rightarrow$ validates input $\rightarrow$ queries role benchmark weights $\rightarrow$ calculates pathway fit scores.
- **Database Effects:**
  - Updates `CandidateProfile` with articleship fields.
  - Inserts multiple `CandidateSkill` rows (`source: articleship`, `verified: true`).
  - Inserts `SkillGapReport` with JSON payload containing fit percentages across all 6 CA pathways.
- **Permission & Security Checks:** `JWTGuard` + `WorkspaceGuard` (confirms user owns the `PERSONAL` workspace).
- **Notifications & Side Effects:** Caches diagnostic scorecard in Redis with 1-hour TTL. Emits `diagnostic.completed` analytics event.
- **Possible Failure Paths & Recovery:**
  - *Database failure during write:* Transaction rollbacks; UI shows *"Unable to save diagnostic results. Retrying..."* with preserved form fields in local state.

---

## Journey 3: Generating a Personalized 30/60/90-Day Transition Roadmap

- **Frontend Action:** Candidate views pathway recommendation on `/app/dashboard`, selects primary target pathway (*"Corporate FP&A"*), and clicks *"Generate 90-Day Transition Roadmap"*.
- **Backend Operation:** `POST /api/v1/career/roadmaps` $\rightarrow$ compares candidate's articleship skills against FP&A required skills $\rightarrow$ identifies gaps (e.g. *"Missing 3-Statement Financial Modeling"*, *"Missing SaaS Unit Economics"*) $\rightarrow$ generates sequenced weekly milestones.
- **Database Effects:**
  - Inserts 12 `LearningTask` rows linked to `CandidateProfile` with `dueDate`, `estimatedMinutes`, and resource URLs.
  - Updates `CandidateProfile.targetRole = "FP&A Analyst / Manager"`.
- **Permission & Security Checks:** Scoped to active candidate personal workspace.
- **Notifications & Side Effects:** BullMQ schedules weekly progress check-in notification. Emits `roadmap.generated`.
- **Possible Failure Paths & Recovery:**
  - *Candidate already has active roadmap:* Prompt dialog asks *"Replace existing roadmap or view current progress?"*

---

## Journey 4: Discovering and Saving Verified Jobs

- **Frontend Action:** Candidate navigates to `/app/jobs`, types *"Statutory Audit Manager"*, selects location *"Mumbai"*, and clicks *"Search"*. Clicks bookmark icon on a Deloitte job card.
- **Backend Operation:** 
  1. `GET /api/v1/jobs?query=...` executes hybrid lexical (Postgres FTS) and vector (`pgvector`) search; applies Current Employer Blindfold filter.
  2. `POST /api/v1/jobs/:id/save` with `Idempotency-Key` header saves the job.
- **Database Effects:** Inserts `SavedJob` record linking `candidateProfileId` and `jobId`.
- **Permission & Security Checks:** Verified employer filter; ensures candidate cannot view jobs marked confidential from their current employer.
- **Notifications & Side Effects:** Increments job bookmark count metric in Redis. Emits `job.saved`.
- **Possible Failure Paths & Recovery:**
  - *Job expired while browsing:* Returns HTTP 410 with message *"This job listing recently expired. View similar active roles below."*

---

## Journey 5: Tailoring and Attesting an ATS Resume (ADR-009)

- **Frontend Action:** On a saved job details page, candidate clicks *"Tailor My Resume"*, selects focus areas (*"Ind AS 115 Revenue Recognition"*, *"Audit Planning"*), reviews generated draft, checks mandatory attestation box, and clicks *"Approve & Download PDF"*.
- **Backend Operation:**
  1. `POST /api/v1/resumes/tailor` invokes LLM Provider Adapter with Zero-Fabrication Guard rules $\rightarrow$ generates tailored draft.
  2. `POST /api/v1/resumes/:id/attest` verifies attestation checkbox $\rightarrow$ generates binary PDF via renderer worker $\rightarrow$ stores in private S3 bucket $\rightarrow$ returns pre-signed URL (15m TTL).
- **Database Effects:**
  - Inserts `ResumeVersion` (`candidateAttested: true`, `s3Key: resumes/{uuid}.pdf`).
  - Records attestation timestamp and user IP in `claimAttestations` JSONB.
- **Permission & Security Checks:** Workspace ownership check; Zero-Fabrication provenance verifier ensures no synthetic metrics were introduced.
- **Notifications & Side Effects:** Dispatches `resume.tailored` and `resume.attested` telemetry events.
- **Possible Failure Paths & Recovery:**
  - *Candidate fails to check attestation:* Button remains disabled; tooltip explains: *"ICAI ethics compliance requires you to attest that all statements reflect verified experience."*

---

## Journey 6: Preparing and Tracking a Job Application

- **Frontend Action:** Candidate on `/app/applications` clicks *"Add Application"*, selects a saved job, links the attested `ResumeVersion`, sets status to `APPLIED`, sets follow-up date for 7 days later, and clicks *"Save"*.
- **Backend Operation:** `POST /api/v1/applications` with `Idempotency-Key` $\rightarrow$ validates job exists $\rightarrow$ creates application pipeline record.
- **Database Effects:**
  - Inserts `Application` record (`status: APPLIED`, `nextFollowUpDate: 2026-10-26`).
  - Enqueues BullMQ scheduled reminder job for the follow-up date.
- **Permission & Security Checks:** Scoped to Personal Workspace.
- **Notifications & Side Effects:** BullMQ reminder scheduled. Emits `application.created`.
- **Possible Failure Paths & Recovery:**
  - *Duplicate application submission:* Idempotency check catches duplicate key and returns existing application record without creating duplicate row.

---

## Journey 7: Completing a Text-Based Technical Mock Interview

- **Frontend Action:** Candidate visits `/app/interviews`, selects *"Statutory Audit: Ind AS 115 Revenue Drill"*, clicks *"Start 8-Turn Interview"*, reads the AI interviewer's initial scenario, types an analysis of a 5-step revenue recognition contract, and clicks *"Submit Answer"*.
- **Backend Operation:** `POST /api/v1/interviews/sessions` initializes session $\rightarrow$ `POST /api/v1/interviews/sessions/:id/turns` submits candidate answer $\rightarrow$ LLM evaluates technical accuracy against Ind AS standards and generates follow-up question.
- **Database Effects:**
  - Inserts `InterviewSession` (`mode: TEXT`, `status: IN_PROGRESS`).
  - Appends turn records to session history.
  - Upon 8th turn: inserts `InterviewFeedback` (`scoreTechnical: 88`, `scoreIndAS: 92`, rubric breakdown).
- **Permission & Security Checks:** Personal Workspace scope; prompt injection filter strips jailbreak attempts from candidate answer.
- **Notifications & Side Effects:** Emits `mock_interview.completed` analytics event.
- **Possible Failure Paths & Recovery:**
  - *Network disconnection during Turn 4:* Session state is preserved in Redis; candidate refreshes page and resumes from Turn 4.

---

## Journey 8: Unbundling and Comparing Job Offers

- **Frontend Action:** Candidate visits `/app/offer-compare`, enters Offer A (₹14,00,000 CTC in Mumbai) and Offer B (₹12,50,000 CTC in Pune), inputs fixed vs variable splits, and clicks *"Compare Offers"*.
- **Backend Operation:** `POST /api/v1/financial/compare-offers` $\rightarrow$ calculates monthly net in-hand pay after PF, Gratuity, and Tax deductions under Old vs New Tax Regimes $\rightarrow$ adjusts for city cost-of-living index.
- **Database Effects:** Encrypted offer record saved to `CandidateProfile` (KMS-encrypted).
- **Permission & Security Checks:** Strict workspace isolation; employers can never query or access candidate offer comparison data.
- **Notifications & Side Effects:** Emits `offer.compared` (contains zero salary numbers in telemetry sink).
- **Possible Failure Paths & Recovery:**
  - *Invalid numbers entered (e.g. fixed > gross):* Immediate client-side validation error highlights field.

---

## Journey 9: Booking an Expert Senior CA Mentor

- **Frontend Action:** Candidate visits `/app/mentorship`, filters mentors by *"Big 4 Audit Partner"*, reviews a mentor's verified profile, selects an open 45-minute slot, enters session notes (*"Transitioning from mid-tier firm to Big 4 Manager"*), and clicks *"Confirm Booking"*.
- **Backend Operation:** `POST /api/v1/mentorship/bookings` $\rightarrow$ locks calendar slot in Redis (10m hold) $\rightarrow$ creates payment order via Razorpay $\rightarrow$ candidate completes checkout $\rightarrow$ webhook verifies payment.
- **Database Effects:**
  - Inserts `MentorBooking` (`status: CONFIRMED`, `scheduledAt: ...`).
  - Updates mentor availability slot to booked.
- **Permission & Security Checks:** Razorpay webhook HMAC signature verification; payment escrow logic.
- **Notifications & Side Effects:** Calendar invite dispatched via email to both mentor and candidate. Emits `mentor.booked`.
- **Possible Failure Paths & Recovery:**
  - *Payment failure or abandonment:* Redis slot hold expires after 10 minutes, making slot available to other candidates.

---

## Journey 10: Independent Practice Setup & Regulatory Checklist

- **Frontend Action:** Candidate clearing CA Final navigates to `/practice/setup`, selects *"Starting Sole Proprietorship"*, views step-by-step COP guide, clicks official link to ICAI Form 6, and checks off completed tasks.
- **Backend Operation:** `GET /api/v1/practice/checklists` loads statutory roadmap $\rightarrow$ `POST /api/v1/practice/tasks/:id/toggle` updates task status.
- **Database Effects:** Inserts/updates `PracticeTask` records in newly created practice Organization Workspace.
- **Permission & Security Checks:** Non-solicitation ethics boundary: platform verifies firm profile contains zero public advertising or promotional lead generation.
- **Notifications & Side Effects:** Emits `practice_task.completed`.
- **Possible Failure Paths & Recovery:**
  - *Link drift to official portal:* Every link displays an "As of [Date]" stamp with automated monthly link checker alerting engineering if an ICAI portal URL changes.

---

## Journey 11: Corporate Recruiter Publishing a Verified Job Requisition

- **Frontend Action:** Recruiter in Organization Workspace (`/org/tata/jobs`) clicks *"Post New Job"*, fills in title (*"Manager — Internal Audit"*), pathway (*"AUDIT"*), salary bounds (₹15L–₹20L), required Ind AS experience, and clicks *"Publish Job"*.
- **Backend Operation:** `POST /api/v1/jobs` with `X-Workspace-Id` $\rightarrow$ validates recruiter role $\rightarrow$ sanitizes description $\rightarrow$ creates job $\rightarrow$ enqueues vector embedding generation worker.
- **Database Effects:**
  - Inserts `Job` record (`employerId: ...`, `status: ACTIVE`, `expiresAt: NOW() + 30 days`).
  - BullMQ enqueues job to `vector-embedding-queue`.
- **Permission & Security Checks:** User must possess `MEMBER_ROLE >= RECRUITER` in the active Organization Workspace.
- **Notifications & Side Effects:** Dispatches matching alerts to active candidates with compatible preferences. Emits `job.published`.
- **Possible Failure Paths & Recovery:**
  - *Embedding worker fails:* Job remains active and searchable via PostgreSQL FTS; embedding worker retries via exponential backoff.

---

## Journey 12: Recruiter Reviewing an Applicant Pipeline

- **Frontend Action:** Recruiter views `/org/tata/pipeline`, inspects Kanban board, clicks on candidate card, reviews attested resume PDF in viewer, and moves card from `APPLIED` to `INTERVIEW_INVITED`.
- **Backend Operation:** `PATCH /api/v1/applications/:id/status` with `{ "status": "INTERVIEW_INVITED" }` $\rightarrow$ verifies recruiter organization ownership of target job.
- **Database Effects:**
  - Updates `Application.status = "INTERVIEW_INVITED"`.
  - Inserts row into `ApplicationStatusHistory`.
- **Permission & Security Checks:** Recruiter can only inspect applicants who submitted directly to their firm's jobs.
- **Notifications & Side Effects:** Candidate receives email notification and in-app alert: *"Tata Sons invited you for an interview."* Emits `application.status_changed`.
- **Possible Failure Paths & Recovery:**
  - *Candidate withdrew application:* Card updates with *"Withdrawn by candidate"*; status change rejected.

---

## Journey 13: Organization Admin Inviting a Team Recruiter

- **Frontend Action:** Org Admin visits `/org/tata/team`, clicks *"Invite Member"*, enters colleague email (`recruiter@tata.com`), selects role `RECRUITER`, and clicks *"Send Invitation"*.
- **Backend Operation:** `POST /api/v1/workspaces/:id/invitations` $\rightarrow$ generates secure 7-day cryptographic invite token $\rightarrow$ enqueues email worker.
- **Database Effects:** Inserts `Invitation` record (`workspaceId: ...`, `role: RECRUITER`, `tokenHash: ...`, `expiresAt: ...`).
- **Permission & Security Checks:** Restricted to users with `memberRole: OWNER` or `ADMIN`.
- **Notifications & Side Effects:** Email invitation sent via Resend. Emits `team.member_invited`.
- **Possible Failure Paths & Recovery:**
  - *Invited user already a member:* Returns HTTP 409 Conflict with *"User is already a member of this workspace."*

---

## Journey 14: User Managing Privacy & Requesting Account Deletion

- **Frontend Action:** Candidate visits `/app/settings/privacy`, clicks *"Request Account Deletion"*, reads statutory data retention consequences, types confirmation phrase (*"DELETE MY DATA"*), and clicks *"Confirm Deletion"*.
- **Backend Operation:** `POST /api/v1/users/me/delete-request` $\rightarrow$ verifies statutory audit retention requirements $\rightarrow$ soft-deletes user records $\rightarrow$ queues 30-day purge task.
- **Database Effects:**
  - Sets `User.deletedAt = NOW()`.
  - Sets all candidate resumes, applications, and sessions to tombstone status.
  - Revokes all active JWT and refresh tokens in Redis.
- **Permission & Security Checks:** Re-authenticates user password before executing destructive mutation.
- **Notifications & Side Effects:** Dispatches confirmation email with 30-day recovery grace period link. Emits `user.soft_deleted` audit event.
- **Possible Failure Paths & Recovery:**
  - *Active statutory audit dispute:* If candidate is tied to pending compliance or legal investigation, deletion is placed on hold and user informed.

---

## Journey 15: User Managing Subscription, Upgrades & Cancellations

- **Frontend Action:** Candidate on `/app/settings/billing` clicks *"Upgrade to Pro Plan"*, reviews plan entitlements, clicks *"Subscribe"*, completes payment on Razorpay modal, and views updated subscription badge.
- **Backend Operation:** `POST /api/v1/subscriptions/checkout` creates order $\rightarrow$ client completes checkout $\rightarrow$ Razorpay webhook triggers `POST /api/v1/webhooks/razorpay` with signature verification.
- **Database Effects:**
  - Updates `Subscription` record (`plan: PRO`, `status: ACTIVE`, `currentPeriodEnd: ...`).
  - Inserts `BillingEvent` record.
- **Permission & Security Checks:** Webhook HMAC-SHA256 signature verification.
- **Notifications & Side Effects:** In-app entitlement refresh; transactional email receipt sent. Emits `subscription.upgraded`.
- **Possible Failure Paths & Recovery:**
  - *Webhook delayed:* Client polls `/api/v1/subscriptions/status` with exponential backoff until webhook updates state.
