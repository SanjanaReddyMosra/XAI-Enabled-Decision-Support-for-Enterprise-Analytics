import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';
import { Scale, Users, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export const FairnessPage = () => {
  const [sensitiveAttribute, setSensitiveAttribute] = useState('personal_status');
  const [fairnessData, setFairnessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFairness = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFairness(sensitiveAttribute, 'xgboost');
      setFairnessData(data);
    } catch (err) {
      console.error('Failed to load fairness audit:', err);
      setError('Unable to evaluate Fairlearn MetricFrame across groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFairness();
  }, [sensitiveAttribute]);

  if (loading) return <LoadingState message="Auditing model fairness with Fairlearn MetricFrame..." />;
  if (error) return <ErrorState message={error} onRetry={fetchFairness} />;

  const groups = fairnessData?.groups || [];
  const disparityDetected = fairnessData?.disparity_detected;

  return (
    <div>
      <SectionHeader
        tag="ALGORITHMIC FAIRNESS & AUDIT"
        title="Fairness Audit (Fairlearn)"
        subtitle="Evaluating statistical parity and error-rate parity across protected demographic groups on held-out test data."
      />

      {/* Sensitive Attribute Selector Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale size={18} color="var(--navy-deep)" />
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--navy-deep)' }}>
            Audit Sensitive Feature:
          </span>
          <select
            className="form-select"
            value={sensitiveAttribute}
            onChange={(e) => setSensitiveAttribute(e.target.value)}
            style={{ fontWeight: 600, color: 'var(--teal-primary)' }}
          >
            <option value="personal_status">Personal Status & Sex</option>
            <option value="age_group">Age Group (&lt;=25 vs &gt;25)</option>
            <option value="foreign_worker">Foreign Worker Status</option>
          </select>
        </div>

        <span className={`badge ${disparityDetected ? 'badge-coral' : 'badge-green'}`}>
          {disparityDetected ? 'Disparity Flagged' : 'Within Tolerance'}
        </span>
      </div>

      {/* KPI Section */}
      <div className="kpi-grid">
        <MetricCard
          label="DEMOGRAPHIC PARITY DIFF"
          value={fairnessData ? `${fairnessData.demographic_parity_difference.toFixed(3)}` : '--'}
          subtext={`Selection rate delta across groups (Threshold: 0.10)`}
          icon={Scale}
          color={fairnessData?.demographic_parity_difference > 0.10 ? 'coral' : 'green'}
        />
        <MetricCard
          label="EQUALIZED ODDS DIFF"
          value={fairnessData ? `${fairnessData.equalized_odds_difference.toFixed(3)}` : '--'}
          subtext={`Max delta of TPR and FPR across groups`}
          icon={ShieldAlert}
          color={fairnessData?.equalized_odds_difference > 0.10 ? 'coral' : 'green'}
        />
        <MetricCard
          label="DEMOGRAPHIC PARITY RATIO"
          value={fairnessData ? `${fairnessData.demographic_parity_ratio.toFixed(3)}` : '--'}
          subtext="Four-fifths rule (0.80 benchmark threshold)"
          icon={Users}
          color={fairnessData?.demographic_parity_ratio < 0.80 ? 'amber' : 'green'}
        />
        <MetricCard
          label="OVERALL TEST ACCURACY"
          value={fairnessData ? `${(fairnessData.overall_accuracy * 100).toFixed(1)}%` : '--'}
          subtext="Benchmark overall classification score"
          icon={CheckCircle2}
          color="navy"
        />
      </div>

      {/* Fairlearn Group Performance Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Users size={17} color="var(--navy-deep)" />
              Group-Wise Performance Breakdown (MetricFrame)
            </h3>
            <p className="card-subtitle">Exact metrics computed on unseen test samples by Fairlearn</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Demographic Group</th>
                <th>Test Samples</th>
                <th>Selection Rate (Approval)</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall (TPR)</th>
                <th>False Positive Rate (FPR)</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((grp) => (
                <tr key={grp.group}>
                  <td style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>{grp.group}</td>
                  <td>{grp.sample_count}</td>
                  <td style={{ fontWeight: 600, color: 'var(--teal-primary)' }}>
                    {(grp.selection_rate * 100).toFixed(1)}%
                  </td>
                  <td>{(grp.accuracy * 100).toFixed(1)}%</td>
                  <td>{(grp.precision * 100).toFixed(1)}%</td>
                  <td>{(grp.recall * 100).toFixed(1)}%</td>
                  <td style={{ color: grp.fpr > 0.3 ? 'var(--coral-deep)' : 'var(--text-primary)' }}>
                    {(grp.fpr * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Visualization Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Scale size={17} color="var(--teal-primary)" />
              Group Comparison Chart (TPR, FPR & Selection Rate)
            </h3>
            <p className="card-subtitle">Visual parity analysis across demographic segments</p>
          </div>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groups} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
              <XAxis dataKey="group" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8', fontSize: '12px' }}
                formatter={(val) => [`${(val * 100).toFixed(1)}%`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="selection_rate" name="Selection Rate" fill="#18324B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tpr" name="True Positive Rate (TPR)" fill="#167D7F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fpr" name="False Positive Rate (FPR)" fill="#C9564A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Narrative Box (Strictly Academic - No unconditional claims) */}
      <div
        className="card"
        style={{
          backgroundColor: disparityDetected ? '#FFF8F7' : '#F6FAF8',
          border: `1.5px solid ${disparityDetected ? '#F3C3BF' : '#C4E2D3'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {disparityDetected ? (
            <AlertTriangle size={22} color="var(--coral-deep)" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <CheckCircle2 size={22} color="var(--green-forest)" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}

          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: disparityDetected ? 'var(--coral-deep)' : 'var(--green-forest)', marginBottom: '4px' }}>
              OFFICIAL AUDIT SUMMARY
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '8px' }}>
              {fairnessData?.audit_narrative}
            </p>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {fairnessData?.methodology_note}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FairnessPage;
