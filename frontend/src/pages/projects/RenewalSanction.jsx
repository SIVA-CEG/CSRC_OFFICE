import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext, PROJECT_STAFF } from './ProjectContext';
import ProjectApprovalTransferCell, { getProfileSignature } from './ProjectApprovalTransferCell';
import './FreshSanction.css'; // reuse same base styles
import CSRCProceedingsReport, { assembleReportData } from './CSRCProceedingsReport.jsx';
import html2pdf from 'html2pdf.js';

const userRole = () => localStorage.getItem('userRole') || 'assistant';
const userName = () => localStorage.getItem('userName') || 'Office';

const fmtINRStrict = (n) => {
  const num = parseFloat(n) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Sum the `amount` field across an items array (equipment[] or manpowerList[]).
const sumAmounts = (items) =>
  (items || []).reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);

// ── Dummy placeholder data ─────────────────────────────────────────────────
// Seeds brand-new renewal installments so the Report tab always has
// something representative to render before real data is entered. A
// Renewal Sanction always covers the 2nd-nth installment, so a brand-new
// item is seeded with TWO installments: a completed 1st installment
// (DUMMY_PREV_INSTALLMENT — feeds the "Previous Installments" history) and
// the in-progress 2nd installment (DUMMY_INSTALLMENT — the "current" one).

const DUMMY_PREV_EQUIPMENT = [
  { name: 'Microscope Stage Adapter', amount: 150000 },
];
const DUMMY_PREV_MANPOWER = [
  { type: 'Project Associate-I', amount: 200000 },
];
const DUMMY_PREV_INSTALLMENT = {
  installmentNo: '1st Installment',
  consumables: '80000',
  travel: '30000',
  contingency: '15000',
  ssrBudget: '15000',
  overheadTotal: '70000',
  equipment: DUMMY_PREV_EQUIPMENT,
  manpowerList: DUMMY_PREV_MANPOWER,
  releasedDate: '12-01-2026',
};

const DUMMY_EQUIPMENT = [
  { name: 'Spectrophotometer Accessory', amount: 180000 },
  { name: 'Lab Centrifuge', amount: 120000 },
];
const DUMMY_MANPOWER = [
  { type: 'Project Associate-II', amount: 220000 },
  { type: 'Field Assistant', amount: 90000 },
];
const DUMMY_INSTALLMENT = {
  installmentNo: '2nd Installment',
  consumables: '100000',
  travel: '40000',
  contingency: '20000',
  ssrBudget: '20000',
  overheadTotal: '90000',
  equipment: DUMMY_EQUIPMENT,
  manpowerList: DUMMY_MANPOWER,
};

// ── Make sure an item carries every field the combined Manage Modal needs ─────
function ensureRenewalShape(item) {
  const base = JSON.parse(JSON.stringify(item));
  base.pi = base.pi || {};
  if (base.pi.designation === undefined) base.pi.designation = '';

  // A Renewal Sanction always represents the 2nd-nth installment, so the
  // "current" one defaults to position 2 (never 1 — that's Fresh Sanction's job).
  base.currentInstallment = base.currentInstallment || 2;

  if (!base.installments || base.installments.length === 0) {
    // Brand-new item: seed with BOTH a completed 1st installment and the
    // in-progress 2nd, so the Report tab's Previous Installments table and
    // the Details tab's "Previous Installments" expander both have
    // something representative to show before the user enters real values.
    base.installments = [{ ...DUMMY_PREV_INSTALLMENT }, { ...DUMMY_INSTALLMENT }];
  } else {
    base.installments = base.installments.map(inst => ({
  installmentNo: inst.installmentNo ?? '',
  amount: inst.amount ?? '',

  consumables: inst.consumables || DUMMY_INSTALLMENT.consumables,
  travel: inst.travel || DUMMY_INSTALLMENT.travel,
  contingency: inst.contingency || DUMMY_INSTALLMENT.contingency,
  ssrBudget: inst.ssrBudget || DUMMY_INSTALLMENT.ssrBudget,
  overheadTotal: inst.overheadTotal || DUMMY_INSTALLMENT.overheadTotal,

  equipment:
    inst.equipment?.length > 0
      ? inst.equipment
      : DUMMY_EQUIPMENT,

  manpowerList:
    inst.manpowerList?.length > 0
      ? inst.manpowerList
      : DUMMY_MANPOWER,

  heads: inst.heads || [],
  releasedDate: inst.releasedDate ?? '',
}));
  }

base.proceedingNo =
  base.proceedingNo || 'CSRC/CTDT/2026/OBS';

base.proceedingDate =
  base.proceedingDate || '18-06-2026';

base.letterRefDate =
  base.letterRefDate || '15-06-2026';

base.directorName =
  base.directorName || 'THE DIRECTOR, CSRC';

base.bankAccount =
  base.bankAccount || '123456789012';

base.ifscCode =
  base.ifscCode || 'SBIN0006756';

base.bankBranch =
  base.bankBranch || 'Anna University Branch';
  return base;
}

// ── Build the live report data straight from the (possibly unsaved) draft ─────
function buildLiveReportData(draft) {
  return assembleReportData(
    {
      name: draft?.pi?.name,
      designation: draft?.pi?.designation,
      department: draft?.pi?.department,
      campus: draft?.pi?.campus,
      accountNumber: draft?.bankAccount,
      ifscCode: draft?.ifscCode,
      bankBranch: draft?.bankBranch,
    },
    {
      fundingAgency: draft?.fundingAgency,
      title: draft?.title,
      refNo: draft?.refNo,
      refDate: draft?.refDate,
      projectScheme: draft?.projectScheme,
      period: draft?.period,
      directorName: draft?.directorName,
    },
    {
      projectTitle: draft?.title,
      fundingAgency: draft?.fundingAgency,
      proceedingNo: draft?.proceedingNo || draft?.refNo || 'CSRC/CTDT/2026/OBS',
      proceedingDate: draft?.proceedingDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      period: draft?.period,
      installments: draft?.installments || [],
    },
    (draft?.currentInstallment || 1) - 1,
    [],
  );
}

// ── Stage Badge ───────────────────────────────────────────────────────────────
function StageBadge({ role }) {
  const map = {
    superintendent: { label: 'With Superintendent', cls: 'fs-stage-supdt' },
    director:       { label: 'With Director',       cls: 'fs-stage-dir'   },
  };
  const { label, cls } = map[role] || { label: 'Pending', cls: 'fs-stage-asst' };
  return <span className={`fs-stage-badge ${cls}`}>{label}</span>;
}

// ── Scheme reflection (read-only) ─────────────────────────────────────────────
function SchemeReflect({ item }) {
  if (item.assignedScheme) {
    return (
      <div className="rn-scheme-reflect">
        <span className="rn-scheme-code">{item.assignedScheme.schemeCode}</span>
        <span className="rn-scheme-name">{item.assignedScheme.schemeName}</span>
      </div>
    );
  }
  if (item.assignedAccount) {
    return (
      <div className="rn-scheme-reflect">
        <span className="rn-scheme-code">{item.assignedAccount}</span>
        {item.accountCode && <span className="rn-scheme-name">Code: {item.accountCode}</span>}
      </div>
    );
  }
  return <span className="rn-scheme-empty">Not assigned</span>;
}

// ── Transfer Timeline (visual) ─────────────────────────────────────────────────
function TransferTimeline({ item }) {
  const history = item.transferHistory || [];

  const S = {
    wrap: { padding: '8px 0' },
    entry: { display: 'flex', gap: '12px', marginBottom: '14px' },
    dotWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '28px' },
    dot: (approved) => ({
      width: '24px', height: '24px', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', fontWeight: 'bold', flexShrink: 0,
      background: approved ? '#dcfce7' : '#dbeafe',
      color: approved ? '#16a34a' : '#2563eb',
      border: `2px solid ${approved ? '#16a34a' : '#2563eb'}`,
    }),
    line: { width: '2px', flex: 1, background: '#e2e8f0', marginTop: '4px', minHeight: '14px' },
    content: { flex: 1, paddingBottom: '4px' },
    date: { fontSize: '11px', color: '#888', marginBottom: '2px' },
    transfer: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
    from: { fontSize: '12px', color: '#555' },
    arrow: { fontSize: '13px', color: '#999' },
    to: { fontSize: '12px', fontWeight: 600, color: '#1e293b' },
    roleBadge: (role) => ({
      fontSize: '10px', padding: '1px 6px', borderRadius: '999px', fontWeight: 600,
      background: role === 'superintendent' ? '#dbeafe' : role === 'director' ? '#fce7f3' : '#dcfce7',
      color: role === 'superintendent' ? '#1d4ed8' : role === 'director' ? '#be185d' : '#15803d',
    }),
    statusBadge: (approved) => ({
      marginTop: '4px', fontSize: '10px', padding: '1px 8px', borderRadius: '999px',
      background: approved ? '#f0fdf4' : '#eff6ff',
      color: approved ? '#16a34a' : '#2563eb',
      border: `1px solid ${approved ? '#bbf7d0' : '#bfdbfe'}`,
      display: 'inline-block',
    }),
    pendingEntry: { display: 'flex', gap: '12px' },
    pendingDot: {
      width: '24px', height: '24px', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', background: '#fef9c3', color: '#ca8a04',
      border: '2px solid #ca8a04', flexShrink: 0,
    },
    pendingLabel: { fontSize: '12px', color: '#92400e', fontWeight: 500, paddingTop: '4px' },
  };

  if (history.length === 0) {
    return (
      <div style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
        No transfer history yet. This item is still with the assistant.
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      {history.map((entry, i) => {
        const toName   = typeof entry.to   === 'object' ? entry.to?.name   : entry.to;
        const toRole   = typeof entry.to   === 'object' ? entry.to?.role   : null;
        const fromName = typeof entry.from === 'object' ? entry.from?.name : entry.from;
        return (
          <div key={i} style={S.entry}>
            <div style={S.dotWrap}>
              <div style={S.dot(entry.approved)}>{entry.approved ? '✔' : '↪'}</div>
              {i < history.length - 1 && <div style={S.line} />}
            </div>
            <div style={S.content}>
              <div style={S.date}>{entry.date}</div>
              <div style={S.transfer}>
                <span style={S.from}>{fromName}</span>
                <span style={S.arrow}>→</span>
                <span style={S.to}>{toName}</span>
                {toRole && <span style={S.roleBadge(toRole)}>{toRole}</span>}
              </div>
              <div style={S.statusBadge(entry.approved)}>
                {entry.approved ? '✔ Approved & Forwarded' : '↪ Forwarded (Pending Approval)'}
              </div>
            </div>
          </div>
        );
      })}
      {item.currentHolder ? (
        <div style={S.pendingEntry}>
          <div style={S.pendingDot}>⏳</div>
          <div style={S.pendingLabel}>
            Waiting for action from{' '}
            <strong>{item.currentHolder?.name || 'Next Approver'}</strong>
            {item.currentHolder?.role && ` (${item.currentHolder.role})`}
          </div>
        </div>
      ) : (
        <div style={S.pendingEntry}>
          <div style={{ ...S.pendingDot, background: '#dcfce7', color: '#16a34a', border: '2px solid #16a34a' }}>✔</div>
          <div style={{ ...S.pendingLabel, color: '#15803d' }}>
            Process Completed — Fully Approved
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small repeatable-list editor (equipment / manpower types) — now with amount ─
function ListFieldEditor({ label, items, onAdd, onRemove, onChange, placeholder, disabled, nameKey, totalAmount }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
        {label}
        <span style={{ fontWeight: 700, color: '#1d4ed8' }}> (₹ {fmtINRStrict(totalAmount)})</span>
      </label>
      {(items || []).map((val, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
          <input
            className="edit-input"
            value={val[nameKey]}
            disabled={disabled}
            placeholder={placeholder}
            onChange={e => onChange(i, { ...val, [nameKey]: e.target.value })}
            style={{ flex: 2 }}
          />
          <input
            className="edit-input"
            type="number"
            value={val.amount ?? ''}
            disabled={disabled}
            placeholder="Amount (₹)"
            onChange={e => onChange(i, { ...val, amount: e.target.value })}
            style={{ flex: 1 }}
          />
          {!disabled && (
            <button type="button" onClick={() => onRemove(i)}
              style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', padding: '0 10px', cursor: 'pointer' }}>
              ✕
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button type="button" onClick={onAdd}
          style={{ border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          ➕ Add {label.replace(/s$/, '')}
        </button>
      )}
      {(!items || items.length === 0) && disabled && (
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>None added</div>
      )}
    </div>
  );
}

// ── Manage Modal — combines View + Edit + Track + Report into one modal ───────
function ManageModal({ item, editable, onSave, onClose }) {
  const [tab, setTab] = useState('details');
  const [draft, setDraft] = useState(() => ensureRenewalShape(item));
  const [expandedPrev, setExpandedPrev] = useState(null);
  // Whether the Details tab is currently unlocked for editing.
  // Always starts read-only; the user must press "Edit" to change anything.
  const [isEditing, setIsEditing] = useState(false);

  const reportRef = useRef(null);

const downloadPDF = () => {
  if (!reportRef.current) return;

  html2pdf()
    .set({
      margin: 10,
      filename: `${draft.refNo || "Proceedings"}-Report.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    })
    .from(reportRef.current)
    .save();
};

  useEffect(() => { setDraft(ensureRenewalShape(item)); setIsEditing(false); }, [item]);

  const currentIdx  = (draft.currentInstallment || 1) - 1;
  const currentInst = draft.installments[currentIdx] || draft.installments[0];
  const previousInstallments = draft.installments.filter((_, i) => i < currentIdx);

  // Fields are only actually editable when the parent says this item CAN be
  // edited (e.g. it's in the "active" tab) AND the user has pressed Edit.
  const fieldsEditable = editable && isEditing;

  const patchCurrentInst = (patch) => setDraft(d => ({
    ...d,
    installments: d.installments.map((inst, idx) => idx === currentIdx ? { ...inst, ...patch } : inst),
  }));
  const patchPI = (patch) => setDraft(d => ({ ...d, pi: { ...d.pi, ...patch } }));

  // Equipment items now carry { name, amount } — amount feeds Non-Recurring Total
  const addEquipment    = () => patchCurrentInst({ equipment: [...(currentInst.equipment || []), { name: '', amount: '' }] });
  const removeEquipment = (i) => patchCurrentInst({ equipment: currentInst.equipment.filter((_, idx) => idx !== i) });
  const editEquipment   = (i, val) => patchCurrentInst({ equipment: currentInst.equipment.map((e, idx) => idx === i ? val : e) });

  // Manpower items now carry { type, amount } — amount feeds Manpower (Recurring) total
  const addManpower    = () => patchCurrentInst({ manpowerList: [...(currentInst.manpowerList || []), { type: '', amount: '' }] });
  const removeManpower = (i) => patchCurrentInst({ manpowerList: currentInst.manpowerList.filter((_, idx) => idx !== i) });
  const editManpower   = (i, val) => patchCurrentInst({ manpowerList: currentInst.manpowerList.map((m, idx) => idx === i ? val : m) });

  // Derived totals — feed the live "Total Amount" for the current installment.
  const nonRecurringTotal = useMemo(() => sumAmounts(currentInst?.equipment), [currentInst?.equipment]);
  const manpowerTotal     = useMemo(() => sumAmounts(currentInst?.manpowerList), [currentInst?.manpowerList]);
  const recurringTotal    = manpowerTotal
    + (parseFloat(currentInst?.consumables) || 0)
    + (parseFloat(currentInst?.travel) || 0)
    + (parseFloat(currentInst?.contingency) || 0);
  const overheadTotal     = parseFloat(currentInst?.overheadTotal) || 0;
  const ssrTotal           = parseFloat(currentInst?.ssrBudget) || 0;
  const installmentTotal  = nonRecurringTotal + recurringTotal + overheadTotal + ssrTotal;

  const holderRole = draft.currentHolder?.role;
  const stageColors = {
    superintendent: { bg: '#dbeafe', color: '#1d4ed8' },
    director:       { bg: '#fce7f3', color: '#be185d' },
    assistant:      { bg: '#dcfce7', color: '#15803d' },
  };
  const sc = stageColors[holderRole] || { bg: '#f3f4f6', color: '#374151' };
  const isCompleted = !draft.currentHolder && (draft.transferHistory?.length > 0);

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 100000,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '16px',
  };
  const modalStyle = {
    background: '#f8fafc', borderRadius: '16px', width: 'min(960px, 96vw)',
    height: 'calc(100vh - 32px)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
  };
  const headerStyle = {
    padding: '14px 20px', background: '#1e293b',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
  };
  const tabBarStyle = {
    display: 'flex', gap: '4px', padding: '0 20px', background: '#fff',
    borderBottom: '1px solid #e2e8f0', flexShrink: 0,
  };
  const tabBtnStyle = (active) => ({
    padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 700, color: active ? '#1d4ed8' : '#64748b',
    borderBottom: active ? '3px solid #1d4ed8' : '3px solid transparent',
  });
  const bodyStyle = { flex: 1, overflowY: 'auto', padding: '20px 24px', background: tab === 'report' ? '#e5e7eb' : '#f8fafc' };
  const closeBtnStyle = {
    background: '#ef4444', border: 'none', color: '#fff', borderRadius: '8px',
    padding: '6px 13px', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
  };
  const editBtnStyle = {
    background: '#2563eb', border: 'none', color: '#fff', borderRadius: '8px',
    padding: '6px 13px', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
  };

  const handleSaveClick = () => {
    onSave(draft);
    setIsEditing(false);
  };

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              RENEWAL SANCTION — {draft.refNo} {currentInst && `· ${currentInst.installmentNo}`}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.3, maxWidth: '640px' }}>
              {draft.title}
            </div>
            {draft.currentHolder ? (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: sc.bg, color: sc.color }}>
                  {holderRole === 'superintendent' ? '🔵' : holderRole === 'director' ? '🔴' : '🟢'}
                  {' '}Currently with {draft.currentHolder?.name} ({holderRole})
                </span>
              </div>
            ) : draft.transferHistory?.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: '#dcfce7', color: '#15803d' }}>
                  ✔ Completed
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {editable && tab === 'details' && !isEditing && (
              <button style={editBtnStyle} onClick={() => setIsEditing(true)}>✏️ Edit</button>
            )}
            {tab === "report" && (
  <button
    onClick={downloadPDF}
    style={{
      background: "#16a34a",
      border: "none",
      color: "#fff",
      borderRadius: "8px",
      padding: "6px 13px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "12px",
    }}
  >
    📄 Download PDF
  </button>
)}

<button style={closeBtnStyle} onClick={onClose}>
  ✕ Close
</button>
          </div>
        </div>

        <div style={tabBarStyle}>
          <button style={tabBtnStyle(tab === 'details')} onClick={() => setTab('details')}>📋 Full Details &amp; Tracking</button>
          <button style={tabBtnStyle(tab === 'report')}  onClick={() => setTab('report')}>📄 Proceedings Report</button>
        </div>

        <div style={bodyStyle}>
          {tab === 'details' ? (
            <div className="detail-card" style={{ boxShadow: 'none', padding: 0, background: 'transparent' }}>
              <h3 style={{ marginTop: 0 }}>Project Details</h3>
              <div className="detail-grid">
                <div>
                  <label>Reference No</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.refNo || ''}
                    onChange={e => setDraft({ ...draft, refNo: e.target.value })} />
                </div>
                <div>
                  <label>Funding Agency</label>
                  <select className="edit-input" disabled={!fieldsEditable} value={draft.fundingAgency || ''}
                    onChange={e => setDraft({ ...draft, fundingAgency: e.target.value })}>
                    {['SERB','DST','DRDO','ISRO','ICMR','CSIR','MeitY','DBT','MNRE'].map(a =>
                      <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Project Title</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.title || ''}
                    onChange={e => setDraft({ ...draft, title: e.target.value })} />
                </div>
                <div>
                  <label>PI Name</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.pi.name || ''}
                    onChange={e => patchPI({ name: e.target.value })} />
                </div>
                <div>
                  <label>Department</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.pi.department || ''}
                    onChange={e => patchPI({ department: e.target.value })} />
                </div>
                <div>
                  <label>Campus</label>
                  <select className="edit-input" disabled={!fieldsEditable} value={draft.pi.campus || ''}
                    onChange={e => patchPI({ campus: e.target.value })}>
                    {['CEG Campus','MIT Campus','ACT Campus','SAP Campus'].map(c =>
                      <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label>Project Period</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.period || ''}
                    onChange={e => setDraft({ ...draft, period: e.target.value })} />
                </div>
              </div>

              <h3>Account / Scheme</h3>
              <div style={{ marginBottom: '8px' }}>
                <SchemeReflect item={draft} />
              </div>

              <h3>Proceedings &amp; Reference</h3>
              <div className="detail-grid">
                <div>
                  <label>Proceeding No</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.proceedingNo || ''}
                    placeholder="CSRC/CTDT/2026/OBS"
                    onChange={e => setDraft({ ...draft, proceedingNo: e.target.value })} />
                </div>
                <div>
                  <label>Proceeding Date</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.proceedingDate || ''}
                    placeholder="DD-MM-YYYY"
                    onChange={e => setDraft({ ...draft, proceedingDate: e.target.value })} />
                </div>
                <div>
                  <label>Letter Ref. Date</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.refDate || ''}
                    placeholder="DD-MM-YYYY"
                    onChange={e => setDraft({ ...draft, refDate: e.target.value })} />
                </div>
                <div>
                  <label>Director Name</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.directorName || ''}
                    placeholder="THE DIRECTOR, CSRC"
                    onChange={e => setDraft({ ...draft, directorName: e.target.value })} />
                </div>
              </div>

              <h3>Bank Details</h3>
              <div className="detail-grid">
                <div>
                  <label>Bank Account No.</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.bankAccount || ''}
                    onChange={e => setDraft({ ...draft, bankAccount: e.target.value })} />
                </div>
                <div>
                  <label>IFSC Code</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.ifscCode || ''}
                    onChange={e => setDraft({ ...draft, ifscCode: e.target.value })} />
                </div>
                <div>
                  <label>Bank Branch</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.bankBranch || ''}
                    onChange={e => setDraft({ ...draft, bankBranch: e.target.value })} />
                </div>
              </div>

              {previousInstallments.length > 0 && (
                <>
                  <h3>Previous Installments</h3>
                  {previousInstallments.map((inst, idx) => (
                    <div key={idx} className="sanctioned-inst-card">
                      <button className="btn-view" onClick={() => setExpandedPrev(expandedPrev === idx ? null : idx)}>
                        {inst.installmentNo}
                      </button>
                      {expandedPrev === idx && (
                        <table className="sanctioned-table">
                          <thead><tr><th>Item</th><th>Amount</th></tr></thead>
                          <tbody>
                            {(inst.equipment || []).map((e, i) => <tr key={`e${i}`}><td>{e.name}</td><td>₹ {fmtINRStrict(e.amount)}</td></tr>)}
                            {(inst.manpowerList || []).map((m, i) => <tr key={`m${i}`}><td>{m.type}</td><td>₹ {fmtINRStrict(m.amount)}</td></tr>)}
                            {(inst.heads || []).map((h, i) => <tr key={`h${i}`}><td>{h.head}</td><td>{h.amount}</td></tr>)}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </>
              )}

              <h3>Current Installment — {currentInst?.installmentNo}</h3>
              <div className="detail-grid">
                <div>
                  <label>Installment Label</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={currentInst?.installmentNo || ''}
                    onChange={e => patchCurrentInst({ installmentNo: e.target.value })} />
                </div>
                <div>
                  <label>Non-Recurring Total (₹) <span style={{ fontWeight: 400, color: '#94a3b8' }}>— auto from Equipment</span></label>
                  <input className="edit-input" disabled value={fmtINRStrict(nonRecurringTotal)} />
                </div>
                <div>
                  <label>Manpower (₹) <span style={{ fontWeight: 400, color: '#94a3b8' }}>— auto from Manpower Types</span></label>
                  <input className="edit-input" disabled value={fmtINRStrict(manpowerTotal)} />
                </div>
                <div>
                  <label>Consumables &amp; Accessories (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={currentInst?.consumables ?? ''}
                    onChange={e => patchCurrentInst({ consumables: e.target.value })} />
                </div>
                <div>
                  <label>Travel (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={currentInst?.travel ?? ''}
                    onChange={e => patchCurrentInst({ travel: e.target.value })} />
                </div>
                <div>
                  <label>Contingency (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={currentInst?.contingency ?? ''}
                    onChange={e => patchCurrentInst({ contingency: e.target.value })} />
                </div>
                <div>
                  <label>Overhead Total (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={currentInst?.overheadTotal ?? ''}
                    onChange={e => patchCurrentInst({ overheadTotal: e.target.value })} />
                </div>
                <div>
                  <label>Scientific Social Responsibility Budget (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={currentInst?.ssrBudget ?? ''}
                    onChange={e => patchCurrentInst({ ssrBudget: e.target.value })} />
                </div>
                <div>
                  <label>Recurring Heads Total (₹) <span style={{ fontWeight: 400, color: '#94a3b8' }}>— auto</span></label>
                  <input className="edit-input" disabled value={fmtINRStrict(recurringTotal)} />
                </div>
                <div>
                  <label>Total Amount (₹) <span style={{ fontWeight: 400, color: '#94a3b8' }}>— auto</span></label>
                  <input className="edit-input" disabled value={fmtINRStrict(installmentTotal)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '8px' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <ListFieldEditor
                    label="Equipment Items"
                    items={currentInst?.equipment || []}
                    nameKey="name"
                    totalAmount={nonRecurringTotal}
                    onAdd={addEquipment}
                    onRemove={removeEquipment}
                    onChange={editEquipment}
                    placeholder="e.g. Lab Centrifuge"
                    disabled={!fieldsEditable}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <ListFieldEditor
                    label="Manpower Types"
                    items={currentInst?.manpowerList || []}
                    nameKey="type"
                    totalAmount={manpowerTotal}
                    onAdd={addManpower}
                    onRemove={removeManpower}
                    onChange={editManpower}
                    placeholder="e.g. Project Associate-II"
                    disabled={!fieldsEditable}
                  />
                </div>
              </div>

              <h3>Transfer Tracking</h3>
              <TransferTimeline item={draft} />

              {editable && isEditing && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button className="btn-approve" onClick={handleSaveClick}>💾 Save Changes</button>
                  <button className="btn-edit" onClick={() => { setDraft(ensureRenewalShape(item)); setIsEditing(false); }}>Cancel</button>
                </div>
              )}
            </div>
          ) : (
            <div ref={reportRef}>
  <CSRCProceedingsReport
    reportData={buildLiveReportData(draft)}
    signatures={draft.signatures || {}}
    isCompleted={isCompleted}
  />
</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RenewalSanction() {
  const navigate = useNavigate();
  const role     = userRole();
  const [mounted, setMounted] = useState(false);

  const {
    renewalActive,   setRenewalActive,
    renewalTransferred,
    renewalCompleted,
    renewal_transfer,
    renewal_complete,
    renewal_updateTransferred,
    renewal_forwardToDirector,
  } = useProjectContext();

  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // Single combined View/Edit/Track/Report modal
  const [manageItem, setManageItem] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const myTransferred = useMemo(() =>
    renewalTransferred.filter(i =>
      role === 'superintendent' ? i.currentHolder?.role === 'superintendent' :
      role === 'director'       ? i.currentHolder?.role === 'director' : true
    ), [renewalTransferred, role]);

  const activeSource =
    activeTab === 'active'      ? (role === 'assistant' ? renewalActive : myTransferred) :
    activeTab === 'transferred' ? renewalTransferred :
    renewalCompleted;

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return activeSource;
    return activeSource.filter(i =>
      i.title?.toLowerCase().includes(s) ||
      i.refNo?.toLowerCase().includes(s) ||
      i.fundingAgency?.toLowerCase().includes(s) ||
      i.pi?.name?.toLowerCase().includes(s)
    );
  }, [activeSource, search]);

  const today = () => new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

  const handleApproveTransfer = (item, staff) => {
    const mySig = getProfileSignature(role);
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), [role]: mySig || true },
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: true },
      ],
    };
    renewal_transfer(stamped, staff);
  };

  const handlePlainTransferAssistant = (item, staff) => {
    const updated = {
      ...item,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    renewal_transfer(updated, staff);
  };

  const handleApproveForward = (item, staff) => {
    const mySig = getProfileSignature(role);
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), [role]: mySig || true },
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: true },
      ],
    };
    renewal_forwardToDirector(stamped, staff);
  };

  const handlePlainTransferSuperintendent = (item, staff) => {
    const updated = {
      ...item,
      currentHolder: staff,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    renewal_updateTransferred(updated);
  };

  const handleComplete = (item) => {
    const mySig = getProfileSignature(role);
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), director: mySig || true },
      currentHolder: null,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: { name: 'Completed', role: 'completed' }, date: today(), approved: true },
      ],
    };
    renewal_complete(stamped);
  };

  const handleSaveManaged = (updated) => {
    if (role === 'assistant' && activeTab === 'active') {
      setRenewalActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    } else {
      renewal_updateTransferred(updated);
    }
    setManageItem(null);
  };

  const tabs =
    role === 'assistant'
      ? [
          { key: 'active',      label: `New Requests (${renewalActive.length})` },
          { key: 'transferred', label: `Transferred (${renewalTransferred.length})` },
          { key: 'completed',   label: `Completed (${renewalCompleted.length})` },
        ]
      : role === 'superintendent'
      ? [
          { key: 'active',      label: `In My Queue (${myTransferred.length})` },
          { key: 'transferred', label: `All Transferred (${renewalTransferred.length})` },
          { key: 'completed',   label: `Completed (${renewalCompleted.length})` },
        ]
      : [
          { key: 'active',      label: `Awaiting Approval (${myTransferred.length})` },
          { key: 'completed',   label: `Completed (${renewalCompleted.length})` },
        ];

  return (
    <div className={`project-dashboard ${mounted ? 'fs-loaded' : ''}`}>
      <div className="fs-top-nav">
        <button className="fs-btn-back" onClick={() => navigate('/projects/dashboard')}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="fs-nav-right">
          <span className={`fs-role-chip fs-role-${role}`}>
            {role === 'assistant' ? '🟢' : role === 'superintendent' ? '🔵' : '🔴'} {role}
          </span>
        </div>
      </div>

      <div className="fs-header">
        <h1 className="fs-header-title">Other Sanctions</h1>
        <p className="fs-header-sub">2nd–nth installment requests — review, assign account, and transfer</p>
      </div>

      <div className="tab-switcher">
        {tabs.map(t => (
          <button key={t.key}
            className={activeTab === t.key ? 'active' : ''}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="fs-search-bar">
        <div className="fs-search-inner">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Search by title, ref no, agency, PI name..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="fs-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Ref No</th>
            <th>Project Title</th>
            <th>PI</th>
            <th>Agency</th>
            <th>Installment</th>
            <th>Amount (₹)</th>
            <th>Account / Scheme</th>
            {(activeTab === 'transferred' || (role !== 'assistant' && activeTab === 'active')) && <th>Stage</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                {search ? `No results for "${search}"` : 'No items to display'}
              </td>
            </tr>
          )}
          {filtered.map((item, idx) => {
            const current = item.installments[item.currentInstallment - 1];
            const currentAmount = current
              ? sumAmounts(current.equipment) + sumAmounts(current.manpowerList)
                + (parseFloat(current.consumables) || 0)
                + (parseFloat(current.travel) || 0)
                + (parseFloat(current.contingency) || 0)
                + (parseFloat(current.overheadTotal) || 0)
                + (parseFloat(current.ssrBudget) || 0)
              : 0;
            return (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.refNo}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{item.pi?.campus}</div>
                </td>
                <td>{item.pi?.name}</td>
                <td>{item.fundingAgency}</td>
                <td>{current?.installmentNo}</td>
                <td>₹ {fmtINRStrict(currentAmount)}</td>
                <td><SchemeReflect item={item} /></td>
                {(activeTab === 'transferred' || (role !== 'assistant' && activeTab === 'active')) && (
                  <td><StageBadge role={item.currentHolder?.role} /></td>
                )}
                <td>
                  <div className="fs-actions">

                    {/* ── Single combined View / Edit / Track / Report button ── */}
                    <button
                      className="btn-view"
                      onClick={() => setManageItem(item)}
                      title="View full details, track progress, and edit"
                    >
                      👁 View
                    </button>

                    {/* ── Assistant: Approve & Transfer / Plain Transfer ── */}
                    {role === 'assistant' && activeTab === 'active' && (
                      <ProjectApprovalTransferCell
                        item={item}
                        userRole={role}
                        onApproveTransfer={handleApproveTransfer}
                        onPlainTransfer={handlePlainTransferAssistant}
                      />
                    )}

                    {/* ── Superintendent: Approve & Forward / Plain Transfer ── */}
                    {role === 'superintendent' && activeTab === 'active' && (
                      <ProjectApprovalTransferCell
                        item={item}
                        userRole={role}
                        onApproveTransfer={handleApproveForward}
                        onPlainTransfer={handlePlainTransferSuperintendent}
                      />
                    )}

                    {/* ── Director: Final Approve ── */}
                    {role === 'director' && activeTab === 'active' && (
                      <button className="btn-approve" onClick={() => handleComplete(item)}>
                        ✓ Approve
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Combined View / Edit / Track / Report Modal */}
      {manageItem && (
        <ManageModal
          item={manageItem}
          editable={activeTab === 'active'}
          onSave={handleSaveManaged}
          onClose={() => setManageItem(null)}
        />
      )}
    </div>
  );
}