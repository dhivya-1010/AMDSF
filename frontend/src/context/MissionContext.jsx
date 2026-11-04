import React, { createContext, useContext, useEffect, useState } from 'react';
import missionApi from '../services/api';

const MissionContext = createContext();
const STORAGE_KEY_MISSION = 'AMDSF_ACTIVE_MISSION';
const STORAGE_KEY_ANALYSIS = 'AMDSF_ANALYSIS_RESULTS';
const STORAGE_KEY_STATUS = 'AMDSF_ANALYSIS_STATUS';

const initialStatus = () => ({
  debris: 'NOT_RUN',
  weather: 'NOT_RUN',
  feasibility: 'NOT_RUN',
  coverage: 'NOT_RUN',
  orchestrator: 'NOT_RUN',
});

export function MissionProvider({ children }) {
  const [activeMission, setActiveMission] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MISSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [analysisResults, setAnalysisResults] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANALYSIS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [analysisStatus, setAnalysisStatus] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATUS);
      return saved ? JSON.parse(saved) : initialStatus();
    } catch {
      return initialStatus();
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    if (activeMission) localStorage.setItem(STORAGE_KEY_MISSION, JSON.stringify(activeMission));
    else localStorage.removeItem(STORAGE_KEY_MISSION);
  }, [activeMission]);
  useEffect(() => {
    if (analysisResults) localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(analysisResults));
    else localStorage.removeItem(STORAGE_KEY_ANALYSIS);
  }, [analysisResults]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(analysisStatus));
  }, [analysisStatus]);
  useEffect(() => {
    missionApi.checkHealth()
      .then(() => setBackendConnected(true))
      .catch(() => setBackendConnected(false));
  }, []);

  const createAndSetActiveMission = (missionData) => {
    const fullMission = {
      ...missionData,
      mission_id: missionData.mission_id || null,
      created_at: missionData.created_at || new Date().toISOString(),
    };
    setActiveMission(fullMission);
    setAnalysisResults(null);
    setAnalysisStatus(initialStatus());
    return fullMission;
  };

  const applyAgentStatuses = (result) => {
    setAnalysisStatus({
      debris: result?.debris?.status === 'completed' ? 'COMPLETED' : 'FAILED',
      weather: ['completed', 'unavailable'].includes(result?.weather?.status) ? 'COMPLETED' : 'FAILED',
      feasibility: ['completed', 'infeasible'].includes(result?.feasibility?.status) ? 'COMPLETED' : 'FAILED',
      coverage: ['completed', 'prototype_estimate'].includes(result?.coverage?.status) ? 'COMPLETED' : 'FAILED',
      orchestrator: result?.orchestrator?.status ? 'COMPLETED' : 'FAILED',
    });
  };

  const runFullAnalysis = async (missionPayload) => {
    setLoading(true);
    setError(null);
    setAnalysisStatus({
      debris: 'RUNNING',
      weather: 'RUNNING',
      feasibility: 'RUNNING',
      coverage: 'RUNNING',
      orchestrator: 'RUNNING',
    });
    try {
      const mission = missionPayload ? createAndSetActiveMission(missionPayload) : activeMission;
      if (!mission) throw new Error('No mission is configured.');
      const result = await missionApi.analyzeMissionDirect(mission);
      setBackendConnected(true);
      setAnalysisResults(result);
      applyAgentStatuses(result);
      return result;
    } catch (err) {
      setBackendConnected(false);
      setError(err?.response?.data?.detail || err.message || 'Mission analysis failed.');
      setAnalysisStatus({
        debris: 'FAILED',
        weather: 'FAILED',
        feasibility: 'FAILED',
        coverage: 'FAILED',
        orchestrator: 'FAILED',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const runSingleAgent = async (agentName) => {
    if (!activeMission?.mission_id) {
      setError('Run a complete analysis first so the backend has a stored mission.');
      return;
    }
    setAnalysisStatus((prev) => ({ ...prev, [agentName]: 'RUNNING' }));
    try {
      const result = await missionApi[`analyze${agentName[0].toUpperCase()}${agentName.slice(1)}`](activeMission.mission_id);
      setAnalysisResults((prev) => ({ ...(prev || {}), [agentName]: result }));
      setAnalysisStatus((prev) => ({
        ...prev,
        [agentName]: ['completed', 'prototype_estimate', 'unavailable', 'infeasible'].includes(result?.status)
          ? 'COMPLETED'
          : 'FAILED',
      }));
      setBackendConnected(true);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || `${agentName} analysis failed.`);
      setAnalysisStatus((prev) => ({ ...prev, [agentName]: 'FAILED' }));
    }
  };

  const resetMission = () => {
    setActiveMission(null);
    setAnalysisResults(null);
    setAnalysisStatus(initialStatus());
    setError(null);
  };

  return (
    <MissionContext.Provider value={{
      activeMission,
      analysisResults,
      analysisStatus,
      loading,
      error,
      backendConnected,
      createAndSetActiveMission,
      runFullAnalysis,
      runSingleAgent,
      resetMission,
    }}>
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  return useContext(MissionContext);
}
