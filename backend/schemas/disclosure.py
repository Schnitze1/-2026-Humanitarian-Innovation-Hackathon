from pydantic import BaseModel
from typing import List, Optional


class ConsistencyFlag(BaseModel):
    span_id: str
    issue: str
    claim: str
    source_value: Optional[str] = None


class ConsistencyResponse(BaseModel):
    report_id: str
    consistent: bool
    flags: List[ConsistencyFlag]


class DisclosureResponse(BaseModel):
    report_id: str
    donor_view: str
    public_view: str
    internal_view: str
