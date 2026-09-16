import React from 'react';
import { Award, Compass, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Info, Layers } from 'lucide-react';
import MissionCharts from '../components/MissionCharts';

export default function MissionRecommendation({ recommendationData, orchestratorData, missionData }) {
  const orchestrator = orchestratorData || {};
  const recommendation = recommendationData || orchestrator.recommendation || {};
  const consensus = orchestrator.agent_consensus || {};
  const chartData = orchestrator.chart_data || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="pb-4 border-b border-space-700/80">
        <div className="flex items-center gap-2.5">
          <Award className="w-7 h-7 text-cyan-400" />
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
            Explainable Mission Recommendation
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Synthesized cross-domain arbitration, trade-off resolution & risk mitigation protocols
        </p>
      </div>

      {/* Main Hero Recommendation Card */}
      <div className="bg-gradient-to-b from-space-850 via-space-900 to-space-950 border border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-space-700/70 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
              RECOMMENDED LAUNCH WINDOW
            </span>
            <div className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {recommendation.launch_window || "Tuesday — 10:30 UTC"}
            </div>
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
              <span className="font-bold text-cyan-300 mt-0.5 block">{consensus.coverage || "93.8%"}</span>
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
          Multi-Window Launch Trade-Off Analytics
        </h3>
        <MissionCharts chartData={chartData} />
      </div>

    </div>
  );
}
