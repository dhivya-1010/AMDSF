from typing import Any, Dict
from .models import DebrisAnalysisResult


class DebrisAnalyzer:
    """Classifies measured screening results; it never invents encounter data."""

    @staticmethod
    def evaluate(catalog_data: Dict[str, Any], encounters: list[dict], **context: Any) -> DebrisAnalysisResult:
        threshold = context.get("screening_distance_km", 25.0)
        closest = encounters[0] if encounters else None
        if closest is None:
            risk_level, risk_score = "INSUFFICIENT_DATA", None
        elif closest["minimum_separation_km"] <= 5:
            risk_level, risk_score = "HIGH", 1.0
        elif closest["minimum_separation_km"] <= threshold:
            risk_level, risk_score = "MEDIUM", 0.5
        else:
            risk_level, risk_score = "LOW", 0.1
        factors = [
            "Risk classification is derived from the closest measured propagated separation.",
            f"Configurable thresholds: HIGH <= 5 km; MEDIUM <= {threshold:g} km; LOW > {threshold:g} km.",
            "This is preliminary screening without covariance or collision probability assessment.",
        ]
        if not catalog_data.get("valid_tle_count"):
            factors.append("No valid TLE records were available for propagation.")
        return DebrisAnalysisResult(
            status="completed" if closest else "insufficient_data",
            objects_analyzed=catalog_data.get("valid_tle_count", 0),
            nearby_objects=len(encounters),
            risk_level=risk_level,
            risk_score=risk_score,
            data_source=catalog_data.get("source", "CelesTrak"),
            summary=("No conjunction screening result is available." if not closest else
                     f"Closest propagated approach is {closest['minimum_separation_km']:.3f} km."),
            factors=factors,
            orbital_objects=[{
                "name": item["name"], "norad_id": item["norad_id"],
                "distance_km": item["minimum_separation_km"],
                "relative_velocity_kms": item.get("relative_velocity_kms"),
                "risk": risk_level,
            } for item in encounters],
            details={
                "encounters": encounters,
                "screening_threshold_km": threshold,
                "propagation_interval_minutes": context.get("propagation_interval_minutes"),
                "propagation_step_seconds": context.get("propagation_step_seconds"),
                "coordinate_frame": "ITRS/ECEF derived from SGP4 TEME using Astropy.",
                "assessment_type": "preliminary_screening",
                "collision_probability": None,
                "data_freshness": catalog_data.get("retrieved_at"),
                "is_cached": catalog_data.get("is_cached", False),
                "stale_tle_count": catalog_data.get("stale_tle_count", 0),
                "invalid_tle_count": catalog_data.get("invalid_tle_count", 0),
                "future_tle_count": catalog_data.get("future_tle_count", 0),
                "catalog_propagated_object_count": catalog_data.get("catalog_propagated_object_count", 0),
                "cache_age_seconds": catalog_data.get("cache_age_seconds"),
                "data_status": "available" if closest else "insufficient_data",
            },
        )
