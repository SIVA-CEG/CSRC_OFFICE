import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/tapal", label: "Tapal Home", icon: "🏠" },
  { path: "/tapal/projects", label: "Projects", icon: "🗂️" },
  { path: "/tapal/projects/endorsement", label: "Endorsement Tapals", icon: "📋", indent: true },
  { path: "/tapal/projects/sanction", label: "Sanction Tapals", icon: "✅", indent: true },
  { path: "/tapal/projects/bills", label: "Bills", icon: "🧾", indent: true },
  { path: "/tapal/projects/requests", label: "Request Tapals", icon: "📨", indent: true },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">C</div>
        <div>
          <h2>CSRC</h2>
          <p>Tapal System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Tapal Management</div>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item${isActive(item.path) ? " active" : ""}`}
              style={item.indent ? { paddingLeft: 28, fontSize: 14.5 } : {}}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <p>Total Tapals</p>
        <strong>0</strong>
      </div>
    </aside>
  );
}