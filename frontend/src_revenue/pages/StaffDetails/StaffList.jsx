import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  getStaffList,
  updateStaff,
  fullName,
  formatDate,
} from '../../utils/staffWorkflow';
import { theme, fontFaceAndUtilities, statusMeta } from '../../utils/theme';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Staff' },
  { key: 'active', label: 'Present' },
  { key: 'extended', label: 'Extended' },
  { key: 'resigned', label: 'Resigned' },
];

const EDITABLE_FIELDS = [
  { key: 'mobile', label: 'Mobile No', type: 'text' },
  { key: 'email', label: 'Email ID', type: 'email' },
  { key: 'designation', label: 'Designation', type: 'text' },
  { key: 'staffType', label: 'Regular / Temporary', type: 'select', options: ['Regular', 'Temporary'] },
  { key: 'tenureFrom', label: 'Tenure From', type: 'date' },
  { key: 'tenureTo', label: 'Tenure To / Retirement', type: 'date' },
  { key: 'orderNumber', label: 'Order Number (Proceedings)', type: 'text' },
  { key: 'orderDate', label: 'Order Date', type: 'date' },
  { key: 'salaryType', label: 'Salary Type', type: 'select', options: ['Consolidated Pay', 'Daily Wages', 'Daily Wages with Rate Factor'] },
  { key: 'bankName', label: 'Bank Name', type: 'select', options: [
    'State Bank of India', 'Indian Bank', 'Canara Bank', 'City Union Bank',
    'Indian Overseas Bank', 'Bank of Baroda', 'Punjab National Bank',
    'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Union Bank of India',
  ] },
  { key: 'bankAccountNumber', label: 'Bank Account Number', type: 'text' },
  { key: 'ifscCode', label: 'IFSC Code', type: 'text' },
];

export default function StaffList() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savedFlash, setSavedFlash] = useState(false);

  const refresh = () => setStaff(getStaffList());
  useEffect(() => { refresh(); }, []);

  const designations = useMemo(
    () => ['all', ...Array.from(new Set(staff.map((s) => s.designation)))],
    [staff]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (designationFilter !== 'all' && s.designation !== designationFilter) return false;
      if (!q) return true;
      const haystack = [
        fullName(s), s.employeeCode, s.designation, s.email, s.mobile,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [staff, search, statusFilter, designationFilter]);

  const openStaff = (s) => {
    setSelected(s);
    setEditing(false);
    setEditForm(s);
    setSavedFlash(false);
  };

  const closeDrawer = () => {
    setSelected(null);
    setEditing(false);
  };

  const handleEditChange = (key, value) => {
    setEditForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = () => {
    const updated = updateStaff(selected.id, editForm);
    setSelected(updated);
    setEditing(false);
    setSavedFlash(true);
    refresh();
    setTimeout(() => setSavedFlash(false), 2200);
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <div>
          <button style={styles.backLink} onClick={() => navigate('/revenue/staff')}>
            ← Staff Details Home
          </button>
          <h1 style={styles.title}>Staff Details</h1>
          <p style={styles.subtitle}>{filtered.length} of {staff.length} staff shown</p>
        </div>
      </div>

      <div style={styles.toolbar} className="sd-fade-in">
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            className="sd-input"
            style={styles.searchInput}
            placeholder="Search by name, employee code, designation, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="sd-select"
          style={styles.designationSelect}
          value={designationFilter}
          onChange={(e) => setDesignationFilter(e.target.value)}
        >
          {designations.map((d) => (
            <option key={d} value={d}>{d === 'all' ? 'All Designations' : d}</option>
          ))}
        </select>
      </div>

      <div style={styles.filterRow} className="sd-fade-in">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.key;
          const count = f.key === 'all' ? staff.length : staff.filter((s) => s.status === f.key).length;
          return (
            <button
              key={f.key}
              className="sd-tab"
              style={{
                ...styles.filterChip,
                ...(active ? styles.filterChipActive : {}),
              }}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label} <span style={styles.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.tableWrap} className="sd-fade-in">
        <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
          <div style={{ ...styles.col, flex: 2 }}>Name</div>
          <div style={{ ...styles.col, flex: 1.4 }}>Designation</div>
          <div style={{ ...styles.col, flex: 1 }}>Employee Code</div>
          <div style={{ ...styles.col, flex: 1.2 }}>Tenure To</div>
          <div style={{ ...styles.col, flex: 1 }}>Status</div>
        </div>

        {filtered.length === 0 && (
          <div style={styles.emptyState}>No staff match your search / filters.</div>
        )}

        {filtered.map((s) => {
          const meta = statusMeta(s.status);
          return (
            <div
              key={s.id}
              className="sd-row-hover"
              style={styles.tableRow}
              onClick={() => openStaff(s)}
            >
              <div style={{ ...styles.col, flex: 2, fontWeight: 700, color: theme.textPrimary }}>
                {fullName(s)}
              </div>
              <div style={{ ...styles.col, flex: 1.4 }}>{s.designation}</div>
              <div style={{ ...styles.col, flex: 1 }}>{s.employeeCode}</div>
              <div style={{ ...styles.col, flex: 1.2 }}>{formatDate(s.tenureTo)}</div>
              <div style={{ ...styles.col, flex: 1 }}>
                <span style={{ ...styles.statusPill, color: meta.color, background: meta.bg }}>
                  {meta.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selected && createPortal(
        <div style={styles.overlay} onClick={closeDrawer}>
          <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <div style={{
                  ...styles.statusPill,
                  ...statusMeta(selected.status),
                  color: statusMeta(selected.status).color,
                  background: statusMeta(selected.status).bg,
                  marginBottom: 8,
                  display: 'inline-block',
                }}>
                  {statusMeta(selected.status).label}
                </div>
                <h2 style={styles.drawerTitle}>{fullName(selected)}</h2>
                <p style={styles.drawerSub}>{selected.designation} · {selected.employeeCode}</p>
              </div>
              <button style={styles.closeBtn} onClick={closeDrawer}>✕</button>
            </div>

            {savedFlash && (
              <div style={styles.savedFlash}>✓ Changes saved</div>
            )}

            <div style={styles.drawerActions}>
              {!editing ? (
                <button className="sd-btn" style={styles.editBtn} onClick={() => setEditing(true)}>
                  ✎ Edit Details
                </button>
              ) : (
                <>
                  <button className="sd-btn" style={styles.saveBtn} onClick={handleSave}>Save Changes</button>
                  <button
                    className="sd-btn"
                    style={styles.cancelBtn}
                    onClick={() => { setEditing(false); setEditForm(selected); }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            <div style={styles.detailGrid}>
              <DetailField label="Full Name" value={fullName(selected)} />
              <DetailField label="Gender" value={selected.gender} />
              <DetailField label="Date of Birth" value={formatDate(selected.dob)} />
              <DetailField label="Date of Joining" value={formatDate(selected.doj)} />
              <DetailField label="Allotment Year" value={selected.allotmentYear} />
              <DetailField label="Department" value={selected.department} />

              {EDITABLE_FIELDS.map((f) =>
                editing ? (
                  <EditField
                    key={f.key}
                    field={f}
                    value={editForm[f.key]}
                    onChange={(v) => handleEditChange(f.key, v)}
                  />
                ) : (
                  <DetailField
                    key={f.key}
                    label={f.label}
                    value={f.type === 'date' ? formatDate(selected[f.key]) : (selected[f.key] || '—')}
                  />
                )
              )}
            </div>

            {selected.extensionHistory && selected.extensionHistory.length > 0 && (
              <div style={styles.historyBlock}>
                <h4 style={styles.historyTitle}>Extension History</h4>
                {selected.extensionHistory.map((h, i) => (
                  <div key={i} style={styles.historyRow}>
                    <span>{formatDate(h.from)} → {formatDate(h.to)}</span>
                    <span style={styles.historyMeta}>approved {formatDate(h.approvedOn)}</span>
                  </div>
                ))}
              </div>
            )}

            {selected.resignation && (
              <div style={styles.historyBlock}>
                <h4 style={styles.historyTitle}>Resignation</h4>
                <div style={styles.historyRow}>
                  <span>Effective {formatDate(selected.resignation.date)}</span>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      <div style={styles.fieldValue}>{value || '—'}</div>
    </div>
  );
}

function EditField({ field, value, onChange }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{field.label}</div>
      {field.type === 'select' ? (
        <select
          className="sd-select"
          style={styles.editInput}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          className="sd-input"
          style={styles.editInput}
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 20 },
  backLink: {
    border: 'none', background: 'none', color: theme.indigo, fontWeight: 700,
    fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10,
  },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 4, fontSize: 14 },
  toolbar: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchWrap: {
    position: 'relative', flex: 1, minWidth: 260, display: 'flex', alignItems: 'center',
  },
  searchIcon: { position: 'absolute', left: 14, fontSize: 15, opacity: 0.6 },
  searchInput: {
    width: '100%', padding: '12px 16px 12px 40px', borderRadius: theme.radiusMd,
    border: `1px solid ${theme.border}`, background: theme.surface, fontSize: 14,
    color: theme.textPrimary, boxShadow: theme.shadowSm,
  },
  designationSelect: {
    padding: '12px 16px', borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`,
    background: theme.surface, fontSize: 14, color: theme.textPrimary, boxShadow: theme.shadowSm,
    minWidth: 200,
  },
  filterRow: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  filterChip: {
    border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textSecondary,
    padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
  },
  filterChipActive: {
    background: theme.indigo, color: '#fff', borderColor: theme.indigo,
  },
  filterCount: { opacity: 0.7, marginLeft: 4 },
  tableWrap: {
    background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`,
    overflow: 'hidden', boxShadow: theme.shadowSm,
  },
  tableRow: {
    display: 'flex', alignItems: 'center', padding: '14px 20px', cursor: 'pointer',
    borderBottom: `1px solid ${theme.border}`,
  },
  tableHeadRow: {
    background: theme.bgAlt, cursor: 'default', fontSize: 12, fontWeight: 700,
    color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  col: { fontSize: 14, color: theme.textSecondary, paddingRight: 12 },
  statusPill: {
    fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
  },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },

  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)',
    display: 'flex', justifyContent: 'flex-end', zIndex: 50,
  },
  drawer: {
    width: 480, maxWidth: '100%', height: '100%', background: theme.surface,
    padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)',
  },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 22, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  closeBtn: {
    border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%',
    cursor: 'pointer', fontSize: 14, color: theme.textSecondary,
  },
  savedFlash: {
    marginTop: 14, background: theme.emeraldLight, color: theme.emeraldDark,
    padding: '8px 14px', borderRadius: theme.radiusSm, fontSize: 13, fontWeight: 600,
  },
  drawerActions: { display: 'flex', gap: 10, margin: '18px 0 8px' },
  editBtn: {
    border: 'none', background: theme.indigo, color: '#fff', padding: '10px 18px',
    borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13,
  },
  saveBtn: {
    border: 'none', background: theme.emerald, color: '#fff', padding: '10px 18px',
    borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13,
  },
  cancelBtn: {
    border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textSecondary,
    padding: '10px 18px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13,
  },
  detailGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldLabel: { fontSize: 11.5, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' },
  fieldValue: { fontSize: 14, color: theme.textPrimary, fontWeight: 600 },
  editInput: {
    padding: '9px 12px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`,
    fontSize: 13.5, color: theme.textPrimary,
  },
  historyBlock: { marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}` },
  historyTitle: { fontSize: 13, fontWeight: 800, color: theme.textPrimary, margin: '0 0 10px' },
  historyRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.textSecondary,
    padding: '6px 0',
  },
  historyMeta: { color: theme.textMuted, fontSize: 12 },
};