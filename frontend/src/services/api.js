import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  orchestrateMission: async (missionId) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/orchestrate`);
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
  analyzeDebris: async (missionId) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/debris`);
    return response.data;
  },

  analyzeWeather: async (missionId) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/weather`);
    return response.data;
  },

  analyzeFeasibility: async (missionId) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/feasibility`);
    return response.data;
  },

  analyzeCoverage: async (missionId) => {
    const response = await apiClient.post(`/missions/${missionId}/analyze/coverage`);
    return response.data;
  },

  // Agent Registry Metadata
  getAgents: async () => {
    const response = await apiClient.get('/agents');
    return response.data;
  },

  // Server health check
  checkHealth: async () => {
    const response = await axios.get('http://localhost:8000/', { timeout: 4000 });
    return response.data;
  }
};

export default missionApi;
