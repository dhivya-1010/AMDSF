from typing import Any, Dict, List
from .models import WeatherAnalysisResult


def _resolve_weather_data_mode(swpc_data: Dict[str, Any], donki_data: Dict[str, Any]) -> str:
    swpc_mode = swpc_data.get("data_mode") or (
        "LIVE DATA" if swpc_data.get("is_live") else ("UNAVAILABLE" if swpc_data.get("latest_kp") is None else "LIVE DATA")
    )
    donki_mode = donki_data.get("data_mode") or (
        "LIVE DATA" if donki_data.get("is_live") else ("UNAVAILABLE" if donki_data.get("events_count") is None else "LIVE DATA")
    )
    if swpc_data.get("latest_kp") is None:
        return "UNAVAILABLE"
    if "DEMONSTRATION DATA" in (swpc_mode, donki_mode):
        return "DEMONSTRATION DATA"
    if swpc_mode == "LIVE DATA" and donki_mode == "LIVE DATA":
        return "LIVE DATA"
    if "CACHED DATA" in (swpc_mode, donki_mode):
        return "CACHED DATA"
    if swpc_mode == "LIVE DATA" and donki_mode == "UNAVAILABLE":
        return "LIVE DATA"
    return "UNAVAILABLE"


class WeatherAnalyzer:
    """Evaluates planetary Kp-index, solar flux, solar wind, flares, and CME data."""

    @staticmethod
    def evaluate(
        swpc_data: Dict[str, Any],
        donki_data: Dict[str, Any],
        target_orbit_km: float = 550.0,
    ) -> WeatherAnalysisResult:
        kp = swpc_data.get("latest_kp")
        cme_count = donki_data.get("events_count")
        recent_cme_list = donki_data.get("recent_events", [])
        flare_events = donki_data.get("flare_events", [])
        gst_events = donki_data.get("gst_events", [])
        data_mode = _resolve_weather_data_mode(swpc_data, donki_data)

        sources = [
            swpc_data.get("source", "NOAA SWPC"),
            donki_data.get("source", "NASA DONKI"),
        ]

        # Do NOT emit NOMINAL when SWPC Kp or both feeds are unavailable
        if kp is None:
            return WeatherAnalysisResult(
                status="unavailable",
                data_mode="UNAVAILABLE",
                kp_index=None,
                solar_activity="UNAVAILABLE",
                cme_activity=False,
                geomagnetic_storm=False,
                risk_level="UNAVAILABLE",
                risk_score=None,
                data_sources=sources,
                summary="Space-weather assessment is unavailable because NOAA SWPC telemetry could not be retrieved.",
                factors=["NOAA SWPC geomagnetic Kp telemetry is required for launch and orbital drag assessment."],
                recent_events=[],
                details={
                    "data_status": "unavailable",
                    "data_mode": "UNAVAILABLE",
                    "swpc_status": swpc_data.get("status", "unavailable"),
                    "donki_status": donki_data.get("status", "unavailable"),
                    "swpc": swpc_data,
                    "donki": donki_data,
                },
            )

        effective_cme = cme_count if cme_count is not None else 0
        donki_available = cme_count is not None
        has_cme = effective_cme > 0
        is_geomagnetic_storm = kp >= 5.0
        strong_flares = [
            f for f in flare_events
            if str(f.get("classType", "")).upper().startswith(("M", "X"))
        ]
        f107 = swpc_data.get("solar_flux_f107")
        bz = swpc_data.get("solar_wind_bz_gsm")
        wind_speed = swpc_data.get("solar_wind_speed_kms")

        factors: List[str] = []
        if kp >= 6.0 or (bz is not None and bz <= -10.0):
            risk_level = "HIGH"
            risk_score = 0.85
            solar_activity = "SEVERE (G2+ Storm)"
            summary = "Active geomagnetic storm conditions detected by NOAA SWPC. LEO thermospheric drag and spacecraft surface charging risks are elevated."
            factors.append(f"Elevated Kp-index ({kp}) indicates active geomagnetic storming")
        elif kp >= 4.0 or effective_cme >= 3 or len(strong_flares) >= 2:
            risk_level = "MEDIUM"
            risk_score = 0.48
            solar_activity = "MODERATE"
            summary = "Moderate space-weather activity. Atmospheric drag at LEO altitudes is modestly elevated; monitor solar advisories."
            factors.append(f"Kp-index is {kp} (unsettled / approaching minor storm threshold)")
        else:
            risk_level = "LOW"
            risk_score = 0.18
            solar_activity = "QUIET / NOMINAL"
            summary = "Observed geomagnetic and solar conditions are quiet for launch and orbital operations."
            factors.append(f"Kp-index ({kp}) is within quiet operating range (< 4.0)")

        if f107 is not None:
            factors.append(f"10.7 cm solar radio flux (F10.7): {f107:.1f} sfu (drives upper-atmosphere drag at {target_orbit_km:.0f} km)")
        if wind_speed is not None:
            bz_txt = f", IMF Bz {bz:+.1f} nT" if bz is not None else ""
            factors.append(f"Solar wind speed: {wind_speed:.0f} km/s{bz_txt}")
        if donki_available:
            factors.append(
                f"NASA DONKI 7-day log: {effective_cme} CME(s), {len(flare_events)} solar flare(s), {len(gst_events)} geomagnetic storm(s)"
            )
        else:
            factors.append("NASA DONKI CME/flare archive was unavailable; assessment reflects NOAA SWPC telemetry only.")

        overall_status = "completed" if donki_available else "partial"
        if not donki_available:
            summary += " (Partial: NASA DONKI CME/flare feed unavailable.)"

        combined_events = list(recent_cme_list)
        if not combined_events and flare_events:
            combined_events = flare_events[:5]

        return WeatherAnalysisResult(
            agent="Space Weather Intelligence Agent",
            status=overall_status,
            data_mode=data_mode,
            kp_index=kp,
            solar_activity=solar_activity,
            cme_activity=has_cme,
            geomagnetic_storm=is_geomagnetic_storm,
            risk_level=risk_level,
            risk_score=risk_score,
            data_sources=sources,
            summary=summary,
            factors=factors,
            recent_events=combined_events,
            details={
                "data_status": "available" if donki_available else "partial",
                "data_mode": data_mode,
                "swpc_status": swpc_data.get("status", "available"),
                "donki_status": donki_data.get("status", "unavailable"),
                "swpc_data_mode": swpc_data.get("data_mode", data_mode),
                "donki_data_mode": donki_data.get("data_mode", "UNAVAILABLE"),
                "swpc_retrieved_at": swpc_data.get("retrieved_at"),
                "swpc_source_timestamp": swpc_data.get("timestamp"),
                "donki_retrieved_at": donki_data.get("retrieved_at"),
                "solar_flux_f107": f107,
                "solar_flux_timestamp": swpc_data.get("solar_flux_timestamp"),
                "noaa_scales": swpc_data.get("noaa_scales"),
                "alerts": swpc_data.get("alerts", []),
                "solar_wind_speed_kms": wind_speed,
                "solar_wind_bz_gsm": bz,
                "solar_wind_bt": swpc_data.get("solar_wind_bt"),
                "kp_history": swpc_data.get("history", []),
                "cme_count": donki_data.get("cme_count"),
                "flare_count": donki_data.get("flare_count"),
                "gst_count": donki_data.get("gst_count"),
                "flare_events": flare_events,
                "gst_events": gst_events,
            },
        )
