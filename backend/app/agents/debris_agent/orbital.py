"""TLE propagation and preliminary, non-covariance conjunction screening."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Tuple

import numpy as np
from astropy import units as u
from astropy.coordinates import TEME, CartesianRepresentation, EarthLocation, ITRS
from astropy.time import Time
from scipy.spatial import cKDTree
from sgp4.api import Satrec


def propagate_tle(record: Dict[str, Any], times: Iterable[datetime]) -> Tuple[np.ndarray, List[str]]:
    satellite = Satrec.twoline2rv(record["tle_line1"], record["tle_line2"])
    positions: List[List[float]] = []
    errors: List[str] = []
    for when in times:
        utc = when.astimezone(timezone.utc)
        jd = Time(utc).jd
        jd1, jd2 = np.floor(jd), jd - np.floor(jd)
        error, position, _ = satellite.sgp4(jd1, jd2)
        if error:
            positions.append([np.nan, np.nan, np.nan])
            errors.append(f"{record.get('norad_id')}: SGP4 error code {error}")
            continue
        teme = TEME(
            CartesianRepresentation(np.array(position) * u.km),
            obstime=Time(utc),
        )
        itrs = teme.transform_to(ITRS(obstime=Time(utc)))
        xyz = itrs.cartesian.xyz.to_value(u.km)
        positions.append(xyz.tolist())
    return np.asarray(positions, dtype=float), errors


def sample_times(start: datetime, interval_minutes: int, step_seconds: int) -> List[datetime]:
    start = start.astimezone(timezone.utc)
    count = int(interval_minutes * 60 / step_seconds) + 1
    return [start + timedelta(seconds=i * step_seconds) for i in range(count)]


def screen_candidates(mission_positions: np.ndarray, object_positions: np.ndarray, threshold_km: float) -> List[int]:
    valid_mission = np.isfinite(mission_positions).all(axis=1)
    valid_object = np.isfinite(object_positions).all(axis=(0, 2))
    result = set()
    for index in np.where(valid_mission)[0]:
        tree = cKDTree(object_positions[index][valid_object])
        object_indices = np.where(valid_object)[0][tree.query_ball_point(mission_positions[index], threshold_km)]
        result.update(object_indices.tolist())
    return sorted(result)


def brute_force_candidates(mission_positions: np.ndarray, object_positions: np.ndarray, threshold_km: float) -> List[int]:
    distances = np.linalg.norm(object_positions - mission_positions[:, None, :], axis=2)
    return sorted(np.where(np.isfinite(distances).any(axis=0) & (distances <= threshold_km).any(axis=0))[0].tolist())


def analyze_encounters(
    mission_positions: np.ndarray,
    object_records: List[Dict[str, Any]],
    object_positions: np.ndarray,
    times: List[datetime],
    threshold_km: float,
) -> List[Dict[str, Any]]:
    candidate_indices = screen_candidates(mission_positions, object_positions, threshold_km)
    encounters = []
    for index in candidate_indices:
        relative = object_positions[:, index, :] - mission_positions
        distances = np.linalg.norm(relative, axis=1)
        valid = np.isfinite(distances)
        if not valid.any():
            continue
        tca_index = int(np.nanargmin(distances))
        encounters.append({
            "norad_id": object_records[index].get("norad_id"),
            "name": object_records[index].get("name"),
            "tca": times[tca_index].isoformat().replace("+00:00", "Z"),
            "minimum_separation_km": round(float(distances[tca_index]), 6),
            "relative_position_km": [round(float(value), 6) for value in relative[tca_index]],
            "screening_threshold_km": threshold_km,
        })
    return sorted(encounters, key=lambda item: item["minimum_separation_km"])
