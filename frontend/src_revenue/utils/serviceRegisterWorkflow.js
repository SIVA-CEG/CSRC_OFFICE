// src_revenue/utils/serviceRegisterWorkflow.js
// ─────────────────────────────────────────────────────────────────────────
// Service Register — logs any non-consumable/consumable item sent out for
// service/repair. Same 4-tier approval chain (assistant → superintendent →
// deputy director → director) as every other CSRC register.
// ─────────────────────────────────────────────────────────────────────────
import {
  makeStore,
  isApproverRole as coreIsApproverRole,
  currentHolderLabel as coreCurrentHolderLabel,
  getCurrentActor,
  fileToMeta,
  formatDate,
  formatCurrency,
  inDateRange,
  matchesMonthYear,
  DEFAULT_CHAIN,
} from './workflowCore';

const ENTRIES_KEY = 'csrc_revenue_service_register_v1';
const store = makeStore(ENTRIES_KEY);

export const REGISTER_META = {
  label: 'Service Register',
  registerTitle: 'Register of Equipment Sent for Service / Repair',
};

export const APPROVAL_CHAIN = DEFAULT_CHAIN;
export { ROLE_LABELS } from './workflowCore';

export function getAllEntries() {
  return store.getAll();
}
export function getEntries() {
  return store.getByCategory(null);
}
export function getEntryById(id) {
  return store.getById(id);
}
export function getNextSlNo() {
  return store.nextSlNo(null);
}

// data = { pageNo, vendorName, vendorDescription, equipmentName, serviceDescription,
//          invoiceNo, invoiceDate, csrcProceedingsNo, csrcProceedingsDate,
//          amount, paymentDate, remarks }
export function submitEntry(data, documents, actor) {
  return store.submit({ category: null, data, documents, actor, idPrefix: 'SVC' });
}
export function approveEntry(id, actor, editedData, comment) {
  return store.approve(id, actor, editedData, comment);
}
export function rejectEntry(id, actor, comment) {
  return store.reject(id, actor, comment);
}

export function isApproverRole(role) {
  return coreIsApproverRole(role);
}
export function isActionableByRole(entry, role) {
  return store.isActionable(entry, role);
}
export function currentHolderLabel(entry) {
  return coreCurrentHolderLabel(entry);
}
export function getPendingForRole(role) {
  return store.pendingForRole(role, null);
}
export function getPendingCountForRole(role) {
  return store.pendingCountForRole(role, null);
}
export function getCounts() {
  return store.counts(null);
}

/* filters = { fromDate, toDate, month, year, status, search } — dateField = invoiceDate */
export function filterEntries(entries, filters) {
  const q = (filters.search || '').trim().toLowerCase();
  return entries.filter((e) => {
    if (filters.status && filters.status !== 'all') {
      const bucket = e.status === 'approved' ? 'approved' : e.status === 'rejected' ? 'rejected' : 'pending';
      if (bucket !== filters.status) return false;
    }
    const dateField = e.data.invoiceDate || e.createdBy.date;
    if (filters.fromDate || filters.toDate) {
      if (!inDateRange(dateField, filters.fromDate, filters.toDate)) return false;
    }
    if (filters.month || filters.year) {
      if (!matchesMonthYear(dateField, filters.month, filters.year)) return false;
    }
    if (q) {
      const haystack = [
        e.data.vendorName, e.data.equipmentName, e.data.serviceDescription,
        e.data.invoiceNo, e.data.pageNo, e.data.csrcProceedingsNo,
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export { getCurrentActor, fileToMeta, formatDate, formatCurrency };