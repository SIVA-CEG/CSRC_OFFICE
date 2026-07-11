import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getCurrentActor, isApproverRole } from '../../utils/staffWorkflow';
import {
  getAllDesignations,
  getStructureForDesignation,
  updateStructureForDesignation,
  formatCurrency,
} from '../../utils/salaryWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

export default function SalaryStructure() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [designations, setDesignations] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const canEdit = !isApproverRole(actor.role);

  useEffect(() => {
    setActor(getCurrentActor());
    setDesignations(getAllDesignations());
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return designations;
    return designations.filter((d) => d.toLowerCase().includes(q));
  }, [designations, search]);

  const open = (designation) => {
    const structure = getStructureForDesignation(designation);
    setSelected(designation);
    setForm(structure);
    setEditing(false);
    setSavedFlash(false);
  };

  const close = () => {
    setSelected(null);
    setEditing(false);
  };

  const setField = (section, key, value) => {
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));
  };

  const handleSave = () => {
    updateStructureForDesignation(selected, form);
    setEditing(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <div>
          <button style={styles.backLink} onClick={() => navigate('/revenue/staff-salary')}>
            ← Staff Salary Home
          </button>
          <h1 style={styles.title}>Salary Structure</h1>
          <p style={styles.subtitle}>
            {canEdit
              ? 'Set the base pay for every designation across all three salary types. These rates are used as defaults whenever a sanction is generated.'
              : 'Base pay for every designation — view only. Rates are configured by the Assistant.'}
          </p>
        </div>
      </div>

      <div style={styles.searchWrap} className="sd-fade-in">
        <span style={styles.searchIcon}>🔍</span>
        <input
          className="sd-input"
          style={styles.searchInput}
          placeholder="Search designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.grid} className="sd-fade-in">
        {filtered.length === 0 && <div style={styles.emptyState}>No designations found.</div>}
        {filtered.map((d) => {
          const s = getStructureForDesignation(d);
          return (
            <button key={d} className="sd-card-hover" style={styles.card} onClick={() => open(d)}>
              <h3 style={styles.cardTitle}>{d}</h3>
              <div style={styles.cardRow}>
                <span style={styles.cardRowLabel}>Consolidated</span>
                <span style={styles.cardRowValue}>{formatCurrency(s.consolidatedPay.amount)}/mo</span>
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardRowLabel}>Daily Wages</span>
                <span style={styles.cardRowValue}>{formatCurrency(s.dailyWages.wagePerDay)}/day</span>
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardRowLabel}>Rate Factor</span>
                <span style={styles.cardRowValue}>
                  {formatCurrency(s.dailyWagesRateFactor.wagePerDay)} × {s.dailyWagesRateFactor.rateFactor}
                </span>
              </div>
              <div style={styles.cardCta}>{canEdit ? 'Edit →' : 'View →'}</div>
            </button>
          );
        })}
      </div>

      {selected && form && createPortal(
        <div style={styles.overlay} onClick={close}>
          <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>{selected}</h2>
                <p style={styles.drawerSub}>Base pay configuration</p>
              </div>
              <button style={styles.closeBtn} onClick={close}>✕</button>
            </div>

            {savedFlash && <div style={styles.savedFlash}>✓ Structure saved</div>}

            {canEdit && (
              <div style={styles.drawerActions}>
                {!editing ? (
                  <button className="sd-btn" style={styles.editBtn} onClick={() => setEditing(true)}>✎ Edit Rates</button>
                ) : (
                  <>
                    <button className="sd-btn" style={styles.saveBtn} onClick={handleSave}>Save Changes</button>
                    <button
                      className="sd-btn"
                      style={styles.cancelBtn}
                      onClick={() => { setEditing(false); setForm(getStructureForDesignation(selected)); }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Consolidated Pay */}
            <Section title="Consolidated Pay" color={theme.indigo}>
              <FieldRow
                label="Monthly Amount"
                editing={editing}
                value={form.consolidatedPay.amount}
                onChange={(v) => setField('consolidatedPay', 'amount', v)}
                display={formatCurrency(form.consolidatedPay.amount)}
              />
            </Section>

            {/* Daily Wages */}
            <Section title="Daily Wages" color={theme.amber}>
              <FieldRow
                label="Wage per Day"
                editing={editing}
                value={form.dailyWages.wagePerDay}
                onChange={(v) => setField('dailyWages', 'wagePerDay', v)}
                display={formatCurrency(form.dailyWages.wagePerDay)}
              />
              <FieldRow
                label="Incentive per Day"
                editing={editing}
                value={form.dailyWages.incentivePerDay}
                onChange={(v) => setField('dailyWages', 'incentivePerDay', v)}
                display={formatCurrency(form.dailyWages.incentivePerDay)}
              />
            </Section>

            {/* Daily Wages with Rate Factor */}
            <Section title="Daily Wages with Rate Factor" color={theme.rose}>
              <FieldRow
                label="Wage per Day"
                editing={editing}
                value={form.dailyWagesRateFactor.wagePerDay}
                onChange={(v) => setField('dailyWagesRateFactor', 'wagePerDay', v)}
                display={formatCurrency(form.dailyWagesRateFactor.wagePerDay)}
              />
              <FieldRow
                label="Rate Factor"
                editing={editing}
                value={form.dailyWagesRateFactor.rateFactor}
                onChange={(v) => setField('dailyWagesRateFactor', 'rateFactor', v)}
                display={String(form.dailyWagesRateFactor.rateFactor)}
                step="0.01"
              />
              <FieldRow
                label="Incentive Rate Factor"
                editing={editing}
                value={form.dailyWagesRateFactor.incentiveRateFactor}
                onChange={(v) => setField('dailyWagesRateFactor', 'incentiveRateFactor', v)}
                display={String(form.dailyWagesRateFactor.incentiveRateFactor)}
                step="0.01"
              />
              <p style={styles.hint}>
                Gross = Wage/Day × Rate Factor × Days Worked. Incentive = Wage/Day × Incentive Rate Factor × Incentive Days.
              </p>
            </Section>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={styles.section}>
      <h3 style={{ ...styles.sectionTitle, color }}>{title}</h3>
      {children}
    </div>
  );
}

function FieldRow({ label, editing, value, onChange, display, step }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      {editing ? (
        <input
          className="sd-input"
          style={styles.editInput}
          type="number"
          step={step || '1'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div style={styles.fieldValue}>{display}</div>
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 20 },
  backLink: { border: 'none', background: 'none', color: theme.indigo, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 640 },

  searchWrap: { position: 'relative', marginBottom: 20, display: 'flex', alignItems: 'center', maxWidth: 420 },
  searchIcon: { position: 'absolute', left: 14, fontSize: 15, opacity: 0.6 },
  searchInput: { width: '100%', padding: '12px 16px 12px 40px', borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, background: theme.surface, fontSize: 14, color: theme.textPrimary, boxShadow: theme.shadowSm },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },
  card: {
    textAlign: 'left', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusLg,
    padding: 20, cursor: 'pointer', boxShadow: theme.shadowSm, fontFamily: theme.fontBody,
  },
  cardTitle: { fontFamily: theme.fontDisplay, fontSize: 16, fontWeight: 800, color: theme.textPrimary, margin: '0 0 12px' },
  cardRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: `1px dashed ${theme.border}` },
  cardRowLabel: { color: theme.textMuted, fontWeight: 600 },
  cardRowValue: { color: theme.textPrimary, fontWeight: 700 },
  cardCta: { marginTop: 14, fontSize: 13, fontWeight: 700, color: theme.indigo },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 480, maxWidth: '100%', height: '100%', background: theme.surface, padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 22, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  closeBtn: { border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: theme.textSecondary },
  savedFlash: { marginTop: 14, background: theme.emeraldLight, color: theme.emeraldDark, padding: '8px 14px', borderRadius: theme.radiusSm, fontSize: 13, fontWeight: 600 },
  drawerActions: { display: 'flex', gap: 10, margin: '18px 0 8px' },
  editBtn: { border: 'none', background: theme.indigo, color: '#fff', padding: '10px 18px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13 },
  saveBtn: { border: 'none', background: theme.emerald, color: '#fff', padding: '10px 18px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13 },
  cancelBtn: { border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textSecondary, padding: '10px 18px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13 },

  section: { marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}` },
  sectionTitle: { fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px' },
  field: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 },
  fieldLabel: { fontSize: 11.5, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' },
  fieldValue: { fontSize: 14, color: theme.textPrimary, fontWeight: 700 },
  editInput: { padding: '9px 12px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary },
  hint: { fontSize: 12, color: theme.textMuted, marginTop: 4, lineHeight: 1.5 },
};