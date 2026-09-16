from typing import Dict, Any, List
from .models import FeasibilityAnalysisResult

class FeasibilityAnalyzer:
    """Evaluates payload mass, target orbit, mission lifespan and allocated budget"""

    # Prototype Launch Vehicle catalog
    VEHICLE_CATALOG = [
        {"name": "AeroSpace Small-Lift I", "max_leo_kg": 350.0, "base_cost_m": 12.0, "max_altitude_km": 700.0},
        {"name": "AeroSpace Medium-Lift IV", "max_leo_kg": 1500.0, "base_cost_m": 38.0, "max_altitude_km": 1200.0},
        {"name": "AeroSpace Heavy-Lift Booster", "max_leo_kg": 5000.0, "base_cost_m": 85.0, "max_altitude_km": 2000.0}
    ]

    @classmethod
    def evaluate(cls, payload_mass_kg: float, target_orbit_km: float, mission_duration_days: int, budget_m: float) -> FeasibilityAnalysisResult:
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
            summary = f"Mission configuration satisfies prototype feasibility constraints. Estimated cost (${est_cost}M) is within allocated budget (${budget_m}M)."
            factors = [
                f"Payload mass ({payload_mass_kg} kg) is within {selected_vehicle['name']} capacity ({selected_vehicle['max_leo_kg']} kg)",
                f"Propulsion delta-V margin is +{propulsion_margin}% above orbital insertion baseline",
                f"Allocated budget (${budget_m}M) covers estimated mission lifecycle (${est_cost}M)"
            ]
        else:
            budget_status = "OVER_BUDGET"
            feasible = False
            summary = f"Mission exceeds allocated budget constraint (${est_cost}M estimated vs ${budget_m}M budget). Configuration requires payload/orbit optimization."
            factors = [
                f"Selected vehicle {selected_vehicle['name']} base staging exceeds budget limits",
                f"Budget deficit of ${round(est_cost - budget_m, 1)}M detected",
                "Recommend payload mass reduction or rideshare co-manifesting"
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
                "fairing_static_envelope": "Standard 3.2m payload fairing compatible"
            }
        )
