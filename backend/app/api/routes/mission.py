from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List, Optional
import datetime
from app.schemas.mission import MissionRequestSchema
from app.agents.debris_agent import debris_agent
from app.agents.weather_agent import weather_agent
from app.agents.feasibility_agent import feasibility_agent
from app.agents.coverage_agent import coverage_agent
from app.agents.orchestrator import orchestrator
from app.core.logging import logger

router = APIRouter(tags=["Missions & Agent Analysis"])

# In-memory database structure keyed by mission_id (database-ready architecture)
MISSIONS_DB: Dict[str, MissionRequestSchema] = {}
ANALYSIS_RESULTS_DB: Dict[str, Dict[str, Any]] = {}
MISSION_COUNTER = 1

def generate_mission_id() -> str:
    global MISSION_COUNTER
    mid = f"AMDSF-2026-{MISSION_COUNTER:03d}"
    MISSION_COUNTER += 1
    return mid

# -------------------------------------------------------------------
# 1. Mission Creation & Retrieval
# -------------------------------------------------------------------
@router.post("/missions", status_code=status.HTTP_201_CREATED)
async def create_mission(mission_req: MissionRequestSchema):
    """Creates and stores a mission with a unique mission_id"""
    if not mission_req.mission_id:
        mission_req.mission_id = generate_mission_id()
    mission_req.created_at = datetime.datetime.utcnow().isoformat() + "Z"
    
    MISSIONS_DB[mission_req.mission_id] = mission_req
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
async def analyze_debris(mission_id: str):
    """Runs Orbital Debris Intelligence analysis for a specific mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    result = await debris_agent.analyze(
        mission_id=mission_id,
        target_orbit_km=m.orbit.altitude_km,
        inclination_deg=m.orbit.inclination_deg,
        eccentricity=m.orbit.eccentricity,
        mission_duration=m.mission.duration_days,
        preferred_date=m.constraints.preferred_launch_date,
        flexibility_days=m.constraints.launch_window_flexibility_days
    )
    # Store / update in analysis cache
    if mission_id not in ANALYSIS_RESULTS_DB:
        ANALYSIS_RESULTS_DB[mission_id] = {}
    ANALYSIS_RESULTS_DB[mission_id]["debris"] = result.model_dump()
    return result

@router.post("/missions/{mission_id}/analyze/weather")
async def analyze_weather(mission_id: str):
    """Runs Space Weather Intelligence analysis for a specific mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    result = await weather_agent.analyze(
        mission_id=mission_id,
        preferred_date=m.constraints.preferred_launch_date,
        flexibility_days=m.constraints.launch_window_flexibility_days,
        launch_site=m.launch.site,
        target_orbit_km=m.orbit.altitude_km
    )
    if mission_id not in ANALYSIS_RESULTS_DB:
        ANALYSIS_RESULTS_DB[mission_id] = {}
    ANALYSIS_RESULTS_DB[mission_id]["weather"] = result.model_dump()
    return result

@router.post("/missions/{mission_id}/analyze/feasibility")
async def analyze_feasibility(mission_id: str):
    """Runs Mission Feasibility analysis for a specific mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    result = await feasibility_agent.analyze(
        mission_id=mission_id,
        payload_mass=m.mission.payload_mass_kg,
        target_orbit=m.orbit.altitude_km,
        mission_duration=m.mission.duration_days,
        budget=m.mission.budget_musd,
        launch_site=m.launch.site,
        launch_vehicle=m.launch.vehicle
    )
    if mission_id not in ANALYSIS_RESULTS_DB:
        ANALYSIS_RESULTS_DB[mission_id] = {}
    ANALYSIS_RESULTS_DB[mission_id]["feasibility"] = result.model_dump()
    return result

@router.post("/missions/{mission_id}/analyze/coverage")
async def analyze_coverage(mission_id: str):
    """Runs Coverage Intelligence analysis for a specific mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
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
        mission_duration=m.mission.duration_days,
        objective_type=m.objective.type
    )
    if mission_id not in ANALYSIS_RESULTS_DB:
        ANALYSIS_RESULTS_DB[mission_id] = {}
    ANALYSIS_RESULTS_DB[mission_id]["coverage"] = result.model_dump()
    return result

# -------------------------------------------------------------------
# 3. Full Orchestration & Multi-Agent Analysis Pipeline
# -------------------------------------------------------------------
@router.post("/missions/{mission_id}/analyze/orchestrate")
async def orchestrate_mission(mission_id: str):
    """Executes full multi-agent orchestration for a stored mission"""
    if mission_id not in MISSIONS_DB:
        raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found.")
    m = MISSIONS_DB[mission_id]
    result = await orchestrator.execute_mission_analysis(m)
    result["mission_id"] = mission_id
    ANALYSIS_RESULTS_DB[mission_id] = result
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
    mission_req.created_at = datetime.datetime.utcnow().isoformat() + "Z"
    
    MISSIONS_DB[mission_req.mission_id] = mission_req
    result = await orchestrator.execute_mission_analysis(mission_req)
    result["mission_id"] = mission_req.mission_id
    ANALYSIS_RESULTS_DB[mission_req.mission_id] = result
    return result
