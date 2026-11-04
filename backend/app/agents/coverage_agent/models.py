from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CoverageAnalysisResult(BaseModel):
    mission_id: Optional[str] = None
    agent: str = "Coverage Intelligence Agent"
    status: str = "completed"
    coverage_percent: Optional[float] = None
    population_served: Optional[int] = None
    population_served_formatted: Optional[str] = None
    coverage_gaps: Optional[int] = None
    target_region: str
    summary: str
    factors: List[str]
    revisit_time_minutes: Optional[int] = None
    ground_track_passes_per_day: Optional[int] = None
    details: Dict[str, Any]
    timestamp: Optional[str] = None
