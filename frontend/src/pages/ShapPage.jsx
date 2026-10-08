import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid, ReferenceLine
} from 'recharts';
import { Lightbulb, Target, Info, Sparkles, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { usePrediction } from '../context/PredictionContext';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export const ShapPage = () => {
  const { selectedInput, selectedCustomerId, predictionResult } = usePrediction();
  const [shapData, setShapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShap = async () => {
    if (!selectedInput) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getShapExplanation({
        features: selectedInput,
        customer_id: selectedCustomerId,
        model_name: 'xgboost'
      });
      setShapData(res);
    } catch (err) {
      console.error('Failed to load SHAP attribution:', err);
      setError('Unable to calculate SHAP values from the XGBoost TreeExplainer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInput) {
      fetchShap();
    }
  }, [selectedInput]);

  if (!selectedInput) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No Applicant Selected for SHAP Explanation"
        description="Run a prediction or choose a benchmark profile to inspect local and global SHAP feature attribution."
        actionLabel="Run Prediction"
        actionLink="/prediction"
      />
    );
  }

  if (loading) return <LoadingState message="Decomposing model prediction via SHAP TreeExplainer..." />;
  if (error) return <ErrorState message={error} onRetry={fetchShap} />;

  const localContributions = shapData?.local_contributions || [];
  const globalImportance = shapData?.global_importance || [];
  const isGood = predictionResult?.prediction === 1;

  return (
    <div>
      <SectionHeader
        tag="FEATURE ATTRIBUTION"
        title="Why did the model make this prediction?"
        subtitle="SHAP (SHapley Additive exPlanations) uses cooperative game theory to decompose the credit risk score into exact additive feature contributions."
      />

      {/* Selected Applicant Context Banner */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: '#FAFCFD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: isGood ? 'var(--green-soft)' : 'var(--coral-soft)',
              color: isGood ? 'var(--green-forest)' : 'var(--coral-deep)',
              fontWeight: 700,
              fontSize: '13px'
            }}
          >
            {predictionResult?.prediction_label || 'Evaluated Profile'}
          </div>

          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--navy-deep)' }}>
              Applicant {selectedCustomerId ? `#${selectedCustomerId}` : 'Parameters Loaded'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Good Risk Probability: {predictionResult ? `${(predictionResult.good_risk_probability * 100).toFixed(1)}%` : '--'} • Expected Base Value: {shapData?.base_value || 0}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/counterfactual" className="btn btn-secondary btn-sm">
            <span>Explore Counterfactuals</span>
            <ArrowRight size={13} />
          </Link>
          <Link to="/prediction" className="btn btn-secondary btn-sm">
            Change Inputs
          </Link>
        </div>
      </div>

      {/* Local SHAP Waterfall / Bar Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Lightbulb size={17} color="var(--teal-primary)" />
              Local Explanation: Top Feature Contributions
            </h3>
            <p className="card-subtitle">
              Positive values push the score towards Good Credit Risk (green); negative values increase Bad Risk probability (coral).
            </p>
          </div>
          <span className="badge badge-teal">TreeExplainer Exact</span>
        </div>

        <div style={{ height: '360px', width: '100%', marginTop: '10px' }}>
          {localContributions.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={localContributions}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tick={{ fontSize: 11 }}
                  width={150}
                />
                <ReferenceLine x={0} stroke="#18324B" strokeWidth={1.5} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8', fontSize: '12px' }}
                  formatter={(val, name, item) => [
                    `${val} (Feature Value: ${item.payload.feature_value})`,
                    item.payload.contribution
                  ]}
                />
                <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
                  {localContributions.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.shap_value >= 0 ? '#2E7D5B' : '#C9564A'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              No local feature attributions available.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Breakdown Table & Global Importance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* Table of Local Drivers */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Target size={17} color="var(--navy-deep)" />
                Detailed Feature Attribution Table
              </h3>
              <p className="card-subtitle">Exact calculated Shapley values for this decision</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Observed Value</th>
                  <th>SHAP Value</th>
                  <th>Direction</th>
                </tr>
              </thead>
              <tbody>
                {localContributions.map((item, idx) => {
                  const isPositive = item.shap_value >= 0;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>{item.feature}</td>
                      <td>{item.feature_value}</td>
                      <td style={{ fontWeight: 700, color: isPositive ? 'var(--green-forest)' : 'var(--coral-deep)' }}>
                        {item.shap_value > 0 ? `+${item.shap_value}` : item.shap_value}
                      </td>
                      <td>
                        <span className={`badge ${isPositive ? 'badge-green' : 'badge-coral'}`}>
                          {isPositive ? 'Toward Good Risk' : 'Toward Bad Risk'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global SHAP Importance */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={17} color="var(--navy-deep)" />
                Global Feature Importance Benchmark
              </h3>
              <p className="card-subtitle">Overall dataset feature impact across test samples</p>
            </div>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            {globalImportance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={globalImportance.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 110, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8', fontSize: '12px' }}
                    formatter={(val) => [`${val}`, 'Mean |SHAP|']}
                  />
                  <Bar dataKey="mean_abs_shap" fill="#167D7F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Loading global SHAP distribution...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShapPage;
