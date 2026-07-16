import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  REGISTER_META,
  getCurrentActor,
  getCounts,
  getPendingCountForRole,
  isApproverRole,
  ROLE_LABELS,
} from '../../utils/serviceRegisterWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

const ACCENT = theme.violet || theme.indigo;
const ACCENT_DARK = theme.violetDark || theme.indigoDark;
const ACCENT_LIGHT = theme.violetLight || theme.indigoLight;

export default function ServiceRegisterHome() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [stats, setStats] = useState({ all: 0, registered: 0, pending: 0, rejected: 0 });
  const [pendingMine, setPendingMine] = useState(0);

  useEffect(() => {
    const a = getCurrentActor();
    setActor(a);
    setStats(getCounts());
    if (isApproverRole(a.role)) setPendingMine(getPendingCountForRole(a.role));
  }, []);

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: ACCENT }} onClick={() => navigate('/revenue/csrc-expenditure')}>
          ← CSRC Revenue Home
        </button>
        <h1 style={styles.title}>Service Register</h1>
        <p style={styles.subtitle}>{REGISTER_META.registerTitle}</p>
      </div>

      <div style={styles.statRow} className="sd-fade-in">
        <StatChip label="Total Entries" value={stats.all} color={ACCENT} bg={ACCENT_LIGHT} />
        <StatChip label="Registered" value={stats.registered} color={theme.emeraldDark} bg={theme.emeraldLight} />
        <StatChip label="Pending Approval" value={stats.pending} color={theme.amberDark} bg={theme.amberLight} />
        <StatChip label="Rejected" value={stats.rejected} color={theme.roseDark} bg={theme.roseLight} />
      </div>

      <div style={styles.grid}>
        <button className="sd-card-hover sd-fade-in" style={{ ...styles.card, borderColor: ACCENT_LIGHT }} onClick={() => navigate('/revenue/csrc-expenditure/service-register/add')}>
          <div style={{ ...styles.cardIconWrap, background: ACCENT_LIGHT }}>
            <span style={{ fontSize: 28 }}>{isApproverRole(actor.role) ? '👁️' : '➕'}</span>
          </div>
          <h3 style={{ ...styles.cardTitle, color: ACCENT_DARK }}>{isApproverRole(actor.role) ? 'View Service Entries' : 'Add Service Entry'}</h3>
          <p style={styles.cardSubtitle}>
            {isApproverRole(actor.role)
              ? 'View all service / repair entries submitted by the Assistant.'
              : 'Log an item sent out for service — registered immediately.'}
          </p>
          <div style={{ ...styles.cardCta, color: ACCENT }}>Open →</div>
        </button>

        <button className="sd-card-hover sd-fade-in" style={{ ...styles.card, borderColor: ACCENT_LIGHT }} onClick={() => navigate('/revenue/csrc-expenditure/service-register/view')}>
          <div style={{ ...styles.cardIconWrap, background: ACCENT_LIGHT }}>
            <span style={{ fontSize: 28 }}>🛠️</span>
          </div>
          <h3 style={{ ...styles.cardTitle, color: ACCENT_DARK }}>View Service Register</h3>
          <p style={styles.cardSubtitle}>Browse the full register — search, filter by date/status, and download reports.</p>
          <div style={{ ...styles.cardCta, color: ACCENT }}>Open →</div>
        </button>
      </div>
    </div>
  );
}

function StatChip({ label, value, color, bg }) {
  return (
    <div style={{ ...styles.statChip, background: bg }}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 22 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 30, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5 },
  statRow: { display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' },
  statChip: { borderRadius: theme.radiusMd, padding: '14px 22px', minWidth: 140 },
  statValue: { fontSize: 24, fontWeight: 800, fontFamily: theme.fontDisplay },
  statLabel: { fontSize: 12, color: theme.textSecondary, marginTop: 2, fontWeight: 600 },
  notice: { display: 'flex', alignItems: 'center', gap: 10, background: theme.amberLight, border: `1px solid ${theme.amber}33`, color: theme.amberDark, padding: '12px 18px', borderRadius: theme.radiusMd, marginBottom: 24, fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  card: { position: 'relative', textAlign: 'left', background: theme.surface, border: '1px solid', borderRadius: theme.radiusLg, padding: 26, cursor: 'pointer', boxShadow: theme.shadowSm, fontFamily: theme.fontBody },
  cardIconWrap: { width: 54, height: 54, borderRadius: theme.radiusMd, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  badge: { position: 'absolute', top: 22, right: 22, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 },
  cardTitle: { fontFamily: theme.fontDisplay, fontSize: 18, fontWeight: 700, margin: '0 0 6px' },
  cardSubtitle: { fontSize: 13.5, color: theme.textSecondary, lineHeight: 1.5, margin: 0, minHeight: 40 },
  cardCta: { marginTop: 16, fontSize: 13, fontWeight: 700 },
};