from pydantic import BaseModel
from typing import List


class ClientCreate(BaseModel):
    name: str
    custom_guidelines: str | None = None
    ngo_profiles: List[str]
    dataset_topics: List[str]


class ClientResponse(BaseModel):
    id: str
    name: str
    custom_guidelines: str | None = None
    ngo_profiles: List[str]
    dataset_topics: List[str]

    class Config:
        orm_mode = True
