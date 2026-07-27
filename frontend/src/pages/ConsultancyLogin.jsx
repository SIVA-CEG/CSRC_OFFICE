// PATH: frontend/src/pages/ConsultancyLogin.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// CSRC Consultancies has the same four-tier hierarchy as Revenue:
// assistant → superintendent → deputy director → director
const MOCK_DB = [
  { userId: 'ast1', password: '123', role: 'assistant',       name: 'Mr. R. Senthilkumar' },
  { userId: 'sup1', password: '123', role: 'superintendent',  name: 'Mr. T. Anbarasan' },
  { userId: 'dd1',  password: '123', role: 'deputy_director', name: 'Dr. M. Kalaiselvi' },
  { userId: 'dir1', password: '123', role: 'director',        name: 'Dr. S. Balasivanandha Prabu' },
];

const CONFIG = {
  icon: '🌐',
  title: 'CSRC Consultancies',
  subtitle: 'Sign in to CSRC Consultancies Office Portal',
  description: 'Review and approve acceptance forms, invoices, permissions, and sanction proceedings submitted by faculty.',
  features: ['Acceptance Form Review', 'Invoice & Permission Approvals', 'Assistant → Superintendent → DD → Director'],
  dashboardPath: '/consultancy-office',
};

/* ---------------------------------------------------------------------- */
/*  Self-contained CSS — no external stylesheet dependency. Everything is  */
/*  scoped under .cl-root so it can't leak into / clash with other        */
/*  modules' styles.                                                      */
/* ---------------------------------------------------------------------- */
const CSS = `
.cl-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #f4f7fb;
  font-family: 'DM Sans', 'Sora', sans-serif;
}

.cl-bg-left {
  position: absolute;
  top: -20%;
  left: -15%;
  width: 60%;
  height: 140%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124,31,63,0.10) 0%, transparent 70%);
  pointer-events: none;
}

.cl-bg-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(30,41,59,0.06) 1px, transparent 1px);
  background-size: 26px 26px;
  pointer-events: none;
}

.cl-back {
  position: absolute;
  top: 24px;
  left: 28px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  background: rgba(255,255,255,0.8);
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 9px 16px;
  cursor: pointer;
  z-index: 2;
  transition: all 0.15s ease;
}
.cl-back:hover {
  background: #ffffff;
  border-color: #cbd5e1;
}

.cl-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 880px;
  max-width: 94vw;
  min-height: 520px;
  background: #ffffff;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 30px 70px rgba(15,23,42,0.14);
  border: 1px solid #eef0f3;
}

/* ---- left info panel ---- */
.cl-panel-left {
  flex: 0 0 46%;
  background: linear-gradient(150deg, #7c1f3f 0%, #b91c4c 100%);
  color: #fff;
  padding: 46px 38px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.cl-panel-icon {
  font-size: 40px;
  margin-bottom: 18px;
}
.cl-panel-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px;
  letter-spacing: -0.3px;
}
.cl-panel-desc {
  font-size: 13.5px;
  line-height: 1.6;
  color: rgba(255,255,255,0.88);
  margin: 0 0 26px;
}
.cl-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cl-feature-item {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.95);
  background: rgba(255,255,255,0.12);
  border-radius: 9px;
  padding: 9px 13px;
}

/* ---- right form panel ---- */
.cl-panel-right {
  flex: 1;
  padding: 46px 42px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.cl-form-header { margin-bottom: 26px; }
.cl-form-title {
  font-size: 25px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
  letter-spacing: -0.4px;
}
.cl-form-sub {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.cl-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.cl-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.cl-field label {
  font-size: 11.5px;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cl-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0 12px;
  transition: border-color 0.15s ease;
}
.cl-input-wrap:focus-within {
  border-color: #b91c4c;
}
.cl-input-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.cl-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: 13.5px;
  color: #111827;
  font-family: inherit;
}
.cl-toggle-pass {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  flex-shrink: 0;
}

.cl-error {
  font-size: 12.5px;
  font-weight: 600;
  color: #dc2626;
  background: rgba(220,38,38,0.08);
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: 9px;
  padding: 9px 12px;
}

.cl-btn {
  margin-top: 4px;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #7c1f3f, #b91c4c);
  color: #fff;
  font-family: inherit;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(124,31,63,0.28);
  transition: opacity 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
}
.cl-btn:hover { opacity: 0.9; }
.cl-btn--loading { cursor: wait; opacity: 0.85; }

.cl-spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cl-spin 0.7s linear infinite;
}
@keyframes cl-spin {
  to { transform: rotate(360deg); }
}

.cl-dev-hint {
  margin-top: 18px;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  line-height: 1.6;
}

@media (max-width: 760px) {
  .cl-card { flex-direction: column; width: 92vw; }
  .cl-panel-left { flex: none; padding: 34px 28px; }
  .cl-panel-right { padding: 34px 28px; }
}
`;

export default function ConsultancyLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ userId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

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
      const user = MOCK_DB.find(u => u.userId === form.userId && u.password === form.password);
      if (user) {
        sessionStorage.setItem('consultancyUserRole', user.role);
        sessionStorage.setItem('consultancyUserName', user.name);
        navigate(CONFIG.dashboardPath);
      } else {
        setLoading(false);
        setError('Invalid User ID or Password.');
      }
    }, 1200);
  };

  return (
    <div className="cl-root">
      <style>{CSS}</style>

      <div className="cl-bg-left" />
      <div className="cl-bg-dots" />

      <button className="cl-back" onClick={() => navigate('/')}>← Back to Portal</button>

      <div className="cl-card">
        <div className="cl-panel-left">
          <div className="cl-panel-icon">{CONFIG.icon}</div>
          <h2 className="cl-panel-title">{CONFIG.title}</h2>
          <p className="cl-panel-desc">{CONFIG.description}</p>
          <div className="cl-features">
            {CONFIG.features.map(f => <div key={f} className="cl-feature-item">✓ {f}</div>)}
          </div>
        </div>

        <div className="cl-panel-right">
          <div className="cl-form-header">
            <h1 className="cl-form-title">Welcome Back</h1>
            <p className="cl-form-sub">{CONFIG.subtitle}</p>
          </div>

          <form className="cl-form" onSubmit={handleSubmit} noValidate>
            <div className="cl-field">
              <label htmlFor="userId">User ID</label>
              <div className="cl-input-wrap">
                <span className="cl-input-icon">👤</span>
                <input id="userId" name="userId" type="text" placeholder="Enter your User ID"
                  value={form.userId} onChange={handleChange} />
              </div>
            </div>

            <div className="cl-field">
              <label htmlFor="password">Password</label>
              <div className="cl-input-wrap">
                <span className="cl-input-icon">🔒</span>
                <input id="password" name="password" type={showPass ? 'text' : 'password'}
                  placeholder="Enter your Password" value={form.password} onChange={handleChange} />
                <button type="button" className="cl-toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="cl-error">{error}</div>}

            <button type="submit" className={`cl-btn ${loading ? 'cl-btn--loading' : ''}`} disabled={loading}>
              {loading ? <span className="cl-spinner" /> : 'Sign In →'}
            </button>
          </form>

          <div className="cl-dev-hint">
            <strong>Dev credentials:</strong><br />
            ast1 / 123 &nbsp;|&nbsp; sup1 / 123 &nbsp;|&nbsp; dd1 / 123 &nbsp;|&nbsp; dir1 / 123
          </div>
        </div>
      </div>
    </div>
  );
}