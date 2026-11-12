from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.core.logging import logger

app = FastAPI(
    title=settings.PROJECT_TITLE,
    description="Agentic Multi-Domain Space Mission Decision Support Framework Modular Backend",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)


def _health_payload() -> dict:
    cache_dir = Path(settings.CACHE_DIR)
    data_dir = Path(settings.DATA_DIR)
    return {
        "framework": settings.PROJECT_NAME,
        "title": settings.PROJECT_TITLE,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "api_docs": "/docs",
        "sources": {
            "celestrak_cache_ready": any(cache_dir.glob("celestrak_*.json")) if cache_dir.exists() else False,
            "swpc_cache_ready": (cache_dir / "swpc_cache.json").exists(),
            "donki_cache_ready": (cache_dir / "donki_cache.json").exists(),
            "nasa_api_key_configured": bool(settings.NASA_API_KEY and settings.NASA_API_KEY != "DEMO_KEY"),
            "demo_datasets_ready": (
                (data_dir / "demo_celestrak_omm.json").exists()
                and (data_dir / "demo_space_weather.json").exists()
            ),
        },
    }


@app.get("/", tags=["Health"])
def health_check():
    return _health_payload()


@app.get(f"{settings.API_PREFIX}/health", tags=["Health"])
def api_health_check():
    return _health_payload()


logger.info(f"AMDSF Modular Backend Initialized (Version: {settings.VERSION})")
