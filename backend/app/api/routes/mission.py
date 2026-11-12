import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.agents.coverage_agent import coverage_agent
from app.agents.debris_agent import debris_agent
from app.agents.feasibility_agent import feasibility_agent
from app.agents.orchestrator import orchestrator
from app.agents.weather_agent import weather_agent
from app.config import settings
from app.core.logging import logger
from app.schemas.mission import MissionRequestSchema

router = APIRouter(tags=["Missions & Agent Analysis"])

STORE_PATH = Path(settings.DATA_DIR) / "missions_store.json"

MISSIONS_DB: Dict[str, MissionRequestSchema] = {}
ANALYSIS_RESULTS_DB: Dict[str, Dict[str, Any]] = {}
MISSION_COUNTER = 1


def _load_store() -> None:
    global MISSION_COUNTER
    if not STORE_PATH.exists():
        return
    try:
        raw = json.loads(STORE_PATH.read_text(encoding="utf-8"))
        for mid, payload in raw.get("missions", {}).items():
            try:
                MISSIONS_DB[mid] = MissionRequestSchema(**payload)
            except Exception as exc:
                logger.warning("Skipping invalid stored mission %s: %s", mid, exc)
        results = raw.get("analysis_results", {})
        if isinstance(results, dict):
            ANALYSIS_RESULTS_DB.update(results)
        MISSION_COUNTER = int(raw.get("counter", max(1, len(MISSIONS_DB) + 1)))
    except (OSError, ValueError) as exc:
        logger.warning("Could not load persisted mission store: %s", exc)


def _save_store() -> None:
    try:
        STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
        serializable = {
            "counter": MISSION_COUNTER,
            "missions": {mid: m.model_dump() for mid, m in MISSIONS_DB.items()},
            "analysis_results": ANALYSIS_RESULTS_DB,
        }
        STORE_PATH.write_text(json.dumps(serializable), encoding="utf-8")
    except OSError as exc:
        logger.warning("Could not persist mission store: %s", exc)


_load_store()


def generate_mission_id() -> str:
    global MISSION_COUNTER
    while True:
        mid = f"AMDSF-2026-{MISSION_COUNTER:03d}"
        MISSION_COUNTER += 1
        if mid not in MISSIONS_DB:
            return mid


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


# -------------------------------------------------------------------
# 1. Mission Creation & Retrieval
# -------------------------------------------------------------------
@router.post("/missions", status_code=status.HTTP_201_CREATED)
async def create_mission(mission_req: MissionRequestSchema):
    """Creates and stores a mission with a unique mission_id"""
    if not mission_req.mission_id:
        mission_req.mission_id = generate_mission_id()
    mission_req.created_at = _now_iso()

    MISSIONS_DB[mission_req.mission_id] = mission_req
    _save_store()
    logger.info(f"Created new mission: {mission_req.mission_id} - '{mission_req.mission_name}'")
    return mission_req


@router.get("/missions")
async def list_missions():
    """Lists all created missions"""
    return {"missions": list(MISSIONS_DB.values())}


@router.get("/missions/{mission_id}")
async def get_mission(mission_id: str):
    """Retrieves a specific mission by mission_id"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    return MISSIONS_DB[mission_id]


# -------------------------------------------------------------------
# 2. Individual Agent Analysis Endpoints
# -------------------------------------------------------------------
@router.post("/missions/{mission_id}/analyze/debris")
async def analyze_debris(
    mission_id: str,
    data_mode: Optional[str] = Query(None, description="Override data mode: auto|live|cached|demonstration"),
):
    """Runs Orbital Debris Intelligence analysis for a specific mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    effective_mode = data_mode or m.constraints.data_mode or "auto"
    result = await debris_agent.analyze(
        mission_id=mission_id,
        target_orbit_km=m.orbit.altitude_km,
        inclination_deg=m.orbit.inclination_deg,
        eccentricity=m.orbit.eccentricity,
        mission_duration=m.mission.duration_days,
        preferred_date=m.constraints.preferred_launch_date,
        flexibility_days=m.constraints.launch_window_flexibility_days,
        mission_tle=m.orbit.model_dump(),
        propagation_interval_minutes=m.orbit.propagation_interval_minutes,
        propagation_step_seconds=m.orbit.propagation_step_seconds,
        screening_distance_km=m.orbit.screening_distance_km,
        data_mode=effective_mode,
        catalog_groups=m.orbit.catalog_groups,
        raan=m.orbit.raan,
        arg_perigee=m.orbit.arg_perigee,
        allow_design_orbit=True,
    )
    ANALYSIS_RESULTS_DB.setdefault(mission_id, {})["debris"] = result.model_dump()
    _save_store()
    return result


@router.post("/missions/{mission_id}/analyze/weather")
async def analyze_weather(
    mission_id: str,
    data_mode: Optional[str] = Query(None, description="Override data mode: auto|live|cached|demonstration"),
):
    """Runs Space Weather Intelligence analysis for a specific mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    effective_mode = data_mode or m.constraints.data_mode or "auto"
    result = await weather_agent.analyze(
        mission_id=mission_id,
        preferred_date=m.constraints.preferred_launch_date,
        flexibility_days=m.constraints.launch_window_flexibility_days,
        launch_site=m.launch.site,
        target_orbit_km=m.orbit.altitude_km,
        data_mode=effective_mode,
    )
    ANALYSIS_RESULTS_DB.setdefault(mission_id, {})["weather"] = result.model_dump()
    _save_store()
    return result


@router.post("/missions/{mission_id}/analyze/feasibility")
async def analyze_feasibility(mission_id: str):
    """Runs Mission Feasibility analysis for a specific mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    try:
        result = await feasibility_agent.analyze(
            mission_id=mission_id,
            payload_mass=m.mission.payload_mass_kg,
            target_orbit=m.orbit.altitude_km,
            mission_duration=m.mission.duration_days,
            budget=m.mission.budget_musd,
            launch_site=m.launch.site,
            launch_site_code=m.launch.launch_site_code,
            launch_vehicle=m.launch.vehicle,
            inclination_deg=m.orbit.inclination_deg,
            satellite_manufacturing_cost_musd=m.mission.satellite_manufacturing_cost_musd,
            launch_cost_musd=m.mission.launch_cost_musd,
            annual_operations_cost_musd=m.mission.annual_operations_cost_musd,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    ANALYSIS_RESULTS_DB.setdefault(mission_id, {})["feasibility"] = result.model_dump()
    _save_store()
    return result


@router.post("/missions/{mission_id}/analyze/coverage")
async def analyze_coverage(
    mission_id: str,
    data_mode: Optional[str] = Query(None, description="Override data mode: auto|live|cached|demonstration"),
):
    """Runs Coverage Intelligence analysis for a specific mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    effective_mode = data_mode or m.constraints.data_mode or "auto"
    cov_cfg = m.sensor
    result = await coverage_agent.analyze(
        mission_id=mission_id,
        target_country=m.target.country,
        target_region=m.target.region,
        target_area=m.target.area,
        latitude=m.target.latitude,
        longitude=m.target.longitude,
        coverage_requirement=m.target.coverage_requirement,
        coverage_radius_km=m.target.coverage_radius_km,
        target_orbit_km=m.orbit.altitude_km,
        inclination_deg=m.orbit.inclination_deg,
        eccentricity=m.orbit.eccentricity,
        raan=m.orbit.raan,
        arg_perigee=m.orbit.arg_perigee,
        mission_duration=m.mission.duration_days,
        objective_type=m.objective.type,
        mission_tle=m.orbit.model_dump(),
        sensor_fov_deg=cov_cfg.sensor_fov_deg,
        swath_width_km=cov_cfg.swath_width_km,
        min_elevation_deg=cov_cfg.min_elevation_deg,
        observation_duration_hours=cov_cfg.observation_duration_hours,
        time_step_seconds=cov_cfg.time_step_seconds,
        use_demonstration_sensor=cov_cfg.use_demonstration_sensor,
        enable_worldpop_lookup=cov_cfg.enable_worldpop_lookup,
        data_mode=effective_mode,
    )
    ANALYSIS_RESULTS_DB.setdefault(mission_id, {})["coverage"] = result.model_dump()
    _save_store()
    return result


# -------------------------------------------------------------------
# 3. Full Orchestration & Multi-Agent Analysis Pipeline
# -------------------------------------------------------------------
@router.post("/missions/{mission_id}/analyze/orchestrate")
async def orchestrate_mission(
    mission_id: str,
    data_mode: Optional[str] = Query(None, description="Override data mode: auto|live|cached|demonstration"),
):
    """Executes full multi-agent orchestration for a stored mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    if data_mode:
        m_copy = m.model_copy(deep=True)
        m_copy.constraints.data_mode = data_mode
    else:
        m_copy = m
    try:
        result = await orchestrator.execute_mission_analysis(m_copy)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    result["mission_id"] = mission_id
    ANALYSIS_RESULTS_DB[mission_id] = result
    _save_store()
    return result


@router.get("/missions/{mission_id}/analysis")
async def get_mission_analysis(mission_id: str):
    """Retrieves all analysis results associated with mission_id"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    if mission_id not in ANALYSIS_RESULTS_DB:
        raise HTTPException(status_code=404, detail=f"No analysis executed for mission '{mission_id}' yet.")
    return ANALYSIS_RESULTS_DB[mission_id]


# -------------------------------------------------------------------
# 4. Backward Compatibility / Direct Unified Analysis Endpoint
# -------------------------------------------------------------------
@router.post("/mission/analyze")
async def analyze_mission_unified(mission_req: MissionRequestSchema):
    """Creates/Registers mission on-the-fly and executes complete multi-agent orchestration"""
    if not mission_req.mission_id:
        mission_req.mission_id = generate_mission_id()
    mission_req.created_at = _now_iso()

    MISSIONS_DB[mission_req.mission_id] = mission_req
    try:
        result = await orchestrator.execute_mission_analysis(mission_req)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    result["mission_id"] = mission_req.mission_id
    ANALYSIS_RESULTS_DB[mission_req.mission_id] = result
    _save_store()
    return result
