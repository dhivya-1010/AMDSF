import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, SunMedium, Wrench, Satellite,
  Compass, Award, ArrowRight, Layers, Cpu, CheckCircle2, ChevronRight,
  Sparkles, Radio, Activity, HelpCircle, ShieldCheck
} from 'lucide-react';
import RiskCard from '../components/RiskCard';
import AgentCard from '../components/AgentCard';
import MissionCharts from '../components/MissionCharts';
import MissionMap from '../components/MissionMap';

export default function Dashboard({ analysisData, loading }) {
  const hasAnalysis = Boolean(analysisData && analysisData.orchestrator && analysisData.mission);

  const mission = analysisData?.mission || {};
  const debris = analysisData?.debris || {};
  const weather = analysisData?.weather || {};
  const feasibility = analysisData?.feasibility || {};
  const coverage = analysisData?.coverage || {};
  const orchestrator = analysisData?.orchestrator || {};
  const recommendation = orchestrator?.recommendation || {};

  /* -------------------------------------------------------------
   * STATE 1: NO ACTIVE MISSION / NO ANALYSIS (Landing & Overview)
   * ------------------------------------------------------------- */
  if (!hasAnalysis) {
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
              Agentic Multi-Domain Space Mission Decision Support Framework orchestrates independent AI domain agents 
              for orbital conjunction assessment, space weather dynamics, launch vehicle propulsion feasibility, and regional coverage access.
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
              domain="Space Situational Awareness (SSA)"
              status="Ready"
              metricLabel="Service Status"
              metricValue="Operational"
              metricColor="emerald"
              summary="Monitors CelesTrak cataloged objects and tracks proximate conjunction vectors in target orbital regimes."
              linkTo="/debris"
              tag="CelesTrak / LeoLabs"
            />

            <AgentCard
              icon={SunMedium}
              title="Space Weather Intelligence"
              domain="Heliophysics & Solar Flux"
              status="Ready"
              metricLabel="Service Status"
              metricValue="Operational"
              metricColor="emerald"
              summary="Monitors NOAA SWPC planetary Kp-indices, NASA DONKI CMEs, and ionospheric atmospheric drag inflation."
              linkTo="/weather"
              tag="NOAA / DONKI"
            />

            <AgentCard
              icon={Wrench}
              title="Mission Feasibility"
              domain="Launch Vehicle & Delta-V"
              status="Ready"
              metricLabel="Service Status"
              metricValue="Operational"
              metricColor="emerald"
              summary="Evaluates booster staging envelopes, payload-to-orbit Delta-V margins, and mission lifecycle budgets."
              linkTo="/feasibility"
              tag="Vehicle Catalog"
            />

            <AgentCard
              icon={Satellite}
              title="Coverage Intelligence"
              domain="Ground Geometry & Revisit"
              status="Ready"
              metricLabel="Service Status"
              metricValue="Operational"
              metricColor="emerald"
              summary="Calculates ground sensor footprint swath width, demographic population access, and revisit gap intervals."
              linkTo="/coverage"
              tag="Geometry Engine"
            />
          </div>
        </div>

        {/* How AMDSF Works Workflow */}
        <div className="bg-space-900/80 border border-space-700/80 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-space-700/60 mb-6">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
              How AMDSF Multi-Agent Architecture Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="bg-space-850 p-4 rounded-xl border border-space-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center mb-3">
                  01
                </div>
                <h4 className="text-xs font-mono font-bold uppercase text-white mb-1">
                  Mission Parameters
                </h4>
                <p className="text-xs text-slate-300">
                  Mission planner specifies payload mass, target altitude, budget, region, and candidate dates.
                </p>
              </div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center mb-3">
                  02
                </div>
                <h4 className="text-xs font-mono font-bold uppercase text-white mb-1">
                  Domain Agents
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
                  Mission Orchestrator identifies multi-objective trade-offs and resolves orbital slot conflicts.
                </p>
              </div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center mb-3">
                  04
                </div>
                <h4 className="text-xs font-mono font-bold uppercase text-white mb-1">
                  Explainable Decision
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
   * STATE 2: AFTER MISSION ANALYSIS (Analytical Dashboard)
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
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Active Mission: <strong className="text-white font-mono">{mission.mission_name || 'Evaluated Mission'}</strong> ({mission.target_orbit || 550} km LEO)
          </p>
        </div>

        <Link
          to="/planning"
          className="self-start md:self-auto px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-md shadow-cyan-500/20 flex items-center gap-2 transition"
        >
          <Layers className="w-4 h-4" />
          <span>New Mission Planning</span>
        </Link>
      </div>

      {/* 4 Top KPI Cards from actual analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RiskCard
          title="Overall Mission Risk"
          value={recommendation.risk_level || 'EVALUATED'}
          subtitle="Multi-domain synthesized index"
          level={recommendation.risk_level || 'medium'}
          icon={ShieldAlert}
        />
        <RiskCard
          title="Mission Readiness"
          value={recommendation.readiness !== undefined ? `${recommendation.readiness}%` : 'N/A'}
          subtitle="Pareto-optimal flight readiness"
          level="low"
          icon={Award}
        />
        <RiskCard
          title="Launch Window"
          value={recommendation.launch_window?.split('—')[0]?.trim() || 'Evaluated'}
          subtitle={recommendation.launch_window?.split('—')[1]?.trim() || 'Recommended Slot'}
          level="low"
          icon={Compass}
        />
        <RiskCard
          title="Active Domain Agents"
          value="4 / 4"
          subtitle="All agent services analyzed"
          level="low"
          icon={Cpu}
        />
      </div>

      {/* Section: Agent Intelligence (4 Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-space-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
              Agent Intelligence
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Autonomous Domain Evaluators</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AgentCard
            icon={ShieldAlert}
            title="Orbital Debris Agent"
            domain="Space Situational Awareness"
            status={debris.status || "Completed"}
            metricLabel="Conjunction Risk"
            metricValue={debris.risk_level || 'MEDIUM'}
            metricColor={debris.risk_level?.toLowerCase() || 'medium'}
            summary={debris.summary || "Monitoring cataloged objects for close orbital proximity."}
            linkTo="/debris"
            tag="CelesTrak"
          />

          <AgentCard
            icon={SunMedium}
            title="Space Weather Agent"
            domain="Heliophysics & Solar Dynamics"
            status={weather.status || "Completed"}
            metricLabel="Kp Index / Activity"
            metricValue={weather.solar_activity || `Kp ${weather.kp_index || 3.2}`}
            metricColor={weather.risk_level?.toLowerCase() || 'low'}
            summary={weather.summary || "Evaluating planetary Kp index and coronal mass ejections."}
            linkTo="/weather"
            tag="NOAA / DONKI"
          />

          <AgentCard
            icon={Wrench}
            title="Mission Feasibility"
            domain="Launch Vehicle & Delta-V"
            status={feasibility.status || "Completed"}
            metricLabel="Budget & Propulsion"
            metricValue={feasibility.feasible ? 'FEASIBLE' : 'OVER BUDGET'}
            metricColor={feasibility.feasible ? 'emerald' : 'rose'}
            summary={feasibility.summary || "Computing vehicle lift margins and budget constraints."}
            linkTo="/feasibility"
            tag="Estimate"
          />

          <AgentCard
            icon={Satellite}
            title="Coverage Agent"
            domain="Ground Geometry & Revisit"
            status={coverage.status || "Completed"}
            metricLabel="Target Coverage"
            metricValue={coverage.coverage_percent ? `${coverage.coverage_percent}%` : 'N/A'}
            metricColor="cyan"
            summary={coverage.summary || "Analyzing ground footprint and demographic access."}
            linkTo="/coverage"
            tag="Geometry"
          />
        </div>
      </div>

      {/* Section: Mission Orchestrator Flow & Recommendation Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Mission Orchestrator Visual Flow */}
        <div className="lg:col-span-7 bg-space-900/90 border border-cyan-500/40 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-space-700/60 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                  Mission Orchestrator
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                Cross-Domain Arbitration
              </span>
            </div>

            {/* Step-by-step Visual Architecture Flow */}
            <div className="bg-space-950/80 p-3.5 rounded-lg border border-space-800 text-xs font-mono text-slate-300 mb-4 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <span className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center text-[10px] border border-cyan-500/40">1</span>
                <span>Mission Request: {mission.mission_name || "AMDSF Mission"} ({mission.target_orbit || 550}km)</span>
              </div>
              <div className="text-slate-500 pl-7 text-[11px]">↓ Dispatched to 4 Domain Agents</div>
              <div className="flex items-center gap-2 text-slate-200">
                <span className="w-5 h-5 rounded bg-space-800 flex items-center justify-center text-[10px] border border-space-700">2</span>
                <span>Agent Findings: Debris ({debris.risk_level || 'MED'}), Weather ({weather.risk_level || 'LOW'}), Feasible ({feasibility.feasible ? 'YES' : 'NO'}), Cov ({coverage.coverage_percent || 'N/A'}%)</span>
              </div>
              <div className="text-slate-500 pl-7 text-[11px]">↓ Multi-Objective Constraint Synthesis</div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-[10px] border border-emerald-500/40">3</span>
                <span>Cross-Domain Reasoning: {orchestrator.resolution_strategy || "Optimized trajectory for maximum safety clearance."}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block">Consensus Summary:</span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {recommendation.reasoning?.slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-space-700/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">Detailed explainable logic available:</span>
            <Link
              to="/recommendation"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold font-mono flex items-center gap-1"
            >
              <span>Explore Recommendation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Highlight Recommendation Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-space-850 to-space-900 border border-cyan-500/40 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-space-700/60 mb-3">
              <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
                Recommended Launch Window
              </div>
              {recommendation.risk_level && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  {recommendation.risk_level} RISK
                </span>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mb-3">
              {recommendation.launch_window || "Analysis Pending"}
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3 font-mono text-xs">
              <div className="bg-space-950/80 p-2.5 rounded-lg border border-space-700">
                <span className="text-[10px] text-slate-400 block uppercase">Readiness</span>
                <span className="text-lg font-bold text-emerald-400">
                  {recommendation.readiness !== undefined ? `${recommendation.readiness}%` : 'N/A'}
                </span>
              </div>
              <div className="bg-space-950/80 p-2.5 rounded-lg border border-space-700">
                <span className="text-[10px] text-slate-400 block uppercase">Target Region</span>
                <span className="text-xs font-bold text-white truncate block mt-1">{mission.target_region || 'N/A'}</span>
              </div>
            </div>

            {recommendation.tradeoffs && recommendation.tradeoffs.length > 0 && (
              <div className="bg-space-950/60 p-2.5 rounded-lg border border-space-800 text-[11px] text-amber-200/90 mb-2">
                <span className="font-bold text-amber-300">Trade-Off: </span>
                {recommendation.tradeoffs[0]}
              </div>
            )}
          </div>

          <Link
            to="/recommendation"
            className="w-full mt-3 py-2 px-3 rounded-lg bg-space-800 hover:bg-space-700 text-cyan-300 text-xs font-semibold font-mono border border-space-600 flex items-center justify-center gap-2 transition"
          >
            <span>View Full Explainability & Trade-offs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Interactive Map & Multi-Domain Charts */}
      {orchestrator.map_data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-space-800">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
              Spatial Conjunction & Multi-Domain Analytics
            </h2>
            <span className="text-xs font-mono text-slate-400">Integrated Visualization Engine</span>
          </div>

          <MissionMap
            mapData={orchestrator.map_data}
            missionName={mission.mission_name || "AMDSF Satellite"}
          />

          {orchestrator.chart_data && <MissionCharts chartData={orchestrator.chart_data} />}
        </div>
      )}

    </div>
  );
}
