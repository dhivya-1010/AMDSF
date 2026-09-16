from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DebrisObjectItem(BaseModel):
    name: str
    norad_id: Optional[int] = None
    distance_km: float
    relative_velocity_kms: float
    risk: str
    inclination_deg: Optional[float] = None

class DebrisAnalysisResult(BaseModel):
    agent: str = "Orbital Debris Intelligence Agent"
    status: str = "completed"
    objects_analyzed: int
    nearby_objects: int
    risk_level: str
    risk_score: float
    data_source: str
    summary: str
    factors: List[str]
    orbital_objects: List[DebrisObjectItem]
    details: Dict[str, Any]
