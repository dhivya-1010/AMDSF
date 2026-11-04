"""CelesTrak TLE ingestion with validation, freshness, and cache state."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import httpx
from sgp4.api import Satrec

from app.config import settings
from app.core.logging import logger


def checksum_valid(line: str) -> bool:
    if len(line) != 69 or line[0] not in {"1", "2"} or not line[-1].isdigit():
        return False
    total = sum(int(char) if char.isdigit() else 1 if char == "-" else 0 for char in line[:68])
    return total % 10 == int(line[68])


def parse_tle_record(record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    line1 = str(record.get("TLE_LINE1") or record.get("LINE1") or "").strip()
    line2 = str(record.get("TLE_LINE2") or record.get("LINE2") or "").strip()
    if not (checksum_valid(line1) and checksum_valid(line2)):
        return None
    try:
        satellite = Satrec.twoline2rv(line1, line2)
        epoch_year = satellite.epochyr + (2000 if satellite.epochyr < 57 else 1900)
        epoch = datetime(epoch_year, 1, 1, tzinfo=timezone.utc) + timedelta(days=satellite.epochdays - 1)
    except (ValueError, OverflowError, TypeError):
        return None
    norad = record.get("NORAD_CAT_ID") or record.get("NORAD_ID")
    try:
        norad = int(norad) if norad is not None else None
    except (TypeError, ValueError):
        norad = None
    return {
        "norad_id": norad,
        "name": str(record.get("OBJECT_NAME") or record.get("NAME") or f"NORAD {norad or 'UNKNOWN'}"),
        "tle_line1": line1,
        "tle_line2": line2,
        "epoch": epoch.isoformat().replace("+00:00", "Z"),
    }


class CelestrakService:
    def __init__(self):
        self.base_url = settings.CELESTRAK_BASE_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS
        self._cache: Optional[Dict[str, Any]] = None

    @staticmethod
    def _age_seconds(retrieved_at: str, now: datetime) -> float:
        retrieved = datetime.fromisoformat(retrieved_at.replace("Z", "+00:00"))
        return max(0.0, (now - retrieved).total_seconds())

    async def get_active_satellites_sample(self, group: str = "active") -> Dict[str, Any]:
        url = f"{self.base_url}/NORAD/elements/gp.php?GROUP={group}&FORMAT=json"
        retrieved = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                raw = response.json()
                if not isinstance(raw, list):
                    raise ValueError("CelesTrak response must be a JSON list.")
                parsed_records = [parsed for item in raw if isinstance(item, dict) and (parsed := parse_tle_record(item))]
                now = datetime.now(timezone.utc)
                current_records = []
                stale_count = 0
                future_count = 0
                for record in parsed_records:
                    epoch = datetime.fromisoformat(record["epoch"].replace("Z", "+00:00"))
                    if epoch > now:
                        future_count += 1
                    elif now - epoch > timedelta(days=settings.DEBRIS_MAX_TLE_AGE_DAYS):
                        stale_count += 1
                    else:
                        current_records.append(record)
                result = {
                    "source": "CelesTrak GP API",
                    "is_live": True,
                    "is_cached": False,
                    "retrieved_at": retrieved,
                    "total_count": len(raw),
                    "valid_tle_count": len(current_records),
                    "stale_tle_count": stale_count,
                    "future_tle_count": future_count,
                    "invalid_tle_count": len(raw) - len(parsed_records),
                    "records": current_records[: settings.DEBRIS_MAX_CATALOG_OBJECTS],
                    "sample_objects": current_records[:25],
                }
                self._cache = result
                return result
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            logger.warning("CelesTrak TLE request failed: %s", exc)
        if self._cache:
            now = datetime.now(timezone.utc)
            age_seconds = self._age_seconds(self._cache["retrieved_at"], now)
            if age_seconds <= settings.DEBRIS_MAX_CACHE_AGE_HOURS * 3600:
                return {
                    **self._cache,
                    "is_live": False,
                    "is_cached": True,
                    "cache_age_seconds": age_seconds,
                    "source": "CelesTrak cached response",
                }
            return {
                "source": "CelesTrak cache expired",
                "is_live": False,
                "is_cached": False,
                "cache_expired": True,
                "cache_age_seconds": age_seconds,
                "retrieved_at": self._cache["retrieved_at"],
                "total_count": 0,
                "valid_tle_count": 0,
                "stale_tle_count": 0,
                "future_tle_count": 0,
                "invalid_tle_count": 0,
                "records": [],
                "sample_objects": [],
                "error": "CelesTrak request failed and cached data exceeded its maximum age.",
            }
        return {
            "source": "CelesTrak unavailable",
            "is_live": False,
            "is_cached": False,
            "retrieved_at": retrieved,
            "total_count": 0,
            "valid_tle_count": 0,
            "stale_tle_count": 0,
            "future_tle_count": 0,
            "invalid_tle_count": 0,
            "records": [],
            "sample_objects": [],
            "error": "No current or cached TLE records are available.",
        }


celestrak_service = CelestrakService()
