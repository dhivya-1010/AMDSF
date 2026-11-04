from fastapi import APIRouter
from app.agents.debris_agent import debris_agent

router = APIRouter(prefix="/debris", tags=["Debris Agent"])

@router.get("/status")
async def get_debris_status():
    """Runs a status evaluation; without a mission TLE it reports insufficient data."""
    result = await debris_agent.analyze(target_orbit_km=550.0)
    return result
