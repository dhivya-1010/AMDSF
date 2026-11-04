from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class WeatherAnalysisResult(BaseModel):
    mission_id: Optional[str] = None
    agent: str = "Space Weather Intelligence Agent"
    status: str = "completed"
    kp_index: Optional[float] = None
    solar_activity: str
    cme_activity: bool
    geomagnetic_storm: bool
    risk_level: str
    risk_score: Optional[float] = None
    data_sources: List[str]
    summary: str
    factors: List[str]
    recent_events: List[Dict[str, Any]]
    details: Dict[str, Any]
    timestamp: Optional[str] = None
