# CA CAREER OS — REMAINING GAPS & ENGINEERING ROADMAP (v2.0.0)

**Document Version:** 2.0.0  
**Updated:** October 2026  
**Auditor:** Senior Data Science & ML Engineering Team  

---

## 1. Overview of Honest Technical Status

Following the execution of the remediation workstream, the CA Career OS platform has transitioned from synthetic fixtures to verified real-world datasets and reproducible notebooks. However, professional data science standards require transparent documentation of remaining technical limitations and external dependencies.

---

## 2. Itemized Gap Analysis

### Gap 1: Recruiter-Annotated Ground Truth for Job Matching (ML-01)
- **Current State:** Evaluated on real EMSCAD job postings matched against 4 standardized CA candidate archetypes using an explainable deterministic ranking engine.
- **Limitation:** While ranking metrics (NDCG@5, Precision@3) demonstrate clean separation between candidate levels, the dataset lacks empirical recruiter hire/reject labels from real Indian hiring processes.
- **Required Next Step:** Deploy an internal Recruiter Annotation Portal where hiring managers and CA partners review and rate anonymized candidate-job pairs on a 5-point Likert scale with standardized rationale tags.
- **Status:** `prototype_explainable_baseline_active`

### Gap 2: Live LLM Provider Credentials & Production Inference Deployment
- **Current State:** Evaluated local pretrained Transformer models (`all-MiniLM-L6-v2`) and deterministic multi-factor rubrics. In the NestJS backend, external LLM calls use resilient mocks or fallback rubrics when provider API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) are unconfigured.
- **Limitation:** End-to-end generation quality for the conversational Interview Coach and Knowledge Copilot in production depends on securing live cloud provider credentials or deploying dedicated vLLM GPU inference containers.
- **Required Next Step:** Secure enterprise API keys or provision an on-premise Ollama / vLLM container for self-hosted Llama-3-8B-Instruct.
- **Status:** `mocked_fallback_in_dev_real_eval_in_notebooks`

### Gap 3: Production pgvector Migration for Cloud Scale
- **Current State:** The vector store is serialized as `regulatory_vector_store_v2.pkl` with 384-dimensional dense vectors and evaluated locally in Python. In the NestJS backend, statutory retrieval uses fast keyword matching and structured statutory indexing.
- **Limitation:** To support tens of thousands of regulatory circulars and notifications at scale, the database requires enabling the PostgreSQL `pgvector` extension and adding an HNSW vector index column to the Prisma schema.
- **Prerequisite:** Validate PostgreSQL cloud environment support for `CREATE EXTENSION IF NOT EXISTS vector;` before applying database migration.
- **Status:** `local_vector_store_validated_pgvector_migration_pending`

### Gap 4: Indian Job Portal Scraper Integration
- **Current State:** Ingested 17,880 real job postings from EMSCAD (CC0-1.0), covering international and corporate accounting positions.
- **Limitation:** Direct automated scraping of Indian recruitment portals (Naukri, LinkedIn India) is subject to terms-of-service restrictions, rate limits, and authentication controls.
- **Remediation Policy:** CA Career OS strictly avoids unauthorized scraping. The platform supports authorized partner RSS feeds and direct employer job posting APIs.
- **Status:** `authorized_feeds_only`

---

## 3. Summary of Status Classifications

| AI/ML Feature | Algorithmic Approach | Evaluation Dataset | Status Classification |
| :--- | :--- | :--- | :--- |
| **Job Matching & Ranking** | Deterministic Explainable Multi-Factor | EMSCAD Accounting ($N=725$) | `evaluated_on_real_data` |
| **Job Fraud Detection** | Calibrated Logistic Regression + Rules | EMSCAD Real Postings ($N=15,993$) | `evaluated_on_real_data` |
| **Job Deduplication** | Hash + Metadata + TF-IDF Cosine | EMSCAD Pairs ($N=100$) | `evaluated_on_real_data` |
| **Knowledge Retrieval (RAG)** | Dense Neural (`all-MiniLM-L6-v2`) + Hybrid | ICAI Regulatory Corpus v2 ($N=16$) | `evaluated_on_real_data` |
| **Interview Technical Rubric** | Multi-Factor Anti-Hallucination Rubric | MMLU Professional Accounting ($N=282$) | `evaluated_on_real_data` |
| **Agentic AI Tool Execution** | HMAC-SHA256 Cryptographic Tokens | Synthetic Verification Harness | `implemented_and_tested` |
