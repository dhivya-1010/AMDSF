import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, MapPin, Compass, Rocket, Calendar, ArrowRight, Activity, Terminal } from 'lucide-react';

export default function MissionContextBar({ mission, activePage }) {
  if (!mission) return null;

  const target = mission.target || {};
  const orbit = mission.orbit || {};
  const launch = mission.launch || {};
  const constraints = mission.constraints || {};

  return (
    <div className="hud-glass hud-corner-ticks p-4 sm:p-5 mb-6 relative overflow-hidden">
      {/* Background Subtle Coordinate Grid */}
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />

      {/* Header Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-black/60 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,242,254,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{mission.mission_id || "AMDSF-ACTIVE"}</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
              <span>{mission.mission_name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-cyan-300 uppercase font-mono border border-white/10">
                {mission.objective?.type || "EARTH_OBSERVATION"}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[10px] text-slate-400 font-mono mr-1 hidden sm:inline">[MISSION ACTIVE]</span>
          <Link
            to="/planning"
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-cyan-300 hover:text-white border border-white/10 hover:border-cyan-500/50 flex items-center gap-1.5 transition text-[11px]"
          >
            <span>Reconfigure Mission</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs font-mono">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-cyan-400 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Observation Target</span>
            <span className="text-white font-bold truncate block max-w-[170px]" title={`${target.area}, ${target.region}`}>
              {target.area || target.region || "Target Location"}
            </span>
            <span className="text-[10px] text-slate-400">{target.country || "Global"} ({target.latitude}°N, {target.longitude}°E)</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-cyan-400 mt-0.5">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Orbit Architecture</span>
            <span className="text-cyan-300 font-bold">{orbit.type || "LEO"} — {orbit.altitude_km || 550} km</span>
            <span className="text-[10px] text-slate-400 block">{orbit.inclination_deg || 97.6}° Inclination</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-cyan-400 mt-0.5">
            <Rocket className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Spaceport Facility</span>
            <span className="text-white font-bold truncate block max-w-[170px]" title={launch.site}>
              {launch.site || "Spaceport"}
            </span>
            <span className="text-[10px] text-slate-400 block">{launch.country || "Launch Country"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-cyan-400 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Target Epoch</span>
            <span className="text-emerald-400 font-bold">{constraints.preferred_launch_date || "2026-10-15"}</span>
            <span className="text-[10px] text-slate-400 block">±{constraints.launch_window_flexibility_days || 3}d flexibility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
