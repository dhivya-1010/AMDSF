# Mission Feasibility Agent

## Overview
Evaluates launch vehicle lift limits, propulsion Delta-V insertion margins, fairing volume envelopes, and financial budget feasibility based on prototype estimation models.

## Interface
- `feasibility_agent.analyze(payload_mass, target_orbit, mission_duration, budget)` -> `FeasibilityAnalysisResult`
