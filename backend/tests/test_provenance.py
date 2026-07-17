import json
from services.generation import parse_citations
from services.provenance import get_provenance_log
import config


def test_parse_citations_standard():
    raw_text = "500 households received relief kits [src_0142#c4]. Additionally, clean water access was restored [src_0142#c5]."
    cleaned_text, spans = parse_citations(raw_text)

    assert cleaned_text == "500 households received relief kits. Additionally, clean water access was restored."
    assert len(spans) == 2
    assert spans[0]["span_id"] == "s1"
    assert spans[0]["text"] == "500 households received relief kits"
    assert spans[0]["source_chunk"] == "src_0142#c4"
    assert spans[1]["span_id"] == "s2"
    assert spans[1]["text"] == "Additionally, clean water access was restored"
    assert spans[1]["source_chunk"] == "src_0142#c5"


def test_parse_citations_spacing():
    raw_text = "Community reported high satisfaction [src_0142#c1] ."
    cleaned_text, spans = parse_citations(raw_text)

    assert cleaned_text == "Community reported high satisfaction."
    assert len(spans) == 1
    assert spans[0]["span_id"] == "s1"
    assert spans[0]["text"] == "Community reported high satisfaction"
    assert spans[0]["source_chunk"] == "src_0142#c1"


def test_parse_citations_none():
    raw_text = "General introductory statement about the project."
    cleaned_text, spans = parse_citations(raw_text)

    assert cleaned_text == "General introductory statement about the project."
    assert len(spans) == 0


def test_resolve_provenance_log():
    # 1. Setup mock index source.
    source_id = "src_0142"
    index_data = [
        {"chunk_id": "src_0142#c0", "text": "First chunk", "embedding": [0.1, 0.2]},
        {"chunk_id": "src_0142#c1", "text": "Second chunk", "embedding": [0.3, 0.4]}
    ]
    index_file = config.index_dir / f"{source_id}.json"
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(index_data, f)

    # 2. Write a mock report.
    report_id = "rep_test"
    report_data = {
        "report_id": report_id,
        "content": "Cleaned report content.",
        "spans": [
            {"span_id": "s1", "text": "Cleaned report content", "source_chunk": "src_0142#c0"}
        ]
    }
    report_file = config.reports_dir / f"{report_id}.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report_data, f)

    # 3. Call get_provenance_log.
    prov_log = get_provenance_log(report_id)

    # 4. Verify results.
    assert prov_log["report_id"] == report_id
    assert len(prov_log["spans"]) == 1
    assert prov_log["spans"][0]["span_id"] == "s1"
    assert prov_log["spans"][0]["source_chunk"] == "src_0142#c0"
