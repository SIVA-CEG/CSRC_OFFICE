import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectDashboard.css';

const projectModules = [
  { label: 'Fresh Sanctions', icon: '✨', path: 'fresh-sanction' },
  { label: 'Renewal Sanctions', icon: '🔄', path: 'renewal-sanction' },
  { label: 'CSRC Proceedings', icon: '📜', path: 'proceedings' },
  { label: 'Project Requests', icon: '📩', path: 'requests' },
  { label: 'Payment Claims', icon: '💳', path: 'payment-claims' },
  { label: 'ZBA Claim Requests', icon: '🏦', path: 'zba-claims' },
  { label: 'TSA(H) Claim Requests', icon: '🏥', path: 'tsa-claims' },
  { label: 'CMRG Claim Requests', icon: '📊', path: 'cmrg-claims' },
  { label: 'Search', icon: '🔍', path: 'search' },
  { label: 'Reports', icon: '📑', path: 'reports' },
];

export default function ProjectDashboard() {
  const navigate = useNavigate();

  return (
    <div className="project-dashboard">
      <header className="project-header">
        <h1>Projects Dashboard</h1>
        <p>Manage and track all project-related sanctions and claims.</p>
      </header>
      
      <div className="project-grid">
        {projectModules.map((item) => (
          <div 
            key={item.path} 
            className="project-card"
            onClick={() => navigate(`/projects/${item.path}`)}
          >
            <div className="card-icon">{item.icon}</div>
            <h3>{item.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}