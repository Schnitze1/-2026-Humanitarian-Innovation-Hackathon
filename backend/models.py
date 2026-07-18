import uuid
import json
from sqlalchemy import Column, String, ForeignKey, Text
from database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    custom_guidelines = Column(Text, nullable=True)
    ngo_profiles = Column(Text, nullable=False, default="[]")
    dataset_topics = Column(Text, nullable=False, default="[]")

    def get_profiles(self):
        return json.loads(self.ngo_profiles)

    def get_topics(self):
        return json.loads(self.dataset_topics)


class Dataset(Base):
    __tablename__ = "datasets"

    source_id = Column(String, primary_key=True)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    dataset_topic = Column(String, nullable=False)
