import React from 'react';

export default function OrchestrationFlowVisualization({ orchestrator = {}, analysisResults = {} }) {
  const recommendation = orchestrator.recommendation || {};
  const agents = [
    ['Debris', analysisResults.debris?.risk_level || 'unavailable'],
    ['Weather', analysisResults.weather?.risk_level || 'unavailable'],
    ['Feasibility', analysisResults.feasibility?.status || 'unavailable'],
    ['Coverage', analysisResults.coverage?.status || 'unavailable'],
  ];
  return (
    <div className="w-full space-y-4 font-mono">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {agents.map(([name, value]) => <div key={name} className="rounded-xl border border-white/10 bg-slate-950/80 p-4"><div className="text-[10px] text-slate-400 uppercase">{name}</div><div className="text-white font-bold mt-2">{value}</div></div>)}
      </div>
      <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-5">
        <div className="text-cyan-300 text-xs uppercase font-bold">Rule-based synthesis</div>
        <div className="text-white text-lg mt-2">{recommendation.launch_window || 'Calculation pending'}</div>
        <div className="text-slate-300 text-sm mt-2">Readiness: {recommendation.readiness ?? '—'}{recommendation.readiness != null ? '%' : ''} • Risk: {recommendation.risk_level || '—'}</div>
        <ul className="mt-4 text-xs text-slate-400 space-y-1">{(recommendation.reasoning || ['No synthesis is available.']).map((item) => <li key={item}>• {item}</li>)}</ul>
      </div>
      <div className="text-[10px] text-slate-400">Launch-window comparison and map tracks are omitted unless calculated from actual domain outputs.</div>
    </div>
  );
}
