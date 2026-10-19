# CA Career OS — Architectural & Domain Glossary

> **Document Type:** Terminology, Acronyms & Domain Definitions  
> **Status:** Approved Baseline  
> **Audience:** All Engineering, Product, and Domain Stakeholders  

---

## 1. Chartered Accountancy & Indian Domain Terms

- **ACA (Associate Chartered Accountant):** Initial professional membership status granted by ICAI after clearing CA Final examinations and mandatory practical training.
- **Articleship:** Mandatory 2–3 year practical training period completed by CA students under a practicing Chartered Accountant or CA firm prior to final qualification.
- **COP (Certificate of Practice):** Regulatory license granted by ICAI under the Chartered Accountants Act, 1949, entitling an ACA/FCA to engage in public practice as an auditor or tax consultant.
- **CTC (Cost to Company):** Total annual expenditure incurred by an employer on an employee, comprising fixed basic pay, allowances (HRA), performance variable pay, retiral contributions (PF, Gratuity), and insurance.
- **FCA (Fellow Chartered Accountant):** Senior membership status granted by ICAI to an Associate member after completing 5 continuous years of full-time professional practice or employment.
- **ICAI (Institute of Chartered Accountants of India):** Statutory professional accountancy body established under the Chartered Accountants Act, 1949, regulating the profession in India.
- **ICAI Code of Ethics (2020):** Mandatory ethical and professional conduct standard for CAs. Clauses (6) and (7) of Part I of the First Schedule strictly prohibit members in practice from soliciting clients or advertising services publicly.
- **Ind AS (Indian Accounting Standards):** Accounting standards converged with International Financial Reporting Standards (IFRS) notified by the Ministry of Corporate Affairs (MCA) in India.
- **SA 210 (Standard on Auditing 210):** Mandatory auditing standard governing the agreement of terms of audit engagements between a practitioner and a client.
- **Transfer Pricing (TP):** Indian tax regulations (Section 92 to 92F of the Income Tax Act) governing transactions between associated enterprises at arm's length prices.

---

## 2. Software Architecture & Security Terms

- **ATS (Applicant Tracking System):** Enterprise hiring software used by corporate recruiters to parse, filter, rank, and manage job applicants.
- **BOLA (Broken Object-Level Authorization) / IDOR:** Security vulnerability where an API endpoint fails to verify that the requesting user owns the object referenced by an identifier.
- **Current Employer Blindfold:** Architectural security control programmatically preventing a candidate's current employer from discovering or viewing their active job search activity.
- **DLQ (Dead-Letter Queue):** Secondary queue in BullMQ holding messages that have repeatedly failed processing after exhausting maximum configured retry attempts.
- **HNSW (Hierarchical Navigable Small World):** Graph-based indexing algorithm in `pgvector` enabling sub-linear approximate nearest neighbor (ANN) vector searches.
- **Idempotency Key:** Unique cryptographic identifier attached to state-mutating HTTP requests ensuring an identical operation is never executed more than once.
- **Modular Monolith:** Software architecture pattern where a single unified codebase and deployment container maintains strictly encapsulated domain boundaries and module isolation.
- **pgvector:** Open-source PostgreSQL extension providing vector storage, cosine distance, and inner product similarity search inside relational tables.
- **RRF (Reciprocal Rank Fusion):** Information retrieval algorithm that merges rankings from lexical full-text search and semantic vector embeddings into a single ranked score.
- **WORM (Write Once Read Many):** Storage integrity architecture where records, once written, cannot be modified or deleted prior to legal retention expiration.
- **Zero-Fabrication Guard (ADR-009):** Programmatic and architectural constraint ensuring generative AI never introduces unverified credentials, metrics, or factual statements into candidate resumes.
