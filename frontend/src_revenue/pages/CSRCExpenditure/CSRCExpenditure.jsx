import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentActor,
  getCategoryCounts,
  getPendingCountForRole,
  isApproverRole,
} from '../../utils/expenditureWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

const REGISTERS = [
  {
    key: 'non_consumables',
    path: '/revenue/csrc-expenditure/non-consumables',
    title: 'Non-Consumables Stock Register',
    subtitle:
      'Furniture, equipment, computers and other durable assets — F&AM Form No. 43',
    icon: '🗄️',
    color: theme.indigo,
    colorDark: theme.indigoDark,
    bg: theme.indigoLight,
  },

  {
    key: 'consumables',
    path: '/revenue/csrc-expenditure/consumables',
    title: 'Consumables Stock Register',
    subtitle:
      'Stationery, printing, pantry and other consumable items — F&AM Form No. 43',
    icon: '📦',
    color: theme.emerald,
    colorDark: theme.emeraldDark,
    bg: theme.emeraldLight,
  },

  {
    key: 'service_register',
    path: '/revenue/csrc-expenditure/service-register',
    title: 'Service Register',
    subtitle:
      'Equipment sent for repair, servicing and maintenance with approval workflow.',
    icon: '🛠️',
    color: theme.violet || '#7C3AED',
    colorDark: theme.violetDark || '#5B21B6',
    bg: theme.violetLight || '#F3E8FF',
  },

  {
    key: 'logistics',
    path: '/revenue/csrc-expenditure/logistics',
    title: 'Logistics Register',
    subtitle:
      'Vehicle management, trip logs, fuel consumption and mileage register.',
    icon: '🚗',
    color: theme.amber || '#F59E0B',
    colorDark: theme.amberDark || '#B45309',
    bg: theme.amberLight || '#FEF3C7',
  },

  {
    key: 'amc_register',
    path: '/revenue/csrc-expenditure/amc-register',
    title: 'AMC Register',
    subtitle: 'Annual Maintenance Contracts applied against registered Non-Consumable items.',
    icon: '🧰',
    color: theme.violet || '#7C3AED',
    colorDark: theme.violetDark || '#5B21B6',
    bg: theme.violetLight || '#F3E8FF',
  },
];

export default function CSRCExpenditure() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [stats, setStats] = useState({});
  const [pending, setPending] = useState({ non_consumables: 0, consumables: 0 });

  useEffect(() => {
    const a = getCurrentActor();
    setActor(a);
    setStats({
  non_consumables: getCategoryCounts('non_consumables'),
  consumables: getCategoryCounts('consumables'),

  service_register: {
    all: 0,
    registered: 0,
    pending: 0,
    rejected: 0,
  },

  logistics: {
    all: 0,
    registered: 0,
    pending: 0,
    rejected: 0,
  },

  amc_register: { all: 0, registered: 0, pending: 0, rejected: 0 },

});
    if (isApproverRole(a.role)) {
      setPending({
  non_consumables: getPendingCountForRole(a.role, 'non_consumables'),
  consumables: getPendingCountForRole(a.role, 'consumables'),

  service_register: 0,
  logistics: 0,
  amc_register: 0,
});
    }
  }, []);

  const totalPending = pending.non_consumables + pending.consumables;

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <div>
          <div style={styles.eyebrow}>CSRC REVENUE · EXPENDITURE MODULE</div>
          <h1 style={styles.title}>CSRC Expenditure</h1>
          <p style={styles.subtitle}>
            Digitised version of the physical Non-Consumable &amp; Consumable Stock Registers —
            add new entries and they're registered immediately, or browse the full register.
          </p>
        </div>
        <div style={styles.actorPill}>
          <span style={styles.actorDot} />
          <div>
            <div style={styles.actorName}>{actor.name}</div>
            <div style={styles.actorRole}>{roleLabel(actor.role)}</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {REGISTERS.map((r, i) => {
          const s = stats[r.key] || { all: 0, registered: 0, pending: 0, rejected: 0 };
          const pendingCount = pending[r.key] || 0;
          const showBadge = isApproverRole(actor.role) && pendingCount > 0;
          return (
            <button
              key={r.key}
              className="sd-card-hover sd-fade-in"
              style={{ ...styles.card, animationDelay: `${i * 60}ms`, borderColor: r.bg }}
              onClick={() => navigate(r.path)}
            >
              <div style={{ ...styles.cardIconWrap, background: r.bg }}>
                <span style={{ fontSize: 30 }}>{r.icon}</span>
              </div>
              {showBadge && (
                <span style={{ ...styles.badge, background: r.color }}>
                  {pendingCount} pending
                </span>
              )}
              <h3 style={{ ...styles.cardTitle, color: r.colorDark }}>{r.title}</h3>
              <p style={styles.cardSubtitle}>{r.subtitle}</p>

              <div style={styles.statRow}>
                <MiniStat label="Total" value={s.all} color={r.color} bg={r.bg} />
                <MiniStat label="Registered" value={s.registered} color={theme.emeraldDark} bg={theme.emeraldLight} />
                <MiniStat label="Pending" value={s.pending} color={theme.amberDark} bg={theme.amberLight} />
              </div>

              <div style={{ ...styles.cardCta, color: r.color }}>Open register →</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color, bg }) {
  return (
    <div style={{ ...styles.miniStat, background: bg }}>
      <div style={{ ...styles.miniStatValue, color }}>{value}</div>
      <div style={styles.miniStatLabel}>{label}</div>
    </div>
  );
}

function roleLabel(role) {
  return (
    {
      assistant: 'Assistant',
      superintendent: 'Superintendent',
      deputy_director: 'Deputy Director',
      director: 'Director',
    }[role] || role
  );
}

const styles = {
  root: {
    minHeight: '100%',
    background: theme.bg,
    padding: '32px 40px 56px',
    fontFamily: theme.fontBody,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: theme.indigo,
    marginBottom: 8,
  },
  title: {
    fontFamily: theme.fontDisplay,
    fontSize: 32,
    fontWeight: 800,
    color: theme.textPrimary,
    margin: 0,
  },
  subtitle: {
    color: theme.textSecondary,
    marginTop: 6,
    fontSize: 15,
    maxWidth: 620,
  },
  actorPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: 999,
    padding: '8px 16px 8px 12px',
    boxShadow: theme.shadowSm,
  },
  actorDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: theme.emerald,
    boxShadow: `0 0 0 3px ${theme.emeraldLight}`,
  },
  actorName: { fontSize: 13, fontWeight: 700, color: theme.textPrimary },
  actorRole: { fontSize: 11, color: theme.textMuted },
  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: theme.amberLight,
    border: `1px solid ${theme.amber}33`,
    color: theme.amberDark,
    padding: '12px 18px',
    borderRadius: theme.radiusMd,
    marginBottom: 24,
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 22,
  },
  card: {
    position: 'relative',
    textAlign: 'left',
    background: theme.surface,
    border: '1px solid',
    borderRadius: theme.radiusLg,
    padding: 26,
    cursor: 'pointer',
    boxShadow: theme.shadowSm,
    fontFamily: theme.fontBody,
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: theme.radiusMd,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    position: 'absolute',
    top: 22,
    right: 22,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 999,
  },
  cardTitle: {
    fontFamily: theme.fontDisplay,
    fontSize: 19,
    fontWeight: 700,
    margin: '0 0 6px',
  },
  cardSubtitle: {
    fontSize: 13.5,
    color: theme.textSecondary,
    lineHeight: 1.5,
    margin: 0,
    minHeight: 40,
  },
  statRow: { display: 'flex', gap: 10, marginTop: 18 },
  miniStat: { borderRadius: theme.radiusSm, padding: '8px 12px', flex: 1 },
  miniStatValue: { fontSize: 18, fontWeight: 800, fontFamily: theme.fontDisplay },
  miniStatLabel: { fontSize: 10.5, color: theme.textSecondary, fontWeight: 600, marginTop: 1 },
  cardCta: { marginTop: 18, fontSize: 13, fontWeight: 700 },
};