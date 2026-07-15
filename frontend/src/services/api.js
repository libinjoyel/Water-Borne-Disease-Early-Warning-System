import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Locations
export const locationAPI = {
  getAll: () => API.get('/locations'),
  getById: (id) => API.get(`/locations/${id}`),
  create: (data) => API.post('/locations', data),
  update: (id, data) => API.put(`/locations/${id}`, data),
  delete: (id) => API.delete(`/locations/${id}`),
  seed: () => API.post('/locations/seed'),
};

// Weather
export const weatherAPI = {
  getCurrent: (locationId) => API.get(`/weather/${locationId}`),
  getHistory: (locationId, days = 7) => API.get(`/weather/${locationId}/history?days=${days}`),
  fetchNow: (locationId) => API.post(`/weather/fetch/${locationId}`),
  fetchAll: () => API.post('/weather/fetch-all'),
  getAllLatest: () => API.get('/weather/latest'),
};

// Risk
export const riskAPI = {
  getForLocation: (locationId) => API.get(`/risk/${locationId}`),
  calculate: (data) => API.post('/risk/calculate', data),
  getOverview: () => API.get('/risk/overview'),
  getHistory: (locationId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.get(`/risk/${locationId}/history?${q}`);
  },
  getTrend: (locationId, days = 30) => API.get(`/risk/${locationId}/trend?days=${days}`),
};

// Alerts
export const alertAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.get(`/alerts?${q}`);
  },
  getSummary: () => API.get('/alerts/summary'),
  markRead: (id) => API.patch(`/alerts/${id}/read`),
  markResolved: (id, resolvedBy) => API.patch(`/alerts/${id}/resolve`, { resolvedBy }),
  resolveLocation: (locationId) => API.patch(`/alerts/resolve-location/${locationId}`),
};

// Incidents (community reports)
export const incidentAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.get(`/incidents?${q}`);
  },
  getById: (id) => API.get(`/incidents/${id}`),
  create: (formData) =>
    API.post('/incidents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Stats
export const statsAPI = {
  getSummary: () => API.get('/stats/summary'),
};

export default API;
