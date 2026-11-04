# Coverage Intelligence Agent

## Overview
Produces a deterministic swath-geometry prototype estimate from configured
mission orbit and target inputs. It does not propagate an orbit, calculate
access-window events, or use a population dataset.

## Interface
- `coverage_agent.analyze(target_region, target_orbit_km)` -> `CoverageAnalysisResult`

The current estimate uses `swath = altitude_km * 1.85` and a documented
clamped coverage heuristic. `population_served` and `revisit_time_minutes`
remain unavailable until attributed datasets and an access-event propagator are
added and validated.
