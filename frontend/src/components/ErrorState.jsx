import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="bg-space-900 border border-rose-500/40 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center text-center my-6">
      <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Analysis Connection Warning</h3>
      <p className="text-xs text-slate-300 mt-1 max-w-lg">
        {error || "An unexpected error occurred while communicating with backend agent services."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-lg bg-space-800 hover:bg-space-700 text-xs font-semibold text-cyan-400 border border-space-600 flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Orchestration</span>
        </button>
      )}
    </div>
  );
}
