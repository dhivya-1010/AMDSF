from typing import Optional
from fastapi import APIRouter, Query
from app.agents.debris_agent import debris_agent

router = APIRouter(prefix="/debris", tags=["Debris Agent"])


@router.get("/status")
async def get_debris_status(
    norad_id: Optional[int] = Query(None, description="Optional NORAD catalog ID to screen"),
    target_orbit_km: float = Query(550.0, description="Target altitude shell in km"),
    screening_distance_km: Optional[float] = Query(None, description="Threshold distance in km"),
    data_mode: str = Query("auto", description="auto|live|cached|demonstration"),
):
    """Runs debris screening status evaluation (requires NORAD ID / TLE unless design orbit is enabled)."""
    mission_tle = {"norad_id": norad_id} if norad_id else None
    result = await debris_agent.analyze(
        target_orbit_km=target_orbit_km,
        mission_tle=mission_tle,
        screening_distance_km=screening_distance_km,
        data_mode=data_mode,
        allow_design_orbit=False,
    )
    return result
