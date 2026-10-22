import { CAPathway, QuestionBankItem, QuestionDifficulty } from '@ca-career-os/shared';

/**
 * Standard Chartered Accountancy technical interview question bank
 * covering Audit, Ind AS, Tax, Corporate Finance, Valuation, and Practice.
 */
export const CA_QUESTION_BANK: QuestionBankItem[] = [
  // 1. Audit & Assurance / Ind AS
  {
    id: 'q-audit-01',
    pathway: CAPathway.AUDIT,
    domain: 'Statutory Audit & Assurance',
    topic: 'Ind AS 115 — Revenue from Contracts with Customers',
    subtopic: 'Five-Step Model & Variable Consideration',
    difficulty: 'INTERMEDIATE',
    question:
      'Explain the 5-step model under Ind AS 115. How do you assess whether performance obligations are satisfied over time versus at a point in time, and what audit evidence do you evaluate for construction or long-term service contracts?',
    idealAnswerKeyPoints: [
      '5 Steps: 1. Identify contract, 2. Identify distinct performance obligations, 3. Determine transaction price, 4. Allocate transaction price, 5. Recognize revenue when/as obligations are satisfied.',
      'Over time criteria: Customer simultaneously receives and consumes benefits, entity creates/enhances an asset customer controls, or entity has no alternative use and an enforceable right to payment for performance completed to date.',
      'Audit evidence: Input vs output methods (cost-to-cost percentage of completion), total estimated contract costs, milestone sign-offs, customer inspection certificates, and contract variations/claims testing.',
    ],
    scoringRubric: {
      technicalCorrectness: 'Must accurately cite the 5 steps and the specific 3 alternative criteria for over-time recognition.',
      completeness: 'Must cover contract identification, pricing allocation, input/output method, and provision for onerous contracts.',
      reasoning: 'Clear logical distinction between customer control of work-in-progress and vendor performance obligation.',
      practicalApplication: 'References substantive audit tests: cost cut-off, engineer certification, and contract billing terms.',
    },
    regulatoryReference: 'Ind AS 115 (MCA Notification) & SA 500 (Audit Evidence)',
  },
  {
    id: 'q-audit-02',
    pathway: CAPathway.AUDIT,
    domain: 'Statutory Audit & Assurance',
    topic: 'CARO 2020 & Internal Financial Controls',
    subtopic: 'Clause (i) Property, Plant & Equipment & Clause (ii) Inventory',
    difficulty: 'INTERMEDIATE',
    question:
      'What are the key reporting requirements under CARO 2020 Clause (i) regarding Property, Plant and Equipment and Benami property, and Clause (ii) regarding working capital limits and physical verification of inventory?',
    idealAnswerKeyPoints: [
      'Clause (i)(a)-(c): Proper records showing full particulars, quantitative details, situation; physical verification by management at reasonable intervals; title deeds of immovable property held in company name.',
      'Clause (i)(e): Proceedings initiated or pending against the company for holding any Benami property under the Benami Transactions Act.',
      'Clause (ii)(a): Physical verification of inventory by management at reasonable intervals, and whether discrepancies of 10% or more in aggregate for each class were noticed and properly dealt with.',
      'Clause (ii)(b): Working capital limits sanctioned in excess of ₹5 crore on security of current assets; quarterly returns/statements filed with banks agree with books.',
    ],
    scoringRubric: {
      technicalCorrectness: 'Cites 10% inventory discrepancy threshold and ₹5 Cr working capital bank quarterly statements reconciliation.',
      completeness: 'Addresses PPE title deeds, Benami property disclosures, and inventory physical verification.',
      reasoning: 'Connects discrepancies with internal control deficiencies and management representations.',
      practicalApplication: 'Explains stock count attendance procedures and bank stock statement reconciliations.',
    },
    regulatoryReference: 'Companies (Auditor Report) Order, 2020 (CARO 2020)',
  },
  {
    id: 'q-audit-03',
    pathway: CAPathway.AUDIT,
    domain: 'Statutory Audit & Assurance',
    topic: 'SA 315 & SA 330 — Risk Assessment & Internal Controls',
    subtopic: 'Testing of Controls and Substantive Procedures',
    difficulty: 'ADVANCED',
    question:
      'Under SA 315 and SA 330, how do you determine when to test the operating effectiveness of controls versus relying on substantive testing alone? When are substantive procedures mandatory?',
    idealAnswerKeyPoints: [
      'Testing controls is required when: 1. The auditor assessment of risks of material misstatement includes an expectation that controls are operating effectively, or 2. Substantive procedures alone cannot provide sufficient appropriate audit evidence (e.g. automated IT environments).',
      'Irrespective of assessed risk of material misstatement, the auditor must design and perform substantive procedures for each material class of transactions, account balance, and disclosure (SA 330.18).',
      'For significant risks under SA 315, the auditor cannot rely on operating effectiveness of controls from prior periods and must test in the current period.',
    ],
    scoringRubric: {
      technicalCorrectness: 'Distinguishes between design of controls (walkthrough) and operating effectiveness (sampling/reperformance).',
      completeness: 'Explicitly states that substantive procedures are mandatory for all material balances regardless of control reliance.',
      reasoning: 'Explains IT general controls (ITGCs) and automated application control dependencies.',
      practicalApplication: 'Gives concrete audit examples: three-way match (PO, GRN, Vendor Invoice) in SAP.',
    },
    regulatoryReference: 'Standards on Auditing (SA 315 & SA 330)',
  },

  // 2. Direct & Indirect Taxation / GST
  {
    id: 'q-tax-01',
    pathway: CAPathway.TAX,
    domain: 'Corporate Direct Taxation',
    topic: 'Transfer Pricing — Section 92E & Form 3CEB',
    subtopic: 'Arm Length Price (ALP) Determination & Associated Enterprises',
    difficulty: 'INTERMEDIATE',
    question:
      'What constitutes an "Associated Enterprise" under Section 92A of the Income Tax Act? Describe the Most Appropriate Method (MAM) selection for manufacturing contract services versus intangible licensing.',
    idealAnswerKeyPoints: [
      'Section 92A: Direct/indirect participation in management, control, or capital (26% voting power, loan >= 51% book value of assets, appointed >50% board, dependency on intellectual property).',
      'Section 92C Methods: Comparable Uncontrolled Price (CUP), Resale Price Method (RPM), Cost Plus Method (CPM), Profit Split Method (PSM), Transactional Net Margin Method (TNMM).',
      'For captive contract manufacturing/IT services: TNMM with operating profit / operating cost (OP/OC) or Cost Plus Method is standard.',
      'For intangible licensing/royalties: CUP or Profit Split Method (PSM) where both parties contribute non-routine intangibles.',
    ],
    scoringRubric: {
      technicalCorrectness: 'Cites 26% voting power threshold and primary Section 92C methods.',
      completeness: 'Compares benchmark analysis for contract services vs intangibles.',
      reasoning: 'Explains why TNMM is preferred for routine services and PSM for unique intellectual property.',
      practicalApplication: 'References Prowess/Capitaline benchmarking and Form 3CEB certification.',
    },
    regulatoryReference: 'Income Tax Act, 1961 — Sections 92A, 92C & Rule 10B',
  },
  {
    id: 'q-tax-02',
    pathway: CAPathway.TAX,
    domain: 'Indirect Taxation & GST',
    topic: 'Input Tax Credit (ITC) — Section 16 & Section 17(5)',
    subtopic: 'Blocked Credits and Reversals',
    difficulty: 'INTERMEDIATE',
    question:
      'What conditions must be satisfied under Section 16 of the CGST Act to claim Input Tax Credit? Outline the blocked credit restrictions under Section 17(5) regarding motor vehicles, food & beverage, and construction.',
    idealAnswerKeyPoints: [
      'Section 16(2) Conditions: Possession of tax invoice/debit note; invoice details reflected in GSTR-2B; tax actually paid to government by supplier; recipient filed valid GSTR-3B return; payment made within 180 days.',
      'Section 17(5) Blocked Credits:',
      'Motor vehicles for transportation of persons having approved seating capacity <= 13 persons, unless used for transportation business or training.',
      'Food & beverages, outdoor catering, beauty treatment, health services, unless used as inward supply for making taxable outward supply.',
      'Goods or services received for construction of immovable property on own account (including work contract services for capital assets).',
    ],
    scoringRubric: {
      technicalCorrectness: 'Correctly cites 180-day vendor payment rule and GSTR-2B matching requirement.',
      completeness: 'Comprehensive breakdown of Section 17(5) exceptions (e.g. motor vehicles used for transport business).',
      reasoning: 'Explains capitalization vs P&L expense distinction in immovable property repairs.',
      practicalApplication: 'Mentions GSTR-9 annual reconciliation and GSTR-9C table 14 audit testing.',
    },
    regulatoryReference: 'CGST Act, 2017 — Sections 16, 17(5) & Rule 37',
  },

  // 3. FP&A & Corporate Finance
  {
    id: 'q-fpa-01',
    pathway: CAPathway.FPA,
    domain: 'FP&A & Corporate Finance',
    topic: 'Three-Statement Financial Modeling & Working Capital Dynamics',
    subtopic: 'Cash Flow from Operations vs EBITDA',
    difficulty: 'INTERMEDIATE',
    question:
      'Walk me through the connection between EBITDA and Cash Flow from Operations (CFO). How does an increase in Days Sales Outstanding (DSO) impact both metrics, and what levers would you recommend to improve free cash flow?',
    idealAnswerKeyPoints: [
      'Bridge: EBITDA - Cash Taxes - Cash Interest +/- Changes in Working Capital = Operating Cash Flow (CFO).',
      'Impact of DSO increase: EBITDA is unaffected (accrual accounting recognizes revenue on billing/delivery). CFO decreases because accounts receivable increases, tying up operating cash.',
      'Working capital levers: Early payment discounts (dynamic discounting), tighter credit limits, factoring/reverse factoring, milestone-based billing, and dispute management automation.',
    ],
    scoringRubric: {
      technicalCorrectness: 'Correctly identifies that EBITDA is an accrual metric unaffected by cash collection timing while CFO drops.',
      completeness: 'Covers non-cash adjustments, working capital changes, and specific collection levers.',
      reasoning: 'Clear articulation of the cash conversion cycle (DIO + DSO - DPO).',
      practicalApplication: 'Gives concrete finance operations advice for improving liquidity.',
    },
    regulatoryReference: 'Corporate Finance & Management Accounting Standards',
  },

  // 4. Investment Banking, M&A & Valuation
  {
    id: 'q-ib-01',
    pathway: CAPathway.IB,
    domain: 'Investment Banking & M&A',
    topic: 'Valuation & Due Diligence',
    subtopic: 'DCF Mechanics, WACC & Quality of Earnings (QoE)',
    difficulty: 'ADVANCED',
    question:
      'In a buy-side financial due diligence (FDD), how do you calculate Normalized EBITDA, and what typical EBITDA adjustments do you look for? How does Normalized Working Capital relate to the target enterprise purchase price?',
    idealAnswerKeyPoints: [
      'Normalized EBITDA = Reported EBITDA +/- Non-recurring items +/- Out-of-period items +/- Run-rate pro forma adjustments +/- Related party transaction adjustments.',
      'Common adjustments: Owner personal expenses, litigation settlements, non-routine severance, gain/loss on asset sales, under-market promoter remuneration, and pro forma impact of new contract wins.',
      'Working capital peg: Target enterprise value assumes normal level of working capital. If actual working capital at closing is higher than peg, purchase price increases (dollar-for-dollar); if lower, price is adjusted downward.',
    ],
    scoringRubric: {
      technicalCorrectness: 'Correctly formulates Normalized EBITDA and the working capital peg purchase price adjustment mechanism.',
      completeness: 'Addresses non-recurring items, run-rate adjustments, and cash/debt-free deal constructs.',
      reasoning: 'Understands why buyers reject unadjusted reported EBITDA in M&A valuation multiples.',
      practicalApplication: 'References Quality of Earnings reports and definitive SPA negotiation points.',
    },
    regulatoryReference: 'ICAI Valuation Standards (IVS 301) & Transaction Advisory Practice',
  },
];
