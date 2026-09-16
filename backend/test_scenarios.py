import asyncio
import json
from app.schemas.mission import (
    MissionRequestSchema, TargetDefinitionSchema, LaunchConfigurationSchema,
    OrbitalConfigurationSchema, MissionLifecycleSchema, MissionConstraintsSchema, MissionObjectiveSchema
)
from app.agents.orchestrator import orchestrator

async def run_tests():
    print("--- RUNNING SCENARIO 1: CHINA EO MISSION ---")
    m1 = MissionRequestSchema(
        mission_id="AMDSF-2026-001",
        mission_name="China Earth Observation Mission",
        objective=MissionObjectiveSchema(type="EARTH_OBSERVATION", description="High resolution EO"),
        target=TargetDefinitionSchema(
            country="China",
            region="Beijing",
            area="Beijing Metropolitan Area",
            latitude=39.9042,
            longitude=116.4074,
            coverage_requirement=80.0,
            coverage_radius_km=100.0
        ),
        launch=LaunchConfigurationSchema(
            country="India",
            site="Satish Dhawan Space Centre — Sriharikota",
            launch_site_code="SDSC_SHAR",
            vehicle="AUTO"
        ),
        orbit=OrbitalConfigurationSchema(
            type="LEO",
            altitude_km=550.0,
            inclination_deg=97.6,
            eccentricity=0.0
        ),
        mission=MissionLifecycleSchema(
            duration_days=365,
            payload_mass_kg=250.0,
            budget_musd=50.0
        ),
        constraints=MissionConstraintsSchema(
            preferred_launch_date="2026-10-15",
            maximum_acceptable_risk="MEDIUM",
            launch_window_flexibility_days=3
        )
    )

    res1 = await orchestrator.execute_mission_analysis(m1)
    print("Mission ID:", res1["mission_id"])
    print("Target Region Evaluated:", res1["coverage"]["target_region"])
    print("Coordinates Evaluated:", res1["coverage"]["details"]["target_coordinates"])
    print("Launch Site Evaluated:", res1["feasibility"]["details"]["launch_site_selected"])
    print("Assigned Vehicle:", res1["feasibility"]["launch_vehicle"])
    print("Coverage Percent:", res1["coverage"]["coverage_percent"])
    print("Debris Risk Level:", res1["debris"]["risk_level"])
    print("Recommendation Window:", res1["orchestrator"]["recommendation"]["launch_window"])
    print("Readiness Score:", res1["orchestrator"]["recommendation"]["readiness"])

    print("\n--- RUNNING SCENARIO 2: INDIA COMMUNICATION MISSION ---")
    m2 = MissionRequestSchema(
        mission_id="AMDSF-2026-002",
        mission_name="India Communication Mission",
        objective=MissionObjectiveSchema(type="COMMUNICATION", description="Broadband relay"),
        target=TargetDefinitionSchema(
            country="India",
            region="Tamil Nadu",
            area="Chennai Metropolitan Region",
            latitude=13.0827,
            longitude=80.2707,
            coverage_requirement=90.0,
            coverage_radius_km=150.0
        ),
        launch=LaunchConfigurationSchema(
            country="United States",
            site="Cape Canaveral Space Force Station (SLC-40 / SLC-41)",
            launch_site_code="CCAFS",
            vehicle="AeroSpace Medium-Lift IV"
        ),
        orbit=OrbitalConfigurationSchema(
            type="LEO",
            altitude_km=700.0,
            inclination_deg=53.0,
            eccentricity=0.0
        ),
        mission=MissionLifecycleSchema(
            duration_days=730,
            payload_mass_kg=600.0,
            budget_musd=75.0
        ),
        constraints=MissionConstraintsSchema(
            preferred_launch_date="2026-11-20",
            maximum_acceptable_risk="HIGH",
            launch_window_flexibility_days=5
        )
    )

    res2 = await orchestrator.execute_mission_analysis(m2)
    print("Mission ID:", res2["mission_id"])
    print("Target Region Evaluated:", res2["coverage"]["target_region"])
    print("Coordinates Evaluated:", res2["coverage"]["details"]["target_coordinates"])
    print("Launch Site Evaluated:", res2["feasibility"]["details"]["launch_site_selected"])
    print("Assigned Vehicle:", res2["feasibility"]["launch_vehicle"])
    print("Coverage Percent:", res2["coverage"]["coverage_percent"])
    print("Debris Risk Level:", res2["debris"]["risk_level"])
    print("Recommendation Window:", res2["orchestrator"]["recommendation"]["launch_window"])
    print("Readiness Score:", res2["orchestrator"]["recommendation"]["readiness"])

if __name__ == "__main__":
    asyncio.run(run_tests())
