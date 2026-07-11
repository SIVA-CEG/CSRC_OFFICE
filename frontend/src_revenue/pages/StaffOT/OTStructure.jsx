import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getCurrentActor, isApproverRole } from '../../utils/staffWorkflow';
import { getAllDesignations, getOTStructureForDesignation, updateOTStructureForDesignation, formatCurrency } from '../../utils/otWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

export default function OTStructure() {
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
    setSelected(designation);
    setForm(getOTStructureForDesignation(designation));
    setEditing(false);
    setSavedFlash(false);
  };
  const close = () => { setSelected(null); setEditing(false); };

  const handleSave = () => {
    updateOTStructureForDesignation(selected, form);
    setEditing(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <div>
          <button style={styles.backLink} onClick={() => navigate('/revenue/staff-ot')}>← Staff OT Home</button>
          <h1 style={styles.title}>OT Salary Structure</h1>
          <p style={styles.subtitle}>
            {canEdit
              ? 'Set the overtime rate per hour for every designation. This rate is used to compute OT amounts wherever hours are logged.'
              : 'Overtime rate per hour for every designation — view only. Rates are configured by the Assistant.'}
          </p>
        </div>
      </div>

      <div style={styles.searchWrap} className="sd-fade-in">
        <span style={styles.searchIcon}>🔍</span>
        <input className="sd-input" style={styles.searchInput} placeholder="Search designation..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div style={styles.grid} className="sd-fade-in">
        {filtered.length === 0 && <div style={styles.emptyState}>No designations found.</div>}
        {filtered.map((d) => {
          const s = getOTStructureForDesignation(d);
          return (
            <button key={d} className="sd-card-hover" style={styles.card} onClick={() => open(d)}>
              <h3 style={styles.cardTitle}>{d}</h3>
              <div style={styles.cardRow}>
                <span style={styles.cardRowLabel}>Rate / Hour</span>
                <span style={styles.cardRowValue}>{formatCurrency(s.ratePerHour)}</span>
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
                <p style={styles.drawerSub}>Overtime rate configuration</p>
              </div>
              <button style={styles.closeBtn} onClick={close}>✕</button>
            </div>

            {savedFlash && <div style={styles.savedFlash}>✓ Rate saved</div>}

            {canEdit && (
              <div style={styles.drawerActions}>
                {!editing ? (
                  <button className="sd-btn" style={styles.editBtn} onClick={() => setEditing(true)}>✎ Edit Rate</button>
                ) : (
                  <>
                    <button className="sd-btn" style={styles.saveBtn} onClick={handleSave}>Save Changes</button>
                    <button className="sd-btn" style={styles.cancelBtn} onClick={() => { setEditing(false); setForm(getOTStructureForDesignation(selected)); }}>Cancel</button>
                  </>
                )}
              </div>
            )}

            <div style={styles.field}>
              <div style={styles.fieldLabel}>Rate per Hour</div>
              {editing ? (
                <input
                  className="sd-input"
                  style={styles.editInput}
                  type="number"
                  step="1"
                  value={form.ratePerHour}
                  onChange={(e) => setForm({ ratePerHour: e.target.value })}
                />
              ) : (
                <div style={styles.fieldValue}>{formatCurrency(form.ratePerHour)}</div>
              )}
            </div>
          </div>
        </div>,
        document.body
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },
  card: { textAlign: 'left', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusLg, padding: 20, cursor: 'pointer', boxShadow: theme.shadowSm, fontFamily: theme.fontBody },
  cardTitle: { fontFamily: theme.fontDisplay, fontSize: 16, fontWeight: 800, color: theme.textPrimary, margin: '0 0 12px' },
  cardRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: `1px dashed ${theme.border}` },
  cardRowLabel: { color: theme.textMuted, fontWeight: 600 },
  cardRowValue: { color: theme.textPrimary, fontWeight: 700 },
  cardCta: { marginTop: 14, fontSize: 13, fontWeight: 700, color: theme.indigo },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 420, maxWidth: '100%', height: '100%', background: theme.surface, padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 22, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  closeBtn: { border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: theme.textSecondary },
  savedFlash: { marginTop: 14, background: theme.emeraldLight, color: theme.emeraldDark, padding: '8px 14px', borderRadius: theme.radiusSm, fontSize: 13, fontWeight: 600 },
  drawerActions: { display: 'flex', gap: 10, margin: '18px 0 8px' },
  editBtn: { border: 'none', background: theme.indigo, color: '#fff', padding: '10px 18px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13 },
  saveBtn: { border: 'none', background: theme.emerald, color: '#fff', padding: '10px 18px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13 },
  cancelBtn: { border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textSecondary, padding: '10px 18px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13 },
  field: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 22 },
  fieldLabel: { fontSize: 11.5, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' },
  fieldValue: { fontSize: 18, color: theme.textPrimary, fontWeight: 800 },
  editInput: { padding: '9px 12px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 15, color: theme.textPrimary },
};