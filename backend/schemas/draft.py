from pydantic import BaseModel
from typing import List


class DraftRequest(BaseModel):
    report_type: str
    audience: str


class Span(BaseModel):
    span_id: str
    text: str
    source_chunk: str


class DraftResponse(BaseModel):
    report_id: str
    content: str
    spans: List[Span]


class ProvenanceResponse(BaseModel):
    report_id: str
    spans: List[Span]
