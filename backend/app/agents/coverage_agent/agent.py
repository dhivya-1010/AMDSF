import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.agents.debris_agent.orbital import prepare_time_grid, propagate_record, sample_times
from app.config import settings
from app.services.celestrak_service import build_keplerian_design_record, celestrak_service
from app.services.worldpop_service import worldpop_service
from .analyzer import CoverageAnalyzer
from .models import CoverageAnalysisResult


class CoverageAgent:
    """Coverage Intelligence Agent computing SGP4 ground tracks, swath footprints, access windows & WorldPop reach."""

    def __init__(self):
        self.name = "Coverage Intelligence Agent"

    async def analyze(
        self,
        mission_id: Optional[str] = None,
        target_country: str = "India",
        target_region: str = "Tamil Nadu",
        target_area: str = "Chennai Metropolitan Region",
        latitude: float = 13.0827,
        longitude: float = 80.2707,
        coverage_requirement: float = 80.0,
        coverage_radius_km: float = 100.0,
        target_orbit_km: float = 550.0,
        inclination_deg: float = 97.6,
        eccentricity: float = 0.001,
        raan: Any = "Auto",
        arg_perigee: Any = "Auto",
        mission_duration: int = 365,
        objective_type: str = "EARTH_OBSERVATION",
        mission_tle: Optional[Dict[str, Any]] = None,
        sensor_fov_deg: Optional[float] = None,
        swath_width_km: Optional[float] = None,
        min_elevation_deg: Optional[float] = None,
        observation_duration_hours: Optional[float] = None,
        time_step_seconds: Optional[int] = None,
        use_demonstration_sensor: bool = True,
        enable_worldpop_lookup: bool = True,
        data_mode: str = "auto",
    ) -> CoverageAnalysisResult:
        obs_hours = float(observation_duration_hours or getattr(settings, "COVERAGE_DEFAULT_DURATION_HOURS", 72.0))
        step_s = int(time_step_seconds or getattr(settings, "COVERAGE_DEFAULT_STEP_SECONDS", 60))
        min_el = float(min_elevation_deg if min_elevation_deg is not None else settings.COVERAGE_DEFAULT_MIN_ELEVATION_DEG)

        tle_info = mission_tle if isinstance(mission_tle, dict) else {}
        orbit_record, orbit_source, _ = await celestrak_service.get_mission_orbital_elements(
            norad_id=tle_info.get("norad_id"),
            object_name=tle_info.get("object_name"),
            tle_line1=tle_info.get("tle_line1"),
            tle_line2=tle_info.get("tle_line2"),
            omm=tle_info.get("omm"),
            altitude_km=target_orbit_km,
            inclination_deg=inclination_deg,
            eccentricity=eccentricity,
            raan=raan,
            arg_perigee=arg_perigee,
            allow_design_orbit=True,
            data_mode=data_mode,
            target_latitude_deg=latitude,
            target_longitude_deg=longitude,
        )
        if orbit_record is None:
            orbit_record = build_keplerian_design_record(
                altitude_km=target_orbit_km,
                inclination_deg=inclination_deg,
                eccentricity=eccentricity,
                raan=raan,
                arg_perigee=arg_perigee,
                target_latitude_deg=latitude,
                target_longitude_deg=longitude,
            )
            orbit_source = "planned_keplerian_design_orbit"

        def _propagate_track():
            interval_min = int(round(obs_hours * 60.0))
            times = sample_times(datetime.now(timezone.utc), interval_min, step_s)
            utc_t, prep_obs = prepare_time_grid(times)
            pos_itrs, _, _ = propagate_record(
                orbit_record,
                utc_t,
                prepared_obstime=prep_obs,
                prepared_utc_times=utc_t,
            )
            return utc_t, pos_itrs

        if enable_worldpop_lookup:
            (utc_times, positions_itrs), worldpop_data = await asyncio.gather(
                asyncio.to_thread(_propagate_track),
                worldpop_service.get_population_in_radius(
                    latitude=latitude,
                    longitude=longitude,
                    radius_km=coverage_radius_km,
                    data_mode=data_mode,
                ),
            )
        else:
            utc_times, positions_itrs = await asyncio.to_thread(_propagate_track)
            worldpop_data = {
                "available": False,
                "population": None,
                "status": "disabled",
                "source": "WorldPop lookup disabled",
            }

        # Determine clear data mode label for UI badge
        if data_mode == "demonstration" or orbit_source == "demonstration_catalog_catnr":
            resolved_mode = "DEMONSTRATION DATA"
        elif orbit_source in ("user_tle", "user_omm_json", "celestrak_gp_catnr_live"):
            resolved_mode = "LIVE DATA"
        elif orbit_source in ("celestrak_gp_catnr_cached", "catalog_norad_lookup"):
            resolved_mode = "CACHED DATA"
        else:
            # SGP4 over planned Keplerian orbit is deterministic physics + optional demonstration sensor
            resolved_mode = (
                "DEMONSTRATION DATA"
                if (sensor_fov_deg is None and swath_width_km is None and use_demonstration_sensor)
                else "COMPUTED SGP4"
            )

        result = CoverageAnalyzer.evaluate_orbital_coverage(
            positions_itrs_km=positions_itrs,
            times=utc_times,
            orbit_source=orbit_source,
            orbit_record=orbit_record,
            target_country=target_country,
            target_region=target_region,
            target_area=target_area,
            latitude=latitude,
            longitude=longitude,
            coverage_requirement=coverage_requirement,
            coverage_radius_km=coverage_radius_km,
            target_orbit_km=target_orbit_km,
            inclination_deg=inclination_deg,
            objective_type=objective_type,
            sensor_fov_deg=sensor_fov_deg,
            swath_width_km=swath_width_km,
            min_elevation_deg=min_el,
            use_demonstration_sensor=use_demonstration_sensor,
            observation_duration_hours=obs_hours,
            time_step_seconds=step_s,
            worldpop_data=worldpop_data,
            data_mode=resolved_mode,
        )
        result.mission_id = mission_id
        result.timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        return result


coverage_agent = CoverageAgent()
