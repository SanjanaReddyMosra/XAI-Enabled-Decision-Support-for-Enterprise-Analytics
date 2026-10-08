import React, { useEffect, useState } from 'react';
import { GitCompare, CheckCircle2, TrendingUp, Layers, Award } from 'lucide-react';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export const ModelComparisonPage = () => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getModelComparison();
      setComparisonData(data);
    } catch (err) {
      console.error('Failed to load model comparison:', err);
      setError('Unable to load comparison results from the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  if (loading) return <LoadingState message="Comparing XGBoost and LightGBM models..." />;
  if (error) return <ErrorState message={error} onRetry={fetchComparison} />;

  const comparison = comparisonData?.comparison || [];
  const xgb = comparison.find((m) => m.model_name.toLowerCase() === 'xgboost') || comparison[0];
  const lgb = comparison.find((m) => m.model_name.toLowerCase() === 'lightgbm') || comparison[1];

  return (
    <div>
      <SectionHeader
        tag="ALGORITHM BENCHMARKING"
        title="Model Comparison: XGBoost vs LightGBM"
        subtitle="Evaluating gradient-boosted decision tree architectures on the exact same 70/15/15 German Credit splits to select the primary decision engine."
      />

      {/* Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* XGBoost Card (Primary) */}
        <div
          className="card"
          style={{
            border: '2px solid var(--teal-primary)',
            position: 'relative',
            backgroundColor: '#FAFCFD'
          }}
        >
          <div style={{ position: 'absolute', top: '-11px', right: '16px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px' }}>
              <Award size={13} /> Selected Primary Model
            </span>
          </div>

          <div className="card-header">
            <div>
              <h3 className="card-title">XGBoost Classifier</h3>
              <p className="card-subtitle">Exact greedy tree boosting with L1/L2 regularization</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ROC-AUC Score</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--teal-primary)' }}>
                {xgb ? xgb.roc_auc.toFixed(3) : '--'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Accuracy</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {xgb ? `${(xgb.accuracy * 100).toFixed(1)}%` : '--'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>F1-Score</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {xgb ? xgb.f1_score.toFixed(3) : '--'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Precision</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {xgb ? `${(xgb.precision * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
          </div>
        </div>

        {/* LightGBM Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">LightGBM Classifier</h3>
              <p className="card-subtitle">Histogram-based leaf-wise gradient boosting</p>
            </div>
            <span className="badge badge-navy">Alternative Candidate</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ROC-AUC Score</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {lgb ? lgb.roc_auc.toFixed(3) : '--'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Accuracy</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {lgb ? `${(lgb.accuracy * 100).toFixed(1)}%` : '--'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>F1-Score</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {lgb ? lgb.f1_score.toFixed(3) : '--'}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-section)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Precision</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                {lgb ? `${(lgb.precision * 100).toFixed(1)}%` : '--'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Side-by-Side Benchmark Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <GitCompare size={17} color="var(--navy-deep)" />
              Head-to-Head Comparative Metric Matrix
            </h3>
            <p className="card-subtitle">Measured strictly on the identical 150 test instances</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Evaluation Metric</th>
                <th>XGBoost (Primary Engine)</th>
                <th>LightGBM (Alternative)</th>
                <th>Selection Justification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Test Accuracy</td>
                <td style={{ fontWeight: 700, color: 'var(--teal-primary)' }}>
                  {xgb ? `${(xgb.accuracy * 100).toFixed(1)}%` : '--'}
                </td>
                <td>{lgb ? `${(lgb.accuracy * 100).toFixed(1)}%` : '--'}</td>
                <td>Comparable accuracy; XGBoost offers tighter SHAP integration</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>ROC-AUC Discrimination</td>
                <td style={{ fontWeight: 700, color: 'var(--teal-primary)' }}>
                  {xgb ? xgb.roc_auc.toFixed(3) : '--'}
                </td>
                <td>{lgb ? lgb.roc_auc.toFixed(3) : '--'}</td>
                <td>Strong threshold-invariant discrimination across credit bands</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Precision (Good Risk)</td>
                <td>{xgb ? `${(xgb.precision * 100).toFixed(1)}%` : '--'}</td>
                <td>{lgb ? `${(lgb.precision * 100).toFixed(1)}%` : '--'}</td>
                <td>Low false approval probability</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Recall (Good Risk)</td>
                <td>{xgb ? `${(xgb.recall * 100).toFixed(1)}%` : '--'}</td>
                <td>{lgb ? `${(lgb.recall * 100).toFixed(1)}%` : '--'}</td>
                <td>High capture of creditworthy borrowers</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>F1-Score</td>
                <td style={{ fontWeight: 700, color: 'var(--teal-primary)' }}>
                  {xgb ? xgb.f1_score.toFixed(3) : '--'}
                </td>
                <td>{lgb ? lgb.f1_score.toFixed(3) : '--'}</td>
                <td>Balanced harmonic mean</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>XAI Tooling Stability</td>
                <td style={{ color: 'var(--green-forest)', fontWeight: 600 }}>Native TreeExplainer & DiCE</td>
                <td>Compatible</td>
                <td>XGBoost natively interfaces with SHAP TreeExplainer and DiCE-ML</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModelComparisonPage;
