import json
import config
from unittest.mock import patch
from services.consistency import (
    check_numeric_consistency,
    check_semantic_consistency,
    run_consistency_check,
)


class MockEmbeddingModel:
    def encode(self, texts):
        if texts[0] == "Satisfied statement" and texts[1] == "Satisfied statement":
            return [[1.0, 0.0], [1.0, 0.0]]
        if "satisfaction" in texts[0].lower() and "satisfaction" in texts[1].lower():
            return [[1.0, 0.0], [1.0, 0.0]]
        return [[1.0, 0.0], [0.0, 1.0]]


def test_numeric_consistency_perfect_match():
    span = "The team distributed 500 kits."
    chunk = "Yesterday, 500 kits were successfully distributed."
    consistent, claim, source = check_numeric_consistency(span, chunk)
    assert consistent is True


def test_numeric_consistency_mismatch():
    span = "The team distributed 400 kits."
    chunk = "Yesterday, 500 kits were successfully distributed."
    consistent, claim, source = check_numeric_consistency(span, chunk)
    assert consistent is False
    assert claim == "400"
    assert source == "500"


@patch("services.consistency.get_embedding_model", return_value=MockEmbeddingModel())
def test_semantic_consistency_low_similarity(mock_embed):
    span = "The project failed completely."
    chunk = "Satisfied statement"
    assert check_semantic_consistency(span, chunk) is False


@patch("services.consistency.get_embedding_model", return_value=MockEmbeddingModel())
def test_semantic_consistency_high_similarity(mock_embed):
    span = "Satisfied statement"
    chunk = "Satisfied statement"
    assert check_semantic_consistency(span, chunk) is True


@patch("services.consistency.get_embedding_model", return_value=MockEmbeddingModel())
def test_run_consistency_check(mock_embed):
    source_id = "src_019"
    index_data = [
        {
            "chunk_id": "src_019#c0",
            "text": "The team distributed 500 kits.",
            "embedding": [0.1, 0.2],
        }
    ]
    with open(config.index_dir / f"{source_id}.json", "w", encoding="utf-8") as f:
        json.dump(index_data, f)

    report_id = "rep_consistency_test"
    report_data = {
        "report_id": report_id,
        "content": "The team distributed 400 kits.",
        "spans": [
            {
                "span_id": "s1",
                "text": "The team distributed 400 kits",
                "source_chunk": "src_019#c0",
            }
        ],
    }
    with open(config.reports_dir / f"{report_id}.json", "w", encoding="utf-8") as f:
        json.dump(report_data, f)

    result = run_consistency_check(report_id)

    assert result["consistent"] is False
    assert len(result["flags"]) == 1
    assert result["flags"][0]["issue"] == "numeric_mismatch"
    assert result["flags"][0]["source_value"] == "500"
