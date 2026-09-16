from .models import CoverageAnalysisResult
from .analyzer import CoverageAnalyzer

class CoverageAgent:
    """Coverage Intelligence Agent evaluating footprint, swath, and population access"""

    def __init__(self):
        self.name = "Coverage Intelligence Agent"

    async def analyze(
        self,
        target_country: str = "India",
        target_region: str = "Tamil Nadu",
        target_area: str = "Chennai Metropolitan Region",
        latitude: float = 13.0827,
        longitude: float = 80.2707,
        coverage_requirement: float = 80.0,
        coverage_radius_km: float = 100.0,
        target_orbit_km: float = 550.0,
        inclination_deg: float = 97.6,
        mission_duration: int = 365,
        objective_type: str = "EARTH_OBSERVATION"
    ) -> CoverageAnalysisResult:
        return CoverageAnalyzer.evaluate(
            target_country=target_country,
            target_region=target_region,
            target_area=target_area,
            latitude=latitude,
            longitude=longitude,
            coverage_requirement=coverage_requirement,
            coverage_radius_km=coverage_radius_km,
            target_orbit_km=target_orbit_km,
            inclination_deg=inclination_deg,
            mission_duration=mission_duration,
            objective_type=objective_type
        )

coverage_agent = CoverageAgent()
