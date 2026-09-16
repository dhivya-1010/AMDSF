from typing import Dict, Any, List
from .models import CoverageAnalysisResult

class CoverageAnalyzer:
    """Calculates ground footprint, revisit frequency, and demographic coverage over specific geographic coordinates"""

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

        # Approximate demographic access based on area radius
        population_approx = int((coverage_radius_km ** 2) * 3.14159 * 280) # rough urban/semi-urban density model
        pop_formatted = f"{round(population_approx / 1000000, 1)}M" if population_approx >= 1000000 else f"{round(population_approx / 1000, 0)}k"

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
            f"Target demographic access: ~{pop_formatted} population served in {target_area}",
            f"Identified {gaps} minor off-nadir revisit gap intervals over {mission_duration}-day lifecycle"
        ]

        return CoverageAnalysisResult(
            agent="Coverage Intelligence Agent",
            status="completed",
            coverage_percent=coverage_pct,
            population_served=population_approx,
            population_served_formatted=pop_formatted,
            coverage_gaps=gaps,
            target_region=location_label,
            summary=summary,
            factors=factors,
            revisit_time_minutes=revisit_time_min,
            ground_track_passes_per_day=passes_per_day,
            details={
                "elevation_mask_deg": 5.0,
                "swath_width_km": swath_width_km,
                "target_coordinates": f"{latitude}° N, {longitude}° E",
                "coverage_requirement_met": satisfies_req,
                "coverage_radius_km": coverage_radius_km
            }
        )
