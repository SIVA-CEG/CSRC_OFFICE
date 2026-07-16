import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getCurrentActor, isApproverRole, getStaffList, fullName, formatDate, ROLE_LABELS } from '../../utils/staffWorkflow';
import {
  SALARY_TYPES,
  MONTHS,
  getStructureForDesignation,
  computeSalary,
  submitSalarySanction,
  getSanctions,
  approveSalarySanction,
  rejectSalarySanction,
  currentSanctionHolderLabel,
  formatCurrency,
} from '../../utils/salaryWorkflow';
import { downloadSalaryBillPdf } from '../../utils/salaryPdf';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

const NOW = new Date();

export default function SanctionSalary() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });

  useEffect(() => { setActor(getCurrentActor()); }, []);

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={styles.backLink} onClick={() => navigate('/revenue/staff-salary')}>
          ← Staff Salary Home
        </button>
        <h1 style={styles.title}>Sanction Salary</h1>
        <p style={styles.subtitle}>
          {isApproverRole(actor.role)
            ? 'View all salary sanctions submitted by the Assistant.'
            : 'Pick staff by salary type and designation, review the computed salary, and sanction directly.'}
        </p>
      </div>

      {isApproverRole(actor.role) ? <ApprovalQueue actor={actor} /> : <SanctionForm actor={actor} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Assistant view — pick staff, edit figures, submit                   */
/* ------------------------------------------------------------------ */
function SanctionForm({ actor }) {
  const [staff, setStaff] = useState([]);
  const [salaryType, setSalaryType] = useState(SALARY_TYPES[1]); // default: Daily Wages
  const [designationFilter, setDesignationFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(MONTHS[NOW.getMonth()]);
  const [year, setYear] = useState(String(NOW.getFullYear()));
  const [procNo, setProcNo] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [inputsById, setInputsById] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setStaff(getStaffList()); }, []);

  const eligible = useMemo(
    () => staff.filter((s) => s.status !== 'resigned' && s.salaryType === salaryType),
    [staff, salaryType]
  );

  const designations = useMemo(
    () => ['all', ...Array.from(new Set(eligible.map((s) => s.designation)))],
    [eligible]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return eligible.filter((s) => {
      if (designationFilter !== 'all' && s.designation !== designationFilter) return false;
      if (!q) return true;
      return [fullName(s), s.employeeCode, s.designation].join(' ').toLowerCase().includes(q);
    });
  }, [eligible, designationFilter, search]);

  // whenever the salary type changes, selections / inputs from a different type are stale
  useEffect(() => {
    setSelectedIds(new Set());
    setInputsById({});
  }, [salaryType]);

const getInputs = (s) => {
  const structure = getStructureForDesignation(s.designation);
  const cached = inputsById[s.id] || {};
  if (salaryType === 'Consolidated Pay') {
    return { consolidatedAmount: structure.consolidatedPay.amount };
  } else if (salaryType === 'Daily Wages') {
    return {
      daysWorked: 26, incentiveDays: 0, lumpSum: 0,
      ...cached,
      wagePerDay: structure.dailyWages.wagePerDay,
      incentivePerDay: structure.dailyWages.incentivePerDay,
    };
  } else {
    return {
      daysWorked: 26, incentiveDays: 0, lumpSum: 0,
      ...cached,
      wagePerDay: structure.dailyWagesRateFactor.wagePerDay,
      rateFactor: structure.dailyWagesRateFactor.rateFactor,
      incentiveRateFactor: structure.dailyWagesRateFactor.incentiveRateFactor,
    };
  }
};

const setInput = (staffId, key, value) => {
  setInputsById((prev) => ({
    ...prev,
    [staffId]: { ...(prev[staffId] || {}), [key]: value },
  }));
};

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((s) => next.delete(s.id));
      } else {
        filtered.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const rows = useMemo(
    () => filtered.map((s) => ({ staff: s, computed: computeSalary(s, getInputs(s)) })),
    [filtered, inputsById, salaryType]
  );

  const selectedRows = rows.filter((r) => selectedIds.has(r.staff.id));
  const selectedTotal = selectedRows.reduce((sum, r) => sum + r.computed.netSalary, 0);

  const handleSubmit = () => {
    if (selectedRows.length === 0) {
      setError('Select at least one staff member to sanction salary for.');
      return;
    }
    if (!month || !year) {
      setError('Please select the salary month and year.');
      return;
    }
    setError('');
    submitSalarySanction(
      {
        month, year, salaryType, procNo,
        entries: selectedRows.map((r) => r.computed),
      },
      actor
    );
    setSubmitted(true);
    setSelectedIds(new Set());
    setInputsById({});
    setTimeout(() => setSubmitted(false), 3400);
  };

  const showDayFields = salaryType !== 'Consolidated Pay';
  const showRateFactor = salaryType === 'Daily Wages with Rate Factor';

  return (
    <div className="sd-fade-in">
      {submitted && (
        <div style={styles.successBanner}>
          ✓ Salary sanctioned for {month} {year} ({salaryType}).
        </div>
      )}
      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.metaCard}>
        <div style={styles.metaGrid}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Salary Type</label>
            <select className="sd-select" style={styles.input} value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
              {SALARY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Designation</label>
            <select className="sd-select" style={styles.input} value={designationFilter} onChange={(e) => setDesignationFilter(e.target.value)}>
              {designations.map((d) => <option key={d} value={d}>{d === 'all' ? 'All Designations' : d}</option>)}
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
            <label style={styles.fieldLabel}>Proc No (optional)</label>
            <input className="sd-input" style={styles.input} value={procNo} onChange={(e) => setProcNo(e.target.value)} placeholder="e.g. 2627SAL06/DW" />
          </div>
        </div>

        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            className="sd-input"
            style={styles.searchInput}
            placeholder="Search staff by name, code or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.tableWrap}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} />
                </th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Designation</th>
                {salaryType === 'Consolidated Pay' && <th style={styles.th}>Amount</th>}
                {showDayFields && <th style={styles.th}>Days Worked</th>}
                {showDayFields && <th style={styles.th}>Wage/Day</th>}
                {showRateFactor && <th style={styles.th}>Rate Factor</th>}
                {showDayFields && <th style={styles.th}>Incentive Days</th>}
                {showDayFields && <th style={styles.th}>Incentive/Day</th>}
                {showDayFields && <th style={styles.th}>Lump Sum</th>}
                <th style={styles.th}>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={10} style={styles.emptyCell}>No {salaryType.toLowerCase()} staff match your filters.</td></tr>
              )}
              {rows.map(({ staff: s, computed }) => {
                const inputs = getInputs(s);
                const checked = selectedIds.has(s.id);
                return (
                  <tr key={s.id} style={checked ? styles.trSelected : undefined}>
                    <td style={styles.td}><input type="checkbox" checked={checked} onChange={() => toggleSelect(s.id)} /></td>
                    <td style={{ ...styles.td, fontWeight: 700, color: theme.textPrimary }}>{fullName(s)}</td>
                    <td style={styles.td}>{s.designation}</td>
                    {salaryType === 'Consolidated Pay' && (
                        <td style={styles.td}>
                            <span style={styles.readonlyValue}>{formatCurrency(inputs.consolidatedAmount)}</span>
                        </td>
                        )}
                    {showDayFields && (
                      <td style={styles.td}><NumInput value={inputs.daysWorked} onChange={(v) => setInput(s.id, 'daysWorked', v)} narrow /></td>
                    )}
                    {showDayFields && (
  <td style={styles.td}><span style={styles.readonlyValue}>{formatCurrency(inputs.wagePerDay)}</span></td>
)}
                    {showRateFactor && (
  <td style={styles.td}><span style={styles.readonlyValue}>{inputs.rateFactor}</span></td>
)}
                    {showDayFields && (
                      <td style={styles.td}><NumInput value={inputs.incentiveDays} onChange={(v) => setInput(s.id, 'incentiveDays', v)} narrow /></td>
                    )}
                    {showDayFields && (
                      <td style={styles.td}>
                        <NumInput
                          value={showRateFactor ? inputs.incentiveRateFactor : inputs.incentivePerDay}
                          onChange={(v) => setInput(s.id, showRateFactor ? 'incentiveRateFactor' : 'incentivePerDay', v)}
                          step={showRateFactor ? '0.01' : '1'}
                        />
                      </td>
                    )}
                    {showDayFields && (
                      <td style={styles.td}><NumInput value={inputs.lumpSum} onChange={(v) => setInput(s.id, 'lumpSum', v)} /></td>
                    )}
                    <td style={{ ...styles.td, fontWeight: 800, color: theme.emeraldDark }}>{formatCurrency(computed.netSalary)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.footerBar}>
        <div>
          <strong>{selectedRows.length}</strong> staff selected · Total <strong>{formatCurrency(selectedTotal)}</strong>
        </div>
        <button className="sd-btn" style={styles.submitBtn} onClick={handleSubmit}>
          Generate &amp; Sanction →
        </button>
      </div>
    </div>
  );
}

function NumInput({ value, onChange, step, narrow }) {
  return (
    <input
      className="sd-input"
      type="number"
      step={step || '1'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...styles.cellInput, width: narrow ? 64 : 88 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Approver view                                                       */
/* ------------------------------------------------------------------ */
function ApprovalQueue({ actor }) {
  const [sanctions, setSanctions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [flash, setFlash] = useState('');
  const [downloading, setDownloading] = useState(false);

  const refresh = () => setSanctions(getSanctions());
  useEffect(() => { refresh(); }, []);

  const pendingMine = useMemo(() => sanctions.filter((r) => r.status === `pending_${actor.role}`), [sanctions, actor.role]);
  const others = useMemo(() => sanctions.filter((r) => r.status !== `pending_${actor.role}`), [sanctions, actor.role]);

  const open = (r) => { setSelected(r); setComment(''); };
  const close = () => setSelected(null);

  const handleApprove = () => {
    approveSalarySanction(selected.id, actor, comment || undefined);
    setFlash('✓ Approved and forwarded');
    close(); refresh();
    setTimeout(() => setFlash(''), 2500);
  };

  const handleReject = () => {
    rejectSalarySanction(selected.id, actor, comment || 'Rejected');
    setFlash('Sanction rejected');
    close(); refresh();
    setTimeout(() => setFlash(''), 2500);
  };

  const handleDownload = async (sanction) => {
    setDownloading(true);
    try {
      await downloadSalaryBillPdf(sanction);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="sd-fade-in">
      {flash && <div style={styles.successBanner}>{flash}</div>}


      <Section title="All salary sanctions">
        {others.length === 0 && <div style={styles.emptyRow}>No other sanctions yet.</div>}
        {others.map((r) => <SanctionRow key={r.id} req={r} onClick={() => open(r)} />)}
      </Section>

      {selected && createPortal(
        <div style={styles.overlay} onClick={close}>
          <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>{selected.month} {selected.year} · {selected.salaryType}</h2>
                <p style={styles.drawerSub}>{currentSanctionHolderLabel(selected)} · {selected.entries.length} staff · {formatCurrency(selected.totalAmount)}</p>
              </div>
              <button style={styles.closeBtn} onClick={close}>✕</button>
            </div>

            <button
              className="sd-btn"
              style={styles.downloadBtn}
              onClick={() => handleDownload(selected)}
              disabled={downloading}
            >
              {downloading ? 'Preparing PDF…' : '⬇ Download Bill (PDF)'}
            </button>

            <div style={styles.breakdownWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Staff</th>
                    <th style={styles.th}>Gross</th>
                    <th style={styles.th}>Incentive</th>
                    <th style={styles.th}>Lump Sum</th>
                    <th style={styles.th}>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.entries.map((e) => (
                    <tr key={e.staffId}>
                      <td style={styles.td}>{e.staffName}<br /><span style={{ fontSize: 11, color: theme.textMuted }}>{e.designation}</span></td>
                      <td style={styles.td}>{formatCurrency(e.grossSalary)}</td>
                      <td style={styles.td}>{formatCurrency(e.incentiveAmount)}</td>
                      <td style={styles.td}>{formatCurrency(e.lumpSum)}</td>
                      <td style={{ ...styles.td, fontWeight: 800 }}>{formatCurrency(e.netSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <HistoryTrail history={selected.history} />

            {selected.status === `pending_${actor.role}` && (
              <div style={styles.actionBlock}>
                <textarea
                  className="sd-textarea"
                  style={styles.commentBox}
                  placeholder="Optional comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
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
      <div style={{ flex: 1.6, fontSize: 13.5, color: theme.textSecondary }}>{req.salaryType}</div>
      <div style={{ flex: 1, fontSize: 13, color: theme.textMuted }}>{req.entries.length} staff</div>
      <div style={{ flex: 1.2, fontSize: 13, color: theme.textMuted }}>{formatCurrency(req.totalAmount)}</div>
      <div style={{ flex: 1.6, fontSize: 13, color: theme.textMuted }}>{currentSanctionHolderLabel(req)}</div>
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
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: theme.textSecondary },
  input: { padding: '10px 12px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary, background: theme.surface },

  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 14, fontSize: 15, opacity: 0.6 },
  searchInput: { width: '100%', padding: '11px 16px 11px 40px', borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, background: theme.bgAlt, fontSize: 13.5, color: theme.textPrimary },

  tableWrap: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, boxShadow: theme.shadowSm, marginBottom: 18, overflow: 'hidden' },
  tableScroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', background: theme.bgAlt, fontSize: 11.5, fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' },
  td: { padding: '8px 12px', borderBottom: `1px solid ${theme.border}`, color: theme.textSecondary, verticalAlign: 'middle', whiteSpace: 'nowrap' },
  trSelected: { background: theme.emeraldLight },
  cellInput: { padding: '6px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, fontSize: 12.5 },
  readonlyValue: { fontSize: 12.5, color: theme.textMuted, fontWeight: 600 },
  emptyCell: { padding: '30px 16px', textAlign: 'center', color: theme.textMuted, whiteSpace: 'normal' },

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