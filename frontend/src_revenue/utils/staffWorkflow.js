// src_revenue/utils/staffWorkflow.js
// ─────────────────────────────────────────────────────────────────────────
// Lightweight mock backend for the Staff Details module.
// Persists to sessionStorage (per-tab, cleared when the tab/browser closes —
// swapped over from localStorage so nothing lingers across sessions) so the
// four-tier approval workflow —
//   assistant → superintendent → deputy_director → director
// — survives refreshes within a session and is shared across role logins
// on this tab. Swap the read()/write() internals for real API calls once
// the backend is ready; every exported function signature can stay the same.
// ─────────────────────────────────────────────────────────────────────────

const STAFF_KEY = 'csrc_revenue_staff_v2';
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
    id: 'stf_001',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '64548',
    appellation: 'Tmt',
    gender: 'Female',
    firstName: 'Cholarani',
    lastName: 'P',
    designation: 'Superintendent',
    mobile: '8056000000',
    staffType: 'Regular',
    tenureFrom: '',
    tenureTo: '2035-04-30',
    email: 'cholarani0404@tn.gov.in',
    dob: '1975-04-04',
    doj: '2009-04-15',
    allotmentYear: '2009',
    orderNumber: '031/PR33/2009',
    orderDate: '2009-05-11',
    salaryType: 'Consolidated Pay',
    bankName: 'State Bank of India',
    bankAccountNumber: '30456789012',
    ifscCode: 'SBIN0001234',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_002',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '68743',
    appellation: 'Tmt',
    gender: 'Female',
    firstName: 'Bhavani',
    lastName: 'M',
    designation: 'Assistant',
    mobile: '9884000000',
    staffType: 'Regular',
    tenureFrom: '',
    tenureTo: '2045-02-28',
    email: 'bhavani2402@tn.gov.in',
    dob: '1984-02-24',
    doj: '2013-09-03',
    allotmentYear: '2013',
    orderNumber: '001/PR33/2013',
    orderDate: '2013-09-02',
    salaryType: 'Consolidated Pay',
    bankName: 'Indian Bank',
    bankAccountNumber: '685412309876',
    ifscCode: 'IDIB000C154',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_003',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '800700',
    appellation: 'Tmt',
    gender: 'Female',
    firstName: 'Shobana Banu',
    lastName: 'P.K.',
    designation: 'Application Programmer',
    mobile: '9630000000',
    staffType: 'Temporary',
    tenureFrom: '2024-09-05',
    tenureTo: '2025-02-28',
    email: 'pkshobi@gmail.com',
    dob: '1991-06-25',
    doj: '2015-09-02',
    allotmentYear: '2015',
    orderNumber: '2425IN0124/CSRC',
    orderDate: '2024-09-05',
    salaryType: 'Daily Wages',
    bankName: 'Canara Bank',
    bankAccountNumber: '1123456789012',
    ifscCode: 'CNRB0001987',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_004',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '800676',
    appellation: 'Tmt',
    gender: 'Female',
    firstName: 'Sorna Jenefa',
    lastName: 'J',
    designation: 'Project Associate I',
    mobile: '8221000000',
    staffType: 'Temporary',
    tenureFrom: '2024-07-08',
    tenureTo: '2025-03-01',
    email: 'jenectdt@gmail.com',
    dob: '1996-07-23',
    doj: '2023-07-03',
    allotmentYear: '2023',
    orderNumber: '2425IN0080/CSRC',
    orderDate: '2024-07-08',
    salaryType: 'Daily Wages',
    bankName: 'City Union Bank',
    bankAccountNumber: '500123456789',
    ifscCode: 'CIUB0000045',
    status: 'active',
    extensionHistory: [],
    resignation: null,
    documents: {},
  },
  {
    id: 'stf_005',
    department: 'Centre for Sponsored Research and Consultancy',
    employeeCode: '800674',
    appellation: 'Thiru',
    gender: 'Male',
    firstName: 'Sridhar',
    lastName: 'M',
    designation: 'Peon',
    mobile: '9551000000',
    staffType: 'Temporary',
    tenureFrom: '2024-11-07',
    tenureTo: '2025-04-30',
    email: 'angeline08@gmail.com',
    dob: '1981-07-01',
    doj: '2002-06-01',
    allotmentYear: '2002',
    orderNumber: '351/DW/PR30/2024',
    orderDate: '2024-10-24',
    salaryType: 'Daily Wages with Rate Factor',
    bankName: 'State Bank of India',
    bankAccountNumber: '30987654321',
    ifscCode: 'SBIN0004567',
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
/* requests / four-tier approval workflow                                 */
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

// Count of pending items waiting on this role, across all 3 request types.
// Used to badge the Extension / Resignation / New Appointment cards.
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

// actor = { role, name }
export function submitRequest(type, data, documents, actor) {
  const requests = getRequests();
  const req = {
    id: `REQ-${Date.now()}`,
    type, // 'appointment' | 'extension' | 'resignation'
    staffId: data.staffId || null,
    data,
    documents,
    status: `pending_${APPROVAL_CHAIN[0]}`,
    currentStepIndex: 0,
    history: [
      {
        role: actor.role,
        name: actor.name,
        action: 'submitted',
        date: new Date().toISOString(),
        comment: 'Submitted for approval',
      },
    ],
    createdBy: { ...actor, date: new Date().toISOString() },
  };
  requests.unshift(req);
  saveRequests(requests);
  return req;
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

// actor = { role, name }; editedData optional partial overrides for req.data
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