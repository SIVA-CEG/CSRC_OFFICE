import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectDashboard.css';

const projectModules = [
  { label: 'Fresh Sanctions', icon: '✨', path: 'fresh-sanction' },
  { label: 'Renewal Sanctions', icon: '🔄', path: 'renewal-sanction' },
  { label: 'CSRC Proceedings', icon: '📜', path: 'proceedings' },

  // Project Requests (contains Reappropriation & Extension)
  { label: 'Project Requests', icon: '📩', path: 'project-requests' },

  { label: 'ZBA Claim Requests', icon: '🏦', path: 'zba-claims' },
  { label: 'TSA(H) Claim Requests', icon: '🏥', path: 'tsa-claims' },
  { label: 'CMRG Claim Requests', icon: '📊', path: 'cmrg-claims' },
  { label: 'Search', icon: '🔍', path: 'search' },
  { label: 'Reports', icon: '📑', path: 'reports' },
];

export default function ProjectDashboard() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(`/projects/${path}`);
  };

  return (
    <div className="project-dashboard">
      <header className="project-header">
        <h1>Projects Dashboard</h1>
        <p>
          Manage and track all project-related sanctions, requests,
          proceedings, and claims.
        </p>
      </header>

      <div className="project-grid">
        {projectModules.map((item) => (
          <div
            key={item.path}
            className="project-card"
            onClick={() => handleNavigation(item.path)}
          >
            <div className="card-icon">{item.icon}</div>
            <h3>{item.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}