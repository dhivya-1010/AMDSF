import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MissionPlanning from './pages/MissionPlanning';
import DebrisIntelligence from './pages/DebrisIntelligence';
import SpaceWeather from './pages/SpaceWeather';
import MissionFeasibility from './pages/MissionFeasibility';
import CoverageAnalysis from './pages/CoverageAnalysis';
import MissionRecommendation from './pages/MissionRecommendation';
import apiService from './services/api';

export default function App() {
  // Initially null so Dashboard renders the clean Landing / Overview state until a mission is planned and analyzed
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // Check backend health on initial load
  useEffect(() => {
    const testConnection = async () => {
      try {
        await apiService.checkHealth();
        setBackendConnected(true);
      } catch (err) {
        console.warn("Backend API not reachable yet. Operating in client demo simulation mode.");
        setBackendConnected(false);
      }
    };
    testConnection();
  }, []);

  // Main Mission Analysis Action
  const handleRunAnalysis = async (formParams) => {
    setLoading(true);
    setError(null);

    try {
      let result;
      try {
        result = await apiService.analyzeMission(formParams);
        setBackendConnected(true);
      } catch (networkErr) {
        console.warn("FastAPI backend error/unreachable, generating deterministic local simulation:", networkErr);
        setBackendConnected(false);
        // Fallback simulation with custom user parameters
        result = simulateLocalAnalysis(formParams);
      }

      setAnalysisData(result);
      setLoading(false);
      return true;
    } catch (err) {
      setError("Analysis orchestration failed. Please verify input parameters.");
      setLoading(false);
      return false;
    }
  };

  // Local fallback simulation generator
  const simulateLocalAnalysis = (form) => {
    const orbit = form.target_orbit || 550;
    const mass = form.payload_mass || 250;
    const budget = form.budget || 50;
    const isHighOrbit = orbit >= 650 && orbit <= 850;
    const debrisRisk = isHighOrbit ? "HIGH" : "MEDIUM";
    const debrisScore = isHighOrbit ? 0.78 : 0.52;
    const estCost = Math.round(budget * 0.32 * 10) / 10;
    const isFeasible = estCost <= budget;

    const launchVehicle = mass <= 350 ? "AeroSpace Small-Lift I" : (mass <= 1500 ? "AeroSpace Medium-Lift IV" : "AeroSpace Heavy Booster");

    return {
      mission: {
        mission_name: form.mission_name || "AMDSF Mission",
        payload_mass: mass,
        target_orbit: orbit,
        mission_duration: form.mission_duration || 365,
        budget: budget,
        target_region: form.target_region || "India",
        preferred_launch_date: form.preferred_launch_date || "2026-10-15"
      },
      debris: {
        agent: "Orbital Debris Intelligence Agent",
        status: "completed",
        objects_analyzed: 8420,
        nearby_objects: isHighOrbit ? 28 : 12,
        risk_level: debrisRisk,
        risk_score: debrisScore,
        data_source: "CelesTrak (Catalog Reference Cache)",
        summary: isHighOrbit
          ? `Elevated orbital debris density detected in the ${orbit}km SSO band. Close conjunction risk is elevated.`
          : `Moderate orbital object proximity in nominal LEO (${orbit}km). Acceptable with active tracking.`,
        factors: [
          `${isHighOrbit ? 28 : 12} nearby orbital objects tracked by CelesTrak`,
          "Conjunction risk is manageable with standard telemetry tracking",
          "Automated collision avoidance maneuver (CAM) delta-v reserve required"
        ],
        orbital_objects: [
          { name: "STARLINK-3120", norad_id: 51201, distance_km: 12.1, relative_velocity_kms: 7.4, risk: "Moderate", inclination_deg: 53.2 },
          { name: "CARTOSAT-2A", norad_id: 32783, distance_km: 18.4, relative_velocity_kms: 9.8, risk: "Low", inclination_deg: 97.9 },
          { name: "SL-16 R/B", norad_id: 22676, distance_km: 24.2, relative_velocity_kms: 8.2, risk: "Low", inclination_deg: 71.0 },
          { name: "DEB-9801", norad_id: 39112, distance_km: 9.8, relative_velocity_kms: 11.2, risk: "Medium", inclination_deg: 86.4 }
        ],
        details: {
          conjunction_threshold_km: 25.0,
          altitude_band_km: orbit,
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
        feasible: isFeasible,
        launch_vehicle: launchVehicle,
        payload_capacity_kg: mass <= 350 ? 350.0 : (mass <= 1500 ? 1500.0 : 5000.0),
        estimated_cost_m: estCost,
        budget_status: isFeasible ? "WITHIN_BUDGET" : "OVER_BUDGET",
        cost_status_label: "Prototype Estimate",
        summary: isFeasible
          ? `Mission configuration satisfies prototype feasibility constraints. Estimated cost ($${estCost}M) is within allocated budget ($${budget}M).`
          : `Mission exceeds allocated budget ($${estCost}M vs $${budget}M).`,
        factors: [
          `Payload mass (${mass} kg) matched to ${launchVehicle}`,
          `Propulsion delta-V margin is +14.2% above insertion baseline`,
          `Allocated budget ($${budget}M) covers lifecycle costs ($${estCost}M)`
        ],
        propulsion_margin_percent: 14.2,
        details: {
          delta_v_budget_ms: 3450 + int(orbit * 0.4),
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
        target_region: form.target_region || "India",
        summary: `Target region (${form.target_region || "India"}) receives high estimated ground footprint coverage (93.8%).`,
        factors: [
          `Orbit altitude (${orbit}km) yields optical/RF ground swath with 93.8% regional reach`,
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
          orbital_debris: `${debrisRisk} Risk`,
          space_weather: "LOW Risk",
          mission_feasibility: isFeasible ? "Feasible" : "Over Budget",
          coverage: "93.8%"
        },
        conflicts_detected: isHighOrbit ? ["Primary slot intersects dense debris band."] : [],
        resolution_strategy: isHighOrbit
          ? "Applied orbital slot phase shift (+14h delay) to avoid dense catalog conjunction cluster."
          : "Resolved minor trajectory trade-off by selecting Tuesday window for maximum orbital safety and nominal solar flux.",
        recommendation: {
          launch_window: isHighOrbit ? "Wednesday — 14:15 UTC" : "Tuesday — 10:30 UTC",
          risk_level: isHighOrbit ? "MEDIUM–HIGH" : "LOW–MEDIUM",
          readiness: isHighOrbit ? 72 : 82,
          reasoning: [
            isHighOrbit ? "Elevated conjunction risk requires orbital phasing offset" : "Lower conjunction risk in calculated orbital ascent corridor",
            "Favorable space-weather conditions (Planetary Kp Index 3.2)",
            `Mission configuration is feasible on ${launchVehicle}`,
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
            { name: "Debris Conjunction", risk_index: int(debrisScore * 100), domain: "SSA" },
            { name: "Space Weather", risk_index: 18, domain: "Heliophysics" },
            { name: "Feasibility Risk", risk_index: isFeasible ? 10 : 75, domain: "Propulsion" },
            { name: "Coverage Gaps", risk_index: 6, domain: "Geometry" }
          ],
          launch_window_comparison: [
            { window: "Monday", risk: 68, cost: Math.round(estCost * 0.92), coverage: 89, safety: 32 },
            { window: "Tuesday (Recommended)", risk: Math.round(debrisScore * 45), cost: estCost, coverage: 94, safety: 88 },
            { window: "Wednesday", risk: 45, cost: Math.round(estCost * 1.08), coverage: 92, safety: 72 }
          ]
        },
        map_data: {
          satellite_position: { lat: 20.5937, lng: 78.9629, alt_km: orbit, label: form.mission_name || "AMDSF Satellite" },
          coverage_radius_km: 1200,
          ground_track: [
            { lat: 0.5937, lng: 38.9629, name: "Ascent Orbital Vector" },
            { lat: 15.5937, lng: 63.9629, name: "Telemetry Acquisition" },
            { lat: 20.5937, lng: 78.9629, name: `Target Pass (${form.target_region || 'India'})` },
            { lat: 35.5937, lng: 108.9629, name: "Descending Pass" }
          ],
          debris_markers: [
            { lat: 24.7937, lng: 72.4629, name: "COSMOS 2251 DEB", risk: debrisRisk, type: "debris" },
            { lat: 16.7937, lng: 87.0629, name: "SL-16 R/B Fragment", risk: "Low", type: "debris" },
            { lat: 28.5937, lng: 91.3629, name: "CZ-4B Splinter", risk: "Medium", type: "debris" }
          ],
          ground_stations: [
            { lat: 25.5937, lng: 80.9629, name: "Primary Telemetry Node A" },
            { lat: 13.0827, lng: 80.2707, name: "Secondary Tracking Node B" }
          ]
        }
      }
    };
  };

  // Helper function for rounding in JS
  function int(val) {
    return Math.round(val);
  }

  return (
    <Router>
      <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
        
        {/* Sticky Professional Navbar */}
        <Navbar backendConnected={backendConnected} />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
          <Routes>
            <Route
              path="/"
              element={<Dashboard analysisData={analysisData} loading={loading} />}
            />
            <Route
              path="/planning"
              element={
                <MissionPlanning
                  onRunAnalysis={handleRunAnalysis}
                  loading={loading}
                  error={error}
                />
              }
            />
            <Route
              path="/debris"
              element={
                <DebrisIntelligence
                  debrisData={analysisData?.debris}
                  mapData={analysisData?.orchestrator?.map_data}
                />
              }
            />
            <Route
              path="/weather"
              element={<SpaceWeather weatherData={analysisData?.weather} />}
            />
            <Route
              path="/feasibility"
              element={
                <MissionFeasibility
                  feasibilityData={analysisData?.feasibility}
                  missionData={analysisData?.mission}
                />
              }
            />
            <Route
              path="/coverage"
              element={
                <CoverageAnalysis
                  coverageData={analysisData?.coverage}
                  mapData={analysisData?.orchestrator?.map_data}
                />
              }
            />
            <Route
              path="/recommendation"
              element={
                <MissionRecommendation
                  recommendationData={analysisData?.orchestrator?.recommendation}
                  orchestratorData={analysisData?.orchestrator}
                  missionData={analysisData?.mission}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-space-800/80 bg-space-950 py-4 px-4 text-center text-xs text-slate-500 font-mono">
          AMDSF — Agentic Multi-Domain Space Mission Decision Support Framework • College Presentation Architecture
        </footer>

      </div>
    </Router>
  );
}
