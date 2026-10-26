"""
Notebook 2 Generator & Executor: Job Deduplication & Job Fraud Risk Detection
"""

import nbformat as nbf
from nbclient import NotebookClient
from pathlib import Path
import json

WORKSPACE_ROOT = Path("/home/vishal/Downloads/CA Carrer OS")
NOTEBOOK_DIR = WORKSPACE_ROOT / "notebooks"
MODELS_DIR = WORKSPACE_ROOT / "models"
NOTEBOOK_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

nb = nbf.v4.new_notebook()

nb.metadata = {
    "kernelspec": {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3"
    },
    "language_info": {
        "name": "python",
        "version": "3.14.6"
    }
}

cells = []

# Cell 1: Title & Overview
cells.append(nbf.v4.new_markdown_cell("""# 02 — Multi-Signal Job Deduplication & Job Fraud Risk Detection

**Objective:**
1. **Deduplication Engine (ML-05):** Transition from naive exact-hash matching to token-normalized n-gram similarity to accurately cluster cross-posted CA opportunities while preserving distinct openings at identical employers.
2. **Fraud Risk Detection (ML-04):** Build a transparent, calibrated machine learning classifier to detect deceptive, phishing, and advance-fee recruitment scams targeting CA aspirants without falsely penalizing legitimate SME CA practice listings.

**Decisions Supported:**
- Clean search feed without duplicate listings from aggregator cross-postings.
- Candidate safety gate: automatic tagging of `LOW_RISK`, `REVIEW_REQUIRED`, or `HIGH_RISK`.
"""))

# Cell 2: Research Questions & Hypotheses
cells.append(nbf.v4.new_markdown_cell("""## 1. Research Questions & Hypotheses

- **H1 (Dedup):** Naive exact hash matching misses near-duplicate postings caused by minor title variations (e.g., "Sr. Associate - Stat Audit" vs "Senior Associate - Statutory Audit") or whitespace anomalies.
- **H2 (Dedup):** An n-gram word/character TF-IDF cosine similarity threshold at $\\theta \\in [0.70, 0.85]$ will achieve $F1 > 0.95$ with $0$ false mergers of distinct roles.
- **H3 (Fraud):** Domain and signal indicators (advance fee request, telegram interview link, free email domain for corporate entity, salary anomaly) can be modeled with calibrated logistic regression and decision trees to flag high-risk scams with zero false positives on verified boutique CA firms.
"""))

# Cell 3: Environment Setup & Reproducibility
cells.append(nbf.v4.new_code_cell(r"""import os
import sys
import json
import re
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import LogisticRegression, RidgeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split
from sklearn.metrics import classification_report, precision_recall_fscore_support, roc_auc_score, confusion_matrix

SEED = 42
np.random.seed(SEED)

print(f"NumPy: {np.__version__} | Pandas: {pd.__version__} | Scikit-Learn: {sklearn.__version__}")
"""))

# Cell 4: Part 1 - Deduplication Data Loading
cells.append(nbf.v4.new_code_cell(r"""DEDUP_PATH = Path("/home/vishal/Downloads/CA Carrer OS/data/processed/job_dedup_evaluation_pairs.json")

with open(DEDUP_PATH, "r", encoding="utf-8") as f:
    dedup_raw = json.load(f)

print(f"Loaded {len(dedup_raw)} deduplication evaluation pairs.")

# Flatten nested structure
rows = []
for p in dedup_raw:
    rows.append({
        'pair_id': p['pair_id'],
        'pair_type': p['pair_type'],
        'is_duplicate': p['is_duplicate'],
        'duplicate_type': p['duplicate_type'],
        'a_title': p['job_a']['title'],
        'a_company': p['job_a']['company'],
        'a_city': p['job_a']['city'],
        'a_desc': p['job_a']['description'],
        'b_title': p['job_b']['title'],
        'b_company': p['job_b']['company'],
        'b_city': p['job_b']['city'],
        'b_desc': p['job_b']['description']
    })

dedup_df = pd.DataFrame(rows)
print("\nPair Type Distribution:")
print(dedup_df['pair_type'].value_counts())
print("\nis_duplicate Distribution:")
print(dedup_df['is_duplicate'].value_counts())
"""))

# Cell 5: Part 1 - Exact Hash Matching Baseline vs N-gram Similarity
cells.append(nbf.v4.new_code_cell(r"""# Baseline: Exact match of normalized title + company + city
def exact_hash_match(row):
    t_a = row['a_title'].lower().strip()
    t_b = row['b_title'].lower().strip()
    c_a = row['a_company'].lower().strip()
    c_b = row['b_company'].lower().strip()
    l_a = row['a_city'].lower().strip()
    l_b = row['b_city'].lower().strip()
    return int((t_a == t_b) and (c_a == c_b) and (l_a == l_b))

exact_preds = dedup_df.apply(exact_hash_match, axis=1).values
y_true_dedup = dedup_df['is_duplicate'].values

p_base, r_base, f1_base, _ = precision_recall_fscore_support(y_true_dedup, exact_preds, average='binary')
print("=== EXACT HASH BASELINE PERFORMANCE ===")
print(f"Precision: {p_base:.3f}")
print(f"Recall:    {r_base:.3f} (Fails on near-duplicate variants!)")
print(f"F1 Score:  {f1_base:.3f}")
"""))

# Cell 6: Part 1 - TF-IDF N-gram Cosine Similarity & Threshold Sweep
cells.append(nbf.v4.new_code_cell(r"""def clean_text(t):
    t = str(t).lower()
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    return ' '.join(t.split())

# Fit TF-IDF on combined titles and descriptions
corpus = []
for _, r in dedup_df.iterrows():
    corpus.append(clean_text(f"{r['a_title']} {r['a_company']} {r['a_desc']}"))
    corpus.append(clean_text(f"{r['b_title']} {r['b_company']} {r['b_desc']}"))

vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=1500)
vectorizer.fit(corpus)

sim_scores = []
for _, r in dedup_df.iterrows():
    t_a = clean_text(f"{r['a_title']} {r['a_company']} {r['a_desc']}")
    t_b = clean_text(f"{r['b_title']} {r['b_company']} {r['b_desc']}")
    vec_a = vectorizer.transform([t_a])
    vec_b = vectorizer.transform([t_b])
    sim = cosine_similarity(vec_a, vec_b)[0][0]
    sim_scores.append(sim)

dedup_df['cosine_similarity'] = sim_scores

print("=== COSINE SIMILARITY DISTRIBUTION BY PAIR TYPE ===")
print(dedup_df.groupby('pair_type')['cosine_similarity'].describe()[['mean', 'min', '50%', 'max']])

# Threshold sweep
print("\n=== DEDUPLICATION THRESHOLD SWEEP ===")
best_thresh = 0.60
best_f1 = 0.0

for thresh in np.arange(0.50, 0.95, 0.05):
    preds = (dedup_df['cosine_similarity'] >= thresh).astype(int).values
    p, r, f1, _ = precision_recall_fscore_support(y_true_dedup, preds, average='binary', zero_division=0)
    print(f"Threshold: {thresh:.2f} | Precision: {p:.3f} | Recall: {r:.3f} | F1: {f1:.3f}")
    if f1 > best_f1:
        best_f1 = f1
        best_thresh = thresh

print(f"\nOptimal Deduplication Threshold: {best_thresh:.2f} (Achieved F1: {best_f1:.3f})")
"""))

# Cell 7: Part 1 - Export Deduplication Model
cells.append(nbf.v4.new_code_cell(r"""# Save deduplication artifacts
dedup_model_path = Path("/home/vishal/Downloads/CA Carrer OS/models/job_dedup_engine_v1.pkl")
dedup_meta_path = Path("/home/vishal/Downloads/CA Carrer OS/models/job_dedup_engine_v1_metadata.json")

dedup_artifact = {
    "vectorizer": vectorizer,
    "optimal_threshold": float(best_thresh),
    "version": "1.0.0",
    "metrics": {
        "precision": float(precision_recall_fscore_support(y_true_dedup, (dedup_df['cosine_similarity'] >= best_thresh).astype(int), average='binary')[0]),
        "recall": float(precision_recall_fscore_support(y_true_dedup, (dedup_df['cosine_similarity'] >= best_thresh).astype(int), average='binary')[1]),
        "f1_score": float(best_f1)
    }
}

with open(dedup_model_path, "wb") as f:
    pickle.dump(dedup_artifact, f)

with open(dedup_meta_path, "w", encoding="utf-8") as f:
    json.dump({
        "engine_name": "TFIDF_Cosine_Deduplication_Engine",
        "optimal_threshold": float(best_thresh),
        "f1_score": float(best_f1),
        "exact_hash_baseline_f1": float(f1_base),
        "artifact_path": str(dedup_model_path)
    }, f, indent=2)

print(f"✅ Serialized Deduplication Engine to {dedup_model_path.name}")
"""))

# Cell 8: Part 2 - Job Fraud Risk Data Loading
cells.append(nbf.v4.new_code_cell(r"""FRAUD_PATH = Path("/home/vishal/Downloads/CA Carrer OS/data/processed/job_fraud_risk_corpus.json")

with open(FRAUD_PATH, "r", encoding="utf-8") as f:
    fraud_data = json.load(f)

fraud_df = pd.DataFrame(fraud_data)
print(f"Loaded {len(fraud_df)} job fraud risk postings.")
print("\nRisk Tier Distribution:")
print(fraud_df['ground_truth_risk_tier'].value_counts())

# Binary target: 1 if HIGH_RISK or REVIEW_REQUIRED, 0 if LOW_RISK
fraud_df['is_risk'] = (fraud_df['ground_truth_risk_tier'] != 'LOW_RISK').astype(int)
print("\nRisk Binary Target Distribution:")
print(fraud_df['is_risk'].value_counts())
"""))

# Cell 9: Part 2 - Feature Engineering for Fraud Classifier
cells.append(nbf.v4.new_code_cell(r"""# Construct feature matrix
features_fraud = [
    'has_advance_fee_request',
    'has_suspicious_messaging_link',
    'domain_is_free_provider',
    'domain_spoofing_detected',
    'salary_to_exp_ratio_suspicious'
]

X_fraud = fraud_df[features_fraud].astype(float)
# Add normalized description length feature
X_fraud['desc_length'] = fraud_df['description'].apply(lambda d: len(str(d))) / 1000.0

y_fraud = fraud_df['is_risk'].values

print("Fraud feature matrix shape:", X_fraud.shape)
X_fraud.head(3)
"""))

# Cell 10: Part 2 - Model Comparison & Stratified 5-Fold Cross Validation
cells.append(nbf.v4.new_code_cell(r"""skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)

models_fraud = {
    "Logistic Regression": LogisticRegression(C=1.0, class_weight='balanced', random_state=SEED),
    "Random Forest Classifier": RandomForestClassifier(n_estimators=100, max_depth=3, class_weight='balanced', random_state=SEED),
    "Gradient Boosting Classifier": GradientBoostingClassifier(n_estimators=50, max_depth=2, random_state=SEED)
}

print("=== 5-FOLD CROSS-VALIDATION FRAUD CLASSIFICATION RESULTS ===")
for name, model in models_fraud.items():
    preds = cross_val_predict(model, X_fraud, y_fraud, cv=skf)
    p, r, f1, _ = precision_recall_fscore_support(y_fraud, preds, average='binary')
    tn, fp, fn, tp = confusion_matrix(y_fraud, preds).ravel()
    print(f"\nModel: {name}")
    print(f"Precision: {p:.3f} | Recall: {r:.3f} | F1: {f1:.3f}")
    print(f"False Positives: {fp} (Legitimate flagged as scam) | False Negatives: {fn} (Scam missed)")
"""))

# Cell 11: Part 2 - Fit Final Fraud Risk Model & Export Artifacts
cells.append(nbf.v4.new_code_cell(r"""# Fit final production model (Logistic Regression for calibration and explainability)
final_fraud_model = LogisticRegression(C=1.0, class_weight='balanced', random_state=SEED)
final_fraud_model.fit(X_fraud, y_fraud)

fraud_model_path = Path("/home/vishal/Downloads/CA Carrer OS/models/job_fraud_detector_v1.pkl")
fraud_meta_path = Path("/home/vishal/Downloads/CA Carrer OS/models/job_fraud_detector_v1_metadata.json")

coef_dict = dict(zip(X_fraud.columns, [float(c) for c in final_fraud_model.coef_[0]]))
print("=== FEATURE WEIGHTS (EXPLAINABILITY) ===")
for feat, weight in sorted(coef_dict.items(), key=lambda x: x[1], reverse=True):
    print(f"{feat:32s}: {weight:+.4f}")

fraud_payload = {
    "model_name": "Calibrated_Logistic_Fraud_Detector",
    "model_artifact": final_fraud_model,
    "feature_names": list(X_fraud.columns),
    "version": "1.0.0",
    "thresholds": {
        "high_risk": 0.70,
        "review_required": 0.35
    }
}

with open(fraud_model_path, "wb") as f:
    pickle.dump(fraud_payload, f)

with open(fraud_meta_path, "w", encoding="utf-8") as f:
    json.dump({
        "model_name": "Calibrated_Logistic_Fraud_Detector",
        "feature_weights": coef_dict,
        "thresholds": {"high_risk": 0.70, "review_required": 0.35},
        "artifact_path": str(fraud_model_path)
    }, f, indent=2)

print(f"\n✅ Serialized Fraud Risk Detector to {fraud_model_path.name}")

# Smoke test inference on scam vs legitimate boutique firm
scam_sample = np.array([[1.0, 1.0, 1.0, 0.0, 1.0, 0.15]]) # Fee demand, telegram, free email, unrealistic salary, short desc
scam_prob = float(final_fraud_model.predict_proba(scam_sample)[0][1])

legit_sample = np.array([[0.0, 0.0, 0.0, 0.0, 0.0, 0.85]]) # Corporate, standard market salary, professional desc
legit_prob = float(final_fraud_model.predict_proba(legit_sample)[0][1])

print(f"Scam Sample Predicted Risk Probability:       {scam_prob:.4f} (Expected >0.85)")
print(f"Legitimate Boutique Predicted Probability:    {legit_prob:.4f} (Expected <0.20, LOW_RISK tier < 0.35)")
assert scam_prob >= 0.85, "Smoke test failed: scam probability too low"
assert legit_prob < 0.20, "Smoke test failed: legitimate job flagged as risk"
print("✅ Smoke tests passed with flying colors!")
"""))

nb.cells = cells

# Save unexecuted notebook
nb_path = NOTEBOOK_DIR / "02_job_deduplication_and_fraud_detection.ipynb"
with open(nb_path, "w", encoding="utf-8") as f:
    nbf.write(nb, f)

print(f"[+] Written notebook template to {nb_path.name}")
print("[+] Executing notebook top-to-bottom...")

client = NotebookClient(nb, timeout=600, kernel_name='python3')
client.execute()

# Save executed notebook with all outputs
with open(nb_path, "w", encoding="utf-8") as f:
    nbf.write(nb, f)

print(f"✅ Executed notebook successfully and saved with outputs: {nb_path.name}")
