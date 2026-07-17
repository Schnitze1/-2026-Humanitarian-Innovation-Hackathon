import os
import re
import json
import numpy as np
import config
from services.indexing import get_embedding_model

numeric_regex = re.compile(r'\b\d+(?:,\d+)*(?:\.\d+)?\b')


def check_numeric_consistency(span_text: str, chunk_text: str) -> tuple[bool, str | None, str | None]:
    """
    :param span_text: Generated sentence text span.
    :param chunk_text: Reference source document chunk.
    :return: A tuple of (is_consistent, mismatched_claim_value, correct_source_value).
    """
    claim_nums = [n.replace(",", "") for n in numeric_regex.findall(span_text)]
    source_nums = [n.replace(",", "") for n in numeric_regex.findall(chunk_text)]
    for cn in claim_nums:
        if cn not in source_nums:
            try:
                large_source_nums = [sn for sn in source_nums if float(sn) > 31]
            except ValueError:
                large_source_nums = []
            source_val = large_source_nums[0] if large_source_nums else (source_nums[0] if source_nums else None)
            return False, cn, source_val
    return True, None, None


def check_semantic_consistency(span_text: str, chunk_text: str) -> bool:
    """
    :param span_text: Generated sentence text span.
    :param chunk_text: Reference source document chunk.
    :return: True if cosine similarity is above the consistency threshold, False otherwise.
    """
    model = get_embedding_model()
    embeddings = model.encode([span_text, chunk_text])
    emb1, emb2 = np.array(embeddings[0]), np.array(embeddings[1])
    norm1 = np.linalg.norm(emb1)
    norm2 = np.linalg.norm(emb2)
    if norm1 > 0 and norm2 > 0:
        sim = float(np.dot(emb1, emb2) / (norm1 * norm2))
    else:
        sim = 0.0

    return sim >= config.consistency_threshold


def run_consistency_check(report_id: str) -> dict:
    """
    :param report_id: ID of the generated report to inspect.
    :return: A dict containing report_id, consistency status, and a list of flagged mismatches.
    """
    report_file = config.reports_dir / f"{report_id}.json"
    if not os.path.exists(report_file):
        raise FileNotFoundError(f"Report ID {report_id} does not exist")

    with open(report_file, "r", encoding="utf-8") as f:
        report_data = json.load(f)

    flags = []
    spans = report_data.get("spans", [])

    for span in spans:
        source_chunk_id = span["source_chunk"]
        if "#" not in source_chunk_id:
            continue
        source_id = source_chunk_id.split("#")[0]

        index_file = config.index_dir / f"{source_id}.json"
        if not os.path.exists(index_file):
            continue

        with open(index_file, "r", encoding="utf-8") as f:
            index_data = json.load(f)

        chunk_text = None
        for chunk in index_data:
            if chunk["chunk_id"] == source_chunk_id:
                chunk_text = chunk["text"]
                break

        if chunk_text is None:
            continue

        # numeric verification
        is_num_consistent, claim_val, source_val = check_numeric_consistency(span["text"], chunk_text)
        if not is_num_consistent:
            flags.append({
                "span_id": span["span_id"],
                "issue": "numeric_mismatch",
                "claim": span["text"],
                "source_value": source_val
            })
            continue

        # semantic verification
        is_sem_consistent = check_semantic_consistency(span["text"], chunk_text)
        if not is_sem_consistent:
            flags.append({
                "span_id": span["span_id"],
                "issue": "unsupported_claim",
                "claim": span["text"],
                "source_value": None
            })

    return {
        "report_id": report_id,
        "consistent": len(flags) == 0,
        "flags": flags
    }
