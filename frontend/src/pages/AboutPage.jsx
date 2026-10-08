import React from 'react';
import { Info, HelpCircle, BookOpen, ShieldAlert, Award, FileText } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';

export const AboutPage = () => {
  return (
    <div>
      <SectionHeader
        tag="PROJECT DOCUMENTATION & VIVA PREPARATION"
        title="About: XAI-Enabled Decision Support"
        subtitle="Comprehensive theoretical foundation, academic framing, and architecture specifications for the final-year enterprise analytics project."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1000px' }}>
        
        {/* Core Viva Summary Card */}
        <div className="card" style={{ backgroundColor: '#F8FBFC', border: '1.5px solid var(--teal-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <Award size={24} color="var(--teal-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)', marginBottom: '6px' }}>
                Core Viva Statement: What Exactly Does This System Do?
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                "Our project is an <strong>XAI-enabled enterprise decision-support system</strong>. First, it trains an XGBoost classification model on enterprise credit data and generates predictions. Then <strong>SHAP</strong> explains <em>why</em> a prediction was made, <strong>DiCE</strong> generates counterfactuals showing <em>what changes</em> could lead to an alternative prediction, <strong>MAPIE</strong> provides <em>conformal uncertainty</em> information about the prediction, and <strong>Fairlearn</strong> audits whether the model behaves differently across selected demographic groups. All these results are integrated into an interactive dashboard so that an enterprise decision-maker can understand not only what the model predicts, but also why it predicts it, what could change the prediction, how uncertain the prediction is, and whether there are observable fairness disparities."
              </p>
            </div>
          </div>
        </div>

        {/* The Four Core Questions */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '14px' }}>
            <BookOpen size={17} color="var(--navy-deep)" />
            The Four Fundamental Questions of Explainable AI
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-section)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase' }}>1. WHAT HAPPENED?</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal-primary)', margin: '4px 0' }}>XGBoost Classifier</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Predicts credit risk class (Good vs Bad) and underlying calibrated probability.</div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-section)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase' }}>2. WHY DID IT HAPPEN?</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal-primary)', margin: '4px 0' }}>SHAP (TreeExplainer)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Decomposes score into additive Shapley feature attributions.</div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-section)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase' }}>3. WHAT COULD CHANGE IT?</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal-primary)', margin: '4px 0' }}>DiCE-ML Recourse</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Generates diverse, minimal feature changes to reverse the decision.</div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-section)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy-deep)', textTransform: 'uppercase' }}>4. HOW SURE & HOW FAIR?</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal-primary)', margin: '4px 0' }}>MAPIE + Fairlearn</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Provides conformal coverage sets and audits demographic parity differences.</div>
            </div>
          </div>
        </div>

        {/* Problem Statement & Proposed Solution */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '12px' }}>
            <FileText size={17} color="var(--navy-deep)" />
            Problem Statement & Proposed Solution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div>
              <strong style={{ color: 'var(--navy-deep)' }}>The Problem:</strong> Enterprise machine learning models can achieve high statistical accuracy, but their black-box nature makes it difficult for loan underwriters and enterprise decision-makers to understand, trust, and appropriately act on predictions. Simple probability scores fail to communicate conformal uncertainty, standard global metrics do not provide individual recourse, and un-audited models risk perpetuating historic demographic biases.
            </div>

            <div>
              <strong style={{ color: 'var(--navy-deep)' }}>The Proposed Solution:</strong> An integrated full-stack Explainable AI platform combining FastAPI and React.js that bridges model training, explainability, uncertainty quantification, and fairness auditing into an intuitive decision workspace. Underwriters can review decisions alongside exact game-theoretic attributions, actionable counterfactual options, conformal confidence bounds, and demographic parity reports.
            </div>
          </div>
        </div>

        {/* Limitations & Academic Disclaimer */}
        <div className="card" style={{ backgroundColor: '#FAFDFD' }}>
          <h3 className="card-title" style={{ marginBottom: '12px' }}>
            <ShieldAlert size={17} color="var(--amber-warm)" />
            Limitations & Academic Disclaimer
          </h3>

          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Benchmark Scope:</strong> The current implementation uses the benchmark UCI Statlog German Credit dataset (1,000 instances). In live enterprise deployments, credit scoring incorporates broader behavioral telemetry and time-series debt obligations.
            </li>
            <li>
              <strong>Recourse Non-Guarantee:</strong> Counterfactual explanations generated by DiCE represent model-valid alternative inputs, but do not constitute guaranteed credit approval in actual banking environments.
            </li>
            <li>
              <strong>Audit Objectivity:</strong> Fairness metrics generated by Fairlearn quantify mathematical disparities across demographic slices, but ethical fairness determinations remain the prerogative of human compliance officers.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
