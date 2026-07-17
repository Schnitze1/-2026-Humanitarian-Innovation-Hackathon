import os
import sys
from pathlib import Path
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add backend directory to python path if not present.
base_dir = Path(__file__).resolve().parent
if str(base_dir) not in sys.path:
    sys.path.append(str(base_dir))

# Import schemas.
from schemas.ingest import IngestResponse
from schemas.draft import DraftRequest, DraftResponse, ProvenanceResponse
from schemas.disclosure import ConsistencyResponse, DisclosureResponse

# Import services.
from services.indexing import ingest_document
from services.generation import generate_report
from services.provenance import get_provenance_log
from services.consistency import run_consistency_check
from services.disclosure import generate_disclosure_views

app = FastAPI(title="Aiga API", version="1.0.0")

# Configure CORS.
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers matching reference repository style.
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with proper status codes."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail if isinstance(exc.detail, str) else str(exc.detail)},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with a consistent JSON format."""
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )


@app.get("/health")
def health():
    """Health check endpoint to verify API availability."""
    return {"status": "ok"}


@app.post("/api/ingest", response_model=IngestResponse, tags=["Ingestion"])
async def ingest(file: UploadFile = File(...), program_name: str = "default"):
    name = file.filename
    content = await file.read()

    if not content or len(content.strip()) == 0:
        raise HTTPException(status_code=422, detail="File content is empty or unprocessable")

    _, ext = os.path.splitext(name.lower())
    if ext not in [".txt", ".csv", ".md"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    try:
        source_id, chunks_count = ingest_document(content, name, program_name)
        return IngestResponse(
            source_id=source_id,
            chunks_indexed=chunks_count
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/draft/{source_id}", response_model=DraftResponse, tags=["Drafting"])
def draft_report(source_id: str, payload: DraftRequest):
    try:
        report_data = generate_report(
            source_id, payload.report_type, payload.audience)
        return DraftResponse(**report_data)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Source ID {source_id} does not exist")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@app.get("/api/provenance/{report_id}", response_model=ProvenanceResponse, tags=["Provenance"])
def get_provenance(report_id: str):
    try:
        provenance_data = get_provenance_log(report_id)
        return ProvenanceResponse(**provenance_data)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Report ID {report_id} does not exist")


@app.post("/api/consistency-check/{report_id}", response_model=ConsistencyResponse, tags=["Consistency"])
def check_consistency(report_id: str):
    try:
        check_results = run_consistency_check(report_id)
        return ConsistencyResponse(**check_results)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Report ID {report_id} does not exist")


@app.get("/api/disclosure/{report_id}", response_model=DisclosureResponse, tags=["Disclosure"])
def get_disclosure(report_id: str):
    try:
        disclosure_data = generate_disclosure_views(report_id)
        return DisclosureResponse(**disclosure_data)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Report ID {report_id} does not exist")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("serve:app", host="127.0.0.1", port=8000, reload=True)
