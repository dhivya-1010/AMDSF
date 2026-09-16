import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';

export default function LoadingState({ message = "Orchestrating Mission Analysis..." }) {
  return (
    <div className="bg-space-900/80 border border-cyan-500/40 rounded-xl p-8 shadow-2xl flex flex-col items-center justify-center text-center my-6">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
        <Radio className="w-6 h-6 text-cyan-400 absolute animate-pulse" />
      </div>
      <h3 className="text-base font-semibold text-white font-mono tracking-wide">{message}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-md font-mono">
        Querying CelesTrak, NOAA SWPC, NASA DONKI services and running cross-domain multi-objective reasoning...
      </p>
    </div>
  );
}
