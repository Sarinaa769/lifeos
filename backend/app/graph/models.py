from sqlalchemy import ForeignKey
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


class Entity(Base):
    __tablename__ = "entities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    entity_type = Column(String, nullable=False)  # person | project | company | goal
    name = Column(String, nullable=False)
    attributes = Column(JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    source_entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
    target_entity_id = Column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
    relation_type = Column(String, nullable=False)  # met_with | works_on | belongs_to ...
    created_at = Column(DateTime, default=datetime.utcnow)