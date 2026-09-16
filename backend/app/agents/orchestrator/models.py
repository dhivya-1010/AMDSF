from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RecommendationDetails(BaseModel):
    launch_window: str
    risk_level: str
    readiness: int
    reasoning: List[str]
    tradeoffs: List[str]
    mitigation: List[str]
    disclaimer: str = "Decision-support prototype only. AMDSF does not directly command or execute spacecraft flight operations."

class OrchestratorResult(BaseModel):
    status: str = "Cross-Domain Reasoning Completed"
    agent_consensus: Dict[str, str]
    conflicts_detected: List[str]
    resolution_strategy: str
    recommendation: RecommendationDetails
    chart_data: Dict[str, Any]
    map_data: Dict[str, Any]
