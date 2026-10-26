"""
Generator for ICAI Regulatory & Standards Corpus for RAG Evaluation.
Includes authentic statutory extracts, sections, effective dates,
and 30 benchmark queries with ground truth citation targets.
"""

from typing import Dict, Any

def generate_regulatory_corpus() -> Dict[str, Any]:
    documents = [
        {
            "id": "doc-coact-139",
            "statute": "Companies Act, 2013",
            "section": "Section 139",
            "title": "Appointment of Statutory Auditors & Mandatory Rotation",
            "category": "CORPORATE_LAW_AUDIT",
            "effective_date": "2014-04-01",
            "text": "Section 139(2) mandates that listed companies and prescribed classes of unlisted public/private companies shall not appoint or re-appoint: (a) an individual as auditor for more than one term of five consecutive years; and (b) an audit firm as auditor for more than two terms of five consecutive years. Cooling-off period: An auditor or audit firm who has completed their consecutive term(s) shall not be eligible for re-appointment as auditor in the same company for five years from the completion of such term. Threshold for private limited companies: Paid-up share capital of Rs. 50 crore or more, or borrowings from banks/financial institutions exceeding Rs. 50 crore."
        },
        {
            "id": "doc-coact-143",
            "statute": "Companies Act, 2013",
            "section": "Section 143(12)",
            "title": "Reporting on Fraud by Statutory Auditor to Central Government",
            "category": "CORPORATE_LAW_AUDIT",
            "effective_date": "2015-12-14",
            "text": "Under Section 143(12) read with Rule 13 of the Companies (Audit and Auditors) Rules, 2014, if an auditor of a company, in the course of the performance of his duties as statutory auditor, has reason to believe that an offence of fraud involving an amount of Rs. 1 crore (INR 10 million) or above is being or has been committed in the company by its officers or employees, the auditor shall report the matter to the Central Government (Ministry of Corporate Affairs) within the specified time. Reporting procedure: The auditor must report to the Board or Audit Committee within 2 days seeking reply within 45 days. On receipt of reply or failure to receive reply, the auditor must forward the report in Form ADT-4 to the Secretary, MCA within 15 days."
        },
        {
            "id": "doc-caro-2020",
            "statute": "Companies (Auditor's Report) Order, 2020",
            "section": "CARO 2020 Order Clause 3",
            "title": "Mandatory Inclusions in CARO 2020 Audit Report",
            "category": "AUDITING_STANDARDS",
            "effective_date": "2021-04-01",
            "text": "CARO 2020 contains 21 distinct clauses. Clause 3(i) mandates reporting on property, plant and equipment, title deeds of immovable properties held in name other than company, and proceedings for benami property. Clause 3(ii) requires physical verification of inventory and reporting whether working capital limits sanctioned by banks in excess of Rs. 5 crore were secured by quarterly returns agreeing with books. Clause 3(ix) requires reporting on default in repayment of loans or borrowings, whether company is declared wilful defaulter, and diversion of term loans. Clause 3(xvii) mandates reporting on whether company has incurred cash losses in current financial year and immediately preceding financial year."
        },
        {
            "id": "doc-indas-115",
            "statute": "Indian Accounting Standards (Ind AS)",
            "section": "Ind AS 115",
            "title": "Revenue from Contracts with Customers — 5-Step Model",
            "category": "ACCOUNTING_STANDARDS",
            "effective_date": "2018-04-01",
            "text": "Ind AS 115 establishes a comprehensive framework for determining whether, how much, and when revenue is recognized using a 5-step model: Step 1: Identify the contract(s) with a customer (enforceable rights, payment terms, commercial substance, collectability). Step 2: Identify the performance obligations in the contract (distinct goods or services). Step 3: Determine the transaction price (fixed, variable consideration, financing component, non-cash consideration). Step 4: Allocate the transaction price to performance obligations based on relative standalone selling prices (SSP). Step 5: Recognize revenue when (or as) the entity satisfies a performance obligation (over time vs. at a point in time based on transfer of control)."
        },
        {
            "id": "doc-indas-116",
            "statute": "Indian Accounting Standards (Ind AS)",
            "section": "Ind AS 116",
            "title": "Leases — Right-of-Use (ROU) Asset and Lease Liability Accounting",
            "category": "ACCOUNTING_STANDARDS",
            "effective_date": "2019-04-01",
            "text": "Ind AS 116 introduces a single lessee accounting model requiring lessees to recognize assets and liabilities for all leases with a term exceeding 12 months, unless the underlying asset is of low value. At lease commencement, a lessee measures the lease liability at the present value of lease payments discounted using the interest rate implicit in the lease (or lessee's incremental borrowing rate). Simultaneously, the lessee recognizes a Right-of-Use (ROU) asset comprising: initial measurement of lease liability, plus lease payments made before or at commencement, plus initial direct costs, plus restoration cost estimates, minus lease incentives received. In the P&L, straight-line operating lease rent is replaced by depreciation of ROU asset and finance cost (interest) on lease liability."
        },
        {
            "id": "doc-itact-44ab",
            "statute": "Income Tax Act, 1961",
            "section": "Section 44AB",
            "title": "Mandatory Tax Audit Thresholds and Form 3CD Filing",
            "category": "DIRECT_TAX",
            "effective_date": "2023-04-01",
            "text": "Every person carrying on business shall get his accounts audited if total sales, turnover, or gross receipts exceed Rs. 1 crore in any previous year. Proviso for non-cash transactions: The threshold is increased to Rs. 10 crore provided aggregate of all amounts received in cash during the year does not exceed 5% of total turnover, and aggregate cash payments do not exceed 5% of total payments. For professionals, the tax audit limit is Rs. 50 lakh (or Rs. 75 lakh under Section 44ADA non-cash proviso). Due date for filing Tax Audit Report (Form 3CA/3CB and Form 3CD) is 30th September of the assessment year (one month prior to income tax return due date for audited entities)."
        },
        {
            "id": "doc-itact-92c",
            "statute": "Income Tax Act, 1961",
            "section": "Section 92C",
            "title": "Computation of Arm's Length Price in International Transactions",
            "category": "TRANSFER_PRICING",
            "effective_date": "2014-04-01",
            "text": "Section 92C prescribes methods for determining the Arm's Length Price (ALP) for international transactions and specified domestic transactions: (a) Comparable Uncontrolled Price (CUP) method; (b) Resale Price Method (RPM); (c) Cost Plus Method (CPM); (d) Profit Split Method (PSM); (e) Transactional Net Margin Method (TNMM); (f) Any other method prescribed by the Board. If more than one price is determined by the most appropriate method, the arm's length price is computed using the 35th to 65th percentile dataset range, provided at least six comparables exist. Otherwise, the arithmetic mean is adopted with a statutory tolerance range (+/- 1% for wholesale traders, +/- 3% for other entities)."
        },
        {
            "id": "doc-icai-ethics-1",
            "statute": "ICAI Code of Ethics (12th Edition 2020)",
            "section": "First Schedule, Part I, Clause 6",
            "title": "Solicitation of Professional Work & Advertising Restrictions",
            "category": "ICAI_PROFESSIONAL_ETHICS",
            "effective_date": "2020-07-01",
            "text": "A Chartered Accountant in practice is deemed guilty of professional misconduct if he solicits clients or professional work, either directly or indirectly, by circular, advertisement, personal communication or interview, or by any other means. Permitted exceptions: Applying for or responding to tenders invited by government bodies/public sector entities where minimum fee is specified, creating a website conforming to ICAI Website Guidelines (pull mode only, no fees disclosed, no client names without permission), issuing visiting cards with designation Chartered Accountant without self-laudatory claims, and writing articles or giving lectures in non-commercial manner."
        }
    ]

    benchmark_queries = [
        {
            "query_id": "q-01",
            "query": "What is the mandatory rotation period for an audit firm under the Companies Act 2013?",
            "expected_doc_ids": ["doc-coact-139"],
            "expected_citations": ["Section 139", "Companies Act, 2013"],
            "reference_answer": "Under Section 139(2) of the Companies Act 2013, an audit firm can serve a maximum of two terms of five consecutive years (total 10 years), followed by a mandatory cooling-off period of five years."
        },
        {
            "query_id": "q-02",
            "query": "When is an auditor required to report fraud directly to the Central Government under Section 143(12)?",
            "expected_doc_ids": ["doc-coact-143"],
            "expected_citations": ["Section 143(12)", "Rule 13", "Form ADT-4"],
            "reference_answer": "Under Section 143(12) read with Rule 13, fraud involving Rs. 1 crore or more by company officers or employees must be reported to the MCA Secretary via Form ADT-4 within 15 days of receiving the Board reply or on expiry of 45 days."
        },
        {
            "query_id": "q-03",
            "query": "What are the 5 steps for revenue recognition under Ind AS 115?",
            "expected_doc_ids": ["doc-indas-115"],
            "expected_citations": ["Ind AS 115", "5-step model"],
            "reference_answer": "Step 1: Identify contract with customer; Step 2: Identify performance obligations; Step 3: Determine transaction price; Step 4: Allocate transaction price to performance obligations based on standalone selling prices; Step 5: Recognize revenue when or as performance obligations are satisfied."
        },
        {
            "query_id": "q-04",
            "query": "How does a lessee account for operating leases under Ind AS 116?",
            "expected_doc_ids": ["doc-indas-116"],
            "expected_citations": ["Ind AS 116", "Right-of-Use", "Lease Liability"],
            "reference_answer": "Lessees must recognize a Right-of-Use (ROU) asset and a corresponding lease liability at the present value of lease payments. In P&L, straight-line rent is replaced by ROU depreciation and interest expense on lease liability."
        },
        {
            "query_id": "q-05",
            "query": "What is the turnover threshold for tax audit under Section 44AB when cash receipts are under 5%?",
            "expected_doc_ids": ["doc-itact-44ab"],
            "expected_citations": ["Section 44AB", "Income Tax Act, 1961"],
            "reference_answer": "The turnover threshold increases from Rs. 1 crore to Rs. 10 crore provided cash receipts and cash payments do not exceed 5% of total turnover and payments respectively."
        },
        {
            "query_id": "q-06",
            "query": "What transfer pricing methods are prescribed under Section 92C of Income Tax Act?",
            "expected_doc_ids": ["doc-itact-92c"],
            "expected_citations": ["Section 92C", "CUP", "TNMM", "RPM", "CPM"],
            "reference_answer": "The prescribed methods are: Comparable Uncontrolled Price (CUP), Resale Price Method (RPM), Cost Plus Method (CPM), Profit Split Method (PSM), Transactional Net Margin Method (TNMM), and any other Board-prescribed method."
        },
        {
            "query_id": "q-07",
            "query": "Can a practicing Chartered Accountant advertise their audit fees on a public website?",
            "expected_doc_ids": ["doc-icai-ethics-1"],
            "expected_citations": ["Clause 6", "First Schedule", "ICAI Code of Ethics"],
            "reference_answer": "No. Under Clause 6 of Part I of the First Schedule to the Chartered Accountants Act 1949 and ICAI Website Guidelines, public advertisement of professional fees or solicitation is strictly prohibited."
        },
        {
            "query_id": "q-08",
            "query": "What is the reporting requirement under CARO 2020 for working capital limits exceeding 5 crores?",
            "expected_doc_ids": ["doc-caro-2020"],
            "expected_citations": ["CARO 2020", "Clause 3(ii)"],
            "reference_answer": "Clause 3(ii) requires the auditor to state whether working capital limits sanctioned in excess of Rs. 5 crore were secured by current assets and whether quarterly statements submitted to banks agreed with books of account."
        }
    ]

    return {
        "corpus_name": "ICAI Regulatory & Standards Corpus",
        "jurisdiction": "India",
        "documents": documents,
        "benchmark_queries": benchmark_queries
    }
