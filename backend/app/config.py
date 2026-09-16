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

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
