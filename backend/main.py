from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import datetime

app = FastAPI(
    title="AMDSF API",
    description="Agentic Multi-Domain Space Mission Decision Support Framework Backend",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MissionRequest(BaseModel):
    mission_name: str = "Aegis-1 Orbital Survey"
    payload_mass_kg: float = 1250.0
    target_orbit_km: float = 550.0
    mission_duration_days: int = 365
    budget_m: float = 45.0
    target_region: str = "North Atlantic & Europe"
    preferred_launch_date: str = "2026-10-15"

# Initial state/mock data
AGENTS_DATA = [
    {
        "id": "orbital_debris",
        "name": "Orbital Debris Agent",
        "domain": "Space Situational Awareness (SSA)",
        "icon": "ShieldAlert",
        "status": "Ready",
        "status_color": "emerald",
        "metric_name": "Debris Risk",
        "metric_value": "Nominal",
        "description": "Monitors LEO/MEO cataloged debris density, junction vectors, and trackable fragment velocities."
    },
    {
        "id": "space_weather",
        "name": "Space Weather Agent",
        "domain": "Heliophysics & Solar Dynamics",
        "icon": "SunMedium",
        "status": "Ready",
        "status_color": "emerald",
        "metric_name": "Solar Risk",
        "metric_value": "Low",
        "description": "Analyzes real-time NOAA Kp-index, coronal mass ejections, and atmospheric drag inflation risks."
    },
    {
        "id": "mission_feasibility",
        "name": "Mission Feasibility Agent",
        "domain": "Launch Vehicle & Propulsion Systems",
        "icon": "Rocket",
        "status": "Ready",
        "status_color": "emerald",
        "metric_name": "Feasibility",
        "metric_value": "Feasible",
        "description": "Computes Delta-V budgets, payload-to-orbit margins, launch vehicle fairing limits, and staging costs."
    },
    {
        "id": "coverage",
        "name": "Coverage Agent",
        "domain": "Constellation & Ground Geometry",
        "icon": "Satellite",
        "status": "Ready",
        "status_color": "emerald",
        "metric_name": "Target Coverage",
        "metric_value": "93%",
        "description": "Simulates ground-track revisit windows, optical/RF swath geometry, and slant-range elevation masks."
    }
]

@app.get("/")
def read_root():
    return {
        "framework": "AMDSF",
        "title": "Agentic Multi-Domain Space Mission Decision Support Framework",
        "status": "Operational",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/agents")
def get_agents():
    return {"agents": AGENTS_DATA}

@app.get("/api/mission-status")
def get_mission_status():
    return {
        "status": "Standby",
        "active_mission": "None (Ready for input)",
        "readiness_score": 0,
        "overall_risk": "None",
        "recommended_window": "Pending analysis",
        "active_agents_count": 4,
        "total_agents": 4,
        "last_updated": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.post("/api/analyze-mission")
def analyze_mission(request: MissionRequest):
    # Dynamic deterministic-like evaluation based on inputs
    orbit = request.target_orbit_km
    mass = request.payload_mass_kg
    budget = request.budget_m

    # Orbital Debris calculations
    # Higher LEO orbits around 700-900km have high debris densities
    if 650 <= orbit <= 850:
        debris_objects = 28
        debris_risk = "High"
        debris_assessment = "Elevated risk in Sun-synchronous orbit band; automated collision avoidance thruster maneuvers required."
        debris_score = 45
    elif orbit > 1000:
        debris_objects = 5
        debris_risk = "Low"
        debris_assessment = "MEO transition zone has low debris density; conjunction hazard is negligible."
        debris_score = 88
    else:
        debris_objects = 12
        debris_risk = "Medium"
        debris_assessment = "Acceptable with monitoring. 2 close conjunction events forecasted within 50km over 7 days."
        debris_score = 74

    # Space Weather calculations
    kp_val = 3.2
    weather_risk = "Low"
    weather_assessment = "Favorable conditions. Minor geomagnetic fluctuations; solar flare flux index within nominal operating tolerances."
    weather_score = 85

    # Mission Feasibility calculations
    est_cost = round(budget * 0.93, 1) if budget >= 40 else round(budget * 1.05, 1)
    if est_cost > budget:
        feasibility_status = "Marginal"
        feasibility_assessment = f"Budget tight (${est_cost}M vs ${budget}M allocated). Heavy payload ({mass}kg) requires dedicated booster configuration."
        feasibility_score = 62
        launch_vehicle = "Falcon 9 / Heavy Staging"
    else:
        feasibility_status = "Feasible"
        feasibility_assessment = f"Payload mass ({mass}kg) is well within nominal lift capacity for target orbit ({orbit}km). Margin: +18% Delta-V."
        feasibility_score = 90
        launch_vehicle = "AeroSpace Medium-Lift IV"

    # Coverage calculations
    if "Europe" in request.target_region or "Atlantic" in request.target_region or "Global" in request.target_region:
        coverage_pct = 93.4
        pop_served = "18.4M"
        gaps = 2
    else:
        coverage_pct = 88.5
        pop_served = "12.1M"
        gaps = 3
    coverage_assessment = f"Target orbital inclination provides {coverage_pct}% optical and RF revisit access to {request.target_region}."
    coverage_score = int(coverage_pct)

    # Cross-domain reasoning and overall synthesis
    readiness = int((debris_score * 0.25) + (weather_score * 0.25) + (feasibility_score * 0.25) + (coverage_score * 0.25))
    
    if debris_risk == "High" or feasibility_status == "Marginal":
        overall_risk = "MEDIUM–HIGH"
        rec_window = "Wednesday — 14:15 UTC"
        reasoning_text = (
            "Primary Monday window exhibits heightened conjunction risks in the target orbital plane. "
            "Wednesday window provides orbital slot phase shift mitigating conjunction vectors while preserving 91% coverage and fuel margins."
        )
    else:
        overall_risk = "LOW–MEDIUM"
        rec_window = "Tuesday — 10:30 UTC"
        reasoning_text = (
            "Monday provides lower launch cost but has higher conjunction risk with trackable space debris catalog objects. "
            "Tuesday provides improved orbital safety (+14km clearance), favorable ionospheric space weather, and preserves 93% target regional coverage."
        )

    response_payload = {
        "mission_summary": {
            "name": request.mission_name,
            "orbit": f"{request.target_orbit_km} km LEO",
            "mass": f"{request.payload_mass_kg} kg",
            "duration": f"{request.mission_duration_days} days",
            "budget": f"${request.budget_m}M",
            "region": request.target_region,
            "preferred_date": request.preferred_launch_date
        },
        "debris": {
            "agent_id": "orbital_debris",
            "risk": debris_risk,
            "nearby_objects": debris_objects,
            "conjunction_risk": debris_risk,
            "score": debris_score,
            "assessment": debris_assessment,
            "tracked_fragments": [
                {"id": "DEB-9801", "distance_km": 4.2, "relative_velocity_kms": 10.4, "risk": "Moderate"},
                {"id": "SL-16-R/B", "distance_km": 14.8, "relative_velocity_kms": 7.8, "risk": "Low"},
                {"id": "COSMOS-2251-DEB", "distance_km": 8.1, "relative_velocity_kms": 12.1, "risk": "Moderate"}
            ]
        },
        "weather": {
            "agent_id": "space_weather",
            "risk": weather_risk,
            "kp_index": kp_val,
            "solar_activity": "Moderate (Class C Flare probability < 10%)",
            "score": weather_score,
            "assessment": weather_assessment,
            "atmospheric_drag_risk": "Nominal",
            "radiation_dose_rate": "0.14 mSv/day"
        },
        "feasibility": {
            "agent_id": "mission_feasibility",
            "status": feasibility_status,
            "launch_vehicle": launch_vehicle,
            "payload_capacity": "Sufficient (Margin +18.4%)",
            "estimated_cost": est_cost,
            "score": feasibility_score,
            "assessment": feasibility_assessment,
            "delta_v_required": "3,450 m/s",
            "staging_margin": "14.2%"
        },
        "coverage": {
            "agent_id": "coverage",
            "coverage_percent": coverage_pct,
            "population_served": pop_served,
            "coverage_gaps": gaps,
            "score": coverage_score,
            "assessment": coverage_assessment,
            "ground_station_passes_per_day": 8,
            "mean_revisit_time_min": 115
        },
        "orchestrator": {
            "status": "Cross-Domain Reasoning Completed",
            "conflict_detected": "Minor conflict between launch slot staging fuel cost and orbital debris avoidance clearance window.",
            "resolution": "Applied Pareto-optimal orbital phasing. Shifted launch by 14 hours to achieve maximum safety with negligible fuel delta.",
            "synthesis": reasoning_text,
            "agent_consensus": {
                "orbital_debris": f"{debris_risk} Risk",
                "space_weather": f"{weather_risk} Risk",
                "mission_feasibility": feasibility_status,
                "coverage": f"{coverage_pct}% Coverage"
            }
        },
        "recommendation": {
            "launch_window": rec_window,
            "readiness": readiness,
            "risk": overall_risk,
            "key_factors": [
                f"Lower conjunction risk in calculated trajectory",
                f"Favorable space-weather conditions (Kp Index {kp_val})",
                f"Mission configuration is {feasibility_status.lower()}",
                f"{int(coverage_pct)}% target regional coverage achieved"
            ],
            "risk_mitigation": "Continue automated orbital tracking & radar telemetry ingestion 24h before T-0 countdown.",
            "disclaimer": "Decision-support prototype only. AMDSF does not execute real-time flight telemetry or spacecraft thruster firings."
        },
        "chart_data": {
            "risk_breakdown": [
                {"name": "Debris Conjunction", "risk_index": 100 - debris_score, "domain": "SSA"},
                {"name": "Space Weather", "risk_index": 100 - weather_score, "domain": "Heliophysics"},
                {"name": "Feasibility Constraint", "risk_index": 100 - feasibility_score, "domain": "Propulsion"},
                {"name": "Coverage Gap", "risk_index": 100 - coverage_score, "domain": "Constellation"}
            ],
            "launch_window_comparison": [
                {"window": "Monday", "risk": 68, "cost": 39, "coverage": 89, "safety": 32},
                {"window": "Tuesday (Recommended)", "risk": 24, "cost": 42, "coverage": 93, "safety": 88},
                {"window": "Wednesday", "risk": 45, "cost": 46, "coverage": 91, "safety": 72}
            ]
        },
        "map_data": {
            "satellite_position": {"lat": 48.8566, "lng": 2.3522, "alt_km": orbit, "label": request.mission_name},
            "coverage_radius_km": 1200,
            "ground_track": [
                {"lat": 28.5728, "lng": -80.6490, "name": "Cape Canaveral Launch Point"},
                {"lat": 38.8951, "lng": -40.0000, "name": "Atlantic Ascent Track"},
                {"lat": 48.8566, "lng": 2.3522, "name": "Target Region Observation Pass"},
                {"lat": 55.7558, "lng": 37.6173, "name": "Descending Arc"}
            ],
            "debris_markers": [
                {"lat": 51.5074, "lng": 0.1278, "name": "DEB-9801 (Conjunction Hazard)", "risk": "Medium", "type": "debris"},
                {"lat": 45.4642, "lng": 9.1900, "name": "SL-16-R/B Fragment", "risk": "Low", "type": "debris"},
                {"lat": 40.4168, "lng": -3.7038, "name": "COSMOS-2251 Splinter", "risk": "Medium", "type": "debris"},
                {"lat": 35.6895, "lng": 139.6917, "name": "Catalog Object #4412", "risk": "Low", "type": "debris"}
            ],
            "ground_stations": [
                {"lat": 52.5200, "lng": 13.4050, "name": "ESOC Darmstadt / Station A"},
                {"lat": 37.9838, "lng": 23.7275, "name": "Mediterranean Telemetry Station"}
            ]
        }
    }
    return response_payload
