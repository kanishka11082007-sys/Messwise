import React from 'react';

const StatsCard = ({ label, value, sub, icon: Icon, color = 'brand' }) => {
  return (
    <div className="kpi-card">
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-meta">{sub}</div>}
      </div>
      {Icon && (
        <div className={`kpi-icon ${color === 'amber' || color === 'orange' ? 'warm' : 'brand'}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
    </div>
  );
};

export default StatsCard;
