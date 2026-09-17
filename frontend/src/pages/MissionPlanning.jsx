import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders, Play, RefreshCw, Layers, CheckCircle2, ChevronRight,
  ChevronLeft, Compass, Globe2, Rocket, Award, ShieldAlert,
  HelpCircle, AlertCircle, MapPin, Terminal, Calendar, DollarSign
} from 'lucide-react';
import { useMission } from '../context/MissionContext';
import StarfieldCanvas from '../components/StarfieldCanvas';
import BackgroundScene from '../components/BackgroundScene';

// Curated geographic regions & spaceports dataset
const CURATED_TARGETS = {
  "China": {
    "Beijing": [
      { name: "Beijing Metropolitan Area", lat: 39.9042, lng: 116.4074 },
      { name: "Haidian Science & Technology Park", lat: 39.9593, lng: 116.2981 }
    ],
    "Shanghai": [
      { name: "Pudong Financial & Maritime Port", lat: 31.2304, lng: 121.4737 },
      { name: "Yangtze River Delta Economic Zone", lat: 31.2990, lng: 120.5853 }
    ],
    "Guangdong": [
      { name: "Shenzhen High-Tech Corridor", lat: 22.5431, lng: 114.0579 },
      { name: "Guangzhou Pearl River Delta", lat: 23.1291, lng: 113.2644 }
    ]
  },
  "India": {
    "Tamil Nadu": [
      { name: "Chennai Metropolitan Region", lat: 13.0827, lng: 80.2707 },
      { name: "Coimbatore Industrial Corridor", lat: 11.0168, lng: 76.9558 },
      { name: "Madurai Cultural & Agricultural Zone", lat: 9.9252, lng: 78.1198 }
    ],
    "Karnataka": [
      { name: "Bengaluru Tech & Defense Corridor", lat: 12.9716, lng: 77.5946 },
      { name: "Mysuru Heritage & Science Region", lat: 12.2958, lng: 76.6394 }
    ],
    "Maharashtra": [
      { name: "Mumbai Coastal Metropolitan", lat: 19.0760, lng: 72.8777 },
      { name: "Pune Space & Innovation Cluster", lat: 18.5204, lng: 73.8567 }
    ]
  },
  "United States": {
    "Florida": [
      { name: "Space Coast / Brevard County", lat: 28.3922, lng: -80.6077 },
      { name: "Miami-Dade Coastal Basin", lat: 25.7617, lng: -80.1918 }
    ],
    "California": [
      { name: "Silicon Valley / Bay Area", lat: 37.3861, lng: -122.0839 },
      { name: "Los Angeles Aerospace Basin", lat: 34.0522, lng: -118.2437 }
    ],
    "Texas": [
      { name: "Houston Spaceport & Energy Corridor", lat: 29.7604, lng: -95.3698 },
      { name: "Austin Innovation Basin", lat: 30.2672, lng: -97.7431 }
    ]
  },
  "Europe": {
    "France": [
      { name: "Paris Île-de-France Region", lat: 48.8566, lng: 2.3522 },
      { name: "Toulouse Aerospace Valley", lat: 43.6047, lng: 1.4442 }
    ],
    "Germany": [
      { name: "Darmstadt Space Operations Node", lat: 49.8728, lng: 8.6512 },
      { name: "Munich High-Tech Cluster", lat: 48.1351, lng: 11.5820 }
    ],
    "United Kingdom": [
      { name: "London Metropolitan Area", lat: 51.5074, lng: -0.1278 },
      { name: "Harwell Space Science Cluster", lat: 51.5728, lng: -1.3142 }
    ]
  },
  "Japan": {
    "Kanto": [
      { name: "Tokyo Metropolitan Area", lat: 35.6762, lng: 139.6503 },
      { name: "Tsukuba Space Center Node", lat: 36.0645, lng: 140.1272 }
    ]
  },
  "Custom / Other": {
    "Manual Coordinates": [
      { name: "Custom Observation Point", lat: 0.0, lng: 0.0 }
    ]
  }
};

const CURATED_LAUNCH_SITES = {
  "India": [
    { name: "Satish Dhawan Space Centre — Sriharikota", code: "SDSC_SHAR", country: "India" }
  ],
  "United States": [
    { name: "Cape Canaveral Space Force Station (SLC-40 / SLC-41)", code: "CCAFS", country: "United States" },
    { name: "Kennedy Space Center (LC-39A / LC-39B)", code: "KSC", country: "United States" },
    { name: "Vandenberg Space Force Base (SLC-4E)", code: "VANDENBERG", country: "United States" }
  ],
  "Europe / ESA": [
    { name: "Guiana Space Centre, Kourou (ELA-4 / ZLV)", code: "KOUROU", country: "France / ESA" }
  ],
  "Japan": [
    { name: "Tanegashima Space Center (Yoshinobu Launch Complex)", code: "TNSC", country: "Japan" }
  ],
  "China": [
    { name: "Jiuquan Satellite Launch Center (SLS-1 / SLS-2)", code: "JSLC", country: "China" },
    { name: "Wenchang Space Launch Site (LC-101 / LC-201)", code: "WSLS", country: "China" }
  ],
  "Custom / International": [
    { name: "Autonomous Sea Launch Platform", code: "SEA_LAUNCH", country: "International Waters" },
    { name: "Custom Spaceport Facility", code: "CUSTOM_SITE", country: "Custom" }
  ]
};

export default function MissionPlanning() {
  const navigate = useNavigate();
  const { activeMission, runFullAnalysis, loading, error } = useMission();
  const [step, setStep] = useState(1);

  // Complete Structured Mission Definition State
  const [form, setForm] = useState(() => {
    if (activeMission) {
      return {
        mission_name: activeMission.mission_name || 'China Earth Observation Mission',
        objective_type: activeMission.objective?.type || 'EARTH_OBSERVATION',
        objective_description: activeMission.objective?.description || 'High-resolution optical and infrared earth observation.',
        target_country: activeMission.target?.country || 'China',
        target_region: activeMission.target?.region || 'Beijing',
        target_area: activeMission.target?.area || 'Beijing Metropolitan Area',
        target_latitude: activeMission.target?.latitude ?? 39.9042,
        target_longitude: activeMission.target?.longitude ?? 116.4074,
        coverage_requirement: activeMission.target?.coverage_requirement ?? 80,
        coverage_radius_km: activeMission.target?.coverage_radius_km ?? 100,
        launch_country: activeMission.launch?.country || 'India',
        launch_site: activeMission.launch?.site || 'Satish Dhawan Space Centre — Sriharikota',
        launch_site_code: activeMission.launch?.launch_site_code || 'SDSC_SHAR',
        launch_vehicle: activeMission.launch?.vehicle || 'AUTO',
        orbit_type: activeMission.orbit?.type || 'LEO',
        altitude_km: activeMission.orbit?.altitude_km ?? 550,
        inclination_deg: activeMission.orbit?.inclination_deg ?? 97.6,
        eccentricity: activeMission.orbit?.eccentricity ?? 0.0,
        raan: activeMission.orbit?.raan || 'Auto',
        arg_perigee: activeMission.orbit?.arg_perigee || 'Auto',
        duration_days: activeMission.mission?.duration_days ?? 365,
        payload_mass_kg: activeMission.mission?.payload_mass_kg ?? 250,
        budget_musd: activeMission.mission?.budget_musd ?? 50,
        preferred_launch_date: activeMission.constraints?.preferred_launch_date || '2026-10-15',
        preferred_launch_time: activeMission.constraints?.preferred_launch_time || '10:30 UTC',
        maximum_acceptable_risk: activeMission.constraints?.maximum_acceptable_risk || 'MEDIUM',
        launch_window_flexibility_days: activeMission.constraints?.launch_window_flexibility_days ?? 3
      };
    }
    return {
      mission_name: 'China Earth Observation Mission',
      objective_type: 'EARTH_OBSERVATION',
      objective_description: 'High-resolution optical and infrared earth observation for coastal environmental monitoring and infrastructure analysis.',
      target_country: 'China',
      target_region: 'Beijing',
      target_area: 'Beijing Metropolitan Area',
      target_latitude: 39.9042,
      target_longitude: 116.4074,
      coverage_requirement: 80,
      coverage_radius_km: 100,
      launch_country: 'India',
      launch_site: 'Satish Dhawan Space Centre — Sriharikota',
      launch_site_code: 'SDSC_SHAR',
      launch_vehicle: 'AUTO',
      orbit_type: 'LEO',
      altitude_km: 550,
      inclination_deg: 97.6,
      eccentricity: 0.0,
      raan: 'Auto',
      arg_perigee: 'Auto',
      duration_days: 365,
      payload_mass_kg: 250,
      budget_musd: 50,
      preferred_launch_date: '2026-10-15',
      preferred_launch_time: '10:30 UTC',
      maximum_acceptable_risk: 'MEDIUM',
      launch_window_flexibility_days: 3
    };
  });

  const [validationErrors, setValidationErrors] = useState([]);

  // Hierarchical Target helpers
  const handleCountryChange = (country) => {
    const regions = CURATED_TARGETS[country] || {};
    const firstRegion = Object.keys(regions)[0] || 'Default Region';
    const areas = regions[firstRegion] || [];
    const firstArea = areas[0] || { name: 'Target Area', lat: 0, lng: 0 };

    setForm(prev => ({
      ...prev,
      target_country: country,
      target_region: firstRegion,
      target_area: firstArea.name,
      target_latitude: firstArea.lat,
      target_longitude: firstArea.lng
    }));
  };

  const handleRegionChange = (region) => {
    const areas = CURATED_TARGETS[form.target_country]?.[region] || [];
    const firstArea = areas[0] || { name: 'Target Area', lat: form.target_latitude, lng: form.target_longitude };

    setForm(prev => ({
      ...prev,
      target_region: region,
      target_area: firstArea.name,
      target_latitude: firstArea.lat,
      target_longitude: firstArea.lng
    }));
  };

  const handleAreaChange = (areaName) => {
    const areas = CURATED_TARGETS[form.target_country]?.[form.target_region] || [];
    const selected = areas.find(a => a.name === areaName) || { name: areaName, lat: form.target_latitude, lng: form.target_longitude };

    setForm(prev => ({
      ...prev,
      target_area: selected.name,
      target_latitude: selected.lat,
      target_longitude: selected.lng
    }));
  };

  const handleLaunchCountryChange = (country) => {
    const sites = CURATED_LAUNCH_SITES[country] || [];
    const firstSite = sites[0] || { name: 'Custom Site', code: 'SITE_01' };
    setForm(prev => ({
      ...prev,
      launch_country: country,
      launch_site: firstSite.name,
      launch_site_code: firstSite.code
    }));
  };

  const handleLaunchSiteChange = (siteName) => {
    const sites = CURATED_LAUNCH_SITES[form.launch_country] || [];
    const selected = sites.find(s => s.name === siteName) || { name: siteName, code: 'SITE_01' };
    setForm(prev => ({
      ...prev,
      launch_site: selected.name,
      launch_site_code: selected.code
    }));
  };

  const validateCurrentStep = () => {
    const errors = [];
    if (step === 1) {
      if (!form.mission_name.trim()) errors.push("Mission name is required.");
      if (!form.objective_type) errors.push("Mission objective must be selected.");
    } else if (step === 2) {
      if (!form.target_country) errors.push("Target country is required.");
      if (!form.target_area) errors.push("Target operational area is required.");
      if (isNaN(form.target_latitude) || form.target_latitude < -90 || form.target_latitude > 90) {
        errors.push("Valid Target Latitude (-90 to +90) is required.");
      }
      if (isNaN(form.target_longitude) || form.target_longitude < -180 || form.target_longitude > 180) {
        errors.push("Valid Target Longitude (-180 to +180) is required.");
      }
      if (form.coverage_requirement <= 0 || form.coverage_requirement > 100) {
        errors.push("Coverage requirement must be between 1% and 100%.");
      }
      if (form.coverage_radius_km <= 0) {
        errors.push("Coverage radius must be greater than 0 km.");
      }
    } else if (step === 3) {
      if (!form.launch_country) errors.push("Launch country is required.");
      if (!form.launch_site) errors.push("Launch site is required.");
    } else if (step === 4) {
      if (form.altitude_km < 180 || form.altitude_km > 36000) {
        errors.push("Orbit altitude must be between 180 km and 36,000 km.");
      }
      if (form.inclination_deg < 0 || form.inclination_deg > 180) {
        errors.push("Orbit inclination must be between 0° and 180°.");
      }
    } else if (step === 5) {
      if (form.payload_mass_kg <= 0) errors.push("Payload mass must be greater than 0 kg.");
      if (form.budget_musd <= 0) errors.push("Allocated budget must be greater than $0M.");
      if (form.duration_days <= 0) errors.push("Mission duration must be greater than 0 days.");
      if (!form.preferred_launch_date) errors.push("Preferred launch date is required.");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(prev => Math.min(6, prev + 1));
    }
  };

  const handleBack = () => {
    setValidationErrors([]);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmitAnalysis = async () => {
    if (!validateCurrentStep()) return;

    const requestPayload = {
      mission_name: form.mission_name,
      objective: {
        type: form.objective_type,
        description: form.objective_description
      },
      target: {
        country: form.target_country,
        region: form.target_region,
        area: form.target_area,
        latitude: parseFloat(form.target_latitude),
        longitude: parseFloat(form.target_longitude),
        coverage_requirement: parseFloat(form.coverage_requirement),
        coverage_radius_km: parseFloat(form.coverage_radius_km)
      },
      launch: {
        country: form.launch_country,
        site: form.launch_site,
        launch_site_code: form.launch_site_code,
        vehicle: form.launch_vehicle
      },
      orbit: {
        type: form.orbit_type,
        altitude_km: parseFloat(form.altitude_km),
        inclination_deg: parseFloat(form.inclination_deg),
        eccentricity: parseFloat(form.eccentricity),
        raan: form.raan,
        arg_perigee: form.arg_perigee
      },
      mission: {
        duration_days: parseInt(form.duration_days),
        payload_mass_kg: parseFloat(form.payload_mass_kg),
        budget_musd: parseFloat(form.budget_musd)
      },
      constraints: {
        preferred_launch_date: form.preferred_launch_date,
        preferred_launch_time: form.preferred_launch_time || null,
        maximum_acceptable_risk: form.maximum_acceptable_risk,
        launch_window_flexibility_days: parseInt(form.launch_window_flexibility_days)
      }
    };

    const res = await runFullAnalysis(requestPayload);
    if (res) {
      navigate('/recommendation');
    }
  };

  const stepsList = [
    { num: 1, title: 'Objective' },
    { num: 2, title: 'Target' },
    { num: 3, title: 'Launch' },
    { num: 4, title: 'Orbit' },
    { num: 5, title: 'Constraints' },
    { num: 6, title: 'Review' },
  ];

  return (
    <div className="relative min-h-screen">
      <BackgroundScene scene="rocket" overlayGradient="standard" />
      <StarfieldCanvas count={50} opacity={0.35} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20 relative z-10">
        {/* Floating Aerospace Header */}
        <div className="hud-glass hud-corner-ticks p-6 sm:p-8 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <Sliders className="w-4 h-4" />
            <span className="font-semibold tracking-wider uppercase">MISSION SPECIFICATION & FLIGHT PROFILE WIZARD</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-wide">
            Flight Parameters Specification
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-2xl leading-relaxed">
            Define target geography, spaceport staging, orbital mechanics, and budget thresholds. Data propagates across all 4 domain intelligence agents.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="hud-glass hud-corner-ticks p-4">
        <div className="flex items-center justify-between">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (s.num < step) setStep(s.num);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition ${
                    step === s.num
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40 ring-2 ring-cyan-400'
                      : step > s.num
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      : 'bg-space-850 text-slate-500 border border-space-700'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </button>
                <span className={`text-xs font-mono hidden sm:inline ${
                  step === s.num ? 'text-cyan-300 font-bold' : step > s.num ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {s.title}
                </span>
              </div>
              {idx < stepsList.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  step > s.num ? 'bg-cyan-500/60' : 'bg-space-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Validation Errors Notice */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-4 text-xs font-mono text-rose-300 space-y-1">
          <div className="font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Please complete all required fields before proceeding:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2 text-rose-200">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-4 text-xs font-mono text-rose-300">
          {error}
        </div>
      )}

      {/* STEP 1: MISSION OBJECTIVE */}
      {step === 1 && (
        <div className="bg-space-900/90 border border-space-700 rounded-xl p-6 shadow-xl space-y-5 backdrop-blur-md hud-corner-ticks">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 1 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Mission Objective & Identification</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Establish core mission naming and high-level operational domain category.
            </p>
          </div>

          <div className="space-y-4 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Mission Name *
              </label>
              <input
                type="text"
                value={form.mission_name}
                onChange={(e) => setForm({ ...form, mission_name: e.target.value })}
                placeholder="e.g. China Earth Observation Mission or India Communication Mission"
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Primary Objective Type *
              </label>
              <select
                value={form.objective_type}
                onChange={(e) => setForm({ ...form, objective_type: e.target.value })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="EARTH_OBSERVATION">Earth Observation (Optical / SAR / Multispectral)</option>
                <option value="COMMUNICATION">Satellite Communication & Broadband Relay</option>
                <option value="WEATHER_MONITORING">Weather & Atmospheric Monitoring</option>
                <option value="NAVIGATION">Positioning, Navigation & Timing (PNT)</option>
                <option value="SCIENTIFIC_RESEARCH">Space Science & Heliophysics Research</option>
                <option value="TECH_DEMONSTRATION">Technology Demonstration & In-Orbit Validation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Mission Description & Scope
              </label>
              <textarea
                rows="3"
                value={form.objective_description}
                onChange={(e) => setForm({ ...form, objective_description: e.target.value })}
                placeholder="Provide brief mission overview, payload goals, and decision constraints..."
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: TARGET DEFINITION */}
      {step === 2 && (
        <div className="bg-space-900/90 border border-space-700 rounded-xl p-6 shadow-xl space-y-5 backdrop-blur-md hud-corner-ticks">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 2 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Target Operational Geography</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Specify ground observation region, precise coordinates, and coverage constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Target Country *
              </label>
              <select
                value={form.target_country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                {Object.keys(CURATED_TARGETS).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Target State / Region *
              </label>
              <select
                value={form.target_region}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                {Object.keys(CURATED_TARGETS[form.target_country] || {}).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Target Area / Zone *
              </label>
              <select
                value={form.target_area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                {(CURATED_TARGETS[form.target_country]?.[form.target_region] || []).map(a => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Target Latitude (° N/S) *
              </label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={form.target_latitude}
                onChange={(e) => setForm({ ...form, target_latitude: parseFloat(e.target.value) || 0.0 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Target Longitude (° E/W) *
              </label>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={form.target_longitude}
                onChange={(e) => setForm({ ...form, target_longitude: parseFloat(e.target.value) || 0.0 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Coverage Requirement (%) *
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={form.coverage_requirement}
                onChange={(e) => setForm({ ...form, coverage_requirement: parseFloat(e.target.value) || 80 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Coverage Radius (km) *
              </label>
              <input
                type="number"
                min="10"
                max="2500"
                value={form.coverage_radius_km}
                onChange={(e) => setForm({ ...form, coverage_radius_km: parseFloat(e.target.value) || 100 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div className="p-3 bg-space-850/60 rounded-lg border border-space-700/60 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Target location specifies ground observation focus. Launch site is configured separately in Step 3.</span>
          </div>
        </div>
      )}

      {/* STEP 3: LAUNCH CONFIGURATION */}
      {step === 3 && (
        <div className="bg-space-900/90 border border-space-700 rounded-xl p-6 shadow-xl space-y-5 backdrop-blur-md hud-corner-ticks">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 3 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Launch Spaceport & Staging</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Select supported spaceport facilities and launch vehicle configurations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Launch Country *
              </label>
              <select
                value={form.launch_country}
                onChange={(e) => handleLaunchCountryChange(e.target.value)}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                {Object.keys(CURATED_LAUNCH_SITES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Supported Launch Site / Spaceport *
              </label>
              <select
                value={form.launch_site}
                onChange={(e) => handleLaunchSiteChange(e.target.value)}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                {(CURATED_LAUNCH_SITES[form.launch_country] || []).map(s => (
                  <option key={s.name} value={s.name}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Assigned Vehicle Class
              </label>
              <select
                value={form.launch_vehicle}
                onChange={(e) => setForm({ ...form, launch_vehicle: e.target.value })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="AUTO">Auto Select (Optimized by Feasibility Agent)</option>
                <option value="AeroSpace Small-Lift I">AeroSpace Small-Lift I (0 - 350 kg)</option>
                <option value="AeroSpace Medium-Lift IV">AeroSpace Medium-Lift IV (350 - 1500 kg)</option>
                <option value="AeroSpace Heavy Booster">AeroSpace Heavy Booster (1500+ kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Facility Code
              </label>
              <input
                type="text"
                readOnly
                value={form.launch_site_code}
                className="w-full bg-space-850/50 border border-space-700 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: ORBITAL CONFIGURATION */}
      {step === 4 && (
        <div className="bg-space-900/90 border border-space-700 rounded-xl p-6 shadow-xl space-y-5 backdrop-blur-md hud-corner-ticks">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 4 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Orbital Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Configure altitude, orbital inclination, and eccentricity parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Orbit Regime *
              </label>
              <select
                value={form.orbit_type}
                onChange={(e) => setForm({ ...form, orbit_type: e.target.value })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="LEO">LEO — Low Earth Orbit (180 - 1,200 km)</option>
                <option value="SSO">SSO — Sun-Synchronous Orbit (500 - 900 km)</option>
                <option value="MEO">MEO — Medium Earth Orbit (2,000 - 20,000 km)</option>
                <option value="GEO">GEO — Geostationary Orbit (35,786 km)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Target Altitude (km) *
              </label>
              <input
                type="number"
                min="180"
                max="36000"
                value={form.altitude_km}
                onChange={(e) => setForm({ ...form, altitude_km: parseFloat(e.target.value) || 550 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Inclination (Degrees) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="180"
                value={form.inclination_deg}
                onChange={(e) => setForm({ ...form, inclination_deg: parseFloat(e.target.value) || 97.6 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Eccentricity
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                max="0.99"
                value={form.eccentricity}
                onChange={(e) => setForm({ ...form, eccentricity: parseFloat(e.target.value) || 0.0 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: MISSION CONSTRAINTS */}
      {step === 5 && (
        <div className="bg-space-900/90 border border-space-700 rounded-xl p-6 shadow-xl space-y-5 backdrop-blur-md hud-corner-ticks">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 5 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Payload, Budget & Constraints</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Set mass constraints, financial allocation, and candidate launch timing windows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Payload Mass (kg) *
              </label>
              <input
                type="number"
                min="1"
                max="25000"
                value={form.payload_mass_kg}
                onChange={(e) => setForm({ ...form, payload_mass_kg: parseFloat(e.target.value) || 250 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Budget ($M USD) *
              </label>
              <input
                type="number"
                min="1"
                max="2000"
                value={form.budget_musd}
                onChange={(e) => setForm({ ...form, budget_musd: parseFloat(e.target.value) || 50 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Duration (Days) *
              </label>
              <input
                type="number"
                min="30"
                max="3650"
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 365 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Preferred Launch Date *
              </label>
              <input
                type="date"
                value={form.preferred_launch_date}
                onChange={(e) => setForm({ ...form, preferred_launch_date: e.target.value })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Max Acceptable Risk
              </label>
              <select
                value={form.maximum_acceptable_risk}
                onChange={(e) => setForm({ ...form, maximum_acceptable_risk: e.target.value })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="LOW">Low Risk Tolerance (Conservative)</option>
                <option value="MEDIUM">Medium Risk Tolerance (Balanced)</option>
                <option value="HIGH">High Risk Tolerance (Aggressive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5 uppercase">
                Window Flexibility (Days)
              </label>
              <input
                type="number"
                min="0"
                max="14"
                value={form.launch_window_flexibility_days}
                onChange={(e) => setForm({ ...form, launch_window_flexibility_days: parseInt(e.target.value) || 3 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: REVIEW & VALIDATE */}
      {step === 6 && (
        <div className="bg-space-900/90 border border-space-700 rounded-xl p-6 shadow-xl space-y-6 backdrop-blur-md hud-corner-ticks">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 6 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Review Mission Definition & Run Multi-Agent Analysis</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Verify all configured parameters before dispatching to the 4 autonomous domain agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-space-850 p-4 rounded-xl border border-space-700 space-y-2">
              <div className="text-[10px] uppercase font-bold text-cyan-400">Mission Overview</div>
              <div className="text-sm font-bold text-white">{form.mission_name}</div>
              <div className="text-slate-300">Objective: <strong className="text-white">{form.objective_type}</strong></div>
              <div className="text-slate-300">Duration: <strong className="text-white">{form.duration_days} days</strong></div>
              <div className="text-slate-300">Allocated Budget: <strong className="text-emerald-400">${form.budget_musd}M USD</strong></div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 space-y-2">
              <div className="text-[10px] uppercase font-bold text-cyan-400">Target Location</div>
              <div className="text-sm font-bold text-white">{form.target_area}, {form.target_region}</div>
              <div className="text-slate-300">Coordinates: <strong className="text-white">{form.target_latitude}° N, {form.target_longitude}° E</strong></div>
              <div className="text-slate-300">Coverage Goal: <strong className="text-cyan-300">{form.coverage_requirement}% (Radius: {form.coverage_radius_km}km)</strong></div>
              <div className="text-slate-300">Country: <strong className="text-white">{form.target_country}</strong></div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 space-y-2">
              <div className="text-[10px] uppercase font-bold text-cyan-400">Launch Configuration</div>
              <div className="text-sm font-bold text-white">{form.launch_site}</div>
              <div className="text-slate-300">Site Code: <strong className="text-white">{form.launch_site_code}</strong></div>
              <div className="text-slate-300">Vehicle Assignment: <strong className="text-white">{form.launch_vehicle}</strong></div>
              <div className="text-slate-300">Preferred Date: <strong className="text-emerald-400">{form.preferred_launch_date} (±{form.launch_window_flexibility_days}d)</strong></div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 space-y-2">
              <div className="text-[10px] uppercase font-bold text-cyan-400">Orbital & Payload Specs</div>
              <div className="text-sm font-bold text-white">{form.orbit_type} — {form.altitude_km} km</div>
              <div className="text-slate-300">Inclination: <strong className="text-white">{form.inclination_deg}°</strong> | Eccentricity: <strong className="text-white">{form.eccentricity}</strong></div>
              <div className="text-slate-300">Payload Wet Mass: <strong className="text-white">{form.payload_mass_kg} kg</strong></div>
              <div className="text-slate-300">Risk Policy: <strong className="text-amber-300">{form.maximum_acceptable_risk}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between font-mono">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2.5 rounded-lg bg-space-850 hover:bg-space-800 text-xs font-semibold text-slate-300 border border-space-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}

        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmitAnalysis}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-sm font-bold shadow-xl shadow-cyan-500/30 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Dispatching Autonomous Agents...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Run Multi-Agent Analysis</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  </div>
  );
}
