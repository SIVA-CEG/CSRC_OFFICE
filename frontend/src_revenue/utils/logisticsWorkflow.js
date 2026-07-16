// src_revenue/utils/logisticsWorkflow.js
// ─────────────────────────────────────────────────────────────────────────
// Logistics Register — vehicle usage / trip log / fuel log, digitising the
// "ANNA UNIVERSITY, CHENNAI-600025" vehicle log book.
//
// Two pieces of state:
//   1. VEHICLES — simple master data (no approval needed to register an
//      asset in the fleet; only actual log entries go through approval).
//   2. TRIP/FUEL ENTRIES — one row per date, scoped to a vehicle via the
//      shared store's `category` field (category = vehicleId). Each entry
//      always carries the trip columns (1-8 in the register) and may
//      optionally carry the fuel columns (9A-16) when fuel was issued that
//      day, exactly like the physical register. Every entry still goes
//      through assistant → superintendent → deputy director → director.
// ─────────────────────────────────────────────────────────────────────────
import {
  makeStore,
  isApproverRole as coreIsApproverRole,
  currentHolderLabel as coreCurrentHolderLabel,
  getCurrentActor,
  fileToMeta,
  formatDate,
  inDateRange,
  matchesMonthYear,
  DEFAULT_CHAIN,
} from './workflowCore';

const VEHICLES_KEY = 'csrc_revenue_logistics_vehicles_v1';
const ENTRIES_KEY = 'csrc_revenue_logistics_entries_v1';

const entryStore = makeStore(ENTRIES_KEY);

export const REGISTER_META = {
  label: 'Logistics Register',
  registerTitle: 'Vehicle Usage, Fuel & Mileage Register',
};

export const APPROVAL_CHAIN = DEFAULT_CHAIN;
export { ROLE_LABELS } from './workflowCore';

/* ---------------------------------------------------------------------- */
/* low level storage (vehicles — plain CRUD, no approval chain)           */
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
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
if (!read(VEHICLES_KEY, null)) write(VEHICLES_KEY, []);

/* ---------------------------------------------------------------------- */
/* vehicles                                                                */
/* ---------------------------------------------------------------------- */
// details = { vehicleNumber, makeModel, type, fuelType, registeredOwner, remarks }
export function addVehicle(details, actor) {
  const list = read(VEHICLES_KEY, []);
  const vehicle = {
    id: `VEH-${Date.now()}`,
    ...details,
    addedBy: { ...actor, date: new Date().toISOString() },
  };
  list.unshift(vehicle);
  write(VEHICLES_KEY, list);
  return vehicle;
}
export function getVehicles() {
  return read(VEHICLES_KEY, []);
}
export function getVehicleById(id) {
  return getVehicles().find((v) => v.id === id) || null;
}
export function removeVehicle(id) {
  write(VEHICLES_KEY, getVehicles().filter((v) => v.id !== id));
}

/* ---------------------------------------------------------------------- */
/* trip / fuel entries — category = vehicleId                             */
/* ---------------------------------------------------------------------- */
export function getAllEntries() {
  return entryStore.getAll();
}
export function getEntriesForVehicle(vehicleId) {
  return entryStore.getByCategory(vehicleId);
}
export function getEntryById(id) {
  return entryStore.getById(id);
}
export function getNextSlNo(vehicleId) {
  return entryStore.nextSlNo(vehicleId);
}

export function computeKmDone(startOdometer, returnOdometer) {
  const s = parseFloat(startOdometer) || 0;
  const r = parseFloat(returnOdometer) || 0;
  return r > s ? r - s : 0;
}

// data = { date, startTime, startOdometer, returnTime, returnOdometer,
//          placesVisited, purpose, personTravelled, remarks,
//          hasFuelEntry: bool,
//          lubricationOilFilled, fuelInTankLitres, fuelIssuedLitres,
//          fuelOdometerReading, billNo, billDate }
export function submitTripEntry(vehicleId, data, documents, actor) {
  const kmDone = computeKmDone(data.startOdometer, data.returnOdometer);
  return entryStore.submit({
    category: vehicleId,
    data: { ...data, kmDone },
    documents,
    actor,
    idPrefix: 'TRIP',
  });
}
export function approveEntry(id, actor, editedData, comment) {
  return entryStore.approve(id, actor, editedData, comment);
}
export function rejectEntry(id, actor, comment) {
  return entryStore.reject(id, actor, comment);
}

export function isApproverRole(role) {
  return coreIsApproverRole(role);
}
export function isActionableByRole(entry, role) {
  return entryStore.isActionable(entry, role);
}
export function currentHolderLabel(entry) {
  return coreCurrentHolderLabel(entry);
}
export function getPendingForRole(role, vehicleId) {
  return entryStore.pendingForRole(role, vehicleId);
}
export function getPendingCountForRole(role, vehicleId) {
  return entryStore.pendingCountForRole(role, vehicleId);
}
export function getCounts(vehicleId) {
  return entryStore.counts(vehicleId);
}

/* filters = { fromDate, toDate, month, year, status, search } — dateField = data.date */
export function filterEntries(entries, filters) {
  const q = (filters.search || '').trim().toLowerCase();
  return entries.filter((e) => {
    if (filters.status && filters.status !== 'all') {
      const bucket = e.status === 'approved' ? 'approved' : e.status === 'rejected' ? 'rejected' : 'pending';
      if (bucket !== filters.status) return false;
    }
    const dateField = e.data.date;
    if (filters.fromDate || filters.toDate) {
      if (!inDateRange(dateField, filters.fromDate, filters.toDate)) return false;
    }
    if (filters.month || filters.year) {
      if (!matchesMonthYear(dateField, filters.month, filters.year)) return false;
    }
    if (q) {
      const haystack = [e.data.placesVisited, e.data.purpose, e.data.personTravelled, e.data.billNo].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/* ---------------------------------------------------------------------- */
/* mileage abstract — opening/closing odometer, total km, total litres,   */
/* km per litre, computed the same way as the "Abstract for the month"    */
/* rows in the physical register.                                        */
/* ---------------------------------------------------------------------- */
export function computeMileageAbstract(vehicleId, fromDate, toDate, { onlyApproved = true } = {}) {
  let entries = getEntriesForVehicle(vehicleId).filter((e) => e.data.hasFuelEntry);
  if (onlyApproved) entries = entries.filter((e) => e.status === 'approved');
  entries = entries
    .filter((e) => e.data.date)
    .sort((a, b) => new Date(a.data.date) - new Date(b.data.date));

  const inRange = entries.filter((e) => inDateRange(e.data.date, fromDate, toDate));
  const before = entries.filter((e) => !inDateRange(e.data.date, fromDate, toDate) && new Date(e.data.date) < new Date(fromDate || e.data.date));

  const openingEntry = before[before.length - 1] || inRange[0];
  const closingEntry = inRange[inRange.length - 1] || openingEntry;

  const openingOdometer = openingEntry ? parseFloat(openingEntry.data.fuelOdometerReading || openingEntry.data.returnOdometer) || 0 : 0;
  const closingOdometer = closingEntry ? parseFloat(closingEntry.data.fuelOdometerReading || closingEntry.data.returnOdometer) || 0 : 0;

  const totalKm = Math.max(0, closingOdometer - openingOdometer);
  const totalLitres = inRange.reduce((sum, e) => sum + (parseFloat(e.data.fuelIssuedLitres) || 0), 0);
  const kmPerLitre = totalLitres > 0 ? totalKm / totalLitres : 0;

  return {
    openingOdometer,
    closingOdometer,
    openingDate: openingEntry ? openingEntry.data.date : null,
    closingDate: closingEntry ? closingEntry.data.date : null,
    totalKm,
    totalLitres,
    kmPerLitre,
    fuelEntryCount: inRange.length,
  };
}

export { getCurrentActor, fileToMeta, formatDate };