// client/src/App.jsx
/**
 * Job Tracker - Main Application Component
 * Handles routing, authentication state, and layout
 */
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";

function App() {
  const [page, setPage] = useState("login");
  const [currentView, setCurrentView] = useState("dashboard");
  const [isAuthed, setIsAuthed] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const email = localStorage.getItem("user_email");
    if (token) {
      setIsAuthed(true);
      setUserEmail(email || "");
    }
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = (token, email) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_email", email);
    setIsAuthed(true);
    setUserEmail(email);
    setPage("dashboard");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    setIsAuthed(false);
    setUserEmail("");
    setPage("login");
  };

  // Handle going to reset password page with token
  const handleGoReset = (token = "") => {
    setResetToken(token);
    setPage("reset-password");
  };

  // Render auth pages (login/register/forgot-password/reset-password)
  if (!isAuthed) {
    return (
      <div className="app">
        {page === "login" && (
          <Login
            onSuccess={handleAuthSuccess}
            onGoRegister={() => setPage("register")}
            onGoForgotPassword={() => setPage("forgot-password")}
          />
        )}
        {page === "register" && (
          <Register
            onSuccess={handleAuthSuccess}
            onGoLogin={() => setPage("login")}
          />
        )}
        {page === "forgot-password" && (
          <ForgotPassword
            onGoLogin={() => setPage("login")}
            onGoReset={handleGoReset}
          />
        )}
        {page === "reset-password" && (
          <ResetPassword
            initialToken={resetToken}
            onGoLogin={() => setPage("login")}
          />
        )}
      </div>
    );
  }

  // Render main application with sidebar
  return (
    <div className="app-layout">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
        userEmail={userEmail}
      />
      <main className="main-content">
        <Dashboard currentView={currentView} onNavigate={setCurrentView} />
      </main>
    </div>
  );
}

export default App;
