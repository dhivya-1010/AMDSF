from datetime import datetime, timezone
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.agents.coverage_agent import coverage_agent
from app.agents.coverage_agent.analyzer import CoverageAnalyzer, compute_swath_from_geometry
from app.agents.debris_agent import debris_agent
from app.agents.debris_agent.analyzer import DebrisAnalyzer
from app.agents.debris_agent.orbital import (
    itrs_positions_to_geodetic,
    prepare_time_grid,
    propagate_record,
    propagate_records_batch,
    sample_times,
)
from app.agents.feasibility_agent.analyzer import FeasibilityAnalyzer
from app.agents.orchestrator import orchestrator
from app.agents.orchestrator.reasoning import CrossDomainReasoner
from app.agents.weather_agent.analyzer import WeatherAnalyzer
from app.schemas.mission import (
    CoverageSensorSchema,
    LaunchConfigurationSchema,
    MissionConstraintsSchema,
    MissionLifecycleSchema,
    MissionObjectiveSchema,
    MissionRequestSchema,
    OrbitalConfigurationSchema,
    TargetDefinitionSchema,
)
from app.services.celestrak_service import (
    CelestrakService,
    build_keplerian_design_record,
    parse_catalog_id,
    parse_omm_record,
)
from app.services.swpc_service import (
    _parse_f107_payload,
    _parse_kp_payload,
    _parse_noaa_scales,
    _parse_solar_wind_mag,
    _parse_solar_wind_speed,
)

NOW_EPOCH = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")


def _sample_omm(norad_id=123456, name="DEMO SAT", mean_motion=15.05, inc=97.6, raan=45.0):
    return {
        "OBJECT_NAME": name,
        "OBJECT_ID": "2025-999A",
        "EPOCH": NOW_EPOCH,
        "MEAN_MOTION": mean_motion,
        "ECCENTRICITY": 0.0008,
        "INCLINATION": inc,
        "RA_OF_ASC_NODE": raan,
        "ARG_OF_PERICENTER": 20.0,
        "MEAN_ANOMALY": 10.0,
        "EPHEMERIS_TYPE": 0,
        "CLASSIFICATION_TYPE": "U",
        "NORAD_CAT_ID": norad_id,
        "ELEMENT_SET_NO": 100,
        "REV_AT_EPOCH": 500,
        "BSTAR": 0.0001,
        "MEAN_MOTION_DOT": 0.0,
        "MEAN_MOTION_DDOT": 0.0,
    }


def _demo_mission(data_mode="demonstration", policy="CONDITIONAL_GO", norad_id=25544):
    return MissionRequestSchema(
        mission_id="TEST-E2E-001",
        mission_name="E2E Demonstration Verification Mission",
        objective=MissionObjectiveSchema(type="EARTH_OBSERVATION"),
        target=TargetDefinitionSchema(
            country="India",
            region="Tamil Nadu",
            area="Chennai Metropolitan Region",
            latitude=13.0827,
            longitude=80.2707,
            coverage_requirement=50.0,
            coverage_radius_km=120.0,
        ),
        launch=LaunchConfigurationSchema(
            country="India",
            site="Satish Dhawan Space Centre",
            launch_site_code="SDSC_SHAR",
            vehicle="AUTO",
        ),
        orbit=OrbitalConfigurationSchema(
            type="LEO",
            altitude_km=420.0,
            inclination_deg=51.64,
            eccentricity=0.0005,
            norad_id=norad_id,
            propagation_interval_minutes=90,
            propagation_step_seconds=60,
            screening_distance_km=50.0,
        ),
        coverage_sensor=CoverageSensorSchema(
            sensor_fov_deg=45.0,
            min_elevation_deg=10.0,
            observation_duration_hours=72.0,
            time_step_seconds=60,
            use_demonstration_sensor=True,
            enable_worldpop_lookup=False,
        ),
        mission=MissionLifecycleSchema(
            duration_days=365,
            payload_mass_kg=250.0,
            budget_musd=50.0,
        ),
        constraints=MissionConstraintsSchema(
            preferred_launch_date="2026-10-15",
            maximum_acceptable_risk="MEDIUM",
            launch_window_flexibility_days=3,
            data_mode=data_mode,
            missing_data_policy=policy,
        ),
    )


# 1. CelesTrak OMM JSON + >5-digit & Alpha-5 catalog identifiers
def test_omm_parsing_and_alpha5_extended_catalog_ids():
    assert parse_catalog_id("123456") == 123456
    assert parse_catalog_id("A0001") == 100001
    assert parse_catalog_id("T1234") == 271234
    parsed = parse_omm_record(_sample_omm(norad_id=250042, name="EXTENDED-ID DEBRIS"))
    assert parsed is not None
    assert parsed["norad_id"] == 250042
    assert parsed["format"] == "OMM_JSON"
    assert parsed["catalog_identifier"] == "250042"
    times = sample_times(datetime.now(timezone.utc), 5, 60)
    pos, vel, errors = propagate_record(parsed, times)
    assert pos.shape == (6, 3)
    assert errors == []


# 2. SGP4 geodetic conversion & multi-format ground tracks
def test_sgp4_keplerian_ground_track_geodetic_bounds():
    rec = build_keplerian_design_record(altitude_km=550.0, inclination_deg=97.6, eccentricity=0.001)
    times = sample_times(datetime.now(timezone.utc), 100, 60)
    pos, _, errors = propagate_record(rec, times)
    assert errors == []
    track = itrs_positions_to_geodetic(pos, times)
    assert len(track) == len(times)
    for pt in track:
        assert -90.0 <= pt["lat"] <= 90.0
        assert -180.0 <= pt["lng"] <= 180.0
        assert 520.0 <= pt["alt_km"] <= 590.0


# 3. Debris screening distinguishes clean screening vs missing data
@pytest.mark.anyio
async def test_debris_demo_mode_finds_real_sgp4_encounters_for_iss():
    res = await debris_agent.analyze(
        mission_id="TEST-DEB",
        target_orbit_km=420.0,
        inclination_deg=51.64,
        mission_tle={"norad_id": 25544},
        screening_distance_km=50.0,
        propagation_interval_minutes=60,
        propagation_step_seconds=60,
        data_mode="demonstration",
    )
    assert res.status == "completed"
    assert res.data_mode == "DEMONSTRATION DATA"
    assert res.objects_analyzed > 0
    assert res.risk_level in ("HIGH", "MEDIUM", "LOW")
    assert "Conjunction Data Messages" in res.details["assessment_disclaimer"]


def test_debris_clean_screening_with_zero_encounters_is_low_not_insufficient():
    res = DebrisAnalyzer.evaluate(
        catalog_data={"valid_tle_count": 50, "catalog_propagated_object_count": 50, "source": "TestCatalog"},
        encounters=[],
        screening_distance_km=25.0,
        mission_propagated=True,
    )
    assert res.status == "completed"
    assert res.risk_level == "LOW"
    assert res.risk_score == 0.1
    assert res.nearby_objects == 0


# 4. NOAA SWPC modern dict format & partial/unavailable weather behavior
def test_swpc_dict_parsers_and_weather_never_nominal_when_unavailable():
    kp_parsed = _parse_kp_payload([
        {"time_tag": "2026-11-12T03:00:00", "Kp": 2.67, "a_running": 12, "station_count": 8},
        {"time_tag": "2026-11-12T06:00:00", "Kp": 4.33, "a_running": 27, "station_count": 8},
    ])
    assert kp_parsed["latest_kp"] == 4.33
    assert _parse_f107_payload([{"flux": 148, "time_tag": "2026-11-12T00:00:00"}])["solar_flux_f107"] == 148.0
    assert _parse_noaa_scales({"0": {"R": {"Scale": "1", "Text": "minor"}}})["R"]["Scale"] == "1"
    assert _parse_solar_wind_speed([{"proton_speed": 512}]) == 512.0
    assert _parse_solar_wind_mag([{"bt": 8.0, "bz_gsm": -4.5}])["solar_wind_bz_gsm"] == -4.5

    # Partial: SWPC valid, DONKI unavailable -> partial, NOT nominal without kp
    partial = WeatherAnalyzer.evaluate(
        {"source": "NOAA SWPC", "status": "available", "data_mode": "LIVE DATA", "latest_kp": 2.0},
        {"source": "NASA DONKI", "status": "unavailable", "data_mode": "UNAVAILABLE", "events_count": None},
    )
    assert partial.status == "partial"
    assert partial.kp_index == 2.0

    # SWPC unavailable -> UNAVAILABLE, never NOMINAL
    unavail = WeatherAnalyzer.evaluate(
        {"source": "NOAA SWPC", "status": "unavailable", "latest_kp": None},
        {"source": "NASA DONKI", "status": "available", "events_count": 2},
    )
    assert unavail.status == "unavailable"
    assert unavail.data_mode == "UNAVAILABLE"
    assert unavail.solar_activity == "UNAVAILABLE"


# 5. Coverage swath trigonometry from FOV + altitude
def test_swath_geometry_calculation():
    swath = compute_swath_from_geometry(altitude_km=550.0, sensor_fov_deg=45.0, min_elevation_deg=10.0)
    # nadir half-angle 22.5 deg from 550 km -> ~465 km ground swath
    assert 430.0 <= swath["swath_width_km"] <= 520.0
    assert swath["horizon_limited"] is False


# 6 & 7. Coverage SGP4 orbital propagation, multi-pass revisit & WorldPop unavailable honesty
@pytest.mark.anyio
async def test_coverage_sgp4_ground_track_access_windows_and_revisit():
    res = await coverage_agent.analyze(
        mission_id="TEST-COV",
        target_country="India",
        target_region="Tamil Nadu",
        target_area="Chennai",
        latitude=13.0827,
        longitude=80.2707,
        coverage_requirement=40.0,
        coverage_radius_km=150.0,
        target_orbit_km=550.0,
        inclination_deg=97.6,
        sensor_fov_deg=60.0,
        min_elevation_deg=10.0,
        observation_duration_hours=72.0,
        time_step_seconds=60,
        enable_worldpop_lookup=False,
        data_mode="demonstration",
    )
    assert res.status == "completed"
    assert res.details["validated_orbital_coverage"] is True
    assert len(res.details["ground_track"]) > 30
    assert res.swath_width_km > 400.0
    assert res.coverage_percent is not None and res.coverage_percent > 0.0
    assert len(res.details["access_windows"]) >= 2
    assert res.revisit_time_minutes is not None and res.revisit_time_minutes > 60
    # Population wasn't queried -> strictly None / unavailable, never invented
    assert res.population_served is None
    assert res.details["population_data_status"] in ("unavailable", "disabled")


# 8. Feasibility configurable costs, sites (JSLC/TNSC), and incompatibility handling
def test_feasibility_costs_and_site_compatibility():
    res = FeasibilityAnalyzer.evaluate(
        payload_mass_kg=400.0,
        target_orbit_km=600.0,
        mission_duration_days=730,
        budget_m=60.0,
        launch_site="Jiuquan Satellite Launch Center",
        launch_site_code="JSLC",
        launch_vehicle_pref="AUTO",
        launch_cost_musd=30.0,
        satellite_manufacturing_cost_musd=10.0,
        annual_operations_cost_musd=2.0,
    )
    assert res.feasible is True
    assert res.estimated_cost_m == 44.0  # 30 + 10 + 2 * 2yrs
    assert res.details["cost_breakdown_musd"]["launch"] == 30.0

    # Incompatible vehicle returns clean infeasible result instead of raising 500
    bad_veh = FeasibilityAnalyzer.evaluate(
        payload_mass_kg=100.0,
        target_orbit_km=500.0,
        mission_duration_days=365,
        budget_m=50.0,
        launch_site_code="VANDENBERG",
        launch_vehicle_pref="NonExistentRocket-99",
    )
    assert bad_veh.feasible is False
    assert bad_veh.budget_status == "NO_COMPATIBLE_VEHICLE"


# 9. Orchestrator GO / CONDITIONAL GO / HOLD decision engine
def test_orchestrator_decisions_go_conditional_and_hold():
    mission = _demo_mission(data_mode="live", policy="CONDITIONAL_GO")
    debris_ok = DebrisAnalyzer.evaluate(
        {"valid_tle_count": 20, "catalog_propagated_object_count": 20, "source": "CelesTrak", "data_mode": "LIVE DATA"},
        [],
        screening_distance_km=25.0,
        mission_propagated=True,
    )
    weather_ok = WeatherAnalyzer.evaluate(
        {"source": "NOAA SWPC", "status": "available", "data_mode": "LIVE DATA", "latest_kp": 2.0},
        {"source": "NASA DONKI", "status": "available", "data_mode": "LIVE DATA", "events_count": 0},
    )
    feas_ok = FeasibilityAnalyzer.evaluate(250.0, 420.0, 365, 50.0, launch_site_code="SDSC_SHAR")
    cov_ok = CoverageAnalyzer.evaluate_orbital_coverage(
        positions_itrs_km=propagate_record(build_keplerian_design_record(420.0, 51.64), sample_times(datetime.now(timezone.utc), 4320, 60))[0],
        times=sample_times(datetime.now(timezone.utc), 4320, 60),
        orbit_source="celestrak_gp_catnr_live",
        orbit_record={"inclination_deg": 51.64},
        target_country="India",
        target_region="TN",
        target_area="Chennai",
        latitude=13.0827,
        longitude=80.2707,
        coverage_requirement=40.0,
        coverage_radius_km=120.0,
        target_orbit_km=420.0,
        inclination_deg=51.64,
        objective_type="EARTH_OBSERVATION",
        sensor_fov_deg=60.0,
        min_elevation_deg=10.0,
        use_demonstration_sensor=False,
        observation_duration_hours=72.0,
        time_step_seconds=60,
        worldpop_data={"available": True, "population": 5000000, "status": "available"},
        data_mode="LIVE DATA",
    )

    go_res = CrossDomainReasoner.synthesize(mission, debris_ok, weather_ok, feas_ok, cov_ok)
    assert go_res.recommendation.decision == "GO"
    assert go_res.recommendation.reason
    assert len(go_res.recommendation.supporting_evidence) >= 4
    assert len(go_res.chart_data["launch_window_comparison"]) >= 3
    assert len(go_res.map_data["ground_track"]) > 10

    # Storm triggers HOLD
    weather_storm = WeatherAnalyzer.evaluate(
        {"source": "NOAA SWPC", "status": "available", "data_mode": "LIVE DATA", "latest_kp": 7.0},
        {"source": "NASA DONKI", "status": "available", "data_mode": "LIVE DATA", "events_count": 3},
    )
    hold_res = CrossDomainReasoner.synthesize(mission, debris_ok, weather_storm, feas_ok, cov_ok)
    assert hold_res.recommendation.decision == "HOLD"


# 10. Full E2E Demonstration Orchestration + FastAPI TestClient endpoints
@pytest.mark.anyio
async def test_full_orchestrator_offline_demonstration_mode():
    mission = _demo_mission(data_mode="demonstration", policy="CONDITIONAL_GO")
    res = await orchestrator.execute_mission_analysis(mission)
    assert res["debris"]["data_mode"] == "DEMONSTRATION DATA"
    assert res["weather"]["data_mode"] == "DEMONSTRATION DATA"
    assert res["coverage"]["coverage_percent"] is not None
    assert res["recommendation"]["decision"] in ("CONDITIONAL GO", "HOLD", "GO")
    assert res["recommendation"]["required_next_actions"]
    assert res["map_data"]["data_status"] == "available"


def test_fastapi_endpoints_lifecycle_and_validation(tmp_path, monkeypatch):
    import app.api.routes.mission as mission_routes

    monkeypatch.setattr(mission_routes, "STORE_PATH", tmp_path / "missions_store.json")
    client = TestClient(app)

    h = client.get("/api/health")
    assert h.status_code == 200
    assert h.json()["status"] == "OPERATIONAL"
    assert h.json()["sources"]["demo_datasets_ready"] is True

    # 404 on non-existent mission
    assert client.get("/api/missions/DOES-NOT-EXIST").status_code == 404

    # Create mission and run individual + orchestrate in demonstration mode
    payload = _demo_mission(data_mode="demonstration").model_dump()
    payload["mission_id"] = None
    created = client.post("/api/missions", json=payload)
    assert created.status_code == 201
    mid = created.json()["mission_id"]

    cov_resp = client.post(f"/api/missions/{mid}/analyze/coverage?data_mode=demonstration")
    assert cov_resp.status_code == 200
    assert cov_resp.json()["details"]["validated_orbital_coverage"] is True

    orch_resp = client.post(f"/api/missions/{mid}/analyze/orchestrate?data_mode=demonstration")
    assert orch_resp.status_code == 200
    body = orch_resp.json()
    assert body["recommendation"]["decision"] in ("CONDITIONAL GO", "HOLD", "GO")
    assert len(body["map_data"]["ground_track"]) > 20


def test_batch_propagation_matches_single_object_reference():
    import numpy as np

    recs = [
        parse_omm_record(_sample_omm(norad_id=11111, name="OBJ-A", raan=10.0)),
        parse_omm_record(_sample_omm(norad_id=222222, name="OBJ-B", raan=85.0)),
    ]
    times = sample_times(datetime.now(timezone.utc), 30, 120)
    utc_times, prep_t = prepare_time_grid(times)

    valid, batch_pos, batch_vel, prop_count, errs = propagate_records_batch(recs, utc_times, prep_t)
    assert prop_count == 2
    assert len(valid) == 2
    assert errs == []

    for i, rec in enumerate(recs):
        ref_pos, ref_vel, ref_err = propagate_record(rec, utc_times, prepared_obstime=prep_t, prepared_utc_times=utc_times)
        assert ref_err == []
        assert np.max(np.abs(batch_pos[i] - ref_pos)) < 1e-10
        assert np.max(np.abs(batch_vel[i] - ref_vel)) < 1e-10
