from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.tracking.models import TrackableItem, TrackableLog


async def get_or_create_item(db: AsyncSession, name: str, category: str, user_id) -> TrackableItem:
    result = await db.execute(
        select(TrackableItem).where(
            TrackableItem.name == name,
            TrackableItem.category == category,
            TrackableItem.user_id == user_id,
        )
    )
    item = result.scalar_one_or_none()
    if item:
        return item

    item = TrackableItem(name=name, category=category, user_id=user_id)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def create_log(
    db: AsyncSession, category: str, value: dict, user_id, source: str = "voice", item_id=None
) -> TrackableLog:
    log = TrackableLog(
        item_id=item_id, category=category, value=value, source=source, user_id=user_id
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_logs_by_category(db: AsyncSession, category: str, user_id, limit: int = 20):
    result = await db.execute(
        select(TrackableLog)
        .where(TrackableLog.category == category, TrackableLog.user_id == user_id)
        .order_by(TrackableLog.logged_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def get_items_by_category(db: AsyncSession, category: str, user_id):
    result = await db.execute(
        select(TrackableItem).where(
            TrackableItem.category == category, TrackableItem.user_id == user_id
        )
    )
    return result.scalars().all()