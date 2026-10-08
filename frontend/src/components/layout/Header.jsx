import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePrediction } from '../../context/PredictionContext';

const routeTitleMap = {
  '/dashboard': { title: 'Dashboard', breadcrumb: 'Overview' },
  '/dataset': { title: 'Dataset & Ingestion', breadcrumb: 'Data & Model' },
  '/data-quality': { title: 'Data Quality & Cleaning', breadcrumb: 'Data & Model' },
  '/visualization': { title: 'Dataset Visualizations', breadcrumb: 'Data & Model' },
  '/training': { title: 'Training & Testing', breadcrumb: 'Data & Model' },
  '/evaluation': { title: 'Model Evaluation', breadcrumb: 'Data & Model' },
  '/model-comparison': { title: 'Model Comparison', breadcrumb: 'Data & Model' },
  '/prediction': { title: 'Credit Risk Prediction', breadcrumb: 'Explainability' },
  '/shap': { title: 'SHAP Feature Attribution', breadcrumb: 'Explainability' },
  '/counterfactual': { title: 'Counterfactual Explanations', breadcrumb: 'Explainability' },
  '/uncertainty': { title: 'Conformal Uncertainty', breadcrumb: 'Explainability' },
  '/fairness': { title: 'Fairness Audit', breadcrumb: 'Explainability' },
  '/architecture': { title: 'System Architecture', breadcrumb: 'System' },
  '/about': { title: 'About & Documentation', breadcrumb: 'System' },
};

export const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { systemHealth } = usePrediction();
  const currentRoute = routeTitleMap[location.pathname] || { title: 'Decision Intelligence', breadcrumb: 'System' };

  return (
    <header className="top-header">
      {/* Left: Mobile Toggle, Breadcrumb & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ display: 'none', padding: '6px' }}
          id="mobile-nav-toggle"
          aria-label="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <div className="header-left">
          <div className="header-breadcrumbs">
            <span>Home</span>
            <ChevronRight size={12} />
            <span>{currentRoute.breadcrumb}</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--navy-deep)', fontWeight: 500 }}>{currentRoute.title}</span>
          </div>
          <h1 className="header-page-title">{currentRoute.title}</h1>
        </div>
      </div>

      {/* Right: Live System Status Badges */}
      <div className="header-right">
        <div className="status-indicator-badge" title="UCI Statlog German Credit Data Source">
          <span className={`status-dot ${systemHealth.datasetLoaded ? 'green' : 'amber'}`}></span>
          <span>{systemHealth.datasetLoaded ? 'Dataset Loaded' : 'Dataset Loading...'}</span>
        </div>

        <div className="status-indicator-badge" title="XGBoost Classifier Model Status">
          <span className={`status-dot ${systemHealth.modelReady ? 'teal' : 'amber'}`}></span>
          <span>{systemHealth.modelReady ? 'Model Ready (XGBoost)' : 'Model Initializing...'}</span>
        </div>

        <div className="status-indicator-badge" title="FastAPI Microservice Health">
          <span className={`status-dot ${systemHealth.apiConnected ? 'green' : 'coral'}`}></span>
          <span>{systemHealth.apiConnected ? 'API Connected' : 'Connecting to API...'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
