import math
from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.ml.encounter_risk import (
    CLASS_LABELS,
    EncounterRiskPredictor,
    generate_synthetic_encounter_dataset,
    train_ngboost_model,
)
from app.agents.coverage_agent.models import CoverageAnalysisResult
from app.agents.debris_agent.models import DebrisAnalysisResult
from app.agents.feasibility_agent.models import FeasibilityAnalysisResult
from app.agents.orchestrator import orchestrator
from app.agents.orchestrator.reasoning import CrossDomainReasoner
from app.agents.weather_agent.models import WeatherAnalysisResult
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


def _sample_mission(norad_id=25544, data_mode="demonstration"):
    return MissionRequestSchema(
        mission_id="TEST-ML-001",
        mission_name="NGBoost Orchestration Test",
        objective=MissionObjectiveSchema(type="EARTH_OBSERVATION"),
        target=TargetDefinitionSchema(
            country="India",
            region="Tamil Nadu",
            area="Chennai",
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
            missing_data_policy="CONDITIONAL_GO",
        ),
    )


def test_synthetic_dataset_and_ngboost_training(tmp_path):
    dataset = generate_synthetic_encounter_dataset(n_samples=300, seed=42)
    meta = dataset["metadata"]
    assert meta["is_synthetic"] is True
    assert meta["data_mode"] == "DEMONSTRATION"
    assert len(dataset["records"]) == 300
    for cls_name in CLASS_LABELS:
        assert meta["class_counts"][cls_name] >= 50

    bundle = train_ngboost_model(save_artifacts=False, n_samples=300, seed=42)
    assert bundle["model_name"] == "NGBoost"
    assert bundle["estimator_class"] == "NGBClassifier"
    assert bundle["distribution"] == "k_categorical(3)"
    metrics = bundle["evaluation_metrics"]
    assert 0.5 <= metrics["accuracy"] <= 1.0
    assert 0.5 <= metrics["f1_score"] <= 1.0
    assert metrics["log_loss"] > 0.0
    assert len(metrics["confusion_matrix"]) == 3
    assert metrics["train_samples"] + metrics["test_samples"] == 300


def test_ngboost_serialization_loading_and_classification(tmp_path):
    artifact = tmp_path / "test_ngboost.joblib"
    predictor = EncounterRiskPredictor(artifact_path=artifact)
    bundle = predictor.ensure_loaded(force_retrain=True)
    assert bundle["model_name"] == "NGBoost"

    # Reload via a brand new predictor instance using serialized artifact only
    reloaded = EncounterRiskPredictor(artifact_path=artifact)
    high = reloaded.predict(
        closest_approach_distance=0.45,
        relative_velocity=14.2,
        orbital_altitude=720.0,
        orbital_inclination=98.0,
    )
    low = reloaded.predict(
        closest_approach_distance=38.0,
        relative_velocity=2.5,
        orbital_altitude=420.0,
        orbital_inclination=51.6,
    )
    assert high["model"] == "NGBoost"
    assert high["prediction"] == "HIGH RISK"
    assert low["prediction"] == "LOW RISK"
    assert math.isclose(sum(high["probabilities"].values()), 1.0, abs_tol=1e-2)
    assert math.isclose(sum(low["probabilities"].values()), 1.0, abs_tol=1e-2)
    assert 0.0 <= high["uncertainty"]["normalized_entropy"] <= 1.0
    assert high["data_mode"] == "DEMONSTRATION"


def test_ngboost_rejects_invalid_and_missing_inputs():
    predictor = EncounterRiskPredictor()
    for bad_kwargs in [
        {"closest_approach_distance": None, "relative_velocity": 8.0, "orbital_altitude": 550.0, "orbital_inclination": 53.0},
        {"closest_approach_distance": 0.0, "relative_velocity": 8.0, "orbital_altitude": 550.0, "orbital_inclination": 53.0},
        {"closest_approach_distance": -2.0, "relative_velocity": 8.0, "orbital_altitude": 550.0, "orbital_inclination": 53.0},
        {"closest_approach_distance": float("nan"), "relative_velocity": 8.0, "orbital_altitude": 550.0, "orbital_inclination": 53.0},
        {"closest_approach_distance": 3.0, "relative_velocity": 8.0, "orbital_altitude": 550.0, "orbital_inclination": 220.0},
    ]:
        with pytest.raises(ValueError):
            predictor.predict(**bad_kwargs)


def test_fastapi_ml_predict_risk_and_model_info():
    client = TestClient(app)

    info_resp = client.get("/api/ml/model-info")
    assert info_resp.status_code == 200
    info = info_resp.json()
    assert info["model"] == "NGBoost"
    assert info["data_mode"] == "DEMONSTRATION"
    assert "accuracy" in info["evaluation_metrics"]

    resp = client.post(
        "/api/ml/predict-risk",
        json={
            "closest_approach_distance": 2.5,
            "relative_velocity": 10.2,
            "orbital_altitude": 550,
            "orbital_inclination": 53.0,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["model"] == "NGBoost"
    assert data["prediction"] in CLASS_LABELS
    assert set(data["probabilities"].keys()) == {"low", "medium", "high"}
    assert math.isclose(sum(data["probabilities"].values()), 1.0, abs_tol=1e-2)
    assert data["data_mode"] == "DEMONSTRATION"
    assert "explanation" in data and len(data["explanation"]) > 10

    bad_resp = client.post(
        "/api/ml/predict-risk",
        json={
            "closest_approach_distance": -1.0,
            "relative_velocity": 10.2,
            "orbital_altitude": 550,
            "orbital_inclination": 53.0,
        },
    )
    assert bad_resp.status_code == 422


@pytest.mark.anyio
async def test_orchestrator_integrates_ngboost_without_overriding_sgp4():
    res = await orchestrator.execute_mission_analysis(_sample_mission(data_mode="demonstration"))
    ml_out = res.get("ml_encounter_risk")
    assert ml_out is not None
    assert ml_out["model"] == "NGBoost"
    assert ml_out["status"] == "completed"
    assert ml_out["prediction"] in CLASS_LABELS
    assert "ml_encounter_risk" in res["orchestrator"]["agent_consensus"]
    assert res["recommendation"]["ml_encounter_risk"]["prediction"] == ml_out["prediction"]

    # Missing SGP4 debris data must NOT become LOW RISK even with ML attached
    bad_debris = DebrisAnalysisResult(
        mission_id="TEST-BAD",
        status="insufficient_data",
        data_mode="UNAVAILABLE",
        objects_analyzed=0,
        nearby_objects=0,
        risk_level="INSUFFICIENT_DATA",
        risk_score=None,
        data_source="CelesTrak unavailable",
        summary="No SGP4 data.",
        factors=[],
        orbital_objects=[],
        details={"data_status": "unavailable"},
        ml_encounter_risk={"model": "NGBoost", "status": "unavailable", "data_mode": "DEMONSTRATION", "reason": "Missing SGP4"},
    )
    weather = WeatherAnalysisResult(
        mission_id="TEST-BAD",
        status="completed",
        data_mode="DEMONSTRATION DATA",
        kp_index=2.0,
        solar_activity="LOW",
        cme_activity=False,
        geomagnetic_storm=False,
        risk_level="LOW",
        risk_score=0.1,
        data_sources=["Demo"],
        summary="Calm",
        factors=[],
        recent_events=[],
        details={"data_status": "available"},
    )
    feas = FeasibilityAnalysisResult(
        mission_id="TEST-BAD",
        status="completed",
        feasible=True,
        launch_vehicle="AeroSpace Medium-Lift IV",
        payload_capacity_kg=1500.0,
        estimated_cost_m=30.0,
        budget_status="WITHIN_BUDGET",
        summary="Feasible",
        factors=[],
        propulsion_margin_percent=30.0,
        details={"data_status": "available"},
    )
    cov = CoverageAnalysisResult(
        mission_id="TEST-BAD",
        status="completed",
        data_mode="DEMONSTRATION DATA",
        coverage_percent=95.0,
        target_region="Chennai",
        summary="Covered",
        factors=[],
        swath_width_km=500.0,
        details={"data_status": "available", "validated_orbital_coverage": True, "ground_track": []},
    )
    synth = CrossDomainReasoner.synthesize(
        mission_req=_sample_mission(data_mode="demonstration"),
        debris=bad_debris,
        weather=weather,
        feasibility=feas,
        coverage=cov,
    )
    assert synth.recommendation.decision != "GO"
    assert synth.ml_encounter_risk["status"] == "unavailable"

