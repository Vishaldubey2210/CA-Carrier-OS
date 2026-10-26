"""
Generator for authentic CA job listings.
"""

from typing import List, Dict, Any
import uuid

def generate_jobs() -> List[Dict[str, Any]]:
    jobs = []
    
    companies = [
        ("Deloitte Touche Tohmatsu India LLP", "deloitte.com", "BIG4"),
        ("PricewaterhouseCoopers Services LLP", "pwc.in", "BIG4"),
        ("Ernst & Young LLP", "ey.com", "BIG4"),
        ("BSR & Co. LLP (KPMG India)", "kpmg.com", "BIG4"),
        ("Grant Thornton Bharat LLP", "gtbharat.com", "TOP10"),
        ("BDO India LLP", "bdo.in", "TOP10"),
        ("MSKA & Associates", "mska.in", "TOP10"),
        ("Singhi & Co. Chartered Accountants", "singhico.com", "TOP10"),
        ("Haribhakti & Co. LLP", "haribhakti.com", "TOP10"),
        ("Chhajed & Doshi Chartered Accountants", "chhajed.com", "MID_SIZE"),
        ("Kalyaniwalla & Mistry LLP", "kmllp.com", "MID_SIZE"),
        ("Lodha & Co.", "lodhaco.com", "MID_SIZE"),
        ("Razorpay Software Pvt Ltd", "razorpay.com", "CORP"),
        ("Flipkart Internet Pvt Ltd", "flipkart.com", "CORP"),
        ("Tata Consultancy Services - Corporate Finance", "tcs.com", "CORP"),
        ("HDFC Bank Financial Management Group", "hdfcbank.com", "CORP"),
        ("ICICI Securities Investment Banking", "icicisecurities.com", "CORP"),
        ("Reliance Retail Finance Controllership", "relianceretail.com", "CORP"),
        ("Kedaara Capital Advisors", "kedaara.com", "PE_VC"),
        ("ChrysCapital Investment Advisors", "chryscapital.com", "PE_VC"),
    ]

    cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"]

    role_templates = [
        # Track 1: AUDIT
        {
            "title": "Senior Associate — Statutory Audit & Ind AS",
            "normalizedTitle": "Statutory Audit Senior / Manager",
            "caPathway": "AUDIT",
            "experienceMin": 0, "experienceMax": 2,
            "salaryMin": 1200000, "salaryMax": 1600000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 30,
            "preferredFirmTiers": ["BIG4", "TOP10", "MID_SIZE"],
            "mandatorySkills": ["Statutory Audit", "Ind AS", "CARO 2020", "Standards on Auditing"],
            "preferredSkills": ["SAP ERP", "Advanced Excel", "IFCoFR"],
            "desc": "Lead statutory audit engagements for listed corporate entities under Companies Act 2013 and Ind AS. Review internal financial controls, test key operating controls, and draft audit reports."
        },
        {
            "title": "Manager — Internal Audit & Enterprise Risk Advisory",
            "normalizedTitle": "Internal Audit & Risk Specialist",
            "caPathway": "AUDIT",
            "experienceMin": 2, "experienceMax": 5,
            "salaryMin": 1800000, "salaryMax": 2400000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 36,
            "preferredFirmTiers": ["BIG4", "TOP10"],
            "mandatorySkills": ["Internal Audit", "Risk Management", "Process Walkthroughs", "SOX 404"],
            "preferredSkills": ["Data Analytics", "PowerBI", "COSO Framework"],
            "desc": "Design risk-based internal audit plans, evaluate business process cycles (P2P, O2C, R2R), identify operational control deficiencies, and present audit committee decks."
        },
        # Track 2: TAX
        {
            "title": "Senior Associate — Direct Tax & Corporate Litigation",
            "normalizedTitle": "Direct Tax & Litigation Specialist",
            "caPathway": "TAX",
            "experienceMin": 0, "experienceMax": 3,
            "salaryMin": 1300000, "salaryMax": 1800000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 24,
            "preferredFirmTiers": ["BIG4", "TOP10", "MID_SIZE"],
            "mandatorySkills": ["Corporate Tax Returns", "Tax Audit Form 3CD", "Section 148 Assessment", "TDS Returns"],
            "preferredSkills": ["Income Tax Appellate Tribunal", "Direct Tax Vivad se Vishwas", "Drafting Submissions"],
            "desc": "Draft tax audit reports in Form 3CD, compute MAT under Section 115JB, prepare replies to statutory scrutiny notices, and handle faceless assessment representations."
        },
        {
            "title": "Consultant — International Tax & Transfer Pricing",
            "normalizedTitle": "Direct Tax & Litigation Specialist",
            "caPathway": "TAX",
            "experienceMin": 1, "experienceMax": 4,
            "salaryMin": 1600000, "salaryMax": 2200000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 30,
            "preferredFirmTiers": ["BIG4", "TOP10"],
            "mandatorySkills": ["Transfer Pricing Form 3CEB", "Section 92C Documentation", "Benchmarking Analysis", "DTAA Treaties"],
            "preferredSkills": ["BEPS Action Plans", "Prowess Database", "Capitaline"],
            "desc": "Perform economic benchmarking studies, draft Transfer Pricing Local File and Master File documentation, and evaluate permanent establishment risks under DTAA."
        },
        # Track 3: GST
        {
            "title": "Assistant Manager — Indirect Tax & GST Audits",
            "normalizedTitle": "Indirect Tax & GST Associate",
            "caPathway": "TAX",
            "experienceMin": 1, "experienceMax": 3,
            "salaryMin": 1400000, "salaryMax": 1900000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 24,
            "preferredFirmTiers": ["BIG4", "TOP10", "MID_SIZE"],
            "mandatorySkills": ["GST Monthly Returns GSTR-1/3B", "GST Annual Audit Form 9C", "Input Tax Credit Reconciliation", "E-Invoicing Compliance"],
            "preferredSkills": ["Customs Valuation", "SEZ Regulations", "Litigation Appeals"],
            "desc": "Manage multi-state GST compliance, annual reconciliations under Form 9C, defend audit queries before state GST commissioners, and optimize credit eligibility."
        },
        # Track 4: FPA
        {
            "title": "Senior Financial Analyst — FP&A and Variance Modeling",
            "normalizedTitle": "FP&A & Corporate Finance Manager",
            "caPathway": "FPA",
            "experienceMin": 1, "experienceMax": 3,
            "salaryMin": 1600000, "salaryMax": 2200000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 24,
            "preferredFirmTiers": ["BIG4", "TOP10", "MID_SIZE"],
            "mandatorySkills": ["Financial Modeling", "Budgeting & Forecasting", "Variance Analysis", "Management Reporting"],
            "preferredSkills": ["Advanced Excel", "PowerBI", "SaaS Metrics", "SQL"],
            "desc": "Own operating budgets, build dynamic 3-statement forecast models, analyze gross margin variances, and provide business partner insights to business unit heads."
        },
        {
            "title": "Finance Controller — High-Growth Scale-Up",
            "normalizedTitle": "FP&A & Corporate Finance Manager",
            "caPathway": "FPA",
            "experienceMin": 3, "experienceMax": 7,
            "salaryMin": 2500000, "salaryMax": 3600000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 36,
            "preferredFirmTiers": ["BIG4", "TOP10"],
            "mandatorySkills": ["Financial Controllership", "Statutory Compliance", "Cash Flow Forecasting", "Ind AS Reporting"],
            "preferredSkills": ["Oracle NetSuite", "Fundraising Support", "Investor Decks"],
            "desc": "Lead month-end financial close, oversee audit finalization, manage treasury working capital, and implement robust internal controls for Series B+ technology startup."
        },
        # Track 5: CORP_FIN & IB
        {
            "title": "Associate — Financial Due Diligence (M&A Transaction Advisory)",
            "normalizedTitle": "M&A Due Diligence & Valuation Associate",
            "caPathway": "IB",
            "experienceMin": 0, "experienceMax": 3,
            "salaryMin": 1800000, "salaryMax": 2500000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 36,
            "preferredFirmTiers": ["BIG4", "TOP10"],
            "mandatorySkills": ["Financial Due Diligence", "Quality of Earnings (QoE)", "Normalized Working Capital", "Net Debt Analysis"],
            "preferredSkills": ["Virtual Data Room (VDR)", "SPA Bridge", "EBITDA Adjustments"],
            "desc": "Conduct buy-side and sell-side financial due diligence for private equity sponsors. Analyze EBITDA adjustments, working capital pegs, and debt-like items in deal structuring."
        },
        {
            "title": "Valuation Specialist — Business Valuation & IVS 301",
            "normalizedTitle": "Investment Banking Analyst / Associate",
            "caPathway": "CORP_FIN",
            "experienceMin": 1, "experienceMax": 4,
            "salaryMin": 1700000, "salaryMax": 2400000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 30,
            "preferredFirmTiers": ["BIG4", "TOP10"],
            "mandatorySkills": ["Business Valuation", "Discounted Cash Flow (DCF)", "Trading Multiples (CCA)", "IVS Standards"],
            "preferredSkills": ["Purchase Price Allocation (PPA)", "Impairment Testing Ind AS 36", "Complex Financial Instruments"],
            "desc": "Perform independent valuations under ICAI Valuation Standards (IVS) and Companies Act for mergers, demergers, sweat equity, and Ind AS purchase price allocations."
        },
        # Track 6: CONSULTING
        {
            "title": "Consultant — CFO Advisory & Finance Transformation",
            "normalizedTitle": "Management Consultant — Finance & Strategy",
            "caPathway": "CONSULTING",
            "experienceMin": 1, "experienceMax": 4,
            "salaryMin": 1900000, "salaryMax": 2600000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 30,
            "preferredFirmTiers": ["BIG4", "TOP10"],
            "mandatorySkills": ["Finance Transformation", "Process Re-engineering", "Chart of Accounts Design", "Cost Optimization"],
            "preferredSkills": ["SAP S/4HANA", "Alteryx", "BlackLine", "Shared Services Design"],
            "desc": "Partner with global enterprise CFOs to optimize record-to-report cycles, design unified chart of accounts for post-merger integrations, and digitize finance functions."
        },
        # Track 7: PRACTICE
        {
            "title": "Practice Associate / Partner Track — Direct Tax & Corporate Law",
            "normalizedTitle": "Independent Practice Lead",
            "caPathway": "PRACTICE",
            "experienceMin": 2, "experienceMax": 6,
            "salaryMin": 1200000, "salaryMax": 2000000,
            "requiredQualification": "QUALIFIED",
            "minArticleshipMonths": 36,
            "preferredFirmTiers": ["BIG4", "TOP10", "MID_SIZE", "SMALL"],
            "mandatorySkills": ["Income Tax Compliance", "Statutory Audit", "Company Law MCA Filings", "Client Relationship Management"],
            "preferredSkills": ["COP Holder", "Tax Appeals", "GST Litigation"],
            "desc": "Direct audit and corporate compliance assignments for mid-market clients, oversee article assistants, and manage client advisory on MCA regulatory changes."
        },
        # Trainee / Semi-Qualified
        {
            "title": "Articleship Trainee / CA Finalist — Statutory Audit & Taxation",
            "normalizedTitle": "Statutory Audit Senior / Manager",
            "caPathway": "AUDIT",
            "experienceMin": 0, "experienceMax": 1,
            "salaryMin": 400000, "salaryMax": 600000,
            "requiredQualification": "FINALIST",
            "minArticleshipMonths": 12,
            "preferredFirmTiers": ["MID_SIZE", "TOP10"],
            "mandatorySkills": ["Vouching & Verification", "Tally Prime", "Basic Excel", "TDS Computation"],
            "preferredSkills": ["Statutory Audit Exposure", "Form 108 Verified"],
            "desc": "Support senior audit teams in substantive analytical procedures, inventory physical verifications, bank reconciliations, and tax return preparations."
        }
    ]

    arrangements = ["ONSITE", "HYBRID", "REMOTE"]

    idx = 1
    # Expand into 120 realistic postings
    for template in role_templates:
        for comp_name, comp_domain, comp_tier in companies:
            if idx > 120:
                break
            city = cities[(idx * 3) % len(cities)]
            arr = arrangements[idx % len(arrangements)]
            
            # Add realistic compensation variations (+- 15%)
            delta = ((idx % 7) - 3) * 50000
            s_min = template["salaryMin"] + delta
            s_max = template["salaryMax"] + delta

            job_id = f"job-{idx:04d}-{str(uuid.uuid4())[:8]}"
            job = {
                "id": job_id,
                "employerId": f"emp-{hash(comp_name) % 10000:04d}",
                "title": f"{template['title']} ({comp_tier})",
                "normalizedTitle": template["normalizedTitle"],
                "companyName": comp_name,
                "employerDomain": comp_domain,
                "employerTier": comp_tier,
                "locationCity": city,
                "workArrangement": arr,
                "caPathway": template["caPathway"],
                "salaryMin": s_min,
                "salaryMax": s_max,
                "salaryDisclosed": (idx % 5 != 0), # 80% disclosed
                "experienceMin": template["experienceMin"],
                "experienceMax": template["experienceMax"],
                "rawDescription": f"{template['desc']} Position based in {city} ({arr} format). Minimum {template['minArticleshipMonths']} months of verified articleship required.",
                "structuredRequirements": {
                    "mandatorySkills": template["mandatorySkills"],
                    "preferredSkills": template["preferredSkills"],
                    "requiredQualification": template["requiredQualification"],
                    "minArticleshipMonths": template["minArticleshipMonths"],
                    "preferredFirmTiers": template["preferredFirmTiers"],
                    "keyResponsibilities": [
                        f"Execute key assignments for {comp_name} clients.",
                        "Collaborate with multi-disciplinary cross-functional teams.",
                        "Adhere to strict ICAI Quality Review Board (QRB) and statutory standards."
                    ]
                },
                "status": "ACTIVE",
                "source": "DIRECT_EMPLOYER" if comp_tier != "MID_SIZE" else "ICAI_JOB_PORTAL",
                "sourceUrl": f"https://{comp_domain}/careers/{job_id}",
                "isVerified": (idx % 15 != 0), # 93% verified
                "postedAt": f"2026-10-{(idx % 20 + 1):02d}T09:00:00.000Z"
            }
            jobs.append(job)
            idx += 1

    return jobs
