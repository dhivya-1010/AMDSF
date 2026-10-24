import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Rocket, LayoutDashboard, Sliders, ShieldAlert,
  SunMedium, Wrench, Satellite, Award, Layers,
  Clock, Activity, Radio, Cpu
} from 'lucide-react';
import { useMission } from '../context/MissionContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Architecture', path: '/architecture', icon: Layers },
  { name: 'Mission Planning', path: '/planning', icon: Sliders },
  { name: 'Debris Intelligence', path: '/debris', icon: ShieldAlert },
  { name: 'Space Weather', path: '/weather', icon: SunMedium },
  { name: 'Feasibility', path: '/feasibility', icon: Wrench },
  { name: 'Coverage', path: '/coverage', icon: Satellite },
  { name: 'Recommendation', path: '/recommendation', icon: Award },
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl'
        : 'bg-black/55 backdrop-blur-xl border-b border-white/10'
    }`}>
      {/* Top Telemetry Ticker Bar */}
      <div className="border-b border-white/10 bg-black/60 px-4 sm:px-8 py-1.5 flex items-center justify-between text-xs font-mono text-slate-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f2fe]" />
            <span className="font-bold tracking-wider text-cyan-300 text-xs">AMDSF AUTONOMOUS NETWORK</span>
          </div>
          <span className="hidden md:inline text-white/30">|</span>
          <Link
            to="/architecture"
            className="hidden md:flex items-center gap-1.5 text-slate-200 hover:text-cyan-300 transition font-semibold tracking-wide text-xs group"
          >
            <span>DECISION SUPPORT v1.0 • MULTI-DOMAIN AEROSPACE</span>
            <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30 group-hover:border-cyan-400">
              ISO/IEEE 42010
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-slate-200">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold tracking-wider text-slate-100 text-xs">{utcTime || '00:00:00 UTC'}</span>
          </div>
          {backendConnected && (
            <>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-emerald-400 font-bold tracking-wider text-xs">
                  LIVE BACKEND
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo & Military-grade Badge */}
          <NavLink to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-black/60 border border-cyan-500/50 flex items-center justify-center shadow-lg group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] transition">
              <Rocket className="w-4.5 h-4.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <span className="font-mono text-lg font-extrabold tracking-widest text-white group-hover:text-cyan-300 transition">
                  AMDSF
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-400/40">
                  OPS-01
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-semibold tracking-wider mt-1 hidden sm:block uppercase">
                Space Mission Decision Support
              </p>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,242,254,0.3)] font-bold'
                        : 'text-slate-200 hover:text-white hover:bg-white/10 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-cyan-400/90" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Active Mission Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {activeMission ? (
              <Link
                to="/planning"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 transition shadow-lg backdrop-blur-md"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] text-slate-300 font-bold hidden sm:inline uppercase">MISSION:</span>
                <span className="font-bold text-white tracking-wide truncate max-w-[140px] text-xs">{activeMission.mission_id}</span>
              </Link>
            ) : (
              <Link
                to="/planning"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 transition text-xs font-semibold backdrop-blur-md"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>NO MISSION ACTIVE</span>
              </Link>
            )}
          </div>

        </div>

        {/* Mobile Sub-Navigation */}
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
