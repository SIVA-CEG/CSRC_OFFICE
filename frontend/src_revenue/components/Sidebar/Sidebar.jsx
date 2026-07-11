import React from 'react';
import { NavLink } from 'react-router-dom';

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
/* ── Monoline icon set (no external icon dependency) ── */
const Icon = {
  Dashboard: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Staff: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Salary: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /><circle cx="12" cy="14.5" r="2" />
    </svg>
  ),
  OT: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
    </svg>
  ),
  Pdf: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Overhead: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Expenditure: () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/revenue', icon: Icon.Dashboard, end: true },
  { label: 'Staff Details', path: '/revenue/staff', icon: Icon.Staff },
  { label: 'Staff Salary', path: '/revenue/staff-salary', icon: Icon.Salary },
  { label: 'Staff OT', path: '/revenue/staff-ot', icon: Icon.OT },
  { label: 'PDF', path: '/revenue/pdf', icon: Icon.Pdf },
  { label: 'Department Overhead', path: '/revenue/department-overhead', icon: Icon.Overhead },
  { label: 'CSRC Expenditure', path: '/revenue/csrc-expenditure', icon: Icon.Expenditure },
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* ── ledger rail: signature ruled-paper motif ── */}
      <div style={styles.ledgerRail}>
        {Array.from({ length: 26 }).map((_, i) => (
          <div key={i} style={styles.ledgerTick} />
        ))}
      </div>

      <div style={styles.inner}>
        <div style={styles.sectionLabel}>Navigation</div>
        <nav style={styles.navList}>
          {NAV_ITEMS.map(({ label, path, icon: ItemIcon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ ...styles.iconWrap, color: isActive ? '#fff' : COLORS.primary }}>
                    <ItemIcon />
                  </span>
                  <span>{label}</span>
                  {isActive && <span style={styles.activeDot} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={styles.footerNote}>
          <div style={styles.footerLine} />
          <span>Revenue Module · v1.0</span>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 76,
    left: 0,
    bottom: 0,
    width: 254,
    display: 'flex',
    background: COLORS.glass,
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    borderRight: `1px solid ${COLORS.glassBorder}`,
    zIndex: 40,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  ledgerRail: {
    width: 10,
    background: `linear-gradient(180deg, ${COLORS.primary}, ${COLORS.sky})`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 18,
    gap: 14,
    flexShrink: 0,
  },
  ledgerTick: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.45)',
  },
  inner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '22px 14px',
    overflowY: 'auto',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: COLORS.textMuted,
    padding: '0 10px',
    marginBottom: 10,
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 12px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    color: COLORS.textDark,
    textDecoration: 'none',
    position: 'relative',
    transition: 'all 0.16s ease',
  },
  navItemActive: {
    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.sky})`,
    color: '#fff',
    fontWeight: 600,
    boxShadow: '0 6px 16px -4px rgba(37,99,235,0.45)',
  },
  iconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activeDot: {
    marginLeft: 'auto',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: COLORS.amber,
  },
  footerNote: {
    marginTop: 'auto',
    paddingTop: 16,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerLine: {
    height: 1,
    background: COLORS.glassBorder,
    marginBottom: 12,
  },
};