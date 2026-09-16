from .models import FeasibilityAnalysisResult
from .analyzer import FeasibilityAnalyzer

class FeasibilityAgent:
    """Mission Feasibility Agent assessing Delta-V, vehicle lift, and budget constraints"""

    def __init__(self):
        self.name = "Mission Feasibility Agent"

    async def analyze(self, payload_mass: float, target_orbit: float, mission_duration: int, budget: float) -> FeasibilityAnalysisResult:
        return FeasibilityAnalyzer.evaluate(
            payload_mass_kg=payload_mass,
            target_orbit_km=target_orbit,
            mission_duration_days=mission_duration,
            budget_m=budget
        )

feasibility_agent = FeasibilityAgent()
