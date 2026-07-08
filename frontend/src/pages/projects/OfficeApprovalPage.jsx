import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ProjectStaffPage.css';

// ─────────────────────────────────────────────────────────
//  SAFE PORTAL TARGET — avoids "Target container is not a DOM element"
// ─────────────────────────────────────────────────────────
function usePortalTarget() {
  const [target, setTarget] = useState(null);
  useEffect(() => {
    setTarget(document.body);
  }, []);
  return target;
}

// ─────────────────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 'P1', code: '2433/CSRC-2/2020', name: 'Development of Ti(C,N) based cermets' },
  { id: 'P2', code: '721/CSRC-2/2013',  name: 'Advanced Materials Research' },
  { id: 'P3', code: '1234/CSRC-2/2025', name: 'Smart Manufacturing Project' },
];

// Next-stage staff directory (mock — swap for real staff list when available)
// Next-stage staff directory (mock — swap for real staff list when available)
const STAFF = {
  assistant:      ['Mr. K. Ganesh (Assistant)', 'Ms. R. Meena (Assistant)'],
  superintendent: ['Mr. R. Selvam (Superintendent)', 'Ms. K. Devi (Superintendent)'],
  director:       ['Dr. N. Anantharaman (Director)'],
};

// Document definitions for NEW APPOINTMENTS
const APPT_DOCS = [
  { key: 'advertisement',      label: 'Advertisement',        required: true },
  { key: 'minutes',            label: 'Minutes of Meeting',   required: true },
  { key: 'appointmentLetter',  label: 'Appointment Letter',   required: true },
  { key: 'joiningLetter',      label: 'Joining Letter',       required: true },
  { key: 'passbook',           label: 'Passbook / Bank Proof',required: true },
];

// Document definitions for EXTENSIONS
const EXTN_DOCS = [
  { key: 'appraisal',          label: 'Performance Appraisal', required: true },
  { key: 'extensionLetter',    label: 'Extension Letter',       required: true },
  { key: 'rejoiningLetter',    label: 'Rejoining Letter',       required: true },
];

const INIT_APPOINTMENTS = [
  {
    id: 201, projectId: 'P1', facultyName: 'Dr. S.Balasivanandha Prabu',
    staffName: 'Mr VENKADANATHAN J', designation: 'Junior Research Fellow',
    appointmentOrderNo: 'CEG/MECH/JRF/03', appointmentOrderDate: '2024-01-10',
    contractFrom: '2024-01-21', contractTo: '2024-07-20',
    joinDueDate: '2024-01-21', fixedSalary: 31000, hra: 7440,
    submittedDate: '2024-01-10',
    docs: {
      advertisement:     { uploaded: false, fileName: '', date: '' },
      minutes:           { uploaded: false, fileName: '', date: '' },
      appointmentLetter: { uploaded: false, fileName: '', date: '' },
      joiningLetter:     { uploaded: false, fileName: '', date: '' },
      passbook:          { uploaded: false, fileName: '', date: '' },
    },
  },
  {
    id: 202, projectId: 'P1', facultyName: 'Dr. S.Balasivanandha Prabu',
    staffName: 'Mr VETRI VEL V', designation: 'Junior Research Fellow',
    appointmentOrderNo: 'CEG/MECH/JRF/04', appointmentOrderDate: '2024-02-05',
    contractFrom: '2024-02-10', contractTo: '2024-08-09',
    joinDueDate: '2024-02-10', fixedSalary: 31000, hra: 7440,
    submittedDate: '2024-02-05',
    docs: {
      advertisement:     { uploaded: true, fileName: 'advt_vetri.pdf',    date: '2024-02-06' },
      minutes:           { uploaded: true, fileName: 'minutes_vetri.pdf', date: '2024-02-06' },
      appointmentLetter: { uploaded: true, fileName: 'appt_vetri.pdf',    date: '2024-02-07' },
      joiningLetter:     { uploaded: true, fileName: 'joining_vetri.pdf',date: '2024-02-08' },
      passbook:          { uploaded: false, fileName: '', date: '' },
    },
  },
  {
    id: 203, projectId: 'P2', facultyName: 'Dr. P.T.V.Bhuvaneswari',
    staffName: 'Ms PRIYA A', designation: 'Project Assistant',
    appointmentOrderNo: 'MIT/ELEC/PA/02', appointmentOrderDate: '2024-03-01',
    contractFrom: '2024-03-01', contractTo: '2025-02-28',
    joinDueDate: '2024-03-01', fixedSalary: 25000, hra: 0,
    submittedDate: '2024-03-01',
    docs: {
      advertisement:     { uploaded: true, fileName: 'advt_priya.pdf',    date: '2024-03-02' },
      minutes:           { uploaded: true, fileName: 'minutes_priya.pdf', date: '2024-03-02' },
      appointmentLetter: { uploaded: true, fileName: 'appt_priya.pdf',    date: '2024-03-03' },
      joiningLetter:     { uploaded: true, fileName: 'joining_priya.pdf',date: '2024-03-04' },
      passbook:          { uploaded: true, fileName: 'passbook_priya.pdf', date: '2024-03-04' },
    },
  },
  {
    id: 204, projectId: 'P3', facultyName: 'Dr. R. Karthikeyan',
    staffName: 'Mr ARUN KUMAR S', designation: 'Project Associate - I',
    appointmentOrderNo: 'SMP/PA1/2025/01', appointmentOrderDate: '2025-04-10',
    contractFrom: '2025-04-15', contractTo: '2026-04-14',
    joinDueDate: '2025-04-15', fixedSalary: 42000, hra: 10080,
    submittedDate: '2025-04-11',
    docs: {
      advertisement:     { uploaded: true, fileName: 'advertisement_arun.pdf', date: '2025-04-11' },
      minutes:           { uploaded: true, fileName: 'selection_minutes_arun.pdf', date: '2025-04-11' },
      appointmentLetter: { uploaded: true, fileName: 'appointment_arun.pdf', date: '2025-04-12' },
      joiningLetter:     { uploaded: true, fileName: 'joining_arun.pdf', date: '2025-04-15' },
      passbook:          { uploaded: true, fileName: 'passbook_arun.pdf', date: '2025-04-15' },
    },
  },
];

const INIT_EXTENSIONS = [
  {
    id: 301, projectId: 'P1', facultyName: 'Dr. S.Balasivanandha Prabu',
    staffName: 'Mr VENKADANATHAN J', designation: 'Junior Research Fellow',
    extnOrderNo: 'CEG/MECH/JRF/EXT/01', extnOrderDate: '2024-07-01',
    extnFrom: '2024-07-21', extnTo: '2025-01-20',
    rejoinDueDate: '2024-07-21', fixedSalary: 35000, hra: 8400,
    submittedDate: '2024-07-01',
    docs: {
      appraisal:       { uploaded: false, fileName: '', date: '' },
      extensionLetter: { uploaded: false, fileName: '', date: '' },
      rejoiningLetter: { uploaded: false, fileName: '', date: '' },
    },
  },
  {
    id: 302, projectId: 'P2', facultyName: 'Dr. P.T.V.Bhuvaneswari',
    staffName: 'Ms PRIYA A', designation: 'Project Assistant',
    extnOrderNo: 'MIT/ELEC/PA/EXT/01', extnOrderDate: '2025-02-15',
    extnFrom: '2025-03-01', extnTo: '2025-08-31',
    rejoinDueDate: '2025-03-01', fixedSalary: 27000, hra: 0,
    submittedDate: '2025-02-15',
    docs: {
      appraisal:       { uploaded: true, fileName: 'appraisal_priya.pdf',  date: '2025-02-16' },
      extensionLetter: { uploaded: true, fileName: 'ext_letter_priya.pdf', date: '2025-02-17' },
      rejoiningLetter: { uploaded: false, fileName: '', date: '' },
    },
  },
  {
    id: 303, projectId: 'P3', facultyName: 'Dr. R. Karthikeyan',
    staffName: 'Mr ARUN KUMAR S', designation: 'Project Associate - I',
    extnOrderNo: 'SMP/EXT/2026/01', extnOrderDate: '2026-03-20',
    extnFrom: '2026-04-15', extnTo: '2027-04-14',
    rejoinDueDate: '2026-04-15', fixedSalary: 45000, hra: 10800,
    submittedDate: '2026-03-21',
    docs: {
      appraisal:       { uploaded: true, fileName: 'appraisal_arun.pdf', date: '2026-03-21' },
      extensionLetter: { uploaded: true, fileName: 'extension_letter_arun.pdf', date: '2026-03-21' },
      rejoiningLetter: { uploaded: true, fileName: 'rejoining_arun.pdf', date: '2026-03-22' },
    },
  },
];

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '—';
  if (d.includes('-') && d.length === 10 && d[4] === '-') {
    const [y, m, day] = d.split('-');
    return `${parseInt(day)}-${parseInt(m)}-${y}`;
  }
  return d;
};

const projectLabel = (id) => {
  const p = PROJECTS.find(p => p.id === id);
  return p ? p.code : id;
};

const uploadsComplete = (docs) => Object.values(docs).every(d => d.uploaded);
const uploadedCount   = (docs) => Object.values(docs).filter(d => d.uploaded).length;

const userRole = () => localStorage.getItem('userRole') || 'assistant';
const userName = () => localStorage.getItem('userName') || 'Office';
const today    = () => new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

const nextRoleFor = (role) => (role === 'assistant' ? 'superintendent' : 'director');

// ─────────────────────────────────────────────────────────
//  SHARED ACTION-BUTTON STYLES (labeled pill buttons)
// ─────────────────────────────────────────────────────────
const baseActionBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  width: '100%', padding: '8px 14px', borderRadius: 999, border: 'none',
  fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, fontWeight: 700,
  cursor: 'pointer', whiteSpace: 'nowrap',
};

const ActionBtnStyles = {
  view: {
    ...baseActionBtn,
    background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
  },
  viewDocs: {
    ...baseActionBtn,
    background: '#eef2ff',
    color: '#4338ca',
    border: '1.5px solid rgba(67,56,202,0.18)',
  },
  approve: {
    ...baseActionBtn,
    background: '#dcfce7',
    color: '#15803d',
    border: '1.5px solid rgba(21,128,61,0.22)',
  },
  transferNoApproval: {
    ...baseActionBtn,
    background: '#eef1f6',
    color: '#334155',
    border: '1.5px solid #dfe3ea',
  },
};

// Seed the extra tracking fields on every mock item (once, at module load)
const seedTracking = (arr) => arr.map(it => ({
  ...it,
  currentHolder: null,      // null = still with the assistant
  transferHistory: [],
  completed: false,
}));

const DirectorApproveButton = ({ item, onComplete }) => {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        style={ActionBtnStyles.approve}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12"/></svg>
        Approve
      </button>
      {confirming && (
        <ConfirmDialog
          title="Final Approval"
          message="This is the final approval step. The request will move to Completed for all roles. Continue?"
          confirmLabel="✓ Confirm Approval"
          confirmColor="#059669"
          onConfirm={() => { onComplete(item); setConfirming(false); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
//  STAGE BADGE  (replaces the old PENDING/APPROVED badge)
// ─────────────────────────────────────────────────────────
const StageBadge = ({ item }) => {
  let label, cls;
  if (item.completed) {
    label = 'Completed'; cls = 'verified';
  } else if (item.currentHolder) {
    label = `With ${item.currentHolder.role[0].toUpperCase()}${item.currentHolder.role.slice(1)}`;
    cls = item.currentHolder.role === 'director' ? 'danger-badge' : 'new';
  } else {
    label = 'With Assistant'; cls = 'pending';
  }
  return (
    <span className={`ps-badge ${cls}`}>
      <span className="ps-badge-dot" />
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────
//  DOCUMENT VIEWER MODAL  (unchanged — individual file viewer)
// ─────────────────────────────────────────────────────────
const DocViewerModal = ({ item, docDefs, onClose }) => {
  const docs = item.docs;
  const total = docDefs.length;
  const done  = docDefs.filter(d => docs[d.key]?.uploaded).length;
  const allDone = done === total;

  const portalTarget = usePortalTarget();
  if (!portalTarget) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,15,40,0.5)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px', paddingTop: '60px', overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680,
          boxShadow: '0 24px 64px rgba(15,15,40,0.22)',
          maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1.5px solid #f0f1f6',
          position: 'sticky', top: 0, background: '#fff', zIndex: 10,
          borderRadius: '20px 20px 0 0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#111827' }}>
                Document Status
              </div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: '#6b7280', marginTop: 4 }}>
                {item.staffName} · {projectLabel(item.projectId)}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{
            marginTop: 14, padding: '10px 16px', borderRadius: 10,
            background: allDone ? '#ecfdf5' : '#fffbeb',
            border: `1.5px solid ${allDone ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)'}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {allDone
              ? <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, fontWeight: 600, color: allDone ? '#065f46' : '#92400e' }}>
              {done} of {total} documents uploaded
              {allDone ? ' — All complete.' : ' — Request will only appear once all documents are uploaded.'}
            </span>
          </div>
        </div>

        <div style={{ padding: '20px 28px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {docDefs.map((def, idx) => {
              const doc = docs[def.key] || { uploaded: false, fileName: '', date: '' };
              return (
                <div
                  key={def.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 18px', borderRadius: 12,
                    background: doc.uploaded ? '#f0fdf4' : '#fafafa',
                    border: `1.5px solid ${doc.uploaded ? 'rgba(5,150,105,0.18)' : '#e5e7eb'}`,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: doc.uploaded ? 'rgba(5,150,105,0.12)' : '#f0f0f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700,
                    color: doc.uploaded ? '#059669' : '#9ca3af',
                  }}>
                    {idx + 1}
                  </div>

                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: doc.uploaded ? 'rgba(5,150,105,0.10)' : 'rgba(156,163,175,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={doc.uploaded ? '#059669' : '#9ca3af'} strokeWidth="2" style={{ width: 16, height: 16 }}>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, fontWeight: 600, color: '#111827' }}>
                      {def.label}
                      {def.required && <span style={{ color: '#dc2626', marginLeft: 3, fontSize: 11 }}>*</span>}
                    </div>
                    {doc.uploaded
                      ? <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11.5, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.fileName} · Uploaded {fmtDate(doc.date)}
                        </div>
                      : <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11.5, color: '#d97706', marginTop: 2 }}>
                          Not yet uploaded by faculty
                        </div>
                    }
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {doc.uploaded ? (
                      <>
                        <span style={{
                          background: '#ecfdf5', color: '#059669',
                          border: '1.5px solid rgba(5,150,105,0.22)',
                          fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700,
                          padding: '3px 10px', borderRadius: 20,
                        }}>✓ Uploaded</span>
                        <button
                          title="View file"
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: '1.5px solid rgba(2,132,199,0.2)',
                            background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0,
                          }}
                          onClick={() => alert(`Opening: ${doc.fileName}\n(In production this would open/download the file)`)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" style={{ width: 13, height: 13 }}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <span style={{
                        background: '#fffbeb', color: '#d97706',
                        border: '1.5px solid rgba(217,119,6,0.22)',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700,
                        padding: '3px 10px', borderRadius: 20,
                      }}>⏳ Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    portalTarget
  );
};

// ─────────────────────────────────────────────────────────
//  TRANSFER TIMELINE (Track tab)
// ─────────────────────────────────────────────────────────
const TransferTimeline = ({ item }) => {
  const history = item.transferHistory || [];

  const S = {
    wrap: { padding: '8px 0' },
    entry: { display: 'flex', gap: 12, marginBottom: 14 },
    dotWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 28 },
    dot: (approved) => ({
      width: 24, height: 24, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 'bold', flexShrink: 0,
      background: approved ? '#dcfce7' : '#dbeafe',
      color: approved ? '#16a34a' : '#2563eb',
      border: `2px solid ${approved ? '#16a34a' : '#2563eb'}`,
    }),
    line: { width: 2, flex: 1, background: '#e2e8f0', marginTop: 4, minHeight: 14 },
    content: { flex: 1, paddingBottom: 4 },
    date: { fontSize: 11, color: '#888', marginBottom: 2 },
    transfer: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    from: { fontSize: 12, color: '#555' },
    arrow: { fontSize: 13, color: '#999' },
    to: { fontSize: 12, fontWeight: 600, color: '#1e293b' },
    roleBadge: (role) => ({
      fontSize: 10, padding: '1px 6px', borderRadius: 999, fontWeight: 600,
      background: role === 'superintendent' ? '#dbeafe' : role === 'director' ? '#fce7f3' : '#dcfce7',
      color: role === 'superintendent' ? '#1d4ed8' : role === 'director' ? '#be185d' : '#15803d',
    }),
    statusBadge: (approved) => ({
      marginTop: 4, fontSize: 10, padding: '1px 8px', borderRadius: 999,
      background: approved ? '#f0fdf4' : '#eff6ff',
      color: approved ? '#16a34a' : '#2563eb',
      border: `1px solid ${approved ? '#bbf7d0' : '#bfdbfe'}`,
      display: 'inline-block',
    }),
    pendingEntry: { display: 'flex', gap: 12 },
    pendingDot: {
      width: 24, height: 24, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, background: '#fef9c3', color: '#ca8a04',
      border: '2px solid #ca8a04', flexShrink: 0,
    },
    pendingLabel: { fontSize: 12, color: '#92400e', fontWeight: 500, paddingTop: 4 },
  };

  if (history.length === 0) {
    return (
      <div style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
        No transfer history yet. This request is still with the assistant.
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      {history.map((entry, i) => {
        const toName   = typeof entry.to === 'object' ? entry.to?.name : entry.to;
        const toRole   = typeof entry.to === 'object' ? entry.to?.role : null;
        const fromName = entry.from;
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
      {item.completed ? (
        <div style={S.pendingEntry}>
          <div style={{ ...S.pendingDot, background: '#dcfce7', color: '#16a34a', border: '2px solid #16a34a' }}>✔</div>
          <div style={{ ...S.pendingLabel, color: '#15803d' }}>Process Completed — Fully Approved</div>
        </div>
      ) : (
        <div style={S.pendingEntry}>
          <div style={S.pendingDot}>⏳</div>
          <div style={S.pendingLabel}>
            Waiting for action from <strong>{item.currentHolder?.name || 'Next Approver'}</strong>
            {item.currentHolder?.role && ` (${item.currentHolder.role})`}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  CONFIRM DIALOG
// ─────────────────────────────────────────────────────────
const ConfirmDialog = ({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }) => {
  const portalTarget = usePortalTarget();
  if (!portalTarget) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(15,15,40,0.55)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380,
        padding: '24px 26px', boxShadow: '0 24px 64px rgba(15,15,40,0.28)',
      }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6b7280', marginBottom: 22, lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', color: '#6b7280', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: confirmColor, color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    portalTarget
  );
};

// ─────────────────────────────────────────────────────────
//  TRANSFER CONTROL — 2 pill buttons; dropdown appears on demand
//  · Approve & Transfer      → next level up   (assistant → superintendent → director)
//  · Transfer (No Approval)  → same level       (assistant ↔ assistant, superintendent ↔ superintendent)
// ─────────────────────────────────────────────────────────
const TransferControl = ({ item, role, onApproveTransfer, onPlainTransfer }) => {
  const nextRole = nextRoleFor(role);
  const approveOptions = STAFF[nextRole] || [];
  const lateralOptions = (STAFF[role] || []).filter(s => s !== userName());

  const [mode, setMode] = useState(null);            // null | 'approve' | 'plain'
  const [selected, setSelected] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { mode, staff } | null

  const openPicker = (m) => { setMode(m); setSelected(''); };
  const closePicker = () => { setMode(null); setSelected(''); };

  const handleSelect = (e) => {
    const staff = e.target.value;
    setSelected(staff);
    if (staff) setConfirmAction({ mode, staff });
  };

  const runConfirmed = () => {
    if (!confirmAction) return;
    if (confirmAction.mode === 'approve') {
      onApproveTransfer(item, { name: confirmAction.staff, role: nextRole });
    } else {
      onPlainTransfer(item, { name: confirmAction.staff, role });
    }
    setConfirmAction(null);
    closePicker();
  };

  // ── Picker view (shown after a button is clicked) ──
  if (mode) {
    const options    = mode === 'approve' ? approveOptions : lateralOptions;
    const pickerRole = mode === 'approve' ? nextRole : role;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          fontFamily: 'DM Sans, sans-serif', fontSize: 10.5, fontWeight: 700,
          color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px',
        }}>
          Select {pickerRole}
        </div>
        <select
          value={selected}
          onChange={handleSelect}
          autoFocus
          style={{
            width: '100%', padding: '7px 10px', borderRadius: 8,
            border: '1.5px solid #e5e7eb', background: '#fff',
            fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#374151',
            cursor: 'pointer',
          }}
        >
          <option value="" disabled>Choose staff…</option>
          {options.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={closePicker}
          style={{ ...baseActionBtn, background: '#fff', color: '#6b7280', border: '1.5px solid #e5e7eb' }}
        >
          Cancel
        </button>

        {confirmAction && (
          <ConfirmDialog
            title={confirmAction.mode === 'approve' ? 'Approve & Transfer' : 'Transfer (No Approval)'}
            message={
              confirmAction.mode === 'approve'
                ? `This will mark your approval and send this request to ${confirmAction.staff} (${nextRole}). Continue?`
                : `This will forward this request to ${confirmAction.staff} (${role}) without recording your approval. Continue?`
            }
            confirmLabel={confirmAction.mode === 'approve' ? '✓ Confirm Approval' : '↪ Confirm Transfer'}
            confirmColor={confirmAction.mode === 'approve' ? '#059669' : '#475569'}
            onConfirm={runConfirmed}
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </div>
    );
  }

  // ── Default view: just the two pill buttons ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        style={ActionBtnStyles.approve}
        title={`Approve & transfer to ${nextRole}`}
        onClick={() => openPicker('approve')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Approve &amp; Transfer
      </button>

      <button
        style={ActionBtnStyles.transferNoApproval}
        title={`Transfer to another ${role} (no approval)`}
        onClick={() => openPicker('plain')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
          <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
        </svg>
        Transfer (No Approval)
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  MANAGE MODAL — Details (view/edit) + Track, per role
// ─────────────────────────────────────────────────────────
const FIELD_DEFS = {
  appointment: [
    ['staffName',           'Staff Name',        'text'],
    ['designation',         'Designation',       'text'],
    ['appointmentOrderNo',  'Order No',          'text'],
    ['appointmentOrderDate','Order Date',        'date'],
    ['contractFrom',        'Contract From',     'date'],
    ['contractTo',          'Contract To',       'date'],
    ['joinDueDate',         'Joining Due',       'date'],
    ['fixedSalary',         'Fixed Salary (₹)',  'number'],
    ['hra',                 'HRA (₹)',           'number'],
  ],
  extension: [
    ['staffName',      'Staff Name',       'text'],
    ['designation',    'Designation',      'text'],
    ['extnOrderNo',    'Extn Order No',    'text'],
    ['extnOrderDate',  'Order Date',       'date'],
    ['extnFrom',       'Extension From',   'date'],
    ['extnTo',         'Extension To',     'date'],
    ['rejoinDueDate',  'Rejoining Due',    'date'],
    ['fixedSalary',    'Fixed Salary (₹)', 'number'],
    ['hra',            'HRA (₹)',          'number'],
  ],
};

const ManageModal = ({ item, type, editable, docDefs, onSave, onClose }) => {
  const [tab, setTab] = useState('details');
  const [draft, setDraft] = useState(item);
  const [isEditing, setIsEditing] = useState(false);
  const fieldsEditable = editable && isEditing;
  const fields = FIELD_DEFS[type];

  const portalTarget = usePortalTarget();

  // ManageModal — overlay wrapper
  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(15,15,40,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '20px', paddingTop: '60px', overflowY: 'auto',
  };
  const modalStyle = {
    background: '#f8fafc', borderRadius: 20, width: 'min(720px, 96vw)',
    maxHeight: 'calc(100vh - 40px)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 30px 80px rgba(15,15,40,0.28)',
  };
  const headerStyle = {
    padding: '20px 26px 16px', background: '#1e293b',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  };
  const tabBarStyle = { display: 'flex', gap: 4, padding: '0 20px', background: '#fff', borderBottom: '1px solid #e2e8f0' };
  const tabBtnStyle = (active) => ({
    padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, color: active ? '#4f46e5' : '#64748b',
    borderBottom: active ? '3px solid #4f46e5' : '3px solid transparent',
    fontFamily: 'DM Sans, sans-serif',
  });
  const bodyStyle = { flex: 1, overflowY: 'auto', padding: '22px 26px' };

  const handleSaveClick = () => { onSave(draft); setIsEditing(false); };

  if (!portalTarget) return null;

  return createPortal(
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              {type === 'appointment' ? 'NEW APPOINTMENT' : 'EXTENSION'} · #{item.id}
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>
              {item.staffName}
            </div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
              {projectLabel(item.projectId)} · Submitted {fmtDate(item.submittedDate)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editable && tab === 'details' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{ background: '#2563eb', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 13px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
              >
                ✏️ Edit
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 13px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div style={tabBarStyle}>
          <button style={tabBtnStyle(tab === 'details')} onClick={() => setTab('details')}>📋 Details</button>
          <button style={tabBtnStyle(tab === 'track')} onClick={() => setTab('track')}>🔄 Track</button>
        </div>

        <div style={bodyStyle}>
          {tab === 'details' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Faculty / PI</div>
                  <div className="ps-input" style={{ background: '#f1f2f6' }}>{item.facultyName}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Project</div>
                  <div className="ps-input" style={{ background: '#f1f2f6' }}>{projectLabel(item.projectId)}</div>
                </div>
                {fields.map(([key, label, kind]) => (
                  <div key={key}>
                    <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#9ca3af', display: 'block', marginBottom: 4 }}>
                      {label}
                    </label>
                    <input
                      className="ps-input"
                      type={kind === 'number' ? 'number' : kind === 'date' ? 'date' : 'text'}
                      disabled={!fieldsEditable}
                      value={draft[key] ?? ''}
                      onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              {editable && isEditing && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="ps-btn-primary" onClick={handleSaveClick}>💾 Save Changes</button>
                  <button
                    className="ps-back-btn"
                    onClick={() => { setDraft(item); setIsEditing(false); }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <TransferTimeline item={item} />
          )}
        </div>
      </div>
    </div>,
    portalTarget
  );
};

// ─────────────────────────────────────────────────────────
//  TAB BAR
// ─────────────────────────────────────────────────────────
const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
    {tabs.map(t => {
      const isActive = active === t.key;
      return (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: isActive ? 700 : 500,
            border: `1.5px solid ${isActive ? t.color + '55' : '#e5e7eb'}`,
            background: isActive ? t.color + '14' : '#fff',
            color: isActive ? t.color : '#6b7280',
            transition: 'all 0.18s',
            boxShadow: isActive ? `0 2px 8px ${t.color}22` : 'none',
          }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: isActive ? t.color : '#e5e7eb',
            color: isActive ? '#fff' : '#9ca3af',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, flexShrink: 0, transition: 'all 0.18s',
          }}>
            {t.count}
          </span>
          {t.label}
        </button>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────
//  REQUEST TABLE
// ─────────────────────────────────────────────────────────
const RequestTable = ({ rows, type, role, tab, onViewDocs, onManage, onApproveTransfer, onPlainTransfer, onComplete }) => {
  const isNew = type === 'appointment';
  const isActionableTab = tab === 'new'; // "New Requests" / "In My Queue" / "Awaiting Approval"

  if (rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '52px 20px', color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
        No records in this category.
      </div>
    );
  }

  return (
    <div className="ps-table-wrap">
      <table className="ps-table" style={{ minWidth: 900 }}>
        <thead>
          <tr>
            <th className="ps-sl-num">Sl.</th>
            <th>Staff Name</th>
            <th>Designation</th>
            <th>Project</th>
            <th>{isNew ? 'Contract From' : 'Extn From'}</th>
            <th>{isNew ? 'Contract To'   : 'Extn To'  }</th>
            <th>Salary</th>
            <th>Stage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td className="ps-sl-num">{i + 1}</td>
              <td className="ps-name-cell">{r.staffName}</td>
              <td style={{ fontSize: 12.5 }}>{r.designation}</td>
              <td style={{ fontSize: 12, color: '#6b7280' }}>{projectLabel(r.projectId)}</td>
              <td style={{ fontVariantNumeric: 'tabular-nums', color: '#4b5563', fontSize: 12.5 }}>
                {fmtDate(isNew ? r.contractFrom : r.extnFrom)}
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums', color: '#4b5563', fontSize: 12.5 }}>
                {fmtDate(isNew ? r.contractTo : r.extnTo)}
              </td>
              <td style={{ color: '#374151', fontSize: 13 }}>
                ₹{parseInt(r.fixedSalary || 0).toLocaleString('en-IN')}
              </td>
              <td><StageBadge item={r} /></td>
              <td>
                <div className="ps-action-group" style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 190 }}>
                  <button style={ActionBtnStyles.viewDocs} title="View Documents" onClick={() => onViewDocs(r)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    View Documents
                  </button>

                  <button style={ActionBtnStyles.view} title="View / Edit / Track" onClick={() => onManage(r)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View
                  </button>

                  {isActionableTab && role !== 'director' && (
                    <TransferControl
                      item={r}
                      role={role}
                      onApproveTransfer={onApproveTransfer}
                      onPlainTransfer={onPlainTransfer}
                    />
                  )}

                  {isActionableTab && role === 'director' && (
                    <DirectorApproveButton item={r} onComplete={onComplete} />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  SHARED PANEL LOGIC — used by both Appointments & Extensions
// ─────────────────────────────────────────────────────────
function useRequestPanel(initData) {
  const role = userRole();
  const [items, setItems] = useState(() => seedTracking(initData));
  const [tab, setTab] = useState('new');
  const [manageItem, setManageItem] = useState(null);
  const [docItem, setDocItem] = useState(null);

  // ── Buckets, filtered per role ──────────────────────────────────────────
  const newRequests = useMemo(() => {
    if (role === 'assistant') {
      return items.filter(i => !i.completed && !i.currentHolder && i.transferHistory.length === 0 && uploadsComplete(i.docs));
    }
    return items.filter(i => !i.completed && i.currentHolder?.role === role);
  }, [items, role]);

  const transferred = useMemo(
    () => items.filter(i => !i.completed && i.transferHistory.length > 0),
    [items]
  );

  const completed = useMemo(() => items.filter(i => i.completed), [items]);

  const rows = tab === 'new' ? newRequests : tab === 'transferred' ? transferred : completed;

  // ── Tab config per role ─────────────────────────────────────────────────
  const tabs = role === 'assistant'
    ? [
        { key: 'new',         label: 'New Requests', count: newRequests.length, color: '#4f46e5' },
        { key: 'transferred', label: 'Transferred',  count: transferred.length, color: '#a78bfa' },
        { key: 'completed',   label: 'Completed',    count: completed.length,   color: '#059669' },
      ]
    : role === 'superintendent'
    ? [
        { key: 'new',         label: 'In My Queue',    count: newRequests.length, color: '#4f46e5' },
        { key: 'transferred', label: 'All Transferred',count: transferred.length, color: '#a78bfa' },
        { key: 'completed',   label: 'Completed',      count: completed.length,   color: '#059669' },
      ]
    : [
        { key: 'new',       label: 'Awaiting Approval', count: newRequests.length, color: '#dc2626' },
        { key: 'completed', label: 'Completed',         count: completed.length,   color: '#059669' },
      ];

  // ── Transfer / approval handlers ────────────────────────────────────────
  const stampTransfer = (item, target, approved) => ({
    ...item,
    currentHolder: target,
    transferHistory: [
      ...item.transferHistory,
      { from: userName(), fromRole: role, to: target, date: today(), approved },
    ],
  });

  const handleApproveTransfer = (item, target) => {
    setItems(prev => prev.map(i => i.id === item.id ? stampTransfer(i, target, true) : i));
  };

  const handlePlainTransfer = (item, target) => {
    setItems(prev => prev.map(i => i.id === item.id ? stampTransfer(i, target, false) : i));
  };

  const handleComplete = (item) => {
    setItems(prev => prev.map(i => i.id === item.id ? {
      ...i,
      currentHolder: null,
      completed: true,
      transferHistory: [
        ...i.transferHistory,
        { from: userName(), fromRole: 'director', to: 'Completed', date: today(), approved: true },
      ],
    } : i));
  };

  const handleSave = (updated) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    setManageItem(null);
  };

  return {
    role, tab, setTab, tabs, rows,
    manageItem, setManageItem, docItem, setDocItem,
    handleApproveTransfer, handlePlainTransfer, handleComplete, handleSave,
  };
}

// ─────────────────────────────────────────────────────────
//  APPOINTMENTS PANEL
// ─────────────────────────────────────────────────────────
const AppointmentsPanel = () => {
  const p = useRequestPanel(INIT_APPOINTMENTS);

  return (
    <>
      <TabBar tabs={p.tabs} active={p.tab} onChange={p.setTab} />
      <div className="ps-table-card">
        <RequestTable
          rows={p.rows}
          type="appointment"
          role={p.role}
          tab={p.tab}
          onViewDocs={p.setDocItem}
          onManage={p.setManageItem}
          onApproveTransfer={p.handleApproveTransfer}
          onPlainTransfer={p.handlePlainTransfer}
          onComplete={p.handleComplete}
        />
      </div>

      {p.manageItem && (
        <ManageModal
          item={p.manageItem}
          type="appointment"
          docDefs={APPT_DOCS}
          editable={p.tab === 'new'}
          onSave={p.handleSave}
          onClose={() => p.setManageItem(null)}
        />
      )}
      {p.docItem && (
        <DocViewerModal item={p.docItem} docDefs={APPT_DOCS} onClose={() => p.setDocItem(null)} />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
//  EXTENSIONS PANEL
// ─────────────────────────────────────────────────────────
const ExtensionsPanel = () => {
  const p = useRequestPanel(INIT_EXTENSIONS);

  return (
    <>
      <TabBar tabs={p.tabs} active={p.tab} onChange={p.setTab} />
      <div className="ps-table-card">
        <RequestTable
          rows={p.rows}
          type="extension"
          role={p.role}
          tab={p.tab}
          onViewDocs={p.setDocItem}
          onManage={p.setManageItem}
          onApproveTransfer={p.handleApproveTransfer}
          onPlainTransfer={p.handlePlainTransfer}
          onComplete={p.handleComplete}
        />
      </div>

      {p.manageItem && (
        <ManageModal
          item={p.manageItem}
          type="extension"
          docDefs={EXTN_DOCS}
          editable={p.tab === 'new'}
          onSave={p.handleSave}
          onClose={() => p.setManageItem(null)}
        />
      )}
      {p.docItem && (
        <DocViewerModal item={p.docItem} docDefs={EXTN_DOCS} onClose={() => p.setDocItem(null)} />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
//  ENTRY CARDS
// ─────────────────────────────────────────────────────────
const OfficeEntryCards = ({ onNew, onExtension }) => (
  <>
    <div className="ps-inner-header">
      <div className="ps-inner-title-wrap">
        <div className="ps-inner-title">Appointment Approvals</div>
        <div className="ps-inner-sub">Office verification and approval of faculty-submitted requests</div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, maxWidth: 700 }}>
      <div className="ps-sub-card" style={{ '--sc': '#4f46e5', '--sg': 'rgba(79,70,229,0.15)' }} onClick={onNew}>
        <div className="ps-card-top">
          <div className="ps-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M9 13h6M9 17h4"/>
            </svg>
          </div>
          <div className="ps-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </div>
        <div className="ps-card-body">
          <div className="ps-card-title">New Appointment Approvals</div>
          <div className="ps-card-desc">Review and approve new staff appointment orders submitted by faculty.</div>
        </div>
        <div className="ps-card-glow-bar" />
      </div>

      <div className="ps-sub-card" style={{ '--sc': '#a78bfa', '--sg': 'rgba(167,139,250,0.15)' }} onClick={onExtension}>
        <div className="ps-card-top">
          <div className="ps-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="13 17 18 12 13 7"/>
              <polyline points="6 17 11 12 6 7"/>
            </svg>
          </div>
          <div className="ps-card-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </div>
        <div className="ps-card-body">
          <div className="ps-card-title">Extension Approvals</div>
          <div className="ps-card-desc">Review and approve staff appointment extensions submitted by faculty.</div>
        </div>
        <div className="ps-card-glow-bar" />
      </div>
    </div>
  </>
);

// ─────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────
const OfficeApprovalsPage = ({ onBack, onNavigate, defaultView }) => {
  const [view, setView] = useState(defaultView || 'entry');

  return (
    <div className="ps-inner">
      <div style={{ marginBottom: 20 }}>
        <button
          className="ps-back-btn"
          onClick={() => { if (view !== 'entry') setView('entry'); else onBack && onBack(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          {view === 'entry' ? 'Projects' : 'Approval Home'}
        </button>
      </div>

      {view === 'entry' && (
        <OfficeEntryCards
          onNew={() => setView('appointments')}
          onExtension={() => setView('extensions')}
        />
      )}

      {view === 'appointments' && (
        <>
          <div className="ps-inner-header">
            <div className="ps-inner-title-wrap">
              <div className="ps-inner-title">New Appointment Approvals</div>
              <div className="ps-inner-sub">Assistant → Superintendent → Director workflow</div>
            </div>
          </div>
          <AppointmentsPanel />
        </>
      )}

      {view === 'extensions' && (
        <>
          <div className="ps-inner-header">
            <div className="ps-inner-title-wrap">
              <div className="ps-inner-title">Extension Approvals</div>
              <div className="ps-inner-sub">Assistant → Superintendent → Director workflow</div>
            </div>
          </div>
          <ExtensionsPanel />
        </>
      )}
    </div>
  );
};

export default OfficeApprovalsPage;