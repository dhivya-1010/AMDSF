import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, SunMedium, Wrench, Satellite,
  Compass, Award, ArrowRight, Layers, Cpu, CheckCircle2, ChevronRight,
  Sparkles, Radio, Activity, HelpCircle, ShieldCheck
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import RiskCard from '../components/RiskCard';
import AgentCard from '../components/AgentCard';
import MissionCharts from '../components/MissionCharts';
import MissionMap from '../components/MissionMap';

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
   * STATE 1: NO ACTIVE MISSION (Landing / Overview Page)
   * ------------------------------------------------------------- */
  if (!activeMission) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-space-900 via-space-900 to-space-950 border border-space-700/80 rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Autonomous Decision Support Architecture</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight leading-tight">
              AMDSF Mission Intelligence Platform
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Integrated multi-domain space mission analysis and decision support. 
              AMDSF orchestrates 4 independent AI domain agents across orbital conjunction assessment, 
              space weather dynamics, propulsion feasibility, and regional ground revisit geometry.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/planning"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition"
              >
                <Layers className="w-4 h-4" />
                <span>New Mission Planning</span>
              </Link>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-space-850/80 border border-space-700 text-xs font-mono text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>All intelligence services operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Four Intelligence Domain Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-space-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                Intelligence Domains
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">4 Ready Evaluator Services</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AgentCard
              icon={ShieldAlert}
              title="Orbital Debris Intelligence"
              domain="Space Situational Awareness"
              status="Ready"
              metricLabel="Capability"
              metricValue="Conjunction Analysis"
              metricColor="emerald"
              summary="Conjunction and orbital risk analysis via CelesTrak / LeoLabs catalog proximity modeling."
              linkTo="/debris"
              tag="SSA"
            />

            <AgentCard
              icon={SunMedium}
              title="Space Weather Intelligence"
              domain="Heliophysics Dynamics"
              status="Ready"
              metricLabel="Capability"
              metricValue="Solar & Drag Flux"
              metricColor="emerald"
              summary="Solar and geomagnetic condition analysis via NOAA SWPC & NASA DONKI event monitoring."
              linkTo="/weather"
              tag="NOAA / DONKI"
            />

            <AgentCard
              icon={Wrench}
              title="Mission Feasibility"
              domain="Propulsion & Staging"
              status="Ready"
              metricLabel="Capability"
              metricValue="Vehicle Staging"
              metricColor="emerald"
              summary="Launch, payload, orbit and budget assessment with Delta-V capacity validation."
              linkTo="/feasibility"
              tag="Propulsion"
            />

            <AgentCard
              icon={Satellite}
              title="Coverage Intelligence"
              domain="Ground Geometry"
              status="Ready"
              metricLabel="Capability"
              metricValue="Swath & Revisit"
              metricColor="emerald"
              summary="Ground coverage and revisit analysis calculating footprint area reach and population access."
              linkTo="/coverage"
              tag="Geometry"
            />
          </div>
        </div>

        {/* How AMDSF Works Workflow */}
        <div className="bg-space-900/80 border border-space-700/80 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-space-700/60 mb-6">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
              AMDSF Multi-Agent Workflow
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="bg-space-850 p-4 rounded-xl border border-space-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center mb-3">
                  01
                </div>
                <h4 className="text-xs font-mono font-bold uppercase text-white mb-1">
                  Mission Definition
                </h4>
                <p className="text-xs text-slate-300">
                  Specify target coordinates, spaceport facility, orbit mechanics, and lifecycle constraints.
                </p>
              </div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center mb-3">
                  02
                </div>
                <h4 className="text-xs font-mono font-bold uppercase text-white mb-1">
                  Domain Intelligence
                </h4>
                <p className="text-xs text-slate-300">
                  4 specialized models evaluate telemetry, solar indices, Delta-V limits, and ground revisit access.
                </p>
              </div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center mb-3">
                  03
                </div>
                <h4 className="text-xs font-mono font-bold uppercase text-white mb-1">
                  Cross-Domain Reasoning
                </h4>
                <p className="text-xs text-slate-300">
                  Mission Orchestrator identifies multi-objective trade-offs and resolves trajectory conflicts.
                </p>
              </div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center mb-3">
                  04
                </div>
                <h4 className="text-xs font-mono font-bold uppercase text-white mb-1">
                  Explainable Recommendation
                </h4>
                <p className="text-xs text-slate-300">
                  Provides recommended launch window, quantified flight readiness, and pre-launch risk mitigations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * STATE 2: ACTIVE MISSION EXISTS (Mission Intelligence Dashboard)
   * ------------------------------------------------------------- */
  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-space-700/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              Mission Intelligence Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Active Mission: <strong className="text-cyan-300">{mission.mission_name}</strong> [{mission.mission_id}]
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/planning"
            className="px-4 py-2 rounded-lg bg-space-850 hover:bg-space-800 text-slate-200 border border-space-700 text-xs font-mono font-bold flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Mission</span>
          </Link>
          <Link
            to="/recommendation"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-md shadow-cyan-500/20 flex items-center gap-2 transition"
          >
            <Award className="w-4 h-4" />
            <span>Recommendation</span>
          </Link>
        </div>
      </div>

      {/* Active Mission Parameter Summary Bar */}
      <div className="bg-space-900 border border-cyan-500/30 rounded-xl p-4 font-mono text-xs shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Target Area</span>
            <span className="text-white font-bold block truncate">{mission.target?.area || mission.target?.region}</span>
            <span className="text-[10px] text-slate-500">{mission.target?.country} ({mission.target?.latitude}°N, {mission.target?.longitude}°E)</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Orbit Regime</span>
            <span className="text-cyan-300 font-bold block">{mission.orbit?.type} — {mission.orbit?.altitude_km} km</span>
            <span className="text-[10px] text-slate-500">{mission.orbit?.inclination_deg}° Inclination</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Launch Spaceport</span>
            <span className="text-white font-bold block truncate">{mission.launch?.site}</span>
            <span className="text-[10px] text-slate-500">{mission.launch?.country}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Preferred Epoch</span>
            <span className="text-emerald-400 font-bold block">{mission.constraints?.preferred_launch_date}</span>
            <span className="text-[10px] text-slate-500">±{mission.constraints?.launch_window_flexibility_days}d flexibility</span>
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

      {/* Domain Agent Status & Findings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
              Domain Agent Status & Findings
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Linked to Mission ID: {mission.mission_id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AgentCard
            icon={ShieldAlert}
            title="Orbital Debris Agent"
            domain="Space Situational Awareness"
            status={analysisStatus.debris}
            metricLabel="Conjunction Risk"
            metricValue={debris.risk_level || (analysisStatus.debris === 'COMPLETED' ? 'Evaluated' : 'Ready')}
            metricColor={debris.risk_level?.toLowerCase() || 'emerald'}
            summary={debris.summary || `Configured for ${mission.orbit?.altitude_km}km / ${mission.orbit?.inclination_deg}° orbit.`}
            linkTo="/debris"
            tag="CelesTrak"
          />

          <AgentCard
            icon={SunMedium}
            title="Space Weather Agent"
            domain="Heliophysics & Solar Flux"
            status={analysisStatus.weather}
            metricLabel="Solar & Kp State"
            metricValue={weather.solar_activity || (analysisStatus.weather === 'COMPLETED' ? `Kp ${weather.kp_index}` : 'Ready')}
            metricColor={weather.risk_level?.toLowerCase() || 'emerald'}
            summary={weather.summary || `Evaluating space weather conditions for ${mission.launch?.site}.`}
            linkTo="/weather"
            tag="NOAA / DONKI"
          />

          <AgentCard
            icon={Wrench}
            title="Mission Feasibility"
            domain="Propulsion & Staging"
            status={analysisStatus.feasibility}
            metricLabel="Feasibility"
            metricValue={feasibility.feasible !== undefined ? (feasibility.feasible ? 'FEASIBLE' : 'OVER BUDGET') : 'Ready'}
            metricColor={feasibility.feasible ? 'emerald' : 'rose'}
            summary={feasibility.summary || `Assessing payload (${mission.mission?.payload_mass_kg}kg) against budget ($${mission.mission?.budget_musd}M).`}
            linkTo="/feasibility"
            tag="Staging"
          />

          <AgentCard
            icon={Satellite}
            title="Coverage Agent"
            domain="Ground Geometry"
            status={analysisStatus.coverage}
            metricLabel="Target Coverage"
            metricValue={coverage.coverage_percent ? `${coverage.coverage_percent}%` : 'Ready'}
            metricColor="cyan"
            summary={coverage.summary || `Configured for ${mission.target?.area} (${mission.target?.latitude}°N, ${mission.target?.longitude}°E).`}
            linkTo="/coverage"
            tag="Geometry"
          />
        </div>
      </div>

      {/* Orchestration Synthesis & Trade-Offs (if analyzed) */}
      {hasAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-space-900/90 border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-space-700/60 mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                    Mission Orchestrator Reasoning
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                  Synthesized
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-space-950/80 p-3 rounded-lg border border-space-800 text-slate-300">
                  <span className="text-cyan-400 font-bold uppercase block mb-1">Arbitration Strategy:</span>
                  <p className="italic text-slate-200">"{orchestrator.resolution_strategy}"</p>
                </div>

                <div className="space-y-1 text-slate-300">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">Key Factors:</span>
                  {recommendation.reasoning?.slice(0, 3).map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-space-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">View complete multi-domain evidence:</span>
              <Link
                to="/recommendation"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold font-mono flex items-center gap-1"
              >
                <span>Full Recommendation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-b from-space-850 to-space-900 border border-cyan-500/40 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-space-700/60 mb-3">
                <div className="text-[11px] text-slate-400 uppercase font-mono font-semibold">
                  Recommended Launch Epoch
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  {recommendation.risk_level} RISK
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mb-3">
                {recommendation.launch_window}
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-3 font-mono text-xs">
                <div className="bg-space-950/80 p-2.5 rounded-lg border border-space-700">
                  <span className="text-[10px] text-slate-400 block uppercase">Flight Readiness</span>
                  <span className="text-lg font-bold text-emerald-400">{recommendation.readiness}%</span>
                </div>
                <div className="bg-space-950/80 p-2.5 rounded-lg border border-space-700">
                  <span className="text-[10px] text-slate-400 block uppercase">Target Swath</span>
                  <span className="text-lg font-bold text-cyan-300">{coverage.coverage_percent}%</span>
                </div>
              </div>

              {recommendation.tradeoffs && recommendation.tradeoffs.length > 0 && (
                <div className="bg-space-950/60 p-2.5 rounded-lg border border-space-800 text-[11px] text-amber-200/90 mb-2 font-mono">
                  <span className="font-bold text-amber-300">Trade-Off: </span>
                  {recommendation.tradeoffs[0]}
                </div>
              )}
            </div>

            <Link
              to="/recommendation"
              className="w-full mt-3 py-2 px-3 rounded-lg bg-space-800 hover:bg-space-700 text-cyan-300 text-xs font-semibold font-mono border border-space-600 flex items-center justify-center gap-2 transition"
            >
              <span>Explainable Decision Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Map & Charts */}
      {hasAnalysis && orchestrator.map_data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-space-800">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
              Orbital Ground Track & Conjunction Geometry
            </h2>
            <span className="text-xs font-mono text-slate-400">Target Centered: {mission.target?.area}</span>
          </div>

          <MissionMap
            mapData={orchestrator.map_data}
            missionName={mission.mission_name}
          />

          {orchestrator.chart_data && <MissionCharts chartData={orchestrator.chart_data} />}
        </div>
      )}

    </div>
  );
}
