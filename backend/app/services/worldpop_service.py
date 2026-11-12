import asyncio
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

from app.config import settings
from app.core.logging import logger

EARTH_RADIUS_KM = 6371.0088


def _circle_geojson(lat_deg: float, lon_deg: float, radius_km: float, vertices: int = 24) -> Dict[str, Any]:
    """Generate a closed GeoJSON Polygon FeatureCollection around (lat, lon) with geodesic radius_km."""
    lat_r = math.radians(lat_deg)
    lon_r = math.radians(lon_deg)
    ang = min(max(radius_km / EARTH_RADIUS_KM, 0.0005), 0.15)
    ring: List[List[float]] = []
    for i in range(vertices + 1):
        bearing = 2.0 * math.pi * (i % vertices) / vertices
        p_lat = math.asin(
            math.sin(lat_r) * math.cos(ang)
            + math.cos(lat_r) * math.sin(ang) * math.cos(bearing)
        )
        p_lon = lon_r + math.atan2(
            math.sin(bearing) * math.sin(ang) * math.cos(lat_r),
            math.cos(ang) - math.sin(lat_r) * math.sin(p_lat),
        )
        lon_norm = ((math.degrees(p_lon) + 180.0) % 360.0) - 180.0
        ring.append([round(lon_norm, 5), round(math.degrees(p_lat), 5)])

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ring],
                },
            }
        ],
    }


class WorldPopService:
    """Queries WorldPop gridded population API with local disk caching and honest unavailability reporting."""

    def __init__(self):
        self.api_url = settings.WORLDPOP_API_URL
        self.tasks_url = getattr(settings, "WORLDPOP_TASKS_URL", "https://api.worldpop.org/v1/tasks")
        self.timeout = min(settings.REQUEST_TIMEOUT_SECONDS, 8.0)
        self.cache_path = Path(settings.CACHE_DIR) / "worldpop_cache.json"

    @staticmethod
    def _cache_key(lat: float, lon: float, radius_km: float) -> str:
        return f"{round(lat, 2)}:{round(lon, 2)}:{round(radius_km, 1)}"

    def _read_cache(self, key: str) -> Optional[Dict[str, Any]]:
        if not self.cache_path.exists():
            return None
        try:
            store = json.loads(self.cache_path.read_text(encoding="utf-8"))
            entry = store.get(key)
            if isinstance(entry, dict) and entry.get("population") is not None:
                return entry
        except (OSError, ValueError) as exc:
            logger.warning("Failed reading WorldPop cache: %s", exc)
        return None

    def _write_cache(self, key: str, entry: Dict[str, Any]) -> None:
        try:
            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            store = {}
            if self.cache_path.exists():
                try:
                    loaded = json.loads(self.cache_path.read_text(encoding="utf-8"))
                    if isinstance(loaded, dict):
                        store = loaded
                except ValueError:
                    store = {}
            store[key] = entry
            self.cache_path.write_text(json.dumps(store), encoding="utf-8")
        except OSError as exc:
            logger.warning("Failed writing WorldPop cache: %s", exc)

    async def get_population_in_radius(
        self,
        latitude: float,
        longitude: float,
        radius_km: float,
        data_mode: str = "auto",
    ) -> Dict[str, Any]:
        """Return gridded WorldPop population total inside target circle or mark unavailable (never fabricate)."""
        now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        key = self._cache_key(latitude, longitude, radius_km)

        if data_mode == "demonstration":
            return {
                "available": False,
                "population": None,
                "status": "unavailable",
                "data_mode": "UNAVAILABLE",
                "source": "WorldPop Gridded Population (Not queried in offline demonstration mode)",
                "retrieved_at": now_iso,
            }

        if data_mode in ("auto", "cached"):
            cached = self._read_cache(key)
            if cached is not None:
                return {
                    "available": True,
                    "population": int(cached["population"]),
                    "status": "available",
                    "data_mode": "CACHED DATA",
                    "source": "WorldPop 2020 Gridded Population (Cached)",
                    "retrieved_at": cached.get("retrieved_at", now_iso),
                }

        if data_mode in ("auto", "live"):
            geojson_str = json.dumps(_circle_geojson(latitude, longitude, radius_km))
            params = {
                "dataset": "wpgppop",
                "year": "2020",
                "geojson": geojson_str,
                "runasync": "false",
            }
            try:
                wp_timeout = httpx.Timeout(4.0, connect=2.5)
                async with httpx.AsyncClient(timeout=wp_timeout) as client:
                    resp = await client.get(self.api_url, params=params)
                    resp.raise_for_status()
                    payload = resp.json()

                    # Some WorldPop requests return a taskid that resolves shortly afterward
                    if isinstance(payload, dict) and payload.get("taskid") and not payload.get("data"):
                        task_id = payload["taskid"]
                        for _ in range(2):
                            await asyncio.sleep(0.8)
                            poll = await client.get(f"{self.tasks_url}/{task_id}")
                            if poll.status_code == 200:
                                poll_data = poll.json()
                                if poll_data.get("status") == "finished" and poll_data.get("data"):
                                    payload = poll_data
                                    break

                    data_block = payload.get("data") if isinstance(payload, dict) else None
                    pop_val = None
                    if isinstance(data_block, dict):
                        pop_val = data_block.get("total_population")
                    if pop_val is not None:
                        total_int = int(round(float(pop_val)))
                        entry = {
                            "population": total_int,
                            "retrieved_at": now_iso,
                        }
                        self._write_cache(key, entry)
                        return {
                            "available": True,
                            "population": total_int,
                            "status": "available",
                            "data_mode": "LIVE DATA",
                            "source": "WorldPop 2020 Gridded Population API",
                            "retrieved_at": now_iso,
                        }
            except Exception as exc:
                logger.warning("WorldPop gridded population query unavailable: %s", exc)

        return {
            "available": False,
            "population": None,
            "status": "unavailable",
            "data_mode": "UNAVAILABLE",
            "source": "WorldPop Gridded Population (Unavailable)",
            "retrieved_at": now_iso,
        }


worldpop_service = WorldPopService()
