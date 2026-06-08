import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TapalLogin.css';

export default function TapalLogin() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/tapal/home');
  };

  return (
    <div className="tapal-login-root">

      {/* Ambient blobs */}
      <div className="tapal-blob tapal-blob-1" />
      <div className="tapal-blob tapal-blob-2" />

      {/* Stamp corner decorations */}
      <div className="tapal-stamp-corner tl" />
      <div className="tapal-stamp-corner tr" />
      <div className="tapal-stamp-corner bl" />
      <div className="tapal-stamp-corner br" />

      <div className="tapal-login-card">

        {/* Header */}
        <div className="tapal-login-header">
          <div className="tapal-login-icon-wrap">
            <span className="tapal-login-icon">📬</span>
          </div>
          <h1 className="tapal-login-title">Tapal Portal</h1>
          <p className="tapal-login-subtitle">CSRC — Inward &amp; Outward Correspondence</p>
        </div>

        {/* Divider */}
        <div className="tapal-login-divider">
          <span>Secure Sign In</span>
        </div>

        {/* Form */}
        <form className="tapal-login-form" onSubmit={handleLogin}>
          <div className="tapal-field">
            <label>Username</label>
            <div className="tapal-input-wrap">
              <span className="tapal-input-icon">👤</span>
              <input type="text" placeholder="Enter your username" required />
            </div>
          </div>

          <div className="tapal-field">
            <label>Password</label>
            <div className="tapal-input-wrap">
              <span className="tapal-input-icon">🔒</span>
              <input type="password" placeholder="Enter your password" required />
            </div>
          </div>

          <button type="submit" className="tapal-login-btn">
            Enter Portal →
          </button>
        </form>

        {/* Back */}
        <button className="tapal-login-back" onClick={() => navigate('/')}>
          <span>←</span> Back to Hub
        </button>

        <p className="tapal-login-footer">
          © {new Date().getFullYear()} CSRC Office · Anna University, Chennai
        </p>

      </div>
    </div>
  );
}