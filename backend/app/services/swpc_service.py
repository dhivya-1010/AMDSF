import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.config import settings
from app.core.logging import logger

class SwpcService:
    """Service to fetch real-time planetary Kp-index and space weather alerts from NOAA SWPC"""

    def __init__(self):
        self.base_url = settings.SWPC_BASE_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    async def get_planetary_k_index(self) -> Dict[str, Any]:
        """Fetches latest NOAA Planetary K-index (1-minute or 3-hour) with fallback"""
        url = f"{self.base_url}/products/noaa-planetary-k-index.json"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    # data format is list of [time_tag, kp, a_running, station_count]
                    if len(data) > 1:
                        latest = data[-1]
                        kp_val = float(latest[1])
                        retrieved_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                        return {
                            "source": "NOAA SWPC (Live Telemetry)",
                            "is_live": True,
                            "status": "available",
                            "retrieved_at": retrieved_at,
                            "latest_kp": kp_val,
                            "timestamp": latest[0],
                            "history": data[-12:]
                        }
        except Exception as e:
            logger.warning(f"NOAA SWPC live API request failed ({e}). No synthetic weather value will be returned.")

        return {
            "source": "NOAA SWPC",
            "is_live": False,
            "status": "unavailable",
            "retrieved_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "latest_kp": None,
            "timestamp": None,
            "history": [],
            "error": "NOAA SWPC retrieval failed",
        }

swpc_service = SwpcService()
