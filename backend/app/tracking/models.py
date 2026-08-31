import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


class TrackableItem(Base):
    __tablename__ = "trackable_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String, nullable=False)  # goal | medication | exercise | finance
    name = Column(String, nullable=False)
    config = Column(JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class TrackableLog(Base):
    __tablename__ = "trackable_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), ForeignKey("trackable_items.id"), nullable=True)
    category = Column(String, nullable=False)
    value = Column(JSONB, default=dict)
    source = Column(String, default="voice")  # voice | photo | sms | manual
    logged_at = Column(DateTime, default=datetime.utcnow)