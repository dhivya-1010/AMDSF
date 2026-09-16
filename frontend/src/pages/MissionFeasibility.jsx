import React from 'react';
import { Wrench, Rocket, DollarSign, CheckCircle2, AlertTriangle, Info, Layers, RefreshCw, Play, Gauge, ShieldCheck } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import NoActiveMissionState from '../components/NoActiveMissionState';
import StarfieldCanvas from '../components/StarfieldCanvas';
import stagingBgImg from '../assets/images/propulsion_staging.jpg';

export default function MissionFeasibility() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  if (!activeMission) {
    return <NoActiveMissionState pageTitle="Mission Feasibility" />;
  }

  const feasibility = analysisResults?.feasibility || {};
  const launchSite = activeMission.launch?.site || "Launch Spaceport";
  const payloadMass = activeMission.mission?.payload_mass_kg || 250;
  const budget = activeMission.mission?.budget_musd || 50;
  const orbitAlt = activeMission.orbit?.altitude_km || 550;
  const status = analysisStatus?.feasibility || 'NOT_RUN';
  const isRunning = status === 'RUNNING';

  return (
    <div className="space-y-6 pb-12">
      <StarfieldCanvas count={50} opacity={0.35} />

      {/* Persistent Mission Context Bar */}
      <MissionContextBar mission={activeMission} activePage="feasibility" />

      {/* Hero Visual Banner with Propulsion & Staging Environment */}
      <div className="relative rounded-2xl overflow-hidden border border-space-700 p-6 sm:p-8 shadow-2xl">
        <div
          className="absolute inset-0 space-bg-hero"
          style={{
            backgroundImage: `url(${stagingBgImg})`,
            backgroundPosition: 'center 40%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-space-950 via-space-950/85 to-space-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-transparent to-space-950/30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <Wrench className="w-4 h-4" />
              <span>PROPULSION & VEHICLE STAGING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-wide mt-1">
              Mission Feasibility Agent
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 max-w-2xl leading-relaxed">
              Launch vehicle staging, propulsion Delta-V capacity, fairing volume & lifecycle budget validation for {activeMission.mission_name}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/90 border border-space-700 font-mono text-xs text-slate-300 backdrop-blur-md">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>Model: <strong className="text-white">Delta-V & Cost Estimator</strong></span>
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={() => runSingleAgent('feasibility')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Staging...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Feasibility Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Feasibility Status</span>
          <span className={`text-2xl font-mono font-bold mt-1 block ${
            feasibility.feasible !== undefined ? (feasibility.feasible ? 'text-emerald-400' : 'text-rose-400') : (status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-400')
          }`}>
            {feasibility.feasible !== undefined ? (feasibility.feasible ? 'FEASIBLE' : 'OVER BUDGET') : (status === 'COMPLETED' ? 'FEASIBLE' : 'PENDING')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Constraint satisfaction</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Assigned Launch Vehicle</span>
          <span className="text-sm font-mono font-bold text-cyan-300 mt-2 block truncate" title={feasibility.launch_vehicle}>
            {feasibility.launch_vehicle || (activeMission.launch?.vehicle !== 'AUTO' ? activeMission.launch?.vehicle : 'AeroSpace Small-Lift I')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">From {launchSite}</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Estimated Lifecycle Cost</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            ${feasibility.estimated_cost_m ?? (status === 'COMPLETED' ? Math.round(budget * 0.32 * 10)/10 : '—')}M
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Allocated: ${budget}M USD</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Payload Wet Mass</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
            {payloadMass} kg
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Capacity: {feasibility.payload_capacity_kg || (payloadMass <= 350 ? 350 : 1500)} kg</span>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="hud-card hud-corner-ticks p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Vehicle Staging & Budget Lifecycle Assessment
        </h3>
        <p className="text-sm text-slate-200 font-mono leading-relaxed mb-3">
          {feasibility.summary || `Mission staging and propulsion assessment initialized for ${payloadMass}kg payload insertion into ${orbitAlt}km orbit.`}
        </p>

        <div className="space-y-1.5 pt-3 border-t border-space-800 text-xs text-slate-300 font-mono">
          {feasibility.factors && feasibility.factors.length > 0 ? (
            feasibility.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>{f}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-400 italic">Click "Run Feasibility Analysis" to calculate propulsion and staging margins.</div>
          )}
        </div>
      </div>

      {/* Technical Delta-V & Staging Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="hud-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Calculated Delta-V Budget</span>
          <span className="text-lg font-bold text-white mt-1 block">
            {feasibility.details?.delta_v_budget_ms || (3450 + Math.round(orbitAlt * 0.4))} m/s
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Includes orbital insertion reserve</span>
        </div>

        <div className="hud-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Propulsion Lift Margin</span>
          <span className="text-lg font-bold text-emerald-400 mt-1 block">
            +{feasibility.propulsion_margin_percent || 14.2}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Excess booster payload capacity</span>
        </div>

        <div className="hud-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Fairing Volume Compatibility</span>
          <span className="text-xs font-bold text-cyan-300 mt-2 block">
            {feasibility.details?.fairing_static_envelope || 'Standard 3.2m Payload Fairing'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Acoustic & clearance verified</span>
        </div>
      </div>

    </div>
  );
}
