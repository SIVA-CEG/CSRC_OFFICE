import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  getCurrentActor,
  getVehicleById,
  getEntriesForVehicle,
  currentHolderLabel,
  formatDate,
  approveEntry,
  rejectEntry,
  filterEntries,
  computeMileageAbstract,
} from '../../utils/logisticsWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';
import { TripEntryDrawer } from './AddTrip';
import { FilterBar } from '../../utils/sharedRegisterUI';
import { downloadTableReportPdf } from '../../utils/reportPdf';

const ACCENT = theme.amber || theme.indigo;

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Logged' },
  { key: 'pending', label: 'Pending Approval' },
  { key: 'rejected', label: 'Rejected' },
];

function statusPillMeta(status) {
  if (status === 'approved') return { color: theme.emeraldDark, bg: theme.emeraldLight, label: 'Logged' };
  if (status === 'rejected') return { color: theme.roseDark, bg: theme.roseLight, label: 'Rejected' };
  return { color: theme.amberDark, bg: theme.amberLight, label: status.replace('pending_', 'Awaiting ').replace('_', ' ') };
}

export default function ViewTrips() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const vehicle = useMemo(() => getVehicleById(vehicleId), [vehicleId]);
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', month: '', year: '', status: 'all' });
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');

  const refresh = () => setEntries(getEntriesForVehicle(vehicleId));
  useEffect(() => { setActor(getCurrentActor()); refresh(); }, [vehicleId]);

  const filtered = useMemo(() => filterEntries(entries, { ...filters, search }), [entries, filters, search]);

  const abstract = useMemo(
    () => computeMileageAbstract(vehicleId, filters.fromDate, filters.toDate),
    [vehicleId, filters.fromDate, filters.toDate, entries]
  );

  if (!vehicle) {
    return (
      <div style={styles.root}>
        <p>Vehicle not found. <button onClick={() => navigate('/revenue/csrc-logistics')}>← Back to Logistics</button></p>
      </div>
    );
  }

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
      title: `Logistics Register Report — ${vehicle.vehicleNumber}`,
      subtitle: `${vehicle.makeModel || vehicle.type || ''} ${vehicle.fuelType ? `· ${vehicle.fuelType}` : ''}`,
      filterSummary: filterSummaryParts.join(' · ') || 'No filters applied — full log',
      columns: [
        { key: 'slNo', label: 'SI No.' },
        { key: 'date', label: 'Date' },
        { key: 'start', label: 'Start (Time / Odo.)' },
        { key: 'ret', label: 'Return (Time / Odo.)' },
        { key: 'km', label: 'KM Done' },
        { key: 'places', label: 'Places Visited' },
        { key: 'purpose', label: 'Purpose / Person' },
        { key: 'fuel', label: 'Fuel Issued (L)' },
        { key: 'status', label: 'Status' },
      ],
      rows: filtered.map((e) => ({
        slNo: e.slNo,
        date: formatDate(e.data.date),
        start: `${e.data.startTime || '—'} / ${e.data.startOdometer || '—'}`,
        ret: `${e.data.returnTime || '—'} / ${e.data.returnOdometer || '—'}`,
        km: e.data.kmDone,
        places: e.data.placesVisited,
        purpose: e.data.purpose,
        fuel: e.data.hasFuelEntry ? e.data.fuelIssuedLitres : '—',
        status: statusPillMeta(e.status).label,
      })),
      footerNote:
        `Mileage Abstract for the selected period\n` +
        `Opening odometer: ${abstract.openingOdometer} (${formatDate(abstract.openingDate)})   ·   Closing odometer: ${abstract.closingOdometer} (${formatDate(abstract.closingDate)})\n` +
        `Total KM run: ${abstract.totalKm}   ·   Total fuel issued: ${abstract.totalLitres.toFixed(2)} L   ·   KM per litre: ${abstract.kmPerLitre.toFixed(2)}`,
      filename: `Logistics_${vehicle.vehicleNumber.replace(/\s+/g, '_')}_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: ACCENT }} onClick={() => navigate('/revenue/csrc-logistics')}>
          ← Logistics Home
        </button>
        <h1 style={styles.title}>{vehicle.vehicleNumber} — Trip &amp; Fuel Log</h1>
        <p style={styles.subtitle}>{filtered.length} of {entries.length} entries shown</p>
      </div>

      <div style={styles.toolbar} className="sd-fade-in">
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input className="sd-input" style={styles.searchInput} placeholder="Search by places, purpose, bill no..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} accent={ACCENT} onDownloadReport={handleDownloadReport} statusOptions={STATUS_FILTERS} />

      <div style={styles.abstractBox} className="sd-fade-in">
        <div style={styles.abstractTitle}>Mileage Abstract {filters.fromDate || filters.toDate ? '(for the selected date range)' : '(all approved fuel entries)'}</div>
        <div style={styles.abstractGrid}>
          <AbstractStat label="Opening Odometer" value={abstract.openingOdometer} sub={formatDate(abstract.openingDate)} />
          <AbstractStat label="Closing Odometer" value={abstract.closingOdometer} sub={formatDate(abstract.closingDate)} />
          <AbstractStat label="Total KM Run" value={`${abstract.totalKm} km`} />
          <AbstractStat label="Total Fuel Issued" value={`${abstract.totalLitres.toFixed(2)} L`} />
          <AbstractStat label="KM per Litre" value={abstract.kmPerLitre.toFixed(2)} highlight />
        </div>
      </div>

      <div style={styles.tableWrap} className="sd-fade-in">
        <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
          <div style={{ ...styles.col, flex: 0.5 }}>SI No.</div>
          <div style={{ ...styles.col, flex: 1 }}>Date</div>
          <div style={{ ...styles.col, flex: 2 }}>Places Visited</div>
          <div style={{ ...styles.col, flex: 1.4 }}>Purpose</div>
          <div style={{ ...styles.col, flex: 0.8 }}>KM Done</div>
          <div style={{ ...styles.col, flex: 1 }}>Fuel (L)</div>
          <div style={{ ...styles.col, flex: 1.2 }}>Status</div>
        </div>
        {filtered.length === 0 && <div style={styles.emptyState}>No entries match your search / filters.</div>}
        {filtered.map((e) => {
          const pm = statusPillMeta(e.status);
          return (
            <div key={e.id} className="sd-row-hover" style={styles.tableRow} onClick={() => openEntry(e)}>
              <div style={{ ...styles.col, flex: 0.5, color: theme.textMuted, fontWeight: 700 }}>{e.slNo}</div>
              <div style={{ ...styles.col, flex: 1 }}>{formatDate(e.data.date)}</div>
              <div style={{ ...styles.col, flex: 2, fontWeight: 600, color: theme.textPrimary }}>{e.data.placesVisited}</div>
              <div style={{ ...styles.col, flex: 1.4 }}>{e.data.purpose}</div>
              <div style={{ ...styles.col, flex: 0.8, fontWeight: 600 }}>{e.data.kmDone}</div>
              <div style={{ ...styles.col, flex: 1 }}>{e.data.hasFuelEntry ? `⛽ ${e.data.fuelIssuedLitres}` : '—'}</div>
              <div style={{ ...styles.col, flex: 1.2 }}><span style={{ ...styles.statusPill, color: pm.color, background: pm.bg }}>{pm.label}</span></div>
            </div>
          );
        })}
      </div>

      {selected && createPortal(
        <TripEntryDrawer entry={selected} onClose={closeDrawer} actor={actor} comment={comment} setComment={setComment} onApprove={canAct ? handleApprove : undefined} onReject={canAct ? handleReject : undefined} />,
        document.body
      )}
    </div>
  );
}

function AbstractStat({ label, value, sub, highlight }) {
  return (
    <div style={{ ...styles.abstractStat, ...(highlight ? { background: `${ACCENT}18` } : {}) }}>
      <div style={styles.abstractLabel}>{label}</div>
      <div style={{ ...styles.abstractValue, color: highlight ? theme.amberDark : theme.textPrimary }}>{value}</div>
      {sub && sub !== '—' && <div style={styles.abstractSub}>{sub}</div>}
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 20 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 26, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 4, fontSize: 14 },
  toolbar: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchWrap: { position: 'relative', flex: 1, minWidth: 260, display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 14, fontSize: 15, opacity: 0.6 },
  searchInput: { width: '100%', padding: '12px 16px 12px 40px', borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, background: theme.surface, fontSize: 14, color: theme.textPrimary, boxShadow: theme.shadowSm },
  abstractBox: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusLg, padding: 18, marginBottom: 20, boxShadow: theme.shadowSm },
  abstractTitle: { fontSize: 12.5, fontWeight: 800, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 },
  abstractGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 },
  abstractStat: { background: theme.bgAlt, borderRadius: theme.radiusSm, padding: '12px 14px' },
  abstractLabel: { fontSize: 11, color: theme.textMuted, fontWeight: 600, marginBottom: 4 },
  abstractValue: { fontSize: 18, fontWeight: 800, fontFamily: theme.fontDisplay },
  abstractSub: { fontSize: 10.5, color: theme.textMuted, marginTop: 2 },
  tableWrap: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: theme.shadowSm },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },
  tableHeadRow: { background: theme.bgAlt, cursor: 'default', fontSize: 12, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' },
  col: { fontSize: 13.5, color: theme.textSecondary, paddingRight: 12 },
  statusPill: { fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 999, display: 'inline-block', textTransform: 'capitalize' },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },
};