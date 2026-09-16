from app.services.donki_service import donki_service
from app.services.swpc_service import swpc_service
from .models import WeatherAnalysisResult
from .analyzer import WeatherAnalyzer

class WeatherAgent:
    """Space Weather Intelligence Agent interpreting heliophysics data"""

    def __init__(self):
        self.name = "Space Weather Intelligence Agent"

    async def analyze(self) -> WeatherAnalysisResult:
        # Fetch external real-time data through services
        swpc_data = await swpc_service.get_planetary_k_index()
        donki_data = await donki_service.get_recent_cme_events()
        # Perform domain interpretation
        return WeatherAnalyzer.evaluate(swpc_data, donki_data)

weather_agent = WeatherAgent()
