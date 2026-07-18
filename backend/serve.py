import os
import sys
from pathlib import Path
from fastapi import FastAPI, File, HTTPException, Request, UploadFile, Depends, Form
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import json

# Add backend directory to python path if not present.
base_dir = Path(__file__).resolve().parent
if str(base_dir) not in sys.path:
    sys.path.append(str(base_dir))

# Import schemas.
from schemas.ingest import IngestResponse
from schemas.draft import DraftRequest, DraftResponse, ProvenanceResponse
from schemas.disclosure import ConsistencyResponse, DisclosureResponse
from schemas.client import ClientCreate, ClientResponse
from database import engine, Base, get_db
from models import Client, Dataset
from sqlalchemy.orm import Session

# Import services.
from services.indexing import ingest_document
from services.generation import generate_report
from services.provenance import get_provenance_log
from services.consistency import run_consistency_check
from services.disclosure import generate_disclosure_views

app = FastAPI(title="Aiga API", version="1.0.0")

# Create tables
Base.metadata.create_all(bind=engine)

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
            "errors": jsonable_encoder(exc.errors()),
        },
    )


@app.get("/health")
def health():
    """
    :return: Dict containing health status.
    """
    return {"status": "ok"}


@app.post("/api/clients", response_model=ClientResponse, tags=["Clients"])
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    db_client = Client(
        name=client.name, 
        ngo_profiles=json.dumps(client.ngo_profiles), 
        dataset_topics=json.dumps(client.dataset_topics)
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return ClientResponse(
        id=db_client.id, 
        name=db_client.name, 
        ngo_profiles=db_client.get_profiles(), 
        dataset_topics=db_client.get_topics()
    )

@app.get("/api/clients/{client_id}", response_model=ClientResponse, tags=["Clients"])
def get_client(client_id: str, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return ClientResponse(
        id=db_client.id, 
        name=db_client.name, 
        ngo_profiles=db_client.get_profiles(), 
        dataset_topics=db_client.get_topics()
    )

@app.post("/api/ingest", response_model=IngestResponse, tags=["Ingestion"])
async def ingest(
    file: UploadFile = File(...), 
    program_name: str = "default",
    client_id: str = None,
    dataset_topic: str = None,
    db: Session = Depends(get_db)
):
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
        
        if client_id and dataset_topic:
            db_dataset = Dataset(source_id=source_id, client_id=client_id, dataset_topic=dataset_topic)
            db.add(db_dataset)
            db.commit()
            
        return IngestResponse(
            source_id=source_id,
            chunks_indexed=chunks_count
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/draft/{source_id}", response_model=DraftResponse, tags=["Drafting"])
def draft_report(source_id: str, payload: DraftRequest, db: Session = Depends(get_db)):
    """
    :param source_id: Source ID of the ingested reference document.
    :param payload: DraftRequest payload containing report type and audience.
    :return: DraftResponse containing the drafted report content and spans.
    """
    try:
        # Fetch Dataset details securely from DB
        dataset = db.query(Dataset).filter(Dataset.source_id == source_id).first()
        topic = dataset.dataset_topic if dataset else "General Context"
        
        ngo_profile_target = "general"
        if dataset:
            client = db.query(Client).filter(Client.id == dataset.client_id).first()
            if client:
                profiles = client.get_profiles()
                if payload.primary_profile and payload.primary_profile in profiles:
                    ngo_profile_target = payload.primary_profile
                elif profiles:
                    ngo_profile_target = profiles[0]

        report_data = generate_report(
            source_id, 
            payload.report_type, 
            payload.audience, 
            ngo_profile=ngo_profile_target,
            dataset_topic=topic
        )
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
