import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getCurrentActor, isApproverRole, formatDate, ROLE_LABELS } from '../../utils/staffWorkflow';
import {
  MONTHS,
  buildOTSummaryForMonth,
  isMonthAlreadySanctioned,
  submitOTSanction,
  getOTSanctions,
  approveOTSanction,
  rejectOTSanction,
  currentOTSanctionHolderLabel,
  formatCurrency,
} from '../../utils/otWorkflow';
import { downloadOTBillPdf } from '../../utils/otPdf';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

const NOW = new Date();

export default function SanctionOT() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });

  useEffect(() => { setActor(getCurrentActor()); }, []);

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={styles.backLink} onClick={() => navigate('/revenue/staff-ot')}>← Staff OT Home</button>
        <h1 style={styles.title}>OT Sanctions</h1>
        <p style={styles.subtitle}>
          {isApproverRole(actor.role)
            ? 'View all OT sanctions submitted by the Assistant.'
            : 'Pick a month, review the OT totals computed from logged hours, and sanction directly.'}
        </p>
      </div>
      {isApproverRole(actor.role) ? <ApprovalQueue actor={actor} /> : <SanctionForm actor={actor} />}
    </div>
  );
}

function SanctionForm({ actor }) {
  const [month, setMonth] = useState(MONTHS[NOW.getMonth()]);
  const [year, setYear] = useState(String(NOW.getFullYear()));
  const [procNo, setProcNo] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const summary = useMemo(() => buildOTSummaryForMonth(month, year), [month, year]);

  useEffect(() => { setSelectedIds(new Set()); }, [month, year]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const allSelected = summary.length > 0 && summary.every((r) => selectedIds.has(r.staffId));
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allSelected) return new Set();
      return new Set(summary.map((r) => r.staffId));
    });
  };

  const selectedRows = summary.filter((r) => selectedIds.has(r.staffId));
  const selectedTotal = selectedRows.reduce((sum, r) => sum + r.totalAmount, 0);

  const handleSubmit = () => {
    if (selectedRows.length === 0) {
      setError('Select at least one staff member to sanction OT for.');
      return;
    }
    setError('');
    submitOTSanction({ month, year, procNo, entries: selectedRows }, actor);
    setSubmitted(true);
    setSelectedIds(new Set());
    setTimeout(() => setSubmitted(false), 3400);
  };

  return (
    <div className="sd-fade-in">
      {submitted && (
        <div style={styles.successBanner}>✓ OT sanctioned for {month} {year}.</div>
      )}
      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.metaCard}>
        <div style={styles.metaGrid}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Month</label>
            <select className="sd-select" style={styles.input} value={month} onChange={(e) => setMonth(e.target.value)}>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Year</label>
            <input className="sd-input" style={styles.input} type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Proc No (optional)</label>
            <input className="sd-input" style={styles.input} value={procNo} onChange={(e) => setProcNo(e.target.value)} placeholder="e.g. 2627OT06" />
          </div>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Total Hours</th>
                <th style={styles.th}>Rate / Hour</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 && (
                <tr><td colSpan={7} style={styles.emptyCell}>No OT entries logged for {month} {year} yet. Add entries in OT Details first.</td></tr>
              )}
              {summary.map((r) => {
                const checked = selectedIds.has(r.staffId);
                const already = isMonthAlreadySanctioned(month, year, r.staffId);
                return (
                  <tr key={r.staffId} style={checked ? styles.trSelected : undefined}>
                    <td style={styles.td}>
                      <input type="checkbox" checked={checked} disabled={already} onChange={() => toggleSelect(r.staffId)} />
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700, color: theme.textPrimary }}>{r.staffName}</td>
                    <td style={styles.td}>{r.designation}</td>
                    <td style={styles.td}>{r.totalHours}</td>
                    <td style={styles.td}>{formatCurrency(r.ratePerHour)}</td>
                    <td style={{ ...styles.td, fontWeight: 800, color: theme.emeraldDark }}>{formatCurrency(r.totalAmount)}</td>
                    <td style={styles.td}>
                      {already ? <span style={styles.alreadyPill}>Already sanctioned</span> : <span style={styles.readyPill}>Ready</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.footerBar}>
        <div><strong>{selectedRows.length}</strong> staff selected · Total <strong>{formatCurrency(selectedTotal)}</strong></div>
        <button className="sd-btn" style={styles.submitBtn} onClick={handleSubmit}>Generate &amp; Sanction →</button>
      </div>
    </div>
  );
}

function ApprovalQueue({ actor }) {
  const [sanctions, setSanctions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [flash, setFlash] = useState('');
  const [downloading, setDownloading] = useState(false);

  const refresh = () => setSanctions(getOTSanctions());
  useEffect(() => { refresh(); }, []);

  const pendingMine = useMemo(() => sanctions.filter((r) => r.status === `pending_${actor.role}`), [sanctions, actor.role]);
  const others = useMemo(() => sanctions.filter((r) => r.status !== `pending_${actor.role}`), [sanctions, actor.role]);

  const open = (r) => { setSelected(r); setComment(''); };
  const close = () => setSelected(null);

  const handleApprove = () => {
    approveOTSanction(selected.id, actor, comment || undefined);
    setFlash('✓ Approved and forwarded');
    close(); refresh();
    setTimeout(() => setFlash(''), 2500);
  };
  const handleReject = () => {
    rejectOTSanction(selected.id, actor, comment || 'Rejected');
    setFlash('Sanction rejected');
    close(); refresh();
    setTimeout(() => setFlash(''), 2500);
  };
  const handleDownload = async (sanction) => {
    setDownloading(true);
    try { await downloadOTBillPdf(sanction); } finally { setDownloading(false); }
  };

  return (
    <div className="sd-fade-in">
      {flash && <div style={styles.successBanner}>{flash}</div>}

      <Section title="All OT sanctions">
        {others.length === 0 && <div style={styles.emptyRow}>No other sanctions yet.</div>}
        {others.map((r) => <SanctionRow key={r.id} req={r} onClick={() => open(r)} />)}
      </Section>

      {selected && createPortal(
        <div style={styles.overlay} onClick={close}>
          <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>{selected.month} {selected.year} · Overtime</h2>
                <p style={styles.drawerSub}>{currentOTSanctionHolderLabel(selected)} · {selected.entries.length} staff · {formatCurrency(selected.totalAmount)}</p>
              </div>
              <button style={styles.closeBtn} onClick={close}>✕</button>
            </div>

            <button className="sd-btn" style={styles.downloadBtn} onClick={() => handleDownload(selected)} disabled={downloading}>
              {downloading ? 'Preparing PDF…' : '⬇ Download Bill (PDF)'}
            </button>

            <div style={styles.breakdownWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Staff</th>
                    <th style={styles.th}>Hours</th>
                    <th style={styles.th}>Rate</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.entries.map((e) => (
                    <tr key={e.staffId}>
                      <td style={styles.td}>{e.staffName}<br /><span style={{ fontSize: 11, color: theme.textMuted }}>{e.designation}</span></td>
                      <td style={styles.td}>{e.totalHours}</td>
                      <td style={styles.td}>{formatCurrency(e.ratePerHour)}</td>
                      <td style={{ ...styles.td, fontWeight: 800 }}>{formatCurrency(e.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected.entries.map((e) => (
              <div key={e.staffId} style={styles.dayWiseBlock}>
                <h4 style={styles.dayWiseTitle}>{e.staffName} — day-wise</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>In</th>
                      <th style={styles.th}>Out</th>
                      <th style={styles.th}>OT Before</th>
                      <th style={styles.th}>OT After</th>
                      <th style={styles.th}>Hrs/Day</th>
                      <th style={styles.th}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {e.days.map((d) => (
                      <tr key={d.id}>
                        <td style={styles.td}>{formatDate(d.date)}</td>
                        <td style={styles.td}>{d.inTime || '—'}</td>
                        <td style={styles.td}>{d.outTime || '—'}</td>
                        <td style={styles.td}>{d.otBeforeOfficeHours}</td>
                        <td style={styles.td}>{d.otAfterOfficeHours}</td>
                        <td style={styles.td}>{d.totalHoursForDay}</td>
                        <td style={styles.td}>{d.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <HistoryTrail history={selected.history} />

            {selected.status === `pending_${actor.role}` && (
              <div style={styles.actionBlock}>
                <textarea className="sd-textarea" style={styles.commentBox} placeholder="Optional comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                <div style={styles.actionRow}>
                  <button className="sd-btn" style={styles.approveBtn} onClick={handleApprove}>✓ Approve &amp; Forward</button>
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

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}
function SanctionRow({ req, onClick, highlight }) {
  return (
    <div className="sd-row-hover" style={{ ...styles.requestRow, ...(highlight ? styles.requestRowHighlight : {}) }} onClick={onClick}>
      <div style={{ flex: 1.6, fontWeight: 700, color: theme.textPrimary }}>{req.month} {req.year}</div>
      <div style={{ flex: 1, fontSize: 13, color: theme.textMuted }}>{req.entries.length} staff</div>
      <div style={{ flex: 1.2, fontSize: 13, color: theme.textMuted }}>{formatCurrency(req.totalAmount)}</div>
      <div style={{ flex: 1.6, fontSize: 13, color: theme.textMuted }}>{currentOTSanctionHolderLabel(req)}</div>
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
          <span>{ROLE_LABELS[h.role] || h.role} · {h.name} — {h.action}</span>
          <span style={styles.historyMeta}>{formatDate(h.date)}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 24 },
  backLink: { border: 'none', background: 'none', color: theme.emerald, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 680 },
  successBanner: { background: theme.emeraldLight, color: theme.emeraldDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  errorBanner: { background: theme.roseLight, color: theme.roseDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  metaCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 20, boxShadow: theme.shadowSm, marginBottom: 18 },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: theme.textSecondary },
  input: { padding: '10px 12px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary, background: theme.surface },
  tableWrap: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, boxShadow: theme.shadowSm, marginBottom: 18, overflow: 'hidden' },
  tableScroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', background: theme.bgAlt, fontSize: 11.5, fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' },
  td: { padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary, verticalAlign: 'middle', whiteSpace: 'nowrap' },
  trSelected: { background: theme.emeraldLight },
  emptyCell: { padding: '30px 16px', textAlign: 'center', color: theme.textMuted, whiteSpace: 'normal' },
  readyPill: { fontSize: 11, fontWeight: 700, color: theme.emeraldDark, background: theme.emeraldLight, padding: '3px 9px', borderRadius: 999 },
  alreadyPill: { fontSize: 11, fontWeight: 700, color: theme.textMuted, background: theme.bgAlt, padding: '3px 9px', borderRadius: 999 },
  footerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusLg, padding: '16px 22px', boxShadow: theme.shadowSm, fontSize: 14, color: theme.textPrimary },
  submitBtn: { border: 'none', background: theme.emerald, color: '#fff', padding: '12px 22px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 14 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 14, fontWeight: 800, color: theme.textPrimary, marginBottom: 10 },
  sectionBody: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: theme.shadowSm },
  requestRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },
  requestRowHighlight: { background: theme.emeraldLight },
  emptyRow: { padding: '24px 20px', color: theme.textMuted, fontSize: 13.5 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 760, maxWidth: '92vw', height: '100%', background: theme.surface, padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 20, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  closeBtn: { border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: theme.textSecondary },
  downloadBtn: { border: `1px solid ${theme.indigo}`, background: theme.indigoLight, color: theme.indigoDark, padding: '10px 16px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13, margin: '18px 0' },
  breakdownWrap: { border: `1px solid ${theme.border}`, borderRadius: theme.radiusMd, overflow: 'auto' },
  dayWiseBlock: { marginTop: 20 },
  dayWiseTitle: { fontSize: 13, fontWeight: 800, color: theme.textPrimary, margin: '0 0 8px' },
  historyBlock: { marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}` },
  historyTitle: { fontSize: 13, fontWeight: 800, color: theme.textPrimary, margin: '0 0 10px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: theme.textSecondary, padding: '6px 0', textTransform: 'capitalize' },
  historyMeta: { color: theme.textMuted, fontSize: 12 },
  actionBlock: { marginTop: 24, paddingTop: 18, borderTop: `1px solid ${theme.border}` },
  commentBox: { width: '100%', minHeight: 64, padding: 12, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13, resize: 'vertical', fontFamily: theme.fontBody },
  actionRow: { display: 'flex', gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, border: 'none', background: theme.emerald, color: '#fff', padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5 },
  rejectBtn: { flex: 1, border: `1px solid ${theme.rose}`, background: theme.roseLight, color: theme.roseDark, padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5 },
};