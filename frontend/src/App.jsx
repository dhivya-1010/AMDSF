import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MissionPlanning from './pages/MissionPlanning';
import DebrisIntelligence from './pages/DebrisIntelligence';
import SpaceWeather from './pages/SpaceWeather';
import MissionFeasibility from './pages/MissionFeasibility';
import CoverageAnalysis from './pages/CoverageAnalysis';
import MissionRecommendation from './pages/MissionRecommendation';
import apiService from './services/api';
import { demoAnalysisData } from './data/demoData';

export default function App() {
  const [analysisData, setAnalysisData] = useState(demoAnalysisData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // Check backend health on initial load
  useEffect(() => {
    const testConnection = async () => {
      try {
        await apiService.checkHealth();
        setBackendConnected(true);
      } catch (err) {
        console.warn("Backend API not reachable yet. Operating in client demo simulation mode.");
        setBackendConnected(false);
      }
    };
    testConnection();
  }, []);

  // Main Mission Analysis Action
  const handleRunAnalysis = async (formParams) => {
    setLoading(true);
    setError(null);

    try {
      let result;
      try {
        result = await apiService.analyzeMission(formParams);
        setBackendConnected(true);
      } catch (networkErr) {
        console.warn("FastAPI backend error/unreachable, generating deterministic local simulation:", networkErr);
        setBackendConnected(false);
        // Fallback simulation with custom user parameters
        result = simulateLocalAnalysis(formParams);
      }

      setAnalysisData(result);
      setLoading(false);
      return true;
    } catch (err) {
      setError("Analysis orchestration failed. Please verify input parameters.");
      setLoading(false);
      return false;
    }
  };

  // Local fallback simulation generator
  const simulateLocalAnalysis = (form) => {
    const orbit = form.target_orbit || 550;
    const mass = form.payload_mass || 250;
    const budget = form.budget || 50;
    const isHighOrbit = orbit >= 650 && orbit <= 850;
    const debrisRisk = isHighOrbit ? "HIGH" : "MEDIUM";
    const debrisScore = isHighOrbit ? 0.78 : 0.52;
    const estCost = Math.round(budget * 0.32 * 10) / 10;

    return {
      ...demoAnalysisData,
      mission: {
        ...form,
        payload_mass: mass,
        target_orbit: orbit,
        budget: budget
      },
      debris: {
        ...demoAnalysisData.debris,
        risk_level: debrisRisk,
        risk_score: debrisScore,
        nearby_objects: isHighOrbit ? 28 : 12,
        summary: isHighOrbit
          ? `Elevated orbital debris density detected in the ${orbit}km SSO band. Close conjunction risk is elevated.`
          : `Moderate orbital object proximity in nominal LEO (${orbit}km). Acceptable with active tracking.`
      },
      feasibility: {
        ...demoAnalysisData.feasibility,
        estimated_cost_m: estCost,
        feasible: estCost <= budget
      },
      coverage: {
        ...demoAnalysisData.coverage,
        target_region: form.target_region
      },
      orchestrator: {
        ...demoAnalysisData.orchestrator,
        recommendation: {
          ...demoAnalysisData.orchestrator.recommendation,
          readiness: isHighOrbit ? 72 : 82,
          risk_level: isHighOrbit ? "MEDIUM" : "LOW–MEDIUM"
        }
      }
    };
  };

  return (
    <Router>
      <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
        
        {/* Sticky Professional Navbar */}
        <Navbar backendConnected={backendConnected} />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
          <Routes>
            <Route
              path="/"
              element={<Dashboard analysisData={analysisData} loading={loading} />}
            />
            <Route
              path="/planning"
              element={
                <MissionPlanning
                  onRunAnalysis={handleRunAnalysis}
                  loading={loading}
                  error={error}
                />
              }
            />
            <Route
              path="/debris"
              element={
                <DebrisIntelligence
                  debrisData={analysisData.debris}
                  mapData={analysisData.orchestrator?.map_data}
                />
              }
            />
            <Route
              path="/weather"
              element={<SpaceWeather weatherData={analysisData.weather} />}
            />
            <Route
              path="/feasibility"
              element={
                <MissionFeasibility
                  feasibilityData={analysisData.feasibility}
                  missionData={analysisData.mission}
                />
              }
            />
            <Route
              path="/coverage"
              element={
                <CoverageAnalysis
                  coverageData={analysisData.coverage}
                  mapData={analysisData.orchestrator?.map_data}
                />
              }
            />
            <Route
              path="/recommendation"
              element={
                <MissionRecommendation
                  recommendationData={analysisData.orchestrator?.recommendation}
                  orchestratorData={analysisData.orchestrator}
                  missionData={analysisData.mission}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-space-800/80 bg-space-950 py-4 px-4 text-center text-xs text-slate-500 font-mono">
          AMDSF — Agentic Multi-Domain Space Mission Decision Support Framework • College Presentation Architecture
        </footer>

      </div>
    </Router>
  );
}
