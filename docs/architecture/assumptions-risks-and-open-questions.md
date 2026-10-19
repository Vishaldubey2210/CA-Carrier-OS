# CA Career OS — Assumptions, Risks & Open Architectural Questions

> **Document Type:** Risk Management & Research Spike Backlog  
> **Status:** Approved Baseline — Implementation Pending  
> **Audience:** Principal Architects, Engineering Leads, Product Managers  

---

## 1. Architectural & Domain Assumptions

1. **Candidate Onboarding Data Currency:** Assumes newly qualified CAs can accurately remember and classify their articleship domains and software tools during a 5-minute onboarding flow.
2. **ICAI Portal Non-Interference:** Assumes linking to official ICAI SSP portal pages with deep-links does not violate ICAI website terms of service, as no unauthorized automated scraping is performed.
3. **Turn-Based vs WebRTC Voice Mock Interviews:** Assumes turn-based audio processing (Record $\rightarrow$ Whisper STT $\rightarrow$ LLM $\rightarrow$ TTS) provides sufficient interview realism for MVP while avoiding WebRTC packet drops over Indian cellular networks.

---

## 2. Risk Management Matrix

| Risk Category | Severity | Likelihood | Architectural Mitigation | Residual Risk |
| :--- | :--- | :--- | :--- | :--- |
| **AI Credential Hallucination** | **Critical** | High | **Zero-Fabrication Guard (ADR-009):** Structural JSON extraction; mandatory candidate attestation before export. | Low (Human review required). |
| **Cross-Tenant Employer Leakage** | **Critical** | Medium | **Dual-Workspace Isolation & Current Employer Blindfold:** Query builders explicitly exclude employer firm. | Low (Enforced via automated test assertions). |
| **Autonomous AI Recruiter Spam** | **High** | Medium | **Human-in-the-Loop Gateway:** External actions physically require user click on 15m signed token card. | Negligible (Agent has zero autonomous send rights). |
| **RBI e-Mandate Subscription Churn** | **Medium** | High | Offer fixed upfront 3-month and 6-month placement passes via UPI alongside auto-debit cards. | Medium (Indian payment dynamics). |
| **Stale / Ghost Job Listings** | **Medium** | High | Automatic 30-day listing expiration; daily background freshness checker; crowdsourced candidate flag. | Low. |

---

## 3. Prioritized Research Spike Backlog

The following technical spikes must be executed prior to or during Phase 1/Phase 2 implementation:

### Spike 1: HNSW Vector Index Memory Benchmark at Scale
- **Question:** What is the memory consumption and query latency of the `pgvector` HNSW index when indexing 100,000 job descriptions (1536-dimensional vectors) on a 16GB RAM Aurora instance?
- **Action:** Run synthetic vector load test using `pgbench` measuring P95 latency vs RAM utilization.
- **Success Criteria:** P95 search latency remains $<150$ms without database buffer pool thrashing.

### Spike 2: Turn-Based Audio Latency on Indian Mobile Networks
- **Question:** What is the end-to-end roundtrip latency of candidate audio recording $\rightarrow$ Whisper API transcription $\rightarrow$ Gemini Flash response over 4G mobile connections in Tier-2 Indian cities?
- **Action:** Build a 50-sample benchmarking test harness simulating 200kbps uplinks.
- **Success Criteria:** Roundtrip latency $<2.5$ seconds for 80% of test turns.

### Spike 3: Indian HRMS / ATS Partner Integration Feasibility
- **Question:** Which leading Indian HRMS/ATS platforms (Darwinbox, Keka, GreytHR) offer open webhook APIs for candidate application sync without requiring enterprise partnership agreements?
- **Action:** Conduct technical API discovery with vendor documentation and partner developer programs.
- **Success Criteria:** Identify at least 2 ATS platforms supporting standard inbound webhook pushes.
