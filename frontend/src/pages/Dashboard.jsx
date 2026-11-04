import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, Award, ArrowRight, Layers, Sliders, Play,
  RefreshCw, Globe2, Sparkles, ChevronRight
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import DashboardBackground from '../components/DashboardBackground';
import CentralMissionVisualization from '../components/CentralMissionVisualization';
import AgentSystemTopology from '../components/AgentSystemTopology';

export default function Dashboard() {
  const {
    activeMission,
    analysisResults,
    analysisStatus,
    runFullAnalysis,
    loading,
    createAndSetActiveMission
  } = useMission();

  const currentMission = activeMission;
  const results = analysisResults;
  const orchestrator = results?.orchestrator || {};
  const recommendation = orchestrator?.recommendation || {};

  return (
    <div className="relative min-h-screen">
      {/* Space Situational Awareness Control Room Background */}
      <DashboardBackground />

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
              Active Flight Profile:               <strong className="text-cyan-300">{currentMission?.mission_name || 'No mission configured'}</strong> [{currentMission?.mission_id || '—'}]
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
              onClick={() => currentMission && runFullAnalysis(currentMission)}
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
