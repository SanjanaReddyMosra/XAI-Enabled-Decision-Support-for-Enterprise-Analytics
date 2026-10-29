import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  ArrowRight,
  Sparkles,
  UserCheck,
  RotateCcw,
  ShieldAlert,
  GitBranch,
  BarChart3,
  Scale,
  ExternalLink,
  History,
  ShieldCheck
} from 'lucide-react';
import { usePrediction } from '../context/PredictionContext';
import SectionHeader from '../components/common/SectionHeader';

const defaultFormValues = {
  checking_status: '<0',
  duration: 24,
  credit_history: 'delayed previously',
  purpose: 'new car',
  credit_amount: 4870,
  savings_status: '<100',
  employment: '1<=X<4',
  installment_commitment: 3,
  personal_status: 'male single',
  other_parties: 'none',
  residence_since: 4,
  property_magnitude: 'no known property',
  age: 53,
  other_payment_plans: 'none',
  housing: 'for free',
  existing_credits: 2,
  job: 'skilled',
  num_dependents: 2,
  own_telephone: 'none',
  foreign_worker: 'yes'
};

export const PredictionPage = () => {
  const {
    selectedInput,
    predictionResult,
    masterAnalysisResult,
    sampleCustomers,
    loadSampleCustomer,
    runMasterAnalysis,
    loading
  } = usePrediction();

  const [formData, setFormData] = useState(selectedInput || defaultFormValues);
  const [activeModel, setActiveModel] = useState('xgboost');
  const [confidenceLevel] = useState(0.90);
  const [analysisName, setAnalysisName] = useState('');
  const [applicantReference, setApplicantReference] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectSample = (sample) => {
    setFormData(sample.features);
    loadSampleCustomer(sample);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await runMasterAnalysis(formData, null, activeModel, confidenceLevel, analysisName, applicantReference);
  };

  // Derive display values from master analysis or fallback to predictionResult
  const analysis = masterAnalysisResult;
  const predData = analysis?.prediction || (predictionResult ? {
    prediction_class: predictionResult.prediction,
    label: predictionResult.prediction_label,
    probability_good: predictionResult.good_risk_probability,
    probability_bad: predictionResult.bad_risk_probability,
    model_used: predictionResult.model_used || 'XGBoost Classifier'
  } : null);

  const isGood = predData?.prediction_class === 1;

  return (
    <div>
      <SectionHeader
        tag="DECISION SUPPORT ENGINE"
        title="Run Credit Risk Analysis"
        subtitle="Enter applicant information to generate an explainable credit-risk assessment powered by trained XGBoost, SHAP attribution, DiCE counterfactuals, and MAPIE conformal uncertainty."
      />

      {/* Preset Applicant Selector Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 20px', backgroundColor: '#FAFCFD' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={16} color="var(--teal-primary)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-deep)' }}>
              Quick Benchmark Presets:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sampleCustomers.slice(0, 6).map((sample) => (
              <button
                key={sample.customer_id}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleSelectSample(sample)}
                style={{ fontSize: '12px' }}
              >
                Sample #{sample.customer_id} ({sample.ground_truth_code === 1 ? 'Good' : 'Bad'})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 1.25fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* ========================================================= */}
        {/* APPLICANT INPUT FORM (Organized in 5 Standard Profiles) */}
        {/* ========================================================= */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Target size={17} color="var(--navy-deep)" />
                Applicant Information Form
              </h3>
              <p className="card-subtitle">UCI German Credit attributes across financial, credit, and personal profiles</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Model:</span>
              <select
                className="form-select"
                style={{ padding: '3px 8px', fontSize: '12px' }}
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
              >
                <option value="xgboost">XGBoost Classifier</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Optional Analysis Metadata */}
            <div style={{ padding: '12px 14px', backgroundColor: '#FAFCFD', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Analysis Tagging & Metadata (Optional)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '11.5px' }}>Analysis Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                    placeholder="e.g. Q4 Underwriting Audit"
                    style={{ fontSize: '12.5px', padding: '6px 10px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11.5px' }}>Applicant Reference</label>
                  <input
                    type="text"
                    className="form-input"
                    value={applicantReference}
                    onChange={(e) => setApplicantReference(e.target.value)}
                    placeholder="e.g. APP-GER-2026-09"
                    style={{ fontSize: '12.5px', padding: '6px 10px' }}
                  />
                </div>
              </div>
            </div>

            {/* 1. CREDIT PROFILE */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal-primary)' }} />
                1. Credit Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Checking Account</label>
                  <select
                    className="form-select"
                    value={formData.checking_status}
                    onChange={(e) => handleChange('checking_status', e.target.value)}
                  >
                    <option value="<0">&lt; 0 DM (Overdrawn)</option>
                    <option value="0<=X<200">0 &lt;= X &lt; 200 DM</option>
                    <option value=">=200">&gt;= 200 DM</option>
                    <option value="no checking">No checking account</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (Months)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', Number(e.target.value))}
                    min="4"
                    max="72"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Credit History</label>
                  <select
                    className="form-select"
                    value={formData.credit_history}
                    onChange={(e) => handleChange('credit_history', e.target.value)}
                  >
                    <option value="critical/other existing credit">Critical / Other Existing Credits</option>
                    <option value="delayed previously">Delay In Paying Previously</option>
                    <option value="existing paid">Existing Credits Paid Duly</option>
                    <option value="all paid">All Credits At Bank Paid Duly</option>
                    <option value="no credits/all paid">No Credits Taken / All Paid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Purpose</label>
                  <select
                    className="form-select"
                    value={formData.purpose}
                    onChange={(e) => handleChange('purpose', e.target.value)}
                  >
                    <option value="new car">Car (New)</option>
                    <option value="used car">Car (Used)</option>
                    <option value="furniture/equipment">Furniture / Equipment</option>
                    <option value="radio/tv">Radio / Television</option>
                    <option value="domestic appliances">Domestic Appliances</option>
                    <option value="repairs">Repairs</option>
                    <option value="education">Education</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Amount (DM)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.credit_amount}
                    onChange={(e) => handleChange('credit_amount', Number(e.target.value))}
                    min="250"
                    max="20000"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. FINANCIAL PROFILE */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal-primary)' }} />
                2. Financial Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Savings Account</label>
                  <select
                    className="form-select"
                    value={formData.savings_status}
                    onChange={(e) => handleChange('savings_status', e.target.value)}
                  >
                    <option value="<100">&lt; 100 DM</option>
                    <option value="100<=X<500">100 &lt;= X &lt; 500 DM</option>
                    <option value="500<=X<1000">500 &lt;= X &lt; 1000 DM</option>
                    <option value=">=1000">&gt;= 1000 DM</option>
                    <option value="no known savings">Unknown / No Savings</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Employment</label>
                  <select
                    className="form-select"
                    value={formData.employment}
                    onChange={(e) => handleChange('employment', e.target.value)}
                  >
                    <option value="unemployed">Unemployed</option>
                    <option value="<1">&lt; 1 Year</option>
                    <option value="1<=X<4">1 to 4 Years</option>
                    <option value="4<=X<7">4 to 7 Years</option>
                    <option value=">=7">&gt;= 7 Years</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Installment Rate (% of Income)</label>
                  <select
                    className="form-select"
                    value={formData.installment_commitment}
                    onChange={(e) => handleChange('installment_commitment', Number(e.target.value))}
                  >
                    <option value={1}>1%</option>
                    <option value={2}>2%</option>
                    <option value={3}>3%</option>
                    <option value={4}>4%</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Other Debtors / Guarantors</label>
                  <select
                    className="form-select"
                    value={formData.other_parties}
                    onChange={(e) => handleChange('other_parties', e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="co-applicant">Co-Applicant</option>
                    <option value="guarantor">Guarantor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. PERSONAL PROFILE */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal-primary)' }} />
                3. Personal Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Personal Status & Sex</label>
                  <select
                    className="form-select"
                    value={formData.personal_status}
                    onChange={(e) => handleChange('personal_status', e.target.value)}
                  >
                    <option value="male single">Male : Single</option>
                    <option value="female div/dep/mar">Female : Divorced / Separated / Married</option>
                    <option value="male mar/wid">Male : Married / Widowed</option>
                    <option value="male div/sep">Male : Divorced / Separated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Age (Years)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.age}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                    min="18"
                    max="80"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Dependents</label>
                  <select
                    className="form-select"
                    value={formData.num_dependents}
                    onChange={(e) => handleChange('num_dependents', Number(e.target.value))}
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2+ Persons</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Telephone</label>
                  <select
                    className="form-select"
                    value={formData.own_telephone}
                    onChange={(e) => handleChange('own_telephone', e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="yes">Yes, Registered Under Customer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Foreign Worker</label>
                  <select
                    className="form-select"
                    value={formData.foreign_worker}
                    onChange={(e) => handleChange('foreign_worker', e.target.value)}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. ASSET / HOUSING PROFILE */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal-primary)' }} />
                4. Asset & Housing Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Present Residence (Years)</label>
                  <select
                    className="form-select"
                    value={formData.residence_since}
                    onChange={(e) => handleChange('residence_since', Number(e.target.value))}
                  >
                    <option value={1}>&lt; 1 Year</option>
                    <option value={2}>1 to 2 Years</option>
                    <option value={3}>2 to 3 Years</option>
                    <option value={4}>&gt;= 4 Years</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Property</label>
                  <select
                    className="form-select"
                    value={formData.property_magnitude}
                    onChange={(e) => handleChange('property_magnitude', e.target.value)}
                  >
                    <option value="real estate">Real Estate</option>
                    <option value="building society savings/life insurance">Building Society Savings / Life Insurance</option>
                    <option value="car">Car or Other Property</option>
                    <option value="no known property">Unknown / No Property</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Housing</label>
                  <select
                    className="form-select"
                    value={formData.housing}
                    onChange={(e) => handleChange('housing', e.target.value)}
                  >
                    <option value="own">Own</option>
                    <option value="rent">Rent</option>
                    <option value="for free">For Free</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. OTHER CREDIT INFORMATION */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--teal-primary)' }} />
                5. Other Credit Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Existing Credits at Bank</label>
                  <select
                    className="form-select"
                    value={formData.existing_credits}
                    onChange={(e) => handleChange('existing_credits', Number(e.target.value))}
                  >
                    <option value={1}>1 Credit</option>
                    <option value={2}>2 Credits</option>
                    <option value={3}>3 Credits</option>
                    <option value={4}>4+ Credits</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Other Installment Plans</label>
                  <select
                    className="form-select"
                    value={formData.other_payment_plans}
                    onChange={(e) => handleChange('other_payment_plans', e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="bank">Bank</option>
                    <option value="stores">Stores</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Job</label>
                  <select
                    className="form-select"
                    value={formData.job}
                    onChange={(e) => handleChange('job', e.target.value)}
                  >
                    <option value="skilled">Skilled Employee / Official</option>
                    <option value="unskilled resident">Unskilled - Resident</option>
                    <option value="high qualif/self emp/mgmt">Management / Self-Employed</option>
                    <option value="unemp/unskilled non res">Unemployed / Unskilled Non-Resident</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px 20px', fontSize: '14px', fontWeight: 600 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="spinner" style={{ width: '14px', height: '14px' }} />
                    Analyzing credit profile...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Sparkles size={16} />
                    Generate Decision
                  </span>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFormData(defaultFormValues)}
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* COMPREHENSIVE DECISION SUPPORT OUTPUT STACK */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. MODEL DECISION CARD */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Target size={17} color="var(--navy-deep)" />
                  Model Decision Output
                </h3>
                <p className="card-subtitle">Real-time inference generated by trained {predData?.model_used || 'XGBoost'}</p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '36px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontWeight: 600, color: 'var(--navy-deep)', fontSize: '14px' }}>
                  Analyzing credit profile...
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Computing XGBoost prediction, SHAP attribution, DiCE recourse, and MAPIE conformal sets...
                </div>
              </div>
            ) : predData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Persistent DB Storage Badge */}
                {(analysis?.analysis_id || analysis?.audit_id) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default)',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--navy-deep)' }}>
                      <ShieldCheck size={14} color="var(--teal-primary)" />
                      <span>
                        Saved in Database: <strong>Record #{analysis.analysis_id || analysis.audit_id}</strong>
                        {analysis.created_at && ` • ${new Date(analysis.created_at).toLocaleTimeString()}`}
                      </span>
                    </div>
                    <Link
                      to="/history"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', padding: '3px 8px', fontSize: '11.5px' }}
                    >
                      <History size={12} />
                      <span>View in History</span>
                    </Link>
                  </div>
                )}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '10px',
                    backgroundColor: isGood ? 'var(--green-soft)' : 'var(--coral-soft)',
                    border: `1.5px solid ${isGood ? '#C4E2D3' : '#F3C3BF'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isGood ? 'var(--green-forest)' : 'var(--coral-deep)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Primary Outcome
                    </span>
                    <span className={`badge ${isGood ? 'badge-green' : 'badge-coral'}`}>
                      {isGood ? 'Low Risk (Class 1)' : 'High Risk (Class 0)'}
                    </span>
                  </div>

                  <div style={{ fontSize: '26px', fontWeight: 800, color: isGood ? 'var(--green-forest)' : 'var(--coral-deep)' }}>
                    {predData.label}
                  </div>

                  {/* Probabilities bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--navy-deep)', fontWeight: 600 }}>
                      <span>Good Risk: {(predData.probability_good * 100).toFixed(1)}%</span>
                      <span>Bad Risk: {(predData.probability_bad * 100).toFixed(1)}%</span>
                    </div>

                    <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--border-default)', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{
                          width: `${predData.probability_good * 100}%`,
                          backgroundColor: 'var(--green-forest)',
                          transition: 'width 400ms ease'
                        }}
                      />
                      <div
                        style={{
                          width: `${predData.probability_bad * 100}%`,
                          backgroundColor: 'var(--coral-deep)',
                          transition: 'width 400ms ease'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Underwriting Rule:</strong> Bad credit classifications trigger automated manual review due to the 5x asymmetric cost penalty on false approvals.
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Click "Generate Decision" to compute prediction.
              </div>
            )}
          </div>

          {/* 2. WHY? (SHAP FEATURE ATTRIBUTION) */}
          {analysis?.explanation && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <BarChart3 size={17} color="var(--navy-deep)" />
                    Why did the model make this decision?
                  </h3>
                  <p className="card-subtitle">SHAP TreeExplainer feature contributions</p>
                </div>
                <Link to="/shap" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Drilldown</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontStyle: 'italic', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', borderLeft: '3px solid var(--teal-primary)' }}>
                  "{analysis.explanation.narrative}"
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {analysis.explanation.top_factors.map((f, idx) => {
                    const isPositive = f.shap_value > 0;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--navy-deep)' }}>{f.feature}</span>
                          <span style={{ fontWeight: 700, color: isPositive ? 'var(--green-forest)' : 'var(--coral-deep)' }}>
                            {isPositive ? `+${f.shap_value.toFixed(3)}` : f.shap_value.toFixed(3)} ({f.direction})
                          </span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#EDF2F7', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, Math.abs(f.shap_value) * 120)}%`,
                              height: '100%',
                              backgroundColor: isPositive ? 'var(--green-forest)' : 'var(--coral-deep)',
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. WHAT IF? (DICE COUNTERFACTUAL EXPLANATIONS) */}
          {analysis?.counterfactuals && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <GitBranch size={17} color="var(--navy-deep)" />
                    What if? (Actionable DiCE Recourse)
                  </h3>
                  <p className="card-subtitle">Minimum perturbations to flip decision to Good Credit Risk</p>
                </div>
                <Link to="/counterfactual" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Drilldown</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {analysis.counterfactuals.results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysis.counterfactuals.results.slice(0, 2).map((cf, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px',
                        backgroundColor: '#FCFDFE'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                          Recourse Path #{idx + 1}
                        </span>
                        <span className="badge badge-green" style={{ fontSize: '11px' }}>
                          Target: {cf.target_label} ({cf.changes_count} changes)
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {cf.changes.map((ch, cIdx) => (
                          <div
                            key={cIdx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              padding: '4px 8px',
                              backgroundColor: '#FFF',
                              borderRadius: '4px',
                              border: '1px solid #EAEFF2'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{ch.feature}</span>
                            <span>
                              <span style={{ color: 'var(--coral-deep)', textDecoration: 'line-through', marginRight: '6px' }}>
                                {String(ch.current_value)}
                              </span>
                              <ArrowRight size={11} style={{ display: 'inline', margin: '0 4px', color: 'var(--text-muted)' }} />
                              <strong style={{ color: 'var(--green-forest)' }}>{String(ch.counterfactual_value)}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                    {analysis.counterfactuals.disclaimer}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '12px' }}>
                  No recourse path required or generated for this borrower configuration.
                </div>
              )}
            </div>
          )}

          {/* 4. HOW CERTAIN? (MAPIE CONFORMAL UNCERTAINTY) */}
          {analysis?.uncertainty && (
            <div className="card" style={{ borderLeft: '4px solid var(--amber-warm)' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <ShieldAlert size={17} color="var(--amber-warm)" />
                    How Certain? (MAPIE Conformal Set)
                  </h3>
                  <p className="card-subtitle">Guaranteed finite-sample coverage at 90% confidence level</p>
                </div>
                <Link to="/uncertainty" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Drilldown</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--amber-soft)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber-warm)', textTransform: 'uppercase' }}>
                      Prediction Set (Set Size: {analysis.uncertainty.set_size})
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy-deep)', marginTop: '2px' }}>
                      [ {analysis.uncertainty.prediction_set.join(' , ')} ]
                    </div>
                  </div>
                  <span className={`badge ${analysis.uncertainty.is_uncertain ? 'badge-amber' : 'badge-green'}`}>
                    {analysis.uncertainty.is_uncertain ? 'Ambiguous Set' : 'Confident Singleton'}
                  </span>
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {analysis.uncertainty.reliability_assessment}
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)', paddingTop: '8px' }}>
                  Empirical test coverage: <strong>{(analysis.uncertainty.empirical_coverage * 100).toFixed(1)}%</strong> (Nominal 1 - α: 90.0%). Conformal sets maintain valid coverage regardless of model confidence miscalibration.
                </div>
              </div>
            </div>
          )}

          {/* 5. FAIRNESS AUDIT CONTEXT */}
          {analysis?.fairness && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <Scale size={17} color="var(--navy-deep)" />
                    Fairness Context (Fairlearn)
                  </h3>
                  <p className="card-subtitle">Audited across {analysis.fairness.sensitive_attribute}</p>
                </div>
                <Link to="/fairness" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Audit</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Demographic Parity Diff</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                      {(analysis.fairness.demographic_parity_diff * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Equalized Odds Diff</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                      {(analysis.fairness.equalized_odds_diff * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {analysis.fairness.audit_summary}
                </div>
              </div>
            </div>
          )}

          {/* 6. OVERALL DECISION-SUPPORT SUMMARY */}
          {analysis?.decision_summary && (
            <div className="card" style={{ backgroundColor: 'var(--navy-deep)', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={16} color="var(--gold-soft)" />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--gold-soft)' }}>
                  Enterprise Decision-Support Synthesis
                </span>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#E2E8F0' }}>
                {analysis.decision_summary}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default PredictionPage;
