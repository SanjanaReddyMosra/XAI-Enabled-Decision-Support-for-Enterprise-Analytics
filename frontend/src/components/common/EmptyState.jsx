import React from 'react';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Target,
  title = 'No Prediction Selected',
  description = 'Run a credit risk prediction or load a sample applicant to view this analysis.',
  actionLabel = 'Run Prediction',
  actionLink = '/prediction',
  minHeight = '280px'
}) => {
  return (
    <div className="state-container" style={{ minHeight }}>
      <div className="state-icon-wrap" style={{ backgroundColor: 'var(--bg-active)', color: 'var(--teal-primary)' }}>
        <Icon size={26} />
      </div>
      <div className="state-title">{title}</div>
      <div className="state-desc">{description}</div>
      {actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
