// client/src/pages/ForgotPassword.jsx
/**
 * Forgot Password page component
 * Allows users to request a password reset token
 */
import { useState } from "react";
import { forgotPassword } from "../api/authApi";

// Briefcase icon for logo
const BriefcaseIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

// Mail icon
const MailIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ForgotPassword = ({ onGoLogin, onGoReset }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccess(true);
      // Extract token from message (for demo purposes)
      const tokenMatch = res.message.match(/: ([A-Za-z0-9_-]+)$/);
      if (tokenMatch) {
        setResetToken(tokenMatch[1]);
      }
    } catch (err) {
      const message =
        err.response?.data?.detail || "Failed to send reset request. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Success state - show confirmation and reset token
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <BriefcaseIcon />
              <span>Job Tracker</span>
            </div>
            <div style={{ margin: "1.5rem 0", color: "var(--color-primary)" }}>
              <MailIcon />
            </div>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-subtitle">
              We've generated a password reset token for <strong>{email}</strong>
            </p>
          </div>

          {/* Token display (for demo purposes) */}
          {resetToken && (
            <div
              style={{
                background: "var(--color-gray-50)",
                border: "1px solid var(--color-gray-200)",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <p className="text-small text-muted" style={{ marginBottom: "0.5rem" }}>
                Your reset token (copy this):
              </p>
              <code
                style={{
                  display: "block",
                  padding: "0.75rem",
                  background: "var(--color-white)",
                  border: "1px solid var(--color-gray-200)",
                  borderRadius: "4px",
                  fontSize: "0.8125rem",
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                }}
              >
                {resetToken}
              </code>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginBottom: "1rem" }}
            onClick={() => onGoReset(resetToken)}
          >
            Reset Password
          </button>

          <div className="auth-footer">
            Didn't receive the email?{" "}
            <button type="button" onClick={() => setSuccess(false)}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <BriefcaseIcon />
            <span>Job Tracker</span>
          </div>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Token"}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <button
            type="button"
            onClick={onGoLogin}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
