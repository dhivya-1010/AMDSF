import asyncio
from datetime import datetime, timezone
from typing import Optional

from app.services.donki_service import donki_service
from app.services.swpc_service import swpc_service
from .analyzer import WeatherAnalyzer
from .models import WeatherAnalysisResult


class WeatherAgent:
    """Space Weather Intelligence Agent interpreting NOAA SWPC and NASA DONKI telemetry."""

    def __init__(self):
        self.name = "Space Weather Intelligence Agent"

    async def analyze(
        self,
        mission_id: Optional[str] = None,
        preferred_date: str = "2026-10-15",
        flexibility_days: int = 3,
        launch_site: str = "Satish Dhawan Space Centre",
        target_orbit_km: float = 550.0,
        data_mode: str = "auto",
    ) -> WeatherAnalysisResult:
        swpc_data, donki_data = await asyncio.gather(
            swpc_service.get_planetary_k_index(data_mode=data_mode),
            donki_service.get_recent_cme_events(days=7, data_mode=data_mode),
        )

        result = WeatherAnalyzer.evaluate(swpc_data, donki_data, target_orbit_km=target_orbit_km)
        result.mission_id = mission_id
        result.timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        return result


weather_agent = WeatherAgent()
