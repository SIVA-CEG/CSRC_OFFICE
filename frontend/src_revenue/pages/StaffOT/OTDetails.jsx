import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentActor, isApproverRole, getStaffList, fullName } from '../../utils/staffWorkflow';
import {
  MONTHS,
  getOTStructureForDesignation,
  getOTEntriesForStaffMonth,
  saveOTEntriesForStaffMonth,
  formatCurrency,
} from '../../utils/otWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

const NOW = new Date();

// Office hours: 10:00 AM – 5:45 PM
const OFFICE_START_MIN = 10 * 60;        // 600
const OFFICE_END_MIN = 17 * 60 + 45;     // 1065
export const MAX_MONTHLY_OT_HOURS = 60;

// Parses "HH:MM" (24hr, as returned by <input type="time">) into minutes since midnight.
function parseHM(value) {
  if (!value) return null;
  const [h, m] = String(value).split(':').map((x) => parseInt(x, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function formatMinutesAsHM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

// OT Before Office Hours = time clocked in before 10:00 AM.
function computeOTBefore(inTime) {
  const inMin = parseHM(inTime);
  if (inMin === null || inMin >= OFFICE_START_MIN) return '0:00';
  return formatMinutesAsHM(OFFICE_START_MIN - inMin);
}

// OT After Office Hours = time clocked out after 5:45 PM.
function computeOTAfter(outTime) {
  const outMin = parseHM(outTime);
  if (outMin === null || outMin <= OFFICE_END_MIN) return '0:00';
  return formatMinutesAsHM(outMin - OFFICE_END_MIN);
}

// Suggested total hours for the day, rounded to the nearest whole hour —
// matches the paper register (e.g. 1:45 -> 2, 0:23 -> 0). This is a
// starting point only; the field stays editable so it can be manually
// adjusted (e.g. "1 hour adjusted against Nth late").
function suggestedTotalHours(otBefore, otAfter) {
  const totalMinutes = (parseHM(otBefore) || 0) + (parseHM(otAfter) || 0);
  return Math.round(totalMinutes / 60);
}

function emptyRow() {
  return {
    id: undefined,
    date: '',
    inTime: '',
    outTime: '',
    otBeforeOfficeHours: '0:00',
    otAfterOfficeHours: '0:00',
    totalHoursForDay: 0,
    remarks: '',
  };
}

export default function OTDetails() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [staff, setStaff] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [month, setMonth] = useState(MONTHS[NOW.getMonth()]);
  const [year, setYear] = useState(String(NOW.getFullYear()));
  const [rows, setRows] = useState([]);
  const [saved, setSaved] = useState(false);

  const canEdit = !isApproverRole(actor.role);

  useEffect(() => {
    setActor(getCurrentActor());
    setStaff(getStaffList());
  }, []);

  useEffect(() => {
    if (!staffId) { setRows([]); return; }
    const existing = getOTEntriesForStaffMonth(staffId, month, year);
    setRows(existing.length ? existing.map((e) => ({ ...e })) : []);
  }, [staffId, month, year]);

  const selectedStaff = staff.find((s) => s.id === staffId);
  const ratePerHour = selectedStaff ? getOTStructureForDesignation(selectedStaff.designation).ratePerHour : 0;

const totals = useMemo(() => {
  const totalHours = rows.reduce((sum, r) => sum + Number(r.totalHoursForDay || 0), 0);
  return { totalHours, totalAmount: totalHours * ratePerHour };
}, [rows, ratePerHour]);

const overCap = totals.totalHours > MAX_MONTHLY_OT_HOURS;

const updateRow = (idx, key, value) => {
  setRows((prev) =>
    prev.map((r, i) => {
      if (i !== idx) return r;
      const updated = { ...r, [key]: value };
      if (key === 'inTime') {
        updated.otBeforeOfficeHours = computeOTBefore(value);
      }
      if (key === 'outTime') {
        updated.otAfterOfficeHours = computeOTAfter(value);
      }
      if (key === 'inTime' || key === 'outTime') {
        updated.totalHoursForDay = suggestedTotalHours(updated.otBeforeOfficeHours, updated.otAfterOfficeHours);
      }
      return updated;
    })
  );
};
  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

const [capError, setCapError] = useState('');

const handleSave = () => {
  if (!staffId) return;
  if (totals.totalHours > MAX_MONTHLY_OT_HOURS) {
    setCapError(`Total OT hours for ${month} ${year} is ${totals.totalHours}, which exceeds the maximum of ${MAX_MONTHLY_OT_HOURS} hours/month. Reduce hours before saving.`);
    return;
  }
  setCapError('');
  saveOTEntriesForStaffMonth(staffId, month, year, rows);
  setSaved(true);
  setTimeout(() => setSaved(false), 2600);
};

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <button style={styles.backLink} onClick={() => navigate('/revenue/staff-ot')}>← Staff OT Home</button>
        <h1 style={styles.title}>OT Details</h1>
        <p style={styles.subtitle}>
          {canEdit
            ? 'Pick a staff member and month, then log In/Out time and overtime hours for each working day. Save updates every day for that month in one go.'
            : 'Daily overtime entries — view only.'}
        </p>
      </div>

      {saved && <div style={styles.successBanner}>✓ OT entries saved for {month} {year}.</div>}
{capError && <div style={styles.errorBanner}>{capError}</div>}

      <div style={styles.metaCard} className="sd-fade-in">
        <div style={styles.metaGrid}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Staff Member</label>
            <select className="sd-select" style={styles.input} value={staffId} onChange={(e) => setStaffId(e.target.value)}>
              <option value="">Select staff…</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{fullName(s)} — {s.designation}</option>
              ))}
            </select>
          </div>
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
            <label style={styles.fieldLabel}>OT Rate / Hour</label>
            <div style={styles.rateReadout}>{selectedStaff ? formatCurrency(ratePerHour) : '—'}</div>
          </div>
        </div>
      </div>

      {!staffId ? (
        <div style={styles.emptyState}>Select a staff member and month to begin logging OT.</div>
      ) : (
        <>
          <div style={styles.tableWrap}>
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>In Time</th>
                    <th style={styles.th}>Out Time</th>
<th style={styles.th}>OT Before Office Hours <span style={styles.autoTag}>(auto — 10:00 AM start)</span></th>
<th style={styles.th}>OT After Office Hours <span style={styles.autoTag}>(auto — 5:45 PM end)</span></th>
<th style={styles.th}>Total Hours / Day <span style={styles.autoTag}>(auto — editable)</span></th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Remarks</th>
                    {canEdit && <th style={styles.th} />}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={9} style={styles.emptyCell}>No entries yet for {month} {year}. Add a row to start.</td></tr>
                  )}
                  {rows.map((r, idx) => {
                    const amount = Number(r.totalHoursForDay || 0) * ratePerHour;
                    return (
                      <tr key={r.id || idx}>
                        <td style={styles.td}>
                          <input className="sd-input" style={styles.cellInput} type="date" value={r.date} disabled={!canEdit} onChange={(e) => updateRow(idx, 'date', e.target.value)} />
                        </td>
                        <td style={styles.td}>
                          <input className="sd-input" style={styles.cellInputWide} type="time" value={r.inTime} disabled={!canEdit} onChange={(e) => updateRow(idx, 'inTime', e.target.value)} />
                        </td>
                        <td style={styles.td}>
                          <input className="sd-input" style={styles.cellInputWide} type="time" value={r.outTime} disabled={!canEdit} onChange={(e) => updateRow(idx, 'outTime', e.target.value)} />
                        </td>
                        <td style={styles.td}>
  <span style={styles.readonlyValue}>{r.otBeforeOfficeHours}</span>
</td>
<td style={styles.td}>
  <span style={styles.readonlyValue}>{r.otAfterOfficeHours}</span>
</td>
                        <td style={styles.td}>
                          <input className="sd-input" style={styles.cellInputNarrow} type="number" value={r.totalHoursForDay} disabled={!canEdit} onChange={(e) => updateRow(idx, 'totalHoursForDay', e.target.value)} />
                        </td>
                        <td style={{ ...styles.td, fontWeight: 700, color: theme.emeraldDark }}>{formatCurrency(amount)}</td>
                        <td style={styles.td}>
                          <input className="sd-input" style={styles.cellInputWide} value={r.remarks} disabled={!canEdit} onChange={(e) => updateRow(idx, 'remarks', e.target.value)} />
                        </td>
                        {canEdit && (
                          <td style={styles.td}>
                            <button style={styles.removeBtn} onClick={() => removeRow(idx)}>✕</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {canEdit && (
            <button style={styles.addRowBtn} onClick={addRow}>+ Add Day</button>
          )}

          <div style={styles.footerBar}>
  <div>
    <strong style={overCap ? { color: theme.roseDark } : undefined}>{totals.totalHours}</strong> / {MAX_MONTHLY_OT_HOURS} total OT hours · Total <strong>{formatCurrency(totals.totalAmount)}</strong>
    {overCap && <span style={styles.capWarning}> — exceeds monthly limit</span>}
  </div>
  {canEdit && (
    <button className="sd-btn" style={styles.saveBtn} onClick={handleSave} disabled={overCap}>Save Entries →</button>
  )}
</div>
        </>
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 20 },
  backLink: { border: 'none', background: 'none', color: theme.amber, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 680 },

  successBanner: { background: theme.emeraldLight, color: theme.emeraldDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },

  metaCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 20, boxShadow: theme.shadowSm, marginBottom: 18 },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: theme.textSecondary },
  input: { padding: '10px 12px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary, background: theme.surface },
  rateReadout: { padding: '10px 12px', fontSize: 14, fontWeight: 800, color: theme.emeraldDark },

  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted, background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}` },

  tableWrap: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, boxShadow: theme.shadowSm, marginBottom: 14, overflow: 'hidden' },
  tableScroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', background: theme.bgAlt, fontSize: 11.5, fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' },
  td: { padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary, verticalAlign: 'middle', whiteSpace: 'nowrap' },
  cellInput: { padding: '6px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, fontSize: 12.5, width: 96 },
  cellInputNarrow: { padding: '6px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, fontSize: 12.5, width: 64 },
  cellInputWide: { padding: '6px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, fontSize: 12.5, width: 120 },
  emptyCell: { padding: '30px 16px', textAlign: 'center', color: theme.textMuted, whiteSpace: 'normal' },
  removeBtn: { border: 'none', background: theme.roseLight, color: theme.roseDark, width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 12, fontWeight: 700 },

  addRowBtn: { border: `1px dashed ${theme.border}`, background: theme.surface, color: theme.textSecondary, padding: '10px 16px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 18 },

  footerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusLg, padding: '16px 22px', boxShadow: theme.shadowSm, fontSize: 14, color: theme.textPrimary },
  saveBtn: { border: 'none', background: theme.emerald, color: '#fff', padding: '12px 22px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 14 },
  autoTag: { display: 'block', fontSize: 9.5, fontWeight: 600, color: theme.textMuted, textTransform: 'none', letterSpacing: 0, marginTop: 2 },
  readonlyValue: { fontSize: 12.5, color: theme.textMuted, fontWeight: 600 },
  errorBanner: { background: theme.roseLight, color: theme.roseDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  capWarning: { color: theme.roseDark, fontWeight: 700, fontSize: 12.5 },
};