from typing import Dict, Any
from app.services.celestrak_service import celestrak_service
from app.services.leolabs_service import leolabs_service
from .models import DebrisAnalysisResult
from .analyzer import DebrisAnalyzer

class DebrisAgent:
    """Orbital Debris Intelligence Agent coordinating Space Situational Awareness"""

    def __init__(self):
        self.name = "Orbital Debris Intelligence Agent"

    async def analyze(self, target_orbit_km: float) -> DebrisAnalysisResult:
        # Retrieve external catalog data via dedicated service
        catalog_data = await celestrak_service.get_active_satellites_sample()
        # Analyze and evaluate
        result = DebrisAnalyzer.evaluate(target_orbit_km=target_orbit_km, catalog_data=catalog_data)
        return result

debris_agent = DebrisAgent()
