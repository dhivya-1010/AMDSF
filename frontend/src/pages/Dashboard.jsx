import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Play, RefreshCw, Sliders, ShieldCheck } from 'lucide-react';
import { useMission } from '../context/MissionContext';
import DashboardBackground from '../components/DashboardBackground';
import CentralMissionVisualization from '../components/CentralMissionVisualization';
import AgentSystemTopology from '../components/AgentSystemTopology';
import NgboostRiskPanel from '../components/NgboostRiskPanel';
import ErrorState from '../components/ErrorState';

const DEMO_SAMPLE_MISSION = {
  mission_name: 'ISS Demonstration Observation Mission',
  objective: { type: 'EARTH_OBSERVATION', description: 'Demonstration SGP4 + Debris + Weather + Coverage run' },
  target: {
    country: 'India',
    region: 'Tamil Nadu',
    area: 'Chennai Metropolitan Region',
    latitude: 13.0827,
    longitude: 80.2707,
    coverage_requirement: 75.0,
    coverage_radius_km: 100.0,
  },
  launch: {
    country: 'India',
    site: 'Satish Dhawan Space Centre — Sriharikota',
    launch_site_code: 'SDSC_SHAR',
    vehicle: 'AUTO',
  },
  orbit: {
    type: 'LEO',
    altitude_km: 420.0,
    inclination_deg: 51.64,
    eccentricity: 0.0005,
    norad_id: 25544,
    object_name: 'ISS (ZARYA)',
    propagation_interval_minutes: 90,
    propagation_step_seconds: 60,
    screening_distance_km: 50.0,
  },
  coverage_sensor: {
    sensor_fov_deg: 45.0,
    min_elevation_deg: 10.0,
    observation_duration_hours: 72.0,
    time_step_seconds: 60,
    use_demonstration_sensor: true,
    enable_worldpop_lookup: false,
  },
  mission: {
    duration_days: 365,
    payload_mass_kg: 250.0,
    budget_musd: 50.0,
  },
  constraints: {
    preferred_launch_date: '2026-10-15',
    maximum_acceptable_risk: 'MEDIUM',
    launch_window_flexibility_days: 3,
    data_mode: 'demonstration',
    missing_data_policy: 'CONDITIONAL_GO',
  },
};

export default function Dashboard() {
  const {
    activeMission,
    analysisResults,
    analysisStatus,
    runFullAnalysis,
    loading,
    error,
    backendConnected,
  } = useMission();

  const currentMission = activeMission;
  const results = analysisResults;
  const orchestrator = results?.orchestrator || results?.orchestration || {};
  const recommendation = results?.recommendation || orchestrator?.recommendation || {};
  const decision = recommendation?.decision;

  const decisionBadgeClass =
    decision === 'GO'
      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
      : decision === 'CONDITIONAL GO'
      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
      : 'bg-rose-950/80 border-rose-500/40 text-rose-300';

  return (
    <div className="relative min-h-screen">
      <DashboardBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        {/* Top Header & Fast Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${backendConnected ? 'bg-cyan-400 animate-pulse' : 'bg-rose-400'}`} />
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
                Mission Operations Console
              </h1>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                AMDSF v1.1
              </span>
              {decision && (
                <span className={`px-2.5 py-0.5 rounded border font-mono text-[10px] font-bold flex items-center gap-1 ${decisionBadgeClass}`}>
                  <ShieldCheck className="w-3 h-3" />
                  <span>{decision}</span>
                </span>
              )}
              {results?.data_mode && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px] uppercase">
                  MODE: {results.data_mode}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-mono">
              Active Flight Profile:{' '}
              <strong className="text-cyan-300">{currentMission?.mission_name || 'No mission configured'}</strong>{' '}
              [{currentMission?.mission_id || '—'}]
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!currentMission && (
              <button
                onClick={() => runFullAnalysis(DEMO_SAMPLE_MISSION)}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Demonstration Mission</span>
              </button>
            )}

            <Link
              to="/planning"
              className="px-3.5 py-2 rounded-xl bg-black/50 hover:bg-black/80 text-slate-200 border border-white/10 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-xl transition hover:border-cyan-500/40"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Configure Mission</span>
            </Link>

            <button
              onClick={() => currentMission && runFullAnalysis(currentMission)}
              disabled={loading || !currentMission}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Re-Evaluate Agents</span>
                </>
              )}
            </button>

            <Link
              to="/recommendation"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-xl shadow-cyan-500/20 flex items-center gap-2 transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Recommendation</span>
            </Link>
          </div>
        </div>

        {error && (
          <ErrorState
            error={error}
            onRetry={currentMission ? () => runFullAnalysis(currentMission) : undefined}
          />
        )}

        <CentralMissionVisualization
          mission={currentMission}
          analysisResults={results}
          analysisStatus={analysisStatus}
        />

        <AgentSystemTopology
          mission={currentMission}
          analysisResults={results}
          analysisStatus={analysisStatus}
        />

        <NgboostRiskPanel
          mission={currentMission}
          analysisResults={results}
        />
      </div>
    </div>
  );
}
