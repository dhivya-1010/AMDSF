from typing import Any, Dict, List
from .models import DebrisAnalysisResult


def _classify_distance(distance_km: float, threshold_km: float) -> str:
    if distance_km <= 5.0:
        return "HIGH"
    if distance_km <= threshold_km:
        return "MEDIUM"
    return "LOW"


class DebrisAnalyzer:
    """Classifies measured screening results; never invents encounter data or collision probability."""

    @staticmethod
    def evaluate(catalog_data: Dict[str, Any], encounters: List[dict], **context: Any) -> DebrisAnalysisResult:
        threshold = float(context.get("screening_distance_km", 25.0))
        mission_propagated = bool(context.get("mission_propagated", False))
        propagated_catalog = int(catalog_data.get("catalog_propagated_object_count", 0))
        closest_screened: List[dict] = context.get("closest_screened") or []
        mission_source = context.get("mission_orbital_source", "unspecified")
        data_mode = context.get("data_mode") or catalog_data.get("data_mode") or "UNAVAILABLE"

        closest = encounters[0] if encounters else None
        clean_screening = closest is None and mission_propagated and propagated_catalog > 0

        if closest is not None:
            min_sep = float(closest["minimum_separation_km"])
            risk_level = _classify_distance(min_sep, threshold)
            risk_score = 1.0 if risk_level == "HIGH" else (0.5 if risk_level == "MEDIUM" else 0.1)
            status = "completed"
            data_status = "available"
            summary = (
                f"Preliminary screening identified {len(encounters)} catalog object(s) within {threshold:g} km; "
                f"closest propagated approach is {min_sep:.3f} km ({closest.get('name', 'Unknown')})."
            )
        elif clean_screening:
            risk_level, risk_score = "LOW", 0.1
            status = "completed"
            data_status = "available"
            nearest_note = ""
            if closest_screened:
                top = closest_screened[0]
                nearest_note = (
                    f" Closest screened catalog object was {top.get('name', 'Unknown')} at "
                    f"{top['minimum_separation_km']:.2f} km."
                )
            summary = (
                f"Zero close approaches detected within {threshold:g} km across "
                f"{propagated_catalog} propagated catalog objects.{nearest_note}"
            )
        else:
            risk_level, risk_score = "INSUFFICIENT_DATA", None
            status = "insufficient_data"
            data_status = "insufficient_data"
            summary = "No conjunction screening result is available because catalog or mission orbital propagation data is missing."

        factors = [
            "Risk classification is derived from the closest measured SGP4-propagated separation.",
            f"Configurable thresholds: HIGH <= 5 km; MEDIUM <= {threshold:g} km; LOW > {threshold:g} km.",
            "Preliminary geometric screening only (no state covariance matrix or operational CDM collision probability Pc).",
        ]
        if mission_source == "planned_keplerian_design_orbit":
            factors.append(
                "Mission trajectory propagated from planned Keplerian design parameters (mean elements without drag-perturbed TLE/OMM)."
            )
        if not catalog_data.get("valid_tle_count"):
            factors.append("No valid OMM/TLE catalog records were available for propagation.")
        elif not mission_propagated:
            factors.append("Mission spacecraft orbital elements could not be validated or propagated.")
        elif propagated_catalog == 0:
            factors.append("Zero catalog objects occupied or successfully propagated within the configured orbital shell.")

        # Build orbital_objects table: include encounters within threshold first, else top closest screened objects
        source_items = encounters if encounters else closest_screened[:10]
        orbital_objects = [
            {
                "name": item.get("name") or "Unknown Object",
                "norad_id": item.get("norad_id"),
                "catalog_identifier": item.get("catalog_identifier") or (
                    str(item["norad_id"]) if item.get("norad_id") is not None else None
                ),
                "distance_km": item["minimum_separation_km"],
                "relative_velocity_kms": item.get("relative_velocity_kms"),
                "risk": _classify_distance(float(item["minimum_separation_km"]), threshold),
                "inclination_deg": item.get("inclination_deg"),
                "tca": item.get("tca"),
                "format": item.get("format"),
                "catalog_group": item.get("catalog_group"),
                "altitude_km": item.get("altitude_km"),
            }
            for item in source_items
        ]

        return DebrisAnalysisResult(
            status=status,
            data_mode=data_mode,
            objects_analyzed=propagated_catalog if propagated_catalog > 0 else catalog_data.get("valid_tle_count", 0),
            nearby_objects=len(encounters),
            risk_level=risk_level,
            risk_score=risk_score,
            data_source=catalog_data.get("source", "CelesTrak"),
            summary=summary,
            factors=factors,
            orbital_objects=orbital_objects,
            details={
                "encounters": encounters,
                "closest_screened_objects": closest_screened,
                "screening_threshold_km": threshold,
                "propagation_interval_minutes": context.get("propagation_interval_minutes"),
                "propagation_step_seconds": context.get("propagation_step_seconds"),
                "coordinate_frame": "ITRS/ECEF derived from SGP4 TEME using Astropy.",
                "assessment_type": "preliminary_screening",
                "assessment_disclaimer": (
                    "Preliminary SGP4 GP element screening is NOT a substitute for validated operational "
                    "Conjunction Data Messages (CDMs) with state covariance from 18th Space Defense Squadron / Space-Track."
                ),
                "collision_probability": None,
                "data_mode": data_mode,
                "mission_orbital_source": mission_source,
                "data_freshness": catalog_data.get("retrieved_at"),
                "is_cached": catalog_data.get("is_cached", False),
                "is_demonstration": catalog_data.get("is_demonstration", False),
                "groups_requested": catalog_data.get("groups_requested", []),
                "stale_tle_count": catalog_data.get("stale_tle_count", 0),
                "invalid_tle_count": catalog_data.get("invalid_tle_count", 0),
                "future_tle_count": catalog_data.get("future_tle_count", 0),
                "omm_count": catalog_data.get("omm_count", 0),
                "tle_count": catalog_data.get("tle_count", 0),
                "extended_catalog_id_count": catalog_data.get("extended_catalog_id_count", 0),
                "valid_catalog_records": catalog_data.get("valid_tle_count", 0),
                "shell_filtered_count": catalog_data.get("shell_filtered_count", 0),
                "catalog_propagated_object_count": propagated_catalog,
                "cache_age_seconds": catalog_data.get("cache_age_seconds"),
                "data_status": data_status,
            },
        )
