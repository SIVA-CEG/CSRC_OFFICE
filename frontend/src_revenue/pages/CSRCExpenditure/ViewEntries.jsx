import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  CATEGORIES,
  getCurrentActor,
  getEntries,
  currentHolderLabel,
  formatDate,
  formatCurrency,
  approveEntry,
  rejectEntry,
  filterEntries,
} from '../../utils/expenditureWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';
import { EntryDrawer } from './AddEntry';
import { FilterBar, ConditionPill } from '../../utils/sharedRegisterUI';
import { downloadTableReportPdf } from '../../utils/reportPdf';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Registered' },
  { key: 'pending', label: 'Pending Approval' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_FILTERS_NON_CONSUMABLES = [
  ...STATUS_FILTERS,
  { key: 'bought_back', label: 'Buyback (Replaced)' },
];

function statusPillMeta(status) {
  if (status === 'approved') return { color: theme.emeraldDark, bg: theme.emeraldLight, label: 'Registered' };
  if (status === 'rejected') return { color: theme.roseDark, bg: theme.roseLight, label: 'Rejected' };
  return { color: theme.amberDark, bg: theme.amberLight, label: status.replace('pending_', 'Awaiting ').replace('_', ' ') };
}

export default function ViewEntries({ category }) {
  const navigate = useNavigate();
  const meta = CATEGORIES[category];
  const statusFilterOptions = category === 'non_consumables' ? STATUS_FILTERS_NON_CONSUMABLES : STATUS_FILTERS;
  const accent = category === 'non_consumables' ? theme.indigo : theme.emerald;
  const accentDark = category === 'non_consumables' ? theme.indigoDark : theme.emeraldDark;

  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', month: '', year: '', status: 'all', itemStatus: 'all' });
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');

  const refresh = () => setEntries(getEntries(category));
  useEffect(() => { setActor(getCurrentActor()); refresh(); }, [category]);

  const filtered = useMemo(
    () => filterEntries(entries, { ...filters, search }),
    [entries, filters, search]
  );

  const basePath = `/revenue/csrc-expenditure/${category === 'non_consumables' ? 'non-consumables' : 'consumables'}`;

  const openEntry = (e) => { setSelected(e); setComment(''); };
  const closeDrawer = () => setSelected(null);

  const handleBuyback = (ev, entry) => {
    ev.stopPropagation();
    navigate(`${basePath}/add`, {
      state: {
        buybackOf: entry.id,
        buybackSummary: {
          slNo: entry.slNo,
          manufacturerSupplier: entry.data.manufacturerSupplier,
          invoiceNo: entry.data.invoiceNo,
        },
      },
    });
  };

  const canAct = selected && selected.status === `pending_${actor.role}`;
  const handleApprove = () => {
    approveEntry(selected.id, actor, null, comment || undefined);
    closeDrawer(); refresh();
  };
  const handleReject = () => {
    rejectEntry(selected.id, actor, comment || 'Rejected');
    closeDrawer(); refresh();
  };

  const filterSummaryParts = [];
  if (filters.fromDate || filters.toDate) filterSummaryParts.push(`Date ${filters.fromDate || '…'} to ${filters.toDate || '…'}`);
  if (filters.month) filterSummaryParts.push(`Month ${filters.month}`);
  if (filters.year) filterSummaryParts.push(`Year ${filters.year}`);
  if (filters.status && filters.status !== 'all') filterSummaryParts.push(`Status: ${filters.status}`);
  if (filters.itemStatus && filters.itemStatus !== 'all') filterSummaryParts.push(`Condition: ${filters.itemStatus}`);
  if (search) filterSummaryParts.push(`Search: "${search}"`);

  const handleDownloadReport = () => {
    downloadTableReportPdf({
      title: `${meta.label} Register Report`,
      subtitle: meta.registerTitle,
      filterSummary: filterSummaryParts.join(' · ') || 'No filters applied — full register',
      columns: [
        { key: 'slNo', label: 'SI No.' },
        { key: 'pageNo', label: 'Page No.' },
        { key: 'supplier', label: 'Manufacturer / Supplier' },
        { key: 'invoice', label: 'Invoice No. & Date' },
        { key: 'receipt', label: 'Date of Receipt' },
        { key: 'proceedings', label: 'CSRC Proceedings No. & Date' },
{ key: 'warranty', label: 'Warranty Period' },
        { key: 'total', label: 'Total Cost' },
        { key: 'condition', label: 'Condition' },
        { key: 'status', label: 'Status' },
      ],
      rows: filtered.map((e) => ({
        slNo: e.data.slNo || '—',
        pageNo: e.data.pageNo || '—',
        supplier: e.data.manufacturerSupplier,
        invoice: `${e.data.invoiceNo || '—'} (${formatDate(e.data.invoiceDate)})`,
        receipt: formatDate(e.data.dateOfReceipt),
        proceedings: `${e.data.csrcProceedingsNo || '—'} (${formatDate(e.data.csrcProceedingsDate)})`,
warranty: e.data.warrantyFrom || e.data.warrantyTo ? `${formatDate(e.data.warrantyFrom)} – ${formatDate(e.data.warrantyTo)}` : '—',
        total: formatCurrency(e.data.total),
        condition: e.data.itemStatus === 'defective' ? 'Defective' : 'Working',
        status: statusPillMeta(e.status).label,
      })),
      filename: `${meta.label.replace(/\s+/g, '_')}_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: accent }} onClick={() => navigate(basePath)}>
          ← {meta.label} Home
        </button>
        <h1 style={styles.title}>{meta.label} Register</h1>
        <p style={styles.subtitle}>{filtered.length} of {entries.length} entries shown · {meta.registerTitle}</p>
      </div>

      <div style={styles.toolbar} className="sd-fade-in">
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            className="sd-input" style={styles.searchInput}
            placeholder="Search by supplier, invoice no., page no., proceedings no., item..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        accent={accent}
        onDownloadReport={handleDownloadReport}
        statusOptions={statusFilterOptions}
        extraFields={(
          <div style={styles.filterFieldWrap}>
            <label style={styles.filterLabel}>Condition</label>
            <select className="sd-input" style={styles.filterInput} value={filters.itemStatus} onChange={(e) => setFilters((f) => ({ ...f, itemStatus: e.target.value }))}>
              <option value="all">All</option>
              <option value="working">Working</option>
              <option value="defective">Defective</option>
            </select>
          </div>
        )}
      />

      <div style={styles.tableWrap} className="sd-fade-in">
        <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
          <div style={{ ...styles.col, flex: 0.5 }}>SI No.</div>
          <div style={{ ...styles.col, flex: 0.6 }}>Page No.</div>
          <div style={{ ...styles.col, flex: 1.6 }}>Manufacturer / Supplier</div>
          <div style={{ ...styles.col, flex: 1.2 }}>Invoice No. &amp; Date</div>
          <div style={{ ...styles.col, flex: 1 }}>Date of Receipt</div>
          <div style={{ ...styles.col, flex: 1.2 }}>Warranty</div>
          <div style={{ ...styles.col, flex: 0.9 }}>Total Cost</div>
          <div style={{ ...styles.col, flex: 0.8 }}>Condition</div>
          <div style={{ ...styles.col, flex: 1.1 }}>Status</div>
          {category === 'non_consumables' && <div style={{ ...styles.col, flex: 1 }}>Buyback</div>}
        </div>

        {filtered.length === 0 && <div style={styles.emptyState}>No entries match your search / filters.</div>}

        {filtered.map((e) => {
          const pm = statusPillMeta(e.status);
          const isBoughtBack = !!e.buyback;
          return (
            <div key={e.id} className="sd-row-hover" style={styles.tableRow} onClick={() => openEntry(e)}>
              <div style={{ ...styles.col, flex: 0.5, color: theme.textMuted, fontWeight: 700 }}>{e.data.slNo || '—'}</div>
              <div style={{ ...styles.col, flex: 0.6, color: theme.textMuted }}>{e.data.pageNo || '—'}</div>
              <div style={{ ...styles.col, flex: 1.6, fontWeight: 700, color: theme.textPrimary }}>{e.data.manufacturerSupplier}</div>
              <div style={{ ...styles.col, flex: 1.2 }}>{e.data.invoiceNo} · {formatDate(e.data.invoiceDate)}</div>
              <div style={{ ...styles.col, flex: 1 }}>{formatDate(e.data.dateOfReceipt)}</div>
              <div style={{ ...styles.col, flex: 1.2, fontSize: 12.5 }}>
                {e.data.warrantyFrom || e.data.warrantyTo ? `${formatDate(e.data.warrantyFrom)} – ${formatDate(e.data.warrantyTo)}` : '—'}
              </div>
              <div style={{ ...styles.col, flex: 0.9, fontWeight: 600, color: theme.textPrimary }}>{formatCurrency(e.data.total)}</div>
              <div style={{ ...styles.col, flex: 0.8 }}><ConditionPill value={e.data.itemStatus} /></div>
              <div style={{ ...styles.col, flex: 1.1 }}>
                <span style={{ ...styles.statusPill, color: pm.color, background: pm.bg }}>{pm.label}</span>
              </div>
              {category === 'non_consumables' && (
                <div style={{ ...styles.col, flex: 1 }}>
                  {isBoughtBack ? (
                    <span style={{ ...styles.statusPill, color: theme.amberDark, background: theme.amberLight }}>↺ Replaced</span>
                  ) : e.status === 'approved' ? (
                    <button className="sd-btn" style={styles.buybackBtn} onClick={(ev) => handleBuyback(ev, e)}>↺ Buyback</button>
                  ) : '—'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected && createPortal(
        <EntryDrawer
          entry={selected}
          onClose={closeDrawer}
          actor={actor}
          accent={accent}
          accentDark={accentDark}
          comment={comment}
          setComment={setComment}
          onApprove={canAct ? handleApprove : undefined}
          onReject={canAct ? handleReject : undefined}
          onRefresh={refresh}
        />,
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

  filterFieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterLabel: { fontSize: 12, fontWeight: 700, color: theme.textSecondary },
  filterInput: { padding: '10px 14px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary, background: theme.surface },

  tableWrap: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: theme.shadowSm },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },
  tableHeadRow: { background: theme.bgAlt, cursor: 'default', fontSize: 12, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' },
  col: { fontSize: 13.5, color: theme.textSecondary, paddingRight: 12 },
  statusPill: { fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 999, display: 'inline-block', textTransform: 'capitalize' },
  buybackBtn: { border: `1px solid ${theme.indigo}`, background: theme.indigoLight || '#EEF2FF', color: theme.indigoDark || '#3730A3', padding: '6px 12px', borderRadius: 999, fontWeight: 700, fontSize: 11.5, cursor: 'pointer' },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },
};