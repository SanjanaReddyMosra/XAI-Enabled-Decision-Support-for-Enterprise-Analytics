import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Database,
  BrainCircuit,
  Target,
  Lightbulb,
  GitBranch,
  ShieldQuestion,
  Scale,
  ChevronRight
} from 'lucide-react';

const pipelineStages = [
  { id: 'data', name: 'DATA', subtitle: 'German Credit', path: '/dataset', icon: Database },
  { id: 'model', name: 'MODEL', subtitle: 'XGBoost 70/15/15', path: '/training', icon: BrainCircuit },
  { id: 'prediction', name: 'PREDICTION', subtitle: 'Risk Outcome', path: '/prediction', icon: Target },
  { id: 'explanation', name: 'EXPLANATION', subtitle: 'SHAP (Why?)', path: '/shap', icon: Lightbulb },
  { id: 'counterfactual', name: 'COUNTERFACTUAL', subtitle: 'DiCE (What if?)', path: '/counterfactual', icon: GitBranch },
  { id: 'uncertainty', name: 'UNCERTAINTY', subtitle: 'MAPIE Conformal', path: '/uncertainty', icon: ShieldQuestion },
  { id: 'fairness', name: 'FAIRNESS', subtitle: 'Fairlearn Audit', path: '/fairness', icon: Scale },
];

export const DecisionPipeline = () => {
  const location = useLocation();

  return (
    <div className="pipeline-container">
      <div className="pipeline-header">
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-deep)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Integrated Decision Support Architecture
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click any stage to inspect the underlying machine learning and explainability module
          </div>
        </div>
        <span className="badge badge-teal">Live Pipeline</span>
      </div>

      <div className="pipeline-steps">
        {pipelineStages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = location.pathname === stage.path;

          return (
            <React.Fragment key={stage.id}>
              <Link
                to={stage.path}
                className={`pipeline-step-item ${isActive ? 'active' : ''}`}
                title={`Navigate to ${stage.name}: ${stage.subtitle}`}
              >
                <div className="pipeline-icon">
                  <Icon size={15} strokeWidth={2.2} />
                </div>
                <div className="pipeline-step-title">{stage.name}</div>
                <div className="pipeline-step-subtitle">{stage.subtitle}</div>
              </Link>
              {idx < pipelineStages.length - 1 && (
                <div className="pipeline-connector">
                  <ChevronRight size={16} strokeWidth={2.5} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionPipeline;
