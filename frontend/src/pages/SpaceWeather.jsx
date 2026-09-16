import React from 'react';
import { SunMedium, Zap, Radio, Info, Database, Activity, AlertCircle } from 'lucide-react';

export default function SpaceWeather({ weatherData }) {
  const weather = weatherData || {};
  const recentEvents = weather.recent_events || [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-space-700/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SunMedium className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              Space Weather Intelligence Agent
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Heliophysics dynamics, planetary Kp geomagnetic index & solar flare coronal monitoring
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900 border border-space-700 font-mono text-xs text-slate-300">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Data Sources: <strong className="text-white">NASA DONKI • NOAA SWPC</strong></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Planetary Kp-Index</span>
          <span className="text-2xl font-mono font-bold text-cyan-300 mt-1 block">
            {weather.kp_index || 3.2}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Quiet threshold &lt; 4.0</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Solar Activity</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
            {weather.solar_activity?.split('/')[0] || 'QUIET'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">GOES X-ray background flux</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">CME Activity Detected</span>
          <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
            {weather.cme_activity ? 'YES (Active)' : 'NONE'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">SOHO / LASCO Catalog</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Geomagnetic Storm Status</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
            {weather.geomagnetic_storm ? 'G1+ STORM' : 'NOMINAL'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Ionospheric drag state</span>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Space Weather Evaluation & Atmospheric Drag Assessment
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed mb-3">
          {weather.summary}
        </p>

        <div className="space-y-1.5 pt-3 border-t border-space-800 text-xs text-slate-300 font-mono">
          {weather.factors?.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NASA DONKI Coronal Mass Ejection Event Feed */}
      <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-space-800">
          <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            NASA DONKI Recent CME Notifications
          </h3>
          <span className="text-xs font-mono text-slate-400">{recentEvents.length} Events In Observation Window</span>
        </div>

        {recentEvents.length > 0 ? (
          <div className="space-y-3">
            {recentEvents.map((evt, idx) => (
              <div key={idx} className="bg-space-850 p-3.5 rounded-lg border border-space-700/80 font-mono text-xs">
                <div className="flex items-center justify-between text-cyan-300 font-bold mb-1">
                  <span>{evt.activityID || `CME-EVENT-${idx + 1}`}</span>
                  <span className="text-slate-400 font-normal text-[11px]">{evt.startTime || 'Recent'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                  {evt.note || 'Coronal mass ejection observed with negligible Earth-directed geo-effective impact.'}
                </p>
                {evt.associated_flare && (
                  <div className="mt-2 text-[10px] text-amber-300">
                    Associated Solar Flare Class: <span className="font-bold">{evt.associated_flare}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-mono italic">No critical CME events active in current observation window.</p>
        )}
      </div>

      {/* Atmospheric Drag & Telemetry Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-space-900 p-4 rounded-xl border border-space-700">
          <span className="text-[10px] text-slate-400 uppercase block">Solar Wind Velocity</span>
          <span className="text-lg font-bold text-white mt-1 block">
            {weather.details?.solar_wind_speed_kms || 395} km/s
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Nominal baseline range</span>
        </div>

        <div className="bg-space-900 p-4 rounded-xl border border-space-700">
          <span className="text-[10px] text-slate-400 uppercase block">10.7cm Solar Radio Flux (F10.7)</span>
          <span className="text-lg font-bold text-white mt-1 block">
            {weather.details?.radio_flux_f10_7 || 142.5} sfu
          </span>
          <span className="text-[10px] text-cyan-400 mt-1 block">Moderate ionization level</span>
        </div>

        <div className="bg-space-900 p-4 rounded-xl border border-space-700">
          <span className="text-[10px] text-slate-400 uppercase block">Atmospheric Drag Factor</span>
          <span className="text-lg font-bold text-white mt-1 block">
            {weather.details?.estimated_atmospheric_drag || '1.02x'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Negligible orbit decay delta</span>
        </div>
      </div>

    </div>
  );
}
