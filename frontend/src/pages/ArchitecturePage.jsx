import React from 'react';
import {
  Network,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Code,
  Box,
  ShieldCheck,
  Scale
} from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';

const techStack = [
  { name: 'React.js', role: 'Frontend Framework', desc: 'Component architecture, responsive dashboard, client-side routing and state context.', category: 'Frontend' },
  { name: 'FastAPI', role: 'Microservice API', desc: 'Asynchronous REST APIs connecting React to Python ML and XAI engines.', category: 'Backend' },
  { name: 'Python 3.11', role: 'Core ML Runtime', desc: 'Data wrangling, scientific computing, and model execution runtime.', category: 'Core' },
  { name: 'XGBoost', role: 'Predictive Classifier', desc: 'Gradient boosted decision trees for asymmetric credit risk classification.', category: 'Machine Learning' },
  { name: 'SHAP', role: 'Local & Global Attribution', desc: 'TreeExplainer cooperative game theory decomposing predictions into Shapley values.', category: 'Explainability' },
  { name: 'DiCE-ML', role: 'Counterfactual Explanations', desc: 'Generates diverse, minimal feature modifications to obtain alternative decisions.', category: 'Explainability' },
  { name: 'MAPIE', role: 'Conformal Uncertainty', desc: 'Split conformal prediction sets providing distribution-free coverage guarantees.', category: 'Uncertainty' },
  { name: 'Fairlearn', role: 'Demographic Fairness Audit', desc: 'MetricFrame assessing disparate impact and equalized odds across demographic groups.', category: 'Fairness' },
  { name: 'PostgreSQL', role: 'Persistence Layer', desc: 'Historical audit logs, model versioning records, and prediction request tracking.', category: 'Database' },
  { name: 'Docker', role: 'Containerization', desc: 'Reproducible deployment packaging frontend, FastAPI microservice, and PostgreSQL.', category: 'DevOps' },
];

export const ArchitecturePage = () => {
  return (
    <div>
      <SectionHeader
        tag="SYSTEM SPECIFICATIONS"
        title="Technical Architecture & Methodology"
        subtitle="End-to-end Explainable AI Decision Support System integrating gradient boosting, feature attribution, actionable recourse, conformal uncertainty, and fairness auditing."
      />

      {/* SVG Architecture Diagram Card */}
      <div className="card" style={{ marginBottom: '28px', padding: '28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Network size={17} color="var(--navy-deep)" />
              System Architecture Diagram (Pure SVG/CSS)
            </h3>
            <p className="card-subtitle">Detailed workflow illustrating pipeline execution and component isolation</p>
          </div>
          <span className="badge badge-teal">Integrated XAI Pipeline</span>
        </div>

        {/* Clean, Scalable SVG Diagram */}
        <div style={{ width: '100%', overflowX: 'auto', padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 860 620" width="860" height="620" style={{ maxWidth: '100%', height: 'auto', fontFeatureSettings: '"tnum"' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4F9C99" />
              </marker>
              <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#18324B" />
                <stop offset="100%" stopColor="#244B68" />
              </linearGradient>
              <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#167D7F" />
                <stop offset="100%" stopColor="#244B68" />
              </linearGradient>
            </defs>

            {/* 1. DATASET */}
            <rect x="330" y="20" width="200" height="42" rx="8" fill="#F1F5F7" stroke="#DCE3E8" strokeWidth="1.5" />
            <text x="430" y="46" textAnchor="middle" fill="#18324B" fontSize="13" fontWeight="700">1. UCI STATLOG DATASET</text>

            <line x1="430" y1="62" x2="430" y2="88" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* 2. DATA CLEANING */}
            <rect x="330" y="90" width="200" height="42" rx="8" fill="#F1F5F7" stroke="#DCE3E8" strokeWidth="1.5" />
            <text x="430" y="116" textAnchor="middle" fill="#18324B" fontSize="13" fontWeight="600">2. 8-STEP DATA CLEANING</text>

            <line x1="430" y1="132" x2="430" y2="158" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* 3. PREPROCESSING */}
            <rect x="310" y="160" width="240" height="42" rx="8" fill="#EEF5F6" stroke="#167D7F" strokeWidth="1.5" />
            <text x="430" y="186" textAnchor="middle" fill="#167D7F" fontSize="13" fontWeight="700">3. PREPROCESSING (Fitted on Train)</text>

            <line x1="430" y1="202" x2="430" y2="228" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* 4. SPLITTING 70 / 15 / 15 */}
            <rect x="250" y="230" width="360" height="44" rx="8" fill="#F1F5F7" stroke="#DCE3E8" strokeWidth="1.5" />
            <text x="430" y="257" textAnchor="middle" fill="#18324B" fontSize="13" fontWeight="600">4. 70% TRAIN  |  15% VALIDATION  |  15% TEST</text>

            <line x1="430" y1="274" x2="430" y2="300" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* 5. XGBOOST PREDICTIVE ENGINE */}
            <rect x="310" y="302" width="240" height="48" rx="8" fill="url(#navyGrad)" stroke="#18324B" strokeWidth="1.5" />
            <text x="430" y="327" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">5. XGBOOST CLASSIFIER</text>
            <text x="430" y="342" textAnchor="middle" fill="#E5B95C" fontSize="11" fontWeight="500">Prediction Engine (Good / Bad Risk)</text>

            {/* Branching from Prediction to XAI Triad */}
            <path d="M 430 350 L 430 375 L 170 375 L 170 395" fill="none" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M 430 350 L 430 395" fill="none" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />
            <path d="M 430 350 L 430 375 L 690 375 L 690 395" fill="none" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* XAI Module 1: SHAP */}
            <rect x="80" y="398" width="180" height="64" rx="8" fill="#FFFFFF" stroke="#167D7F" strokeWidth="1.5" />
            <text x="170" y="424" textAnchor="middle" fill="#167D7F" fontSize="13" fontWeight="700">SHAP (TreeExplainer)</text>
            <text x="170" y="442" textAnchor="middle" fill="#52616B" fontSize="11.5">Question: "Why?"</text>
            <text x="170" y="455" textAnchor="middle" fill="#7B8790" fontSize="10.5">Feature Attribution</text>

            {/* XAI Module 2: DiCE */}
            <rect x="340" y="398" width="180" height="64" rx="8" fill="#FFFFFF" stroke="#167D7F" strokeWidth="1.5" />
            <text x="430" y="424" textAnchor="middle" fill="#167D7F" fontSize="13" fontWeight="700">DiCE-ML</text>
            <text x="430" y="442" textAnchor="middle" fill="#52616B" fontSize="11.5">Question: "What if?"</text>
            <text x="430" y="455" textAnchor="middle" fill="#7B8790" fontSize="10.5">Counterfactual Recourse</text>

            {/* XAI Module 3: MAPIE */}
            <rect x="600" y="398" width="180" height="64" rx="8" fill="#FFFFFF" stroke="#D99A2B" strokeWidth="1.5" />
            <text x="690" y="424" textAnchor="middle" fill="#D99A2B" fontSize="13" fontWeight="700">MAPIE</text>
            <text x="690" y="442" textAnchor="middle" fill="#52616B" fontSize="11.5">Question: "How certain?"</text>
            <text x="690" y="455" textAnchor="middle" fill="#7B8790" fontSize="10.5">Conformal Prediction Sets</text>

            {/* Joining lines to Fairlearn */}
            <path d="M 170 462 L 170 488 L 430 488" fill="none" stroke="#4F9C99" strokeWidth="2" />
            <path d="M 690 462 L 690 488 L 430 488" fill="none" stroke="#4F9C99" strokeWidth="2" />
            <line x1="430" y1="462" x2="430" y2="495" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Fairlearn Module */}
            <rect x="300" y="498" width="260" height="44" rx="8" fill="#EEF5F6" stroke="#167D7F" strokeWidth="1.5" />
            <text x="430" y="519" textAnchor="middle" fill="#167D7F" fontSize="13" fontWeight="700">FAIRLEARN (MetricFrame)</text>
            <text x="430" y="534" textAnchor="middle" fill="#52616B" fontSize="11">Audit: Disparate Impact & Equalized Odds</text>

            <line x1="430" y1="542" x2="430" y2="565" stroke="#4F9C99" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Decision Support Dashboard */}
            <rect x="270" y="568" width="320" height="42" rx="8" fill="#18324B" stroke="#18324B" strokeWidth="1.5" />
            <text x="430" y="594" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">ENTERPRISE DECISION SUPPORT DASHBOARD</text>
          </svg>
        </div>
      </div>

      {/* Technology Stack Cards */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy-deep)', marginBottom: '16px' }}>
          Production Technology Stack
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {techStack.map((tech) => (
            <div key={tech.name} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-deep)' }}>
                  {tech.name}
                </span>
                <span className="badge badge-teal" style={{ fontSize: '10.5px' }}>{tech.category}</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--teal-primary)', marginBottom: '4px' }}>
                {tech.role}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {tech.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchitecturePage;
