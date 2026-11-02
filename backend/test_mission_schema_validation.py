import unittest

from pydantic import ValidationError

from app.schemas.mission import (
    MissionLifecycleSchema,
    OrbitalConfigurationSchema,
    TargetDefinitionSchema,
)


class MissionSchemaValidationTests(unittest.TestCase):
    def test_accepts_valid_physical_values(self):
        target = TargetDefinitionSchema(
            latitude=-33.8688,
            longitude=151.2093,
            coverage_requirement=95,
            coverage_radius_km=25,
        )
        orbit = OrbitalConfigurationSchema(
            altitude_km=550,
            inclination_deg=97.6,
            eccentricity=0.01,
        )
        lifecycle = MissionLifecycleSchema(
            duration_days=365,
            payload_mass_kg=250,
            budget_musd=50,
        )

        self.assertEqual(target.latitude, -33.8688)
        self.assertEqual(orbit.eccentricity, 0.01)
        self.assertEqual(lifecycle.duration_days, 365)

    def test_rejects_out_of_range_coordinates_and_coverage(self):
        with self.assertRaises(ValidationError):
            TargetDefinitionSchema(latitude=91)
        with self.assertRaises(ValidationError):
            TargetDefinitionSchema(longitude=-181)
        with self.assertRaises(ValidationError):
            TargetDefinitionSchema(coverage_requirement=101)

    def test_rejects_non_physical_or_non_positive_values(self):
        with self.assertRaises(ValidationError):
            OrbitalConfigurationSchema(altitude_km=0)
        with self.assertRaises(ValidationError):
            OrbitalConfigurationSchema(eccentricity=1)
        with self.assertRaises(ValidationError):
            MissionLifecycleSchema(payload_mass_kg=-1)
        with self.assertRaises(ValidationError):
            MissionLifecycleSchema(duration_days=0)


if __name__ == "__main__":
    unittest.main()
