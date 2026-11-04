import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AMDSF"
    PROJECT_TITLE: str = "Agentic Multi-Domain Space Mission Decision Support Framework"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # External API Keys (configured in .env)
    NASA_API_KEY: Optional[str] = os.getenv("NASA_API_KEY", "DEMO_KEY")
    LEOLABS_API_KEY: Optional[str] = os.getenv("LEOLABS_API_KEY", None)
    
    # External Endpoints
    DONKI_BASE_URL: str = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get"
    SWPC_BASE_URL: str = "https://services.swpc.noaa.gov"
    CELESTRAK_BASE_URL: str = "https://celestrak.org"
    
    # Operational configuration
    REQUEST_TIMEOUT_SECONDS: float = 6.0
    ALLOW_ORIGINS: list[str] = ["*"]
    DEBRIS_PROPAGATION_INTERVAL_MINUTES: int = 90
    DEBRIS_PROPAGATION_STEP_SECONDS: int = 60
    DEBRIS_SCREENING_DISTANCE_KM: float = 25.0
    DEBRIS_MAX_CATALOG_OBJECTS: int = 2000
    DEBRIS_MAX_TLE_AGE_DAYS: int = 7

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
