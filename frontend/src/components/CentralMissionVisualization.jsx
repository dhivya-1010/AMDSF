import React, { useState, useEffect, useRef } from 'react';
import {
  Rocket, Target, Satellite, Globe, Radio, ShieldAlert,
  Compass, Eye, Play, Pause, RefreshCw, Layers, CheckCircle2,
  AlertTriangle
} from 'lucide-react';

/**
 * CentralMissionVisualization
 * Large, realistic aerospace mission visualization displaying:
 * - Earth horizon / globe with atmospheric limb
 * - Mission target region highlighted
 * - Satellite orbit arc around Earth
 * - Launch origin marker
 * - Target region marker
 * - Orbital trajectory & animated satellite
 * - Compact HUD telemetry overlay
 */
export default function CentralMissionVisualization({
  mission = {},
  analysisResults = {},
  analysisStatus = {}
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [orbitAngle, setOrbitAngle] = useState(45); // in degrees
  const animationFrameRef = useRef(null);

  const orbit = mission.orbit || { altitude_km: 550, inclination_deg: 97.6, type: 'LEO' };
  const target = mission.target || {
    area: 'Target Area',
    region: 'Region',
    country: 'Country',
    latitude: 13.08,
    longitude: 80.27,
    coverage_radius_km: 120
  };
  const launch = mission.launch || {
    site: 'Launch Spaceport',
    country: 'Spaceport Country',
    launch_site_code: 'LC-01'
  };

  const debris = analysisResults?.debris || {};
  const weather = analysisResults?.weather || {};
  const feasibility = analysisResults?.feasibility || {};
  const coverage = analysisResults?.coverage || {};
  const orchestrator = analysisResults?.orchestrator || {};
  const recommendation = orchestrator?.recommendation || {};

  // Animate the satellite along the elliptical orbit
  useEffect(() => {
    let lastTime = performance.now();
    const animate = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      if (isPlaying) {
        setOrbitAngle((prev) => (prev + dt * 18) % 360);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying]);

  // Compute satellite position along 3D-projected elliptical orbit
  // Center is at (450, 240) in a 900x480 coordinate space
  const cx = 450;
  const cy = 250;
  const a = 340; // Semi-major axis
  const b = 135; // Semi-minor axis (perspective inclination)
  const rad = (orbitAngle * Math.PI) / 180;
  
  // Inclined ellipse rotation
  const inclRad = ((orbit.inclination_deg ? (orbit.inclination_deg - 90) * 0.25 : 8) * Math.PI) / 180;
  const rawX = a * Math.cos(rad);
  const rawY = b * Math.sin(rad);
  
  const satX = cx + rawX * Math.cos(inclRad) - rawY * Math.sin(inclRad);
  const satY = cy + rawX * Math.sin(inclRad) + rawY * Math.cos(inclRad);

  // Z-depth for 3D occlusion behind Earth (when sin(rad) < 0)
  const isBehindEarth = Math.sin(rad) < -0.15 && Math.abs(rawX) < 160;

  // Velocity calculation
  const altKm = orbit.altitude_km || 550;
  const velocityKms = (Math.sqrt(398600 / (6371 + altKm))).toFixed(2);
  const periodMin = (2 * Math.PI * Math.sqrt(Math.pow(6371 + altKm, 3) / 398600) / 60).toFixed(1);

  return (
    <div className="relative w-full rounded-2xl bg-black/75 border border-cyan-500/40 shadow-2xl backdrop-blur-2xl overflow-hidden hud-corner-ticks">
      {/* Visual Header / Telemetry Metadata */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-slate-950/70 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]" />
            <span className="font-bold text-white tracking-wider uppercase">
              FIGURE 1: MISSION OPERATIONS CONSOLE — ORBITAL SITUATIONAL DISPLAY
            </span>
          </div>
          <span className="hidden md:inline text-cyan-400/60 font-semibold px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20 text-[10px]">
            REAL-TIME PROPAGATION
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-300">
          <span className="hidden sm:inline">
            <strong className="text-cyan-300">ALT:</strong> {altKm} km
          </span>
          <span className="hidden sm:inline">
            <strong className="text-cyan-300">INC:</strong> {orbit.inclination_deg}°
          </span>
          <span className="hidden md:inline">
            <strong className="text-cyan-300">VEL:</strong> {velocityKms} km/s
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 hover:bg-black/90 text-cyan-300 border border-cyan-500/30 text-[10px] transition"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'PAUSE' : 'RESUME'}</span>
          </button>
        </div>
      </div>

      {/* Main Aerospace SVG Visualization Canvas */}
      <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center bg-radial-gradient">
        <svg
          viewBox="0 0 900 500"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Earth Shading & Atmosphere Limb */}
            <radialGradient id="earthGlow" cx="42%" cy="40%" r="58%">
              <stop offset="0%" stopColor="#1e40af" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#0369a1" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#075985" stopOpacity="0.95" />
              <stop offset="90%" stopColor="#0c4a6e" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="1" />
            </radialGradient>

            <radialGradient id="atmoLimb" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="transparent" />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.9" />
            </radialGradient>

            <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Orbit Path Gradient */}
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#00f2fe" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>

            {/* Swath Target Gradient */}
            <radialGradient id="targetSwath" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#00f2fe" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Coordinate System Grid Lines (Celestial Sphere) */}
          <g opacity="0.18" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 3">
            <line x1="50" y1="250" x2="850" y2="250" />
            <line x1="450" y1="50" x2="450" y2="450" />
            <circle cx="450" cy="250" r="380" fill="none" strokeWidth="0.5" />
            <circle cx="450" cy="250" r="280" fill="none" strokeWidth="0.5" />
          </g>

          {/* BACKGROUND ORBIT HALF (When satellite moves behind Earth) */}
          <g transform={`rotate(${((orbit.inclination_deg ? (orbit.inclination_deg - 90) * 0.25 : 8))}, 450, 250)`}>
            <ellipse
              cx="450"
              cy="250"
              rx={a}
              ry={b}
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.35"
            />
          </g>

          {/* EARTH GLOBE (Centered at 450, 250 with radius 145) */}
          <g id="earthGroup">
            {/* Outer Atmospheric Aura */}
            <circle cx="450" cy="250" r="162" fill="url(#atmoLimb)" filter="url(#glowFilter)" />
            <circle cx="450" cy="250" r="148" fill="#000" opacity="0.3" />

            {/* Earth Body */}
            <circle cx="450" cy="250" r="145" fill="url(#earthGlow)" stroke="#38bdf8" strokeWidth="1" />

            {/* Stylized Continents & Lat/Long Grid Lines on Earth */}
            <g opacity="0.35" stroke="#7dd3fc" strokeWidth="0.6">
              {/* Latitude Arcs */}
              <ellipse cx="450" cy="250" rx="145" ry="30" fill="none" />
              <ellipse cx="450" cy="210" rx="135" ry="25" fill="none" />
              <ellipse cx="450" cy="290" rx="135" ry="25" fill="none" />
              <ellipse cx="450" cy="170" rx="100" ry="18" fill="none" />
              <ellipse cx="450" cy="330" rx="100" ry="18" fill="none" />
              {/* Longitude Arcs */}
              <ellipse cx="450" cy="250" rx="40" ry="145" fill="none" />
              <ellipse cx="450" cy="250" rx="85" ry="145" fill="none" />
              <ellipse cx="450" cy="250" rx="125" ry="145" fill="none" />
            </g>

            {/* Continental Landmass Contours (Stylized Vector) */}
            <g fill="#059669" opacity="0.32" stroke="#10b981" strokeWidth="0.8">
              {/* Asia / Eurasian Landmass silhouette */}
              <path d="M 430 180 Q 460 170 510 190 Q 550 210 540 250 Q 510 260 480 240 Q 450 260 430 230 Z" />
              {/* Indian Subcontinent silhouette */}
              <path d="M 450 220 Q 470 230 465 260 Q 450 280 440 250 Z" />
              {/* Africa / Atlantic flank */}
              <path d="M 370 220 Q 410 225 415 270 Q 395 320 365 290 Q 350 240 370 220 Z" />
              {/* Pacific Island arcs */}
              <circle cx="535" cy="265" r="4" />
              <circle cx="550" cy="275" r="3" />
            </g>

            {/* Earth Horizon / Day-Night Terminator Line */}
            <path
              d="M 450 105 A 145 145 0 0 1 450 395 Q 400 250 450 105 Z"
              fill="#030712"
              opacity="0.45"
            />
          </g>

          {/* LAUNCH ORIGIN MARKER ON EARTH SURFACE */}
          {/* Coordinates ~ (445, 255) on the globe */}
          <g id="launchOriginMarker">
            <line x1="445" y1="255" x2="350" y2="340" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
            <circle cx="445" cy="255" r="4" fill="#f59e0b" filter="url(#softGlow)" />
            <circle cx="445" cy="255" r="8" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.7">
              <animate attributeName="r" values="4;12;4" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>

            {/* Launch Marker Label Badge */}
            <g transform="translate(240, 335)">
              <rect x="0" y="0" width="160" height="38" rx="6" fill="#040918" stroke="#f59e0b" strokeWidth="1" opacity="0.9" />
              <text x="10" y="16" fill="#f59e0b" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                🚀 LAUNCH ORIGIN
              </text>
              <text x="10" y="30" fill="#cbd5e1" fontSize="9" fontFamily="JetBrains Mono">
                {launch.site?.split('—')[0]?.trim() || "Launch Site"}
              </text>
            </g>
          </g>

          {/* TARGET REGION HIGHLIGHT & COVERAGE FOOTPRINT ON EARTH */}
          {/* Target ~ (475, 205) on the globe */}
          <g id="targetRegionMarker">
            {/* Swath Footprint Circle on Earth */}
            <circle cx="475" cy="205" r="32" fill="url(#targetSwath)" stroke="#00f2fe" strokeWidth="1.2" opacity="0.85" />
            <circle cx="475" cy="205" r="4" fill="#00f2fe" filter="url(#softGlow)" />
            
            {/* Connecting annotation line */}
            <line x1="475" y1="205" x2="570" y2="135" stroke="#00f2fe" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.85" />

            {/* Target Marker Label Badge */}
            <g transform="translate(560, 105)">
              <rect x="0" y="0" width="180" height="48" rx="6" fill="#040918" stroke="#00f2fe" strokeWidth="1" opacity="0.95" />
              <text x="10" y="16" fill="#00f2fe" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                🎯 OBSERVATION TARGET
              </text>
              <text x="10" y="30" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                {target.area || target.region || "Target Zone"}
              </text>
              <text x="10" y="42" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono">
                {target.country} ({target.latitude}°N, {target.longitude}°E)
              </text>
            </g>
          </g>

          {/* FOREGROUND ORBIT TRAJECTORY (Elliptical Path with Glow) */}
          <g transform={`rotate(${((orbit.inclination_deg ? (orbit.inclination_deg - 90) * 0.25 : 8))}, 450, 250)`}>
            <ellipse
              cx="450"
              cy="250"
              rx={a}
              ry={b}
              fill="none"
              stroke="url(#orbitGrad)"
              strokeWidth="2.5"
              filter="url(#softGlow)"
            />
          </g>

          {/* NADIR GROUND TRACK LINE (From Satellite to Earth Center / Surface) */}
          {!isBehindEarth && (
            <line
              x1={satX}
              y1={satY}
              x2={450 + (satX - 450) * 0.42}
              y2={250 + (satY - 250) * 0.42}
              stroke="#00f2fe"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.6"
            />
          )}

          {/* ANIMATED SATELLITE CRAFT */}
          <g
            transform={`translate(${satX}, ${satY})`}
            opacity={isBehindEarth ? 0.2 : 1}
            filter={isBehindEarth ? undefined : "url(#glowFilter)"}
          >
            {/* Satellite Heading Angle */}
            <g transform={`rotate(${orbitAngle + 90})`}>
              {/* Solar Array Wings */}
              <rect x="-24" y="-4" width="16" height="8" rx="1.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
              <rect x="8" y="-4" width="16" height="8" rx="1.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
              {/* Array Grid Lines */}
              <line x1="-16" y1="-4" x2="-16" y2="4" stroke="#7dd3fc" strokeWidth="0.5" />
              <line x1="16" y1="-4" x2="16" y2="4" stroke="#7dd3fc" strokeWidth="0.5" />
              {/* Central Satellite Body Bus */}
              <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#0f172a" stroke="#00f2fe" strokeWidth="1.5" />
              {/* High Gain Antenna Dish */}
              <circle cx="0" cy="0" r="3" fill="#00f2fe" />
              <line x1="0" y1="-6" x2="0" y2="-11" stroke="#00f2fe" strokeWidth="1" />
              <circle cx="0" cy="-11" r="1.5" fill="#38bdf8" />
            </g>

            {/* Satellite Beacon Pulse */}
            <circle cx="0" cy="0" r="14" fill="none" stroke="#00f2fe" strokeWidth="0.8" opacity="0.6">
              <animate attributeName="r" values="8;20;8" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>

            {/* Satellite Floating Label */}
            {!isBehindEarth && (
              <g transform="translate(18, -12)">
                <rect x="0" y="0" width="125" height="24" rx="4" fill="#030712" stroke="#00f2fe" strokeWidth="0.8" opacity="0.9" />
                <text x="6" y="11" fill="#00f2fe" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold">
                  ● SATELLITE [{orbit.type}]
                </text>
                <text x="6" y="20" fill="#94a3b8" fontSize="7.5" fontFamily="JetBrains Mono">
                  v: {velocityKms} km/s • θ: {orbitAngle.toFixed(0)}°
                </text>
              </g>
            )}
          </g>

          {/* ORBITAL PATH NOTATION HUD */}
          <g transform="translate(70, 75)" opacity="0.85">
            <text x="0" y="0" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">
              ORBITAL TRACK GEOMETRY:
            </text>
            <text x="0" y="14" fill="#00f2fe" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
              h = {altKm} km | i = {orbit.inclination_deg}° SSO
            </text>
            <text x="0" y="26" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono">
              Nodal Period: T = {periodMin} min
            </text>
          </g>
        </svg>

        {/* Tactical HUD Corner Crosshairs */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400/70 pointer-events-none flex flex-col gap-0.5">
          <span className="font-bold tracking-wider">TRACKING NODE // ACTIVE</span>
          <span className="text-slate-400">EPOCH: {mission.constraints?.preferred_launch_date || '2026-10-15'}</span>
        </div>

        <div className="absolute top-3 right-3 text-[10px] font-mono text-cyan-400/70 pointer-events-none text-right flex flex-col gap-0.5">
          <span className="font-bold tracking-wider">SUBSATELLITE COORDS</span>
          <span className="text-slate-400">FOV: {coverage.details?.swath_width_km || 1020} km SWATH</span>
        </div>
      </div>

      {/* COMPACT MISSION INDICATORS STRIP (NO LONG EXPLANATIONS) */}
      <div className="border-t border-white/10 bg-slate-950/90 p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono">
          {/* 1. MISSION STATUS */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">MISSION STATUS</span>
            <div className="my-1 flex items-center justify-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                recommendation.risk_level === 'HIGH' ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'
              }`} />
              <span className={`text-sm sm:text-base font-bold ${
                recommendation.risk_level === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {recommendation.readiness && recommendation.readiness >= 75 ? 'READY' : 'REVIEW'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400">Readiness: {recommendation.readiness || 82}%</span>
          </div>

          {/* 2. DEBRIS */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">DEBRIS CONJUNCTION</span>
            <div className="my-1 flex items-center justify-center">
              <span className={`px-2.5 py-0.5 rounded text-xs sm:text-sm font-bold border ${
                debris.risk_level === 'HIGH'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  : debris.risk_level === 'LOW'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}>
                {debris.risk_level || 'MEDIUM'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400">{debris.nearby_objects || 12} proximate objs</span>
          </div>

          {/* 3. WEATHER */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">SPACE WEATHER</span>
            <div className="my-1 flex items-center justify-center">
              <span className={`px-2.5 py-0.5 rounded text-xs sm:text-sm font-bold border ${
                weather.geomagnetic_storm
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  : weather.kp_index > 4
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              }`}>
                {weather.geomagnetic_storm ? 'ADVERSE' : weather.kp_index > 4 ? 'WATCH' : 'NOMINAL'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400">Kp: {weather.kp_index || 3.2} • Solar: QUIET</span>
          </div>

          {/* 4. FEASIBILITY */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">MISSION FEASIBILITY</span>
            <div className="my-1 flex items-center justify-center">
              <span className={`px-2.5 py-0.5 rounded text-xs sm:text-sm font-bold border ${
                feasibility.feasible === false
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              }`}>
                {feasibility.feasible === false ? 'REVIEW' : 'FEASIBLE'}
              </span>
            </div>
            <span className="text-[9px] text-slate-400">Cost: ${feasibility.estimated_cost_m || 16}M</span>
          </div>

          {/* 5. COVERAGE */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">TARGET COVERAGE</span>
            <div className="my-1 flex items-center justify-center">
              <span className="text-sm sm:text-base font-bold text-cyan-300">
                {coverage.coverage_percent || 97}%
              </span>
            </div>
            <span className="text-[9px] text-slate-400">Revisit: {coverage.revisit_time_minutes || 110} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
