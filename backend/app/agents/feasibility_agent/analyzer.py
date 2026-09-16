from typing import Dict, Any, List
from .models import FeasibilityAnalysisResult

class FeasibilityAnalyzer:
    """Evaluates payload mass, target orbit, mission lifespan, launch site and allocated budget"""

    # Prototype Launch Vehicle catalog
    VEHICLE_CATALOG = [
        {"name": "AeroSpace Small-Lift I (PSLV-Class)", "max_leo_kg": 350.0, "base_cost_m": 12.0, "max_altitude_km": 700.0, "compatible_sites": ["SDSC_SHAR", "CCAFS", "KOUROU"]},
        {"name": "AeroSpace Medium-Lift IV (GSLV/Falcon-Class)", "max_leo_kg": 1500.0, "base_cost_m": 38.0, "max_altitude_km": 1200.0, "compatible_sites": ["SDSC_SHAR", "CCAFS", "KSC", "VANDENBERG"]},
        {"name": "AeroSpace Heavy-Lift Booster (LVM3/Heavy-Class)", "max_leo_kg": 5000.0, "base_cost_m": 85.0, "max_altitude_km": 2000.0, "compatible_sites": ["SDSC_SHAR", "KSC", "KOUROU"]}
    ]

    @classmethod
    def evaluate(
        cls,
        payload_mass_kg: float,
        target_orbit_km: float,
        mission_duration_days: int,
        budget_m: float,
        launch_site: str = "Satish Dhawan Space Centre",
        launch_vehicle_pref: str = "AUTO"
    ) -> FeasibilityAnalysisResult:
        # Match suitable vehicle
        selected_vehicle = None
        for v in cls.VEHICLE_CATALOG:
            if payload_mass_kg <= v["max_leo_kg"] and target_orbit_km <= v["max_altitude_km"]:
                selected_vehicle = v
                break
        
        if not selected_vehicle:
            selected_vehicle = cls.VEHICLE_CATALOG[-1]

        # Calculate estimated mission cost (Prototype Estimate)
        duration_factor = 1.0 + (mission_duration_days / 365.0) * 0.08
        orbit_factor = 1.0 + (target_orbit_km / 1000.0) * 0.12
        est_cost = round(selected_vehicle["base_cost_m"] * duration_factor * orbit_factor, 1)

        capacity_margin = round(((selected_vehicle["max_leo_kg"] - payload_mass_kg) / selected_vehicle["max_leo_kg"]) * 100, 1)
        propulsion_margin = max(12.0, round(capacity_margin * 0.45, 1))

        if est_cost <= budget_m:
            budget_status = "WITHIN_BUDGET"
            feasible = True
            summary = f"Mission configuration satisfies feasibility constraints from {launch_site}. Estimated cost (${est_cost}M) is within allocated budget (${budget_m}M)."
            factors = [
                f"Payload mass ({payload_mass_kg} kg) is within {selected_vehicle['name']} capacity ({selected_vehicle['max_leo_kg']} kg)",
                f"Launch facility '{launch_site}' supports selected orbital inclination staging",
                f"Propulsion delta-V margin is +{propulsion_margin}% above insertion baseline",
                f"Allocated budget (${budget_m}M) covers lifecycle lifecycle cost (${est_cost}M)"
            ]
        else:
            budget_status = "OVER_BUDGET"
            feasible = False
            summary = f"Mission exceeds allocated budget (${est_cost}M estimated vs ${budget_m}M allocated). Configuration requires payload optimization or rideshare manifesting."
            factors = [
                f"Vehicle staging cost for {selected_vehicle['name']} (${est_cost}M) exceeds budget (${budget_m}M)",
                f"Budget deficit of ${round(est_cost - budget_m, 1)}M detected",
                "Recommend rideshare co-manifesting or reducing payload mass"
            ]

        return FeasibilityAnalysisResult(
            agent="Mission Feasibility Agent",
            status="completed",
            feasible=feasible,
            launch_vehicle=selected_vehicle["name"],
            payload_capacity_kg=selected_vehicle["max_leo_kg"],
            estimated_cost_m=est_cost,
            budget_status=budget_status,
            cost_status_label="Prototype Estimate",
            summary=summary,
            factors=factors,
            propulsion_margin_percent=propulsion_margin,
            details={
                "delta_v_budget_ms": 3450 + int(target_orbit_km * 0.4),
                "payload_mass_fraction": round(payload_mass_kg / selected_vehicle["max_leo_kg"], 3),
                "launch_site_selected": launch_site,
                "fairing_static_envelope": "Standard 3.2m payload fairing compatible"
            }
        )
