// client/src/pages/Login.jsx
import React, { useState } from "react";
import { login } from "../api/authApi";

const Login = ({ onSuccess, onGoRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);
      onSuccess(res.access_token);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        No account?{" "}
        <button type="button" onClick={onGoRegister} className="link-btn">
          Register
        </button>
      </p>
    </div>
  );
};

export default Login;
