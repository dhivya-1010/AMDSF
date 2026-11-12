from datetime import datetime, timezone
from typing import Optional
from .analyzer import FeasibilityAnalyzer
from .models import FeasibilityAnalysisResult


class FeasibilityAgent:
    """Mission Feasibility Agent assessing orbital mechanics, vehicle lift, engineering limits, and lifecycle cost."""

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
        launch_site_code: Optional[str] = None,
        launch_vehicle: str = "AUTO",
        inclination_deg: float = 97.6,
        satellite_manufacturing_cost_musd: Optional[float] = None,
        launch_cost_musd: Optional[float] = None,
        annual_operations_cost_musd: Optional[float] = None,
    ) -> FeasibilityAnalysisResult:
        result = FeasibilityAnalyzer.evaluate(
            payload_mass_kg=payload_mass,
            target_orbit_km=target_orbit,
            mission_duration_days=mission_duration,
            budget_m=budget,
            launch_site=launch_site,
            launch_site_code=launch_site_code,
            launch_vehicle_pref=launch_vehicle,
            inclination_deg=inclination_deg,
            satellite_manufacturing_cost_musd=satellite_manufacturing_cost_musd,
            launch_cost_musd=launch_cost_musd,
            annual_operations_cost_musd=annual_operations_cost_musd,
        )
        result.mission_id = mission_id
        result.timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        return result


feasibility_agent = FeasibilityAgent()
