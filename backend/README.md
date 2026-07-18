# Aiga Backend API

Python-based FastAPI backend for Aiga. It is responsible for handling source ingestion, retrieval-augmented generation (RAG), calculating semantic accuracy metrics, and rendering final HTML disclosure views.

## Core Services

- **Ingestion (`services/indexing.py`)**: Accepts `.csv`, `.md`, and `.txt` files. Automatically chunks and embeds documents using `sentence-transformers` for downstream RAG retrieval.
- **Generation & Validation (`services/generation.py`)**: Prompts the LLM with strict contextual constraints utilizing retrieved chunks. It calculates a definitive `Accuracy` score for each claim using a normalized Cosine Similarity metric to prevent hallucinations.
- **Client Registry (`api/clients`)**: Backed by PostgreSQL (via Docker), securely tracks NGO client profiles, dataset topics, and custom operational guidelines that are securely injected into system prompts.
- **Disclosure Rendering (`services/disclosure.py`)**: Server-side rendering of the Donor, Public, and Internal Audit HTML templates, complete with dynamic accuracy highlighting and provenance matrix injection.

## Project Structure

```
backend/
├── serve.py                       # FastAPI entry point
├── config.py                      # Application configuration (models, thresholds)
├── requirements.txt               # Dependencies
├── schemas/                       # Pydantic validation models
│   ├── ingest.py
│   ├── draft.py                   # Includes Accuracy Spans
│   └── disclosure.py
├── services/                      # Business logic modules
│   ├── indexing.py
│   ├── generation.py
│   ├── provenance.py
│   ├── consistency.py
│   └── disclosure.py
├── storage/                       # Local-first storage
│   ├── raw_sources/               # DVC tracked source documents
│   ├── reports/
│   └── provenance_logs/
```

## Running the Server

Make sure the PostgreSQL container is running before starting the FastAPI server:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
python serve.py
```

The API will be available at `http://127.0.0.1:8000`.
Check `http://127.0.0.1:8000/docs` for the interactive Swagger UI.
