import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Mission Analysis
  analyzeMission: async (missionParams) => {
    const response = await apiClient.post('/mission/analyze', missionParams);
    return response.data;
  },

  // Agent Metadata
  getAgents: async () => {
    const response = await apiClient.get('/agents');
    return response.data;
  },

  // Agent Health/Status endpoints
  getDebrisStatus: async () => {
    const response = await apiClient.get('/debris/status');
    return response.data;
  },

  getWeatherStatus: async () => {
    const response = await apiClient.get('/weather/status');
    return response.data;
  },

  getFeasibilityStatus: async () => {
    const response = await apiClient.get('/feasibility/status');
    return response.data;
  },

  getCoverageStatus: async () => {
    const response = await apiClient.get('/coverage/status');
    return response.data;
  },

  // Root health check
  checkHealth: async () => {
    const response = await axios.get('http://localhost:8000/', { timeout: 4000 });
    return response.data;
  }
};

export default apiService;
