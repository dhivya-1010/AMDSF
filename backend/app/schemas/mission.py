from pydantic import AliasChoices, BaseModel, Field
from typing import Optional, List, Dict, Any, Literal


class MissionObjectiveSchema(BaseModel):
    type: str = Field(
        default="EARTH_OBSERVATION",
        description="Mission objective category (e.g. Earth Observation, Communication, Navigation)",
    )
    description: Optional[str] = Field(
        default="",
        description="Detailed narrative description of the mission objectives",
    )


class TargetDefinitionSchema(BaseModel):
    country: str = Field(default="", description="Target country")
    region: str = Field(default="", description="Target province / state / region")
    area: str = Field(default="", description="Target specific operational area")
    latitude: float = Field(default=0.0, ge=-90.0, le=90.0, description="Target geographical latitude")
    longitude: float = Field(default=0.0, ge=-180.0, le=180.0, description="Target geographical longitude")
    coverage_requirement: float = Field(
        default=80.0, ge=0.0, le=100.0, description="Minimum required regional coverage percentage (%)"
    )
    coverage_radius_km: float = Field(
        default=100.0, gt=0.0, le=5000.0, description="Target observation / service radius in km"
    )


class LaunchConfigurationSchema(BaseModel):
    country: str = Field(default="", description="Launch nation")
    site: str = Field(default="", description="Launch facility / spaceport name")
    launch_site_code: str = Field(default="SITE_01", description="Spaceport alphanumeric identifier")
    vehicle: str = Field(default="AUTO", description="Assigned launch vehicle model or AUTO")


class OrbitalConfigurationSchema(BaseModel):
    type: str = Field(default="LEO", description="Orbit regime type (e.g. LEO, SSO, MEO, GEO)")
    altitude_km: float = Field(default=550.0, ge=120.0, le=42000.0, description="Orbit altitude in kilometers (km)")
    inclination_deg: float = Field(default=97.6, ge=0.0, le=180.0, description="Orbital inclination in degrees")
    eccentricity: float = Field(default=0.0, ge=0.0, lt=1.0, description="Orbital eccentricity (0.0 = circular)")
    raan: Optional[Any] = Field(default="Auto", description="Right Ascension of Ascending Node (deg or Auto)")
    arg_perigee: Optional[Any] = Field(default="Auto", description="Argument of Perigee (deg or Auto)")
    norad_id: Optional[Any] = Field(default=None, description="Mission spacecraft NORAD catalog ID (5+ digits or Alpha-5)")
    object_name: Optional[str] = Field(default=None, description="Mission spacecraft catalog name")
    tle_line1: Optional[str] = Field(default=None, description="Mission spacecraft TLE line 1")
    tle_line2: Optional[str] = Field(default=None, description="Mission spacecraft TLE line 2")
    omm: Optional[Dict[str, Any]] = Field(default=None, description="Mission spacecraft OMM JSON record")
    catalog_groups: List[str] = Field(
        default_factory=lambda: ["active", "cosmos-1408-debris", "fengyun-1c-debris"],
        description="CelesTrak GP catalog groups to screen against",
    )
    propagation_interval_minutes: int = Field(default=90, ge=1, le=1440)
    propagation_step_seconds: int = Field(default=60, ge=1, le=3600)
    screening_distance_km: float = Field(default=25.0, gt=0, le=1000)


class CoverageSensorSchema(BaseModel):
    sensor_fov_deg: Optional[float] = Field(default=None, gt=0.0, le=160.0, description="Full sensor field of view (deg)")
    swath_width_km: Optional[float] = Field(default=None, gt=0.0, le=10000.0, description="Configured swath width (km)")
    min_elevation_deg: float = Field(default=10.0, ge=0.0, le=85.0, description="Minimum ground elevation angle (deg)")
    observation_duration_hours: float = Field(default=24.0, gt=0.0, le=168.0, description="Coverage & revisit simulation duration (hours)")
    time_step_seconds: int = Field(default=60, ge=5, le=600, description="Propagation sampling step for coverage (s)")
    use_demonstration_sensor: bool = Field(
        default=True,
        description="Use configurable demonstration sensor model (45 deg FOV) if sensor_fov_deg and swath_width_km are omitted",
    )
    enable_worldpop_lookup: bool = Field(
        default=True,
        description="Query WorldPop gridded population API for target region when online",
    )


class MissionLifecycleSchema(BaseModel):
    duration_days: int = Field(default=365, ge=1, description="Operational lifespan in days")
    payload_mass_kg: float = Field(default=250.0, ge=0.0, description="Payload wet mass in kilograms")
    budget_musd: float = Field(default=50.0, ge=0.0, description="Allocated budget in Millions USD")
    satellite_manufacturing_cost_musd: Optional[float] = Field(default=None, ge=0.0, description="Optional explicit spacecraft manufacturing cost ($M)")
    launch_cost_musd: Optional[float] = Field(default=None, ge=0.0, description="Optional explicit launch service cost ($M)")
    annual_operations_cost_musd: Optional[float] = Field(default=None, ge=0.0, description="Optional explicit annual mission ops cost ($M/yr)")


class MissionConstraintsSchema(BaseModel):
    preferred_launch_date: str = Field(default="2026-10-15", description="Target launch epoch date (YYYY-MM-DD)")
    preferred_launch_time: Optional[str] = Field(default=None, description="Target launch time UTC (optional)")
    maximum_acceptable_risk: str = Field(default="MEDIUM", description="Max acceptable operational risk threshold (LOW, MEDIUM, HIGH)")
    launch_window_flexibility_days: int = Field(default=3, ge=0, le=30, description="Candidate epoch flexibility window in days (± days)")
    data_mode: Literal["auto", "live", "cached", "demonstration"] = Field(
        default="auto",
        description="Data acquisition mode: auto (live -> cache -> demonstration), live, cached, or demonstration",
    )
    missing_data_policy: Literal["CONDITIONAL_GO", "HOLD"] = Field(
        default="CONDITIONAL_GO",
        description="Orchestrator policy when non-blocking telemetry is unavailable",
    )


class MissionRequestSchema(BaseModel):
    mission_id: Optional[str] = Field(default=None, description="Unique alphanumeric identifier (e.g. AMDSF-2026-001)")
    mission_name: str = Field(default="", description="Full descriptive mission name")
    created_at: Optional[str] = Field(default=None, description="ISO timestamp of creation")
    objective: MissionObjectiveSchema = Field(default_factory=MissionObjectiveSchema)
    target: TargetDefinitionSchema = Field(default_factory=TargetDefinitionSchema)
    launch: LaunchConfigurationSchema = Field(default_factory=LaunchConfigurationSchema)
    orbit: OrbitalConfigurationSchema = Field(default_factory=OrbitalConfigurationSchema)
    sensor: CoverageSensorSchema = Field(
        default_factory=CoverageSensorSchema,
        validation_alias=AliasChoices("sensor", "coverage_sensor"),
    )
    mission: MissionLifecycleSchema = Field(default_factory=MissionLifecycleSchema)
    constraints: MissionConstraintsSchema = Field(default_factory=MissionConstraintsSchema)
