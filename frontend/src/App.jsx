import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MissionProvider } from './context/MissionContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MissionPlanning from './pages/MissionPlanning';
import DebrisIntelligence from './pages/DebrisIntelligence';
import SpaceWeather from './pages/SpaceWeather';
import MissionFeasibility from './pages/MissionFeasibility';
import CoverageAnalysis from './pages/CoverageAnalysis';
import MissionRecommendation from './pages/MissionRecommendation';

export default function App() {
  return (
    <MissionProvider>
      <Router>
        <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 relative">
          {/* Sticky Floating Glass Navbar */}
          <Navbar />

          {/* Main Full-Bleed Content Area */}
          <main className="flex-1 w-full relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/planning" element={<MissionPlanning />} />
              <Route path="/debris" element={<DebrisIntelligence />} />
              <Route path="/weather" element={<SpaceWeather />} />
              <Route path="/feasibility" element={<MissionFeasibility />} />
              <Route path="/coverage" element={<CoverageAnalysis />} />
              <Route path="/recommendation" element={<MissionRecommendation />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Floating Aerospace Footer */}
          <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md py-4 px-4 text-center text-xs text-slate-400 font-mono relative z-10">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-cyan-400/90 font-semibold tracking-wider">
                AMDSF — AGENTIC MULTI-DOMAIN SPACE MISSION DECISION SUPPORT FRAMEWORK
              </span>
              <span className="text-[11px] text-slate-500">
                Autonomous Multi-Agent Aerospace Intelligence Engine
              </span>
            </div>
          </footer>
        </div>
      </Router>
    </MissionProvider>
  );
}
