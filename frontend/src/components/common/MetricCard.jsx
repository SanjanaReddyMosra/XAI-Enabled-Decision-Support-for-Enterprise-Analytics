import React from 'react';

export const MetricCard = ({ label, value, subtext, icon: Icon, color = 'navy', trend }) => {
  const colorMap = {
    navy: { bg: '#EBF0F4', text: 'var(--navy-deep)' },
    teal: { bg: 'var(--bg-active)', text: 'var(--teal-primary)' },
    amber: { bg: 'var(--amber-soft)', text: 'var(--amber-warm)' },
    green: { bg: 'var(--green-soft)', text: 'var(--green-forest)' },
    coral: { bg: 'var(--coral-soft)', text: 'var(--coral-deep)' },
  };

  const scheme = colorMap[color] || colorMap.navy;

  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {Icon && (
          <div className="kpi-icon-container" style={{ backgroundColor: scheme.bg, color: scheme.text }}>
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      {(subtext || trend) && (
        <div className="kpi-subtext" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{subtext}</span>
          {trend && <span style={{ fontWeight: 600 }}>{trend}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
