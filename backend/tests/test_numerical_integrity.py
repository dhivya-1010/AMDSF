import asyncio

from app.agents.coverage_agent.analyzer import CoverageAnalyzer
from app.agents.feasibility_agent.analyzer import FeasibilityAnalyzer
from app.agents.orchestrator.reasoning import CrossDomainReasoner
from app.agents.weather_agent.analyzer import WeatherAnalyzer
from app.schemas.mission import MissionRequestSchema


def test_weather_failure_is_unavailable_not_synthetic():
    result = WeatherAnalyzer.evaluate(
        {"source": "NOAA SWPC", "status": "unavailable", "latest_kp": None},
        {"source": "NASA DONKI", "status": "unavailable", "events_count": None},
    )
    assert result.status == "unavailable"
    assert result.kp_index is None
    assert result.risk_score is None
    assert result.recent_events == []


def test_coverage_does_not_report_population_or_revisit_without_datasets():
    result = CoverageAnalyzer.evaluate(
        "China", "Beijing", "Beijing Metropolitan Area", 39.9, 116.4,
        80.0, 100.0, 550.0, 97.6, 365, "EARTH_OBSERVATION",
    )
    assert result.status == "prototype_estimate"
    assert result.population_served is None
    assert result.revisit_time_minutes is None
    assert result.details["validated_orbital_coverage"] is False


def test_feasibility_rejects_incompatible_vehicle_instead_of_selecting_heavy_fallback():
    result = FeasibilityAnalyzer.evaluate(
        payload_mass_kg=6000,
        target_orbit_km=550,
        mission_duration_days=365,
        budget_m=100,
        launch_site="SDSC_SHAR",
    )
    assert result.feasible is False
    assert result.budget_status == "NO_COMPATIBLE_VEHICLE"


def test_unavailable_domain_data_blocks_readiness_and_launch_window():
    mission = MissionRequestSchema()
    debris = type("Debris", (), {
        "risk_level": "INSUFFICIENT_DATA",
        "risk_score": None,
        "nearby_objects": 0,
    })()
    weather = type("Weather", (), {
        "status": "unavailable",
        "risk_score": None,
        "risk_level": "UNAVAILABLE",
        "kp_index": None,
    })()
    feasibility = FeasibilityAnalyzer.evaluate(250, 550, 365, 50, "SDSC_SHAR")
    coverage = CoverageAnalyzer.evaluate(
        "", "", "", 0, 0, 80, 100, 550, 97.6, 365, "EARTH_OBSERVATION"
    )
    result = CrossDomainReasoner.synthesize(mission, debris, weather, feasibility, coverage)
    assert result.status == "Incomplete Data"
    assert result.recommendation.readiness == 35
    assert "Unavailable" in result.recommendation.launch_window
