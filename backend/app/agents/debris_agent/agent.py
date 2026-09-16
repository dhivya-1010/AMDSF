from typing import Dict, Any, List, Optional
from datetime import datetime
from app.services.celestrak_service import celestrak_service
from app.services.leolabs_service import leolabs_service
from .models import DebrisAnalysisResult
from .analyzer import DebrisAnalyzer

class DebrisAgent:
    """Orbital Debris Intelligence Agent coordinating Space Situational Awareness"""

    def __init__(self):
        self.name = "Orbital Debris Intelligence Agent"

    async def analyze(
        self,
        mission_id: Optional[str] = None,
        target_orbit_km: float = 550.0,
        inclination_deg: float = 97.6,
        eccentricity: float = 0.0,
        mission_duration: int = 365,
        preferred_date: str = "2026-10-15",
        flexibility_days: int = 3
    ) -> DebrisAnalysisResult:
        # Retrieve external catalog data via dedicated service
        catalog_data = await celestrak_service.get_active_satellites_sample()
        # Analyze and evaluate
        result = DebrisAnalyzer.evaluate(
            target_orbit_km=target_orbit_km,
            catalog_data=catalog_data,
            inclination_deg=inclination_deg,
            mission_duration=mission_duration,
            preferred_date=preferred_date,
            flexibility_days=flexibility_days
        )
        result.mission_id = mission_id
        result.timestamp = datetime.utcnow().isoformat() + "Z"
        return result

debris_agent = DebrisAgent()
