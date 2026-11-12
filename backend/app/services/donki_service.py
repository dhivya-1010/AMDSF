import asyncio
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings
from app.core.logging import logger


class DonkiService:
    """Service to fetch CME, Solar Flare (FLR), and Geomagnetic Storm (GST) events from NASA DONKI."""

    def __init__(self):
        self.base_url = settings.DONKI_BASE_URL
        self.fallback_base_url = settings.DONKI_CCMC_FALLBACK_URL
        self.api_key = settings.NASA_API_KEY
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS
        self.max_retries = settings.HTTP_MAX_RETRIES
        self.cache_path = Path(settings.CACHE_DIR) / "donki_cache.json"
        self.demo_path = Path(settings.DATA_DIR) / "demo_space_weather.json"

    async def _fetch_endpoint(
        self,
        client: httpx.AsyncClient,
        endpoint: str,
        start_date: str,
        end_date: str,
    ) -> Optional[List[Dict[str, Any]]]:
        urls = [
            f"{self.base_url}/{endpoint}?startDate={start_date}&endDate={end_date}&api_key={self.api_key}",
            f"{self.fallback_base_url}/{endpoint}?startDate={start_date}&endDate={end_date}",
        ]
        for url_idx, url in enumerate(urls):
            attempts = self.max_retries if url_idx == 0 else 1
            for attempt in range(attempts):
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    payload = response.json()
                    if isinstance(payload, list):
                        return [item for item in payload if isinstance(item, dict)]
                    return []
                except httpx.HTTPStatusError as exc:
                    logger.debug("DONKI %s status %s on attempt %d", endpoint, exc.response.status_code, attempt + 1)
                    if 400 <= exc.response.status_code < 500:
                        break
                    if attempt + 1 < attempts:
                        await asyncio.sleep(0.35 * (2 ** attempt))
                except (httpx.HTTPError, ValueError) as exc:
                    logger.debug("DONKI %s failed (%s) attempt %d", endpoint, exc, attempt + 1)
                    if attempt + 1 < attempts:
                        await asyncio.sleep(0.35 * (2 ** attempt))
        return None

    def _read_cache(self) -> Optional[Dict[str, Any]]:
        if not self.cache_path.exists():
            return None
        try:
            payload = json.loads(self.cache_path.read_text(encoding="utf-8"))
            if isinstance(payload, dict) and payload.get("events_count") is not None:
                return payload
        except (OSError, ValueError) as exc:
            logger.warning("Failed reading DONKI disk cache: %s", exc)
        return None

    def _write_cache(self, payload: Dict[str, Any]) -> None:
        try:
            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            self.cache_path.write_text(json.dumps(payload), encoding="utf-8")
        except OSError as exc:
            logger.warning("Failed writing DONKI disk cache: %s", exc)

    def _load_demo(self) -> Optional[Dict[str, Any]]:
        if not self.demo_path.exists():
            return None
        try:
            raw = json.loads(self.demo_path.read_text(encoding="utf-8"))
            donki = raw.get("donki", {})
            meta = raw.get("metadata", {})
            cme = donki.get("cme_events", [])
            flr = donki.get("flare_events", [])
            gst = donki.get("gst_events", [])
            return {
                "source": "NASA DONKI Demonstration Sample (Offline Fallback)",
                "data_mode": "DEMONSTRATION DATA",
                "is_live": False,
                "is_cached": False,
                "is_demonstration": True,
                "status": "available",
                "retrieved_at": meta.get("generated_at") or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "events_count": len(cme),
                "cme_count": len(cme),
                "flare_count": len(flr),
                "gst_count": len(gst),
                "recent_events": cme[:5],
                "cme_events": cme[:10],
                "flare_events": flr[:10],
                "gst_events": gst[:10],
            }
        except (OSError, ValueError, TypeError) as exc:
            logger.warning("Failed loading demonstration DONKI section: %s", exc)
            return None

    async def get_recent_cme_events(self, days: int = 7, data_mode: str = "auto") -> Dict[str, Any]:
        """Fetch CME, Solar Flare, and Geomagnetic Storm events according to data_mode."""
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat().replace("+00:00", "Z")
        end_date = now.strftime("%Y-%m-%d")
        start_date = (now - timedelta(days=days)).strftime("%Y-%m-%d")

        if data_mode == "demonstration":
            demo = self._load_demo()
            if demo is not None:
                return demo

        if data_mode in ("auto", "live"):
            try:
                client_timeout = httpx.Timeout(min(self.timeout, 5.0), connect=3.0)
                async with httpx.AsyncClient(timeout=client_timeout) as client:
                    cme_events, flr_events, gst_events = await asyncio.gather(
                        self._fetch_endpoint(client, "CME", start_date, end_date),
                        self._fetch_endpoint(client, "FLR", start_date, end_date),
                        self._fetch_endpoint(client, "GST", start_date, end_date),
                    )
                if cme_events is not None or flr_events is not None or gst_events is not None:
                    cme_list = cme_events or []
                    flr_list = flr_events or []
                    gst_list = gst_events or []
                    result = {
                        "source": "NASA DONKI (Live API)",
                        "data_mode": "LIVE DATA",
                        "is_live": True,
                        "is_cached": False,
                        "is_demonstration": False,
                        "status": "available",
                        "retrieved_at": now_iso,
                        "query_start": start_date,
                        "query_end": end_date,
                        "events_count": len(cme_list),
                        "cme_count": len(cme_list),
                        "flare_count": len(flr_list),
                        "gst_count": len(gst_list),
                        "recent_events": cme_list[:5],
                        "cme_events": cme_list[:10],
                        "flare_events": flr_list[:10],
                        "gst_events": gst_list[:10],
                    }
                    self._write_cache(result)
                    return result
            except Exception as exc:
                logger.warning("NASA DONKI live request batch failed: %s", exc)

        if data_mode in ("auto", "cached"):
            cached = self._read_cache()
            if cached is not None:
                cached = dict(cached)
                cached["source"] = "NASA DONKI (Cached API Snapshot)"
                cached["data_mode"] = "CACHED DATA"
                cached["is_live"] = False
                cached["is_cached"] = True
                cached["is_demonstration"] = False
                cached["status"] = "available"
                return cached

        return {
            "source": "NASA DONKI",
            "data_mode": "UNAVAILABLE",
            "is_live": False,
            "is_cached": False,
            "is_demonstration": False,
            "status": "unavailable",
            "retrieved_at": now_iso,
            "query_start": start_date,
            "query_end": end_date,
            "events_count": None,
            "cme_count": None,
            "flare_count": None,
            "gst_count": None,
            "recent_events": [],
            "cme_events": [],
            "flare_events": [],
            "gst_events": [],
            "error": "NASA DONKI retrieval failed and no cached events are available.",
        }


donki_service = DonkiService()
