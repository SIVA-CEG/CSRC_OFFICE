import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import CSRCPDFSanctionLetter, { fmtINR } from './CSRCPDFSanctionLetter';
import CSRCClaimBillForm from './CSRCClaimBillForm';

// ============================================================
// PDFOfficeApprovalPage.jsx
// Office-side counterpart to the faculty PDFRequest.jsx module.
//
// Full lifecycle:
//   active        -> assistant -> superintendent -> deputy director
//                    -> director (4-tier sanction chain, unchanged)
//   billProcessing -> after the director's final sanction approval,
//                    the assistant enters the bill-processing figures
//                    (appropriation / amount spent / balance) and the
//                    Claim Bill particulars, then sends it to faculty
//   awaitingSignature -> faculty has been notified; Claim Bill is
//                    downloadable on their side; CSRC office is
//                    waiting for the physically signed copy to
//                    return. Once it does, the assistant registers
//                    the "FOR OFFICE USE ONLY" section directly
//                    (no need to go through the 4-tier chain again)
//   completed     -> fully done; visible read-only everywhere
//   rejected      -> rejected at some stage of the sanction chain
// ============================================================

// ─── Storage keys ────────────────────────────────────────────
const FACULTY_LS_KEY = 'csrc_pdf_requests';       // written by PDFRequest.jsx
const OFFICE_LS_KEY  = 'csrc_pdf_office_workflow'; // owned by this page

// ─── Session identity ───────────────────────────────────────
const userRole = () => sessionStorage.getItem('userRole') || 'assistant';
const userName = () => sessionStorage.getItem('userName') || 'Office';

// ─── Next-role routing for the 4-tier chain ─────────────────
const NEXT_ROLE = {
  assistant: 'superintendent',
  superintendent: 'deputy_director',
  deputy_director: 'director',
};
const ROLE_LABEL = {
  assistant: 'Assistant',
  superintendent: 'Superintendent',
  deputy_director: 'Deputy Director',
  director: 'Director',
};
// Matches RevenueLogin.jsx MOCK_DB — replace with a real staff
// directory / picker when one is available for the Revenue module.
const STAFF_BY_ROLE = {
  superintendent:  { name: 'Mr. T. Anbarasan',        role: 'superintendent' },
  deputy_director: { name: 'Dr. M. Kalaiselvi',        role: 'deputy_director' },
  director:        { name: 'Dr. S. Balasivanandha Prabu', role: 'director' },
};

// Mirrors the same list + calculation used in the faculty-side PDF
// module (facultyProjects + committed-amount math). Kept as a local
// copy here rather than a cross-file import, since the faculty page
// and this office page live in separate parts of the app and aren't
// guaranteed to sit at a stable relative path to each other.
// If/when both are consolidated under one shared module, replace
// this with a single shared import.
const facultyProjects = [
  { id: 'p1', fileNo: '1234/CSRC-2/2025', title: 'ABCD', pdfAmount: 65000 },
  { id: 'p2', fileNo: '2433/CSRC-2/2020', title: 'Development of Ti(C,N) based cermets modified by Si3N4, B4C and Cr3C2 for metal cutting application', pdfAmount: 128000 },
  { id: 'p3', fileNo: '721/CSRC-2/2013', title: 'Studies on Thermal Stability of Bulk Nano Structured Aluminium-Lithium (AA8090) Alloy Processed by Respective Corrugation and Straightening', pdfAmount: 42500 },
];

function getPDFBalanceSummary(requests) {
  const totalPDF = facultyProjects.reduce((s, p) => s + p.pdfAmount, 0);
  const committedAmount = requests
    .filter(r => r.status === 'pending' || r.status === 'sanctioned' || r.status === 'awaiting_signature' || r.status === 'completed')
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const availableBalance = Math.max(totalPDF - committedAmount, 0);
  return { totalPDF, committedAmount, availableBalance };
}

// ─── Local helpers ───────────────────────────────────────────
const today = () => new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
  catch { return fallback; }
};
const saveJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
};

const emptyOfficeState = () => ({
  active: [], transferred: [], billProcessing: [], awaitingSignature: [], completed: [], rejected: [],
});

// Faculty profile lookup — this page only receives requestType /
// category / amount / account details from the faculty request;
// designation / department / campus should ultimately come from
// the faculty master record. Swap this stub out for the real
// lookup (Faculties master / PI profile) when wiring up the API.
function resolveFacultyProfile(request) {
  return {
    designation: request.designation || 'Professor',
    department: request.department || 'Department of ' + (request.account?.branch ? request.account.branch : 'General Studies'),
    campus: request.campus || 'CEG',
  };
}

// Pull any faculty requests that are pending and not yet claimed
// into the office workflow, and wrap them into office-shaped items.
function pullNewFacultyRequests(officeState) {
  const facultyRequests = loadJSON(FACULTY_LS_KEY, []);
  const claimedIds = new Set([
    ...officeState.active.map(i => i.sourceRequestId),
    ...officeState.transferred.map(i => i.sourceRequestId),
    ...officeState.billProcessing.map(i => i.sourceRequestId),
    ...officeState.awaitingSignature.map(i => i.sourceRequestId),
    ...officeState.completed.map(i => i.sourceRequestId),
    ...officeState.rejected.map(i => i.sourceRequestId),
  ]);
  const fresh = facultyRequests
    .filter(r => r.status === 'pending' && !claimedIds.has(r.id))
    .map(r => {
      const profile = resolveFacultyProfile(r);
      return {
        id: `OFF-${r.id}`,
        sourceRequestId: r.id,
        facultyName: r.account?.accountHolder || 'Faculty',
        account: r.account,
        requestType: r.requestType,
        category: r.category,
        categoryFields: r.categoryFields,
        billDetails: r.billDetails || {},
        amount: r.amount,
        letterFileName: r.letterFileName,
        supportingFileNames: r.supportingFileNames,
        submittedAt: r.submittedAt,
        ...profile,
        officeFields: {
          mhNo: '', head: '', subhead: '',
          sNo: '', pageNo: '',
          proceedingNo: '', proceedingDate: today(),
          directorName: 'Dr. S. Balasivanandha Prabu',
        },
        billProcessingData: null,
        officeUseData: null,
        currentHolder: null,
        transferHistory: [],
        signatures: {},
      };
    });
  return fresh;
}

// Sync a status change (and any extra data) back to the
// faculty-facing request so PDFRequest.jsx reflects it.
function syncFacultyStatus(sourceRequestId, status, extra = {}) {
  const facultyRequests = loadJSON(FACULTY_LS_KEY, []);
  const updated = facultyRequests.map(r =>
    r.id === sourceRequestId ? { ...r, status, ...extra } : r
  );
  saveJSON(FACULTY_LS_KEY, updated);
}

// ============================================================
// Styles (light theme, consistent with the faculty-side module)
// ============================================================
const styles = {
  page: { background: '#f4f6fa', minHeight: '100vh', padding: '28px 32px 60px', fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', color: '#1e293b' },
  topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #d8dee8', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' },
  roleChip: (role) => ({
    fontSize: 12.5, fontWeight: 700, padding: '5px 14px', borderRadius: 999,
    background: { assistant: '#dcfce7', superintendent: '#dbeafe', deputy_director: '#fef3c7', director: '#fce7f3' }[role] || '#f1f5f9',
    color: { assistant: '#15803d', superintendent: '#1d4ed8', deputy_director: '#b45309', director: '#be185d' }[role] || '#334155',
  }),
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 700, margin: 0, color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },

  tabBar: { display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' },
  tabBtn: (active) => ({
    padding: '10px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
    background: 'none', border: 'none', color: active ? '#2563eb' : '#64748b',
    borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
  }),

  card: { background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(15,23,42,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '11px 14px', background: '#f8fafc', color: '#475569', fontWeight: 700, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'top' },
  emptyState: { textAlign: 'center', padding: '48px 20px', color: '#94a3b8' },

  stageBadge: (role) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '4px 12px',
    fontSize: 12, fontWeight: 700,
    background: { superintendent: '#dbeafe', deputy_director: '#fef3c7', director: '#fce7f3' }[role] || '#f1f5f9',
    color: { superintendent: '#1d4ed8', deputy_director: '#b45309', director: '#be185d' }[role] || '#334155',
  }),
  statusBadge: (status) => {
    const map = {
      completed: { bg: '#f0fdf4', color: '#16a34a', label: '✓ Completed' },
      rejected:  { bg: '#fef2f2', color: '#dc2626', label: '✕ Rejected' },
      bill_processing: { bg: '#eff6ff', color: '#2563eb', label: '🧾 Bill Processing' },
      awaiting_signature: { bg: '#fefce8', color: '#ca8a04', label: '✍️ Awaiting Signature' },
    };
    const s = map[status] || map.completed;
    return { display: 'inline-flex', alignItems: 'center', gap: 6, background: s.bg, color: s.color, borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700 };
  },

  btnView: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' },
  btnApprove: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' },
  btnReject: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' },
  actionsCell: { display: 'flex', gap: 8, flexWrap: 'wrap' },

  // Modal
  overlay: { position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' },
  modal: { background: '#f8fafc', borderRadius: 16, width: 'min(980px, 96vw)', maxHeight: 'calc(100vh - 32px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' },
  modalHeader: { padding: '16px 20px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 },
  modalTitleTag: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  modalTitle: { fontSize: 15, fontWeight: 700, color: '#fff' },
  modalTabBar: { display: 'flex', gap: 4, padding: '0 20px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 },
  modalTabBtn: (active) => ({ padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: active ? '#1d4ed8' : '#64748b', borderBottom: active ? '3px solid #1d4ed8' : '3px solid transparent' }),
  modalBody: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  closeBtn: { background: '#ef4444', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 13px', cursor: 'pointer', fontWeight: 700, fontSize: 12 },
  downloadBtn: { background: '#16a34a', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 13px', cursor: 'pointer', fontWeight: 700, fontSize: 12 },

  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '20px 0 10px', textTransform: 'uppercase', letterSpacing: 0.4 },
  readOnlyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(15,23,42,0.06)' },
  roField: { display: 'flex', flexDirection: 'column', gap: 3 },
  roLabel: { fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' },
  roValue: { fontSize: 13.5, color: '#0f172a', fontWeight: 600 },

  editGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12.5, fontWeight: 600, color: '#475569' },
  input: { border: '1px solid #d8dee8', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, color: '#0f172a', outline: 'none', background: '#fff' },

  noticeBox: (tone) => ({
    marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 12.5,
    background: tone === 'warn' ? '#fefce8' : '#eff6ff',
    color: tone === 'warn' ? '#92400e' : '#1d4ed8',
    border: `1px solid ${tone === 'warn' ? '#fde68a' : '#bfdbfe'}`,
  }),

  timelineWrap: { padding: '8px 0' },
  timelineEntry: { display: 'flex', gap: 12, marginBottom: 14 },
  timelineDotWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 28 },
  timelineDot: (approved) => ({ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: approved ? '#dcfce7' : '#dbeafe', color: approved ? '#16a34a' : '#2563eb', border: `2px solid ${approved ? '#16a34a' : '#2563eb'}` }),
  timelineLine: { width: 2, flex: 1, background: '#e2e8f0', marginTop: 4, minHeight: 14 },
  timelineDate: { fontSize: 11, color: '#888', marginBottom: 2 },
  timelineTransfer: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  pendingRow: { display: 'flex', gap: 12 },
  pendingDot: { width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: '#fef9c3', color: '#ca8a04', border: '2px solid #ca8a04', flexShrink: 0 },
};

// ─── Small readonly + editable field components ─────────────
const RO = ({ label, value }) => (
  <div style={styles.roField}><span style={styles.roLabel}>{label}</span><span style={styles.roValue}>{value || '—'}</span></div>
);
const EF = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <input style={styles.input} type={type} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
  </div>
);

// ─── Transfer timeline ───────────────────────────────────────
function TransferTimeline({ item }) {
  const history = item.transferHistory || [];
  if (history.length === 0) {
    return <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No transfer history yet. This request is still with the assistant.</div>;
  }
  return (
    <div style={styles.timelineWrap}>
      {history.map((entry, i) => (
        <div key={i} style={styles.timelineEntry}>
          <div style={styles.timelineDotWrap}>
            <div style={styles.timelineDot(entry.approved)}>{entry.approved ? '✔' : '↪'}</div>
            {i < history.length - 1 && <div style={styles.timelineLine} />}
          </div>
          <div>
            <div style={styles.timelineDate}>{entry.date}</div>
            <div style={styles.timelineTransfer}>
              <span style={{ fontSize: 12, color: '#555' }}>{entry.from}</span>
              <span style={{ color: '#999' }}>→</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{entry.to?.name || entry.to}</span>
              {entry.to?.role && (
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, fontWeight: 600, background: '#dbeafe', color: '#1d4ed8' }}>
                  {ROLE_LABEL[entry.to.role] || entry.to.role}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      {item.currentHolder ? (
        <div style={styles.pendingRow}>
          <div style={styles.pendingDot}>⏳</div>
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 500, paddingTop: 4 }}>
            Waiting for action from <strong>{item.currentHolder.name}</strong> ({ROLE_LABEL[item.currentHolder.role]})
          </div>
        </div>
      ) : (
        <div style={styles.pendingRow}>
          <div style={{ ...styles.pendingDot, background: '#dcfce7', color: '#16a34a', border: '2px solid #16a34a' }}>✔</div>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600, paddingTop: 4 }}>Sanction Chain Completed</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Manage Modal — Details (office fields + tracking) + Letter Report
// Used for items in the 4-tier sanction chain (active / transferred)
// ============================================================
function ManageModal({ item, role, editable, onClose, onSave, onTransfer, onApproveComplete, onReject }) {
  const [tab, setTab] = useState('details');
  const [draft, setDraft] = useState(item);
  const reportRef = React.useRef(null);

  useEffect(() => { setDraft(item); setTab('details'); }, [item]);

  // Auto-fetched from the faculty-side PDF ledger — same
  // totalPDF / committedAmount math PDFRequest.jsx uses, so it
  // stays correct as new requests come in from any faculty.
  const balanceSummary = useMemo(() => {
    const facultyRequests = loadJSON(FACULTY_LS_KEY, []);
    return getPDFBalanceSummary(facultyRequests);
  }, [draft.id, draft.status]);

  const patchOffice = (patch) => setDraft(d => ({ ...d, officeFields: { ...d.officeFields, ...patch } }));

  const downloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf().set({
      margin: 8,
      filename: `${draft.officeFields?.proceedingNo || 'PDF-Sanction'}-Letter.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(reportRef.current).save();
  };

  const nextRole = NEXT_ROLE[role];
  const isFinalStage = role === 'director';
  const officeFieldsComplete = draft.officeFields?.mhNo && draft.officeFields?.head && draft.officeFields?.subhead
    && draft.officeFields?.sNo && draft.officeFields?.pageNo && draft.officeFields?.proceedingNo;

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitleTag}>PDF SANCTION — {draft.facultyName}</div>
            <div style={styles.modalTitle}>{draft.category} · ₹ {fmtINR(draft.amount)} · {draft.requestType}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tab === 'report' && <button style={styles.downloadBtn} onClick={downloadPDF}>📄 Download PDF</button>}
            <button style={styles.closeBtn} onClick={onClose}>✕ Close</button>
          </div>
        </div>

        <div style={styles.modalTabBar}>
          <button style={styles.modalTabBtn(tab === 'details')} onClick={() => setTab('details')}>📋 Details &amp; Tracking</button>
          <button style={styles.modalTabBtn(tab === 'report')} onClick={() => setTab('report')}>📄 Proceedings Letter</button>
        </div>

        <div style={styles.modalBody}>
          {tab === 'details' ? (
            <>
              <div style={styles.sectionTitle}>Faculty Request (read-only, fetched from faculty submission)</div>
              <div style={styles.readOnlyGrid}>
                <RO label="Faculty" value={draft.facultyName} />
                <RO label="Designation" value={draft.designation} />
                <RO label="Department" value={draft.department} />
                <RO label="Campus" value={draft.campus} />
                <RO label="Request Type" value={draft.requestType} />
                <RO label="Purpose Category" value={draft.category} />
                <RO label="Amount Requested" value={`₹ ${fmtINR(draft.amount)}`} />
                <RO label="Bank Account No." value={draft.account?.accountNumber} />
                <RO label="IFSC" value={draft.account?.ifsc} />
                <RO label="Bank" value={draft.account?.bankName} />
                <RO label="Submitted On" value={draft.submittedAt} />
                <RO label="Letter Uploaded" value={draft.letterFileName} />
              </div>

              <div style={styles.sectionTitle}>Bill Details (from faculty submission)</div>
              <div style={styles.readOnlyGrid}>
                <RO label="Supply Order No." value={draft.billDetails?.supplyOrderNo} />
                <RO label="Supply Order Date" value={draft.billDetails?.supplyOrderDate} />
                <RO label="Item Details" value={draft.billDetails?.itemDetails} />
                <RO label="Invoice No." value={draft.billDetails?.invoiceNo} />
                <RO label="Invoice Date" value={draft.billDetails?.invoiceDate} />
                <RO label="Name of the Firm" value={draft.billDetails?.firmName} />
                <RO label="Name of the Payee" value={draft.billDetails?.payeeName} />
              </div>

              <div style={styles.sectionTitle}>Office Entry (used to generate the proceedings letter)</div>
              <div style={styles.editGrid}>
                <EF label="M.H. No." value={draft.officeFields?.mhNo} placeholder="e.g. 2-02-13-42"
                  onChange={v => patchOffice({ mhNo: v })} />
                <EF label="Head" value={draft.officeFields?.head} placeholder="e.g. Academic: Maintenance"
                  onChange={v => patchOffice({ head: v })} />
                <EF label="Subhead" value={draft.officeFields?.subhead} placeholder="e.g. 20 - Membership subscription..."
                  onChange={v => patchOffice({ subhead: v })} />
                <EF label="Sanction Register Vide S.No." value={draft.officeFields?.sNo} placeholder="e.g. 03"
                  onChange={v => patchOffice({ sNo: v })} />
                <EF label="Page No." value={draft.officeFields?.pageNo} placeholder="e.g. 61"
                  onChange={v => patchOffice({ pageNo: v })} />
                <EF label="Proceedings No." value={draft.officeFields?.proceedingNo} placeholder="e.g. 2526ET0669/CSRC"
                  onChange={v => patchOffice({ proceedingNo: v })} />
                <EF label="Proceedings Date" value={draft.officeFields?.proceedingDate}
                  onChange={v => patchOffice({ proceedingDate: v })} />
              </div>

              <div style={{ ...styles.readOnlyGrid, marginTop: 14 }}>
                <RO label="Total PDF Sanctioned" value={`₹ ${fmtINR(balanceSummary.totalPDF)}`} />
                <RO label="Committed (Pending + In Process + Completed)" value={`₹ ${fmtINR(balanceSummary.committedAmount)}`} />
                <RO label="Balance After This Claim (auto-fetched)" value={`₹ ${fmtINR(balanceSummary.availableBalance)}`} />
              </div>

              <div style={styles.sectionTitle}>Transfer Tracking</div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
                <TransferTimeline item={draft} />
              </div>

              {editable && (
                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                  <button style={styles.btnView} onClick={() => onSave(draft)}>💾 Save Entry</button>

                  {!isFinalStage && (
                    <button
                      style={{ ...styles.btnApprove, opacity: officeFieldsComplete ? 1 : 0.5 }}
                      disabled={!officeFieldsComplete}
                      title={!officeFieldsComplete ? 'Fill in all office fields before forwarding' : ''}
                      onClick={() => onTransfer(draft, STAFF_BY_ROLE[nextRole])}
                    >
                      ✓ Approve &amp; Forward to {ROLE_LABEL[nextRole]}
                    </button>
                  )}

                  {isFinalStage && (
                    <button
                      style={{ ...styles.btnApprove, opacity: officeFieldsComplete ? 1 : 0.5 }}
                      disabled={!officeFieldsComplete}
                      title={!officeFieldsComplete ? 'Fill in all office fields before final approval' : ''}
                      onClick={() => onApproveComplete(draft)}
                    >
                      ✓ Final Approve &amp; Sign — Send to Bill Processing
                    </button>
                  )}

                  {role !== 'assistant' && (
                    <button style={styles.btnReject} onClick={() => onReject(draft)}>✕ Reject</button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div ref={reportRef}>
              <CSRCPDFSanctionLetter
                request={draft}
                officeFields={draft.officeFields}
                availableBalanceAfter={balanceSummary.availableBalance}
                isCompleted={draft.status === 'completed' || draft.status === 'bill_processing' || draft.status === 'awaiting_signature'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Bill Processing Modal (assistant only)
// Assistant enters the Claim Bill figures, previews it, then
// sends it to the faculty for physical signature.
// ============================================================
function BillProcessingModal({ item, onClose, onSave, onSendToFaculty }) {
  const [tab, setTab] = useState('entry');
  const [bp, setBp] = useState(() => item.billProcessingData || {
    month: '', year: '', contactNo: '', csrcBillNo: '',
    appropriation1: '', appropriation2: '', spent1: '', spent2: '', balance1: '', balance2: '',
  });
  const reportRef = React.useRef(null);

  const patch = (k, v) => setBp(b => ({ ...b, [k]: v }));

  const previewItem = { ...item, billProcessingData: bp };

  const complete = bp.month && bp.csrcBillNo && bp.appropriation1 !== '' && bp.spent1 !== '' && bp.balance1 !== '';

  const downloadDraft = () => {
    if (!reportRef.current) return;
    html2pdf().set({
      margin: 8,
      filename: `${bp.csrcBillNo || item.id}-Claim-Bill-Draft.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(reportRef.current).save();
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitleTag}>BILL PROCESSING — {item.facultyName}</div>
            <div style={styles.modalTitle}>{item.category} · ₹ {fmtINR(item.amount)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tab === 'preview' && <button style={styles.downloadBtn} onClick={downloadDraft}>📄 Download Draft</button>}
            <button style={styles.closeBtn} onClick={onClose}>✕ Close</button>
          </div>
        </div>

        <div style={styles.modalTabBar}>
          <button style={styles.modalTabBtn(tab === 'entry')} onClick={() => setTab('entry')}>📝 Bill Entry</button>
          <button style={styles.modalTabBtn(tab === 'preview')} onClick={() => setTab('preview')}>📄 Claim Bill Preview</button>
        </div>

        <div style={styles.modalBody}>
          {tab === 'entry' ? (
            <>
              <div style={styles.noticeBox('info')}>
                Sanction is complete. Enter the Claim Bill figures below, then send it to the faculty for
                the Director's physical signature.
              </div>

              <div style={styles.sectionTitle}>Bill Identification</div>
              <div style={styles.editGrid}>
                <EF label="Month" value={bp.month} placeholder="e.g. July" onChange={v => patch('month', v)} />
                <EF label="Financial Year (e.g. 26 for 2026-27)" value={bp.year} placeholder="26" onChange={v => patch('year', v)} />
                <EF label="Contact No." value={bp.contactNo} onChange={v => patch('contactNo', v)} />
                <EF label="CSRC Bill No." value={bp.csrcBillNo} onChange={v => patch('csrcBillNo', v)} />
              </div>

              <div style={styles.sectionTitle}>Appropriation (B.E. / R.E.)</div>
              <div style={styles.editGrid}>
                <EF label="Rs. (1)" type="number" value={bp.appropriation1} onChange={v => patch('appropriation1', v)} />
                <EF label="Rs. (2)" type="number" value={bp.appropriation2} onChange={v => patch('appropriation2', v)} />
              </div>

              <div style={styles.sectionTitle}>Amount Spent So Far (Including This Bill)</div>
              <div style={styles.editGrid}>
                <EF label="Rs. (1)" type="number" value={bp.spent1} onChange={v => patch('spent1', v)} />
                <EF label="Rs. (2)" type="number" value={bp.spent2} onChange={v => patch('spent2', v)} />
              </div>

              <div style={styles.sectionTitle}>Balance Amount Available</div>
              <div style={styles.editGrid}>
                <EF label="Rs. (1)" type="number" value={bp.balance1} onChange={v => patch('balance1', v)} />
                <EF label="Rs. (2)" type="number" value={bp.balance2} onChange={v => patch('balance2', v)} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                <button style={styles.btnView} onClick={() => onSave(item, bp)}>💾 Save Draft</button>
                <button
                  style={{ ...styles.btnApprove, opacity: complete ? 1 : 0.5 }}
                  disabled={!complete}
                  title={!complete ? 'Fill in Month, CSRC Bill No., and at least the first Rs. column of each row' : ''}
                  onClick={() => onSendToFaculty(item, bp)}
                >
                  ✓ Send to Faculty
                </button>
              </div>
            </>
          ) : (
            <div ref={reportRef}>
              <CSRCClaimBillForm item={previewItem} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Office-Use Modal (assistant only)
// Registered directly by the assistant once the physically signed
// Claim Bill has returned to CSRC office — no need to go through
// the superintendent -> deputy director -> director chain again.
// ============================================================
function OfficeUseModal({ item, onClose, onRegister }) {
  const [tab, setTab] = useState('entry');
  const [ou, setOu] = useState(() => item.officeUseData || {
    appropriationPageNo: '', vdsFolioNo: '', vdsYear: '', passedForPayRs: '',
    voucherNo: '', cashBookPageNo: '', paidRs: '', chequeNo: '', dated: today(),
  });
  const reportRef = React.useRef(null);

  const patch = (k, v) => setOu(o => ({ ...o, [k]: v }));
  const previewItem = { ...item, officeUseData: ou };
  const complete = ou.vdsFolioNo && ou.voucherNo && ou.paidRs && ou.chequeNo && ou.dated;

  const downloadFinal = () => {
    if (!reportRef.current) return;
    html2pdf().set({
      margin: 8,
      filename: `${item.billProcessingData?.csrcBillNo || item.id}-Claim-Bill-Final.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(reportRef.current).save();
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitleTag}>REGISTER OFFICE USE — {item.facultyName}</div>
            <div style={styles.modalTitle}>{item.category} · ₹ {fmtINR(item.amount)}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tab === 'preview' && <button style={styles.downloadBtn} onClick={downloadFinal}>📄 Download Final</button>}
            <button style={styles.closeBtn} onClick={onClose}>✕ Close</button>
          </div>
        </div>

        <div style={styles.modalTabBar}>
          <button style={styles.modalTabBtn(tab === 'entry')} onClick={() => setTab('entry')}>📝 Office Use Entry</button>
          <button style={styles.modalTabBtn(tab === 'preview')} onClick={() => setTab('preview')}>📄 Final Claim Bill</button>
        </div>

        <div style={styles.modalBody}>
          {tab === 'entry' ? (
            <>
              <div style={styles.noticeBox('warn')}>
                Confirm the physically signed Claim Bill has been received from the faculty before registering
                this section. This directly completes the request — it does not go through the sanction chain again.
              </div>

              <div style={styles.sectionTitle}>For CSRC Office Use Only</div>
              <div style={styles.editGrid}>
                <EF label="Appropriation Page No." value={ou.appropriationPageNo} onChange={v => patch('appropriationPageNo', v)} />
                <EF label="VDS Folio No." value={ou.vdsFolioNo} onChange={v => patch('vdsFolioNo', v)} />
                <EF label="VDS Year (e.g. 26)" value={ou.vdsYear} onChange={v => patch('vdsYear', v)} />
                <EF label="Passed for and Pay (Rs.)" type="number" value={ou.passedForPayRs} onChange={v => patch('passedForPayRs', v)} />
                <EF label="Voucher No." value={ou.voucherNo} onChange={v => patch('voucherNo', v)} />
                <EF label="Cash Book Page No." value={ou.cashBookPageNo} onChange={v => patch('cashBookPageNo', v)} />
                <EF label="Paid (Rs.)" type="number" value={ou.paidRs} onChange={v => patch('paidRs', v)} />
                <EF label="Cheque No." value={ou.chequeNo} onChange={v => patch('chequeNo', v)} />
                <EF label="Dated" type="date" value={ou.dated} onChange={v => patch('dated', v)} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                <button
                  style={{ ...styles.btnApprove, opacity: complete ? 1 : 0.5 }}
                  disabled={!complete}
                  title={!complete ? 'Fill in Folio No., Voucher No., Paid Rs., Cheque No. and Date' : ''}
                  onClick={() => onRegister(item, ou)}
                >
                  ✓ Register &amp; Mark Completed
                </button>
              </div>
            </>
          ) : (
            <div ref={reportRef}>
              <CSRCClaimBillForm item={previewItem} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function PDFOfficeApprovalPage() {
  const navigate = useNavigate();
  const role = userRole();

  const [officeState, setOfficeState] = useState(() => emptyOfficeState());
  const [activeTab, setActiveTab] = useState('active');
  const [manageItem, setManageItem] = useState(null);
  const [billItem, setBillItem] = useState(null);
  const [officeUseItem, setOfficeUseItem] = useState(null);

  // Load + reconcile with faculty-side submissions on mount.
  useEffect(() => {
    const stored = loadJSON(OFFICE_LS_KEY, emptyOfficeState());
    // Backfill in case an older saved state predates these buckets.
    const normalized = { ...emptyOfficeState(), ...stored };
    const fresh = pullNewFacultyRequests(normalized);
    const merged = { ...normalized, active: [...normalized.active, ...fresh] };
    setOfficeState(merged);
    saveJSON(OFFICE_LS_KEY, merged);
  }, []);

  const persist = (next) => { setOfficeState(next); saveJSON(OFFICE_LS_KEY, next); };

  // My queue: items in `transferred` currently held by my role.
  const myQueue = useMemo(
    () => officeState.transferred.filter(i => i.currentHolder?.role === role),
    [officeState.transferred, role]
  );

  const activeSource =
    role === 'assistant'
      ? (
          activeTab === 'active' ? officeState.active
          : activeTab === 'transferred' ? officeState.transferred
          : activeTab === 'billProcessing' ? officeState.billProcessing
          : activeTab === 'awaitingSignature' ? officeState.awaitingSignature
          : activeTab === 'rejected' ? officeState.rejected
          : officeState.completed
        )
      : (
          activeTab === 'active' ? myQueue
          : activeTab === 'transferred' ? officeState.transferred
          : activeTab === 'rejected' ? officeState.rejected
          : officeState.completed
        );

  // ── Sanction-chain actions (unchanged pattern) ───────────
  const handleSaveOfficeEntry = (updated) => {
    const patch = (list) => list.map(i => i.id === updated.id ? updated : i);
    persist({
      ...officeState,
      active: patch(officeState.active),
      transferred: patch(officeState.transferred),
    });
    setManageItem(updated);
  };

  const handleTransfer = (item, staff) => {
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), [role]: userName() },
      currentHolder: staff,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: true },
      ],
    };
    const withoutItem = (list) => list.filter(i => i.id !== item.id);
    const alreadyInTransferred = officeState.transferred.some(i => i.id === item.id);
    persist({
      ...officeState,
      active: withoutItem(officeState.active),
      transferred: alreadyInTransferred
        ? officeState.transferred.map(i => i.id === item.id ? stamped : i)
        : [...officeState.transferred, stamped],
    });
    setManageItem(null);
  };

  // Director's final sanction approval — no longer terminal. The
  // request now moves into Bill Processing for the assistant to
  // prepare the physical Claim Bill.
  const handleApproveComplete = (item) => {
    const stamped = {
      ...item,
      status: 'bill_processing',
      signatures: { ...(item.signatures || {}), director: userName() },
      currentHolder: null,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: { name: 'Bill Processing', role: 'bill_processing' }, date: today(), approved: true },
      ],
    };
    persist({
      ...officeState,
      transferred: officeState.transferred.filter(i => i.id !== item.id),
      billProcessing: [...officeState.billProcessing, stamped],
    });
    syncFacultyStatus(item.sourceRequestId, 'sanctioned', { officeFields: item.officeFields, sanctionedAt: today() });
    setManageItem(null);
  };

  const handleReject = (item) => {
    const stamped = {
      ...item,
      status: 'rejected',
      currentHolder: null,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: { name: 'Rejected', role: 'rejected' }, date: today(), approved: false },
      ],
    };
    persist({
      ...officeState,
      transferred: officeState.transferred.filter(i => i.id !== item.id),
      rejected: [...officeState.rejected, stamped],
    });
    syncFacultyStatus(item.sourceRequestId, 'rejected');
    setOfficeUseItem(null);
    setManageItem(null);
  };

  // ── Bill-processing actions (assistant only) ─────────────
  const handleSaveBillProcessing = (item, billProcessingData) => {
    const patched = { ...item, billProcessingData };
    persist({
      ...officeState,
      billProcessing: officeState.billProcessing.map(i => i.id === item.id ? patched : i),
    });
    setBillItem(patched);
  };

  const handleSendToFaculty = (item, billProcessingData) => {
    const stamped = {
      ...item,
      status: 'awaiting_signature',
      billProcessingData: { ...billProcessingData, sentAt: today() },
    };
    persist({
      ...officeState,
      billProcessing: officeState.billProcessing.filter(i => i.id !== item.id),
      awaitingSignature: [...officeState.awaitingSignature, stamped],
    });
    syncFacultyStatus(item.sourceRequestId, 'awaiting_signature', {
      billProcessingData: stamped.billProcessingData,
      officeFields: item.officeFields,
    });
    setBillItem(null);
  };

  // ── Office-use registration (assistant only, bypasses the chain) ─
  const handleRegisterOfficeUse = (item, officeUseData) => {
    const stamped = {
      ...item,
      status: 'completed',
      officeUseData: { ...officeUseData, registeredAt: today() },
    };
    persist({
      ...officeState,
      awaitingSignature: officeState.awaitingSignature.filter(i => i.id !== item.id),
      completed: [...officeState.completed, stamped],
    });
    syncFacultyStatus(item.sourceRequestId, 'completed', { officeUseData: stamped.officeUseData });
    setOfficeUseItem(null);
  };

  // ── Tabs per role ────────────────────────────────────────
  const tabs = role === 'assistant'
    ? [
        { key: 'active', label: `New Requests (${officeState.active.length})` },
        { key: 'transferred', label: `Transferred (${officeState.transferred.length})` },
        { key: 'billProcessing', label: `Bill Processing (${officeState.billProcessing.length})` },
        { key: 'awaitingSignature', label: `Awaiting Signature (${officeState.awaitingSignature.length})` },
        { key: 'completed', label: `Completed (${officeState.completed.length})` },
        { key: 'rejected', label: `Rejected (${officeState.rejected.length})` },
      ]
    : role === 'director'
    ? [
        { key: 'active', label: `Awaiting Approval (${myQueue.length})` },
        { key: 'completed', label: `Completed (${officeState.completed.length})` },
        { key: 'rejected', label: `Rejected (${officeState.rejected.length})` },
      ]
    : [
        { key: 'active', label: `In My Queue (${myQueue.length})` },
        { key: 'transferred', label: `All Transferred (${officeState.transferred.length})` },
        { key: 'completed', label: `Completed (${officeState.completed.length})` },
        { key: 'rejected', label: `Rejected (${officeState.rejected.length})` },
      ];

  const editable = activeTab === 'active';
  const showStageCol = activeTab === 'transferred' || (role !== 'assistant' && activeTab === 'active' && role !== 'director');
  const showStatusCol = activeTab === 'completed' || activeTab === 'rejected' || activeTab === 'billProcessing' || activeTab === 'awaitingSignature';

  return (
    <div style={styles.page}>
      <div style={styles.topNav}>
        <button style={styles.backBtn} onClick={() => navigate('/revenue')}>← Back to Dashboard</button>
        <span style={styles.roleChip(role)}>
          {role === 'assistant' ? '🟢' : role === 'superintendent' ? '🔵' : role === 'deputy_director' ? '🟠' : '🔴'} {ROLE_LABEL[role]}
        </span>
      </div>

      <div style={styles.header}>
        <h1 style={styles.title}>PDF Sanction &amp; Bill Processing</h1>
        <p style={styles.subtitle}>Review faculty Professional Development Fund claims, issue the CSRC proceedings letter, and process the physical Claim Bill</p>
      </div>

      <div style={styles.tabBar}>
        {tabs.map(t => (
          <button key={t.key} style={styles.tabBtn(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Sl.No</th>
              <th style={styles.th}>Faculty</th>
              <th style={styles.th}>Request Type</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Amount (₹)</th>
              <th style={styles.th}>Submitted</th>
              {showStageCol && <th style={styles.th}>Stage</th>}
              {showStatusCol && <th style={styles.th}>Status</th>}
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeSource.length === 0 && (
              <tr><td colSpan={9} style={styles.emptyState}>No requests to display</td></tr>
            )}
            {activeSource.map((item, idx) => (
              <tr key={item.id}>
                <td style={styles.td}>{idx + 1}</td>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{item.facultyName}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{item.department}</div>
                </td>
                <td style={styles.td}>{item.requestType}</td>
                <td style={styles.td}>{item.category}</td>
                <td style={{ ...styles.td, fontWeight: 700 }}>₹ {fmtINR(item.amount)}</td>
                <td style={styles.td}>{item.submittedAt}</td>
                {showStageCol && (
                  <td style={styles.td}>
                    {item.currentHolder ? (
                      <span style={styles.stageBadge(item.currentHolder.role)}>
                        With {ROLE_LABEL[item.currentHolder.role]}
                      </span>
                    ) : '—'}
                  </td>
                )}
                {showStatusCol && (
                  <td style={styles.td}><span style={styles.statusBadge(item.status)}>{
                    item.status === 'completed' ? '✓ Completed'
                    : item.status === 'rejected' ? '✕ Rejected'
                    : item.status === 'bill_processing' ? '🧾 Bill Processing'
                    : '✍️ Awaiting Signature'
                  }</span></td>
                )}
                <td style={styles.td}>
                  <div style={styles.actionsCell}>
                    {activeTab === 'billProcessing' ? (
                      <button style={styles.btnView} onClick={() => setBillItem(item)}>🧾 Process Bill</button>
                    ) : activeTab === 'awaitingSignature' ? (
                      <>
                        <button style={styles.btnView} onClick={() => setOfficeUseItem(item)}>✍️ Register Office Use</button>
                      </>
                    ) : (
                      <button style={styles.btnView} onClick={() => setManageItem(item)}>👁 View / Manage</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {manageItem && (
        <ManageModal
          item={manageItem}
          role={role}
          editable={editable}
          onClose={() => setManageItem(null)}
          onSave={handleSaveOfficeEntry}
          onTransfer={handleTransfer}
          onApproveComplete={handleApproveComplete}
          onReject={handleReject}
        />
      )}

      {billItem && role === 'assistant' && (
        <BillProcessingModal
          item={billItem}
          onClose={() => setBillItem(null)}
          onSave={handleSaveBillProcessing}
          onSendToFaculty={handleSendToFaculty}
        />
      )}

      {officeUseItem && role === 'assistant' && (
        <OfficeUseModal
          item={officeUseItem}
          onClose={() => setOfficeUseItem(null)}
          onRegister={handleRegisterOfficeUse}
        />
      )}
    </div>
  );
}