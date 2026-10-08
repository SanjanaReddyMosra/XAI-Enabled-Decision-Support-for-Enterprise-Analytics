import React, { useEffect, useState } from 'react';
import { Database, Search, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import MetricCard from '../components/common/MetricCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export const DatasetPage = () => {
  const [datasetData, setDatasetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const fetchDataset = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDatasetOverview();
      setDatasetData(data);
    } catch (err) {
      console.error('Failed to load dataset overview:', err);
      setError('Unable to load dataset records from the backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, []);

  if (loading) return <LoadingState message="Loading German Credit dataset records..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDataset} />;

  // Filter & Search preview rows
  const previewRows = datasetData?.preview || [];
  const filteredRows = previewRows.filter((row) => {
    const matchesSearch =
      searchTerm === '' ||
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesRisk =
      filterRisk === 'all' ||
      (filterRisk === 'good' && row.class === 1) ||
      (filterRisk === 'bad' && row.class === 0);
    return matchesSearch && matchesRisk;
  });

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <SectionHeader
        tag="DATA INGESTION & EXPLORATION"
        title="German Credit Benchmark Dataset"
        subtitle="UCI Statlog German Credit Data represents 1,000 real credit applicants with 20 multivariate financial, credit history, and personal attributes."
      />

      {/* Dataset Metadata KPI Grid */}
      <div className="kpi-grid">
        <MetricCard
          label="TOTAL RECORDS"
          value={datasetData?.total_rows || 1000}
          subtext="Standard historical borrower profiles"
          icon={Database}
          color="navy"
        />
        <MetricCard
          label="FEATURE COUNT"
          value={datasetData?.numerical_columns?.length + datasetData?.categorical_columns?.length || 20}
          subtext={`${datasetData?.numerical_columns?.length || 7} Numerical • ${datasetData?.categorical_columns?.length || 13} Categorical`}
          icon={Database}
          color="teal"
        />
        <MetricCard
          label="TARGET VARIABLE"
          value="Credit Risk"
          subtext="Binary classification (1 = Good, 0 = Bad)"
          icon={Database}
          color="amber"
        />
        <MetricCard
          label="CLASS BALANCE"
          value={`${datasetData?.target_distribution?.['Good Credit Risk'] || 700} : ${datasetData?.target_distribution?.['Bad Credit Risk'] || 300}`}
          subtext="70.0% Good Risk • 30.0% Bad Risk"
          icon={Database}
          color="green"
        />
      </div>

      {/* Dataset Table Card */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="card-title">
              <Database size={17} color="var(--navy-deep)" />
              Dataset Browser & Record Inspector
            </h3>
            <p className="card-subtitle">Displaying human-readable attributes without raw code obfuscation</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px', width: '200px' }}
                placeholder="Search attributes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Filter */}
            <select
              className="form-select"
              value={filterRisk}
              onChange={(e) => {
                setFilterRisk(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Outcomes</option>
              <option value="good">Good Credit Risk (1)</option>
              <option value="bad">Bad Credit Risk (0)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Outcome</th>
                <th>Duration (mo)</th>
                <th>Credit Amount</th>
                <th>Checking Status</th>
                <th>Credit History</th>
                <th>Purpose</th>
                <th>Savings</th>
                <th>Employment</th>
                <th>Age</th>
                <th>Housing</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => (
                  <tr key={row.customer_id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>#{row.customer_id}</td>
                    <td>
                      <span className={`badge ${row.class === 1 ? 'badge-green' : 'badge-coral'}`}>
                        {row.class === 1 ? 'Good Risk' : 'Bad Risk'}
                      </span>
                    </td>
                    <td>{row.duration}</td>
                    <td>{row.credit_amount} DM</td>
                    <td>{row.checking_status}</td>
                    <td>{row.credit_history}</td>
                    <td>{row.purpose}</td>
                    <td>{row.savings_status}</td>
                    <td>{row.employment}</td>
                    <td>{row.age} yrs</td>
                    <td>{row.housing}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No matching borrower records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div>
            Showing {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} sample preview records
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetPage;
