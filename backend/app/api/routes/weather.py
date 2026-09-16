from fastapi import APIRouter
from app.agents.weather_agent import weather_agent

router = APIRouter(prefix="/weather", tags=["Space Weather Agent"])

@router.get("/status")
async def get_weather_status():
    """Runs a baseline status evaluation for the Space Weather Agent"""
    result = await weather_agent.analyze()
    return result
