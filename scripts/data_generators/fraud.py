"""
Generator for Job Fraud Risk Detection Corpus.
Includes annotated legitimate, review-required, and scam postings
with multi-signal risk indicators and ground truth risk categories.
"""

from typing import List, Dict, Any

def generate_fraud_dataset(legit_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    dataset = []
    
    # 1. 50 Legitimate Jobs
    for i in range(50):
        base = legit_jobs[i]
        dataset.append({
            "job_id": base["id"],
            "title": base["title"],
            "company_name": base["companyName"],
            "employer_domain": base["employerDomain"],
            "contact_email": f"careers@{base['employerDomain']}",
            "description": base["rawDescription"],
            "salary_min": base["salaryMin"],
            "salary_max": base["salaryMax"],
            "experience_min": base["experienceMin"],
            "location": base["locationCity"],
            "has_advance_fee_request": False,
            "has_suspicious_messaging_link": False,
            "domain_is_free_provider": False,
            "domain_spoofing_detected": False,
            "salary_to_exp_ratio_suspicious": False,
            "ground_truth_risk_tier": "LOW_RISK",
            "risk_score_target": 5.0 + (i % 8),
            "explanation": "Verified corporate employer domain with standard market salary and professional recruitment procedure."
        })

    # 2. 15 Review-Required Postings (Borderline / Incomplete / Freelance / High LPA)
    review_samples = [
        {
            "title": "Finance Consultant — US Accounting (Freelance / Contract)",
            "company": "Apex Financial Advisory",
            "domain": "apexfinance.in",
            "email": "apex.hiring.ca@gmail.com",
            "desc": "Seeking CA with US GAAP knowledge. Send resumes to gmail address. Immediate selection via telephonic interview.",
            "s_min": 2400000, "s_max": 3200000, "exp": 0, "city": "Remote",
            "has_fee": False, "suspicious_link": False, "free_email": True, "spoof": False, "high_ratio": True,
            "score": 45.0,
            "reason": "Uses free Gmail provider for recruiter contact and offers above-market fresher compensation."
        },
        {
            "title": "Virtual CFO — Startup Portfolio",
            "company": "GrowthX Incubator Hub",
            "domain": "growthx-hub.io",
            "email": "careers@growthx-hub.io",
            "desc": "Looking for young CAs to consult 3-4 early-stage tech ventures. WhatsApp your credentials to +91-9820011223.",
            "s_min": 1800000, "s_max": 2500000, "exp": 1, "city": "Bengaluru",
            "has_fee": False, "suspicious_link": True, "free_email": False, "spoof": False, "high_ratio": False,
            "score": 40.0,
            "reason": "Directs candidate to personal WhatsApp contact rather than enterprise ATS portal."
        },
        {
            "title": "Internal Audit Executive — Global Projects",
            "company": "Kestrel Management Consultants",
            "domain": "kestrel-global.biz",
            "email": "hr@kestrel-global.biz",
            "desc": "Urgent opening for Audit CAs. Requires urgent document submission within 24 hours.",
            "s_min": 1500000, "s_max": 2000000, "exp": 0, "city": "Mumbai",
            "has_fee": False, "suspicious_link": False, "free_email": False, "spoof": False, "high_ratio": False,
            "score": 35.0,
            "reason": "Unregistered new domain (.biz TLD) with high urgency pressure."
        }
    ]

    for i in range(15):
        s = review_samples[i % len(review_samples)]
        dataset.append({
            "job_id": f"job-review-{i+1:03d}",
            "title": s["title"],
            "company_name": s["company"],
            "employer_domain": s["domain"],
            "contact_email": s["email"],
            "description": s["desc"],
            "salary_min": s["s_min"],
            "salary_max": s["s_max"],
            "experience_min": s["exp"],
            "location": s["city"],
            "has_advance_fee_request": s["has_fee"],
            "has_suspicious_messaging_link": s["suspicious_link"],
            "domain_is_free_provider": s["free_email"],
            "domain_spoofing_detected": s["spoof"],
            "salary_to_exp_ratio_suspicious": s["high_ratio"],
            "ground_truth_risk_tier": "REVIEW_REQUIRED",
            "risk_score_target": s["score"] + (i % 5),
            "explanation": s["reason"]
        })

    # 3. 15 High-Risk Fraudulent Scams
    scam_samples = [
        {
            "title": "Senior Auditor — EY Global Delivery Services (Guaranteed Selection)",
            "company": "Ernst & Young GDS (Recruitment Desk)",
            "domain": "ey-careers-india.org",
            "email": "offer.letter@ey-careers-india.org",
            "desc": "Direct selection based on CV. Candidate must transfer refundable background verification fee of Rs. 3,500 via UPI prior to appointment letter release.",
            "s_min": 3500000, "s_max": 4500000, "exp": 0, "city": "Bengaluru",
            "has_fee": True, "suspicious_link": False, "free_email": False, "spoof": True, "high_ratio": True,
            "score": 95.0,
            "reason": "Advance fee demand disguised as background verification; domain spoofing of Ernst & Young."
        },
        {
            "title": "Chartered Accountant — Work From Home (Rs. 1,50,000 / month)",
            "company": "PwC Financial Services Ltd",
            "domain": "pwc-hiring-desk.net",
            "email": "pwchiringdesk@gmail.com",
            "desc": "Part-time data review for auditing clients. Join our Telegram channel t.me/pwc_finance_jobs to claim training kit and submit Rs. 2,000 security deposit.",
            "s_min": 1800000, "s_max": 2400000, "exp": 0, "city": "Remote",
            "has_fee": True, "suspicious_link": True, "free_email": True, "spoof": True, "high_ratio": True,
            "score": 98.0,
            "reason": "Impersonates Big 4 brand on free email; demands deposit via Telegram recruitment channel."
        },
        {
            "title": "Statutory Audit Trainee — High Monthly Stipend (Rs. 60,000)",
            "company": "Deloitte Advisory Partner Services",
            "domain": "deloitte-india-portal.online",
            "email": "deloitte.partner.desk@yahoo.com",
            "desc": "Offer letter guaranteed for all CA Finalists. Laptop dispatch fee of Rs. 4,999 required which is 100% refundable upon joining.",
            "s_min": 720000, "s_max": 900000, "exp": 0, "city": "Mumbai",
            "has_fee": True, "suspicious_link": False, "free_email": True, "spoof": True, "high_ratio": True,
            "score": 92.0,
            "reason": "Advance equipment courier fee required prior to joining; brand spoofing of Deloitte."
        }
    ]

    for i in range(15):
        s = scam_samples[i % len(scam_samples)]
        dataset.append({
            "job_id": f"job-scam-{i+1:03d}",
            "title": s["title"],
            "company_name": s["company"],
            "employer_domain": s["domain"],
            "contact_email": s["email"],
            "description": s["desc"],
            "salary_min": s["s_min"],
            "salary_max": s["s_max"],
            "experience_min": s["exp"],
            "location": s["city"],
            "has_advance_fee_request": s["has_fee"],
            "has_suspicious_messaging_link": s["suspicious_link"],
            "domain_is_free_provider": s["free_email"],
            "domain_spoofing_detected": s["spoof"],
            "salary_to_exp_ratio_suspicious": s["high_ratio"],
            "ground_truth_risk_tier": "HIGH_RISK",
            "risk_score_target": s["score"] + (i % 2),
            "explanation": s["reason"]
        })

    return dataset
