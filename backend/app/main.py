from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import datetime
from app.config import settings
from app.api.router import api_router
from app.core.logging import logger

app = FastAPI(
    title=settings.PROJECT_TITLE,
    description="Agentic Multi-Domain Space Mission Decision Support Framework Modular Backend",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular API routers under /api
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health"])
def health_check():
    return {
        "framework": settings.PROJECT_NAME,
        "title": settings.PROJECT_TITLE,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "api_docs": "/docs"
    }

logger.info(f"AMDSF Modular Backend Initialized (Version: {settings.VERSION})")
