from pydantic import BaseModel


class IngestResponse(BaseModel):
    source_id: str
    chunks_indexed: int
