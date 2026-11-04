from datetime import datetime, timezone
from typing import Optional

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
        if mission_tle and mission_tle.get("tle_line1") and mission_tle.get("tle_line2"):
            mission_record = parse_tle_record({
                "OBJECT_NAME": mission_tle.get("object_name") or "Mission spacecraft",
                "NORAD_CAT_ID": mission_tle.get("norad_id"),
                "TLE_LINE1": mission_tle["tle_line1"], "TLE_LINE2": mission_tle["tle_line2"],
            })
            if mission_record:
                times = sample_times(datetime.now(timezone.utc), interval, step)
                mission_positions, mission_errors = propagate_tle(mission_record, times)
                valid_records = []
                positions = []
                for record in catalog.get("records", []):
                    try:
                        position, _ = propagate_tle(record, times)
                        valid_records.append(record)
                        positions.append(position)
                    except (KeyError, ValueError, RuntimeError):
                        continue
                if positions:
                    import numpy as np
                    encounters = analyze_encounters(mission_positions, valid_records, np.stack(positions, axis=1), times, threshold)
                catalog["propagation_errors"] = mission_errors
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
        return result


debris_agent = DebrisAgent()
