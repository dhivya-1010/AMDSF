import React from 'react';
import {
  SunMedium, Database, RefreshCw, Play
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import StarfieldCanvas from '../components/StarfieldCanvas';
import BackgroundScene from '../components/BackgroundScene';
import ResearchPipeline from '../components/ResearchPipeline';
import SolarWeatherEnvironment from '../components/SolarWeatherEnvironment';
import { demoAnalysisData } from '../data/demoData';

export default function SpaceWeather() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  const currentMission = activeMission || {
    mission_id: "AMDSF-2026-LEO-01",
    mission_name: "LEO Earth Observation & Environmental Monitoring",
    orbit: { altitude_km: 550, inclination_deg: 97.6, type: "SSO" },
    launch: { site: "Satish Dhawan Space Centre (SDSC SHAR)" },
    constraints: { preferred_launch_date: "2026-10-15" }
  };

  const weather = analysisResults?.weather || demoAnalysisData.weather;
  const status = analysisStatus?.weather || 'COMPLETED';
  const isRunning = status === 'RUNNING';

  return (
    <div className="relative min-h-screen">
      {/* Full-Screen Space Environment (Sun & Corona) */}
      <BackgroundScene scene="sun" overlayGradient="standard" />
      <StarfieldCanvas count={50} opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        
        {/* Mission Context Bar */}
        <MissionContextBar mission={currentMission} activePage="weather" />

        {/* Hero Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
              <SunMedium className="w-4 h-4" />
              <span className="font-semibold tracking-wider uppercase">HELIOPHYSICS & SOLAR DYNAMICS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide mt-0.5">
              Space Weather Intelligence Agent
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Feeds: <strong className="text-white">NOAA SWPC • NASA DONKI</strong></span>
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={() => runSingleAgent('weather')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting Feeds...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Weather Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Architecture Pipeline */}
        <ResearchPipeline currentStep="agents" compact={true} />

        {/* FIGURE 5: SUN-CENTERED HELIOPHYSICS & SOLAR WEATHER ENVIRONMENT */}
        <SolarWeatherEnvironment
          weather={weather}
          mission={currentMission}
          status={status}
        />

      </div>
    </div>
  );
}
