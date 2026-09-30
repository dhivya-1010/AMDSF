import React from 'react';
import {
  Satellite, Database, RefreshCw, Play
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import BackgroundScene from '../components/BackgroundScene';
import ResearchPipeline from '../components/ResearchPipeline';
import CoverageMapVisualization from '../components/CoverageMapVisualization';
import { demoAnalysisData } from '../data/demoData';

export default function CoverageAnalysis() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  const currentMission = activeMission || {
    mission_id: "AMDSF-2026-LEO-01",
    mission_name: "LEO Earth Observation & Environmental Monitoring",
    orbit: { altitude_km: 550, inclination_deg: 97.6, type: "SSO" },
    target: {
      area: "Metropolitan & Coastal Zone",
      region: "Maritime District",
      country: "Regional Coast",
      latitude: 13.0827,
      longitude: 80.2707,
      coverage_requirement: 85,
      coverage_radius_km: 120
    },
    constraints: { preferred_launch_date: "2026-10-15" }
  };

  const coverage = analysisResults?.coverage || demoAnalysisData.coverage;
  const mapData = analysisResults?.orchestrator?.map_data || {
    satellite_position: { lat: 13.08, lng: 80.27, alt_km: 550, label: "AMDSF Satellite" },
    coverage_radius_km: 300,
    ground_track: [
      { lat: -2.0, lng: 50.0, name: "Launch Ascent" },
      { lat: 8.0, lng: 70.0, name: "Telemetry Node" },
      { lat: 13.08, lng: 80.27, name: "Observation Target" },
      { lat: 28.0, lng: 100.0, name: "Descending Arc" }
    ],
    debris_markers: [
      { lat: 17.2, lng: 74.0, name: "COSMOS 2251 DEB", risk: "Medium", type: "debris" },
      { lat: 9.3, lng: 88.0, name: "SL-16 R/B Frag", risk: "Low", type: "debris" }
    ],
    ground_stations: [
      { lat: -2.0, lng: 50.0, name: "Launch Spaceport" },
      { lat: 16.0, lng: 81.0, name: "Regional Downlink Station" }
    ]
  };

  const status = analysisStatus?.coverage || 'COMPLETED';
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
        <ResearchPipeline currentStep="agents" compact={true} />

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
