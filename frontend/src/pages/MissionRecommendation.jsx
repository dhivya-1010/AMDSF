import React from 'react';
import { Award, Compass, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Info, Layers, RefreshCw, Play } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import NoActiveMissionState from '../components/NoActiveMissionState';
import MissionCharts from '../components/MissionCharts';

export default function MissionRecommendation() {
  const { activeMission, analysisResults, analysisStatus, runFullAnalysis, loading } = useMission();

  if (!activeMission) {
    return <NoActiveMissionState pageTitle="Mission Recommendation" />;
  }

  const orchestrator = analysisResults?.orchestrator || {};
  const recommendation = orchestrator?.recommendation || {};
  const consensus = orchestrator?.agent_consensus || {};
  const chartData = orchestrator?.chart_data || {};
  const hasAnalysis = Boolean(orchestrator && orchestrator.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Persistent Mission Context Bar */}
      <MissionContextBar mission={activeMission} activePage="recommendation" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-space-700/80 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Award className="w-7 h-7 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              Explainable Mission Recommendation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Synthesized cross-domain arbitration, trade-off resolution & risk mitigation for {activeMission.mission_name} ({activeMission.mission_id})
          </p>
        </div>

        {!hasAnalysis && (
          <button
            type="button"
            disabled={loading}
            onClick={() => runFullAnalysis()}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running Orchestrator...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Run Mission Analysis</span>
              </>
            )}
          </button>
        )}
      </div>

      {!hasAnalysis ? (
        <div className="bg-space-900/90 border border-space-700/80 rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-inner">
            <Compass className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold font-mono text-white">
            Analysis Pending for {activeMission.mission_name}
          </h2>
          <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-md mx-auto">
            Click "Run Mission Analysis" to trigger the 4 autonomous domain agents and synthesize an explainable recommendation.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => runFullAnalysis()}
            className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-cyan-500/25 inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Complete Multi-Agent Analysis</span>
          </button>
        </div>
      ) : (
        <>
          {/* Main Hero Recommendation Card */}
          <div className="bg-gradient-to-b from-space-850 via-space-900 to-space-950 border border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-space-700/70 gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                  RECOMMENDED LAUNCH WINDOW
                </span>
                <div className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  {recommendation.launch_window || `${activeMission.constraints?.preferred_launch_date || "2026-10-15"} — 10:30 UTC`}
                </div>
                <span className="text-xs font-mono text-slate-400 mt-1 block">
                  Launch Spaceport: <strong className="text-white">{activeMission.launch?.site}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-space-950/90 border border-space-700 rounded-xl px-4 py-2.5 text-center font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block">Mission Readiness</span>
                  <span className="text-xl font-bold text-emerald-400">{recommendation.readiness || 82}%</span>
                </div>
                <div className="bg-space-950/90 border border-space-700 rounded-xl px-4 py-2.5 text-center font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block">Risk Level</span>
                  <span className="text-xl font-bold text-amber-400">{recommendation.risk_level || 'LOW–MEDIUM'}</span>
                </div>
              </div>
            </div>

            {/* 4 Agent Inputs feeding into Decision */}
            <div className="py-5 border-b border-space-700/70">
              <div className="text-xs font-mono text-slate-400 uppercase font-semibold mb-3">
                Agent Domain Inputs Synthesized:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-space-900/80 p-3 rounded-lg border border-space-700/80">
                  <span className="text-[10px] text-slate-400 block">Orbital Debris</span>
                  <span className="font-bold text-amber-400 mt-0.5 block">{consensus.orbital_debris || "MEDIUM Risk"}</span>
                </div>
                <div className="bg-space-900/80 p-3 rounded-lg border border-space-700/80">
                  <span className="text-[10px] text-slate-400 block">Space Weather</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">{consensus.space_weather || "LOW Risk"}</span>
                </div>
                <div className="bg-space-900/80 p-3 rounded-lg border border-space-700/80">
                  <span className="text-[10px] text-slate-400 block">Feasibility</span>
                  <span className="font-bold text-cyan-300 mt-0.5 block">{consensus.mission_feasibility || "Feasible"}</span>
                </div>
                <div className="bg-space-900/80 p-3 rounded-lg border border-space-700/80">
                  <span className="text-[10px] text-slate-400 block">Coverage</span>
                  <span className="font-bold text-cyan-300 mt-0.5 block">{consensus.coverage || "80%+"}</span>
                </div>
              </div>
            </div>

            {/* Why this recommendation (Explainable Factors) */}
            <div className="py-5 border-b border-space-700/70 space-y-3">
              <h3 className="text-sm font-mono uppercase font-bold text-white tracking-wide flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Why This Recommendation? (Explainable Reasoning)
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                {recommendation.reasoning?.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trade-Offs & Multi-Objective Arbitration */}
            {recommendation.tradeoffs && recommendation.tradeoffs.length > 0 && (
              <div className="py-5 border-b border-space-700/70 space-y-2">
                <h3 className="text-sm font-mono uppercase font-bold text-amber-400 tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Cross-Domain Trade-Offs Resolved
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-amber-200/90">
                  {recommendation.tradeoffs.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Mitigation Protocols */}
            <div className="pt-5 space-y-2">
              <h3 className="text-sm font-mono uppercase font-bold text-cyan-400 tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Recommended Risk Mitigation Protocols
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                {recommendation.mitigation?.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Operational Disclaimer */}
            <div className="mt-6 pt-4 border-t border-space-700/60 text-[11px] text-slate-400 font-mono italic">
              * {recommendation.disclaimer || "Decision-support prototype only. AMDSF does not directly command or execute spacecraft flight operations."}
            </div>

          </div>

          {/* Multi-Window Analytics Comparison */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase">
              Multi-Window Launch Trade-Off Analytics for {activeMission.mission_name}
            </h3>
            <MissionCharts chartData={chartData} />
          </div>
        </>
      )}

    </div>
  );
}
