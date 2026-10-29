import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SectionHeader from '../components/common/SectionHeader';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
  GitBranch,
  ShieldAlert,
  Sparkles,
  X,
  Target,
  Clock,
  RotateCcw,
  Pencil
} from 'lucide-react';

export const AnalysisHistoryPage = () => {
  const [analyses, setAnalyses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [predictedClass, setPredictedClass] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal Detail State
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Rename Analysis Modal State
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSubmitting, setRenameSubmitting] = useState(false);
  const [renameError, setRenameError] = useState('');

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getAnalyses({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        predicted_class: predictedClass !== 'All' ? predictedClass : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sort_by: sortBy
      });
      setAnalyses(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Fetch analyses error:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to load historical analyses.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, predictedClass, startDate, endDate, sortBy]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAnalyses();
  };

  const handleResetFilters = () => {
    setSearch('');
    setPredictedClass('All');
    setSortBy('newest');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleViewDetails = async (analysisId) => {
    setDetailLoading(true);
    try {
      const detail = await api.getAnalysisDetail(analysisId);
      setSelectedAnalysis(detail);
    } catch (err) {
      alert('Failed to retrieve original analysis record.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (analysisId) => {
    try {
      await api.deleteAnalysis(analysisId);
      setDeleteConfirmId(null);
      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(null);
      }
      fetchAnalyses();
    } catch (err) {
      alert('Failed to delete analysis record.');
    }
  };

  const handleOpenRename = (item) => {
    setRenameTarget(item);
    setRenameValue(item.analysis_name || '');
    setRenameError('');
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!renameTarget) return;
    setRenameSubmitting(true);
    setRenameError('');
    try {
      const updated = await api.updateAnalysis(renameTarget.id, {
        analysis_name: renameValue.trim() || `Analysis #${renameTarget.id}`
      });
      setAnalyses((prev) =>
        prev.map((a) => (a.id === renameTarget.id ? { ...a, analysis_name: updated.analysis_name } : a))
      );
      if (selectedAnalysis && selectedAnalysis.id === renameTarget.id) {
        setSelectedAnalysis((prev) => ({ ...prev, analysis_name: updated.analysis_name }));
      }
      setRenameTarget(null);
    } catch (err) {
      console.error('Rename analysis error:', err);
      setRenameError(err.response?.data?.detail || 'Failed to rename analysis record.');
    } finally {
      setRenameSubmitting(false);
    }
  };

  return (
    <div>
      <SectionHeader
        tag="PERSISTENT DECISION VAULT"
        title="Credit Risk Analysis History"
        subtitle="Retrieve, review, and audit previously executed credit decisions stored persistently in PostgreSQL. Historical explanations reflect original run parameters."
      />

      {/* Filter and Search Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by analysis name, applicant ref, or ID..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Prediction Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={predictedClass}
                onChange={(e) => { setPredictedClass(e.target.value); setPage(1); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Outcomes</option>
                <option value="Good Credit Risk">Good Credit Risk</option>
                <option value="Bad Credit Risk">Bad Credit Risk</option>
              </select>
            </div>

            {/* Sort Order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={14} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>
            </div>

            {/* Date Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="var(--text-muted)" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                title="Filter from date"
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                title="Filter to date"
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: '#FEECEC',
          border: '1px solid #F8C6C6',
          color: 'var(--coral-warm)',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FAFCFD'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} color="var(--teal-primary)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-deep)' }}>
              Saved Records ({total} {total === 1 ? 'Analysis' : 'Analyses'})
            </span>
          </div>

          <Link to="/prediction" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            + Run New Decision
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{
              width: '28px',
              height: '28px',
              border: '3px solid var(--border-default)',
              borderTop: '3px solid var(--teal-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px auto'
            }} />
            <span style={{ fontSize: '13px' }}>Querying persistent analysis records...</span>
          </div>
        ) : analyses.length === 0 ? (
          <div style={{ padding: '56px 20px', textAlign: 'center' }}>
            <History size={36} color="var(--border-default)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)', margin: '0 0 6px 0' }}>
              No Historical Analyses Found
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 18px auto' }}>
              {search || predictedClass !== 'All' || startDate || endDate
                ? 'No saved analyses match your active filter criteria. Try clearing filters.'
                : 'You have not generated any saved decisions yet. Run an analysis on the Prediction page to create your first persistent record.'}
            </p>
            {search || predictedClass !== 'All' || startDate || endDate ? (
              <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                Clear Filters
              </button>
            ) : (
              <Link to="/prediction" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Run Credit Risk Analysis
              </Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 16px' }}>ID</th>
                  <th style={{ padding: '12px 16px' }}>Analysis Name / Ref</th>
                  <th style={{ padding: '12px 16px' }}>Prediction</th>
                  <th style={{ padding: '12px 16px' }}>Good / Bad Probability</th>
                  <th style={{ padding: '12px 16px' }}>Model Version</th>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((item) => {
                  const isGood = item.predicted_class?.toLowerCase().includes('good');
                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-default)', transition: 'background-color 0.15s ease' }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                        #{item.id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>
                          {item.analysis_name || `Analysis #${item.id}`}
                        </div>
                        {item.applicant_reference && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Ref: {item.applicant_reference}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${isGood ? 'badge-green' : 'badge-coral'}`}>
                          {item.predicted_class}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--green-forest)', fontWeight: 600 }}>
                            {(item.good_risk_probability * 100).toFixed(1)}%
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>/</span>
                          <span style={{ color: 'var(--coral-warm)', fontWeight: 600 }}>
                            {(item.bad_risk_probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {item.model_version || 'xgboost-v1.0'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-teal" style={{ textTransform: 'capitalize' }}>
                          {item.status || 'completed'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleViewDetails(item.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="View original decision snapshot"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleOpenRename(item)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Rename analysis"
                          >
                            <Pencil size={13} />
                            <span>Rename</span>
                          </button>

                          {deleteConfirmId === item.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="btn btn-sm"
                                style={{ backgroundColor: 'var(--coral-warm)', color: '#FFFFFF', padding: '4px 8px', fontSize: '11px' }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 6px', fontSize: '11px' }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--coral-warm)', padding: '6px' }}
                              title="Delete analysis record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-default)',
            backgroundColor: '#FAFCFD'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Showing Page {page} of {totalPages} ({total} Total Records)
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedAnalysis && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 34, 64, 0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--navy-deep)',
              color: '#FFFFFF'
            }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--gold-soft)' }}>
                  HISTORICAL ANALYSIS SNAPSHOT • RECORD #{selectedAnalysis.id}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '4px 0 0 0', color: '#FFFFFF' }}>
                  {selectedAnalysis.analysis_name || `Analysis #${selectedAnalysis.id}`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Notice Banner */}
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                fontSize: '12px',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                <span>
                  This record is displayed directly from the PostgreSQL persistence layer. Generated on{' '}
                  <strong>{selectedAnalysis.created_at ? new Date(selectedAnalysis.created_at).toLocaleString() : 'N/A'}</strong> using{' '}
                  <strong>{selectedAnalysis.model_version}</strong>. Values are not recalculated.
                </span>
              </div>

              {/* Prediction Summary KPI */}
              <div style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: selectedAnalysis.predicted_class?.toLowerCase().includes('good') ? 'var(--green-soft)' : '#FEECEC',
                border: `1px solid ${selectedAnalysis.predicted_class?.toLowerCase().includes('good') ? '#C6E9D7' : '#F8C6C6'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Original Model Classification
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy-deep)', marginTop: '2px' }}>
                    {selectedAnalysis.predicted_class}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Good Risk Probability</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-forest)' }}>
                      {(selectedAnalysis.good_risk_probability * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bad Risk Probability</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--coral-warm)' }}>
                      {(selectedAnalysis.bad_risk_probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicant Input Features Snapshot */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Original Applicant Features
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: '8px',
                  backgroundColor: '#FAFCFD',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  {Object.entries(selectedAnalysis.input_features || {}).map(([key, val]) => (
                    <div key={key} style={{ fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <strong style={{ color: 'var(--navy-deep)' }}>{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHAP Factors */}
              {selectedAnalysis.shap_results?.top_factors && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lightbulb size={15} color="var(--gold-soft)" />
                    <span>Saved SHAP Feature Contributions</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedAnalysis.shap_results.top_factors.map((f, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '6px',
                        fontSize: '12.5px'
                      }}>
                        <span style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>{f.feature}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: f.shap_value > 0 ? 'var(--green-forest)' : 'var(--coral-warm)', fontWeight: 700 }}>
                            {f.shap_value > 0 ? `+${f.shap_value.toFixed(3)}` : f.shap_value.toFixed(3)}
                          </span>
                          <span className={`badge ${f.shap_value > 0 ? 'badge-green' : 'badge-coral'}`} style={{ fontSize: '10.5px' }}>
                            {f.direction}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DiCE Counterfactuals */}
              {selectedAnalysis.counterfactual_results?.results?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GitBranch size={15} color="var(--teal-primary)" />
                    <span>Saved DiCE Counterfactual Alternatives</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedAnalysis.counterfactual_results.results.map((c, i) => (
                      <div key={i} style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '12.5px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--navy-deep)', marginBottom: '4px' }}>
                          Recourse Option #{i + 1} → Target: {c.target_label}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(c.changes || []).map((ch, idx) => (
                            <span key={idx} style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-default)', fontSize: '11.5px' }}>
                              {ch.feature}: {String(ch.current_value)} → <strong style={{ color: 'var(--green-forest)' }}>{String(ch.counterfactual_value)}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MAPIE Uncertainty */}
              {selectedAnalysis.uncertainty_results && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={15} color="var(--amber-warm)" />
                    <span>Conformal Uncertainty Set</span>
                  </h4>
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--amber-soft)', borderRadius: '8px', fontSize: '12.5px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--navy-deep)' }}>
                      Prediction Set: [ {(selectedAnalysis.uncertainty_results.prediction_set || []).join(' , ')} ]
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {selectedAnalysis.uncertainty_results.reliability_assessment}
                    </div>
                  </div>
                </div>
              )}

              {/* Decision Summary */}
              {selectedAnalysis.decision_summary && (
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--navy-deep)', color: '#FFFFFF', fontSize: '12.5px', lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-soft)', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', fontSize: '11px' }}>
                    <Sparkles size={14} />
                    <span>Original Decision Synthesis</span>
                  </div>
                  {selectedAnalysis.decision_summary}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-default)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#F8FAFC'
            }}>
              <button onClick={() => setSelectedAnalysis(null)} className="btn btn-secondary btn-sm">
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#FFFFFF',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={18} color="var(--teal-primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                  Rename Analysis #{renameTarget.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {renameError && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: '#FEECEC',
                border: '1px solid #F8C6C6',
                color: 'var(--coral-warm)',
                fontSize: '12px',
                marginBottom: '14px'
              }}>
                {renameError}
              </div>
            )}

            <form onSubmit={handleSaveRename}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy-deep)', marginBottom: '6px' }}>
                  Analysis Label / Reference Name
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="e.g., Enterprise Batch 2026-Q1 or John Doe Evaluation"
                  maxLength={200}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  className="btn btn-secondary btn-sm"
                  disabled={renameSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={renameSubmitting}
                >
                  {renameSubmitting ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistoryPage;
