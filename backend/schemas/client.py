from pydantic import BaseModel
from typing import List

class ClientCreate(BaseModel):
    name: str
    ngo_profiles: List[str]
    dataset_topics: List[str]

class ClientResponse(BaseModel):
    id: str
    name: str
    ngo_profiles: List[str]
    dataset_topics: List[str]

    class Config:
        orm_mode = True
