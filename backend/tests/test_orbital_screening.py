from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys

import numpy as np

sys.path.insert(0, str(Path(__file__).parents[1]))

from app.agents.debris_agent.orbital import (
    brute_force_candidates,
    analyze_encounters,
    propagate_tle,
    screen_candidates,
    sample_times,
)
from app.services.celestrak_service import checksum_valid, parse_tle_record


ISS_LINE1 = "1 25544U 98067A   24001.00000000  .00010000  00000-0  18000-3 0  9990"
ISS_LINE2 = "2 25544  51.6400 120.0000 0005000  20.0000  40.0000 15.50000000123458"


def test_tle_checksum_and_parse():
    assert checksum_valid(ISS_LINE1)
    assert checksum_valid(ISS_LINE2)
    record = parse_tle_record({
        "OBJECT_NAME": "ISS", "NORAD_CAT_ID": 25544,
        "TLE_LINE1": ISS_LINE1, "TLE_LINE2": ISS_LINE2,
    })
    assert record["norad_id"] == 25544
    assert record["epoch"].endswith("Z")


def test_invalid_tle_is_rejected():
    assert not checksum_valid(ISS_LINE1[:-1] + "1")
    assert parse_tle_record({"TLE_LINE1": "bad", "TLE_LINE2": "bad"}) is None


def test_kdtree_matches_brute_force():
    rng = np.random.default_rng(42)
    mission = rng.normal(size=(5, 3)) * 100
    objects = rng.normal(size=(5, 12, 3)) * 100
    threshold = 50.0
    assert screen_candidates(mission, objects, threshold) == brute_force_candidates(mission, objects, threshold)


def test_sample_times_is_utc_and_reproducible():
    start = datetime(2024, 1, 1, tzinfo=timezone.utc)
    times = sample_times(start, 2, 60)
    assert len(times) == 3
    assert all(item.tzinfo == timezone.utc for item in times)
    assert times == sample_times(start, 2, 60)


def test_sgp4_propagation_returns_finite_itrs_positions():
    record = parse_tle_record({
        "OBJECT_NAME": "ISS", "NORAD_CAT_ID": 25544,
        "TLE_LINE1": ISS_LINE1, "TLE_LINE2": ISS_LINE2,
    })
    times = [datetime(2024, 1, 1, tzinfo=timezone.utc)]
    positions, errors = propagate_tle(record, times)
    assert positions.shape == (1, 3)
    assert np.isfinite(positions).all()
    assert errors == []


def test_tca_reports_minimum_separation_and_utc():
    times = [datetime(2024, 1, 1, tzinfo=timezone.utc) + timedelta(minutes=i) for i in range(3)]
    mission = np.zeros((3, 3))
    objects = np.array([[[5, 0, 0]], [[2, 0, 0]], [[4, 0, 0]]], dtype=float)
    result = analyze_encounters(mission, [{"name": "TEST", "norad_id": 1}], objects, times, 10)
    assert result[0]["minimum_separation_km"] == 2.0
    assert result[0]["tca"] == "2024-01-01T00:01:00Z"
