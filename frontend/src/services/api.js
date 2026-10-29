import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send and receive HttpOnly cookies
  timeout: 30000,
});

// Request interceptor to attach JWT bearer token if stored in localStorage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration cleanly
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on a protected endpoint, clear local token
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('access_token');
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication Endpoints
  register: async (userData) => {
    const res = await client.post('/api/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await client.post('/api/auth/login', credentials);
    if (res.data?.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
    }
    return res.data;
  },

  logout: async () => {
    try {
      await client.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
    }
    return { success: true };
  },

  getMe: async () => {
    const res = await client.get('/api/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await client.put('/api/auth/profile', profileData);
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await client.put('/api/auth/change-password', passwordData);
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await client.post('/api/auth/forgot-password', { email });
    return res.data;
  },

  // Persistent Analysis History Endpoints
  getAnalyses: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.page_size) query.append('page_size', params.page_size);
    if (params.search) query.append('search', params.search);
    if (params.predicted_class && params.predicted_class !== 'All') query.append('predicted_class', params.predicted_class);
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    if (params.sort_by) query.append('sort_by', params.sort_by);

    const res = await client.get(`/api/analyses?${query.toString()}`);
    return res.data;
  },

  getAnalysisDetail: async (analysisId) => {
    const res = await client.get(`/api/analyses/${analysisId}`);
    return res.data;
  },

  updateAnalysis: async (analysisId, patchData) => {
    const res = await client.patch(`/api/analyses/${analysisId}`, patchData);
    return res.data;
  },

  deleteAnalysis: async (analysisId) => {
    const res = await client.delete(`/api/analyses/${analysisId}`);
    return res.data;
  },

  getUserAnalysisStats: async () => {
    const res = await client.get('/api/analyses/stats/summary');
    return res.data;
  },

  // Health
  getHealth: async () => {
    const res = await client.get('/api/health');
    return res.data;
  },

  // Dataset
  getDatasetOverview: async () => {
    const res = await client.get('/api/dataset');
    return res.data;
  },

  getDatasetStats: async () => {
    const res = await client.get('/api/dataset/stats');
    return res.data;
  },

  getDataQuality: async () => {
    const res = await client.get('/api/dataset/quality');
    return res.data;
  },

  getDatasetVisualizations: async () => {
    const res = await client.get('/api/dataset/visualizations');
    return res.data;
  },

  getSampleCustomers: async (count = 10) => {
    const res = await client.get(`/api/customers/sample?count=${count}`);
    return res.data;
  },

  // Models
  getModelInfo: async (modelName = 'xgboost') => {
    const res = await client.get(`/api/model/info?model_name=${modelName}`);
    return res.data;
  },

  trainModel: async (params) => {
    const res = await client.post('/api/model/train', params);
    return res.data;
  },

  getEvaluation: async (modelName = 'xgboost') => {
    const res = await client.get(`/api/evaluation?model_name=${modelName}`);
    return res.data;
  },

  getModelComparison: async () => {
    const res = await client.get('/api/model-comparison');
    return res.data;
  },

  // Decision & XAI Master Analysis Workflow
  analyze: async (payload) => {
    let body;
    if (payload.applicant || payload.features || payload.customer_id !== undefined) {
      body = {
        applicant: payload.applicant || payload.features,
        customer_id: payload.customer_id,
        model_name: payload.model_name || 'xgboost',
        confidence_level: payload.confidence_level || 0.90,
        analysis_name: payload.analysis_name,
        applicant_reference: payload.applicant_reference
      };
    } else {
      body = {
        applicant: payload,
        model_name: 'xgboost',
        confidence_level: 0.90
      };
    }
    const res = await client.post('/api/analyze', body);
    return res.data;
  },

  predict: async (payload) => {
    const res = await client.post('/api/predict', payload);
    return res.data;
  },

  getShapExplanation: async (payload) => {
    const res = await client.post('/api/explain/shap', payload);
    return res.data;
  },

  getCounterfactual: async (payload) => {
    const res = await client.post('/api/explain/counterfactual', payload);
    return res.data;
  },

  getUncertainty: async (payload, confidenceLevel = 0.90) => {
    const res = await client.post(`/api/uncertainty?confidence_level=${confidenceLevel}`, payload);
    return res.data;
  },

  getFairness: async (sensitiveAttr = 'personal_status', modelName = 'xgboost') => {
    const res = await client.get(`/api/fairness?sensitive_attribute=${sensitiveAttr}&model_name=${modelName}`);
    return res.data;
  },

  // Dashboard
  getDashboardSummary: async () => {
    const res = await client.get('/api/dashboard-summary');
    return res.data;
  },

  getPredictionHistory: async (limit = 20) => {
    const res = await client.get(`/api/predictions/history?limit=${limit}`);
    return res.data;
  }
};

export default api;
