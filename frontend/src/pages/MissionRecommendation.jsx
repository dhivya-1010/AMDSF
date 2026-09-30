import React from 'react';
import {
  Award, Compass, ShieldCheck, RefreshCw, Play, CheckCircle2,
  AlertTriangle, ArrowRight, UserCheck
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import BackgroundScene from '../components/BackgroundScene';
import ResearchPipeline from '../components/ResearchPipeline';
import OrchestrationFlowVisualization from '../components/OrchestrationFlowVisualization';
import { demoAnalysisData } from '../data/demoData';

export default function MissionRecommendation() {
  const { activeMission, analysisResults, analysisStatus, runFullAnalysis, loading } = useMission();

  const currentMission = activeMission || {
    mission_id: "AMDSF-2026-LEO-01",
    mission_name: "LEO Earth Observation & Environmental Monitoring",
    orbit: { altitude_km: 550, inclination_deg: 97.6, type: "SSO" },
    launch: { site: "Satish Dhawan Space Centre (SDSC SHAR)" },
    target: { area: "Metropolitan & Coastal Zone", country: "Coastal Region" },
    constraints: { preferred_launch_date: "2026-10-15" }
  };

  const results = analysisResults || demoAnalysisData;
  const orchestrator = results?.orchestrator || {};
  const recommendation = orchestrator?.recommendation || {};

  return (
    <div className="relative min-h-screen">
      {/* Full-Screen Deep Space & Earth Horizon Background */}
      <BackgroundScene scene="horizon" overlayGradient="standard" />
      <StarfieldCanvas count={50} opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        
        {/* Mission Context Bar */}
        <MissionContextBar mission={currentMission} activePage="recommendation" />

        {/* Hero Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <Award className="w-4 h-4" />
              <span className="font-semibold tracking-wider uppercase">ORCHESTRATED MULTI-DOMAIN SYNTHESIS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide mt-0.5">
              Mission Decision Support & Pareto Arbitration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => runFullAnalysis(currentMission)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Frontiers...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Re-Run Pareto Arbitration</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Architecture Pipeline (Step highlighted: Orchestration & Recommendation) */}
        <ResearchPipeline currentStep="orchestration" compact={true} />

        {/* HERO DECISION SUMMARY BADGE (COMPACT HUD STRIP) */}
        <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl hud-corner-ticks font-mono">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                PARETO-OPTIMAL FLIGHT WINDOW IDENTIFIED
              </span>
              <div className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                {recommendation.launch_window || `${currentMission.constraints?.preferred_launch_date} +1d — 10:30 UTC`}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Facility: <strong className="text-white">{currentMission.launch?.site}</strong> • Phasing Offset: <strong className="text-cyan-300">+14h (Conjunction Clearance)</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <span className="text-[9px] text-slate-400 uppercase block">Flight Readiness</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 block mt-0.5">
                  {recommendation.readiness || 82}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <span className="text-[9px] text-slate-400 uppercase block">Synthesized Risk</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-300 block mt-0.5">
                  {recommendation.risk_level || 'LOW–MEDIUM'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-center">
                <span className="text-[9px] text-emerald-300 uppercase block font-semibold">Status</span>
                <span className="text-sm font-bold text-emerald-300 block mt-1.5 px-2 py-0.5 rounded bg-emerald-900/50">
                  GO / REVIEW
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FIGURES 8 & 9: DECISION SYNTHESIS, PARETO PIPELINE, AND TRADE-OFF CHART */}
        <OrchestrationFlowVisualization
          orchestrator={orchestrator}
          mission={currentMission}
          analysisResults={results}
        />

        {/* HUMAN-IN-THE-LOOP FLIGHT DIRECTOR NOTICE */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Human-in-the-Loop Flight Authority:</strong> AMDSF operates strictly in an explainable decision-support capacity under ISO/IEEE 42010. Final launch authorization resides with the Flight Operations Director.
            </span>
          </div>
          <span className="hidden sm:inline text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-black/50 border border-white/10">
            VERIFIED
          </span>
        </div>

      </div>
    </div>
  );
}
