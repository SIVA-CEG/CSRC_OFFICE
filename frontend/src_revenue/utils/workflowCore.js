// src_revenue/utils/workflowCore.js
// ─────────────────────────────────────────────────────────────────────────
// Generic, reusable engine for CSRC registers (Non-Consumables, Consumables,
// Service Register, Logistics Register).
//
// UPDATED: Assistant submissions are now applied immediately (status:
// 'approved' at creation) — no approval chain required. Superintendent /
// Deputy Director / Director logins remain read-only viewers of everything
// the Assistant does; the approve/reject machinery below is kept but never
// triggered in normal use since nothing is ever left "pending".
// ─────────────────────────────────────────────────────────────────────────

export const DEFAULT_CHAIN = ['superintendent', 'deputy_director', 'director'];

export const ROLE_LABELS = {
  assistant: 'Assistant',
  superintendent: 'Superintendent',
  deputy_director: 'Deputy Director',
  director: 'Director',
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
/* store factory                                                          */
/* ---------------------------------------------------------------------- */
// storageKey: sessionStorage key this register's entries live under
export function makeStore(storageKey) {
  function seedIfEmpty() {
    if (!read(storageKey, null)) write(storageKey, []);
  }
  seedIfEmpty();

  function getAll() {
    return read(storageKey, []);
  }
  function saveAll(list) {
    write(storageKey, list);
  }
  function getById(id) {
    return getAll().find((e) => e.id === id) || null;
  }

  // category is optional — registers with a single list (Service, Logistics)
  // can just omit it / pass null everywhere.
  function getByCategory(category) {
    return getAll()
      .filter((e) => !category || e.category === category)
      .sort((a, b) => new Date(b.createdBy.date) - new Date(a.createdBy.date));
  }

  function nextSlNo(category) {
    return getByCategory(category).length + 1;
  }

  // actor = { role, name }
  // UPDATED: entries are created already 'approved' — the Assistant is the
  // only one who submits, so there is nothing to wait on.
  function submit({ category, data, documents, actor, idPrefix, chain = DEFAULT_CHAIN }) {
    const list = getAll();
    const entry = {
      id: `${idPrefix || 'ENT'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: category || null,
      slNo: nextSlNo(category),
      data,
      documents: documents || [],
      chain,
      status: 'approved',
      currentStepIndex: chain.length,
      approvedDate: new Date().toISOString(),
      pendingChanges: {},
      history: [
        {
          role: actor.role,
          name: actor.name,
          action: 'submitted',
          date: new Date().toISOString(),
          comment: 'Submitted and registered by Assistant',
        },
      ],
      createdBy: { ...actor, date: new Date().toISOString() },
    };
    list.unshift(entry);
    saveAll(list);
    return entry;
  }

  // Kept for backward compatibility — no longer reachable in normal use
  // since entries are never left 'pending_*' after submit().
  function approve(id, actor, editedData, comment) {
    const list = getAll();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const entry = list[idx];
    const chain = entry.chain || DEFAULT_CHAIN;

    if (editedData) entry.data = { ...entry.data, ...editedData };

    entry.history.push({
      role: actor.role,
      name: actor.name,
      action: 'approved',
      date: new Date().toISOString(),
      comment: comment || 'Approved',
    });

    const nextIndex = entry.currentStepIndex + 1;
    if (nextIndex >= chain.length) {
      entry.status = 'approved';
      entry.currentStepIndex = nextIndex;
    } else {
      entry.currentStepIndex = nextIndex;
      entry.status = `pending_${chain[nextIndex]}`;
    }

    list[idx] = entry;
    saveAll(list);
    return entry;
  }

  function reject(id, actor, comment) {
    const list = getAll();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const entry = list[idx];
    entry.status = 'rejected';
    entry.history.push({
      role: actor.role,
      name: actor.name,
      action: 'rejected',
      date: new Date().toISOString(),
      comment: comment || 'Rejected',
    });
    list[idx] = entry;
    saveAll(list);
    return entry;
  }

  /* -------------------------------------------------------------------- */
  /* Field-level change requests — e.g. flipping an item's status from    */
  /* Working → Defective after the entry is already registered.           */
  /* UPDATED: applied immediately, same as submit() — no chain wait.      */
  /* -------------------------------------------------------------------- */
  function requestChange(id, actor, fieldKey, proposedValue, comment) {
    const list = getAll();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const entry = list[idx];

    const previousValue = entry.data[fieldKey];
    entry.data[fieldKey] = proposedValue;

    entry.history.push({
      role: actor.role,
      name: actor.name,
      action: 'change_applied',
      date: new Date().toISOString(),
      comment: comment || `${fieldKey} updated: ${previousValue} → ${proposedValue}`,
    });

    list[idx] = entry;
    saveAll(list);
    return entry;
  }

  // Kept for backward compatibility — unreachable in normal use since
  // requestChange() now applies the change immediately.
  function approveChange(id, actor, fieldKey, comment) {
    const list = getAll();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const entry = list[idx];
    const change = entry.pendingChanges && entry.pendingChanges[fieldKey];
    if (!change) return entry;
    const chain = change.chain || DEFAULT_CHAIN;

    change.history.push({
      role: actor.role,
      name: actor.name,
      action: 'approved',
      date: new Date().toISOString(),
      comment: comment || 'Approved',
    });

    const nextIndex = change.currentStepIndex + 1;
    if (nextIndex >= chain.length) {
      entry.data[fieldKey] = change.proposedValue;
      change.status = 'applied';
      entry.history.push({
        role: actor.role,
        name: actor.name,
        action: 'change_applied',
        date: new Date().toISOString(),
        comment: `${fieldKey} updated to ${change.proposedValue}`,
      });
      delete entry.pendingChanges[fieldKey];
    } else {
      change.currentStepIndex = nextIndex;
      change.status = `pending_${chain[nextIndex]}`;
      entry.pendingChanges[fieldKey] = change;
    }

    list[idx] = entry;
    saveAll(list);
    return entry;
  }

  function rejectChange(id, actor, fieldKey, comment) {
    const list = getAll();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const entry = list[idx];
    const change = entry.pendingChanges && entry.pendingChanges[fieldKey];
    if (!change) return entry;
    entry.history.push({
      role: actor.role,
      name: actor.name,
      action: 'change_rejected',
      date: new Date().toISOString(),
      comment: comment || `Rejected change to ${fieldKey}`,
    });
    delete entry.pendingChanges[fieldKey];
    list[idx] = entry;
    saveAll(list);
    return entry;
  }

  // replace with:
  // Marks `entry` as replaced by a newly-registered entry without touching
  // its workflow status. Used by the Non-Consumables buyback flow.
  function markBuybackApplied(id, { newEntryId, actor, comment }) {
    const list = getAll();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const entry = list[idx];
    entry.buyback = { newEntryId, date: new Date().toISOString(), by: actor };
    entry.history.push({
      role: actor.role,
      name: actor.name,
      action: 'buyback_replaced',
      date: new Date().toISOString(),
      comment: comment || `Replaced via buyback — new item ${newEntryId}`,
    });
    list[idx] = entry;
    saveAll(list);
    return entry;
  }

  function isActionable(entry, role) {
    return entry.status === `pending_${role}`;
  }  function isChangeActionable(entry, fieldKey, role) {
    const c = entry.pendingChanges && entry.pendingChanges[fieldKey];
    return !!c && c.status === `pending_${role}`;
  }

  function pendingForRole(role, category) {
    return getAll().filter((e) => e.status === `pending_${role}` && (!category || e.category === category));
  }
  function pendingCountForRole(role, category) {
    return pendingForRole(role, category).length;
  }

  // count of entries that ALSO have a pending field-change waiting on this role
  function pendingChangeCountForRole(role, category) {
    return getAll().filter(
      (e) =>
        (!category || e.category === category) &&
        e.pendingChanges &&
        Object.values(e.pendingChanges).some((c) => c.status === `pending_${role}`)
    ).length;
  }

  function counts(category) {
    return getByCategory(category).reduce(
      (acc, e) => {
        acc.all += 1;
        if (e.status === 'approved') acc.registered += 1;
        else if (e.status === 'rejected') acc.rejected += 1;
        else acc.pending += 1;
        return acc;
      },
      { all: 0, registered: 0, pending: 0, rejected: 0 }
    );
  }

  return {
    getAll,
    getByCategory,
    getById,
    saveAll,
    nextSlNo,
    submit,
    approve,
    reject,
    requestChange,
    approveChange,
    rejectChange,
    markBuybackApplied,
    isActionable,
    isChangeActionable,
    pendingForRole,
    pendingCountForRole,
    pendingChangeCountForRole,
    counts,
  };
}

/* ---------------------------------------------------------------------- */
/* shared helpers                                                         */
/* ---------------------------------------------------------------------- */
export function isApproverRole(role, chain = DEFAULT_CHAIN) {
  return chain.includes(role);
}

export function currentHolderLabel(entry) {
  if (entry.status === 'approved') return 'Registered';
  if (entry.status === 'rejected') return 'Rejected';
  const role = entry.status.replace('pending_', '');
  return `Awaiting ${ROLE_LABELS[role] || role}`;
}

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

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(n) {
  const num = parseFloat(n) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Inclusive date-range test — dateStr must fall within [from, to] (either may be blank)
export function inDateRange(dateStr, from, to) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  if (from) {
    const f = new Date(from);
    if (d < f) return false;
  }
  if (to) {
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    if (d > t) return false;
  }
  return true;
}

export function matchesMonthYear(dateStr, month, year) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  if (month && d.getMonth() + 1 !== Number(month)) return false;
  if (year && d.getFullYear() !== Number(year)) return false;
  return true;
}

export function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}