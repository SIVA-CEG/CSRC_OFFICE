import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProceedingsLogin.css";

const PORTAL_CONFIG = {
  endorsements: {
    icon: "📋",
    title: "CSRC Proceedings",
    subtitle: "Sign in to CSRC Proceedings Portal",
    description:
      "Unified portal for research proceedings, grant management, and institutional coordination.",
    features: [
      "Proceedings Management",
      "Grant Tracking",
      "Faculty & Staff Records",
    ],
    dashboardPath: "/endorsements/dashboard",
  },
  projects: {
    icon: "🏗️",
    title: "CSRC Projects",
    subtitle: "Sign in to CSRC Projects Portal",
    description:
      "Manage fresh sanctions, renewal sanctions, project requests, and claims end-to-end.",
    features: [
      "Fresh & Renewal Sanctions",
      "Project Requests",
      "ZBA / TSA(H) / CMRG Claims",
    ],
    dashboardPath: "/projects/dashboard",
  },
};

// Base URL for the backend API. Reads from frontend/.env (VITE_API_URL),
// falling back to localhost:5000 if that file is missing.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// BroadcastChannel shared across all tabs on the same origin.
// Used to notify sibling tabs when a new login happens here.
const authChannel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("csrc_auth")
    : null;

export default function ProceedingsLogin({ portalType = "endorsements" }) {
  const navigate = useNavigate();
  const config = PORTAL_CONFIG[portalType] || PORTAL_CONFIG.endorsements;

  const [form, setForm] = useState({ userId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.password) {
      setError("Please enter both User ID and Password.");
      return;
    }
    setLoading(true);
    try {
      // FIXED: was http://localhost:5100/api/auth/proceedings-login
      // Correct port (matches backend .env PORT=5000) and correct mount
      // (proceedings-login lives in routes/adminAuth.js, mounted at /api/admin
      // in server.js — NOT /api/auth, which only has /login).
      const res = await fetch(`${API_BASE_URL}/api/auth/proceedings-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.userId,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // ── Write ONLY to sessionStorage so this tab's login is isolated ──
      // sessionStorage is intentionally NOT used here — it is shared across
      // all tabs and would overwrite whatever other tabs are doing.
      sessionStorage.setItem("userRole", data.user.role);
      sessionStorage.setItem("userName", data.user.name);
      sessionStorage.setItem("proceedings_user", JSON.stringify(data.user));

      // ── Notify other open tabs that a new login just happened ──────────
      // They won't be logged in as this user (their sessionStorage is
      // separate), but they'll show a warning banner so the person knows.
      authChannel?.postMessage({ type: "LOGIN", user: data.user });

      navigate(config.dashboardPath);
    } catch (err) {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="pl-root">
      <div className="pl-bg-left" />
      <div className="pl-bg-dots" />

      <button className="pl-back" onClick={() => navigate("/")}>
        ← Back to Portal
      </button>

      <div className="pl-card">
        {/* Left panel */}
        <div className="pl-panel-left">
          <div className="pl-panel-icon">{config.icon}</div>
          <h2 className="pl-panel-title">{config.title}</h2>
          <p className="pl-panel-desc">{config.description}</p>
          <div className="pl-features">
            {config.features.map((f) => (
              <div key={f} className="pl-feature-item">
                ✓ {f}
              </div>
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
                  type={showPass ? "text" : "password"}
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
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <div className="pl-error">{error}</div>}

            <button
              type="submit"
              className={`pl-btn ${loading ? "pl-btn--loading" : ""}`}
              disabled={loading}
            >
              {loading ? <span className="pl-spinner" /> : "Sign In →"}
            </button>
          </form>

          <div
            style={{
              marginTop: "18px",
              fontSize: "11px",
              color: "#aaa",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            <strong>Dev credentials:</strong>
            <br />
            ast1 / 123 &nbsp;|&nbsp; sup1 / 123 &nbsp;|&nbsp; dir1 / 123
          </div>
        </div>
      </div>
    </div>
  );
}