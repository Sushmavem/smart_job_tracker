// client/src/components/StatsCards.jsx
import React from "react";

const StatsCards = ({ stats }) => {
  if (!stats) return null;
  const { total_applications, status_counts, platform_counts } = stats;

  return (
    <div className="stats-grid">
      <div className="card">
        <h3>Total Applications</h3>
        <p className="stat-number">{total_applications}</p>
      </div>
      <div className="card">
        <h3>Status</h3>
        {Object.entries(status_counts).map(([k, v]) => (
          <p key={k}>
            {k}: <strong>{v}</strong>
          </p>
        ))}
      </div>
      <div className="card">
        <h3>Platforms</h3>
        {Object.entries(platform_counts).map(([k, v]) => (
          <p key={k}>
            {k}: <strong>{v}</strong>
          </p>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
