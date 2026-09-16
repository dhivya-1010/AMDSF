from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import datetime

class MissionObjectiveSchema(BaseModel):
    type: str = Field(default="EARTH_OBSERVATION", description="Mission objective category (e.g. Earth Observation, Communication, Navigation)")
    description: Optional[str] = Field(default="", description="Detailed narrative description of the mission objectives")

class TargetDefinitionSchema(BaseModel):
    country: str = Field(default="", description="Target country")
    region: str = Field(default="", description="Target province / state / region")
    area: str = Field(default="", description="Target specific operational area")
    latitude: float = Field(default=0.0, description="Target geographical latitude")
    longitude: float = Field(default=0.0, description="Target geographical longitude")
    coverage_requirement: float = Field(default=80.0, description="Minimum required regional coverage percentage (%)")
    coverage_radius_km: float = Field(default=100.0, description="Target observation / service radius in km")

class LaunchConfigurationSchema(BaseModel):
    country: str = Field(default="", description="Launch nation")
    site: str = Field(default="", description="Launch facility / spaceport name")
    launch_site_code: str = Field(default="SITE_01", description="Spaceport alphanumeric identifier")
    vehicle: str = Field(default="AUTO", description="Assigned launch vehicle model or AUTO")

class OrbitalConfigurationSchema(BaseModel):
    type: str = Field(default="LEO", description="Orbit regime type (e.g. LEO, SSO, MEO, GEO)")
    altitude_km: float = Field(default=550.0, description="Orbit altitude in kilometers (km)")
    inclination_deg: float = Field(default=97.6, description="Orbital inclination in degrees")
    eccentricity: float = Field(default=0.0, description="Orbital eccentricity (0.0 = circular)")
    raan: Optional[str] = Field(default="Auto", description="Right Ascension of Ascending Node")
    arg_perigee: Optional[str] = Field(default="Auto", description="Argument of Perigee")

class MissionLifecycleSchema(BaseModel):
    duration_days: int = Field(default=365, description="Operational lifespan in days")
    payload_mass_kg: float = Field(default=250.0, description="Payload wet mass in kilograms")
    budget_musd: float = Field(default=50.0, description="Allocated budget in Millions USD")

class MissionConstraintsSchema(BaseModel):
    preferred_launch_date: str = Field(default="2026-10-15", description="Target launch epoch date (YYYY-MM-DD)")
    preferred_launch_time: Optional[str] = Field(default=None, description="Target launch time UTC (optional)")
    maximum_acceptable_risk: str = Field(default="MEDIUM", description="Max acceptable operational risk threshold (LOW, MEDIUM, HIGH)")
    launch_window_flexibility_days: int = Field(default=3, description="Candidate epoch flexibility window in days (± days)")

class MissionRequestSchema(BaseModel):
    mission_id: Optional[str] = Field(default=None, description="Unique alphanumeric identifier (e.g. AMDSF-2026-001)")
    mission_name: str = Field(default="", description="Full descriptive mission name")
    created_at: Optional[str] = Field(default=None, description="ISO timestamp of creation")
    objective: MissionObjectiveSchema = Field(default_factory=MissionObjectiveSchema)
    target: TargetDefinitionSchema = Field(default_factory=TargetDefinitionSchema)
    launch: LaunchConfigurationSchema = Field(default_factory=LaunchConfigurationSchema)
    orbit: OrbitalConfigurationSchema = Field(default_factory=OrbitalConfigurationSchema)
    mission: MissionLifecycleSchema = Field(default_factory=MissionLifecycleSchema)
    constraints: MissionConstraintsSchema = Field(default_factory=MissionConstraintsSchema)
