import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  getCurrentActor,
  isApproverRole,
  getStaffList,
  fullName,
  submitRequest,
  getRequestsByType,
  approveRequest,
  rejectRequest,
  currentHolderLabel,
  formatDate,
} from '../../utils/staffWorkflow';
import { theme, fontFaceAndUtilities, statusMeta } from '../../utils/theme';

export default function StaffExtension() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });

  useEffect(() => { setActor(getCurrentActor()); }, []);

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={styles.backLink} onClick={() => navigate('/revenue/staff')}>
          ← Staff Details Home
        </button>
        <h1 style={styles.title}>Staff Extension</h1>
        <p style={styles.subtitle}>
          {isApproverRole(actor.role)
            ? 'View all extension requests submitted by the Assistant.'
            : 'Pick a staff member to extend their tenure — applied immediately.'}
        </p>
      </div>

      {isApproverRole(actor.role) ? <ApprovalQueue actor={actor} /> : <ExtensionFlow actor={actor} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Assistant view — select staff, then set extension                   */
/* ------------------------------------------------------------------ */
function ExtensionFlow({ actor }) {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [docs, setDocs] = useState({ rejoiningLetter: null, registrarApproval: null });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { setStaff(getStaffList()); }, []);

  const eligible = useMemo(
    () => staff.filter((s) => s.status !== 'resigned'),
    [staff]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter((s) =>
      [fullName(s), s.employeeCode, s.designation].join(' ').toLowerCase().includes(q)
    );
  }, [eligible, search]);

  const pick = (s) => {
    setSelected(s);
    setFrom(s.tenureTo || '');
    setTo('');
    setDocs({ rejoiningLetter: null, registrarApproval: null });
    setError('');
  };

  const handleFile = (key, file) => {
    setDocs((d) => ({ ...d, [key]: file ? { name: file.name, size: file.size, type: file.type } : null }));
  };

  const handleSubmit = () => {
    if (!from || !to) { setError('Please select both the From and To dates for the extension.'); return; }
    if (new Date(to) <= new Date(from)) { setError('The extension "To" date must be after the "From" date.'); return; }
    if (!docs.rejoiningLetter || !docs.registrarApproval) {
      setError('Both the Rejoining Letter and Registrar Approval copy are required.');
      return;
    }
    setError('');
    submitRequest(
      'extension',
      { staffId: selected.id, staffName: fullName(selected), extensionFrom: from, extensionTo: to },
      docs,
      actor
    );
    setSubmitted(true);
    setSelected(null);
    setTimeout(() => setSubmitted(false), 3200);
  };

  if (!selected) {
    return (
      <div className="sd-fade-in">
        {submitted && <div style={styles.successBanner}>✓ Extension submitted and applied.</div>}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            className="sd-input"
            style={styles.searchInput}
            placeholder="Search staff to extend..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.sectionBody}>
          {filtered.length === 0 && <div style={styles.emptyRow}>No staff found.</div>}
          {filtered.map((s) => {
            const meta = statusMeta(s.status);
            return (
              <div key={s.id} className="sd-row-hover" style={styles.staffRow} onClick={() => pick(s)}>
                <div style={{ flex: 2, fontWeight: 700, color: theme.textPrimary }}>{fullName(s)}</div>
                <div style={{ flex: 1.4, fontSize: 13.5, color: theme.textSecondary }}>{s.designation}</div>
                <div style={{ flex: 1.2, fontSize: 13, color: theme.textMuted }}>Current tenure to {formatDate(s.tenureTo)}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ ...styles.statusPill, color: meta.color, background: meta.bg }}>{meta.label}</span>
                </div>
                <div style={{ color: theme.amber, fontWeight: 700, fontSize: 13 }}>Extend →</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.formCard} className="sd-fade-in">
      <button style={styles.backLink} onClick={() => setSelected(null)}>← Choose a different staff member</button>
      <h3 style={styles.formHeading}>{fullName(selected)}</h3>
      <p style={styles.formSub}>{selected.designation} · Current tenure ends {formatDate(selected.tenureTo)}</p>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.fieldGrid}>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Extension From</label>
          <input className="sd-input" style={styles.input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Extension To</label>
          <input className="sd-input" style={styles.input} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div style={{ ...styles.group, marginTop: 22 }}>
        <h3 style={styles.groupTitle}>Documents</h3>
        <div style={styles.uploadGrid}>
          <UploadBox label="Rejoining Letter" file={docs.rejoiningLetter} onChange={(f) => handleFile('rejoiningLetter', f)} accent={theme.amber} />
          <UploadBox label="Registrar Approval Copy" file={docs.registrarApproval} onChange={(f) => handleFile('registrarApproval', f)} accent={theme.amber} />
        </div>
      </div>

      <button className="sd-btn" style={styles.submitBtn} onClick={handleSubmit}>
        Submit Extension →
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Approver view                                                       */
/* ------------------------------------------------------------------ */
function ApprovalQueue({ actor }) {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editFrom, setEditFrom] = useState('');
  const [editTo, setEditTo] = useState('');
  const [comment, setComment] = useState('');
  const [flash, setFlash] = useState('');

  const refresh = () => setRequests(getRequestsByType('extension'));
  useEffect(() => { refresh(); }, []);

  const pendingMine = useMemo(() => requests.filter((r) => r.status === `pending_${actor.role}`), [requests, actor.role]);
  const others = useMemo(() => requests.filter((r) => r.status !== `pending_${actor.role}`), [requests, actor.role]);

  const open = (r) => { setSelected(r); setEditFrom(r.data.extensionFrom); setEditTo(r.data.extensionTo); setComment(''); };
  const close = () => setSelected(null);

  const handleApprove = () => {
    approveRequest(selected.id, actor, { extensionFrom: editFrom, extensionTo: editTo }, comment || undefined);
    setFlash('✓ Approved and forwarded'); close(); refresh(); setTimeout(() => setFlash(''), 2500);
  };
  const handleReject = () => {
    rejectRequest(selected.id, actor, comment || 'Rejected');
    setFlash('Request rejected'); close(); refresh(); setTimeout(() => setFlash(''), 2500);
  };

  return (
    <div className="sd-fade-in">
      {flash && <div style={styles.successBanner}>{flash}</div>}


      <Section title="All extension requests">
        {others.length === 0 && <div style={styles.emptyRow}>No other requests yet.</div>}
        {others.map((r) => <RequestRow key={r.id} req={r} onClick={() => open(r)} />)}
      </Section>

      {selected && createPortal(
        <div style={styles.overlay} onClick={close}>
          <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>{selected.data.staffName}</h2>
                <p style={styles.drawerSub}>{currentHolderLabel(selected)}</p>
              </div>
              <button style={styles.closeBtn} onClick={close}>✕</button>
            </div>

            {selected.status === `pending_${actor.role}` ? (
              <div style={styles.fieldGrid}>
                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Extension From</label>
                  <input className="sd-input" style={styles.input} type="date" value={editFrom} onChange={(e) => setEditFrom(e.target.value)} />
                </div>
                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Extension To</label>
                  <input className="sd-input" style={styles.input} type="date" value={editTo} onChange={(e) => setEditTo(e.target.value)} />
                </div>
              </div>
            ) : (
              <div style={styles.fieldGrid}>
                <StaticField label="Extension From" value={formatDate(selected.data.extensionFrom)} />
                <StaticField label="Extension To" value={formatDate(selected.data.extensionTo)} />
              </div>
            )}

            <div style={styles.docsRow}>
              <DocChip label="Rejoining Letter" doc={selected.documents?.rejoiningLetter} />
              <DocChip label="Registrar Approval" doc={selected.documents?.registrarApproval} />
            </div>

            <HistoryTrail history={selected.history} />

            {selected.status === `pending_${actor.role}` && (
              <div style={styles.actionBlock}>
                <textarea className="sd-textarea" style={styles.commentBox} placeholder="Optional comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                <div style={styles.actionRow}>
                  <button className="sd-btn" style={styles.approveBtn} onClick={handleApprove}>✓ Approve & Forward</button>
                  <button className="sd-btn" style={styles.rejectBtn} onClick={handleReject}>✕ Reject</button>
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

/* ------------------------------------------------------------------ */
function UploadBox({ label, file, onChange, accent }) {
  return (
    <label style={{ ...styles.uploadBox, borderColor: file ? accent : theme.border }}>
      <input type="file" style={{ display: 'none' }} onChange={(e) => onChange(e.target.files?.[0] || null)} />
      <span style={{ fontSize: 22 }}>{file ? '📎' : '⬆️'}</span>
      <span style={styles.uploadLabel}>{label}</span>
      <span style={{ ...styles.uploadStatus, color: file ? accent : theme.textMuted }}>{file ? file.name : 'Click to upload'}</span>
    </label>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function RequestRow({ req, onClick, highlight }) {
  return (
    <div className="sd-row-hover" style={{ ...styles.staffRow, ...(highlight ? styles.requestRowHighlight : {}) }} onClick={onClick}>
      <div style={{ flex: 2, fontWeight: 700, color: theme.textPrimary }}>{req.data.staffName}</div>
      <div style={{ flex: 1.4, fontSize: 13, color: theme.textMuted }}>
        {formatDate(req.data.extensionFrom)} → {formatDate(req.data.extensionTo)}
      </div>
      <div style={{ flex: 1.6, fontSize: 13, color: theme.textMuted }}>{currentHolderLabel(req)}</div>
      <div style={{ flex: 1, fontSize: 12, color: theme.textMuted }}>{formatDate(req.createdBy.date)}</div>
    </div>
  );
}

function StaticField({ label, value }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      <div style={styles.staticValue}>{value || '—'}</div>
    </div>
  );
}

function DocChip({ label, doc }) {
  return (
    <div style={styles.docChip}>
      <span style={{ fontSize: 16 }}>📄</span>
      <div>
        <div style={styles.docChipLabel}>{label}</div>
        <div style={styles.docChipName}>{doc ? doc.name : 'Not provided'}</div>
      </div>
    </div>
  );
}

function HistoryTrail({ history }) {
  if (!history?.length) return null;
  return (
    <div style={styles.historyBlock}>
      <h4 style={styles.historyTitle}>Approval Trail</h4>
      {history.map((h, i) => (
        <div key={i} style={styles.historyRow}>
          <span>{h.role.replace('_', ' ')} · {h.name} — {h.action}</span>
          <span style={styles.historyMeta}>{formatDate(h.date)}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 24 },
  backLink: { border: 'none', background: 'none', color: theme.amber, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 640 },

  successBanner: { background: theme.emeraldLight, color: theme.emeraldDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  errorBanner: { background: theme.roseLight, color: theme.roseDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },

  searchWrap: { position: 'relative', marginBottom: 16, display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 14, fontSize: 15, opacity: 0.6 },
  searchInput: { width: '100%', padding: '12px 16px 12px 40px', borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, background: theme.surface, fontSize: 14, color: theme.textPrimary, boxShadow: theme.shadowSm },

  sectionBody: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: theme.shadowSm },
  staffRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },
  requestRowHighlight: { background: theme.amberLight },
  statusPill: { fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999 },
  emptyRow: { padding: '24px 20px', color: theme.textMuted, fontSize: 13.5 },

  formCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 28, boxShadow: theme.shadowSm },
  formHeading: { fontFamily: theme.fontDisplay, fontSize: 21, fontWeight: 800, color: theme.textPrimary, margin: '14px 0 2px' },
  formSub: { color: theme.textSecondary, fontSize: 13.5, marginBottom: 18 },

  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: theme.textSecondary },
  input: { padding: '10px 14px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary, background: theme.surface },
  staticValue: { fontSize: 13.5, color: theme.textPrimary, fontWeight: 600 },

  group: {},
  groupTitle: { fontSize: 12, fontWeight: 800, color: theme.amber, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` },
  uploadGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  uploadBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: '2px dashed', borderRadius: theme.radiusMd, padding: '22px 14px', cursor: 'pointer', background: theme.bgAlt, textAlign: 'center' },
  uploadLabel: { fontSize: 13, fontWeight: 700, color: theme.textPrimary },
  uploadStatus: { fontSize: 12 },
  submitBtn: { border: 'none', background: theme.amber, color: '#fff', padding: '14px 28px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 14.5, marginTop: 22 },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 14, fontWeight: 800, color: theme.textPrimary, marginBottom: 10 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 520, maxWidth: '100%', height: '100%', background: theme.surface, padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 21, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  closeBtn: { border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: theme.textSecondary },

  docsRow: { display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' },
  docChip: { display: 'flex', alignItems: 'center', gap: 8, background: theme.bgAlt, borderRadius: theme.radiusSm, padding: '10px 14px', flex: 1, minWidth: 180 },
  docChipLabel: { fontSize: 11, color: theme.textMuted, fontWeight: 700 },
  docChipName: { fontSize: 12.5, color: theme.textPrimary, fontWeight: 600 },

  historyBlock: { marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}` },
  historyTitle: { fontSize: 13, fontWeight: 800, color: theme.textPrimary, margin: '0 0 10px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: theme.textSecondary, padding: '6px 0', textTransform: 'capitalize' },
  historyMeta: { color: theme.textMuted, fontSize: 12 },

  actionBlock: { marginTop: 24, paddingTop: 18, borderTop: `1px solid ${theme.border}` },
  commentBox: { width: '100%', minHeight: 64, padding: 12, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13, resize: 'vertical', fontFamily: theme.fontBody },
  actionRow: { display: 'flex', gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, border: 'none', background: theme.amber, color: '#fff', padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5 },
  rejectBtn: { flex: 1, border: `1px solid ${theme.rose}`, background: theme.roseLight, color: theme.roseDark, padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5 },
};