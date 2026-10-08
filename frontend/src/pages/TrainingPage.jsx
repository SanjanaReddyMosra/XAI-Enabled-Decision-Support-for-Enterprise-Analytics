import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  CheckCircle2,
  RefreshCw,
  GitBranch,
  ArrowDown,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export const TrainingPage = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainingInProgress, setTrainingInProgress] = useState(false);
  const [trainMessage, setTrainMessage] = useState(null);
  const [error, setError] = useState(null);

  // Training form state
  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(5);
  const [learningRate, setLearningRate] = useState(0.1);
  const [subsample, setSubsample] = useState(0.8);
  const [tuneHyperparams, setTuneHyperparams] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [info, evalRes] = await Promise.all([
        api.getModelInfo('xgboost'),
        api.getEvaluation('xgboost')
      ]);
      setModelInfo(info);
      setEvaluation(evalRes);
    } catch (err) {
      console.error('Failed to load model details:', err);
      setError('Unable to load model training metadata from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetrain = async (e) => {
    e.preventDefault();
    setTrainingInProgress(true);
    setTrainMessage(null);
    try {
      const res = await api.trainModel({
        n_estimators: Number(nEstimators),
        max_depth: Number(maxDepth),
        learning_rate: Number(learningRate),
        subsample: Number(subsample),
        tune_hyperparameters: tuneHyperparams
      });
      setTrainMessage(`Model re-trained successfully! Validation Accuracy: ${(res.validation_accuracy * 100).toFixed(1)}%, Test Accuracy: ${(res.test_metrics.accuracy * 100).toFixed(1)}%`);
      // Refresh info and evaluation
      await fetchData();
    } catch (err) {
      console.error('Training failed:', err);
      setError('Failed to complete model training on backend.');
    } finally {
      setTrainingInProgress(false);
    }
  };

  if (loading) return <LoadingState message="Loading training pipeline and splits..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div>
      <SectionHeader
        tag="MACHINE LEARNING PIPELINE"
        title="Training, Validation & Testing Workflow"
        subtitle="Strict stratified 70% Train, 15% Validation, 15% Test partitioning. Ensures absolute prevention of data leakage; held-out test data remains completely untouched until final evaluation."
      />

      {/* Dataset Split Summary KPI Grid */}
      <div className="kpi-grid">
        <MetricCard
          label="TRAINING SET (70%)"
          value={`${modelInfo?.training_samples || 700} samples`}
          subtext="Used solely for fitting preprocessor & model"
          icon={BrainCircuit}
          color="navy"
        />
        <MetricCard
          label="VALIDATION SET (15%)"
          value={`${modelInfo?.validation_samples || 150} samples`}
          subtext="Hyperparameter tuning & MAPIE calibration"
          icon={BrainCircuit}
          color="teal"
        />
        <MetricCard
          label="TEST SET (15%)"
          value={`${modelInfo?.test_samples || 150} samples`}
          subtext="Held-out for final evaluation & fairness audit"
          icon={BrainCircuit}
          color="amber"
        />
        <MetricCard
          label="FEATURE EXPANSION"
          value={`${modelInfo?.original_features || 20} → ${modelInfo?.transformed_features || 61}`}
          subtext="One-Hot Encoding & StandardScaler"
          icon={Layers}
          color="green"
        />
      </div>

      {/* Visual ML Pipeline Flowchart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <GitBranch size={17} color="var(--navy-deep)" />
              End-to-End Pipeline Architecture (70/15/15)
            </h3>
            <p className="card-subtitle">Information flow strictly isolating training, tuning, and evaluation</p>
          </div>
          <span className="badge badge-teal">Random State: 42</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
          {/* Step 1: Raw Data */}
          <div style={{ padding: '10px 24px', backgroundColor: 'var(--bg-section)', border: '1px solid var(--border-default)', borderRadius: '8px', fontWeight: 600, color: 'var(--navy-deep)', textAlign: 'center', width: '280px' }}>
            UCI German Credit Data (1,000 Records)
          </div>

          <ArrowDown size={18} color="var(--text-muted)" />

          {/* Step 2: Preprocessing */}
          <div style={{ padding: '10px 24px', backgroundColor: 'var(--bg-active)', border: '1px solid var(--teal-muted)', borderRadius: '8px', fontWeight: 600, color: 'var(--teal-primary)', textAlign: 'center', width: '320px' }}>
            CreditPreprocessor: Fitted ONLY on Train Data
          </div>

          <ArrowDown size={18} color="var(--text-muted)" />

          {/* Step 3: 3-way Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', width: '100%', maxWidth: '780px' }}>
            <div style={{ padding: '14px', backgroundColor: '#FAFCFD', border: '1px solid var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--teal-primary)' }}>TRAINING SET (70%)</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)', margin: '4px 0' }}>700 Records</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>XGBoost Classifier Fitting</div>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#FAFCFD', border: '1px solid var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--amber-warm)' }}>VALIDATION SET (15%)</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)', margin: '4px 0' }}>150 Records</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tuning & Conformal Calibration</div>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#FAFCFD', border: '1px solid var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green-forest)' }}>HELD-OUT TEST (15%)</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)', margin: '4px 0' }}>150 Records</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Strict Final Evaluation & Fairness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration & Retraining Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        
        {/* Model Hyperparameters Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Sliders size={17} color="var(--navy-deep)" />
                XGBoost Model Tuning Controls
              </h3>
              <p className="card-subtitle">Trigger live backend re-training with custom hyperparameters</p>
            </div>
          </div>

          {trainMessage && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: 'var(--green-soft)', border: '1px solid #C4E2D3', color: 'var(--green-forest)', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{trainMessage}</span>
            </div>
          )}

          <form onSubmit={handleRetrain} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">n_estimators (Trees)</label>
                <input
                  type="number"
                  className="form-input"
                  value={nEstimators}
                  onChange={(e) => setNEstimators(e.target.value)}
                  min="20"
                  max="300"
                />
              </div>

              <div className="form-group">
                <label className="form-label">max_depth</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(e.target.value)}
                  min="2"
                  max="10"
                />
              </div>

              <div className="form-group">
                <label className="form-label">learning_rate</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={learningRate}
                  onChange={(e) => setLearningRate(e.target.value)}
                  min="0.01"
                  max="0.5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">subsample</label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={subsample}
                  onChange={(e) => setSubsample(e.target.value)}
                  min="0.5"
                  max="1.0"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <input
                type="checkbox"
                id="tuneCheck"
                checked={tuneHyperparams}
                onChange={(e) => setTuneHyperparams(e.target.checked)}
              />
              <label htmlFor="tuneCheck" style={{ cursor: 'pointer', color: 'var(--navy-deep)' }}>
                Enable Validation Set Grid Search Tuning (selects best parameters automatically)
              </label>
            </div>

            <button
              type="submit"
              disabled={trainingInProgress}
              className="btn btn-primary"
              style={{ marginTop: '8px' }}
            >
              {trainingInProgress ? (
                <>
                  <RefreshCw size={15} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Training XGBoost Model on Backend...</span>
                </>
              ) : (
                <>
                  <BrainCircuit size={15} />
                  <span>Execute Model Training</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Active Model Evaluation Report */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CheckCircle2 size={17} color="var(--green-forest)" />
                Current Model Specifications
              </h3>
              <p className="card-subtitle">Active classifier serving predictions, SHAP, and DiCE</p>
            </div>
            <span className="badge badge-green">Production Ready</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Algorithm</span>
              <strong style={{ color: 'var(--navy-deep)' }}>XGBoost Classifier (XGBClassifier)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Objective Function</span>
              <strong style={{ color: 'var(--navy-deep)' }}>binary:logistic (logloss)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Test Set Accuracy</span>
              <strong style={{ color: 'var(--navy-deep)' }}>
                {evaluation ? `${(evaluation.accuracy * 100).toFixed(1)}%` : '--'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Test Set ROC-AUC</span>
              <strong style={{ color: 'var(--teal-primary)' }}>
                {evaluation ? evaluation.roc_auc.toFixed(3) : '--'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Test Set Total Cost</span>
              <strong style={{ color: 'var(--coral-deep)' }}>
                {evaluation ? `${evaluation.total_cost} DM` : '--'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Variable Encoding</span>
              <strong style={{ color: 'var(--navy-deep)' }}>1 = Good Credit Risk, 0 = Bad Credit Risk</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrainingPage;
