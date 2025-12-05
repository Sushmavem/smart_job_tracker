// client/src/components/StatsCards.jsx
/**
 * Statistics cards component
 * Displays job application statistics with visual indicators
 */

// Icons for stats
const Icons = {
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Award: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  XCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

const StatsCards = ({ stats, detailed = false }) => {
  if (!stats) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
            <div className="stat-icon purple">
              <Icons.Briefcase />
            </div>
            <div className="stat-value">-</div>
            <div className="stat-label">Loading...</div>
          </div>
        ))}
      </div>
    );
  }

  const { total_applications, status_counts, platform_counts } = stats;

  // Get status counts with defaults
  const applied = status_counts.applied || 0;
  const interview = status_counts.interview || 0;
  const offer = status_counts.offer || 0;
  const rejected = status_counts.rejected || 0;

  // Calculate response rate
  const responseRate =
    total_applications > 0
      ? Math.round(((interview + offer) / total_applications) * 100)
      : 0;

  // Main stats cards
  const mainStats = [
    {
      label: "Total Applications",
      value: total_applications,
      icon: Icons.Briefcase,
      color: "purple",
      isPrimary: true,
    },
    {
      label: "Applied",
      value: applied,
      icon: Icons.Send,
      color: "blue",
    },
    {
      label: "Interviews",
      value: interview,
      icon: Icons.Users,
      color: "yellow",
    },
    {
      label: "Offers",
      value: offer,
      icon: Icons.Award,
      color: "green",
    },
  ];

  // Detailed view includes additional stats
  if (detailed) {
    return (
      <>
        {/* Main Stats */}
        <div className="stats-grid">
          {mainStats.map((stat, index) => (
            <div key={index} className={`stat-card ${stat.isPrimary ? "primary" : ""}`}>
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="stats-grid" style={{ marginTop: "1rem" }}>
          <div className="stat-card">
            <div className="stat-icon red">
              <Icons.XCircle />
            </div>
            <div className="stat-value">{rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <Icons.Award />
            </div>
            <div className="stat-value">{responseRate}%</div>
            <div className="stat-label">Response Rate</div>
          </div>
        </div>

        {/* Platform Breakdown */}
        {Object.keys(platform_counts).length > 0 && (
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Applications by Platform</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Object.entries(platform_counts).map(([platform, count]) => (
                <div key={platform} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ minWidth: "100px", fontWeight: 500 }}>{platform}</span>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      background: "var(--color-gray-100)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(count / total_applications) * 100}%`,
                        height: "100%",
                        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                        borderRadius: "4px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span style={{ minWidth: "40px", textAlign: "right", fontWeight: 600 }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Breakdown */}
        {Object.keys(status_counts).length > 0 && (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Applications by Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {Object.entries(status_counts).map(([status, count]) => {
                const colors = {
                  applied: "var(--color-applied)",
                  interview: "var(--color-interview)",
                  offer: "var(--color-offer)",
                  rejected: "var(--color-rejected)",
                };
                return (
                  <div key={status} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span
                      style={{
                        minWidth: "100px",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    >
                      {status}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "8px",
                        background: "var(--color-gray-100)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(count / total_applications) * 100}%`,
                          height: "100%",
                          background: colors[status] || "var(--color-primary)",
                          borderRadius: "4px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <span style={{ minWidth: "40px", textAlign: "right", fontWeight: 600 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  }

  // Simple stats view for dashboard
  return (
    <div className="stats-grid">
      {mainStats.map((stat, index) => (
        <div key={index} className={`stat-card ${stat.isPrimary ? "primary" : ""}`}>
          <div className={`stat-icon ${stat.color}`}>
            <stat.icon />
          </div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
