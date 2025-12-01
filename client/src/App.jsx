// client/src/App.jsx
import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NavBar from "./components/NavBar";

function App() {
  const [page, setPage] = useState("login");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) setIsAuthed(true);
  }, []);

  const handleAuthSuccess = (token) => {
    localStorage.setItem("access_token", token);
    setIsAuthed(true);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthed(false);
    setPage("login");
  };

  return (
    <div className="app">
      {isAuthed && <NavBar onNavigate={setPage} onLogout={handleLogout} />}
      <main className="container">
        {!isAuthed && page === "login" && (
          <Login onSuccess={handleAuthSuccess} onGoRegister={() => setPage("register")} />
        )}
        {!isAuthed && page === "register" && (
          <Register onSuccess={handleAuthSuccess} onGoLogin={() => setPage("login")} />
        )}
        {isAuthed && <Dashboard />}
      </main>
    </div>
  );
}

export default App;
