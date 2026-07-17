import os
from pathlib import Path

# Global Paths
base_dir = Path(__file__).resolve().parent
storage_dir = base_dir / "storage"
reports_dir = storage_dir / "reports"
provenance_dir = storage_dir / "provenance_logs"
index_dir = storage_dir / "indexed_sources"

for directory in [reports_dir, provenance_dir, index_dir]:
    directory.mkdir(parents=True, exist_ok=True)

embed_model_name = "sentence-transformers/all-MiniLM-L6-v2"
offline_llm_name = "HuggingFaceTB/SmolLM2-135M-Instruct"

cache_dir = base_dir / ".cache"
cache_dir.mkdir(parents=True, exist_ok=True)

consistency_threshold = 0.6
