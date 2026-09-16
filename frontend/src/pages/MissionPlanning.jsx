import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sliders, Play, RefreshCw, Layers, CheckCircle2, ChevronRight,
  ChevronLeft, Compass, Globe2, Rocket, Award, ShieldAlert,
  HelpCircle, AlertCircle, MapPin
} from 'lucide-react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

// Curated geographic regions & spaceports dataset
const CURATED_TARGETS = {
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
  ]
};

export default function MissionPlanning({ onRunAnalysis, loading, error }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Complete Structured Mission Definition State
  const [form, setForm] = useState({
    // Step 1: Objective
    mission_name: 'AMDSF Earth Observation Mission',
    objective_type: 'EARTH_OBSERVATION',
    objective_description: 'High-resolution optical and infrared earth observation for coastal environmental monitoring and infrastructure analysis.',
    
    // Step 2: Target
    target_country: 'India',
    target_region: 'Tamil Nadu',
    target_area: 'Chennai Metropolitan Region',
    target_latitude: 13.0827,
    target_longitude: 80.2707,
    coverage_requirement: 80,
    coverage_radius_km: 100,

    // Step 3: Launch
    launch_country: 'India',
    launch_site: 'Satish Dhawan Space Centre — Sriharikota',
    launch_site_code: 'SDSC_SHAR',
    launch_vehicle: 'AUTO',

    // Step 4: Orbit
    orbit_type: 'LEO',
    altitude_km: 550,
    inclination_deg: 97.6,
    eccentricity: 0.0,
    raan: 'Auto',
    arg_perigee: 'Auto',

    // Step 5: Constraints & Lifecycle
    duration_days: 365,
    payload_mass_kg: 250,
    budget_musd: 50,
    preferred_launch_date: '2026-10-15',
    preferred_launch_time: '10:30 UTC',
    maximum_acceptable_risk: 'MEDIUM',
    launch_window_flexibility_days: 3
  });

  const [validationErrors, setValidationErrors] = useState([]);

  // Hierarchical Target helpers
  const handleCountryChange = (country) => {
    const regions = CURATED_TARGETS[country] || {};
    const firstRegion = Object.keys(regions)[0] || '';
    const areas = regions[firstRegion] || [];
    const firstArea = areas[0] || { name: '', lat: 0, lng: 0 };

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
    const firstArea = areas[0] || { name: '', lat: 0, lng: 0 };

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
    const firstSite = sites[0] || { name: '', code: 'OTHER' };
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
    } else if (step === 3) {
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

    const success = await onRunAnalysis(requestPayload);
    if (success) {
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
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="pb-4 border-b border-space-700/80">
        <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide flex items-center gap-2">
          <Sliders className="w-6 h-6 text-cyan-400" />
          Mission Definition & Parameter Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Define hierarchical target geometry, spaceport staging, and orbital constraints for multi-agent reasoning.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                onClick={() => { if (s.num < step) setStep(s.num); }}
                className={`flex items-center gap-2 cursor-pointer font-mono text-xs whitespace-nowrap transition ${
                  step === s.num
                    ? 'text-cyan-400 font-bold'
                    : step > s.num
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    step === s.num
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : step > s.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-space-800 text-slate-500 border border-space-700'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {idx < stepsList.length - 1 && (
                <div className={`h-[1px] flex-1 min-w-[12px] ${step > s.num ? 'bg-emerald-500/40' : 'bg-space-800'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {loading && <LoadingState message="Orchestrating 4 Specialized Domain Agents..." />}
      {error && <ErrorState error={error} />}

      {/* Validation Errors Box */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 font-mono text-xs text-rose-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-400 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Please resolve the following required fields:</span>
          </div>
          {validationErrors.map((err, i) => (
            <div key={i} className="pl-5">• {err}</div>
          ))}
        </div>
      )}

      {/* STEP 1: MISSION OBJECTIVE */}
      {step === 1 && (
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-6 shadow-xl space-y-5">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 1 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Mission Objective & Overview</span>
            </h2>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
              Mission Name *
            </label>
            <input
              type="text"
              value={form.mission_name}
              onChange={(e) => setForm({ ...form, mission_name: e.target.value })}
              className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              placeholder="e.g. AMDSF Earth Observation Sentinel"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
              Primary Objective Category *
            </label>
            <select
              value={form.objective_type}
              onChange={(e) => setForm({ ...form, objective_type: e.target.value })}
              className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="EARTH_OBSERVATION">Earth Observation (Optical / SAR / Multispectral)</option>
              <option value="COMMUNICATION">Communication (Broadband / RF Relay)</option>
              <option value="WEATHER_MONITORING">Weather & Atmospheric Monitoring</option>
              <option value="NAVIGATION">Navigation & Timing (PNT Constellation)</option>
              <option value="SCIENTIFIC_RESEARCH">Scientific Research & Astrophysics</option>
              <option value="TECH_DEMO">Technology Demonstration / In-Orbit Validation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
              Mission Description
            </label>
            <textarea
              rows={3}
              value={form.objective_description}
              onChange={(e) => setForm({ ...form, objective_description: e.target.value })}
              className="w-full bg-space-850 border border-space-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              placeholder="Operational goals, instrumentation payloads, sensor characteristics..."
            />
          </div>
        </div>
      )}

      {/* STEP 2: TARGET DEFINITION */}
      {step === 2 && (
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-6 shadow-xl space-y-5">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 2 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Hierarchical Target Definition</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific target coordinates and observation radius for Coverage Agent swath analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                State / Province / Region *
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
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Target Latitude (°N) *
              </label>
              <input
                type="number"
                step="0.0001"
                value={form.target_latitude}
                onChange={(e) => setForm({ ...form, target_latitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Target Longitude (°E) *
              </label>
              <input
                type="number"
                step="0.0001"
                value={form.target_longitude}
                onChange={(e) => setForm({ ...form, target_longitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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
        </div>
      )}

      {/* STEP 3: LAUNCH CONFIGURATION */}
      {step === 3 && (
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-6 shadow-xl space-y-5">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 3 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Launch Site & Spaceport Configuration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify origin launch complex. Keep distinct from satellite operational target zone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Launch Country / Agency *
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
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Launch Site / Spaceport *
              </label>
              <select
                value={form.launch_site}
                onChange={(e) => handleLaunchSiteChange(e.target.value)}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                {(CURATED_LAUNCH_SITES[form.launch_country] || []).map(s => (
                  <option key={s.code} value={s.name}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
              Launch Vehicle Staging Model
            </label>
            <select
              value={form.launch_vehicle}
              onChange={(e) => setForm({ ...form, launch_vehicle: e.target.value })}
              className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="AUTO">Auto-Select (Optimized by Feasibility Agent based on payload mass & Delta-V)</option>
              <option value="SMALL_LIFT">AeroSpace Small-Lift I (PSLV-Class, up to 350kg)</option>
              <option value="MEDIUM_LIFT">AeroSpace Medium-Lift IV (GSLV/Falcon-Class, up to 1500kg)</option>
              <option value="HEAVY_LIFT">AeroSpace Heavy-Lift Booster (LVM3/Heavy-Class, up to 5000kg)</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 4: ORBITAL CONFIGURATION */}
      {step === 4 && (
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-6 shadow-xl space-y-5">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 4 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Orbital Parameters & Mechanics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Utilized by Debris Agent (conjunctions) and Coverage Agent (revisit geometry).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Orbit Regime *
              </label>
              <select
                value={form.orbit_type}
                onChange={(e) => setForm({ ...form, orbit_type: e.target.value })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="LEO">Low Earth Orbit (LEO)</option>
                <option value="SSO">Sun-Synchronous Orbit (SSO)</option>
                <option value="MEO">Medium Earth Orbit (MEO)</option>
                <option value="GEO">Geostationary Orbit (GEO)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Orbital Inclination (degrees) *
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
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Eccentricity (0.0 = Circular)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                max="0.9"
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
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-6 shadow-xl space-y-5">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 5 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Mission Constraints & Lifecycle</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Passed to Feasibility Agent, Space Weather Agent, and Mission Orchestrator.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
                Payload Mass (kg) *
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                value={form.payload_mass_kg}
                onChange={(e) => setForm({ ...form, payload_mass_kg: parseFloat(e.target.value) || 250 })}
                className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5 uppercase">
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
        <div className="bg-space-900/90 border border-space-700/80 rounded-xl p-6 shadow-xl space-y-6">
          <div className="border-b border-space-800 pb-3">
            <h2 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 6 of 6</span>
              <span className="text-slate-500">—</span>
              <span className="text-white">Review Mission Definition & Run Multi-Agent Analysis</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify all configured parameters before dispatching to the 4 autonomous domain agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-space-850 p-4 rounded-xl border border-space-700 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-bold text-cyan-400">Mission Overview</div>
              <div className="text-sm font-bold text-white">{form.mission_name}</div>
              <div className="text-slate-300">Objective: <strong className="text-white">{form.objective_type}</strong></div>
              <div className="text-slate-300">Duration: <strong className="text-white">{form.duration_days} days</strong></div>
              <div className="text-slate-300">Allocated Budget: <strong className="text-emerald-400">${form.budget_musd}M USD</strong></div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-bold text-cyan-400">Target Location</div>
              <div className="text-sm font-bold text-white">{form.target_area}, {form.target_region}</div>
              <div className="text-slate-300">Coordinates: <strong className="text-white">{form.target_latitude}° N, {form.target_longitude}° E</strong></div>
              <div className="text-slate-300">Coverage Goal: <strong className="text-cyan-300">{form.coverage_requirement}% (Radius: {form.coverage_radius_km}km)</strong></div>
              <div className="text-slate-300">Country: <strong className="text-white">{form.target_country}</strong></div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-bold text-cyan-400">Launch Configuration</div>
              <div className="text-sm font-bold text-white">{form.launch_site}</div>
              <div className="text-slate-300">Site Code: <strong className="text-white">{form.launch_site_code}</strong></div>
              <div className="text-slate-300">Vehicle Assignment: <strong className="text-white">{form.launch_vehicle}</strong></div>
              <div className="text-slate-300">Preferred Date: <strong className="text-emerald-400">{form.preferred_launch_date} (±{form.launch_window_flexibility_days}d)</strong></div>
            </div>

            <div className="bg-space-850 p-4 rounded-xl border border-space-700 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-bold text-cyan-400">Orbital & Payload Specs</div>
              <div className="text-sm font-bold text-white">{form.orbit_type} — {form.altitude_km} km</div>
              <div className="text-slate-300">Inclination: <strong className="text-white">{form.inclination_deg}°</strong> | Eccentricity: <strong className="text-white">{form.eccentricity}</strong></div>
              <div className="text-slate-300">Payload Wet Mass: <strong className="text-white">{form.payload_mass_kg} kg</strong></div>
              <div className="text-slate-300">Risk Policy: <strong className="text-amber-300">{form.maximum_acceptable_risk}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2.5 rounded-lg bg-space-800 hover:bg-space-700 text-xs font-mono font-semibold text-slate-300 border border-space-700 flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div></div>}

        {step < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmitAnalysis}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-sm font-mono font-bold shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running Multi-Agent Orchestration...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Run Mission Analysis</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
