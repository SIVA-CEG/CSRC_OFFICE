// src_revenue/utils/staffWorkflow.js
// ─────────────────────────────────────────────────────────────────────────
// Lightweight mock backend for the Staff Details module.
//
// UPDATED: Assistant submissions (appointment / extension / resignation)
// are now applied immediately — status 'approved' at creation, and the
// staff record change (addStaff / extend / resign) happens right away
// inside submitRequest(). Superintendent / Deputy Director / Director
// logins remain read-only viewers via the same pages; approveRequest() is
// kept for backward compatibility but is never reached in normal use.
// ─────────────────────────────────────────────────────────────────────────

const STAFF_KEY = 'csrc_revenue_staff_v3';
const REQUESTS_KEY = 'csrc_revenue_requests_v1';

export const ROLES = ['assistant', 'superintendent', 'deputy_director', 'director'];
export const APPROVAL_CHAIN = ['superintendent', 'deputy_director', 'director'];

export const ROLE_LABELS = {
  assistant: 'Assistant',
  superintendent: 'Superintendent',
  deputy_director: 'Deputy Director',
  director: 'Director',
};

export const STATUS_LABELS = {
  active: 'Present',
  extended: 'Extended',
  resigned: 'Resigned',
};

export const REQUEST_TYPE_LABELS = {
  appointment: 'New Appointment',
  extension: 'Extension',
  resignation: 'Resignation',
};

/* ---------------------------------------------------------------------- */
/* low level storage helpers — sessionStorage backed                      */
/* ---------------------------------------------------------------------- */
function read(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* no-op — storage unavailable */
  }
}

/* ---------------------------------------------------------------------- */
/* seed data (mirrors the sample master sheet)                            */
/* ---------------------------------------------------------------------- */
const SEED_STAFF = [
  {
    id: 'stf_006',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '2',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Prabhu',
    lastName: 'S',
    designation: 'Office Assistant',
    mobile: '9000000002',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'prabhu.s.csrc@gmail.com',
    dob: '1990-01-15',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/002/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'State Bank of India',
    bankAccountNumber: '3000000000002',
    ifscCode: 'SBIN0000002',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_007',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '3',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Gangadurai',
    lastName: 'E',
    designation: 'Office Assistant',
    mobile: '9000000003',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'gangadurai.e.csrc@gmail.com',
    dob: '1988-03-20',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/003/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'Indian Bank',
    bankAccountNumber: '3000000000003',
    ifscCode: 'IDIB000C003',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_008',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '4',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Magesh Kumar',
    lastName: 'N',
    designation: 'Office Assistant',
    mobile: '9000000004',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'mageshkumar.n.csrc@gmail.com',
    dob: '1992-05-11',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/004/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'Canara Bank',
    bankAccountNumber: '3000000000004',
    ifscCode: 'CNRB0000004',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_009',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '7',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Venkatesha',
    lastName: 'R',
    designation: 'Office Assistant',
    mobile: '9000000007',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'venkatesha.r.csrc@gmail.com',
    dob: '1985-07-09',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/007/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'City Union Bank',
    bankAccountNumber: '3000000000007',
    ifscCode: 'CIUB0000007',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_010',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '8',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Paranthaman',
    lastName: 'K',
    designation: 'Office Assistant',
    mobile: '9000000008',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'paranthaman.k.csrc@gmail.com',
    dob: '1983-09-30',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/008/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'State Bank of India',
    bankAccountNumber: '3000000000008',
    ifscCode: 'SBIN0000008',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_011',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '10',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Vinoth Kumar',
    lastName: 'V',
    designation: 'Office Assistant',
    mobile: '9000000010',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'vinothkumar.v.csrc@gmail.com',
    dob: '1994-02-18',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/010/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'Indian Bank',
    bankAccountNumber: '3000000000010',
    ifscCode: 'IDIB000C010',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_012',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '11',
    appellation: 'Selvi',
    gender: 'Female',
    firstName: 'Agalya',
    lastName: 'M',
    designation: 'Office Assistant',
    mobile: '9000000011',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'agalya.m.csrc@gmail.com',
    dob: '1997-11-02',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/011/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'Canara Bank',
    bankAccountNumber: '3000000000011',
    ifscCode: 'CNRB0000011',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_013',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '18',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Syed Irfan',
    lastName: 'S.I',
    designation: 'Office Assistant',
    mobile: '9000000018',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'syedirfan.si.csrc@gmail.com',
    dob: '1989-04-25',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/018/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'City Union Bank',
    bankAccountNumber: '3000000000018',
    ifscCode: 'CIUB0000018',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_014',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '20',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Thomas Edwin',
    lastName: 'T',
    designation: 'Office Assistant',
    mobile: '9000000020',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'thomasedwin.t.csrc@gmail.com',
    dob: '1986-08-14',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/020/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'State Bank of India',
    bankAccountNumber: '3000000000020',
    ifscCode: 'SBIN0000020',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_015',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '21',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Murali',
    lastName: 'D',
    designation: 'Office Assistant',
    mobile: '9000000021',
    staffType: 'Temporary',
    tenureFrom: '2025-01-01',
    tenureTo: '2026-12-31',
    email: 'murali.d.csrc@gmail.com',
    dob: '1991-12-06',
    doj: '2024-01-01',
    allotmentYear: '2024',
    orderNumber: 'DUMMY/OA/021/2024',
    orderDate: '2024-01-01',
    salaryType: 'Daily Wages',
    bankName: 'Indian Bank',
    bankAccountNumber: '3000000000021',
    ifscCode: 'IDIB000C021',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
];

function seedIfEmpty() {
  if (!read(STAFF_KEY, null)) write(STAFF_KEY, SEED_STAFF);
  if (!read(REQUESTS_KEY, null)) write(REQUESTS_KEY, []);
}
seedIfEmpty();

/* ---------------------------------------------------------------------- */
/* staff records                                                          */
/* ---------------------------------------------------------------------- */
export function getStaffList() {
  return read(STAFF_KEY, []);
}

export function getStaffById(id) {
  return getStaffList().find((s) => s.id === id) || null;
}

function saveStaffList(list) {
  write(STAFF_KEY, list);
}

export function updateStaff(id, updates) {
  const list = getStaffList();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  saveStaffList(list);
  return list[idx];
}

export function addStaff(record) {
  const list = getStaffList();
  const newRecord = {
    id: `stf_${Date.now()}`,
    extensionHistory: [],
    resignation: null,
    documents: {},
    status: 'active',
    ...record,
  };
  list.unshift(newRecord);
  saveStaffList(list);
  return newRecord;
}

// Counts used by the Staff Details filter chips (Present / Extended / Resigned)
export function getStatusCounts() {
  const list = getStaffList();
  return list.reduce(
    (acc, s) => {
      acc.all += 1;
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    { all: 0, active: 0, extended: 0, resigned: 0 }
  );
}

/* ---------------------------------------------------------------------- */
/* requests — Assistant submits, applied immediately                      */
/* ---------------------------------------------------------------------- */
export function getRequests() {
  return read(REQUESTS_KEY, []);
}

function saveRequests(list) {
  write(REQUESTS_KEY, list);
}

export function getPendingForRole(role, type) {
  return getRequests().filter(
    (r) => r.status === `pending_${role}` && (!type || r.type === type)
  );
}

// Count of pending items waiting on this role — will always be 0 now,
// since submitRequest() no longer leaves anything pending. Kept so the
// badge code elsewhere doesn't need to change.
export function getPendingCountForRole(role, type) {
  return getPendingForRole(role, type).length;
}

export function getRequestsByType(type) {
  return getRequests()
    .filter((r) => r.type === type)
    .sort((a, b) => new Date(b.createdBy.date) - new Date(a.createdBy.date));
}

export function getRequestById(id) {
  return getRequests().find((r) => r.id === id) || null;
}

function applyApprovedRequest(req) {
  if (req.type === 'appointment') {
    addStaff({ ...req.data, status: 'active', documents: req.documents });
  } else if (req.type === 'extension') {
    const staff = getStaffById(req.staffId);
    if (staff) {
      const historyEntry = {
        from: req.data.extensionFrom,
        to: req.data.extensionTo,
        approvedOn: new Date().toISOString(),
        documents: req.documents,
      };
      updateStaff(req.staffId, {
        status: 'extended',
        tenureFrom: req.data.extensionFrom,
        tenureTo: req.data.extensionTo,
        extensionHistory: [...(staff.extensionHistory || []), historyEntry],
      });
    }
  } else if (req.type === 'resignation') {
    updateStaff(req.staffId, {
      status: 'resigned',
      resignation: {
        date: req.data.resignationDate,
        documents: req.documents,
      },
    });
  }
}

// actor = { role, name }
// UPDATED: request is created already 'approved' and its effect on the
// staff record is applied immediately — the Assistant needs no sign-off.
export function submitRequest(type, data, documents, actor) {
  const requests = getRequests();
  const req = {
    id: `REQ-${Date.now()}`,
    type, // 'appointment' | 'extension' | 'resignation'
    staffId: data.staffId || null,
    data,
    documents,
    status: 'approved',
    currentStepIndex: APPROVAL_CHAIN.length,
    history: [
      {
        role: actor.role,
        name: actor.name,
        action: 'submitted',
        date: new Date().toISOString(),
        comment: 'Submitted and applied directly by Assistant',
      },
    ],
    createdBy: { ...actor, date: new Date().toISOString() },
  };
  applyApprovedRequest(req);
  requests.unshift(req);
  saveRequests(requests);
  return req;
}

// Kept for backward compatibility — unreachable in normal use since
// submitRequest() now applies everything immediately.
export function approveRequest(id, actor, editedData, comment) {
  const requests = getRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const req = requests[idx];

  if (editedData) req.data = { ...req.data, ...editedData };

  req.history.push({
    role: actor.role,
    name: actor.name,
    action: 'approved',
    date: new Date().toISOString(),
    comment: comment || 'Approved',
  });

  const nextIndex = req.currentStepIndex + 1;
  if (nextIndex >= APPROVAL_CHAIN.length) {
    req.status = 'approved';
    req.currentStepIndex = nextIndex;
    applyApprovedRequest(req);
  } else {
    req.currentStepIndex = nextIndex;
    req.status = `pending_${APPROVAL_CHAIN[nextIndex]}`;
  }

  requests[idx] = req;
  saveRequests(requests);
  return req;
}

export function rejectRequest(id, actor, comment) {
  const requests = getRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const req = requests[idx];
  req.status = 'rejected';
  req.history.push({
    role: actor.role,
    name: actor.name,
    action: 'rejected',
    date: new Date().toISOString(),
    comment: comment || 'Rejected',
  });
  requests[idx] = req;
  saveRequests(requests);
  return req;
}

/* ---------------------------------------------------------------------- */
/* role / step helpers (used by the approval UI on each workflow page)    */
/* ---------------------------------------------------------------------- */

// Is `role` an approver at all (i.e. not the assistant, who only creates)?
export function isApproverRole(role) {
  return APPROVAL_CHAIN.includes(role);
}

// Given a request, is it currently sitting with `role` for action?
export function isActionableByRole(req, role) {
  return req.status === `pending_${role}`;
}

// Human label for "who has this now" — used in request list/badges.
export function currentHolderLabel(req) {
  if (req.status === 'approved') return 'Completed';
  if (req.status === 'rejected') return 'Rejected';
  const role = req.status.replace('pending_', '');
  return `Awaiting ${ROLE_LABELS[role] || role}`;
}

/* ---------------------------------------------------------------------- */
/* misc helpers                                                           */
/* ---------------------------------------------------------------------- */
export function getCurrentActor() {
  return {
    role: sessionStorage.getItem('userRole') || 'assistant',
    name: sessionStorage.getItem('userName') || 'Unknown User',
  };
}

export function fileToMeta(file) {
  if (!file) return null;
  return { name: file.name, size: file.size, type: file.type };
}

export function fullName(person) {
  if (!person) return '';
  return [person.appellation, person.firstName, person.lastName].filter(Boolean).join(' ');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}