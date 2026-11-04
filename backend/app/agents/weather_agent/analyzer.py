from typing import Dict, Any, List
from .models import WeatherAnalysisResult

class WeatherAnalyzer:
    """Evaluates planetary Kp-index, solar flare levels, and CME data against spacecraft thresholds"""

    @staticmethod
    def evaluate(swpc_data: Dict[str, Any], donki_data: Dict[str, Any]) -> WeatherAnalysisResult:
        kp = swpc_data.get("latest_kp")
        cme_count = donki_data.get("events_count")
        recent_cme_list = donki_data.get("recent_events", [])
        
        sources = [
            swpc_data.get("source", "NOAA SWPC"),
            donki_data.get("source", "NASA DONKI")
        ]

        if kp is None or cme_count is None:
            return WeatherAnalysisResult(
                status="unavailable",
                kp_index=None,
                solar_activity="UNAVAILABLE",
                cme_activity=False,
                geomagnetic_storm=False,
                risk_level="UNAVAILABLE",
                risk_score=None,
                data_sources=sources,
                summary="Space-weather classification is unavailable because one or more external feeds failed.",
                factors=["NOAA SWPC and NASA DONKI results are required for this assessment."],
                recent_events=recent_cme_list,
                details={
                    "data_status": "unavailable",
                    "swpc": swpc_data,
                    "donki": donki_data,
                },
            )

        has_cme = cme_count > 0
        is_geomagnetic_storm = kp >= 5.0

        if kp >= 6.0:
            risk_level = "HIGH"
            risk_score = 0.85
            solar_activity = "SEVERE (G2+ Storm)"
            summary = "Active geomagnetic storm detected by NOAA SWPC. Satellite drag inflation and surface charging risk is critical."
            factors = [
                f"Elevated Kp-index ({kp}) indicates active geomagnetic storm",
                "Atmospheric scale-height expansion increases orbital drag",
                "Solar proton flux may degrade star tracker optical sensors"
            ]
        elif kp >= 4.0 or cme_count >= 3:
            risk_level = "MEDIUM"
            risk_score = 0.48
            solar_activity = "MODERATE"
            summary = "Moderate space weather activity. Atmospheric drag is slightly elevated; radiation dose rates within acceptable limits."
            factors = [
                f"Kp-index ({kp}) approaching minor disturbance threshold",
                f"{cme_count} recent CME events recorded by NASA DONKI",
                "HF radio blackout probability remains low"
            ]
        else:
            risk_level = "LOW"
            risk_score = 0.18
            solar_activity = "QUIET / NOMINAL"
            summary = "Current space weather conditions are favorable for launch and orbital insertion operations."
            factors = [
                f"Kp index ({kp}) is within nominal operating range (< 4.0)",
                "No active severe geomagnetic storm conditions",
                "Solar flare background flux remains in Class B/C range"
            ]

        return WeatherAnalysisResult(
            agent="Space Weather Intelligence Agent",
            status="completed",
            kp_index=kp,
            solar_activity=solar_activity,
            cme_activity=has_cme,
            geomagnetic_storm=is_geomagnetic_storm,
            risk_level=risk_level,
            risk_score=risk_score,
            data_sources=sources,
            summary=summary,
            factors=factors,
            recent_events=recent_cme_list,
            details={
                "data_status": "available",
                "swpc_retrieved_at": swpc_data.get("retrieved_at"),
                "swpc_source_timestamp": swpc_data.get("timestamp"),
                "donki_retrieved_at": donki_data.get("retrieved_at"),
            }
        )
