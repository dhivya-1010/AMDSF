"""Preliminary, non-covariance conjunction screening utilities.

SGP4 produces TEME state vectors. Positions and velocities are transformed
to ITRS/ECEF with Astropy before all relative-state calculations.
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
from sgp4.api import Satrec

StateEvaluator = Callable[[datetime], Tuple[np.ndarray, np.ndarray]]


def _utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def propagate_tle(
    record: Dict[str, Any],
    times: Iterable[datetime],
) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, Any]]]:
    """Propagate a TLE at UTC epochs and return ITRS positions/velocities.

    Positions are kilometres and velocities are kilometres per second. Each
    failed epoch remains NaN so other valid epochs for the same object survive.
    """
    satellite = Satrec.twoline2rv(record["tle_line1"], record["tle_line2"])
    positions: List[List[float]] = []
    velocities: List[List[float]] = []
    errors: List[Dict[str, Any]] = []
    for when in times:
        utc = _utc(when)
        obstime = Time(utc)
        jd = obstime.jd
        jd1, jd2 = np.floor(jd), jd - np.floor(jd)
        error, position, velocity = satellite.sgp4(jd1, jd2)
        if error:
            positions.append([np.nan, np.nan, np.nan])
            velocities.append([np.nan, np.nan, np.nan])
            errors.append({
                "norad_id": record.get("norad_id"),
                "timestamp": utc.isoformat().replace("+00:00", "Z"),
                "error": f"SGP4 error code {error}",
            })
            continue
        teme = TEME(
            CartesianRepresentation(
                np.asarray(position) * u.km,
                differentials=CartesianDifferential(np.asarray(velocity) * u.km / u.s),
            ),
            obstime=obstime,
        )
        itrs = teme.transform_to(ITRS(obstime=obstime))
        positions.append(itrs.cartesian.xyz.to_value(u.km).tolist())
        velocities.append(itrs.cartesian.differentials["s"].d_xyz.to_value(u.km / u.s).tolist())
    return np.asarray(positions), np.asarray(velocities), errors


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
    evaluator: StateEvaluator,
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
        relative = object_positions[:, index, :] - mission_positions
        distances = np.linalg.norm(relative, axis=1)
        valid = np.isfinite(distances)
        if not valid.any():
            continue
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
        encounters.append({
            "norad_id": object_records[index].get("norad_id"),
            "name": object_records[index].get("name"),
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
            "refinement_method": refined["refinement_method"],
            "time_tolerance_seconds": refinement_time_tolerance_seconds,
        })
    return sorted(encounters, key=lambda item: item["minimum_separation_km"])
