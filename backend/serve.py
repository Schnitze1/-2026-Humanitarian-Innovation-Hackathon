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

# Configure allowed origins for CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    :param request: Incoming FastAPI request object.
    :param exc: HTTPException instance.
    :return: JSONResponse with error details.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail if isinstance(exc.detail, str) else str(exc.detail)},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    :param request: Incoming FastAPI request object.
    :param exc: RequestValidationError instance.
    :return: JSONResponse containing validation details.
    """
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )


@app.get("/health")
def health():
    """
    :return: Dict containing health status.
    """
    return {"status": "ok"}


@app.post("/api/ingest", response_model=IngestResponse, tags=["Ingestion"])
async def ingest(file: UploadFile = File(...), program_name: str = "default"):
    """
    :param file: Uploaded source file.
    :param program_name: Name of the project or context category.
    :return: IngestResponse containing source_id and count of indexed chunks.
    """
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
    """
    :param source_id: Source ID of the ingested reference document.
    :param payload: DraftRequest payload containing report type and audience.
    :return: DraftResponse containing the drafted report content and spans.
    """
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
    """
    :param report_id: ID of the generated report.
    :return: ProvenanceResponse containing list of spans and their source chunks.
    """
    try:
        provenance_data = get_provenance_log(report_id)
        return ProvenanceResponse(**provenance_data)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Report ID {report_id} does not exist")


@app.post("/api/consistency-check/{report_id}", response_model=ConsistencyResponse, tags=["Consistency"])
def check_consistency(report_id: str):
    """
    :param report_id: ID of the report to check.
    :return: ConsistencyResponse with consistency status and list of flags.
    """
    try:
        check_results = run_consistency_check(report_id)
        return ConsistencyResponse(**check_results)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Report ID {report_id} does not exist")


@app.get("/api/disclosure/{report_id}", response_model=DisclosureResponse, tags=["Disclosure"])
def get_disclosure(report_id: str):
    """
    :param report_id: ID of the report.
    :return: DisclosureResponse containing the three view templates.
    """
    try:
        disclosure_data = generate_disclosure_views(report_id)
        return DisclosureResponse(**disclosure_data)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Report ID {report_id} does not exist")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("serve:app", host="127.0.0.1", port=8000, reload=True)
