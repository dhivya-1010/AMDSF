import math
from typing import Any, Dict, List, Optional
from .models import FeasibilityAnalysisResult

R_EARTH_KM = 6371.0088
MU_EARTH_KM3_S2 = 398600.4418


class FeasibilityAnalyzer:
    """Evaluates payload mass, target orbit, launch site compatibility, cost breakdown, and engineering constraints."""

    VEHICLE_CATALOG = [
        {
            "name": "AeroSpace Small-Lift I (PSLV-Class)",
            "max_leo_kg": 350.0,
            "base_cost_m": 12.0,
            "max_altitude_km": 700.0,
            "compatible_sites": ["SDSC_SHAR", "CCAFS", "KOUROU", "JSLC", "VANDENBERG"],
        },
        {
            "name": "AeroSpace Medium-Lift IV (GSLV/Falcon-Class)",
            "max_leo_kg": 1500.0,
            "base_cost_m": 38.0,
            "max_altitude_km": 1200.0,
            "compatible_sites": ["SDSC_SHAR", "CCAFS", "KSC", "VANDENBERG", "JSLC", "TNSC", "KOUROU"],
        },
        {
            "name": "AeroSpace Heavy-Lift Booster (LVM3/Heavy-Class)",
            "max_leo_kg": 5000.0,
            "base_cost_m": 85.0,
            "max_altitude_km": 2000.0,
            "compatible_sites": ["SDSC_SHAR", "KSC", "KOUROU", "CCAFS", "TNSC", "JSLC"],
        },
    ]

    SITE_ALIASES = {
        "satish dhawan": "SDSC_SHAR",
        "sdsc": "SDSC_SHAR",
        "sriharikota": "SDSC_SHAR",
        "cape canaveral": "CCAFS",
        "ccafs": "CCAFS",
        "kennedy": "KSC",
        "ksc": "KSC",
        "vandenberg": "VANDENBERG",
        "kourou": "KOUROU",
        "guiana": "KOUROU",
        "jiuquan": "JSLC",
        "jslc": "JSLC",
        "tanegashima": "TNSC",
        "tnsc": "TNSC",
    }

    SITE_LATITUDES = {
        "SDSC_SHAR": 13.72,
        "CCAFS": 28.49,
        "KSC": 28.57,
        "VANDENBERG": 34.74,
        "KOUROU": 5.24,
        "JSLC": 40.96,
        "TNSC": 30.40,
    }

    VEHICLE_ALIASES = {
        "aerospace heavy booster": "AeroSpace Heavy-Lift Booster (LVM3/Heavy-Class)",
        "heavy-lift": "AeroSpace Heavy-Lift Booster (LVM3/Heavy-Class)",
        "lvm3": "AeroSpace Heavy-Lift Booster (LVM3/Heavy-Class)",
        "medium-lift": "AeroSpace Medium-Lift IV (GSLV/Falcon-Class)",
        "falcon": "AeroSpace Medium-Lift IV (GSLV/Falcon-Class)",
        "gslv": "AeroSpace Medium-Lift IV (GSLV/Falcon-Class)",
        "small-lift": "AeroSpace Small-Lift I (PSLV-Class)",
        "pslv": "AeroSpace Small-Lift I (PSLV-Class)",
    }

    @classmethod
    def _match_vehicle(cls, pref: Optional[str], vehicle_name: str) -> bool:
        if not pref or pref in ("AUTO", ""):
            return True
        norm = pref.strip().lower()
        if norm == vehicle_name.lower() or norm in vehicle_name.lower():
            return True
        mapped = cls.VEHICLE_ALIASES.get(norm)
        return mapped == vehicle_name if mapped else False

    @classmethod
    def evaluate(
        cls,
        payload_mass_kg: float,
        target_orbit_km: float,
        mission_duration_days: int,
        budget_m: float,
        launch_site: str = "Satish Dhawan Space Centre",
        launch_site_code: Optional[str] = None,
        launch_vehicle_pref: str = "AUTO",
        inclination_deg: float = 97.6,
        satellite_manufacturing_cost_musd: Optional[float] = None,
        launch_cost_musd: Optional[float] = None,
        annual_operations_cost_musd: Optional[float] = None,
    ) -> FeasibilityAnalysisResult:
        if payload_mass_kg < 0 or target_orbit_km < 0 or mission_duration_days < 0 or budget_m < 0:
            raise ValueError("Mission feasibility inputs must be non-negative.")

        site_key = (launch_site_code or "").upper().strip()
        if not site_key:
            site_text = (launch_site or "").lower()
            site_key = next((code for label, code in cls.SITE_ALIASES.items() if label in site_text), launch_site.upper())

        # Filter vehicles that strictly satisfy payload, altitude, site, and preference
        pref_specified = bool(launch_vehicle_pref and launch_vehicle_pref not in ("AUTO", ""))
        candidates = [
            v for v in cls.VEHICLE_CATALOG
            if payload_mass_kg <= v["max_leo_kg"]
            and target_orbit_km <= v["max_altitude_km"]
            and site_key in v["compatible_sites"]
            and (not pref_specified or cls._match_vehicle(launch_vehicle_pref, v["name"]))
        ]
        selected_vehicle = candidates[0] if candidates else None

        if selected_vehicle is None:
            reason = (
                f"Requested vehicle '{launch_vehicle_pref}' does not satisfy payload ({payload_mass_kg} kg), "
                f"altitude ({target_orbit_km} km), or site ({site_key}) constraints."
                if pref_specified
                else "No configured vehicle in the prototype catalog satisfies payload, altitude, and launch-site constraints."
            )
            return FeasibilityAnalysisResult(
                status="infeasible",
                feasible=False,
                launch_vehicle="UNAVAILABLE",
                payload_capacity_kg=0.0,
                estimated_cost_m=0.0,
                budget_status="NO_COMPATIBLE_VEHICLE",
                cost_status_label="Parametric / Configurable Model",
                summary=reason,
                factors=[
                    reason,
                    "Cost and propulsion margins cannot be finalized without a compatible launch vehicle.",
                ],
                propulsion_margin_percent=0.0,
                details={
                    "data_status": "available",
                    "vehicle_catalog_type": "prototype",
                    "launch_site_selected": launch_site,
                    "launch_site_code": site_key,
                    "requested_vehicle": launch_vehicle_pref,
                },
            )

        # Transparent cost model combining configurable user overrides or parametric prototype estimates
        duration_years = mission_duration_days / 365.0
        orbit_factor = 1.0 + (target_orbit_km / 1000.0) * 0.12

        if launch_cost_musd is not None:
            calc_launch_cost = round(float(launch_cost_musd), 2)
            launch_cost_source = "user_configured"
        else:
            calc_launch_cost = round(selected_vehicle["base_cost_m"] * orbit_factor, 2)
            launch_cost_source = "parametric_vehicle_model"

        if satellite_manufacturing_cost_musd is not None:
            calc_mfg_cost = round(float(satellite_manufacturing_cost_musd), 2)
            mfg_cost_source = "user_configured"
        else:
            calc_mfg_cost = round(payload_mass_kg * 0.015, 2)
            mfg_cost_source = "parametric_mass_model"

        if annual_operations_cost_musd is not None:
            calc_ops_cost = round(float(annual_operations_cost_musd) * duration_years, 2)
            ops_cost_source = "user_configured"
        else:
            calc_ops_cost = round(calc_launch_cost * duration_years * 0.08, 2)
            ops_cost_source = "parametric_lifecycle_model"

        est_cost = round(calc_launch_cost + calc_mfg_cost + calc_ops_cost, 1)

        # Orbital mechanics & engineering feasibility checks
        r_orbit = R_EARTH_KM + target_orbit_km
        v_circ_kms = math.sqrt(MU_EARTH_KM3_S2 / r_orbit)
        period_min = (2.0 * math.pi * math.sqrt((r_orbit ** 3) / MU_EARTH_KM3_S2)) / 60.0
        capacity_margin = round(((selected_vehicle["max_leo_kg"] - payload_mass_kg) / selected_vehicle["max_leo_kg"]) * 100, 1)
        propulsion_margin = max(12.0, round(capacity_margin * 0.45, 1))
        site_lat = cls.SITE_LATITUDES.get(site_key)

        engineering_warnings: List[str] = []
        if target_orbit_km < 300.0:
            engineering_warnings.append(
                f"Low perigee/altitude ({target_orbit_km} km) incurs high atmospheric drag and requires frequent station-keeping."
            )
        if target_orbit_km > 650.0:
            engineering_warnings.append(
                f"Altitude ({target_orbit_km} km) exceeds typical ~25-year passive decay band; active de-orbit propulsion is advised."
            )
        if site_lat is not None and abs(inclination_deg) < abs(site_lat) and abs(180.0 - inclination_deg) < abs(site_lat):
            engineering_warnings.append(
                f"Target inclination ({inclination_deg}°) is below launch site latitude ({site_lat}°), requiring out-of-plane dogleg Delta-V."
            )

        if est_cost <= budget_m:
            budget_status = "WITHIN_BUDGET"
            feasible = True
            summary = (
                f"Configuration is technically & economically viable from {launch_site} using {selected_vehicle['name']}. "
                f"Estimated lifecycle cost (${est_cost}M) is within budget (${budget_m}M)."
            )
            factors = [
                f"Payload mass ({payload_mass_kg} kg) within {selected_vehicle['name']} capacity ({selected_vehicle['max_leo_kg']} kg, +{capacity_margin}% mass margin)",
                f"Cost breakdown: Launch ${calc_launch_cost}M + Manufacturing ${calc_mfg_cost}M + Operations ${calc_ops_cost}M = ${est_cost}M (Budget ${budget_m}M)",
                f"Circular velocity {v_circ_kms:.2f} km/s, period {period_min:.1f} min, estimated Delta-V margin +{propulsion_margin}%",
            ]
        else:
            budget_status = "OVER_BUDGET"
            feasible = False
            deficit = round(est_cost - budget_m, 1)
            summary = (
                f"Mission exceeds allocated budget (${est_cost}M estimated vs ${budget_m}M allocated, deficit ${deficit}M). "
                "Requires budget increase, rideshare manifesting, or cost parameter refinement."
            )
            factors = [
                f"Estimated lifecycle cost (${est_cost}M) exceeds allocated budget (${budget_m}M) by ${deficit}M",
                f"Cost breakdown: Launch ${calc_launch_cost}M + Manufacturing ${calc_mfg_cost}M + Operations ${calc_ops_cost}M",
                f"Payload mass ({payload_mass_kg} kg) fits {selected_vehicle['name']} ({selected_vehicle['max_leo_kg']} kg limit)",
            ]
        factors.extend(engineering_warnings)

        all_user_configured = (
            launch_cost_musd is not None
            and satellite_manufacturing_cost_musd is not None
            and annual_operations_cost_musd is not None
        )

        return FeasibilityAnalysisResult(
            agent="Mission Feasibility Agent",
            status="completed",
            feasible=feasible,
            launch_vehicle=selected_vehicle["name"],
            payload_capacity_kg=selected_vehicle["max_leo_kg"],
            estimated_cost_m=est_cost,
            budget_status=budget_status,
            cost_status_label="Configured Financial Model" if all_user_configured else "Parametric Prototype Estimate (Not a Commercial Quote)",
            summary=summary,
            factors=factors,
            propulsion_margin_percent=propulsion_margin,
            details={
                "data_status": "available",
                "vehicle_catalog_type": "prototype",
                "cost_disclaimer": "Parametric estimates use simplified mission scaling unless explicit cost parameters are supplied.",
                "cost_breakdown_musd": {
                    "launch": calc_launch_cost,
                    "launch_source": launch_cost_source,
                    "satellite_manufacturing": calc_mfg_cost,
                    "manufacturing_source": mfg_cost_source,
                    "operations_total": calc_ops_cost,
                    "operations_source": ops_cost_source,
                    "total": est_cost,
                },
                "cost_formula": "total = launch_cost + manufacturing_cost + operations_cost",
                "orbital_mechanics": {
                    "circular_velocity_kms": round(v_circ_kms, 3),
                    "orbital_period_minutes": round(period_min, 2),
                    "delta_v_budget_ms": 3450 + int(target_orbit_km * 0.4),
                    "capacity_margin_percent": capacity_margin,
                    "launch_site_latitude_deg": site_lat,
                },
                "engineering_warnings": engineering_warnings,
                "delta_v_budget_ms": 3450 + int(target_orbit_km * 0.4),
                "payload_mass_fraction": round(payload_mass_kg / selected_vehicle["max_leo_kg"], 3),
                "launch_site_selected": launch_site,
                "launch_site_code": site_key,
                "fairing_static_envelope": "Standard 3.2m payload fairing compatible",
            },
        )
