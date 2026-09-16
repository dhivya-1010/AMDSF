import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Compass } from 'lucide-react';

export default function NoActiveMissionState({ pageTitle = "Domain Intelligence" }) {
  return (
    <div className="bg-space-900/80 border border-space-700/80 rounded-2xl p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center my-6 max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-space-850 border border-space-700 flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 mb-2">
        NO ACTIVE MISSION
      </span>

      <h2 className="text-xl font-bold font-mono text-white tracking-wide mt-1">
        Mission Definition Required for {pageTitle}
      </h2>

      <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md font-mono leading-relaxed">
        AMDSF is a mission-centric platform. Please define target geometry, launch staging, and orbital parameters in Mission Planning before evaluating domain analytics.
      </p>

      <Link
        to="/planning"
        className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition"
      >
        <Layers className="w-4 h-4" />
        <span>Go to Mission Planning</span>
      </Link>
    </div>
  );
}
