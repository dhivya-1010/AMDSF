from fastapi import APIRouter
from app.agents.coverage_agent import coverage_agent

router = APIRouter(prefix="/coverage", tags=["Coverage Agent"])

@router.get("/status")
async def get_coverage_status():
    """Runs a baseline status evaluation for the Coverage Intelligence Agent"""
    result = await coverage_agent.analyze(
        target_region="India",
        target_orbit_km=550.0
    )
    return result
