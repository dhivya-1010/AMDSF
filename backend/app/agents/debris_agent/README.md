# Orbital Debris Intelligence Agent

## Overview
Monitors orbital object catalogs (CelesTrak, LeoLabs) to calculate spatial proximity, trackable conjunction vectors, and collision avoidance risks for a candidate spacecraft trajectory.

## Interface
- `debris_agent.analyze(target_orbit_km)` -> `DebrisAnalysisResult`
