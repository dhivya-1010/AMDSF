import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const modeConfig = (dataMode) => (dataMode ? { params: { data_mode: dataMode } } : undefined);

export const missionApi = {
  // Mission Creation & Management
  createMission: async (missionPayload) => {
    const response = await apiClient.post('/missions', missionPayload);
    return response.data;
  },

  getMission: async (missionId) => {
    const response = await apiClient.get(`/missions/${missionId}`);
    return response.data;
  },

  listMissions: async () => {
    const response = await apiClient.get('/missions');
    return response.data;
  },

  // Complete Multi-Agent Orchestration
  orchestrateMission: async (missionId, dataMode = null) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/orchestrate`, null, modeConfig(dataMode));
    return response.data;
  },

  // Unified Analysis (Creates & runs in one call)
  analyzeMissionDirect: async (missionPayload) => {
    const response = await apiClient.post('/mission/analyze', missionPayload);
    return response.data;
  },

  getMissionAnalysis: async (missionId) => {
    const response = await apiClient.get(`/missions/${missionId}/analysis`);
    return response.data;
  },

  // Individual Domain Agent Triggers (Mission-Centric)
  analyzeDebris: async (missionId, dataMode = null) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/debris`, null, modeConfig(dataMode));
    return response.data;
  },

  analyzeWeather: async (missionId, dataMode = null) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/weather`, null, modeConfig(dataMode));
    return response.data;
  },

  analyzeFeasibility: async (missionId) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/feasibility`);
    return response.data;
  },

  analyzeCoverage: async (missionId, dataMode = null) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/coverage`, null, modeConfig(dataMode));
    return response.data;
  },

  // Agent Registry Metadata
  getAgents: async () => {
    const response = await apiClient.get('/agents');
    return response.data;
  },

  // NGBoost Probabilistic Encounter Risk ML
  getMlModelInfo: async () => {
    const response = await apiClient.get('/ml/model-info');
    return response.data;
  },

  predictEncounterRisk: async (encounterFeatures) => {
    const response = await apiClient.post('/ml/predict-risk', encounterFeatures);
    return response.data;
  },

  // Server health check
  checkHealth: async () => {
    const response = await axios.get(`${ROOT_URL}/api/health`, { timeout: 6000 });
    return response.data;
  },
};

export default missionApi;
