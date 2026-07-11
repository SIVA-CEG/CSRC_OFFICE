import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#60a5fa',
  sky: '#0ea5e9',
  skyLight: '#7dd3fc',
  orange: '#f97316',
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

/* ── Monoline icons (kept self-contained, no external icon lib) ── */
const Icon = {
  Staff: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Salary: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /><circle cx="12" cy="14.5" r="2" />
    </svg>
  ),
  OT: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
    </svg>
  ),
  Pdf: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Overhead: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Expenditure: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  Arrow: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

const CARDS = [
  { key: '01', title: 'Staff Details', desc: 'Employee records, roles and profile information.', path: '/revenue/staff', icon: Icon.Staff, color: COLORS.primary },
  { key: '02', title: 'Staff Salary', desc: 'Monthly salary computation and disbursement.', path: '/revenue/staff-salary', icon: Icon.Salary, color: COLORS.orange },
  { key: '03', title: 'Staff OT', desc: 'Overtime hours logging and payout tracking.', path: '/revenue/staff-ot', icon: Icon.OT, color: COLORS.sky },
  { key: '04', title: 'PDF', desc: 'Generate and archive printable statements.', path: '/revenue/pdf', icon: Icon.Pdf, color: COLORS.pink },
  { key: '05', title: 'Department Overhead', desc: 'Overhead allocation across departments.', path: '/revenue/department-overhead', icon: Icon.Overhead, color: COLORS.purple },
  { key: '06', title: 'CSRC Expenditure', desc: 'Consolidated expenditure summary for CSRC.', path: '/revenue/csrc-expenditure', icon: Icon.Expenditure, color: COLORS.amber },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <div>
      <div style={styles.header}>
        <span style={styles.eyebrow}>Overview</span>
        <h2 style={styles.heading}>Revenue Dashboard</h2>
        <p style={styles.lede}>Select a module to continue.</p>
      </div>

      <div style={styles.grid}>
        {CARDS.map(({ key, title, desc, path, icon: CardIcon, color }) => {
          const isHovered = hoveredKey === key;
          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => navigate(path)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(path)}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              style={{
                ...styles.card,
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHovered
                  ? `0 20px 40px -16px ${color}55`
                  : '0 8px 20px -14px rgba(30,41,59,0.12)',
                borderColor: isHovered ? `${color}55` : COLORS.glassBorder,
              }}
            >
              <div style={styles.cardTop}>
                <span style={styles.cardIndex}>{key}</span>
                <div
                  style={{
                    ...styles.iconBox,
                    background: isHovered ? color : `${color}18`,
                    color: isHovered ? '#fff' : color,
                  }}
                >
                  <CardIcon />
                </div>
              </div>

              <h3 style={styles.cardTitle}>{title}</h3>
              <p style={styles.cardDesc}>{desc}</p>

              <div style={{ ...styles.cardCta, color: isHovered ? color : COLORS.textMuted }}>
                <span>Open module</span>
                <span
                  style={{
                    display: 'inline-flex',
                    transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                    transition: 'transform 0.18s ease',
                  }}
                >
                  <Icon.Arrow />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: COLORS.orange,
  },
  heading: {
    margin: '6px 0 4px',
    fontSize: 28,
    fontWeight: 700,
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.sky})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: "'Sora', 'Inter', sans-serif",
  },
  lede: {
    margin: 0,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#ffffff',
    border: '1px solid',
    borderRadius: 16,
    padding: '22px 22px 20px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    outline: 'none',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardIndex: {
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(30,41,59,0.3)',
    letterSpacing: '0.05em',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease, color 0.2s ease',
  },
  cardTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: COLORS.textDark,
  },
  cardDesc: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: COLORS.textMuted,
    flex: 1,
  },
  cardCta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    marginTop: 4,
  },
};