import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentActor, isApproverRole, ROLE_LABELS } from '../../utils/staffWorkflow';
import { getSanctionPendingCount, getAllSalaryReports } from '../../utils/salaryWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

const CARDS = [
  {
    key: 'structure',
    path: '/revenue/staff-salary/structure',
    title: 'Salary Structure',
    subtitle: 'Set base pay per designation — consolidated, daily wage and rate-factor rates',
    icon: '🏗️',
    color: theme.indigo,
    colorDark: theme.indigoDark,
    bg: theme.indigoLight,
    badge: false,
  },
  {
    key: 'sanction',
    path: '/revenue/staff-salary/sanction',
    title: 'Sanction Salary',
    subtitle: 'Pick staff by salary type / designation and route salary for approval',
    icon: '🧮',
    color: theme.emerald,
    colorDark: theme.emeraldDark,
    bg: theme.emeraldLight,
    badge: true,
  },
  {
    key: 'reports',
    path: '/revenue/staff-salary/reports',
    title: 'Salary Reports',
    subtitle: 'Browse every past and present salary sanction, and export as PDF',
    icon: '📊',
    color: theme.amber,
    colorDark: theme.amberDark,
    bg: theme.amberLight,
    badge: false,
  },
];

export default function StaffSalary() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [pendingSanctions, setPendingSanctions] = useState(0);
  const [totals, setTotals] = useState({ batches: 0, approved: 0 });

  useEffect(() => {
    const a = getCurrentActor();
    setActor(a);
    if (isApproverRole(a.role)) {
      setPendingSanctions(getSanctionPendingCount(a.role));
    }
    const reports = getAllSalaryReports();
    setTotals({
      batches: reports.length,
      approved: reports.filter((r) => r.status === 'approved').length,
    });
  }, []);

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <div>
          <div style={styles.eyebrow}>CSRC REVENUE · SALARY MODULE</div>
          <h1 style={styles.title}>Staff Salary</h1>
          <p style={styles.subtitle}>
            Configure base pay, sanction monthly salaries and browse every report — all in one place.
          </p>
        </div>
        <div style={styles.actorPill}>
          <span style={styles.actorDot} />
          <div>
            <div style={styles.actorName}>{actor.name}</div>
            <div style={styles.actorRole}>{ROLE_LABELS[actor.role] || actor.role}</div>
          </div>
        </div>
      </div>

      {isApproverRole(actor.role) && pendingSanctions > 0 && (
        <div style={styles.notice} className="sd-fade-in">
          <span style={{ fontSize: 18 }}>🔔</span>
          <span>
            You have <strong>{pendingSanctions}</strong> salary sanction{pendingSanctions > 1 ? 's' : ''} waiting on
            your approval as {ROLE_LABELS[actor.role] || actor.role}.
          </span>
        </div>
      )}

      <div style={styles.statRow} className="sd-fade-in">
        <StatChip label="Salary Batches" value={totals.batches} color={theme.indigo} bg={theme.indigoLight} />
        <StatChip label="Approved" value={totals.approved} color={theme.emerald} bg={theme.emeraldLight} />
      </div>

      <div style={styles.grid}>
        {CARDS.map((card, i) => {
          const showBadge = card.badge && isApproverRole(actor.role) && pendingSanctions > 0;
          return (
            <button
              key={card.key}
              className="sd-card-hover sd-fade-in"
              style={{ ...styles.card, animationDelay: `${i * 60}ms`, borderColor: card.bg }}
              onClick={() => navigate(card.path)}
            >
              <div style={{ ...styles.cardIconWrap, background: card.bg }}>
                <span style={{ fontSize: 26 }}>{card.icon}</span>
              </div>
              {showBadge && (
                <span style={{ ...styles.badge, background: card.color }}>
                  {pendingSanctions} pending
                </span>
              )}
              <h3 style={{ ...styles.cardTitle, color: card.colorDark }}>{card.title}</h3>
              <p style={styles.cardSubtitle}>{card.subtitle}</p>
              <div style={{ ...styles.cardCta, color: card.color }}>Open →</div>
            </button>
          );
        })}
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
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 24, flexWrap: 'wrap', gap: 16,
  },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: theme.indigo, marginBottom: 8 },
  title: { fontFamily: theme.fontDisplay, fontSize: 32, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 15, maxWidth: 560 },
  actorPill: {
    display: 'flex', alignItems: 'center', gap: 10, background: theme.surface,
    border: `1px solid ${theme.border}`, borderRadius: 999, padding: '8px 16px 8px 12px', boxShadow: theme.shadowSm,
  },
  actorDot: { width: 10, height: 10, borderRadius: '50%', background: theme.emerald, boxShadow: `0 0 0 3px ${theme.emeraldLight}` },
  actorName: { fontSize: 13, fontWeight: 700, color: theme.textPrimary },
  actorRole: { fontSize: 11, color: theme.textMuted },
  notice: {
    display: 'flex', alignItems: 'center', gap: 10, background: theme.amberLight, border: `1px solid ${theme.amber}33`,
    color: theme.amberDark, padding: '12px 18px', borderRadius: theme.radiusMd, marginBottom: 24, fontSize: 14,
  },
  statRow: { display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' },
  statChip: { borderRadius: theme.radiusMd, padding: '14px 22px', minWidth: 130 },
  statValue: { fontSize: 26, fontWeight: 800, fontFamily: theme.fontDisplay },
  statLabel: { fontSize: 12, color: theme.textSecondary, marginTop: 2, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 },
  card: {
    position: 'relative', textAlign: 'left', background: theme.surface, border: '1px solid',
    borderRadius: theme.radiusLg, padding: 24, cursor: 'pointer', boxShadow: theme.shadowSm, fontFamily: theme.fontBody,
  },
  cardIconWrap: { width: 52, height: 52, borderRadius: theme.radiusMd, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  badge: { position: 'absolute', top: 20, right: 20, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 },
  cardTitle: { fontFamily: theme.fontDisplay, fontSize: 18, fontWeight: 700, margin: '0 0 6px' },
  cardSubtitle: { fontSize: 13.5, color: theme.textSecondary, lineHeight: 1.5, margin: 0, minHeight: 40 },
  cardCta: { marginTop: 16, fontSize: 13, fontWeight: 700 },
};