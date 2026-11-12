from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class CoverageAnalysisResult(BaseModel):
    mission_id: Optional[str] = None
    agent: str = "Coverage Intelligence Agent"
    status: str = "completed"
    data_mode: str = "UNAVAILABLE"
    coverage_percent: Optional[float] = None
    population_served: Optional[int] = None
    population_served_formatted: Optional[str] = None
    coverage_gaps: Optional[int] = None
    target_region: str
    summary: str
    factors: List[str]
    revisit_time_minutes: Optional[int] = None
    max_revisit_minutes: Optional[int] = None
    ground_track_passes_per_day: Optional[float] = None
    swath_width_km: Optional[float] = None
    access_windows_count: int = 0
    details: Dict[str, Any]
    timestamp: Optional[str] = None
