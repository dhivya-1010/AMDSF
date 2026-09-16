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

    async def execute_mission_analysis(self, mission_req: MissionRequestSchema) -> Dict[str, Any]:
        # Concurrently invoke all 4 independent domain agents
        debris_task = debris_agent.analyze(target_orbit_km=mission_req.target_orbit)
        weather_task = weather_agent.analyze()
        feasibility_task = feasibility_agent.analyze(
            payload_mass=mission_req.payload_mass,
            target_orbit=mission_req.target_orbit,
            mission_duration=mission_req.mission_duration,
            budget=mission_req.budget
        )
        coverage_task = coverage_agent.analyze(
            target_region=mission_req.target_region,
            target_orbit_km=mission_req.target_orbit
        )

        debris_res, weather_res, feasibility_res, coverage_res = await asyncio.gather(
            debris_task, weather_task, feasibility_task, coverage_task
        )

        # Cross-Domain Reasoning & Multi-Objective Arbitration
        orchestrator_res = CrossDomainReasoner.synthesize(
            mission_name=mission_req.mission_name,
            target_orbit_km=mission_req.target_orbit,
            target_region=mission_req.target_region,
            debris=debris_res,
            weather=weather_res,
            feasibility=feasibility_res,
            coverage=coverage_res
        )

        return {
            "mission": {
                "mission_name": mission_req.mission_name,
                "payload_mass": mission_req.payload_mass,
                "target_orbit": mission_req.target_orbit,
                "mission_duration": mission_req.mission_duration,
                "budget": mission_req.budget,
                "target_region": mission_req.target_region,
                "preferred_launch_date": mission_req.preferred_launch_date
            },
            "debris": debris_res.model_dump(),
            "weather": weather_res.model_dump(),
            "feasibility": feasibility_res.model_dump(),
            "coverage": coverage_res.model_dump(),
            "orchestrator": orchestrator_res.model_dump()
        }

orchestrator = MissionOrchestrator()
