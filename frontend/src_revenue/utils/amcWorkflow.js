import { makeStore, getCurrentActor, formatDate, formatCurrency, inDateRange, matchesMonthYear } from './workflowCore';

const AMC_KEY = 'csrc_amc_register_v1';
const store = makeStore(AMC_KEY);

export function getAmcEntries() { return store.getByCategory(null); }
export function getAmcEntryById(id) { return store.getById(id); }
export function getNextAmcSlNo() { return store.nextSlNo(null); }
export function getAmcCounts() { return store.counts(null); }

export function submitAmcEntry(data, actor) {
  return store.submit({ category: null, data, documents: [], actor, idPrefix: 'AMC' });
}

export function filterAmcEntries(entries, filters) {
  const q = (filters.search || '').trim().toLowerCase();
  return entries.filter((e) => {
    const dateField = e.data.amcFrom || e.createdBy.date;
    if (filters.fromDate || filters.toDate) {
      if (!inDateRange(dateField, filters.fromDate, filters.toDate)) return false;
    }
    if (filters.month || filters.year) {
      if (!matchesMonthYear(dateField, filters.month, filters.year)) return false;
    }
    if (q) {
      const haystack = [e.data.particulars, e.data.poNo, e.data.contractNo, e.data.ctdtNo, e.data.vendorName]
        .join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export { getCurrentActor, formatDate, formatCurrency };