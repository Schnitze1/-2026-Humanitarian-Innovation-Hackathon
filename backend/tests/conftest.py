import sys
import pytest
import shutil
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

@pytest.fixture(scope="session", autouse=True)
def override_storage():
    # Force mock directory configurations for test execution
    import config
    temp_dir = Path(__file__).resolve().parent / "temp_storage"
    shutil.rmtree(temp_dir, ignore_errors=True)
    temp_dir.mkdir(parents=True, exist_ok=True)

    config.index_dir = temp_dir / "indexed_sources"
    config.reports_dir = temp_dir / "reports"
    config.provenance_dir = temp_dir / "provenance_logs"

    config.index_dir.mkdir(exist_ok=True)
    config.reports_dir.mkdir(exist_ok=True)
    config.provenance_dir.mkdir(exist_ok=True)

    yield

    shutil.rmtree(temp_dir, ignore_errors=True)
