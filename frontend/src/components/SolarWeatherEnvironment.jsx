import React from 'react';

export default function SolarWeatherEnvironment({ weather = {}, status = 'NOT_RUN' }) {
  const available = status === 'COMPLETED' && weather.status !== 'unavailable' && weather.kp_index != null;
  return (
    <div className="w-full space-y-4 font-mono">
      <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-300 font-bold uppercase">SPACE WEATHER OBSERVATIONS</span>
          <span className="text-slate-400">{available ? (weather.data_sources || []).join(' • ') : 'Data unavailable'}</span>
        </div>
        {available ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
            <Metric label="Kp index" value={weather.kp_index} />
            <Metric label="Risk class" value={weather.risk_level} />
            <Metric label="CME events" value={weather.recent_events?.length ?? '—'} />
            <Metric label="Storm flag" value={weather.geomagnetic_storm ? 'YES' : 'NO'} />
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/20 p-5 text-center text-sm text-amber-200">
            NOAA SWPC and NASA DONKI observations are unavailable. No synthetic telemetry is displayed.
          </div>
        )}
      </div>
      {available && <p className="text-[10px] text-slate-400">{weather.summary}</p>}
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-lg border border-white/10 bg-black/50 p-3"><div className="text-slate-400">{label}</div><div className="text-white font-bold mt-1">{value}</div></div>;
}
