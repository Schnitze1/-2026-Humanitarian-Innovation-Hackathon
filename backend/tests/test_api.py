import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from serve import app


class MockEmbeddingModel:
    def encode(self, texts):
        return [[0.1, 0.2]] * len(texts)


@pytest.fixture(autouse=True)
def mock_embedder():
    with patch(
        "services.indexing.get_embedding_model", return_value=MockEmbeddingModel()
    ):
        with patch(
            "services.consistency.get_embedding_model",
            return_value=MockEmbeddingModel(),
        ):
            with patch(
                "services.generation.get_offline_llm", return_value=(None, None)
            ):
                yield


client = TestClient(app)


def test_api_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_api_ingest_invalid_format():
    response = client.post("/api/ingest", files={"file": ("test.pdf", b"test content")})
    assert response.status_code == 400


def test_api_ingest_empty_file():
    response = client.post("/api/ingest", files={"file": ("test.txt", b"")})
    assert response.status_code == 422


def test_api_ingest_success_txt():
    response = client.post(
        "/api/ingest", files={"file": ("test.txt", b"Hello world\n\nSecond chunk")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "source_id" in data
    assert data["chunks_indexed"] == 2


def test_api_ingest_success_csv():
    csv_data = b"col1,col2\nval1,val2\nval3,val4"
    response = client.post("/api/ingest", files={"file": ("test.csv", csv_data)})
    assert response.status_code == 200
    data = response.json()
    assert "source_id" in data
    assert data["chunks_indexed"] == 2


def test_api_draft_not_found():
    response = client.post(
        "/api/draft/src_non_existent",
        json={"report_type": "donor", "audience": "internal"},
    )
    assert response.status_code == 404


def test_api_provenance_not_found():
    response = client.get("/api/provenance/rep_non_existent")
    assert response.status_code == 404


def test_api_consistency_not_found():
    response = client.post("/api/consistency-check/rep_non_existent")
    assert response.status_code == 404


def test_api_disclosure_not_found():
    response = client.get("/api/disclosure/rep_non_existent")
    assert response.status_code == 404


def test_api_full_workflow():
    # 1. Ingest
    response = client.post(
        "/api/ingest",
        files={
            "file": (
                "transparency.txt",
                b"We served 450 families [src_dummy#c0] and gave them shelter.",
            )
        },
    )
    assert response.status_code == 200
    source_id = response.json()["source_id"]

    # 2. Draft
    response = client.post(
        f"/api/draft/{source_id}",
        json={"report_type": "Public Audit", "audience": "internal"},
    )
    assert response.status_code == 200
    data = response.json()
    report_id = data["report_id"]
    assert len(data["spans"]) > 0

    # 3. Provenance
    response = client.get(f"/api/provenance/{report_id}")
    assert response.status_code == 200
    prov_data = response.json()
    assert prov_data["report_id"] == report_id
    assert len(prov_data["spans"]) > 0

    # 4. Consistency
    response = client.post(f"/api/consistency-check/{report_id}")
    assert response.status_code == 200
    const_data = response.json()
    assert const_data["report_id"] == report_id
    assert "consistent" in const_data

    # 5. Disclosure views
    response = client.get(f"/api/disclosure/{report_id}")
    assert response.status_code == 200
    disc_data = response.json()
    assert disc_data["report_id"] == report_id
    assert "donor_view" in disc_data
    assert "public_view" in disc_data
    assert "internal_view" in disc_data
