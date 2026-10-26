"""
Generator for Technical Interview Rubrics & Domain Evaluation Matrix.
"""

from typing import List, Dict, Any

def generate_interview_rubrics() -> List[Dict[str, Any]]:
    rubrics = [
        {
            "id": "q-audit-01",
            "topic": "Statutory Audit & Assurance",
            "regulatoryReference": "SA 240 / Section 143(12) Companies Act 2013",
            "questionText": "During your statutory audit of a manufacturing client, you discover unrecorded supplier credit notes of Rs. 1.25 Crore that artificially inflate gross margins. How do you assess this, and what are your reporting duties?",
            "difficulty": "ADVANCED",
            "timeLimitSeconds": 180,
            "idealAnswerKeyPoints": [
                "Assess whether the unrecorded credit note is an intentional misstatement amounting to fraud under SA 240.",
                "Verify materiality threshold and evaluate impact on gross margin and EBITDA.",
                "Trigger Section 143(12) reporting requirements as the amount exceeds the statutory threshold of Rs. 1 Crore.",
                "Report matter to Board of Directors or Audit Committee within 2 days seeking reply within 45 days.",
                "Forward Form ADT-4 to Central Government (Ministry of Corporate Affairs) within 15 days of reply or deadline.",
                "Evaluate modification of audit opinion (Qualified or Adverse under SA 705) if adjustments are refused by management."
            ],
            "mandatoryConcepts": ["SA 240", "Section 143(12)", "Form ADT-4", "Audit Committee", "SA 705"],
            "rubricWeights": {
                "technicalCorrectness": 0.40,
                "completeness": 0.30,
                "reasoning": 0.20,
                "clarity": 0.10
            }
        },
        {
            "id": "q-indas-01",
            "topic": "Ind AS 115 Revenue Accounting",
            "regulatoryReference": "Ind AS 115 Paragraph 22-30",
            "questionText": "An IT services company signs a 3-year contract to license software and provide continuous monthly cloud hosting and quarterly customized updates. Explain how you identify performance obligations.",
            "difficulty": "INTERMEDIATE",
            "timeLimitSeconds": 150,
            "idealAnswerKeyPoints": [
                "Apply Step 2 of Ind AS 115: Identify whether promised goods or services are distinct.",
                "Evaluate criteria 1: Capable of being distinct (customer can benefit from good/service on its own).",
                "Evaluate criteria 2: Distinct within the context of the contract (not highly interrelated or transformative).",
                "Software license is distinct if customer can run it without customization, recognized point-in-time.",
                "If customized updates significantly modify software functionality, license and updates combine into a single bundled obligation.",
                "Cloud hosting is recognized over time based on straight-line output measure."
            ],
            "mandatoryConcepts": ["Performance Obligation", "Distinct", "Step 2", "Point-in-time", "Over-time"],
            "rubricWeights": {
                "technicalCorrectness": 0.45,
                "completeness": 0.25,
                "reasoning": 0.20,
                "clarity": 0.10
            }
        },
        {
            "id": "q-tax-01",
            "topic": "Direct Tax & Corporate Litigation",
            "regulatoryReference": "Section 115JB / Section 148 Income Tax Act",
            "questionText": "Explain the interaction between Book Profits under Section 115JB (Minimum Alternate Tax) and Ind AS transition adjustments (OCI items).",
            "difficulty": "ADVANCED",
            "timeLimitSeconds": 180,
            "idealAnswerKeyPoints": [
                "Section 115JB(2C) requires MAT adjustments for companies adopting Ind AS.",
                "Transition adjustments recorded in other equity or OCI are categorized into recurring vs non-recurring items.",
                "Capital reserve and securities premium transition adjustments are not included in book profit.",
                "Other comprehensive income adjustments are recognized over a 5-year period in equal installments (one-fifth each year).",
                "Items that will not be reclassified to profit or loss (e.g. remeasurement of defined benefit plans) must be included upon realization."
            ],
            "mandatoryConcepts": ["Section 115JB", "Book Profit", "OCI", "One-fifth installment", "Transition Date"],
            "rubricWeights": {
                "technicalCorrectness": 0.45,
                "completeness": 0.25,
                "reasoning": 0.20,
                "clarity": 0.10
            }
        },
        {
            "id": "q-fdd-01",
            "topic": "M&A Financial Due Diligence",
            "regulatoryReference": "ICAI Guidance Note on Financial Due Diligence",
            "questionText": "In a buy-side financial due diligence engagement for a technology target with reported EBITDA of Rs. 40 Crore, what typical normalized earnings adjustments would you test?",
            "difficulty": "ADVANCED",
            "timeLimitSeconds": 180,
            "idealAnswerKeyPoints": [
                "Owner / Director excessive or sub-market remuneration adjustment to benchmark market compensation.",
                "Non-recurring and exceptional items (litigation settlements, restructuring costs, gain/loss on asset sales).",
                "R&D software capitalization vs operating expense treatment to reconcile cash burn.",
                "Related-party transactions priced non-arm's length (rent, management charges, inter-company shared costs).",
                "Pro-forma run-rate effect of mid-year acquisitions, contract losses, or major price hikes.",
                "Impact of Ind AS 116 lease rent reclassification back to EBITDA for cash flow comparability."
            ],
            "mandatoryConcepts": ["Normalized EBITDA", "Quality of Earnings", "Non-recurring", "Owner Remuneration", "Run-rate"],
            "rubricWeights": {
                "technicalCorrectness": 0.40,
                "completeness": 0.30,
                "reasoning": 0.20,
                "clarity": 0.10
            }
        },
        {
            "id": "q-fpa-01",
            "topic": "FP&A & Variance Modeling",
            "regulatoryReference": "CFO Strategic Planning Framework",
            "questionText": "Your company budgeted a 20% growth in Gross Margin but actual gross margin contracted by 400 bps despite a 15% revenue beat. How do you structure the bridge variance analysis?",
            "difficulty": "INTERMEDIATE",
            "timeLimitSeconds": 150,
            "idealAnswerKeyPoints": [
                "Decompose variance into Price Variance, Volume Variance, and Cost Variance (COGS inflation).",
                "Analyze Product Mix Variance (adverse shift toward lower-margin enterprise SKUs despite higher volume).",
                "Assess input cost inflation or freight / supply chain surcharges absorbed without customer pass-through.",
                "Evaluate sales discount and promotional rebate leakage impacting net realized ASP.",
                "Build bridge chart: Budgeted GM -> Price Impact -> Mix Impact -> Cost/Inflation Impact -> Actual GM."
            ],
            "mandatoryConcepts": ["Price Variance", "Mix Variance", "Volume Variance", "Cost Inflation", "Bridge Analysis"],
            "rubricWeights": {
                "technicalCorrectness": 0.35,
                "completeness": 0.35,
                "reasoning": 0.20,
                "clarity": 0.10
            }
        }
    ]
    return rubrics
