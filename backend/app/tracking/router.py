from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.tracking.repository import get_logs_by_category, get_items_by_category

router = APIRouter(prefix="/tracking", tags=["tracking"])


@router.get("/items/{category}")
async def list_items_by_category(
    category: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    items = await get_items_by_category(db, category, current_user.id)
    return [
        {
            "id": str(item.id),
            "name": item.name,
            "config": item.config,
            "created_at": item.created_at.isoformat(),
        }
        for item in items
    ]


@router.get("/{category}")
async def list_by_category(
    category: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    logs = await get_logs_by_category(db, category, current_user.id)
    return [
        {
            "id": str(log.id),
            "value": log.value,
            "source": log.source,
            "logged_at": log.logged_at.isoformat(),
        }
        for log in logs
    ]