import React from 'react';

export const StatusBadge = ({ status, variant = 'teal', children }) => {
  const variantClass = `badge-${variant}`;
  return (
    <span className={`badge ${variantClass}`}>
      {children || status}
    </span>
  );
};

export default StatusBadge;
