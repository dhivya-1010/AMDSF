import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Rocket, LayoutDashboard, Sliders, ShieldAlert,
  SunMedium, Wrench, Satellite, Award, Activity
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Mission Planning', path: '/planning', icon: Sliders },
  { name: 'Debris Intelligence', path: '/debris', icon: ShieldAlert },
  { name: 'Space Weather', path: '/weather', icon: SunMedium },
  { name: 'Feasibility', path: '/feasibility', icon: Wrench },
  { name: 'Coverage', path: '/coverage', icon: Satellite },
  { name: 'Recommendation', path: '/recommendation', icon: Award },
];

export default function Navbar({ backendConnected }) {
  return (
    <header className="sticky top-0 z-50 bg-space-900/95 backdrop-blur-md border-b border-space-700/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo & Title */}
          <NavLink to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-md shadow-cyan-500/20">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-mono text-base font-bold tracking-wider text-cyan-400">
                  AMDSF
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5 hidden sm:block">
                Mission Intelligence Platform
              </p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-space-800'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-space-850 border border-space-700">
              <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 text-[11px] hidden sm:inline">System:</span>
              <span className={`text-[11px] font-semibold ${backendConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {backendConnected ? 'Operational' : 'Simulation Mode'}
              </span>
            </div>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center overflow-x-auto py-2 gap-2 border-t border-space-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 bg-space-850'
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
