import tempfile
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.capture.storage import save_audio
from app.stt.service import transcribe
from app.extraction.service import extract, extract_specialist
from app.extraction.category_router import detect_categories
from app.extraction.specialist_prompts import GOAL_PROMPT, EXERCISE_PROMPT, MEDICATION_PROMPT, FINANCE_PROMPT, FINANCE_SMS_PROMPT
from app.core.database import get_db
from app.memory.repository import save_capture
from app.graph.repository import get_or_create_entity, get_or_create_self, create_relationship
from app.tracking.repository import get_or_create_item, create_log
from app.auth.dependencies import get_current_user
from app.auth.models import User

router = APIRouter(prefix="/capture", tags=["capture"])


@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suffix = os.path.splitext(file.filename)[1]
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(await file.read())

    object_name = f"{uuid.uuid4()}{suffix}"
    save_audio(tmp_path, object_name)
    text = transcribe(tmp_path)
    os.remove(tmp_path)

    extracted_data = await extract(text)
    record = await save_capture(db, object_name, text, extracted_data, current_user.id)

    self_entity = await get_or_create_self(db, current_user.id)
    for person_name in extracted_data.get("people", []):
        person_entity = await get_or_create_entity(db, name=person_name, user_id=current_user.id, entity_type="person")
        await create_relationship(db, self_entity.id, person_entity.id, relation_type="mentioned_with", user_id=current_user.id)
    categories = await detect_categories(text)

    if "goal" in categories:
        goal_data = await extract_specialist(text, GOAL_PROMPT)
        if goal_data.get("goal_name"):
            item = await get_or_create_item(db, name=goal_data["goal_name"], category="goal", user_id=current_user.id)
            await create_log(db, category="goal", value=goal_data, user_id=current_user.id, item_id=item.id)

    if "exercise" in categories:
        exercise_data = await extract_specialist(text, EXERCISE_PROMPT)
        if exercise_data.get("exercise_name"):
            item = await get_or_create_item(db, name=exercise_data["exercise_name"], category="exercise", user_id=current_user.id)
            await create_log(db, category="exercise", value=exercise_data, user_id=current_user.id, item_id=item.id)

    if "medication" in categories:
        med_data = await extract_specialist(text, MEDICATION_PROMPT)
        if med_data.get("medication_name"):
            item = await get_or_create_item(db, name=med_data["medication_name"], category="medication", user_id=current_user.id)
            await create_log(db, category="medication", value=med_data, user_id=current_user.id, item_id=item.id)

    if "finance" in categories:
        finance_data = await extract_specialist(text, FINANCE_PROMPT)
        if finance_data.get("item_name"):
            item = await get_or_create_item(db, name=finance_data["item_name"], category="finance", user_id=current_user.id)
            await create_log(db, category="finance", value=finance_data, user_id=current_user.id, item_id=item.id)

    return {
        "id": str(record.id),
        "object_name": object_name,
        "transcript": text,
        "extracted": extracted_data,
        "categories": categories,
    }


@router.post("/sms")
async def upload_sms(
    text: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    finance_data = await extract_specialist(text, FINANCE_SMS_PROMPT)
    if finance_data.get("item_name"):
        item = await get_or_create_item(db, name=finance_data["item_name"], category="finance", user_id=current_user.id)
        await create_log(db, category="finance", value=finance_data, user_id=current_user.id, source="sms", item_id=item.id)
        return {"success": True, "extracted": finance_data}
    return {"success": False, "extracted": finance_data}