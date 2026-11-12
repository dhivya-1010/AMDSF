import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings
from app.core.logging import logger


def _parse_kp_payload(data: Any) -> Optional[Dict[str, Any]]:
    """Parse NOAA SWPC Kp JSON supporting both dict-list and header+row-list formats."""
    if not isinstance(data, list) or not data:
        return None

    history: List[Dict[str, Any]] = []
    # Current NOAA SWPC format: list of dicts [{"time_tag": "...", "Kp": 1.67, ...}]
    if isinstance(data[0], dict):
        for row in data:
            if not isinstance(row, dict):
                continue
            kp_raw = row.get("Kp") if row.get("Kp") is not None else row.get("kp")
            if kp_raw is None:
                continue
            try:
                kp_val = float(kp_raw)
            except (TypeError, ValueError):
                continue
            history.append({
                "time_tag": row.get("time_tag"),
                "Kp": kp_val,
                "a_running": row.get("a_running"),
                "station_count": row.get("station_count"),
            })
    # Legacy format: [["time_tag", "Kp", ...], ["2024-...", "2.33", ...]]
    elif isinstance(data[0], list) and len(data) > 1:
        for row in data[1:]:
            if not isinstance(row, list) or len(row) < 2:
                continue
            try:
                kp_val = float(row[1])
            except (TypeError, ValueError):
                continue
            history.append({
                "time_tag": row[0],
                "Kp": kp_val,
                "a_running": row[2] if len(row) > 2 else None,
                "station_count": row[3] if len(row) > 3 else None,
            })

    if not history:
        return None
    latest = history[-1]
    return {
        "latest_kp": latest["Kp"],
        "timestamp": latest.get("time_tag"),
        "history": history[-12:],
    }


def _parse_f107_payload(data: Any) -> Dict[str, Any]:
    if isinstance(data, list) and data:
        for row in reversed(data):
            if isinstance(row, dict):
                val = row.get("flux") if row.get("flux") is not None else row.get("Flux")
                if val is not None:
                    try:
                        return {
                            "solar_flux_f107": float(val),
                            "solar_flux_timestamp": row.get("time_tag") or row.get("TimeStamp"),
                        }
                    except (TypeError, ValueError):
                        pass
    return {"solar_flux_f107": None, "solar_flux_timestamp": None}


def _parse_noaa_scales(data: Any) -> Optional[Dict[str, Any]]:
    if not isinstance(data, dict):
        return None
    current = data.get("0") or data.get(0) or data
    if not isinstance(current, dict):
        return None
    scales: Dict[str, Any] = {}
    for key in ("R", "S", "G"):
        entry = current.get(key)
        if isinstance(entry, dict):
            scales[key] = {
                "Scale": str(entry.get("Scale", "0")),
                "Text": str(entry.get("Text", "none")),
            }
    return scales or None


def _parse_solar_wind_speed(data: Any) -> Optional[float]:
    if isinstance(data, list) and data:
        for row in reversed(data):
            if isinstance(row, dict):
                raw = row.get("WindSpeed") if row.get("WindSpeed") is not None else row.get("proton_speed")
                if raw is not None:
                    try:
                        return float(raw)
                    except (TypeError, ValueError):
                        pass
    return None


def _parse_solar_wind_mag(data: Any) -> Dict[str, Optional[float]]:
    if isinstance(data, list) and data:
        for row in reversed(data):
            if isinstance(row, dict):
                try:
                    bz_raw = row.get("bz_gsm") if row.get("bz_gsm") is not None else row.get("Bz")
                    bt_raw = row.get("bt") if row.get("bt") is not None else row.get("Bt")
                    return {
                        "solar_wind_bz_gsm": float(bz_raw) if bz_raw is not None else None,
                        "solar_wind_bt": float(bt_raw) if bt_raw is not None else None,
                    }
                except (TypeError, ValueError):
                    pass
    return {"solar_wind_bz_gsm": None, "solar_wind_bt": None}


def _parse_alerts(data: Any) -> List[Dict[str, Any]]:
    if not isinstance(data, list):
        return []
    cleaned = []
    for item in data[:8]:
        if isinstance(item, dict):
            cleaned.append({
                "product_id": item.get("product_id"),
                "issue_datetime": item.get("issue_datetime"),
                "message": str(item.get("message", "")).strip()[:400],
            })
    return cleaned


class SwpcService:
    """Service to fetch planetary Kp-index, solar flux, NOAA scales, solar wind & alerts from NOAA SWPC."""

    def __init__(self):
        self.base_url = settings.SWPC_BASE_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS
        self.max_retries = settings.HTTP_MAX_RETRIES
        self.cache_path = Path(settings.CACHE_DIR) / "swpc_cache.json"
        self.demo_path = Path(settings.DATA_DIR) / "demo_space_weather.json"

    async def _fetch_json(self, client: httpx.AsyncClient, path: str) -> Any:
        url = f"{self.base_url}/{path.lstrip('/')}"
        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries):
            try:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
            except (httpx.HTTPError, ValueError) as exc:
                last_exc = exc
                if attempt + 1 < self.max_retries:
                    await asyncio.sleep(0.35 * (2 ** attempt))
        if last_exc:
            logger.debug("SWPC endpoint %s unavailable: %s", path, last_exc)
        return None

    def _read_cache(self) -> Optional[Dict[str, Any]]:
        if not self.cache_path.exists():
            return None
        try:
            payload = json.loads(self.cache_path.read_text(encoding="utf-8"))
            if isinstance(payload, dict) and payload.get("latest_kp") is not None:
                return payload
        except (OSError, ValueError) as exc:
            logger.warning("Failed reading SWPC disk cache: %s", exc)
        return None

    def _write_cache(self, payload: Dict[str, Any]) -> None:
        try:
            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            self.cache_path.write_text(json.dumps(payload), encoding="utf-8")
        except OSError as exc:
            logger.warning("Failed writing SWPC disk cache: %s", exc)

    def _load_demo(self) -> Optional[Dict[str, Any]]:
        if not self.demo_path.exists():
            return None
        try:
            raw = json.loads(self.demo_path.read_text(encoding="utf-8"))
            swpc = raw.get("swpc", {})
            meta = raw.get("metadata", {})
            if swpc.get("latest_kp") is None:
                return None
            return {
                "source": "NOAA SWPC Demonstration Sample (Offline Fallback)",
                "data_mode": "DEMONSTRATION DATA",
                "is_live": False,
                "is_cached": False,
                "is_demonstration": True,
                "status": "available",
                "retrieved_at": meta.get("generated_at") or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "latest_kp": float(swpc["latest_kp"]),
                "timestamp": swpc.get("timestamp"),
                "history": swpc.get("kp_history", []),
                "solar_flux_f107": swpc.get("solar_flux_f107"),
                "solar_flux_timestamp": swpc.get("solar_flux_timestamp"),
                "noaa_scales": swpc.get("noaa_scales"),
                "alerts": swpc.get("alerts", []),
                "solar_wind_speed_kms": swpc.get("solar_wind_speed_kms"),
                "solar_wind_bz_gsm": swpc.get("solar_wind_bz_gsm"),
                "solar_wind_bt": swpc.get("solar_wind_bt"),
            }
        except (OSError, ValueError, TypeError) as exc:
            logger.warning("Failed loading demonstration space weather file: %s", exc)
            return None

    async def get_planetary_k_index(self, data_mode: str = "auto") -> Dict[str, Any]:
        """Fetch NOAA SWPC telemetry according to data_mode ('auto', 'live', 'cached', 'demonstration')."""
        now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        if data_mode == "demonstration":
            demo = self._load_demo()
            if demo is not None:
                return demo

        if data_mode in ("auto", "live"):
            try:
                client_timeout = httpx.Timeout(min(self.timeout, 6.0), connect=3.5)
                async with httpx.AsyncClient(timeout=client_timeout) as client:
                    kp_raw, f107_raw, scales_raw, alerts_raw, wind_raw, mag_raw = await asyncio.gather(
                        self._fetch_json(client, "products/noaa-planetary-k-index.json"),
                        self._fetch_json(client, "products/10cm-flux.json"),
                        self._fetch_json(client, "products/noaa-scales.json"),
                        self._fetch_json(client, "products/alerts.json"),
                        self._fetch_json(client, "products/summary/solar-wind-speed.json"),
                        self._fetch_json(client, "products/summary/solar-wind-mag-field.json"),
                    )
                parsed_kp = _parse_kp_payload(kp_raw)
                if parsed_kp is not None:
                    f107 = _parse_f107_payload(f107_raw)
                    mag = _parse_solar_wind_mag(mag_raw)
                    result = {
                        "source": "NOAA SWPC (Live Telemetry)",
                        "data_mode": "LIVE DATA",
                        "is_live": True,
                        "is_cached": False,
                        "is_demonstration": False,
                        "status": "available",
                        "retrieved_at": now_iso,
                        "latest_kp": parsed_kp["latest_kp"],
                        "timestamp": parsed_kp["timestamp"],
                        "history": parsed_kp["history"],
                        "solar_flux_f107": f107["solar_flux_f107"],
                        "solar_flux_timestamp": f107["solar_flux_timestamp"],
                        "noaa_scales": _parse_noaa_scales(scales_raw),
                        "alerts": _parse_alerts(alerts_raw),
                        "solar_wind_speed_kms": _parse_solar_wind_speed(wind_raw),
                        "solar_wind_bz_gsm": mag["solar_wind_bz_gsm"],
                        "solar_wind_bt": mag["solar_wind_bt"],
                    }
                    self._write_cache(result)
                    return result
            except Exception as exc:
                logger.warning("NOAA SWPC live request batch failed: %s", exc)

        if data_mode in ("auto", "cached"):
            cached = self._read_cache()
            if cached is not None:
                cached = dict(cached)
                cached["source"] = "NOAA SWPC (Cached Telemetry)"
                cached["data_mode"] = "CACHED DATA"
                cached["is_live"] = False
                cached["is_cached"] = True
                cached["is_demonstration"] = False
                cached["status"] = "available"
                cached["cached_at"] = cached.get("retrieved_at")
                return cached

        return {
            "source": "NOAA SWPC",
            "data_mode": "UNAVAILABLE",
            "is_live": False,
            "is_cached": False,
            "is_demonstration": False,
            "status": "unavailable",
            "retrieved_at": now_iso,
            "latest_kp": None,
            "timestamp": None,
            "history": [],
            "solar_flux_f107": None,
            "solar_flux_timestamp": None,
            "noaa_scales": None,
            "alerts": [],
            "solar_wind_speed_kms": None,
            "solar_wind_bz_gsm": None,
            "solar_wind_bt": None,
            "error": "NOAA SWPC retrieval failed and no cached telemetry is available.",
        }


swpc_service = SwpcService()
