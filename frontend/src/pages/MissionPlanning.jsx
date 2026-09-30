import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Target, Rocket, Compass, Layers, Sliders,
  CheckCircle2, Play, RefreshCw, Calendar, DollarSign,
  AlertCircle, ChevronRight, MapPin, Globe2, Gauge
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import BackgroundScene from '../components/BackgroundScene';
import StarfieldCanvas from '../components/StarfieldCanvas';
import OrbitalEllipsePreview from '../components/OrbitalEllipsePreview';
import ResearchPipeline from '../components/ResearchPipeline';

// Curated geographic regions & spaceports dataset
const CURATED_TARGETS = {
  "Global Scenarios": {
    "LEO Corridor A": [
      { name: "Metropolitan & Maritime Coastal Zone", lat: 13.0827, lng: 80.2707, country: "Coastal Region" },
      { name: "Urban Tech & High-Density Basin", lat: 39.9042, lng: 116.4074, country: "Continental Sector" }
    ],
    "LEO Corridor B": [
      { name: "Aerospace Valley & Research Hub", lat: 43.6047, lng: 1.4442, country: "European Sector" },
      { name: "Space Coast Maritime Corridor", lat: 28.3922, lng: -80.6077, country: "Atlantic Sector" }
    ]
  },
  "Regional Targets": {
    "Asia-Pacific": [
      { name: "Coastal Metropolitan Center", lat: 13.0827, lng: 80.2707, country: "India" },
      { name: "Northern Technology Corridor", lat: 39.9042, lng: 116.4074, country: "China" },
      { name: "East Maritime Basin", lat: 35.6762, lng: 139.6503, country: "Japan" }
    ],
    "Atlantic & Europe": [
      { name: "Aerospace Valley Basin", lat: 43.6047, lng: 1.4442, country: "France" },
      { name: "Cape Launch Sector", lat: 28.3922, lng: -80.6077, country: "United States" }
    ]
  }
};

const CURATED_LAUNCH_SITES = [
  { name: "Satish Dhawan Space Centre (SDSC SHAR)", code: "SDSC_SHAR", country: "India" },
  { name: "Cape Canaveral Space Force Station (SLC-40)", code: "CCAFS", country: "United States" },
  { name: "Kennedy Space Center (LC-39A)", code: "KSC", country: "United States" },
  { name: "Guiana Space Centre, Kourou (ELA-4)", code: "KOUROU", country: "France / ESA" },
  { name: "Jiuquan Satellite Launch Center (SLS-1)", code: "JSLC", country: "China" },
  { name: "Tanegashima Space Center (Yoshinobu)", code: "TNSC", country: "Japan" }
];

export default function MissionPlanning() {
  const navigate = useNavigate();
  const { activeMission, runFullAnalysis, loading, error } = useMission();
  const [activeStage, setActiveStage] = useState('orbit'); // 'objective', 'target', 'site', 'vehicle', 'orbit', 'constraints'

  // Structured Mission Definition Form State
  const [form, setForm] = useState(() => {
    if (activeMission) {
      return {
        mission_name: activeMission.mission_name || 'LEO Earth Observation Mission',
        objective_type: activeMission.objective?.type || 'EARTH_OBSERVATION',
        target_area: activeMission.target?.area || 'Metropolitan & Coastal Zone',
        target_country: activeMission.target?.country || 'Coastal Region',
        target_lat: activeMission.target?.latitude || 13.0827,
        target_lng: activeMission.target?.longitude || 80.2707,
        coverage_requirement: activeMission.target?.coverage_requirement || 85,
        coverage_radius_km: activeMission.target?.coverage_radius_km || 120,
        launch_site: activeMission.launch?.site || 'Satish Dhawan Space Centre (SDSC SHAR)',
        launch_site_code: activeMission.launch?.launch_site_code || 'SDSC_SHAR',
        launch_country: activeMission.launch?.country || 'India',
        launch_vehicle: activeMission.launch?.vehicle || 'AeroSpace Small-Lift I',
        orbit_altitude: activeMission.orbit?.altitude_km || 550,
        orbit_inclination: activeMission.orbit?.inclination_deg || 97.6,
        orbit_type: activeMission.orbit?.type || 'Sun-Synchronous (SSO)',
        payload_mass: activeMission.mission?.payload_mass_kg || 250,
        mission_duration: activeMission.mission?.duration_days || 365,
        budget: activeMission.mission?.budget_musd || 50,
        preferred_launch_date: activeMission.constraints?.preferred_launch_date || '2026-10-15',
        launch_window_flexibility_days: activeMission.constraints?.launch_window_flexibility_days || 3,
        max_risk: activeMission.constraints?.maximum_acceptable_risk || 'MEDIUM'
      };
    }
    return {
      mission_name: 'LEO Earth Observation Mission',
      objective_type: 'EARTH_OBSERVATION',
      target_area: 'Metropolitan & Coastal Zone',
      target_country: 'Coastal Region',
      target_lat: 13.0827,
      target_lng: 80.2707,
      coverage_requirement: 85,
      coverage_radius_km: 120,
      launch_site: 'Satish Dhawan Space Centre (SDSC SHAR)',
      launch_site_code: 'SDSC_SHAR',
      launch_country: 'India',
      launch_vehicle: 'AeroSpace Small-Lift I',
      orbit_altitude: 550,
      orbit_inclination: 97.6,
      orbit_type: 'Sun-Synchronous (SSO)',
      payload_mass: 250,
      mission_duration: 365,
      budget: 50,
      preferred_launch_date: '2026-10-15',
      launch_window_flexibility_days: 3,
      max_risk: 'MEDIUM'
    };
  });

  const handleLaunchAnalysis = async () => {
    const payload = {
      mission_id: activeMission?.mission_id || `AMDSF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      mission_name: form.mission_name,
      objective: {
        type: form.objective_type,
        description: `Autonomous ${form.objective_type.toLowerCase()} mission payload.`
      },
      target: {
        area: form.target_area,
        region: form.target_area,
        country: form.target_country,
        latitude: Number(form.target_lat),
        longitude: Number(form.target_lng),
        coverage_requirement: Number(form.coverage_requirement),
        coverage_radius_km: Number(form.coverage_radius_km)
      },
      launch: {
        site: form.launch_site,
        launch_site_code: form.launch_site_code,
        country: form.launch_country,
        vehicle: form.launch_vehicle
      },
      orbit: {
        type: form.orbit_type,
        altitude_km: Number(form.orbit_altitude),
        inclination_deg: Number(form.orbit_inclination),
        eccentricity: 0.0012
      },
      mission: {
        payload_mass_kg: Number(form.payload_mass),
        budget_musd: Number(form.budget),
        duration_days: Number(form.mission_duration)
      },
      constraints: {
        preferred_launch_date: form.preferred_launch_date,
        launch_window_flexibility_days: Number(form.launch_window_flexibility_days),
        maximum_acceptable_risk: form.max_risk
      }
    };

    const res = await runFullAnalysis(payload);
    if (res) {
      navigate('/recommendation');
    }
  };

  // 7 Stages of the Visual Construction Workflow
  const stages = [
    {
      id: 'objective',
      label: 'MISSION OBJECTIVE',
      value: form.objective_type,
      sub: `${form.payload_mass} kg Payload`,
      icon: FileText,
      status: 'CONFIGURED'
    },
    {
      id: 'target',
      label: 'TARGET REGION',
      value: form.target_area,
      sub: `${form.target_lat}°N, ${form.target_lng}°E`,
      icon: Target,
      status: 'CONFIGURED'
    },
    {
      id: 'site',
      label: 'LAUNCH SITE',
      value: form.launch_site?.split('(')[0]?.trim(),
      sub: form.launch_country,
      icon: Rocket,
      status: 'CONFIGURED'
    },
    {
      id: 'vehicle',
      label: 'LAUNCH VEHICLE',
      value: form.launch_vehicle,
      sub: `Capacity ≥ ${form.payload_mass} kg`,
      icon: Gauge,
      status: 'COMPATIBLE'
    },
    {
      id: 'orbit',
      label: 'ORBIT CONFIGURATION',
      value: `${form.orbit_altitude} km ${form.orbit_type}`,
      sub: `${form.orbit_inclination}° Inclination`,
      icon: Compass,
      status: 'VALIDATED'
    },
    {
      id: 'constraints',
      label: 'CONSTRAINTS & BUDGET',
      value: `${form.preferred_launch_date} (±${form.launch_window_flexibility_days}d)`,
      sub: `$${form.budget}M Budget Limit`,
      icon: Calendar,
      status: 'VERIFIED'
    }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Full-Screen High-Resolution Space Background */}
      <BackgroundScene scene="orbit" overlayGradient="standard" />
      <StarfieldCanvas count={50} opacity={0.35} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-20 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/10 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
                Mission Construction & Orbit Configuration
              </h1>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              FIGURE 2: VISUAL MISSION CONSTRUCTION PIPELINE & KEPLERIAN TRAJECTORY GENERATOR
            </p>
          </div>

          <button
            onClick={handleLaunchAnalysis}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
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

        {/* Global Architecture Pipeline (Figure 3) */}
        <ResearchPipeline currentStep="profile" compact={true} />

        {/* 2-COLUMN MAIN CONTENT: LEFT (CONSTRUCTION WORKFLOW), RIGHT (ORBITAL PREVIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: VISUAL MISSION CONSTRUCTION PIPELINE (~50% width) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-black/75 border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl hud-corner-ticks">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono mb-3">
                <span className="font-bold text-white uppercase tracking-wider">
                  MISSION CONSTRUCTION PIPELINE
                </span>
                <span className="text-[10px] text-cyan-400">Click Stage to Adjust</span>
              </div>

              {/* Vertical Pipeline Nodes */}
              <div className="space-y-2">
                {stages.map((stg, idx) => {
                  const Icon = stg.icon;
                  const isSelected = activeStage === stg.id;

                  return (
                    <div key={stg.id}>
                      <div
                        onClick={() => setActiveStage(stg.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between font-mono ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                            : 'bg-black/50 border-white/10 hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-black/60 text-cyan-300 border-white/10'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{stg.label}</div>
                            <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                              {stg.value}
                            </div>
                            <div className="text-[9px] text-slate-400">{stg.sub}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                            {stg.status}
                          </span>
                          <ChevronRight className={`w-4 h-4 text-cyan-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded In-Place Tuner for Active Stage */}
                      {isSelected && (
                        <div className="mt-2 p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 font-mono text-xs space-y-3 animate-fadeIn">
                          {activeStage === 'orbit' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Altitude (km)</label>
                                  <input
                                    type="number"
                                    min="300"
                                    max="1200"
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
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setForm({ ...form, orbit_altitude: 550, orbit_inclination: 97.6, orbit_type: 'SSO' })}
                                  className="px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-[10px] text-slate-300 hover:text-white"
                                >
                                  Preset: 550km SSO
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setForm({ ...form, orbit_altitude: 400, orbit_inclination: 51.6, orbit_type: 'LEO' })}
                                  className="px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-[10px] text-slate-300 hover:text-white"
                                >
                                  Preset: 400km ISS
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setForm({ ...form, orbit_altitude: 780, orbit_inclination: 98.6, orbit_type: 'Polar' })}
                                  className="px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-[10px] text-slate-300 hover:text-white"
                                >
                                  Preset: 780km Polar
                                </button>
                              </div>
                            </div>
                          )}

                          {activeStage === 'target' && (
                            <div className="space-y-2">
                              <label className="text-[10px] text-slate-400 uppercase block">Select Target Scenario:</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(CURATED_TARGETS).flatMap(([cat, sub]) =>
                                  Object.entries(sub).flatMap(([subcat, items]) =>
                                    items.map((item, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setForm({
                                          ...form,
                                          target_area: item.name,
                                          target_country: item.country,
                                          target_lat: item.lat,
                                          target_lng: item.lng
                                        })}
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
                            </div>
                          )}

                          {activeStage === 'site' && (
                            <div className="space-y-2">
                              <label className="text-[10px] text-slate-400 uppercase block">Select Launch Spaceport:</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {CURATED_LAUNCH_SITES.map((site) => (
                                  <button
                                    key={site.code}
                                    type="button"
                                    onClick={() => setForm({
                                      ...form,
                                      launch_site: site.name,
                                      launch_site_code: site.code,
                                      launch_country: site.country
                                    })}
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
                            </div>
                          )}

                          {activeStage === 'vehicle' && (
                            <div className="grid grid-cols-3 gap-2">
                              {['AeroSpace Small-Lift I', 'AeroSpace Medium-Lift IV', 'AeroSpace Heavy Booster'].map((veh) => (
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
                          )}

                          {activeStage === 'constraints' && (
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
                                <label className="text-[10px] text-slate-400 uppercase block mb-1">Budget ($M USD)</label>
                                <input
                                  type="number"
                                  value={form.budget}
                                  onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                                  className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-cyan-300 font-bold"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={handleLaunchAnalysis}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Multi-Agent Analysis Pipeline</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: VISUAL ORBITAL PREVIEW (~50% width) */}
          <div className="lg:col-span-6">
            <OrbitalEllipsePreview form={form} />
          </div>

        </div>
      </div>
    </div>
  );
}
