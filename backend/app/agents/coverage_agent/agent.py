from .models import CoverageAnalysisResult
from .analyzer import CoverageAnalyzer

class CoverageAgent:
    """Coverage Intelligence Agent evaluating footprint, swath, and population access"""

    def __init__(self):
        self.name = "Coverage Intelligence Agent"

    async def analyze(self, target_region: str, target_orbit_km: float) -> CoverageAnalysisResult:
        return CoverageAnalyzer.evaluate(
            target_region=target_region,
            target_orbit_km=target_orbit_km
        )

coverage_agent = CoverageAgent()
