export const demoAnalysisData = {
  mission: {
    mission_name: "AMDSF Demo Mission",
    payload_mass: 250,
    target_orbit: 550,
    mission_duration: 365,
    budget: 50,
    target_region: "India",
    preferred_launch_date: "2026-10-15"
  },
  debris: {
    agent: "Orbital Debris Intelligence Agent",
    status: "completed",
    objects_analyzed: 8420,
    nearby_objects: 12,
    risk_level: "MEDIUM",
    risk_score: 0.52,
    data_source: "CelesTrak (Catalog Reference Cache)",
    summary: "Moderate orbital object proximity in nominal LEO (550km). Acceptable with active tracking.",
    factors: [
      "12 nearby orbital objects tracked by CelesTrak",
      "Conjunction risk is manageable with standard telemetry tracking",
      "2 close conjunction passes forecasted within 50km over first 7 days"
    ],
    orbital_objects: [
      { name: "STARLINK-3120", norad_id: 51201, distance_km: 12.1, relative_velocity_kms: 7.4, risk: "Moderate", inclination_deg: 53.2 },
      { name: "CARTOSAT-2A", norad_id: 32783, distance_km: 18.4, relative_velocity_kms: 9.8, risk: "Low", inclination_deg: 97.9 },
      { name: "SL-16 R/B", norad_id: 22676, distance_km: 24.2, relative_velocity_kms: 8.2, risk: "Low", inclination_deg: 71.0 },
      { name: "DEB-9801", norad_id: 39112, distance_km: 9.8, relative_velocity_kms: 11.2, risk: "Medium", inclination_deg: 86.4 }
    ],
    details: {
      conjunction_threshold_km: 25.0,
      altitude_band_km: 550.0,
      active_radar_tracking: true
    }
  },
  weather: {
    agent: "Space Weather Intelligence Agent",
    status: "completed",
    kp_index: 3.2,
    solar_activity: "QUIET / NOMINAL",
    cme_activity: true,
    geomagnetic_storm: false,
    risk_level: "LOW",
    risk_score: 0.18,
    data_sources: ["NOAA SWPC (Operational Baseline)", "NASA DONKI (Reference Telemetry Baseline)"],
    summary: "Current space weather conditions are favorable for launch and orbital insertion operations.",
    factors: [
      "Kp index (3.2) is within nominal operating range (< 4.0)",
      "No active severe geomagnetic storm conditions",
      "Solar flare background flux remains in Class B/C range"
    ],
    recent_events: [
      {
        activityID: "2026-09-14T08:24:00-CME-001",
        catalog: "DONKI_CME",
        startTime: "2026-09-14T08:24Z",
        note: "Partial halo CME observed by SOHO/LASCO C3. Estimated earthward velocity 420 km/s.",
        associated_flare: "C3.4"
      }
    ],
    details: {
      solar_wind_speed_kms: 395.0,
      radio_flux_f10_7: 142.5,
      proton_density_cm3: 5.4,
      estimated_atmospheric_drag: "Nominal (1.02x baseline)"
    }
  },
  feasibility: {
    agent: "Mission Feasibility Agent",
    status: "completed",
    feasible: true,
    launch_vehicle: "AeroSpace Small-Lift I",
    payload_capacity_kg: 350.0,
    estimated_cost_m: 14.8,
    budget_status: "WITHIN_BUDGET",
    cost_status_label: "Prototype Estimate",
    summary: "Mission configuration satisfies prototype feasibility constraints. Estimated cost ($14.8M) is within allocated budget ($50.0M).",
    factors: [
      "Payload mass (250.0 kg) is within AeroSpace Small-Lift I capacity (350.0 kg)",
      "Propulsion delta-V margin is +13.5% above orbital insertion baseline",
      "Allocated budget ($50.0M) covers estimated mission lifecycle ($14.8M)"
    ],
    propulsion_margin_percent: 13.5,
    details: {
      delta_v_budget_ms: 3670,
      payload_mass_fraction: 0.714,
      fairing_static_envelope: "Standard 3.2m payload fairing compatible"
    }
  },
  coverage: {
    agent: "Coverage Intelligence Agent",
    status: "completed",
    coverage_percent: 93.8,
    population_served: 18400000,
    population_served_formatted: "18.4M",
    coverage_gaps: 2,
    target_region: "India",
    summary: "Target region (India) receives high estimated ground footprint coverage (93.8%).",
    factors: [
      "Orbit altitude (550km) yields optical/RF ground swath with 93.8% regional reach",
      "Estimated demographic access of 18.4M population served",
      "Identified 2 minor off-nadir revisit gaps during daylight crossing passes"
    ],
    revisit_time_minutes: 110,
    ground_track_passes_per_day: 8,
    details: {
      elevation_mask_deg: 5.0,
      swath_width_km: 1017.5,
      ground_station_contact_time_min: 9.4
    }
  },
  orchestrator: {
    status: "Cross-Domain Reasoning Completed",
    agent_consensus: {
      orbital_debris: "MEDIUM Risk (12 nearby)",
      space_weather: "LOW Risk (Kp 3.2)",
      mission_feasibility: "Feasible ($14.8M)",
      coverage: "93.8% (18.4M)"
    },
    conflicts_detected: [],
    resolution_strategy: "Resolved minor trajectory trade-off by selecting Tuesday window for maximum orbital safety and nominal solar flux.",
    recommendation: {
      launch_window: "Tuesday — 10:30 UTC",
      risk_level: "LOW–MEDIUM",
      readiness: 82,
      reasoning: [
        "Lower conjunction risk in calculated orbital ascent corridor",
        "Favorable space-weather conditions (Planetary Kp Index 3.2)",
        "Mission configuration is feasible on AeroSpace Small-Lift I",
        "93.8% target regional coverage successfully achieved"
      ],
      tradeoffs: [
        "Estimated cost is slightly higher than Monday unconstrained slot, but provides 14km greater clearance from trackable debris."
      ],
      mitigation: [
        "Continue automated orbital conjunction monitoring with CelesTrak before launch",
        "Monitor NOAA SWPC 3-hour geomagnetic updates during T-24h countdown"
      ],
      disclaimer: "Decision-support prototype only. AMDSF does not directly command or execute spacecraft flight operations."
    },
    chart_data: {
      risk_breakdown: [
        { name: "Debris Conjunction", risk_index: 52, domain: "SSA" },
        { name: "Space Weather", risk_index: 18, domain: "Heliophysics" },
        { name: "Feasibility Risk", risk_index: 10, domain: "Propulsion" },
        { name: "Coverage Gaps", risk_index: 6, domain: "Geometry" }
      ],
      launch_window_comparison: [
        { window: "Monday", risk: 68, cost: 13, coverage: 89, safety: 32 },
        { window: "Tuesday (Recommended)", risk: 23, cost: 15, coverage: 94, safety: 88 },
        { window: "Wednesday", risk: 45, cost: 16, coverage: 92, safety: 72 }
      ]
    },
    map_data: {
      satellite_position: { lat: 20.5937, lng: 78.9629, alt_km: 550, label: "AMDSF Demo Mission" },
      coverage_radius_km: 1200,
      ground_track: [
        { lat: 0.5937, lng: 38.9629, name: "Ascent Orbital Vector" },
        { lat: 15.5937, lng: 63.9629, name: "Telemetry Acquisition" },
        { lat: 20.5937, lng: 78.9629, name: "Target Pass (India)" },
        { lat: 35.5937, lng: 108.9629, name: "Descending Pass" }
      ],
      debris_markers: [
        { lat: 24.7937, lng: 72.4629, name: "COSMOS 2251 DEB", risk: "Medium", type: "debris" },
        { lat: 16.7937, lng: 87.0629, name: "SL-16 R/B Fragment", risk: "Low", type: "debris" },
        { lat: 28.5937, lng: 91.3629, name: "CZ-4B Splinter", risk: "Medium", type: "debris" }
      ],
      ground_stations: [
        { lat: 25.5937, lng: 80.9629, name: "ISTRAC Ground Station Node A" },
        { lat: 13.0827, lng: 80.2707, name: "Southern Telemetry Tracking Node B" }
      ]
    }
  }
};
