import React from 'react';
import {
  Satellite, Database, RefreshCw, Play
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import BackgroundScene from '../components/BackgroundScene';
import CoverageMapVisualization from '../components/CoverageMapVisualization';

export default function CoverageAnalysis() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  const currentMission = activeMission;
  const coverage = analysisResults?.coverage;
  const mapData = analysisResults?.orchestrator?.map_data;
  const status = analysisStatus?.coverage || 'NOT_RUN';
  const isRunning = status === 'RUNNING';

  return (
    <div className="relative min-h-screen">
      {/* Full-Screen Space Environment */}
      <BackgroundScene scene="coverage" overlayGradient="standard" />
      <StarfieldCanvas count={50} opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        
        {/* Mission Context Bar */}
        <MissionContextBar mission={currentMission} activePage="coverage" />

        {/* Hero Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <Satellite className="w-4 h-4" />
              <span className="font-semibold tracking-wider uppercase">CONSTELLATION & GROUND GEOMETRY</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide mt-0.5">
              Coverage Intelligence Agent
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Model: <strong className="text-white">Deterministic Swath Geometry</strong></span>
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={() => runSingleAgent('coverage')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Swath...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Coverage Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Architecture Pipeline */}

        {/* FIGURE 7: INTERACTIVE GROUND TRACK & COVERAGE MAP WITH REVISIT TIMELINE */}
        <CoverageMapVisualization
          coverage={coverage}
          mission={currentMission}
          mapData={mapData}
          status={status}
        />

      </div>
    </div>
  );
}
