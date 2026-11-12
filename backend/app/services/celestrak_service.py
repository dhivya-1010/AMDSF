"""CelesTrak GP/OMM JSON & TLE ingestion with validation, caching, and demonstration fallback."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
import json
import math
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import httpx
from sgp4.api import Satrec, WGS72, jday
from sgp4 import omm as sgp4_omm

from app.config import settings
from app.core.logging import logger

MU_EARTH_KM3_S2 = 398600.4418
R_EARTH_KM = 6378.137

# Alpha-5 mapping used by 9-char catalog numbers in TLEs (skips I and O)
_ALPHA5_ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"


def checksum_valid(line: str) -> bool:
    if len(line) != 69 or line[0] not in {"1", "2"} or not line[-1].isdigit():
        return False
    total = sum(int(char) if char.isdigit() else 1 if char == "-" else 0 for char in line[:68])
    return total % 10 == int(line[68])


def parse_catalog_id(raw_id: Any) -> Optional[int]:
    """Parse 5-digit, >5-digit integer, or Alpha-5 string catalog identifier."""
    if raw_id is None or raw_id == "":
        return None
    if isinstance(raw_id, bool):
        return None
    if isinstance(raw_id, int):
        return raw_id if raw_id >= 0 else None
    text = str(raw_id).strip().upper()
    if not text:
        return None
    if text.isdigit():
        return int(text)
    if len(text) == 5 and text[0] in _ALPHA5_ALPHABET and text[1:].isdigit():
        prefix = _ALPHA5_ALPHABET.index(text[0])
        return prefix * 10000 + int(text[1:])
    return None


def _normalize_epoch_str(raw_epoch: Any) -> Tuple[str, datetime]:
    """Normalize ISO epoch to '%Y-%m-%dT%H:%M:%S.%f' for sgp4.omm and return UTC datetime."""
    if raw_epoch is None:
        raise ValueError("Missing EPOCH")
    text = str(raw_epoch).strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    dt = datetime.fromisoformat(text)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    omm_epoch_str = dt.strftime("%Y-%m-%dT%H:%M:%S.%f")
    return omm_epoch_str, dt


def _derive_orbital_metrics(mean_motion_rev_day: float, eccentricity: float, inclination_deg: float) -> Dict[str, float]:
    if not (math.isfinite(mean_motion_rev_day) and mean_motion_rev_day > 0):
        raise ValueError("MEAN_MOTION must be finite and positive")
    if not (math.isfinite(eccentricity) and 0.0 <= eccentricity < 1.0):
        raise ValueError("ECCENTRICITY must be in [0, 1)")
    period_s = 86400.0 / mean_motion_rev_day
    semi_major_km = (MU_EARTH_KM3_S2 * (period_s / (2.0 * math.pi)) ** 2) ** (1.0 / 3.0)
    perigee_km = semi_major_km * (1.0 - eccentricity) - R_EARTH_KM
    apogee_km = semi_major_km * (1.0 + eccentricity) - R_EARTH_KM
    altitude_km = semi_major_km - R_EARTH_KM
    return {
        "altitude_km": round(altitude_km, 2),
        "perigee_km": round(perigee_km, 2),
        "apogee_km": round(apogee_km, 2),
        "semi_major_axis_km": round(semi_major_km, 2),
        "period_minutes": round(period_s / 60.0, 2),
        "inclination_deg": round(inclination_deg, 4),
        "eccentricity": round(eccentricity, 7),
        "mean_motion": round(mean_motion_rev_day, 8),
    }


def parse_tle_record(record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Parse and validate a legacy 2-line TLE record."""
    line1 = str(record.get("TLE_LINE1") or record.get("LINE1") or "").strip()
    line2 = str(record.get("TLE_LINE2") or record.get("LINE2") or "").strip()
    if not (checksum_valid(line1) and checksum_valid(line2)):
        return None
    try:
        satellite = Satrec.twoline2rv(line1, line2)
        epoch_year = satellite.epochyr + (2000 if satellite.epochyr < 57 else 1900)
        epoch = datetime(epoch_year, 1, 1, tzinfo=timezone.utc) + timedelta(days=satellite.epochdays - 1)
        mean_motion = satellite.no_kozai * 720.0 / math.pi
        inclination_deg = math.degrees(satellite.inclo)
        metrics = _derive_orbital_metrics(mean_motion, satellite.ecco, inclination_deg)
    except (ValueError, OverflowError, TypeError):
        return None
    norad = parse_catalog_id(record.get("NORAD_CAT_ID") or record.get("NORAD_ID") or getattr(satellite, "satnum", None))
    raw_cat_id = record.get("NORAD_CAT_ID") or record.get("NORAD_ID") or line1[2:7].strip()
    return {
        "norad_id": norad,
        "catalog_identifier": str(raw_cat_id or norad or "UNKNOWN"),
        "object_id": str(record.get("OBJECT_ID") or ""),
        "name": str(record.get("OBJECT_NAME") or record.get("NAME") or f"NORAD {norad or 'UNKNOWN'}"),
        "format": "TLE",
        "catalog_group": record.get("CATALOG_GROUP"),
        "tle_line1": line1,
        "tle_line2": line2,
        "epoch": epoch.isoformat().replace("+00:00", "Z"),
        **metrics,
    }


def parse_omm_record(record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Parse and validate a CCSDS OMM JSON record (supports >5-digit & Alpha-5 IDs)."""
    required = ("EPOCH", "MEAN_MOTION", "ECCENTRICITY", "INCLINATION", "RA_OF_ASC_NODE", "ARG_OF_PERICENTER", "MEAN_ANOMALY")
    if not all(key in record and record[key] is not None for key in required):
        return None
    try:
        omm_epoch_str, epoch_dt = _normalize_epoch_str(record["EPOCH"])
        mean_motion = float(record["MEAN_MOTION"])
        eccentricity = float(record["ECCENTRICITY"])
        inclination = float(record["INCLINATION"])
        raan = float(record["RA_OF_ASC_NODE"])
        argp = float(record["ARG_OF_PERICENTER"])
        mean_anomaly = float(record["MEAN_ANOMALY"])
        bstar = float(record.get("BSTAR") or 0.0)
        ndot = float(record.get("MEAN_MOTION_DOT") or 0.0)
        nddot = float(record.get("MEAN_MOTION_DDOT") or 0.0)

        for val in (mean_motion, eccentricity, inclination, raan, argp, mean_anomaly, bstar, ndot, nddot):
            if not math.isfinite(val):
                return None
        if not (0.0 <= inclination <= 180.0):
            return None

        metrics = _derive_orbital_metrics(mean_motion, eccentricity, inclination)
        raw_cat = record.get("NORAD_CAT_ID") or record.get("NORAD_ID")
        norad_int = parse_catalog_id(raw_cat)
        if norad_int is None:
            norad_int = 0

        normalized_omm = {
            "OBJECT_NAME": str(record.get("OBJECT_NAME") or record.get("NAME") or f"OBJECT {raw_cat or 'UNKNOWN'}"),
            "OBJECT_ID": str(record.get("OBJECT_ID") or "2026-000A"),
            "EPOCH": omm_epoch_str,
            "MEAN_MOTION": mean_motion,
            "ECCENTRICITY": eccentricity,
            "INCLINATION": inclination,
            "RA_OF_ASC_NODE": raan,
            "ARG_OF_PERICENTER": argp,
            "MEAN_ANOMALY": mean_anomaly,
            "EPHEMERIS_TYPE": int(record.get("EPHEMERIS_TYPE") or 0),
            "CLASSIFICATION_TYPE": str(record.get("CLASSIFICATION_TYPE") or "U")[:1],
            "NORAD_CAT_ID": norad_int,
            "ELEMENT_SET_NO": int(record.get("ELEMENT_SET_NO") or 999),
            "REV_AT_EPOCH": int(record.get("REV_AT_EPOCH") or 0),
            "BSTAR": bstar,
            "MEAN_MOTION_DOT": ndot,
            "MEAN_MOTION_DDOT": nddot,
        }
        sat = Satrec()
        sgp4_payload = dict(normalized_omm)
        if sgp4_payload["NORAD_CAT_ID"] > 339999:
            sgp4_payload["NORAD_CAT_ID"] = 0
        sgp4_omm.initialize(sat, sgp4_payload)
    except (ValueError, TypeError, OverflowError, KeyError):
        return None

    return {
        "norad_id": norad_int if norad_int > 0 else None,
        "catalog_identifier": str(raw_cat if raw_cat not in (None, "") else norad_int),
        "object_id": normalized_omm["OBJECT_ID"],
        "name": normalized_omm["OBJECT_NAME"],
        "format": "OMM_JSON",
        "catalog_group": record.get("CATALOG_GROUP"),
        "omm": normalized_omm,
        "epoch": epoch_dt.isoformat().replace("+00:00", "Z"),
        **metrics,
    }


def parse_orbital_record(record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Parse either an OMM JSON record or a legacy TLE record."""
    if not isinstance(record, dict):
        return None
    if record.get("TLE_LINE1") and record.get("TLE_LINE2"):
        parsed_tle = parse_tle_record(record)
        if parsed_tle is not None:
            return parsed_tle
    if "MEAN_MOTION" in record and "EPOCH" in record:
        return parse_omm_record(record)
    return parse_tle_record(record)


def build_satrec_from_record(record: Dict[str, Any]) -> Satrec:
    """Instantiate an sgp4 Satrec from a parsed orbital record (OMM JSON or TLE)."""
    if record.get("omm"):
        sat = Satrec()
        omm_copy = dict(record["omm"])
        omm_epoch_str, _ = _normalize_epoch_str(omm_copy["EPOCH"])
        omm_copy["EPOCH"] = omm_epoch_str
        if int(omm_copy.get("NORAD_CAT_ID") or 0) > 339999:
            omm_copy["NORAD_CAT_ID"] = 0
        sgp4_omm.initialize(sat, omm_copy)
        return sat
    if record.get("tle_line1") and record.get("tle_line2"):
        return Satrec.twoline2rv(record["tle_line1"], record["tle_line2"])
    raise ValueError("Orbital record contains neither OMM fields nor TLE lines.")


def build_keplerian_design_record(
    altitude_km: float,
    inclination_deg: float,
    eccentricity: float = 0.001,
    raan: Any = "Auto",
    arg_perigee: Any = "Auto",
    object_name: str = "Planned Mission Orbit",
    norad_id: Optional[int] = None,
    epoch_dt: Optional[datetime] = None,
    target_latitude_deg: Optional[float] = None,
    target_longitude_deg: Optional[float] = None,
) -> Dict[str, Any]:
    """Construct an explicit SGP4 OMM record from planned Keplerian mission design parameters."""
    if epoch_dt is None:
        epoch_dt = datetime.now(timezone.utc)
    elif epoch_dt.tzinfo is None:
        epoch_dt = epoch_dt.replace(tzinfo=timezone.utc)
    else:
        epoch_dt = epoch_dt.astimezone(timezone.utc)

    semi_major_km = R_EARTH_KM + float(altitude_km)
    period_s = 2.0 * math.pi * math.sqrt((semi_major_km ** 3) / MU_EARTH_KM3_S2)
    mean_motion = 86400.0 / period_s
    ecc = min(max(float(eccentricity or 0.0), 0.0), 0.99)
    if raan in (None, "", "Auto", "auto"):
        if target_longitude_deg is not None:
            jd, fr = jday(
                epoch_dt.year,
                epoch_dt.month,
                epoch_dt.day,
                epoch_dt.hour,
                epoch_dt.minute,
                epoch_dt.second + epoch_dt.microsecond / 1_000_000.0,
            )
            gmst_deg = (280.46061837 + 360.98564736629 * ((jd + fr) - 2451545.0)) % 360.0
            d_ra_deg = 0.0
            d_earth_deg = 0.0
            if target_latitude_deg is not None:
                inc_rad = math.radians(float(inclination_deg))
                lat_rad = math.radians(float(target_latitude_deg))
                sin_inc = math.sin(inc_rad)
                if abs(sin_inc) > 1e-4 and abs(math.sin(lat_rad)) <= abs(sin_inc):
                    u_rad = math.asin(max(-1.0, min(1.0, math.sin(lat_rad) / abs(sin_inc))))
                    if u_rad < 0:
                        u_rad += 2.0 * math.pi
                    d_ra_deg = math.degrees(math.atan2(math.cos(inc_rad) * math.sin(u_rad), math.cos(u_rad)))
                    dt_sec = (u_rad / (2.0 * math.pi)) * period_s
                    d_earth_deg = (360.98564736629 / 86400.0) * dt_sec
            raan_deg = (gmst_deg + float(target_longitude_deg) - d_ra_deg + d_earth_deg) % 360.0
        else:
            raan_deg = 0.0
    else:
        raan_deg = float(raan) % 360.0
    argp_deg = 0.0 if arg_perigee in (None, "", "Auto", "auto") else float(arg_perigee) % 360.0

    raw = {
        "OBJECT_NAME": object_name or "Planned Mission Orbit",
        "OBJECT_ID": "2026-PLAN",
        "EPOCH": epoch_dt.strftime("%Y-%m-%dT%H:%M:%S.%f"),
        "MEAN_MOTION": mean_motion,
        "ECCENTRICITY": ecc,
        "INCLINATION": float(inclination_deg),
        "RA_OF_ASC_NODE": raan_deg,
        "ARG_OF_PERICENTER": argp_deg,
        "MEAN_ANOMALY": 0.0,
        "EPHEMERIS_TYPE": 0,
        "CLASSIFICATION_TYPE": "U",
        "NORAD_CAT_ID": parse_catalog_id(norad_id) or 99999,
        "ELEMENT_SET_NO": 1,
        "REV_AT_EPOCH": 1,
        "BSTAR": 0.0001,
        "MEAN_MOTION_DOT": 0.0,
        "MEAN_MOTION_DDOT": 0.0,
    }
    parsed = parse_omm_record(raw)
    if parsed is None:
        raise ValueError("Unable to construct valid Keplerian SGP4 orbit from mission parameters.")
    parsed["format"] = "KEPLERIAN_DESIGN"
    return parsed


class CelestrakService:
    def __init__(self):
        self.base_url = settings.CELESTRAK_BASE_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS
        self.max_retries = settings.HTTP_MAX_RETRIES
        self._cache: Optional[Dict[str, Any]] = None
        self._group_parsed_cache: Dict[str, Tuple[str, Dict[str, Any]]] = {}
        self.cache_dir = Path(settings.CACHE_DIR)
        self.demo_catalog_path = Path(settings.DATA_DIR) / "demo_celestrak_omm.json"

    @staticmethod
    def _age_seconds(retrieved_at: str, now: datetime) -> float:
        retrieved = datetime.fromisoformat(retrieved_at.replace("Z", "+00:00"))
        return max(0.0, (now - retrieved).total_seconds())

    def _group_cache_path(self, group: str) -> Path:
        safe = "".join(ch if ch.isalnum() or ch in ("-", "_") else "_" for ch in group.lower())
        return self.cache_dir / f"celestrak_gp_{safe}.json"

    def _catnr_cache_path(self, catnr: int) -> Path:
        return self.cache_dir / f"celestrak_catnr_{catnr}.json"

    def _write_disk_cache(self, path: Path, payload: Dict[str, Any]) -> None:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(payload), encoding="utf-8")
        except OSError as exc:
            logger.warning("Failed to write CelesTrak disk cache %s: %s", path, exc)

    def _read_disk_cache(self, path: Path) -> Optional[Dict[str, Any]]:
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            logger.warning("Failed to read CelesTrak disk cache %s: %s", path, exc)
            return None

    def _load_demo_records(self) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        if not self.demo_catalog_path.exists():
            return [], {}
        try:
            payload = json.loads(self.demo_catalog_path.read_text(encoding="utf-8"))
            raw_records = payload.get("records", [])
            parsed = [p for item in raw_records if isinstance(item, dict) and (p := parse_orbital_record(item))]
            return parsed, payload.get("metadata", {})
        except (OSError, ValueError) as exc:
            logger.warning("Failed to load demo orbital catalog: %s", exc)
            return [], {}

    async def _fetch_json_with_retry(self, url: str) -> Any:
        last_exc: Optional[Exception] = None
        client_timeout = httpx.Timeout(min(self.timeout, 8.0), connect=3.5)
        async with httpx.AsyncClient(timeout=client_timeout) as client:
            for attempt in range(self.max_retries + 1):
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    return response.json()
                except httpx.HTTPStatusError as exc:
                    # Do not retry client errors (e.g. 403 CelesTrak rate limit, 404 not found)
                    if 400 <= exc.response.status_code < 500:
                        raise
                    last_exc = exc
                except (httpx.HTTPError, ValueError, TypeError) as exc:
                    last_exc = exc
                if attempt < self.max_retries:
                    await asyncio.sleep(0.35 * (2 ** attempt))
        assert last_exc is not None
        raise last_exc

    @staticmethod
    def _filter_epoch_records(
        raw: List[Any],
        group: Optional[str] = None,
    ) -> Dict[str, Any]:
        parsed_records: List[Dict[str, Any]] = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            if group and "CATALOG_GROUP" not in item:
                item = {**item, "CATALOG_GROUP": group}
            parsed = parse_orbital_record(item)
            if parsed is not None:
                parsed_records.append(parsed)

        now = datetime.now(timezone.utc)
        current_records: List[Dict[str, Any]] = []
        stale_count = 0
        future_count = 0
        omm_count = 0
        tle_count = 0
        for record in parsed_records:
            epoch = datetime.fromisoformat(record["epoch"].replace("Z", "+00:00"))
            if epoch > now + timedelta(minutes=5):
                future_count += 1
            elif now - epoch > timedelta(days=settings.DEBRIS_MAX_TLE_AGE_DAYS):
                stale_count += 1
            else:
                current_records.append(record)
                if record.get("format") == "OMM_JSON":
                    omm_count += 1
                else:
                    tle_count += 1
        return {
            "total_count": len(raw),
            "parsed_count": len(parsed_records),
            "current_records": current_records,
            "stale_tle_count": stale_count,
            "future_tle_count": future_count,
            "invalid_tle_count": len(raw) - len(parsed_records),
            "omm_count": omm_count,
            "tle_count": tle_count,
        }

    async def get_active_satellites_sample(self, group: str = "active") -> Dict[str, Any]:
        """Strict CelesTrak GP JSON fetcher preserving unit-test cache/error guarantees."""
        url = f"{self.base_url}/NORAD/elements/gp.php?GROUP={group}&FORMAT=json"
        retrieved = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                raw = response.json()
                if not isinstance(raw, list):
                    raise ValueError("CelesTrak response must be a JSON list.")
                stats = self._filter_epoch_records(raw, group=group)
                current_records = stats["current_records"]
                result = {
                    "source": "CelesTrak GP API",
                    "data_mode": "LIVE DATA",
                    "is_live": True,
                    "is_cached": False,
                    "is_demonstration": False,
                    "retrieved_at": retrieved,
                    "total_count": stats["total_count"],
                    "valid_tle_count": len(current_records),
                    "stale_tle_count": stats["stale_tle_count"],
                    "future_tle_count": stats["future_tle_count"],
                    "invalid_tle_count": stats["invalid_tle_count"],
                    "omm_count": stats["omm_count"],
                    "tle_count": stats["tle_count"],
                    "records": current_records[: settings.DEBRIS_MAX_CATALOG_OBJECTS],
                    "sample_objects": current_records[:25],
                }
                self._cache = result
                self._write_disk_cache(self._group_cache_path(group), {
                    "retrieved_at": retrieved,
                    "group": group,
                    "raw": raw,
                })
                return result
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            logger.warning("CelesTrak GP request failed (%s): %s", group, exc)
        if self._cache:
            now = datetime.now(timezone.utc)
            age_seconds = self._age_seconds(self._cache["retrieved_at"], now)
            if age_seconds <= settings.DEBRIS_MAX_CACHE_AGE_HOURS * 3600:
                return {
                    **self._cache,
                    "data_mode": "CACHED DATA",
                    "is_live": False,
                    "is_cached": True,
                    "is_demonstration": False,
                    "cache_age_seconds": age_seconds,
                    "source": "CelesTrak cached response",
                }
            return {
                "source": "CelesTrak cache expired",
                "data_mode": "UNAVAILABLE",
                "is_live": False,
                "is_cached": False,
                "is_demonstration": False,
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
            "data_mode": "UNAVAILABLE",
            "is_live": False,
            "is_cached": False,
            "is_demonstration": False,
            "retrieved_at": retrieved,
            "total_count": 0,
            "valid_tle_count": 0,
            "stale_tle_count": 0,
            "future_tle_count": 0,
            "invalid_tle_count": 0,
            "records": [],
            "sample_objects": [],
            "error": "No current or cached GP records are available.",
        }

    async def get_catalog_for_screening(
        self,
        groups: Optional[List[str]] = None,
        target_altitude_km: Optional[float] = None,
        altitude_band_km: Optional[float] = None,
        data_mode: str = "auto",
    ) -> Dict[str, Any]:
        """Fetch active + debris catalogs with altitude-shell filtering, disk cache, and demo fallback."""
        requested_groups = groups or list(settings.DEBRIS_CATALOG_GROUPS)
        band = altitude_band_km if altitude_band_km is not None else settings.DEBRIS_ALTITUDE_BAND_KM
        retrieved = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        now = datetime.now(timezone.utc)

        if data_mode == "demonstration":
            demo_records, meta = self._load_demo_records()
            return self._package_catalog_result(
                records=demo_records,
                raw_total=len(demo_records),
                stale=0,
                future=0,
                invalid=0,
                source=f"CelesTrak Demonstration Dataset ({meta.get('label', 'Offline Sample')})",
                data_mode="DEMONSTRATION DATA",
                is_live=False,
                is_cached=False,
                is_demonstration=True,
                retrieved_at=meta.get("generated_at", retrieved),
                groups=requested_groups,
                target_altitude_km=target_altitude_km,
                altitude_band_km=band,
            )

        all_records: List[Dict[str, Any]] = []
        seen_ids: set[str] = set()
        total_raw = 0
        total_stale = 0
        total_future = 0
        total_invalid = 0
        live_groups: List[str] = []
        cached_groups: List[str] = []
        cache_ages: List[float] = []
        oldest_retrieved = retrieved

        fresh_ttl_s = 1800.0  # Respect CelesTrak GP update interval to avoid 403 throttling on repeat runs

        async def _load_one_group(group: str) -> Optional[Tuple[str, bool, str, Optional[float], Dict[str, Any]]]:
            raw_list: Optional[List[Any]] = None
            group_retrieved = retrieved
            is_live_grp = False
            age_val: Optional[float] = None

            # In auto mode, reuse recently cached GP files (< 30 min) instead of hammering CelesTrak every run
            if data_mode == "auto":
                cached = self._read_disk_cache(self._group_cache_path(group))
                if cached and isinstance(cached.get("raw"), list) and cached.get("retrieved_at"):
                    age_s = self._age_seconds(cached["retrieved_at"], now)
                    if age_s <= fresh_ttl_s:
                        raw_list = cached["raw"]
                        group_retrieved = cached["retrieved_at"]
                        age_val = age_s

            if raw_list is None and data_mode in ("auto", "live"):
                url = f"{self.base_url}/NORAD/elements/gp.php?GROUP={group}&FORMAT=json"
                try:
                    raw = await self._fetch_json_with_retry(url)
                    if isinstance(raw, list):
                        raw_list = raw
                        is_live_grp = True
                        self._write_disk_cache(self._group_cache_path(group), {
                            "retrieved_at": retrieved,
                            "group": group,
                            "raw": raw,
                        })
                except (httpx.HTTPError, ValueError, TypeError) as exc:
                    logger.warning("CelesTrak GP fetch failed for group '%s': %s", group, exc)

            if raw_list is None and data_mode in ("auto", "cached"):
                cached = self._read_disk_cache(self._group_cache_path(group))
                if cached and isinstance(cached.get("raw"), list) and cached.get("retrieved_at"):
                    age_s = self._age_seconds(cached["retrieved_at"], now)
                    if age_s <= settings.DEBRIS_MAX_CACHE_AGE_HOURS * 3600:
                        raw_list = cached["raw"]
                        group_retrieved = cached["retrieved_at"]
                        age_val = age_s

            if raw_list is None:
                return None

            cached_parsed = self._group_parsed_cache.get(group)
            if cached_parsed and cached_parsed[0] == group_retrieved:
                stats = cached_parsed[1]
            else:
                stats = await asyncio.to_thread(self._filter_epoch_records, raw_list, group)
                self._group_parsed_cache[group] = (group_retrieved, stats)

            return group, is_live_grp, group_retrieved, age_val, stats

        group_results = await asyncio.gather(*[_load_one_group(g) for g in requested_groups])

        for entry in group_results:
            if entry is None:
                continue
            group, is_live_grp, group_retrieved, age_val, stats = entry
            if is_live_grp:
                live_groups.append(group)
            else:
                cached_groups.append(group)
                if age_val is not None:
                    cache_ages.append(age_val)
                if group_retrieved < oldest_retrieved:
                    oldest_retrieved = group_retrieved

            total_raw += stats["total_count"]
            total_stale += stats["stale_tle_count"]
            total_future += stats["future_tle_count"]
            total_invalid += stats["invalid_tle_count"]
            for rec in stats["current_records"]:
                dedup_key = str(rec.get("catalog_identifier") or rec.get("norad_id") or rec.get("name"))
                if dedup_key not in seen_ids:
                    seen_ids.add(dedup_key)
                    all_records.append(rec)

        if all_records:
            is_live = len(live_groups) > 0 and len(cached_groups) == 0
            is_cached = len(cached_groups) > 0 and len(live_groups) == 0
            if live_groups and cached_groups:
                mode_label = "CACHED DATA"
                source_label = f"CelesTrak GP API (mixed live: {live_groups}, cached: {cached_groups})"
            elif is_live:
                mode_label = "LIVE DATA"
                source_label = f"CelesTrak GP API ({', '.join(live_groups)})"
            else:
                mode_label = "CACHED DATA"
                source_label = f"CelesTrak Local Disk Cache ({', '.join(cached_groups)})"

            return self._package_catalog_result(
                records=all_records,
                raw_total=total_raw,
                stale=total_stale,
                future=total_future,
                invalid=total_invalid,
                source=source_label,
                data_mode=mode_label,
                is_live=is_live,
                is_cached=len(cached_groups) > 0,
                is_demonstration=False,
                retrieved_at=oldest_retrieved if cached_groups else retrieved,
                groups=requested_groups,
                target_altitude_km=target_altitude_km,
                altitude_band_km=band,
                cache_age_seconds=max(cache_ages) if cache_ages else None,
            )

        if data_mode == "auto":
            demo_records, meta = self._load_demo_records()
            if demo_records:
                return self._package_catalog_result(
                    records=demo_records,
                    raw_total=len(demo_records),
                    stale=0,
                    future=0,
                    invalid=0,
                    source=f"Demonstration Catalog Dataset (Offline Fallback — CelesTrak Unavailable)",
                    data_mode="DEMONSTRATION DATA",
                    is_live=False,
                    is_cached=False,
                    is_demonstration=True,
                    retrieved_at=meta.get("generated_at", retrieved),
                    groups=requested_groups,
                    target_altitude_km=target_altitude_km,
                    altitude_band_km=band,
                )

        return {
            "source": "CelesTrak unavailable",
            "data_mode": "UNAVAILABLE",
            "is_live": False,
            "is_cached": False,
            "is_demonstration": False,
            "retrieved_at": retrieved,
            "groups_requested": requested_groups,
            "total_count": total_raw,
            "valid_tle_count": 0,
            "stale_tle_count": total_stale,
            "future_tle_count": total_future,
            "invalid_tle_count": total_invalid,
            "omm_count": 0,
            "tle_count": 0,
            "records": [],
            "sample_objects": [],
            "error": "No live, cached, or demonstration catalog orbital records are available.",
        }

    def _package_catalog_result(
        self,
        records: List[Dict[str, Any]],
        raw_total: int,
        stale: int,
        future: int,
        invalid: int,
        source: str,
        data_mode: str,
        is_live: bool,
        is_cached: bool,
        is_demonstration: bool,
        retrieved_at: str,
        groups: List[str],
        target_altitude_km: Optional[float],
        altitude_band_km: float,
        cache_age_seconds: Optional[float] = None,
    ) -> Dict[str, Any]:
        shell_filtered = records
        if target_altitude_km is not None:
            min_alt = target_altitude_km - altitude_band_km
            max_alt = target_altitude_km + altitude_band_km
            in_shell = [
                r for r in records
                if r.get("apogee_km", target_altitude_km) >= min_alt
                and r.get("perigee_km", target_altitude_km) <= max_alt
            ]
            # Keep shell objects first; if shell filter narrows too far, keep shell objects only (accurate!)
            shell_filtered = in_shell

        limited = shell_filtered[: settings.DEBRIS_MAX_CATALOG_OBJECTS]
        omm_count = sum(1 for r in limited if r.get("format") == "OMM_JSON")
        tle_count = sum(1 for r in limited if r.get("format") == "TLE")
        extended_id_count = sum(1 for r in limited if (r.get("norad_id") or 0) > 99999)
        return {
            "source": source,
            "data_mode": data_mode,
            "is_live": is_live,
            "is_cached": is_cached,
            "is_demonstration": is_demonstration,
            "cache_age_seconds": cache_age_seconds,
            "retrieved_at": retrieved_at,
            "groups_requested": groups,
            "total_count": raw_total,
            "valid_tle_count": len(records),
            "shell_filtered_count": len(shell_filtered),
            "screened_catalog_limit": len(limited),
            "stale_tle_count": stale,
            "future_tle_count": future,
            "invalid_tle_count": invalid,
            "omm_count": omm_count,
            "tle_count": tle_count,
            "extended_catalog_id_count": extended_id_count,
            "records": limited,
            "sample_objects": limited[:25],
        }

    async def get_mission_orbital_elements(
        self,
        norad_id: Any = None,
        object_name: Optional[str] = None,
        tle_line1: Optional[str] = None,
        tle_line2: Optional[str] = None,
        omm: Optional[Dict[str, Any]] = None,
        catalog_records: Optional[List[Dict[str, Any]]] = None,
        altitude_km: Optional[float] = None,
        inclination_deg: Optional[float] = None,
        eccentricity: float = 0.0,
        raan: Any = "Auto",
        arg_perigee: Any = "Auto",
        allow_design_orbit: bool = False,
        data_mode: str = "auto",
        target_latitude_deg: Optional[float] = None,
        target_longitude_deg: Optional[float] = None,
    ) -> Tuple[Optional[Dict[str, Any]], str, List[str]]:
        """Resolve mission spacecraft orbital elements from TLE, OMM JSON, CelesTrak CATNR, or planned orbit."""
        errors: List[str] = []

        if tle_line1 and tle_line2:
            parsed = parse_tle_record({
                "OBJECT_NAME": object_name or "Mission Spacecraft",
                "NORAD_CAT_ID": norad_id,
                "TLE_LINE1": tle_line1,
                "TLE_LINE2": tle_line2,
            })
            if parsed is not None:
                return parsed, "user_tle", errors
            errors.append("Mission TLE failed checksum/format validation.")
            return None, "invalid_tle", errors

        if omm and isinstance(omm, dict):
            parsed = parse_omm_record(omm)
            if parsed is not None:
                return parsed, "user_omm_json", errors
            errors.append("Mission OMM JSON record failed orbital element validation.")
            return None, "invalid_omm", errors

        parsed_catnr = parse_catalog_id(norad_id)
        if parsed_catnr is not None and parsed_catnr > 0:
            now = datetime.now(timezone.utc)
            if data_mode in ("auto", "live"):
                url = f"{self.base_url}/NORAD/elements/gp.php?CATNR={parsed_catnr}&FORMAT=json"
                try:
                    raw = await self._fetch_json_with_retry(url)
                    if isinstance(raw, list) and raw:
                        parsed = parse_orbital_record(raw[0])
                        if parsed is not None:
                            self._write_disk_cache(self._catnr_cache_path(parsed_catnr), {
                                "retrieved_at": now.isoformat().replace("+00:00", "Z"),
                                "raw": raw[0],
                            })
                            return parsed, "celestrak_gp_catnr_live", errors
                except (httpx.HTTPError, ValueError, TypeError) as exc:
                    logger.warning("CelesTrak CATNR=%s lookup failed: %s", parsed_catnr, exc)

            if data_mode in ("auto", "cached"):
                cached = self._read_disk_cache(self._catnr_cache_path(parsed_catnr))
                if cached and cached.get("raw") and cached.get("retrieved_at"):
                    age_s = self._age_seconds(cached["retrieved_at"], now)
                    if age_s <= settings.DEBRIS_MAX_CACHE_AGE_HOURS * 3600:
                        parsed = parse_orbital_record(cached["raw"])
                        if parsed is not None:
                            return parsed, "celestrak_gp_catnr_cached", errors

            if catalog_records:
                for rec in catalog_records:
                    if rec.get("norad_id") == parsed_catnr:
                        return rec, "catalog_norad_lookup", errors

            if data_mode in ("auto", "demonstration"):
                demo_records, _ = self._load_demo_records()
                for rec in demo_records:
                    if rec.get("norad_id") == parsed_catnr:
                        return rec, "demonstration_catalog_catnr", errors

            errors.append(f"No valid orbital elements found for NORAD catalog ID {norad_id}.")
            return None, "norad_not_found", errors

        if object_name and catalog_records:
            needle = object_name.strip().lower()
            for rec in catalog_records:
                if rec.get("name", "").strip().lower() == needle:
                    return rec, "catalog_name_lookup", errors

        if allow_design_orbit and altitude_km is not None and inclination_deg is not None:
            design = build_keplerian_design_record(
                altitude_km=altitude_km,
                inclination_deg=inclination_deg,
                eccentricity=eccentricity,
                raan=raan,
                arg_perigee=arg_perigee,
                object_name=object_name or "Planned Mission Spacecraft",
                target_latitude_deg=target_latitude_deg,
                target_longitude_deg=target_longitude_deg,
            )
            return design, "planned_keplerian_design_orbit", errors

        errors.append("Mission orbital elements (NORAD ID, TLE, or OMM JSON) not supplied; measured conjunction screening was not run.")
        return None, "missing_mission_elements", errors


celestrak_service = CelestrakService()
