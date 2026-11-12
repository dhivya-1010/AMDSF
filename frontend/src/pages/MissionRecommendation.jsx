import React from 'react';
import { Award, RefreshCw, Play, UserCheck, ShieldCheck } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import BackgroundScene from '../components/BackgroundScene';
import OrchestrationFlowVisualization from '../components/OrchestrationFlowVisualization';
import MissionCharts from '../components/MissionCharts';
import NoActiveMissionState from '../components/NoActiveMissionState';
import ErrorState from '../components/ErrorState';

export default function MissionRecommendation() {
  const { activeMission, analysisResults, runFullAnalysis, loading, error } = useMission();

  const currentMission = activeMission;
  const results = analysisResults;
  const orchestrator = results?.orchestrator || results?.orchestration || {};
  const recommendation = results?.recommendation || orchestrator?.recommendation || {};
  const decision = recommendation?.decision;

  const badgeStyle =
    decision === 'GO'
      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
      : decision === 'CONDITIONAL GO'
      ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
      : 'bg-rose-950/80 border-rose-500/50 text-rose-300';

  return (
    <div className="relative min-h-screen">
      <BackgroundScene scene="horizon" overlayGradient="standard" />
      <StarfieldCanvas count={50} opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        {!currentMission ? (
          <NoActiveMissionState pageTitle="Mission Decision Support & Orchestrator" />
        ) : (
          <>
            <MissionContextBar mission={currentMission} activePage="recommendation" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/10 gap-3">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                  <Award className="w-4 h-4" />
                  <span className="font-semibold tracking-wider uppercase">ORCHESTRATED MULTI-DOMAIN SYNTHESIS</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide mt-0.5">
                  Mission Decision Support & Arbitration
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => runFullAnalysis(currentMission)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Orchestrating Agents...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Re-Run Orchestrator</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => runFullAnalysis(currentMission, 'demonstration')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold transition disabled:opacity-50"
                >
                  Orchestrate Offline Demo
                </button>
              </div>
            </div>

            {error && <ErrorState error={error} onRetry={() => runFullAnalysis(currentMission)} />}

            {/* HERO DECISION SUMMARY BADGE */}
            <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl hud-corner-ticks font-mono">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      DETERMINISTIC MISSION RECOMMENDATION
                    </span>
                    {decision && (
                      <span className={`px-3 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${badgeStyle}`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{decision}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {recommendation.launch_window || 'Click "Re-Run Orchestrator" to generate recommendation'}
                  </div>
                  {recommendation.reason && (
                    <p className="text-xs text-slate-300 max-w-2xl">{recommendation.reason}</p>
                  )}
                  <span className="text-xs text-slate-400 block">
                    Facility: <strong className="text-white">{currentMission.launch?.site || 'Configured Spaceport'}</strong> • Data Mode:{' '}
                    <strong className="text-cyan-300">{results?.data_mode || currentMission.constraints?.data_mode?.toUpperCase() || 'AUTO'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center min-w-[90px]">
                    <span className="text-[9px] text-slate-400 uppercase block">Readiness</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-400 block mt-0.5">
                      {recommendation.readiness ?? '—'}{recommendation.readiness != null ? '%' : ''}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center min-w-[110px]">
                    <span className="text-[9px] text-slate-400 uppercase block">Risk Level</span>
                    <span className="text-sm sm:text-lg font-bold text-amber-300 block mt-1">
                      {recommendation.risk_level || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <OrchestrationFlowVisualization
              orchestrator={orchestrator}
              mission={currentMission}
              analysisResults={results || {}}
            />

            {results?.chart_data && (
              <MissionCharts chartData={results.chart_data} />
            )}

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Human-in-the-Loop Flight Authority:</strong>{' '}
                  {recommendation.disclaimer || 'AMDSF operates strictly in an explainable decision-support capacity. Final launch authorization resides with the Flight Operations Director.'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
