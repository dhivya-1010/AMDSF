import React from 'react';
import {
  Wrench, Gauge, RefreshCw, Play
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import BackgroundScene from '../components/BackgroundScene';
import ResearchPipeline from '../components/ResearchPipeline';
import FeasibilityConstraintWheel from '../components/FeasibilityConstraintWheel';
import { demoAnalysisData } from '../data/demoData';

export default function MissionFeasibility() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  const currentMission = activeMission || {
    mission_id: "AMDSF-2026-LEO-01",
    mission_name: "LEO Earth Observation & Environmental Monitoring",
    orbit: { altitude_km: 550, inclination_deg: 97.6, type: "SSO" },
    launch: { site: "Satish Dhawan Space Centre (SDSC SHAR)", vehicle: "AeroSpace Small-Lift I" },
    mission: { payload_mass_kg: 250, budget_musd: 50, duration_days: 365 },
    constraints: { preferred_launch_date: "2026-10-15" }
  };

  const feasibility = analysisResults?.feasibility || demoAnalysisData.feasibility;
  const status = analysisStatus?.feasibility || 'COMPLETED';
  const isRunning = status === 'RUNNING';

  return (
    <div className="relative min-h-screen">
      {/* Full-Screen Space Environment */}
      <BackgroundScene scene="propulsion" overlayGradient="standard" />
      <StarfieldCanvas count={50} opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        
        {/* Mission Context Bar */}
        <MissionContextBar mission={currentMission} activePage="feasibility" />

        {/* Hero Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <Wrench className="w-4 h-4" />
              <span className="font-semibold tracking-wider uppercase">PROPULSION & VEHICLE STAGING</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide mt-0.5">
              Mission Feasibility Agent
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Model: <strong className="text-white">Delta-V & Cost Estimator</strong></span>
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={() => runSingleAgent('feasibility')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Staging...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Feasibility Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Architecture Pipeline */}
        <ResearchPipeline currentStep="agents" compact={true} />

        {/* FIGURE 6: RADIAL CONSTRAINT WHEEL & COMPACT MATRIX */}
        <FeasibilityConstraintWheel
          feasibility={feasibility}
          mission={currentMission}
          status={status}
        />

      </div>
    </div>
  );
}
