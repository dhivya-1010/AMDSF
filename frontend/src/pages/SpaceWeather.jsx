import React from 'react';
import { SunMedium, Zap, Radio, Info, Database, Activity, AlertCircle, RefreshCw, Play, Flame, ShieldAlert } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import NoActiveMissionState from '../components/NoActiveMissionState';
import StarfieldCanvas from '../components/StarfieldCanvas';
import BackgroundScene from '../components/BackgroundScene';

export default function SpaceWeather() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  if (!activeMission) {
    return (
      <div className="relative min-h-screen">
        <BackgroundScene scene="sun" overlayGradient="standard" />
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <NoActiveMissionState pageTitle="Space Weather Intelligence" />
        </div>
      </div>
    );
  }

  const weather = analysisResults?.weather || {};
  const recentEvents = weather.recent_events || [];
  const launchSite = activeMission.launch?.site || "Launch Spaceport";
  const prefDate = activeMission.constraints?.preferred_launch_date || "2026-10-15";
  const status = analysisStatus?.weather || 'NOT_RUN';
  const isRunning = status === 'RUNNING';

  return (
    <div className="relative min-h-screen">
      {/* Full-Screen Space Environment (Sun & Coronal Flare) */}
      <BackgroundScene scene="sun" overlayGradient="standard" />
      <StarfieldCanvas count={50} opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20 relative z-10">
        {/* Persistent Mission Context Bar */}
        <MissionContextBar mission={activeMission} activePage="weather" />

        {/* Floating Glass Hero Banner */}
        <div className="hud-glass hud-corner-ticks p-6 sm:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
                <SunMedium className="w-4 h-4" />
                <span className="font-semibold tracking-wider uppercase">HELIOPHYSICS & SOLAR DYNAMICS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-wide mt-1">
                Space Weather Intelligence Agent
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 max-w-2xl leading-relaxed">
                Monitoring planetary Kp geomagnetic index, coronal mass ejections, and upper atmospheric drag inflation for {launchSite} on {prefDate}.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-slate-300 backdrop-blur-md">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Data Feeds: <strong className="text-white">NOAA SWPC • NASA DONKI</strong></span>
              </div>

              <button
                type="button"
                disabled={isRunning}
                onClick={() => runSingleAgent('weather')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Ingesting Solar Feeds...</span>
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
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="hud-glass hud-corner-ticks p-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Planetary Kp-Index</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-cyan-300 mt-1 block">
              {weather.kp_index ?? (status === 'COMPLETED' ? 3.2 : '—')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Quiet threshold &lt; 4.0</span>
          </div>

          <div className="hud-glass hud-corner-ticks p-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Solar Flux Activity</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mt-1 block truncate">
              {weather.solar_activity ? weather.solar_activity.split('/')[0] : (status === 'COMPLETED' ? 'QUIET' : '—')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">GOES X-ray baseline flux</span>
          </div>

          <div className="hud-glass hud-corner-ticks p-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">CME Activity</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 mt-1 block">
              {weather.cme_activity !== undefined ? (weather.cme_activity ? 'YES (Active)' : 'NONE') : (status === 'COMPLETED' ? 'YES' : '—')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">SOHO / LASCO Telemetry</span>
          </div>

          <div className="hud-glass hud-corner-ticks p-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Geomagnetic Storm</span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mt-1 block">
              {weather.geomagnetic_storm !== undefined ? (weather.geomagnetic_storm ? 'G1+ STORM' : 'NOMINAL') : (status === 'COMPLETED' ? 'NOMINAL' : '—')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Ionospheric drag state</span>
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="hud-glass hud-corner-ticks p-6 shadow-2xl">
          <h3 className="text-xs font-mono uppercase font-bold text-amber-400 mb-2 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            Space Weather Evaluation for {launchSite}
          </h3>
          <p className="text-sm text-slate-200 font-mono leading-relaxed mb-4">
            {weather.summary || `Space weather analysis initialized for launch facility at ${launchSite} on candidate epoch ${prefDate}.`}
          </p>

          <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-slate-300 font-mono">
            {weather.factors && weather.factors.length > 0 ? (
              weather.factors.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  <span>{f}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic">Click "Run Weather Analysis" to query live NOAA/DONKI conditions.</div>
            )}
          </div>
        </div>

        {/* NASA DONKI Coronal Mass Ejection Event Feed */}
        <div className="hud-glass hud-corner-ticks p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>NASA DONKI Recent CME Notifications</span>
            </h3>
            <span className="text-xs font-mono text-amber-300 font-semibold">{recentEvents.length} Events in Epoch Window</span>
          </div>

          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((evt, idx) => (
                <div key={idx} className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-xs">
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
            <p className="text-xs text-slate-400 font-mono italic">No critical CME events active in current observation window.</p>
          )}
        </div>

        {/* Atmospheric Drag & Launch Telemetry Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="hud-glass p-4">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Solar Wind Velocity</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {weather.details?.solar_wind_speed_kms || 395} km/s
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 block">Nominal baseline range</span>
          </div>

          <div className="hud-glass p-4">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">10.7cm Solar Radio Flux (F10.7)</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {weather.details?.radio_flux_f10_7 || 142.5} sfu
            </span>
            <span className="text-[10px] text-cyan-400 mt-1 block">Moderate ionization level</span>
          </div>

          <div className="hud-glass p-4">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Atmospheric Drag Factor</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {weather.details?.estimated_atmospheric_drag || '1.02x'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Negligible launch ascent decay</span>
          </div>
        </div>

      </div>
    </div>
  );
}
