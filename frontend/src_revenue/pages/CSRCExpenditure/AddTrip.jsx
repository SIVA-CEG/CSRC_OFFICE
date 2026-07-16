import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  getCurrentActor,
  getVehicleById,
  isApproverRole,
  submitTripEntry,
  getEntriesForVehicle,
  approveEntry,
  rejectEntry,
  computeKmDone,
  currentHolderLabel,
  formatDate,
  fileToMeta,
} from '../../utils/logisticsWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';
import {
  Field, StaticField, Section, GroupTitle, UploadBox, DocsList, HistoryTrail, styles as shared,
} from '../../utils/sharedRegisterUI';

const ACCENT = theme.amber || theme.indigo;
const ACCENT_DARK = theme.amberDark || theme.indigoDark;

const EMPTY_FORM = {
  date: '', startTime: '', startOdometer: '', returnTime: '', returnOdometer: '',
  placesVisited: '', purpose: '', personTravelled: '', remarks: '',
  hasFuelEntry: false,
  lubricationOilFilled: '', fuelInTankLitres: '', fuelIssuedLitres: '',
  fuelOdometerReading: '', billNo: '', billDate: '',
};

export default function AddTrip() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const vehicle = useMemo(() => getVehicleById(vehicleId), [vehicleId]);
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  useEffect(() => { setActor(getCurrentActor()); }, []);

  if (!vehicle) {
    return (
      <div style={styles.root}>
        <p>Vehicle not found. <button onClick={() => navigate('/revenue/csrc-expenditure/logistics')}>← Back to Logistics</button></p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: ACCENT }} onClick={() => navigate('/revenue/csrc-expenditure/logistics')}>
          ← Logistics Home
        </button>
        <h1 style={styles.title}>{isApproverRole(actor.role) ? 'Trip Entries' : 'Log Trip'} — {vehicle.vehicleNumber}</h1>
        <p style={styles.subtitle}>
          {isApproverRole(actor.role)
            ? 'View all trip / fuel entries submitted by the Assistant.'
            : 'Record start & return odometer readings, places visited, and fuel issued if any — logged immediately.'}
        </p>
      </div>

      {isApproverRole(actor.role) ? (
        <ApprovalQueue actor={actor} vehicle={vehicle} />
      ) : (
        <EntryForm actor={actor} vehicle={vehicle} />
      )}
    </div>
  );
}

function EntryForm({ actor, vehicle }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [docs, setDocs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const kmDone = useMemo(() => computeKmDone(form.startOdometer, form.returnOdometer), [form.startOdometer, form.returnOdometer]);

  const handleFiles = (fileList) => setDocs((d) => [...d, ...Array.from(fileList || []).map(fileToMeta)]);
  const removeDoc = (idx) => setDocs((d) => d.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!form.date) return setError('Please enter the date of journey.');
    if (!form.startOdometer || !form.returnOdometer) return setError('Please enter both start and return odometer readings.');
    if (parseFloat(form.returnOdometer) < parseFloat(form.startOdometer)) return setError('Return odometer reading cannot be less than the start reading.');
    if (!form.purpose.trim()) return setError('Please enter the purpose of journey / person who travelled.');
    if (form.hasFuelEntry && !form.fuelIssuedLitres) return setError('Please enter fuel issued (litres) or turn off "Fuel issued today".');
    setError('');
    submitTripEntry(vehicle.id, { ...form, fuelOdometerReading: form.fuelOdometerReading || form.returnOdometer }, docs, actor);
    setSubmitted(true);
    setForm(EMPTY_FORM);
    setDocs([]);
    setTimeout(() => setSubmitted(false), 3200);
  };

  return (
    <div style={styles.formCard} className="sd-fade-in">
      {submitted && <div style={styles.successBanner}>✓ Trip entry submitted and logged.</div>}
      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Journey</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Date" type="date" value={form.date} onChange={(v) => set('date', v)} />
          <Field label="Start Time" type="time" value={form.startTime} onChange={(v) => set('startTime', v)} />
          <Field label="Start Odometer Reading" type="number" value={form.startOdometer} onChange={(v) => set('startOdometer', v)} />
          <Field label="Return Time" type="time" value={form.returnTime} onChange={(v) => set('returnTime', v)} />
          <Field label="Return Odometer Reading" type="number" value={form.returnOdometer} onChange={(v) => set('returnOdometer', v)} />
          <StaticField label="KM Done (auto-calculated)" value={`${kmDone} km`} />
        </div>
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Places Visited &amp; Purpose</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Starting Place &amp; Places Visited" type="textarea" value={form.placesVisited} onChange={(v) => set('placesVisited', v)} wide placeholder="e.g. CSRC - Dr. House Porur - AU Local CSRC - AU Local CSRC - Dr. House Porur - CSRC" />
          <Field label="Purpose of Journey &amp; Person Who Travelled" value={form.purpose} onChange={(v) => set('purpose', v)} wide placeholder="e.g. Director CSRC" />
        </div>
      </div>

      <div style={styles.group}>
        <div style={styles.fuelToggleRow}>
          <GroupTitle accent={ACCENT}>Fuel Issued Today?</GroupTitle>
          <label style={styles.toggleLabel}>
            <input type="checkbox" checked={form.hasFuelEntry} onChange={(e) => set('hasFuelEntry', e.target.checked)} /> Fuel / lubrication issued on this trip
          </label>
        </div>
        {form.hasFuelEntry && (
          <div style={styles.fieldGrid}>
            <Field label="Lubrication Oil Filled" value={form.lubricationOilFilled} onChange={(v) => set('lubricationOilFilled', v)} placeholder="e.g. 1L" />
            <Field label="Fuel in Tank (litres)" type="number" value={form.fuelInTankLitres} onChange={(v) => set('fuelInTankLitres', v)} />
            <Field label="Fuel Issued (litres)" type="number" value={form.fuelIssuedLitres} onChange={(v) => set('fuelIssuedLitres', v)} />
            <Field label="Odometer Reading at Fuel Issue" type="number" value={form.fuelOdometerReading} onChange={(v) => set('fuelOdometerReading', v)} placeholder="Defaults to return odometer" />
            <Field label="Bill No." value={form.billNo} onChange={(v) => set('billNo', v)} />
            <Field label="Bill Date" type="date" value={form.billDate} onChange={(v) => set('billDate', v)} />
          </div>
        )}
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Fuel Bill / Supporting Documents</GroupTitle>
        <UploadBox docs={docs} onFiles={handleFiles} onRemove={removeDoc} accent={ACCENT} label="Click to upload fuel bill(s) / supporting documents" />
      </div>

      <div style={styles.group}>
        <GroupTitle accent={ACCENT}>Remarks</GroupTitle>
        <textarea className="sd-textarea" style={styles.remarksBox} value={form.remarks} onChange={(e) => set('remarks', e.target.value)} />
      </div>

      <button className="sd-btn" style={{ ...styles.submitBtn, background: ACCENT }} onClick={handleSubmit}>Submit &amp; Log Trip →</button>
    </div>
  );
}

function ApprovalQueue({ actor, vehicle }) {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [flash, setFlash] = useState('');

  const refresh = () => setEntries(getEntriesForVehicle(vehicle.id));
  useEffect(() => { refresh(); }, [vehicle.id]);

  const pendingMine = useMemo(() => entries.filter((e) => e.status === `pending_${actor.role}`), [entries, actor.role]);
  const others = useMemo(() => entries.filter((e) => e.status !== `pending_${actor.role}`), [entries, actor.role]);

  const open = (e) => { setSelected(e); setComment(''); };
  const close = () => setSelected(null);
  const handleApprove = () => { approveEntry(selected.id, actor, null, comment || undefined); setFlash('✓ Approved and forwarded'); close(); refresh(); setTimeout(() => setFlash(''), 2500); };
  const handleReject = () => { rejectEntry(selected.id, actor, comment || 'Rejected'); setFlash('Entry rejected'); close(); refresh(); setTimeout(() => setFlash(''), 2500); };

  return (
    <div className="sd-fade-in">
      {flash && <div style={styles.successBanner}>{flash}</div>}
      <Section title="All trip entries">
        {others.length === 0 && <div style={shared.emptyRow}>No other entries yet.</div>}
        {others.map((e) => <EntryRow key={e.id} entry={e} onClick={() => open(e)} />)}
      </Section>
      {selected && createPortal(
        <TripEntryDrawer entry={selected} onClose={close} actor={actor} comment={comment} setComment={setComment} onApprove={handleApprove} onReject={handleReject} />,
        document.body
      )}
    </div>
  );
}

export function TripEntryDrawer({ entry, onClose, actor, comment, setComment, onApprove, onReject }) {
  const actionable = actor && entry.status === `pending_${actor.role}`;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
        <div style={styles.drawerHeader}>
          <div>
            <div style={{ ...styles.slBadge, background: `${ACCENT}22`, color: ACCENT_DARK }}>SI No. {entry.slNo} · {formatDate(entry.data.date)}</div>
            <h2 style={styles.drawerTitle}>{entry.data.purpose}</h2>
            <p style={styles.drawerSub}>{currentHolderLabel(entry)}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.fieldGrid}>
          <StaticField label="Start Time" value={entry.data.startTime} />
          <StaticField label="Start Odometer" value={entry.data.startOdometer} />
          <StaticField label="Return Time" value={entry.data.returnTime} />
          <StaticField label="Return Odometer" value={entry.data.returnOdometer} />
          <StaticField label="KM Done" value={`${entry.data.kmDone} km`} />
        </div>

        <h4 style={styles.drawerSectionTitle}>Places Visited</h4>
        <p style={styles.remarksText}>{entry.data.placesVisited || '—'}</p>

        {entry.data.hasFuelEntry && (
          <>
            <h4 style={styles.drawerSectionTitle}>Fuel Issued</h4>
            <div style={styles.fieldGrid}>
              <StaticField label="Lubrication Oil Filled" value={entry.data.lubricationOilFilled} />
              <StaticField label="Fuel in Tank (L)" value={entry.data.fuelInTankLitres} />
              <StaticField label="Fuel Issued (L)" value={entry.data.fuelIssuedLitres} />
              <StaticField label="Odometer at Fuel Issue" value={entry.data.fuelOdometerReading} />
              <StaticField label="Bill No." value={entry.data.billNo} />
              <StaticField label="Bill Date" value={formatDate(entry.data.billDate)} />
            </div>
          </>
        )}

        {entry.data.remarks && (
          <>
            <h4 style={styles.drawerSectionTitle}>Remarks</h4>
            <p style={styles.remarksText}>{entry.data.remarks}</p>
          </>
        )}

        <h4 style={styles.drawerSectionTitle}>Documents</h4>
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
      <div style={{ flex: 1, fontSize: 13, color: theme.textMuted }}>{formatDate(entry.data.date)}</div>
      <div style={{ flex: 2, fontWeight: 700, color: theme.textPrimary }}>{entry.data.purpose}</div>
      <div style={{ flex: 1, fontSize: 13, color: theme.textSecondary }}>{entry.data.kmDone} km</div>
      <div style={{ flex: 1, fontSize: 12.5, color: theme.textMuted }}>{entry.data.hasFuelEntry ? `⛽ ${entry.data.fuelIssuedLitres} L` : '—'}</div>
      <div style={{ flex: 1.6, fontSize: 13, color: theme.textMuted }}>{currentHolderLabel(entry)}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 24 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 26, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 680 },
  successBanner: { background: theme.emeraldLight, color: theme.emeraldDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  errorBanner: { background: theme.roseLight, color: theme.roseDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  formCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 28, boxShadow: theme.shadowSm },
  group: { marginBottom: 28 },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  fuelToggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  toggleLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: theme.textSecondary, marginBottom: 14 },
  remarksBox: { width: '100%', minHeight: 72, padding: 12, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13, resize: 'vertical', fontFamily: theme.fontBody },
  remarksText: { fontSize: 13.5, color: theme.textSecondary, lineHeight: 1.6, background: theme.bgAlt, padding: '12px 14px', borderRadius: theme.radiusSm, whiteSpace: 'pre-line' },
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