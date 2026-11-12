from typing import Optional
from fastapi import APIRouter, Query
from app.agents.coverage_agent import coverage_agent

router = APIRouter(prefix="/coverage", tags=["Coverage Agent"])


@router.get("/status")
async def get_coverage_status(
    target_orbit_km: float = Query(550.0),
    inclination_deg: float = Query(97.6),
    latitude: float = Query(13.0827),
    longitude: float = Query(80.2707),
    sensor_fov_deg: Optional[float] = Query(None),
    data_mode: str = Query("auto"),
):
    """Runs SGP4 orbital coverage evaluation for the Coverage Intelligence Agent"""
    return await coverage_agent.analyze(
        target_region="India",
        target_orbit_km=target_orbit_km,
        inclination_deg=inclination_deg,
        latitude=latitude,
        longitude=longitude,
        sensor_fov_deg=sensor_fov_deg,
        data_mode=data_mode,
    )
