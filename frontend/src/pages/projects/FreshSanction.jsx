import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext, PROJECT_STAFF } from './ProjectContext';
import ProjectApprovalTransferCell, { getProfileSignature } from './ProjectApprovalTransferCell';
import SchemeSelectModal from './SchemeSelectModal';
import './FreshSanction.css';
import CSRCProceedingsReport, { assembleReportData } from './CSRCProceedingsReport.jsx';
import html2pdf from 'html2pdf.js';
// ── Helpers ───────────────────────────────────────────────────────────────────
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
// Used only to seed brand-new items / a standalone preview, so the "Report"
// tab always has something representative to render before real data exists.
const DUMMY_EQUIPMENT = [
  { name: 'High Performance Workstation', amount: 300000 },
  { name: 'GPU Server', amount: 200000 },
];
const DUMMY_MANPOWER = [
  { type: 'Project Associate-I', amount: 200000 },
  { type: 'Junior Research Fellow', amount: 100000 },
];
const DUMMY_INSTALLMENT = {
  label: '1st Installment',

  consumables: '150000',
  travel: '50000',
  contingency: '25000',
  ssrBudget: '30000',
  overheadTotal: '120000',

  equipment: DUMMY_EQUIPMENT,
  manpowerList: DUMMY_MANPOWER,

  // Proceedings
  proceedingNo: 'CSRC/CTDT/2026/OBS',
  proceedingDate: '18-06-2026',
  letterRefDate: '15-06-2026',
  directorName: 'THE DIRECTOR, CSRC',

  // Bank
  bankAccount: '123456789012',
  ifscCode: 'SBIN0006756',
  bankBranch: 'Anna University Branch',
};

// ── Make sure an item carries every field the CSRC Proceedings Report needs ───
// (so the "Details" tab always has something to edit and the "Report" tab
//  always has something to render, even for items created before this shape
//  existed)
function ensureReportShape(item) {
  const base = JSON.parse(JSON.stringify(item));
  base.pi = base.pi || {};
  if (base.pi.designation === undefined) base.pi.designation = '';

  if (!base.installments || base.installments.length === 0) {
    // Brand-new item: seed with dummy placeholder data so the Report tab
    // has something representative to show before the user enters real values.
    base.installments = [{ ...DUMMY_INSTALLMENT }];
  } else {
    base.installments = base.installments.map(inst => ({
  label: inst.label ?? '1st Installment',

  nonRecurringTotal: inst.nonRecurringTotal ?? '',
  manpower: inst.manpower ?? '',

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
      toDean: draft?.toDean,
    },
    0,
    [],
  );
}

// ── Transfer Timeline (visual) ─────────────────────────────────────────────────
function TransferTimeline({ item }) {
  const history = item.transferHistory || [];

  const timelineStyle = {
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
    <div style={timelineStyle.wrap}>
      {history.map((entry, i) => {
        const toName  = typeof entry.to   === 'object' ? entry.to?.name   : entry.to;
        const toRole  = typeof entry.to   === 'object' ? entry.to?.role   : null;
        const fromName = typeof entry.from === 'object' ? entry.from?.name : entry.from;
        return (
          <div key={i} style={timelineStyle.entry}>
            <div style={timelineStyle.dotWrap}>
              <div style={timelineStyle.dot(entry.approved)}>{entry.approved ? '✔' : '↪'}</div>
              {i < history.length - 1 && <div style={timelineStyle.line} />}
            </div>
            <div style={timelineStyle.content}>
              <div style={timelineStyle.date}>{entry.date}</div>
              <div style={timelineStyle.transfer}>
                <span style={timelineStyle.from}>{fromName}</span>
                <span style={timelineStyle.arrow}>→</span>
                <span style={timelineStyle.to}>{toName}</span>
                {toRole && <span style={timelineStyle.roleBadge(toRole)}>{toRole}</span>}
              </div>
              <div style={timelineStyle.statusBadge(entry.approved)}>
                {entry.approved ? '✔ Approved & Forwarded' : '↪ Forwarded (Pending Approval)'}
              </div>
            </div>
          </div>
        );
      })}
      {/* Terminal node */}
      {item.currentHolder ? (
        <div style={timelineStyle.pendingEntry}>
          <div style={timelineStyle.pendingDot}>⏳</div>
          <div style={timelineStyle.pendingLabel}>
            Waiting for action from{' '}
            <strong>{item.currentHolder?.name || 'Next Approver'}</strong>
            {item.currentHolder?.role && ` (${item.currentHolder.role})`}
          </div>
        </div>
      ) : (
        <div style={timelineStyle.pendingEntry}>
          <div style={{ ...timelineStyle.pendingDot, background: '#dcfce7', color: '#16a34a', border: '2px solid #16a34a' }}>✔</div>
          <div style={{ ...timelineStyle.pendingLabel, color: '#15803d' }}>
            Process Completed — Fully Approved
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stage Badge ───────────────────────────────────────────────────────────────
function StageBadge({ role }) {
  const map = {
    superintendent: { label: 'With Superintendent', cls: 'fs-stage-supdt' },
    director:       { label: 'With Director',       cls: 'fs-stage-dir'   },
    assistant:      { label: 'With Assistant',      cls: 'fs-stage-asst'  },
  };
  const { label, cls } = map[role] || { label: 'Pending', cls: 'fs-stage-asst' };
  return <span className={`fs-stage-badge ${cls}`}>{label}</span>;
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

// ── Manage Modal — combines View + Edit + Track into one modal, two tabs ──────
function ManageModal({ item, editable, onSave, onClose }) {
  const [tab, setTab] = useState('details');
  const [draft, setDraft] = useState(() => ensureReportShape(item));
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

  useEffect(() => { setDraft(ensureReportShape(item)); setIsEditing(false); }, [item]);

  const inst = draft.installments[0];

  // Fields are only actually editable when the parent says this item CAN be
  // edited (e.g. it's in the "active" tab) AND the user has pressed Edit.
  const fieldsEditable = editable && isEditing;

  const patchInst = (patch) => setDraft(d => ({ ...d, installments: [{ ...d.installments[0], ...patch }] }));
  const patchPI   = (patch) => setDraft(d => ({ ...d, pi: { ...d.pi, ...patch } }));

  // Equipment items now carry { name, amount } — amount feeds Non-Recurring Total
  const addEquipment    = () => patchInst({ equipment: [...(inst.equipment || []), { name: '', amount: '' }] });
  const removeEquipment = (i) => patchInst({ equipment: inst.equipment.filter((_, idx) => idx !== i) });
  const editEquipment   = (i, val) => patchInst({ equipment: inst.equipment.map((e, idx) => idx === i ? val : e) });

  // Manpower items now carry { type, amount } — amount feeds Manpower (Recurring) total
  const addManpower    = () => patchInst({ manpowerList: [...(inst.manpowerList || []), { type: '', amount: '' }] });
  const removeManpower = (i) => patchInst({ manpowerList: inst.manpowerList.filter((_, idx) => idx !== i) });
  const editManpower   = (i, val) => patchInst({ manpowerList: inst.manpowerList.map((m, idx) => idx === i ? val : m) });

  // Derived totals — Non-Recurring Total and Manpower are no longer manual
  // inputs; they're computed live from the equipment / manpower item amounts.
  const nonRecurringTotal = useMemo(() => sumAmounts(inst.equipment), [inst.equipment]);
  const manpowerTotal     = useMemo(() => sumAmounts(inst.manpowerList), [inst.manpowerList]);
  const recurringTotal    = manpowerTotal
    + (parseFloat(inst.consumables) || 0)
    + (parseFloat(inst.travel) || 0)
    + (parseFloat(inst.contingency) || 0);

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
              FRESH SANCTION — {draft.refNo}
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
                  <label>Project Scheme</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.projectScheme || ''}
                    placeholder="e.g. SPC / Core Research Grant"
                    onChange={e => setDraft({ ...draft, projectScheme: e.target.value })} />
                </div>
                <div>
                  <label>Total Cost (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.cost || ''}
                    onChange={e => setDraft({ ...draft, cost: e.target.value })} />
                </div>
                <div>
                  <label>PI Name</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.pi.name || ''}
                    onChange={e => patchPI({ name: e.target.value })} />
                </div>
                <div>
                  <label>PI Designation</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={draft.pi.designation || ''}
                    placeholder="e.g. Professor"
                    onChange={e => patchPI({ designation: e.target.value })} />
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

              <h3>Installment Budget Breakdown — {inst.label}</h3>
              <div className="detail-grid">
                <div>
                  <label>Installment Label</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={inst.label || ''}
                    onChange={e => patchInst({ label: e.target.value })} />
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
                  <input className="edit-input" disabled={!fieldsEditable} value={inst.consumables}
                    onChange={e => patchInst({ consumables: e.target.value })} />
                </div>
                <div>
                  <label>Travel (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={inst.travel}
                    onChange={e => patchInst({ travel: e.target.value })} />
                </div>
                <div>
                  <label>Contingency (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={inst.contingency}
                    onChange={e => patchInst({ contingency: e.target.value })} />
                </div>
                <div>
                  <label>Overhead Total (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={inst.overheadTotal}
                    onChange={e => patchInst({ overheadTotal: e.target.value })} />
                </div>
                <div>
                  <label>Scientific Social Responsibility Budget (₹)</label>
                  <input className="edit-input" disabled={!fieldsEditable} value={inst.ssrBudget}
                    onChange={e => patchInst({ ssrBudget: e.target.value })} />
                </div>
                <div>
                  <label>Recurring Heads Total (₹) <span style={{ fontWeight: 400, color: '#94a3b8' }}>— auto</span></label>
                  <input className="edit-input" disabled value={fmtINRStrict(recurringTotal)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '8px' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <ListFieldEditor
                    label="Equipment Items"
                    items={inst.equipment || []}
                    nameKey="name"
                    totalAmount={nonRecurringTotal}
                    onAdd={addEquipment}
                    onRemove={removeEquipment}
                    onChange={editEquipment}
                    placeholder="e.g. High Performance Workstation"
                    disabled={!fieldsEditable}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <ListFieldEditor
                    label="Manpower Types"
                    items={inst.manpowerList || []}
                    nameKey="type"
                    totalAmount={manpowerTotal}
                    onAdd={addManpower}
                    onRemove={removeManpower}
                    onChange={editManpower}
                    placeholder="e.g. Project Associate-I"
                    disabled={!fieldsEditable}
                  />
                </div>
              </div>

              <h3>Transfer Tracking</h3>
              <TransferTimeline item={draft} />

              {editable && isEditing && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button className="btn-approve" onClick={handleSaveClick}>💾 Save Changes</button>
                  <button className="btn-edit" onClick={() => { setDraft(ensureReportShape(item)); setIsEditing(false); }}>Cancel</button>
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
export default function FreshSanction() {
  const navigate  = useNavigate();
  const role      = userRole();
  const [mounted, setMounted] = useState(false);

  const {
    freshActive,   setFreshActive,
    freshTransferred,
    freshCompleted,
    fresh_transfer,
    fresh_complete,
    fresh_updateTransferred,
    fresh_forwardToDirector,
  } = useProjectContext();

  const [search, setSearch]               = useState('');
  const [activeTab, setActiveTab]         = useState('active');
  const [schemeModalItem, setSchemeModalItem] = useState(null);

  // Single combined View/Edit/Track modal
  const [manageItem, setManageItem] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // ── Data source by role and tab ────────────────────────────────────────────
  const myTransferred = useMemo(() =>
    freshTransferred.filter(i =>
      role === 'superintendent' ? i.currentHolder?.role === 'superintendent' :
      role === 'director'       ? i.currentHolder?.role === 'director'       :
      true
    ), [freshTransferred, role]);

  const activeSource =
    activeTab === 'active'      ? (role === 'assistant' ? freshActive : myTransferred) :
    activeTab === 'transferred' ? freshTransferred :
    freshCompleted;

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

  // ── Scheme assignment ──────────────────────────────────────────────────────
  const handleAssignScheme = (scheme) => {
    if (!schemeModalItem) return;
    const updated = {
      ...schemeModalItem,
      assignedScheme: scheme,
      assignedAccount: scheme.accountType,
      accountCode: scheme.schemeCode,
    };
    setFreshActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    setSchemeModalItem(null);
  };

  // ── Transfer handlers ──────────────────────────────────────────────────────
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
    fresh_transfer(stamped, staff);
  };

  const handlePlainTransferAssistant = (item, staff) => {
    const updated = {
      ...item,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    fresh_transfer(updated, staff);
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
    fresh_forwardToDirector(stamped, staff);
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
    fresh_updateTransferred(updated);
  };

  const handleComplete = (item) => {
    // Stamp director signature on final approval
    const mySig = getProfileSignature(role);
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), director: mySig || true },
      currentHolder: null,      // cleared so isCompleted=true in report
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: { name: 'Completed', role: 'completed' }, date: today(), approved: true },
      ],
    };
    fresh_complete(stamped);
  };

  const handleSaveManaged = (updated) => {
    if (role === 'assistant' && activeTab === 'active') {
      setFreshActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    } else {
      fresh_updateTransferred(updated);
    }
    setManageItem(null);
  };

  // ── Tab labels ─────────────────────────────────────────────────────────────
  const tabs =
    role === 'assistant'
      ? [
          { key: 'active',      label: `New Requests (${freshActive.length})` },
          { key: 'transferred', label: `Transferred (${freshTransferred.length})` },
          { key: 'completed',   label: `Completed (${freshCompleted.length})` },
        ]
      : role === 'superintendent'
      ? [
          { key: 'active',      label: `In My Queue (${myTransferred.length})` },
          { key: 'transferred', label: `All Transferred (${freshTransferred.length})` },
          { key: 'completed',   label: `Completed (${freshCompleted.length})` },
        ]
      : [
          { key: 'active',      label: `Awaiting Approval (${myTransferred.length})` },
          { key: 'completed',   label: `Completed (${freshCompleted.length})` },
        ];

  return (
    <div className={`project-dashboard ${mounted ? 'fs-loaded' : ''}`}>
      {/* Top Nav */}
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

      {/* Header */}
      <div className="fs-header">
        <h1 className="fs-header-title">Fresh Sanctions</h1>
        <p className="fs-header-sub">First installment sanction requests — review, assign account, and transfer</p>
      </div>

      {/* Tabs */}
      <div className="tab-switcher">
        {tabs.map(t => (
          <button
            key={t.key}
            className={activeTab === t.key ? 'active' : ''}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="fs-search-bar">
        <div className="fs-search-inner">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, ref no, agency, PI name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="fs-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {/* Table */}
      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Ref No</th>
            <th>Project Title</th>
            <th>PI</th>
            <th>Agency</th>
            <th>Cost (₹)</th>
            {role === 'assistant' && activeTab === 'active' && <th>Account / Scheme</th>}
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
          {filtered.map((item, idx) => (
            <tr key={item.id}>
              <td>{idx + 1}</td>
              <td>{item.refNo}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{item.pi?.campus}</div>
              </td>
              <td>
                <div>{item.pi?.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{item.pi?.department}</div>
              </td>
              <td>{item.fundingAgency}</td>
              <td>₹ {item.cost}</td>

              {/* Account / Scheme — assistant only, active tab */}
              {role === 'assistant' && activeTab === 'active' && (
                <td>
                  <div className="fs-scheme-cell">
                    {item.assignedScheme ? (
                      <div className="fs-scheme-chip">
                        <div className="fs-scheme-code">{item.assignedScheme.schemeCode}</div>
                        <div className="fs-scheme-name">{item.assignedScheme.schemeName}</div>
                        <div className="fs-scheme-type">{item.assignedScheme.accountType}</div>
                      </div>
                    ) : (
                      <span className="fs-scheme-empty">Not assigned</span>
                    )}
                    <button className="fs-scheme-action-btn" onClick={() => setSchemeModalItem(item)}>
                      {item.assignedScheme ? '✏️ Change' : '➕ Action'}
                    </button>
                  </div>
                </td>
              )}

              {/* Stage column */}
              {(activeTab === 'transferred' || (role !== 'assistant' && activeTab === 'active')) && (
                <td><StageBadge role={item.currentHolder?.role} /></td>
              )}

              {/* Actions */}
              <td>
                <div className="fs-actions">

                  {/* ── Single combined View / Edit / Track button ── */}
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
                    <button className="btn-approve"
                      onClick={() => handleComplete(item)}>
                      ✓ Approve
                    </button>
                  )}

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Scheme selection modal */}
      <SchemeSelectModal
        open={!!schemeModalItem}
        onClose={() => setSchemeModalItem(null)}
        onSelect={handleAssignScheme}
        currentScheme={schemeModalItem?.assignedScheme}
      />

      {/* Combined View / Edit / Track Modal */}
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