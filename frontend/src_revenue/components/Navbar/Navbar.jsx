import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import annaLogo from "../../assets/anna_univ_logo.png";
import csrcLogo from "../../assets/csrc_logo.png";

/* =======================
   COLOR TOKENS
   (kept identical across Layout / Navbar / Sidebar / Dashboard
   so the module reads as one surface)
======================= */
const COLORS = {
  primary: '#2563eb',       // vivid blue
  primaryDark: '#1d4ed8',
  primaryLight: '#60a5fa',
  sky: '#0ea5e9',            // sky blue
  skyLight: '#7dd3fc',
  orange: '#f97316',         // bright orange
  orangeLight: '#fb923c',
  amber: '#f59e0b',
  pink: '#ec4899',
  purple: '#8b5cf6',
  glass: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(37,99,235,0.14)',
  textDark: '#1e293b',
  textMuted: '#64748b',
  danger: '#dc2626',
  bg: '#ffffff',
};

const LogoutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Navbar({ title = 'Revenue Portal', subtitle = 'Centre for Sponsored Research & Consultancy' }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem('revenue_session');
      localStorage.removeItem('revenue_user');
    } catch (e) {
      /* no-op */
    }
    navigate('/revenue-login', { replace: true });
  };

  return (
    <header style={styles.navbar}>
      {/* ── Left slot: primary institution logo ── */}
      <div style={styles.logoSlot}>
        <img
          src={annaLogo}
          alt="Institution logo"
          style={styles.logoImg}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        <div style={styles.logoFallback}>LOGO</div>
      </div>

      {/* ── Center: title block ── */}
      <div style={styles.titleBlock}>
        <span style={styles.eyebrow}>CSRC · Anna University</span>
        <h1 style={styles.title}>{title}</h1>
        <span style={styles.subtitle}>{subtitle}</span>
      </div>

      {/* ── Right slot: secondary logo + logout ── */}
      <div style={styles.rightGroup}>
        <div style={styles.logoSlot}>
          <img
            src={csrcLogo}
            alt="Department logo"
            style={styles.logoImg}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          <div style={styles.logoFallback}>LOGO</div>
        </div>

        <button
          onClick={handleLogout}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
  ...styles.logoutBtn,
  background: hover ? COLORS.danger : 'rgba(220,38,38,0.08)',
  color: hover ? '#fff' : COLORS.danger,
  borderColor: hover ? COLORS.danger : 'rgba(220,38,38,0.25)',
  transform: hover ? 'translateY(-1px)' : 'translateY(0)',
  boxShadow: hover ? '0 6px 16px rgba(220,38,38,0.25)' : 'none',
}}
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 76,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    background: COLORS.glass,
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    borderBottom: `1px solid ${COLORS.glassBorder}`,
    boxShadow: '0 8px 24px -12px rgba(37,99,235,0.18)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  logoSlot: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(37,99,235,0.06)',
    border: `1px dashed ${COLORS.glassBorder}`,
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: 6,
  },
  logoFallback: {
    display: 'none',
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: COLORS.textMuted,
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    lineHeight: 1.15,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: COLORS.orange,
    marginBottom: 2,
  },
  title: {
    margin: 0,
    fontSize: 21,
    fontWeight: 700,
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.sky})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: "'Sora', 'Inter', sans-serif",
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 16px',
    borderRadius: 10,
    border: '1px solid',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    fontFamily: "'Inter', sans-serif",
  },
};