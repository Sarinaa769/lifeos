from sqlalchemy import ForeignKey
import uuid
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class RawCapture(Base):
    __tablename__ = "raw_captures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    audio_object_name = Column(String, nullable=False)
    transcript = Column(Text, nullable=True)
    extracted = Column(JSONB, nullable=True)
    status = Column(String, default="transcribed")
    created_at = Column(DateTime, default=datetime.utcnow)