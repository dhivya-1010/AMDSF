from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class FeasibilityAnalysisResult(BaseModel):
    agent: str = "Mission Feasibility Agent"
    status: str = "completed"
    feasible: bool
    launch_vehicle: str
    payload_capacity_kg: float
    estimated_cost_m: float
    budget_status: str
    cost_status_label: str = "Prototype Estimate"
    summary: str
    factors: List[str]
    propulsion_margin_percent: float
    details: Dict[str, Any]
