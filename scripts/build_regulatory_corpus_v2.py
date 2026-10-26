"""
Builder for ICAI Regulatory & Standards Corpus v2.
Expanded authentic statutory extracts from official Government of India Gazette,
ICAI Standards on Auditing, Ind AS, Income Tax Act, and CGST Act.
"""

import json
import hashlib
from pathlib import Path

WORKSPACE_ROOT = Path("/home/vishal/Downloads/CA Carrer OS")
OUTPUT_PATH = WORKSPACE_ROOT / "data" / "external" / "icai_regulatory_corpus_v2.json"

documents = [
    {
        "id": "doc-coact-139",
        "statute": "Companies Act, 2013",
        "section": "Section 139",
        "title": "Appointment of Statutory Auditors & Mandatory Rotation",
        "category": "CORPORATE_LAW_AUDIT",
        "effective_date": "2014-04-01",
        "official_source": "Ministry of Corporate Affairs (MCA) Gazette",
        "text": "Section 139(2) mandates that listed companies and prescribed classes of unlisted public/private companies shall not appoint or re-appoint: (a) an individual as auditor for more than one term of five consecutive years; and (b) an audit firm as auditor for more than two terms of five consecutive years. Cooling-off period: An auditor or audit firm who has completed their consecutive term(s) shall not be eligible for re-appointment as auditor in the same company for five years from the completion of such term. Threshold for private limited companies: Paid-up share capital of Rs. 50 crore or more, or borrowings from banks/financial institutions exceeding Rs. 50 crore."
    },
    {
        "id": "doc-coact-140",
        "statute": "Companies Act, 2013",
        "section": "Section 140",
        "title": "Removal, Resignation of Auditor and Special Notice",
        "category": "CORPORATE_LAW_AUDIT",
        "effective_date": "2014-04-01",
        "official_source": "Ministry of Corporate Affairs (MCA) Gazette",
        "text": "Section 140(1) prescribes that the auditor appointed under section 139 may be removed from his office before the expiry of his term only by a special resolution of the company, after obtaining the previous approval of the Central Government (Regional Director) in Form ADT-2 within 30 days of Board resolution. Section 140(2) mandates that the auditor who has resigned from the company shall file within a period of thirty days from the date of resignation, a statement in Form ADT-3 with the company and the Registrar of Companies indicating the reasons and other facts as may be relevant."
    },
    {
        "id": "doc-coact-141",
        "statute": "Companies Act, 2013",
        "section": "Section 141",
        "title": "Eligibility, Qualifications and Disqualifications of Auditors",
        "category": "CORPORATE_LAW_AUDIT",
        "effective_date": "2014-04-01",
        "official_source": "Ministry of Corporate Affairs (MCA) Gazette",
        "text": "Section 141(3) specifies disqualifications: (a) body corporate other than LLP; (b) officer or employee of company; (c) partner or employee of an officer/employee; (d) a person who, or his relative or partner, holds security or interest in company (relative may hold security up to face value of Rs. 1 lakh), or is indebted to company exceeding Rs. 5 lakh, or has given guarantee exceeding Rs. 1 lakh; (e) a person or firm who has direct or indirect business relationship with company or subsidiary; (f) person whose relative is a director or key managerial personnel; (g) person in full-time employment elsewhere or holding appointment in more than 20 companies; (h) person convicted of an offence involving fraud with 10 years not elapsed."
    },
    {
        "id": "doc-coact-143",
        "statute": "Companies Act, 2013",
        "section": "Section 143(12)",
        "title": "Reporting on Fraud by Statutory Auditor to Central Government",
        "category": "CORPORATE_LAW_AUDIT",
        "effective_date": "2015-12-14",
        "official_source": "Ministry of Corporate Affairs (MCA) Gazette",
        "text": "Under Section 143(12) read with Rule 13 of the Companies (Audit and Auditors) Rules, 2014, if an auditor of a company, in the course of the performance of his duties as statutory auditor, has reason to believe that an offence of fraud involving an amount of Rs. 1 crore (INR 10 million) or above is being or has been committed in the company by its officers or employees, the auditor shall report the matter to the Central Government (Ministry of Corporate Affairs) within the specified time. Reporting procedure: The auditor must report to the Board or Audit Committee within 2 days seeking reply within 45 days. On receipt of reply or failure to receive reply, the auditor must forward the report in Form ADT-4 to the Secretary, MCA within 15 days."
    },
    {
        "id": "doc-coact-144",
        "statute": "Companies Act, 2013",
        "section": "Section 144",
        "title": "Auditor Not to Render Certain Prohibited Non-Audit Services",
        "category": "CORPORATE_LAW_AUDIT",
        "effective_date": "2014-04-01",
        "official_source": "Ministry of Corporate Affairs (MCA) Gazette",
        "text": "Section 144 mandates that an auditor shall provide to the company only such other services as are approved by the Board of Directors or the Audit Committee, but shall not include any of the following services (whether rendered directly or indirectly to the company, holding company, or subsidiary): (a) accounting and book-keeping services; (b) internal audit; (c) design and implementation of any financial information system; (d) actuarial services; (e) investment advisory services; (f) investment banking services; (g) rendering of outsourced financial services; (h) management services; and (i) any other kind of services as may be prescribed."
    },
    {
        "id": "doc-caro-2020",
        "statute": "Companies (Auditor's Report) Order, 2020",
        "section": "CARO 2020 Order Clause 3",
        "title": "Mandatory Inclusions in CARO 2020 Audit Report",
        "category": "AUDITING_STANDARDS",
        "effective_date": "2021-04-01",
        "official_source": "ICAI Auditing and Assurance Standards Board (AASB)",
        "text": "CARO 2020 contains 21 distinct clauses. Clause 3(i) mandates reporting on property, plant and equipment, title deeds of immovable properties held in name other than company, and proceedings for benami property. Clause 3(ii) requires physical verification of inventory and reporting whether working capital limits sanctioned by banks in excess of Rs. 5 crore were secured by quarterly returns agreeing with books. Clause 3(ix) requires reporting on default in repayment of loans or borrowings, whether company is declared wilful defaulter, and diversion of term loans. Clause 3(xvii) mandates reporting on whether company has incurred cash losses in current financial year and immediately preceding financial year."
    },
    {
        "id": "doc-sa-200",
        "statute": "Standards on Auditing (ICAI AASB)",
        "section": "SA 200",
        "title": "Overall Objectives of the Independent Auditor & Conduct of Audit",
        "category": "AUDITING_STANDARDS",
        "effective_date": "2010-04-01",
        "official_source": "ICAI Handbook of Auditing Pronouncements",
        "text": "SA 200 establishes the independent auditor's overall objectives: (a) to obtain reasonable assurance about whether the financial statements as a whole are free from material misstatement, whether due to fraud or error, enabling the auditor to express an opinion on whether the financial statements are prepared, in all material respects, in accordance with an applicable financial reporting framework; and (b) to report on the financial statements, and communicate as required by the SAs. Core principles include compliance with ethical requirements including independence, maintenance of professional skepticism throughout planning and performance, and exercise of professional judgment."
    },
    {
        "id": "doc-sa-240",
        "statute": "Standards on Auditing (ICAI AASB)",
        "section": "SA 240",
        "title": "The Auditor's Responsibilities Relating to Fraud in Financial Statements",
        "category": "AUDITING_STANDARDS",
        "effective_date": "2010-04-01",
        "official_source": "ICAI Handbook of Auditing Pronouncements",
        "text": "SA 240 deals with fraud risk assessment. An auditor is responsible for obtaining reasonable assurance that financial statements are free from material misstatement caused by fraud. Two types of intentional misstatements are relevant: fraudulent financial reporting (e.g. manipulation, falsification, alteration of accounting records, intentional misapplication of accounting principles) and misappropriation of assets. Because management is in a unique position to perpetrate fraud through management override of controls, the auditor must perform procedures including: testing journal entries, reviewing accounting estimates for biases, and evaluating business rationale for significant unusual transactions."
    },
    {
        "id": "doc-sa-705",
        "statute": "Standards on Auditing (ICAI AASB)",
        "section": "SA 705 (Revised)",
        "title": "Modifications to the Opinion in the Independent Auditor's Report",
        "category": "AUDITING_STANDARDS",
        "effective_date": "2018-04-01",
        "official_source": "ICAI Handbook of Auditing Pronouncements",
        "text": "SA 705 governs modifications to audit opinions: (a) Qualified Opinion is expressed when auditor concludes misstatements are material but not pervasive to financial statements, or when unable to obtain sufficient audit evidence but potential effects are material but not pervasive; (b) Adverse Opinion is expressed when misstatements are both material and pervasive; (c) Disclaimer of Opinion is expressed when auditor is unable to obtain sufficient appropriate audit evidence and concludes that possible effects of undetected misstatements could be both material and pervasive."
    },
    {
        "id": "doc-indas-115",
        "statute": "Indian Accounting Standards (Ind AS)",
        "section": "Ind AS 115",
        "title": "Revenue from Contracts with Customers — 5-Step Model",
        "category": "ACCOUNTING_STANDARDS",
        "effective_date": "2018-04-01",
        "official_source": "MCA Ind AS Rules / ICAI Accounting Standards Board",
        "text": "Ind AS 115 establishes a comprehensive framework for determining whether, how much, and when revenue is recognized using a 5-step model: Step 1: Identify the contract(s) with a customer (enforceable rights, payment terms, commercial substance, collectability). Step 2: Identify the performance obligations in the contract (distinct goods or services). Step 3: Determine the transaction price (fixed, variable consideration, financing component, non-cash consideration). Step 4: Allocate the transaction price to performance obligations based on relative standalone selling prices (SSP). Step 5: Recognize revenue when (or as) the entity satisfies a performance obligation (over time vs. at a point in time based on transfer of control)."
    },
    {
        "id": "doc-indas-116",
        "statute": "Indian Accounting Standards (Ind AS)",
        "section": "Ind AS 116",
        "title": "Leases — Right-of-Use (ROU) Asset and Lease Liability Accounting",
        "category": "ACCOUNTING_STANDARDS",
        "effective_date": "2019-04-01",
        "official_source": "MCA Ind AS Rules / ICAI Accounting Standards Board",
        "text": "Ind AS 116 introduces a single lessee accounting model requiring lessees to recognize assets and liabilities for all leases with a term exceeding 12 months, unless the underlying asset is of low value. At lease commencement, a lessee measures the lease liability at the present value of lease payments discounted using the interest rate implicit in the lease (or lessee's incremental borrowing rate). Simultaneously, the lessee recognizes a Right-of-Use (ROU) asset comprising: initial measurement of lease liability, plus lease payments made before or at commencement, plus initial direct costs, plus restoration cost estimates, minus lease incentives received. In the P&L, straight-line operating lease rent is replaced by depreciation of ROU asset and finance cost (interest) on lease liability."
    },
    {
        "id": "doc-indas-109",
        "statute": "Indian Accounting Standards (Ind AS)",
        "section": "Ind AS 109",
        "title": "Financial Instruments — Expected Credit Loss (ECL) Model",
        "category": "ACCOUNTING_STANDARDS",
        "effective_date": "2018-04-01",
        "official_source": "MCA Ind AS Rules / ICAI Accounting Standards Board",
        "text": "Ind AS 109 establishes principles for recognizing and measuring financial assets, financial liabilities, and contracts to buy or sell non-financial items. Classification is based on business model and contractual cash flow characteristics (SPPI test): Amortised Cost, FVOCI (debt/equity), or FVTPL. Impairment uses a forward-looking Expected Credit Loss (ECL) model: Stage 1 (Performing): 12-month ECL recognized since initial recognition without significant increase in credit risk; Stage 2 (Underperforming): Lifetime ECL recognized when there is significant increase in credit risk (SICR) since origination; Stage 3 (Non-performing/Credit Impaired): Lifetime ECL with interest revenue recognized on net carrying amount."
    },
    {
        "id": "doc-itact-44ab",
        "statute": "Income Tax Act, 1961",
        "section": "Section 44AB",
        "title": "Mandatory Tax Audit Thresholds and Form 3CD Filing",
        "category": "DIRECT_TAX",
        "effective_date": "2023-04-01",
        "official_source": "Central Board of Direct Taxes (CBDT)",
        "text": "Every person carrying on business shall get his accounts audited if total sales, turnover, or gross receipts exceed Rs. 1 crore in any previous year. Proviso for non-cash transactions: The threshold is increased to Rs. 10 crore provided aggregate of all amounts received in cash during the year does not exceed 5% of total turnover, and aggregate cash payments do not exceed 5% of total payments. For professionals, the tax audit limit is Rs. 50 lakh (or Rs. 75 lakh under Section 44ADA non-cash proviso). Due date for filing Tax Audit Report (Form 3CA/3CB and Form 3CD) is 30th September of the assessment year (one month prior to income tax return due date for audited entities)."
    },
    {
        "id": "doc-itact-92c",
        "statute": "Income Tax Act, 1961",
        "section": "Section 92C",
        "title": "Computation of Arm's Length Price in International Transactions",
        "category": "TRANSFER_PRICING",
        "effective_date": "2014-04-01",
        "official_source": "Central Board of Direct Taxes (CBDT)",
        "text": "Section 92C prescribes methods for determining the Arm's Length Price (ALP) for international transactions and specified domestic transactions: (a) Comparable Uncontrolled Price (CUP) method; (b) Resale Price Method (RPM); (c) Cost Plus Method (CPM); (d) Profit Split Method (PSM); (e) Transactional Net Margin Method (TNMM); (f) Any other method prescribed by the Board. If more than one price is determined by the most appropriate method, the arm's length price is computed using the 35th to 65th percentile dataset range, provided at least six comparables exist. Otherwise, the arithmetic mean is adopted with a statutory tolerance range (+/- 1% for wholesale traders, +/- 3% for other entities)."
    },
    {
        "id": "doc-itact-115jb",
        "statute": "Income Tax Act, 1961",
        "section": "Section 115JB",
        "title": "Minimum Alternate Tax (MAT) on Book Profits & Ind AS Adjustments",
        "category": "DIRECT_TAX",
        "effective_date": "2021-04-01",
        "official_source": "Central Board of Direct Taxes (CBDT)",
        "text": "Section 115JB mandates that if tax payable on total income computed under normal provisions is less than 15% of Book Profit, such book profit is deemed total income and tax payable is 15% plus surcharge and cess. Transition to Ind AS: Book profit is adjusted by transition amounts recorded in Other Equity / OCI on convergence date. Retained earnings adjustments (excluding capital reserve and securities premium) are amortized in equal installments of one-fifth over five consecutive financial years starting from convergence year. Fair value gains/losses on equity instruments through OCI are included in book profit at time of derecognition."
    },
    {
        "id": "doc-cgst-16",
        "statute": "Central Goods and Services Tax Act, 2017",
        "section": "Section 16 & 17",
        "title": "Eligibility and Conditions for Input Tax Credit (ITC) & Apportionment",
        "category": "INDIRECT_TAX_GST",
        "effective_date": "2017-07-01",
        "official_source": "Central Board of Indirect Taxes and Customs (CBIC)",
        "text": "Section 16(2) of CGST Act lays down mandatory conditions for claiming ITC: (a) possession of tax invoice or debit note; (aa) details of invoice communicated in GSTR-2B; (b) receipt of goods or services; (c) tax charged actually paid to Government; (d) filing of return under Section 39 (GSTR-3B). Proviso: Recipient must pay supplier the amount towards value of supply along with tax within 180 days from invoice date; otherwise, ITC availed is added to output tax liability along with interest. Section 17(5) lists blocked credits including motor vehicles for passenger transport (with exceptions), food and beverages, outdoor catering, health services, and club memberships."
    }
]

benchmark_queries = [
    {
        "query_id": "q-01",
        "query": "What is the mandatory rotation period for an audit firm under the Companies Act 2013?",
        "expected_doc_ids": ["doc-coact-139"],
        "expected_citations": ["Section 139", "Companies Act, 2013"],
        "difficulty": "DIRECT_FACTUAL"
    },
    {
        "query_id": "q-02",
        "query": "What form and government approval is required to remove an auditor before term expiry?",
        "expected_doc_ids": ["doc-coact-140"],
        "expected_citations": ["Section 140", "Form ADT-2", "Regional Director"],
        "difficulty": "PROCEDURAL_COMPLIANCE"
    },
    {
        "query_id": "q-03",
        "query": "Can an audit firm accept appointment if a partner's relative holds Rs 50,000 shares in the company?",
        "expected_doc_ids": ["doc-coact-141"],
        "expected_citations": ["Section 141", "1 lakh", "disqualification"],
        "difficulty": "ANALYTICAL_THRESHOLD"
    },
    {
        "query_id": "q-04",
        "query": "When is an auditor required to report fraud directly to the Central Government under Section 143(12)?",
        "expected_doc_ids": ["doc-coact-143"],
        "expected_citations": ["Section 143(12)", "Rule 13", "Form ADT-4"],
        "difficulty": "STATUTORY_THRESHOLD"
    },
    {
        "query_id": "q-05",
        "query": "Can a statutory audit firm simultaneously provide internal audit or investment advisory to the same client?",
        "expected_doc_ids": ["doc-coact-144"],
        "expected_citations": ["Section 144", "prohibited", "internal audit"],
        "difficulty": "INDEPENDENCE_PROHIBITION"
    },
    {
        "query_id": "q-06",
        "query": "What is the reporting requirement under CARO 2020 for working capital limits exceeding 5 crores?",
        "expected_doc_ids": ["doc-caro-2020"],
        "expected_citations": ["CARO 2020", "Clause 3(ii)"],
        "difficulty": "AUDIT_REPORTING"
    },
    {
        "query_id": "q-07",
        "query": "What are the auditor's responsibilities regarding management override of controls under SA 240?",
        "expected_doc_ids": ["doc-sa-240"],
        "expected_citations": ["SA 240", "override", "journal entries"],
        "difficulty": "STANDARDS_TECHNICAL"
    },
    {
        "query_id": "q-08",
        "query": "When must an auditor issue an Adverse Opinion versus a Disclaimer of Opinion under SA 705?",
        "expected_doc_ids": ["doc-sa-705"],
        "expected_citations": ["SA 705", "Adverse Opinion", "Disclaimer of Opinion", "pervasive"],
        "difficulty": "AUDIT_OPINION"
    },
    {
        "query_id": "q-09",
        "query": "What are the 5 steps for revenue recognition under Ind AS 115?",
        "expected_doc_ids": ["doc-indas-115"],
        "expected_citations": ["Ind AS 115", "5-step model"],
        "difficulty": "ACCOUNTING_FRAMEWORK"
    },
    {
        "query_id": "q-10",
        "query": "How does a lessee account for operating leases under Ind AS 116?",
        "expected_doc_ids": ["doc-indas-116"],
        "expected_citations": ["Ind AS 116", "Right-of-Use", "Lease Liability"],
        "difficulty": "ACCOUNTING_TREATMENT"
    },
    {
        "query_id": "q-11",
        "query": "Explain the 3 stages of Expected Credit Loss (ECL) impairment under Ind AS 109.",
        "expected_doc_ids": ["doc-indas-109"],
        "expected_citations": ["Ind AS 109", "Expected Credit Loss", "Stage 1", "Stage 2"],
        "difficulty": "FINANCIAL_INSTRUMENTS"
    },
    {
        "query_id": "q-12",
        "query": "What is the turnover threshold for tax audit under Section 44AB when cash receipts are under 5%?",
        "expected_doc_ids": ["doc-itact-44ab"],
        "expected_citations": ["Section 44AB", "Income Tax Act, 1961"],
        "difficulty": "TAX_THRESHOLD"
    },
    {
        "query_id": "q-13",
        "query": "What transfer pricing methods are prescribed under Section 92C of Income Tax Act?",
        "expected_doc_ids": ["doc-itact-92c"],
        "expected_citations": ["Section 92C", "CUP", "TNMM", "RPM", "CPM"],
        "difficulty": "TRANSFER_PRICING"
    },
    {
        "query_id": "q-14",
        "query": "How are Ind AS transitional adjustments in other equity taxed under Section 115JB Book Profit?",
        "expected_doc_ids": ["doc-itact-115jb"],
        "expected_citations": ["Section 115JB", "one-fifth", "Book Profit"],
        "difficulty": "CORPORATE_TAX_MAT"
    },
    {
        "query_id": "q-15",
        "query": "What is the consequence if a recipient fails to pay the supplier within 180 days under GST Section 16?",
        "expected_doc_ids": ["doc-cgst-16"],
        "expected_citations": ["Section 16", "180 days", "output tax liability"],
        "difficulty": "INDIRECT_TAX_ITC"
    },
    {
        "query_id": "q-16",
        "query": "What overall objectives and professional skepticism standards are set for auditors under SA 200?",
        "expected_doc_ids": ["doc-sa-200"],
        "expected_citations": ["SA 200", "reasonable assurance", "professional skepticism"],
        "difficulty": "CORE_ASSURANCE"
    }
]

payload = {
    "corpus_name": "ICAI_Regulatory_Statutory_Corpus_v2",
    "version": "2.0.0",
    "jurisdiction": "India",
    "document_count": len(documents),
    "query_count": len(benchmark_queries),
    "documents": documents,
    "benchmark_queries": benchmark_queries
}

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2)

h = hashlib.sha256()
with open(OUTPUT_PATH, "rb") as f:
    h.update(f.read())

print(f"✅ Generated {len(documents)} statutory chapters & {len(benchmark_queries)} benchmark queries.")
print(f"Output: {OUTPUT_PATH.name} ({OUTPUT_PATH.stat().st_size} bytes)")
print(f"SHA-256: {h.hexdigest()}")
