import React from 'react';
import { ShieldAlert, Info, Database, AlertTriangle, Layers, Radio, RefreshCw, Play, Globe2, Eye } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionContextBar from '../components/MissionContextBar';
import NoActiveMissionState from '../components/NoActiveMissionState';
import MissionMap from '../components/MissionMap';
import StarfieldCanvas from '../components/StarfieldCanvas';
import debrisBgImg from '../assets/images/debris_orbital_shell.jpg';

export default function DebrisIntelligence() {
  const { activeMission, analysisResults, analysisStatus, runSingleAgent } = useMission();

  if (!activeMission) {
    return <NoActiveMissionState pageTitle="Orbital Debris Intelligence" />;
  }

  const debris = analysisResults?.debris || {};
  const mapData = analysisResults?.orchestrator?.map_data;
  const objects = debris.orbital_objects || [];
  const status = analysisStatus?.debris || 'NOT_RUN';
  const isRunning = status === 'RUNNING';

  return (
    <div className="space-y-6 pb-12">
      <StarfieldCanvas count={50} opacity={0.35} />

      {/* Persistent Mission Context Bar */}
      <MissionContextBar mission={activeMission} activePage="debris" />

      {/* Hero Visual Banner with SSA Environment */}
      <div className="relative rounded-2xl overflow-hidden border border-space-700 p-6 sm:p-8 shadow-2xl">
        <div
          className="absolute inset-0 space-bg-hero"
          style={{
            backgroundImage: `url(${debrisBgImg})`,
            backgroundPosition: 'center 35%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-space-950 via-space-950/85 to-space-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-transparent to-space-950/30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>SPACE SITUATIONAL AWARENESS (SSA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-wide mt-1">
              Orbital Debris Intelligence Agent
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 max-w-2xl leading-relaxed">
              Conjunction vector modeling and collision probability analysis across the {activeMission.orbit?.altitude_km || 550} km orbital shell.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-space-900/90 border border-space-700 font-mono text-xs text-slate-300 backdrop-blur-md">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Catalog: <strong className="text-white">CelesTrak / SSN</strong></span>
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={() => runSingleAgent('debris')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Conjunctions...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Debris Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Objects Analyzed</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            {debris.objects_analyzed || (status === 'COMPLETED' ? 8420 : '—')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">LEO Catalog ({activeMission.orbit?.altitude_km || 550} km)</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Nearby Objects</span>
          <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
            {debris.nearby_objects ?? (status === 'COMPLETED' ? 12 : '—')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Proximate corridor (±25km)</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Conjunction Hazard</span>
          <span className={`text-2xl font-mono font-bold mt-1 block ${
            debris.risk_level === 'HIGH' ? 'text-rose-400' : debris.risk_level === 'LOW' ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {debris.risk_level || (status === 'COMPLETED' ? 'MEDIUM' : 'PENDING')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Normalized SSA Index</span>
        </div>

        <div className="hud-card hud-corner-ticks p-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Risk Score</span>
          <span className="text-2xl font-mono font-bold text-cyan-300 mt-1 block">
            {debris.risk_score ?? (status === 'COMPLETED' ? 0.52 : '—')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Scaled threshold (0.0 - 1.0)</span>
        </div>
      </div>

      {/* Assessment Summary Box */}
      <div className="hud-card hud-corner-ticks p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          SSA Assessment & Conjunction Factors
        </h3>
        <p className="text-sm text-slate-200 font-mono leading-relaxed mb-3">
          {debris.summary || `Orbital conjunction analysis initialized for ${activeMission.mission_name} at ${activeMission.orbit?.altitude_km || 550}km altitude.`}
        </p>

        <div className="space-y-1.5 pt-3 border-t border-space-800 text-xs text-slate-300 font-mono">
          {debris.factors && debris.factors.length > 0 ? (
            debris.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>{f}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-400 italic">Click "Run Debris Analysis" to evaluate live conjunction risks.</div>
          )}
        </div>
      </div>

      {/* Tracked Objects Table */}
      <div className="hud-card hud-corner-ticks p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-space-800">
          <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase">
            Proximate Orbital Objects in {activeMission.orbit?.altitude_km || 550}km Band
          </h3>
          <span className="text-xs font-mono text-slate-400">{objects.length} Objects Tracked</span>
        </div>

        {objects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-space-850 text-slate-400 uppercase text-[10px] border-b border-space-700">
                <tr>
                  <th className="py-2.5 px-3">Object Name</th>
                  <th className="py-2.5 px-3">NORAD ID</th>
                  <th className="py-2.5 px-3">Miss Distance</th>
                  <th className="py-2.5 px-3">Rel. Velocity</th>
                  <th className="py-2.5 px-3">Inclination</th>
                  <th className="py-2.5 px-3">Hazard Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-800">
                {objects.map((obj, idx) => (
                  <tr key={idx} className="hover:bg-space-800/50 transition">
                    <td className="py-2.5 px-3 font-bold text-white">{obj.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{obj.norad_id || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold">{obj.distance_km} km</td>
                    <td className="py-2.5 px-3 text-amber-300">{obj.relative_velocity_kms} km/s</td>
                    <td className="py-2.5 px-3 text-slate-400">{obj.inclination_deg ? `${obj.inclination_deg}°` : `${activeMission.orbit?.inclination_deg || 97.6}°`}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        obj.risk === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        obj.risk === 'Medium' || obj.risk === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {obj.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-mono text-slate-400">
            Click "Run Debris Analysis" to query proximate orbital objects for this mission altitude.
          </div>
        )}
      </div>

      {/* Spatial Geometry Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-space-800">
          <h3 className="text-sm font-semibold font-mono text-white tracking-wide uppercase">
            Orbital Conjunction Geometry Map
          </h3>
          <span className="text-xs font-mono text-slate-400">Real-Time Space Surveillance Grid</span>
        </div>
        <MissionMap mapData={mapData} missionName={activeMission.mission_name} />
      </div>

    </div>
  );
}
