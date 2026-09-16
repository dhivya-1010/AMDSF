from fastapi import APIRouter
from app.agents.feasibility_agent import feasibility_agent

router = APIRouter(prefix="/feasibility", tags=["Mission Feasibility Agent"])

@router.get("/status")
async def get_feasibility_status():
    """Runs a baseline status evaluation for the Mission Feasibility Agent"""
    result = await feasibility_agent.analyze(
        payload_mass=250.0,
        target_orbit=550.0,
        mission_duration=365,
        budget=50.0
    )
    return result
