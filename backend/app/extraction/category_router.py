import httpx
from app.core.config import settings

CATEGORY_PROMPT = """این متن فارسی به کدوم دسته‌ها مربوطه؟ می‌تونه چند دسته باشه یا هیچ‌کدوم.
دسته‌ها: goal, medication, exercise, finance

فقط اسم دسته‌های مرتبط رو با کاما جدا کن، بدون توضیح. اگه به هیچ‌کدوم مربوط نبود، بنویس: none

متن: "{text}"
دسته‌ها:"""


async def detect_categories(text: str) -> list[str]:
    prompt = CATEGORY_PROMPT.format(text=text)
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.OLLAMA_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "keep_alive": "30m",
                "options": {"temperature": 0, "num_predict": 50},
            },
        )
        response.raise_for_status()
        raw = response.json()["response"].strip().lower()

    if "none" in raw:
        return []

    valid = {"goal", "medication", "exercise", "finance"}
    found = [cat.strip() for cat in raw.split(",") if cat.strip() in valid]
    return found