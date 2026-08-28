// PATH: frontend/src_consultancy/components/Layout/Layout.jsx

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SECTIONS, ROLE_LABELS } from '../../data/consultancyWorkflow';

// Same vivid palette as the Dashboard cards, so a section's color stays
// consistent whether you're looking at its dashboard tile or its sidebar
// group — sky blue, orange, green, purple, pink.
const SECTION_THEME = {
  'acceptance-forms':  { from: '#38bdf8', to: '#0ea5e9', text: '#0284c7', icon: '📝' },
  'proforma-invoices': { from: '#fb923c', to: '#f97316', text: '#ea580c', icon: '🧾' },
  'permissions':       { from: '#4ade80', to: '#22c55e', text: '#16a34a', icon: '✅' },
  'proceedings-department': { from: '#a78bfa', to: '#8b5cf6', text: '#7c3aed', icon: '🏛️' },
  'proceedings-centre':     { from: '#f472b6', to: '#ec4899', text: '#db2777', icon: '🌐' },
};

// Group headers for the two multi-stage sections (not tied to a single
// workflow SECTIONS entry, since each now spans several stage-sections).
const GROUP_LABELS = {
  'proceedings-department': 'Sanction Proceedings — Department',
  'proceedings-centre':     'Sanction Proceedings — Centre',
};

/* Each proceedings group now runs through multiple stages; every stage
   still resolves to a real SECTIONS[key] (for the label) via `sectionKey`. */
const PROCEEDINGS_STAGES = {
  'proceedings-centre': [
    { path: 'generate',        sectionKey: 'proceedings-centre-generate',        short: 'Generate Proceedings' },
    { path: 'sanction-bill',   sectionKey: 'proceedings-centre-sanction-bill',   short: 'Sanction Proceedings & Bill' },
    { path: 'generate-pcr',    sectionKey: 'proceedings-centre-generate-pcr',    short: 'Generate PCR' },
    { path: 'pcr-proceedings', sectionKey: 'proceedings-centre-pcr-proceedings', short: 'PCR Proceedings' },
  ],
  'proceedings-department': [
    { path: 'generate',      sectionKey: 'proceedings-department-generate',      short: 'Generate Proceedings' },
    { path: 'sanction-bill', sectionKey: 'proceedings-department-sanction-bill', short: 'Sanction Proceedings & Bill' },
  ],
};

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: '#f2f4fb', fontFamily: 'DM Sans, sans-serif' },
  sidebar: {
    position: 'relative',
    width: 280,
    background: 'linear-gradient(180deg, #ffffff 0%, #fbfbff 55%, #f6f8ff 100%)',
    borderRight: '1px solid rgba(148,163,184,0.18)',
    padding: '24px 16px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    overflowY: 'auto',
    boxShadow: '6px 0 24px -12px rgba(76,29,149,0.12)',
    zIndex: 1,
  },
  sidebarGlow1: {
    position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)',
    pointerEvents: 'none', zIndex: -1,
  },
  sidebarGlow2: {
    position: 'absolute', bottom: -80, right: -80, width: 220, height: 220, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.14), transparent 70%)',
    pointerEvents: 'none', zIndex: -1,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 12, padding: '4px 10px 22px', position: 'relative' },
  brandIcon: {
    width: 42, height: 42, borderRadius: 14,
    background: 'linear-gradient(135deg,#ff6b9d 0%,#c44569 55%,#7c1f3f 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 25,
    flexShrink: 0, boxShadow: '0 6px 16px -4px rgba(196,69,105,0.55), inset 0 1px 1px rgba(255,255,255,0.5)',
    position: 'relative', overflow: 'hidden',
  },
  brandIconShine: {
    position: 'absolute', top: -6, left: -10, width: '70%', height: '55%', borderRadius: '50%',
    background: 'rgba(255,255,255,0.35)', transform: 'rotate(-20deg)', pointerEvents: 'none',
  },
  brandTitle: { fontSize: 15, fontWeight: 800, color: '#1e1b3a', lineHeight: 1.2, letterSpacing: '-0.01em' },
  brandSub: { fontSize: 10.5, fontWeight: 600, color: '#a1a8c3', marginTop: 3, letterSpacing: '0.03em' },

  navHome: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: active ? 800 : 600,
    color: active ? '#fff' : '#d81620',
    background: active
      ? 'linear-gradient(120deg,#6c5ce7,#8e7ff2)'
      : 'transparent',
    borderRadius: 12, padding: '11px 14px', cursor: 'pointer', marginBottom: 22,
    boxShadow: active ? '0 8px 18px -6px rgba(108,92,231,0.55)' : 'none',
    transition: 'all .18s ease',
  }),

  navGroup: { marginBottom: 18, paddingBottom: 4 },
  navGroupLabel: (color) => ({
    fontSize: 13, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '10px 15px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', userSelect: 'none', border: '1px solid rgba(64, 66, 67, 0.18)', borderRadius: 10, transition: 'all .18s ease',
  }),
  navGroupLabelLeft: { display: 'flex', alignItems: 'center', gap: 7 },
  navGroupIcon: { fontSize: 18 },
  navGroupDot: (color) => ({
    width: 6, height: 6, borderRadius: '50%', background: color,
    boxShadow: `0 0 0 3px ${color}22`,
  }),
  navGroupChevron: (open, color) => ({
    fontSize: 12, color, opacity: 0.7,
    transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
    transition: 'transform .18s ease',
  }),
  navLinkStack: { display: 'flex', flexDirection: 'column', gap: 3 },
  navCollapse: (open) => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    transition: 'grid-template-rows .22s ease',
  }),
  navCollapseInner: { overflow: 'hidden', minHeight: 0 },

  navStageGroup: { marginBottom: 2 },
  navStageLabel: (color, open) => ({
    fontSize: 12, fontWeight: 700, color, padding: '8px 12px 8px 22px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', userSelect: 'none', opacity: open ? 1 : 0.85,
  }),
  navStageChevron: (open, color) => ({
    fontSize: 10, color, opacity: 0.6,
    transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .18s ease',
  }),

  content: { flex: 1, minWidth: 0, padding: '28px 32px' },
  main: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  topbar: {
    height: 68, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(148,163,184,0.18)', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 30px',
    boxShadow: '0 4px 20px -14px rgba(30,27,58,0.15)',
  },
  topbarTitle: { fontSize: 15, fontWeight: 800, color: '#1e1b3a', letterSpacing: '-0.01em' },
  userChip: { display: 'flex', alignItems: 'center', gap: 14 },
  userName: { fontSize: 13, fontWeight: 700, color: '#374151' },
  roleBadge: {
    fontSize: 10.5, fontWeight: 800, color: '#fff',
    background: 'linear-gradient(120deg,#ff9f43,#ee7c2c)',
    borderRadius: 999, padding: '5px 13px', textTransform: 'uppercase', letterSpacing: '0.04em',
    boxShadow: '0 4px 12px -4px rgba(238,124,44,0.6)',
  },
  logoutBtn: {
    fontSize: 12.5, fontWeight: 800, color: '#fff',
    background: 'linear-gradient(120deg,#334155,#1e293b)',
    border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer',
    boxShadow: '0 4px 12px -4px rgba(30,41,59,0.5)', transition: 'all .18s ease',
  },
};

const WORKFLOW_SECTIONS = [
  'acceptance-forms',
  'proforma-invoices',
  'permissions',
  'proceedings-department',
  'proceedings-centre',
];

const ConsultancyLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = sessionStorage.getItem('consultancyUserRole');
  const name = sessionStorage.getItem('consultancyUserName');

  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    WORKFLOW_SECTIONS.forEach((key) => {
      initial[key] = location.pathname.startsWith(`/consultancy-office/${key}/`);
    });
    return initial;
  });
  const [openStages, setOpenStages] = useState(() => {
    const initial = {};
    Object.entries(PROCEEDINGS_STAGES).forEach(([groupKey, stages]) => {
      stages.forEach((s) => {
        initial[`${groupKey}/${s.path}`] = location.pathname.startsWith(`/consultancy-office/${groupKey}/${s.path}/`);
      });
    });
    return initial;
  });

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleStage = (id) => setOpenStages((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!role) {
    navigate('/consultancy-login');
    return null;
  }

  const isDirector = role === 'director';

  const handleLogout = () => {
    sessionStorage.removeItem('consultancyUserRole');
    sessionStorage.removeItem('consultancyUserName');
    navigate('/consultancy-login');
  };

  const isActive = (path) => location.pathname === path;

  const tabsForRole = isDirector
    ? [['list', 'Submitted'], ['completed', 'Completed']]
    : [['list', 'Submitted'], ['transferred', 'Transferred'], ['completed', 'Completed']];

  return (
    <div style={styles.root}>
      <style>{`
        .cc-nav-link {
          position: relative;
          transition: transform .16s ease, box-shadow .16s ease, background .16s ease, color .16s ease;
        }
        .cc-nav-link:hover {
          transform: translateX(4px);
        }
        .cc-nav-link:not(.active):hover {
          background: var(--hover-bg) !important;
          color: var(--hover-fg) !important;
        }
        .cc-nav-link.active {
          background: linear-gradient(120deg, var(--accent-from), var(--accent-to)) !important;
          color: #fff !important;
          box-shadow: 0 8px 18px -7px var(--accent-shadow);
        }
        .cc-nav-home:hover {
          filter: brightness(1.03);
        }
        .cc-logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px -4px rgba(30,41,59,0.6);
        }
        .cc-sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .cc-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,0.35); border-radius: 999px;
        }
        .cc-nav-group + .cc-nav-group {
          border-top: 1px dashed rgba(148,163,184,0.25);
          padding-top: 16px;
        }
        .cc-nav-group-label:hover {
          opacity: 0.75;
        }
      `}</style>

      <aside style={styles.sidebar} className="cc-sidebar-scroll">
        <div style={styles.sidebarGlow1} />
        <div style={styles.sidebarGlow2} />

        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <div style={styles.brandIconShine} />
            🌐
          </div>
          <div>
            <div style={styles.brandTitle}>CSRC Consultancies</div>
            <div style={styles.brandSub}>Office Portal</div>
          </div>
        </div>

        <div
          className="cc-nav-home"
          style={styles.navHome(isActive('/consultancy-office'))}
          onClick={() => navigate('/consultancy-office')}
        >
          🏠 <span>Dashboard</span>
        </div>

{WORKFLOW_SECTIONS.map((key) => {
          const theme = SECTION_THEME[key];
          const open = !!openSections[key];
          const stages = PROCEEDINGS_STAGES[key]; // undefined for flat sections

          return (
            <div key={key} className="cc-nav-group" style={styles.navGroup}>
              <div
                className="cc-nav-group-label"
                style={styles.navGroupLabel(theme.text)}
                onClick={() => toggleSection(key)}
                role="button" tabIndex={0} aria-expanded={open}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection(key); } }}
              >
                <span style={styles.navGroupLabelLeft}>
                  <span style={styles.navGroupIcon}>{theme.icon}</span>
                  <span style={styles.navGroupDot(theme.text)} />
                  {stages ? GROUP_LABELS[key] : SECTIONS[key].label}
                </span>
                <span style={styles.navGroupChevron(open, theme.text)}>▾</span>
              </div>
              <div style={styles.navCollapse(open)}>
                <div style={styles.navCollapseInner}>
                  {stages ? (
                    // ── Nested: one collapsible sub-menu per stage, each with its own list/transferred/completed ──
                    stages.map((stage) => {
                      const stageId = `${key}/${stage.path}`;
                      const stageOpen = !!openStages[stageId];
                      return (
                        <div key={stageId} style={styles.navStageGroup}>
                          <div
                            style={styles.navStageLabel(theme.text, stageOpen)}
                            onClick={() => toggleStage(stageId)}
                            role="button" tabIndex={0} aria-expanded={stageOpen}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStage(stageId); } }}
                          >
                            <span>{stage.short}</span>
                            <span style={styles.navStageChevron(stageOpen, theme.text)}>▾</span>
                          </div>
                          <div style={styles.navCollapse(stageOpen)}>
                            <div style={styles.navCollapseInner}>
                              <div style={styles.navLinkStack}>
                                {tabsForRole.map(([tab, label]) => {
                                  const path = `/consultancy-office/${key}/${stage.path}/${tab}`;
                                  const active = isActive(path);
                                  return (
                                    <div
                                      key={tab}
                                      className={`cc-nav-link${active ? ' active' : ''}`}
                                      style={{
                                        display: 'block', fontSize: 12.5, fontWeight: active ? 700 : 600,
                                        color: '#4b5567', borderRadius: 10, padding: '8px 12px 8px 34px', cursor: 'pointer',
                                        '--accent-from': theme.from, '--accent-to': theme.to,
                                        '--accent-shadow': `${theme.from}80`, '--hover-bg': `${theme.from}14`, '--hover-fg': '#1e1b3a',
                                      }}
                                      onClick={() => navigate(path)}
                                    >
                                      {label}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // ── Flat: acceptance-forms / proforma-invoices / permissions, unchanged ──
                    <div style={styles.navLinkStack}>
                      {tabsForRole.map(([tab, label]) => {
                        const path = `/consultancy-office/${key}/${tab}`;
                        const active = isActive(path);
                        return (
                          <div
                            key={tab}
                            className={`cc-nav-link${active ? ' active' : ''}`}
                            style={{
                              display: 'block', fontSize: 13, fontWeight: active ? 700 : 600,
                              color: '#4b5567', borderRadius: 10, padding: '9px 12px 9px 24px', cursor: 'pointer',
                              '--accent-from': theme.from, '--accent-to': theme.to,
                              '--accent-shadow': `${theme.from}80`, '--hover-bg': `${theme.from}14`, '--hover-fg': '#1e1b3a',
                            }}
                            onClick={() => navigate(path)}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </aside>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarTitle}>Centre for Sponsored Research and Consultancy</div>
          <div style={styles.userChip}>
            <span style={styles.roleBadge}>{ROLE_LABELS[role] || role}</span>
            <span style={styles.userName}>{name}</span>
            <button className="cc-logout-btn" style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div style={styles.content}><Outlet /></div>
      </div>
    </div>
  );
};

export default ConsultancyLayout;