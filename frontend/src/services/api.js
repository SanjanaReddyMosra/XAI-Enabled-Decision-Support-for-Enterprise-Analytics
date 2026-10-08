import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
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
        confidence_level: payload.confidence_level || 0.90
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
};

export default api;
