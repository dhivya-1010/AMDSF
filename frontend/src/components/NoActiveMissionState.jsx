import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Compass, ShieldAlert, Terminal, Radio } from 'lucide-react';

export default function NoActiveMissionState({ pageTitle = "Domain Intelligence" }) {
  return (
    <div className="hud-glass hud-corner-ticks p-8 sm:p-12 flex flex-col items-center justify-center text-center my-12 max-w-2xl mx-auto relative overflow-hidden">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 w-16 h-16 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>

      <div className="relative z-10 flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] font-mono font-bold tracking-widest text-amber-300 uppercase px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60">
          OPERATIONS STANDBY // NO ACTIVE MISSION
        </span>
      </div>

      <h2 className="relative z-10 text-xl sm:text-2xl font-bold font-mono text-white tracking-wide mt-2">
        Mission Definition Required for {pageTitle}
      </h2>

      <p className="relative z-10 text-xs sm:text-sm text-slate-300 mt-2.5 max-w-md font-mono leading-relaxed">
        AMDSF evaluates telemetry within the context of a configured flight envelope. Please define target coordinates, orbit architecture, and spaceport staging in Mission Planning.
      </p>

      <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/planning"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition"
        >
          <Layers className="w-4 h-4" />
          <span>Launch Mission Planner</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/"
          className="px-5 py-3 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 hover:text-white font-mono text-xs transition"
        >
          Return to Overview
        </Link>
      </div>
    </div>
  );
}
