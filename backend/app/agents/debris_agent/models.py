from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DebrisObjectItem(BaseModel):
    name: str
    norad_id: Optional[int] = None
    catalog_identifier: Optional[str] = None
    distance_km: float
    relative_velocity_kms: Optional[float] = None
    risk: str
    inclination_deg: Optional[float] = None
    tca: Optional[str] = None
    format: Optional[str] = None
    catalog_group: Optional[str] = None
    altitude_km: Optional[float] = None


class DebrisAnalysisResult(BaseModel):
    mission_id: Optional[str] = None
    agent: str = "Orbital Debris Intelligence Agent"
    status: str = "completed"
    data_mode: str = "UNAVAILABLE"
    objects_analyzed: int
    nearby_objects: int
    risk_level: str
    risk_score: Optional[float] = None
    data_source: str
    summary: str
    factors: List[str]
    orbital_objects: List[DebrisObjectItem]
    details: Dict[str, Any]
    timestamp: Optional[str] = None
