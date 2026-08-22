import tempfile
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.capture.storage import save_audio
from app.stt.service import transcribe
from app.extraction.service import extract
from app.core.database import get_db
from app.memory.repository import save_capture
from app.graph.repository import get_or_create_entity, get_or_create_self, create_relationship

router = APIRouter(prefix="/capture", tags=["capture"])


@router.post("/audio")
async def upload_audio(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    suffix = os.path.splitext(file.filename)[1]
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(await file.read())

    object_name = f"{uuid.uuid4()}{suffix}"
    save_audio(tmp_path, object_name)
    text = transcribe(tmp_path)
    os.remove(tmp_path)

    extracted_data = await extract(text)
    record = await save_capture(db, object_name, text, extracted_data)

    self_entity = await get_or_create_self(db)
    for person_name in extracted_data.get("people", []):
        person_entity = await get_or_create_entity(db, name=person_name, entity_type="person")
        await create_relationship(db, self_entity.id, person_entity.id, relation_type="mentioned_with")

    return {
        "id": str(record.id),
        "object_name": object_name,
        "transcript": text,
        "extracted": extracted_data,
    }