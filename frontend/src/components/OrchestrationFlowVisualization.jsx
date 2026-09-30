import React, { useState } from 'react';
import {
  Award, Compass, Scale, Cpu, ShieldAlert, SunMedium,
  Wrench, Satellite, ArrowDown, ArrowRight, CheckCircle2,
  AlertTriangle, Filter, Users, Radio
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

/**
 * OrchestrationFlowVisualization
 * Visual decision synthesis and Pareto-based arbitration component:
 * 1. 4 domain agents converging into central Mission Orchestrator node
 * 2. Pareto Arbitration pipeline: CANDIDATE SPACE -> PARETO FILTER -> NON-DOMINATED OPTIONS -> HUMAN REVIEW
 * 3. Launch-Window Comparison Chart (Candidates A, B, C plotted against normalized objectives)
 * 4. Structured trade-offs & dominant constraints table
 */
export default function OrchestrationFlowVisualization({
  orchestrator = {},
  mission = {},
  analysisResults = {}
}) {
  const [selectedCandidate, setSelectedCandidate] = useState('CANDIDATE B');

  const debris = analysisResults?.debris || {};
  const weather = analysisResults?.weather || {};
  const feasibility = analysisResults?.feasibility || {};
  const coverage = analysisResults?.coverage || {};
  const recommendation = orchestrator?.recommendation || {};

  const prefDate = mission.constraints?.preferred_launch_date || '2026-10-15';
  const covPct = coverage.coverage_percent || 97.2;

  // Normalized Multi-Objective Evaluation Data for Candidates A, B, C
  const candidateData = [
    {
      candidate: 'CANDIDATE A',
      epoch: `${prefDate} 08:30 UTC`,
      debrisClearance: 42,
      weatherQuality: 92,
      feasibilityMargin: 96,
      coverageEfficiency: 91,
      tradeoff: 'Fastest orbital insertion epoch; trade-off is reduced debris miss distance (4.2 km).',
      constraint: 'Debris Clearance (Conjunction Risk)',
      status: 'Dominated in Safety'
    },
    {
      candidate: 'CANDIDATE B',
      epoch: `${prefDate} +1d 10:30 UTC`,
      debrisClearance: 88,
      weatherQuality: 88,
      feasibilityMargin: 94,
      coverageEfficiency: Math.round(covPct),
      tradeoff: 'Non-dominated Pareto optimum; 14h phase offset clears debris band while preserving 97% swath.',
      constraint: 'None (Balanced Non-Dominated)',
      status: 'Non-Dominated (Recommended)'
    },
    {
      candidate: 'CANDIDATE C',
      epoch: `${prefDate} +2d 14:15 UTC`,
      debrisClearance: 74,
      weatherQuality: 78,
      feasibilityMargin: 82,
      coverageEfficiency: 95,
      tradeoff: 'Zero solar wind drag; trade-off is higher delta-V propellant consumption (+6.2%).',
      constraint: 'Propulsion Margin (Delta-V Reserve)',
      status: 'Non-Dominated Alternative'
    }
  ];

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-cyan-500/40 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-cyan-300 font-bold mb-1.5">{label}</p>
          {payload.map((item, index) => (
            <div key={index} className="flex justify-between gap-4 py-0.5" style={{ color: item.color }}>
              <span>{item.name}:</span>
              <span className="font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6">
      {/* SECTION 1: 4 AGENTS CONVERGING INTO CENTRAL ORCHESTRATOR NODE (FIGURE 8) */}
      <div className="bg-black/75 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl hud-corner-ticks relative overflow-hidden">
        {/* Figure Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]" />
            <span className="font-bold text-white tracking-wider uppercase">
              FIGURE 8: DECISION SYNTHESIS — MULTI-DOMAIN AGENTS CONVERGING INTO ORCHESTRATOR
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px]">
            PARETO CONVERGENCE
          </span>
        </div>

        {/* 4 Agent Convergence Architecture Visual Flow */}
        <div className="relative max-w-4xl mx-auto py-2">
          {/* Top Row: 4 Autonomous Domain Agents */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            {/* Agent 1: Debris */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-rose-500/40 text-center shadow-lg relative">
              <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-[10px] uppercase mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Orbital Debris</span>
              </div>
              <span className="text-sm font-bold text-amber-300 block">
                {debris.risk_level || 'MEDIUM'} Risk
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {debris.nearby_objects || 12} proximate objects
              </span>
            </div>

            {/* Agent 2: Space Weather */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 text-center shadow-lg relative">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase mb-1">
                <SunMedium className="w-3.5 h-3.5" />
                <span>Space Weather</span>
              </div>
              <span className="text-sm font-bold text-emerald-400 block">
                Kp {weather.kp_index || 3.2} (Quiet)
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Nominal solar flux
              </span>
            </div>

            {/* Agent 3: Feasibility */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-center shadow-lg relative">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-bold text-[10px] uppercase mb-1">
                <Wrench className="w-3.5 h-3.5" />
                <span>Feasibility</span>
              </div>
              <span className="text-sm font-bold text-cyan-300 block">
                FEASIBLE ✓
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                +13.5% Δv reserve
              </span>
            </div>

            {/* Agent 4: Coverage */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-center shadow-lg relative">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase mb-1">
                <Satellite className="w-3.5 h-3.5" />
                <span>Coverage</span>
              </div>
              <span className="text-sm font-bold text-cyan-300 block">
                {covPct}% Swath
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                110 min revisit cycle
              </span>
            </div>
          </div>

          {/* Convergence Arrows SVG */}
          <div className="h-10 w-full flex items-center justify-center select-none">
            <svg viewBox="0 0 600 40" className="w-full h-full">
              <path d="M 80 5 L 280 35" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              <path d="M 220 5 L 290 35" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              <path d="M 380 5 L 310 35" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              <path d="M 520 5 L 320 35" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
              <polygon points="300,38 294,30 306,30" fill="#00f2fe" />
            </svg>
          </div>

          {/* Central Orchestrator Node */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-cyan-950/80 to-slate-950 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,242,254,0.2)] text-center relative font-mono">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-cyan-400" />
              <span className="text-base sm:text-lg font-bold text-white tracking-wider uppercase">
                MISSION ORCHESTRATION ENGINE (PARETO ARBITRATION)
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
              Synthesizing 4 domain telemetry vectors via non-dominated multi-objective sorting. Eliminating dominated epochs and outputting candidate trade-off frontier.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px]">
              <span className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-slate-300">
                INPUT VECTORS: <strong className="text-cyan-300">4 AGENTS</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-slate-300">
                SEARCH SPACE: <strong className="text-white">24 CANDIDATE EPOCHS</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                NON-DOMINATED: 3 CANDIDATES
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PARETO-BASED ARBITRATION PIPELINE (FIGURE COMPONENT) */}
      <div className="bg-slate-950/85 border border-white/10 rounded-xl p-4 shadow-xl font-mono">
        <div className="flex items-center justify-between mb-3 text-xs border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              PARETO ARBITRATION PIPELINE
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Formal Multi-Objective Method</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-black/60 border border-white/10">
            <span className="text-[9px] text-cyan-400 font-bold uppercase block mb-1">STAGE 1</span>
            <div className="text-xs font-bold text-white">CANDIDATE SPACE</div>
            <span className="text-[10px] text-slate-400 block mt-1">N = 24 Launch Epochs (±3 days)</span>
          </div>

          <div className="p-3 rounded-lg bg-black/60 border border-cyan-500/40">
            <span className="text-[9px] text-cyan-400 font-bold uppercase block mb-1">STAGE 2</span>
            <div className="text-xs font-bold text-cyan-300">PARETO FILTER</div>
            <span className="text-[10px] text-slate-400 block mt-1">Multi-criteria dominance checks</span>
          </div>

          <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/40">
            <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">STAGE 3</span>
            <div className="text-xs font-bold text-emerald-300">NON-DOMINATED SET</div>
            <span className="text-[10px] text-slate-400 block mt-1">Candidates A, B, C frontier</span>
          </div>

          <div className="p-3 rounded-lg bg-black/60 border border-amber-500/40">
            <span className="text-[9px] text-amber-400 font-bold uppercase block mb-1">STAGE 4</span>
            <div className="text-xs font-bold text-amber-300">HUMAN REVIEW</div>
            <span className="text-[10px] text-slate-400 block mt-1">Flight director final signoff</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: LAUNCH-WINDOW TRADE-OFF COMPARISON CHART (FIGURE 9) */}
      <div className="bg-black/75 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl hud-corner-ticks relative overflow-hidden font-mono">
        {/* Figure Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 text-xs gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]" />
            <span className="font-bold text-white tracking-wider uppercase">
              FIGURE 9: LAUNCH-WINDOW MULTI-OBJECTIVE TRADE-OFF COMPARISON CHART
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            X: Candidate Windows | Y: Normalized Objectives (0-100%)
          </span>
        </div>

        {/* Bar Chart comparing normalized objectives for Candidates A, B, C */}
        <div className="h-64 sm:h-72 w-full my-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={candidateData}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="candidate" stroke="#64748b" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />
              <Bar dataKey="debrisClearance" name="Debris Clearance (Safety)" fill="#10b981" radius={[3, 3, 0, 0]} barSize={18} />
              <Bar dataKey="weatherQuality" name="Weather Suitability" fill="#00f2fe" radius={[3, 3, 0, 0]} barSize={18} />
              <Bar dataKey="feasibilityMargin" name="Feasibility Margin" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={18} />
              <Bar dataKey="coverageEfficiency" name="Target Coverage %" fill="#38bdf8" radius={[3, 3, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Structured Trade-Offs & Dominant Constraints Table */}
        <div className="mt-4 pt-3 border-t border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 text-slate-400 uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Candidate Window</th>
                <th className="py-2.5 px-3">Launch Epoch</th>
                <th className="py-2.5 px-3">Objective Trade-Offs</th>
                <th className="py-2.5 px-3">Dominant Constraint</th>
                <th className="py-2.5 px-3 text-center">Pareto Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {candidateData.map((cand) => (
                <tr
                  key={cand.candidate}
                  className={`hover:bg-white/5 transition cursor-pointer ${
                    selectedCandidate === cand.candidate ? 'bg-cyan-950/30' : ''
                  }`}
                  onClick={() => setSelectedCandidate(cand.candidate)}
                >
                  <td className="py-3 px-3 font-bold text-white">{cand.candidate}</td>
                  <td className="py-3 px-3 text-cyan-300">{cand.epoch}</td>
                  <td className="py-3 px-3 text-slate-300 text-[11px] max-w-xs">{cand.tradeoff}</td>
                  <td className="py-3 px-3 text-amber-300 text-[11px]">{cand.constraint}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      cand.status.includes('Recommended')
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        : cand.status.includes('Alternative')
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900 text-slate-400 border-white/10'
                    }`}>
                      {cand.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
