import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  REGISTER_META,
  getCurrentActor,
  isApproverRole,
  submitEntry,
  getEntries,
  approveEntry,
  rejectEntry,
  currentHolderLabel,
  formatDate,
  formatCurrency,
  fileToMeta,
} from '../../../utils/serviceRegisterWorkflow';
import { theme, fontFaceAndUtilities } from '../../../utils/theme';
import {
  Field, StaticField, TotalRow, Section, GroupTitle, UploadBox, DocsList,
  HistoryTrail, styles as shared,
} from '../../../utils/sharedRegisterUI';

const ACCENT = theme.violet || theme.indigo;
const ACCENT_DARK = theme.violetDark || theme.indigoDark;

const EMPTY_FORM = {
  pageNo: '',
  vendorName: '',
  vendorDescription: '',
  equipmentName: '',
  serviceDescription: '',
  invoiceNo: '',
  invoiceDate: '',
  csrcProceedingsNo: '',
  csrcProceedingsDate: '',
  amount: '',
  paymentDate: '',
  remarks: '',
};

export default function ServiceRegisterAddEntry() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  useEffect(() => { setActor(getCurrentActor()); }, []);

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: ACCENT }} onClick={() => navigate('/revenue/csrc-expenditure/service-register')}>
          ← Service Register Home
        </button>
        <h1 style={styles.title}>{isApproverRole(actor.role) ? 'Service Register Entries' : 'Add Service Register Entry'}</h1>
        <p style={styles.subtitle}>
          {isApproverRole(actor.role)
            ? 'View all service register entries submitted by the Assistant.'
            : 'Log an item sent out for service or repair — registered immediately.'}
        </p>
      </div>

      {isApproverRole(actor.role) ? (
        <ApprovalQueue actor={actor} />
      ) : (
        <EntryForm actor={actor} />
      )}
    </div>
  );
}

function EntryForm({ actor }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [docs, setDocs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFiles = (fileList) => setDocs((d) => [...d, ...Array.from(fileList || []).map(fileToMeta)]);
  const removeDoc = (idx) => setDocs((d) => d.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!form.pageNo.trim()) return setError('Please enter the Page No.');
    if (!form.vendorName.trim()) return setError('Please enter the Name of the Firm / Vendor.');
    if (!form.equipmentName.trim()) return setError('Please enter the Equipment Name and Service performed.');
    if (!form.invoiceNo.trim() || !form.invoiceDate) return setError('Please enter the Invoice Number and Invoice Date.');
    if (docs.length === 0) return setError('Please upload at least one invoice / bill copy.');
    setError('');
    submitEntry({ ...form }, docs, actor);
    setSubmitted(true);
    setForm(EMPTY_FORM);
    setDocs([]);
    setTimeout(() => setSubmitted(false), 3200);
  };

  return (
    <div style={styles.formCard} className="sd-fade-in">
      {submitted && <div style={styles.successBanner}>✓ Entry submitted and registered.</div>}
      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Register Reference</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Page No." value={form.pageNo} onChange={(v) => set('pageNo', v)} />
        </div>
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Firm / Vendor</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Name of the Firm / Vendor" value={form.vendorName} onChange={(v) => set('vendorName', v)} wide />
          <Field label="Vendor Description" type="textarea" value={form.vendorDescription} onChange={(v) => set('vendorDescription', v)} wide placeholder="Address, contact, GSTIN, etc." />
        </div>
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Equipment &amp; Service</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Equipment Name" value={form.equipmentName} onChange={(v) => set('equipmentName', v)} />
          <Field label="Service Performed" type="textarea" value={form.serviceDescription} onChange={(v) => set('serviceDescription', v)} wide placeholder="Describe the service / repair carried out" />
        </div>
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Invoice &amp; Payment</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Invoice No." value={form.invoiceNo} onChange={(v) => set('invoiceNo', v)} />
          <Field label="Invoice Date" type="date" value={form.invoiceDate} onChange={(v) => set('invoiceDate', v)} />
          <Field label="Amount (₹)" type="number" value={form.amount} onChange={(v) => set('amount', v)} />
          <Field label="Payment Date" type="date" value={form.paymentDate} onChange={(v) => set('paymentDate', v)} />
        </div>
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>CSRC Proceedings</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="CSRC Proceedings No." value={form.csrcProceedingsNo} onChange={(v) => set('csrcProceedingsNo', v)} />
          <Field label="CSRC Proceedings Date" type="date" value={form.csrcProceedingsDate} onChange={(v) => set('csrcProceedingsDate', v)} />
        </div>
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Invoice / Bill Uploads</GroupTitle>
        <UploadBox docs={docs} onFiles={handleFiles} onRemove={removeDoc} accent={ACCENT} label="Click to upload invoice(s) / bill(s)" />
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Remarks</GroupTitle>
        <textarea className="sd-textarea" style={styles.remarksBox} value={form.remarks} onChange={(e) => set('remarks', e.target.value)} placeholder="Any additional notes" />
      </div>

      <button className="sd-btn" style={{ ...styles.submitBtn, background: ACCENT }} onClick={handleSubmit}>Submit &amp; Register →</button>
    </div>
  );
}

function ApprovalQueue({ actor }) {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [flash, setFlash] = useState('');

  const refresh = () => setEntries(getEntries());
  useEffect(() => { refresh(); }, []);

  const pendingMine = useMemo(() => entries.filter((e) => e.status === `pending_${actor.role}`), [entries, actor.role]);
  const others = useMemo(() => entries.filter((e) => e.status !== `pending_${actor.role}`), [entries, actor.role]);

  const open = (e) => { setSelected(e); setComment(''); };
  const close = () => setSelected(null);
  const handleApprove = () => { approveEntry(selected.id, actor, null, comment || undefined); setFlash('✓ Approved and forwarded'); close(); refresh(); setTimeout(() => setFlash(''), 2500); };
  const handleReject = () => { rejectEntry(selected.id, actor, comment || 'Rejected'); setFlash('Entry rejected'); close(); refresh(); setTimeout(() => setFlash(''), 2500); };

  return (
    <div className="sd-fade-in">
      {flash && <div style={styles.successBanner}>{flash}</div>}
      <Section title="All service register entries">
        {others.length === 0 && <div style={shared.emptyRow}>No other entries yet.</div>}
        {others.map((e) => <EntryRow key={e.id} entry={e} onClick={() => open(e)} />)}
      </Section>
      {selected && createPortal(
        <ServiceEntryDrawer entry={selected} onClose={close} actor={actor} comment={comment} setComment={setComment} onApprove={handleApprove} onReject={handleReject} />,
        document.body
      )}
    </div>
  );
}

export function ServiceEntryDrawer({ entry, onClose, actor, comment, setComment, onApprove, onReject }) {
  const actionable = actor && entry.status === `pending_${actor.role}`;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
        <div style={styles.drawerHeader}>
          <div>
            <div style={{ ...styles.slBadge, background: `${ACCENT}22`, color: ACCENT_DARK }}>SI No. {entry.slNo} · Page {entry.data.pageNo || '—'}</div>
            <h2 style={styles.drawerTitle}>{entry.data.vendorName}</h2>
            <p style={styles.drawerSub}>{currentHolderLabel(entry)}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.fieldGrid}>
          <StaticField label="Equipment Name" value={entry.data.equipmentName} />
          <StaticField label="Invoice No." value={entry.data.invoiceNo} />
          <StaticField label="Invoice Date" value={formatDate(entry.data.invoiceDate)} />
          <StaticField label="Amount" value={formatCurrency(entry.data.amount)} />
          <StaticField label="Payment Date" value={formatDate(entry.data.paymentDate)} />
          <StaticField label="CSRC Proceedings No." value={entry.data.csrcProceedingsNo} />
          <StaticField label="CSRC Proceedings Date" value={formatDate(entry.data.csrcProceedingsDate)} />
        </div>

        {entry.data.vendorDescription && (
          <>
            <h4 style={styles.drawerSectionTitle}>Vendor Description</h4>
            <p style={styles.remarksText}>{entry.data.vendorDescription}</p>
          </>
        )}
        {entry.data.serviceDescription && (
          <>
            <h4 style={styles.drawerSectionTitle}>Service Performed</h4>
            <p style={styles.remarksText}>{entry.data.serviceDescription}</p>
          </>
        )}
        {entry.data.remarks && (
          <>
            <h4 style={styles.drawerSectionTitle}>Remarks</h4>
            <p style={styles.remarksText}>{entry.data.remarks}</p>
          </>
        )}

        <h4 style={styles.drawerSectionTitle}>Invoice / Bill Documents</h4>
        <DocsList docs={entry.documents} />

        <HistoryTrail history={entry.history} />

        {actionable && onApprove && (
          <div style={styles.actionBlock}>
            <textarea className="sd-textarea" style={styles.commentBox} placeholder="Optional comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <div style={styles.actionRow}>
              <button className="sd-btn" style={{ ...styles.approveBtn, background: ACCENT }} onClick={onApprove}>✓ Approve &amp; Forward</button>
              <button className="sd-btn" style={styles.rejectBtn} onClick={onReject}>✕ Reject</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryRow({ entry, onClick, highlight }) {
  return (
    <div className="sd-row-hover" style={{ ...styles.entryRow, ...(highlight ? { background: `${ACCENT}14` } : {}) }} onClick={onClick}>
      <div style={{ flex: 0.5, fontWeight: 700, color: theme.textMuted }}>#{entry.slNo}</div>
      <div style={{ flex: 0.6, fontSize: 12.5, color: theme.textMuted }}>Pg {entry.data.pageNo || '—'}</div>
      <div style={{ flex: 2, fontWeight: 700, color: theme.textPrimary }}>{entry.data.vendorName}</div>
      <div style={{ flex: 1.8, fontSize: 13, color: theme.textMuted }}>{entry.data.equipmentName}</div>
      <div style={{ flex: 1.2, fontSize: 13.5, color: theme.textSecondary }}>{formatCurrency(entry.data.amount)}</div>
      <div style={{ flex: 1.6, fontSize: 13, color: theme.textMuted }}>{currentHolderLabel(entry)}</div>
      <div style={{ flex: 1, fontSize: 12, color: theme.textMuted }}>{formatDate(entry.createdBy.date)}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 24 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 680 },
  successBanner: { background: theme.emeraldLight, color: theme.emeraldDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  errorBanner: { background: theme.roseLight, color: theme.roseDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  formCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 28, boxShadow: theme.shadowSm },
  group: { marginBottom: 28 },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  remarksBox: { width: '100%', minHeight: 72, padding: 12, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13, resize: 'vertical', fontFamily: theme.fontBody },
  remarksText: { fontSize: 13.5, color: theme.textSecondary, lineHeight: 1.6, background: theme.bgAlt, padding: '12px 14px', borderRadius: theme.radiusSm },
  submitBtn: { border: 'none', color: '#fff', padding: '14px 28px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 14.5, cursor: 'pointer' },
  entryRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 620, maxWidth: '100%', height: '100%', background: theme.surface, padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  slBadge: { display: 'inline-block', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, marginBottom: 8 },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 21, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  drawerSectionTitle: { fontSize: 13, fontWeight: 800, color: theme.textPrimary, margin: '22px 0 10px' },
  closeBtn: { border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: theme.textSecondary },
  actionBlock: { marginTop: 24, paddingTop: 18, borderTop: `1px solid ${theme.border}` },
  commentBox: { width: '100%', minHeight: 64, padding: 12, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13, resize: 'vertical', fontFamily: theme.fontBody },
  actionRow: { display: 'flex', gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, border: 'none', color: '#fff', padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' },
  rejectBtn: { flex: 1, border: `1px solid ${theme.rose}`, background: theme.roseLight, color: theme.roseDark, padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' },
};