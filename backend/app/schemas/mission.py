from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class MissionRequestSchema(BaseModel):
    mission_name: str = Field(default="AMDSF Demo Mission", description="Identifier name of the proposed space mission")
    payload_mass: float = Field(default=250.0, description="Payload mass in kilograms (kg)")
    target_orbit: float = Field(default=550.0, description="Target orbital altitude in kilometers (km)")
    mission_duration: int = Field(default=365, description="Operational mission lifespan in days")
    budget: float = Field(default=50.0, description="Allocated mission budget in Millions USD ($M)")
    target_region: str = Field(default="India", description="Primary geographical or regional target")
    preferred_launch_date: str = Field(default="2026-10-15", description="Preferred candidate launch date (YYYY-MM-DD)")

class MissionSummarySchema(BaseModel):
    mission_name: str
    payload_mass_kg: float
    target_orbit_km: float
    mission_duration_days: int
    budget_m: float
    target_region: str
    preferred_launch_date: str
