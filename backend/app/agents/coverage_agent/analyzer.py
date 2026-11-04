from typing import Dict, Any, List
from .models import CoverageAnalysisResult

class CoverageAnalyzer:
    """Produces a deterministic swath prototype estimate, not validated access geometry."""

    @classmethod
    def evaluate(
        cls,
        target_country: str,
        target_region: str,
        target_area: str,
        latitude: float,
        longitude: float,
        coverage_requirement: float,
        coverage_radius_km: float,
        target_orbit_km: float,
        inclination_deg: float,
        mission_duration: int,
        objective_type: str
    ) -> CoverageAnalysisResult:
        
        # Ground swath calculation based on orbit altitude and inclination
        swath_width_km = round(target_orbit_km * 1.85, 1)
        
        # Swath overlap against coverage radius
        coverage_ratio = min(1.0, (swath_width_km / max(50.0, coverage_radius_km * 2.0)))
        base_coverage = 85.0 + (coverage_ratio * 12.0)
        
        # Adjust for latitude geometry (higher inclinations cover polar/high latitudes more frequently)
        lat_factor = abs(latitude) / 90.0
        if inclination_deg >= 90.0:  # Retrograde / Polar / SSO
            geom_boost = 3.5
            revisit_time_min = max(75, int(120 - (lat_factor * 35)))
            passes_per_day = 8 + int(lat_factor * 6)
        else:
            geom_boost = 0.0
            revisit_time_min = max(90, int(135 - (lat_factor * 20)))
            passes_per_day = 7

        coverage_pct = min(99.4, max(65.0, round(base_coverage + geom_boost, 1)))

        gaps = 1 if coverage_pct >= 92.0 else (2 if coverage_pct >= 80.0 else 3)
        satisfies_req = coverage_pct >= coverage_requirement

        location_label = f"{target_area}, {target_region}, {target_country}"

        summary = (
            f"Target area '{location_label}' ({latitude}° N, {longitude}° E) achieves {coverage_pct}% estimated coverage, "
            f"{'satisfying' if satisfies_req else 'below'} the mission requirement ({coverage_requirement}%)."
        )

        factors = [
            f"Sensor swath width ({swath_width_km}km) covers {coverage_radius_km}km target radius with {coverage_pct}% area reach",
            f"Orbital period ({round(90 + target_orbit_km * 0.03, 1)} min) provides {passes_per_day} ground track passes per day over target",
            "Population reach is unavailable because no attributed population dataset is configured.",
            "Revisit events are unavailable because no orbit/sensor access propagator is configured."
        ]

        return CoverageAnalysisResult(
            agent="Coverage Intelligence Agent",
            status="prototype_estimate",
            coverage_percent=coverage_pct,
            population_served=None,
            population_served_formatted=None,
            coverage_gaps=gaps,
            target_region=location_label,
            summary=summary,
            factors=factors,
            revisit_time_minutes=None,
            ground_track_passes_per_day=passes_per_day,
            details={
                "data_status": "prototype_estimate",
                "validated_orbital_coverage": False,
                "population_data_status": "unavailable",
                "revisit_data_status": "unavailable",
                "formula": "coverage = clamp(85 + min(1, swath / max(50, 2 * radius)) * 12 + inclination_boost, 65, 99.4)",
                "elevation_mask_deg": 5.0,
                "swath_width_km": swath_width_km,
                "target_coordinates": f"{latitude}° N, {longitude}° E",
                "coverage_requirement_met": satisfies_req,
                "coverage_radius_km": coverage_radius_km
            }
        )
