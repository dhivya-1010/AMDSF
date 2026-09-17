import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, SunMedium, Wrench, Satellite,
  Compass, Award, ArrowRight, Layers, Cpu, CheckCircle2, ChevronRight,
  Sparkles, Radio, Activity, HelpCircle, ShieldCheck, Terminal,
  Globe2, Rocket, ArrowDownRight, Clock, Zap, Target, Gauge, Eye,
  Sliders
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import RiskCard from '../components/RiskCard';
import AgentCard from '../components/AgentCard';
import MissionCharts from '../components/MissionCharts';
import MissionMap from '../components/MissionMap';
import StarfieldCanvas from '../components/StarfieldCanvas';
import AgentSystemTopology from '../components/AgentSystemTopology';
import BackgroundScene from '../components/BackgroundScene';
import CinematicScrollStory from '../components/CinematicScrollStory';

export default function Dashboard() {
  const { activeMission, analysisResults, analysisStatus, loading } = useMission();

  const hasAnalysis = Boolean(analysisResults && analysisResults.orchestrator);
  const mission = activeMission || analysisResults?.mission_definition || {};
  const debris = analysisResults?.debris || {};
  const weather = analysisResults?.weather || {};
  const feasibility = analysisResults?.feasibility || {};
  const coverage = analysisResults?.coverage || {};
  const orchestrator = analysisResults?.orchestrator || {};
  const recommendation = orchestrator?.recommendation || {};

  /* -------------------------------------------------------------
   * STATE 1: NO ACTIVE MISSION (Full Cinematic Space Experience)
   * ------------------------------------------------------------- */
  if (!activeMission) {
    return <CinematicScrollStory activeMission={activeMission} analysisResults={analysisResults} />;
  }

  /* -------------------------------------------------------------
   * STATE 2: ACTIVE MISSION EXISTS (Tactical Flight Operations Console)
   * ------------------------------------------------------------- */
  return (
    <div className="relative min-h-screen">
      {/* Full-Screen High-Resolution Space Background */}
      <BackgroundScene scene="orbit" overlayGradient="standard" />
      <StarfieldCanvas count={60} opacity={0.4} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-xl sm:text-3xl font-bold font-mono text-white tracking-wide">
                Mission Operations Console
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-mono">
              Active Flight Profile: <strong className="text-cyan-300">{mission.mission_name}</strong> [{mission.mission_id}]
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/planning"
              className="px-4 py-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-200 border border-white/10 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-xl transition hover:border-cyan-500/40"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reconfigure</span>
            </Link>
            <Link
              to="/recommendation"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition"
            >
              <Award className="w-4 h-4" />
              <span>Recommendation</span>
            </Link>
          </div>
        </div>

        {/* Active Mission Parameter Summary Bar */}
        <div className="hud-glass hud-corner-ticks p-4 font-mono text-xs shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Area</span>
              <span className="text-white font-bold block truncate text-sm mt-0.5">{mission.target?.area || mission.target?.region}</span>
              <span className="text-[10px] text-slate-400">{mission.target?.country} ({mission.target?.latitude}°N, {mission.target?.longitude}°E)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Orbit Regime</span>
              <span className="text-cyan-300 font-bold block text-sm mt-0.5">{mission.orbit?.type} — {mission.orbit?.altitude_km} km</span>
              <span className="text-[10px] text-slate-400">{mission.orbit?.inclination_deg}° Inclination</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Spaceport Facility</span>
              <span className="text-white font-bold block truncate text-sm mt-0.5">{mission.launch?.site}</span>
              <span className="text-[10px] text-slate-400">{mission.launch?.country}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Epoch</span>
              <span className="text-emerald-400 font-bold block text-sm mt-0.5">{mission.constraints?.preferred_launch_date}</span>
              <span className="text-[10px] text-slate-400">±{mission.constraints?.launch_window_flexibility_days}d flexibility</span>
            </div>
          </div>
        </div>

        {/* 4 Top KPI Cards from actual analysis if completed */}
        {hasAnalysis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RiskCard
              title="Overall Mission Risk"
              value={recommendation.risk_level}
              subtitle="Multi-domain synthesized index"
              level={recommendation.risk_level || 'medium'}
              icon={ShieldAlert}
            />
            <RiskCard
              title="Mission Readiness"
              value={`${recommendation.readiness}%`}
              subtitle="Pareto-optimal flight readiness"
              level="low"
              icon={Award}
            />
            <RiskCard
              title="Recommended Launch"
              value={recommendation.launch_window?.split('—')[0]?.trim()}
              subtitle={recommendation.launch_window?.split('—')[1]?.trim() || "Optimal Window"}
              level="low"
              icon={Compass}
            />
            <RiskCard
              title="Domain Agents"
              value="4 / 4 Completed"
              subtitle="All agent evaluations synthesized"
              level="low"
              icon={Cpu}
            />
          </div>
        )}

        {/* Multi-Agent Dynamic Topology */}
        <AgentSystemTopology
          mission={mission}
          analysisResults={analysisResults}
          analysisStatus={analysisStatus}
        />

        {/* Orchestration Synthesis & Trade-Offs (if analyzed) */}
        {hasAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 hud-glass hud-corner-ticks p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                      Mission Orchestrator Reasoning
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    Synthesized
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-black/50 p-3.5 rounded-xl border border-white/10 text-slate-300">
                    <span className="text-cyan-400 font-bold uppercase block mb-1 text-[11px]">Arbitration Strategy:</span>
                    <p className="italic text-slate-200 leading-relaxed">"{orchestrator.resolution_strategy}"</p>
                  </div>

                  <div className="space-y-1.5 text-slate-300 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">Key Factors:</span>
                    {recommendation.reasoning?.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">View complete multi-domain evidence:</span>
                <Link
                  to="/recommendation"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold font-mono flex items-center gap-1.5"
                >
                  <span>Full Recommendation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 hud-glass hud-corner-ticks p-6 flex flex-col justify-between border-cyan-500/40">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="text-[11px] text-slate-400 uppercase font-mono font-semibold">
                    Recommended Launch Epoch
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    {recommendation.risk_level} RISK
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mb-4">
                  {recommendation.launch_window}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-xs">
                  <div className="bg-black/50 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Flight Readiness</span>
                    <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{recommendation.readiness}%</span>
                  </div>
                  <div className="bg-black/50 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Target Swath</span>
                    <span className="text-xl font-bold text-cyan-300 mt-0.5 block">{coverage.coverage_percent}%</span>
                  </div>
                </div>

                {recommendation.tradeoffs && recommendation.tradeoffs.length > 0 && (
                  <div className="bg-black/50 p-3 rounded-xl border border-amber-500/30 text-[11px] text-amber-200/90 font-mono">
                    <span className="font-bold text-amber-300">Trade-Off: </span>
                    {recommendation.tradeoffs[0]}
                  </div>
                )}
              </div>

              <Link
                to="/recommendation"
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold font-mono border border-cyan-500/40 flex items-center justify-center gap-2 transition shadow-lg"
              >
                <span>Explainable Decision Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Map & Charts */}
        {hasAnalysis && orchestrator.map_data && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span>Orbital Ground Track & Conjunction Geometry</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">Target: {mission.target?.area}</span>
            </div>

            <MissionMap
              mapData={orchestrator.map_data}
              missionName={mission.mission_name}
            />

            {orchestrator.chart_data && <MissionCharts chartData={orchestrator.chart_data} />}
          </div>
        )}
      </div>
    </div>
  );
}
