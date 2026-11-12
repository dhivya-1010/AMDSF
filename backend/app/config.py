from pathlib import Path
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(__file__).resolve().parent / "data"
CACHE_DIR = DATA_DIR / "cache"


class Settings(BaseSettings):
    PROJECT_NAME: str = "AMDSF"
    PROJECT_TITLE: str = "Agentic Multi-Domain Space Mission Decision Support Framework"
    VERSION: str = "1.1.0"
    API_PREFIX: str = "/api"

    # External API Keys (configured in .env)
    NASA_API_KEY: Optional[str] = Field(default="DEMO_KEY")
    LEOLABS_API_KEY: Optional[str] = Field(default=None)

    # External Endpoints
    DONKI_BASE_URL: str = "https://api.nasa.gov/DONKI"
    DONKI_CCMC_FALLBACK_URL: str = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get"
    SWPC_BASE_URL: str = "https://services.swpc.noaa.gov"
    CELESTRAK_BASE_URL: str = "https://celestrak.org"
    WORLDPOP_API_URL: str = "https://api.worldpop.org/v1/services/stats"

    # Operational configuration
    REQUEST_TIMEOUT_SECONDS: float = 8.0
    HTTP_MAX_RETRIES: int = 2
    ALLOW_ORIGINS: List[str] = ["*"]

    # Debris & orbital propagation settings
    DEBRIS_PROPAGATION_INTERVAL_MINUTES: int = 90
    DEBRIS_PROPAGATION_STEP_SECONDS: int = 60
    DEBRIS_SCREENING_DISTANCE_KM: float = 25.0
    DEBRIS_MAX_CATALOG_OBJECTS: int = 2000
    DEBRIS_MAX_TLE_AGE_DAYS: int = 7
    DEBRIS_MAX_CACHE_AGE_HOURS: float = 24.0
    DEBRIS_TCA_REFINEMENT_TOLERANCE_SECONDS: float = 1.0
    DEBRIS_ALTITUDE_BAND_KM: float = 150.0
    DEBRIS_CATALOG_GROUPS: List[str] = [
        "active",
        "cosmos-1408-debris",
        "fengyun-1c-debris",
        "iridium-33-debris",
        "cosmos-2251-debris",
    ]

    # Weather cache settings
    WEATHER_MAX_CACHE_AGE_HOURS: float = 6.0

    # Coverage defaults (explicitly marked as demonstration model when user omits specs)
    COVERAGE_DEFAULT_DEMO_FOV_DEG: float = 45.0
    COVERAGE_DEFAULT_MIN_ELEVATION_DEG: float = 10.0
    COVERAGE_DEFAULT_DURATION_HOURS: float = 24.0
    COVERAGE_DEFAULT_STEP_SECONDS: int = 60

    # Orchestrator policy when non-blocking domain data is unavailable: CONDITIONAL_GO or HOLD
    ORCHESTRATOR_MISSING_DATA_POLICY: str = "CONDITIONAL_GO"

    # Paths
    DATA_DIR: str = str(DATA_DIR)
    CACHE_DIR: str = str(CACHE_DIR)

    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), ".env"),
        extra="ignore",
    )


settings = Settings()
