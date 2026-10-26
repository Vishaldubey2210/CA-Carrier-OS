# CA CAREER OS — DATA DICTIONARY (v2.0.0)

**Version:** 2.0.0  
**Updated:** October 2026  
**Reference:** [`data/manifests/dataset_manifest.json`](../../data/manifests/dataset_manifest.json)

---

## 1. EMSCAD Real Job Postings Schema (`real_job_postings_emscad.csv`)

| Field Name | Data Type | Nullable | Description & Domain |
| :--- | :--- | :--- | :--- |
| `job_id` | Integer | No | Unique numeric identifier for job posting. |
| `title` | String | No | Official job title as posted by employer. |
| `location` | String | Yes | Geographic location (`Country, State, City`). |
| `department` | String | Yes | Functional department or hiring business unit. |
| `salary_range` | String | Yes | Stated compensation range (e.g., `50000-80000`). |
| `company_profile` | Text | Yes | Employer description and company background. |
| `description` | Text | Yes | Detailed responsibilities and role summary. |
| `requirements` | Text | Yes | Mandatory qualifications, skills, and experience. |
| `benefits` | Text | Yes | Listed perks, insurance, retirement, leave. |
| `telecommuting` | Integer | No | Binary flag: `1` for remote, `0` for on-site. |
| `has_company_logo` | Integer | No | Binary flag: `1` if logo attached, `0` if absent. |
| `has_questions` | Integer | No | Binary flag: `1` if screening questions present. |
| `employment_type` | String | Yes | E.g., `Full-time`, `Part-time`, `Contract`. |
| `required_experience` | String | Yes | E.g., `Entry level`, `Mid-Senior level`, `Associate`. |
| `required_education` | String | Yes | E.g., `Bachelor's Degree`, `Master's Degree`, `Certification`. |
| `industry` | String | Yes | Industry vertical (e.g., `Accounting`, `Financial Services`). |
| `function` | String | Yes | Job function code (e.g., `Accounting/Auditing`). |
| **`fraudulent`** | **Integer** | **No** | **Target Label**: `0` = Verified Legitimate, `1` = Confirmed Fraud/Scam. |

---

## 2. MMLU Professional Accounting Schema (`mmlu_professional_accounting_test.parquet`)

| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `question` | Text | No | The professional accounting examination question stem. |
| `choices` | Array[String] | No | 4 multiple-choice options `[A, B, C, D]`. |
| `answer` | Integer | No | Zero-indexed ground-truth answer: `0`=A, `1`=B, `2`=C, `3`=D. |
| `negate_openai_prompt` | Object | Yes | Context prompt for perturbation testing. |
| `neg_question` | Text | Yes | Negated control question for robustness testing. |
| `fewshot_context` | Text | Yes | Standard 5-shot in-domain exemplar prompt. |
| `fewshot_context_neg` | Text | Yes | Negated 5-shot exemplar prompt. |

---

## 3. ICAI Regulatory & Statutory Corpus Schema (`icai_regulatory_corpus_v2.json`)

### Document Entity Schema
| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | No | Unique document ID (e.g., `doc-coact-139`, `doc-sa-240`). |
| `statute` | String | No | Governing act or standard (e.g., `Companies Act, 2013`, `Standards on Auditing`). |
| `section` | String | No | Specific section or standard code (e.g., `Section 139`, `SA 240`). |
| `title` | String | No | Descriptive subject title. |
| `category` | String | No | Domain category (`CORPORATE_LAW_AUDIT`, `STANDARDS_ON_AUDITING`, `ACCOUNTING_STANDARDS_INDAS`, `DIRECT_TAX`, `INDIRECT_TAX`). |
| `effective_date` | String | No | Date effective in Indian law (`YYYY-MM-DD`). |
| `official_source` | String | No | Publishing authority (e.g., `Ministry of Corporate Affairs (MCA) Gazette`). |
| `text` | Text | No | Authentic statutory excerpt and legal provisions. |

### Benchmark Query Entity Schema
| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `query_id` | String | No | Unique query ID (`q-01` to `q-16`). |
| `query` | String | No | Natural language regulatory query. |
| `expected_doc_ids` | Array[String] | No | Target ground-truth document IDs. |
| `expected_citations` | Array[String] | No | Primary legal citations required in the grounded answer. |
| `difficulty` | String | No | Query category (`DIRECT_FACTUAL`, `PROCEDURAL_COMPLIANCE`, `ANALYTICAL_THRESHOLD`, `STATUTORY_THRESHOLD`, `STANDARDS_TECHNICAL`, etc.). |

---

## 4. Preserved Synthetic Data Schemas (Test Fixtures Only)
- `ca_job_matching_synthetic.parquet`: 6 input features (`candidate_experience_years`, `role_seniority_req_years`, `skill_overlap_ratio`, `qual_match_flag`, `location_match_flag`, `salary_overlap_flag`) mapped to deterministic `target_match_score`.
- `job_fraud_synthetic.parquet`: 80 synthetic postings generated from 3 fixed templates.
- `job_dedup_synthetic.parquet`: 60 synthetic job pairs with binary duplicate flags.
