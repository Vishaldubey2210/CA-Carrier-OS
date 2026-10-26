# CA CAREER OS — MODEL CARDS (v2.0.0)

**Document Version:** 2.0.0  
**Updated:** October 2026  
**Status:** Remediated & Validated  

---

## Model Card 1: Deterministic Explainable Job Match Engine (v2.0.0)

- **Model Name:** `Deterministic_Explainable_Job_Match_Engine_v2`
- **Model Type:** Explainable Multi-Factor Deterministic Ranking Function (Transpiled into TypeScript in `job-matching.engine.ts`).
- **Artifact:** `models/ca_job_matcher_v2.pkl` | Metadata: `models/ca_job_matcher_v2_metadata.json`
- **Intended Use:** Rank job vacancies for CA candidates and CA students based on explicit role qualification criteria, skill overlap, seniority, location, and salary expectations.
- **Evaluation Dataset:** EMSCAD Real Accounting & Finance Postings ($N=725$) matched against 4 standardized CA Candidate Archetypes.
- **Performance:** NDCG@5 = 1.0000, Precision@3 = 1.0000.
- **Remediation Note:** Replaced the circular synthetic formula ($R^2=0.9999$ on synthetic data) with a transparent, audited ranking framework evaluated on real job postings.

---

## Model Card 2: Real-World Job Fraud Detector (v2.0.0)

- **Model Name:** `Job_Fraud_Detector_Real_EMSCAD_v2`
- **Model Type:** Balanced L2 Regularized Logistic Regression + Structural Risk Signals + TF-IDF Vectorizer (1,000 features).
- **Artifact:** `models/job_fraud_detector_v2.pkl` | Metadata: `models/job_fraud_detector_v2_metadata.json`
- **Intended Use:** Screen incoming employer job postings and classify into 3 operational risk tiers (`LOW_RISK`, `REVIEW_REQUIRED`, `HIGH_RISK`) to protect job-seeking CAs from recruitment scams.
- **Evaluation Dataset:** Real EMSCAD Job Postings ($N=15,993$ deduplicated unique jobs, 3,199 test samples, 4.84% positive scam class).
- **Performance:**
  - Test ROC-AUC: **0.9710**
  - Test PR-AUC: **0.7209**
  - True Scam Capture Rate (Review or High Risk): **91.61%**
  - False Rejection Rate of Legitimate Employers: **3.50%**
- **Decision Thresholds:**
  - `HIGH_RISK` ($\ge 0.75$ or critical fee/messenger triggers): Auto-blocked.
  - `REVIEW_REQUIRED` ($0.40 \le \text{score} < 0.75$ or free email domain): Routed to human moderation queue.
  - `LOW_RISK` ($< 0.40$): Auto-approved.
- **Remediation Note:** Replaced the repetitive 3-template synthetic 80-row fixture (which suffered from cross-fold leakage) with the real 17,880-row EMSCAD corpus and leakage-resistant evaluation.

---

## Model Card 3: Vacancy Deduplication Engine (v2.0.0)

- **Model Name:** `Job_Deduplication_Engine_v2`
- **Model Type:** Multi-Stage Deduplication (Exact SHA-256 Hash $\to$ Normalized Title+Company Match $\to$ TF-IDF Cosine Similarity).
- **Artifact:** `models/job_dedup_engine_v2.pkl` | Metadata: `models/job_dedup_engine_v2_metadata.json`
- **Intended Use:** Detect duplicate postings and reposted vacancies across aggregated job feeds.
- **Evaluation Dataset:** 100 Real Job Pairs from EMSCAD (50 duplicates/near-duplicates, 50 distinct).
- **Performance at Recommended Threshold (0.85):**
  - Precision: **1.0000** (Zero false merges on distinct jobs)
  - Recall: **0.6800**
  - F1-Score: **0.8095**
- **Operational Guidelines:** Set auto-merge threshold to 0.85 to eliminate false merges. Scores between 0.70 and 0.84 trigger human review.

---

## Model Card 4: CA Regulatory Knowledge Vector Store (v2.0.0)

- **Model Name:** `CA_Regulatory_Vector_Store_v2`
- **Model Type:** Pretrained Dense Transformer Embeddings (`sentence-transformers/all-MiniLM-L6-v2`, 384 dimensions) + Lexical TF-IDF Vectorizer + Out-of-Corpus Abstention Filter.
- **Artifact:** `models/regulatory_vector_store_v2.pkl` | Metadata: `models/regulatory_vector_store_v2_metadata.json`
- **Intended Use:** Retrieve authoritative statutory provisions from the Companies Act 2013, Standards on Auditing, CARO 2020, Ind AS, and Tax laws to support the Knowledge Copilot RAG pipeline.
- **Evaluation Dataset:** ICAI Regulatory Corpus v2 (16 authentic statutory chapters, 16 tiered benchmark queries).
- **Performance:**
  - Dense Neural: Recall@1 = **0.8750**, Recall@3 = **0.9375**, MRR = **0.9219**
  - Lexical TF-IDF: Recall@1 = **0.9375**, Recall@3 = **1.0000**, MRR = **0.9688**
  - Hybrid (0.35/0.65): Recall@1 = **0.8750**, Recall@3 = **1.0000**, MRR = **0.9375**
  - Out-of-Corpus Abstention Threshold: **0.50** (100% correct rejection on foreign statutory queries).
- **Remediation Note:** Replaced the synthetic 5-document TF-IDF baseline with authentic statutory chapters and a true 384-dimensional dense neural Transformer model.

---

## Model Card 5: Technical Interview Evaluator & Agent Safety (v2.0.0)

- **Model Name:** `Interview_Evaluator_Technical_Rubric_v2`
- **Model Type:** Multi-Factor Domain Rubric (Concept Coverage, Statutory Precision, Anti-Hallucination, Fluff Penalties) + Cryptographic HMAC-SHA256 HITL Agent Execution Tokens.
- **Artifact:** `models/interview_evaluator_v2.pkl` | Metadata: `models/interview_evaluator_v2_metadata.json`
- **Intended Use:** Evaluate candidate technical interview responses without awarding scores to verbose non-answers; enforce security boundaries on autonomous agent actions.
- **Evaluation Dataset:** MMLU Professional Accounting Test Set ($N=282$ authentic exam questions).
- **Performance:**
  - Perfect Answer: 100/100
  - Verbose Word Salad: 0/100 (Penalized for low concept density)
  - Hallucinated Citation: 0/100 (Penalized for non-existent sections)
  - Agent Security: 100% verification of HITL tokens, nonce replay blocking, TTL expiry, and signature tamper detection.
