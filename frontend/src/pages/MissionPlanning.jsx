import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Target, Rocket, Compass, Calendar, Gauge, Play, RefreshCw, ChevronRight
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import MissionPlanningBackground from '../components/MissionPlanningBackground';
import OrbitalEllipsePreview from '../components/OrbitalEllipsePreview';
import ErrorState from '../components/ErrorState';

const CURATED_TARGETS = {
  'Global Scenarios': {
    'LEO Corridor A': [
      { name: 'Chennai Metropolitan Region', lat: 13.0827, lng: 80.2707, country: 'India' },
      { name: 'Beijing Metropolitan Area', lat: 39.9042, lng: 116.4074, country: 'China' },
    ],
    'LEO Corridor B': [
      { name: 'Aerospace Valley Basin', lat: 43.6047, lng: 1.4442, country: 'France' },
      { name: 'Cape Launch Sector', lat: 28.3922, lng: -80.6077, country: 'United States' },
    ],
  },
  'Regional Targets': {
    'Asia-Pacific & Global': [
      { name: 'Tokyo Bay Observatory', lat: 35.6762, lng: 139.6503, country: 'Japan' },
      { name: 'London Thames Basin', lat: 51.5072, lng: -0.1276, country: 'United Kingdom' },
      { name: 'Nairobi Rift Sector', lat: -1.2921, lng: 36.8219, country: 'Kenya' },
    ],
  },
};

const CURATED_LAUNCH_SITES = [
  { name: 'Satish Dhawan Space Centre (SDSC SHAR)', code: 'SDSC_SHAR', country: 'India' },
  { name: 'Cape Canaveral Space Force Station (SLC-40)', code: 'CCAFS', country: 'United States' },
  { name: 'Kennedy Space Center (LC-39A)', code: 'KSC', country: 'United States' },
  { name: 'Vandenberg Space Force Base (SLC-4E)', code: 'VANDENBERG', country: 'United States' },
  { name: 'Guiana Space Centre, Kourou (ELA-4)', code: 'KOUROU', country: 'France / ESA' },
  { name: 'Jiuquan Satellite Launch Center (SLS-1)', code: 'JSLC', country: 'China' },
  { name: 'Tanegashima Space Center (Yoshinobu)', code: 'TNSC', country: 'Japan' },
];

const VEHICLE_OPTIONS = [
  'AUTO',
  'AeroSpace Small-Lift I (PSLV-Class)',
  'AeroSpace Medium-Lift IV (GSLV/Falcon-Class)',
  'AeroSpace Heavy-Lift Booster (LVM3/Heavy-Class)',
];

export default function MissionPlanning() {
  const navigate = useNavigate();
  const { activeMission, runFullAnalysis, loading, error } = useMission();
  const [activeStage, setActiveStage] = useState('orbit');

  const [form, setForm] = useState(() => {
    const m = activeMission || {};
    return {
      mission_name: m.mission_name || 'LEO Earth Observation Mission',
      objective_type: m.objective?.type || 'EARTH_OBSERVATION',
      target_area: m.target?.area || 'Chennai Metropolitan Region',
      target_country: m.target?.country || 'India',
      target_lat: m.target?.latitude ?? 13.0827,
      target_lng: m.target?.longitude ?? 80.2707,
      coverage_requirement: m.target?.coverage_requirement ?? 80,
      coverage_radius_km: m.target?.coverage_radius_km ?? 120,
      sensor_fov_deg: m.coverage_sensor?.sensor_fov_deg ?? 45,
      min_elevation_deg: m.coverage_sensor?.min_elevation_deg ?? 10,
      observation_duration_hours: m.coverage_sensor?.observation_duration_hours ?? 72,
      launch_site: m.launch?.site || 'Satish Dhawan Space Centre (SDSC SHAR)',
      launch_site_code: m.launch?.launch_site_code || 'SDSC_SHAR',
      launch_country: m.launch?.country || 'India',
      launch_vehicle: m.launch?.vehicle || 'AUTO',
      orbit_altitude: m.orbit?.altitude_km ?? 550,
      orbit_inclination: m.orbit?.inclination_deg ?? 97.6,
      orbit_type: m.orbit?.type || 'SSO',
      norad_id: m.orbit?.norad_id ?? '',
      object_name: m.orbit?.object_name || '',
      tle_line1: m.orbit?.tle_line1 || '',
      tle_line2: m.orbit?.tle_line2 || '',
      screening_distance_km: m.orbit?.screening_distance_km ?? 25,
      propagation_interval_minutes: m.orbit?.propagation_interval_minutes ?? 90,
      payload_mass: m.mission?.payload_mass_kg ?? 250,
      mission_duration: m.mission?.duration_days ?? 365,
      budget: m.mission?.budget_musd ?? 50,
      satellite_manufacturing_cost_musd: m.mission?.satellite_manufacturing_cost_musd ?? '',
      launch_cost_musd: m.mission?.launch_cost_musd ?? '',
      annual_operations_cost_musd: m.mission?.annual_operations_cost_musd ?? '',
      preferred_launch_date: m.constraints?.preferred_launch_date || '2026-10-15',
      launch_window_flexibility_days: m.constraints?.launch_window_flexibility_days ?? 3,
      max_risk: m.constraints?.maximum_acceptable_risk || 'MEDIUM',
      data_mode: m.constraints?.data_mode || 'auto',
      missing_data_policy: m.constraints?.missing_data_policy || 'CONDITIONAL_GO',
    };
  });

  const handleLaunchAnalysis = async () => {
    const noradNum = form.norad_id !== '' && form.norad_id !== null ? Number(form.norad_id) : null;
    const optNum = (val) => (val !== '' && val !== null && val !== undefined ? Number(val) : null);

    const payload = {
      mission_id: activeMission?.mission_id || undefined,
      mission_name: form.mission_name,
      objective: {
        type: form.objective_type,
        description: `Autonomous ${form.objective_type.toLowerCase()} mission payload.`,
      },
      target: {
        area: form.target_area,
        region: form.target_area,
        country: form.target_country,
        latitude: Number(form.target_lat),
        longitude: Number(form.target_lng),
        coverage_requirement: Number(form.coverage_requirement),
        coverage_radius_km: Number(form.coverage_radius_km),
      },
      launch: {
        site: form.launch_site,
        launch_site_code: form.launch_site_code,
        country: form.launch_country,
        vehicle: form.launch_vehicle,
      },
      orbit: {
        type: form.orbit_type,
        altitude_km: Number(form.orbit_altitude),
        inclination_deg: Number(form.orbit_inclination),
        eccentricity: 0.0012,
        norad_id: noradNum,
        object_name: form.object_name || undefined,
        tle_line1: form.tle_line1?.trim() || undefined,
        tle_line2: form.tle_line2?.trim() || undefined,
        screening_distance_km: Number(form.screening_distance_km),
        propagation_interval_minutes: Number(form.propagation_interval_minutes),
      },
      coverage_sensor: {
        sensor_fov_deg: Number(form.sensor_fov_deg),
        min_elevation_deg: Number(form.min_elevation_deg),
        observation_duration_hours: Number(form.observation_duration_hours),
        time_step_seconds: 60,
        use_demonstration_sensor: true,
        enable_worldpop_lookup: form.data_mode !== 'demonstration',
      },
      mission: {
        payload_mass_kg: Number(form.payload_mass),
        budget_musd: Number(form.budget),
        duration_days: Number(form.mission_duration),
        satellite_manufacturing_cost_musd: optNum(form.satellite_manufacturing_cost_musd),
        launch_cost_musd: optNum(form.launch_cost_musd),
        annual_operations_cost_musd: optNum(form.annual_operations_cost_musd),
      },
      constraints: {
        preferred_launch_date: form.preferred_launch_date,
        launch_window_flexibility_days: Number(form.launch_window_flexibility_days),
        maximum_acceptable_risk: form.max_risk,
        data_mode: form.data_mode,
        missing_data_policy: form.missing_data_policy,
      },
    };

    const res = await runFullAnalysis(payload);
    if (res) {
      navigate('/recommendation');
    }
  };

  const stages = [
    {
      id: 'objective',
      label: 'MISSION & SENSOR',
      value: form.objective_type,
      sub: `${form.payload_mass} kg • FOV ${form.sensor_fov_deg}°`,
      icon: FileText,
      status: 'CONFIGURED',
    },
    {
      id: 'target',
      label: 'TARGET REGION',
      value: form.target_area,
      sub: `${form.target_lat}°N, ${form.target_lng}°E (${form.coverage_radius_km} km)`,
      icon: Target,
      status: 'CONFIGURED',
    },
    {
      id: 'site',
      label: 'LAUNCH SITE',
      value: form.launch_site?.split('(')[0]?.trim(),
      sub: `${form.launch_country} [${form.launch_site_code}]`,
      icon: Rocket,
      status: 'CONFIGURED',
    },
    {
      id: 'vehicle',
      label: 'LAUNCH VEHICLE',
      value: form.launch_vehicle,
      sub: `Capacity >= ${form.payload_mass} kg`,
      icon: Gauge,
      status: 'CONFIGURED',
    },
    {
      id: 'orbit',
      label: 'ORBIT & CATALOG',
      value: `${form.orbit_altitude} km ${form.orbit_type}${form.norad_id ? ` • NORAD ${form.norad_id}` : ''}`,
      sub: `${form.orbit_inclination}° Incl • ±${form.screening_distance_km} km`,
      icon: Compass,
      status: 'VALIDATED',
    },
    {
      id: 'constraints',
      label: 'DATA MODE & BUDGET',
      value: `${form.preferred_launch_date} • ${form.data_mode.toUpperCase()}`,
      sub: `$${form.budget}M Budget • Policy: ${form.missing_data_policy}`,
      icon: Calendar,
      status: 'VERIFIED',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <MissionPlanningBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
                Mission Construction & Orbit Configuration
              </h1>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              VISUAL MISSION CONSTRUCTION PIPELINE, KEPLERIAN / OMM / TLE INPUTS & SENSOR COVERAGE PARAMETERS
            </p>
          </div>

          <button
            onClick={handleLaunchAnalysis}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-900/30 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating Agents...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Multi-Agent Analysis</span>
              </>
            )}
          </button>
        </div>

        {error && <ErrorState error={error} onRetry={handleLaunchAnalysis} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#0c121e]/95 border border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl hud-corner-ticks">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono mb-3">
                <span className="font-bold text-white uppercase tracking-wider">MISSION CONSTRUCTION PIPELINE</span>
                <span className="text-[10px] text-slate-300">Click Stage to Adjust</span>
              </div>

              <div className="space-y-2">
                {stages.map((stg) => {
                  const Icon = stg.icon;
                  const isSelected = activeStage === stg.id;

                  return (
                    <div key={stg.id}>
                      <div
                        onClick={() => setActiveStage(stg.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between font-mono ${
                          isSelected
                            ? 'bg-slate-800/95 border-slate-400/80 shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
                            : 'bg-[#090e17]/85 border-white/10 hover:border-slate-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected ? 'bg-slate-200 text-slate-900 border-slate-300' : 'bg-black/60 text-slate-300 border-white/10'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{stg.label}</div>
                            <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[210px] sm:max-w-xs">
                              {stg.value}
                            </div>
                            <div className="text-[9px] text-slate-400">{stg.sub}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                            {stg.status}
                          </span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-slate-200' : 'text-slate-500'}`} />
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-2 p-3.5 rounded-xl bg-[#090e18]/95 border border-slate-700/70 font-mono text-xs space-y-3">
                          {activeStage === 'orbit' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Altitude (km)</label>
                                  <input
                                    type="number"
                                    min="200"
                                    max="36000"
                                    step="10"
                                    value={form.orbit_altitude}
                                    onChange={(e) => setForm({ ...form, orbit_altitude: Number(e.target.value) })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-cyan-300 font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Inclination (°)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="180"
                                    step="0.1"
                                    value={form.orbit_inclination}
                                    onChange={(e) => setForm({ ...form, orbit_inclination: Number(e.target.value) })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-cyan-300 font-bold"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">NORAD ID (Opt.)</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 25544"
                                    value={form.norad_id}
                                    onChange={(e) => setForm({ ...form, norad_id: e.target.value })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Screen Radius (km)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={form.screening_distance_km}
                                    onChange={(e) => setForm({ ...form, screening_distance_km: Number(e.target.value) })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Window (min)</label>
                                  <input
                                    type="number"
                                    min="10"
                                    max="720"
                                    value={form.propagation_interval_minutes}
                                    onChange={(e) => setForm({ ...form, propagation_interval_minutes: Number(e.target.value) })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-white"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase block">Optional TLE Lines (Overrides Planned Orbit)</label>
                                <input
                                  type="text"
                                  placeholder="TLE Line 1 (69 chars, optional)"
                                  value={form.tle_line1}
                                  onChange={(e) => setForm({ ...form, tle_line1: e.target.value })}
                                  className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-[10px] text-slate-200"
                                />
                                <input
                                  type="text"
                                  placeholder="TLE Line 2 (69 chars, optional)"
                                  value={form.tle_line2}
                                  onChange={(e) => setForm({ ...form, tle_line2: e.target.value })}
                                  className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-[10px] text-slate-200"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setForm({ ...form, orbit_altitude: 550, orbit_inclination: 97.6, orbit_type: 'SSO', norad_id: '' })}
                                  className="px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-[10px] text-slate-300 hover:text-white"
                                >
                                  550km SSO (Planned)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setForm({ ...form, orbit_altitude: 420, orbit_inclination: 51.64, orbit_type: 'LEO', norad_id: '25544', object_name: 'ISS (ZARYA)' })}
                                  className="px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-[10px] text-slate-300 hover:text-white"
                                >
                                  ISS (NORAD 25544)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setForm({ ...form, orbit_altitude: 825, orbit_inclination: 98.7, orbit_type: 'SSO', norad_id: '43013', object_name: 'NOAA-20' })}
                                  className="px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-[10px] text-slate-300 hover:text-white"
                                >
                                  NOAA-20 (43013)
                                </button>
                              </div>
                            </div>
                          )}

                          {activeStage === 'target' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(CURATED_TARGETS).flatMap(([, sub]) =>
                                  Object.entries(sub).flatMap(([, items]) =>
                                    items.map((item, idx) => (
                                      <button
                                        key={`${item.name}-${idx}`}
                                        type="button"
                                        onClick={() =>
                                          setForm({
                                            ...form,
                                            target_area: item.name,
                                            target_country: item.country,
                                            target_lat: item.lat,
                                            target_lng: item.lng,
                                          })
                                        }
                                        className={`p-2 rounded-lg text-left border text-[11px] ${
                                          form.target_area === item.name
                                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                                            : 'bg-black/50 border-white/10 text-slate-300 hover:border-white/30'
                                        }`}
                                      >
                                        <div className="font-bold truncate">{item.name}</div>
                                        <div className="text-[9px] text-slate-400">{item.country} ({item.lat}°N, {item.lng}°E)</div>
                                      </button>
                                    ))
                                  )
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Lat (°)</label>
                                  <input type="number" step="0.01" value={form.target_lat} onChange={(e) => setForm({ ...form, target_lat: Number(e.target.value) })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Lng (°)</label>
                                  <input type="number" step="0.01" value={form.target_lng} onChange={(e) => setForm({ ...form, target_lng: Number(e.target.value) })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Radius (km)</label>
                                  <input type="number" min="10" value={form.coverage_radius_km} onChange={(e) => setForm({ ...form, coverage_radius_km: Number(e.target.value) })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Min Cov (%)</label>
                                  <input type="number" min="1" max="100" value={form.coverage_requirement} onChange={(e) => setForm({ ...form, coverage_requirement: Number(e.target.value) })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                              </div>
                            </div>
                          )}

                          {activeStage === 'site' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {CURATED_LAUNCH_SITES.map((site) => (
                                <button
                                  key={site.code}
                                  type="button"
                                  onClick={() =>
                                    setForm({
                                      ...form,
                                      launch_site: site.name,
                                      launch_site_code: site.code,
                                      launch_country: site.country,
                                    })
                                  }
                                  className={`p-2 rounded-lg text-left border text-[11px] ${
                                    form.launch_site_code === site.code
                                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                                      : 'bg-black/50 border-white/10 text-slate-300 hover:border-white/30'
                                  }`}
                                >
                                  <div className="font-bold truncate">{site.name}</div>
                                  <div className="text-[9px] text-slate-400">{site.country} [{site.code}]</div>
                                </button>
                              ))}
                            </div>
                          )}

                          {activeStage === 'vehicle' && (
                            <div className="grid grid-cols-2 gap-2">
                              {VEHICLE_OPTIONS.map((veh) => (
                                <button
                                  key={veh}
                                  type="button"
                                  onClick={() => setForm({ ...form, launch_vehicle: veh })}
                                  className={`p-2 rounded-lg border text-center text-[10px] ${
                                    form.launch_vehicle === veh
                                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                                      : 'bg-black/50 border-white/10 text-slate-300'
                                  }`}
                                >
                                  {veh}
                                </button>
                              ))}
                            </div>
                          )}

                          {activeStage === 'objective' && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] text-slate-400 uppercase block mb-1">Mission Name</label>
                                <input
                                  type="text"
                                  value={form.mission_name}
                                  onChange={(e) => setForm({ ...form, mission_name: e.target.value })}
                                  className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Objective Type</label>
                                  <select
                                    value={form.objective_type}
                                    onChange={(e) => setForm({ ...form, objective_type: e.target.value })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1.5 text-white"
                                  >
                                    <option value="EARTH_OBSERVATION">EARTH OBSERVATION</option>
                                    <option value="COMMUNICATIONS">COMMUNICATIONS</option>
                                    <option value="ENVIRONMENTAL_MONITORING">ENVIRONMENTAL MONITORING</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Payload Mass (kg)</label>
                                  <input
                                    type="number"
                                    value={form.payload_mass}
                                    onChange={(e) => setForm({ ...form, payload_mass: Number(e.target.value) })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-cyan-300 font-bold"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Sensor FOV (°)</label>
                                  <input type="number" min="1" max="140" value={form.sensor_fov_deg} onChange={(e) => setForm({ ...form, sensor_fov_deg: Number(e.target.value) })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Min Elev (°)</label>
                                  <input type="number" min="0" max="80" value={form.min_elevation_deg} onChange={(e) => setForm({ ...form, min_elevation_deg: Number(e.target.value) })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Cov Horizon (h)</label>
                                  <input type="number" min="6" max="168" value={form.observation_duration_hours} onChange={(e) => setForm({ ...form, observation_duration_hours: Number(e.target.value) })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                              </div>
                            </div>
                          )}

                          {activeStage === 'constraints' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Target Epoch</label>
                                  <input
                                    type="date"
                                    value={form.preferred_launch_date}
                                    onChange={(e) => setForm({ ...form, preferred_launch_date: e.target.value })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Total Budget ($M USD)</label>
                                  <input
                                    type="number"
                                    value={form.budget}
                                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-cyan-300 font-bold"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">External Data Mode</label>
                                  <select
                                    value={form.data_mode}
                                    onChange={(e) => setForm({ ...form, data_mode: e.target.value })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1.5 text-cyan-300 font-bold"
                                  >
                                    <option value="auto">AUTO (Live -&gt; Cached -&gt; Fallback)</option>
                                    <option value="live">LIVE ONLY (External APIs)</option>
                                    <option value="cached">CACHED ONLY (Local Cache)</option>
                                    <option value="demonstration">DEMONSTRATION (Offline Sample)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Missing Data Policy</label>
                                  <select
                                    value={form.missing_data_policy}
                                    onChange={(e) => setForm({ ...form, missing_data_policy: e.target.value })}
                                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2 py-1.5 text-white"
                                  >
                                    <option value="CONDITIONAL_GO">CONDITIONAL GO on review items</option>
                                    <option value="HOLD">STRICT HOLD on incomplete/demo</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Launch $M (Opt.)</label>
                                  <input type="number" placeholder="Auto" value={form.launch_cost_musd} onChange={(e) => setForm({ ...form, launch_cost_musd: e.target.value })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Sat Mfg $M (Opt.)</label>
                                  <input type="number" placeholder="Auto" value={form.satellite_manufacturing_cost_musd} onChange={(e) => setForm({ ...form, satellite_manufacturing_cost_musd: e.target.value })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Ops/Yr $M (Opt.)</label>
                                  <input type="number" placeholder="Auto" value={form.annual_operations_cost_musd} onChange={(e) => setForm({ ...form, annual_operations_cost_musd: e.target.value })} className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={handleLaunchAnalysis}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-900/30 transition cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Multi-Agent Analysis Pipeline</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <OrbitalEllipsePreview form={form} />
          </div>
        </div>
      </div>
    </div>
  );
}
