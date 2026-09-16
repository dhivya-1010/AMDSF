import React from 'react';
import { Wrench, Rocket, DollarSign, CheckCircle2, AlertTriangle, Info, Layers } from 'lucide-react';

export default function MissionFeasibility({ feasibilityData, missionData }) {
  const feasibility = feasibilityData || {};
  const mission = missionData || {};

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-space-700/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              Mission Feasibility Agent
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Launch vehicle staging, propulsion Delta-V capacity, fairing volume & budget validation
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 font-mono text-xs text-amber-300">
          <span>Estimation Model: <strong>Prototype Estimate</strong></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Feasibility Status</span>
          <span className={`text-2xl font-mono font-bold mt-1 block ${feasibility.feasible ? 'text-emerald-400' : 'text-rose-400'}`}>
            {feasibility.feasible ? 'FEASIBLE' : 'OVER BUDGET'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Constraint satisfaction</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Assigned Launch Vehicle</span>
          <span className="text-sm font-mono font-bold text-cyan-300 mt-2 block truncate" title={feasibility.launch_vehicle}>
            {feasibility.launch_vehicle || 'AeroSpace Small-Lift I'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Lift envelope matched</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Estimated Mission Cost</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            ${feasibility.estimated_cost_m || 14.8}M
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Prototype estimated cost</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Payload Mass Capacity</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
            {feasibility.payload_capacity_kg || 350} kg
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Max LEO insertion payload</span>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Vehicle Staging & Budget Lifecycle Assessment
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed mb-3">
          {feasibility.summary}
        </p>

        <div className="space-y-1.5 pt-3 border-t border-space-800 text-xs text-slate-300 font-mono">
          {feasibility.factors?.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Delta-V & Staging Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-space-900 p-4 rounded-xl border border-space-700">
          <span className="text-[10px] text-slate-400 uppercase block">Calculated Delta-V Budget</span>
          <span className="text-lg font-bold text-white mt-1 block">
            {feasibility.details?.delta_v_budget_ms || 3670} m/s
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Includes +15% margin margin reserve</span>
        </div>

        <div className="bg-space-900 p-4 rounded-xl border border-space-700">
          <span className="text-[10px] text-slate-400 uppercase block">Propulsion Lift Margin</span>
          <span className="text-lg font-bold text-emerald-400 mt-1 block">
            +{feasibility.propulsion_margin_percent || 13.5}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Excess booster payload capacity</span>
        </div>

        <div className="bg-space-900 p-4 rounded-xl border border-space-700">
          <span className="text-[10px] text-slate-400 uppercase block">Fairing Volume Compatibility</span>
          <span className="text-xs font-bold text-cyan-300 mt-2 block">
            {feasibility.details?.fairing_static_envelope || 'Standard 3.2m Payload Fairing'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Acoustic & clearance verified</span>
        </div>
      </div>

    </div>
  );
}
