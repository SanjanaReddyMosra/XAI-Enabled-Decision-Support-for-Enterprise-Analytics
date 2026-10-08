import React, { useEffect, useState } from 'react';
import { ShieldQuestion, AlertTriangle, CheckCircle2, Info, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { usePrediction } from '../context/PredictionContext';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export const UncertaintyPage = () => {
  const { selectedInput, selectedCustomerId, predictionResult } = usePrediction();
  const [uncertaintyData, setUncertaintyData] = useState(null);
  const [confidenceLevel, setConfidenceLevel] = useState(0.90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUncertainty = async () => {
    if (!selectedInput) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUncertainty(
        {
          features: selectedInput,
          customer_id: selectedCustomerId,
          model_name: 'xgboost'
        },
        confidenceLevel
      );
      setUncertaintyData(res);
    } catch (err) {
      console.error('Failed to calculate MAPIE uncertainty:', err);
      setError('Unable to evaluate conformal prediction sets via MAPIE.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInput) {
      fetchUncertainty();
    }
  }, [selectedInput, confidenceLevel]);

  if (!selectedInput) {
    return (
      <EmptyState
        icon={ShieldQuestion}
        title="No Applicant Selected for Uncertainty Analysis"
        description="Run a prediction first to evaluate MAPIE conformal prediction sets and reliability coverage."
        actionLabel="Run Prediction"
        actionLink="/prediction"
      />
    );
  }

  if (loading) return <LoadingState message="Calibrating conformal prediction sets with MAPIE..." />;
  if (error) return <ErrorState message={error} onRetry={fetchUncertainty} />;

  const isGood = predictionResult?.prediction === 1;
  const setSize = uncertaintyData?.set_size || 0;
  const isSingleton = setSize === 1;
  const isAmbiguous = setSize > 1;

  return (
    <div>
      <SectionHeader
        tag="CONFORMAL PREDICTION & RELIABILITY"
        title="Prediction Uncertainty (MAPIE)"
        subtitle="Evaluating prediction set guarantees via Split Conformal Prediction. Conformal inference produces distribution-free prediction sets with mathematically guaranteed coverage."
      />

      {/* Critical Concept Alert: Probability vs Conformal Uncertainty */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: 'var(--amber-soft)',
          border: '1px solid #F5DFB5',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <Info size={20} color="var(--amber-warm)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: '#7A5408', lineHeight: 1.5 }}>
          <strong>Core Machine Learning Distinction:</strong> A standard probability output (e.g. 79% Bad Risk) is only an internal heuristic and is often miscalibrated. In contrast, <strong>MAPIE Conformal Prediction</strong> calibrates the model on validation data to produce a set of plausible classes with a rigorous coverage guarantee <em>P(Y ∈ C(X)) ≥ 1 - α</em>.
        </div>
      </div>

      {/* KPI Section */}
      <div className="kpi-grid">
        <MetricCard
          label="CONFORMAL PREDICTION SET"
          value={uncertaintyData?.prediction_set ? `[ ${uncertaintyData.prediction_set.join(', ')} ]` : '--'}
          subtext={`Set Size: ${setSize} • ${isSingleton ? 'Singleton (High Certainty)' : 'Ambiguous (Uncertain)'}`}
          icon={ShieldQuestion}
          color={isSingleton ? 'green' : 'amber'}
        />
        <MetricCard
          label="TARGET COVERAGE (1 - α)"
          value={`${(confidenceLevel * 100).toFixed(0)}%`}
          subtext={`Significance level α = ${(1 - confidenceLevel).toFixed(2)}`}
          icon={ShieldCheck}
          color="teal"
        />
        <MetricCard
          label="EMPIRICAL TEST COVERAGE"
          value={uncertaintyData ? `${(uncertaintyData.empirical_test_coverage * 100).toFixed(1)}%` : '--'}
          subtext="Empirically verified across 150 test samples"
          icon={ShieldCheck}
          color="navy"
        />
        <MetricCard
          label="AVERAGE TEST SET SIZE"
          value={uncertaintyData ? `${uncertaintyData.average_test_set_size} classes` : '--'}
          subtext="Efficiency metric of conformal regions"
          icon={ActivityIcon}
          color="amber"
        />
      </div>

      {/* Confidence Level Slider & Active Applicant Diagnosis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Conformal Calibration Controls */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <ShieldQuestion size={17} color="var(--amber-warm)" />
                Conformal Confidence Setting (1 - α)
              </h3>
              <p className="card-subtitle">Adjust coverage tolerance to observe conformal set expansion</p>
            </div>
            <span className="badge badge-amber">{Math.round(confidenceLevel * 100)}% Guarantee</span>
          </div>

          <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Coverage Level</span>
              <strong style={{ color: 'var(--navy-deep)' }}>{Math.round(confidenceLevel * 100)}% Confidence (α = {(1 - confidenceLevel).toFixed(2)})</strong>
            </div>

            <input
              type="range"
              min="0.70"
              max="0.99"
              step="0.05"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--amber-warm)', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>70% (Tighter Sets)</span>
              <span>80%</span>
              <span>90% (Standard)</span>
              <span>95%</span>
              <span>99% (Conservative)</span>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.5 }}>
              {uncertaintyData?.conformal_guarantee_explanation}
            </div>
          </div>
        </div>

        {/* Prediction Set Status Diagnosis */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <AlertTriangle size={17} color={isSingleton ? 'var(--green-forest)' : 'var(--amber-warm)'} />
                Underwriter Reliability Assessment
              </h3>
              <p className="card-subtitle">Conformal boundary diagnosis for decision-makers</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: isSingleton ? 'var(--green-soft)' : 'var(--amber-soft)',
                border: `1px solid ${isSingleton ? '#C4E2D3' : '#F5DFB5'}`
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: isSingleton ? 'var(--green-forest)' : 'var(--amber-warm)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {isSingleton ? 'High Decision Reliability' : 'Underwriter Review Advised'}
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '6px' }}>
                {uncertaintyData?.reliability_assessment}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isSingleton
                  ? 'The conformal set contains exactly one outcome, confirming model confidence with low ambiguity.'
                  : 'The applicant is situated close to the decision boundary; both Good and Bad risk classes cannot be ruled out at this confidence level.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Raw Model Probability:</span>
              <strong style={{ color: 'var(--navy-deep)' }}>
                {predictionResult ? `${(predictionResult.good_risk_probability * 100).toFixed(1)}% Good / ${(predictionResult.bad_risk_probability * 100).toFixed(1)}% Bad` : '--'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Conformal Set Outcome:</span>
              <strong style={{ color: 'var(--teal-primary)' }}>
                {uncertaintyData?.prediction_set?.join(' OR ') || 'None'}
              </strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Simple inline helper icon for MetricCard
const ActivityIcon = ({ size, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default UncertaintyPage;
