from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from app.core.database import get_db
from app.memory.models import RawCapture
from app.graph.models import Entity, Relationship
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.extraction.service import extract_specialist_text
from app.extraction.specialist_prompts import COACH_PROMPT

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def summary(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_captures = await db.scalar(
        select(func.count()).select_from(RawCapture).where(RawCapture.user_id == current_user.id)
    )
    total_entities = await db.scalar(
        select(func.count()).select_from(Entity).where(Entity.user_id == current_user.id)
    )
    total_relationships = await db.scalar(
        select(func.count()).select_from(Relationship).where(Relationship.user_id == current_user.id)
    )

    return {
        "total_captures": total_captures,
        "total_entities": total_entities,
        "total_relationships": total_relationships,
    }


@router.get("/history")
async def history(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(RawCapture)
        .where(RawCapture.user_id == current_user.id)
        .order_by(RawCapture.created_at.desc())
        .limit(20)
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


@router.get("/weekly")
async def weekly_analytics(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    this_week_result = await db.execute(
        select(func.count()).select_from(RawCapture).where(
            RawCapture.user_id == current_user.id, RawCapture.created_at >= week_ago
        )
    )
    this_week_count = this_week_result.scalar()

    last_week_result = await db.execute(
        select(func.count()).select_from(RawCapture).where(
            RawCapture.user_id == current_user.id,
            RawCapture.created_at >= two_weeks_ago,
            RawCapture.created_at < week_ago,
        )
    )
    last_week_count = last_week_result.scalar()

    if last_week_count > 0:
        change_percent = round(((this_week_count - last_week_count) / last_week_count) * 100)
    else:
        change_percent = 0

    daily_result = await db.execute(
        select(RawCapture.created_at).where(
            RawCapture.user_id == current_user.id, RawCapture.created_at >= week_ago
        )
    )
    all_dates = [row[0].date() for row in daily_result.all()]

    daily_counts = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        count = all_dates.count(day)
        daily_counts.append({"date": day.isoformat(), "count": count})

    streak = 0
    check_day = now.date()
    all_capture_dates_result = await db.execute(
        select(RawCapture.created_at).where(RawCapture.user_id == current_user.id)
    )
    all_capture_dates = set(row[0].date() for row in all_capture_dates_result.all())
    while check_day in all_capture_dates:
        streak += 1
        check_day -= timedelta(days=1)

    return {
        "this_week_count": this_week_count,
        "last_week_count": last_week_count,
        "change_percent": change_percent,
        "daily_activity": daily_counts,
        "streak": streak,
    }


async def _detect_pattern(db: AsyncSession, user_id) -> str | None:
    week_ago = datetime.utcnow() - timedelta(days=7)
    result = await db.execute(
        select(RawCapture.extracted).where(
            RawCapture.user_id == user_id, RawCapture.created_at >= week_ago
        )
    )
    rows = result.all()

    activity_counts: dict[str, int] = {}
    for (extracted,) in rows:
        if not extracted:
            continue
        for activity in extracted.get("activities", []):
            activity_counts[activity] = activity_counts.get(activity, 0) + 1

    if not activity_counts:
        return None

    top_activity, count = max(activity_counts.items(), key=lambda x: x[1])
    if count < 2:
        return None

    return f"فعالیت '{top_activity}' این هفته {count} بار در ثبت‌های صوتی تکرار شده."


@router.get("/coach")
async def coach_insight(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    pattern = await _detect_pattern(db, current_user.id)
    if not pattern:
        return {"insight": "هنوز داده کافی برای پیدا کردن الگو نداریم. بیشتر ثبت کن!"}

    prompt = COACH_PROMPT.format(pattern=pattern)
    result = await extract_specialist_text(prompt)
    return {"insight": result}