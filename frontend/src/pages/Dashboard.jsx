import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, SunMedium, Wrench, Satellite,
  Compass, Award, ArrowRight, Layers, Cpu, CheckCircle2, ChevronRight,
  Sparkles, Radio, Activity, HelpCircle, ShieldCheck, Terminal,
  Globe2, Rocket, ArrowDownRight, Clock, Zap, Target, Gauge, Eye
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import RiskCard from '../components/RiskCard';
import AgentCard from '../components/AgentCard';
import MissionCharts from '../components/MissionCharts';
import MissionMap from '../components/MissionMap';
import StarfieldCanvas from '../components/StarfieldCanvas';
import AgentSystemTopology from '../components/AgentSystemTopology';

// Space background imagery
import earthHeroImg from '../assets/images/earth_orbit_hero.jpg';
import rocketLaunchImg from '../assets/images/rocket_launch_pad.jpg';
import satelliteFootprintImg from '../assets/images/coverage_footprint.jpg';
import debrisBgImg from '../assets/images/debris_orbital_shell.jpg';

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
   * STATE 1: NO ACTIVE MISSION (Cinematic Space Mission Control Landing)
   * ------------------------------------------------------------- */
  if (!activeMission) {
    return (
      <div className="space-y-16 sm:space-y-24 pb-16">
        <StarfieldCanvas count={90} opacity={0.65} />

        {/* SECTION 1: CINEMATIC HERO SECTION */}
        <section className="relative rounded-3xl overflow-hidden border border-space-700/80 shadow-2xl min-h-[580px] flex items-center">
          {/* High-res Realistic Earth Background with Vignette */}
          <div
            className="absolute inset-0 space-bg-hero"
            style={{
              backgroundImage: `url(${earthHeroImg})`,
              backgroundPosition: 'center 40%',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-space-950 via-space-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-transparent to-space-950/50" />

          {/* Foreground Hero Content */}
          <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-space-900/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-semibold tracking-wide">AUTONOMOUS MULTI-DOMAIN DECISION SUPPORT FRAMEWORK</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-tight">
                AMDSF
                <span className="block text-xl sm:text-3xl text-cyan-400 font-mono font-normal mt-1">
                  Space Mission Intelligence Platform
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-mono leading-relaxed max-w-2xl">
                Integrated intelligence for safer, smarter space mission planning. AMDSF orchestrates 4 independent AI domain agents across orbital conjunction assessment, space weather dynamics, propulsion feasibility, and regional ground revisit geometry.
              </p>
            </div>

            {/* Tactical CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/planning"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>START MISSION PLANNING</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <a
                href="#agent-network"
                className="px-6 py-3.5 rounded-xl bg-space-900/80 hover:bg-space-850 text-slate-200 border border-space-700 font-mono text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md transition cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>EXPLORE SYSTEM</span>
              </a>
            </div>

            {/* Live Status Tickers */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-space-800/80 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ALL AGENTS OPERATIONAL</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>REAL-TIME TELEMETRY</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>CROSS-DOMAIN ARBITRATION</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE 4 INTELLIGENCE DOMAINS */}
        <section id="agent-network" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-space-800 gap-2">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
                <Cpu className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-wider">DOMAIN SPECIALIZATION</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
                4 Autonomous Intelligence Evaluators
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Modular Multi-Agent Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AgentCard
              icon={ShieldAlert}
              title="Orbital Debris Intelligence"
              domain="Space Situational Awareness"
              status="Ready"
              metricLabel="Primary Capability"
              metricValue="Conjunction Modeling"
              metricColor="emerald"
              summary="Conjunction and orbital collision risk analysis via CelesTrak / LeoLabs catalog proximity vectors."
              linkTo="/debris"
              tag="CelesTrak / SSN"
            />

            <AgentCard
              icon={SunMedium}
              title="Space Weather Intelligence"
              domain="Heliophysics Dynamics"
              status="Ready"
              metricLabel="Primary Capability"
              metricValue="Solar & Kp Flux"
              metricColor="emerald"
              summary="Solar and geomagnetic condition analysis via NOAA SWPC & NASA DONKI coronal event telemetry."
              linkTo="/weather"
              tag="NOAA / NASA DONKI"
            />

            <AgentCard
              icon={Wrench}
              title="Mission Feasibility"
              domain="Propulsion & Staging"
              status="Ready"
              metricLabel="Primary Capability"
              metricValue="Delta-V Staging"
              metricColor="emerald"
              summary="Launch vehicle envelope, payload mass fraction, propulsion Delta-V budget, and lifecycle cost."
              linkTo="/feasibility"
              tag="Vehicle Dynamics"
            />

            <AgentCard
              icon={Satellite}
              title="Coverage Intelligence"
              domain="Ground Geometry"
              status="Ready"
              metricLabel="Primary Capability"
              metricValue="Swath & Population"
              metricColor="emerald"
              summary="Ground track revisit modeling, optical/RF swath geometry, elevation masks, and demographic reach."
              linkTo="/coverage"
              tag="Planetary Geometry"
            />
          </div>
        </section>

        {/* SECTION 3: SYSTEM TOPOLOGY & DATA FLOW */}
        <section className="scroll-mt-24">
          <AgentSystemTopology
            mission={{
              mission_name: "Multi-Domain Space Flight Architecture",
              target: { area: "Configured Observation Target", country: "Global" },
              orbit: { altitude_km: 550 }
            }}
            analysisResults={{
              debris: { risk_level: "LOW", objects_analyzed: 8420, summary: "Orbital conjunction risk assessed across target altitude." },
              weather: { risk_level: "LOW", kp_index: 3.2, solar_activity: "QUIET", summary: "Solar flux and geomagnetic conditions nominal." },
              feasibility: { feasible: true, estimated_cost_m: 16.0, launch_vehicle: "Small-Lift I", summary: "Delta-V budget and mass margins verified." },
              coverage: { coverage_percent: 93.8, revisit_time_minutes: 110, summary: "Ground swath and demographic revisit verified." },
              orchestrator: {
                recommendation: {
                  launch_window: "Recommended Window: Optimal Meteorological Epoch",
                  readiness: 88,
                  risk_level: "LOW-MEDIUM"
                }
              }
            }}
            analysisStatus={{
              debris: 'READY',
              weather: 'READY',
              feasibility: 'READY',
              coverage: 'READY'
            }}
          />
        </section>

        {/* SECTION 4: REALISTIC ROCKET LAUNCH & OPERATIONS SECTION */}
        <section className="relative rounded-2xl overflow-hidden border border-space-700/80 shadow-2xl min-h-[420px] flex items-center">
          <div
            className="absolute inset-0 space-bg-hero"
            style={{
              backgroundImage: `url(${rocketLaunchImg})`,
              backgroundPosition: 'center 30%',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-space-950 via-space-950/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-transparent to-space-950/40" />

          <div className="relative z-10 p-6 sm:p-12 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Rocket className="w-3.5 h-3.5 text-cyan-400" />
              <span>FLIGHT SEQUENCE VALIDATION</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight leading-tight">
              From Mission Plan to Launch Decision
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
              Space mission failures frequently stem from isolated domain silos. AMDSF unifies telemetry, orbital mechanics, space situational awareness, and space weather into one cohesive, explainable decision pipeline.
            </p>

            {/* Step Sequence Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
              <div className="bg-space-900/90 border border-space-700 p-3 rounded-lg">
                <span className="text-cyan-400 font-bold block">01. PARAMETERS</span>
                <span className="text-[11px] text-slate-300">Target, Orbit, Mass</span>
              </div>
              <div className="bg-space-900/90 border border-space-700 p-3 rounded-lg">
                <span className="text-amber-400 font-bold block">02. RISK ANALYSIS</span>
                <span className="text-[11px] text-slate-300">Debris, Weather, Cost</span>
              </div>
              <div className="bg-space-900/90 border border-space-700 p-3 rounded-lg">
                <span className="text-blue-400 font-bold block">03. EVALUATION</span>
                <span className="text-[11px] text-slate-300">Pareto Trade-Offs</span>
              </div>
              <div className="bg-space-900/90 border border-space-700 p-3 rounded-lg">
                <span className="text-emerald-400 font-bold block">04. DECISION</span>
                <span className="text-[11px] text-slate-300">Optimal Launch Window</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/planning"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer"
              >
                <span>Launch Mission Planning Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 5: OPERATIONAL PHILOSOPHY / HUMAN-IN-THE-LOOP DISCLAIMER */}
        <section className="p-6 rounded-xl border border-space-800 bg-space-900/60 font-mono text-xs text-slate-400 text-center max-w-3xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-semibold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>DECISION-SUPPORT ARCHITECTURE NOTICE</span>
          </div>
          <p className="leading-relaxed">
            AMDSF provides automated analytical reasoning and Pareto-optimal launch window recommendations. All flight maneuvers, countdown authorizations, and spacecraft commands remain strictly under human flight director control.
          </p>
        </section>
      </div>
    );
  }

  /* -------------------------------------------------------------
   * STATE 2: ACTIVE MISSION EXISTS (Tactical Flight Operations Console)
   * ------------------------------------------------------------- */
  return (
    <div className="space-y-6 pb-12">
      <StarfieldCanvas count={60} opacity={0.4} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-space-700/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              Mission Operations Console
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
            <span>Reconfigure</span>
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
      <div className="bg-space-900 border border-cyan-500/30 rounded-xl p-4 font-mono text-xs shadow-lg hud-corner-ticks">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Area</span>
            <span className="text-white font-bold block truncate">{mission.target?.area || mission.target?.region}</span>
            <span className="text-[10px] text-slate-400">{mission.target?.country} ({mission.target?.latitude}°N, {mission.target?.longitude}°E)</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Orbit Regime</span>
            <span className="text-cyan-300 font-bold block">{mission.orbit?.type} — {mission.orbit?.altitude_km} km</span>
            <span className="text-[10px] text-slate-400">{mission.orbit?.inclination_deg}° Inclination</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Spaceport Facility</span>
            <span className="text-white font-bold block truncate">{mission.launch?.site}</span>
            <span className="text-[10px] text-slate-400">{mission.launch?.country}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Preferred Epoch</span>
            <span className="text-emerald-400 font-bold block">{mission.constraints?.preferred_launch_date}</span>
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
          <div className="lg:col-span-7 bg-space-900/90 border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-col justify-between hud-corner-ticks">
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

          <div className="lg:col-span-5 bg-gradient-to-b from-space-850 to-space-900 border border-cyan-500/40 rounded-xl p-5 shadow-2xl flex flex-col justify-between hud-corner-ticks">
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
