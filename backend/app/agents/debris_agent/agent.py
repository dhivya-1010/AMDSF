import asyncio
from datetime import datetime, timezone
from typing import Any, List, Optional

import numpy as np

from app.config import settings
from app.services.celestrak_service import celestrak_service
from .analyzer import DebrisAnalyzer
from .models import DebrisAnalysisResult
from .orbital import (
    analyze_encounters,
    prepare_time_grid,
    propagate_record,
    propagate_records_batch,
    sample_times,
    summarize_closest_screened,
)


class DebrisAgent:
    """Orbital Debris Intelligence Agent using SGP4 propagation over CelesTrak OMM/TLE catalogs."""

    async def analyze(
        self,
        mission_id: Optional[str] = None,
        target_orbit_km: float = 550.0,
        inclination_deg: float = 97.6,
        eccentricity: float = 0.0,
        mission_duration: int = 365,
        preferred_date: str = "2026-10-15",
        flexibility_days: int = 3,
        mission_tle: Optional[dict] = None,
        propagation_interval_minutes: Optional[int] = None,
        propagation_step_seconds: Optional[int] = None,
        screening_distance_km: Optional[float] = None,
        data_mode: str = "auto",
        catalog_groups: Optional[List[str]] = None,
        raan: Any = "Auto",
        arg_perigee: Any = "Auto",
        allow_design_orbit: bool = True,
    ) -> DebrisAnalysisResult:
        interval = propagation_interval_minutes or settings.DEBRIS_PROPAGATION_INTERVAL_MINUTES
        step = propagation_step_seconds or settings.DEBRIS_PROPAGATION_STEP_SECONDS
        threshold = screening_distance_km or settings.DEBRIS_SCREENING_DISTANCE_KM

        tle_info = mission_tle if isinstance(mission_tle, dict) else {}
        requested_groups = catalog_groups or tle_info.get("catalog_groups") or list(settings.DEBRIS_CATALOG_GROUPS)

        # Fetch catalog filtered around the mission altitude shell first (so mission lookup can also reuse it)
        catalog = await celestrak_service.get_catalog_for_screening(
            groups=requested_groups,
            target_altitude_km=target_orbit_km,
            altitude_band_km=settings.DEBRIS_ALTITUDE_BAND_KM,
            data_mode=data_mode,
        )

        # Resolve mission spacecraft orbital elements (TLE -> OMM JSON -> NORAD CATNR -> planned Keplerian orbit)
        mission_record, mission_source, resolve_errors = await celestrak_service.get_mission_orbital_elements(
            norad_id=tle_info.get("norad_id"),
            object_name=tle_info.get("object_name"),
            tle_line1=tle_info.get("tle_line1"),
            tle_line2=tle_info.get("tle_line2"),
            omm=tle_info.get("omm"),
            catalog_records=catalog.get("records"),
            altitude_km=target_orbit_km,
            inclination_deg=inclination_deg,
            eccentricity=eccentricity,
            raan=raan,
            arg_perigee=arg_perigee,
            allow_design_orbit=allow_design_orbit,
            data_mode=data_mode,
        )

        # If a resolved mission spacecraft has a distinct true altitude (e.g. ISS ~420km vs default 550km input),
        # ensure shell filtering captures its altitude as well if shell count was small
        encounters: List[dict] = []
        closest_screened: List[dict] = []
        propagation_errors: List[Any] = list(resolve_errors)
        catalog["catalog_propagated_object_count"] = 0
        mission_propagated = False
        actual_data_mode = catalog.get("data_mode", "UNAVAILABLE")

        if mission_record is not None:
            mission_alt = mission_record.get("altitude_km")
            if (
                mission_alt is not None
                and abs(float(mission_alt) - float(target_orbit_km)) > settings.DEBRIS_ALTITUDE_BAND_KM * 0.6
            ):
                catalog = await celestrak_service.get_catalog_for_screening(
                    groups=requested_groups,
                    target_altitude_km=float(mission_alt),
                    altitude_band_km=settings.DEBRIS_ALTITUDE_BAND_KM,
                    data_mode=data_mode,
                )
                actual_data_mode = catalog.get("data_mode", "UNAVAILABLE")

            def _run_screening_math():
                times = sample_times(datetime.now(timezone.utc), interval, step)
                utc_times, prepared_obstime = prepare_time_grid(times)

                m_pos, m_vel, m_errs = propagate_record(
                    mission_record,
                    utc_times,
                    prepared_obstime=prepared_obstime,
                    prepared_utc_times=utc_times,
                )
                local_errors = list(m_errs)
                if not np.isfinite(m_pos).any():
                    return False, [], [], 0, local_errors

                mission_cat_id = str(
                    mission_record.get("catalog_identifier") or mission_record.get("norad_id") or ""
                )
                valid_records, positions, velocities, prop_count, batch_errs = propagate_records_batch(
                    catalog.get("records", []),
                    utc_times,
                    prepared_obstime,
                    skip_cat_id=mission_cat_id,
                    skip_if_matching_cat_id=(mission_source != "planned_keplerian_design_orbit"),
                )
                local_errors.extend(batch_errs)

                if not positions:
                    return True, [], [], prop_count, local_errors

                state_evaluators = [
                    (
                        lambda when, mr=mission_record: _single_state(mr, when),
                        lambda when, r=rec: _single_state(r, when),
                    )
                    for rec in valid_records
                ]
                pos_stack = np.stack(positions, axis=1)
                vel_stack = np.stack(velocities, axis=1)
                found_encounters = analyze_encounters(
                    m_pos,
                    valid_records,
                    pos_stack,
                    utc_times,
                    threshold,
                    mission_velocities=m_vel,
                    object_velocities=vel_stack,
                    state_evaluators=state_evaluators,
                    refinement_time_tolerance_seconds=settings.DEBRIS_TCA_REFINEMENT_TOLERANCE_SECONDS,
                )
                closest_list = summarize_closest_screened(
                    m_pos,
                    valid_records,
                    pos_stack,
                    utc_times,
                    threshold,
                    mission_velocities=m_vel,
                    object_velocities=vel_stack,
                    top_n=10,
                )
                return True, found_encounters, closest_list, prop_count, local_errors

            mission_propagated, encounters, closest_screened, prop_count, math_errors = await asyncio.to_thread(
                _run_screening_math
            )
            catalog["catalog_propagated_object_count"] = prop_count
            propagation_errors.extend(math_errors)

        # If data came from demonstration fallback even when mode wasn't requested, reflect clearly
        if (
            mission_source in ("demonstration_catalog_catnr",)
            and actual_data_mode == "LIVE DATA"
        ):
            actual_data_mode = "DEMONSTRATION DATA"

        result = DebrisAnalyzer.evaluate(
            catalog,
            encounters,
            screening_distance_km=threshold,
            propagation_interval_minutes=interval,
            propagation_step_seconds=step,
            mission_propagated=mission_propagated,
            closest_screened=closest_screened,
            mission_orbital_source=mission_source,
            data_mode=actual_data_mode,
        )
        result.mission_id = mission_id
        result.timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        result.details["propagation_errors"] = propagation_errors[:50]
        result.details["propagation_error_count"] = len(propagation_errors)
        result.details["mission_object_name"] = mission_record.get("name") if mission_record else None
        result.details["mission_norad_id"] = mission_record.get("norad_id") if mission_record else tle_info.get("norad_id")
        result.details["mission_catalog_identifier"] = (
            mission_record.get("catalog_identifier") if mission_record else None
        )
        result.details["mission_epoch"] = mission_record.get("epoch") if mission_record else None
        return result


def _single_state(record: dict, when: datetime):
    positions, velocities, errors = propagate_record(record, [when])
    if errors or not np.isfinite(positions[0]).all() or not np.isfinite(velocities[0]).all():
        raise ValueError(f"Unable to refine state for object {record.get('catalog_identifier') or record.get('norad_id')}.")
    return positions[0], velocities[0]


debris_agent = DebrisAgent()
