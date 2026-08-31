from app.tracking.repository import get_logs_by_category, get_items_by_category
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.tracking.repository import get_logs_by_category

router = APIRouter(prefix="/tracking", tags=["tracking"])


@router.get("/{category}")
async def list_by_category(category: str, db: AsyncSession = Depends(get_db)):
    logs = await get_logs_by_category(db, category)
    return [
        {
            "id": str(log.id),
            "value": log.value,
            "source": log.source,
            "logged_at": log.logged_at.isoformat(),
        }
        for log in logs
    ]
@router.get("/items/{category}")
async def list_items_by_category(category: str, db: AsyncSession = Depends(get_db)):
    items = await get_items_by_category(db, category)
    return [
        {
            "id": str(item.id),
            "name": item.name,
            "config": item.config,
            "created_at": item.created_at.isoformat(),
        }
        for item in items
    ]