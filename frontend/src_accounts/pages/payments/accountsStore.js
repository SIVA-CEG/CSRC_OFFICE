/* ═══════════════════════════════════════════════════════════════════
   accountsStore.js — shared in-memory store for Accounts side
   (swap with your real ProjectContext / API when wiring up)
═══════════════════════════════════════════════════════════════════ */

export const today = () =>
  new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

export const fmt = (n) => "₹ " + Number(n || 0).toLocaleString("en-IN");

/* 9-digit code dropdown options (Digit-by-Digit) */
export const CODE_OPTIONS = {
  digit1: [
    { v: "1", label: "Payments (Charges)" },
    { v: "2", label: "Receipts" },
    { v: "3", label: "Adjustments" },
  ],
  digit23: [
    { v: "01", label: "01 – Mechanical" },
    { v: "02", label: "02 – Civil" },
    { v: "03", label: "03 – IT / CSE" },
    { v: "04", label: "04 – ECE" },
  ],
  digit45: [
    { v: "01", label: "01 – R&AC Division" },
    { v: "02", label: "02 – Thermal Division" },
    { v: "03", label: "03 – General Lab" },
  ],
  digit67: [
    { v: "11", label: "11 – Manpower" },
    { v: "12", label: "12 – Consumables" },
    { v: "13", label: "13 – Travel" },
    { v: "14", label: "14 – Contingency" },
    { v: "15", label: "15 – Non-Recurring" },
  ],
  digit89: [
    { v: "01", label: "01 – Salary" },
    { v: "02", label: "02 – Chemicals" },
    { v: "03", label: "03 – TA/DA" },
    { v: "04", label: "04 – Equipment" },
  ],
};

export const buildNineDigit = (v) =>
  [v.digit1, v.digit23, v.digit45, v.digit67, v.digit89]
    .map((x) => x || "0")
    .join("-");

/* ── Seed: only APPROVED (completed) bills from the office side ── */
const seedBills = (n) =>
  Array.from({ length: n }, (_, i) => ({
    name: `Voucher ${i + 1}`,
    ref: `BILL-${1000 + i}`,
    date: today(),
    amount: Math.round(5000 + Math.random() * 20000),
  }));

let COMPLETED_BILLS = [
  {
    id: 8,
    _projectId: "ZBA003",
    _projectTitle: "Smart Agriculture Analytics",
    _accountType: "project",         // ← account bucket for VoucherClearance filter
    csrcProcNo: "01/NHHID/Ph-II/Admin/Training & workshop/2024-25",
    mhNo: "15.1.16",
    dept: "NHHID",
    campus: "CEG Campus",
    projectHead: "Manpower",
    scheme: "1819",
    date: "12-06-2026",
    type: "Recurring",
    head: "Manpower",
    amount: 55000,
    beneficiary: "M/S COORDINATOR NHHID (IRG)",
    status: "approved",
    bills: seedBills(2),
    voucher: null,
    accountedOn: null,
    reportBatch: null,   // ← null = Section 1 (pending), string = Section 2 (queued), accountedOn set = Section 3
  },
  {
    id: 12,
    _projectId: "ZBA001",
    _projectTitle: "AI Based Research Project",
    _accountType: "project",
    csrcProcNo: "02/EDIC/2024/TEC/Training Program",
    mhNo: "15.1.11",
    dept: "TEC",
    campus: "ACT Campus",
    projectHead: "Training Program",
    scheme: "1819",
    date: "20-06-2026",
    type: "Non-Recurring",
    head: "Equipment",
    amount: 24373,
    beneficiary: "Coordinator, TEC Account",
    status: "approved",
    bills: seedBills(1),
    voucher: null,
    accountedOn: null,
    reportBatch: null,
  },
  {
    id: 15,
    _projectId: "ZBA002",
    _projectTitle: "IoT Smart Monitoring System",
    _accountType: "project",
    csrcProcNo: "1695/CES/PROJ/STAFF/CLAIM-9",
    mhNo: "15.1.20",
    dept: "CES",
    campus: "CEG Campus",
    projectHead: "Project Scientist - I",
    scheme: "1817",
    date: "18-06-2026",
    type: "Recurring",
    head: "Manpower",
    amount: 62865,
    beneficiary: "Dr. M TAMILELAKKIYA",
    status: "approved",
    bills: seedBills(3),
    voucher: null,
    accountedOn: null,
    reportBatch: null,
  },
];

/* simple pub/sub so both pages re-render on change */
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const accountsStore = {
  getBills: () => COMPLETED_BILLS,
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  updateBill: (id, patch) => {
    COMPLETED_BILLS = COMPLETED_BILLS.map((b) =>
      b.id === id ? { ...b, ...patch } : b
    );
    emit();
  },
  setVoucher: (id, voucher) => {
    COMPLETED_BILLS = COMPLETED_BILLS.map((b) =>
      b.id === id ? { ...b, voucher } : b
    );
    emit();
  },
  /** Called from VoucherClearance Section 1 — marks the bill as part of a report batch (moves to Section 2) */
  setReportBatch: (id, batchId) => {
    COMPLETED_BILLS = COMPLETED_BILLS.map((b) =>
      b.id === id ? { ...b, reportBatch: batchId } : b
    );
    emit();
  },
  /** Called from VoucherClearance Section 2 — records the "accounted on" date (moves to Section 3) */
  setAccountedOn: (id, dateStr) => {
    COMPLETED_BILLS = COMPLETED_BILLS.map((b) =>
      b.id === id ? { ...b, accountedOn: dateStr } : b
    );
    emit();
  },
  getVoucheredBills: () => COMPLETED_BILLS.filter((b) => b.voucher),
};

/* react hook */
import { useEffect, useState } from "react";
export function useAccountsBills() {
  const [, force] = useState(0);
  useEffect(() => accountsStore.subscribe(() => force((n) => n + 1)), []);
  return accountsStore.getBills();
}

export function getPaymentsSummary(bills) {
  const accounts = ["revenue", "project", "mopr", "ttdf", "tax"];

  const summary = {};
  accounts.forEach(a => {
    summary[a] = { count: 0, amount: 0, vouchered: 0, cleared: 0 };
  });

  bills.forEach(b => {
    const acc = b._accountType || "project";
    if (!summary[acc]) summary[acc] = { count: 0, amount: 0, vouchered: 0, cleared: 0 };

    summary[acc].count += 1;
    summary[acc].amount += Number(b.amount || 0);
    if (b.voucher) summary[acc].vouchered += 1;
    if (b.accountedOn) summary[acc].cleared += 1;
  });

  return {
    totalCount: bills.length,
    totalAmount: bills.reduce((s, b) => s + Number(b.amount || 0), 0),
    totalVouchered: bills.filter(b => b.voucher).length,
    totalPendingVoucher: bills.filter(b => !b.voucher).length,
    totalCleared: bills.filter(b => b.accountedOn).length,
    accounts: summary,
  };
}