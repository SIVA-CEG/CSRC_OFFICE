// PATH: frontend/src_consultancy/pages/Dashboard.jsx

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SECTIONS, ROLE_LABELS, loadQueue, getListRows, getCompletedRows } from '../data/consultancyWorkflow';

/* Distinct, lively accent per section — independent of SECTIONS[key].accent
   so the dashboard can have its own vivid palette regardless of the muted
   sidebar colors. */
const CARD_THEME = {
  'acceptance-forms':       { from: '#38bdf8', to: '#0ea5e9', glow: 'rgba(14,165,233,0.35)', chip: '#0284c7', icon: '📝' },
  'proforma-invoices':      { from: '#fb923c', to: '#f97316', glow: 'rgba(249,115,22,0.35)', chip: '#ea580c', icon: '🧾' },
  'permissions':            { from: '#4ade80', to: '#22c55e', glow: 'rgba(34,197,94,0.35)',  chip: '#16a34a', icon: '✅' },
  'proceedings-department': { from: '#a78bfa', to: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', chip: '#7c3aed', icon: '🏛️' },
  'proceedings-centre':     { from: '#f472b6', to: '#ec4899', glow: 'rgba(236,72,153,0.35)', chip: '#db2777', icon: '🌐' },
};

// Group headers for the two multi-stage sections — mirrors Layout.jsx.
// Each now spans several stage-sections, so there's no single SECTIONS[key]
// to read a label from any more.
const GROUP_LABELS = {
  'proceedings-department': 'Sanction Proceedings — Department',
  'proceedings-centre':     'Sanction Proceedings — Centre',
};

// Stage keys per group + the route to land on when the card is clicked
// (always the first stage's list page). Mirrors PROCEEDINGS_STAGES in
// Layout.jsx — kept in sync manually since Dashboard only needs the keys.
const PROCEEDINGS_STAGES = {
  'proceedings-centre': [
    { path: 'generate',        sectionKey: 'proceedings-centre-generate' },
    { path: 'sanction-bill',   sectionKey: 'proceedings-centre-sanction-bill' },
    { path: 'generate-pcr',    sectionKey: 'proceedings-centre-generate-pcr' },
    { path: 'pcr-proceedings', sectionKey: 'proceedings-centre-pcr-proceedings' },
  ],
  'proceedings-department': [
    { path: 'generate',      sectionKey: 'proceedings-department-generate' },
    { path: 'sanction-bill', sectionKey: 'proceedings-department-sanction-bill' },
  ],
};

const WORKFLOW_SECTIONS = [
  'acceptance-forms',
  'proforma-invoices',
  'permissions',
  'proceedings-department',
  'proceedings-centre',
];

const styles = {
  page: { background: '#ffffff', minHeight: '100%' },
  headerRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 },
  waveIcon: { fontSize: 26 },
  title: { fontSize: 25, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' },
  subtitle: { fontSize: 13.5, color: '#64748b', margin: '6px 0 28px' },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 25,
  },

  card: (theme) => ({
    position: 'relative',
    borderRadius: 20,
    padding: '22px 22px 20px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.65)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(226,232,240,0.9)',
    boxShadow: `0 8px 24px -12px ${theme.glow}, 0 2px 8px rgba(15,23,42,0.04)`,
  }),

  cardGlow: (theme) => ({
    position: 'absolute',
    top: -40, right: -40,
    width: 140, height: 140,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${theme.glow}, transparent 70%)`,
    pointerEvents: 'none',
  }),

  iconBadge: (theme) => ({
    width: 44, height: 44, borderRadius: 14,
    background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 21,
    boxShadow: `0 8px 18px -6px ${theme.glow}`,
    marginBottom: 14,
  }),

  cardTitle: { fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 16, letterSpacing: '-0.01em' },

  statRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 15, color: '#64748b', padding: '8px 0',
    borderTop: '1px solid rgba(226,232,240,0.8)',
  },
  statRowFirst: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 15, color: '#64748b', padding: '0 0 8px',
  },
  statNum: (color) => ({
    fontWeight: 800, fontSize: 17, color,
  }),

  goRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em',
  },
  goChip: (theme) => ({
    color: theme.chip, textTransform: 'uppercase',
  }),
  arrow: (theme) => ({
    width: 26, height: 26, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 900,
  }),
};

const Dashboard = () => {
  const navigate = useNavigate();
  const role = sessionStorage.getItem('consultancyUserRole');
  const queue = useMemo(() => loadQueue(), []);

  return (
    <div style={styles.page}>
      <style>{`
        .cd-card {
          transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s ease, border-color .22s ease;
        }
        .cd-card:hover {
          transform: translateY(-6px) scale(1.015);
          border-color: rgba(255,255,255,0.9) !important;
        }
        .cd-card:hover .cd-arrow {
          transform: translateX(3px);
        }
        .cd-arrow {
          transition: transform .18s ease;
        }
        .cd-card:hover .cd-glow {
          opacity: 1;
        }
        .cd-glow {
          opacity: 0.7;
          transition: opacity .22s ease;
        }
      `}</style>

      <div style={styles.headerRow}>
        <span style={styles.waveIcon}>👋</span>
        <h1 style={styles.title}>Welcome, {ROLE_LABELS[role] || role}</h1>
      </div>
      <p style={styles.subtitle}>Here's an overview of pending and completed items across every section</p>

      <div style={styles.grid}>
        {WORKFLOW_SECTIONS.map((key) => {
          const theme = CARD_THEME[key];
          const stages = PROCEEDINGS_STAGES[key]; // undefined for flat sections

          const label = stages ? GROUP_LABELS[key] : SECTIONS[key].label;

          // Flat sections: a single SECTIONS key to read from.
          // Multi-stage groups: sum pending/completed across every stage
          // in the group, since the group no longer maps to one SECTIONS key.
          const sectionKeys = stages ? stages.map((s) => s.sectionKey) : [key];
          const pending = sectionKeys.reduce((sum, sk) => sum + getListRows(queue, sk, role).length, 0);
          const completed = sectionKeys.reduce((sum, sk) => sum + getCompletedRows(queue, sk).length, 0);

          // Multi-stage groups land on the first stage's list page.
          const targetPath = stages
            ? `/consultancy-office/${key}/${stages[0].path}/list`
            : `/consultancy-office/${key}/list`;

          return (
            <div
              key={key}
              className="cd-card"
              style={styles.card(theme)}
              onClick={() => navigate(targetPath)}
            >
              <div className="cd-glow" style={styles.cardGlow(theme)} />

              <div style={styles.iconBadge(theme)}>{theme.icon}</div>
              <div style={styles.cardTitle}>{label}</div>

              <div style={styles.statRowFirst}>
                <span>Pending at your desk</span>
                <span style={styles.statNum(theme.chip)}>{pending}</span>
              </div>
              <div style={styles.statRow}>
                <span>Completed (all stages)</span>
                <span style={styles.statNum('#16a34a')}>{completed}</span>
              </div>

              <div style={styles.goRow}>
                <span style={styles.goChip(theme)}>View Section</span>
                <span className="cd-arrow" style={styles.arrow(theme)}>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;