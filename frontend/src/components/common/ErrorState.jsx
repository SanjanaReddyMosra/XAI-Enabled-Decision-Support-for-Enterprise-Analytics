import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Unable to load analysis',
  message = 'The backend service may be processing or temporarily unavailable.',
  onRetry,
  minHeight = '240px'
}) => {
  return (
    <div className="state-container" style={{ minHeight }}>
      <div className="state-icon-wrap" style={{ backgroundColor: 'var(--coral-soft)', color: 'var(--coral-deep)' }}>
        <AlertCircle size={26} />
      </div>
      <div className="state-title">{title}</div>
      <div className="state-desc">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
          <RefreshCw size={14} />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
