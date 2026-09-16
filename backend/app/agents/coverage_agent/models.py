from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CoverageAnalysisResult(BaseModel):
    agent: str = "Coverage Intelligence Agent"
    status: str = "completed"
    coverage_percent: float
    population_served: int
    population_served_formatted: str
    coverage_gaps: int
    target_region: str
    summary: str
    factors: List[str]
    revisit_time_minutes: int
    ground_track_passes_per_day: int
    details: Dict[str, Any]
