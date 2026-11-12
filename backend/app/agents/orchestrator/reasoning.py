from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from app.agents.coverage_agent.models import CoverageAnalysisResult
from app.agents.debris_agent.models import DebrisAnalysisResult
from app.agents.feasibility_agent.models import FeasibilityAnalysisResult
from app.agents.weather_agent.models import WeatherAnalysisResult
from app.config import settings
from app.schemas.mission import MissionRequestSchema
from .models import OrchestratorResult, RecommendationDetails

LAUNCH_SITE_COORDS = {
    "SDSC_SHAR": {"lat": 13.7199, "lng": 80.2304, "name": "Satish Dhawan Space Centre (SHAR)"},
    "CCAFS": {"lat": 28.5623, "lng": -80.5774, "name": "Cape Canaveral SFS"},
    "KSC": {"lat": 28.5728, "lng": -80.6490, "name": "Kennedy Space Center"},
    "VANDENBERG": {"lat": 34.6321, "lng": -120.6106, "name": "Vandenberg SFB"},
    "KOUROU": {"lat": 5.2322, "lng": -52.7606, "name": "Guiana Space Centre, Kourou"},
    "TNSC": {"lat": 30.4000, "lng": 130.9700, "name": "Tanegashima Space Center"},
    "JSLC": {"lat": 40.9606, "lng": 100.2983, "name": "Jiuquan Satellite Launch Center"},
    "WSLS": {"lat": 19.6144, "lng": 110.9511, "name": "Wenchang Space Launch Site"},
}


def _safe_details(obj: Any) -> Dict[str, Any]:
    return getattr(obj, "details", None) or {}


def _build_launch_window_comparison(
    mission_req: MissionRequestSchema,
    debris: DebrisAnalysisResult,
    weather: WeatherAnalysisResult,
    feasibility: FeasibilityAnalysisResult,
    coverage: CoverageAnalysisResult,
    base_readiness: int,
    data_available: bool,
) -> List[Dict[str, Any]]:
    """Build deterministic multi-day candidate launch-window comparison from current measurements."""
    if not data_available:
        return []
    try:
        pref_dt = datetime.strptime(mission_req.constraints.preferred_launch_date, "%Y-%m-%d")
    except ValueError:
        pref_dt = datetime(2026, 10, 15)

    flex = min(max(int(mission_req.constraints.launch_window_flexibility_days or 3), 1), 5)
    kp_base = float(weather.kp_index or 2.0)
    debris_base = float(debris.risk_score if debris.risk_score is not None else 0.3) * 100.0
    cov_pct = float(coverage.coverage_percent or 0.0)

    series: List[Dict[str, Any]] = []
    for offset in range(-flex, flex + 1):
        day_dt = pref_dt + timedelta(days=offset)
        # Geomagnetic persistence decay away from storm peak (T=0 carries highest storm penalty if active)
        weather_penalty = (kp_base / 9.0) * 100.0 * (0.85 ** abs(offset))
        # Conjunction catalog uncertainty grows gently with epoch offset away from catalog epoch
        debris_proj = min(100.0, round(debris_base + abs(offset) * 3.5, 1))
        feas_score = 92.0 if feasibility.feasible else 35.0
        day_readiness = int(
            max(
                20.0,
                min(
                    98.0,
                    0.30 * (100.0 - debris_proj)
                    + 0.25 * (100.0 - weather_penalty)
                    + 0.25 * feas_score
                    + 0.20 * cov_pct,
                ),
            )
        )
        if offset == 0 and day_readiness < base_readiness:
            day_readiness = base_readiness
        series.append({
            "date": day_dt.strftime("%Y-%m-%d"),
            "offset_days": offset,
            "readiness": day_readiness,
            "debris_risk": round(debris_proj, 1),
            "weather_risk": round(weather_penalty, 1),
            "coverage_score": round(cov_pct, 1),
        })
    return series


class CrossDomainReasoner:
    """Core deterministic multi-domain arbitration engine producing GO / CONDITIONAL GO / HOLD decisions."""

    @classmethod
    def synthesize(
        cls,
        mission_req: MissionRequestSchema,
        debris: DebrisAnalysisResult,
        weather: WeatherAnalysisResult,
        feasibility: FeasibilityAnalysisResult,
        coverage: CoverageAnalysisResult,
    ) -> OrchestratorResult:
        debris_details = _safe_details(debris)
        weather_details = _safe_details(weather)
        feas_details = _safe_details(feasibility)
        cov_details = _safe_details(coverage)

        policy = str(
            getattr(
                mission_req.constraints,
                "missing_data_policy",
                settings.ORCHESTRATOR_MISSING_DATA_POLICY,
            )
            or "conditional_go"
        ).strip().lower()

        # Core check flags
        debris_ok = debris.risk_level not in ("INSUFFICIENT_DATA", "UNAVAILABLE")
        weather_ok = (
            getattr(weather, "status", "unavailable") != "unavailable"
            and weather.risk_score is not None
            and weather.kp_index is not None
        )
        coverage_ok = (
            getattr(coverage, "status", "unavailable") not in ("unavailable", "insufficient_data")
            and coverage.coverage_percent is not None
        )
        data_available = debris_ok and weather_ok and coverage_ok

        is_debris_high = debris.risk_level == "HIGH"
        is_debris_medium = debris.risk_level == "MEDIUM"
        is_weather_high = weather.risk_level == "HIGH"
        is_weather_medium = weather.risk_level == "MEDIUM"
        is_feasible = bool(feasibility.feasible)
        coverage_met = (
            coverage.coverage_percent is not None
            and coverage.coverage_percent >= mission_req.target.coverage_requirement
        )

        # Gather structured evidence, missing checks, risk factors, actions
        supporting_evidence: List[str] = []
        failed_or_unavailable: List[str] = []
        risk_factors: List[str] = []
        required_next_actions: List[str] = []
        conflicts: List[str] = []
        tradeoffs: List[str] = []

        # 1. Debris domain evaluation
        debris_mode = getattr(debris, "data_mode", debris_details.get("data_mode", "UNKNOWN"))
        if not debris_ok:
            failed_or_unavailable.append(f"Orbital debris screening unavailable ({debris.risk_level}).")
            required_next_actions.append("Supply valid mission NORAD ID/TLE/OMM and ensure CelesTrak catalog is reachable.")
        else:
            supporting_evidence.append(
                f"Debris screening ({debris_mode}): {debris.nearby_objects} close approach(es) within "
                f"{debris_details.get('screening_threshold_km', 25)} km across {debris.objects_analyzed} catalog objects ({debris.risk_level})."
            )
            if is_debris_high:
                failed_or_unavailable.append(f"Critical debris conjunction detected (HIGH risk, {debris.nearby_objects} encounter(s) <= 5 km).")
                risk_factors.append("Propagated miss distance <= 5 km requires Collision Avoidance Maneuver (CAM) or epoch shift.")
                required_next_actions.append("Request operational 18th SDS Conjunction Data Message (CDM) with state covariance.")
            elif is_debris_medium:
                risk_factors.append(f"Moderate conjunction proximity ({debris.nearby_objects} object(s) within screening threshold).")
                required_next_actions.append("Monitor close-approach evolution prior to T-24h launch commit.")
            if debris_mode == "DEMONSTRATION DATA":
                failed_or_unavailable.append("Debris screening executed on offline demonstration catalog (not live CelesTrak GP).")
                required_next_actions.append("Re-run orbital debris screening against live CelesTrak GP catalog before commit.")

        # 1b. Secondary ML Encounter Risk Assessment (NGBoost - advisory only; SGP4 remains primary)
        ml_risk = getattr(debris, "ml_encounter_risk", None) or debris_details.get("ml_encounter_risk")
        if ml_risk and ml_risk.get("status") == "completed":
            ml_pred = ml_risk.get("prediction", "UNKNOWN")
            ml_probs = ml_risk.get("probabilities_percent") or {}
            supporting_evidence.append(
                f"NGBoost Encounter Risk Advisory (DEMONSTRATION ML): {ml_pred} "
                f"(Low={ml_probs.get('low', 0)}%, Med={ml_probs.get('medium', 0)}%, High={ml_probs.get('high', 0)}%; "
                f"non-calibrated synthetic support model)."
            )
            if ml_pred == "HIGH RISK" and not is_debris_high:
                risk_factors.append(
                    f"NGBoost probabilistic classifier flagged elevated HIGH RISK ({ml_probs.get('high', 0)}%) "
                    f"on closest screened object despite deterministic threshold clearance; verify close-approach geometry."
                )
                required_next_actions.append(
                    "Review closest screened object geometry highlighted by NGBoost encounter classifier."
                )
        elif debris_ok:
            failed_or_unavailable.append(
                "NGBoost ML encounter assessment unavailable (missing/invalid encounter feature vector)."
            )

        # 2. Space weather evaluation
        weather_mode = getattr(weather, "data_mode", weather_details.get("data_mode", "UNKNOWN"))
        if not weather_ok:
            failed_or_unavailable.append("NOAA SWPC space-weather telemetry unavailable.")
            required_next_actions.append("Retry NOAA SWPC geomagnetic Kp and solar flux retrieval.")
        else:
            supporting_evidence.append(
                f"Space weather ({weather_mode}): Kp={weather.kp_index}, Solar activity={weather.solar_activity}, Risk={weather.risk_level}."
            )
            if getattr(weather, "status", "") == "partial":
                failed_or_unavailable.append("NASA DONKI CME/flare archive unavailable; NOAA SWPC used alone.")
                required_next_actions.append("Verify NASA DONKI CME/flare advisories manually if automated gateway remains down.")
            if is_weather_high:
                failed_or_unavailable.append(f"Active geomagnetic storm risk (Kp={weather.kp_index}, HIGH).")
                risk_factors.append("Elevated thermospheric drag and spacecraft surface charging during geomagnetic storming.")
                required_next_actions.append("Delay launch until Kp drops below 4.0 and storm warning expires.")
            elif is_weather_medium:
                risk_factors.append(f"Unsettled solar/geomagnetic activity (Kp={weather.kp_index}).")
            if weather_mode == "DEMONSTRATION DATA":
                failed_or_unavailable.append("Space weather uses offline demonstration sample instead of live NOAA/NASA feeds.")
                required_next_actions.append("Switch to Live telemetry mode prior to operational launch window commit.")

        # 3. Feasibility evaluation
        if is_feasible:
            supporting_evidence.append(
                f"Engineering & economic viability PASS: {feasibility.launch_vehicle}, "
                f"${feasibility.estimated_cost_m}M / ${mission_req.mission.budget_musd}M ({feasibility.budget_status})."
            )
        else:
            failed_or_unavailable.append(
                f"Feasibility constraint failed ({feasibility.budget_status}: ${feasibility.estimated_cost_m}M vs ${mission_req.mission.budget_musd}M budget)."
            )
            risk_factors.append(f"Launch staging constraint: {feasibility.summary}")
            required_next_actions.append("Adjust mission budget, payload mass, orbit altitude, or launch vehicle class.")

        for warn in feas_details.get("engineering_warnings", []):
            risk_factors.append(warn)

        # 4. Coverage evaluation
        cov_mode = getattr(coverage, "data_mode", "UNKNOWN")
        if not coverage_ok:
            failed_or_unavailable.append(f"Orbital coverage analysis incomplete ({coverage.status}).")
            required_next_actions.append("Configure sensor FOV / swath parameters and re-run SGP4 coverage propagation.")
        else:
            revisit_txt = f", revisit ~{coverage.revisit_time_minutes} min" if coverage.revisit_time_minutes else ""
            supporting_evidence.append(
                f"Orbital coverage ({cov_mode}): {coverage.coverage_percent}% area reach over {coverage.target_region}"
                f"{revisit_txt} (Req: {mission_req.target.coverage_requirement}%)."
            )
            if not coverage_met:
                failed_or_unavailable.append(
                    f"Target coverage {coverage.coverage_percent}% below requirement ({mission_req.target.coverage_requirement}%)."
                )
                risk_factors.append("Sensor swath or orbital inclination/observation window does not satisfy target coverage percentage.")
                required_next_actions.append("Widen sensor FOV, adjust inclination, or extend constellation/observation duration.")
            if cov_details.get("is_demonstration_sensor"):
                failed_or_unavailable.append("Coverage swath computed using demonstration 45° baseline sensor model.")
                required_next_actions.append("Input flight instrument sensor FOV / swath width for mission-specific sizing.")
            if cov_details.get("population_data_status") in ("unavailable", "disabled"):
                risk_factors.append("WorldPop gridded population count unavailable for target polygon (left unpopulated).")

        # Multi-domain weighted readiness (0 - 100)
        debris_weight = (1.0 - debris.risk_score) * 30 if debris.risk_score is not None else 0
        weather_weight = (1.0 - weather.risk_score) * 25 if weather.risk_score is not None else 0
        feasibility_weight = 25 if is_feasible else 8
        coverage_weight = (coverage.coverage_percent / 100.0) * 20 if coverage.coverage_percent is not None else 0
        readiness = int(debris_weight + weather_weight + feasibility_weight + coverage_weight)
        readiness = min(98, max(35, readiness)) if data_available else 35

        target_str = f"{mission_req.target.area}, {mission_req.target.region}, {mission_req.target.country}"
        launch_str = f"{mission_req.launch.site}"

        # Deterministic Decision Arbitration: GO / CONDITIONAL GO / HOLD
        non_demo_warning = any(
            m == "DEMONSTRATION DATA"
            for m in (debris_mode, weather_mode, cov_mode)
        )
        partial_or_review = (
            is_debris_medium
            or is_weather_medium
            or getattr(weather, "status", "") == "partial"
            or non_demo_warning
            or bool(cov_details.get("is_demonstration_sensor"))
            or not bool(cov_details.get("validated_orbital_coverage", True))
        )

        if not data_available:
            decision = "HOLD" if policy == "hold" or (not debris_ok and not weather_ok) else "CONDITIONAL GO"
            status_label = "Incomplete Data"
            conflicts.append("One or more critical domain agents returned unavailable or insufficient data.")
            launch_window = "Unavailable — complete required data acquisition first"
            risk_level = "REVIEW_REQUIRED"
            reason = (
                "Required orbital debris screening, space-weather telemetry, or coverage evidence is unavailable; "
                "missing data is never interpreted as a passing check."
            )
            reasoning = [
                reason,
                f"Debris status: {debris.risk_level}.",
                f"Weather status: {getattr(weather, 'status', 'unavailable')}.",
                f"Coverage status: {coverage.status}.",
            ]
            if not required_next_actions:
                required_next_actions = [
                    "Provide valid mission orbital elements and catalog snapshot.",
                    "Retry NOAA SWPC and NASA DONKI telemetry retrieval.",
                ]
            mitigation = list(required_next_actions)
            resolution = "Analysis halted pending acquisition of missing telemetry or configuration."
        elif not is_feasible:
            decision = "HOLD"
            status_label = "Hold — Feasibility Constraint Violated"
            conflicts.append(
                f"Feasibility constraint violation ({feasibility.budget_status}): ${feasibility.estimated_cost_m}M vs ${mission_req.mission.budget_musd}M budget."
            )
            tradeoffs.append("Mission requires payload mass adjustment, budget increase, or compatible launch-site/vehicle selection.")
            launch_window = "Window On Hold (Resolve Launch/Budget Constraint)"
            risk_level = "HIGH"
            reason = f"Validated feasibility failure: {feasibility.summary}"
            reasoning = [
                reason,
                f"Launch vehicle evaluation: {feasibility.launch_vehicle} (status {feasibility.budget_status}).",
                f"Debris risk: {debris.risk_level}; Space weather: {weather.risk_level}.",
            ]
            mitigation = list(required_next_actions) or ["Re-evaluate payload mass or launch vehicle staging."]
            resolution = "Mission placed on HOLD due to validated engineering or budget constraint violation."
        elif is_debris_high or is_weather_high or not coverage_met:
            decision = "HOLD"
            status_label = "Hold — Critical Mission Risk"
            if is_debris_high:
                conflicts.append(
                    f"Close approach within 5 km ({debris.nearby_objects} tracked object(s)) along {mission_req.orbit.altitude_km} km orbit."
                )
            if is_weather_high:
                conflicts.append(f"Severe geomagnetic storm conditions active (Kp={weather.kp_index}).")
            if not coverage_met:
                conflicts.append(
                    f"Calculated SGP4 coverage ({coverage.coverage_percent}%) falls below requirement ({mission_req.target.coverage_requirement}%)."
                )
            tradeoffs.append("Mitigating conjunction proximity, storm drag, or coverage shortfall requires epoch shift or orbit redesign.")
            launch_window = f"On Hold — Re-evaluate around {mission_req.constraints.preferred_launch_date} after mitigation"
            risk_level = "HIGH"
            reason = "Critical threshold breach detected across orbital safety, geomagnetic storming, or coverage compliance."
            reasoning = conflicts + [
                f"Feasibility check passed on {feasibility.launch_vehicle} (+{feasibility.propulsion_margin_percent}% margin).",
            ]
            mitigation = list(required_next_actions)
            resolution = "Mission placed on HOLD until critical conjunction/weather/coverage constraints are mitigated."
        elif partial_or_review:
            decision = "HOLD" if policy == "hold" and (non_demo_warning or getattr(weather, "status", "") == "partial") else "CONDITIONAL GO"
            status_label = "Cross-Domain Reasoning Completed"
            if is_debris_medium or is_weather_medium:
                conflicts.append("Elevated medium risk factor requires pre-launch monitoring before final commit.")
            if non_demo_warning:
                conflicts.append("One or more domains used Demonstration Data or Demonstration Sensor assumptions.")
            tradeoffs.append(f"All hard mission constraints pass on available evidence for {target_str}; verification items remain open.")
            launch_window = f"Candidate Window: {mission_req.constraints.preferred_launch_date} (Pending Verification Items)"
            risk_level = "MEDIUM" if (is_debris_medium or is_weather_medium) else "LOW–MEDIUM"
            reason = (
                "No blocking constraint violations detected, but incomplete external verification, medium risk advisories, "
                "or demonstration assumptions require review before operational GO."
            )
            reasoning = supporting_evidence + failed_or_unavailable
            if not required_next_actions:
                required_next_actions.append("Complete live telemetry verification at T-24h readiness review.")
            mitigation = list(required_next_actions)
            resolution = "Issued CONDITIONAL GO pending completion of non-blocking verification checks."
        else:
            decision = "GO"
            status_label = "Cross-Domain Reasoning Completed"
            launch_window = f"Cleared Candidate Window: {mission_req.constraints.preferred_launch_date}"
            risk_level = "LOW"
            tradeoffs.append(f"All 4 domains satisfy configured constraints for {target_str} from {launch_str}.")
            reason = (
                "All required orbital screening, live/cached space-weather, SGP4 coverage, and feasibility checks "
                "returned valid evidence within configured operational limits."
            )
            reasoning = supporting_evidence
            if not required_next_actions:
                required_next_actions = [
                    "Maintain routine T-24h CelesTrak/18th SDS conjunction screening and SWPC Kp monitoring prior to liftoff.",
                ]
            mitigation = list(required_next_actions)
            resolution = "All domain constraints verified; mission cleared for GO subject to standard pre-launch monitoring."

        # Freshness summary
        data_freshness = {
            "debris": {
                "mode": debris_mode,
                "retrieved_at": debris_details.get("data_freshness"),
                "is_cached": debris_details.get("is_cached", False),
            },
            "weather": {
                "mode": weather_mode,
                "swpc_retrieved_at": weather_details.get("swpc_retrieved_at"),
                "donki_retrieved_at": weather_details.get("donki_retrieved_at"),
            },
            "coverage": {
                "mode": cov_mode,
                "orbit_source": cov_details.get("orbit_source", "not_propagated"),
                "population_status": cov_details.get("population_data_status", "unavailable"),
            },
            "feasibility": {
                "mode": feasibility.cost_status_label,
            },
        }

        chart_data = {
            "risk_breakdown": [
                {"name": "Debris Conjunction", "risk_index": int(debris.risk_score * 100) if debris.risk_score is not None else None, "domain": "SSA"},
                {"name": "Space Weather", "risk_index": int(weather.risk_score * 100) if weather.risk_score is not None else None, "domain": "Heliophysics"},
                {"name": "Feasibility Risk", "risk_index": 15 if is_feasible else 80, "domain": "Propulsion"},
                {"name": "Coverage Gap", "risk_index": int(round(100 - coverage.coverage_percent)) if coverage.coverage_percent is not None else None, "domain": "Geometry"},
            ],
            "launch_window_comparison": _build_launch_window_comparison(
                mission_req, debris, weather, feasibility, coverage, readiness, data_available
            ),
        }

        # Populate geospatial map payload from Coverage SGP4 propagation & Debris encounters
        site_code = (mission_req.launch.launch_site_code or "SDSC_SHAR").upper()
        launch_point = LAUNCH_SITE_COORDS.get(
            site_code,
            {"lat": 13.7199, "lng": 80.2304, "name": mission_req.launch.site or "Spaceport"},
        )
        ground_track = cov_details.get("ground_track") or []
        sat_pos = cov_details.get("satellite_position")

        # Represent top encountered/screened catalog objects with real separation metadata
        raw_screened = (
            debris_details.get("encounters")
            or debris_details.get("closest_screened_objects")
            or []
        )
        debris_markers: List[Dict[str, Any]] = []
        if ground_track and raw_screened:
            step_pick = max(1, len(ground_track) // min(len(raw_screened), 6))
            for idx, item in enumerate(raw_screened[:6]):
                pt = ground_track[(idx * step_pick + 5) % len(ground_track)]
                debris_markers.append({
                    "name": item.get("name", "Catalog Object"),
                    "norad_id": item.get("catalog_identifier") or item.get("norad_id"),
                    "lat": round(max(-85.0, min(85.0, pt["lat"] + ((idx % 3) - 1) * 2.5)), 3),
                    "lng": round((((pt["lng"] + ((idx % 2) * 3.0)) + 180.0) % 360.0) - 180.0, 3),
                    "distance_km": item.get("minimum_separation_km"),
                    "tca": item.get("tca"),
                })

        map_data = {
            "target_location": {
                "lat": mission_req.target.latitude,
                "lng": mission_req.target.longitude,
                "label": f"{target_str}",
            },
            "launch_site": launch_point,
            "satellite_position": sat_pos,
            "coverage_radius_km": cov_details.get("swath_radius_km") or mission_req.target.coverage_radius_km,
            "swath_width_km": cov_details.get("swath_width_km"),
            "ground_track": ground_track,
            "debris_markers": debris_markers,
            "ground_stations": [launch_point],
            "data_status": "available" if ground_track else "unavailable_without_propagated_geospatial_states",
        }

        return OrchestratorResult(
            mission_id=mission_req.mission_id,
            status=status_label,
            agent_consensus={
                "orbital_debris": f"{debris.risk_level} ({debris.nearby_objects} encounters; {debris_mode})",
                "space_weather": f"{weather.risk_level} (Kp {weather.kp_index if weather.kp_index is not None else 'unavailable'}; {weather_mode})",
                "mission_feasibility": f"{'Feasible' if is_feasible else feasibility.budget_status} (${feasibility.estimated_cost_m}M)",
                "coverage": (
                    f"{coverage.coverage_percent}% ({cov_mode})"
                    if coverage.coverage_percent is not None
                    else f"Unavailable ({coverage.status})"
                ),
                "ml_encounter_risk": (
                    f"{ml_risk.get('prediction')} (NGBoost DEMONSTRATION)"
                    if ml_risk and ml_risk.get("status") == "completed"
                    else "Unavailable (SGP4 inputs missing)"
                ),
            },
            conflicts_detected=conflicts,
            resolution_strategy=resolution,
            ml_encounter_risk=ml_risk,
            recommendation=RecommendationDetails(
                decision=decision,
                reason=reason,
                launch_window=launch_window,
                risk_level=risk_level,
                readiness=readiness,
                reasoning=reasoning,
                supporting_evidence=supporting_evidence,
                failed_or_unavailable_checks=failed_or_unavailable,
                risk_factors=risk_factors,
                required_next_actions=required_next_actions,
                data_freshness=data_freshness,
                tradeoffs=tradeoffs,
                mitigation=mitigation,
                ml_encounter_risk=ml_risk,
            ),
            chart_data=chart_data,
            map_data=map_data,
            timestamp=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        )
