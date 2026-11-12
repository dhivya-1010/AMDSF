import React from 'react';
import MissionMap from './MissionMap';

export default function CoverageMapVisualization({ coverage = {}, mission = {}, mapData = null, status = 'NOT_RUN' }) {
  const details = coverage?.details || {};
  const target = mission?.target || {};
  const isCompleted = status !== 'NOT_RUN' && status !== 'RUNNING' && Boolean(coverage?.status);
  const validated = details.validated_orbital_coverage === true;
  const assumptions = details.assumptions_and_units || null;
  const accessWindows = details.access_windows || [];

  // Build mapData directly from Coverage agent output when standalone agent run completes
  const effectiveMapData =
    mapData?.ground_track?.length
      ? mapData
      : details.ground_track?.length
      ? {
          satellite_position: details.satellite_position,
          ground_track: details.ground_track,
          coverage_radius_km: details.swath_radius_km,
          swath_width_km: details.swath_width_km,
          target_radius_km: target.coverage_radius_km || 100,
          target_location: {
            lat: target.latitude,
            lng: target.longitude,
            label: coverage?.target_region || target.area,
          },
          ground_stations: [],
          debris_markers: [],
        }
      : null;

  const modeBadge = coverage?.data_mode || (coverage?.status === 'prototype_estimate' ? 'PROTOTYPE' : 'UNAVAILABLE');
  const sensorBadge = details.is_demonstration_sensor
    ? 'DEMONSTRATION SENSOR (45° FOV)'
    : details.sensor_model_type === 'configured_fov' || details.sensor_model_type === 'configured_swath'
    ? 'CONFIGURED SENSOR SPEC'
    : 'SENSOR UNSPECIFIED';

  return (
    <div className="w-full space-y-4 font-mono">
      <div className="bg-slate-950/85 border border-cyan-500/30 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-cyan-300 font-bold uppercase">
              {validated ? 'SGP4 ORBITAL COVERAGE & ACCESS ANALYSIS' : 'ORBITAL COVERAGE STATUS'}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold">
              {modeBadge}
            </span>
            {validated && (
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                  details.is_demonstration_sensor
                    ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {sensorBadge}
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[11px]">
            {isCompleted ? `Evaluated (${coverage?.timestamp || 'Just now'})` : 'Click "Run Coverage Analysis"'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2 text-xs">
          <Metric
            label="Swath Width"
            value={details.swath_width_km != null ? `${details.swath_width_km} km` : '—'}
          />
          <Metric
            label="Target Coverage"
            value={coverage?.coverage_percent != null ? `${coverage.coverage_percent}%` : '—'}
          />
          <Metric
            label="Mean Revisit"
            value={
              coverage?.revisit_time_minutes != null
                ? `${coverage.revisit_time_minutes} min (${(coverage.revisit_time_minutes / 60).toFixed(1)}h)`
                : details.revisit_data_status === 'single_or_zero_passes'
                ? '1 or 0 passes'
                : 'Unavailable'
            }
          />
          <Metric
            label="Access Passes/Day"
            value={coverage?.ground_track_passes_per_day != null ? `${coverage.ground_track_passes_per_day}/day (${details.passes_observed ?? 0} total)` : '—'}
          />
          <Metric
            label="Population (WorldPop)"
            value={
              coverage?.population_served != null
                ? `${coverage.population_served_formatted || coverage.population_served.toLocaleString()}`
                : 'Unavailable'
            }
          />
        </div>
      </div>

      {effectiveMapData ? (
        <div className="bg-black/75 border border-cyan-500/40 rounded-2xl p-4">
          <MissionMap mapData={effectiveMapData} missionName={mission?.mission_name} />
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-center text-sm text-amber-200">
          {status === 'NOT_RUN'
            ? 'No coverage analysis executed yet. Click "Run Coverage Analysis" to propagate SGP4 ground tracks and swath access windows.'
            : 'No propagated ground track or validated access-window geometry was generated.'}
        </div>
      )}

      {/* Access Windows & Calculation Assumptions */}
      {isCompleted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-black/75 border border-white/10 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-cyan-300 uppercase">
              Target Access Windows ({accessWindows.length} passes over {assumptions?.observation_duration_hours ?? 72}h)
            </h3>
            {accessWindows.length === 0 ? (
              <p className="text-xs text-slate-400">
                Zero passes satisfied swath & elevation mask ({details.elevation_mask_deg ?? 10}°) over target center in this window.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-[11px]">
                {accessWindows.map((win, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 py-1.5 border-b border-white/10 text-slate-300">
                    <span className="text-white font-semibold truncate">{win.start_utc}</span>
                    <span>Dur: {Math.round((win.duration_seconds || 0) / 60 * 10) / 10}m</span>
                    <span>Dist: {win.min_ground_distance_km} km</span>
                    <span className="text-emerald-300">El: {win.max_elevation_deg}°</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black/75 border border-white/10 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase">Calculation Assumptions & Units</h3>
            {assumptions ? (
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>Propagator: <span className="text-white">{assumptions.propagator}</span></div>
                <div>Orbit Source: <span className="text-cyan-300">{assumptions.orbit_source}</span></div>
                <div>Mean Altitude: <span className="text-white">{assumptions.orbit_altitude_mean_km} km</span></div>
                <div>Inclination: <span className="text-white">{assumptions.inclination_deg}°</span></div>
                <div>Sensor FOV: <span className="text-white">{assumptions.sensor_fov_deg}°</span></div>
                <div>Min Elevation: <span className="text-white">{assumptions.min_elevation_angle_deg}°</span></div>
                <div>Horizon Window: <span className="text-white">{assumptions.observation_duration_hours} h ({assumptions.time_step_seconds}s step)</span></div>
                <div>Target Radius: <span className="text-white">{assumptions.target_radius_km} km</span></div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Run orbital coverage to inspect full propagation parameters and units.</p>
            )}
          </div>
        </div>
      )}

      {coverage?.summary && (
        <p className="text-xs text-slate-300 bg-black/40 border border-white/10 rounded-lg p-3">
          {coverage.summary}
        </p>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/50 p-3">
      <div className="text-slate-400 text-[10px] uppercase">{label}</div>
      <div className="text-white font-bold mt-1">{value}</div>
    </div>
  );
}
