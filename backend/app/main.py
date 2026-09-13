from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.capture.router import router as capture_router
from app.analytics.router import router as analytics_router
from app.tracking.router import router as tracking_router
from app.core.database import engine, Base
from app.memory import models  # noqa: F401 - registers the table
from app.graph import models as graph_models  # noqa: F401 - registers the tables
from app.tracking import models as tracking_models  # noqa: F401 - registers the tables
from app.auth import models as auth_models
from app.auth.router import router as auth_router

app = FastAPI(title="LifeOS")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(capture_router)
app.include_router(analytics_router)
app.include_router(tracking_router)
app.include_router(auth_router)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok"}