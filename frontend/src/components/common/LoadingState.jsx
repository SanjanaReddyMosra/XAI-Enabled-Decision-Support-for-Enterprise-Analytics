import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading analysis from backend...', minHeight = '240px' }) => {
  return (
    <div className="state-container" style={{ minHeight }}>
      <div className="state-icon-wrap" style={{ backgroundColor: 'var(--bg-active)', color: 'var(--teal-primary)' }}>
        <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <div className="state-title">{message}</div>
      <div className="state-desc">Executing real-time machine learning calculations on the FastAPI engine...</div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
