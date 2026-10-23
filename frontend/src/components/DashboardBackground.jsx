import React, { useEffect, useState } from 'react';
import earthHeroImg from '../assets/images/earth_orbit_hero.jpg';

/**
 * DashboardBackground Component
 * Space Situational Awareness (SSA) Control Room Visual Identity
 * 
 * - Realistic wide-angle view of Earth from orbit with curved Earth horizon and atmospheric glow
 * - Curved Earth horizon situated primarily in the upper background
 * - Smooth fade into deep solid graphite/charcoal (#080c14) across the lower interface
 * - Restrained orbital tracking aesthetic: faint orbital arcs, small telemetry tracking markers,
 *   subtle coordinate crosshairs, and slow-moving satellite node
 * - Low visual contrast behind KPI cards, agent status indicators, and charts
 */
export default function DashboardBackground() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setOffsetY(window.scrollY * 0.08);
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
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-[#070b12]"
    >
      {/* 1. PHOTOREALISTIC ORBITAL EARTH HORIZON (Upper Visual Anchor) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat will-change-transform transition-transform duration-300"
        style={{
          backgroundImage: `url(${earthHeroImg})`,
          backgroundPosition: 'center 12%',
          transform: `translate3d(0, ${-offsetY}px, 0) scale(1.04)`,
          filter: 'brightness(0.92) contrast(1.08) saturate(1.05)',
        }}
      />

      {/* 2. RESTRAINED STARFIELD ACCENT (Confined to upper cosmos) */}
      <div
        className="absolute top-0 left-0 right-0 h-[45vh] opacity-40"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 80px 140px, #e2e8f0, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 160px 50px, #bae6fd, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 260px 190px, #ffffff, rgba(0,0,0,0)),
                            radial-gradient(1.2px 1.2px at 380px 80px, #e0f2fe, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 520px 220px, #ffffff, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 640px 110px, #93c5fd, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 780px 60px, #ffffff, rgba(0,0,0,0)),
                            radial-gradient(1.2px 1.2px at 900px 180px, #e2e8f0, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 1100px 70px, #ffffff, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 1280px 150px, #bae6fd, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 1440px 40px, #ffffff, rgba(0,0,0,0)),
                            radial-gradient(1.2px 1.2px at 1620px 130px, #ffffff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 1800px 90px, #e2e8f0, rgba(0,0,0,0))`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '1920px 300px',
        }}
      />

      {/* 3. RESTRAINED ORBITAL SURVEILLANCE TELEMETRY & TRACKING ARCS */}
      <svg
        viewBox="0 0 1920 1080"
        className="absolute inset-0 w-full h-full select-none"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <linearGradient id="orbArcGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.0" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="orbArcGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.0" />
            <stop offset="45%" stopColor="#94a3b8" stopOpacity="0.18" />
            <stop offset="85%" stopColor="#64748b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="horizonGlowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Primary SSA Orbital Surveillance Arc */}
        <path
          d="M -100,320 Q 960,-60 2020,290"
          fill="none"
          stroke="url(#orbArcGrad1)"
          strokeWidth="1.2"
          strokeDasharray="6 8"
        />

        {/* Secondary Inclined Orbital Conjunction Track */}
        <path
          d="M 50,460 Q 820,120 1950,180"
          fill="none"
          stroke="url(#orbArcGrad2)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Equatorial Baseline Reference Vector */}
        <line
          x1="120"
          y1="230"
          x2="1800"
          y2="230"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth="0.8"
          strokeDasharray="2 12"
        />

        {/* Orbital Tracking Telemetry Markers */}
        {/* Node 1: Primary LEO Observation Track */}
        <g transform="translate(680, 115)">
          <circle cx="0" cy="0" r="3" fill="#38bdf8" />
          <circle cx="0" cy="0" r="7" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" className="animate-spin" style={{ animationDuration: '16s' }} />
          <line x1="12" y1="-12" x2="28" y2="-28" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="0.8" />
          <line x1="28" y1="-28" x2="135" y2="-28" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="0.8" />
          <text x="32" y="-32" fill="#7dd3fc" fontSize="9" fontFamily="monospace" letterSpacing="0.08em" opacity="0.85">
            LEO-SAT [SSO 550KM]
          </text>
          <text x="32" y="-20" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.7">
            INC 97.6° | VEL 7.59 km/s
          </text>
        </g>

        {/* Node 2: Ground Station Conjunction Beacon */}
        <g transform="translate(1320, 185)">
          <circle cx="0" cy="0" r="2.5" fill="#38bdf8" opacity="0.8" />
          <line x1="-8" y1="0" x2="8" y2="0" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.8" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.8" />
          <line x1="10" y1="10" x2="24" y2="24" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="0.8" />
          <line x1="24" y1="24" x2="110" y2="24" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="0.8" />
          <text x="28" y="20" fill="#cbd5e1" fontSize="8" fontFamily="monospace" letterSpacing="0.05em" opacity="0.75">
            SSA-RADAR // SHAR
          </text>
          <text x="28" y="32" fill="#64748b" fontSize="7.5" fontFamily="monospace" opacity="0.7">
            AZ 142.4° • EL 48.2°
          </text>
        </g>

        {/* Reticles and Range Ticks */}
        <g opacity="0.25">
          <path d="M 240,160 L 255,160 M 240,160 L 240,175" stroke="#38bdf8" strokeWidth="1" fill="none" />
          <path d="M 1680,140 L 1665,140 M 1680,140 L 1680,155" stroke="#38bdf8" strokeWidth="1" fill="none" />
        </g>
      </svg>

      {/* 4. SOLID GRAPHITE INTERFACE TRANSITION LAYER (Guarantees Low Contrast behind KPIs & Charts) */}
      {/* Upper subtle atmospheric vignette to frame top navigation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(3, 7, 18, 0.45) 0%, 
              rgba(3, 7, 18, 0.25) 120px, 
              rgba(7, 11, 20, 0.40) 240px, 
              rgba(8, 12, 20, 0.72) 380px, 
              rgba(8, 12, 20, 0.94) 520px, 
              #080c14 660px, 
              #080c14 100%
            ),
            radial-gradient(circle at 50% 15%, transparent 35%, rgba(4, 8, 16, 0.6) 80%, #080c14 100%)
          `,
        }}
      />

      {/* Subtle Control Room Tactical Horizon Accent Line */}
      <div
        className="absolute left-0 right-0 top-[380px] h-px opacity-20 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(56, 189, 248, 0.4) 30%, rgba(148, 163, 184, 0.3) 70%, transparent 95%)',
        }}
      />
    </div>
  );
}
