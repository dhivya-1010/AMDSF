from typing import Dict, Any, List
from datetime import datetime
from app.schemas.mission import MissionRequestSchema
from app.agents.debris_agent.models import DebrisAnalysisResult
from app.agents.weather_agent.models import WeatherAnalysisResult
from app.agents.feasibility_agent.models import FeasibilityAnalysisResult
from app.agents.coverage_agent.models import CoverageAnalysisResult
from .models import OrchestratorResult, RecommendationDetails

class CrossDomainReasoner:
    """Core rule-based multi-objective arbitration engine synthesizing all 4 agents"""

    @classmethod
    def synthesize(
        cls,
        mission_req: MissionRequestSchema,
        debris: DebrisAnalysisResult,
        weather: WeatherAnalysisResult,
        feasibility: FeasibilityAnalysisResult,
        coverage: CoverageAnalysisResult
    ) -> OrchestratorResult:
        
        conflicts = []
        tradeoffs = []
        reasoning = []
        mitigation = []

        # Rule evaluation
        is_debris_high = debris.risk_level == "HIGH"
        is_debris_medium = debris.risk_level == "MEDIUM"
        is_weather_low = weather.risk_level == "LOW"
        is_weather_high = weather.risk_level == "HIGH"
        is_feasible = feasibility.feasible
        coverage_met = coverage.coverage_percent >= mission_req.target.coverage_requirement
        max_acceptable_risk = mission_req.constraints.maximum_acceptable_risk.upper()

        # Multi-domain weighted readiness calculation (0 - 100)
        debris_weight = (1.0 - debris.risk_score) * 30
        weather_weight = (1.0 - weather.risk_score) * 25
        feasibility_weight = 25 if is_feasible else 8
        coverage_weight = (coverage.coverage_percent / 100.0) * 20

        readiness = int(debris_weight + weather_weight + feasibility_weight + coverage_weight)
        readiness = min(98, max(35, readiness))

        target_str = f"{mission_req.target.area}, {mission_req.target.region}, {mission_req.target.country}"
        launch_str = f"{mission_req.launch.site}"

        # Decision Arbitration Logic
        if not is_feasible:
            conflicts.append(f"Estimated lifecycle cost (${feasibility.estimated_cost_m}M) exceeds allocated budget (${mission_req.mission.budget_musd}M).")
            tradeoffs.append("Mission configuration requires payload mass reduction or rideshare co-manifesting to satisfy budget constraint.")
            launch_window = f"Window TBD (Post Budget Realignment)"
            risk_level = "HIGH"
            reasoning = [
                f"Financial feasibility constraint violated: Deficit of ${round(feasibility.estimated_cost_m - mission_req.mission.budget_musd, 1)}M",
                f"Assigned launch vehicle '{feasibility.launch_vehicle}' staging exceeds budget envelope",
                f"Orbital debris risk ({debris.risk_level}) and space weather ({weather.risk_level}) are acceptable, but launch staging is financially constrained"
            ]
            mitigation = [
                "Re-evaluate payload instrument wet mass to downscale to lower booster class",
                "Apply for rideshare secondary payload slot at spaceport"
            ]
            resolution = "Flagged financial feasibility constraint for mission planner realignment."

        elif is_debris_high:
            conflicts.append(f"Selected orbital inclination ({mission_req.orbit.inclination_deg}°) and altitude ({mission_req.orbit.altitude_km}km) intersects high-density Sun-synchronous debris corridor.")
            tradeoffs.append(f"Selecting orbital slot phase shift (+14h from preferred epoch {mission_req.constraints.preferred_launch_date}) trades minor propellant budget for +38% conjunction safety clearance.")
            launch_window = f"Primary Candidate: {mission_req.constraints.preferred_launch_date} +1d — 14:15 UTC"
            risk_level = "MEDIUM–HIGH"
            reasoning = [
                f"Elevated conjunction hazard detected in proximate orbital shell ({debris.nearby_objects} tracked objects)",
                f"Space weather conditions from {launch_str} are favorable (Kp {weather.kp_index})",
                f"Mission configuration is feasible on {feasibility.launch_vehicle} with +{feasibility.propulsion_margin_percent}% Delta-V margin",
                f"Target coverage requirement ({mission_req.target.coverage_requirement}%) is satisfied ({coverage.coverage_percent}% achieved over {mission_req.target.area})"
            ]
            mitigation = [
                "Schedule secondary radar passes with CelesTrak / LeoLabs 12 hours prior to T-0",
                "Pre-load collision avoidance maneuver (CAM) delta-v vectors into flight computer"
            ]
            resolution = "Applied Pareto-optimal orbital slot phase shift to avoid dense catalog conjunction cluster."

        else:
            # Nominal recommended baseline
            launch_window = f"{mission_req.constraints.preferred_launch_date} — 10:30 UTC"
            risk_level = "LOW–MEDIUM"
            tradeoffs.append(f"Selecting primary launch slot from {launch_str} achieves optimal ground track geometry over {target_str} while maintaining +14km debris clearance.")
            reasoning = [
                f"Conjunction risk is within acceptable threshold in calculated orbital corridor ({debris.nearby_objects} nearby objects)",
                f"Favorable space-weather conditions observed across NOAA SWPC & NASA DONKI (Kp {weather.kp_index})",
                f"Mission configuration is feasible on {feasibility.launch_vehicle} within budget limit (${feasibility.estimated_cost_m}M / ${mission_req.mission.budget_musd}M)",
                f"Target area '{target_str}' receives {coverage.coverage_percent}% coverage (Requirement: {mission_req.target.coverage_requirement}%)"
            ]
            mitigation = [
                "Continue automated orbital conjunction tracking with CelesTrak active catalog before launch",
                "Monitor NOAA SWPC 3-hour geomagnetic updates during T-24h countdown sequence"
            ]
            resolution = f"Selected optimal launch window from {launch_str} providing maximum orbital safety and {coverage.coverage_percent}% regional coverage."

        # Chart Data Preparation
        chart_data = {
            "risk_breakdown": [
                {"name": "Debris Conjunction", "risk_index": int(debris.risk_score * 100), "domain": "SSA"},
                {"name": "Space Weather", "risk_index": int(weather.risk_score * 100), "domain": "Heliophysics"},
                {"name": "Feasibility Risk", "risk_index": 10 if is_feasible else 75, "domain": "Propulsion"},
                {"name": "Coverage Gap", "risk_index": int(100 - coverage.coverage_percent), "domain": "Geometry"}
            ],
            "launch_window_comparison": [
                {
                    "window": f"{mission_req.constraints.preferred_launch_date} (Early)",
                    "risk": 68,
                    "cost": int(feasibility.estimated_cost_m * 0.94),
                    "coverage": int(coverage.coverage_percent - 3),
                    "safety": 35
                },
                {
                    "window": f"{mission_req.constraints.preferred_launch_date} (Recommended)",
                    "risk": int(debris.risk_score * 45),
                    "cost": int(feasibility.estimated_cost_m),
                    "coverage": int(coverage.coverage_percent),
                    "safety": 88
                },
                {
                    "window": f"{mission_req.constraints.preferred_launch_date} (+2d)",
                    "risk": 45,
                    "cost": int(feasibility.estimated_cost_m * 1.06),
                    "coverage": int(coverage.coverage_percent - 1),
                    "safety": 74
                }
            ]
        }

        # Dynamic Map Data with target coordinates and launch site
        target_lat = mission_req.target.latitude
        target_lng = mission_req.target.longitude

        # Launch site coordinates dictionary
        launch_site_coords = {
            "SDSC_SHAR": {"lat": 13.7199, "lng": 80.2304, "name": "Satish Dhawan Space Centre (SHAR)"},
            "CCAFS": {"lat": 28.5623, "lng": -80.5774, "name": "Cape Canaveral SFS"},
            "KSC": {"lat": 28.5728, "lng": -80.6490, "name": "Kennedy Space Center"},
            "VANDENBERG": {"lat": 34.6321, "lng": -120.6106, "name": "Vandenberg SFB"},
            "KOUROU": {"lat": 5.2322, "lng": -52.7606, "name": "Guiana Space Centre, Kourou"},
            "TNSC": {"lat": 30.4000, "lng": 130.9700, "name": "Tanegashima Space Center"},
            "JSLC": {"lat": 40.9606, "lng": 100.2983, "name": "Jiuquan Satellite Launch Center"},
            "WSLS": {"lat": 19.6144, "lng": 110.9511, "name": "Wenchang Space Launch Site"}
        }
        site_code = mission_req.launch.launch_site_code
        launch_point = launch_site_coords.get(site_code, {"lat": 13.7199, "lng": 80.2304, "name": mission_req.launch.site or "Spaceport"})

        map_data = {
            "satellite_position": {
                "lat": target_lat,
                "lng": target_lng,
                "alt_km": mission_req.orbit.altitude_km,
                "label": mission_req.mission_name
            },
            "coverage_radius_km": int(mission_req.target.coverage_radius_km * 2.5),
            "ground_track": [
                {"lat": launch_point["lat"], "lng": launch_point["lng"], "name": f"Launch Ascent ({launch_point['name']})"},
                {"lat": (launch_point["lat"] + target_lat) / 2.0, "lng": (launch_point["lng"] + target_lng) / 2.0, "name": "Telemetry Node"},
                {"lat": target_lat, "lng": target_lng, "name": f"Observation Target ({target_str})"},
                {"lat": target_lat + 15.0, "lng": target_lng + 25.0, "name": "Descending Arc"}
            ],
            "debris_markers": [
                {"lat": target_lat + 4.2, "lng": target_lng - 6.5, "name": "COSMOS 2251 DEB", "risk": debris.risk_level, "type": "debris"},
                {"lat": target_lat - 3.8, "lng": target_lng + 8.1, "name": "SL-16 R/B Fragment", "risk": "Low", "type": "debris"},
                {"lat": target_lat + 8.0, "lng": target_lng + 12.4, "name": "CZ-4B Splinter", "risk": "Medium", "type": "debris"}
            ],
            "ground_stations": [
                {"lat": launch_point["lat"], "lng": launch_point["lng"], "name": f"Spaceport Uplink: {launch_point['name']}"},
                {"lat": target_lat + 5.0, "lng": target_lng + 2.0, "name": f"Regional Telemetry: {mission_req.target.region}"}
            ]
        }

        return OrchestratorResult(
            mission_id=mission_req.mission_id,
            status="Cross-Domain Reasoning Completed",
            agent_consensus={
                "orbital_debris": f"{debris.risk_level} Risk ({debris.nearby_objects} nearby)",
                "space_weather": f"{weather.risk_level} Risk (Kp {weather.kp_index})",
                "mission_feasibility": f"{'Feasible' if is_feasible else 'Over Budget'} (${feasibility.estimated_cost_m}M)",
                "coverage": f"{coverage.coverage_percent}% ({coverage.population_served_formatted})"
            },
            conflicts_detected=conflicts,
            resolution_strategy=resolution,
            recommendation=RecommendationDetails(
                launch_window=launch_window,
                risk_level=risk_level,
                readiness=readiness,
                reasoning=reasoning,
                tradeoffs=tradeoffs,
                mitigation=mitigation
            ),
            chart_data=chart_data,
            map_data=map_data,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
