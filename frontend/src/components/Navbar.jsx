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
        ? 'bg-space-950/95 backdrop-blur-md border-b border-space-700 shadow-2xl'
        : 'bg-space-950/80 backdrop-blur-sm border-b border-space-800/80'
    }`}>
      {/* Top Telemetry Ticker Bar */}
      <div className="border-b border-space-800/60 bg-space-900/60 px-4 sm:px-8 py-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-semibold tracking-wider">AMDSF AUTONOMOUS NETWORK</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">FRAMEWORK: DECISION SUPPORT v1.0</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{utcTime || '00:00:00 UTC'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={backendConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
              {backendConnected ? 'LIVE BACKEND' : 'SIMULATION MODE'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo & Military-grade Badge */}
          <NavLink to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-space-850 to-space-900 border border-cyan-500/40 flex items-center justify-center shadow-lg group-hover:border-cyan-400 transition">
              <Rocket className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <span className="font-mono text-base font-bold tracking-widest text-white group-hover:text-cyan-300 transition">
                  AMDSF
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-space-800 text-cyan-400 border border-space-700">
                  OPS-01
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-wider mt-0.5 hidden sm:block uppercase">
                Space Mission Decision Support
              </p>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-xs font-mono transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-space-850/80 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Active Mission Indicator */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {activeMission ? (
              <Link
                to="/planning"
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-space-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 transition shadow-inner"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                <span className="text-[10px] text-slate-400 hidden sm:inline uppercase">MISSION:</span>
                <span className="font-bold text-white tracking-wide truncate max-w-[130px]">{activeMission.mission_id}</span>
              </Link>
            ) : (
              <Link
                to="/planning"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-space-900 border border-space-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition text-[11px]"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>NO MISSION ACTIVE</span>
              </Link>
            )}
          </div>

        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-2 border-t border-space-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 bg-space-900 border border-space-800'
                  }`
                }
              >
                <Icon className="w-3 h-3" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

      </div>
    </header>
  );
}
