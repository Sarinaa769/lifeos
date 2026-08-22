import json
import re
import httpx
from app.core.config import settings
from app.extraction.prompts import EXTRACTION_PROMPT


def _clean_json_output(raw: str) -> dict:
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"No JSON found in model output: {raw}")
    json_str = raw[start:end + 1]
    return json.loads(json_str)


async def extract(text: str) -> dict:
    prompt = EXTRACTION_PROMPT.format(text=text)
    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            f"{settings.OLLAMA_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "think": False,
                "keep_alive": "30m",
                "options": {"temperature": 0, "num_predict": 600},
            },
        )
        response.raise_for_status()
        raw_output = response.json()["response"]

    return _clean_json_output(raw_output)