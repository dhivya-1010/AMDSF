import React from 'react';
import MissionMap from './MissionMap';

export default function CoverageMapVisualization({ coverage = {}, mission = {}, mapData = null, status = 'NOT_RUN' }) {
  const target = mission.target || {};
  const prototype = coverage.status === 'prototype_estimate';
  return (
    <div className="w-full space-y-4 font-mono">
      <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyan-300 font-bold uppercase">COVERAGE PROTOTYPE ESTIMATE</span>
          <span className="text-slate-400">{status === 'COMPLETED' && prototype ? 'Computed estimate' : 'Calculation pending'}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
          <Metric label="Swath estimate" value={coverage.details?.swath_width_km != null ? `${coverage.details.swath_width_km} km` : '—'} />
          <Metric label="Coverage estimate" value={coverage.coverage_percent != null ? `${coverage.coverage_percent}%` : '—'} />
          <Metric label="Population" value="Unavailable" />
          <Metric label="Revisit" value="Unavailable" />
        </div>
      </div>
      {mapData?.satellite_position && mapData?.ground_track?.length ? (
        <div className="bg-black/75 border border-cyan-500/40 rounded-2xl p-4">
          <MissionMap mapData={mapData} missionName={mission.mission_name} />
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-center text-sm text-amber-200">
          No propagated ground track or validated access-window geometry is available.
        </div>
      )}
      <p className="text-[10px] text-slate-400">
        {coverage.summary || 'Coverage is unavailable until analysis is run.'} This prototype does not use a population dataset or calculate revisit events.
      </p>
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-lg border border-white/10 bg-black/50 p-3"><div className="text-slate-400">{label}</div><div className="text-white font-bold mt-1">{value}</div></div>;
}
