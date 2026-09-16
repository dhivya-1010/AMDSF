import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, MapPin, Compass, Rocket, Calendar, ArrowRight } from 'lucide-react';

export default function MissionContextBar({ mission, activePage }) {
  if (!mission) return null;

  const target = mission.target || {};
  const orbit = mission.orbit || {};
  const launch = mission.launch || {};
  const constraints = mission.constraints || {};

  return (
    <div className="bg-space-900 border border-cyan-500/40 rounded-xl p-4 shadow-lg mb-6 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-space-800">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-700/80 text-cyan-300 font-mono text-xs font-bold">
            {mission.mission_id || "AMDSF-ACTIVE"}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
              <span>{mission.mission_name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-space-800 text-slate-300 uppercase font-normal">
                {mission.objective?.type || "EARTH_OBSERVATION"}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            to="/planning"
            className="px-3 py-1 rounded bg-space-850 hover:bg-space-800 text-slate-300 hover:text-white border border-space-700 flex items-center gap-1.5 transition text-[11px]"
          >
            <span>Edit Mission</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs font-mono">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Target Area</span>
            <span className="text-white font-semibold truncate block max-w-[150px]" title={`${target.area}, ${target.region}`}>
              {target.area || target.region || "Target Location"}
            </span>
            <span className="text-[10px] text-slate-500">{target.country || "Global"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Orbit Regime</span>
            <span className="text-cyan-300 font-semibold">{orbit.type || "LEO"} — {orbit.altitude_km || 550} km</span>
            <span className="text-[10px] text-slate-500">{orbit.inclination_deg || 97.6}° Inclination</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Rocket className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Launch Spaceport</span>
            <span className="text-white font-semibold truncate block max-w-[150px]" title={launch.site}>
              {launch.site || "Spaceport"}
            </span>
            <span className="text-[10px] text-slate-500">{launch.country || "Launch Country"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Preferred Epoch</span>
            <span className="text-emerald-400 font-semibold">{constraints.preferred_launch_date || "2026-10-15"}</span>
            <span className="text-[10px] text-slate-500">±{constraints.launch_window_flexibility_days || 3}d flexibility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
