// client/src/components/NavBar.jsx
import React from "react";

const NavBar = ({ onNavigate, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="logo">JobTracker</span>
      </div>
      <div className="nav-right">
        <button onClick={() => onNavigate("dashboard")}>Dashboard</button>
        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default NavBar;
