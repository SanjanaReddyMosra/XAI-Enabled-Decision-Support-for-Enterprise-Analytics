import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Scale,
  Target,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  History
} from 'lucide-react';
import api from '../services/api';
import { usePrediction } from '../context/PredictionContext';
import MetricCard from '../components/common/MetricCard';
import DecisionPipeline from '../components/common/DecisionPipeline';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export const Dashboard = () => {
  const { predictionResult, selectedInput, selectedCustomerId } = usePrediction();
  const [summaryData, setSummaryData] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [shapGlobal, setShapGlobal] = useState([]);
  const [classDist, setClassDist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, evalRes, vizRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getEvaluation('xgboost'),
        api.getDatasetVisualizations()
      ]);
      setSummaryData(sum);
      setEvaluation(evalRes);
      setClassDist(vizRes.class_distribution || []);

      // Fetch global SHAP importance for dashboard chart
      if (sum.default_prediction && sum.default_prediction.raw_features) {
        const shapData = await api.getShapExplanation({
          features: sum.default_prediction.raw_features,
          customer_id: sum.default_prediction.customer_id
        });
        setShapGlobal(shapData.global_importance ? shapData.global_importance.slice(0, 7) : []);
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
      setError('Unable to load enterprise dashboard analytics. Please ensure the FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="Loading enterprise analytics dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  // Display either the user's active prediction or the benchmark test sample
  const activePred = predictionResult || summaryData?.default_prediction;
  const isGoodRisk = activePred?.prediction === 1;

  return (
    <div>
      {/* Hero Section */}
      <div className="page-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div className="hero-tag">
            <Sparkles size={12} />
            Responsible AI & Enterprise Decision Intelligence
          </div>
          <h1 className="page-title">
            Decision Intelligence for Explainable Enterprise Analytics
          </h1>
          <p className="page-subtitle">
            Understand what the model predicts, why it predicts it, what could change the decision, how reliable and fair the prediction is.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/prediction" className="btn btn-primary">
            <Target size={15} />
            <span>Run Prediction</span>
          </Link>
          <Link to="/training" className="btn btn-secondary">
            <span>Explore Model</span>
          </Link>
        </div>
      </div>

      {/* KPI Section - Real calculated values strictly from backend */}
      <div className="kpi-grid">
        <MetricCard
          label="MODEL PERFORMANCE"
          value={evaluation ? `${(evaluation.roc_auc * 100).toFixed(1)}%` : '--'}
          subtext="ROC-AUC Score on Unseen Test Set (15%)"
          icon={TrendingUp}
          color="navy"
        />
        <MetricCard
          label="TEST ACCURACY"
          value={evaluation ? `${(evaluation.accuracy * 100).toFixed(1)}%` : '--'}
          subtext={`F1 Score: ${evaluation ? evaluation.f1_score.toFixed(3) : '--'} • Samples: ${evaluation ? evaluation.test_sample_count : '--'}`}
          icon={BrainCircuit}
          color="teal"
        />
        <MetricCard
          label="MISCLASSIFICATION COST"
          value={evaluation ? `${evaluation.total_cost} DM` : '--'}
          subtext={`Avg Cost: ${evaluation?.cost_per_applicant || '--'} DM/applicant (5:1 penalty)`}
          icon={ShieldCheck}
          color="amber"
        />
        <MetricCard
          label="FAIRNESS AUDIT"
          value={summaryData?.fairness_status || 'Audited'}
          subtext={`Disparity: ${summaryData ? summaryData.demographic_parity_diff.toFixed(3) : '--'} on ${summaryData?.fairness_attribute || 'Gender/Status'}`}
          icon={Scale}
          color={summaryData?.fairness_status?.includes('Disparity') ? 'coral' : 'green'}
        />
      </div>

      {/* Decision Pipeline Visual */}
      <DecisionPipeline />

      {/* Personalized Analyst History Summary (from persistent PostgreSQL records) */}
      {summaryData?.user_stats && summaryData.user_stats.total_analyses > 0 && (
        <div className="card" style={{ marginBottom: '24px', padding: '18px 24px', backgroundColor: '#FAFCFD', borderLeft: '4px solid var(--teal-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <History size={16} color="var(--teal-primary)" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy-deep)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Saved Decision History (PostgreSQL Persisted)
                </h3>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                You have conducted <strong>{summaryData.user_stats.total_analyses}</strong> saved credit evaluations (<strong>{summaryData.user_stats.good_risk_count}</strong> Good Risk / <strong>{summaryData.user_stats.bad_risk_count}</strong> Bad Risk) using active model version <strong>{summaryData.user_stats.model_version}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/history" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={13} />
                <span>View All Saved Records</span>
              </Link>
              <Link to="/prediction" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                + New Analysis
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Model Evaluation Summary Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BrainCircuit size={17} color="var(--navy-deep)" />
                Final Model Performance (Held-out Test Set)
              </h3>
              <p className="card-subtitle">Strict 70/15/15 stratified split evaluation without data leakage</p>
            </div>
            <Link to="/evaluation" className="btn btn-secondary btn-sm">Full Report</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '18px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Accuracy</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {evaluation ? `${(evaluation.accuracy * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Precision</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {evaluation ? `${(evaluation.precision * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recall</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {evaluation ? `${(evaluation.recall * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>F1-Score</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {evaluation ? evaluation.f1_score.toFixed(3) : '--'}
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ROC-AUC</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--teal-primary)' }}>
                {evaluation ? evaluation.roc_auc.toFixed(3) : '--'}
              </div>
            </div>
          </div>

          {/* Polished Confusion Matrix */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '8px' }}>
              Test Set Confusion Matrix (German Credit Evaluation)
            </div>
            <table className="data-table" style={{ fontSize: '12.5px', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Actual \ Predicted</th>
                  <th>Predicted Good</th>
                  <th>Predicted Bad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>Actual Good Risk</td>
                  <td style={{ backgroundColor: 'var(--green-soft)', color: 'var(--green-forest)', fontWeight: 700 }}>
                    TN: {evaluation?.confusion_matrix?.tp || 0}
                  </td>
                  <td style={{ backgroundColor: 'var(--amber-soft)', color: 'var(--amber-warm)', fontWeight: 600 }}>
                    FP: {evaluation?.confusion_matrix?.fn || 0} (Cost: 1)
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>Actual Bad Risk</td>
                  <td style={{ backgroundColor: 'var(--coral-soft)', color: 'var(--coral-deep)', fontWeight: 700 }}>
                    FN: {evaluation?.confusion_matrix?.fp || 0} (Cost: 5)
                  </td>
                  <td style={{ backgroundColor: 'var(--bg-section)', color: 'var(--navy-deep)', fontWeight: 700 }}>
                    TP: {evaluation?.confusion_matrix?.tn || 0}
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
              * Misclassifying Bad borrower as Good carries 5x economic cost penalty over rejecting a Good borrower.
            </div>
          </div>
        </div>

        {/* Global SHAP Feature Importance */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={17} color="var(--teal-primary)" />
                Global Feature Importance (SHAP)
              </h3>
              <p className="card-subtitle">Mean absolute SHAP value impact across borrower attributes</p>
            </div>
            <Link to="/shap" className="btn btn-secondary btn-sm">Deep Dive</Link>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            {shapGlobal.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapGlobal} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8', fontSize: '12px' }}
                    formatter={(val) => [`${val}`, 'Mean |SHAP|']}
                  />
                  <Bar dataKey="mean_abs_shap" fill="#167D7F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Loading global SHAP decomposition...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Lower Row: Active Decision Context & Class Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* Active Prediction Panel */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Target size={17} color="var(--navy-deep)" />
                Active Decision Profile {activePred?.customer_id ? `(#${activePred.customer_id})` : ''}
              </h3>
              <p className="card-subtitle">Current applicant decision under analysis across the XAI suite</p>
            </div>
            <Link to="/prediction" className="btn btn-teal btn-sm">Change Applicant</Link>
          </div>

          {activePred ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: isGoodRisk ? 'var(--green-soft)' : 'var(--coral-soft)',
                  border: `1px solid ${isGoodRisk ? '#C4E2D3' : '#F3C3BF'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: isGoodRisk ? 'var(--green-forest)' : 'var(--coral-deep)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Model Decision Outcome
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: isGoodRisk ? 'var(--green-forest)' : 'var(--coral-deep)' }}>
                    {activePred.prediction_label}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Model Confidence</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                    {isGoodRisk
                      ? `${(activePred.good_risk_probability * 100).toFixed(1)}%`
                      : `${(activePred.bad_risk_probability * 100).toFixed(1)}%`}
                  </div>
                </div>
              </div>

              {/* Quick links to explainability views */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <Link to="/shap" className="btn btn-secondary btn-sm" style={{ padding: '8px 6px', textAlign: 'center' }}>
                  SHAP (Why?) →
                </Link>
                <Link to="/counterfactual" className="btn btn-secondary btn-sm" style={{ padding: '8px 6px', textAlign: 'center' }}>
                  DiCE (What if?) →
                </Link>
                <Link to="/uncertainty" className="btn btn-secondary btn-sm" style={{ padding: '8px 6px', textAlign: 'center' }}>
                  MAPIE (Coverage) →
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              No applicant currently loaded. Run a prediction to inspect.
            </div>
          )}
        </div>

        {/* Dataset Class Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Scale size={17} color="var(--navy-deep)" />
                Dataset Class Balance
              </h3>
              <p className="card-subtitle">German Credit historical benchmark distribution (1000 records)</p>
            </div>
            <Link to="/visualization" className="btn btn-secondary btn-sm">All Charts</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '180px' }}>
            <div style={{ width: '180px', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {classDist.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {classDist.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }}></div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-deep)' }}>
                      {item.name}: {item.value}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {(item.value / 10).toFixed(1)}% of total borrowers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
