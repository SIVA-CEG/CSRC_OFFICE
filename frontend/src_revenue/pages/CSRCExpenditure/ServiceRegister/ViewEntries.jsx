import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  REGISTER_META,
  getCurrentActor,
  getEntries,
  currentHolderLabel,
  formatDate,
  formatCurrency,
  approveEntry,
  rejectEntry,
  filterEntries,
} from '../../../utils/serviceRegisterWorkflow';
import { theme, fontFaceAndUtilities } from '../../../utils/theme';
import { ServiceEntryDrawer } from './AddEntry';
import { FilterBar } from '../../../utils/sharedRegisterUI';
import { downloadTableReportPdf } from '../../../utils/reportPdf';

const ACCENT = theme.violet || theme.indigo;
const ACCENT_DARK = theme.violetDark || theme.indigoDark;

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Registered' },
  { key: 'pending', label: 'Pending Approval' },
  { key: 'rejected', label: 'Rejected' },
];

function statusPillMeta(status) {
  if (status === 'approved') return { color: theme.emeraldDark, bg: theme.emeraldLight, label: 'Registered' };
  if (status === 'rejected') return { color: theme.roseDark, bg: theme.roseLight, label: 'Rejected' };
  return { color: theme.amberDark, bg: theme.amberLight, label: status.replace('pending_', 'Awaiting ').replace('_', ' ') };
}

export default function ServiceRegisterViewEntries() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', month: '', year: '', status: 'all' });
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');

  const refresh = () => setEntries(getEntries());
  useEffect(() => { setActor(getCurrentActor()); refresh(); }, []);

  const filtered = useMemo(() => filterEntries(entries, { ...filters, search }), [entries, filters, search]);

  const openEntry = (e) => { setSelected(e); setComment(''); };
  const closeDrawer = () => setSelected(null);
  const canAct = selected && selected.status === `pending_${actor.role}`;
  const handleApprove = () => { approveEntry(selected.id, actor, null, comment || undefined); closeDrawer(); refresh(); };
  const handleReject = () => { rejectEntry(selected.id, actor, comment || 'Rejected'); closeDrawer(); refresh(); };

  const filterSummaryParts = [];
  if (filters.fromDate || filters.toDate) filterSummaryParts.push(`Date ${filters.fromDate || '…'} to ${filters.toDate || '…'}`);
  if (filters.month) filterSummaryParts.push(`Month ${filters.month}`);
  if (filters.year) filterSummaryParts.push(`Year ${filters.year}`);
  if (filters.status && filters.status !== 'all') filterSummaryParts.push(`Status: ${filters.status}`);
  if (search) filterSummaryParts.push(`Search: "${search}"`);

  const handleDownloadReport = () => {
    downloadTableReportPdf({
      title: 'Service Register Report',
      subtitle: REGISTER_META.registerTitle,
      filterSummary: filterSummaryParts.join(' · ') || 'No filters applied — full register',
      columns: [
        { key: 'slNo', label: 'SI No.' },
        { key: 'pageNo', label: 'Page No.' },
        { key: 'vendor', label: 'Firm / Vendor' },
        { key: 'equipment', label: 'Equipment / Service' },
        { key: 'invoice', label: 'Invoice No. & Date' },
        { key: 'amount', label: 'Amount' },
        { key: 'paymentDate', label: 'Payment Date' },
        { key: 'proceedings', label: 'CSRC Proceedings No. & Date' },
        { key: 'status', label: 'Status' },
      ],
      rows: filtered.map((e) => ({
        slNo: e.slNo,
        pageNo: e.data.pageNo || '—',
        vendor: e.data.vendorName,
        equipment: e.data.equipmentName,
        invoice: `${e.data.invoiceNo || '—'} (${formatDate(e.data.invoiceDate)})`,
        amount: formatCurrency(e.data.amount),
        paymentDate: formatDate(e.data.paymentDate),
        proceedings: `${e.data.csrcProceedingsNo || '—'} (${formatDate(e.data.csrcProceedingsDate)})`,
        status: statusPillMeta(e.status).label,
      })),
      filename: `Service_Register_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: ACCENT }} onClick={() => navigate('/revenue/csrc-expenditure/service-register')}>
          ← Service Register Home
        </button>
        <h1 style={styles.title}>Service Register</h1>
        <p style={styles.subtitle}>{filtered.length} of {entries.length} entries shown · {REGISTER_META.registerTitle}</p>
      </div>

      <div style={styles.toolbar} className="sd-fade-in">
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input className="sd-input" style={styles.searchInput} placeholder="Search by vendor, equipment, invoice no., page no..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} accent={ACCENT} onDownloadReport={handleDownloadReport} statusOptions={STATUS_FILTERS} />

      <div style={styles.tableWrap} className="sd-fade-in">
        <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
          <div style={{ ...styles.col, flex: 0.5 }}>SI No.</div>
          <div style={{ ...styles.col, flex: 0.6 }}>Page No.</div>
          <div style={{ ...styles.col, flex: 1.6 }}>Firm / Vendor</div>
          <div style={{ ...styles.col, flex: 1.6 }}>Equipment</div>
          <div style={{ ...styles.col, flex: 1.3 }}>Invoice No. &amp; Date</div>
          <div style={{ ...styles.col, flex: 1 }}>Amount</div>
          <div style={{ ...styles.col, flex: 1.2 }}>Status</div>
        </div>
        {filtered.length === 0 && <div style={styles.emptyState}>No entries match your search / filters.</div>}
        {filtered.map((e) => {
          const pm = statusPillMeta(e.status);
          return (
            <div key={e.id} className="sd-row-hover" style={styles.tableRow} onClick={() => openEntry(e)}>
              <div style={{ ...styles.col, flex: 0.5, color: theme.textMuted, fontWeight: 700 }}>{e.slNo}</div>
              <div style={{ ...styles.col, flex: 0.6, color: theme.textMuted }}>{e.data.pageNo || '—'}</div>
              <div style={{ ...styles.col, flex: 1.6, fontWeight: 700, color: theme.textPrimary }}>{e.data.vendorName}</div>
              <div style={{ ...styles.col, flex: 1.6 }}>{e.data.equipmentName}</div>
              <div style={{ ...styles.col, flex: 1.3 }}>{e.data.invoiceNo} · {formatDate(e.data.invoiceDate)}</div>
              <div style={{ ...styles.col, flex: 1, fontWeight: 600, color: theme.textPrimary }}>{formatCurrency(e.data.amount)}</div>
              <div style={{ ...styles.col, flex: 1.2 }}><span style={{ ...styles.statusPill, color: pm.color, background: pm.bg }}>{pm.label}</span></div>
            </div>
          );
        })}
      </div>

      {selected && createPortal(
        <ServiceEntryDrawer entry={selected} onClose={closeDrawer} actor={actor} comment={comment} setComment={setComment} onApprove={canAct ? handleApprove : undefined} onReject={canAct ? handleReject : undefined} />,
        document.body
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 20 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 4, fontSize: 14 },
  toolbar: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchWrap: { position: 'relative', flex: 1, minWidth: 260, display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 14, fontSize: 15, opacity: 0.6 },
  searchInput: { width: '100%', padding: '12px 16px 12px 40px', borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, background: theme.surface, fontSize: 14, color: theme.textPrimary, boxShadow: theme.shadowSm },
  tableWrap: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: theme.shadowSm },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },
  tableHeadRow: { background: theme.bgAlt, cursor: 'default', fontSize: 12, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' },
  col: { fontSize: 13.5, color: theme.textSecondary, paddingRight: 12 },
  statusPill: { fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 999, display: 'inline-block', textTransform: 'capitalize' },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },
};