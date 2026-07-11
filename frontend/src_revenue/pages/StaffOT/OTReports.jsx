import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getCurrentActor, formatDate, ROLE_LABELS } from '../../utils/staffWorkflow';
import { MONTHS, getAllOTReports, currentOTSanctionHolderLabel, formatCurrency } from '../../utils/otWorkflow';
import { downloadOTBillPdf } from '../../utils/otPdf';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

export default function OTReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => { setReports(getAllOTReports()); }, []);

  const years = useMemo(() => ['all', ...Array.from(new Set(reports.map((r) => r.year))).sort((a, b) => b - a)], [reports]);

  const matchesStatus = (r, key) => {
    if (key === 'all') return true;
    if (key === 'pending') return r.status.startsWith('pending_');
    return r.status === key;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports
      .filter((r) => monthFilter === 'all' || r.month === monthFilter)
      .filter((r) => yearFilter === 'all' || String(r.year) === String(yearFilter))
      .filter((r) => matchesStatus(r, statusFilter))
      .filter((r) => !q || r.entries.some((e) => e.staffName.toLowerCase().includes(q)) || (r.procNo || '').toLowerCase().includes(q));
  }, [reports, monthFilter, yearFilter, statusFilter, search]);

  const grandTotal = filtered.reduce((sum, r) => sum + r.totalAmount, 0);

  const handleDownload = async (r) => {
    setDownloadingId(r.id);
    try { await downloadOTBillPdf(r); } finally { setDownloadingId(null); }
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <button style={styles.backLink} onClick={() => navigate('/revenue/staff-ot')}>← Staff OT Home</button>
        <h1 style={styles.title}>OT Reports</h1>
        <p style={styles.subtitle}>Every OT sanction — past and present — filterable by month and status.</p>
      </div>

      <div style={styles.filterCard} className="sd-fade-in">
        <div style={styles.filterGrid}>
          <FilterSelect label="Month" value={monthFilter} onChange={setMonthFilter} options={['all', ...MONTHS]} allLabel="All Months" />
          <FilterSelect label="Year" value={yearFilter} onChange={setYearFilter} options={years} allLabel="All Years" />
        </div>
        <div style={styles.statusRow}>
          {STATUS_FILTERS.map((f) => (
            <button key={f.key} className="sd-tab" style={{ ...styles.statusChip, ...(statusFilter === f.key ? styles.statusChipActive : {}) }} onClick={() => setStatusFilter(f.key)}>
              {f.label}
            </button>
          ))}
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input className="sd-input" style={styles.searchInput} placeholder="Search staff name or Proc No..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={styles.summaryRow} className="sd-fade-in">
        <StatChip label="Batches" value={filtered.length} color={theme.indigo} bg={theme.indigoLight} />
        <StatChip label="Total Amount" value={formatCurrency(grandTotal)} color={theme.emerald} bg={theme.emeraldLight} wide />
      </div>

      <div style={styles.list} className="sd-fade-in">
        {filtered.length === 0 && <div style={styles.emptyState}>No OT reports match your filters.</div>}
        {filtered.map((r) => (
          <div key={r.id} className="sd-row-hover" style={styles.reportRow} onClick={() => setSelected(r)}>
            <div style={{ flex: 1.6 }}>
              <div style={styles.reportTitle}>{r.month} {r.year}</div>
              <div style={styles.reportSub}>{r.procNo || 'No Proc No'}</div>
            </div>
            <div style={{ flex: 1, fontSize: 13, color: theme.textMuted }}>{r.entries.length} staff</div>
            <div style={{ flex: 1.2, fontSize: 13.5, fontWeight: 700, color: theme.textPrimary }}>{formatCurrency(r.totalAmount)}</div>
            <div style={{ flex: 1.4 }}><StatusPill status={r.status} /></div>
            <div style={{ flex: 1.4, fontSize: 12, color: theme.textMuted }}>{currentOTSanctionHolderLabel(r)}</div>
            <button className="sd-btn" style={styles.rowDownloadBtn} onClick={(e) => { e.stopPropagation(); handleDownload(r); }} disabled={downloadingId === r.id}>
              {downloadingId === r.id ? '…' : '⬇ PDF'}
            </button>
          </div>
        ))}
      </div>

      {selected && createPortal(
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>{selected.month} {selected.year} · Overtime</h2>
                <p style={styles.drawerSub}>{selected.procNo || 'No Proc No'} · {selected.entries.length} staff · {formatCurrency(selected.totalAmount)}</p>
                <div style={{ marginTop: 8 }}><StatusPill status={selected.status} /></div>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>

            <button className="sd-btn" style={styles.downloadBtn} onClick={() => handleDownload(selected)} disabled={downloadingId === selected.id}>
              {downloadingId === selected.id ? 'Preparing PDF…' : '⬇ Download Bill (PDF)'}
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

            <div style={styles.historyBlock}>
              <h4 style={styles.historyTitle}>Approval Trail</h4>
              {(selected.history || []).map((h, i) => (
                <div key={i} style={styles.historyRow}>
                  <span>{ROLE_LABELS[h.role] || h.role} · {h.name} — {h.action}</span>
                  <span style={styles.historyMeta}>{formatDate(h.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      <select className="sd-select" style={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o === 'all' ? allLabel : o}</option>)}
      </select>
    </div>
  );
}
function StatChip({ label, value, color, bg, wide }) {
  return (
    <div style={{ ...styles.statChip, background: bg, minWidth: wide ? 200 : 130 }}>
      <div style={{ ...styles.statValue, color, fontSize: wide ? 20 : 26 }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}
function StatusPill({ status }) {
  let label = status, color = theme.textMuted, bg = theme.bgAlt;
  if (status === 'approved') { label = 'Approved'; color = theme.emeraldDark; bg = theme.emeraldLight; }
  else if (status === 'rejected') { label = 'Rejected'; color = theme.roseDark; bg = theme.roseLight; }
  else if (status.startsWith('pending_')) {
    const role = status.replace('pending_', '');
    label = `Pending · ${ROLE_LABELS[role] || role}`;
    color = theme.amberDark; bg = theme.amberLight;
  }
  return <span style={{ ...styles.statusPill, color, background: bg }}>{label}</span>;
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 20 },
  backLink: { border: 'none', background: 'none', color: theme.rose, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 640 },
  filterCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 18, boxShadow: theme.shadowSm, marginBottom: 18 },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: theme.textSecondary },
  input: { padding: '10px 12px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary, background: theme.surface },
  statusRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  statusChip: { border: `1px solid ${theme.border}`, background: theme.surface, color: theme.textSecondary, padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600 },
  statusChipActive: { background: theme.rose, color: '#fff', borderColor: theme.rose },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: 220 },
  searchIcon: { position: 'absolute', left: 14, fontSize: 15, opacity: 0.6 },
  searchInput: { width: '100%', padding: '10px 14px 10px 38px', borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, background: theme.bgAlt, fontSize: 13.5, color: theme.textPrimary },
  summaryRow: { display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' },
  statChip: { borderRadius: theme.radiusMd, padding: '14px 22px' },
  statValue: { fontWeight: 800, fontFamily: theme.fontDisplay },
  statLabel: { fontSize: 12, color: theme.textSecondary, marginTop: 2, fontWeight: 600 },
  list: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, boxShadow: theme.shadowSm, overflow: 'hidden' },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },
  reportRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },
  reportTitle: { fontSize: 14, fontWeight: 700, color: theme.textPrimary },
  reportSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  statusPill: { fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' },
  rowDownloadBtn: { border: `1px solid ${theme.border}`, background: theme.bgAlt, color: theme.textSecondary, padding: '8px 12px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 12 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 760, maxWidth: '92vw', height: '100%', background: theme.surface, padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 20, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  closeBtn: { border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: theme.textSecondary },
  downloadBtn: { border: `1px solid ${theme.indigo}`, background: theme.indigoLight, color: theme.indigoDark, padding: '10px 16px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13, margin: '18px 0' },
  breakdownWrap: { border: `1px solid ${theme.border}`, borderRadius: theme.radiusMd, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', background: theme.bgAlt, fontSize: 11.5, fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: `1px solid ${theme.border}` },
  td: { padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary, verticalAlign: 'middle' },
  historyBlock: { marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}` },
  historyTitle: { fontSize: 13, fontWeight: 800, color: theme.textPrimary, margin: '0 0 10px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: theme.textSecondary, padding: '6px 0', textTransform: 'capitalize' },
  historyMeta: { color: theme.textMuted, fontSize: 12 },
};