from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.tracking.models import TrackableItem, TrackableLog


async def get_or_create_item(db: AsyncSession, name: str, category: str) -> TrackableItem:
    result = await db.execute(
        select(TrackableItem).where(
            TrackableItem.name == name, TrackableItem.category == category
        )
    )
    item = result.scalar_one_or_none()
    if item:
        return item

    item = TrackableItem(name=name, category=category)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def create_log(
    db: AsyncSession, category: str, value: dict, source: str = "voice", item_id=None
) -> TrackableLog:
    log = TrackableLog(item_id=item_id, category=category, value=value, source=source)
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_logs_by_category(db: AsyncSession, category: str, limit: int = 20):
    result = await db.execute(
        select(TrackableLog)
        .where(TrackableLog.category == category)
        .order_by(TrackableLog.logged_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
from app.tracking.models import TrackableItem


async def get_items_by_category(db: AsyncSession, category: str):
    result = await db.execute(
        select(TrackableItem).where(TrackableItem.category == category)
    )
    return result.scalars().all()