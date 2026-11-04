from datetime import datetime, timezone
from typing import Optional

import numpy as np

from app.config import settings
from app.services.celestrak_service import celestrak_service, parse_tle_record
from .analyzer import DebrisAnalyzer
from .models import DebrisAnalysisResult
from .orbital import analyze_encounters, propagate_tle, sample_times


class DebrisAgent:
    """Orbital Debris Intelligence Agent using real TLEs when supplied."""

    async def analyze(
        self, mission_id: Optional[str] = None, target_orbit_km: float = 550.0,
        inclination_deg: float = 97.6, eccentricity: float = 0.0,
        mission_duration: int = 365, preferred_date: str = "2026-10-15",
        flexibility_days: int = 3, mission_tle: Optional[dict] = None,
        propagation_interval_minutes: Optional[int] = None,
        propagation_step_seconds: Optional[int] = None,
        screening_distance_km: Optional[float] = None,
    ) -> DebrisAnalysisResult:
        catalog = await celestrak_service.get_active_satellites_sample()
        interval = propagation_interval_minutes or settings.DEBRIS_PROPAGATION_INTERVAL_MINUTES
        step = propagation_step_seconds or settings.DEBRIS_PROPAGATION_STEP_SECONDS
        threshold = screening_distance_km or settings.DEBRIS_SCREENING_DISTANCE_KM
        encounters = []
        catalog["propagation_errors"] = []
        catalog["catalog_propagated_object_count"] = 0
        if mission_tle and mission_tle.get("tle_line1") and mission_tle.get("tle_line2"):
            mission_record = parse_tle_record({
                "OBJECT_NAME": mission_tle.get("object_name") or "Mission spacecraft",
                "NORAD_CAT_ID": mission_tle.get("norad_id"),
                "TLE_LINE1": mission_tle["tle_line1"], "TLE_LINE2": mission_tle["tle_line2"],
            })
            if mission_record:
                times = sample_times(datetime.now(timezone.utc), interval, step)
                mission_positions, mission_velocities, mission_errors = propagate_tle(mission_record, times)
                catalog["propagation_errors"].extend(mission_errors)
                valid_records = []
                positions = []
                velocities = []
                state_evaluators = []
                for record in catalog.get("records", []):
                    try:
                        position, velocity, errors = propagate_tle(record, times)
                        valid_records.append(record)
                        positions.append(position)
                        velocities.append(velocity)
                        catalog["propagation_errors"].extend(errors)
                        if np.isfinite(position).any():
                            catalog["catalog_propagated_object_count"] += 1
                        state_evaluators.append((
                            lambda when, record=mission_record: _single_state(record, when),
                            lambda when, record=record: _single_state(record, when),
                        ))
                    except (KeyError, ValueError, RuntimeError):
                        catalog["propagation_errors"].append({
                            "norad_id": record.get("norad_id"),
                            "error": "Propagation setup failed.",
                        })
                if positions:
                    encounters = analyze_encounters(
                        mission_positions,
                        valid_records,
                        np.stack(positions, axis=1),
                        times,
                        threshold,
                        mission_velocities=mission_velocities,
                        object_velocities=np.stack(velocities, axis=1),
                        state_evaluators=state_evaluators,
                        refinement_time_tolerance_seconds=settings.DEBRIS_TCA_REFINEMENT_TOLERANCE_SECONDS,
                    )
            else:
                catalog["propagation_errors"] = ["Mission TLE failed checksum/format validation."]
        else:
            catalog["propagation_errors"] = ["Mission TLE not supplied; measured conjunction screening was not run."]
        result = DebrisAnalyzer.evaluate(
            catalog, encounters, screening_distance_km=threshold,
            propagation_interval_minutes=interval, propagation_step_seconds=step,
        )
        result.mission_id = mission_id
        result.timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        result.details["propagation_errors"] = catalog["propagation_errors"]
        result.details["catalog_propagated_object_count"] = catalog["catalog_propagated_object_count"]
        result.details["valid_tle_count"] = catalog.get("valid_tle_count", 0)
        result.details["invalid_tle_count"] = catalog.get("invalid_tle_count", 0)
        result.details["stale_tle_count"] = catalog.get("stale_tle_count", 0)
        result.details["future_tle_count"] = catalog.get("future_tle_count", 0)
        result.details["cache_age_seconds"] = catalog.get("cache_age_seconds")
        return result


def _single_state(record: dict, when: datetime):
    positions, velocities, errors = propagate_tle(record, [when])
    if errors or not np.isfinite(positions[0]).all() or not np.isfinite(velocities[0]).all():
        raise ValueError(f"Unable to refine state for NORAD {record.get('norad_id')}.")
    return positions[0], velocities[0]


debris_agent = DebrisAgent()
