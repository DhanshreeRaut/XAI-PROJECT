import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const loadSampleData = async () => {
  const response = await api.get('/sample-data');
  return response.data;
};

export const uploadCSV = async (file, dateCol = null, targetCol = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (dateCol) formData.append('date_col', dateCol);
  if (targetCol) formData.append('target_col', targetCol);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAnalysis = async () => {
  const response = await api.post('/analyze');
  return response.data;
};

export const getForecast = async (horizon = 14) => {
  const formData = new FormData();
  formData.append('horizon', horizon);
  const response = await api.post('/forecast', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getExplainability = async () => {
  const response = await api.post('/explain');
  return response.data;
};

export const getDownloadUrl = () => `${API_BASE_URL}/download-forecast`;

export default api;
