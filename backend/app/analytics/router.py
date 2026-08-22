from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.memory.models import RawCapture
from app.graph.models import Entity, Relationship

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def summary(db: AsyncSession = Depends(get_db)):
    total_captures = await db.scalar(select(func.count()).select_from(RawCapture))
    total_entities = await db.scalar(select(func.count()).select_from(Entity))
    total_relationships = await db.scalar(select(func.count()).select_from(Relationship))

    return {
        "total_captures": total_captures,
        "total_entities": total_entities,
        "total_relationships": total_relationships,
    }


@router.get("/history")
async def history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RawCapture).order_by(RawCapture.created_at.desc()).limit(20)
    )
    captures = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "transcript": c.transcript,
            "extracted": c.extracted,
            "created_at": c.created_at.isoformat(),
        }
        for c in captures
    ]