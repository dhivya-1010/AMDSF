import React from 'react';
import { SunMedium, Zap, Radio, Info, Database, Activity, AlertCircle, RefreshCw, Play } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import NoActiveMissionState from '../components/NoActiveMissionState';

export default function SpaceWeather() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  if (!activeMission) {
    return <NoActiveMissionState pageTitle="Space Weather Intelligence" />;
  }

  const weather = analysisResults?.weather || {};
  const recentEvents = weather.recent_events || [];
  const launchSite = activeMission.launch?.site || "Launch Site";
  const prefDate = activeMission.constraints?.preferred_launch_date || "2026-10-15";
  const status = analysisStatus?.weather || 'NOT_RUN';
  const isRunning = status === 'RUNNING';

  return (
    <div className="space-y-6">

      {/* Persistent Mission Context Bar */}
      <MissionContextBar mission={activeMission} activePage="weather" />

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
            Heliophysics dynamics, planetary Kp geomagnetic index & solar flare monitoring for launch at {launchSite} on {prefDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900 border border-space-700 font-mono text-xs text-slate-300">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Data Sources: <strong className="text-white">NOAA SWPC • NASA DONKI</strong></span>
          </div>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => runSingleAgent('weather')}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Weather Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Planetary Kp-Index</span>
          <span className="text-2xl font-mono font-bold text-cyan-300 mt-1 block">
            {weather.kp_index ?? (status === 'COMPLETED' ? 3.2 : '—')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Quiet threshold &lt; 4.0</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Solar Activity</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block truncate">
            {weather.solar_activity ? weather.solar_activity.split('/')[0] : (status === 'COMPLETED' ? 'QUIET' : '—')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">GOES X-ray baseline flux</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">CME Activity</span>
          <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
            {weather.cme_activity !== undefined ? (weather.cme_activity ? 'YES (Active)' : 'NONE') : (status === 'COMPLETED' ? 'YES' : '—')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">SOHO / LASCO Telemetry</span>
        </div>

        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Geomagnetic Storm</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
            {weather.geomagnetic_storm !== undefined ? (weather.geomagnetic_storm ? 'G1+ STORM' : 'NOMINAL') : (status === 'COMPLETED' ? 'NOMINAL' : '—')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Ionospheric drag status</span>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Space Weather Evaluation for {launchSite}
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed mb-3">
          {weather.summary || `Space weather analysis initialized for launch facility at ${launchSite} on candidate epoch ${prefDate}.`}
        </p>

        <div className="space-y-1.5 pt-3 border-t border-space-800 text-xs text-slate-300 font-mono">
          {weather.factors && weather.factors.length > 0 ? (
            weather.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{f}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic">Click "Run Weather Analysis" to query live NOAA/DONKI conditions.</div>
          )}
        </div>
      </div>

      {/* NASA DONKI Coronal Mass Ejection Event Feed */}
      <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-space-800">
          <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            NASA DONKI Recent CME Notifications
          </h3>
          <span className="text-xs font-mono text-slate-400">{recentEvents.length} Events in Epoch Window</span>
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
                  {evt.note || 'Coronal mass ejection observed with negligible Earth-directed impact.'}
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
          <p className="text-xs text-slate-400 font-mono italic">No severe CME events active in current observation window.</p>
        )}
      </div>

      {/* Atmospheric Drag & Launch Telemetry Parameters */}
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
          <span className="text-[10px] text-slate-400 mt-1 block">Negligible launch ascent decay</span>
        </div>
      </div>

    </div>
  );
}
