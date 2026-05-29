import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProceedingsLogin.css';

export default function ProceedingsLogin() {
  const navigate = useNavigate();
  // Added "role" to the form state
  const [form, setForm] = useState({ userId: '', password: '', role: 'assistant' });
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
      setLoading(false);
      // Save the selected role to localStorage so other pages can adapt their logic
      localStorage.setItem('userRole', form.role);
      navigate('/endorsements/dashboard'); // Redirecting straight to the dashboard
    }, 1400);
  };

  return (
    <div className="pl-root">
      <div className="pl-bg-left" />
      <div className="pl-bg-dots" />

      {/* Back button */}
      <button className="pl-back" onClick={() => navigate('/')}>
        ← Back to Portal
      </button>

      <div className="pl-card">
        {/* Left panel */}
        <div className="pl-panel-left">
          <div className="pl-panel-icon">📋</div>
          <h2 className="pl-panel-title">CSRC Proceedings</h2>
          <p className="pl-panel-desc">
            Unified portal for research proceedings, grant management, and institutional coordination.
          </p>
          <div className="pl-features">
            <div className="pl-feature-item">✓ Proceedings Management</div>
            <div className="pl-feature-item">✓ Grant Tracking</div>
            <div className="pl-feature-item">✓ Faculty & Staff Records</div>
            <div className="pl-feature-item">✓ DST INSPIRE Integration</div>
          </div>
          <div className="pl-panel-footer">CSRC Office — Secure Access</div>
        </div>

        {/* Right panel */}
        <div className="pl-panel-right">
          <div className="pl-form-header">
            <div className="pl-form-logo">🎓</div>
            <h1 className="pl-form-title">Welcome Back</h1>
            <p className="pl-form-sub">Sign in to CSRC Proceedings Portal</p>
          </div>

          <form className="pl-form" onSubmit={handleSubmit} noValidate>
            
            {/* NEW: Role Selection */}
            <div className="pl-field">
              <label htmlFor="role">Login As</label>
              <div className="pl-input-wrap">
                <span className="pl-input-icon">🏢</span>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="pl-select"
                >
                  <option value="assistant">Assistant</option>
                  <option value="superintendent">Superintendent</option>
                  <option value="director">Director</option>
                </select>
              </div>
            </div>

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
                  autoComplete="username"
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
                  autoComplete="current-password"
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

            <div className="pl-forgot">
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className={`pl-btn ${loading ? 'pl-btn--loading' : ''}`} disabled={loading}>
              {loading ? (
                <span className="pl-spinner" />
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <p className="pl-secure-note">🔐 This is a secure government portal. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}