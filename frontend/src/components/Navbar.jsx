import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Rocket, LayoutDashboard, Sliders, ShieldAlert,
  SunMedium, Wrench, Satellite, Award, Layers,
  Clock, Activity, Radio, Cpu
} from 'lucide-react';
import { useMission } from '../context/MissionContext';

const navItems = [
  { 
    name: 'Dashboard', 
    shortName: 'Dashboard', 
    compactName: 'Dashboard', 
    path: '/', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Architecture', 
    shortName: 'Architecture', 
    compactName: 'Architecture', 
    path: '/architecture', 
    icon: Layers 
  },
  { 
    name: 'Mission Planning', 
    shortName: 'Planning', 
    compactName: 'Planning', 
    path: '/planning', 
    icon: Sliders 
  },
  { 
    name: 'Debris Intelligence', 
    shortName: 'Debris', 
    compactName: 'Debris', 
    path: '/debris', 
    icon: ShieldAlert 
  },
  { 
    name: 'Space Weather', 
    shortName: 'Weather', 
    compactName: 'Weather', 
    path: '/weather', 
    icon: SunMedium 
  },
  { 
    name: 'Feasibility', 
    shortName: 'Feasibility', 
    compactName: 'Feasibility', 
    path: '/feasibility', 
    icon: Wrench 
  },
  { 
    name: 'Coverage', 
    shortName: 'Coverage', 
    compactName: 'Coverage', 
    path: '/coverage', 
    icon: Satellite 
  },
  { 
    name: 'Recommendation', 
    shortName: 'Recommendation', 
    compactName: 'Recom.', 
    path: '/recommendation', 
    icon: Award 
  },
];

export default function Navbar() {
  const { activeMission, backendConnected } = useMission();
  const [utcTime, setUtcTime] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 w-full ${
      scrolled
        ? 'bg-black/85 backdrop-blur-2xl border-b border-white/10 shadow-2xl'
        : 'bg-black/60 backdrop-blur-xl border-b border-white/10'
    }`}>
      {/* Top Telemetry Ticker Bar */}
      <div className="border-b border-white/10 bg-black/65 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs font-mono text-slate-200">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 text-cyan-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]" />
            <span className="font-bold tracking-wider text-cyan-300 text-xs whitespace-nowrap">AMDSF AUTONOMOUS NETWORK</span>
          </div>
          <span className="hidden md:inline text-white/30 shrink-0">|</span>
          <Link
            to="/architecture"
            className="hidden md:flex items-center gap-1.5 text-slate-200 hover:text-cyan-300 transition font-semibold tracking-wide text-xs group truncate"
          >
            <span className="truncate">DECISION SUPPORT v1.0 • MULTI-DOMAIN AEROSPACE</span>
            <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 group-hover:border-cyan-400 shrink-0">
              ISO/IEEE 42010
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-200">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold tracking-wider text-slate-100 text-xs whitespace-nowrap">{utcTime || '00:00:00 UTC'}</span>
          </div>
          {backendConnected && (
            <>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-emerald-400 font-bold tracking-wider text-xs whitespace-nowrap">
                  LIVE BACKEND
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation Bar - 3-Section Flexbox Architecture */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3 lg:gap-4">
          
          {/* LEFT SECTION: AMDSF Brand Logo & Badge */}
          <NavLink to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-black/60 border border-cyan-500/50 flex items-center justify-center shadow-lg group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] transition shrink-0">
              <Rocket className="w-4.5 h-4.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
                <span className="font-mono text-base sm:text-lg font-extrabold tracking-widest text-white group-hover:text-cyan-300 transition whitespace-nowrap">
                  AMDSF
                </span>
                <span className="text-[10px] font-bold font-mono px-1.5 sm:px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-400/40 shrink-0">
                  OPS-01
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-semibold tracking-wider mt-1 hidden xl:block uppercase whitespace-nowrap">
                Space Mission Decision Support
              </p>
            </div>
          </NavLink>

          {/* CENTER SECTION: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center flex-1 min-w-0 gap-0.5 xl:gap-1 2xl:gap-1.5 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-1.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-lg text-xs 2xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,242,254,0.3)] font-bold'
                        : 'text-slate-200 hover:text-white hover:bg-white/10 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-cyan-400/90 shrink-0" />
                  <span className="hidden 2xl:inline">{item.name}</span>
                  <span className="hidden xl:inline 2xl:hidden">{item.shortName}</span>
                  <span className="inline xl:hidden">{item.compactName}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* RIGHT SECTION: Active Mission Badge (Fully visible, guaranteed padding & shrink-0) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            {activeMission ? (
              <Link
                to="/planning"
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-black/75 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 transition shadow-lg shadow-cyan-950/40 backdrop-blur-md shrink-0 group min-w-fit"
                title={`Active Mission: ${activeMission.mission_id} (${activeMission.mission_name || 'Configured'})`}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0 shadow-[0_0_8px_#00f2fe]" />
                <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider shrink-0 hidden sm:inline">
                  MISSION:
                </span>
                <span className="font-bold text-white tracking-wider font-mono text-xs whitespace-nowrap shrink-0">
                  {activeMission.mission_id}
                </span>
              </Link>
            ) : (
              <Link
                to="/planning"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 transition text-xs font-semibold backdrop-blur-md shrink-0 min-w-fit"
              >
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="whitespace-nowrap">NO MISSION ACTIVE</span>
              </Link>
            )}
          </div>

        </div>

        {/* Mobile & Tablet Sub-Navigation Strip (Smooth Horizontal Scroll) */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-2 border-t border-white/10 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 font-bold shadow-[0_0_10px_rgba(0,242,254,0.25)]'
                      : 'text-slate-200 hover:text-white bg-black/50 border border-white/15'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

      </div>
    </header>
  );
}
