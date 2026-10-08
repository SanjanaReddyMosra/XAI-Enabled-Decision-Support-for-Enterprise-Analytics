import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, Filter, PieChart as PieIcon, Activity, Users } from 'lucide-react';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export const VisualizationPage = () => {
  const [vizData, setVizData] = useState(null);
  const [selectedNumFeature, setSelectedNumFeature] = useState('credit_amount');
  const [selectedCatFeature, setSelectedCatFeature] = useState('credit_history');
  const [selectedDemographic, setSelectedDemographic] = useState('personal_status');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchViz = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDatasetVisualizations();
      setVizData(data);
    } catch (err) {
      console.error('Failed to load visualizations:', err);
      setError('Unable to load dataset visualizations from the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViz();
  }, []);

  if (loading) return <LoadingState message="Rendering dataset visualizations..." />;
  if (error) return <ErrorState message={error} onRetry={fetchViz} />;

  const classDist = vizData?.class_distribution || [];
  const numDist = vizData?.numerical_distributions?.[selectedNumFeature] || [];
  const catDist = vizData?.categorical_distributions?.[selectedCatFeature] || [];
  const demoDist = vizData?.group_distributions?.[selectedDemographic] || [];
  const corrMatrix = vizData?.correlation_matrix || [];
  const corrFeatures = vizData?.correlation_features || [];

  return (
    <div>
      <SectionHeader
        tag="EXPLORATORY DATA ANALYSIS"
        title="Dataset Visualization & Analytics"
        subtitle="Explore distribution dynamics, loan amount concentrations, categorical profiles, and demographic variables prior to model training."
      />

      {/* Top Row: Class Distribution & Numerical Histograms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Class Balance */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PieIcon size={17} color="var(--navy-deep)" />
                Target Outcome Distribution (Credit Risk)
              </h3>
              <p className="card-subtitle">Binary ground truth labels (Good: 700, Bad: 300)</p>
            </div>
            <span className="badge badge-teal">70% / 30% Baseline</span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDist} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {classDist.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Numerical Histograms with Dropdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BarChart3 size={17} color="var(--teal-primary)" />
                Numerical Distribution
              </h3>
              <p className="card-subtitle">Binned frequencies of continuous variables</p>
            </div>
            <select
              className="form-select"
              value={selectedNumFeature}
              onChange={(e) => setSelectedNumFeature(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '12.5px' }}
            >
              <option value="credit_amount">Credit Amount (DM)</option>
              <option value="age">Age (Years)</option>
              <option value="duration">Loan Duration (Months)</option>
            </select>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={numDist} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
                <XAxis dataKey="range" angle={-15} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8' }} />
                <Bar dataKey="count" fill="#244B68" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Middle Row: Categorical Breakdown & Demographic Groups */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Categorical Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Activity size={17} color="var(--navy-deep)" />
                Categorical Feature Analysis
              </h3>
              <p className="card-subtitle">Category frequency across borrower credit attributes</p>
            </div>
            <select
              className="form-select"
              value={selectedCatFeature}
              onChange={(e) => setSelectedCatFeature(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '12.5px' }}
            >
              <option value="credit_history">Credit History</option>
              <option value="purpose">Loan Purpose</option>
              <option value="employment">Present Employment</option>
              <option value="housing">Housing Status</option>
              <option value="checking_status">Checking Account Status</option>
            </select>
          </div>

          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catDist} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8' }} />
                <Bar dataKey="count" fill="#167D7F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographic & Fairness Group Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Users size={17} color="var(--navy-deep)" />
                Demographic Group Distribution
              </h3>
              <p className="card-subtitle">Attributes audited for algorithmic fairness & parity</p>
            </div>
            <select
              className="form-select"
              value={selectedDemographic}
              onChange={(e) => setSelectedDemographic(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '12.5px' }}
            >
              <option value="personal_status">Personal Status & Sex</option>
              <option value="foreign_worker">Foreign Worker Status</option>
              <option value="age_groups">Age Groups (Younger vs Mature)</option>
            </select>
          </div>

          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoDist} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9EEF1" />
                <XAxis dataKey="group" angle={-15} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCE3E8' }} />
                <Bar dataKey="count" fill="#D99A2B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Correlation Matrix Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Activity size={17} color="var(--navy-deep)" />
              Numerical Feature Correlation Matrix
            </h3>
            <p className="card-subtitle">Pearson correlation coefficients between continuous variables</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table" style={{ textAlign: 'center', fontSize: '12.5px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Feature</th>
                {corrFeatures.map((f) => (
                  <th key={f}>{f.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corrMatrix.map((row) => (
                <tr key={row.feature}>
                  <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--navy-deep)' }}>
                    {row.feature.replace(/_/g, ' ')}
                  </td>
                  {corrFeatures.map((f) => {
                    const val = row[f];
                    const isDiagonal = row.feature === f;
                    const isPositive = val > 0.2 && !isDiagonal;
                    return (
                      <td
                        key={f}
                        style={{
                          backgroundColor: isDiagonal
                            ? 'var(--bg-section)'
                            : isPositive
                            ? 'var(--bg-active)'
                            : 'transparent',
                          color: isDiagonal
                            ? 'var(--text-muted)'
                            : isPositive
                            ? 'var(--teal-primary)'
                            : 'var(--text-primary)',
                          fontWeight: isPositive || isDiagonal ? 600 : 400
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;
