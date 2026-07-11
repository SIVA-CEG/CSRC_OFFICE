import React from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#146c43',
  primaryDark: '#0d4f31',
  primaryLight: '#2f9e6b',
  accent: '#c8973a',
  glass: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(20,108,67,0.14)',
  textDark: '#122922',
  textMuted: '#5d7a6f',
};

const BackArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const ConstructionIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20" />
    <path d="M5 20V10l7-6 7 6v10" />
    <path d="M9 20v-6h6v6" />
    <path d="M3 10l9-6 9 6" />
  </svg>
);

export default function UnderConstruction({ module = 'This module' }) {
  const navigate = useNavigate();

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.iconRing}>
          <ConstructionIcon />
        </div>

        <span style={styles.eyebrow}>In Progress</span>
        <h2 style={styles.title}>{module}</h2>
        <p style={styles.desc}>
          This section is currently being built. Check back soon — it will
          be available here once it's ready.
        </p>

        <div style={styles.progressTrack}>
          <div style={styles.progressFill} />
        </div>

        <button
          onClick={() => navigate('/revenue')}
          style={styles.backBtn}
        >
          <BackArrow />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 76px - 80px)',
    padding: '40px 20px',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    textAlign: 'center',
    background: COLORS.glass,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: `1px solid ${COLORS.glassBorder}`,
    borderRadius: 20,
    padding: '40px 32px 32px',
    boxShadow: '0 20px 44px -20px rgba(20,108,67,0.28)',
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: '50%',
    margin: '0 auto 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, rgba(20,108,67,0.10), rgba(200,151,58,0.14))`,
    color: COLORS.primary,
    border: `1px solid ${COLORS.glassBorder}`,
  },
  eyebrow: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: COLORS.accent,
    marginBottom: 8,
  },
  title: {
    margin: '0 0 10px',
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.textDark,
    fontFamily: "'Sora', 'Inter', sans-serif",
  },
  desc: {
    margin: '0 0 24px',
    fontSize: 13.5,
    lineHeight: 1.6,
    color: COLORS.textMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 6,
    background: 'rgba(20,108,67,0.10)',
    overflow: 'hidden',
    marginBottom: 26,
  },
  progressFill: {
    width: '38%',
    height: '100%',
    borderRadius: 6,
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 10,
    border: `1px solid ${COLORS.glassBorder}`,
    background: 'rgba(20,108,67,0.06)',
    color: COLORS.primary,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.18s ease, transform 0.18s ease',
  },
};