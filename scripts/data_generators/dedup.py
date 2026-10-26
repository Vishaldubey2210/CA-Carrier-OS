"""
Generator for Job Deduplication Evaluation Pairs dataset.
Provides pairs of job postings with ground-truth duplicate classification (1 or 0),
evaluating exact matching, n-gram Jaccard, and semantic similarity.
"""

from typing import List, Dict, Any

def generate_dedup_pairs(jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    pairs = []
    pair_id = 1

    # 1. Exact duplicates (with varied IDs and identical content)
    for i in range(25):
        base_job = jobs[i % len(jobs)]
        dup_job = {
            "id": f"dup-exact-{i+1:03d}",
            "title": base_job["title"],
            "companyName": base_job["companyName"],
            "locationCity": base_job["locationCity"],
            "rawDescription": base_job["rawDescription"],
            "salaryMin": base_job["salaryMin"],
            "salaryMax": base_job["salaryMax"],
            "caPathway": base_job["caPathway"]
        }
        pairs.append({
            "pair_id": f"dedup-{pair_id:04d}",
            "pair_type": "EXACT_DUPLICATE",
            "job_a": {
                "id": base_job["id"],
                "title": base_job["title"],
                "company": base_job["companyName"],
                "city": base_job["locationCity"],
                "description": base_job["rawDescription"]
            },
            "job_b": {
                "id": dup_job["id"],
                "title": dup_job["title"],
                "company": dup_job["companyName"],
                "city": dup_job["locationCity"],
                "description": dup_job["rawDescription"]
            },
            "is_duplicate": 1,
            "duplicate_type": "EXACT"
        })
        pair_id += 1

    # 2. Near duplicates (cross-platform repost variations, title abbreviation, whitespace differences)
    near_dup_transforms = [
        ("Senior Associate — Statutory Audit & Ind AS", "Sr Associate - Stat Audit / IndAS", " Deloitte Touche Tohmatsu India "),
        ("Manager — Financial Due Diligence & M&A", "Manager FDD and Mergers & Acquisitions", "BDO India"),
        ("AVP — Corporate Financial Planning & Analysis", "AVP Corporate FP&A", "Razorpay Software"),
        ("Consultant — International Tax & Transfer Pricing", "Consultant TP & Int Tax", "Ernst & Young LLP"),
        ("Assistant Manager — Indirect Tax & GST Audits", "Asst Mgr - GST & Indirect Taxation", "Grant Thornton Bharat")
    ]

    for i in range(35):
        base_job = jobs[(i * 3) % len(jobs)]
        t_orig, t_variant, c_variant = near_dup_transforms[i % len(near_dup_transforms)]
        
        # Modify description slightly (add standard agency preamble or disclaimer)
        desc_variant = f"Hiring on behalf of client: {base_job['rawDescription']} Apply through recruitment portal ref #{i*101}."

        pairs.append({
            "pair_id": f"dedup-{pair_id:04d}",
            "pair_type": "NEAR_DUPLICATE_CROSS_POST",
            "job_a": {
                "id": base_job["id"],
                "title": base_job["title"],
                "company": base_job["companyName"],
                "city": base_job["locationCity"],
                "description": base_job["rawDescription"]
            },
            "job_b": {
                "id": f"near-dup-{i+1:03d}",
                "title": t_variant,
                "company": c_variant if c_variant else base_job["companyName"],
                "city": base_job["locationCity"],
                "description": desc_variant
            },
            "is_duplicate": 1,
            "duplicate_type": "NEAR_DUPLICATE"
        })
        pair_id += 1

    # 3. Non-duplicates: Same company, different city or department (Crucial false-positive boundary)
    for i in range(25):
        job_a = jobs[i % len(jobs)]
        # Find another job at same company or same pathway in different location
        same_comp = [j for j in jobs if j["companyName"] == job_a["companyName"] and j["id"] != job_a["id"]]
        if same_comp:
            job_b = same_comp[0]
        else:
            job_b = jobs[(i + 15) % len(jobs)]

        pairs.append({
            "pair_id": f"dedup-{pair_id:04d}",
            "pair_type": "SAME_COMPANY_DIFFERENT_ROLE",
            "job_a": {
                "id": job_a["id"],
                "title": job_a["title"],
                "company": job_a["companyName"],
                "city": job_a["locationCity"],
                "description": job_a["rawDescription"]
            },
            "job_b": {
                "id": job_b["id"],
                "title": job_b["title"],
                "company": job_b["companyName"],
                "city": job_b["locationCity"],
                "description": job_b["rawDescription"]
            },
            "is_duplicate": 0,
            "duplicate_type": "NON_DUPLICATE"
        })
        pair_id += 1

    # 4. Non-duplicates: Entirely distinct jobs
    for i in range(15):
        job_a = jobs[i % len(jobs)]
        job_b = jobs[(i + 30) % len(jobs)]

        pairs.append({
            "pair_id": f"dedup-{pair_id:04d}",
            "pair_type": "DISTINCT_ROLES",
            "job_a": {
                "id": job_a["id"],
                "title": job_a["title"],
                "company": job_a["companyName"],
                "city": job_a["locationCity"],
                "description": job_a["rawDescription"]
            },
            "job_b": {
                "id": job_b["id"],
                "title": job_b["title"],
                "company": job_b["companyName"],
                "city": job_b["locationCity"],
                "description": job_b["rawDescription"]
            },
            "is_duplicate": 0,
            "duplicate_type": "NON_DUPLICATE"
        })
        pair_id += 1

    return pairs
