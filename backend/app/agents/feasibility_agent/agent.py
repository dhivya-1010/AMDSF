from typing import Optional
from datetime import datetime
from .models import FeasibilityAnalysisResult
from .analyzer import FeasibilityAnalyzer

class FeasibilityAgent:
    """Mission Feasibility Agent assessing Delta-V, vehicle lift, and budget constraints"""

    def __init__(self):
        self.name = "Mission Feasibility Agent"

    async def analyze(
        self,
        mission_id: Optional[str] = None,
        payload_mass: float = 250.0,
        target_orbit: float = 550.0,
        mission_duration: int = 365,
        budget: float = 50.0,
        launch_site: str = "Satish Dhawan Space Centre",
        launch_vehicle: str = "AUTO"
    ) -> FeasibilityAnalysisResult:
        result = FeasibilityAnalyzer.evaluate(
            payload_mass_kg=payload_mass,
            target_orbit_km=target_orbit,
            mission_duration_days=mission_duration,
            budget_m=budget,
            launch_site=launch_site,
            launch_vehicle_pref=launch_vehicle
        )
        result.mission_id = mission_id
        result.timestamp = datetime.utcnow().isoformat() + "Z"
        return result

feasibility_agent = FeasibilityAgent()
