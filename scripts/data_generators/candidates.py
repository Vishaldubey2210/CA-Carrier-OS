"""
Generator for realistic candidate profiles.
"""

from typing import List, Dict, Any
import uuid

def generate_candidates() -> List[Dict[str, Any]]:
    candidates = []

    names = [
        ("Aarav", "Sharma"), ("Priya", "Nair"), ("Rohan", "Mehta"), ("Ananya", "Iyer"),
        ("Vikram", "Deshmukh"), ("Sneha", "Kulkarni"), ("Aditya", "Verma"), ("Pooja", "Patel"),
        ("Kavita", "Reddy"), ("Siddharth", "Bansal"), ("Neha", "Gupta"), ("Manish", "Agarwal"),
        ("Ritika", "Chopra"), ("Arjun", "Menon"), ("Divya", "Srinivasan"), ("Gaurav", "Joshi"),
        ("Meera", "Pillai"), ("Akash", "Bhatia"), ("Tanvi", "Saxena"), ("Kunal", "Singhania"),
        ("Suresh", "Rao"), ("Ishaan", "Malhotra"), ("Swati", "Pandey"), ("Varun", "Chawla"),
        ("Shreya", "Chatterjee"), ("Nikhil", "Goyal"), ("Anjali", "Dubey"), ("Abhishek", "Mishra"),
        ("Deepika", "Kapadia"), ("Rajesh", "Nambiar")
    ]

    firm_samples = [
        ("Deloitte Haskins & Sells LLP", "BIG4"),
        ("BSR & Co. LLP", "BIG4"),
        ("PwC India", "BIG4"),
        ("SRBC & Co. LLP (EY)", "BIG4"),
        ("Grant Thornton Bharat LLP", "TOP10"),
        ("BDO India LLP", "TOP10"),
        ("MSKA & Associates", "TOP10"),
        ("Singhi & Co.", "TOP10"),
        ("Kalyaniwalla & Mistry LLP", "MID_SIZE"),
        ("Chhajed & Doshi", "MID_SIZE"),
        ("Lodha & Co.", "MID_SIZE"),
        ("K.S. Aiyar & Co.", "MID_SIZE"),
        ("R.K. Doshi & Associates", "SMALL"),
        ("M.P. Chitale & Co.", "MID_SIZE"),
        ("B.K. Khare & Co.", "MID_SIZE")
    ]

    all_cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"]

    archetypes = [
        # 1. Big 4 Statutory Audit Specialist (Rank Holder / 1st Attempt)
        {
            "status": "QUALIFIED", "attempts": 1, "isRanker": True,
            "firmTier": "BIG4", "weeks": 156,
            "areas": ["Statutory Audit & Assurance", "Ind AS Reporting", "CARO 2020 Compliance", "Internal Financial Controls (IFCoFR)"],
            "software": ["Advanced Excel (PowerQuery, Financial Modeling)", "SAP ERP (FICO, S/4HANA)", "Alteryx / Python Data Automation"],
            "skills": [("Statutory Audit", 5), ("Ind AS", 5), ("CARO 2020", 5), ("IFCoFR", 4), ("SAP ERP", 4)],
            "pathways": ["AUDIT", "CONSULTING", "FPA"],
            "salaryMin": 1400000, "salaryMax": 2000000
        },
        # 2. Big 4 M&A / Transaction Advisory Trainee
        {
            "status": "QUALIFIED", "attempts": 1, "isRanker": False,
            "firmTier": "BIG4", "weeks": 156,
            "areas": ["Financial Due Diligence & M&A", "Valuation under ICAI Standards", "FP&A, Variance Modeling"],
            "software": ["Advanced Excel (PowerQuery, Financial Modeling)", "PowerBI / Tableau Financial Reporting"],
            "skills": [("Financial Due Diligence", 5), ("Quality of Earnings", 4), ("Valuation", 4), ("Financial Modeling", 5)],
            "pathways": ["IB", "CORP_FIN", "FPA"],
            "salaryMin": 1800000, "salaryMax": 2600000
        },
        # 3. Top 10 Direct Tax & Transfer Pricing Specialist
        {
            "status": "QUALIFIED", "attempts": 2, "isRanker": False,
            "firmTier": "TOP10", "weeks": 156,
            "areas": ["Direct Tax & Corporate Tax Returns", "Transfer Pricing & Section 92C Documentation"],
            "software": ["Advanced Excel (PowerQuery, Financial Modeling)", "Tally Prime & Busy Accounting"],
            "skills": [("Corporate Tax Returns", 5), ("Transfer Pricing", 4), ("Tax Audit Form 3CD", 5), ("TDS Compliance", 5)],
            "pathways": ["TAX", "CONSULTING", "PRACTICE"],
            "salaryMin": 1300000, "salaryMax": 1800000
        },
        # 4. Mid-Size All-Rounder (Audit + GST + Direct Tax)
        {
            "status": "QUALIFIED", "attempts": 2, "isRanker": False,
            "firmTier": "MID_SIZE", "weeks": 156,
            "areas": ["Statutory Audit & Assurance", "GST Monthly Filings & Annual Audit", "Direct Tax & Corporate Tax Returns"],
            "software": ["Tally Prime & Busy Accounting", "Advanced Excel (PowerQuery, Financial Modeling)"],
            "skills": [("Statutory Audit", 4), ("GST Returns", 5), ("Tax Audit Form 3CD", 4), ("Tally Prime", 5)],
            "pathways": ["AUDIT", "TAX", "PRACTICE"],
            "salaryMin": 1100000, "salaryMax": 1500000
        },
        # 5. CA Finalist (Articleship Complete, Preparing Final Exams)
        {
            "status": "FINALIST", "attempts": 2, "isRanker": False,
            "firmTier": "MID_SIZE", "weeks": 156,
            "areas": ["Statutory Audit & Assurance", "GST Monthly Filings & Annual Audit"],
            "software": ["Tally Prime & Busy Accounting", "Advanced Excel (PowerQuery, Financial Modeling)"],
            "skills": [("Vouching & Verification", 4), ("GST Returns", 4), ("Bank Audit", 4), ("TDS", 4)],
            "pathways": ["AUDIT", "FPA"],
            "salaryMin": 500000, "salaryMax": 750000
        },
        # 6. Corporate Finance & Valuation Enthusiast (Independent/Boutique firm)
        {
            "status": "QUALIFIED", "attempts": 1, "isRanker": False,
            "firmTier": "TOP10", "weeks": 156,
            "areas": ["Valuation under ICAI Standards", "FP&A, Variance Modeling & Budget Forecasting"],
            "software": ["Advanced Excel (PowerQuery, Financial Modeling)", "PowerBI / Tableau Financial Reporting"],
            "skills": [("Business Valuation", 4), ("DCF Modeling", 5), ("Budgeting & Forecasting", 4), ("Variance Analysis", 4)],
            "pathways": ["CORP_FIN", "FPA", "IB"],
            "salaryMin": 1500000, "salaryMax": 2100000
        }
    ]

    for i in range(60):
        fn, ln = names[i % len(names)]
        if i >= len(names):
            ln = f"{ln} II"
        
        arch = archetypes[i % len(archetypes)]
        firm_name, firm_tier = firm_samples[i % len(firm_samples)]
        
        # Override firmTier to match archetype for consistency where possible
        if arch["firmTier"] in ["BIG4", "TOP10"]:
            firm_tier = arch["firmTier"]
            if firm_tier == "BIG4":
                firm_name = firm_samples[i % 4][0]
            else:
                firm_name = firm_samples[4 + (i % 4)][0]

        cities_chosen = [all_cities[(i + j) % len(all_cities)] for j in range(2)]

        cand_id = f"cand-{i+1:04d}-{str(uuid.uuid4())[:8]}"
        is_qual = arch["status"] == "QUALIFIED"
        mem_num = f"{'FCA' if i % 4 == 0 else 'ACA'}-{500000 + i*17}" if is_qual else f"WRO-0{600000 + i*13}"

        cand = {
            "id": cand_id,
            "userId": f"usr-{i+1:04d}",
            "firstName": fn,
            "lastName": ln,
            "email": f"{fn.lower()}.{ln.lower().replace(' ', '')}@example.com",
            "icaiMembershipNo": mem_num,
            "caFinalStatus": arch["status"],
            "attemptsCount": arch["attempts"],
            "isRankHolder": arch["isRanker"],
            "articleshipFirm": firm_name,
            "articleshipFirmTier": firm_tier,
            "articleshipWeeks": arch["weeks"],
            "articleshipAreas": arch["areas"],
            "softwareProficiencies": arch["software"],
            "skills": [{"name": s[0], "proficiency": s[1]} for s in arch["skills"]],
            "preferredPathways": arch["pathways"],
            "targetCities": cities_chosen,
            "targetSalaryMin": arch["salaryMin"] // 100000,
            "targetSalaryMax": arch["salaryMax"] // 100000,
            "summary": f"{'Qualified Chartered Accountant' if is_qual else 'CA Finalist'} with {arch['weeks']} weeks verified articleship at {firm_name} ({firm_tier}). Core focus in {', '.join(arch['areas'][:2])}.",
            "form108Verified": True,
            "createdAt": "2026-09-15T10:00:00.000Z"
        }
        candidates.append(cand)

    return candidates
