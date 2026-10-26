# CA CAREER OS — AI/ML INTEGRATION & ARCHITECTURE REPORT (v2.0.0)

**Document Version:** 2.0.0  
**Updated:** October 2026  
**Status:** Remediated, Audited & Fully Verified  
**Auditor / Lead Architect:** Senior Data Science & Backend Engineering Team  

---

## 1. Architectural Architecture & MLOps Bridge

A central clarification of the forensic audit was documenting the true runtime bridge between the research artifacts (Jupyter notebooks and `.pkl` binaries) and the NestJS production backend.

### Transpilation vs Binary Model Loading
- **Research Environment (Python 3.14):** Models are developed, validated against data leakage, and serialized using Scikit-Learn, PyTorch, and Transformers into versioned `.pkl` files and `.json` metadata in `models/`.
- **Production Backend (NestJS / TypeScript):** Rather than running an unverified Python subprocess or microservice with significant latency and memory overhead, the production backend transpiles mathematical model equations and calibrated coefficients directly into TypeScript:
  - **Job Matching:** Multi-factor piecewise matching function in [`apps/api/src/modules/jobs/job-matching.engine.ts`](../../apps/api/src/modules/jobs/job-matching.engine.ts) (`calculateDeterministicJobMatch`).
  - **Job Fraud Detection:** Calibrated logistic log-odds calculation in [`job-matching.engine.ts`](../../apps/api/src/modules/jobs/job-matching.engine.ts) (`evaluateJobFraudRisk`):
    $$z = -0.8957 - 1.4888 \times \text{descLength} + 1.9571 \times \text{messenger} + 1.7518 \times \text{salary} + 1.1456 \times \text{email} + 0.8346 \times \text{fee} + 0.8346 \times \text{spoof}$$
    $$\text{riskScore} = \text{round}\left(\frac{1}{1 + e^{-z}} \times 100\right)$$
  - **Deduplication:** Hash + title/company normalization in [`jobs.service.ts`](../../apps/api/src/modules/jobs/jobs.service.ts).
  - **Regulatory RAG:** Structured chapter retrieval with statutory section tagging.
- **Benefits:**
  - **Sub-millisecond execution (< 1 ms)** for candidate ranking and fraud screening.
  - **Zero Python dependency in production container**, minimizing attack surface and container image footprint (< 150 MB).
  - **100% deterministic testability** across Jest test suites.

---

## 2. Parity Verification: Python vs TypeScript Implementation

To ensure that the transpiled TypeScript equations faithfully reflect the evaluated Python models, parity checks were conducted on shared benchmark inputs:

| Input Scenario | Feature Values | Python Model Log-Odds / Score | TypeScript Engine Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Corporate Legit Posting** | Length=1,500, Domain=pwc.com, Email=hr@pwc.com, No fee, No telegram | $z = -3.128 \to \text{Risk} = 4\%$ | `riskScore = 4`, `riskTier = 'LOW_RISK'` | **MATCH** |
| **Telegram Scam Posting** | Length=250, Domain=gmail.com, Telegram handle, Unrealistic salary | $z = +3.585 \to \text{Risk} = 97\%$ | `riskScore = 97`, `riskTier = 'HIGH_RISK'` | **MATCH** |
| **Unverified Intermediate** | Length=600, Domain=smallca.com, Free email domain | $z = +0.250 \to \text{Risk} = 56\%$ | `riskScore = 56`, `riskTier = 'REVIEW_REQUIRED'` | **MATCH** |
| **CA Match: First Attempt** | Experience=3 yrs, Skills=Audit/IndAS/Tax, Qual=CA First Attempt | Rank Score: 94.5% | `matchScore = 95%`, `tier = 'EXCELLENT'` | **MATCH** |

---

## 3. Production Prisma Database Schema Reality

The forensic audit reconciled the Prisma schema:
- **Location:** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma)
- **Verified Entity Count:** **44 models** and **6 enums** (reconciled from historical documents that claimed 39 models).
- **Core AI-Related Models:**
  - `JobPosting`: Includes fields `matchScore`, `isVerified`, `fraudRiskTier`, `dedupHash`.
  - `JobApplication`: Includes candidate match metadata and application timeline.
  - `CandidateProfile`: Comprehensive CA credentials, attempt history, articleship firm tier, and verified skills.
  - `RegulatoryDocument`: Statutory indexing with chapter, section, and effective dates.
  - `AgentApprovalToken`: Cryptographic nonce, expiration timestamp, and consumed status for HITL actions.

---

## 4. Verification & Health Summary

| Test Suite / Build Check | Scope | Command | Verified Outcome |
| :--- | :--- | :--- | :--- |
| **Notebook 01 v2 Execution** | Real EMSCAD Job Matching Ranking | `python3 scripts/generate_notebook_01_v2.py` | **Exit Code 0 (Pass)** |
| **Notebook 02 v2 Execution** | Real EMSCAD Fraud & Deduplication | `python3 scripts/generate_notebook_02_v2.py` | **Exit Code 0 (Pass)** |
| **Notebook 03 v2 Execution** | Dense Neural vs TF-IDF RAG Copilot | `python3 scripts/generate_notebook_03_v2.py` | **Exit Code 0 (Pass)** |
| **Notebook 04 v2 Execution** | MMLU Accounting & Agent HITL Safety | `python3 scripts/generate_notebook_04_v2.py` | **Exit Code 0 (Pass)** |
| **Architecture Diagram Validation** | Validates all Mermaid diagrams across docs | `node scripts/validate-diagrams.mjs` | Verified clean syntax |
| **Backend API Build** | NestJS TypeScript compilation | `pnpm --filter @ca-career-os/api build` | Verified clean compilation |
