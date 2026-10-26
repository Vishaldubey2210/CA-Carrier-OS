"""
Generator for expert-reviewed Job Match Evaluation Ground Truth dataset.
Provides pairs of (candidate, job) with ground-truth relevance grades (0-3),
baseline heuristic scores, and detailed multi-factor feature attributes.
"""

from typing import List, Dict, Any

def generate_match_eval_pairs(candidates: List[Dict[str, Any]], jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    pairs = []
    pair_id = 1

    # Cross a subset of candidates with jobs to generate 300 well-distributed evaluation pairs
    for c_idx, candidate in enumerate(candidates):
        # Pick 5 jobs for each candidate:
        # 1 strong pathway + location match
        # 1 strong pathway but wrong city (relocation/hybrid question)
        # 1 adjacent pathway (stretch)
        # 1 unqualified / strict mismatch (e.g. Finalist applying for Senior Manager)
        # 1 random / alternative pathway
        
        c_pathways = candidate["preferredPathways"]
        c_cities = [city.lower() for city in candidate["targetCities"]]
        c_qual = candidate["caFinalStatus"]
        c_tier = candidate["articleshipFirmTier"]

        matched_jobs = []
        
        # 1. Strong match candidate
        p1_jobs = [j for j in jobs if j["caPathway"] in c_pathways and j["locationCity"].lower() in c_cities]
        if p1_jobs:
            matched_jobs.append(p1_jobs[c_idx % len(p1_jobs)])
        
        # 2. Strong pathway, different location
        p2_jobs = [j for j in jobs if j["caPathway"] in c_pathways and j["locationCity"].lower() not in c_cities]
        if p2_jobs:
            matched_jobs.append(p2_jobs[c_idx % len(p2_jobs)])
        
        # 3. Adjacent pathway
        p3_jobs = [j for j in jobs if j["caPathway"] not in c_pathways]
        if p3_jobs:
            matched_jobs.append(p3_jobs[c_idx % len(p3_jobs)])

        # 4. Strict requirement mismatch (e.g., requires BIG4, or requires QUALIFIED when candidate is FINALIST)
        p4_jobs = [j for j in jobs if j["structuredRequirements"]["requiredQualification"] == "QUALIFIED" and c_qual != "QUALIFIED"]
        if not p4_jobs:
            p4_jobs = [j for j in jobs if "BIG4" in j["structuredRequirements"]["preferredFirmTiers"] and c_tier not in ["BIG4", "TOP10"]]
        if p4_jobs:
            matched_jobs.append(p4_jobs[c_idx % len(p4_jobs)])

        # 5. Alternate role
        p5_jobs = [j for j in jobs if j["id"] not in [mj["id"] for mj in matched_jobs]]
        if p5_jobs:
            matched_jobs.append(p5_jobs[(c_idx * 7) % len(p5_jobs)])

        for job in matched_jobs:
            if pair_id > 300:
                break
            
            # Compute Ground Truth Expert Label
            is_qual_ok = True
            if job["structuredRequirements"]["requiredQualification"] == "QUALIFIED" and c_qual != "QUALIFIED":
                is_qual_ok = False

            min_months = job["structuredRequirements"]["minArticleshipMonths"]
            cand_months = int(candidate["articleshipWeeks"] / 4.33)
            is_exp_ok = cand_months >= min_months

            is_eligible = is_qual_ok and is_exp_ok

            # Skills overlap
            cand_skill_names = {s["name"].lower() for s in candidate["skills"]}
            cand_skill_names.update([sp.lower() for sp in candidate["softwareProficiencies"]])
            
            mandatory = job["structuredRequirements"]["mandatorySkills"]
            mand_matches = [m for m in mandatory if any(m.lower() in cs or cs in m.lower() for cs in cand_skill_names)]
            mand_ratio = len(mand_matches) / max(1, len(mandatory))

            pref_skills = job["structuredRequirements"]["preferredSkills"]
            pref_matches = [p for p in pref_skills if any(p.lower() in cs or cs in p.lower() for cs in cand_skill_names)]
            pref_ratio = len(pref_matches) / max(1, len(pref_skills))

            pathway_match = job["caPathway"] in c_pathways
            tier_match = c_tier in job["structuredRequirements"]["preferredFirmTiers"]
            location_match = job["locationCity"].lower() in c_cities or job["workArrangement"] == "REMOTE"

            # Expert Relevance Grade:
            # 3: Perfect Fit (Eligible, Pathway Match, Mandatory Skills >= 80%, Tier Match)
            # 2: Good Fit (Eligible, Pathway Match or High Skills, Minor gap)
            # 1: Stretch / Sub-optimal (Eligible but wrong pathway or missing key skills, or relocation required)
            # 0: Ineligible / Complete Mismatch
            if not is_eligible:
                relevance_grade = 0
                fit_category = "LOW_FIT"
                ground_truth_score = 25.0 + mand_ratio * 15.0
            elif pathway_match and mand_ratio >= 0.75 and tier_match and location_match:
                relevance_grade = 3
                fit_category = "STRONG_MATCH"
                ground_truth_score = 88.0 + (pref_ratio * 10.0)
            elif (pathway_match and mand_ratio >= 0.5) or (mand_ratio >= 0.75):
                relevance_grade = 2
                fit_category = "MODERATE_MATCH"
                ground_truth_score = 68.0 + (mand_ratio * 15.0)
            elif mand_ratio >= 0.25 or pathway_match:
                relevance_grade = 1
                fit_category = "STRETCH_ROLE"
                ground_truth_score = 48.0 + (mand_ratio * 15.0)
            else:
                relevance_grade = 0
                fit_category = "LOW_FIT"
                ground_truth_score = 32.0

            # Deterministic baseline heuristic calculation
            heuristic_score = int(
                (25 if pathway_match else 10) +
                (mand_ratio * 25 + pref_ratio * 10) +
                (25 if tier_match else 15) +
                (15 if location_match else 5)
            )
            if not is_eligible:
                heuristic_score = min(heuristic_score, 45)

            pair = {
                "pair_id": f"pair-{pair_id:04d}",
                "candidate_id": candidate["id"],
                "job_id": job["id"],
                "candidate_name": f"{candidate['firstName']} {candidate['lastName']}",
                "candidate_ca_status": candidate["caFinalStatus"],
                "candidate_firm_tier": candidate["articleshipFirmTier"],
                "candidate_pathways": candidate["preferredPathways"],
                "candidate_cities": candidate["targetCities"],
                "job_title": job["title"],
                "job_company": job["companyName"],
                "job_pathway": job["caPathway"],
                "job_city": job["locationCity"],
                "job_required_qual": job["structuredRequirements"]["requiredQualification"],
                "is_eligible": is_eligible,
                "pathway_match": pathway_match,
                "mandatory_skills_ratio": round(mand_ratio, 3),
                "preferred_skills_ratio": round(pref_ratio, 3),
                "firm_tier_match": tier_match,
                "location_match": location_match,
                "relevance_grade": relevance_grade,
                "fit_category": fit_category,
                "ground_truth_match_score": round(ground_truth_score, 1),
                "baseline_heuristic_score": heuristic_score,
                "expert_rationale": f"Candidate {candidate['caFinalStatus']} from {c_tier} articleship evaluated against {job['companyName']} {job['title']}. Mandatory skills overlap: {len(mand_matches)}/{len(mandatory)}."
            }
            pairs.append(pair)
            pair_id += 1

    return pairs
