import React, { useEffect, useState } from 'react';
import earthObservationImg from '../assets/images/earth_observation_lab.jpg';

/**
 * MissionPlanningBackground Component
 * Earth Observation & Mission Design Laboratory Visual Identity
 * 
 * - High-altitude nadir view of Earth's surface (coastlines, terrain, clouds)
 * - Muted topographic Earth palette: graphite, warm gray, desaturated olive, steel-blue
 * - Restrained satellite ground track with directional indicators
 * - Thin sensor coverage swath corridor (120 km swath width representation)
 * - Geographic coordinate grid tick marks, corner crosses, and map scale
 * - Daylight high-altitude Earth observation vantage — NO curved horizon, NO stars
 * - Engineered dark laboratory vignette ensuring maximum legibility of form panels
 */
export default function MissionPlanningBackground() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setOffsetY(window.scrollY * 0.05);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-[#0a0f16]"
    >
      {/* 1. HIGH-ALTITUDE EARTH OBSERVATION SATELLITE TERRAIN IMAGE */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat will-change-transform transition-transform duration-300"
        style={{
          backgroundImage: `url(${earthObservationImg})`,
          backgroundPosition: 'center 35%',
          transform: `translate3d(0, ${-offsetY}px, 0) scale(1.03)`,
          filter: 'brightness(0.72) contrast(1.10) saturate(0.85)',
        }}
      />

      {/* 2. CARTOGRAPHIC GEODETIC GRID OVERLAY (Fine 64px Grid Lines) */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* 3. SCIENTIFIC EARTH OBSERVATION MISSION DESIGN OVERLAYS (SVG) */}
      <svg
        viewBox="0 0 1920 1080"
        className="absolute inset-0 w-full h-full select-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Swath Gradient */}
          <linearGradient id="swathCorridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.03" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.03" />
          </linearGradient>

          <pattern id="swathHatch" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* --- SENSOR COVERAGE SWATH CORRIDOR (120 KM SWATH) --- */}
        <polygon
          points="280,-40 440,-40 1620,1120 1460,1120"
          fill="url(#swathCorridorGrad)"
        />
        <polygon
          points="280,-40 440,-40 1620,1120 1460,1120"
          fill="url(#swathHatch)"
        />

        {/* Swath Lateral Boundaries */}
        <line
          x1="280"
          y1="-40"
          x2="1460"
          y2="1120"
          stroke="rgba(56, 189, 248, 0.3)"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
        <line
          x1="440"
          y1="-40"
          x2="1620"
          y2="1120"
          stroke="rgba(56, 189, 248, 0.3)"
          strokeWidth="1"
          strokeDasharray="6 6"
        />

        {/* --- SATELLITE GROUND TRACK VECTOR (Nadir Centerline) --- */}
        <line
          x1="360"
          y1="-40"
          x2="1540"
          y2="1120"
          stroke="rgba(241, 245, 249, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="10 8"
        />

        {/* Ground Track Direction Chevrons & Annotations */}
        <g transform="translate(680, 280) rotate(42)">
          <path d="M -8,-6 L 0,0 L -8,6" fill="none" stroke="rgba(241, 245, 249, 0.7)" strokeWidth="1.5" />
          <path d="M 0,-6 L 8,0 L 0,6" fill="none" stroke="rgba(241, 245, 249, 0.7)" strokeWidth="1.5" />
          <text x="18" y="4" fill="#94a3b8" fontSize="8" fontFamily="monospace" letterSpacing="0.1em">
            &gt;&gt; SUBSATELLITE GROUND TRACK &gt;&gt;
          </text>
        </g>

        {/* Subsatellite Epoch Point T-00:00 */}
        <g transform="translate(420, 30)">
          <circle cx="0" cy="0" r="3" fill="#38bdf8" />
          <line x1="8" y1="-8" x2="20" y2="-20" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="0.8" />
          <line x1="20" y1="-20" x2="110" y2="-20" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="0.8" />
          <text x="24" y="-24" fill="#7dd3fc" fontSize="8.5" fontFamily="monospace">
            ASCENDING NODE T+00:00
          </text>
          <text x="24" y="-13" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
            SWATH WIDTH: 120 KM
          </text>
        </g>

        {/* Subsatellite Epoch Point T+01:45 */}
        <g transform="translate(1080, 680)">
          <circle cx="0" cy="0" r="3" fill="#38bdf8" />
          <line x1="8" y1="8" x2="20" y2="20" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="0.8" />
          <line x1="20" y1="20" x2="115" y2="20" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="0.8" />
          <text x="24" y="16" fill="#7dd3fc" fontSize="8.5" fontFamily="monospace">
            GROUND SPEED: 7.59 KM/S
          </text>
          <text x="24" y="27" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
            INCLINATION: 97.6° SSO
          </text>
        </g>

        {/* --- TARGET OBSERVATION RETICLE (Geographic Target) --- */}
        <g transform="translate(860, 470)">
          {/* Target Bounding Box */}
          <rect
            x="-45"
            y="-35"
            width="90"
            height="70"
            fill="rgba(56, 189, 248, 0.05)"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
          {/* Corner Ticks */}
          <path d="M -45,-25 L -45,-35 L -35,-35" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
          <path d="M 45,-25 L 45,-35 L 35,-35" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
          <path d="M -45,25 L -45,35 L -35,35" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
          <path d="M 45,25 L 45,35 L 35,35" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
          {/* Center Point */}
          <circle cx="0" cy="0" r="2.5" fill="#38bdf8" />
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#38bdf8" strokeWidth="0.8" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke="#38bdf8" strokeWidth="0.8" />
          {/* Target Label */}
          <text x="52" y="-12" fill="#e2e8f0" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
            TARGET REVISIT ZONE
          </text>
          <text x="52" y="2" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
            LAT 13.0827°N • LON 80.2707°E
          </text>
          <text x="52" y="14" fill="#64748b" fontSize="7" fontFamily="monospace">
            FOV REQUISITION: OPTICAL/HYPERSPECTRAL
          </text>
        </g>

        {/* --- CARTOGRAPHIC COORDINATE AXIS TICK MARKS --- */}
        {/* Top Latitude / Longitude Markings */}
        <g fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.6">
          <text x="320" y="25">78°30'E</text>
          <line x1="340" y1="28" x2="340" y2="36" stroke="#94a3b8" strokeWidth="1" />

          <text x="640" y="25">79°15'E</text>
          <line x1="660" y1="28" x2="660" y2="36" stroke="#94a3b8" strokeWidth="1" />

          <text x="960" y="25">80°00'E</text>
          <line x1="980" y1="28" x2="980" y2="36" stroke="#94a3b8" strokeWidth="1" />

          <text x="1280" y="25">80°45'E</text>
          <line x1="1300" y1="28" x2="1300" y2="36" stroke="#94a3b8" strokeWidth="1" />

          <text x="1600" y="25">81°30'E</text>
          <line x1="1620" y1="28" x2="1620" y2="36" stroke="#94a3b8" strokeWidth="1" />
        </g>

        {/* Left Side Latitude Markings */}
        <g fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.6">
          <text x="12" y="180">14°30'N</text>
          <line x1="50" y1="177" x2="58" y2="177" stroke="#94a3b8" strokeWidth="1" />

          <text x="12" y="380">13°45'N</text>
          <line x1="50" y1="377" x2="58" y2="377" stroke="#94a3b8" strokeWidth="1" />

          <text x="12" y="580">13°00'N</text>
          <line x1="50" y1="577" x2="58" y2="577" stroke="#94a3b8" strokeWidth="1" />

          <text x="12" y="780">12°15'N</text>
          <line x1="50" y1="777" x2="58" y2="777" stroke="#94a3b8" strokeWidth="1" />
        </g>

        {/* Map Scale Bar in Lower Right */}
        <g transform="translate(1680, 1020)" opacity="0.65">
          <line x1="0" y1="0" x2="120" y2="0" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="60" y1="-3" x2="60" y2="3" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="120" y1="-4" x2="120" y2="4" stroke="#cbd5e1" strokeWidth="2" />
          <text x="0" y="-8" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">0</text>
          <text x="50" y="-8" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">50</text>
          <text x="105" y="-8" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">100 km</text>
          <text x="0" y="16" fill="#94a3b8" fontSize="7" fontFamily="monospace">WGS84 / NADIR EO</text>
        </g>
      </svg>

      {/* 4. SCIENTIFIC LABORATORY GRADIENT OVERLAY (Muted Topographic & Graphite Contrast) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(10, 15, 22, 0.60) 0%, 
              rgba(11, 16, 24, 0.45) 120px, 
              rgba(11, 16, 24, 0.68) 320px, 
              rgba(10, 14, 21, 0.88) 580px, 
              rgba(9, 13, 19, 0.96) 820px, 
              #090d13 100%
            ),
            radial-gradient(circle at 75% 25%, transparent 20%, rgba(10, 15, 23, 0.55) 70%, #090d13 100%)
          `,
        }}
      />
    </div>
  );
}
