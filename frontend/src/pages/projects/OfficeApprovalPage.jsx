import React, { useState } from 'react';
import './ProjectStaffPage.css';

// ─────────────────────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 'P1', code: '2433/CSRC-2/2020', name: 'Development of Ti(C,N) based cermets' },
  { id: 'P2', code: '721/CSRC-2/2013',  name: 'Advanced Materials Research' },
  { id: 'P3', code: '1234/CSRC-2/2025', name: 'Smart Manufacturing Project' },
];

// Document definitions for NEW APPOINTMENTS
// uploaded: true = faculty has uploaded, false = not yet
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
    submittedDate: '2024-01-10', status: 'PENDING',
    docs: {
      advertisement:     { uploaded: false, fileName: '',                     date: '' },
      minutes:           { uploaded: false, fileName: '',                     date: '' },
      appointmentLetter: { uploaded: false, fileName: '',                     date: '' },
      joiningLetter:     { uploaded: false, fileName: '',                     date: '' },
      passbook:          { uploaded: false, fileName: '',                     date: '' },
    },
  },
  {
    id: 202, projectId: 'P1', facultyName: 'Dr. S.Balasivanandha Prabu',
    staffName: 'Mr VETRI VEL V', designation: 'Junior Research Fellow',
    appointmentOrderNo: 'CEG/MECH/JRF/04', appointmentOrderDate: '2024-02-05',
    contractFrom: '2024-02-10', contractTo: '2024-08-09',
    joinDueDate: '2024-02-10', fixedSalary: 31000, hra: 7440,
    submittedDate: '2024-02-05', status: 'PENDING',
    docs: {
      advertisement:     { uploaded: true, fileName: 'advt_vetri.pdf',        date: '2024-02-06' },
      minutes:           { uploaded: true, fileName: 'minutes_vetri.pdf',     date: '2024-02-06' },
      appointmentLetter: { uploaded: true, fileName: 'appt_vetri.pdf',        date: '2024-02-07' },
      joiningLetter:     { uploaded: true, fileName: 'joining_vetri.pdf',     date: '2024-02-08' },
      passbook:          { uploaded: false, fileName: '',                      date: '' },
    },
  },
  {
    id: 203, projectId: 'P2', facultyName: 'Dr. P.T.V.Bhuvaneswari',
    staffName: 'Ms PRIYA A', designation: 'Project Assistant',
    appointmentOrderNo: 'MIT/ELEC/PA/02', appointmentOrderDate: '2024-03-01',
    contractFrom: '2024-03-01', contractTo: '2025-02-28',
    joinDueDate: '2024-03-01', fixedSalary: 25000, hra: 0,
    submittedDate: '2024-03-01', status: 'APPROVED',
    docs: {
      advertisement:     { uploaded: true, fileName: 'advt_priya.pdf',        date: '2024-03-02' },
      minutes:           { uploaded: true, fileName: 'minutes_priya.pdf',     date: '2024-03-02' },
      appointmentLetter: { uploaded: true, fileName: 'appt_priya.pdf',        date: '2024-03-03' },
      joiningLetter:     { uploaded: true, fileName: 'joining_priya.pdf',     date: '2024-03-04' },
      passbook:          { uploaded: true, fileName: 'passbook_priya.pdf',    date: '2024-03-04' },
    },
  },
  {
  id: 204,
  projectId: 'P3',
  facultyName: 'Dr. R. Karthikeyan',
  staffName: 'Mr ARUN KUMAR S',
  designation: 'Project Associate - I',
  appointmentOrderNo: 'SMP/PA1/2025/01',
  appointmentOrderDate: '2025-04-10',
  contractFrom: '2025-04-15',
  contractTo: '2026-04-14',
  joinDueDate: '2025-04-15',
  fixedSalary: 42000,
  hra: 10080,
  submittedDate: '2025-04-11',
  status: 'PENDING',
  docs: {
    advertisement: {
      uploaded: true,
      fileName: 'advertisement_arun.pdf',
      date: '2025-04-11',
    },
    minutes: {
      uploaded: true,
      fileName: 'selection_minutes_arun.pdf',
      date: '2025-04-11',
    },
    appointmentLetter: {
      uploaded: true,
      fileName: 'appointment_arun.pdf',
      date: '2025-04-12',
    },
    joiningLetter: {
      uploaded: true,
      fileName: 'joining_arun.pdf',
      date: '2025-04-15',
    },
    passbook: {
      uploaded: true,
      fileName: 'passbook_arun.pdf',
      date: '2025-04-15',
    },
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
    submittedDate: '2024-07-01', status: 'PENDING',
    docs: {
      appraisal:       { uploaded: false, fileName: '',                       date: '' },
      extensionLetter: { uploaded: false, fileName: '',                       date: '' },
      rejoiningLetter: { uploaded: false, fileName: '',                       date: '' },
    },
  },
  {
    id: 302, projectId: 'P2', facultyName: 'Dr. P.T.V.Bhuvaneswari',
    staffName: 'Ms PRIYA A', designation: 'Project Assistant',
    extnOrderNo: 'MIT/ELEC/PA/EXT/01', extnOrderDate: '2025-02-15',
    extnFrom: '2025-03-01', extnTo: '2025-08-31',
    rejoinDueDate: '2025-03-01', fixedSalary: 27000, hra: 0,
    submittedDate: '2025-02-15', status: 'PENDING',
    docs: {
      appraisal:       { uploaded: true, fileName: 'appraisal_priya.pdf',    date: '2025-02-16' },
      extensionLetter: { uploaded: true, fileName: 'ext_letter_priya.pdf',   date: '2025-02-17' },
      rejoiningLetter: { uploaded: false, fileName: '',                       date: '' },
    },
  },
  {
  id: 303,
  projectId: 'P3',
  facultyName: 'Dr. R. Karthikeyan',
  staffName: 'Mr ARUN KUMAR S',
  designation: 'Project Associate - I',
  extnOrderNo: 'SMP/EXT/2026/01',
  extnOrderDate: '2026-03-20',
  extnFrom: '2026-04-15',
  extnTo: '2027-04-14',
  rejoinDueDate: '2026-04-15',
  fixedSalary: 45000,
  hra: 10800,
  submittedDate: '2026-03-21',
  status: 'PENDING',
  docs: {
    appraisal: {
      uploaded: true,
      fileName: 'appraisal_arun.pdf',
      date: '2026-03-21',
    },
    extensionLetter: {
      uploaded: true,
      fileName: 'extension_letter_arun.pdf',
      date: '2026-03-21',
    },
    rejoiningLetter: {
      uploaded: true,
      fileName: 'rejoining_arun.pdf',
      date: '2026-03-22',
    },
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

const uploadsComplete = (docs) =>
  Object.values(docs).every(d => d.uploaded);

const uploadedCount = (docs) =>
  Object.values(docs).filter(d => d.uploaded).length;

// ─────────────────────────────────────────────────────────
//  STATUS BADGE
// ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    APPROVED: 'verified',
    PENDING:  'pending',
    REJECTED: 'danger-badge',
    'AWAITING UPLOADS': 'new',
  };
  return (
    <span className={`ps-badge ${map[status] || 'pending'}`}>
      <span className="ps-badge-dot" />
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────
//  UPLOAD PROGRESS BAR (mini)
// ─────────────────────────────────────────────────────────
const UploadProgress = ({ docs }) => {
  const total   = Object.keys(docs).length;
  const done    = uploadedCount(docs);
  const pct     = Math.round((done / total) * 100);
  const allDone = done === total;
  const color   = allDone ? '#059669' : done > 0 ? '#4f46e5' : '#d97706';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 5, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
        {done}/{total}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  DOCUMENT VIEWER MODAL
// ─────────────────────────────────────────────────────────
const DocViewerModal = ({ item, docDefs, onClose }) => {
  const docs = item.docs;
  const total = docDefs.length;
  const done  = docDefs.filter(d => docs[d.key]?.uploaded).length;
  const allDone = done === total;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(15,15,40,0.5)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
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
        {/* Modal Header */}
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

          {/* Summary bar */}
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
              {allDone ? ' — All complete, approval is unlocked.' : ' — Approval locked until all documents are uploaded.'}
            </span>
          </div>
        </div>

        {/* Document rows */}
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
                  {/* Serial */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: doc.uploaded ? 'rgba(5,150,105,0.12)' : '#f0f0f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700,
                    color: doc.uploaded ? '#059669' : '#9ca3af',
                  }}>
                    {idx + 1}
                  </div>

                  {/* Icon */}
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

                  {/* Label + filename */}
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

                  {/* Status chip + view link */}
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
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  DETAIL + APPROVE MODAL
// ─────────────────────────────────────────────────────────
const DetailModal = ({ item, type, onApprove, onReject, onClose }) => {
  const isNew   = type === 'appointment';
  const docDefs = isNew ? APPT_DOCS : EXTN_DOCS;
  const canApprove = uploadsComplete(item.docs) && item.status === 'PENDING';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,15,40,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640,
          padding: '30px 34px', boxShadow: '0 20px 60px rgba(15,15,40,0.18)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: '#111827' }}>
              {isNew ? 'New Appointment' : 'Extension'} — #{item.id}
            </div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6b7280', marginTop: 3 }}>
              {projectLabel(item.projectId)} · Submitted {fmtDate(item.submittedDate)}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 22 }}>
          {[
            ['Staff Name',   item.staffName],
            ['Designation',  item.designation],
            ['Faculty / PI', item.facultyName],
            ['Project',      projectLabel(item.projectId)],
            isNew ? ['Order No',       item.appointmentOrderNo]    : ['Extn Order No',   item.extnOrderNo],
            isNew ? ['Order Date',     fmtDate(item.appointmentOrderDate)] : ['Order Date', fmtDate(item.extnOrderDate)],
            isNew ? ['Contract From',  fmtDate(item.contractFrom)] : ['Extension From', fmtDate(item.extnFrom)],
            isNew ? ['Contract To',    fmtDate(item.contractTo)]   : ['Extension To',   fmtDate(item.extnTo)],
            ['Fixed Salary', `₹${parseInt(item.fixedSalary || 0).toLocaleString('en-IN')}`],
            ['HRA',          item.hra ? `₹${parseInt(item.hra).toLocaleString('en-IN')}` : 'Nil'],
            ['Joining Due',  fmtDate(isNew ? item.joinDueDate : item.rejoinDueDate)],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, color: '#111827', fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Upload lock notice */}
        {!uploadsComplete(item.docs) && item.status === 'PENDING' && (
          <div style={{
            background: '#fffbeb', border: '1.5px solid rgba(217,119,6,0.25)',
            borderRadius: 10, padding: '11px 15px', marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#92400e' }}>
              Approval is locked — {uploadedCount(item.docs)}/{docDefs.length} documents uploaded by faculty.
            </span>
          </div>
        )}

        {/* Actions */}
        {item.status === 'APPROVED' ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}><StatusBadge status="APPROVED" /></div>
        ) : item.status === 'REJECTED' ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}><StatusBadge status="REJECTED" /></div>
        ) : canApprove ? (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onReject} style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid rgba(220,38,38,0.3)', background: '#fef2f2', color: '#dc2626', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Reject
            </button>
            <button onClick={onApprove} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}>
              ✓ Approve
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, padding: '6px 0' }}>
            Upload all required documents to unlock approval.
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  TAB FILTER BAR  (New Requests / Pending Approval / Approved)
// ─────────────────────────────────────────────────────────
const TabBar = ({ tabs, active, onChange }) => (
  <div style={{
    display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
  }}>
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
const RequestTable = ({ rows, type, onView, onViewDocs }) => {
  const isNew = type === 'appointment';
  if (rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '52px 20px', color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
        No records in this category.
      </div>
    );
  }
  return (
    <div className="ps-table-wrap">
      <table className="ps-table" style={{ minWidth: 820 }}>
        <thead>
          <tr>
            <th className="ps-sl-num">Sl.</th>
            <th>Staff Name</th>
            <th>Designation</th>
            <th>Project</th>
            <th>{isNew ? 'Contract From' : 'Extn From'}</th>
            <th>{isNew ? 'Contract To'   : 'Extn To'  }</th>
            <th>Salary</th>
            <th>Documents</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const docDefs   = isNew ? APPT_DOCS : EXTN_DOCS;
            const allDone   = uploadsComplete(r.docs);
            const doneCount = uploadedCount(r.docs);
            const derivedStatus = r.status !== 'PENDING'
              ? r.status
              : allDone ? 'PENDING' : 'AWAITING UPLOADS';

            return (
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
                <td>
                  <UploadProgress docs={r.docs} />
                </td>
                <td>
                  <StatusBadge status={derivedStatus} />
                </td>
                <td>
                  <div className="ps-action-group">
                    {/* View documents */}
                    <button
                      className="ps-icon-btn doc"
                      title="View Documents"
                      onClick={() => onViewDocs(r)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </button>
                    {/* View / Approve */}
                    <button
                      className="ps-icon-btn view"
                      title="Review & Approve"
                      onClick={() => onView(r)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  APPOINTMENTS PANEL
// ─────────────────────────────────────────────────────────
const AppointmentsPanel = () => {
  const [appointments, setAppointments] = useState(INIT_APPOINTMENTS);
  const [tab,          setTab]          = useState('awaiting');
  const [selected,     setSelected]     = useState(null);   // for approve modal
  const [docItem,      setDocItem]      = useState(null);   // for doc viewer modal

  const awaiting  = appointments.filter(a => !uploadsComplete(a.docs) && a.status === 'PENDING');
  const pending   = appointments.filter(a =>  uploadsComplete(a.docs) && a.status === 'PENDING');
  const approved  = appointments.filter(a => a.status === 'APPROVED');
  const rejected  = appointments.filter(a => a.status === 'REJECTED');

  const rows = tab === 'awaiting' ? awaiting
             : tab === 'pending'  ? pending
             : tab === 'approved' ? approved
             :                      rejected;

  const handleApprove = () => {
    setAppointments(prev => prev.map(a => a.id === selected.id ? { ...a, status: 'APPROVED' } : a));
    setSelected(null);
  };
  const handleReject = () => {
    setAppointments(prev => prev.map(a => a.id === selected.id ? { ...a, status: 'REJECTED' } : a));
    setSelected(null);
  };

  const tabs = [
    { key: 'awaiting', label: 'Awaiting Uploads', count: awaiting.length, color: '#d97706' },
    { key: 'pending',  label: 'Pending Approval',  count: pending.length,  color: '#4f46e5' },
    { key: 'approved', label: 'Approved',           count: approved.length, color: '#059669' },
    ...(rejected.length > 0 ? [{ key: 'rejected', label: 'Rejected', count: rejected.length, color: '#dc2626' }] : []),
  ];

  return (
    <>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      <div className="ps-table-card">
        <RequestTable
          rows={rows}
          type="appointment"
          onView={setSelected}
          onViewDocs={setDocItem}
        />
      </div>

      {selected && (
        <DetailModal
          item={selected}
          type="appointment"
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelected(null)}
        />
      )}
      {docItem && (
        <DocViewerModal
          item={docItem}
          docDefs={APPT_DOCS}
          onClose={() => setDocItem(null)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
//  EXTENSIONS PANEL
// ─────────────────────────────────────────────────────────
const ExtensionsPanel = () => {
  const [extensions, setExtensions] = useState(INIT_EXTENSIONS);
  const [tab,        setTab]        = useState('awaiting');
  const [selected,   setSelected]   = useState(null);
  const [docItem,    setDocItem]    = useState(null);

  const awaiting  = extensions.filter(e => !uploadsComplete(e.docs) && e.status === 'PENDING');
  const pending   = extensions.filter(e =>  uploadsComplete(e.docs) && e.status === 'PENDING');
  const approved  = extensions.filter(e => e.status === 'APPROVED');
  const rejected  = extensions.filter(e => e.status === 'REJECTED');

  const rows = tab === 'awaiting' ? awaiting
             : tab === 'pending'  ? pending
             : tab === 'approved' ? approved
             :                      rejected;

  const handleApprove = () => {
    setExtensions(prev => prev.map(e => e.id === selected.id ? { ...e, status: 'APPROVED' } : e));
    setSelected(null);
  };
  const handleReject = () => {
    setExtensions(prev => prev.map(e => e.id === selected.id ? { ...e, status: 'REJECTED' } : e));
    setSelected(null);
  };

  const tabs = [
    { key: 'awaiting', label: 'Awaiting Uploads', count: awaiting.length, color: '#d97706' },
    { key: 'pending',  label: 'Pending Approval',  count: pending.length,  color: '#a78bfa' },
    { key: 'approved', label: 'Approved',           count: approved.length, color: '#059669' },
    ...(rejected.length > 0 ? [{ key: 'rejected', label: 'Rejected', count: rejected.length, color: '#dc2626' }] : []),
  ];

  return (
    <>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      <div className="ps-table-card">
        <RequestTable
          rows={rows}
          type="extension"
          onView={setSelected}
          onViewDocs={setDocItem}
        />
      </div>

      {selected && (
        <DetailModal
          item={selected}
          type="extension"
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelected(null)}
        />
      )}
      {docItem && (
        <DocViewerModal
          item={docItem}
          docDefs={EXTN_DOCS}
          onClose={() => setDocItem(null)}
        />
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
              <div className="ps-inner-sub">Switch between tabs to view requests by status</div>
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
              <div className="ps-inner-sub">Switch between tabs to view requests by status</div>
            </div>
          </div>
          <ExtensionsPanel />
        </>
      )}
    </div>
  );
};

export default OfficeApprovalsPage;