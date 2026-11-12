"""Preliminary, non-covariance conjunction screening & SGP4 propagation utilities.

SGP4 produces TEME state vectors from either OMM JSON records or legacy TLE lines.
Positions and velocities are transformed to ITRS/ECEF with Astropy before all
relative-state and geodetic ground-track calculations.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple

import numpy as np
from astropy import units as u
from astropy.coordinates import (
    CartesianDifferential,
    CartesianRepresentation,
    ITRS,
    TEME,
)
from astropy.time import Time
from scipy.optimize import minimize_scalar
from scipy.spatial import cKDTree

from app.services.celestrak_service import build_satrec_from_record

StateEvaluator = Callable[[datetime], Tuple[np.ndarray, np.ndarray]]


def _utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def prepare_time_grid(times: Iterable[datetime]) -> Tuple[List[datetime], Time]:
    """Convert an iterable of datetimes to UTC list and Astropy Time array."""
    utc_times = [_utc(when) for when in times]
    obstime = Time(utc_times)
    return utc_times, obstime


def propagate_record(
    record: Dict[str, Any],
    times: Iterable[datetime],
    prepared_obstime: Optional[Time] = None,
    prepared_utc_times: Optional[List[datetime]] = None,
) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, Any]]]:
    """Propagate an OMM or TLE record at UTC epochs and return ITRS positions/velocities.

    Positions are kilometres and velocities are kilometres per second. Each
    failed epoch remains NaN so other valid epochs for the same object survive.
    """
    if prepared_obstime is not None and prepared_utc_times is not None:
        utc_times = prepared_utc_times
        obstime = prepared_obstime
    else:
        utc_times, obstime = prepare_time_grid(times)

    count = len(utc_times)
    if count == 0:
        return np.empty((0, 3), dtype=float), np.empty((0, 3), dtype=float), []

    satellite = build_satrec_from_record(record)
    jd1 = np.atleast_1d(np.asarray(obstime.jd1, dtype=float))
    jd2 = np.atleast_1d(np.asarray(obstime.jd2, dtype=float))

    error_codes, raw_positions, raw_velocities = satellite.sgp4_array(jd1, jd2)

    positions = np.full((count, 3), np.nan, dtype=float)
    velocities = np.full((count, 3), np.nan, dtype=float)
    errors: List[Dict[str, Any]] = []

    valid_mask = (error_codes == 0) & np.isfinite(raw_positions).all(axis=1) & np.isfinite(raw_velocities).all(axis=1)
    for idx in np.where(~valid_mask)[0]:
        errors.append({
            "norad_id": record.get("norad_id"),
            "catalog_identifier": record.get("catalog_identifier"),
            "timestamp": utc_times[idx].isoformat().replace("+00:00", "Z"),
            "error": f"SGP4 error code {int(error_codes[idx])}",
        })

    if valid_mask.any():
        valid_obstime = obstime[valid_mask]
        teme = TEME(
            CartesianRepresentation(
                raw_positions[valid_mask].T * u.km,
                differentials=CartesianDifferential(raw_velocities[valid_mask].T * (u.km / u.s)),
            ),
            obstime=valid_obstime,
        )
        itrs = teme.transform_to(ITRS(obstime=valid_obstime))
        positions[valid_mask] = itrs.cartesian.xyz.to_value(u.km).T
        velocities[valid_mask] = itrs.cartesian.differentials["s"].d_xyz.to_value(u.km / u.s).T

    return positions, velocities, errors


def extract_teme_to_itrs_operators(obstime: Time) -> Tuple[np.ndarray, np.ndarray]:
    """Compute exact (T, 3, 3) TEME->ITRS position rotation R and Coriolis velocity matrix W for obstime."""
    count = len(obstime)
    if count == 0:
        return np.empty((0, 3, 3), dtype=float), np.empty((0, 3, 3), dtype=float)

    # Transform 3 unit basis vectors (with zero TEME velocity) across all epochs in a single Astropy call.
    # For TEME -> ITRS: r_itrs = R(t) r_teme and v_itrs = R(t) v_teme + W(t) r_teme.
    basis_pos = np.zeros((3, 3, count), dtype=float)
    basis_vel = np.zeros((3, 3, count), dtype=float)
    for j in range(3):
        basis_pos[j, j, :] = 1.0

    flat_pos = basis_pos.transpose(1, 0, 2).reshape(3, 3 * count)
    flat_vel = basis_vel.transpose(1, 0, 2).reshape(3, 3 * count)
    repeated_times = Time(np.tile(obstime.jd1, 3), np.tile(obstime.jd2, 3), format="jd", scale=obstime.scale)

    teme_basis = TEME(
        CartesianRepresentation(
            flat_pos * u.km,
            differentials=CartesianDifferential(flat_vel * (u.km / u.s)),
        ),
        obstime=repeated_times,
    )
    itrs_basis = teme_basis.transform_to(ITRS(obstime=repeated_times))
    out_r = itrs_basis.cartesian.xyz.to_value(u.km).reshape(3, 3, count).transpose(2, 0, 1)
    out_w = itrs_basis.cartesian.differentials["s"].d_xyz.to_value(u.km / u.s).reshape(3, 3, count).transpose(2, 0, 1)
    return out_r, out_w


def propagate_records_batch(
    records: List[Dict[str, Any]],
    utc_times: List[datetime],
    prepared_obstime: Time,
    skip_cat_id: Optional[str] = None,
    skip_if_matching_cat_id: bool = False,
) -> Tuple[List[Dict[str, Any]], List[np.ndarray], List[np.ndarray], int, List[Dict[str, Any]]]:
    """Fast batch SGP4 + TEME->ITRS propagation computing Astropy frame operators once per time grid."""
    count = len(utc_times)
    if count == 0 or not records:
        return [], [], [], 0, []

    r_ops, w_ops = extract_teme_to_itrs_operators(prepared_obstime)
    jd1 = np.atleast_1d(np.asarray(prepared_obstime.jd1, dtype=float))
    jd2 = np.atleast_1d(np.asarray(prepared_obstime.jd2, dtype=float))
    ts_iso = [t.isoformat().replace("+00:00", "Z") for t in utc_times]

    valid_records: List[Dict[str, Any]] = []
    positions: List[np.ndarray] = []
    velocities: List[np.ndarray] = []
    errors: List[Dict[str, Any]] = []
    propagated_count = 0

    for record in records:
        rec_cat_id = str(record.get("catalog_identifier") or record.get("norad_id") or "")
        if skip_if_matching_cat_id and skip_cat_id and rec_cat_id == skip_cat_id:
            continue
        try:
            satellite = build_satrec_from_record(record)
            error_codes, raw_pos, raw_vel = satellite.sgp4_array(jd1, jd2)
        except (KeyError, ValueError, RuntimeError):
            errors.append({
                "norad_id": record.get("norad_id"),
                "catalog_identifier": record.get("catalog_identifier"),
                "error": "Propagation setup failed.",
            })
            continue

        valid_mask = (
            (error_codes == 0)
            & np.isfinite(raw_pos).all(axis=1)
            & np.isfinite(raw_vel).all(axis=1)
        )
        if not valid_mask.all():
            for idx in np.where(~valid_mask)[0]:
                errors.append({
                    "norad_id": record.get("norad_id"),
                    "catalog_identifier": record.get("catalog_identifier"),
                    "timestamp": ts_iso[idx],
                    "error": f"SGP4 error code {int(error_codes[idx])}",
                })

        if valid_mask.any():
            pos_out = np.full((count, 3), np.nan, dtype=float)
            vel_out = np.full((count, 3), np.nan, dtype=float)
            rp = raw_pos[valid_mask]
            rv = raw_vel[valid_mask]
            rm = r_ops[valid_mask]
            wm = w_ops[valid_mask]
            pos_out[valid_mask] = np.einsum("tij,tj->ti", rm, rp)
            vel_out[valid_mask] = np.einsum("tij,tj->ti", rm, rv) + np.einsum("tij,tj->ti", wm, rp)
            valid_records.append(record)
            positions.append(pos_out)
            velocities.append(vel_out)
            propagated_count += 1

    return valid_records, positions, velocities, propagated_count, errors


def propagate_tle(
    record: Dict[str, Any],
    times: Iterable[datetime],
) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, Any]]]:
    """Backward-compatible wrapper supporting both TLE and OMM JSON records."""
    return propagate_record(record, times)


def itrs_positions_to_geodetic(
    positions_km: np.ndarray,
    times: List[datetime],
) -> List[Dict[str, Any]]:
    """Convert ITRS (km) Cartesian coordinates to WGS84 geodetic lat, lng, alt_km."""
    valid_mask = np.isfinite(positions_km).all(axis=1)
    if not valid_mask.any():
        return []
    valid_idx = np.flatnonzero(valid_mask)
    valid_times = Time([_utc(times[i]) for i in valid_idx])
    itrs = ITRS(
        CartesianRepresentation(positions_km[valid_idx].T * u.km),
        obstime=valid_times,
    )
    geodetic = itrs.earth_location.geodetic
    lats = geodetic.lat.to_value(u.deg)
    lons = geodetic.lon.to_value(u.deg)
    heights = geodetic.height.to_value(u.km)

    track: List[Dict[str, Any]] = []
    for pos_i, orig_idx in enumerate(valid_idx):
        lon_norm = ((float(lons[pos_i]) + 180.0) % 360.0) - 180.0
        track.append({
            "timestamp": _utc(times[orig_idx]).isoformat().replace("+00:00", "Z"),
            "lat": round(float(lats[pos_i]), 4),
            "lng": round(lon_norm, 4),
            "alt_km": round(float(heights[pos_i]), 2),
        })
    return track


def sample_times(start: datetime, interval_minutes: int, step_seconds: int) -> List[datetime]:
    start = _utc(start)
    count = int(interval_minutes * 60 / step_seconds) + 1
    return [start + timedelta(seconds=i * step_seconds) for i in range(count)]


def screen_candidates(
    mission_positions: np.ndarray,
    object_positions: np.ndarray,
    threshold_km: float,
) -> List[int]:
    """Return object indices found within threshold at any valid epoch."""
    valid_mission = np.isfinite(mission_positions).all(axis=1)
    result = set()
    for time_index in np.where(valid_mission)[0]:
        valid_objects = np.isfinite(object_positions[time_index]).all(axis=1)
        if not valid_objects.any():
            continue
        valid_indices = np.flatnonzero(valid_objects)
        tree = cKDTree(object_positions[time_index, valid_indices])
        matched = tree.query_ball_point(mission_positions[time_index], threshold_km)
        result.update(valid_indices[matched].tolist())
    return sorted(result)


def brute_force_candidates(
    mission_positions: np.ndarray,
    object_positions: np.ndarray,
    threshold_km: float,
) -> List[int]:
    distances = np.linalg.norm(object_positions - mission_positions[:, None, :], axis=2)
    return sorted(np.where(np.isfinite(distances).any(axis=0) & (distances <= threshold_km).any(axis=0))[0].tolist())


def _state_at(
    evaluator: Tuple[StateEvaluator, StateEvaluator],
    mission_time: datetime,
    object_time: datetime,
) -> Tuple[float, np.ndarray, np.ndarray]:
    mission_position, mission_velocity = evaluator[0](_utc(mission_time))
    object_position, object_velocity = evaluator[1](_utc(object_time))
    relative_position = object_position - mission_position
    relative_velocity = object_velocity - mission_velocity
    return float(np.linalg.norm(relative_position)), relative_position, relative_velocity


def _refine_tca(
    times: List[datetime],
    sampled_distances: np.ndarray,
    sampled_index: int,
    evaluators: Optional[Tuple[StateEvaluator, StateEvaluator]],
    tolerance_seconds: float,
) -> Dict[str, Any]:
    sampled_time = _utc(times[sampled_index])
    sampled_result = {
        "tca": sampled_time.isoformat().replace("+00:00", "Z"),
        "minimum_separation_km": float(sampled_distances[sampled_index]),
        "relative_position_km": None,
        "relative_velocity_kms": None,
        "refinement_method": "sampled_grid_minimum",
        "time_tolerance_seconds": tolerance_seconds,
    }
    if evaluators is None or sampled_index == 0 or sampled_index == len(times) - 1:
        return sampled_result
    left = _utc(times[sampled_index - 1])
    right = _utc(times[sampled_index + 1])
    origin = sampled_time

    def objective(offset_seconds: float) -> float:
        when = origin + timedelta(seconds=float(offset_seconds))
        return _state_at(evaluators, when, when)[0]

    result = minimize_scalar(
        objective,
        bounds=((left - origin).total_seconds(), (right - origin).total_seconds()),
        method="bounded",
        options={"xatol": tolerance_seconds},
    )
    refined_time = origin + timedelta(seconds=float(result.x))
    distance, relative_position, relative_velocity = _state_at(evaluators, refined_time, refined_time)
    if not np.isfinite(distance):
        return sampled_result
    return {
        "tca": refined_time.isoformat().replace("+00:00", "Z"),
        "minimum_separation_km": distance,
        "relative_position_km": relative_position,
        "relative_velocity_kms": float(np.linalg.norm(relative_velocity)),
        "refinement_method": "bounded_scalar_minimize_sgp4_state",
        "time_tolerance_seconds": tolerance_seconds,
    }


def _build_encounter_entry(
    index: int,
    mission_positions: np.ndarray,
    object_records: List[Dict[str, Any]],
    object_positions: np.ndarray,
    times: List[datetime],
    threshold_km: float,
    mission_velocities: Optional[np.ndarray],
    object_velocities: Optional[np.ndarray],
    state_evaluators: Optional[List[Tuple[StateEvaluator, StateEvaluator]]],
    refinement_time_tolerance_seconds: float,
) -> Optional[Dict[str, Any]]:
    relative = object_positions[:, index, :] - mission_positions
    distances = np.linalg.norm(relative, axis=1)
    valid = np.isfinite(distances)
    if not valid.any():
        return None
    sampled_index = int(np.nanargmin(distances))
    sampled_velocity = None
    if mission_velocities is not None and object_velocities is not None:
        relative_velocity = object_velocities[sampled_index, index] - mission_velocities[sampled_index]
        if np.isfinite(relative_velocity).all():
            sampled_velocity = float(np.linalg.norm(relative_velocity))
    evaluator_pair = state_evaluators[index] if state_evaluators else None
    refined = _refine_tca(
        times, distances, sampled_index, evaluator_pair, refinement_time_tolerance_seconds
    )
    if refined["relative_position_km"] is None:
        refined["relative_position_km"] = relative[sampled_index]
    if refined["relative_velocity_kms"] is None:
        refined["relative_velocity_kms"] = sampled_velocity
    rec = object_records[index]
    return {
        "norad_id": rec.get("norad_id"),
        "catalog_identifier": rec.get("catalog_identifier") or str(rec.get("norad_id") or ""),
        "name": rec.get("name"),
        "format": rec.get("format"),
        "catalog_group": rec.get("catalog_group"),
        "inclination_deg": rec.get("inclination_deg"),
        "altitude_km": rec.get("altitude_km"),
        "tca": refined["tca"],
        "minimum_separation_km": round(float(refined["minimum_separation_km"]), 6),
        "refined_tca": refined["tca"],
        "refined_minimum_separation_km": round(float(refined["minimum_separation_km"]), 6),
        "relative_position_km": [
            round(float(value), 6) for value in refined["relative_position_km"]
        ],
        "relative_velocity_kms": (
            round(float(refined["relative_velocity_kms"]), 9)
            if refined["relative_velocity_kms"] is not None else None
        ),
        "sampled_tca": _utc(times[sampled_index]).isoformat().replace("+00:00", "Z"),
        "sampled_minimum_separation_km": round(float(distances[sampled_index]), 6),
        "screening_threshold_km": threshold_km,
        "within_threshold": float(refined["minimum_separation_km"]) <= threshold_km,
        "refinement_method": refined["refinement_method"],
        "time_tolerance_seconds": refinement_time_tolerance_seconds,
    }


def analyze_encounters(
    mission_positions: np.ndarray,
    object_records: List[Dict[str, Any]],
    object_positions: np.ndarray,
    times: List[datetime],
    threshold_km: float,
    mission_velocities: Optional[np.ndarray] = None,
    object_velocities: Optional[np.ndarray] = None,
    state_evaluators: Optional[List[Tuple[StateEvaluator, StateEvaluator]]] = None,
    refinement_time_tolerance_seconds: float = 1.0,
) -> List[Dict[str, Any]]:
    candidate_indices = screen_candidates(mission_positions, object_positions, threshold_km)
    encounters = []
    for index in candidate_indices:
        entry = _build_encounter_entry(
            index,
            mission_positions,
            object_records,
            object_positions,
            times,
            threshold_km,
            mission_velocities,
            object_velocities,
            state_evaluators,
            refinement_time_tolerance_seconds,
        )
        if entry is not None:
            encounters.append(entry)
    return sorted(encounters, key=lambda item: item["minimum_separation_km"])


def summarize_closest_screened(
    mission_positions: np.ndarray,
    object_records: List[Dict[str, Any]],
    object_positions: np.ndarray,
    times: List[datetime],
    threshold_km: float,
    mission_velocities: Optional[np.ndarray] = None,
    object_velocities: Optional[np.ndarray] = None,
    top_n: int = 10,
) -> List[Dict[str, Any]]:
    """Return top-N closest catalog objects over the window regardless of threshold."""
    if object_positions.size == 0:
        return []
    diff = object_positions - mission_positions[:, None, :]
    distances = np.linalg.norm(diff, axis=2)
    valid_any = np.isfinite(distances).any(axis=0)
    valid_indices = np.flatnonzero(valid_any)
    if valid_indices.size == 0:
        return []

    min_dists = np.array([float(np.nanmin(distances[:, idx])) for idx in valid_indices])
    order = np.argsort(min_dists)[:top_n]
    closest: List[Dict[str, Any]] = []
    for pos in order:
        idx = int(valid_indices[pos])
        entry = _build_encounter_entry(
            idx,
            mission_positions,
            object_records,
            object_positions,
            times,
            threshold_km,
            mission_velocities,
            object_velocities,
            None,
            1.0,
        )
        if entry is not None:
            closest.append(entry)
    return closest
