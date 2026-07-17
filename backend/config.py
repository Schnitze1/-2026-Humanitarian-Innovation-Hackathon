import os
from pathlib import Path

# Global Paths
BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"
REPORTS_DIR = STORAGE_DIR / "reports"
PROVENANCE_DIR = STORAGE_DIR / "provenance_logs"
INDEX_DIR = STORAGE_DIR / "indexed_sources"

# Check directories exist
for directory in [REPORTS_DIR, PROVENANCE_DIR, INDEX_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Direct for ML Models
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
OFFLINE_LLM_NAME = "HuggingFaceTB/SmolLM2-135M-Instruct"

# Setup Local cache for offline models
CACHE_DIR = BASE_DIR / ".cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Set thresholds - TMP Value will fine-tune later..
CONSISTENCY_THRESHOLD = 0.6
