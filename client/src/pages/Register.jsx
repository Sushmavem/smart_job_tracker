// client/src/pages/Register.jsx

import React, { useState } from "react";
import { register } from "../api/authApi";

const Register = ({ onSuccess, onGoLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // FRONTEND VALIDATION
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password.length > 72) {
      setError("Password must be less than 72 characters.");
      return;
    }

    try {
      const res = await register(email, password);
      onSuccess(res.access_token); // Auto-login on success
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="auth-card">
      <h2>Register</h2>

      <form onSubmit={handleSubmit} autoComplete="off">

        <input
          placeholder="Email"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          required
        />

        <input
          placeholder="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account?{" "}
        <button type="button" onClick={onGoLogin} className="link-btn">
          Login
        </button>
      </p>
    </div>
  );
};

export default Register;
