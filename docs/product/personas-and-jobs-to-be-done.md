# CA Career OS — User Personas & Jobs To Be Done (JTBD)

> **Document Type:** User Research & Persona Specification  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Product Managers, UX Designers, Backend Engineers, QA Leads  

This document details the 10 core personas interacting with CA Career OS, defining their Jobs To Be Done (JTBD), permissions, dashboards, owned data, prohibited actions, common failure scenarios, and telemetry events.

---

## Persona 1: CA Final Cleared Candidate (Campus Placement Aspirant)

- **Profile:** Cleared CA Final in the most recent attempt; completed 2.5–3 years of articleship at a mid-tier firm; awaiting ICAI campus placement interviews or lateral off-campus opportunities.
- **Jobs To Be Done (JTBD):**
  - *"When I clear CA Final, I want to convert my articleship experience into corporate-ready language so that I can secure shortlists from Big 4 firms and Fortune 500 corporate finance teams."*
  - *"When preparing for campus interviews, I want to practice technical Ind AS and tax questions under pressure so that I feel confident answering senior partners."*
- **Entry Point & Onboarding:**
  - Landing via placement preparation links or peer recommendations.
  - Onboarding captures articleship firm, domains (Stat Audit, Tax, ROC), preferred cities (Mumbai, Bengaluru, NCR), and target roles.
- **Dashboard & Navigation:** Candidate Personal Dashboard $\rightarrow$ Pathway Match Scorecard $\rightarrow$ Daily Bridging Tasks $\rightarrow$ Mock Interview Drills.
- **Primary Actions:** Complete career diagnostic; build ATS-friendly resume; run mock interview sessions; bookmark verified job postings.
- **Data Owned:** Personal profile, articleship details, resume drafts, mock interview session transcripts, job application tracker notes.
- **Data Accessible:** Active verified job listings, public salary benchmark bands, standard Ind AS interview question rubrics.
- **Prohibited Actions:** Cannot view recruiter identity unless job posting is verified; cannot access another candidate's profile; cannot apply autonomously via AI without explicit approval.
- **Common Failure Scenarios:** Attempting to claim unverified audit client metrics (blocked by Zero-Fabrication Guard); session drop during technical mock interview.
- **Desired Outcomes:** Receiving at least 3 interview shortlists in desired domain within 45 days of qualification.
- **Relevant Analytics Events:** `candidate.onboarded`, `diagnostic.completed`, `mock_interview.completed`, `resume.attested`.

---

## Persona 2: Newly Qualified CA (First Lateral Job Seeker, 0–2 Years)

- **Profile:** Qualified 6–18 months ago; currently in an entry-level role (e.g. audit executive or senior accountant) looking to transition into high-growth corporate finance or FP&A.
- **Jobs To Be Done (JTBD):**
  - *"When I realize my current role lacks strategic finance exposure, I want to identify my skill gaps so that I can prepare for lateral FP&A and corporate finance openings."*
  - *"When evaluating multiple job offers, I want to unbundle fixed versus variable CTC and retiral deductions so that I know my real monthly in-hand compensation."*
- **Entry Point & Onboarding:** Search traffic for "CA CTC unbundler" or "transition from statutory audit to FP&A". Quick login via email/password.
- **Dashboard & Navigation:** Career Intelligence Hub $\rightarrow$ Hybrid Job Search $\rightarrow$ Resume Tailoring Engine $\rightarrow$ CTC Comparison Calculator.
- **Primary Actions:** Tailor resume to specific FP&A job descriptions; upload and unbundle offer letters; schedule application follow-up reminders.
- **Data Owned:** Confidential offer terms, tailored resume versions, target salary preferences, application pipeline states.
- **Data Accessible:** Verified lateral job postings, cost-of-living index comparisons, aggregated salary benchmark distribution.
- **Prohibited Actions:** Cannot expose search activity to current employer; cannot scrape job listings.
- **Common Failure Scenarios:** Candidate fails to attest resume claims before submitting; application token expires after 15 minutes of inactivity.
- **Desired Outcomes:** Transitioning to a preferred domain with $\ge 25\%$ increase in real take-home pay.
- **Relevant Analytics Events:** `job.saved`, `resume.tailored`, `offer.unbundled`, `application.status_updated`.

---

## Persona 3: Lateral Transitioner (Senior CA, 3–7 Years Experience)

- **Profile:** Mid-level professional (Assistant Manager / Manager at a Big 4 or large corporate) aiming for Senior Manager, Controller, or Corporate Strategy roles.
- **Jobs To Be Done (JTBD):**
  - *"When I prepare for managerial interviews, I want to benchmark my technical and leadership capabilities against industry expectations without risking my current employment."*
  - *"When considering lateral executive positions, I want high confidentiality so that market rumors do not reach my current leadership."*
- **Entry Point & Onboarding:** Direct referral or executive search link. High-privacy onboarding with stealth mode activated by default.
- **Dashboard & Navigation:** Stealth Career Workspace $\rightarrow$ Executive Salary Intel $\rightarrow$ Curated Verified Roles $\rightarrow$ Mentor Advisory.
- **Primary Actions:** Book confidential 1-on-1 advisory sessions with senior CFO mentors; review senior vacancies; calculate long-term ESOP/incentive values.
- **Data Owned:** Executive resume, confidential career notes, mentor advisory summaries.
- **Data Accessible:** Anonymized senior compensation benchmarks, verified executive postings.
- **Prohibited Actions:** Cannot share corporate proprietary financial data in mock interview sessions or resume bullets.
- **Common Failure Scenarios:** Accidental inclusion of confidential client names in resume (redacted by PII filter).
- **Desired Outcomes:** Securing a senior corporate role discreetly within 3–6 months.
- **Relevant Analytics Events:** `stealth_mode.enabled`, `mentor.booked`, `executive_job.viewed`.

---

## Persona 4: Continuous Skill Learner (Upskilling CA)

- **Profile:** Practicing or employed CA wanting to bridge practical knowledge gaps in new regulations (Ind AS 115/116, GST disputes, International Tax, Python for Finance).
- **Jobs To Be Done (JTBD):**
  - *"When new accounting standards or tax circulars are notified, I want practical case simulations so that I can apply them correctly in client audits or management reporting."*
- **Entry Point & Onboarding:** Navigating from ICAI update newsletters or technical webinar links.
- **Dashboard & Navigation:** Practical Skills Lab $\rightarrow$ Simulation Case Library $\rightarrow$ Progress & Scorecard History.
- **Primary Actions:** Practice simulated audit scenarios; complete financial modeling Excel drills; review objective feedback.
- **Data Owned:** Skill scores, exercise submissions, personal learning task list.
- **Data Accessible:** Synthetic case repository, standard answer keys, regulatory citation index.
- **Prohibited Actions:** Cannot claim certification without completing evaluation criteria.
- **Common Failure Scenarios:** Submitting invalid modeling formats; exercise timeout.
- **Desired Outcomes:** Demonstrating verifiable competency in target skills within 30 days.
- **Relevant Analytics Events:** `simulation.started`, `drill.completed`, `skill.score_improved`.

---

## Persona 5: Independent CA Practitioner (Firm Founder)

- **Profile:** Sole proprietor or partner in a newly constituted CA firm (0–3 years in practice); holds Certificate of Practice (COP) from ICAI.
- **Jobs To Be Done (JTBD):**
  - *"When setting up my independent practice, I want a structured post-qualification compliance checklist so that I do not miss mandatory ICAI or statutory filings."*
  - *"When managing my early clients, I want a lightweight compliance calendar and KYC tracker so that audit and tax deadlines are tracked without enterprise software costs."*
- **Entry Point & Onboarding:** Navigating from COP application guides or ICAI portal informational resources. Organization Workspace setup for the firm.
- **Dashboard & Navigation:** Practice Operations Workspace $\rightarrow$ Client Master CRM $\rightarrow$ Compliance Calendar $\rightarrow$ Document Vault.
- **Primary Actions:** Generate client engagement letters (SA 210 standard); track GST/ITR filing deadlines; log CPE credit hours.
- **Data Owned:** Firm profile, client master KYC records, firm compliance tasks, encrypted working paper metadata.
- **Data Accessible:** Official regulatory links, statutory deadline schedules, engagement templates.
- **Prohibited Actions:** **Strictly prohibited from client solicitation, public commercial advertisement, or lead-generation bidding (ICAI Code of Ethics Clauses 6 & 7).**
- **Common Failure Scenarios:** Attempting to create public firm promotional profiles (blocked by compliance guard); missing client statutory deadlines.
- **Desired Outcomes:** Zero statutory compliance penalties across all managed clients during the first year of practice.
- **Relevant Analytics Events:** `practice_workspace.created`, `client.added`, `compliance_task.completed`.

---

## Persona 6: Corporate Recruiter (Enterprise Employer)

- **Profile:** Talent Acquisition Specialist at a multinational corporation (e.g. Unilever, Tata, Reliance) or technology unicorn hiring qualified CAs for internal audit, FP&A, and treasury.
- **Jobs To Be Done (JTBD):**
  - *"When sourcing CA candidates, I want to filter by verified articleship exposure and specific Ind AS capabilities so that I do not waste time on unqualified applicants."*
  - *"When managing my hiring pipeline, I want ATS integration and transparent candidate application tracking so that interview rounds proceed without drop-offs."*
- **Entry Point & Onboarding:** Organization Workspace invite from HR Director; corporate domain email verification.
- **Dashboard & Navigation:** Recruiter Portal $\rightarrow$ Active Job Requisitions $\rightarrow$ Applicant Pipeline Board $\rightarrow$ Candidate Shortlist.
- **Primary Actions:** Post verified job requisitions; filter candidates by verified articleship exposure; review attested resumes; issue interview invitations.
- **Data Owned:** Job descriptions, internal evaluation notes, hiring status updates, employer branding assets.
- **Data Accessible:** Resumes and applications submitted directly to their firm's job postings.
- **Prohibited Actions:** **Cannot search or view candidates who have not applied or who have activated privacy shields; cannot view candidates currently working at their own organization.**
- **Common Failure Scenarios:** Attempting to view candidate personal notes; webhook sync failure with corporate ATS.
- **Desired Outcomes:** Reducing time-to-hire for qualified CAs from 45 days to under 21 days.
- **Relevant Analytics Events:** `job.posted`, `application.reviewed`, `interview.invited`.

---

## Persona 7: CA Firm Recruiter (Partner / HR Manager at Accounting Firm)

- **Profile:** Partner or HR Manager at a Big 4, Top 20, or mid-tier CA firm hiring qualified CAs for Statutory Audit, Tax, or Risk Advisory practices.
- **Jobs To Be Done (JTBD):**
  - *"When hiring qualified CAs for busy audit season, I want candidates with verified exposure to specific client industries (e.g. BFSI, Manufacturing) so that onboarding time is minimal."*
- **Entry Point & Onboarding:** Firm Organization Workspace onboarding with ICAI firm registration verification.
- **Dashboard & Navigation:** Firm Recruitment Board $\rightarrow$ Audit Season Pipeline $\rightarrow$ Applicant Evaluator.
- **Primary Actions:** Post practice-specific openings; review candidates' verified articleship credentials; manage bulk interview rounds.
- **Data Owned:** Firm job posts, internal candidate ratings, interview schedules.
- **Data Accessible:** Applicants submitted to their posted firm jobs.
- **Prohibited Actions:** Cannot view candidate salary negotiation notes or competing offer sheets.
- **Common Failure Scenarios:** Requisition posting rejected due to missing domain verification.
- **Desired Outcomes:** Filling audit season staffing requirements with domain-ready CAs 30 days before peak filing periods.
- **Relevant Analytics Events:** `firm_job.published`, `candidate.shortlisted`.

---

## Persona 8: Senior CA Mentor (Advisory Veteran)

- **Profile:** Senior CA (Partner, CFO, or Financial Controller with 10+ years post-qualification experience) offering structured advisory sessions to newly qualified CAs.
- **Jobs To Be Done (JTBD):**
  - *"When guiding young CAs, I want a structured session agenda and verified background snapshot so that my advisory time delivers maximum impact."*
- **Entry Point & Onboarding:** Invitation-only mentor onboarding; ICAI membership verification; LinkedIn profile attestation; slot calendar setup.
- **Dashboard & Navigation:** Mentor Console $\rightarrow$ Upcoming Advisory Sessions $\rightarrow$ Candidate Pre-Reads $\rightarrow$ Session Feedback Notes.
- **Primary Actions:** Set advisory availability; review candidate career background pre-read; submit post-session actionable guidance notes.
- **Data Owned:** Mentor profile, session feedback notes, availability calendar.
- **Data Accessible:** Candidate pre-read summary shared explicitly for the booking.
- **Prohibited Actions:** Cannot promise job placement or commercial recruitment guarantees; cannot access candidate confidential offer letters.
- **Common Failure Scenarios:** Calendar scheduling conflict; candidate no-show.
- **Desired Outcomes:** Delivering actionable career direction with $\ge 90\%$ candidate satisfaction score.
- **Relevant Analytics Events:** `mentor_slot.published`, `session.conducted`, `mentor_feedback.submitted`.

---

## Persona 9: Organization Administrator (Employer / Firm Account Owner)

- **Profile:** Head of HR or Managing Partner responsible for managing the organization's account, seat licenses, team roles, and billing.
- **Jobs To Be Done (JTBD):**
  - *"When managing my firm's subscription, I want to control team member access and view usage metrics so that recruiting budgets are spent efficiently."*
- **Entry Point & Onboarding:** Account creator / owner credentials.
- **Dashboard & Navigation:** Organization Settings $\rightarrow$ Team Members & RBAC $\rightarrow$ Billing & Invoices $\rightarrow$ Security Audit.
- **Primary Actions:** Invite team recruiters (`RECRUITER`, `VIEWER`); update billing payment methods; download GST-compliant tax invoices.
- **Data Owned:** Organization metadata, billing details, member invitation states.
- **Data Accessible:** Aggregated team posting counts, candidate application volumes, audit logs.
- **Prohibited Actions:** Cannot inspect candidate Personal Workspaces; cannot bypass workspace isolation rules.
- **Common Failure Scenarios:** Credit card payment failure; invitation link expiration.
- **Desired Outcomes:** Seamless multi-seat hiring operations with zero access control breaches.
- **Relevant Analytics Events:** `member.invited`, `subscription.upgraded`, `invoice.downloaded`.

---

## Persona 10: Platform Administrator (DevSecOps / Compliance Operator)

- **Profile:** Internal engineering or operations lead maintaining system security, data privacy compliance, job feed integrity, and infrastructure health.
- **Jobs To Be Done (JTBD):**
  - *"When operating the platform, I want to monitor worker queues, verify feed freshness, and investigate security anomalies without compromising candidate privacy."*
- **Entry Point & Onboarding:** Hardware MFA-gated internal administration portal with IP allowlisting.
- **Dashboard & Navigation:** Admin Telemetry Portal $\rightarrow$ Worker Queue Health $\rightarrow$ Ingestion Pipeline Monitor $\rightarrow$ Tamper-Evident Audit Stream.
- **Primary Actions:** Review flagged suspicious job postings; inspect DLQ job failures; verify provider zero-data retention compliance; handle emergency security escalations.
- **Data Owned:** System health metrics, error logs, security telemetry.
- **Data Accessible:** Aggregated operational metrics, tamper-evident audit logs.
- **Prohibited Actions:** **Strictly prohibited from viewing candidate resumes, personal prompts, or offer letters in plaintext without an active, audited, time-bounded emergency security escalation token.**
- **Common Failure Scenarios:** Ingestion feed upstream failure; Redis queue latency spike.
- **Desired Outcomes:** Maintaining $\ge 99.9\%$ core system availability with zero PII leaks.
- **Relevant Analytics Events:** `admin.login_mfa`, `job_feed.resynced`, `security_escalation.logged`.
