import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginHub.css';
import csrcLogo from '../assets/csrc-logo.png';

const modules = [
  {
    id: 'tapal',
    title: 'TAPAL LOGIN',
    icon: '📬',
    desc: 'Inward & Outward Tapal Management',
    route: '/tapal-login',
    wip: false,
    accent: '#2563eb',
    accentLight: '#3b82f6',
  },
  {
    id: 'proceedings',
    title: 'CSRC PROCEEDINGS',
    icon: '📋',
    desc: 'Proceedings & Research Management',
    route: '/proceedings-login',
    wip: false,
    accent: '#ea580c',
    accentLight: '#f97316',
  },
  {
    id: 'revenue',
    title: 'CSRC REVENUE',
    icon: '💰',
    desc: 'Revenue Receipts & Collection Management',
    route: '/revenue-login',
    wip: false,
    accent: '#15803d',
    accentLight: '#22c55e',
  },
  {
    id: 'consultancy',
    title: 'CSRC CONSULTANCIES',
    icon: '🌐',
    desc: 'Acceptance Forms, Invoices & Payment Approvals',
    route: '/consultancy-login',
    wip: false,
    accent: '#0ea5e9',
    accentLight: '#38bdf8',
  },
  {
    id: 'accounts',
    title: 'ACCOUNTS LOGIN',
    icon: '🏦',
    desc: 'Financial & Accounts Management',
    route: '/accounts-login',
    wip: false,
    accent: '#7c1f7c',
    accentLight: '#a3339e',
  },
];

export default function LoginHub() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  const handleClick = (mod) => {
    if (mod.wip) return;
    navigate(mod.route);
  };

  const handleKeyDown = (e, mod) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(mod);
    }
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
            <img
              src={csrcLogo}
              alt="Anna University"
              className="hub-logo-image"
            />
          </div>
          <div className="hub-title-block">
            <h1 className="hub-title">CSRC OFFICE</h1>
            <p className="hub-subtitle">Center for Sponsored Research and Consultancies — Integrated Management Portal</p>
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
              style={{
                '--accent': mod.accent,
                '--accent-light': mod.accentLight,
                '--accent-glow': `${mod.accent}73`,
                '--accent-tint': `${mod.accent}1f`,
                '--accent-tint-strong': `${mod.accent}30`,
                '--accent-gradient': `linear-gradient(135deg, ${mod.accent}, ${mod.accentLight})`,
              }}
              onClick={() => handleClick(mod)}
              onMouseEnter={() => setHoveredId(mod.id)}
              onMouseLeave={() => setHoveredId(null)}
              role={mod.wip ? undefined : 'button'}
              tabIndex={mod.wip ? undefined : 0}
              onKeyDown={(e) => handleKeyDown(e, mod)}
            >
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