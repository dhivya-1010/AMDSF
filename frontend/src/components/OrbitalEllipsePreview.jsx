import React from 'react';
import { Layers, Globe, Compass, Clock, Zap, Target } from 'lucide-react';

/**
 * OrbitalEllipsePreview
 * Renders Earth + 3D-perspective orbital ellipse visualization for the Mission Planning page.
 * Displays compact visual annotations directly around the orbit:
 * - Altitude
 * - Inclination
 * - Orbit Type
 * - Eccentricity
 * - Mission Duration
 */
export default function OrbitalEllipsePreview({ form = {} }) {
  const altKm = Number(form.orbit_altitude) || 550;
  const incDeg = Number(form.orbit_inclination) || 97.6;
  const orbitType = form.orbit_type || 'SSO';
  const durationDays = form.mission_duration || 365;
  const payloadMass = form.payload_mass || 250;
  const targetArea = form.target_area || form.target_region || 'Observation Target';

  // Keplerian orbital dynamics calculations
  const rEarth = 6371; // km
  const rOrbit = rEarth + altKm;
  const mu = 398600; // km^3 / s^2
  const velocityKms = Math.sqrt(mu / rOrbit).toFixed(2);
  const periodMin = (2 * Math.PI * Math.sqrt(Math.pow(rOrbit, 3) / mu) / 60).toFixed(1);
  const eccentricity = altKm > 1000 ? '0.0042' : '0.0011';

  // Responsive scale of the ellipse based on altitude (clamped for visual beauty)
  const a = Math.min(230, Math.max(160, 160 + (altKm - 300) * 0.08)); // Semi-major axis
  const b = Math.min(100, Math.max(65, 65 + (altKm - 300) * 0.035));  // Semi-minor axis
  
  // Inclination tilt angle for 2D perspective
  // Map 0-180 inclination to visual angle -45 to +45 deg
  const tiltDeg = ((incDeg - 90) * 0.35);

  return (
    <div className="w-full h-full min-h-[460px] bg-black/75 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl flex flex-col justify-between hud-corner-ticks relative overflow-hidden">
      {/* Figure Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]" />
          <span className="font-bold text-white tracking-wider uppercase">
            FIGURE 2: ORBIT CONFIGURATION & KEPLERIAN GEOMETRY
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px]">
          INTERACTIVE SIMULATION
        </span>
      </div>

      {/* SVG Canvas for Earth + Orbit Ellipse */}
      <div className="relative flex-1 flex items-center justify-center my-2">
        <svg
          viewBox="0 0 540 380"
          className="w-full h-full max-h-[380px] select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="earthPlanGrad" cx="40%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#0369a1" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="1" />
            </radialGradient>

            <radialGradient id="limbPlanGrad" cx="50%" cy="50%" r="50%">
              <stop offset="82%" stopColor="transparent" />
              <stop offset="96%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.95" />
            </radialGradient>

            <filter id="planGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Coordinate Crosshairs */}
          <g opacity="0.15" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 3">
            <line x1="40" y1="190" x2="500" y2="190" />
            <line x1="270" y1="30" x2="270" y2="350" />
            <circle cx="270" cy="190" r="170" fill="none" />
          </g>

          {/* BACK HALF OF ORBIT ELLIPSE (behind Earth) */}
          <g transform={`rotate(${tiltDeg}, 270, 190)`}>
            <ellipse
              cx="270"
              cy="190"
              rx={a}
              ry={b}
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.6"
              strokeDasharray="4 4"
              opacity="0.4"
            />
          </g>

          {/* EARTH GLOBE IN CENTER (Radius 90px) */}
          <g id="planningEarth">
            {/* Atmosphere Glow */}
            <circle cx="270" cy="190" r="102" fill="url(#limbPlanGrad)" filter="url(#planGlow)" />
            {/* Globe Body */}
            <circle cx="270" cy="190" r="90" fill="url(#earthPlanGrad)" stroke="#38bdf8" strokeWidth="1" />
            {/* Lat/Long Grid Lines on Globe */}
            <g opacity="0.3" stroke="#e0f2fe" strokeWidth="0.6">
              <ellipse cx="270" cy="190" rx="90" ry="20" fill="none" />
              <ellipse cx="270" cy="165" rx="85" ry="16" fill="none" />
              <ellipse cx="270" cy="215" rx="85" ry="16" fill="none" />
              <ellipse cx="270" cy="190" rx="30" ry="90" fill="none" />
              <ellipse cx="270" cy="190" rx="60" ry="90" fill="none" />
            </g>
            {/* Equatorial Axis / Prime Meridian */}
            <line x1="175" y1="190" x2="365" y2="190" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <text x="350" y="185" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">EQUATOR</text>
          </g>

          {/* FOREGROUND ORBIT ELLIPSE (With Radiant Cyan Vector) */}
          <g transform={`rotate(${tiltDeg}, 270, 190)`}>
            <ellipse
              cx="270"
              cy="190"
              rx={a}
              ry={b}
              fill="none"
              stroke="#00f2fe"
              strokeWidth="2.2"
              filter="url(#planGlow)"
            />

            {/* Satellite Craft placed at true anomaly ~ 35 deg */}
            <g transform={`translate(${270 + a * 0.82}, ${190 + b * 0.58})`}>
              <circle cx="0" cy="0" r="12" fill="none" stroke="#00f2fe" strokeWidth="0.8" opacity="0.7">
                <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Solar wings */}
              <rect x="-14" y="-3" width="10" height="6" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.6" />
              <rect x="4" y="-3" width="10" height="6" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.6" />
              {/* Bus */}
              <circle cx="0" cy="0" r="4" fill="#00f2fe" />
            </g>

            {/* Ascending Node / Line of Nodes indicator */}
            <line x1={270 - a} y1="190" x2={270 + a} y2="190" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
          </g>

          {/* VISUAL ANNOTATION 1: ALTITUDE */}
          <g transform="translate(30, 60)">
            <rect x="0" y="0" width="130" height="42" rx="6" fill="#040918" stroke="#00f2fe" strokeWidth="1" opacity="0.95" />
            <text x="8" y="16" fill="#00f2fe" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
              ALTITUDE
            </text>
            <text x="8" y="32" fill="#ffffff" fontSize="13" fontFamily="JetBrains Mono" fontWeight="bold">
              {altKm} km
            </text>
            <line x1="130" y1="21" x2="195" y2="90" stroke="#00f2fe" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <circle cx="195" cy="90" r="2.5" fill="#00f2fe" />
          </g>

          {/* VISUAL ANNOTATION 2: INCLINATION */}
          <g transform="translate(370, 50)">
            <rect x="0" y="0" width="135" height="42" rx="6" fill="#040918" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
            <text x="8" y="16" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
              INCLINATION
            </text>
            <text x="8" y="32" fill="#ffffff" fontSize="13" fontFamily="JetBrains Mono" fontWeight="bold">
              {incDeg}°
            </text>
            <line x1="0" y1="21" x2="-45" y2="70" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <circle cx="-45" cy="70" r="2.5" fill="#38bdf8" />
          </g>

          {/* VISUAL ANNOTATION 3: ORBIT TYPE */}
          <g transform="translate(25, 290)">
            <rect x="0" y="0" width="145" height="42" rx="6" fill="#040918" stroke="#10b981" strokeWidth="1" opacity="0.95" />
            <text x="8" y="16" fill="#10b981" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
              ORBIT REGIME
            </text>
            <text x="8" y="32" fill="#ffffff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
              {orbitType}
            </text>
            <line x1="145" y1="21" x2="200" y2="250" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <circle cx="200" cy="250" r="2.5" fill="#10b981" />
          </g>

          {/* VISUAL ANNOTATION 4: ECCENTRICITY & DURATION */}
          <g transform="translate(365, 280)">
            <rect x="0" y="0" width="145" height="54" rx="6" fill="#040918" stroke="#f59e0b" strokeWidth="1" opacity="0.95" />
            <text x="8" y="15" fill="#f59e0b" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold">
              ECCENTRICITY
            </text>
            <text x="8" y="28" fill="#ffffff" fontSize="10.5" fontFamily="JetBrains Mono" fontWeight="bold">
              e = {eccentricity}
            </text>
            <text x="8" y="44" fill="#cbd5e1" fontSize="8.5" fontFamily="JetBrains Mono">
              Duration: <strong className="text-amber-300">{durationDays}d</strong>
            </text>
          </g>
        </svg>
      </div>

      {/* Orbit Summary Annotation Bar */}
      <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 font-mono text-center">
        <div className="bg-black/50 p-2 rounded-lg border border-white/10">
          <span className="text-[9px] text-slate-400 block uppercase">Orbital Period</span>
          <span className="text-xs font-bold text-cyan-300 mt-0.5 block">{periodMin} min</span>
        </div>
        <div className="bg-black/50 p-2 rounded-lg border border-white/10">
          <span className="text-[9px] text-slate-400 block uppercase">Orbital Velocity</span>
          <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{velocityKms} km/s</span>
        </div>
        <div className="bg-black/50 p-2 rounded-lg border border-white/10">
          <span className="text-[9px] text-slate-400 block uppercase">Nodal Swath FOV</span>
          <span className="text-xs font-bold text-amber-300 mt-0.5 block">{(altKm * 1.85).toFixed(0)} km</span>
        </div>
      </div>
    </div>
  );
}
