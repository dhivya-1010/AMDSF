import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket, ShieldAlert, SunMedium, Wrench, Satellite,
  Award, ArrowRight, ChevronRight, Layers, Cpu,
  Activity, Radio, Globe2, Sparkles, CheckCircle2,
  ShieldCheck, ArrowDown, Zap, Eye, Compass,
  Sliders, Database, AlertTriangle, Play
} from 'lucide-react';
import { SPACE_SCENES } from '../data/spaceImagery';
import StarfieldCanvas from './StarfieldCanvas';

const SCENES = [
  { id: 'earth', name: 'Earth Orbit', image: SPACE_SCENES.earth.image },
  { id: 'rocket', name: 'Rocket Launch', image: SPACE_SCENES.rocket.image },
  { id: 'orbit', name: 'Agent Network', image: SPACE_SCENES.orbit.image },
  { id: 'debris', name: 'Orbital Debris', image: SPACE_SCENES.debris.image },
  { id: 'sun', name: 'Space Weather', image: SPACE_SCENES.sun.image },
  { id: 'coverage', name: 'Satellite Coverage', image: SPACE_SCENES.coverage.image },
  { id: 'horizon', name: 'Mission Decision', image: SPACE_SCENES.horizon.image },
];

export default function CinematicScrollStory({ activeMission, analysisResults }) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.45;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(window.scrollY / (totalHeight || 1), 0), 1);
      setScrollProgress(progress);

      sectionRefs.current.forEach((ref, index) => {
        if (ref) {
          const top = ref.offsetTop;
          const height = ref.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSceneIndex(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sampleMission = activeMission || {
    mission_name: "Earth Observation Reconnaissance",
    mission_id: "AMDSF-LEO-01",
    orbit: { altitude_km: 550, inclination_deg: 97.5, eccentricity: 0.001 },
    payload: { mass_kg: 450, power_w: 600 },
    ground_target: { name: "Regional Observation Grid", latitude: 39.9, longitude: 116.4 },
    launch: { site: "Satish Dhawan Space Centre (SDSC)", vehicle: "PSLV-XL" }
  };

  return (
    <div className="relative w-full">
      {/* ============================================================== */}
      {/* FIXED CINEMATIC BACKGROUND CROSSFADE SYSTEM                    */}
      {/* ============================================================== */}
      <div className="fixed inset-0 w-full h-full -z-20 overflow-hidden pointer-events-none">
        {SCENES.map((scene, index) => {
          const isActive = index === activeSceneIndex;
          const isNext = index === activeSceneIndex + 1;
          const isPrev = index === activeSceneIndex - 1;

          return (
            <div
              key={scene.id}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out will-change-transform ${
                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{
                backgroundImage: `url(${scene.image})`,
                backgroundPosition: 'center center',
              }}
            />
          );
        })}

        {/* Global Atmospheric Space Contrast & Directional Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(0, 0, 0, 0.58) 0%, rgba(0, 0, 0, 0.52) 40%, rgba(0, 0, 0, 0.45) 75%, rgba(0, 0, 0, 0.42) 100%), linear-gradient(180deg, rgba(3, 7, 18, 0.65) 0%, transparent 20%, transparent 80%, rgba(3, 7, 18, 0.75) 100%)',
          }}
        />
        {/* Subtle Space Vignette for Deep Space Contrast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 60% 50%, transparent 45%, rgba(0, 0, 0, 0.50) 100%)',
          }}
        />
      </div>

      {/* Floating Starfield Canvas */}
      <StarfieldCanvas count={70} opacity={0.45} />

      {/* Persistent Scene Indicator HUD (Right Edge) */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3 pointer-events-auto">
        <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/60 border border-cyan-500/30 backdrop-blur-md mb-1">
          SCENE 0{activeSceneIndex + 1} / 07
        </div>
        {SCENES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => {
              sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex items-center gap-3 cursor-pointer"
          >
            <span
              className={`text-[11px] font-mono transition-all duration-300 ${
                idx === activeSceneIndex
                  ? 'text-cyan-300 font-semibold opacity-100 translate-x-0'
                  : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2'
              }`}
            >
              {s.name}
            </span>
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === activeSceneIndex
                  ? 'bg-cyan-400 ring-4 ring-cyan-400/30 scale-125'
                  : 'bg-white/20 hover:bg-white/60'
              }`}
            />
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* SCENE 1: EARTH FROM ORBIT (Cinematic Hero Viewport)            */}
      {/* ============================================================== */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="min-h-screen flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="pt-8 sm:pt-16 max-w-3xl space-y-6">
          {/* Military / Space Operations Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/50 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-xl shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold tracking-wider uppercase">SPACE MISSION DECISION SUPPORT FRAMEWORK</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display text-white tracking-tight leading-none drop-shadow-2xl">
              AMDSF
              <span className="block text-xl sm:text-3xl lg:text-4xl text-cyan-300 font-mono font-normal mt-2">
                Agentic Multi-Domain Space Mission Intelligence
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-mono leading-relaxed max-w-2xl drop-shadow-md">
              Integrated intelligence for space mission planning. Autonomous multi-agent framework arbitrating orbital collision risks, solar weather dynamics, launch feasibility, and ground revisit geometry.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              to="/planning"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Rocket className="w-5 h-5" />
              <span>START MISSION PLANNING</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => sectionRefs.current[1]?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-4 rounded-xl bg-black/40 hover:bg-black/60 text-slate-200 border border-white/20 font-mono text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-xl transition cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>EXPLORE MISSION PIPELINE</span>
              <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />
            </button>
          </div>
        </div>

        {/* Live Space Telemetry Tickers */}
        <div className="hud-glass p-4 sm:p-5 mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SYSTEM ARCHITECTURE</span>
            </div>
            <p className="text-white font-semibold">4 Autonomous Domain Agents</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONJUNCTION CATALOG</span>
            </div>
            <p className="text-cyan-300 font-semibold">CelesTrak / LeoLabs Live Feed</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <SunMedium className="w-3.5 h-3.5 text-amber-400" />
              <span>SOLAR OBSERVATORY</span>
            </div>
            <p className="text-amber-300 font-semibold">NOAA SWPC • NASA DONKI</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>ARBITRATION ENGINE</span>
            </div>
            <p className="text-blue-300 font-semibold">Explainable LLM Orchestration</p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 2: ROCKET LAUNCH (From Mission Plan to Launch Decision)  */}
      {/* ============================================================== */}
      <section
        ref={(el) => (sectionRefs.current[1] = el)}
        className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="max-w-4xl space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Rocket className="w-3.5 h-3.5" />
              <span>AEROSPACE MISSION LIFECYCLE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight drop-shadow-lg">
              FROM MISSION PLAN<br />TO LAUNCH DECISION
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-mono max-w-2xl leading-relaxed">
              Every spaceflight decision demands continuous cross-domain validation. AMDSF unifies trajectory feasibility, debris conjunctions, solar flares, and ground targets into a single deterministic decision path.
            </p>
          </div>

          {/* Vertical Tactical Process Pipeline */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-cyan-500/40 space-y-6">
            {[
              {
                step: '01',
                title: 'MISSION PARAMETERS',
                desc: 'Orbit altitude (LEO/SSO), inclination, payload mass, target coordinates, and preferred launch date.',
                icon: Sliders,
              },
              {
                step: '02',
                title: 'MULTI-AGENT ANALYSIS',
                desc: '4 domain agents trigger in parallel, querying live orbital catalogs, solar flux feeds, and propulsion models.',
                icon: Cpu,
              },
              {
                step: '03',
                title: 'RISK ASSESSMENT',
                desc: 'Miss-distance vectors, atmospheric drag inflation, propulsion margin deficits, and revisit latency gaps.',
                icon: ShieldAlert,
              },
              {
                step: '04',
                title: 'LAUNCH WINDOW & ORBIT INSERTION',
                desc: 'Collision avoidance verification, solar quiet periods, and optimal ground track illumination slots.',
                icon: Compass,
              },
              {
                step: '05',
                title: 'MISSION DECISION',
                desc: 'Autonomous Orchestrator synthesizes trade-offs into an actionable GO / NO-GO recommendation with rationale.',
                icon: Award,
              },
            ].map((node) => {
              const NodeIcon = node.icon;
              return (
                <div key={node.step} className="relative group">
                  {/* Glowing Node Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-space-950 border-2 border-cyan-400 flex items-center justify-center group-hover:scale-125 transition-transform shadow-[0_0_12px_rgba(0,242,254,0.6)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                  </div>

                  <div className="hud-glass p-4 sm:p-5 rounded-xl border border-white/10 group-hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between font-mono text-xs mb-1">
                      <span className="text-cyan-400 font-bold flex items-center gap-2">
                        <NodeIcon className="w-4 h-4" />
                        {node.title}
                      </span>
                      <span className="text-slate-500 font-semibold">{node.step}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 leading-relaxed">
                      {node.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/planning"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition"
            >
              <span>CONFIGURE MISSION PARAMETERS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 3: AGENT CONSTELLATION NETWORK                          */}
      {/* ============================================================== */}
      <section
        ref={(el) => (sectionRefs.current[2] = el)}
        className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-xl">
              <Cpu className="w-3.5 h-3.5" />
              <span>MULTI-AGENT CONSTELLATION TOPOLOGY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
              4 Autonomous Domain Evaluators
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-mono leading-relaxed">
              Specialized agents analyzing distinct physics and mission constraints, arbitrated in real time by the Autonomous Orchestrator.
            </p>
          </div>

          {/* Dynamic Interactive Constellation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'debris',
                name: 'Orbital Debris Agent',
                domain: 'Space Situational Awareness',
                desc: 'TLE orbital propagation, close approach conjunction filtering, miss-distance vectors, and collision probability.',
                metric: 'Miss-Distance / SSN',
                icon: ShieldAlert,
                color: 'from-rose-500/20 to-transparent border-rose-500/40 text-rose-400',
                link: '/debris'
              },
              {
                id: 'weather',
                name: 'Space Weather Agent',
                domain: 'Heliophysics & Solar Wind',
                desc: 'Real-time planetary Kp geomagnetic indices, coronal mass ejections, solar proton radiation, and upper atmospheric drag.',
                metric: 'Kp Index / NOAA SWPC',
                icon: SunMedium,
                color: 'from-amber-500/20 to-transparent border-amber-500/40 text-amber-400',
                link: '/weather'
              },
              {
                id: 'feasibility',
                name: 'Feasibility Agent',
                domain: 'Astrodynamics & Propulsion',
                desc: 'Tsiolkovsky delta-V budgets, staging mass ratios, launcher payload capacity, and launch window azimuth constraints.',
                metric: 'Delta-V / Isp Budget',
                icon: Wrench,
                color: 'from-blue-500/20 to-transparent border-blue-500/40 text-blue-400',
                link: '/feasibility'
              },
              {
                id: 'coverage',
                name: 'Coverage Agent',
                domain: 'Ground Track & Revisit Geometry',
                desc: 'Sensor footprint cone calculations, target ground track revisit latency, slant range, and population coverage.',
                metric: 'Revisit Latency / FOV',
                icon: Satellite,
                color: 'from-emerald-500/20 to-transparent border-emerald-500/40 text-emerald-400',
                link: '/coverage'
              },
            ].map((ag) => {
              const AgIcon = ag.icon;
              return (
                <div
                  key={ag.id}
                  className="hud-glass p-6 rounded-2xl flex flex-col justify-between hover:border-cyan-400/60 transition-all duration-300 group hover:-translate-y-1.5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ag.color} border flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <AgIcon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-400">
                        {ag.metric}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold font-mono text-white group-hover:text-cyan-300 transition">
                        {ag.name}
                      </h3>
                      <p className="text-[11px] text-cyan-400/90 font-mono mt-0.5">
                        {ag.domain}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      {ag.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                    <Link
                      to={ag.link}
                      className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                    >
                      <span>Launch Telemetry</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </Link>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Central Orchestrator Arbitration Card */}
          <div className="hud-glass p-6 sm:p-8 rounded-2xl border border-cyan-500/40 flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(0,242,254,0.3)]">
                <Award className="w-7 h-7 text-cyan-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 font-semibold uppercase">
                  <span>CENTRAL ARBITRATION ENGINE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold font-mono text-white">
                  Autonomous Multi-Domain Orchestrator
                </h4>
                <p className="text-xs text-slate-300 font-mono max-w-xl">
                  Synthesizes all 4 agent evaluation vectors, resolving trade-offs (e.g. higher drag risk vs optimal sensor revisit) to produce explainable Go/No-Go decisions.
                </p>
              </div>
            </div>

            <Link
              to="/recommendation"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 shrink-0 transition"
            >
              <span>VIEW ARBITRATION MATRIX</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 4: DEBRIS INTELLIGENCE SCENE                            */}
      {/* ============================================================== */}
      <section
        ref={(el) => (sectionRefs.current[3] = el)}
        className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ORBITAL CONJUNCTION INTELLIGENCE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight">
              Orbital Debris & Proximity Vectors
            </h2>

            <p className="text-sm text-slate-200 font-mono leading-relaxed">
              Real-time Space Situational Awareness monitoring thousands of trackable debris fragments. AMDSF calculates miss distances, radial separation, and collision probability for any planned orbit.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400">Monitoring Standard</span>
                <span className="text-white font-semibold">18th Space Defense Squadron SSN</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400">Conjunction Warning Threshold</span>
                <span className="text-rose-400 font-semibold">&lt; 5.0 km Radial Distance</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400">Orbit Propagation</span>
                <span className="text-cyan-300 font-semibold">SGP4 / SDP4 Perturbation Model</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/debris"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-xl shadow-rose-500/20 transition"
              >
                <span>EXPLORE DEBRIS CONJUNCTION MAP</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Debris Telemetry HUD Glass Card */}
          <div className="lg:col-span-7">
            <div className="hud-glass p-6 sm:p-8 rounded-2xl border border-rose-500/30 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5 font-mono text-xs text-rose-300 font-bold uppercase">
                  <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span>LIVE CONJUNCTION RADAR TELEMETRY</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">REF: CELESTRAK-LEO</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10">
                  <span className="text-slate-400 text-[10px] block uppercase">Tracked Objects in Shell</span>
                  <span className="text-xl font-bold text-white mt-1 block">4,280+</span>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">Cataloged & Propagated</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10">
                  <span className="text-slate-400 text-[10px] block uppercase">Minimum Miss Distance</span>
                  <span className="text-xl font-bold text-amber-300 mt-1 block">12.4 km</span>
                  <span className="text-[10px] text-amber-400 mt-0.5 block">Safe Radial Clearance</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block uppercase">Collision Probability</span>
                  <span className="text-xl font-bold text-emerald-300 mt-1 block">1.2 × 10⁻⁶</span>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">Nominal Safety Envelope</span>
                </div>
              </div>

              {/* Sample Conjunction Object List */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Closest Tracked Objects:</span>
                {[
                  { name: 'COSMOS 2251 DEB (NORAD 34005)', distance: '12.4 km', velocity: '14.8 km/s', status: 'MONITORED' },
                  { name: 'FENGYUN 1C DEB (NORAD 31112)', distance: '18.9 km', velocity: '15.1 km/s', status: 'MONITORED' },
                  { name: 'STARLINK-1420 (NORAD 45521)', distance: '34.2 km', velocity: '7.6 km/s', status: 'NOMINAL' },
                ].map((obj, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 text-slate-300">
                    <span className="font-semibold text-white">{obj.name}</span>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-amber-300">{obj.distance}</span>
                      <span className="text-slate-400">{obj.velocity}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px]">{obj.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 5: SPACE WEATHER SCENE                                  */}
      {/* ============================================================== */}
      <section
        ref={(el) => (sectionRefs.current[4] = el)}
        className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Solar Weather HUD Card */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="hud-glass p-6 sm:p-8 rounded-2xl border border-amber-500/30 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5 font-mono text-xs text-amber-300 font-bold uppercase">
                  <SunMedium className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>HELIOPHYSICAL REAL-TIME FLUX MONITOR</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">FEEDS: NOAA SWPC • SDO</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10">
                  <span className="text-slate-400 text-[10px] block uppercase">Planetary Kp Index</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-emerald-300">2.3</span>
                    <span className="text-[10px] text-slate-400">/ 9.0</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">Quiet / Minor Geomagnetic</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10">
                  <span className="text-slate-400 text-[10px] block uppercase">Solar Wind Velocity</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-amber-300">418</span>
                    <span className="text-[10px] text-slate-400">km/s</span>
                  </div>
                  <span className="text-[10px] text-amber-400 mt-0.5 block">Nominal Plasma Velocity</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block uppercase">Atmospheric Drag Impact</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-cyan-300">LOW</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 mt-0.5 block">Neutral Density Nominal</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Coronal Mass Ejection (CME) Warning:</span>
                  <span className="text-emerald-400 font-semibold">NO EARTH-DIRECTED CMES</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Solar Flare Class (24h Peak):</span>
                  <span className="text-amber-300 font-semibold">C1.2 (Sub-radiational)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Upper Atmosphere Exospheric Temp:</span>
                  <span className="text-cyan-300 font-semibold">920 K (Standard baseline)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono">
              <SunMedium className="w-3.5 h-3.5" />
              <span>SOLAR DYNAMICS & DRAG INFLATION</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight">
              Space Weather & Atmospheric Drag
            </h2>

            <p className="text-sm text-slate-200 font-mono leading-relaxed">
              Solar extreme ultraviolet flares and solar wind plasma heat the upper thermosphere, expanding density at LEO altitudes. AMDSF estimates orbital decay velocity and Single Event Upset (SEU) avionics risks.
            </p>

            <div className="pt-2">
              <Link
                to="/weather"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition"
              >
                <span>VIEW SPACE WEATHER TELEMETRY</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 6: SATELLITE COVERAGE & COMMUNICATION SCENE              */}
      {/* ============================================================== */}
      <section
        ref={(el) => (sectionRefs.current[5] = el)}
        className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <Satellite className="w-3.5 h-3.5" />
              <span>GROUND REVISIT & TARGET COVERAGE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight">
              Satellite Communication & Surface Footprint
            </h2>

            <p className="text-sm text-slate-200 font-mono leading-relaxed">
              Calculates line-of-sight communication downlink windows, sensor swath footprint diameter, slant range angles, and mean revisit latency over regional ground targets.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400">Target Ground Station</span>
                <span className="text-cyan-300 font-semibold">{sampleMission.ground_target?.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400">Ground Swath Width</span>
                <span className="text-emerald-300 font-semibold">180 km Ground Track Swath</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400">Sensor Field of View</span>
                <span className="text-white font-semibold">30° Half-Angle Conical FOV</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/coverage"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition"
              >
                <span>OPEN GROUND TRACK COVERAGE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Coverage Geometry HUD Card */}
          <div className="lg:col-span-7">
            <div className="hud-glass p-6 sm:p-8 rounded-2xl border border-emerald-500/30 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5 font-mono text-xs text-emerald-300 font-bold uppercase">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>EARTH OBSERVATION GEOMETRY</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">ORBIT: 550 km SSO</span>
              </div>

              {/* Geometry Pipeline Diagram */}
              <div className="p-5 rounded-xl bg-black/50 border border-white/10 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-cyan-300 border-b border-white/5 pb-2">
                  <span className="flex items-center gap-2">
                    <Satellite className="w-4 h-4" />
                    Satellite Spacecraft (LEO Platform)
                  </span>
                  <span>550 km Altitude</span>
                </div>

                <div className="text-center text-slate-400 text-[11px] flex items-center justify-center gap-2">
                  <div className="h-px bg-cyan-500/40 flex-1" />
                  <span className="text-cyan-400">X-band 150 Mbps Communication Downlink</span>
                  <div className="h-px bg-cyan-500/40 flex-1" />
                </div>

                <div className="flex items-center justify-between text-emerald-300 border-t border-white/5 pt-2">
                  <span className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4" />
                    Target Surface Region ({sampleMission.ground_target?.name})
                  </span>
                  <span>14.2 min Pass Duration</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">Mean Revisit Time</span>
                  <span className="text-base font-bold text-white mt-1 block">18.4 hrs</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-slate-400 text-[10px] block">Downlink Pass Window</span>
                  <span className="text-base font-bold text-emerald-300 mt-1 block">4 Passes / Day</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block">Target Visibility</span>
                  <span className="text-base font-bold text-cyan-300 mt-1 block">99.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 7: MISSION RECOMMENDATION & DECISION HORIZON            */}
      {/* ============================================================== */}
      <section
        ref={(el) => (sectionRefs.current[6] = el)}
        className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto"
      >
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-xl">
              <Award className="w-4 h-4" />
              <span>AUTONOMOUS ORCHESTRATOR SYNTHESIS</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-none">
              MISSION DECISION SUPPORT
            </h2>

            <p className="text-base sm:text-lg text-slate-200 font-mono max-w-2xl mx-auto leading-relaxed">
              Consolidating orbital mechanics, solar flux, debris avoidance, and ground geometry into clear, explainable aerospace mission verdicts.
            </p>
          </div>

          {/* Real Active Mission Synthesis Card */}
          <div className="hud-glass p-6 sm:p-8 rounded-2xl border border-cyan-500/50 text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE MISSION DESIGNATION:</span>
                <h3 className="text-lg sm:text-xl font-bold font-mono text-white">
                  {sampleMission.mission_name} [{sampleMission.mission_id}]
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ORCHESTRATOR: GO FOR LAUNCH</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <span className="text-slate-400 text-[10px] block uppercase">Target Orbit</span>
                <span className="text-white font-bold mt-1 block">{sampleMission.orbit?.altitude_km} km LEO</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <span className="text-slate-400 text-[10px] block uppercase">Inclination</span>
                <span className="text-cyan-300 font-bold mt-1 block">{sampleMission.orbit?.inclination_deg}°</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <span className="text-slate-400 text-[10px] block uppercase">Payload Mass</span>
                <span className="text-amber-300 font-bold mt-1 block">{sampleMission.payload?.mass_kg} kg</span>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                <span className="text-slate-400 text-[10px] block uppercase">Launch Spaceport</span>
                <span className="text-emerald-300 font-bold mt-1 block truncate">{sampleMission.launch?.site}</span>
              </div>
            </div>

            {/* Explainable Reasoning Synthesis */}
            <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/20 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explainable Orchestrator Assessment</span>
              </div>
              <p className="leading-relaxed text-slate-200">
                The mission profile demonstrates strong compliance across all four specialized domains. Conjunction vectors remain safely outside the 5 km exclusion envelope (12.4 km miss-distance). Heliophysical flux readings (Kp: 2.3) verify low thermospheric drag expansion. Launcher propulsion margin provides +280 m/s delta-V safety buffer for orbital insertion.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/planning"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-sm shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>CONFIGURE NEW MISSION</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              to="/recommendation"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-black/50 hover:bg-black/70 text-slate-200 border border-white/20 font-mono text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-xl transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>FULL RECOMMENDATION REPORT</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
