import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, SunMedium, Rocket, Satellite, Cpu,
  Compass, AlertTriangle, CheckCircle2, ChevronRight,
  TrendingUp, Activity, Layers, Play, RefreshCw, BarChart2,
  Globe2, Info, ArrowUpRight
} from 'lucide-react';
import MissionMap from './components/MissionMap';
import MissionCharts from './components/MissionCharts';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  // Input State
  const [formData, setFormData] = useState({
    mission_name: 'Aegis-1 Orbital Survey',
    payload_mass_kg: 1250,
    target_orbit_km: 550,
    mission_duration_days: 365,
    budget_m: 45,
    target_region: 'North Atlantic & Europe',
    preferred_launch_date: '2026-10-15'
  });

  // Flow & State management
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle/Initial, 1: Agent Analyzing, 2: Orchestrator Synthesizing, 3: Completed
  const [analysisResult, setAnalysisResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [errorMsg, setErrorMsg] = useState(null);

  // Agent statuses for live visual feedback during analysis
  const [agentProgress, setAgentProgress] = useState({
    debris: { status: 'Standby', risk: 'Medium' },
    weather: { status: 'Standby', risk: 'Low' },
    feasibility: { status: 'Standby', statusText: 'Feasible' },
    coverage: { status: 'Standby', val: '93%' }
  });

  // Check backend health on mount and trigger initial demo analyze
  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then(res => res.json())
      .then(data => {
        setBackendStatus('Operational');
        // Trigger initial preview analysis
        handleAnalyze(false);
      })
      .catch(err => {
        console.warn("Backend not connected yet, using mock simulation:", err);
        setBackendStatus('Offline (Simulation Mode)');
        handleAnalyze(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'payload_mass_kg' || name === 'target_orbit_km' || name === 'mission_duration_days' || name === 'budget_m'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleAnalyze = async (simulateAnimation = true) => {
    setErrorMsg(null);
    if (simulateAnimation) {
      setAnalyzing(true);
      setCurrentStep(1);
      setAgentProgress({
        debris: { status: 'Analyzing...', risk: 'Calculating' },
        weather: { status: 'Analyzing...', risk: 'Calculating' },
        feasibility: { status: 'Analyzing...', statusText: 'Evaluating' },
        coverage: { status: 'Analyzing...', val: 'Computing' }
      });
    }

    try {
      let data;
      try {
        const response = await fetch(`${API_BASE_URL}/api/analyze-mission`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        data = await response.json();
      } catch (networkErr) {
        // Fallback local logic if user hasn't run the backend yet
        data = generateLocalMockAnalysis(formData);
      }

      if (simulateAnimation) {
        // Step 1: Simulated Agents completing their work
        setTimeout(() => {
          setAgentProgress({
            debris: { status: 'Complete', risk: data.debris.risk },
            weather: { status: 'Complete', risk: data.weather.risk },
            feasibility: { status: 'Complete', statusText: data.feasibility.status },
            coverage: { status: 'Complete', val: `${data.coverage.coverage_percent}%` }
          });
          setCurrentStep(2); // Orchestrator active
        }, 800);

        // Step 2: Orchestrator synthesis complete
        setTimeout(() => {
          setAnalysisResult(data);
          setCurrentStep(3); // Recommendation unlocked
          setAnalyzing(false);
        }, 1600);
      } else {
        setAnalysisResult(data);
        setCurrentStep(3);
        setAgentProgress({
          debris: { status: 'Complete', risk: data.debris.risk },
          weather: { status: 'Complete', risk: data.weather.risk },
          feasibility: { status: 'Complete', statusText: data.feasibility.status },
          coverage: { status: 'Complete', val: `${data.coverage.coverage_percent}%` }
        });
      }
    } catch (err) {
      setErrorMsg("Failed to complete multi-domain analysis. Check backend connectivity.");
      setAnalyzing(false);
    }
  };

  const generateLocalMockAnalysis = (form) => {
    const orbit = form.target_orbit_km || 550;
    const mass = form.payload_mass_kg || 1250;
    const budget = form.budget_m || 45;
    const estCost = Math.round(budget * 0.93 * 10) / 10;
    const isHighOrbit = orbit >= 650 && orbit <= 850;
    const debrisRisk = isHighOrbit ? "High" : "Medium";
    const debrisScore = isHighOrbit ? 45 : 74;

    return {
      mission_summary: {
        name: form.mission_name,
        orbit: `${orbit} km LEO`,
        mass: `${mass} kg`,
        duration: `${form.mission_duration_days} days`,
        budget: `$${budget}M`,
        region: form.target_region,
        preferred_date: form.preferred_launch_date
      },
      debris: {
        agent_id: "orbital_debris",
        risk: debrisRisk,
        nearby_objects: isHighOrbit ? 28 : 12,
        conjunction_risk: debrisRisk,
        score: debrisScore,
        assessment: isHighOrbit 
          ? "Elevated conjunction risk in dense Sun-sync orbital corridor. Collision avoidance thruster reserves must be budgeted."
          : "Acceptable with monitoring. 2 close conjunction events forecasted within 50km over 7 days."
      },
      weather: {
        agent_id: "space_weather",
        risk: "Low",
        kp_index: 3.2,
        solar_activity: "Moderate",
        score: 85,
        assessment: "Favorable conditions. Minor geomagnetic fluctuations; solar flare flux index within nominal operating tolerances."
      },
      feasibility: {
        agent_id: "mission_feasibility",
        status: "Feasible",
        launch_vehicle: "AeroSpace Medium-Lift IV",
        payload_capacity: "Sufficient",
        estimated_cost: estCost,
        score: 90,
        assessment: `Payload mass (${mass}kg) is well within nominal lift capacity for target orbit (${orbit}km). Margin: +18% Delta-V.`
      },
      coverage: {
        agent_id: "coverage",
        coverage_percent: 93,
        population_served: "18.4M",
        coverage_gaps: 2,
        score: 93,
        assessment: `Target orbital inclination provides 93% optical and RF revisit access to ${form.target_region}.`
      },
      orchestrator: {
        status: "Cross-Domain Reasoning Completed",
        synthesis: "Monday provides lower launch cost but has higher conjunction risk with trackable space debris catalog objects. Tuesday provides improved orbital safety (+14km clearance), favorable ionospheric space weather, and preserves 93% target regional coverage.",
        agent_consensus: {
          orbital_debris: `${debrisRisk} Risk`,
          space_weather: "Low Risk",
          mission_feasibility: "Feasible",
          coverage: "93%"
        }
      },
      recommendation: {
        launch_window: "Tuesday — 10:30 UTC",
        readiness: isHighOrbit ? 72 : 82,
        risk: isHighOrbit ? "MEDIUM" : "LOW–MEDIUM",
        key_factors: [
          "Lower conjunction risk in calculated trajectory",
          "Favorable space-weather conditions (Kp Index 3.2)",
          "Mission configuration is feasible",
          "93% target coverage"
        ],
        risk_mitigation: "Continue orbital monitoring before launch."
      },
      chart_data: {
        risk_breakdown: [
          { name: "Debris Conjunction", risk_index: 100 - debrisScore, domain: "SSA" },
          { name: "Space Weather", risk_index: 15, domain: "Heliophysics" },
          { name: "Feasibility Constraint", risk_index: 10, domain: "Propulsion" },
          { name: "Coverage Gap", risk_index: 7, domain: "Constellation" }
        ],
        launch_window_comparison: [
          { window: "Monday", risk: 68, cost: 39, coverage: 89, safety: 32 },
          { window: "Tuesday (Recommended)", risk: 24, cost: 42, coverage: 93, safety: 88 },
          { window: "Wednesday", risk: 45, cost: 46, coverage: 91, safety: 72 }
        ]
      },
      map_data: {
        satellite_position: { lat: 48.8566, lng: 2.3522, alt_km: orbit, label: form.mission_name },
        coverage_radius_km: 1200,
        ground_track: [
          { lat: 28.5728, lng: -80.6490, name: "Launch Point" },
          { lat: 38.8951, lng: -40.0000, name: "Ascent Vector" },
          { lat: 48.8566, lng: 2.3522, name: "Observation Point" },
          { lat: 55.7558, lng: 37.6173, name: "Descending Pass" }
        ],
        debris_markers: [
          { lat: 51.5074, lng: 0.1278, name: "DEB-9801", risk: "Medium", type: "debris" },
          { lat: 45.4642, lng: 9.1900, name: "SL-16-R/B", risk: "Low", type: "debris" },
          { lat: 40.4168, lng: -3.7038, name: "COSMOS-2251", risk: "Medium", type: "debris" },
          { lat: 35.6895, lng: 139.6917, name: "Object #4412", risk: "Low", type: "debris" }
        ],
        ground_stations: [
          { lat: 52.5200, lng: 13.4050, name: "ESOC Station A" },
          { lat: 37.9838, lng: 23.7275, name: "Telemetry Station B" }
        ]
      }
    };
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'low–medium':
      case 'low-medium':
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'high': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* 1. TOP HEADER & METRICS BAR */}
      <header className="border-b border-space-700/80 bg-space-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
                  AMDSF
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300">
                  v1.0 • Prototype
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-tight">
                Agentic Multi-Domain Space Mission Decision Support Framework
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 font-mono text-xs">
            <div className="bg-space-850 px-3 py-1.5 rounded-lg border border-space-700 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">Mission Status</span>
              <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                {analysisResult ? 'Evaluated' : 'Ready'}
              </span>
            </div>
            <div className="bg-space-850 px-3 py-1.5 rounded-lg border border-space-700 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">Overall Risk</span>
              <span className="font-semibold text-amber-400">
                {analysisResult?.recommendation?.risk || 'Low–Medium'}
              </span>
            </div>
            <div className="bg-space-850 px-3 py-1.5 rounded-lg border border-space-700 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">Launch Window</span>
              <span className="font-semibold text-emerald-400">
                {analysisResult?.recommendation?.launch_window?.split('—')[0]?.trim() || 'Tuesday'}
              </span>
            </div>
            <div className="bg-space-850 px-3 py-1.5 rounded-lg border border-space-700 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">Readiness</span>
              <span className="font-semibold text-white">
                {analysisResult?.recommendation?.readiness || 82}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* WORKFLOW PROGRESS BREADCRUMB */}
      <div className="bg-space-900 border-b border-space-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-slate-400 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 0 ? 'bg-cyan-500 text-black' : 'bg-space-700'}`}>1</span>
            <span className={currentStep >= 0 ? 'text-white' : ''}>Mission Request</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-space-600 shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 1 ? 'bg-cyan-500 text-black' : 'bg-space-700'}`}>2</span>
            <span className={currentStep >= 1 ? 'text-white' : ''}>4 AI Domain Agents</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-space-600 shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 2 ? 'bg-cyan-500 text-black' : 'bg-space-700'}`}>3</span>
            <span className={currentStep >= 2 ? 'text-white' : ''}>Cross-Domain Orchestrator</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-space-600 shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 3 ? 'bg-cyan-500 text-black' : 'bg-space-700'}`}>4</span>
            <span className={currentStep >= 3 ? 'text-cyan-400 font-semibold' : ''}>Mission Recommendation</span>
          </div>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

        {/* TOP ROW: MISSION INPUT FORM + 4 AGENT STATUS CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 2. MISSION INPUT FORM */}
          <div className="lg:col-span-4 bg-space-900/80 border border-space-700/80 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-space-700/60 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                    Mission Parameters
                  </h2>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">STEP 1</span>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(true); }} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mission Name</label>
                  <input
                    type="text"
                    name="mission_name"
                    value={formData.mission_name}
                    onChange={handleInputChange}
                    className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                    placeholder="e.g. Aegis-1 Orbital Survey"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Payload Mass (kg)</label>
                    <input
                      type="number"
                      name="payload_mass_kg"
                      value={formData.payload_mass_kg}
                      onChange={handleInputChange}
                      className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Target Orbit (km)</label>
                    <input
                      type="number"
                      name="target_orbit_km"
                      value={formData.target_orbit_km}
                      onChange={handleInputChange}
                      className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Duration (days)</label>
                    <input
                      type="number"
                      name="mission_duration_days"
                      value={formData.mission_duration_days}
                      onChange={handleInputChange}
                      className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Budget ($M)</label>
                    <input
                      type="number"
                      name="budget_m"
                      value={formData.budget_m}
                      onChange={handleInputChange}
                      className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Region</label>
                  <input
                    type="text"
                    name="target_region"
                    value={formData.target_region}
                    onChange={handleInputChange}
                    className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Preferred Launch Date</label>
                  <input
                    type="date"
                    name="preferred_launch_date"
                    value={formData.preferred_launch_date}
                    onChange={handleInputChange}
                    className="w-full bg-space-850 border border-space-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Orchestrating AI Agents...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-slate-950" />
                      <span>Analyze Mission</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-4 pt-3 border-t border-space-700/60 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Backend Status:</span>
              <span className="text-cyan-400">{backendStatus}</span>
            </div>
          </div>

          {/* 3. 4 AGENT STATUS CARDS */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-space-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                  Autonomous Domain Agents
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">4 Active Specialized Models</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              
              {/* Agent 1: Orbital Debris */}
              <div className="bg-space-900/80 border border-space-700/70 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Orbital Debris Agent</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Space Situational Awareness</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-space-700/50 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status</span>
                    <span className="text-cyan-300 font-semibold">{agentProgress.debris.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Debris Risk</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] border font-bold ${getRiskBadgeColor(analysisResult?.debris?.risk || agentProgress.debris.risk)}`}>
                      {analysisResult?.debris?.risk || agentProgress.debris.risk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent 2: Space Weather */}
              <div className="bg-space-900/80 border border-space-700/70 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <SunMedium className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Space Weather Agent</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Heliophysics & Solar Flux</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-space-700/50 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status</span>
                    <span className="text-cyan-300 font-semibold">{agentProgress.weather.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Solar Risk</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] border font-bold ${getRiskBadgeColor(analysisResult?.weather?.risk || agentProgress.weather.risk)}`}>
                      {analysisResult?.weather?.risk || agentProgress.weather.risk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent 3: Mission Feasibility */}
              <div className="bg-space-900/80 border border-space-700/70 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Mission Feasibility Agent</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Vehicle & Delta-V Capacity</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-space-700/50 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status</span>
                    <span className="text-cyan-300 font-semibold">{agentProgress.feasibility.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Feasibility</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      {analysisResult?.feasibility?.status || agentProgress.feasibility.statusText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent 4: Coverage */}
              <div className="bg-space-900/80 border border-space-700/70 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <Satellite className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Coverage Agent</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Ground Revisit Geometry</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-space-700/50 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status</span>
                    <span className="text-cyan-300 font-semibold">{agentProgress.coverage.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Coverage</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                      {analysisResult?.coverage?.coverage_percent ? `${analysisResult.coverage.coverage_percent}%` : agentProgress.coverage.val}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 4. MISSION ANALYSIS DETAILED BREAKDOWN (4 DOMAIN CARDS) */}
        {analysisResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-space-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                  Domain Agent Detailed Evaluations
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Telemetry & Synthesis Output</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Debris Details */}
              <div className="bg-space-900 border border-space-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-rose-400 mb-2 font-semibold">
                    <span>ORBITAL DEBRIS</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${getRiskBadgeColor(analysisResult.debris.risk)}`}>
                      {analysisResult.debris.risk}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nearby Objects:</span>
                      <span className="font-mono font-bold text-white">{analysisResult.debris.nearby_objects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Conjunction Risk:</span>
                      <span className="font-mono font-bold text-amber-300">{analysisResult.debris.conjunction_risk}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-space-800 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-semibold block mb-0.5">Assessment:</span>
                  {analysisResult.debris.assessment}
                </div>
              </div>

              {/* Weather Details */}
              <div className="bg-space-900 border border-space-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2 font-semibold">
                    <span>SPACE WEATHER</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${getRiskBadgeColor(analysisResult.weather.risk)}`}>
                      {analysisResult.weather.risk}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kp Index:</span>
                      <span className="font-mono font-bold text-cyan-300">{analysisResult.weather.kp_index}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Solar Activity:</span>
                      <span className="font-mono font-bold text-emerald-400">{analysisResult.weather.solar_activity?.split(' ')[0] || 'Moderate'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-space-800 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-semibold block mb-0.5">Assessment:</span>
                  {analysisResult.weather.assessment}
                </div>
              </div>

              {/* Feasibility Details */}
              <div className="bg-space-900 border border-space-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-blue-400 mb-2 font-semibold">
                    <span>MISSION FEASIBILITY</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {analysisResult.feasibility.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Launch Vehicle:</span>
                      <span className="font-mono font-bold text-white text-[11px] truncate max-w-[110px]" title={analysisResult.feasibility.launch_vehicle}>
                        {analysisResult.feasibility.launch_vehicle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payload Capacity:</span>
                      <span className="font-mono font-bold text-emerald-400">{analysisResult.feasibility.payload_capacity?.split(' ')[0] || 'Sufficient'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Cost:</span>
                      <span className="font-mono font-bold text-cyan-300">${analysisResult.feasibility.estimated_cost}M</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-space-800 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-semibold block mb-0.5">Assessment:</span>
                  {analysisResult.feasibility.assessment}
                </div>
              </div>

              {/* Coverage Details */}
              <div className="bg-space-900 border border-space-700/80 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-2 font-semibold">
                    <span>COVERAGE</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {analysisResult.coverage.coverage_percent}%
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Coverage:</span>
                      <span className="font-mono font-bold text-cyan-300">{analysisResult.coverage.coverage_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pop. Served:</span>
                      <span className="font-mono font-bold text-white">{analysisResult.coverage.population_served}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coverage Gaps:</span>
                      <span className="font-mono font-bold text-amber-400">{analysisResult.coverage.coverage_gaps} regions</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-space-800 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-semibold block mb-0.5">Assessment:</span>
                  {analysisResult.coverage.assessment}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 5. ORCHESTRATOR / AGENT COLLABORATION & 6. FINAL RECOMMENDATION */}
        {analysisResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 5. ORCHESTRATOR / CROSS-DOMAIN REASONING */}
            <div className="lg:col-span-7 bg-space-900/90 border border-cyan-500/40 rounded-xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-space-700/60 mb-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                      Mission Orchestrator & Cross-Domain Reasoning
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    Synthesis Complete
                  </span>
                </div>

                {/* Visual Pipeline flow of agents feeding to orchestrator */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="bg-space-850 p-2.5 rounded-lg border border-space-700/70 text-center font-mono text-xs">
                    <div className="text-[10px] text-slate-400">Debris Agent</div>
                    <div className="font-bold text-amber-400 mt-0.5">{analysisResult.orchestrator.agent_consensus.orbital_debris}</div>
                  </div>
                  <div className="bg-space-850 p-2.5 rounded-lg border border-space-700/70 text-center font-mono text-xs">
                    <div className="text-[10px] text-slate-400">Weather Agent</div>
                    <div className="font-bold text-emerald-400 mt-0.5">{analysisResult.orchestrator.agent_consensus.space_weather}</div>
                  </div>
                  <div className="bg-space-850 p-2.5 rounded-lg border border-space-700/70 text-center font-mono text-xs">
                    <div className="text-[10px] text-slate-400">Feasibility Agent</div>
                    <div className="font-bold text-cyan-300 mt-0.5">{analysisResult.orchestrator.agent_consensus.mission_feasibility}</div>
                  </div>
                  <div className="bg-space-850 p-2.5 rounded-lg border border-space-700/70 text-center font-mono text-xs">
                    <div className="text-[10px] text-slate-400">Coverage Agent</div>
                    <div className="font-bold text-cyan-300 mt-0.5">{analysisResult.orchestrator.agent_consensus.coverage}</div>
                  </div>
                </div>

                <div className="bg-space-950/70 border border-space-700/90 rounded-lg p-4 font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                    CROSS-DOMAIN TRADE-OFF REASONING
                  </div>
                  <p className="text-slate-300 italic">
                    "{analysisResult.orchestrator.synthesis}"
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-space-700/60 text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Multi-agent arbitration balances collision risk against staging cost and ground footprint.</span>
              </div>
            </div>

            {/* 6. FINAL RECOMMENDATION CARD */}
            <div className="lg:col-span-5 bg-gradient-to-b from-space-850 to-space-900 border border-cyan-500/50 rounded-xl p-5 shadow-2xl relative flex flex-col justify-between">
              <div className="absolute -top-3 left-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-mono text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider">
                Explainable Decision
              </div>

              <div>
                <div className="pb-3 border-b border-space-700/60 mb-4 mt-1">
                  <div className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Recommended Launch Window</div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1 text-cyan-300 flex items-center gap-2">
                    {analysisResult.recommendation.launch_window}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
                  <div className="bg-space-950/80 p-3 rounded-lg border border-space-700">
                    <span className="text-[10px] text-slate-400 uppercase block">Mission Readiness</span>
                    <span className="text-xl font-bold text-emerald-400">{analysisResult.recommendation.readiness}%</span>
                  </div>
                  <div className="bg-space-950/80 p-3 rounded-lg border border-space-700">
                    <span className="text-[10px] text-slate-400 uppercase block">Risk Level</span>
                    <span className="text-xl font-bold text-amber-400">{analysisResult.recommendation.risk}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-xs font-semibold text-slate-300 font-mono uppercase">Key Decision Factors:</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysisResult.recommendation.key_factors.map((factor, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-200">
                  <span className="font-bold text-amber-300">Risk Mitigation: </span>
                  {analysisResult.recommendation.risk_mitigation}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-space-700/60 text-[10px] text-slate-500 font-mono italic">
                * Decision-support prototype only. Does not directly command spacecraft flight hardware.
              </div>
            </div>

          </div>
        )}

        {/* 7. INTERACTIVE MAP SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-space-800">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                Orbital Geometry & Live Tracking Map
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Leaflet Geo-Projection</span>
          </div>

          <MissionMap
            mapData={analysisResult?.map_data}
            missionName={formData.mission_name}
          />
        </div>

        {/* 8. CHARTS SECTION */}
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between pb-1 border-b border-space-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-white font-mono">
                Multi-Domain Analytics & Trade-Off Charts
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Recharts Visual Engine</span>
          </div>

          <MissionCharts chartData={analysisResult?.chart_data} />
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-space-800 bg-space-950 py-4 px-4 text-center text-xs text-slate-500 font-mono">
        AMDSF — Agentic Multi-Domain Space Mission Decision Support Framework • College Presentation Demo
      </footer>

    </div>
  );
}
