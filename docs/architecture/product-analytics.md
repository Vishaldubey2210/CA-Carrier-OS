# CA Career OS — Product Analytics & Telemetry Taxonomy

> **Document Type:** Product Telemetry, Event Taxonomy & Metrics Specification  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Product Managers, Data Engineers, Growth Leads  

---

## 1. Analytics Governance & Privacy Guarantees

> **Strict Non-Negotiable Privacy Rule:** Analytics sinks (PostHog / Mixpanel / BigQuery) **must never ingest personal identifiable information** (candidate full name, phone number, email address, postal address, raw resume bullet points, or financial CTC amounts). All analytics payloads use anonymized `distinct_id` (hashed user UUID) and discrete category tokens.

---

## 2. Event Taxonomy & Schemas (14 Core Product Events)

| Event Name | User Action Trigger | Required Properties | Prohibited Properties | Aggregation Metric |
| :--- | :--- | :--- | :--- | :--- |
| `candidate.onboarded` | Candidate finishes articleship inventory on `/app/onboarding`. | `firmTier`, `domainCount`, `attemptCount`, `cityCount` | Raw firm name, candidate phone, email | Onboarding Funnel Conversion % |
| `diagnostic.completed` | Candidate views 6-pathway scorecards on `/app/dashboard`. | `topPathway`, `topFitScore`, `calculationDurationMs` | User name, raw score notes | Diagnostic Engagement Rate |
| `career_path.selected` | Candidate clicks to lock in primary pathway roadmap. | `selectedPathway`, `daysFromOnboarding` | Personal career notes | Pathway Decision Velocity |
| `jobs.searched` | Candidate executes search on `/app/jobs`. | `hasKeywords`, `hasLocationFilter`, `resultCount`, `matchScoreMax` | Raw search terms with PII | Search Efficiency & Zero-Result % |
| `job.saved` | Candidate bookmarks job listing. | `jobId`, `caPathway`, `employerTier` | Candidate personal notes | Job Interest Index |
| `resume.tailored` | System completes ATS tailoring draft. | `focusAreaCount`, `skillsMatchedCount`, `durationSeconds` | Raw resume bullet points | Resume Tailoring Usage |
| `resume.attested` | Candidate checks attestation checkbox (ADR-009). | `resumeVersionId`, `attestationChecked: true` | Candidate signature text | **Attestation Compliance Rate (100%)** |
| `application.created` | Candidate records job application in tracker. | `status`, `hasAttestedResume: true`, `hasFollowUpDate` | Company recruiter email | Pipeline Progression Volume |
| `interview.completed` | Candidate completes 8-turn technical mock drill. | `domain`, `scoreTechnical`, `scoreIndAS`, `durationMinutes` | Candidate answer transcripts | Technical Readiness Uplift |
| `learning_task.done` | Candidate marks bridging roadmap task complete. | `domain`, `estimatedMinutes`, `taskCategory` | Personal study notes | Skill Gap Closure Velocity |
| `offer.unbundled` | Candidate uses CTC Unbundler calculator. | `metroCity: boolean`, `regimeSelected: OLD/NEW`, `hasBonus` | Actual rupee CTC values | Offer Decision Confidence Index |
| `mentor.booked` | Candidate confirms slot with senior CA mentor. | `mentorDomain`, `durationMinutes`, `sessionFeePaise` | Candidate advisory notes | Mentorship Marketplace GMV |
| `subscription.upgraded`| Organization or Candidate upgrades to paid plan. | `plan: PRO/TEAM`, `billingCycle: MONTHLY/ANNUAL` | Credit card numbers, GSTIN | MRR / ARR Conversion Rate |
| `account.deleted` | Candidate initiates account deletion request. | `daysActive`, `applicationsCount`, `reasonCategory` | Candidate PII | Account Churn Rate |

---

## 3. Product Success Metrics & Formulas

| Proposed Metric | Formula & Computation | Data Source | Target Hypothesis |
| :--- | :--- | :--- | :--- |
| **Pathway Decision Velocity** | Average days elapsed between `candidate.onboarded` and `career_path.selected`. | Analytics Event Stream | $\le 7$ Days post-onboarding |
| **Zero-Fabrication Attestation Rate** | $\frac{\text{Exported Resumes with candidateAttested == true}}{\text{Total Exported Resumes}} \times 100$ | PostgreSQL `ResumeVersion` | **$100.0\%$ (Strict Architectural Invariant)** |
| **Search-to-Application Rate** | $\frac{\text{Applications Created}}{\text{Unique Active Job Searchers}} \times 100$ | Analytics Event Stream | Target: $\ge 18\%$ |
| **Technical Mock Score Uplift** | $\text{Score}_{\text{Session } N} - \text{Score}_{\text{Session 1}}$ across identical Ind AS modules. | PostgreSQL `InterviewFeedback` | $\ge +15\%$ improvement over 3 drills |
| **Stale Listing Rate** | $\frac{\text{Job Postings Reported Stale or Expired}}{\text{Total Active Job Postings}} \times 100$ | PostgreSQL `Job` & User Flags | $< 2.0\%$ stale job rate |
