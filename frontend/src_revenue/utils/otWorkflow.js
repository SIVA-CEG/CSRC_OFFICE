// src_revenue/utils/otWorkflow.js
// ─────────────────────────────────────────────────────────────────────────
// Mock backend for the Staff OT module. Mirrors salaryWorkflow.js:
//   1. OT Structure  — rate per hour, per designation
//   2. OT Entries     — manually entered daily rows per staff (In/Out time,
//                        OT before/after office hours, total hours/day)
//   3. OT Sanctions   — month-end summary per staff, routed through the
//                        same 4-tier approval chain as Salary
//   4. OT Reports     — the same sanction batches, browsed / filtered
// ─────────────────────────────────────────────────────────────────────────

import {
  getStaffList,
  fullName,
  formatDate,
  getCurrentActor,
  APPROVAL_CHAIN,
  ROLE_LABELS,
  isApproverRole,
} from './staffWorkflow';

const OT_STRUCTURE_KEY = 'csrc_revenue_ot_structure_v1';
const OT_ENTRIES_KEY = 'csrc_revenue_ot_entries_v1';
const OT_SANCTIONS_KEY = 'csrc_revenue_ot_sanctions_v1';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export { getCurrentActor, isApproverRole, ROLE_LABELS, APPROVAL_CHAIN, fullName, formatDate };

/* ---------------------------------------------------------------------- */
/* low level storage — localStorage backed (shared across tabs)           */
/* ---------------------------------------------------------------------- */
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* no-op — storage unavailable */
  }
}
function seedIfEmpty() {
  if (!read(OT_STRUCTURE_KEY, null)) write(OT_STRUCTURE_KEY, {});
  if (!read(OT_ENTRIES_KEY, null)) write(OT_ENTRIES_KEY, []);
  if (!read(OT_SANCTIONS_KEY, null)) write(OT_SANCTIONS_KEY, []);
}
seedIfEmpty();

/* ---------------------------------------------------------------------- */
/* small utils                                                            */
/* ---------------------------------------------------------------------- */
export function round2(n) {
  const v = Number(n) || 0;
  return Math.round((v + Number.EPSILON) * 100) / 100;
}
export function formatCurrency(n) {
  const v = Number(n) || 0;
  return `Rs. ${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ---------------------------------------------------------------------- */
/* 1. OT Structure                                                        */
/* ---------------------------------------------------------------------- */
function defaultOTStructure() {
  return { ratePerHour: 125 };
}
export function getOTStructure() {
  return read(OT_STRUCTURE_KEY, {});
}
export function getOTStructureForDesignation(designation) {
  const all = getOTStructure();
  return all[designation] ? { ...defaultOTStructure(), ...all[designation] } : defaultOTStructure();
}
export function updateOTStructureForDesignation(designation, updates) {
  const all = getOTStructure();
  const current = all[designation] || defaultOTStructure();
  const merged = { ...current, ...updates };
  all[designation] = merged;
  write(OT_STRUCTURE_KEY, all);
  return merged;
}
export function getAllDesignations() {
  const fromStaff = getStaffList().map((s) => s.designation).filter(Boolean);
  const fromStructure = Object.keys(getOTStructure());
  return Array.from(new Set([...fromStaff, ...fromStructure])).sort((a, b) => a.localeCompare(b));
}

/* ---------------------------------------------------------------------- */
/* 2. OT Entries (daily, manually entered)                                */
/* ---------------------------------------------------------------------- */
// entry = { id, staffId, month, year, date: 'YYYY-MM-DD', inTime, outTime,
//           otBeforeOfficeHours, otAfterOfficeHours, totalHoursForDay, remarks }
export function getOTEntries() {
  return read(OT_ENTRIES_KEY, []);
}
function saveOTEntriesRaw(list) {
  write(OT_ENTRIES_KEY, list);
}
export function getOTEntriesForStaffMonth(staffId, month, year) {
  return getOTEntries()
    .filter((e) => e.staffId === staffId && e.month === month && String(e.year) === String(year))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}
export function getOTEntriesForMonth(month, year) {
  return getOTEntries().filter((e) => e.month === month && String(e.year) === String(year));
}
// Bulk-replaces every row for one staff+month in a single write — spreadsheet-style save.
export function saveOTEntriesForStaffMonth(staffId, month, year, rows) {
  const others = getOTEntries().filter(
    (e) => !(e.staffId === staffId && e.month === month && String(e.year) === String(year))
  );
  const cleaned = rows
    .filter((r) => r.date)
    .map((r, i) => ({
      id: r.id || `OTE-${staffId}-${r.date}-${Date.now()}-${i}`,
      staffId,
      month,
      year: String(year),
      date: r.date,
      inTime: r.inTime || '',
      outTime: r.outTime || '',
      otBeforeOfficeHours: r.otBeforeOfficeHours || '0:00',
      otAfterOfficeHours: r.otAfterOfficeHours || '0:00',
      totalHoursForDay: Number(r.totalHoursForDay || 0),
      remarks: r.remarks || '',
    }));
  saveOTEntriesRaw([...others, ...cleaned]);
  return cleaned;
}

/* ---------------------------------------------------------------------- */
/* 3. OT Sanctions (approval workflow) + reports                          */
/* ---------------------------------------------------------------------- */
export function getOTSanctions() {
  return read(OT_SANCTIONS_KEY, []);
}
function saveOTSanctions(list) {
  write(OT_SANCTIONS_KEY, list);
}
export function getOTSanctionById(id) {
  return getOTSanctions().find((r) => r.id === id) || null;
}

// Summarizes every staff member with OT entries in a given month.
// Rate is always pulled live from OT Structure — never cached — same
// read-only-from-structure rule as Salary.
export function buildOTSummaryForMonth(month, year) {
  const staffList = getStaffList();
  const entries = getOTEntriesForMonth(month, year);
  const byStaff = {};
  entries.forEach((e) => {
    if (!byStaff[e.staffId]) byStaff[e.staffId] = [];
    byStaff[e.staffId].push(e);
  });

  return Object.keys(byStaff)
    .map((staffId) => {
      const staff = staffList.find((s) => s.id === staffId);
      if (!staff) return null;
      const structure = getOTStructureForDesignation(staff.designation);
      const days = byStaff[staffId].slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      const totalHours = days.reduce((sum, d) => sum + Number(d.totalHoursForDay || 0), 0);
      const ratePerHour = structure.ratePerHour;
      const totalAmount = round2(totalHours * ratePerHour);
      return {
        staffId: staff.id,
        staffName: fullName(staff),
        designation: staff.designation,
        employeeCode: staff.employeeCode,
        bankName: staff.bankName,
        bankAccountNumber: staff.bankAccountNumber,
        ifscCode: staff.ifscCode,
        ratePerHour,
        totalHours,
        totalAmount,
        days,
      };
    })
    .filter(Boolean);
}

// True if this staff member already has an active (non-rejected) OT
// sanction for this month — used to warn against double-sanctioning.
export function isMonthAlreadySanctioned(month, year, staffId) {
  return getOTSanctions().some(
    (r) =>
      r.month === month &&
      String(r.year) === String(year) &&
      r.status !== 'rejected' &&
      r.entries.some((e) => e.staffId === staffId)
  );
}

// payload = { month, year, procNo, entries } — entries from buildOTSummaryForMonth
export function submitOTSanction(payload, actor) {
  const list = getOTSanctions();
  const totalAmount = round2(payload.entries.reduce((sum, e) => sum + e.totalAmount, 0));
  const req = {
    id: `OT-${Date.now()}`,
    month: payload.month,
    year: payload.year,
    procNo: payload.procNo || '',
    entries: payload.entries,
    totalAmount,
    status: 'approved',
    currentStepIndex: APPROVAL_CHAIN.length,
    approvedDate: new Date().toISOString(),
    history: [
      {
        role: actor.role,
        name: actor.name,
        action: 'submitted',
        date: new Date().toISOString(),
        comment: 'Sanctioned directly by Assistant',
      },
    ],
    createdBy: { ...actor, date: new Date().toISOString() },
  };
  list.unshift(req);
  saveOTSanctions(list);
  return req;
}

export function getOTSanctionsByStatusForRole(role) {
  return getOTSanctions().filter((r) => r.status === `pending_${role}`);
}
export function getOTSanctionPendingCount(role) {
  return getOTSanctionsByStatusForRole(role).length;
}

export function approveOTSanction(id, actor, comment) {
  const list = getOTSanctions();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const req = list[idx];

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
    req.approvedDate = new Date().toISOString();
  } else {
    req.currentStepIndex = nextIndex;
    req.status = `pending_${APPROVAL_CHAIN[nextIndex]}`;
  }

  list[idx] = req;
  saveOTSanctions(list);
  return req;
}

export function rejectOTSanction(id, actor, comment) {
  const list = getOTSanctions();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const req = list[idx];
  req.status = 'rejected';
  req.history.push({
    role: actor.role,
    name: actor.name,
    action: 'rejected',
    date: new Date().toISOString(),
    comment: comment || 'Rejected',
  });
  list[idx] = req;
  saveOTSanctions(list);
  return req;
}

export function currentOTSanctionHolderLabel(req) {
  if (req.status === 'approved') return 'Completed';
  if (req.status === 'rejected') return 'Rejected';
  const role = req.status.replace('pending_', '');
  return `Awaiting ${ROLE_LABELS[role] || role}`;
}

export function getAllOTReports() {
  return getOTSanctions()
    .slice()
    .sort((a, b) => new Date(b.createdBy.date) - new Date(a.createdBy.date));
}