// client/src/components/JobDetailModal.jsx
/**
 * Modal for viewing job details with timeline and edit capabilities
 */
import { useState, useEffect } from "react";
import { sendInterviewReminder } from "../api/jobsApi";

// Icons
const Icons = {
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

const JobDetailModal = ({ job, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingInterview, setIsEditingInterview] = useState(false);
  const [editedNotes, setEditedNotes] = useState(job.notes || "");
  const [editedResumeVersion, setEditedResumeVersion] = useState(job.resume_version || "");
  const [interviewDate, setInterviewDate] = useState(job.interview_date ? new Date(job.interview_date).toISOString().slice(0, 16) : "");
  const [interviewType, setInterviewType] = useState(job.interview_type || "");
  const [interviewNotes, setInterviewNotes] = useState(job.interview_notes || "");
  const [sendingReminder, setSendingReminder] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle save notes
  const handleSaveNotes = async () => {
    await onUpdate(job.id, {
      notes: editedNotes,
      resume_version: editedResumeVersion,
    });
    setIsEditing(false);
  };

  // Handle save interview
  const handleSaveInterview = async () => {
    await onUpdate(job.id, {
      interview_date: interviewDate ? new Date(interviewDate).toISOString() : null,
      interview_type: interviewType || null,
      interview_notes: interviewNotes || null,
    });
    setIsEditingInterview(false);
  };

  // Handle send reminder
  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      await sendInterviewReminder(job.id);
      alert("Interview reminder sent to your email!");
    } catch (err) {
      alert("Failed to send reminder: " + (err.response?.data?.detail || err.message));
    } finally {
      setSendingReminder(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Company initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal" style={{ maxWidth: "600px" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="company-logo" style={{ width: "48px", height: "48px", fontSize: "1.125rem" }}>
              {getInitials(job.company)}
            </div>
            <div>
              <h2 className="modal-title" style={{ marginBottom: "4px" }}>
                {job.role}
              </h2>
              <span className="text-muted">{job.company}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status and Actions Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="text-muted text-small">Status:</span>
              <select
                className="filter-select"
                value={job.status}
                onChange={(e) => onUpdate(job.id, { status: e.target.value })}
                style={{ minWidth: "120px" }}
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <a
                href={job.job_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Icons.ExternalLink />
                View Posting
              </a>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(job.id)}
              >
                <Icons.Trash />
                Delete
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div className="card" style={{ padding: "1rem" }}>
              <span className="text-muted text-small">Platform</span>
              <p className="font-medium">{job.platform}</p>
            </div>
            <div className="card" style={{ padding: "1rem" }}>
              <span className="text-muted text-small">Source</span>
              <p className="font-medium" style={{ textTransform: "capitalize" }}>
                {job.source}
              </p>
            </div>
          </div>

          {/* Interview Scheduling */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Icons.Calendar />
                Interview Schedule
              </h4>
              {!isEditingInterview && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsEditingInterview(true)}
                >
                  <Icons.Edit />
                  {job.interview_date ? "Edit" : "Schedule"}
                </button>
              )}
            </div>

            {isEditingInterview ? (
              <>
                <div className="form-group">
                  <label className="form-label">Interview Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Interview Type</label>
                  <select
                    className="form-select"
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                  >
                    <option value="">Select type...</option>
                    <option value="Phone">Phone Screen</option>
                    <option value="Video">Video Call</option>
                    <option value="Onsite">On-site</option>
                    <option value="Technical">Technical Interview</option>
                    <option value="Behavioral">Behavioral Interview</option>
                    <option value="Final">Final Round</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Interview Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Add interview prep notes, interviewer names, etc."
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setIsEditingInterview(false);
                      setInterviewDate(job.interview_date ? new Date(job.interview_date).toISOString().slice(0, 16) : "");
                      setInterviewType(job.interview_type || "");
                      setInterviewNotes(job.interview_notes || "");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveInterview}>
                    Save Interview
                  </button>
                </div>
              </>
            ) : job.interview_date ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <span className="text-muted text-small" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Icons.Clock />
                      Date & Time:
                    </span>
                    <p className="font-medium">
                      {formatDate(job.interview_date)} at {formatTime(job.interview_date)}
                    </p>
                  </div>
                  {job.interview_type && (
                    <div>
                      <span className="text-muted text-small">Type:</span>
                      <p className="font-medium">{job.interview_type}</p>
                    </div>
                  )}
                </div>
                {job.interview_notes && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span className="text-muted text-small">Notes:</span>
                    <p style={{ whiteSpace: "pre-wrap" }}>{job.interview_notes}</p>
                  </div>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSendReminder}
                  disabled={sendingReminder || job.reminder_sent}
                  style={{ marginTop: "0.5rem" }}
                >
                  <Icons.Bell />
                  {job.reminder_sent ? "Reminder Sent" : sendingReminder ? "Sending..." : "Send Email Reminder"}
                </button>
              </div>
            ) : (
              <p className="text-muted">No interview scheduled yet. Click Schedule to add one.</p>
            )}
          </div>

          {/* Timeline */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ marginBottom: "1rem" }}>Timeline</h4>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-date">
                  {formatDate(job.created_at)} at {formatTime(job.created_at)}
                </div>
                <div className="timeline-content">
                  <strong>Application Created</strong>
                  <p className="text-muted text-small">
                    You added this application via {job.source === "extension" ? "browser extension" : "manual entry"}.
                  </p>
                </div>
              </div>
              {job.interview_date && (
                <div className="timeline-item">
                  <div className="timeline-date">
                    {formatDate(job.interview_date)} at {formatTime(job.interview_date)}
                  </div>
                  <div className="timeline-content">
                    <strong>Interview Scheduled</strong>
                    <p className="text-muted text-small">
                      {job.interview_type || "Interview"} scheduled.
                    </p>
                  </div>
                </div>
              )}
              {job.updated_at !== job.created_at && (
                <div className="timeline-item">
                  <div className="timeline-date">
                    {formatDate(job.updated_at)} at {formatTime(job.updated_at)}
                  </div>
                  <div className="timeline-content">
                    <strong>Last Updated</strong>
                    <p className="text-muted text-small">
                      Application details were modified.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h4>Notes & Details</h4>
              {!isEditing && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Icons.Edit />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <>
                <div className="form-group">
                  <label className="form-label">Resume Version</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., v2.0 - Tech Focus"
                    value={editedResumeVersion}
                    onChange={(e) => setEditedResumeVersion(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Add notes about this application..."
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedNotes(job.notes || "");
                      setEditedResumeVersion(job.resume_version || "");
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveNotes}>
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                {job.resume_version && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span className="text-muted text-small" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Icons.FileText />
                      Resume Version:
                    </span>
                    <p className="font-medium">{job.resume_version}</p>
                  </div>
                )}
                {job.notes ? (
                  <p style={{ whiteSpace: "pre-wrap" }}>{job.notes}</p>
                ) : (
                  <p className="text-muted">No notes added yet. Click Edit to add notes.</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
