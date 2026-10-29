import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const PredictionContext = createContext();

export const PredictionProvider = ({ children }) => {
  const [selectedInput, setSelectedInput] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [masterAnalysisResult, setMasterAnalysisResult] = useState(null);
  const [shapResult, setShapResult] = useState(null);
  const [counterfactualResult, setCounterfactualResult] = useState(null);
  const [uncertaintyResult, setUncertaintyResult] = useState(null);
  const [sampleCustomers, setSampleCustomers] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ datasetLoaded: false, modelReady: false, apiConnected: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial load: Fetch health check and sample customers from backend
  useEffect(() => {
    const initialize = async () => {
      try {
        const health = await api.getHealth();
        setSystemHealth({
          datasetLoaded: health.dataset_present,
          modelReady: (health.models_available || []).length > 0,
          apiConnected: health.status === 'healthy'
        });

        const samples = await api.getSampleCustomers(10);
        setSampleCustomers(samples);

        // Preload first sample customer with complete one-click analysis
        if (samples.length > 0) {
          const firstSample = samples[1] || samples[0];
          setSelectedCustomerId(firstSample.customer_id);
          setSelectedInput(firstSample.features);
          
          try {
            const masterRes = await api.analyze({
              applicant: firstSample.features,
              customer_id: firstSample.customer_id,
              model_name: 'xgboost',
              save_to_history: false
            });
            setMasterAnalysisResult(masterRes);
            setPredictionResult({
              prediction: masterRes.prediction.prediction_class,
              prediction_label: masterRes.prediction.label,
              good_risk_probability: masterRes.prediction.probability_good,
              bad_risk_probability: masterRes.prediction.probability_bad,
              model_used: masterRes.prediction.model_used
            });
            setShapResult(masterRes.explanation);
            setCounterfactualResult(masterRes.counterfactuals);
            setUncertaintyResult(masterRes.uncertainty);
          } catch (initAnalysisErr) {
            console.warn('Initial master analysis fallback to predict:', initAnalysisErr);
            const pred = await api.predict({
              features: firstSample.features,
              customer_id: firstSample.customer_id,
              model_name: 'xgboost'
            });
            setPredictionResult(pred);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setSystemHealth({ datasetLoaded: false, modelReady: false, apiConnected: false });
      }
    };
    initialize();
  }, []);

  const runMasterAnalysis = async (features, customerId = null, modelName = 'xgboost', confidenceLevel = 0.90, analysisName = null, applicantReference = null) => {
    setLoading(true);
    setError(null);
    try {
      setSelectedInput(features);
      setSelectedCustomerId(customerId);
      const res = await api.analyze({
        applicant: features,
        customer_id: customerId,
        model_name: modelName,
        confidence_level: confidenceLevel,
        analysis_name: analysisName,
        applicant_reference: applicantReference,
        save_to_history: true
      });
      setMasterAnalysisResult(res);
      const predNorm = {
        prediction: res.prediction.prediction_class,
        prediction_label: res.prediction.label,
        good_risk_probability: res.prediction.probability_good,
        bad_risk_probability: res.prediction.probability_bad,
        model_used: res.prediction.model_used
      };
      setPredictionResult(predNorm);
      setShapResult(res.explanation);
      setCounterfactualResult(res.counterfactuals);
      setUncertaintyResult(res.uncertainty);
      return res;
    } catch (err) {
      console.error('Master analysis failed:', err);
      const msg = err.response?.data?.detail?.message || err.response?.data?.detail || 'Failed to execute master decision analysis.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async (features, customerId = null, modelName = 'xgboost') => {
    setLoading(true);
    setError(null);
    try {
      setSelectedInput(features);
      setSelectedCustomerId(customerId);
      const res = await api.predict({
        features,
        customer_id: customerId,
        model_name: modelName
      });
      setPredictionResult(res);
      return res;
    } catch (err) {
      console.error('Prediction failed:', err);
      setError(err.response?.data?.detail || 'Failed to generate model prediction.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadSampleCustomer = async (sample) => {
    setSelectedCustomerId(sample.customer_id);
    setSelectedInput(sample.features);
    await runMasterAnalysis(sample.features, sample.customer_id);
  };

  return (
    <PredictionContext.Provider
      value={{
        selectedInput,
        setSelectedInput,
        selectedCustomerId,
        setSelectedCustomerId,
        predictionResult,
        setPredictionResult,
        masterAnalysisResult,
        setMasterAnalysisResult,
        runMasterAnalysis,
        shapResult,
        setShapResult,
        counterfactualResult,
        setCounterfactualResult,
        uncertaintyResult,
        setUncertaintyResult,
        sampleCustomers,
        loadSampleCustomer,
        runPrediction,
        systemHealth,
        loading,
        error
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => useContext(PredictionContext);
export default PredictionContext;
