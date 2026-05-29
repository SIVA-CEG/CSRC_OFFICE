import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
          <span className="navbar-logo-icon">🎓</span>
          <div>
            <span className="navbar-brand">CSRC Office</span>
            <span className="navbar-module">Proceedings Portal</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-breadcrumb">
          {location.pathname.split('/').filter(Boolean).map((seg, i, arr) => (
            <span key={i}>
              <span className={i === arr.length - 1 ? 'bc-active' : 'bc-link'}
                onClick={() => i < arr.length - 1 && navigate('/' + arr.slice(0, i + 1).join('/'))}>
                {seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
              {i < arr.length - 1 && <span className="bc-sep"> / </span>}
            </span>
          ))}
        </div>

        <div className="navbar-user" onClick={() => setDropOpen(!dropOpen)}>
          <div className="navbar-avatar">A</div>
          <span className="navbar-username">Admin</span>
          <span className="navbar-chevron">{dropOpen ? '▲' : '▼'}</span>
          {dropOpen && (
            <div className="navbar-dropdown">
              <div className="drop-item">👤 My Profile</div>
              <div className="drop-item">⚙️ Settings</div>
              <div className="drop-divider" />
              <div className="drop-item drop-logout" onClick={handleLogout}>🚪 Logout</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}