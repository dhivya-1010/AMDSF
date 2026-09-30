import React from 'react';
import {
  SunMedium, Zap, Activity, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, ShieldCheck, Flame, Radio
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';

/**
 * SolarWeatherEnvironment
 * Visually centered around the SUN with:
 * - Sun, solar flare / CME ejection visual
 * - Directional solar wind streams & Earth magnetosphere bow-shock
 * - Compact solar-weather dashboard (Kp gauge, Solar Flux chart, CME indicator, Geomagnetic state)
 * - Causality flow: SOLAR EVENT -> CONDITIONS -> MISSION IMPACT -> LAUNCH WINDOW
 * - Timeline: PAST --- NOW --- LAUNCH WINDOW with event markers
 */
export default function SolarWeatherEnvironment({
  weather = {},
  mission = {},
  status = 'COMPLETED'
}) {
  const kpIndex = weather.kp_index ?? (status === 'COMPLETED' ? 3.2 : 0);
  const solarActivity = weather.solar_activity || 'QUIET / NOMINAL';
  const cmeActive = weather.cme_activity !== undefined ? weather.cme_activity : true;
  const isStorm = weather.geomagnetic_storm || false;
  const windSpeed = weather.details?.solar_wind_speed_kms || 395;
  const f107Flux = weather.details?.radio_flux_f10_7 || 142.5;
  const launchSite = mission.launch?.site || 'Spaceport';
  const prefDate = mission.constraints?.preferred_launch_date || '2026-10-15';

  // Solar Flux 24h Telemetry data
  const fluxData = [
    { time: '00:00', flux: 138 },
    { time: '04:00', flux: 140 },
    { time: '08:00', flux: 145 },
    { time: '12:00', flux: 142.5 },
    { time: '16:00', flux: 141 },
    { time: '20:00', flux: 143 },
    { time: '24:00', flux: 142 }
  ];

  // Causality pipeline steps
  const causalitySteps = [
    { label: 'SOLAR EVENT', desc: 'Class C3.4 Flare', icon: Flame, tag: 'TRIGGER' },
    { label: 'SPACE WX CONDITIONS', desc: 'Solar Wind 395 km/s', icon: SunMedium, tag: 'TELEMETRY' },
    { label: 'MISSION IMPACT', desc: 'Ionospheric Drag Nominal', icon: Zap, tag: 'LEO DRAG' },
    { label: 'LAUNCH WINDOW', desc: 'Clear Flight Epoch', icon: CheckCircle2, tag: 'GO FOR FLIGHT' }
  ];

  // Timeline events: PAST --- NOW --- LAUNCH WINDOW
  const timelineEvents = [
    { label: 'PAST (T-48h)', title: 'Coronal Loop Flare', desc: 'Class C3.4 observed by SDO', status: 'PAST', color: '#f59e0b' },
    { label: 'PAST (T-24h)', title: 'Partial CME Ejection', desc: 'Earthward speed 420 km/s', status: 'PAST', color: '#f59e0b' },
    { label: 'NOW (T-0)', title: 'Telemetry Acquisition', desc: 'Kp = 3.2 (Nominal)', status: 'ACTIVE', color: '#00f2fe' },
    { label: 'LAUNCH (T+24h)', title: 'Target Flight Window', desc: 'Favorable geomagnetic slot', status: 'FUTURE', color: '#10b981' }
  ];

  // Circular gauge angle calculation for Kp index (0 to 9 scale)
  // Maps 0-9 to -135deg to +135deg (total 270deg arc)
  const kpClamped = Math.max(0, Math.min(9, kpIndex));
  const gaugeAngle = -135 + (kpClamped / 9) * 270;

  return (
    <div className="w-full space-y-4">
      {/* CAUSALITY FLOW DIAGRAM (NO PARAGRAPHS) */}
      <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 font-bold uppercase tracking-wider">
              SPACE WEATHER CAUSALITY & LAUNCH CORRELATION
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-black/50 border border-white/10">
            NOAA SWPC / NASA DONKI FEED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {causalitySteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="relative p-2.5 rounded-lg bg-black/50 border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/20">
                    {step.tag}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">0{idx + 1}</span>
                </div>
                <div className="flex items-center gap-2 my-1">
                  <div className="w-6 h-6 rounded bg-black/60 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono font-bold text-white truncate">{step.label}</div>
                    <div className="text-[9px] font-mono text-slate-400 truncate">{step.desc}</div>
                  </div>
                </div>
                {idx < causalitySteps.length - 1 && (
                  <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-amber-500/60 font-mono text-xs">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN VISUALIZATION: SUN-CENTERED HELIOPHYSICS ENVIRONMENT */}
      <div className="bg-black/75 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl flex flex-col justify-between hud-corner-ticks relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span className="font-bold text-white tracking-wider uppercase">
              FIGURE 5: HELIOPHYSICS ENVIRONMENT — SOLAR FLARE & CME VECTOR PROPAGATION
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-300">
            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">
              WIND VELOCITY: <strong className="text-amber-300">{windSpeed} km/s</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
              NOMINAL IONOSPHERE
            </span>
          </div>
        </div>

        {/* Large SVG Heliophysics Visualization Canvas */}
        <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center">
          <svg
            viewBox="0 0 850 420"
            className="w-full h-full select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Sun Core & Corona Glow Gradients */}
              <radialGradient id="sunCore" cx="45%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="25%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.95" />
                <stop offset="85%" stopColor="#ea580c" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="1" />
              </radialGradient>

              <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="90%" stopColor="#ea580c" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Flare Wavefront Gradient */}
              <linearGradient id="cmeWave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ea580c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>

              {/* Earth Atmosphere & Magnetosphere Bow Shock */}
              <radialGradient id="earthWeather" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="70%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#082f49" />
              </radialGradient>

              <filter id="sunGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* INTERPLANETARY SPACE COORDINATE GRID */}
            <g opacity="0.12" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3 3">
              <line x1="50" y1="210" x2="800" y2="210" />
              <line x1="160" y1="30" x2="160" y2="390" />
              <line x1="720" y1="30" x2="720" y2="390" />
              <circle cx="160" cy="210" r="320" fill="none" />
              <circle cx="160" cy="210" r="500" fill="none" />
            </g>

            {/* DIRECTIONAL SOLAR WIND STREAMS (Traveling Sun -> Earth) */}
            <g stroke="#f59e0b" strokeWidth="1.2" opacity="0.45" strokeDasharray="6 8">
              <line x1="260" y1="130" x2="680" y2="170" />
              <line x1="280" y1="170" x2="690" y2="195" />
              <line x1="290" y1="210" x2="700" y2="210" strokeWidth="1.8" stroke="#fef08a" />
              <line x1="280" y1="250" x2="690" y2="225" />
              <line x1="260" y1="290" x2="680" y2="250" />
            </g>

            {/* SOLAR FLARE & CORONAL MASS EJECTION (CME) ARC */}
            <g id="cmeWavefront" filter="url(#sunGlow)">
              <path
                d="M 230 140 Q 420 170 540 210 Q 420 250 230 280"
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                strokeDasharray="8 4"
              />
              <path
                d="M 250 155 Q 460 180 580 210 Q 460 240 250 265"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.6"
              />
            </g>

            {/* SUN IN THE CENTER-LEFT (Radius 90px at cx=160, cy=210) */}
            <g id="sunGroup">
              {/* Outer Coronal Halo */}
              <circle cx="160" cy="210" r="140" fill="url(#sunCorona)" filter="url(#sunGlow)" />
              <circle cx="160" cy="210" r="115" fill="#f59e0b" opacity="0.25" filter="url(#sunGlow)" />

              {/* Sun Core */}
              <circle cx="160" cy="210" r="92" fill="url(#sunCore)" filter="url(#sunGlow)" />

              {/* Sunspot Prominences / Coronal Loops */}
              <path
                d="M 230 170 Q 270 180 240 210 Q 210 240 245 250"
                fill="none"
                stroke="#fff"
                strokeWidth="1.5"
                opacity="0.8"
                filter="url(#sunGlow)"
              />
              <circle cx="140" cy="180" r="4" fill="#78350f" opacity="0.6" />
              <circle cx="180" cy="220" r="6" fill="#78350f" opacity="0.6" />
              <circle cx="170" cy="245" r="3.5" fill="#78350f" opacity="0.6" />

              {/* Sun Identification Label */}
              <text x="140" y="214" fill="#78350f" fontSize="13" fontFamily="JetBrains Mono" fontWeight="bold">
                SUN
              </text>
            </g>

            {/* SOLAR FLARE ANNOTATION CARD */}
            <g transform="translate(320, 65)">
              <rect x="0" y="0" width="180" height="48" rx="6" fill="#040918" stroke="#f59e0b" strokeWidth="1" opacity="0.95" />
              <text x="10" y="16" fill="#f59e0b" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="bold">
                ⚡ SOLAR FLARE / CME (C3.4)
              </text>
              <text x="10" y="30" fill="#ffffff" fontSize="10.5" fontFamily="JetBrains Mono" fontWeight="bold">
                v = 420 km/s Wavefront
              </text>
              <text x="10" y="42" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">
                Partial Halo • Low Geo-Effectiveness
              </text>
              <line x1="90" y1="48" x2="90" y2="120" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            </g>

            {/* EARTH & COMPRESSED MAGNETOSPHERE AT RIGHT (cx=720, cy=210) */}
            <g id="earthMagnetosphere">
              {/* Bow Shock Compression Boundary */}
              <path
                d="M 670 120 Q 640 210 670 300"
                fill="none"
                stroke="#00f2fe"
                strokeWidth="2.2"
                strokeDasharray="4 3"
                opacity="0.8"
                filter="url(#sunGlow)"
              />
              <path
                d="M 685 140 Q 665 210 685 280"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                opacity="0.6"
              />

              {/* Earth Body (Radius 36px) */}
              <circle cx="720" cy="210" r="36" fill="url(#earthWeather)" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="720" cy="210" r="44" fill="#00f2fe" opacity="0.25" filter="url(#sunGlow)" />

              {/* Satellite in LEO Orbit around Earth */}
              <ellipse cx="720" cy="210" rx="55" ry="24" fill="none" stroke="#00f2fe" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="765" cy="200" r="3.5" fill="#00f2fe" />

              {/* Earth & Magnetosphere Annotations */}
              <text x="702" y="214" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                EARTH
              </text>
              <text x="645" y="105" fill="#00f2fe" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold">
                BOW SHOCK
              </text>
              <text x="710" y="275" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">
                LEO {mission.orbit?.altitude_km || 550} km
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* COMPACT SOLAR-WEATHER DASHBOARD (GAUGE, FLUX CHART, CME, GEOMAGNETIC STATE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. KP INDEX CIRCULAR GAUGE */}
        <div className="bg-black/75 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-2xl flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Planetary Kp Index</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
              0 - 9 SCALE
            </span>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <svg viewBox="0 0 160 110" className="w-36 h-24 select-none">
              {/* Background Arc */}
              <path
                d="M 20 90 A 60 60 0 1 1 140 90"
                fill="none"
                stroke="#1e293b"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Colored Segments: 0-4 (Green/Cyan), 4-6 (Yellow), 6-9 (Red) */}
              <path
                d="M 20 90 A 60 60 0 0 1 80 30"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M 80 30 A 60 60 0 0 1 125 55"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                opacity="0.8"
              />
              <path
                d="M 125 55 A 60 60 0 0 1 140 90"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Center Readout */}
              <text x="80" y="80" textAnchor="middle" fill="#00f2fe" fontSize="22" fontWeight="bold">
                {kpIndex}
              </text>
              <text x="80" y="96" textAnchor="middle" fill="#94a3b8" fontSize="8.5">
                QUIET &lt; 4.0
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-white/5">
            <span>Status: <strong className="text-emerald-400">QUIET</strong></span>
            <span>Threshold: &lt; 4.0</span>
          </div>
        </div>

        {/* 2. SOLAR FLUX (F10.7) LINE CHART */}
        <div className="bg-black/75 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-2xl flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Solar Radio Flux (F10.7)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/20">
              142.5 sfu
            </span>
          </div>

          <div className="h-24 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 8 }} />
                <YAxis domain={[130, 150]} stroke="#64748b" tick={{ fontSize: 8 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#040918', border: '1px solid #f59e0b', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="flux" stroke="#f59e0b" strokeWidth={2} fill="url(#fluxGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-white/5">
            <span>Activity: <strong className="text-white">{solarActivity.split('/')[0]}</strong></span>
            <span>Baseline: Class B/C</span>
          </div>
        </div>

        {/* 3. CME ACTIVITY EVENT INDICATOR */}
        <div className="bg-black/75 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-2xl flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">CME Activity</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/20">
              SOHO / LASCO
            </span>
          </div>

          <div className="my-2 p-2.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">CME Status:</span>
              <span className="font-bold text-amber-300">{cmeActive ? 'DETECTED' : 'NONE'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Associated Flare:</span>
              <span className="font-bold text-white">Class C3.4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Earth Impact:</span>
              <span className="font-bold text-emerald-400">Glancing / Low</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-white/5">
            <span>Propagation: 420 km/s</span>
            <span>DONKI ID: CME-001</span>
          </div>
        </div>

        {/* 4. GEOMAGNETIC STATE (NOMINAL / WATCH / ADVERSE) */}
        <div className="bg-black/75 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-2xl flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Geomagnetic State</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
              NOAA G-SCALE
            </span>
          </div>

          <div className="my-3 text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isStorm ? 'ADVERSE' : kpIndex > 4 ? 'WATCH' : 'NOMINAL'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-2">
              Atmospheric Drag: <strong className="text-cyan-300">1.02x Baseline</strong>
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-white/5">
            <span>Launch Pad: {launchSite?.split('—')[0]}</span>
            <span className="text-emerald-400 font-bold">GO FOR FLIGHT</span>
          </div>
        </div>
      </div>

      {/* MISSION LAUNCH WINDOW TIMELINE: PAST --- NOW --- LAUNCH WINDOW */}
      <div className="w-full bg-slate-950/85 border border-white/10 rounded-xl p-4 shadow-xl font-mono">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              SPACE WEATHER TIMELINE: PAST ───── NOW ───── LAUNCH WINDOW
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Epoch: {prefDate}</span>
        </div>

        <div className="relative pt-3 pb-1">
          {/* Timeline Bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full relative">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 rounded-full w-full opacity-60" />
          </div>

          {/* Timeline Event Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {timelineEvents.map((evt, idx) => (
              <div
                key={evt.label}
                className="p-2.5 rounded-lg bg-black/60 border border-white/10 hover:border-amber-400 transition"
              >
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-bold" style={{ color: evt.color }}>{evt.label}</span>
                  <span className="text-slate-400">{evt.status}</span>
                </div>
                <div className="text-[11px] font-bold text-white truncate mt-1">{evt.title}</div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">{evt.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
