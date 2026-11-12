import math
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from app.agents.debris_agent.orbital import itrs_positions_to_geodetic
from .models import CoverageAnalysisResult

R_EARTH_KM = 6371.0088


def _format_population(value: Optional[int]) -> Optional[str]:
    if value is None:
        return None
    if value >= 1_000_000:
        return f"{value / 1_000_000:.2f}M"
    if value >= 1_000:
        return f"{value / 1_000:.1f}K"
    return f"{value:,}"


def _great_circle_distances_km(
    lat1_rad: np.ndarray,
    lon1_rad: np.ndarray,
    lat2_rad: np.ndarray,
    lon2_rad: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray]:
    """Return spherical central angle (rad) and surface distance (km) via Haversine."""
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1_rad) * np.cos(lat2_rad) * (np.sin(dlon / 2.0) ** 2)
    a = np.clip(a, 0.0, 1.0)
    central_angle = 2.0 * np.arcsin(np.sqrt(a))
    return central_angle, R_EARTH_KM * central_angle


def _sample_target_disk(lat_deg: float, lon_deg: float, radius_km: float) -> Tuple[np.ndarray, np.ndarray]:
    """Build a 61-point geodesic sample disk centered at (lat_deg, lon_deg) covering radius_km."""
    points: List[Tuple[float, float]] = [(math.radians(lat_deg), math.radians(lon_deg))]
    lat0 = math.radians(lat_deg)
    lon0 = math.radians(lon_deg)
    rings = [(0.25, 8), (0.50, 12), (0.75, 16), (1.00, 24)]
    for frac, n_az in rings:
        ang = (radius_km * frac) / R_EARTH_KM
        for i in range(n_az):
            brg = 2.0 * math.pi * i / n_az
            p_lat = math.asin(
                math.sin(lat0) * math.cos(ang) + math.cos(lat0) * math.sin(ang) * math.cos(brg)
            )
            p_lon = lon0 + math.atan2(
                math.sin(brg) * math.sin(ang) * math.cos(lat0),
                math.cos(ang) - math.sin(lat0) * math.sin(p_lat),
            )
            points.append((p_lat, p_lon))
    arr = np.asarray(points, dtype=float)
    return arr[:, 0], arr[:, 1]


def compute_swath_from_geometry(
    altitude_km: float,
    sensor_fov_deg: Optional[float] = None,
    swath_width_km: Optional[float] = None,
    min_elevation_deg: float = 5.0,
) -> Dict[str, Any]:
    """Compute sensor half-swath & full swath width using spherical Earth + elevation mask trigonometry."""
    alt = max(120.0, float(altitude_km))
    el_min = min(max(float(min_elevation_deg), 0.0), 85.0)
    el_min_rad = math.radians(el_min)
    horizon_sin_eta = min(0.999999, (R_EARTH_KM / (R_EARTH_KM + alt)) * math.cos(el_min_rad))
    max_nadir_angle_rad = math.asin(horizon_sin_eta)
    max_central_angle_rad = (math.pi / 2.0) - el_min_rad - max_nadir_angle_rad
    max_swath_half_km = R_EARTH_KM * max_central_angle_rad

    if swath_width_km is not None and float(swath_width_km) > 0:
        half_swath_km = min(float(swath_width_km) / 2.0, max_swath_half_km)
        full_swath_km = 2.0 * half_swath_km
        central_angle_rad = half_swath_km / R_EARTH_KM
        eff_fov_deg = round(
            2.0 * math.degrees(math.atan2(R_EARTH_KM * math.sin(central_angle_rad), (R_EARTH_KM + alt) - R_EARTH_KM * math.cos(central_angle_rad))),
            2,
        )
        return {
            "swath_width_km": round(full_swath_km, 2),
            "half_swath_km": round(half_swath_km, 2),
            "effective_fov_deg": eff_fov_deg,
            "horizon_limited": float(swath_width_km) / 2.0 > max_swath_half_km,
            "max_horizon_swath_km": round(2.0 * max_swath_half_km, 2),
            "min_elevation_deg": el_min,
        }

    fov = max(0.5, float(sensor_fov_deg or 45.0))
    half_fov_rad = math.radians(fov / 2.0)
    effective_eta = min(half_fov_rad, max_nadir_angle_rad)
    sin_term = min(0.999999, ((R_EARTH_KM + alt) / R_EARTH_KM) * math.sin(effective_eta))
    central_angle_rad = math.asin(sin_term) - effective_eta
    half_swath_km = max(1.0, R_EARTH_KM * central_angle_rad)
    return {
        "swath_width_km": round(2.0 * half_swath_km, 2),
        "half_swath_km": round(half_swath_km, 2),
        "effective_fov_deg": round(math.degrees(2.0 * effective_eta), 2),
        "horizon_limited": half_fov_rad > max_nadir_angle_rad,
        "max_horizon_swath_km": round(2.0 * max_swath_half_km, 2),
        "min_elevation_deg": el_min,
    }


class CoverageAnalyzer:
    """Computes SGP4 orbital ground tracks, sensor swath footprint, target access windows & multi-pass revisit."""

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
        objective_type: str,
    ) -> CoverageAnalysisResult:
        """Legacy non-propagated prototype estimate (kept explicit when no SGP4 propagator output is supplied)."""
        swath_width_km = round(target_orbit_km * 1.85, 1)
        coverage_ratio = min(1.0, (swath_width_km / max(50.0, coverage_radius_km * 2.0)))
        base_coverage = 85.0 + (coverage_ratio * 12.0)
        lat_factor = abs(latitude) / 90.0
        geom_boost = 3.5 if inclination_deg >= 90.0 else 0.0
        passes_per_day = (8 + int(lat_factor * 6)) if inclination_deg >= 90.0 else 7
        coverage_pct = min(99.4, max(65.0, round(base_coverage + geom_boost, 1)))
        gaps = 1 if coverage_pct >= 92.0 else (2 if coverage_pct >= 80.0 else 3)
        satisfies_req = coverage_pct >= coverage_requirement
        location_label = ", ".join([p for p in (target_area, target_region, target_country) if p]) or "Unspecified Target"

        return CoverageAnalysisResult(
            agent="Coverage Intelligence Agent",
            status="prototype_estimate",
            data_mode="UNAVAILABLE",
            coverage_percent=coverage_pct,
            population_served=None,
            population_served_formatted=None,
            coverage_gaps=gaps,
            target_region=location_label,
            summary=(
                f"Target area '{location_label}' ({latitude}° N, {longitude}° E) achieves {coverage_pct}% prototype estimate, "
                f"{'satisfying' if satisfies_req else 'below'} {coverage_requirement}% requirement (orbital SGP4 propagation not supplied)."
            ),
            factors=[
                f"Swath width prototype estimate ({swath_width_km} km) against {coverage_radius_km} km target radius",
                "Population reach is unavailable because no attributed population dataset is configured.",
                "Revisit events are unavailable because no orbit/sensor access propagator was invoked.",
            ],
            revisit_time_minutes=None,
            ground_track_passes_per_day=float(passes_per_day),
            swath_width_km=swath_width_km,
            details={
                "data_status": "prototype_estimate",
                "validated_orbital_coverage": False,
                "population_data_status": "unavailable",
                "revisit_data_status": "unavailable",
                "elevation_mask_deg": 5.0,
                "swath_width_km": swath_width_km,
                "target_coordinates": f"{latitude}° N, {longitude}° E",
                "coverage_requirement_met": satisfies_req,
                "coverage_radius_km": coverage_radius_km,
            },
        )

    @classmethod
    def evaluate_orbital_coverage(
        cls,
        *,
        positions_itrs_km: np.ndarray,
        times: List[datetime],
        orbit_source: str,
        orbit_record: Dict[str, Any],
        target_country: str,
        target_region: str,
        target_area: str,
        latitude: float,
        longitude: float,
        coverage_requirement: float,
        coverage_radius_km: float,
        target_orbit_km: float,
        inclination_deg: float,
        objective_type: str,
        sensor_fov_deg: Optional[float] = None,
        swath_width_km: Optional[float] = None,
        min_elevation_deg: float = 5.0,
        use_demonstration_sensor: bool = True,
        observation_duration_hours: float = 72.0,
        time_step_seconds: int = 60,
        worldpop_data: Optional[Dict[str, Any]] = None,
        data_mode: str = "LIVE DATA",
    ) -> CoverageAnalysisResult:
        """Compute true SGP4 TEME->ITRS ground tracks, sensor swath width, access windows & revisit intervals."""
        track = itrs_positions_to_geodetic(positions_itrs_km, times)
        location_label = ", ".join([p for p in (target_area, target_region, target_country) if p]) or f"{latitude:.2f}°, {longitude:.2f}°"

        if not track:
            return CoverageAnalysisResult(
                agent="Coverage Intelligence Agent",
                status="insufficient_data",
                data_mode="UNAVAILABLE",
                coverage_percent=None,
                population_served=None,
                population_served_formatted=None,
                coverage_gaps=None,
                target_region=location_label,
                summary="Orbital propagation yielded no finite TEME/ITRS coordinates for coverage calculation.",
                factors=["SGP4 ground-track propagation failed to produce valid coordinates."],
                revisit_time_minutes=None,
                ground_track_passes_per_day=None,
                swath_width_km=None,
                details={
                    "data_status": "unavailable",
                    "validated_orbital_coverage": False,
                    "ground_track": [],
                    "access_windows": [],
                },
            )

        # Determine sensor model provenance
        if swath_width_km is not None and float(swath_width_km) > 0:
            sensor_model_type = "configured_swath"
            sensor_label = f"Configured swath parameter ({float(swath_width_km):.1f} km)"
            eff_fov_input = None
        elif sensor_fov_deg is not None and float(sensor_fov_deg) > 0:
            sensor_model_type = "configured_fov"
            sensor_label = f"Configured optical/SAR sensor FOV ({float(sensor_fov_deg):.1f}°)"
            eff_fov_input = float(sensor_fov_deg)
        elif use_demonstration_sensor:
            sensor_model_type = "demonstration_sensor"
            eff_fov_input = 45.0
            sensor_label = "Demonstration baseline sensor (45.0° full-cone FOV)"
        else:
            sensor_model_type = "unavailable"
            sensor_label = "No sensor FOV or swath specification supplied"
            eff_fov_input = None

        # Sub-track visualization points (~195 min = 2 full LEO orbits, <= 220 points for map rendering)
        preview_window_points = max(40, min(len(track), int((195 * 60) / max(10, time_step_seconds)) + 1))
        stride = max(1, preview_window_points // 180)
        preview_track = [
            {"lat": pt["lat"], "lng": pt["lng"], "alt_km": pt["alt_km"], "timestamp": pt["timestamp"]}
            for pt in track[:preview_window_points:stride]
        ]
        sat_now = {"lat": track[0]["lat"], "lng": track[0]["lng"], "alt_km": track[0]["alt_km"], "timestamp": track[0]["timestamp"]}

        if sensor_model_type == "unavailable":
            return CoverageAnalysisResult(
                agent="Coverage Intelligence Agent",
                status="insufficient_data",
                data_mode=data_mode,
                coverage_percent=None,
                population_served=None,
                population_served_formatted=None,
                coverage_gaps=None,
                target_region=location_label,
                summary="Ground track propagated via SGP4, but sensor FOV/swath width was not supplied and demonstration sensor is disabled.",
                factors=[
                    f"SGP4 propagated {len(track)} WGS84 sub-satellite positions over {observation_duration_hours:.0f}h.",
                    "Sensor FOV / swath parameter is missing; swath footprint and access coverage cannot be estimated.",
                ],
                revisit_time_minutes=None,
                ground_track_passes_per_day=None,
                swath_width_km=None,
                details={
                    "data_status": "partial",
                    "validated_orbital_coverage": False,
                    "sensor_model_type": sensor_model_type,
                    "ground_track": preview_track,
                    "satellite_position": sat_now,
                    "access_windows": [],
                },
            )

        mean_alt_km = float(np.mean([pt["alt_km"] for pt in track]))
        swath_geom = compute_swath_from_geometry(
            altitude_km=mean_alt_km,
            sensor_fov_deg=eff_fov_input,
            swath_width_km=swath_width_km,
            min_elevation_deg=min_elevation_deg,
        )
        half_swath_km = swath_geom["half_swath_km"]
        full_swath_km = swath_geom["swath_width_km"]

        sat_lats_rad = np.radians(np.array([pt["lat"] for pt in track], dtype=float))
        sat_lons_rad = np.radians(np.array([pt["lng"] for pt in track], dtype=float))
        sat_alts_km = np.array([pt["alt_km"] for pt in track], dtype=float)
        track_times = [datetime.fromisoformat(pt["timestamp"].replace("Z", "+00:00")) for pt in track]

        target_lat_rad = math.radians(latitude)
        target_lon_rad = math.radians(longitude)

        # Center target great-circle distance and satellite elevation angle across the full window
        central_angles, center_dists_km = _great_circle_distances_km(
            sat_lats_rad,
            sat_lons_rad,
            np.full_like(sat_lats_rad, target_lat_rad),
            np.full_like(sat_lons_rad, target_lon_rad),
        )
        r_sat = R_EARTH_KM + sat_alts_km
        elevations_deg = np.degrees(
            np.arctan2(r_sat * np.cos(central_angles) - R_EARTH_KM, r_sat * np.sin(central_angles))
        )

        in_access = (center_dists_km <= half_swath_km) & (elevations_deg >= float(min_elevation_deg))

        # Group contiguous access epochs into passes
        access_windows: List[Dict[str, Any]] = []
        idx = 0
        n_pts = len(track)
        while idx < n_pts:
            if not in_access[idx]:
                idx += 1
                continue
            start_idx = idx
            while idx + 1 < n_pts and in_access[idx + 1]:
                idx += 1
            end_idx = idx
            window_dists = center_dists_km[start_idx : end_idx + 1]
            window_elevs = elevations_deg[start_idx : end_idx + 1]
            duration_s = max(time_step_seconds, int((track_times[end_idx] - track_times[start_idx]).total_seconds()) + time_step_seconds)
            access_windows.append({
                "start_utc": track[start_idx]["timestamp"],
                "end_utc": track[end_idx]["timestamp"],
                "midpoint_utc": track[(start_idx + end_idx) // 2]["timestamp"],
                "duration_seconds": duration_s,
                "min_ground_distance_km": round(float(np.min(window_dists)), 2),
                "max_elevation_deg": round(float(np.max(window_elevs)), 1),
            })
            idx += 1

        # Revisit intervals across multi-orbit passes
        revisit_intervals_min: List[float] = []
        for i in range(1, len(access_windows)):
            t_prev = datetime.fromisoformat(access_windows[i - 1]["midpoint_utc"].replace("Z", "+00:00"))
            t_curr = datetime.fromisoformat(access_windows[i]["midpoint_utc"].replace("Z", "+00:00"))
            gap_min = (t_curr - t_prev).total_seconds() / 60.0
            if gap_min > 0:
                revisit_intervals_min.append(gap_min)

        revisit_mean_min = int(round(float(np.mean(revisit_intervals_min)))) if revisit_intervals_min else None
        revisit_max_min = int(round(float(np.max(revisit_intervals_min)))) if revisit_intervals_min else None
        obs_days = max(observation_duration_hours / 24.0, 1e-6)
        passes_per_day = round(len(access_windows) / obs_days, 2)

        # Area coverage percentage via 61-point geodesic target disk intersected against swept swath over the observation window
        disk_lats_rad, disk_lons_rad = _sample_target_disk(latitude, longitude, max(10.0, float(coverage_radius_km)))
        # Compute pairwise great-circle distances (n_epochs x 61 points)
        _, disk_dists_km = _great_circle_distances_km(
            sat_lats_rad[:, None],
            sat_lons_rad[:, None],
            disk_lats_rad[None, :],
            disk_lons_rad[None, :],
        )
        point_covered = (disk_dists_km <= half_swath_km).any(axis=0)
        coverage_pct = round(float(np.mean(point_covered)) * 100.0, 1)
        satisfies_req = coverage_pct >= float(coverage_requirement)

        # Coverage gaps count reflects missed target sample sectors + revisit availability
        uncovered_frac = 1.0 - (coverage_pct / 100.0)
        coverage_gaps = 0 if coverage_pct >= 99.0 and len(access_windows) >= 2 else max(
            1 if len(access_windows) < 2 else 0,
            int(math.ceil(uncovered_frac * 5.0)),
        )

        # WorldPop gridded population integration (explicit Unavailable when not retrieved)
        wp = worldpop_data or {}
        pop_val = wp.get("population") if wp.get("available") else None
        pop_fmt = _format_population(pop_val)
        pop_status = wp.get("status", "unavailable")

        assumptions = {
            "propagator": "SGP4 (TEME -> ITRS/WGS84 via Astropy)",
            "orbit_source": orbit_source,
            "orbit_altitude_mean_km": round(mean_alt_km, 2),
            "inclination_deg": round(float(orbit_record.get("inclination_deg") or inclination_deg), 3),
            "observation_duration_hours": observation_duration_hours,
            "time_step_seconds": time_step_seconds,
            "sensor_model_type": sensor_model_type,
            "sensor_fov_deg": swath_geom["effective_fov_deg"],
            "swath_width_km": full_swath_km,
            "half_swath_km": half_swath_km,
            "min_elevation_angle_deg": float(min_elevation_deg),
            "target_radius_km": float(coverage_radius_km),
            "revisit_method": "Multi-pass midpoint separation across full SGP4 observation window",
            "units": {
                "swath_width": "km",
                "altitude": "km",
                "revisit": "minutes",
                "coverage": "%",
                "elevation": "degrees",
            },
        }

        revisit_phrase = (
            f"mean revisit {revisit_mean_min} min (max {revisit_max_min} min)"
            if revisit_mean_min is not None
            else (
                "single access pass within window (extend observation window for revisit interval)"
                if len(access_windows) == 1
                else "zero passes intersecting target center within observation window"
            )
        )
        demo_prefix = "DEMONSTRATION SENSOR ESTIMATE: " if sensor_model_type == "demonstration_sensor" else ""
        summary = (
            f"{demo_prefix}SGP4 propagation over {observation_duration_hours:.0f}h yielded {coverage_pct}% geometric area coverage "
            f"of '{location_label}' ({latitude:.2f}°, {longitude:.2f}°), {len(access_windows)} access pass(es), "
            f"{revisit_phrase}. {'Requirement met' if satisfies_req else 'Below requirement'} ({coverage_requirement}%)."
        )

        factors = [
            f"SGP4 propagated {len(track)} geodetic points at {time_step_seconds}s resolution ({orbit_source})",
            f"{sensor_label} yields {full_swath_km:.1f} km ground swath (half-swath {half_swath_km:.1f} km, min elevation {min_elevation_deg}°)",
            f"Target disk ({coverage_radius_km} km radius): {coverage_pct}% intersected over {len(access_windows)} access window(s) ({passes_per_day}/day)",
            (
                f"Mean revisit interval: {revisit_mean_min} min (max gap {revisit_max_min} min across {len(access_windows)} passes)"
                if revisit_mean_min is not None
                else f"Revisit interval not closed ({len(access_windows)} center pass(es) in {observation_duration_hours:.0f}h window)"
            ),
            (
                f"WorldPop 2020 population inside target footprint: {pop_val:,} ({pop_fmt})"
                if pop_val is not None
                else "WorldPop gridded population dataset unavailable for target polygon (no synthetic estimate used)"
            ),
        ]

        return CoverageAnalysisResult(
            agent="Coverage Intelligence Agent",
            status="completed",
            data_mode=data_mode,
            coverage_percent=coverage_pct,
            population_served=pop_val,
            population_served_formatted=pop_fmt,
            coverage_gaps=coverage_gaps,
            target_region=location_label,
            summary=summary,
            factors=factors,
            revisit_time_minutes=revisit_mean_min,
            max_revisit_minutes=revisit_max_min,
            ground_track_passes_per_day=passes_per_day,
            swath_width_km=full_swath_km,
            access_windows_count=len(access_windows),
            details={
                "data_status": "available",
                "validated_orbital_coverage": True,
                "sensor_model_type": sensor_model_type,
                "is_demonstration_sensor": sensor_model_type == "demonstration_sensor",
                "orbit_source": orbit_source,
                "population_data_status": pop_status,
                "population_source": wp.get("source"),
                "revisit_data_status": "available" if revisit_mean_min is not None else "single_or_zero_passes",
                "elevation_mask_deg": float(min_elevation_deg),
                "swath_width_km": full_swath_km,
                "swath_radius_km": half_swath_km,
                "effective_fov_deg": swath_geom["effective_fov_deg"],
                "target_coordinates": f"{latitude:.4f}° N, {longitude:.4f}° E",
                "target_lat": latitude,
                "target_lng": longitude,
                "coverage_requirement_met": satisfies_req,
                "coverage_radius_km": coverage_radius_km,
                "passes_observed": len(access_windows),
                "revisit_intervals_minutes": [round(g, 1) for g in revisit_intervals_min],
                "access_windows": access_windows[:20],
                "ground_track": preview_track,
                "ground_track_total_points": len(track),
                "satellite_position": sat_now,
                "assumptions_and_units": assumptions,
            },
        )
