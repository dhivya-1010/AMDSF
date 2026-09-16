from fastapi import APIRouter
from app.agents.debris_agent import debris_agent
from app.agents.weather_agent import weather_agent
from app.agents.feasibility_agent import feasibility_agent
from app.agents.coverage_agent import coverage_agent

router = APIRouter(prefix="/agents", tags=["Agent Registry"])

@router.get("")
async def get_all_agents():
    """Returns metadata and health status for all 4 domain agents"""
    return {
        "framework": "AMDSF",
        "total_agents": 4,
        "agents": [
            {
                "id": "debris_agent",
                "name": "Orbital Debris Intelligence Agent",
                "domain": "Space Situational Awareness (SSA)",
                "data_source": "CelesTrak / LeoLabs",
                "status": "OPERATIONAL",
                "route": "/api/debris/status"
            },
            {
                "id": "weather_agent",
                "name": "Space Weather Intelligence Agent",
                "domain": "Heliophysics & Solar Radiation",
                "data_source": "NASA DONKI / NOAA SWPC",
                "status": "OPERATIONAL",
                "route": "/api/weather/status"
            },
            {
                "id": "feasibility_agent",
                "name": "Mission Feasibility Agent",
                "domain": "Propulsion, Delta-V & Staging",
                "data_source": "Vehicle Catalog Models",
                "status": "OPERATIONAL",
                "route": "/api/feasibility/status"
            },
            {
                "id": "coverage_agent",
                "name": "Coverage Intelligence Agent",
                "domain": "Ground Track & Sensor Geometry",
                "data_source": "Footprint Geometry Models",
                "status": "OPERATIONAL",
                "route": "/api/coverage/status"
            }
        ]
    }
