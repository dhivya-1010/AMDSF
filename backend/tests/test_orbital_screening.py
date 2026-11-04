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
from app.services.celestrak_service import CelestrakService, checksum_valid, parse_tle_record


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
    positions, velocities, errors = propagate_tle(record, times)
    assert positions.shape == (1, 3)
    assert velocities.shape == (1, 3)
    assert np.isfinite(positions).all()
    assert np.isfinite(velocities).all()
    assert errors == []


def test_tca_reports_minimum_separation_and_utc():
    times = [datetime(2024, 1, 1, tzinfo=timezone.utc) + timedelta(minutes=i) for i in range(3)]
    mission = np.zeros((3, 3))
    objects = np.array([[[5, 0, 0]], [[2, 0, 0]], [[4, 0, 0]]], dtype=float)
    result = analyze_encounters(mission, [{"name": "TEST", "norad_id": 1}], objects, times, 10)
    assert result[0]["minimum_separation_km"] == 2.0
    assert result[0]["tca"] == "2024-01-01T00:01:00Z"


def test_relative_velocity_is_calculated():
    times = [datetime(2024, 1, 1, tzinfo=timezone.utc) + timedelta(minutes=i) for i in range(3)]
    mission = np.zeros((3, 3))
    objects = np.array([[[5, 0, 0]], [[2, 0, 0]], [[4, 0, 0]]], dtype=float)
    mission_velocity = np.zeros((3, 3))
    object_velocity = np.array([[[3, 4, 0]], [[3, 4, 0]], [[3, 4, 0]]], dtype=float)
    result = analyze_encounters(
        mission, [{"name": "TEST", "norad_id": 1}], objects, times, 10,
        mission_velocities=mission_velocity, object_velocities=object_velocity,
    )
    assert result[0]["relative_velocity_kms"] == 5.0


def test_partial_propagation_failure_does_not_discard_object():
    mission = np.zeros((3, 3))
    objects = np.array([
        [[100, 100, 100], [1, 0, 0]],
        [[100, 100, 100], [np.nan, np.nan, np.nan]],
        [[100, 100, 100], [2, 0, 0]],
    ])
    assert screen_candidates(mission, objects, 5) == [1]


def test_refined_tca_uses_local_numerical_minimum():
    start = datetime(2024, 1, 1, tzinfo=timezone.utc)
    times = [start + timedelta(seconds=value) for value in (0, 10, 20)]
    mission = np.zeros((3, 3))
    objects = np.array([[[4, 0, 0]], [[1, 0, 0]], [[4, 0, 0]]], dtype=float)

    def mission_state(when):
        return np.zeros(3), np.zeros(3)

    def object_state(when):
        offset = (when - (start + timedelta(seconds=13))).total_seconds()
        return np.array([1 + offset * offset, 0, 0]), np.array([2 * offset, 0, 0])

    result = analyze_encounters(
        mission, [{"name": "TEST", "norad_id": 1}], objects, times, 10,
        state_evaluators=[(mission_state, object_state)],
        refinement_time_tolerance_seconds=0.01,
    )
    assert result[0]["sampled_minimum_separation_km"] == 1.0
    assert abs(result[0]["minimum_separation_km"] - 1.0) < 0.01
    assert result[0]["refined_minimum_separation_km"] == result[0]["minimum_separation_km"]
    assert abs((datetime.fromisoformat(result[0]["tca"].replace("Z", "+00:00")) - (start + timedelta(seconds=13))).total_seconds()) < 0.1
    assert result[0]["refinement_method"] == "bounded_scalar_minimize_sgp4_state"


def test_service_rejects_malformed_response_and_expired_cache(monkeypatch):
    service = CelestrakService()

    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {"not": "a list"}

    class Client:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def get(self, url):
            return Response()

    monkeypatch.setattr("app.services.celestrak_service.httpx.AsyncClient", lambda **kwargs: Client())
    result = __import__("asyncio").run(service.get_active_satellites_sample())
    assert result["valid_tle_count"] == 0
    assert "unavailable" in result["source"]


def test_service_counts_stale_and_future_records(monkeypatch):
    service = CelestrakService()
    now = datetime.now(timezone.utc)
    records = [
        {"kind": "current"},
        {"kind": "stale"},
        {"kind": "future"},
    ]

    def fake_parse(record):
        epochs = {
            "current": now.isoformat().replace("+00:00", "Z"),
            "stale": (now - timedelta(days=30)).isoformat().replace("+00:00", "Z"),
            "future": (now + timedelta(days=1)).isoformat().replace("+00:00", "Z"),
        }
        return {
            "norad_id": len(record["kind"]),
            "name": record["kind"],
            "tle_line1": ISS_LINE1,
            "tle_line2": ISS_LINE2,
            "epoch": epochs[record["kind"]],
        }

    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return records

    class Client:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def get(self, url):
            return Response()

    monkeypatch.setattr("app.services.celestrak_service.parse_tle_record", fake_parse)
    monkeypatch.setattr("app.services.celestrak_service.httpx.AsyncClient", lambda **kwargs: Client())
    result = __import__("asyncio").run(service.get_active_satellites_sample())
    assert result["valid_tle_count"] == 1
    assert result["stale_tle_count"] == 1
    assert result["future_tle_count"] == 1


def test_expired_cache_is_not_used(monkeypatch):
    service = CelestrakService()
    service._cache = {
        "retrieved_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat().replace("+00:00", "Z"),
        "records": [{"norad_id": 1}],
        "valid_tle_count": 1,
        "stale_tle_count": 0,
        "future_tle_count": 0,
        "invalid_tle_count": 0,
        "total_count": 1,
    }

    class Client:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def get(self, url):
            raise __import__("httpx").ConnectError("offline")

    monkeypatch.setattr("app.services.celestrak_service.httpx.AsyncClient", lambda **kwargs: Client())
    result = __import__("asyncio").run(service.get_active_satellites_sample())
    assert result["cache_expired"] is True
    assert result["records"] == []


def test_repeated_encounter_analysis_is_consistent():
    times = [datetime(2024, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=i * 10) for i in range(3)]
    mission = np.zeros((3, 3))
    objects = np.array([[[5, 0, 0]], [[2, 0, 0]], [[4, 0, 0]]], dtype=float)
    records = [{"name": "TEST", "norad_id": 1}]
    first = analyze_encounters(mission, records, objects, times, 10)
    second = analyze_encounters(mission, records, objects, times, 10)
    assert first == second


def test_missing_mission_tle_is_explicit():
    from app.agents.debris_agent.analyzer import DebrisAnalyzer

    result = DebrisAnalyzer.evaluate(
        {"valid_tle_count": 0, "source": "test"}, [],
        screening_distance_km=25, propagation_interval_minutes=1, propagation_step_seconds=1,
    )
    assert result.risk_level == "INSUFFICIENT_DATA"
    assert result.details["assessment_type"] == "preliminary_screening"
