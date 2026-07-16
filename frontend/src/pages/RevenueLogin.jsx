import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProceedingsLogin.css'; // reusing the same visual system — swap to './RevenueLogin.css' later if you want a distinct look

// ── Mock DB ───────────────────────────────────────────────────────────────────
// CSRC Revenue has a four-tier hierarchy (one level more than Proceedings/Projects):
// assistant → superintendent → deputy director → director
const MOCK_DB = [
  { userId: 'ast1', password: '123', role: 'assistant',        name: 'Mr. R. Senthilkumar' },
  { userId: 'sup1', password: '123', role: 'superintendent',   name: 'Mr. T. Anbarasan' },
  { userId: 'dd1',  password: '123', role: 'deputy_director',  name: 'Dr. M. Kalaiselvi' },
  { userId: 'dir1', password: '123', role: 'director',         name: 'Dr. S. Balasivanandha Prabu' },
];

const CONFIG = {
  icon: '💰',
  title: 'CSRC Revenue',
  subtitle: 'Sign in to CSRC Revenue Portal',
  description: 'Manage revenue receipts, collections, and financial inflows across sponsored projects.',
  features: ['Revenue Receipts', 'Collection Tracking', 'Assistant Direct Entry · Full Visibility for Reviewers'],
  dashboardPath: '/revenue',
};

export default function RevenueLogin() {
  const navigate = useNavigate();

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
        // sessionStorage: role/name only persist for this tab's session,
        // matching staffWorkflow.js's storage backend.
        sessionStorage.setItem('userRole', user.role);
        sessionStorage.setItem('userName', user.name);
        navigate(CONFIG.dashboardPath);
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
          <div className="pl-panel-icon">{CONFIG.icon}</div>
          <h2 className="pl-panel-title">{CONFIG.title}</h2>
          <p className="pl-panel-desc">{CONFIG.description}</p>
          <div className="pl-features">
            {CONFIG.features.map(f => (
              <div key={f} className="pl-feature-item">✓ {f}</div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="pl-panel-right">
          <div className="pl-form-header">
            <h1 className="pl-form-title">Welcome Back</h1>
            <p className="pl-form-sub">{CONFIG.subtitle}</p>
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
            ast1 / 123 &nbsp;|&nbsp; sup1 / 123 &nbsp;|&nbsp; dd1 / 123 &nbsp;|&nbsp; dir1 / 123
          </div>
        </div>
      </div>
    </div>
  );
}