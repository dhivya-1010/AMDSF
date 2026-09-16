import React from 'react';
import { Satellite, Globe2, Users, Radio, Info, Database } from 'lucide-react';
import MissionMap from '../components/MissionMap';

export default function CoverageAnalysis({ coverageData, mapData }) {
  const coverage = coverageData || {};

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-space-700/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              Coverage Intelligence Agent
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ground track geometry, swath access footprint, revisit intervals & demographic reach
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900 border border-space-700 font-mono text-xs text-slate-300">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Model: <strong className="text-white">Deterministic Swath & Footprint Geometry</strong></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Target Regional Coverage</span>
          <span className="text-2xl font-mono font-bold text-cyan-300 mt-1 block">
            {coverage.coverage_percent || 93.8}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Footprint area reach</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Population Served</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            {coverage.population_served_formatted || '18.4M'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Demographic access footprint</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Coverage Gaps</span>
          <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
            {coverage.coverage_gaps || 2} regions
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Off-nadir blind intervals</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Mean Revisit Time</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
            {coverage.revisit_time_minutes || 110} min
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Target orbit period cycle</span>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Coverage Footprint & Ground Revisit Analysis
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed mb-3">
          {coverage.summary}
        </p>

        <div className="space-y-1.5 pt-3 border-t border-space-800 text-xs text-slate-300 font-mono">
          {coverage.factors?.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Coverage Footprint Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-space-800">
          <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase">
            Sensor Swath & Ground Station Elevation Footprint
          </h3>
          <span className="text-xs font-mono text-slate-400">Target Region: {coverage.target_region || 'India'}</span>
        </div>
        <MissionMap mapData={mapData} missionName="Coverage Footprint Sensor" />
      </div>

    </div>
  );
}
