import React, { useState } from 'react';
import {
  ShieldAlert, Database, Cpu, Activity, Clock,
  Filter, AlertTriangle, CheckCircle2, ChevronRight, Eye
} from 'lucide-react';

/**
 * DebrisOrbitalEnvironment
 * Highly visual aerospace SSA orbital environment component:
 * - Earth with concentric orbital shells
 * - Satellite mission orbit in radiant cyan
 * - Multiple debris object trajectories
 * - Highlighted nearby objects with visual states (SAFE, MONITORED, NEARBY, HIGH ATTENTION)
 * - Example closest-approach event with TCA marker and distance annotation
 * - Compact side panel (Objects Analyzed, Nearby Objects, TCA Events, Screening Status)
 * - Time-To-Closest-Approach timeline
 * - Technical processing pipeline: TLE -> SGP4 -> SPATIAL FILTER -> TCA -> SCREENING
 */
export default function DebrisOrbitalEnvironment({
  debris = {},
  mission = {},
  status = 'COMPLETED'
}) {
  const [selectedDebris, setSelectedDebris] = useState('COSMOS 2251 DEB');
  const [timeStep, setTimeStep] = useState(2); // 0, 1, 2, 3 for timeline

  const altKm = mission.orbit?.altitude_km || 550;
  const incDeg = mission.orbit?.inclination_deg || 97.6;
  const objectsAnalyzed = debris.objects_analyzed || (status === 'COMPLETED' ? 8420 : 0);
  const nearbyCount = debris.nearby_objects ?? (status === 'COMPLETED' ? 12 : 0);
  const riskLevel = debris.risk_level || (status === 'COMPLETED' ? 'MEDIUM' : 'STANDBY');

  const debrisObjects = debris.orbital_objects || [
    { name: "COSMOS 2251 DEB", norad_id: 34105, distance_km: 4.2, relative_velocity_kms: 12.4, risk: "HIGH ATTENTION", inclination_deg: 74.0, tca: "T+14h 22m" },
    { name: "SL-16 R/B Fragment", norad_id: 22676, distance_km: 14.8, relative_velocity_kms: 7.8, risk: "MONITORED", inclination_deg: 71.0, tca: "T+26h 04m" },
    { name: "CZ-4B Splinter", norad_id: 26040, distance_km: 8.1, relative_velocity_kms: 10.2, risk: "NEARBY", inclination_deg: 98.8, tca: "T+38h 15m" },
    { name: "FENGYUN 1C DEB", norad_id: 30894, distance_km: 22.4, relative_velocity_kms: 14.1, risk: "SAFE", inclination_deg: 99.1, tca: "T+49h 50m" }
  ];

  // Pipeline stages
  const pipeline = [
    { code: 'TLE', title: 'TLE INGESTION', desc: 'Space-Track & CelesTrak' },
    { code: 'SGP4', title: 'SGP4 PROPAGATOR', desc: 'Perturbation Dynamics' },
    { code: 'FILTER', title: 'SPATIAL FILTER', desc: 'KD-Tree 25km Bounds' },
    { code: 'TCA', title: 'TCA SOLVER', desc: 'Conjunction Min-Dist' },
    { code: 'SCREEN', title: 'SCREENING MATRIX', desc: 'Probability Density' }
  ];

  // TCA events timeline
  const tcaEvents = [
    { id: 'TCA-1', obj: 'COSMOS 2251 DEB', time: 'T+14h 22m', dist: '4.2 km', risk: 'HIGH ATTENTION', color: '#f43f5e' },
    { id: 'TCA-2', obj: 'SL-16 R/B Frag', time: 'T+26h 04m', dist: '14.8 km', risk: 'MONITORED', color: '#00f2fe' },
    { id: 'TCA-3', obj: 'CZ-4B Splinter', time: 'T+38h 15m', dist: '8.1 km', risk: 'NEARBY', color: '#f59e0b' },
    { id: 'TCA-4', obj: 'FENGYUN 1C', time: 'T+49h 50m', dist: '22.4 km', risk: 'SAFE', color: '#10b981' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* PROCESSING PIPELINE DIAGRAM (NO WALLS OF TEXT) */}
      <div className="w-full bg-slate-950/80 border border-rose-500/30 rounded-xl p-3 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-rose-300 font-bold uppercase tracking-wider">
              CONJUNCTION ASSESSMENT PIPELINE (ISO 26900 COMPLIANT)
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-black/50 border border-white/10">
            SGP4 / KD-TREE ALGORITHM FLOW
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {pipeline.map((p, idx) => (
            <div
              key={p.code}
              className="relative p-2 rounded-lg bg-black/50 border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20">
                  {p.code}
                </span>
                <span className="text-[9px] font-mono text-slate-400">0{idx + 1}</span>
              </div>
              <div className="text-[11px] font-mono font-bold text-white truncate">{p.title}</div>
              <div className="text-[9px] font-mono text-slate-400 truncate">{p.desc}</div>
              {idx < pipeline.length - 1 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-rose-500/60 font-mono text-xs">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN VISUALIZATION & COMPACT SIDE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / CENTER: MAIN ORBITAL DEBRIS ENVIRONMENT (occupies ~68% width) */}
        <div className="lg:col-span-8 bg-black/75 border border-rose-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl flex flex-col justify-between hud-corner-ticks relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#f43f5e]" />
              <span className="font-bold text-white tracking-wider uppercase">
                FIGURE 4: ORBITAL DEBRIS ENVIRONMENT & CONJUNCTION GEOMETRY
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-300">
              <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">
                BAND: <strong className="text-cyan-300">{altKm} km</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
                TCA ACTIVE
              </span>
            </div>
          </div>

          {/* Large Aerospace Orbital Environment Graphic */}
          <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center">
            <svg
              viewBox="0 0 650 420"
              className="w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="debrisEarth" cx="45%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#0f172a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#030712" stopOpacity="1" />
                </radialGradient>

                <filter id="debrisGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background Coordinate Radar Rings (Orbital Altitude Shells) */}
              <g opacity="0.2" stroke="#38bdf8" strokeWidth="0.8">
                <circle cx="280" cy="210" r="230" fill="none" strokeDasharray="3 3" />
                <circle cx="280" cy="210" r="185" fill="none" strokeDasharray="3 3" />
                <circle cx="280" cy="210" r="140" fill="none" strokeDasharray="2 2" />
                <line x1="50" y1="210" x2="510" y2="210" strokeDasharray="3 3" />
                <line x1="280" y1="30" x2="280" y2="390" strokeDasharray="3 3" />
              </g>

              {/* Altitude Shell Labels */}
              <text x="285" y="75" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono">800 km SHELL</text>
              <text x="285" y="120" fill="#00f2fe" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold">550 km NOMINAL ORBIT</text>
              <text x="285" y="165" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono">350 km LEO</text>

              {/* EARTH AT CENTER (Radius 70px) */}
              <g id="debrisEarthGlobe">
                <circle cx="280" cy="210" r="76" fill="#0284c7" opacity="0.3" filter="url(#debrisGlow)" />
                <circle cx="280" cy="210" r="70" fill="url(#debrisEarth)" stroke="#38bdf8" strokeWidth="1" />
                <circle cx="280" cy="210" r="69" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.4" />
                <text x="260" y="214" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">EARTH</text>
              </g>

              {/* NOMINAL SATELLITE ORBIT (In Radiant Cyan) */}
              <g id="satelliteNominalOrbit">
                <ellipse
                  cx="280"
                  cy="210"
                  rx="185"
                  ry="95"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="2.2"
                  filter="url(#debrisGlow)"
                />
                {/* Nominal satellite craft */}
                <g transform="translate(390, 160)">
                  <circle cx="0" cy="0" r="10" fill="none" stroke="#00f2fe" strokeWidth="0.8">
                    <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="0" r="4.5" fill="#00f2fe" />
                  <rect x="-10" y="-2" width="6" height="4" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />
                  <rect x="4" y="-2" width="6" height="4" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />
                  <text x="14" y="4" fill="#00f2fe" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                    ● SATELLITE
                  </text>
                </g>
              </g>

              {/* DEBRIS OBJECT 1 (HIGH ATTENTION - COSMOS 2251 DEB) CONJUNCTION PATH */}
              <g id="debrisPath1">
                {/* Intersecting Orbit Arc */}
                <path
                  d="M 230 40 Q 370 120 460 270"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                />
                {/* Debris Marker */}
                <g transform="translate(425, 205)">
                  <circle cx="0" cy="0" r="5" fill="#f43f5e" filter="url(#debrisGlow)" />
                  <circle cx="0" cy="0" r="10" fill="none" stroke="#f43f5e" strokeWidth="1">
                    <animate attributeName="r" values="5;14;5" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0;0.9" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                  <text x="12" y="-4" fill="#f43f5e" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                    ● DEBRIS (COSMOS 2251)
                  </text>
                  <text x="12" y="7" fill="#cbd5e1" fontSize="8" fontFamily="JetBrains Mono">
                    NORAD: 34105
                  </text>
                </g>

                {/* TCA MARKER & DISTANCE ANNOTATION */}
                <g transform="translate(405, 178)">
                  <line x1="-15" y1="-18" x2="15" y2="18" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
                  <line x1="0" y1="0" x2="60" y2="-45" stroke="#f43f5e" strokeWidth="1.2" />
                  <circle cx="60" cy="-45" r="2.5" fill="#f43f5e" />

                  {/* TCA Callout Card */}
                  <g transform="translate(65, -70)">
                    <rect x="0" y="0" width="135" height="46" rx="5" fill="#040918" stroke="#f43f5e" strokeWidth="1.2" opacity="0.95" />
                    <text x="8" y="14" fill="#f43f5e" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="bold">
                      ⚠ CLOSEST APPROACH (TCA)
                    </text>
                    <text x="8" y="28" fill="#ffffff" fontSize="10.5" fontFamily="JetBrains Mono" fontWeight="bold">
                      d = 4.2 km (Miss)
                    </text>
                    <text x="8" y="40" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">
                      Δv = 12.4 km/s • T+14h 22m
                    </text>
                  </g>
                </g>
              </g>

              {/* DEBRIS OBJECT 2 (MONITORED - SL-16) */}
              <g id="debrisPath2">
                <path
                  d="M 120 120 Q 220 310 380 340"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <circle cx="190" cy="270" r="4" fill="#00f2fe" />
                <text x="130" y="295" fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono">
                  SL-16 R/B (d=14.8km)
                </text>
              </g>

              {/* DEBRIS OBJECT 3 (NEARBY - CZ-4B) */}
              <g id="debrisPath3">
                <path
                  d="M 440 80 Q 320 220 180 360"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.4"
                  strokeDasharray="4 2"
                  opacity="0.75"
                />
                <circle cx="340" cy="210" r="4.5" fill="#f59e0b" />
                <text x="350" y="225" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">
                  CZ-4B Splinter (d=8.1km)
                </text>
              </g>

              {/* VISUAL STATE LEGEND IN BOTTOM LEFT */}
              <g transform="translate(20, 345)">
                <rect x="0" y="0" width="230" height="52" rx="6" fill="#040918" stroke="#334155" strokeWidth="0.8" opacity="0.9" />
                <text x="8" y="14" fill="#94a3b8" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="bold">
                  CONJUNCTION SCREENING STATES:
                </text>
                <circle cx="15" cy="30" r="3.5" fill="#10b981" />
                <text x="24" y="33" fill="#10b981" fontSize="8" fontFamily="JetBrains Mono">SAFE</text>

                <circle cx="65" cy="30" r="3.5" fill="#00f2fe" />
                <text x="74" y="33" fill="#00f2fe" fontSize="8" fontFamily="JetBrains Mono">MONITORED</text>

                <circle cx="130" cy="30" r="3.5" fill="#f59e0b" />
                <text x="139" y="33" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">NEARBY</text>

                <circle cx="180" cy="30" r="3.5" fill="#f43f5e" />
                <text x="189" y="33" fill="#f43f5e" fontSize="8" fontFamily="JetBrains Mono">HIGH ATTN</text>
              </g>
            </svg>
          </div>
        </div>

        {/* RIGHT: COMPACT SIDE PANEL AS REQUESTED (occupies ~32% width) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          {/* Main 4 Metric Blocks */}
          <div className="bg-black/75 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl space-y-3 hud-corner-ticks">
            <div className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider border-b border-white/10 pb-2 flex items-center justify-between">
              <span>SSA Screening Summary</span>
              <span className="text-[10px] text-cyan-400">CelesTrak Ingestion</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 font-mono text-center">
              {/* OBJECTS ANALYZED */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                <span className="text-[9px] text-slate-400 block uppercase">OBJECTS ANALYZED</span>
                <span className="text-xl sm:text-2xl font-bold text-white mt-0.5 block">
                  {objectsAnalyzed}
                </span>
                <span className="text-[8.5px] text-slate-400">Active LEO Catalog</span>
              </div>

              {/* NEARBY OBJECTS */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                <span className="text-[9px] text-slate-400 block uppercase">NEARBY OBJECTS</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-300 mt-0.5 block">
                  {nearbyCount}
                </span>
                <span className="text-[8.5px] text-slate-400">Within ±25 km</span>
              </div>

              {/* TCA EVENTS */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                <span className="text-[9px] text-slate-400 block uppercase">TCA EVENTS</span>
                <span className="text-xl sm:text-2xl font-bold text-rose-400 mt-0.5 block">
                  11
                </span>
                <span className="text-[8.5px] text-slate-400">72h Propagation</span>
              </div>

              {/* SCREENING STATUS */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
                <span className="text-[9px] text-slate-400 block uppercase">SCREENING STATUS</span>
                <span className="text-sm font-bold text-cyan-300 mt-1.5 block px-1 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  MONITORED
                </span>
                <span className="text-[8.5px] text-slate-400 mt-0.5 block">Auto CAM Ready</span>
              </div>
            </div>

            {/* Selected Conjunction Event Detail */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase block mb-1.5">
                PRIMARY CONJUNCTION RISK:
              </span>
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Object:</span>
                  <span className="font-bold text-white">COSMOS 2251 DEB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Miss Distance:</span>
                  <span className="font-bold text-rose-400">4.2 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Rel. Velocity:</span>
                  <span className="font-bold text-amber-300">12.4 km/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Max Collision Prob:</span>
                  <span className="font-bold text-cyan-300">1.4 × 10⁻⁴</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Object List (Compact) */}
          <div className="bg-black/75 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-2 px-1">
              Proximate Catalog Conjunctions
            </span>
            <div className="space-y-1.5 font-mono text-xs max-h-[140px] overflow-y-auto">
              {debrisObjects.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-white/5 hover:border-cyan-500/30 transition"
                >
                  <div>
                    <span className="font-bold text-white block truncate text-[11px]">{obj.name}</span>
                    <span className="text-[9px] text-slate-400">d = {obj.distance_km} km</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    obj.risk === 'HIGH ATTENTION' || obj.risk === 'High' ? 'bg-rose-950/70 text-rose-300 border-rose-500/40' :
                    obj.risk === 'NEARBY' || obj.risk === 'Medium' ? 'bg-amber-950/70 text-amber-300 border-amber-500/40' :
                    'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {obj.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TIME-TO-CLOSEST-APPROACH (TCA) TIMELINE */}
      <div className="w-full bg-slate-950/85 border border-white/10 rounded-xl p-4 shadow-xl font-mono">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white uppercase tracking-wider">
              TIME-TO-CLOSEST-APPROACH (TCA) CONJUNCTION TIMELINE
            </span>
          </div>
          <span className="text-[10px] text-slate-400">72-Hour Screening Window</span>
        </div>

        {/* Visual Timeline Bar */}
        <div className="relative pt-4 pb-2">
          {/* Horizontal Track Line */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full relative">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 rounded-full w-full opacity-60" />
          </div>

          {/* Event Markers along the timeline */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {tcaEvents.map((evt, idx) => (
              <div
                key={evt.id}
                className="relative p-2 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-400 transition"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold" style={{ color: evt.color }}>{evt.id}</span>
                  <span className="text-slate-400">{evt.time}</span>
                </div>
                <div className="text-[11px] font-bold text-white truncate mt-1">{evt.obj}</div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
                  <span>Miss: <strong className="text-white">{evt.dist}</strong></span>
                  <span style={{ color: evt.color }}>{evt.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
