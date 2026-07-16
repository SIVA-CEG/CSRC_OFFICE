// PATH: CSRC_OFFICE/frontend/src/pages/projects/ProjectTransferRequests.jsx

import React, { useState, useEffect, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// This is the CSRC-office counterpart to the faculty-side ProjectTransfer.jsx.
// It reads/writes the SAME localStorage keys the faculty page uses, so once
// both faculty have acted (sender submits → recipient accepts), the request
// automatically appears here for office processing:
//
//   `csrc_project_transfers`  : [ transfer, ... ]   (shared with faculty page)
//   `csrc_faculty_projects`   : { [facultyId]: [project, ...] } (shared)
//
// Office-only fields are added on top of the faculty-side transfer object
// (officeStage, officeAssigneeId/Name, officeHistory) so nothing on the
// faculty page needs to change.
//
// Role hierarchy (bottom → top): assistant → superintendent → deputy_director → director
//   • "Transfer with Approval"   → moves the request UP one tier
//     (assistant → superintendent → deputy director → director). At the
//     Director tier this action becomes "Approve & Finalize" since there is
//     no tier above.
//   • "Transfer without Approval"→ lateral handoff at the SAME tier
//     (assistant → assistant, superintendent → superintendent, etc.)
//
// Role/identity come from real login (ProceedingsLogin.local.jsx, the
// mock-DB login page) via `localStorage`. If this app later moves to the
// backend-connected login page, that one writes to `sessionStorage`
// instead — the reads in this file would need to switch to match, or
// identity silently falls back to 'assistant' / 'Office'.
// Tab layout mirrors FreshSanction.jsx as well:
//   • assistant / superintendent / deputy_director → New Requests, Transferred, Completed
//   • director                                     → New Requests, Completed  (no "Transferred")
//
// DUMMY DATA: DUMMY_TRANSFERS / DUMMY_PROJECTS below are plain hardcoded
// constants in this file. Whenever the shared localStorage keys are empty,
// the page just uses these constants directly — no seed-once flag, nothing
// written that can go stale or need clearing. As soon as real data shows up
// in localStorage (from the faculty page, or from acting on the dummy
// requests here), that takes over automatically on the next load.
// ─────────────────────────────────────────────────────────────────────────

const STORAGE_TRANSFERS = 'csrc_project_transfers';
const STORAGE_PROJECTS  = 'csrc_faculty_projects';

// ── Real login identity (set by ProceedingsLogin.jsx on sign-in) ──────────
// localStorage — matches ProceedingsLogin.local.jsx (the mock-DB login
// page). NOTE: if/when this app switches to the backend-connected login
// page (which writes to sessionStorage, per-tab, so multiple roles can be
// signed in across tabs simultaneously), these two reads below need to
// change to sessionStorage.getItem(...) to match — the storage mechanism
// on this page and on whichever login page is actually in use MUST agree,
// or identity silently falls back to 'assistant' / 'Office'.

// Normalizes whatever the backend sends ("Deputy Director", "deputy-director",
// "DEPUTY_DIRECTOR", etc.) into the canonical snake_case keys used by
// ROLE_ORDER below, so small formatting differences from the backend don't
// silently fall back to 'assistant'.
const ROLE_ALIASES = {
  assistant: 'assistant',
  ast: 'assistant',
  superintendent: 'superintendent',
  superintendant: 'superintendent', // common misspelling
  sup: 'superintendent',
  deputy_director: 'deputy_director',
  deputydirector: 'deputy_director',
  deputy: 'deputy_director',
  dy_director: 'deputy_director',
  dd: 'deputy_director',
  director: 'director',
  dir: 'director',
};

const normalizeRole = (raw) => {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase().replace(/[\s-]+/g, '_');
  const resolved = ROLE_ALIASES[key];
  if (!resolved) {
    // eslint-disable-next-line no-console
    console.warn(`[ProjectTransferRequests] Unrecognized role from sessionStorage: "${raw}" — falling back to "assistant". Check what the login API is actually sending.`);
    return null;
  }
  return resolved;
};

const userRole = () => normalizeRole(localStorage.getItem('userRole')) || 'assistant';
const userName = () => localStorage.getItem('userName') || 'Office';

// ─── Office staff directory (stand-in for a real users table) ─────────────
// ids match the dev credentials in ProceedingsLogin.jsx (ast1/sup1/dd1/dir1)
const OFFICE_STAFF = {
  assistant: [
    { id: 'ast1', name: 'Mr. R. Senthilkumar' },
    { id: 'ast2', name: 'Ms. P. Lakshmi' },
  ],
  superintendent: [
    { id: 'sup1', name: 'Mr. T. Anbarasan' },
    { id: 'sup2', name: 'Mrs. S. Meenakshi' },
  ],
  deputy_director: [
    { id: 'dd1', name: 'Dr. N. Rajesh' },
  ],
  director: [
    { id: 'dir1', name: 'Dr. S. Balasivanandha Prabu, Director, CSRC' },
  ],
};

const ROLE_ORDER = ['assistant', 'superintendent', 'deputy_director', 'director'];
const ROLE_LABEL = {
  assistant: 'Assistant',
  superintendent: 'Superintendent',
  deputy_director: 'Deputy Director',
  director: 'Director',
};

const nextRole = (role) => {
  const idx = ROLE_ORDER.indexOf(role);
  return idx >= 0 && idx < ROLE_ORDER.length - 1 ? ROLE_ORDER[idx + 1] : null;
};

const staffById = (role, id) => (OFFICE_STAFF[role] || []).find(s => s.id === id) || null;

// Resolve the currently logged-in staff record for a role, falling back to
// the first directory entry for that role (keeps demo data functional even
// if `userName` doesn't exactly match a directory entry).
const currentStaffFor = (role) => {
  const name = userName();
  const byName = (OFFICE_STAFF[role] || []).find(s => s.name === name);
  return byName || (OFFICE_STAFF[role] || [])[0] || null;
};

const todayStr = () => new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

// ─── localStorage bridge helpers (shared with faculty-side page) ──────────
const loadTransfers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_TRANSFERS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
};

const saveTransfers = (transfers) => {
  try { localStorage.setItem(STORAGE_TRANSFERS, JSON.stringify(transfers)); } catch (_) {}
};

const loadProjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
};

const saveProjects = (projects) => {
  try { localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(projects)); } catch (_) {}
};

// ── Dummy seed data ─────────────────────────────────────────────────────
// Only used to pre-populate localStorage the FIRST time this page runs and
// finds nothing there yet — mirrors the DUMMY_* seed pattern in
// FreshSanction.jsx so each tier (assistant/superintendent/deputy_director/
// director) has something to test against without needing the faculty page.
const DUMMY_LETTER = (heading, body) => `
  <html><head><title>${heading}</title></head>
  <body style="font-family: Georgia, serif; padding: 40px; max-width: 700px; margin: auto;">
    <h2>${heading}</h2>
    <p>${body}</p>
  </body></html>
`;

// Hardcoded in the source — not written through localStorage seeding logic,
// so there's nothing to "clear" or get stuck. Every time this page mounts
// and finds no real (non-empty) data in the shared keys, it just uses this
// constant directly as the working data for that render. Once a real
// transfer exists (from the faculty page, or from acting on these dummy
// ones), localStorage takes over as usual.
const DUMMY_PROJECTS = {
  fac_kumar: [
    { id: 'proj_2001', fileNo: 'CSRC/PRJ/2024/0021', title: 'AI-Based Crop Disease Detection System', cost: '18,50,000', fundingAgency: 'DST', period: '2024-2027' },
  ],
  fac_priya: [
    { id: 'proj_2002', fileNo: 'CSRC/PRJ/2023/0087', title: 'Low-Cost Water Quality Sensor Network', cost: '12,00,000', fundingAgency: 'SERB', period: '2023-2026' },
  ],
  fac_anand: [
    { id: 'proj_2003', fileNo: 'CSRC/PRJ/2025/0014', title: 'Efficient Edge Inference for IoT Devices', cost: '9,75,000', fundingAgency: 'MeitY', period: '2025-2028' },
  ],
  fac_meera: [
    { id: 'proj_2004', fileNo: 'CSRC/PRJ/2024/0055', title: 'Blockchain-Based Land Records Verification', cost: '15,20,000', fundingAgency: 'MeitY', period: '2024-2027' },
  ],
};

const DUMMY_TRANSFERS = [
  // 1) Fresh acceptance, not yet touched by office — lands in Assistant's "New Requests"
  {
    id: 'tr_9001',
    projectId: 'proj_2001',
    fileNo: 'CSRC/PRJ/2024/0021',
    title: 'AI-Based Crop Disease Detection System',
    cost: '18,50,000',
    fundingAgency: 'DST',
    period: '2024-2027',
    fromFacultyId: 'fac_kumar', fromFacultyName: 'Dr. M. Kumar', fromFacultyDept: 'Dept. of CSE',
    toFacultyId: 'fac_anand',   toFacultyName: 'Dr. R. Anand',  toFacultyDept: 'Dept. of IT',
    status: 'accepted_by_faculty',
    remarks: 'Relocating to a new department; requesting smooth handover of ongoing grant.',
    transferLetter: DUMMY_LETTER('Project Transfer Letter', 'Signed transfer letter for handover from Dr. M. Kumar to Dr. R. Anand.'),
    respondedAt: '01-07-2026',
  },
  // 2) Already forwarded by Assistant to Superintendent — visible in
  //    Assistant's "Transferred" tab and Superintendent's "New Requests"
  {
    id: 'tr_9002',
    projectId: 'proj_2002',
    fileNo: 'CSRC/PRJ/2023/0087',
    title: 'Low-Cost Water Quality Sensor Network',
    cost: '12,00,000',
    fundingAgency: 'SERB',
    period: '2023-2026',
    fromFacultyId: 'fac_priya', fromFacultyName: 'Dr. S. Priya',  fromFacultyDept: 'Dept. of Civil Engg.',
    toFacultyId: 'fac_kumar',   toFacultyName: 'Dr. M. Kumar',    toFacultyDept: 'Dept. of CSE',
    status: 'accepted_by_faculty',
    remarks: 'Co-PI taking over as sole PI following faculty transfer.',
    transferLetter: DUMMY_LETTER('Project Transfer Letter', 'Signed transfer letter for handover from Dr. S. Priya to Dr. M. Kumar.'),
    respondedAt: '28-06-2026',
    officeStage: 'superintendent',
    officeAssigneeId: 'sup1',
    officeAssigneeName: 'Mr. T. Anbarasan',
    officeHistory: [
      { id: 'oh_9002_0', at: '28-06-2026', fromRole: null, fromName: 'Faculty Acceptance', toRole: 'assistant', toName: 'New Requests', type: 'entry', remarks: '' },
      { id: 'oh_9002_1', at: '30-06-2026', fromRole: 'assistant', fromName: 'Mr. R. Senthilkumar', toRole: 'superintendent', toName: 'Mr. T. Anbarasan', type: 'approval', remarks: 'Documents verified, forwarding for review.' },
    ],
  },
  // 3) Already forwarded up to Deputy Director — visible in Deputy
  //    Director's "New Requests"
  {
    id: 'tr_9003',
    projectId: 'proj_2003',
    fileNo: 'CSRC/PRJ/2025/0014',
    title: 'Efficient Edge Inference for IoT Devices',
    cost: '9,75,000',
    fundingAgency: 'MeitY',
    period: '2025-2028',
    fromFacultyId: 'fac_anand', fromFacultyName: 'Dr. R. Anand', fromFacultyDept: 'Dept. of IT',
    toFacultyId: 'fac_priya',   toFacultyName: 'Dr. S. Priya',   toFacultyDept: 'Dept. of Civil Engg.',
    status: 'accepted_by_faculty',
    remarks: 'Cross-department collaboration lead change.',
    transferLetter: DUMMY_LETTER('Project Transfer Letter', 'Signed transfer letter for handover from Dr. R. Anand to Dr. S. Priya.'),
    respondedAt: '20-06-2026',
    officeStage: 'deputy_director',
    officeAssigneeId: 'dd1',
    officeAssigneeName: 'Dr. N. Rajesh',
    officeHistory: [
      { id: 'oh_9003_0', at: '20-06-2026', fromRole: null, fromName: 'Faculty Acceptance', toRole: 'assistant', toName: 'New Requests', type: 'entry', remarks: '' },
      { id: 'oh_9003_1', at: '22-06-2026', fromRole: 'assistant', fromName: 'Mr. R. Senthilkumar', toRole: 'superintendent', toName: 'Mr. T. Anbarasan', type: 'approval', remarks: '' },
      { id: 'oh_9003_2', at: '24-06-2026', fromRole: 'superintendent', fromName: 'Mr. T. Anbarasan', toRole: 'deputy_director', toName: 'Dr. N. Rajesh', type: 'approval', remarks: 'Recommended for higher-level review.' },
    ],
  },
  // 4) Forwarded all the way to Director — visible in Director's "New Requests"
  {
    id: 'tr_9005',
    projectId: 'proj_2004',
    fileNo: 'CSRC/PRJ/2024/0055',
    title: 'Blockchain-Based Land Records Verification',
    cost: '15,20,000',
    fundingAgency: 'MeitY',
    period: '2024-2027',
    fromFacultyId: 'fac_meera', fromFacultyName: 'Dr. K. Meera', fromFacultyDept: 'Dept. of IST',
    toFacultyId: 'fac_kumar',   toFacultyName: 'Dr. M. Kumar',   toFacultyDept: 'Dept. of CSE',
    status: 'accepted_by_faculty',
    remarks: 'Outgoing PI proceeding on sabbatical; handover to co-investigator.',
    transferLetter: DUMMY_LETTER('Project Transfer Letter', 'Signed transfer letter for handover from Dr. K. Meera to Dr. M. Kumar.'),
    respondedAt: '15-06-2026',
    officeStage: 'director',
    officeAssigneeId: 'dir1',
    officeAssigneeName: 'Dr. S. Balasivanandha Prabu, Director, CSRC',
    officeHistory: [
      { id: 'oh_9005_0', at: '15-06-2026', fromRole: null, fromName: 'Faculty Acceptance', toRole: 'assistant', toName: 'New Requests', type: 'entry', remarks: '' },
      { id: 'oh_9005_1', at: '17-06-2026', fromRole: 'assistant', fromName: 'Mr. R. Senthilkumar', toRole: 'superintendent', toName: 'Mr. T. Anbarasan', type: 'approval', remarks: '' },
      { id: 'oh_9005_2', at: '19-06-2026', fromRole: 'superintendent', fromName: 'Mr. T. Anbarasan', toRole: 'deputy_director', toName: 'Dr. N. Rajesh', type: 'approval', remarks: '' },
      { id: 'oh_9005_3', at: '21-06-2026', fromRole: 'deputy_director', fromName: 'Dr. N. Rajesh', toRole: 'director', toName: 'Dr. S. Balasivanandha Prabu, Director, CSRC', type: 'approval', remarks: 'Recommended for final approval.' },
    ],
  },
  // 5) Fully completed — visible under "Completed" for every role
  {
    id: 'tr_9004',
    projectId: 'proj_2099',
    fileNo: 'CSRC/PRJ/2022/0033',
    title: 'Smart Grid Load Balancing Framework',
    cost: '22,40,000',
    fundingAgency: 'CSIR',
    period: '2022-2025',
    fromFacultyId: 'fac_priya', fromFacultyName: 'Dr. S. Priya', fromFacultyDept: 'Dept. of Civil Engg.',
    toFacultyId: 'fac_anand',   toFacultyName: 'Dr. R. Anand',   toFacultyDept: 'Dept. of IT',
    status: 'approved_by_csrc',
    remarks: 'Project completed by outgoing PI; handover for closure formalities.',
    transferLetter: DUMMY_LETTER('Project Transfer Letter', 'Signed transfer letter for handover from Dr. S. Priya to Dr. R. Anand.'),
    respondedAt: '02-06-2026',
    csrcApprovedAt: '10-06-2026',
    officeStage: 'director',
    officeAssigneeId: 'dir1',
    officeAssigneeName: 'Dr. S. Balasivanandha Prabu, Director, CSRC',
    officeHistory: [
      { id: 'oh_9004_0', at: '02-06-2026', fromRole: null, fromName: 'Faculty Acceptance', toRole: 'assistant', toName: 'New Requests', type: 'entry', remarks: '' },
      { id: 'oh_9004_1', at: '04-06-2026', fromRole: 'assistant', fromName: 'Mr. R. Senthilkumar', toRole: 'superintendent', toName: 'Mr. T. Anbarasan', type: 'approval', remarks: '' },
      { id: 'oh_9004_2', at: '06-06-2026', fromRole: 'superintendent', fromName: 'Mr. T. Anbarasan', toRole: 'deputy_director', toName: 'Dr. N. Rajesh', type: 'approval', remarks: '' },
      { id: 'oh_9004_3', at: '08-06-2026', fromRole: 'deputy_director', fromName: 'Dr. N. Rajesh', toRole: 'director', toName: 'Dr. S. Balasivanandha Prabu, Director, CSRC', type: 'approval', remarks: '' },
      { id: 'oh_9004_4', at: '10-06-2026', fromRole: 'director', fromName: 'Dr. S. Balasivanandha Prabu, Director, CSRC', toRole: null, toName: null, type: 'finalize', remarks: 'Approved. Transfer complete.' },
    ],
  },
];

// Pick working data for this render: real localStorage data if it actually
// has entries, otherwise fall back straight to the hardcoded constants
// above. No writing, no "first run" flag, nothing to get stuck — every
// mount just re-evaluates this the same way.
const effectiveTransfers = () => {
  const stored = loadTransfers();
  return Array.isArray(stored) && stored.length > 0 ? stored : DUMMY_TRANSFERS;
};

const effectiveProjects = () => {
  const stored = loadProjects();
  return stored && Object.keys(stored).length > 0 ? stored : DUMMY_PROJECTS;
};

// New transfers coming from the faculty page won't have office fields yet —
// stamp them with the starting office stage (Assistant) the first time we
// see them here, without touching anything the faculty page owns.
const withOfficeDefaults = (t) => {
  if (t.status !== 'accepted_by_faculty') return t;
  if (t.officeStage) return t;
  return {
    ...t,
    officeStage: 'assistant',
    officeAssigneeId: null,
    officeAssigneeName: null,
    officeHistory: t.officeHistory || [
      { id: `oh_${t.id}_0`, at: t.respondedAt || todayStr(), fromRole: null, fromName: 'Faculty Acceptance', toRole: 'assistant', toName: 'New Requests', type: 'entry', remarks: '' },
    ],
  };
};

// ─── Status badge (office-facing labels) ───────────────────────────────────
const officeStatusMeta = (t) => {
  if (t.status === 'approved_by_csrc') return { label: 'Approved — Transfer Completed', color: '#166534', bg: '#dcfce7', dot: '#22c55e' };
  if (t.status === 'rejected_by_csrc') return { label: 'Rejected by CSRC Office',        color: '#991b1b', bg: '#fee2e2', dot: '#ef4444' };
  if (t.status === 'rejected_by_faculty') return { label: 'Rejected by Faculty',         color: '#991b1b', bg: '#fee2e2', dot: '#ef4444' };
  if (t.status === 'pending_faculty') return { label: 'Awaiting Faculty Acceptance',     color: '#92400e', bg: '#fef3c7', dot: '#f59e0b' };
  const stage = t.officeStage || 'assistant';
  return { label: `Pending — ${ROLE_LABEL[stage]} Review`, color: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' };
};

const StatusBadge = ({ t }) => {
  const s = officeStatusMeta(t);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
      color: s.color, background: s.bg, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  );
};

// ─── Office pipeline timeline ──────────────────────────────────────────────
const TIMELINE_LABELS = ['Faculty Accepted', 'Assistant', 'Superintendent', 'Deputy Director', 'Director', 'Completed'];

const OfficeTimeline = ({ t }) => {
  const labels = TIMELINE_LABELS;
  const isRejected = t.status === 'rejected_by_csrc';

  let reachedIdx;
  if (t.status === 'approved_by_csrc') reachedIdx = labels.length - 1;
  else reachedIdx = ROLE_ORDER.indexOf(t.officeStage || 'assistant') + 1;

  return (
    <div style={styles.timelineRow}>
      {labels.map((label, i) => {
        let state = 'pending';
        if (isRejected && i === reachedIdx) state = 'rejected';
        else if (i <= reachedIdx) state = 'done';
        return (
          <React.Fragment key={label}>
            <div style={styles.timelineStep}>
              <div style={{
                ...styles.timelineDot,
                background: state === 'done' ? '#22c55e' : state === 'rejected' ? '#ef4444' : '#e5e7eb',
                borderColor: state === 'done' ? '#22c55e' : state === 'rejected' ? '#ef4444' : '#d1d5db',
              }} />
              <span style={{ ...styles.timelineLabel, color: state === 'pending' ? '#9ca3af' : '#374151' }}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ ...styles.timelineBar, background: i < reachedIdx ? '#22c55e' : '#e5e7eb' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Letter viewer (new tab, same convention as faculty page) ─────────────
const viewLetterHtml = (html) => {
  if (!html) return;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
};

// ─── Process modal: Transfer with Approval / without Approval / Reject ───
const ProcessModal = ({ transfer, viewingRole, onClose, onApprovalTransfer, onLateralTransfer, onFinalize, onReject }) => {
  const [mode, setMode] = useState(null); // 'approval' | 'lateral' | 'reject'
  const [selectedId, setSelectedId] = useState('');
  const [remarks, setRemarks] = useState('');

  const upperRole = nextRole(viewingRole);
  const isDirector = viewingRole === 'director';

  const optionsFor = (role) =>
    (OFFICE_STAFF[role] || []).filter(s => s.id !== transfer.officeAssigneeId);

  const reset = () => { setMode(null); setSelectedId(''); setRemarks(''); };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span>Process Transfer Request</span>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.modalProjectBox}>
            <div style={styles.modalProjectFile}>{transfer.fileNo}</div>
            <div style={styles.modalProjectTitle}>{transfer.title}</div>
            <div style={styles.modalProjectCost}>₹ {transfer.cost} · {transfer.fundingAgency}</div>
            <div style={styles.modalProjectParties}>
              From: <strong>{transfer.fromFacultyName}</strong> → To: <strong>{transfer.toFacultyName}</strong>
            </div>
          </div>

          {!mode && (
            <div style={styles.modeChoices}>
              <button
                style={styles.modeBtnApproval}
                onClick={() => setMode('approval')}
              >
                {isDirector ? '✓ Approve & Finalize Transfer' : `⬆ Transfer with Approval (to ${ROLE_LABEL[upperRole]})`}
              </button>
              <button style={styles.modeBtnLateral} onClick={() => setMode('lateral')}>
                ↔ Transfer without Approval ({ROLE_LABEL[viewingRole]} → {ROLE_LABEL[viewingRole]})
              </button>
              <button style={styles.modeBtnReject} onClick={() => setMode('reject')}>
                ✕ Reject Transfer
              </button>
            </div>
          )}

          {mode === 'approval' && !isDirector && (
            <>
              <label style={styles.modalLabel}>Select {ROLE_LABEL[upperRole]}</label>
              <select style={styles.modalSelect} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                <option value="">Select {ROLE_LABEL[upperRole].toLowerCase()}…</option>
                {optionsFor(upperRole).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <label style={styles.modalLabel}>Remarks (optional)</label>
              <textarea style={styles.modalTextarea} rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Note for the next reviewer…" />
            </>
          )}

          {mode === 'approval' && isDirector && (
            <>
              <div style={styles.finalizeNote}>
                This will approve the transfer, complete the CSRC review pipeline, and move the project
                from <strong>{transfer.fromFacultyName}</strong> to <strong>{transfer.toFacultyName}</strong>.
              </div>
              <label style={styles.modalLabel}>Remarks (optional)</label>
              <textarea style={styles.modalTextarea} rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Final remarks…" />
            </>
          )}

          {mode === 'lateral' && (
            <>
              <label style={styles.modalLabel}>Select {ROLE_LABEL[viewingRole]}</label>
              <select style={styles.modalSelect} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                <option value="">Select {ROLE_LABEL[viewingRole].toLowerCase()}…</option>
                {optionsFor(viewingRole).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <label style={styles.modalLabel}>Remarks (optional)</label>
              <textarea style={styles.modalTextarea} rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Note for your colleague…" />
            </>
          )}

          {mode === 'reject' && (
            <>
              <div style={styles.finalizeNote}>
                This will reject the transfer request. The faculty will need to re-initiate the process if needed.
              </div>
              <label style={styles.modalLabel}>Reason for rejection</label>
              <textarea style={styles.modalTextarea} rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Reason (shown in tracking)…" />
            </>
          )}
        </div>

        <div style={styles.modalFooter}>
          {mode ? (
            <>
              <button style={styles.modalCancelBtn} onClick={reset}>← Back</button>
              <button
                style={{
                  ...styles.modalSubmitBtn,
                  background: mode === 'reject' ? '#ef4444' : mode === 'lateral' ? '#2563eb' : '#16a34a',
                  opacity: (mode === 'reject' || selectedId) ? 1 : 0.5,
                  cursor: (mode === 'reject' || selectedId) ? 'pointer' : 'not-allowed',
                }}
                disabled={mode !== 'reject' && !selectedId}
                onClick={() => {
                  if (mode === 'approval' && isDirector) onFinalize(transfer, remarks);
                  else if (mode === 'approval') onApprovalTransfer(transfer, selectedId, remarks);
                  else if (mode === 'lateral') onLateralTransfer(transfer, selectedId, remarks);
                  else if (mode === 'reject') onReject(transfer, remarks);
                }}
              >
                {mode === 'reject' ? 'Confirm Rejection' : mode === 'approval' && isDirector ? 'Approve & Finalize' : 'Confirm Transfer'}
              </button>
            </>
          ) : (
            <button style={styles.modalCancelBtn} onClick={onClose}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Track modal: full detail + history for a completed/in-flight transfer ─
const TrackModal = ({ transfer, onClose }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={{ ...styles.modalBox, width: 560 }} onClick={e => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <span>Track Transfer — {transfer.fileNo}</span>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
      </div>
      <div style={styles.modalBody}>
        <div style={styles.modalProjectBox}>
          <div style={styles.modalProjectFile}>{transfer.fileNo}</div>
          <div style={styles.modalProjectTitle}>{transfer.title}</div>
          <div style={styles.modalProjectCost}>₹ {transfer.cost} · {transfer.fundingAgency}</div>
          <div style={styles.modalProjectParties}>
            From: <strong>{transfer.fromFacultyName}</strong> → To: <strong>{transfer.toFacultyName}</strong>
          </div>
        </div>

        <StatusBadge t={transfer} />
        <OfficeTimeline t={transfer} />

        <div style={styles.actionRow}>
          <button style={styles.letterBtn} onClick={() => viewLetterHtml(transfer.transferLetter)}>📄 View Transfer Letter</button>
        </div>

        {transfer.remarks && (
          <div style={styles.remarksBox}><strong>Faculty remarks:</strong> {transfer.remarks}</div>
        )}

        <div style={styles.historySection}>
          <div style={styles.historySectionTitle}>Office Movement History</div>
          {(transfer.officeHistory || []).map(h => (
            <div key={h.id} style={styles.historyEntry}>
              <span style={styles.historyEntryDate}>{h.at}</span>
              <span style={styles.historyEntryText}>
                {h.type === 'entry' && <>Entered office pipeline → <strong>{ROLE_LABEL[h.toRole]}</strong></>}
                {h.type === 'approval' && <><strong>{h.fromName}</strong> ({ROLE_LABEL[h.fromRole]}) escalated to <strong>{h.toName}</strong> ({ROLE_LABEL[h.toRole]})</>}
                {h.type === 'lateral' && <><strong>{h.fromName || 'Unassigned'}</strong> handed off to <strong>{h.toName}</strong> ({ROLE_LABEL[h.toRole]}, lateral)</>}
                {h.type === 'finalize' && <>Approved & finalized by <strong>{h.fromName}</strong> ({ROLE_LABEL[h.fromRole]})</>}
                {h.type === 'reject' && <>Rejected by <strong>{h.fromName}</strong> ({ROLE_LABEL[h.fromRole]})</>}
                {h.remarks ? <span style={styles.historyEntryRemarks}> — "{h.remarks}"</span> : null}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.modalFooter}>
        <button style={styles.modalCancelBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

// ─── Main component ─────────────────────────────────────────────────────
// Tab set depends on role, same convention as FreshSanction.jsx:
//   assistant / superintendent / deputy_director → New Requests, Transferred, Completed
//   director                                     → New Requests, Completed
const TABS_BY_ROLE = {
  assistant: [
    { key: 'new',         label: 'New Requests' },
    { key: 'transferred', label: 'Transferred' },
    { key: 'completed',   label: 'Completed' },
  ],
  superintendent: [
    { key: 'new',         label: 'New Requests' },
    { key: 'transferred', label: 'Transferred' },
    { key: 'completed',   label: 'Completed' },
  ],
  deputy_director: [
    { key: 'new',         label: 'New Requests' },
    { key: 'transferred', label: 'Transferred' },
    { key: 'completed',   label: 'Completed' },
  ],
  director: [
    { key: 'new',       label: 'New Requests' },
    { key: 'completed', label: 'Completed' },
  ],
};

const ROLE_ICON = {
  assistant: '🟢',
  superintendent: '🔵',
  deputy_director: '🟣',
  director: '🔴',
};

const ProjectTransferRequests = ({ onNavigate }) => {
  const [transfers, setTransfers] = useState([]);
  const role = userRole();
  const safeRole = ROLE_ORDER.includes(role) ? role : 'assistant';
  const tabs = TABS_BY_ROLE[safeRole] || TABS_BY_ROLE.assistant;

  const [activeTab, setActiveTab] = useState('new');

  const [processTransfer, setProcessTransfer] = useState(null);
  const [trackTransfer, setTrackTransfer] = useState(null);

  useEffect(() => {
    const raw = effectiveTransfers();
    const stamped = raw.map(withOfficeDefaults);
    setTransfers(stamped);
    // Only persist if real data existed or was just derived from it — this
    // does NOT permanently write the dummy set to localStorage, so it can
    // never get "stuck": next time real data shows up (e.g. from the
    // faculty page) it's picked up immediately since we always re-check
    // effectiveTransfers() on mount rather than trusting a stored flag.
    saveTransfers(stamped);
  }, []);

  // If the current role's tab set doesn't include the active tab (e.g. a
  // director previously left on "transferred" before role changed), fall
  // back to "new".
  useEffect(() => {
    if (!tabs.some(t => t.key === activeTab)) setActiveTab('new');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeRole]);

  const persist = (next) => { setTransfers(next); saveTransfers(next); };

  // ── New Requests: awaiting action at this role tier ──────────────────
  const newRequests = useMemo(() => transfers.filter(t =>
    t.status === 'accepted_by_faculty' && (t.officeStage || 'assistant') === safeRole
  ), [transfers, safeRole]);

  // ── Transferred: requests this role tier has forwarded onward ────────
  // (not shown to Director — director has no tier above to forward to)
  const transferredByMe = useMemo(() => transfers.filter(t =>
    (t.officeHistory || []).some(h => h.fromRole === safeRole && (h.type === 'approval' || h.type === 'lateral'))
  ), [transfers, safeRole]);

  // ── Completed: finalized transfers (visible to all office roles) ─────
  const completed = useMemo(() => transfers.filter(t =>
    t.status === 'approved_by_csrc' || t.status === 'rejected_by_csrc'
  ), [transfers]);

  // ── Actions ────────────────────────────────────────────────────────
  const handleApprovalTransfer = (transfer, selectedId, remarks) => {
    const upper = nextRole(safeRole);
    const toStaff = staffById(upper, selectedId);
    if (!toStaff) return;

    const fromStaff = currentStaffFor(safeRole);
    const historyEntry = {
      id: `oh_${transfer.id}_${Date.now()}`,
      at: todayStr(),
      fromRole: safeRole,
      fromName: fromStaff ? fromStaff.name : ROLE_LABEL[safeRole],
      toRole: upper,
      toName: toStaff.name,
      type: 'approval',
      remarks: remarks || '',
    };

    const next = transfers.map(t => t.id !== transfer.id ? t : {
      ...t,
      officeStage: upper,
      officeAssigneeId: toStaff.id,
      officeAssigneeName: toStaff.name,
      officeHistory: [...(t.officeHistory || []), historyEntry],
    });
    persist(next);
    setProcessTransfer(null);
  };

  const handleLateralTransfer = (transfer, selectedId, remarks) => {
    const toStaff = staffById(safeRole, selectedId);
    if (!toStaff) return;

    const fromStaff = currentStaffFor(safeRole);
    const historyEntry = {
      id: `oh_${transfer.id}_${Date.now()}`,
      at: todayStr(),
      fromRole: safeRole,
      fromName: fromStaff ? fromStaff.name : ROLE_LABEL[safeRole],
      toRole: safeRole,
      toName: toStaff.name,
      type: 'lateral',
      remarks: remarks || '',
    };

    const next = transfers.map(t => t.id !== transfer.id ? t : {
      ...t,
      officeAssigneeId: toStaff.id,
      officeAssigneeName: toStaff.name,
      officeHistory: [...(t.officeHistory || []), historyEntry],
    });
    persist(next);
    setProcessTransfer(null);
  };

  const handleFinalize = (transfer, remarks) => {
    const fromStaff = currentStaffFor('director');
    const historyEntry = {
      id: `oh_${transfer.id}_${Date.now()}`,
      at: todayStr(),
      fromRole: 'director',
      fromName: fromStaff ? fromStaff.name : 'Director',
      toRole: null,
      toName: null,
      type: 'finalize',
      remarks: remarks || '',
    };

    // Move the project between faculty holdings, same as the previous
    // temporary CSRC-approve logic that lived on the faculty page.
    const allProjects = effectiveProjects();
    const nextProjects = { ...allProjects };
    nextProjects[transfer.fromFacultyId] = (nextProjects[transfer.fromFacultyId] || [])
      .filter(p => p.id !== transfer.projectId);
    nextProjects[transfer.toFacultyId] = [
      ...(nextProjects[transfer.toFacultyId] || []),
      {
        id: transfer.projectId,
        fileNo: transfer.fileNo,
        title: transfer.title,
        cost: transfer.cost,
        fundingAgency: transfer.fundingAgency,
        period: transfer.period || '',
      },
    ];
    saveProjects(nextProjects);

    const next = transfers.map(t => t.id !== transfer.id ? t : {
      ...t,
      status: 'approved_by_csrc',
      csrcApprovedAt: todayStr(),
      officeHistory: [...(t.officeHistory || []), historyEntry],
    });
    persist(next);
    setProcessTransfer(null);
  };

  const handleReject = (transfer, remarks) => {
    const fromStaff = currentStaffFor(safeRole);
    const historyEntry = {
      id: `oh_${transfer.id}_${Date.now()}`,
      at: todayStr(),
      fromRole: safeRole,
      fromName: fromStaff ? fromStaff.name : ROLE_LABEL[safeRole],
      toRole: null,
      toName: null,
      type: 'reject',
      remarks: remarks || '',
    };

    const next = transfers.map(t => t.id !== transfer.id ? t : {
      ...t,
      status: 'rejected_by_csrc',
      csrcApprovedAt: todayStr(),
      officeHistory: [...(t.officeHistory || []), historyEntry],
    });
    persist(next);
    setProcessTransfer(null);
  };

  // ── Row renderers ─────────────────────────────────────────────────
  const renderNewRequestCard = (t) => (
    <div key={t.id} style={styles.reqCard}>
      <div style={styles.reqCardTop}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.reqFileNo}>{t.fileNo}</div>
          <div style={styles.reqTitle}>{t.title}</div>
          <div style={styles.reqMeta}>₹ {t.cost} · {t.fundingAgency}</div>
        </div>
        <StatusBadge t={t} />
      </div>

      <div style={styles.partiesRow}>
        <div style={styles.partyBox}>
          <div style={styles.partyLabel}>From (Current PI)</div>
          <div style={styles.partyName}>{t.fromFacultyName}</div>
          <div style={styles.partyDept}>{t.fromFacultyDept}</div>
        </div>
        <div style={styles.partyArrow}>→</div>
        <div style={styles.partyBox}>
          <div style={styles.partyLabel}>To (Incoming PI)</div>
          <div style={styles.partyName}>{t.toFacultyName}</div>
          <div style={styles.partyDept}>{t.toFacultyDept}</div>
        </div>
      </div>

      {t.remarks && <div style={styles.remarksBox}><strong>Faculty remarks:</strong> {t.remarks}</div>}

      <div style={styles.actionRow}>
        <button style={styles.letterBtn} onClick={() => viewLetterHtml(t.transferLetter)}>📄 View Transfer Letter</button>
      </div>

      <div style={styles.actionRow}>
        <button style={styles.processBtn} onClick={() => setProcessTransfer(t)}>Process Request →</button>
        <button style={styles.trackBtn} onClick={() => setTrackTransfer(t)}>View / Track</button>
      </div>
    </div>
  );

  const renderHistoryCard = (t) => (
    <div key={t.id} style={styles.historyCard}>
      <div style={styles.historyCardTop}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.historyProjTitle}>{t.title}</div>
          <div style={styles.historyMeta}>{t.fileNo} · {t.fromFacultyName} → {t.toFacultyName}</div>
        </div>
        <StatusBadge t={t} />
      </div>
      <OfficeTimeline t={t} />
      <div style={styles.actionRow}>
        <button style={styles.trackBtn} onClick={() => setTrackTransfer(t)}>View / Track</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLink} onClick={() => onNavigate && onNavigate('home')}>Home</span>
          <span style={styles.breadcrumbSep}>›</span>
          <span style={styles.breadcrumbLink} onClick={() => onNavigate && onNavigate('projects')}>Projects</span>
          <span style={styles.breadcrumbSep}>›</span>
          <span style={styles.breadcrumbCurrent}>Project Transfer Requests</span>
        </div>
        <h1 style={styles.title}>Project Transfer Requests</h1>
        <div style={styles.subtitle}>CSRC Office — Anna University</div>
      </div>

      {/* Logged-in identity strip (read-only, from real login) */}
      <div style={styles.identityBar}>
        <span style={styles.identityChip}>
          {ROLE_ICON[safeRole] || '🟢'}{' '}
          {userName()} <span style={styles.identityRole}>({ROLE_LABEL[safeRole]})</span>
        </span>
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            style={{ ...styles.tabBtn, ...(activeTab === tab.key ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === 'new' && newRequests.length > 0 && (
              <span style={styles.tabBadge}>{newRequests.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={styles.tabContent}>
        {activeTab === 'new' && (
          newRequests.length === 0 ? (
            <div style={styles.emptyBox}>No pending transfer requests at the {ROLE_LABEL[safeRole]} level.</div>
          ) : (
            <div style={styles.reqGrid}>{newRequests.map(renderNewRequestCard)}</div>
          )
        )}

        {activeTab === 'transferred' && safeRole !== 'director' && (
          transferredByMe.length === 0 ? (
            <div style={styles.emptyBox}>No requests forwarded by the {ROLE_LABEL[safeRole]} tier yet.</div>
          ) : (
            <div style={styles.historyList}>{transferredByMe.map(renderHistoryCard)}</div>
          )
        )}

        {activeTab === 'completed' && (
          completed.length === 0 ? (
            <div style={styles.emptyBox}>No completed transfer requests yet.</div>
          ) : (
            <div style={styles.historyList}>{completed.map(renderHistoryCard)}</div>
          )
        )}
      </div>

      {/* Modals */}
      {processTransfer && (
        <ProcessModal
          transfer={processTransfer}
          viewingRole={safeRole}
          onClose={() => setProcessTransfer(null)}
          onApprovalTransfer={handleApprovalTransfer}
          onLateralTransfer={handleLateralTransfer}
          onFinalize={handleFinalize}
          onReject={handleReject}
        />
      )}

      {trackTransfer && (
        <TrackModal transfer={trackTransfer} onClose={() => setTrackTransfer(null)} />
      )}
    </div>
  );
};

// ─── Light theme styles (matches faculty-side ProjectTransfer.jsx) ────────
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f7f8fb',
    padding: '28px 32px 60px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#1f2937',
  },

  header: { marginBottom: 18 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9ca3af', marginBottom: 10 },
  breadcrumbLink: { cursor: 'pointer' },
  breadcrumbSep: { opacity: 0.5 },
  breadcrumbCurrent: { color: '#374151', fontWeight: 600 },
  title: { fontSize: 26, fontWeight: 700, margin: 0, color: '#111827' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4 },

  identityBar: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, flexWrap: 'wrap',
  },
  identityChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
    background: '#f3f4f6', color: '#1f2937', border: '1px solid #e5e7eb',
  },
  identityRole: { fontWeight: 500, color: '#6b7280' },

  tabsRow: { display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e5e7eb' },
  tabBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', border: 'none', background: 'transparent',
    fontSize: 13.5, fontWeight: 600, color: '#6b7280', cursor: 'pointer',
    borderBottom: '2px solid transparent', marginBottom: -1,
  },
  tabBtnActive: { color: '#7c3aed', borderBottom: '2px solid #7c3aed' },
  tabBadge: {
    background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700,
    borderRadius: 999, padding: '1px 7px', minWidth: 18, textAlign: 'center',
  },

  tabContent: { minHeight: 200 },

  emptyBox: {
    padding: '30px 14px', textAlign: 'center', color: '#9ca3af',
    fontSize: 13.5, background: '#fafafa', borderRadius: 10, border: '1px dashed #e5e7eb',
  },

  reqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 },
  reqCard: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
    padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  reqCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  reqFileNo: { fontSize: 11.5, color: '#9ca3af', fontWeight: 600 },
  reqTitle: { fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 2, lineHeight: 1.35 },
  reqMeta: { fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 },

  partiesRow: {
    display: 'flex', alignItems: 'center', gap: 10, marginTop: 14,
    background: '#f9fafb', border: '1px solid #eef0f2', borderRadius: 10, padding: '10px 12px',
  },
  partyBox: { flex: 1, minWidth: 0 },
  partyLabel: { fontSize: 10.5, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 },
  partyName: { fontSize: 12.5, fontWeight: 700, color: '#1f2937', marginTop: 2 },
  partyDept: { fontSize: 11.5, color: '#6b7280', marginTop: 1 },
  partyArrow: { fontSize: 16, color: '#9ca3af', flexShrink: 0 },

  remarksBox: {
    marginTop: 12, fontSize: 12.5, color: '#4b5563', background: '#f3f4f6',
    borderRadius: 8, padding: '8px 12px', lineHeight: 1.5,
  },

  actionRow: { display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  letterBtn: {
    padding: '7px 14px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff',
    color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  processBtn: {
    padding: '8px 18px', borderRadius: 8, border: 'none', background: '#7c3aed',
    color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
  },
  trackBtn: {
    padding: '8px 18px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff',
    color: '#374151', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },

  historyList: { display: 'flex', flexDirection: 'column', gap: 14 },
  historyCard: {
    border: '1px solid #eef0f2', borderRadius: 12, padding: '14px 16px', background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  historyCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  historyProjTitle: {
    fontSize: 13.5, fontWeight: 700, color: '#1f2937', maxWidth: 420,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  historyMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  timelineRow: { display: 'flex', alignItems: 'center', marginTop: 14, marginBottom: 2 },
  timelineStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 84 },
  timelineDot: { width: 14, height: 14, borderRadius: '50%', border: '2px solid', flexShrink: 0 },
  timelineLabel: { fontSize: 10, textAlign: 'center', fontWeight: 600 },
  timelineBar: { flex: 1, height: 2, marginTop: -18 },

  historySection: { marginTop: 18 },
  historySectionTitle: { fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 8 },
  historyEntry: { display: 'flex', gap: 10, fontSize: 12, color: '#4b5563', padding: '6px 0', borderBottom: '1px dashed #eef0f2' },
  historyEntryDate: { color: '#9ca3af', flexShrink: 0, width: 76 },
  historyEntryText: { flex: 1 },
  historyEntryRemarks: { color: '#6b7280', fontStyle: 'italic' },

  // Modal (shared style language with faculty-side page)
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    width: 480, maxWidth: '92vw', maxHeight: '88vh', overflowY: 'auto',
    background: '#fff', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid #f1f2f4', fontSize: 15, fontWeight: 700, color: '#111827',
    position: 'sticky', top: 0, background: '#fff', zIndex: 1,
  },
  modalClose: { border: 'none', background: 'transparent', fontSize: 16, cursor: 'pointer', color: '#9ca3af' },
  modalBody: { padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 },
  modalProjectBox: {
    background: '#f9fafb', border: '1px solid #eef0f2', borderRadius: 10,
    padding: '12px 14px', marginBottom: 12,
  },
  modalProjectFile: { fontSize: 11.5, color: '#9ca3af', fontWeight: 600 },
  modalProjectTitle: { fontSize: 13.5, fontWeight: 600, color: '#1f2937', marginTop: 2 },
  modalProjectCost: { fontSize: 12.5, color: '#059669', fontWeight: 600, marginTop: 4 },
  modalProjectParties: { fontSize: 12, color: '#4b5563', marginTop: 6 },
  modalLabel: { fontSize: 12.5, fontWeight: 600, color: '#374151', marginTop: 10, marginBottom: 6 },
  modalSelect: {
    padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db',
    fontSize: 13, color: '#1f2937', background: '#fff',
  },
  modalTextarea: {
    padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db',
    fontSize: 13, color: '#1f2937', resize: 'vertical', fontFamily: 'inherit',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: 10,
    padding: '14px 20px', borderTop: '1px solid #f1f2f4', background: '#fafbfc',
    position: 'sticky', bottom: 0,
  },
  modalCancelBtn: {
    padding: '9px 18px', borderRadius: 9, border: '1px solid #d1d5db',
    background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  modalSubmitBtn: {
    padding: '9px 18px', borderRadius: 9, border: 'none',
    color: '#fff', fontSize: 13, fontWeight: 600,
  },

  modeChoices: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 },
  modeBtnApproval: {
    padding: '12px 16px', borderRadius: 10, border: '1px solid #bbf7d0', background: '#f0fdf4',
    color: '#166534', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
  },
  modeBtnLateral: {
    padding: '12px 16px', borderRadius: 10, border: '1px solid #bfdbfe', background: '#eff6ff',
    color: '#1e40af', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
  },
  modeBtnReject: {
    padding: '12px 16px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2',
    color: '#991b1b', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
  },
  finalizeNote: {
    fontSize: 12.5, color: '#374151', background: '#f9fafb', border: '1px solid #eef0f2',
    borderRadius: 9, padding: '10px 12px', lineHeight: 1.5, marginTop: 4,
  },
};

export default ProjectTransferRequests;