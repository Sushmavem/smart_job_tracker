// client/src/components/JobModal.jsx
/**
 * Modal for adding/editing job applications
 * Includes form validation and company suggestions
 */
import { useState, useEffect, useRef } from "react";

// Common company suggestions for auto-complete
const COMPANY_SUGGESTIONS = [
  "Google", "Apple", "Microsoft", "Amazon", "Meta", "Netflix", "Tesla",
  "Spotify", "Airbnb", "Uber", "Lyft", "Stripe", "Square", "Shopify",
  "Salesforce", "Adobe", "Oracle", "IBM", "Intel", "Cisco", "VMware",
  "Slack", "Zoom", "Dropbox", "Twitter", "LinkedIn", "Pinterest",
  "Snap", "TikTok", "Reddit", "Discord", "Figma", "Notion", "Asana",
  "Atlassian", "GitHub", "GitLab", "Datadog", "Snowflake", "Databricks",
];

// Common role suggestions
const ROLE_SUGGESTIONS = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "DevOps Engineer", "Data Scientist",
  "Data Engineer", "Machine Learning Engineer", "Product Manager",
  "UX Designer", "UI Designer", "QA Engineer", "Site Reliability Engineer",
  "Security Engineer", "Cloud Engineer", "Mobile Developer",
  "iOS Developer", "Android Developer", "Technical Program Manager",
];

// Close icon
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const JobModal = ({ onClose, onSubmit, initialData = null }) => {
  const [form, setForm] = useState({
    company: initialData?.company || "",
    role: initialData?.role || "",
    job_link: initialData?.job_link || "",
    status: initialData?.status || "applied",
    platform: initialData?.platform || "LinkedIn",
    notes: initialData?.notes || "",
    resume_version: initialData?.resume_version || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);

  const companyInputRef = useRef(null);
  const roleInputRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Update suggestions for company field
    if (name === "company" && value.length > 0) {
      const filtered = COMPANY_SUGGESTIONS.filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setCompanySuggestions(filtered);
      setShowCompanySuggestions(filtered.length > 0);
    } else if (name === "company") {
      setShowCompanySuggestions(false);
    }

    // Update suggestions for role field
    if (name === "role" && value.length > 0) {
      const filtered = ROLE_SUGGESTIONS.filter((r) =>
        r.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setRoleSuggestions(filtered);
      setShowRoleSuggestions(filtered.length > 0);
    } else if (name === "role") {
      setShowRoleSuggestions(false);
    }
  };

  // Select suggestion
  const selectSuggestion = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "company") {
      setShowCompanySuggestions(false);
    } else if (field === "role") {
      setShowRoleSuggestions(false);
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!form.company.trim()) newErrors.company = "Company is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.job_link.trim()) newErrors.job_link = "Job link is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(form);
    } catch (error) {
      setErrors({ submit: "Failed to save. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? "Edit Application" : "Add New Application"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Company */}
            <div className="form-group" style={{ position: "relative" }}>
              <label className="form-label" htmlFor="company">
                Company *
              </label>
              <input
                ref={companyInputRef}
                id="company"
                name="company"
                className="form-input"
                type="text"
                placeholder="e.g., Google"
                value={form.company}
                onChange={handleChange}
                onFocus={() => form.company && setShowCompanySuggestions(companySuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowCompanySuggestions(false), 200)}
                autoComplete="off"
              />
              {errors.company && <span className="form-error">{errors.company}</span>}
              {showCompanySuggestions && (
                <div className="dropdown-menu" style={{ top: "100%", left: 0, right: 0, marginTop: "4px" }}>
                  {companySuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="dropdown-item"
                      onClick={() => selectSuggestion("company", suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role */}
            <div className="form-group" style={{ position: "relative" }}>
              <label className="form-label" htmlFor="role">
                Role / Position *
              </label>
              <input
                ref={roleInputRef}
                id="role"
                name="role"
                className="form-input"
                type="text"
                placeholder="e.g., Software Engineer"
                value={form.role}
                onChange={handleChange}
                onFocus={() => form.role && setShowRoleSuggestions(roleSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                autoComplete="off"
              />
              {errors.role && <span className="form-error">{errors.role}</span>}
              {showRoleSuggestions && (
                <div className="dropdown-menu" style={{ top: "100%", left: 0, right: 0, marginTop: "4px" }}>
                  {roleSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="dropdown-item"
                      onClick={() => selectSuggestion("role", suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Job Link */}
            <div className="form-group">
              <label className="form-label" htmlFor="job_link">
                Job Posting URL *
              </label>
              <input
                id="job_link"
                name="job_link"
                className="form-input"
                type="url"
                placeholder="https://..."
                value={form.job_link}
                onChange={handleChange}
              />
              {errors.job_link && <span className="form-error">{errors.job_link}</span>}
            </div>

            {/* Status and Platform */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="platform">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  className="form-select"
                  value={form.platform}
                  onChange={handleChange}
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Glassdoor">Glassdoor</option>
                  <option value="Company">Company Website</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Resume Version */}
            <div className="form-group">
              <label className="form-label" htmlFor="resume_version">
                Resume Version (optional)
              </label>
              <input
                id="resume_version"
                name="resume_version"
                className="form-input"
                type="text"
                placeholder="e.g., v2.0 - Tech Focus"
                value={form.resume_version}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                className="form-textarea"
                placeholder="Add any notes about this application..."
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : initialData ? "Save Changes" : "Add Application"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
