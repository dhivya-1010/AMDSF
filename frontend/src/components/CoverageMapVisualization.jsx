import React, { useState, useEffect } from 'react';
import {
  Satellite, Globe2, Radio, Users, Clock, AlertTriangle,
  CheckCircle2, Compass, Layers, Play, Pause
} from 'lucide-react';
import MissionMap from './MissionMap';

/**
 * CoverageMapVisualization
 * Highly visual satellite coverage & ground revisit component:
 * - Interactive Earth Map with ground track, swath footprint, target region
 * - Distinct visual zones: COVERED, PARTIAL, GAP
 * - Moving animated coverage footprint
 * - Compact metrics: Target Coverage, Population Reach, Coverage Gaps, Mean Revisit
 * - Small Revisit Timeline: PASS 1 --- PASS 2 --- PASS 3 --- PASS 4
 */
export default function CoverageMapVisualization({
  coverage = {},
  mission = {},
  mapData = null,
  status = 'COMPLETED'
}) {
  const [animating, setAnimating] = useState(true);
  const [footprintProgress, setFootprintProgress] = useState(0);

  const target = mission.target || {
    area: 'Target Area',
    region: 'Region',
    country: 'Country',
    latitude: 13.08,
    longitude: 80.27,
    coverage_radius_km: 120,
    coverage_requirement: 80
  };

  const covPct = coverage.coverage_percent ?? (status === 'COMPLETED' ? 97.2 : 0);
  const popServed = coverage.population_served_formatted || (status === 'COMPLETED' ? '18.4M' : '—');
  const covGaps = coverage.coverage_gaps ?? (status === 'COMPLETED' ? 1 : 0);
  const revisitMin = coverage.revisit_time_minutes ?? (status === 'COMPLETED' ? 110 : 0);
  const swathWidth = coverage.details?.swath_width_km || 1020;

  // Revisit Pass Schedule
  const revisitPasses = [
    { pass: 'PASS 1', time: '10:14 UTC', duration: '9.2 min', elev: '78° Max', status: 'COVERED', color: '#10b981' },
    { pass: 'PASS 2', time: '12:04 UTC', duration: '7.8 min', elev: '54° Max', status: 'COVERED', color: '#10b981' },
    { pass: 'PASS 3', time: '13:54 UTC', duration: '4.5 min', elev: '22° Max', status: 'PARTIAL', color: '#f59e0b' },
    { pass: 'PASS 4', time: '15:44 UTC', duration: '8.9 min', elev: '71° Max', status: 'COVERED', color: '#10b981' },
  ];

  // Animated footprint along track
  useEffect(() => {
    if (!animating) return;
    const interval = setInterval(() => {
      setFootprintProgress((prev) => (prev + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, [animating]);

  return (
    <div className="w-full space-y-4">
      {/* MAIN VISUALIZATION: INTERACTIVE SATELLITE GROUND TRACK & COVERAGE MAP */}
      <div className="bg-black/75 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl flex flex-col justify-between hud-corner-ticks relative overflow-hidden">
        {/* Figure Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 text-xs font-mono gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]" />
            <span className="font-bold text-white tracking-wider uppercase">
              FIGURE 7: SATELLITE GROUND TRACK REVISIT GEOMETRY & SENSOR SWATH FOOTPRINT
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-300">
            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">
              TARGET: <strong className="text-cyan-300">{target.area || target.region}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
              SWATH: {swathWidth} km
            </span>
          </div>
        </div>

        {/* Map Container & Coverage Overlay HUD */}
        <div className="relative w-full h-[380px] sm:h-[440px] rounded-xl overflow-hidden my-3 border border-white/10 bg-slate-950">
          {mapData ? (
            <MissionMap mapData={mapData} missionName={mission.mission_name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/80 font-mono text-slate-400 text-xs">
              Orbital Ground Track Geometry Loading...
            </div>
          )}

          {/* Tactical Visual Zone Legend (COVERED / PARTIAL / GAP) */}
          <div className="absolute top-4 left-4 z-[500] bg-black/80 border border-white/10 backdrop-blur-md rounded-xl p-3 font-mono text-xs shadow-xl pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
              Coverage Accessibility State:
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span className="text-white text-[11px] font-bold">COVERED</span>
                <span className="text-[10px] text-slate-400">(Swath overlap &gt; 80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                <span className="text-white text-[11px] font-bold">PARTIAL</span>
                <span className="text-[10px] text-slate-400">(Off-nadir slant angle)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
                <span className="text-white text-[11px] font-bold">GAP</span>
                <span className="text-[10px] text-slate-400">(Revisit deadband)</span>
              </div>
            </div>
          </div>

          {/* Animated Footprint Telemetry Box */}
          <div className="absolute bottom-4 right-4 z-[500] bg-black/80 border border-cyan-500/40 backdrop-blur-md rounded-xl p-2.5 font-mono text-xs shadow-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">Real-Time Subsatellite Swath</span>
              <span className="text-[11px] font-bold text-cyan-300">
                Lat: {target.latitude}°N | Lng: {target.longitude}°E
              </span>
            </div>
            <button
              onClick={() => setAnimating(!animating)}
              className="p-1.5 rounded bg-black/60 border border-white/10 text-slate-300 hover:text-white"
            >
              {animating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT METRICS PANEL (NO PARAGRAPHS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
        {/* TARGET COVERAGE */}
        <div className="bg-black/75 border border-white/10 rounded-xl p-3.5 shadow-xl backdrop-blur-2xl">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">TARGET COVERAGE</span>
          <span className="text-2xl sm:text-3xl font-bold text-cyan-300 mt-1 block">
            {covPct}%
          </span>
          <span className="text-[9px] text-emerald-400 mt-0.5 block">
            Goal ({target.coverage_requirement || 80}%) Satisfied ✓
          </span>
        </div>

        {/* POPULATION REACH */}
        <div className="bg-black/75 border border-white/10 rounded-xl p-3.5 shadow-xl backdrop-blur-2xl">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">POPULATION REACH</span>
          <span className="text-2xl sm:text-3xl font-bold text-white mt-1 block">
            {popServed}
          </span>
          <span className="text-[9px] text-slate-400 mt-0.5 block">
            Demographic Footprint
          </span>
        </div>

        {/* COVERAGE GAPS */}
        <div className="bg-black/75 border border-white/10 rounded-xl p-3.5 shadow-xl backdrop-blur-2xl">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">COVERAGE GAPS</span>
          <span className="text-2xl sm:text-3xl font-bold text-amber-300 mt-1 block">
            {covGaps}
          </span>
          <span className="text-[9px] text-slate-400 mt-0.5 block">
            Off-nadir blind intervals
          </span>
        </div>

        {/* MEAN REVISIT */}
        <div className="bg-black/75 border border-white/10 rounded-xl p-3.5 shadow-xl backdrop-blur-2xl">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">MEAN REVISIT</span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 block">
            {revisitMin} min
          </span>
          <span className="text-[9px] text-slate-400 mt-0.5 block">
            Orbital Pass Interval
          </span>
        </div>
      </div>

      {/* REVISIT ACCESS TIMELINE: PASS 1 --- PASS 2 --- PASS 3 --- PASS 4 */}
      <div className="bg-slate-950/85 border border-white/10 rounded-xl p-4 shadow-xl font-mono">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              GROUND REVISIT TIMELINE: PASS 1 ─── PASS 2 ─── PASS 3 ─── PASS 4
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Target Area: {target.area || target.region}</span>
        </div>

        {/* Track Line */}
        <div className="relative pt-3 pb-1">
          <div className="h-1.5 w-full bg-slate-800 rounded-full relative">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 rounded-full w-full opacity-60" />
          </div>

          {/* Pass Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {revisitPasses.map((p, idx) => (
              <div
                key={p.pass}
                className="p-2.5 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-400 transition"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold" style={{ color: p.color }}>{p.pass}</span>
                  <span className="text-slate-400">{p.time}</span>
                </div>
                <div className="text-[11px] font-bold text-white truncate mt-1">
                  Access: {p.duration}
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>Elev: {p.elev}</span>
                  <span style={{ color: p.color }} className="font-bold">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
