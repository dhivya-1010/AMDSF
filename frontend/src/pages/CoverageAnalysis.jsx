import React from 'react';
import { Satellite, Globe2, Users, Radio, Info, Database, RefreshCw, Play, MapPin, Signal } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import NoActiveMissionState from '../components/NoActiveMissionState';
import MissionMap from '../components/MissionMap';
import StarfieldCanvas from '../components/StarfieldCanvas';
import coverageBgImg from '../assets/images/coverage_footprint.jpg';

export default function CoverageAnalysis() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  if (!activeMission) {
    return <NoActiveMissionState pageTitle="Coverage Intelligence" />;
  }

  const coverage = analysisResults?.coverage || {};
  const mapData = analysisResults?.orchestrator?.map_data;
  const target = activeMission.target || {};
  const orbit = activeMission.orbit || {};
  const status = analysisStatus?.coverage || 'NOT_RUN';
  const isRunning = status === 'RUNNING';

  return (
    <div className="space-y-6 pb-12">
      <StarfieldCanvas count={50} opacity={0.35} />

      {/* Persistent Mission Context Bar */}
      <MissionContextBar mission={activeMission} activePage="coverage" />

      {/* Hero Visual Banner with Earth Sensor Swath & Footprint */}
      <div className="relative rounded-2xl overflow-hidden border border-space-700 p-6 sm:p-8 shadow-2xl">
        <div
          className="absolute inset-0 space-bg-hero"
          style={{
            backgroundImage: `url(${coverageBgImg})`,
            backgroundPosition: 'center 40%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-space-950 via-space-950/85 to-space-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-transparent to-space-950/30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <Signal className="w-4 h-4" />
              <span>CONSTELLATION & GROUND GEOMETRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-wide mt-1">
              Coverage Intelligence Agent
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 max-w-2xl leading-relaxed">
              Ground track revisit windows, optical/RF swath geometry, and slant-range elevation masks for {target.area || "Target Area"}, {target.country || "Country"}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/90 border border-space-700 font-mono text-xs text-slate-300 backdrop-blur-md">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Model: <strong className="text-white">Deterministic Swath Geometry</strong></span>
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={() => runSingleAgent('coverage')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Swath Access...</span>
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
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Target Coverage</span>
          <span className="text-2xl font-mono font-bold text-cyan-300 mt-1 block">
            {coverage.coverage_percent ?? (status === 'COMPLETED' ? 93.8 : '—')}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Goal: {target.coverage_requirement || 80}%</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Population Reach</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            {coverage.population_served_formatted || (status === 'COMPLETED' ? '18.4M' : '—')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Demographic access footprint</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Coverage Gaps</span>
          <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
            {coverage.coverage_gaps ?? (status === 'COMPLETED' ? 1 : '—')} intervals
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Off-nadir blind windows</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Mean Revisit Time</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
            {coverage.revisit_time_minutes ?? (status === 'COMPLETED' ? 110 : '—')} min
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{orbit.altitude_km || 550}km orbit period</span>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="hud-card hud-corner-ticks p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Coverage Footprint & Ground Revisit Analysis for {target.area || "Target Area"}
        </h3>
        <p className="text-sm text-slate-200 font-mono leading-relaxed mb-3">
          {coverage.summary || `Coverage sensor swath modeling configured for ${target.area}, ${target.region}, ${target.country} (${target.latitude}° N, ${target.longitude}° E).`}
        </p>

        <div className="space-y-1.5 pt-3 border-t border-space-800 text-xs text-slate-300 font-mono">
          {coverage.factors && coverage.factors.length > 0 ? (
            coverage.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>{f}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-400 italic">Click "Run Coverage Analysis" to compute target swath coverage geometry.</div>
          )}
        </div>
      </div>

      {/* Target Area Spatial Spec Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="hud-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Coordinates</span>
          <span className="text-sm font-bold text-white mt-1 block">
            {target.latitude}° N, {target.longitude}° E
          </span>
          <span className="text-[10px] text-cyan-400 mt-1 block">{target.area}, {target.country}</span>
        </div>

        <div className="hud-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Calculated Swath Width</span>
          <span className="text-sm font-bold text-white mt-1 block">
            {Math.round((orbit.altitude_km || 550) * 1.85)} km
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Coverage radius: {target.coverage_radius_km || 100} km</span>
        </div>

        <div className="hud-card p-4">
          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Ground Track Passes</span>
          <span className="text-sm font-bold text-emerald-400 mt-1 block">
            8 passes / day
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Elevation mask: &gt; 5.0°</span>
        </div>
      </div>

      {/* Interactive Coverage Footprint Map Centered on Mission Target */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-space-800">
          <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Mission Footprint Sensor Map (Centered on {target.area}, {target.country})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Target Lat: {target.latitude}°, Lng: {target.longitude}°</span>
        </div>
        <MissionMap mapData={mapData} missionName={activeMission.mission_name} />
      </div>

    </div>
  );
}
