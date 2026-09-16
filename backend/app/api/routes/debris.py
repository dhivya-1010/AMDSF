from fastapi import APIRouter
from app.agents.debris_agent import debris_agent

router = APIRouter(prefix="/debris", tags=["Debris Agent"])

@router.get("/status")
async def get_debris_status():
    """Runs a baseline status evaluation for the Orbital Debris Agent"""
    result = await debris_agent.analyze(target_orbit_km=550.0)
    return result
