import asyncio
from typing import Any, Dict

from app.agents.coverage_agent import coverage_agent
from app.agents.debris_agent import debris_agent
from app.agents.feasibility_agent import feasibility_agent
from app.agents.weather_agent import weather_agent
from app.schemas.mission import MissionRequestSchema
from .reasoning import CrossDomainReasoner


class MissionOrchestrator:
    """Core Orchestrator coordinating all 4 autonomous agents and executing deterministic arbitration."""

    def __init__(self):
        self.name = "AMDSF Central Mission Orchestrator"

    async def execute_mission_analysis(self, req: MissionRequestSchema) -> Dict[str, Any]:
        data_mode = getattr(req.constraints, "data_mode", "auto") or "auto"
        orbit_dict = req.orbit.model_dump()
        coverage_cfg = req.sensor.model_dump() if getattr(req, "sensor", None) else {}

        debris_task = debris_agent.analyze(
            mission_id=req.mission_id,
            target_orbit_km=req.orbit.altitude_km,
            inclination_deg=req.orbit.inclination_deg,
            eccentricity=req.orbit.eccentricity,
            mission_duration=req.mission.duration_days,
            preferred_date=req.constraints.preferred_launch_date,
            flexibility_days=req.constraints.launch_window_flexibility_days,
            mission_tle=orbit_dict,
            propagation_interval_minutes=req.orbit.propagation_interval_minutes,
            propagation_step_seconds=req.orbit.propagation_step_seconds,
            screening_distance_km=req.orbit.screening_distance_km,
            data_mode=data_mode,
            catalog_groups=req.orbit.catalog_groups,
            raan=req.orbit.raan,
            arg_perigee=req.orbit.arg_perigee,
            allow_design_orbit=True,
        )

        weather_task = weather_agent.analyze(
            mission_id=req.mission_id,
            preferred_date=req.constraints.preferred_launch_date,
            flexibility_days=req.constraints.launch_window_flexibility_days,
            launch_site=req.launch.site,
            target_orbit_km=req.orbit.altitude_km,
            data_mode=data_mode,
        )

        feasibility_task = feasibility_agent.analyze(
            mission_id=req.mission_id,
            payload_mass=req.mission.payload_mass_kg,
            target_orbit=req.orbit.altitude_km,
            mission_duration=req.mission.duration_days,
            budget=req.mission.budget_musd,
            launch_site=req.launch.site,
            launch_site_code=req.launch.launch_site_code,
            launch_vehicle=req.launch.vehicle,
            inclination_deg=req.orbit.inclination_deg,
            satellite_manufacturing_cost_musd=req.mission.satellite_manufacturing_cost_musd,
            launch_cost_musd=req.mission.launch_cost_musd,
            annual_operations_cost_musd=req.mission.annual_operations_cost_musd,
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
            eccentricity=req.orbit.eccentricity,
            raan=req.orbit.raan,
            arg_perigee=req.orbit.arg_perigee,
            mission_duration=req.mission.duration_days,
            objective_type=req.objective.type,
            mission_tle=orbit_dict,
            sensor_fov_deg=coverage_cfg.get("sensor_fov_deg"),
            swath_width_km=coverage_cfg.get("swath_width_km"),
            min_elevation_deg=coverage_cfg.get("min_elevation_deg"),
            observation_duration_hours=coverage_cfg.get("observation_duration_hours"),
            time_step_seconds=coverage_cfg.get("time_step_seconds"),
            use_demonstration_sensor=coverage_cfg.get("use_demonstration_sensor", True),
            enable_worldpop_lookup=coverage_cfg.get("enable_worldpop_lookup", True),
            data_mode=data_mode,
        )

        debris_res, weather_res, feasibility_res, coverage_res = await asyncio.gather(
            debris_task, weather_task, feasibility_task, coverage_task
        )

        orchestrator_res = CrossDomainReasoner.synthesize(
            mission_req=req,
            debris=debris_res,
            weather=weather_res,
            feasibility=feasibility_res,
            coverage=coverage_res,
        )

        return {
            "mission_id": req.mission_id,
            "data_mode": data_mode,
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
                "max_risk": req.constraints.maximum_acceptable_risk,
                "data_mode": data_mode,
            },
            "debris": debris_res.model_dump(),
            "weather": weather_res.model_dump(),
            "feasibility": feasibility_res.model_dump(),
            "coverage": coverage_res.model_dump(),
            "orchestration": orchestrator_res.model_dump(),
            "orchestrator": orchestrator_res.model_dump(),
            "recommendation": orchestrator_res.recommendation.model_dump(),
            "ml_encounter_risk": orchestrator_res.ml_encounter_risk,
            "chart_data": orchestrator_res.chart_data,
            "map_data": orchestrator_res.map_data,
        }


orchestrator = MissionOrchestrator()
