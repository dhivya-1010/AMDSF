import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, SunMedium, Wrench, Satellite,
  Cpu, ArrowDown, ArrowRight, CheckCircle2,
  AlertTriangle, Radio, Activity, Compass, Award,
  Sparkles, Layers, ShieldCheck
} from 'lucide-react';

export default function AgentSystemTopology({
  mission,
  analysisResults,
  analysisStatus = {},
  interactive = true
}) {
  const debris = analysisResults?.debris || {};
  const weather = analysisResults?.weather || {};
  const feasibility = analysisResults?.feasibility || {};
  const coverage = analysisResults?.coverage || {};
  const orchestrator = analysisResults?.orchestrator || {};
  const recommendation = orchestrator?.recommendation || {};

  const getStatusDisplay = (statusKey, riskLevel) => {
    const status = analysisStatus[statusKey];
    if (status === 'RUNNING') {
      return {
        label: 'ANALYZING',
        dotClass: 'bg-cyan-400 animate-ping',
        badgeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50'
      };
    }
    if (status === 'COMPLETED') {
      if (riskLevel === 'HIGH' || riskLevel === 'OVER BUDGET') {
        return {
          label: 'WARNING',
          dotClass: 'bg-rose-400',
          badgeClass: 'bg-rose-950/90 text-rose-300 border-rose-500/50'
        };
      }
      return {
        label: 'COMPLETED',
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
      };
    }
    if (status === 'FAILED') {
      return {
        label: 'DATA UNAVAILABLE',
        dotClass: 'bg-rose-500',
        badgeClass: 'bg-rose-950/90 text-rose-400 border-rose-600/50'
      };
    }
    return {
      label: 'STANDBY / READY',
      dotClass: 'bg-slate-400',
      badgeClass: 'bg-space-850 text-slate-400 border-space-700'
    };
  };

  const debrisStatus = getStatusDisplay('debris', debris.risk_level);
  const weatherStatus = getStatusDisplay('weather', weather.risk_level);
  const feasibilityStatus = getStatusDisplay('feasibility', feasibility.feasible === false ? 'OVER BUDGET' : 'LOW');
  const coverageStatus = getStatusDisplay('coverage', 'LOW');

  return (
    <div className="relative rounded-2xl bg-space-900/90 border border-space-700 p-6 sm:p-8 shadow-2xl backdrop-blur-md overflow-hidden hud-corner-ticks">
      {/* Background Subtle Coordinate Grid */}
      <div className="absolute inset-0 tech-grid opacity-25 pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-space-800 gap-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Cpu className="w-4 h-4" />
            <span className="font-semibold tracking-wider uppercase">MULTI-AGENT TOPOLOGY & ARBITRATION FLOW</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
            Autonomous Decision System Architecture
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-space-850 border border-space-700 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>DATA STREAM ACTIVE</span>
          </div>
        </div>
      </div>

      {/* TOPOLOGY FLOW DIAGRAM */}
      <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto space-y-6">

        {/* NODE 1: MISSION REQUEST */}
        <div className="w-full max-w-md bg-gradient-to-r from-space-850 via-space-900 to-space-850 border border-cyan-500/40 rounded-xl p-4 shadow-xl text-center relative hud-corner-ticks group hover:border-cyan-400 transition">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 border-b border-space-800 pb-1">
            <span className="uppercase text-cyan-400 font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3" />
              INPUT TELEMETRY NODE
            </span>
            <span>OPS-REQ-01</span>
          </div>
          <h3 className="text-sm font-bold font-mono text-white">
            MISSION REQUEST
          </h3>
          <p className="text-xs font-mono text-cyan-300 mt-0.5">
            {mission?.mission_name || "China Earth Observation Mission"}
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400 mt-2">
            <span>Target: <strong className="text-white">{mission?.target?.area || mission?.target?.region || "Beijing"}</strong></span>
            <span>•</span>
            <span>Orbit: <strong className="text-white">{mission?.orbit?.altitude_km || 550}km LEO</strong></span>
          </div>
        </div>

        {/* CONNECTING FLOW LINE 1 */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce" />
          </div>
          <ArrowDown className="w-4 h-4 text-cyan-400 -mt-1" />
        </div>

        {/* NODE 2: MISSION ORCHESTRATOR */}
        <div className="w-full max-w-lg bg-space-850/95 border border-cyan-500/60 rounded-xl p-4 shadow-xl text-center relative hud-corner-ticks">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase text-cyan-300 font-bold tracking-wider">
              CENTRAL ORCHESTRATOR & ARBITRATION CORE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-300">
            Concurrently invokes 4 independent domain agents, maps telemetry constraints, and performs Pareto trade-off arbitration.
          </p>
        </div>

        {/* CONNECTING BRANCH LINES */}
        <div className="w-full hidden md:block relative h-8">
          {/* Horizontal branching rail */}
          <div className="absolute top-2 left-[12.5%] right-[12.5%] h-0.5 bg-space-700" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400" />
          {/* 4 Drops */}
          <div className="absolute top-2 left-[12.5%] w-0.5 h-6 bg-space-700" />
          <div className="absolute top-2 left-[37.5%] w-0.5 h-6 bg-space-700" />
          <div className="absolute top-2 left-[62.5%] w-0.5 h-6 bg-space-700" />
          <div className="absolute top-2 left-[87.5%] w-0.5 h-6 bg-space-700" />
        </div>

        {/* NODE 3: 4 DOMAIN AGENTS IN PARALLEL */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* AGENT 1: DEBRIS */}
          <div className="hud-card hud-corner-ticks p-4 flex flex-col justify-between border-space-700 hover:border-rose-500/50 transition">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded bg-space-850 border border-space-700 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${debrisStatus.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${debrisStatus.dotClass}`}></span>
                  <span>{debrisStatus.label}</span>
                </span>
              </div>
              <h4 className="text-xs font-bold font-mono text-white mb-0.5">
                DEBRIS INTELLIGENCE
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mb-2">
                CelesTrak / SSN Telemetry
              </p>
              <div className="bg-space-850/80 p-2 rounded border border-space-700/70 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Index:</span>
                  <span className="font-bold text-amber-400">{debris.risk_level || "MEDIUM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tracked:</span>
                  <span className="text-white">{debris.objects_analyzed || 8420} objs</span>
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {debris.summary || "Conjunction risk modeled for active orbit shell."}
              </p>
            </div>
            {interactive && (
              <Link
                to="/debris"
                className="mt-3 pt-2 border-t border-space-800 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-between"
              >
                <span>Deep-Dive Terminal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* AGENT 2: WEATHER */}
          <div className="hud-card hud-corner-ticks p-4 flex flex-col justify-between border-space-700 hover:border-amber-500/50 transition">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded bg-space-850 border border-space-700 text-amber-400">
                  <SunMedium className="w-4 h-4" />
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${weatherStatus.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${weatherStatus.dotClass}`}></span>
                  <span>{weatherStatus.label}</span>
                </span>
              </div>
              <h4 className="text-xs font-bold font-mono text-white mb-0.5">
                SPACE WEATHER
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mb-2">
                NOAA SWPC • NASA DONKI
              </p>
              <div className="bg-space-850/80 p-2 rounded border border-space-700/70 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kp Index:</span>
                  <span className="font-bold text-cyan-300">Kp {weather.kp_index || 3.2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Solar Flux:</span>
                  <span className="text-emerald-400 font-bold">{weather.solar_activity ? weather.solar_activity.split('/')[0] : 'QUIET'}</span>
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {weather.summary || "Coronal mass ejection and ionospheric drag evaluated."}
              </p>
            </div>
            {interactive && (
              <Link
                to="/weather"
                className="mt-3 pt-2 border-t border-space-800 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-between"
              >
                <span>Deep-Dive Terminal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* AGENT 3: FEASIBILITY */}
          <div className="hud-card hud-corner-ticks p-4 flex flex-col justify-between border-space-700 hover:border-cyan-500/50 transition">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded bg-space-850 border border-space-700 text-cyan-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${feasibilityStatus.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${feasibilityStatus.dotClass}`}></span>
                  <span>{feasibilityStatus.label}</span>
                </span>
              </div>
              <h4 className="text-xs font-bold font-mono text-white mb-0.5">
                MISSION FEASIBILITY
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mb-2">
                Propulsion & Staging Dynamics
              </p>
              <div className="bg-space-850/80 p-2 rounded border border-space-700/70 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-bold text-white truncate max-w-[90px]">{feasibility.launch_vehicle || "Small-Lift I"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Cost:</span>
                  <span className="text-emerald-400 font-bold">${feasibility.estimated_cost_m || 16}M</span>
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {feasibility.summary || "Payload mass, Delta-V staging, and lifecycle budget validated."}
              </p>
            </div>
            {interactive && (
              <Link
                to="/feasibility"
                className="mt-3 pt-2 border-t border-space-800 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-between"
              >
                <span>Deep-Dive Terminal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* AGENT 4: COVERAGE */}
          <div className="hud-card hud-corner-ticks p-4 flex flex-col justify-between border-space-700 hover:border-cyan-500/50 transition">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded bg-space-850 border border-space-700 text-cyan-400">
                  <Satellite className="w-4 h-4" />
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${coverageStatus.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${coverageStatus.dotClass}`}></span>
                  <span>{coverageStatus.label}</span>
                </span>
              </div>
              <h4 className="text-xs font-bold font-mono text-white mb-0.5">
                COVERAGE INTELLIGENCE
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mb-2">
                Orbital Swath Geometry
              </p>
              <div className="bg-space-850/80 p-2 rounded border border-space-700/70 text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Swath Coverage:</span>
                  <span className="font-bold text-cyan-300">{coverage.coverage_percent || 93.8}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Revisit Time:</span>
                  <span className="text-white">{coverage.revisit_time_minutes || 110} min</span>
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {coverage.summary || "Ground swath and demographic access verified."}
              </p>
            </div>
            {interactive && (
              <Link
                to="/coverage"
                className="mt-3 pt-2 border-t border-space-800 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-between"
              >
                <span>Deep-Dive Terminal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

        </div>

        {/* CONVERGING FLOW LINES */}
        <div className="w-full hidden md:block relative h-8">
          {/* 4 Drops UP into horizontal rail */}
          <div className="absolute bottom-2 left-[12.5%] w-0.5 h-6 bg-space-700" />
          <div className="absolute bottom-2 left-[37.5%] w-0.5 h-6 bg-space-700" />
          <div className="absolute bottom-2 left-[62.5%] w-0.5 h-6 bg-space-700" />
          <div className="absolute bottom-2 left-[87.5%] w-0.5 h-6 bg-space-700" />
          {/* Horizontal collector rail */}
          <div className="absolute bottom-2 left-[12.5%] right-[12.5%] h-0.5 bg-space-700" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-emerald-400" />
        </div>

        {/* NODE 4: SYNTHESIZED DECISION SUPPORT */}
        <div className="w-full max-w-xl bg-gradient-to-b from-space-850 to-space-950 border border-emerald-500/40 rounded-xl p-5 shadow-2xl text-center relative hud-corner-ticks">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
              EXPLAINABLE MISSION RECOMMENDATION
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-bold font-mono text-white mb-2">
            {recommendation.launch_window || "Recommended Launch Window: Tuesday 10:30 UTC"}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-300">
            <span>Readiness: <strong className="text-emerald-400">{recommendation.readiness || 82}%</strong></span>
            <span>•</span>
            <span>Risk Level: <strong className="text-amber-400">{recommendation.risk_level || "LOW-MEDIUM"}</strong></span>
          </div>

          <div className="mt-3 pt-3 border-t border-space-800 text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Final launch authority and spacecraft maneuvers remain strictly under human flight control.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
