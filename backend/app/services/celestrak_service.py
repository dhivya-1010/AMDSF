"""CelesTrak TLE ingestion with validation and explicit cache state."""

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

import httpx
from sgp4.api import Satrec

from app.config import settings
from app.core.logging import logger


def checksum_valid(line: str) -> bool:
    if len(line) != 69 or line[0] not in {"1", "2"}:
        return False
    if not line[-1].isdigit():
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
        epoch = datetime(epoch_year, 1, 1, tzinfo=timezone.utc).timestamp()
        epoch_dt = datetime.fromtimestamp(epoch, timezone.utc) + timedelta(days=satellite.epochdays - 1)
    except Exception:
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
        "epoch": epoch_dt.isoformat().replace("+00:00", "Z"),
    }


class CelestrakService:
    def __init__(self):
        self.base_url = settings.CELESTRAK_BASE_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS
        self._cache: Optional[Dict[str, Any]] = None

    async def get_active_satellites_sample(self, group: str = "active") -> Dict[str, Any]:
        url = f"{self.base_url}/NORAD/elements/gp.php?GROUP={group}&FORMAT=json"
        retrieved = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                raw = response.json()
                parsed_records = [parsed for item in raw if (parsed := parse_tle_record(item))]
                now = datetime.now(timezone.utc)
                records = [
                    record for record in parsed_records
                    if now - datetime.fromisoformat(record["epoch"].replace("Z", "+00:00"))
                    <= timedelta(days=settings.DEBRIS_MAX_TLE_AGE_DAYS)
                ]
                result = {
                    "source": "CelesTrak GP API",
                    "is_live": True,
                    "is_cached": False,
                    "retrieved_at": retrieved,
                    "total_count": len(raw) if isinstance(raw, list) else 0,
                    "valid_tle_count": len(records),
                    "stale_tle_count": len(parsed_records) - len(records),
                    "invalid_tle_count": max(0, len(raw) - len(parsed_records)) if isinstance(raw, list) else 0,
                    "records": records[: settings.DEBRIS_MAX_CATALOG_OBJECTS],
                    "sample_objects": records[:25],
                }
                self._cache = result
                return result
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            logger.warning("CelesTrak TLE request failed: %s", exc)
        if self._cache:
            return {**self._cache, "is_live": False, "is_cached": True, "source": "CelesTrak cached response"}
        return {
            "source": "CelesTrak unavailable",
            "is_live": False,
            "is_cached": False,
            "retrieved_at": retrieved,
            "total_count": 0,
            "valid_tle_count": 0,
            "invalid_tle_count": 0,
            "stale_tle_count": 0,
            "records": [],
            "sample_objects": [],
            "error": "No current or cached TLE records are available.",
        }


celestrak_service = CelestrakService()
