import React from 'react';

export default function OrchestrationFlowVisualization({ orchestrator = {}, analysisResults = {} }) {
  const recommendation = orchestrator?.recommendation || analysisResults?.recommendation || {};
  const evidence = recommendation.supporting_evidence || [];
  const failedChecks = recommendation.failed_or_unavailable_checks || [];
  const riskFactors = recommendation.risk_factors || [];
  const nextActions = recommendation.required_next_actions || recommendation.mitigation || [];
  const freshness = recommendation.data_freshness || {};

  const agents = [
    [
      'Debris SSA',
      analysisResults.debris?.risk_level || 'NOT RUN',
      analysisResults.debris?.data_mode || '—',
    ],
    [
      'Space Weather',
      analysisResults.weather?.risk_level || 'NOT RUN',
      analysisResults.weather?.data_mode || '—',
    ],
    [
      'Feasibility',
      analysisResults.feasibility?.budget_status || analysisResults.feasibility?.status || 'NOT RUN',
      analysisResults.feasibility?.launch_vehicle || '—',
    ],
    [
      'Coverage',
      analysisResults.coverage?.coverage_percent != null
        ? `${analysisResults.coverage.coverage_percent}%`
        : analysisResults.coverage?.status || 'NOT RUN',
      analysisResults.coverage?.data_mode || '—',
    ],
  ];

  return (
    <div className="w-full space-y-4 font-mono">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {agents.map(([name, value, sub]) => (
          <div key={name} className="rounded-xl border border-white/10 bg-slate-950/85 p-4">
            <div className="text-[10px] text-slate-400 uppercase">{name}</div>
            <div className="text-white font-bold mt-1 text-sm">{value}</div>
            <div className="text-[10px] text-cyan-300 mt-1 truncate" title={sub}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-slate-950/85 p-4 space-y-2">
          <div className="text-emerald-300 text-xs uppercase font-bold">Supporting Evidence ({evidence.length})</div>
          {evidence.length === 0 ? (
            <p className="text-xs text-slate-400">No validated domain evidence recorded yet.</p>
          ) : (
            <ul className="text-xs text-slate-200 space-y-1.5">
              {evidence.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-slate-950/85 p-4 space-y-2">
          <div className="text-amber-300 text-xs uppercase font-bold">Failed, Unavailable or Review Checks ({failedChecks.length})</div>
          {failedChecks.length === 0 ? (
            <p className="text-xs text-emerald-300">All domain verification checks passed cleanly.</p>
          ) : (
            <ul className="text-xs text-amber-200 space-y-1.5">
              {failedChecks.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-rose-500/30 bg-slate-950/85 p-4 space-y-2">
          <div className="text-rose-300 text-xs uppercase font-bold">Identified Risk Factors ({riskFactors.length})</div>
          {riskFactors.length === 0 ? (
            <p className="text-xs text-slate-400">No elevated cross-domain risk flags triggered.</p>
          ) : (
            <ul className="text-xs text-slate-200 space-y-1.5">
              {riskFactors.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-cyan-500/30 bg-slate-950/85 p-4 space-y-2">
          <div className="text-cyan-300 text-xs uppercase font-bold">Required Next Actions ({nextActions.length})</div>
          {nextActions.length === 0 ? (
            <p className="text-xs text-slate-400">Run mission orchestration to populate next actions.</p>
          ) : (
            <ul className="text-xs text-slate-200 space-y-1.5">
              {nextActions.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          )}
        </div>
      </div>

      {Object.keys(freshness).length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/60 p-3 text-[11px] text-slate-400 flex flex-wrap gap-4">
          <span>Debris: <strong className="text-slate-200">{freshness.debris?.mode}</strong> ({freshness.debris?.retrieved_at || '—'})</span>
          <span>Weather: <strong className="text-slate-200">{freshness.weather?.mode}</strong> ({freshness.weather?.swpc_retrieved_at || '—'})</span>
          <span>Coverage: <strong className="text-slate-200">{freshness.coverage?.mode}</strong> ({freshness.coverage?.orbit_source || '—'})</span>
          <span>Feasibility: <strong className="text-slate-200">{freshness.feasibility?.mode || '—'}</strong></span>
        </div>
      )}
    </div>
  );
}
