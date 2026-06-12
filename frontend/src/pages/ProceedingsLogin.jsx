import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProceedingsLogin.css';

// ── Mock DB ───────────────────────────────────────────────────────────────────
// Same credentials work for both Endorsements and Projects portals.
// The portal the user came from is tracked via `portalType` state.
const MOCK_DB = [
  { userId: 'ast1', password: '123', role: 'assistant',     name: 'Mr. R. Senthilkumar' },
  { userId: 'sup1', password: '123', role: 'superintendent', name: 'Mr. T. Anbarasan' },
  { userId: 'dir1', password: '123', role: 'director',      name: 'Dr. S. Balasivanandha Prabu' },
];

// Portal config — easily extendable
const PORTAL_CONFIG = {
  endorsements: {
    icon: '📋',
    title: 'CSRC Proceedings',
    subtitle: 'Sign in to CSRC Proceedings Portal',
    description: 'Unified portal for research proceedings, grant management, and institutional coordination.',
    features: ['Proceedings Management', 'Grant Tracking', 'Faculty & Staff Records'],
    dashboardPath: '/endorsements/dashboard',
  },
  projects: {
    icon: '🏗️',
    title: 'CSRC Projects',
    subtitle: 'Sign in to CSRC Projects Portal',
    description: 'Manage fresh sanctions, renewal sanctions, project requests, and claims end-to-end.',
    features: ['Fresh & Renewal Sanctions', 'Project Requests', 'ZBA / TSA(H) / CMRG Claims'],
    dashboardPath: '/projects/dashboard',
  },
};

export default function ProceedingsLogin({ portalType = 'endorsements' }) {
  const navigate = useNavigate();
  const config   = PORTAL_CONFIG[portalType] || PORTAL_CONFIG.endorsements;

  const [form,     setForm]     = useState({ userId: '', password: '' });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.userId || !form.password) {
      setError('Please enter both User ID and Password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const user = MOCK_DB.find(
        u => u.userId === form.userId && u.password === form.password
      );
      if (user) {
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        navigate(config.dashboardPath);
      } else {
        setLoading(false);
        setError('Invalid User ID or Password.');
      }
    }, 1400);
  };

  return (
    <div className="pl-root">
      <div className="pl-bg-left" />
      <div className="pl-bg-dots" />

      <button className="pl-back" onClick={() => navigate('/')}>
        ← Back to Portal
      </button>

      <div className="pl-card">
        {/* Left panel */}
        <div className="pl-panel-left">
          <div className="pl-panel-icon">{config.icon}</div>
          <h2 className="pl-panel-title">{config.title}</h2>
          <p className="pl-panel-desc">{config.description}</p>
          <div className="pl-features">
            {config.features.map(f => (
              <div key={f} className="pl-feature-item">✓ {f}</div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="pl-panel-right">
          <div className="pl-form-header">
            <h1 className="pl-form-title">Welcome Back</h1>
            <p className="pl-form-sub">{config.subtitle}</p>
          </div>

          <form className="pl-form" onSubmit={handleSubmit} noValidate>
            <div className="pl-field">
              <label htmlFor="userId">User ID</label>
              <div className="pl-input-wrap">
                <span className="pl-input-icon">👤</span>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  placeholder="Enter your User ID"
                  value={form.userId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pl-field">
              <label htmlFor="password">Password</label>
              <div className="pl-input-wrap">
                <span className="pl-input-icon">🔒</span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="pl-toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="pl-error">{error}</div>}

            <button
              type="submit"
              className={`pl-btn ${loading ? 'pl-btn--loading' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="pl-spinner" /> : 'Sign In →'}
            </button>
          </form>

          {/* Quick-login hint for dev */}
          <div style={{
            marginTop: '18px', fontSize: '11px', color: '#aaa',
            textAlign: 'center', lineHeight: 1.6,
          }}>
            <strong>Dev credentials:</strong><br />
            ast1 / 123 &nbsp;|&nbsp; sup1 / 123 &nbsp;|&nbsp; dir1 / 123
          </div>
        </div>
      </div>
    </div>
  );
}