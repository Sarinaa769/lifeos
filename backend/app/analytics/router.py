from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.memory.models import RawCapture
from app.graph.models import Entity, Relationship
from app.extraction.service import extract_specialist_text
from app.extraction.specialist_prompts import COACH_PROMPT
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
@router.get("/weekly")
async def weekly_analytics(db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    # تعداد این هفته
    this_week_result = await db.execute(
        select(func.count()).select_from(RawCapture).where(RawCapture.created_at >= week_ago)
    )
    this_week_count = this_week_result.scalar()

    # تعداد هفته قبل
    last_week_result = await db.execute(
        select(func.count()).select_from(RawCapture).where(
            RawCapture.created_at >= two_weeks_ago, RawCapture.created_at < week_ago
        )
    )
    last_week_count = last_week_result.scalar()

    # درصد تغییر
    if last_week_count > 0:
        change_percent = round(((this_week_count - last_week_count) / last_week_count) * 100)
    else:
        change_percent = 0

    # فعالیت روزانه ۷ روز اخیر
    daily_result = await db.execute(
        select(RawCapture.created_at).where(RawCapture.created_at >= week_ago)
    )
    all_dates = [row[0].date() for row in daily_result.all()]

    daily_counts = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        count = all_dates.count(day)
        daily_counts.append({"date": day.isoformat(), "count": count})

    # زنجیره پیوستگی (streak) - چند روز پیاپی حداقل یه ثبت داشته
    streak = 0
    check_day = now.date()
    all_capture_dates_result = await db.execute(select(RawCapture.created_at))
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


@router.get("/coach")
async def coach_insight(db: AsyncSession = Depends(get_db)):
    pattern = await _detect_pattern(db)
    if not pattern:
        return {"insight": "هنوز داده کافی برای پیدا کردن الگو نداریم. بیشتر ثبت کن!"}

    prompt = COACH_PROMPT.format(pattern=pattern)
    result = await extract_specialist_text(prompt)
    return {"insight": result}