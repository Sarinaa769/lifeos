from sqlalchemy.ext.asyncio import AsyncSession
from app.memory.models import RawCapture


async def save_capture(db: AsyncSession, audio_object_name: str, transcript: str, extracted: dict, user_id) -> RawCapture:
    record = RawCapture(
        audio_object_name=audio_object_name,
        transcript=transcript,
        extracted=extracted,
        user_id=user_id,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record