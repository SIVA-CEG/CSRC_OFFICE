// src_revenue/utils/salaryWorkflow.js
// ─────────────────────────────────────────────────────────────────────────
// Lightweight mock backend for the Staff Salary module.
// Sits alongside staffWorkflow.js and re-uses its storage pattern
// (sessionStorage, per-tab) plus its actor / approval-chain helpers so the
// same four-tier approval —
//   assistant → superintendent → deputy_director → director
// — is shared across Staff Details and Staff Salary.
//
// Three concerns live here:
//   1. Salary Structure  — base pay per designation, per salary type
//   2. Salary Sanctions   — a batch of staff picked for a month, routed
//                            through the approval chain
//   3. Salary Reports     — the same sanction batches, browsed / filtered /
//                            exported once (or before) they are approved
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

const STRUCTURE_KEY = 'csrc_revenue_salary_structure_v1';
const SANCTIONS_KEY = 'csrc_revenue_salary_sanctions_v1';

export const SALARY_TYPES = [
  'Consolidated Pay',
  'Daily Wages',
  'Daily Wages with Rate Factor',
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// re-export so pages only need to import from one place
export { getCurrentActor, isApproverRole, ROLE_LABELS, APPROVAL_CHAIN, fullName, formatDate };

/* ---------------------------------------------------------------------- */
/* low level storage helpers — sessionStorage backed                      */
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
  if (!read(STRUCTURE_KEY, null)) write(STRUCTURE_KEY, {});
  if (!read(SANCTIONS_KEY, null)) write(SANCTIONS_KEY, []);
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

export function salaryTypeAccentKey(type) {
  if (type === 'Consolidated Pay') return 'indigo';
  if (type === 'Daily Wages') return 'amber';
  return 'rose'; // Daily Wages with Rate Factor
}

/* ---------------------------------------------------------------------- */
/* 1. Salary Structure                                                    */
/* ---------------------------------------------------------------------- */
function defaultStructure() {
  return {
    consolidatedPay: { amount: 15000 },
    dailyWages: { wagePerDay: 500, incentivePerDay: 500 },
    dailyWagesRateFactor: { wagePerDay: 500, rateFactor: 1.15, incentiveRateFactor: 1.15 },
  };
}

export function getSalaryStructure() {
  return read(STRUCTURE_KEY, {});
}

export function getStructureForDesignation(designation) {
  const all = getSalaryStructure();
  return all[designation] ? { ...defaultStructure(), ...all[designation] } : defaultStructure();
}

export function updateStructureForDesignation(designation, updates) {
  const all = getSalaryStructure();
  const current = all[designation] || defaultStructure();
  const merged = {
    consolidatedPay: { ...current.consolidatedPay, ...(updates.consolidatedPay || {}) },
    dailyWages: { ...current.dailyWages, ...(updates.dailyWages || {}) },
    dailyWagesRateFactor: { ...current.dailyWagesRateFactor, ...(updates.dailyWagesRateFactor || {}) },
  };
  all[designation] = merged;
  write(STRUCTURE_KEY, all);
  return merged;
}

// Every designation that currently has staff, plus any designation someone
// has already configured a structure for (in case staff records change).
export function getAllDesignations() {
  const fromStaff = getStaffList().map((s) => s.designation).filter(Boolean);
  const fromStructure = Object.keys(getSalaryStructure());
  return Array.from(new Set([...fromStaff, ...fromStructure])).sort((a, b) => a.localeCompare(b));
}

/* ---------------------------------------------------------------------- */
/* 2. Salary computation                                                  */
/* ---------------------------------------------------------------------- */
// staff = a record from staffWorkflow.getStaffList()
// inputs = { daysWorked, incentiveDays, lumpSum, consolidatedAmount,
//            wagePerDay, incentivePerDay, rateFactor, incentiveRateFactor }
// Any field left undefined falls back to the designation's structure.
export function computeSalary(staff, inputs = {}) {
  const structure = getStructureForDesignation(staff.designation);
  const type = staff.salaryType;
  const daysWorked = Number(inputs.daysWorked || 0);
  const incentiveDays = Number(inputs.incentiveDays || 0);
  const lumpSum = Number(inputs.lumpSum || 0);

  let wagePerDay = 0;
  let rateFactor = 1;
  let incentiveRate = 0;
  let grossSalary = 0;
  let incentiveAmount = 0;

  if (type === 'Consolidated Pay') {
    grossSalary = Number(
      inputs.consolidatedAmount !== undefined ? inputs.consolidatedAmount : structure.consolidatedPay.amount
    );
  } else if (type === 'Daily Wages') {
    wagePerDay = Number(inputs.wagePerDay !== undefined ? inputs.wagePerDay : structure.dailyWages.wagePerDay);
    incentiveRate = Number(
      inputs.incentivePerDay !== undefined ? inputs.incentivePerDay : structure.dailyWages.incentivePerDay
    );
    grossSalary = wagePerDay * daysWorked;
    incentiveAmount = incentiveRate * incentiveDays;
  } else if (type === 'Daily Wages with Rate Factor') {
    wagePerDay = Number(
      inputs.wagePerDay !== undefined ? inputs.wagePerDay : structure.dailyWagesRateFactor.wagePerDay
    );
    rateFactor = Number(
      inputs.rateFactor !== undefined ? inputs.rateFactor : structure.dailyWagesRateFactor.rateFactor
    );
    incentiveRate = Number(
      inputs.incentiveRateFactor !== undefined
        ? inputs.incentiveRateFactor
        : structure.dailyWagesRateFactor.incentiveRateFactor
    );
    grossSalary = wagePerDay * rateFactor * daysWorked;
    incentiveAmount = wagePerDay * incentiveRate * incentiveDays;
  }

  const netSalary = grossSalary + incentiveAmount + lumpSum;

  return {
    staffId: staff.id,
    staffName: fullName(staff),
    designation: staff.designation,
    salaryType: type,
    employeeCode: staff.employeeCode,
    bankName: staff.bankName,
    bankAccountNumber: staff.bankAccountNumber,
    ifscCode: staff.ifscCode,
    doj: staff.doj,
    wagePerDay,
    rateFactor,
    incentiveRate,
    daysWorked,
    incentiveDays,
    lumpSum: round2(lumpSum),
    grossSalary: round2(grossSalary),
    incentiveAmount: round2(incentiveAmount),
    netSalary: round2(netSalary),
  };
}

/* ---------------------------------------------------------------------- */
/* 3. Salary sanctions (approval workflow) + reports                      */
/* ---------------------------------------------------------------------- */
export function getSanctions() {
  return read(SANCTIONS_KEY, []);
}

function saveSanctions(list) {
  write(SANCTIONS_KEY, list);
}

export function getSanctionById(id) {
  return getSanctions().find((r) => r.id === id) || null;
}

// payload = { month, year, salaryType, procNo, entries }
// entries = array of computeSalary(...) results
export function submitSalarySanction(payload, actor) {
  const list = getSanctions();
  const totalAmount = round2(payload.entries.reduce((sum, e) => sum + e.netSalary, 0));
  const req = {
    id: `SAL-${Date.now()}`,
    month: payload.month,
    year: payload.year,
    salaryType: payload.salaryType,
    procNo: payload.procNo || '',
    entries: payload.entries,
    totalAmount,
    status: `pending_${APPROVAL_CHAIN[0]}`,
    currentStepIndex: 0,
    history: [
      {
        role: actor.role,
        name: actor.name,
        action: 'submitted',
        date: new Date().toISOString(),
        comment: 'Submitted for salary sanction',
      },
    ],
    createdBy: { ...actor, date: new Date().toISOString() },
  };
  list.unshift(req);
  saveSanctions(list);
  return req;
}

export function getSanctionsByStatusForRole(role) {
  return getSanctions().filter((r) => r.status === `pending_${role}`);
}

export function getSanctionPendingCount(role) {
  return getSanctionsByStatusForRole(role).length;
}

export function approveSalarySanction(id, actor, comment) {
  const list = getSanctions();
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
  saveSanctions(list);
  return req;
}

export function rejectSalarySanction(id, actor, comment) {
  const list = getSanctions();
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
  saveSanctions(list);
  return req;
}

// Human label for "who has this now" — mirrors staffWorkflow.currentHolderLabel
export function currentSanctionHolderLabel(req) {
  if (req.status === 'approved') return 'Completed';
  if (req.status === 'rejected') return 'Rejected';
  const role = req.status.replace('pending_', '');
  return `Awaiting ${ROLE_LABELS[role] || role}`;
}

// All sanction batches, newest first — used by the Salary Reports page.
export function getAllSalaryReports() {
  return getSanctions()
    .slice()
    .sort((a, b) => new Date(b.createdBy.date) - new Date(a.createdBy.date));
}