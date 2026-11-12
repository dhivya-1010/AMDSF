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

function mapDomainStatus(agentName, result) {
  const s = result?.status;
  if (!s) return 'FAILED';
  if (s === 'completed') return 'COMPLETED';
  if (s === 'partial' || s === 'prototype_estimate') return 'PARTIAL';
  if (s === 'unavailable' || s === 'insufficient_data') return 'UNAVAILABLE';
  if (s === 'infeasible' && agentName === 'feasibility') return 'COMPLETED';
  return 'FAILED';
}

function normalizeAnalysisPayload(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const orch = raw.orchestrator || raw.orchestration || null;
  const rec = raw.recommendation || orch?.recommendation || null;
  return {
    ...raw,
    orchestrator: orch,
    orchestration: orch,
    recommendation: rec,
  };
}

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
      return saved ? normalizeAnalysisPayload(JSON.parse(saved)) : null;
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
  const [backendHealth, setBackendHealth] = useState(null);

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

  const refreshBackendHealth = async () => {
    try {
      const health = await missionApi.checkHealth();
      setBackendHealth(health);
      setBackendConnected(true);
      return health;
    } catch {
      setBackendConnected(false);
      return null;
    }
  };

  useEffect(() => {
    refreshBackendHealth();
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
    setError(null);
    return fullMission;
  };

  const applyAgentStatuses = (result) => {
    const orch = result?.orchestrator || result?.orchestration;
    setAnalysisStatus({
      debris: mapDomainStatus('debris', result?.debris),
      weather: mapDomainStatus('weather', result?.weather),
      feasibility: mapDomainStatus('feasibility', result?.feasibility),
      coverage: mapDomainStatus('coverage', result?.coverage),
      orchestrator: orch?.status ? 'COMPLETED' : 'FAILED',
    });
  };

  const runFullAnalysis = async (missionPayload, overrideDataMode = null) => {
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
      const baseMission = missionPayload || activeMission;
      if (!baseMission) throw new Error('No mission is configured.');
      const effectiveMission = overrideDataMode
        ? {
            ...baseMission,
            constraints: { ...(baseMission.constraints || {}), data_mode: overrideDataMode },
          }
        : baseMission;
      if (missionPayload || overrideDataMode) {
        setActiveMission((prev) => ({
          ...effectiveMission,
          mission_id: effectiveMission.mission_id || prev?.mission_id || null,
          created_at: effectiveMission.created_at || prev?.created_at || new Date().toISOString(),
        }));
      }

      const rawResult = await missionApi.analyzeMissionDirect(effectiveMission);
      const result = normalizeAnalysisPayload(rawResult);
      if (result?.mission_id) {
        setActiveMission((prev) => ({ ...(prev || effectiveMission), mission_id: result.mission_id }));
      }
      setBackendConnected(true);
      setAnalysisResults(result);
      applyAgentStatuses(result);
      return result;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : err.message || 'Mission analysis failed.';
      if (!err?.response) setBackendConnected(false);
      setError(msg);
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

  const runSingleAgent = async (agentName, dataModeOverride = null, missionPatch = null) => {
    if (!activeMission) {
      setError('Configure or select a mission first.');
      return null;
    }
    setError(null);
    setAnalysisStatus((prev) => ({ ...prev, [agentName]: 'RUNNING' }));

    let targetMission = missionPatch
      ? { ...activeMission, ...missionPatch }
      : activeMission;
    if (missionPatch) {
      setActiveMission(targetMission);
    }

    const methodMap = {
      debris: (mid) => missionApi.analyzeDebris(mid, dataModeOverride),
      weather: (mid) => missionApi.analyzeWeather(mid, dataModeOverride),
      feasibility: (mid) => missionApi.analyzeFeasibility(mid),
      coverage: (mid) => missionApi.analyzeCoverage(mid, dataModeOverride),
      orchestrate: (mid) => missionApi.orchestrateMission(mid, dataModeOverride),
    };
    const executor = methodMap[agentName];
    if (!executor) return null;

    try {
      let missionId = targetMission.mission_id;
      if (!missionId || missionPatch) {
        const created = await missionApi.createMission(targetMission);
        missionId = created.mission_id;
        targetMission = { ...targetMission, mission_id: missionId };
        setActiveMission(targetMission);
      }

      let result;
      try {
        result = await executor(missionId);
      } catch (innerErr) {
        if (innerErr?.response?.status === 404) {
          const recreated = await missionApi.createMission({ ...targetMission, mission_id: missionId });
          missionId = recreated.mission_id;
          result = await executor(missionId);
        } else {
          throw innerErr;
        }
      }

      setBackendConnected(true);
      if (agentName === 'orchestrate') {
        const norm = normalizeAnalysisPayload(result);
        setAnalysisResults(norm);
        applyAgentStatuses(norm);
        return norm;
      } else {
        setAnalysisResults((prev) => ({ ...(prev || {}), [agentName]: result }));
        setAnalysisStatus((prev) => ({
          ...prev,
          [agentName]: mapDomainStatus(agentName, result),
        }));
        return result;
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : err.message || `${agentName} analysis failed.`);
      setAnalysisStatus((prev) => ({ ...prev, [agentName]: 'FAILED' }));
      return null;
    }
  };

  const resetMission = () => {
    setActiveMission(null);
    setAnalysisResults(null);
    setAnalysisStatus(initialStatus());
    setError(null);
  };

  return (
    <MissionContext.Provider
      value={{
        activeMission,
        analysisResults,
        analysisStatus,
        loading,
        error,
        backendConnected,
        backendHealth,
        refreshBackendHealth,
        createAndSetActiveMission,
        runFullAnalysis,
        runSingleAgent,
        resetMission,
        clearError: () => setError(null),
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  return useContext(MissionContext);
}
