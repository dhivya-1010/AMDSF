import asyncio
from typing import Dict, Any
from app.schemas.mission import MissionRequestSchema
from app.agents.debris_agent import debris_agent
from app.agents.weather_agent import weather_agent
from app.agents.feasibility_agent import feasibility_agent
from app.agents.coverage_agent import coverage_agent
from .models import OrchestratorResult
from .reasoning import CrossDomainReasoner

class MissionOrchestrator:
    """Core Orchestrator coordinating all 4 autonomous agents and executing arbitration"""

    def __init__(self):
        self.name = "AMDSF Central Mission Orchestrator"

    async def execute_mission_analysis(self, req: MissionRequestSchema) -> Dict[str, Any]:
        # Concurrently invoke all 4 independent domain agents with explicit mapping
        debris_task = debris_agent.analyze(
            mission_id=req.mission_id,
            target_orbit_km=req.orbit.altitude_km,
            inclination_deg=req.orbit.inclination_deg,
            eccentricity=req.orbit.eccentricity,
            mission_duration=req.mission.duration_days,
            preferred_date=req.constraints.preferred_launch_date,
            flexibility_days=req.constraints.launch_window_flexibility_days
        )
        
        weather_task = weather_agent.analyze(
            mission_id=req.mission_id,
            preferred_date=req.constraints.preferred_launch_date,
            flexibility_days=req.constraints.launch_window_flexibility_days,
            launch_site=req.launch.site,
            target_orbit_km=req.orbit.altitude_km
        )
        
        feasibility_task = feasibility_agent.analyze(
            mission_id=req.mission_id,
            payload_mass=req.mission.payload_mass_kg,
            target_orbit=req.orbit.altitude_km,
            mission_duration=req.mission.duration_days,
            budget=req.mission.budget_musd,
            launch_site=req.launch.site,
            launch_vehicle=req.launch.vehicle
        )
        
        coverage_task = coverage_agent.analyze(
            mission_id=req.mission_id,
            target_country=req.target.country,
            target_region=req.target.region,
            target_area=req.target.area,
            latitude=req.target.latitude,
            longitude=req.target.longitude,
            coverage_requirement=req.target.coverage_requirement,
            coverage_radius_km=req.target.coverage_radius_km,
            target_orbit_km=req.orbit.altitude_km,
            inclination_deg=req.orbit.inclination_deg,
            mission_duration=req.mission.duration_days,
            objective_type=req.objective.type
        )

        debris_res, weather_res, feasibility_res, coverage_res = await asyncio.gather(
            debris_task, weather_task, feasibility_task, coverage_task
        )

        # Cross-Domain Reasoning & Multi-Objective Arbitration
        orchestrator_res = CrossDomainReasoner.synthesize(
            mission_req=req,
            debris=debris_res,
            weather=weather_res,
            feasibility=feasibility_res,
            coverage=coverage_res
        )

        return {
            "mission_id": req.mission_id,
            "mission_definition": req.model_dump(),
            "mission": {
                "mission_name": req.mission_name,
                "objective": req.objective.type,
                "target_location": f"{req.target.area}, {req.target.region}, {req.target.country}",
                "target_coordinates": f"{req.target.latitude}° N, {req.target.longitude}° E",
                "launch_site": f"{req.launch.site} ({req.launch.launch_site_code})",
                "payload_mass": req.mission.payload_mass_kg,
                "target_orbit": req.orbit.altitude_km,
                "inclination": req.orbit.inclination_deg,
                "mission_duration": req.mission.duration_days,
                "budget": req.mission.budget_musd,
                "target_region": f"{req.target.area}, {req.target.region}",
                "preferred_launch_date": req.constraints.preferred_launch_date,
                "max_risk": req.constraints.maximum_acceptable_risk
            },
            "debris": debris_res.model_dump(),
            "weather": weather_res.model_dump(),
            "feasibility": feasibility_res.model_dump(),
            "coverage": coverage_res.model_dump(),
            "orchestrator": orchestrator_res.model_dump()
        }

orchestrator = MissionOrchestrator()
