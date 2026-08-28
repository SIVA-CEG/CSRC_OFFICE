import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TapalLogin.css';

// Base URL for the backend API. Reads from frontend/.env (VITE_API_URL),
// falling back to localhost:5000 if that file is missing.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TapalLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      // Matches routes/adminAuth.js: POST /tapal-login, mounted at /api/admin
      // in server.js. Only succeeds for admin_users rows with role='tapal'.
      const res = await fetch(`${API_BASE_URL}/api/auth/tapal-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid username or password.');
        setLoading(false);
        return;
      }

      // Same sessionStorage pattern used by ProceedingsLogin, kept separate
      // under its own keys so a tapal login and a proceedings login can
      // coexist without overwriting each other in the same tab.
      sessionStorage.setItem('tapalUserRole', data.user.role);
      sessionStorage.setItem('tapalUserName', data.user.name);
      sessionStorage.setItem('tapal_user', JSON.stringify(data.user));

      navigate('/tapal/home');
    } catch (err) {
      setError('Server error. Please try again.');
      setLoading(false);
    }
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
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="tapal-field">
            <label>Password</label>
            <div className="tapal-input-wrap">
              <span className="tapal-input-icon">🔒</span>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && (
            <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '-6px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="tapal-login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Enter Portal →'}
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