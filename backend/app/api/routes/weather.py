from fastapi import APIRouter, Query
from app.agents.weather_agent import weather_agent

router = APIRouter(prefix="/weather", tags=["Space Weather Agent"])


@router.get("/status")
async def get_weather_status(
    data_mode: str = Query("auto", description="auto|live|cached|demonstration"),
):
    """Runs a baseline status evaluation for the Space Weather Intelligence Agent"""
    return await weather_agent.analyze(data_mode=data_mode)
