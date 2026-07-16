// src_revenue/utils/expenditureWorkflow.js
// ─────────────────────────────────────────────────────────────────────────
// Non-Consumables / Consumables stock registers (F&AM Form No. 43).
// Now built on the shared workflowCore engine (see workflowCore.js) so it
// gets field-level change requests (Working ⇄ Defective) for free, and
// exposes filter/report helpers for the View page.
//
// NOTE ON MIGRATION: `indentNo` has been renamed to `indentPoNo` (Indent /
// PO No.) per the latest register format, and each entry now carries:
//   pageNo, csrcProceedingsNo, csrcProceedingsDate, itemStatus ('working'|'defective')
// itemStatus starts as 'working' at creation and can only change afterwards
// via the same 4-tier approval chain (see requestItemStatusChange below).
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

const ENTRIES_KEY = 'csrc_revenue_expenditure_v2';
const store = makeStore(ENTRIES_KEY);

export const CATEGORIES = {
  non_consumables: {
    key: 'non_consumables',
    label: 'Non-Consumables',
    registerTitle: 'Register of Furniture / Non-Consumable Stock',
  },
  consumables: {
    key: 'consumables',
    label: 'Consumables',
    registerTitle: 'Register of Consumable Stock',
  },
};

export const APPROVAL_CHAIN = DEFAULT_CHAIN;
export { ROLE_LABELS } from './workflowCore';

/* ---------------------------------------------------------------------- */
/* entries — thin wrappers around the shared store                        */
/* ---------------------------------------------------------------------- */
export function getAllEntries() {
  return store.getAll();
}
export function getEntries(category) {
  return store.getByCategory(category);
}
export function getEntryById(id) {
  return store.getById(id);
}
export function getNextSlNo(category) {
  return store.nextSlNo(category);
}

// actor = { role, name }
export function submitEntry(category, data, documents, actor) {
  return store.submit({
    category,
    data: { itemStatus: 'working', ...data },
    documents,
    actor,
    idPrefix: 'EXP',
  });
}

export function approveEntry(id, actor, editedData, comment) {
  return store.approve(id, actor, editedData, comment);
}
export function rejectEntry(id, actor, comment) {
  return store.reject(id, actor, comment);
}

/* -- Buyback flow (non-consumables) ------------------------------------ */
export function markBuybackApplied(id, newEntryId, actor, comment) {
  return store.markBuybackApplied(id, { newEntryId, actor, comment });
}

/* -- Working / Defective condition change flow (post-registration) ----- */
export function requestItemStatusChange(id, actor, proposedStatus, comment) {
  return store.requestChange(id, actor, 'itemStatus', proposedStatus, comment);
}
export function approveItemStatusChange(id, actor, comment) {
  return store.approveChange(id, actor, 'itemStatus', comment);
}
export function rejectItemStatusChange(id, actor, comment) {
  return store.rejectChange(id, actor, 'itemStatus', comment);
}
export function isStatusChangeActionable(entry, role) {
  return store.isChangeActionable(entry, 'itemStatus', role);
}

/* ---------------------------------------------------------------------- */
/* role / step helpers                                                    */
/* ---------------------------------------------------------------------- */
export function isApproverRole(role) {
  return coreIsApproverRole(role);
}
export function isActionableByRole(entry, role) {
  return store.isActionable(entry, role);
}
export function currentHolderLabel(entry) {
  return coreCurrentHolderLabel(entry);
}
export function getPendingForRole(role, category) {
  return store.pendingForRole(role, category);
}
export function getPendingCountForRole(role, category) {
  return store.pendingCountForRole(role, category);
}
export function getPendingConditionChangeCountForRole(role, category) {
  return store.pendingChangeCountForRole(role, category);
}
export function getCategoryCounts(category) {
  return store.counts(category);
}

/* ---------------------------------------------------------------------- */
/* costing helpers                                                        */
/* ---------------------------------------------------------------------- */
export function itemAmount(item) {
  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.unitPrice) || 0;
  return qty > 0 ? qty * price : price;
}
export function computeSubTotal(items) {
  return (items || []).reduce((sum, it) => sum + itemAmount(it), 0);
}
export function computeGrandTotal({ items, cgstPct, sgstPct, igstPct, discount, roundOff }) {
  const subTotal = computeSubTotal(items);
  const cgst = subTotal * ((parseFloat(cgstPct) || 0) / 100);
  const sgst = subTotal * ((parseFloat(sgstPct) || 0) / 100);
  const igst = subTotal * ((parseFloat(igstPct) || 0) / 100);
  const disc = parseFloat(discount) || 0;
  const round = parseFloat(roundOff) || 0;
  const total = subTotal + cgst + sgst + igst - disc + round;
  return { subTotal, cgst, sgst, igst, total };
}

/* ---------------------------------------------------------------------- */
/* filtering (used by ViewEntries)                                        */
/* ---------------------------------------------------------------------- */
// filters = { fromDate, toDate, month, year, status, itemStatus, search }
export function filterEntries(entries, filters) {
  const q = (filters.search || '').trim().toLowerCase();
  return entries.filter((e) => {
    if (filters.status === 'bought_back') {
      if (!e.buyback) return false;
    } else if (filters.status && filters.status !== 'all') {
      const bucket = e.status === 'approved' ? 'approved' : e.status === 'rejected' ? 'rejected' : 'pending';
      if (bucket !== filters.status) return false;
    }
    if (filters.itemStatus && filters.itemStatus !== 'all' && e.data.itemStatus !== filters.itemStatus) return false;

    const dateField = e.data.dateOfReceipt || e.createdBy.date;
    if (filters.fromDate || filters.toDate) {
      if (!inDateRange(dateField, filters.fromDate, filters.toDate)) return false;
    }
    if (filters.month || filters.year) {
      if (!matchesMonthYear(dateField, filters.month, filters.year)) return false;
    }
    if (q) {
      const haystack = [
        e.data.manufacturerSupplier, e.data.invoiceNo, e.data.location, e.data.indentPoNo,
        e.data.pageNo, e.data.csrcProceedingsNo,
        ...(e.data.items || []).map((it) => it.description),
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------------- */
/* misc / re-exports                                                      */
/* ---------------------------------------------------------------------- */
export { getCurrentActor, fileToMeta, formatDate, formatCurrency };