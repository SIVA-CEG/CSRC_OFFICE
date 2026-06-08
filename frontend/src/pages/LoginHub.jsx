import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginHub.css';

const modules = [
  {
  id: 'tapal',
  title: 'TAPAL LOGIN',
  icon: '📬',
  desc: 'Inward & Outward Tapal Management',
  route: '/tapal-login',   // ← add this
  wip: false,              // ← change to false
},
  {
    id: 'salary',
    title: 'STAFF SALARY CLAIMS',
    icon: '💰',
    desc: 'Salary & Claims Processing Portal',
    route: null,
    wip: true,
  },
  {
    id: 'proceedings',
    title: 'CSRC PROCEEDINGS',
    icon: '📋',
    desc: 'Proceedings & Research Management',
    route: '/proceedings-login',
    wip: false,
  },
  {
    id: 'accounts',
    title: 'ACCOUNTS LOGIN',
    icon: '🏦',
    desc: 'Financial & Accounts Management',
    route: null,
    wip: true,
  },
];

export default function LoginHub() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  const handleClick = (mod) => {
    if (mod.wip) return;
    navigate(mod.route);
  };

  return (
    <div className="hub-root">
      {/* Decorative background shapes */}
      <div className="hub-bg-shape shape1" />
      <div className="hub-bg-shape shape2" />
      <div className="hub-bg-shape shape3" />

      <div className="hub-container">
        {/* Header */}
        <div className="hub-header">
          <div className="hub-logo-ring">
            <span className="hub-logo-icon">🎓</span>
          </div>
          <div className="hub-title-block">
            <h1 className="hub-title">CSRC OFFICE</h1>
            <p className="hub-subtitle">Central Scientific Research Council — Integrated Management Portal</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hub-divider">
          <span>Select Your Portal</span>
        </div>

        {/* Cards Grid */}
        <div className="hub-cards">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`hub-card ${mod.wip ? 'hub-card--wip' : 'hub-card--active'} ${hoveredId === mod.id ? 'hub-card--hovered' : ''}`}
              onClick={() => handleClick(mod)}
              onMouseEnter={() => setHoveredId(mod.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="hub-card-glow" />
              <div className="hub-card-icon">{mod.icon}</div>
              <h3 className="hub-card-title">{mod.title}</h3>
              <p className="hub-card-desc">{mod.desc}</p>
              {mod.wip ? (
                <div className="hub-card-badge wip-badge">🚧 Under Construction</div>
              ) : (
                <div className="hub-card-badge active-badge">
                  <span>Enter Portal</span>
                  <span className="arrow">→</span>
                </div>
              )}
              <div className="hub-card-strip" />
            </div>
          ))}
        </div>

        <p className="hub-footer">
          © {new Date().getFullYear()} CSRC Office. All rights reserved. &nbsp;|&nbsp; Secure Government Portal
        </p>
      </div>
    </div>
  );
}