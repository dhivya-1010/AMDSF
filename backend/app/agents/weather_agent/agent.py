from typing import Optional
from datetime import datetime
from app.services.donki_service import donki_service
from app.services.swpc_service import swpc_service
from .models import WeatherAnalysisResult
from .analyzer import WeatherAnalyzer

class WeatherAgent:
    """Space Weather Intelligence Agent interpreting heliophysics data"""

    def __init__(self):
        self.name = "Space Weather Intelligence Agent"

    async def analyze(
        self,
        mission_id: Optional[str] = None,
        preferred_date: str = "2026-10-15",
        flexibility_days: int = 3,
        launch_site: str = "Satish Dhawan Space Centre",
        target_orbit_km: float = 550.0
    ) -> WeatherAnalysisResult:
        # Fetch external real-time data through services
        swpc_data = await swpc_service.get_planetary_k_index()
        donki_data = await donki_service.get_recent_cme_events()
        # Perform domain interpretation
        result = WeatherAnalyzer.evaluate(swpc_data, donki_data)
        result.mission_id = mission_id
        result.timestamp = datetime.utcnow().isoformat() + "Z"
        return result

weather_agent = WeatherAgent()
