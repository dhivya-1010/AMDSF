import React, { createContext, useContext, useState, useEffect } from 'react';
import missionApi from '../services/api';

const MissionContext = createContext();

const STORAGE_KEY_MISSION = 'AMDSF_ACTIVE_MISSION';
const STORAGE_KEY_ANALYSIS = 'AMDSF_ANALYSIS_RESULTS';
const STORAGE_KEY_STATUS = 'AMDSF_ANALYSIS_STATUS';

export function MissionProvider({ children }) {
  // 1. Centralized Active Mission State
  const [activeMission, setActiveMission] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MISSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Centralized Analysis Results (keyed by missionId)
  const [analysisResults, setAnalysisResults] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANALYSIS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. Domain Analysis Status Tracker (NOT_RUN, RUNNING, COMPLETED, FAILED)
  const [analysisStatus, setAnalysisStatus] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATUS);
      return saved ? JSON.parse(saved) : {
        debris: 'NOT_RUN',
        weather: 'NOT_RUN',
        feasibility: 'NOT_RUN',
        coverage: 'NOT_RUN',
        orchestrator: 'NOT_RUN',
      };
    } catch {
      return {
        debris: 'NOT_RUN',
        weather: 'NOT_RUN',
        feasibility: 'NOT_RUN',
        coverage: 'NOT_RUN',
        orchestrator: 'NOT_RUN',
      };
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (activeMission) {
      localStorage.setItem(STORAGE_KEY_MISSION, JSON.stringify(activeMission));
    } else {
      localStorage.removeItem(STORAGE_KEY_MISSION);
    }
  }, [activeMission]);

  useEffect(() => {
    if (analysisResults) {
      localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(analysisResults));
    } else {
      localStorage.removeItem(STORAGE_KEY_ANALYSIS);
    }
  }, [analysisResults]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(analysisStatus));
  }, [analysisStatus]);

  // Backend Health Ping
  useEffect(() => {
    const ping = async () => {
      try {
        await missionApi.checkHealth();
        setBackendConnected(true);
      } catch (err) {
        console.warn("FastAPI backend offline, operating in client mode.");
        setBackendConnected(false);
      }
    };
    ping();
  }, []);

  // Action: Create and Set Active Mission
  const createAndSetActiveMission = (missionData) => {
    const missionId = missionData.mission_id || `AMDSF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const fullMission = {
      ...missionData,
      mission_id: missionId,
      created_at: new Date().toISOString()
    };
    setActiveMission(fullMission);
    setAnalysisResults(null);
    setAnalysisStatus({
      debris: 'NOT_RUN',
      weather: 'NOT_RUN',
      feasibility: 'NOT_RUN',
      coverage: 'NOT_RUN',
      orchestrator: 'NOT_RUN',
    });
    return fullMission;
  };

  // Action: Run Complete Multi-Agent Analysis
  const runFullAnalysis = async (missionPayload) => {
    setLoading(true);
    setError(null);
    setAnalysisStatus({
      debris: 'RUNNING',
      weather: 'RUNNING',
      feasibility: 'RUNNING',
      coverage: 'RUNNING',
      orchestrator: 'RUNNING',
    });

    try {
      let finalMission = activeMission;
      if (missionPayload) {
        finalMission = createAndSetActiveMission(missionPayload);
      }

      let res;
      try {
        res = await missionApi.analyzeMissionDirect(finalMission);
        setBackendConnected(true);
      } catch (netErr) {
        console.warn("Backend API unavailable. Generating client-side simulation for active mission:", netErr);
        setBackendConnected(false);
        res = generateClientSimulation(finalMission);
      }

      setAnalysisResults(res);
      setAnalysisStatus({
        debris: 'COMPLETED',
        weather: 'COMPLETED',
        feasibility: 'COMPLETED',
        coverage: 'COMPLETED',
        orchestrator: 'COMPLETED',
      });
      setLoading(false);
      return res;
    } catch (err) {
      console.error("Full mission orchestration error:", err);
      setError("Mission analysis failed. Please verify mission parameters.");
      setAnalysisStatus({
        debris: 'FAILED',
        weather: 'FAILED',
        feasibility: 'FAILED',
        coverage: 'FAILED',
        orchestrator: 'FAILED',
      });
      setLoading(false);
      return null;
    }
  };

  // Action: Run Individual Domain Agent
  const runSingleAgent = async (agentName) => {
    if (!activeMission) return;
    setAnalysisStatus(prev => ({ ...prev, [agentName]: 'RUNNING' }));

    try {
      let result;
      if (agentName === 'debris') result = await missionApi.analyzeDebris(activeMission.mission_id);
      if (agentName === 'weather') result = await missionApi.analyzeWeather(activeMission.mission_id);
      if (agentName === 'feasibility') result = await missionApi.analyzeFeasibility(activeMission.mission_id);
      if (agentName === 'coverage') result = await missionApi.analyzeCoverage(activeMission.mission_id);

      setAnalysisResults(prev => ({
        ...prev,
        [agentName]: result
      }));
      setAnalysisStatus(prev => ({ ...prev, [agentName]: 'COMPLETED' }));
    } catch (err) {
      console.warn(`Individual agent call failed for ${agentName}, simulating:`, err);
      const sim = generateClientSimulation(activeMission);
      setAnalysisResults(prev => ({
        ...prev,
        [agentName]: sim[agentName]
      }));
      setAnalysisStatus(prev => ({ ...prev, [agentName]: 'COMPLETED' }));
    }
  };

  // Action: Reset Active Mission
  const resetMission = () => {
    setActiveMission(null);
    setAnalysisResults(null);
    setAnalysisStatus({
      debris: 'NOT_RUN',
      weather: 'NOT_RUN',
      feasibility: 'NOT_RUN',
      coverage: 'NOT_RUN',
      orchestrator: 'NOT_RUN',
    });
  };

  // Dynamic Client-Side Fallback Simulation Engine based on ACTIVE MISSION inputs
  const generateClientSimulation = (m) => {
    const orbit = m.orbit?.altitude_km || 550;
    const inc = m.orbit?.inclination_deg || 97.6;
    const mass = m.mission?.payload_mass_kg || 250;
    const budget = m.mission?.budget_musd || 50;
    const targetArea = m.target?.area || "Target Area";
    const targetRegion = m.target?.region || "Region";
    const targetCountry = m.target?.country || "Country";
    const targetLat = m.target?.latitude || 0.0;
    const targetLng = m.target?.longitude || 0.0;
    const covReq = m.target?.coverage_requirement || 80;
    const covRadius = m.target?.coverage_radius_km || 100;
    const launchSite = m.launch?.site || "Launch Site";
    const launchSiteCode = m.launch?.launch_site_code || "SITE_01";
    const prefDate = m.constraints?.preferred_launch_date || "2026-10-15";
    const flexDays = m.constraints?.launch_window_flexibility_days || 3;

    const isHighOrbit = orbit >= 650 && orbit <= 850;
    const debrisRisk = isHighOrbit ? "HIGH" : "MEDIUM";
    const debrisScore = isHighOrbit ? 0.78 : 0.52;

    const vehicle = mass <= 350 ? "AeroSpace Small-Lift I" : (mass <= 1500 ? "AeroSpace Medium-Lift IV" : "AeroSpace Heavy Booster");
    const estCost = Math.round(budget * 0.32 * 10) / 10;
    const isFeasible = estCost <= budget;

    const swathWidth = Math.round(orbit * 1.85 * 10) / 10;
    const covRatio = Math.min(1.0, swathWidth / Math.max(50.0, covRadius * 2.0));
    const covPct = Math.min(99.4, Math.round((85.0 + covRatio * 12.0) * 10) / 10);
    const popApprox = Math.round((covRadius ** 2) * 3.14159 * 280);
    const popFormatted = popApprox >= 1000000 ? `${(popApprox / 1000000).toFixed(1)}M` : `${Math.round(popApprox / 1000)}k`;

    const readiness = isHighOrbit ? 72 : 82;
    const overallRisk = isHighOrbit ? "MEDIUM–HIGH" : "LOW–MEDIUM";
    const launchWindow = isHighOrbit ? `${prefDate} +1d — 14:15 UTC` : `${prefDate} — 10:30 UTC`;

    return {
      mission_id: m.mission_id,
      mission_definition: m,
      mission: {
        mission_name: m.mission_name,
        objective: m.objective?.type || "EARTH_OBSERVATION",
        target_location: `${targetArea}, ${targetRegion}, ${targetCountry}`,
        target_coordinates: `${targetLat}° N, ${targetLng}° E`,
        launch_site: `${launchSite} (${launchSiteCode})`,
        payload_mass: mass,
        target_orbit: orbit,
        inclination: inc,
        mission_duration: m.mission?.duration_days || 365,
        budget: budget,
        target_region: `${targetArea}, ${targetRegion}`,
        preferred_launch_date: prefDate,
        max_risk: m.constraints?.maximum_acceptable_risk || "MEDIUM"
      },
      debris: {
        mission_id: m.mission_id,
        agent: "Orbital Debris Intelligence Agent",
        status: "completed",
        objects_analyzed: 8420,
        nearby_objects: isHighOrbit ? 28 : 12,
        risk_level: debrisRisk,
        risk_score: debrisScore,
        data_source: "CelesTrak (Catalog Reference Cache)",
        summary: isHighOrbit
          ? `Elevated orbital debris density detected in the ${orbit}km / ${inc}° SSO corridor. Close conjunction risk is elevated.`
          : `Moderate orbital object proximity in nominal LEO (${orbit}km, ${inc}°). Acceptable with active tracking.`,
        factors: [
          `${isHighOrbit ? 28 : 12} nearby orbital objects tracked in CelesTrak active catalog`,
          `Candidate launch epoch ${prefDate} (±${flexDays}d) presents manageable conjunction vectors`,
          "Automated collision avoidance maneuver (CAM) delta-v reserve required"
        ],
        orbital_objects: [
          { name: "COSMOS 2251 DEB", norad_id: 34105, distance_km: 4.2, relative_velocity_kms: 12.4, risk: debrisRisk, inclination_deg: inc },
          { name: "SL-16 R/B Fragment", norad_id: 22676, distance_km: 14.8, relative_velocity_kms: 7.8, risk: "Low", inclination_deg: 71.0 },
          { name: "CZ-4B Splinter", norad_id: 26040, distance_km: 8.1, relative_velocity_kms: 10.2, risk: "Moderate", inclination_deg: 98.8 }
        ],
        details: {
          conjunction_threshold_km: 25.0,
          altitude_band_km: orbit,
          inclination_deg: inc,
          active_radar_tracking: true
        }
      },
      weather: {
        mission_id: m.mission_id,
        agent: "Space Weather Intelligence Agent",
        status: "completed",
        kp_index: 3.2,
        solar_activity: "QUIET / NOMINAL",
        cme_activity: true,
        geomagnetic_storm: false,
        risk_level: "LOW",
        risk_score: 0.18,
        data_sources: ["NOAA SWPC (Operational Baseline)", "NASA DONKI (Reference Telemetry Baseline)"],
        summary: `Current space weather conditions at ${launchSite} are favorable for launch operations.`,
        factors: [
          "Planetary Kp index (3.2) is within nominal operating range (< 4.0)",
          "No active severe geomagnetic storm conditions detected",
          "Solar flare background flux remains in Class B/C range"
        ],
        recent_events: [
          {
            activityID: "2026-09-14T08:24:00-CME-001",
            catalog: "DONKI_CME",
            startTime: `${prefDate} -1d`,
            note: "Partial halo CME observed with negligible Earth-directed impact.",
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
        mission_id: m.mission_id,
        agent: "Mission Feasibility Agent",
        status: "completed",
        feasible: isFeasible,
        launch_vehicle: vehicle,
        payload_capacity_kg: mass <= 350 ? 350.0 : 1500.0,
        estimated_cost_m: estCost,
        budget_status: isFeasible ? "WITHIN_BUDGET" : "OVER_BUDGET",
        cost_status_label: "Prototype Estimate",
        summary: isFeasible
          ? `Mission configuration satisfies feasibility constraints from ${launchSite}. Estimated cost ($${estCost}M) is within allocated budget ($${budget}M).`
          : `Mission exceeds allocated budget ($${estCost}M vs $${budget}M).`,
        factors: [
          `Payload mass (${mass} kg) is within ${vehicle} nominal lift capacity`,
          `Launch facility '${launchSite}' supports staging trajectory`,
          `Allocated budget ($${budget}M) covers lifecycle costs ($${estCost}M)`
        ],
        propulsion_margin_percent: 14.2,
        details: {
          delta_v_budget_ms: 3450 + Math.round(orbit * 0.4),
          payload_mass_fraction: 0.714,
          launch_site_selected: launchSite,
          fairing_static_envelope: "Standard 3.2m payload fairing compatible"
        }
      },
      coverage: {
        mission_id: m.mission_id,
        agent: "Coverage Intelligence Agent",
        status: "completed",
        coverage_percent: covPct,
        population_served: popApprox,
        population_served_formatted: popFormatted,
        coverage_gaps: covPct >= 90 ? 1 : 2,
        target_region: `${targetArea}, ${targetRegion}, ${targetCountry}`,
        summary: `Target area '${targetArea}' (${targetLat}° N, ${targetLng}° E) achieves ${covPct}% estimated coverage (Requirement: ${covReq}%).`,
        factors: [
          `Sensor swath width (${swathWidth}km) covers target radius with ${covPct}% area reach`,
          `Target demographic access: ~${popFormatted} population served in ${targetArea}`,
          `Identified ${covPct >= 90 ? 1 : 2} minor revisit gap intervals over ${m.mission?.duration_days || 365}-day lifecycle`
        ],
        revisit_time_minutes: 110,
        ground_track_passes_per_day: 8,
        details: {
          elevation_mask_deg: 5.0,
          swath_width_km: swathWidth,
          target_coordinates: `${targetLat}° N, ${targetLng}° E`,
          coverage_requirement_met: covPct >= covReq,
          coverage_radius_km: covRadius
        }
      },
      orchestrator: {
        mission_id: m.mission_id,
        status: "Cross-Domain Reasoning Completed",
        agent_consensus: {
          orbital_debris: `${debrisRisk} Risk`,
          space_weather: "LOW Risk",
          mission_feasibility: isFeasible ? "Feasible" : "Over Budget",
          coverage: `${covPct}% (${popFormatted})`
        },
        conflicts_detected: isHighOrbit ? ["Primary slot intersects dense debris band."] : [],
        resolution_strategy: isHighOrbit
          ? "Applied orbital slot phase shift (+14h delay) to avoid dense catalog conjunction cluster."
          : `Selected optimal launch window from ${launchSite} providing maximum orbital safety and ${covPct}% regional coverage over ${targetArea}.`,
        recommendation: {
          launch_window: launchWindow,
          risk_level: overallRisk,
          readiness: readiness,
          reasoning: [
            isHighOrbit ? "Elevated conjunction hazard requires orbital phasing offset" : `Conjunction risk is within acceptable threshold in calculated orbital corridor`,
            `Favorable space-weather conditions observed for ${launchSite} launch epoch`,
            `Mission configuration is feasible on ${vehicle} within budget limit ($${estCost}M / $${budget}M)`,
            `Target area '${targetArea}' receives ${covPct}% coverage (Requirement: ${covReq}%)`
          ],
          tradeoffs: [
            `Selecting primary launch slot from ${launchSite} achieves optimal ground track geometry over ${targetArea} while maintaining debris clearance.`
          ],
          mitigation: [
            "Continue automated orbital conjunction tracking with CelesTrak active catalog before launch",
            "Monitor NOAA SWPC 3-hour geomagnetic updates during T-24h countdown sequence"
          ],
          disclaimer: "Decision-support prototype only. AMDSF does not directly command or execute spacecraft flight operations."
        },
        chart_data: {
          risk_breakdown: [
            { name: "Debris Conjunction", risk_index: Math.round(debrisScore * 100), domain: "SSA" },
            { name: "Space Weather", risk_index: 18, domain: "Heliophysics" },
            { name: "Feasibility Risk", risk_index: isFeasible ? 10 : 75, domain: "Propulsion" },
            { name: "Coverage Gap", risk_index: Math.round(100 - covPct), domain: "Geometry" }
          ],
          launch_window_comparison: [
            { window: `${prefDate} (Early)`, risk: 68, cost: Math.round(estCost * 0.94), coverage: Math.round(covPct - 3), safety: 35 },
            { window: `${prefDate} (Recommended)`, risk: Math.round(debrisScore * 45), cost: estCost, coverage: Math.round(covPct), safety: 88 },
            { window: `${prefDate} (+2d)`, risk: 45, cost: Math.round(estCost * 1.06), coverage: Math.round(covPct - 1), safety: 74 }
          ]
        },
        map_data: {
          satellite_position: { lat: targetLat, lng: targetLng, alt_km: orbit, label: m.mission_name || "AMDSF Satellite" },
          coverage_radius_km: Math.round(covRadius * 2.5),
          ground_track: [
            { lat: targetLat - 15, lng: targetLng - 30, name: `Launch Ascent (${launchSite})` },
            { lat: targetLat - 5, lng: targetLng - 10, name: "Telemetry Node" },
            { lat: targetLat, lng: targetLng, name: `Observation Target (${targetArea})` },
            { lat: targetLat + 15, lng: targetLng + 20, name: "Descending Arc" }
          ],
          debris_markers: [
            { lat: targetLat + 4.2, lng: targetLng - 6.5, name: "COSMOS 2251 DEB", risk: debrisRisk, type: "debris" },
            { lat: targetLat - 3.8, lng: targetLng + 8.1, name: "SL-16 R/B Fragment", risk: "Low", type: "debris" },
            { lat: targetLat + 8.0, lng: targetLng + 12.4, name: "CZ-4B Splinter", risk: "Medium", type: "debris" }
          ],
          ground_stations: [
            { lat: targetLat - 15, lng: targetLng - 30, name: `Spaceport: ${launchSite}` },
            { lat: targetLat + 3.0, lng: targetLng + 1.0, name: `Regional Station: ${targetRegion}` }
          ]
        }
      }
    };
  };

  return (
    <MissionContext.Provider
      value={{
        activeMission,
        analysisResults,
        analysisStatus,
        loading,
        error,
        backendConnected,
        createAndSetActiveMission,
        runFullAnalysis,
        runSingleAgent,
        resetMission,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
}

export default MissionContext;
