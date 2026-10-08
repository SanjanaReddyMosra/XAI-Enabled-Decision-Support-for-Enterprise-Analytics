import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from 'recharts';
import {
  ChartNoAxesCombined,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  FileText
} from 'lucide-react';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export const EvaluationPage = () => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEval = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEvaluation('xgboost');
      setEvaluation(data);
    } catch (err) {
      console.error('Failed to load evaluation report:', err);
      setError('Unable to load test set evaluation metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEval();
  }, []);

  if (loading) return <LoadingState message="Loading test set evaluation & cost matrix..." />;
  if (error) return <ErrorState message={error} onRetry={fetchEval} />;

  const cm = evaluation?.confusion_matrix || { tp: 0, tn: 0, fp: 0, fn: 0 };
  const rocPoints = evaluation?.roc_curve || [];
  const prPoints = evaluation?.pr_curve || [];

  return (
    <div>
      <SectionHeader
        tag="FINAL TEST SET AUDIT"
        title="Final Model Performance & Cost Evaluation"
        subtitle="Performance metrics computed on the strictly held-out 15% test dataset (150 samples). Incorporates asymmetric German Credit misclassification cost analysis."
      />

      {/* KPI Section */}
      <div className="kpi-grid">
        <MetricCard
          label="TEST ACCURACY"
          value={`${(evaluation.accuracy * 100).toFixed(1)}%`}
          subtext="Correctly classified test instances"
          icon={CheckCircle2}
          color="navy"
        />
        <MetricCard
          label="ROC-AUC SCORE"
          value={evaluation.roc_auc.toFixed(3)}
          subtext="Area under ROC curve discrimination"
          icon={TrendingUp}
          color="teal"
        />
        <MetricCard
          label="F1-SCORE"
          value={evaluation.f1_score.toFixed(3)}
          subtext={`Precision: ${(evaluation.precision * 100).toFixed(1)}% • Recall: ${(evaluation.recall * 100).toFixed(1)}%`}
          icon={ChartNoAxesCombined}
          color="navy"
        />
        <MetricCard
          label="TOTAL COST"
          value={`${evaluation.total_cost} DM`}
          subtext={`Avg: ${evaluation.cost_per_applicant} DM/applicant (5:1 penalty)`}
          icon={DollarSign}
          color="coral"
        />
      </div>

      {/* Confusion Matrix & German Credit Cost Matrix Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Confusion Matrix Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <ChartNoAxesCombined size={17} color="var(--navy-deep)" />
                Test Set Confusion Matrix
              </h3>
              <p className="card-subtitle">Labels: 1 = Good Credit Risk, 0 = Bad Credit Risk</p>
            </div>
            <span className="badge badge-teal">N = {evaluation.test_sample_count} Test Samples</span>
          </div>

          <table className="data-table" style={{ textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Ground Truth \ Model</th>
                <th>Predicted Good Risk (1)</th>
                <th>Predicted Bad Risk (0)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>Actual Good Risk (1)</td>
                <td style={{ backgroundColor: 'var(--green-soft)', color: 'var(--green-forest)', fontWeight: 700, padding: '16px' }}>
                  <div style={{ fontSize: '18px' }}>{cm.tp}</div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>True Negative (TN)</div>
                </td>
                <td style={{ backgroundColor: 'var(--amber-soft)', color: 'var(--amber-warm)', fontWeight: 600, padding: '16px' }}>
                  <div style={{ fontSize: '18px' }}>{cm.fn}</div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>False Positive (FP)</div>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>Actual Bad Risk (0)</td>
                <td style={{ backgroundColor: 'var(--coral-soft)', color: 'var(--coral-deep)', fontWeight: 700, padding: '16px' }}>
                  <div style={{ fontSize: '18px' }}>{cm.fp}</div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>False Negative (FN)</div>
                </td>
                <td style={{ backgroundColor: 'var(--bg-section)', color: 'var(--navy-deep)', fontWeight: 700, padding: '16px' }}>
                  <div style={{ fontSize: '18px' }}>{cm.tn}</div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>True Positive (TP)</div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5 }}>
            • <strong>False Negative ({cm.fp} borrowers):</strong> Model predicted Good risk, but borrower defaulted. Maximum loss (Cost: 5 DM per occurrence).<br />
            • <strong>False Positive ({cm.fn} borrowers):</strong> Model predicted Bad risk, rejecting a creditworthy applicant. Opportunity loss (Cost: 1 DM per occurrence).
          </div>
        </div>

        {/* German Credit Cost Evaluation Matrix */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <DollarSign size={17} color="var(--coral-deep)" />
                German Credit Economic Cost Matrix
              </h3>
              <p className="card-subtitle">Asymmetric financial penalty structure</p>
            </div>
            <span className="badge badge-coral">Total Cost: {evaluation.total_cost} DM</span>
          </div>

          <table className="data-table" style={{ textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Outcome Pair</th>
                <th>Penalty Weight</th>
                <th>Test Occurrences</th>
                <th>Subtotal Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'left' }}>Actual Good → Predicted Good</td>
                <td>0 DM</td>
                <td>{cm.tp}</td>
                <td>0 DM</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left' }}>Actual Good → Predicted Bad</td>
                <td>1 DM (Rejection Opportunity Loss)</td>
                <td>{cm.fn}</td>
                <td>{cm.fn * 1} DM</td>
              </tr>
              <tr style={{ backgroundColor: '#FFF5F4' }}>
                <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--coral-deep)' }}>
                  Actual Bad → Predicted Good
                </td>
                <td style={{ fontWeight: 700, color: 'var(--coral-deep)' }}>5 DM (Default Loss)</td>
                <td style={{ fontWeight: 700 }}>{cm.fp}</td>
                <td style={{ fontWeight: 700, color: 'var(--coral-deep)' }}>{cm.fp * 5} DM</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left' }}>Actual Bad → Predicted Bad</td>
                <td>0 DM</td>
                <td>{cm.tn}</td>
                <td>0 DM</td>
              </tr>
              <tr style={{ fontWeight: 700, backgroundColor: 'var(--bg-section)' }}>
                <td style={{ textAlign: 'left' }}>Total Financial Loss</td>
                <td>--</td>
                <td>{evaluation.test_sample_count}</td>
                <td style={{ color: 'var(--coral-deep)', fontSize: '15px' }}>{evaluation.total_cost} DM</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.5 }}>
            In enterprise credit underwriting, approving a defaulting applicant is 5x more damaging to the bank than rejecting an approved applicant. The objective of enterprise XAI decision support is minimizing this asymmetric total cost.
          </div>
        </div>

      </div>

      {/* ROC Curve & Precision-Recall Curve Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* ROC Curve */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={17} color="var(--navy-deep)" />
                Receiver Operating Characteristic (ROC Curve)
              </h3>
              <p className="card-subtitle">True Positive Rate vs False Positive Rate (AUC = {evaluation.roc_auc.toFixed(3)})</p>
            </div>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocPoints} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -15, fontSize: 11 }} tick={{ fontSize: 11 }} />
                <YAxis dataKey="tpr" type="number" domain={[0, 1]} label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8', fontSize: '12px' }} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#C5D0D6" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="tpr" stroke="#167D7F" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precision-Recall Curve */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <ChartNoAxesCombined size={17} color="var(--teal-primary)" />
                Precision-Recall Curve
              </h3>
              <p className="card-subtitle">Tradeoff for unbalanced risk classifications</p>
            </div>
          </div>

          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prPoints} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
                <XAxis dataKey="recall" type="number" domain={[0, 1]} label={{ value: 'Recall', position: 'insideBottom', offset: -15, fontSize: 11 }} tick={{ fontSize: 11 }} />
                <YAxis dataKey="precision" type="number" domain={[0, 1]} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8', fontSize: '12px' }} />
                <Line type="monotone" dataKey="precision" stroke="#18324B" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EvaluationPage;
