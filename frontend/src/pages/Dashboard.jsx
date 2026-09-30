import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, Award, ArrowRight, Layers, Sliders, Play,
  RefreshCw, Globe2, Sparkles, ChevronRight
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import BackgroundScene from '../components/BackgroundScene';
import StarfieldCanvas from '../components/StarfieldCanvas';
import ResearchPipeline from '../components/ResearchPipeline';
import CentralMissionVisualization from '../components/CentralMissionVisualization';
import AgentSystemTopology from '../components/AgentSystemTopology';
import { demoAnalysisData } from '../data/demoData';

export default function Dashboard() {
  const {
    activeMission,
    analysisResults,
    analysisStatus,
    runFullAnalysis,
    loading,
    createAndSetActiveMission
  } = useMission();

  // Baseline scenario fallback if no active mission exists in storage
  const currentMission = activeMission || {
    mission_id: "AMDSF-2026-LEO-01",
    mission_name: "LEO Earth Observation & Environmental Monitoring",
    objective: {
      type: "EARTH_OBSERVATION",
      description: "High-resolution optical & radar observation of target territorial zones."
    },
    target: {
      area: "Metropolitan & Coastal Zone",
      region: "Maritime District",
      country: "Regional Coast",
      latitude: 13.0827,
      longitude: 80.2707,
      coverage_requirement: 85,
      coverage_radius_km: 120
    },
    launch: {
      site: "Satish Dhawan Space Centre — Sriharikota",
      launch_site_code: "SDSC_SHAR",
      country: "Spaceport Facility",
      vehicle: "AeroSpace Small-Lift I"
    },
    orbit: {
      type: "Sun-Synchronous (SSO)",
      altitude_km: 550,
      inclination_deg: 97.6,
      eccentricity: 0.0012
    },
    mission: {
      payload_mass_kg: 250,
      budget_musd: 50,
      duration_days: 365
    },
    constraints: {
      preferred_launch_date: "2026-10-15",
      launch_window_flexibility_days: 3,
      maximum_acceptable_risk: "MEDIUM"
    }
  };

  const results = analysisResults || demoAnalysisData;
  const orchestrator = results?.orchestrator || {};
  const recommendation = orchestrator?.recommendation || {};

  return (
    <div className="relative min-h-screen">
      {/* Full-Screen Space Environment */}
      <BackgroundScene scene="orbit" overlayGradient="standard" />
      <StarfieldCanvas count={60} opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        
        {/* Top Header & Fast Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
                Mission Operations Console
              </h1>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                AMDSF v1.0
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-mono">
              Active Flight Profile: <strong className="text-cyan-300">{currentMission.mission_name}</strong> [{currentMission.mission_id}]
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/planning"
              className="px-3.5 py-2 rounded-xl bg-black/50 hover:bg-black/80 text-slate-200 border border-white/10 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-xl transition hover:border-cyan-500/40"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Configure Mission</span>
            </Link>

            <button
              onClick={() => runFullAnalysis(currentMission)}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Re-Evaluate Agents</span>
                </>
              )}
            </button>

            <Link
              to="/recommendation"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Recommendation</span>
            </Link>
          </div>
        </div>

        {/* Visual Pipeline Architecture (Figure 3 / Reusable Flow) */}
        <ResearchPipeline currentStep="all" compact={true} />

        {/* FIGURE 1: LARGE CENTRAL MISSION VISUALIZATION & COMPACT INDICATORS */}
        <CentralMissionVisualization
          mission={currentMission}
          analysisResults={results}
          analysisStatus={analysisStatus}
        />

        {/* MULTI-AGENT SYSTEM TOPOLOGY FLOW */}
        <AgentSystemTopology
          mission={currentMission}
          analysisResults={results}
          analysisStatus={analysisStatus}
        />

      </div>
    </div>
  );
}
