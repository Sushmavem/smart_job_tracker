// client/src/components/JobCard.jsx
/**
 * Job application card component
 * Displays job info with status, actions, and hover effects
 */

// Icons
const Icons = {
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  MoreVertical: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
};

// Status tag component
const StatusTag = ({ status }) => (
  <span className={`status-tag ${status}`}>
    <span className="status-dot" />
    {status}
  </span>
);

const JobCard = ({ job, onClick, onStatusChange, onDelete }) => {
  // Get company initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle status change
  const handleStatusChange = (e) => {
    e.stopPropagation();
    onStatusChange(e.target.value);
  };

  // Handle delete click
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete();
  };

  // Handle link click
  const handleLinkClick = (e) => {
    e.stopPropagation();
    window.open(job.job_link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`job-card ${job.status}`} onClick={onClick}>
      {/* Header */}
      <div className="job-card-header">
        <div className="job-company">
          <div className="company-logo">{getInitials(job.company)}</div>
          <div className="company-info">
            <h4>{job.company}</h4>
            <span>{job.platform}</span>
          </div>
        </div>
        <StatusTag status={job.status} />
      </div>

      {/* Body */}
      <div className="job-card-body">
        <h3>{job.role}</h3>

        {/* Notes preview */}
        {job.notes && (
          <p className="text-muted text-small" style={{ marginTop: "0.5rem" }}>
            {job.notes.length > 100 ? `${job.notes.substring(0, 100)}...` : job.notes}
          </p>
        )}

        {/* Meta info */}
        <div className="job-meta">
          <span className="job-meta-item">
            <Icons.Calendar />
            {formatDate(job.created_at)}
          </span>
          {job.source === "extension" && (
            <span className="job-meta-item">
              <Icons.Globe />
              Via Extension
            </span>
          )}
          {job.resume_version && (
            <span className="job-meta-item">
              <Icons.FileText />
              {job.resume_version}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="job-card-footer">
        <select
          className="filter-select"
          value={job.status}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
          style={{ minWidth: "110px", padding: "0.35rem 0.5rem", fontSize: "0.8125rem" }}
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="job-actions">
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={handleLinkClick}
            title="Open job posting"
          >
            <Icons.ExternalLink />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={handleDeleteClick}
            title="Delete application"
            style={{ color: "var(--color-rejected)" }}
          >
            <Icons.Trash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
