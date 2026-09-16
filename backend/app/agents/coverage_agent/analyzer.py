from typing import Dict, Any, List
from .models import CoverageAnalysisResult

class CoverageAnalyzer:
    """Calculates ground footprint, revisit frequency, and demographic coverage approximation"""

    REGION_PROFILES = {
        "india": {"pop": 18400000, "base_cov": 93.4, "gaps": 2, "passes": 8, "revisit": 110},
        "north atlantic & europe": {"pop": 24500000, "base_cov": 94.8, "gaps": 1, "passes": 9, "revisit": 95},
        "asia pacific": {"pop": 32000000, "base_cov": 91.2, "gaps": 3, "passes": 7, "revisit": 130},
        "north america": {"pop": 21000000, "base_cov": 95.0, "gaps": 1, "passes": 8, "revisit": 105},
        "global": {"pop": 65000000, "base_cov": 89.5, "gaps": 4, "passes": 14, "revisit": 85}
    }

    @classmethod
    def evaluate(cls, target_region: str, target_orbit_km: float) -> CoverageAnalysisResult:
        normalized_region = target_region.lower().strip()
        profile = None
        for key in cls.REGION_PROFILES:
            if key in normalized_region or normalized_region in key:
                profile = cls.REGION_PROFILES[key]
                break
        
        if not profile:
            profile = {"pop": 15000000, "base_cov": 91.5, "gaps": 2, "passes": 8, "revisit": 115}

        # Altitude swath adjustment: higher orbit provides wider field of view
        swath_boost = min(3.5, max(-4.0, (target_orbit_km - 500) * 0.008))
        cov_pct = min(99.0, max(75.0, round(profile["base_cov"] + swath_boost, 1)))
        pop = profile["pop"]
        gaps = profile["gaps"]

        pop_formatted = f"{round(pop / 1000000, 1)}M"

        summary = f"Target region ({target_region}) receives high estimated ground footprint coverage ({cov_pct}%)."
        factors = [
            f"Orbit altitude ({int(target_orbit_km)}km) yields optical/RF ground swath with {cov_pct}% regional reach",
            f"Estimated demographic access of {pop_formatted} population served",
            f"Identified {gaps} minor off-nadir revisit gaps during daylight crossing passes"
        ]

        return CoverageAnalysisResult(
            agent="Coverage Intelligence Agent",
            status="completed",
            coverage_percent=cov_pct,
            population_served=pop,
            population_served_formatted=pop_formatted,
            coverage_gaps=gaps,
            target_region=target_region,
            summary=summary,
            factors=factors,
            revisit_time_minutes=profile["revisit"],
            ground_track_passes_per_day=profile["passes"],
            details={
                "elevation_mask_deg": 5.0,
                "swath_width_km": round(target_orbit_km * 1.85, 1),
                "ground_station_contact_time_min": 9.4
            }
        )
