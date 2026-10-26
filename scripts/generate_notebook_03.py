"""
Notebook 3 Generator & Executor: Semantic Search & RAG Knowledge Copilot
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
cells.append(nbf.v4.new_markdown_cell("""# 03 — CA Knowledge Copilot: Semantic Retrieval & Grounded RAG Benchmarking

**Objective:**
Build and benchmark an authoritative, zero-hallucination Information Retrieval and Retrieval-Augmented Generation (RAG) engine for Chartered Accountants, grounded strictly in official ICAI pronouncements, the Companies Act 2013, Income Tax Act 1961, CGST Act 2017, and Indian Accounting Standards (Ind AS).

**Decisions Supported:**
- Authoritative regulatory query answering with verifiable statutory section citations.
- Reliable abstention when queried on topics outside the verified regulatory corpus (no hallucinated guidance).
- Deterministic sub-millisecond document retrieval for the CA Career OS Copilot.
"""))

# Cell 2: Research Questions & Hypotheses
cells.append(nbf.v4.new_markdown_cell("""## 1. Research Questions & Hypotheses

- **H1:** Keyword overlap (lexical matching) fails on natural phrasing where professional terminology uses synonyms (e.g., "cooling-off period" vs "tenure restriction").
- **H2:** A sublinear TF-IDF vector retrieval engine with n-grams will achieve $Recall@1 \\ge 0.85$ and $Recall@3 = 1.00$ on curated CA benchmark queries.
- **H3:** Out-of-corpus adversarial queries (e.g., non-existent standards, speculative crypto advice) yield similarity $< 0.15$, enabling an unambiguous `ABSTAIN` gate that eliminates hallucinations.
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

SEED = 42
np.random.seed(SEED)

print(f"NumPy: {np.__version__} | Pandas: {pd.__version__} | Scikit-Learn: {sklearn.__version__}")
"""))

# Cell 4: Regulatory Corpus Loading
cells.append(nbf.v4.new_code_cell(r"""CORPUS_PATH = Path("/home/vishal/Downloads/CA Carrer OS/data/external/icai_regulatory_corpus.json")

with open(CORPUS_PATH, "r", encoding="utf-8") as f:
    corpus_data = json.load(f)

docs = corpus_data['documents']
queries = corpus_data['benchmark_queries']

print(f"Loaded {len(docs)} official statutory documents.")
print(f"Loaded {len(queries)} expert-curated benchmark queries.")

docs_df = pd.DataFrame(docs)
docs_df[['id', 'statute', 'section', 'title', 'category']]
"""))

# Cell 5: Lexical Keyword Matching Baseline
cells.append(nbf.v4.new_code_cell(r"""# Lexical baseline: Count of overlapping tokens between query and document text
def tokenize(text):
    return set(re.findall(r'\b[a-z0-9]+\b', text.lower()))

lexical_r1 = 0
lexical_r3 = 0
reciprocal_ranks = []

for q in queries:
    q_tokens = tokenize(q['query'])
    scores = []
    for doc in docs:
        doc_tokens = tokenize(f"{doc['title']} {doc['text']}")
        overlap = len(q_tokens.intersection(doc_tokens))
        scores.append((doc['id'], overlap))
    
    # Sort descending by token overlap
    ranked = sorted(scores, key=lambda x: x[1], reverse=True)
    ranked_ids = [r[0] for r in ranked]
    expected_ids = set(q['expected_doc_ids'])
    
    # Check Recall@1
    if ranked_ids[0] in expected_ids:
        lexical_r1 += 1
        reciprocal_ranks.append(1.0)
    elif len(ranked_ids) > 1 and ranked_ids[1] in expected_ids:
        reciprocal_ranks.append(1.0 / 2.0)
    elif len(ranked_ids) > 2 and ranked_ids[2] in expected_ids:
        reciprocal_ranks.append(1.0 / 3.0)
    else:
        reciprocal_ranks.append(0.0)
        
    # Check Recall@3
    if any(rid in expected_ids for rid in ranked_ids[:3]):
        lexical_r3 += 1

n_queries = len(queries)
print("=== LEXICAL TOKEN OVERLAP BASELINE ===")
print(f"Recall@1: {lexical_r1 / n_queries:.3f}")
print(f"Recall@3: {lexical_r3 / n_queries:.3f}")
print(f"MRR:      {np.mean(reciprocal_ranks):.3f}")
"""))

# Cell 6: Dense TF-IDF Cosine Semantic Retrieval Engine
cells.append(nbf.v4.new_code_cell(r"""# Build sublinear TF-IDF retrieval index with unigrams, bigrams, and statutory section preservation
def build_corpus_text(doc):
    # Header weight amplification for statute, section, and title
    header = f"{doc['statute']} {doc['section']} {doc['title']} {doc['category']}"
    return f"{header} {header} {doc['text']}"

corpus_texts = [build_corpus_text(d) for d in docs]

vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    sublinear_tf=True,
    stop_words='english',
    token_pattern=r'(?u)\b\w+\b'
)

doc_vectors = vectorizer.fit_transform(corpus_texts)
print(f"Constructed TF-IDF Vector Index with {doc_vectors.shape[1]} vocabulary dimensions.")

# Evaluate semantic retrieval
semantic_r1 = 0
semantic_r3 = 0
semantic_mrr = []
retrieval_records = []

for q in queries:
    q_vec = vectorizer.transform([q['query']])
    sims = cosine_similarity(q_vec, doc_vectors)[0]
    
    ranked_indices = np.argsort(sims)[::-1]
    top_doc_ids = [docs[idx]['id'] for idx in ranked_indices]
    expected_ids = set(q['expected_doc_ids'])
    
    top_1_hit = top_doc_ids[0] in expected_ids
    top_3_hit = any(did in expected_ids for did in top_doc_ids[:3])
    
    if top_1_hit:
        semantic_r1 += 1
        semantic_mrr.append(1.0)
    elif top_doc_ids[1] in expected_ids:
        semantic_mrr.append(0.5)
    elif top_doc_ids[2] in expected_ids:
        semantic_mrr.append(1.0 / 3.0)
    else:
        semantic_mrr.append(0.0)
        
    if top_3_hit:
        semantic_r3 += 1
        
    retrieval_records.append({
        'query_id': q['query_id'],
        'query': q['query'],
        'top_retrieved_id': top_doc_ids[0],
        'top_score': float(sims[ranked_indices[0]]),
        'expected_id': q['expected_doc_ids'][0],
        'hit@1': top_1_hit,
        'hit@3': top_3_hit
    })

print("=== TF-IDF VECTOR RETRIEVAL PERFORMANCE ===")
print(f"Recall@1: {semantic_r1 / n_queries:.3f}")
print(f"Recall@3: {semantic_r3 / n_queries:.3f}")
print(f"MRR:      {np.mean(semantic_mrr):.3f}")

retrieval_df = pd.DataFrame(retrieval_records)
retrieval_df[['query_id', 'top_retrieved_id', 'top_score', 'hit@1', 'hit@3']]
"""))

# Cell 7: Citation Grounding & Verification
cells.append(nbf.v4.new_code_cell(r"""# Verify that the retrieved documents provide exact expected citations
citation_hits = 0

for q in queries:
    q_vec = vectorizer.transform([q['query']])
    sims = cosine_similarity(q_vec, doc_vectors)[0]
    top_idx = np.argmax(sims)
    top_doc = docs[top_idx]
    
    # Check if expected citations appear in the retrieved document
    expected_citations = q['expected_citations']
    doc_full_text = f"{top_doc['statute']} {top_doc['section']} {top_doc['title']} {top_doc['text']}".lower()
    matched_citations = [c for c in expected_citations if c.lower() in doc_full_text]
    
    if len(matched_citations) == len(expected_citations):
        citation_hits += 1

citation_precision = citation_hits / len(queries)
print(f"Citation Grounding Precision: {citation_precision * 100:.1f}%")
assert citation_precision >= 0.85, "Citation grounding below required quality threshold"
"""))

# Cell 8: Zero-Hallucination Abstention Gate Test
cells.append(nbf.v4.new_code_cell(r"""# Test out-of-corpus and ungrounded adversarial queries
adversarial_queries = [
    "What is the capital gains tax on unauthorized cryptocurrency mining in Dubai?",
    "Explain the guidelines under Ind AS 999 for quantum accounting reserves.",
    "Can you give me guaranteed stock trading tips for Nifty 50 call options?"
]

ABSTENTION_THRESHOLD = 0.15

print("=== ABSTENTION GATE ADVERSARIAL EVALUATION ===")
for adv_q in adversarial_queries:
    q_vec = vectorizer.transform([adv_q])
    sims = cosine_similarity(q_vec, doc_vectors)[0]
    top_score = float(np.max(sims))
    
    if top_score < ABSTENTION_THRESHOLD:
        status = "ABSTAIN (Safe: Zero hallucination triggered)"
    else:
        status = f"FLAG: Score {top_score:.3f} exceeded threshold"
        
    print(f"Query: '{adv_q[:60]}...'")
    print(f"Max Similarity Score: {top_score:.4f} -> {status}\n")
    assert top_score < ABSTENTION_THRESHOLD, f"Abstention failed for: {adv_q}"

print("✅ All adversarial out-of-corpus queries safely rejected by Abstention Gate!")
"""))

# Cell 9: Export Vector Store Artifacts
cells.append(nbf.v4.new_code_cell(r"""vector_store_path = Path("/home/vishal/Downloads/CA Carrer OS/models/regulatory_vector_store.pkl")
vector_meta_path = Path("/home/vishal/Downloads/CA Carrer OS/models/regulatory_vector_store_metadata.json")

vector_store_payload = {
    "vectorizer": vectorizer,
    "doc_vectors": doc_vectors,
    "documents": docs,
    "abstention_threshold": ABSTENTION_THRESHOLD,
    "version": "1.0.0",
    "metrics": {
        "recall_at_1": float(semantic_r1 / n_queries),
        "recall_at_3": float(semantic_r3 / n_queries),
        "mrr": float(np.mean(semantic_mrr)),
        "citation_precision": float(citation_precision)
    }
}

with open(vector_store_path, "wb") as f:
    pickle.dump(vector_store_payload, f)

with open(vector_meta_path, "w", encoding="utf-8") as f:
    json.dump({
        "store_name": "ICAI_Regulatory_Vector_Store",
        "doc_count": len(docs),
        "vocabulary_size": int(doc_vectors.shape[1]),
        "abstention_threshold": ABSTENTION_THRESHOLD,
        "metrics": {
            "recall_at_1": float(semantic_r1 / n_queries),
            "recall_at_3": float(semantic_r3 / n_queries),
            "mrr": float(np.mean(semantic_mrr)),
            "citation_precision": float(citation_precision)
        },
        "artifact_path": str(vector_store_path)
    }, f, indent=2)

print(f"✅ Serialized Regulatory Vector Store to {vector_store_path.name}")
"""))

nb.cells = cells

# Save unexecuted notebook
nb_path = NOTEBOOK_DIR / "03_semantic_search_and_rag_copilot.ipynb"
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
