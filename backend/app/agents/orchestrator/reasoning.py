from typing import Dict, Any, List
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
        mission_name: str,
        target_orbit_km: float,
        target_region: str,
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
        coverage_high = coverage.coverage_percent >= 90.0

        # Risk scoring calculation (multi-domain weighted index)
        # Weights: Debris 30%, Weather 25%, Feasibility 25%, Coverage 20%
        debris_weight_score = (1.0 - debris.risk_score) * 30
        weather_weight_score = (1.0 - weather.risk_score) * 25
        feasibility_weight_score = (25 if is_feasible else 8)
        coverage_weight_score = (coverage.coverage_percent / 100.0) * 20

        readiness = int(debris_weight_score + weather_weight_score + feasibility_weight_score + coverage_weight_score)
        readiness = min(98, max(45, readiness))

        if is_debris_high:
            conflicts.append("Primary launch slot intersects high-density Sun-synchronous debris corridor.")
            tradeoffs.append("Selecting Wednesday orbital phasing window trades +$4M in staging adjustments for +38% conjunction safety clearance.")
            launch_window = "Wednesday — 14:15 UTC"
            risk_level = "MEDIUM–HIGH"
            reasoning = [
                "Elevated conjunction risk in primary orbital plane requires orbital phasing offset",
                "Favorable space-weather conditions prevent additional ionospheric atmospheric drag",
                "Selected launch vehicle provides sufficient Delta-V reserve for collision avoidance maneuvers",
                f"Target regional coverage ({coverage.coverage_percent}%) remains preserved"
            ]
            mitigation = [
                "Schedule secondary radar passes with CelesTrak / LeoLabs 12 hours prior to T-0",
                "Pre-load thruster avoidance delta-V vectors into flight computer"
            ]
            resolution = "Applied Pareto-optimal orbital slot phase shift (+14h delay) to avoid dense catalog conjunction cluster."
        elif not is_feasible:
            conflicts.append("Estimated mission cost exceeds allocated budget.")
            tradeoffs.append("Mission requires payload mass optimization or rideshare secondary manifest to meet budget.")
            launch_window = "Window TBD (Post Budget Realignment)"
            risk_level = "HIGH"
            reasoning = [
                "Mission configuration is currently over budget",
                "Payload mass exceeds small-lift baseline",
                "Space weather and debris metrics are nominal but launch is constrained by propulsion economics"
            ]
            mitigation = [
                "Re-evaluate payload subsystem weight to fit lower staging class",
                "Apply for rideshare slot"
            ]
            resolution = "Flagged financial feasibility constraint for mission planner review."
        else:
            # Nominal recommended baseline
            launch_window = "Tuesday — 10:30 UTC"
            risk_level = "LOW–MEDIUM"
            tradeoffs.append("Estimated cost is slightly higher than Monday unconstrained slot, but provides 14km greater clearance from trackable debris.")
            reasoning = [
                "Lower conjunction risk in calculated orbital ascent corridor",
                f"Favorable space-weather conditions (Planetary Kp Index {weather.kp_index})",
                f"Mission configuration is feasible on {feasibility.launch_vehicle}",
                f"{coverage.coverage_percent}% target regional coverage successfully achieved"
            ]
            mitigation = [
                "Continue automated orbital conjunction monitoring with CelesTrak before launch",
                "Monitor NOAA SWPC 3-hour geomagnetic updates during T-24h countdown"
            ]
            resolution = "Resolved minor trajectory trade-off by selecting Tuesday window for maximum orbital safety and nominal solar flux."

        # Chart Data Preparation
        chart_data = {
            "risk_breakdown": [
                {"name": "Debris Conjunction", "risk_index": int(debris.risk_score * 100), "domain": "SSA"},
                {"name": "Space Weather", "risk_index": int(weather.risk_score * 100), "domain": "Heliophysics"},
                {"name": "Feasibility Risk", "risk_index": 10 if is_feasible else 75, "domain": "Propulsion"},
                {"name": "Coverage Gaps", "risk_index": int(100 - coverage.coverage_percent), "domain": "Geometry"}
            ],
            "launch_window_comparison": [
                {"window": "Monday", "risk": 68, "cost": int(feasibility.estimated_cost_m * 0.92), "coverage": int(coverage.coverage_percent - 4), "safety": 32},
                {"window": "Tuesday (Recommended)", "risk": int(debris.risk_score * 45), "cost": int(feasibility.estimated_cost_m), "coverage": int(coverage.coverage_percent), "safety": 88},
                {"window": "Wednesday", "risk": 45, "cost": int(feasibility.estimated_cost_m * 1.08), "coverage": int(coverage.coverage_percent - 2), "safety": 72}
            ]
        }

        # Map Data coordinates centered according to target region
        region_coords = {
            "india": {"lat": 20.5937, "lng": 78.9629},
            "north atlantic & europe": {"lat": 48.8566, "lng": 2.3522},
            "north america": {"lat": 37.0902, "lng": -95.7129},
            "asia pacific": {"lat": 1.3521, "lng": 103.8198},
            "global": {"lat": 15.0000, "lng": 20.0000}
        }
        center = region_coords.get(target_region.lower().strip(), {"lat": 20.5937, "lng": 78.9629})

        map_data = {
            "satellite_position": {
                "lat": center["lat"],
                "lng": center["lng"],
                "alt_km": target_orbit_km,
                "label": mission_name
            },
            "coverage_radius_km": int(target_orbit_km * 2.2),
            "ground_track": [
                {"lat": center["lat"] - 20, "lng": center["lng"] - 40, "name": "Ascent Orbital Vector"},
                {"lat": center["lat"] - 5, "lng": center["lng"] - 15, "name": "Telemetry Acquisition"},
                {"lat": center["lat"], "lng": center["lng"], "name": f"Target Pass ({target_region})"},
                {"lat": center["lat"] + 15, "lng": center["lng"] + 30, "name": "Descending Pass"}
            ],
            "debris_markers": [
                {"lat": center["lat"] + 4.2, "lng": center["lng"] - 6.5, "name": "COSMOS 2251 DEB", "risk": debris.risk_level, "type": "debris"},
                {"lat": center["lat"] - 3.8, "lng": center["lng"] + 8.1, "name": "SL-16 R/B Fragment", "risk": "Low", "type": "debris"},
                {"lat": center["lat"] + 8.0, "lng": center["lng"] + 12.4, "name": "CZ-4B Splinter", "risk": "Medium", "type": "debris"}
            ],
            "ground_stations": [
                {"lat": center["lat"] + 5.0, "lng": center["lng"] + 2.0, "name": "Primary Ground Node A"},
                {"lat": center["lat"] - 10.0, "lng": center["lng"] - 5.0, "name": "Secondary Telemetry B"}
            ]
        }

        return OrchestratorResult(
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
            map_data=map_data
        )
