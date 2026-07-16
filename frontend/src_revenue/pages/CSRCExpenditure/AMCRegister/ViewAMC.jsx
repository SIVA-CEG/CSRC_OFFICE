import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAmcEntries, filterAmcEntries, formatDate, formatCurrency } from '../../../utils/amcWorkflow';
import { theme, fontFaceAndUtilities } from '../../../utils/theme';
import { FilterBar } from '../../../utils/sharedRegisterUI';
import { downloadTableReportPdf } from '../../../utils/reportPdf';

export default function ViewAMC() {
  const navigate = useNavigate();
  const accent = theme.violet || '#7C3AED';

  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', month: '', year: '' });

  useEffect(() => { setEntries(getAmcEntries()); }, []);

  const filtered = useMemo(() => filterAmcEntries(entries, { ...filters, search }), [entries, filters, search]);

  const handleDownloadReport = () => {
    downloadTableReportPdf({
      title: 'AMC Register Report',
      subtitle: 'Annual Maintenance Contracts — Non-Consumable Items',
      filterSummary: search ? `Search: "${search}"` : 'No filters applied — full AMC register',
      columns: [
        { key: 'slNo', label: 'S.No.' },
        { key: 'particulars', label: 'Particulars' },
        { key: 'poNo', label: 'P.O. No.' },
        { key: 'period', label: 'AMC Period' },
        { key: 'contract', label: 'Contract No. & Date' },
        { key: 'ctdt', label: 'CTDT No. & Date' },
        { key: 'vendor', label: 'M/s.' },
        { key: 'amount', label: 'Amount' },
      ],
      rows: filtered.map((e) => ({
        slNo: e.data.slNo || '—',
        particulars: e.data.particulars || '—',
        poNo: e.data.poNo || '—',
        period: `${formatDate(e.data.amcFrom)} to ${formatDate(e.data.amcTo)}`,
        contract: `${e.data.contractNo || '—'} (${formatDate(e.data.contractDate)})`,
        ctdt: `${e.data.ctdtNo || '—'} (${formatDate(e.data.ctdtDate)})`,
        vendor: e.data.vendorName || '—',
        amount: formatCurrency(e.data.amount),
      })),
      filename: `AMC_Register_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: accent }} onClick={() => navigate('/revenue/csrc-expenditure/amc-register')}>
          ← AMC Register Home
        </button>
        <h1 style={styles.title}>AMC Applied Items</h1>
        <p style={styles.subtitle}>{filtered.length} of {entries.length} AMC contracts shown</p>
      </div>

      <div style={styles.toolbar} className="sd-fade-in">
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            className="sd-input" style={styles.searchInput}
            placeholder="Search by particulars, PO no., contract no., CTDT no., vendor..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} accent={accent} onDownloadReport={handleDownloadReport} />

      <div style={styles.tableWrap} className="sd-fade-in">
        <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
          <div style={{ ...styles.col, flex: 0.4 }}>S.No.</div>
          <div style={{ ...styles.col, flex: 1.8 }}>Particulars</div>
          <div style={{ ...styles.col, flex: 0.9 }}>P.O. No.</div>
          <div style={{ ...styles.col, flex: 1.3 }}>AMC Period</div>
          <div style={{ ...styles.col, flex: 1.4 }}>Contract No. &amp; Date</div>
          <div style={{ ...styles.col, flex: 1.4 }}>CTDT No. &amp; Date</div>
          <div style={{ ...styles.col, flex: 1.3 }}>M/s.</div>
          <div style={{ ...styles.col, flex: 1 }}>Amount</div>
        </div>

        {filtered.length === 0 && <div style={styles.emptyState}>No AMC contracts match your search / filters.</div>}

        {filtered.map((e) => (
          <div key={e.id} style={styles.tableRow}>
            <div style={{ ...styles.col, flex: 0.4, fontWeight: 700, color: theme.textMuted }}>{e.data.slNo || '—'}</div>
            <div style={{ ...styles.col, flex: 1.8, fontWeight: 700, color: theme.textPrimary }}>{e.data.particulars}</div>
            <div style={{ ...styles.col, flex: 0.9 }}>{e.data.poNo || '—'}</div>
            <div style={{ ...styles.col, flex: 1.3 }}>{formatDate(e.data.amcFrom)} – {formatDate(e.data.amcTo)}</div>
            <div style={{ ...styles.col, flex: 1.4 }}>{e.data.contractNo} · {formatDate(e.data.contractDate)}</div>
            <div style={{ ...styles.col, flex: 1.4 }}>{e.data.ctdtNo} · {formatDate(e.data.ctdtDate)}</div>
            <div style={{ ...styles.col, flex: 1.3 }}>{e.data.vendorName || '—'}</div>
            <div style={{ ...styles.col, flex: 1, fontWeight: 700, color: theme.textPrimary }}>{formatCurrency(e.data.amount)}</div>
          </div>
        ))}
      </div>
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
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${theme.border}` },
  tableHeadRow: { background: theme.bgAlt, fontSize: 12, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' },
  col: { fontSize: 13, color: theme.textSecondary, paddingRight: 12 },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },
};