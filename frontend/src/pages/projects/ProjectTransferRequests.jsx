// PATH: CSRC_OFFICE/frontend/src/pages/projects/ProjectTransferRequests.jsx

import React, { useState, useEffect, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────
// CSRC-office side of the project transfer workflow. Talks to the real
// backend (projectTransferRoutes.js / project_transfers table) — no
// sessionStorage bridging or dummy data.
//
// Role hierarchy (bottom → top): assistant → superintendent → dd → director
//   • "Approve & Transfer" moves the request UP one tier (assistant →
//     superintendent → dd → director). At the Director tier this becomes
//     "Approve" (final-approve) since there is no tier above — it also
//     reassigns PI-ship on the project itself.
//   • "Transfer without Approval" is a lateral handoff at the SAME tier
//     (assistant → assistant, superintendent → superintendent, etc.) —
//     status is untouched, only who it's assigned to changes.
//
// Tabs mirror the convention used elsewhere in this app (FreshSanction.jsx
// etc.):
//   • assistant / superintendent / dd → New Requests, Transferred, Completed
//   • director                        → New Requests, Completed
// ─────────────────────────────────────────────────────────────────────────

const API = "http://localhost:5100/api/project-transfer";
// File origin for opening uploaded transfer letters — letter_path is
// stored as a full OS path (e.g. "C:/Users/.../uploads/transferLetters/
// xxx.pdf"); this needs to be resolved down to "uploads/..." and served
// from the backend's own origin, not whatever origin the frontend runs on.
const FILE_ORIGIN = "http://localhost:5100";

const ROLE_ALIASES = {
  assistant: "assistant",
  ast: "assistant",
  superintendent: "superintendent",
  superintendant: "superintendent", // common misspelling
  supervisor: "superintendent",
  superviser: "superintendent",
  sup: "superintendent",
  dd: "dd",
  deputy_director: "dd",
  deputydirector: "dd",
  deputy: "dd",
  director: "director",
  dir: "director",
};

const normalizeRole = (raw) => {
  if (!raw) return null;
  const key = String(raw)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const resolved = ROLE_ALIASES[key];
  if (!resolved) {
    // eslint-disable-next-line no-console
    console.warn(
      `[ProjectTransferRequests] Unrecognized role from sessionStorage: "${raw}" — falling back to "assistant".`,
    );
    return null;
  }
  return resolved;
};

const userRole = () =>
  normalizeRole(sessionStorage.getItem("userRole")) || "assistant";
const userName = () => sessionStorage.getItem("userName") || "Office";

const ROLE_ORDER = ["assistant", "superintendent", "dd", "director"];
const ROLE_LABEL = {
  assistant: "Assistant",
  superintendent: "Superviser",
  dd: "Deputy Director",
  director: "Director",
};
const ROLE_ICON = {
  assistant: "🟢",
  superintendent: "🔵",
  dd: "🟣",
  director: "🔴",
};

const nextRole = (role) => {
  const idx = ROLE_ORDER.indexOf(role);
  return idx >= 0 && idx < ROLE_ORDER.length - 1 ? ROLE_ORDER[idx + 1] : null;
};

const todayStr = () =>
  new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-GB");
};

// letter_path is a full OS path from multer — normalize down to
// "uploads/..." and build an absolute URL against the backend.
const letterUrl = (letterPath) => {
  if (!letterPath) return null;
  const normalized = String(letterPath).replace(/\\/g, "/");
  const idx = normalized.indexOf("uploads/");
  const rel = idx !== -1 ? normalized.slice(idx) : normalized;
  return `${FILE_ORIGIN}/${rel}`;
};

// Maps a transfer's real `status` back to which office tier currently
// holds it, for the badge/timeline. Returns null for statuses that aren't
// an office-tier hold (still pending faculty, rejected, completed).
const STATUS_TO_ROLE = {
  assigned: "assistant",
  "assigned with supervisor": "superintendent",
  "assigned with dd": "dd",
  "assigned with director": "director",
};

const officeStatusMeta = (t) => {
  const status = (t.status || "").toLowerCase().trim();
  if (status === "completed")
    return {
      label: "Approved — Transfer Completed",
      color: "#166534",
      bg: "#dcfce7",
      dot: "#22c55e",
    };
  if (status === "rejected_by_faculty")
    return {
      label: "Rejected by Faculty",
      color: "#991b1b",
      bg: "#fee2e2",
      dot: "#ef4444",
    };
  if (status === "pending_faculty")
    return {
      label: "Awaiting Faculty Acceptance",
      color: "#92400e",
      bg: "#fef3c7",
      dot: "#f59e0b",
    };
  const stage = STATUS_TO_ROLE[status];
  if (stage) {
    return {
      label: `Pending — ${ROLE_LABEL[stage]} Review`,
      color: "#1e40af",
      bg: "#dbeafe",
      dot: "#3b82f6",
    };
  }
  return {
    label: t.status || "Unknown",
    color: "#374151",
    bg: "#f3f4f6",
    dot: "#9ca3af",
  };
};

const StatusBadge = ({ t }) => {
  const s = officeStatusMeta(t);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }}
      />
      {s.label}
    </span>
  );
};

// ─── Office pipeline timeline ──────────────────────────────────────────────
const TIMELINE_LABELS = [
  "Faculty Accepted",
  "Assistant",
  "Superviser",
  "Deputy Director",
  "Director",
  "Completed",
];

const OfficeTimeline = ({ t }) => {
  const status = (t.status || "").toLowerCase().trim();
  const isRejected = status === "rejected_by_faculty";

  let reachedIdx;
  if (status === "completed") reachedIdx = TIMELINE_LABELS.length - 1;
  else {
    const stage = STATUS_TO_ROLE[status] || "assistant";
    reachedIdx = ROLE_ORDER.indexOf(stage) + 1;
  }

  return (
    <div style={styles.timelineRow}>
      {TIMELINE_LABELS.map((label, i) => {
        let state = "pending";
        if (isRejected && i === reachedIdx) state = "rejected";
        else if (i <= reachedIdx) state = "done";
        return (
          <React.Fragment key={label}>
            <div style={styles.timelineStep}>
              <div
                style={{
                  ...styles.timelineDot,
                  background:
                    state === "done"
                      ? "#22c55e"
                      : state === "rejected"
                        ? "#ef4444"
                        : "#e5e7eb",
                  borderColor:
                    state === "done"
                      ? "#22c55e"
                      : state === "rejected"
                        ? "#ef4444"
                        : "#d1d5db",
                }}
              />
              <span
                style={{
                  ...styles.timelineLabel,
                  color: state === "pending" ? "#9ca3af" : "#374151",
                }}
              >
                {label}
              </span>
            </div>
            {i < TIMELINE_LABELS.length - 1 && (
              <div
                style={{
                  ...styles.timelineBar,
                  background: i < reachedIdx ? "#22c55e" : "#e5e7eb",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Process modal: Approve & Transfer / Transfer without Approval ───────
const ProcessModal = ({
  transfer,
  viewingRole,
  onClose,
  onApprovalTransfer,
  onLateralTransfer,
  onFinalize,
}) => {
  const [mode, setMode] = useState(null); // 'approval' | 'lateral'
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [remarks, setRemarks] = useState("");

  const upperRole = nextRole(viewingRole);
  const isDirector = viewingRole === "director";
  const targetRole = mode === "approval" ? upperRole : viewingRole;

  useEffect(() => {
    if (!mode) return;
    let cancelled = false;
    setOptionsLoading(true);
    setOptions([]);
    fetch(`${API}/tapal/staff/${targetRole}`)
      .then((r) => r.json())
      .then((rows) => {
        if (cancelled) return;
        // For a lateral handoff, don't let someone "transfer" to themself.
        const filtered =
          mode === "lateral" ? rows.filter((s) => s.name !== userName()) : rows;
        setOptions(Array.isArray(filtered) ? filtered : []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const selectedStaff = options.find(
    (s) => String(s.id) === String(selectedId),
  );

  const reset = () => {
    setMode(null);
    setSelectedId("");
    setRemarks("");
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span>Process Transfer Request</span>
          <button style={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.modalProjectBox}>
            <div style={styles.modalProjectFile}>{transfer.file_no || "-"}</div>
            <div style={styles.modalProjectTitle}>{transfer.title}</div>
            <div style={styles.modalProjectCost}>
              ₹ {Number(transfer.cost || 0).toLocaleString("en-IN")} ·{" "}
              {transfer.funding_agency}
            </div>
            <div style={styles.modalProjectParties}>
              From: <strong>{transfer.from_name}</strong> → To:{" "}
              <strong>{transfer.to_name}</strong>
            </div>
          </div>

          {!mode && (
            <div style={styles.modeChoices}>
              <button
                style={styles.modeBtnApproval}
                onClick={() => setMode("approval")}
              >
                {isDirector
                  ? "✓ Approve & Finalize Transfer"
                  : `⬆ Approve & Transfer (to ${ROLE_LABEL[upperRole]})`}
              </button>
              {!isDirector && (
                <button
                  style={styles.modeBtnLateral}
                  onClick={() => setMode("lateral")}
                >
                  ↔ Transfer without Approval ({ROLE_LABEL[viewingRole]} →{" "}
                  {ROLE_LABEL[viewingRole]})
                </button>
              )}
            </div>
          )}

          {mode === "approval" && !isDirector && (
            <>
              <label style={styles.modalLabel}>
                Select {ROLE_LABEL[upperRole]}
              </label>
              <select
                style={styles.modalSelect}
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={optionsLoading}
              >
                <option value="" disabled>
                  {optionsLoading
                    ? "Loading…"
                    : `Select ${ROLE_LABEL[upperRole].toLowerCase()}…`}
                </option>
                {options.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <label style={styles.modalLabel}>Remarks (optional)</label>
              <textarea
                style={styles.modalTextarea}
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Note for the next reviewer…"
              />
            </>
          )}

          {mode === "approval" && isDirector && (
            <>
              <div style={styles.finalizeNote}>
                This will approve the transfer, mark it completed, and reassign
                PI-ship of the project from{" "}
                <strong>{transfer.from_name}</strong> to{" "}
                <strong>{transfer.to_name}</strong>.
              </div>
              <label style={styles.modalLabel}>Remarks (optional)</label>
              <textarea
                style={styles.modalTextarea}
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Final remarks…"
              />
            </>
          )}

          {mode === "lateral" && (
            <>
              <label style={styles.modalLabel}>
                Select {ROLE_LABEL[viewingRole]}
              </label>
              <select
                style={styles.modalSelect}
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={optionsLoading}
              >
                <option value="" disabled>
                  {optionsLoading
                    ? "Loading…"
                    : `Select ${ROLE_LABEL[viewingRole].toLowerCase()}…`}
                </option>
                {options.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <label style={styles.modalLabel}>Remarks (optional)</label>
              <textarea
                style={styles.modalTextarea}
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Note for your colleague…"
              />
            </>
          )}
        </div>

        <div style={styles.modalFooter}>
          {mode ? (
            <>
              <button style={styles.modalCancelBtn} onClick={reset}>
                ← Back
              </button>
              <button
                style={{
                  ...styles.modalSubmitBtn,
                  background: mode === "lateral" ? "#2563eb" : "#16a34a",
                  opacity:
                    mode === "approval" && isDirector
                      ? 1
                      : selectedStaff
                        ? 1
                        : 0.5,
                  cursor:
                    mode === "approval" && isDirector
                      ? "pointer"
                      : selectedStaff
                        ? "pointer"
                        : "not-allowed",
                }}
                disabled={
                  !(mode === "approval" && isDirector) && !selectedStaff
                }
                onClick={() => {
                  if (mode === "approval" && isDirector)
                    onFinalize(transfer, remarks);
                  else if (mode === "approval")
                    onApprovalTransfer(transfer, selectedStaff, remarks);
                  else if (mode === "lateral")
                    onLateralTransfer(transfer, selectedStaff, remarks);
                }}
              >
                {mode === "approval" && isDirector
                  ? "Approve & Finalize"
                  : "Confirm Transfer"}
              </button>
            </>
          ) : (
            <button style={styles.modalCancelBtn} onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Track modal: full detail + real history for a transfer ──────────────
const HISTORY_TEXT = {
  ENTERED_OFFICE_QUEUE: (h) => (
    <>
      Entered office pipeline → <strong>{h.assigned_to}</strong> (Assistant)
    </>
  ),
  APPROVE_AND_ASSIGN_SUPERVISOR: (h) => (
    <>
      <strong>{h.assigned_from}</strong> approved &amp; forwarded to{" "}
      <strong>{h.assigned_to}</strong> (Superviser)
    </>
  ),
  APPROVE_AND_ASSIGN_DD: (h) => (
    <>
      <strong>{h.assigned_from}</strong> approved &amp; forwarded to{" "}
      <strong>{h.assigned_to}</strong> (Deputy Director)
    </>
  ),
  APPROVE_AND_ASSIGN_DIRECTOR: (h) => (
    <>
      <strong>{h.assigned_from}</strong> approved &amp; forwarded to{" "}
      <strong>{h.assigned_to}</strong> (Director)
    </>
  ),
  TRANSFER: (h) => (
    <>
      <strong>{h.assigned_from}</strong> transferred (no approval) to{" "}
      <strong>{h.assigned_to}</strong>
    </>
  ),
  FINAL_APPROVE: (h) => (
    <>
      Approved &amp; finalized by <strong>{h.assigned_from}</strong>
    </>
  ),
};

const TrackModal = ({ transfer, onClose }) => {
  const [detail, setDetail] = useState(transfer);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch(`${API}/tapal/${transfer.id}`).then((r) => r.json()),
      fetch(`${API}/tapal/${transfer.id}/history`).then((r) => r.json()),
    ])
      .then(([detailRow, historyRows]) => {
        if (cancelled) return;
        setDetail(detailRow && !detailRow.error ? detailRow : transfer);
        setHistory(Array.isArray(historyRows) ? historyRows : []);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setDetail(transfer);
          setHistory([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [transfer.id]);

  const url = letterUrl(detail.letter_path);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={{ ...styles.modalBox, width: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <span>Track Transfer — {detail.file_no || `#${detail.id}`}</span>
          <button style={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.modalProjectBox}>
            <div style={styles.modalProjectFile}>{detail.file_no || "-"}</div>
            <div style={styles.modalProjectTitle}>{detail.title}</div>
            <div style={styles.modalProjectCost}>
              ₹ {Number(detail.cost || 0).toLocaleString("en-IN")} ·{" "}
              {detail.funding_agency}
            </div>
            <div style={styles.modalProjectParties}>
              From: <strong>{detail.from_name}</strong>
              {detail.from_designation ? `, ${detail.from_designation}` : ""}
              {detail.from_dept ? `, ${detail.from_dept}` : ""}
              {detail.from_campus ? `, ${detail.from_campus}` : ""} → To:{" "}
              <strong>{detail.to_name}</strong>
              {detail.to_designation ? `, ${detail.to_designation}` : ""}
              {detail.to_dept ? `, ${detail.to_dept}` : ""}
              {detail.to_campus ? `, ${detail.to_campus}` : ""}
            </div>
            {(detail.project_start_date || detail.project_end_date) && (
              <div style={{ ...styles.modalProjectParties, marginTop: 4 }}>
                Project period: {fmtDate(detail.project_start_date)} –{" "}
                {fmtDate(detail.project_end_date)}
              </div>
            )}
            {detail.sub && (
              <div style={{ ...styles.modalProjectParties, marginTop: 4 }}>
                <strong>Sub:</strong> {detail.sub}
              </div>
            )}
            {detail.ref && (
              <div style={{ ...styles.modalProjectParties, marginTop: 2 }}>
                <strong>Ref:</strong> {detail.ref}
              </div>
            )}
          </div>

          <StatusBadge t={detail} />
          <OfficeTimeline t={detail} />

          <div style={styles.actionRow}>
            <button
              style={styles.letterBtn}
              disabled={!url}
              onClick={() => url && window.open(url, "_blank")}
            >
              📄 View Transfer Letter
            </button>
          </div>

          {detail.reason && (
            <div style={styles.remarksBox}>
              <strong>Faculty remarks:</strong> {detail.reason}
            </div>
          )}
          {detail.assign_remarks && (
            <div style={styles.remarksBox}>
              <strong>Latest office remarks:</strong> {detail.assign_remarks}
            </div>
          )}

          <div style={styles.historySection}>
            <div style={styles.historySectionTitle}>
              Office Movement History
            </div>
            {loading ? (
              <div style={{ color: "#9ca3af", fontSize: 12.5 }}>Loading…</div>
            ) : history.length === 0 ? (
              <div style={{ color: "#9ca3af", fontSize: 12.5 }}>
                No movement recorded yet.
              </div>
            ) : (
              history.map((h) => (
                <div key={h.id} style={styles.historyEntry}>
                  <span style={styles.historyEntryDate}>
                    {fmtDate(h.created_at)}
                  </span>
                  <span style={styles.historyEntryText}>
                    {(HISTORY_TEXT[h.action] || (() => h.action))(h)}
                    {h.remarks ? (
                      <span style={styles.historyEntryRemarks}>
                        {" "}
                        — "{h.remarks}"
                      </span>
                    ) : null}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.modalCancelBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────
const TABS_BY_ROLE = {
  assistant: [
    { key: "new", label: "New Requests" },
    { key: "transferred", label: "Transferred" },
    { key: "completed", label: "Completed" },
  ],
  superintendent: [
    { key: "new", label: "New Requests" },
    { key: "transferred", label: "Transferred" },
    { key: "completed", label: "Completed" },
  ],
  dd: [
    { key: "new", label: "New Requests" },
    { key: "transferred", label: "Transferred" },
    { key: "completed", label: "Completed" },
  ],
  director: [
    { key: "new", label: "New Requests" },
    { key: "completed", label: "Completed" },
  ],
};

const ProjectTransferRequests = ({ onNavigate }) => {
  const role = userRole();
  const safeRole = ROLE_ORDER.includes(role) ? role : "assistant";
  const tabs = TABS_BY_ROLE[safeRole] || TABS_BY_ROLE.assistant;

  const [activeTab, setActiveTab] = useState("new");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [processTransfer, setProcessTransfer] = useState(null);
  const [trackTransfer, setTrackTransfer] = useState(null);

  const loadRows = async (tab) => {
    setLoading(true);
    try {
      let url;
      if (tab === "new") {
        url = `${API}/tapal/${safeRole}/new?username=${encodeURIComponent(userName())}`;
      } else if (tab === "transferred") {
        url = `${API}/tapal/transferred?username=${encodeURIComponent(userName())}`;
      } else {
        url = `${API}/tapal/completed`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, safeRole]);

  // If the current role's tab set doesn't include the active tab (e.g. a
  // director previously left on "transferred" before role changed), fall
  // back to "new".
  useEffect(() => {
    if (!tabs.some((t) => t.key === activeTab)) setActiveTab("new");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeRole]);

  const refresh = () => loadRows(activeTab);

  // ── Actions ────────────────────────────────────────────────────────
  const handleApprovalTransfer = async (transfer, staff, remarks) => {
    try {
      const res = await fetch(
        `${API}/tapal/${transfer.id}/approve-and-assign/${safeRole}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assigned_to: staff.name,
            assigned_from: userName(),
            remarks: remarks || "",
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setProcessTransfer(null);
      refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to approve and transfer.");
    }
  };

  const handleLateralTransfer = async (transfer, staff, remarks) => {
    try {
      const res = await fetch(`${API}/tapal/${transfer.id}/transfer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: staff.name,
          assigned_from: userName(),
          remarks: remarks || "",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setProcessTransfer(null);
      refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to transfer.");
    }
  };

  const handleFinalize = async (transfer, remarks) => {
    try {
      const res = await fetch(`${API}/tapal/${transfer.id}/final-approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_from: userName(),
          remarks: remarks || "",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setProcessTransfer(null);
      refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to approve & finalize.");
    }
  };

  // ── Row renderers ─────────────────────────────────────────────────
  const renderNewRequestCard = (t) => (
    <div key={t.id} style={styles.reqCard}>
      <div style={styles.reqCardTop}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.reqFileNo}>{t.file_no || "-"}</div>
          <div style={styles.reqTitle}>{t.title}</div>
          <div style={styles.reqMeta}>
            ₹ {Number(t.cost || 0).toLocaleString("en-IN")} · {t.funding_agency}
          </div>
        </div>
        <StatusBadge t={t} />
      </div>

      <div style={styles.partiesRow}>
        <div style={styles.partyBox}>
          <div style={styles.partyLabel}>From (Current PI)</div>
          <div style={styles.partyName}>{t.from_name}</div>
          <div style={styles.partyDept}>{t.from_dept}</div>
        </div>
        <div style={styles.partyArrow}>→</div>
        <div style={styles.partyBox}>
          <div style={styles.partyLabel}>To (Incoming PI)</div>
          <div style={styles.partyName}>{t.to_name}</div>
          <div style={styles.partyDept}>{t.to_dept}</div>
        </div>
      </div>

      {t.reason && (
        <div style={styles.remarksBox}>
          <strong>Faculty remarks:</strong> {t.reason}
        </div>
      )}

      <div style={styles.actionRow}>
        <button
          style={styles.letterBtn}
          disabled={!letterUrl(t.letter_path)}
          onClick={() => window.open(letterUrl(t.letter_path), "_blank")}
        >
          📄 View Transfer Letter
        </button>
      </div>

      <div style={styles.actionRow}>
        <button style={styles.processBtn} onClick={() => setProcessTransfer(t)}>
          Process Request →
        </button>
        <button style={styles.trackBtn} onClick={() => setTrackTransfer(t)}>
          View / Track
        </button>
      </div>
    </div>
  );

  const renderHistoryCard = (t) => (
    <div key={t.id} style={styles.historyCard}>
      <div style={styles.historyCardTop}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.historyProjTitle}>{t.title}</div>
          <div style={styles.historyMeta}>
            {t.file_no || "-"} · {t.from_name} → {t.to_name}
          </div>
        </div>
        <StatusBadge t={t} />
      </div>
      <OfficeTimeline t={t} />
      <div style={styles.actionRow}>
        <button style={styles.trackBtn} onClick={() => setTrackTransfer(t)}>
          View / Track
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.breadcrumb}>
          <span
            style={styles.breadcrumbLink}
            onClick={() => onNavigate && onNavigate("home")}
          >
            Home
          </span>
          <span style={styles.breadcrumbSep}>›</span>
          <span
            style={styles.breadcrumbLink}
            onClick={() => onNavigate && onNavigate("projects")}
          >
            Projects
          </span>
          <span style={styles.breadcrumbSep}>›</span>
          <span style={styles.breadcrumbCurrent}>
            Project Transfer Requests
          </span>
        </div>
        <h1 style={styles.title}>Project Transfer Requests</h1>
        <div style={styles.subtitle}>CSRC Office — Anna University</div>
      </div>

      {/* Logged-in identity strip */}
      <div style={styles.identityBar}>
        <span style={styles.identityChip}>
          {ROLE_ICON[safeRole] || "🟢"} {userName()}{" "}
          <span style={styles.identityRole}>({ROLE_LABEL[safeRole]})</span>
        </span>
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.key ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === "new" && rows.length > 0 && activeTab === "new" && (
              <span style={styles.tabBadge}>{rows.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={styles.tabContent}>
        {loading ? (
          <div style={styles.emptyBox}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={styles.emptyBox}>
            {activeTab === "new" &&
              `No pending transfer requests at the ${ROLE_LABEL[safeRole]} level.`}
            {activeTab === "transferred" &&
              `No requests forwarded by the ${ROLE_LABEL[safeRole]} tier yet.`}
            {activeTab === "completed" && "No completed transfer requests yet."}
          </div>
        ) : activeTab === "new" ? (
          <div style={styles.reqGrid}>{rows.map(renderNewRequestCard)}</div>
        ) : (
          <div style={styles.historyList}>{rows.map(renderHistoryCard)}</div>
        )}
      </div>

      {/* Modals */}
      {processTransfer && (
        <ProcessModal
          transfer={processTransfer}
          viewingRole={safeRole}
          onClose={() => setProcessTransfer(null)}
          onApprovalTransfer={handleApprovalTransfer}
          onLateralTransfer={handleLateralTransfer}
          onFinalize={handleFinalize}
        />
      )}

      {trackTransfer && (
        <TrackModal
          transfer={trackTransfer}
          onClose={() => setTrackTransfer(null)}
        />
      )}
    </div>
  );
};

// ─── Light theme styles (matches faculty-side ProjectTransfer.jsx) ────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fb",
    padding: "28px 32px 60px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1f2937",
  },

  header: { marginBottom: 18 },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 10,
  },
  breadcrumbLink: { cursor: "pointer" },
  breadcrumbSep: { opacity: 0.5 },
  breadcrumbCurrent: { color: "#374151", fontWeight: 600 },
  title: { fontSize: 26, fontWeight: 700, margin: 0, color: "#111827" },
  subtitle: { fontSize: 13, color: "#9ca3af", marginTop: 4 },

  identityBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
    flexWrap: "wrap",
  },
  identityChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    background: "#f3f4f6",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
  },
  identityRole: { fontWeight: 500, color: "#6b7280" },

  tabsRow: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
    borderBottom: "1px solid #e5e7eb",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    border: "none",
    background: "transparent",
    fontSize: 13.5,
    fontWeight: 600,
    color: "#6b7280",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    marginBottom: -1,
  },
  tabBtnActive: { color: "#7c3aed", borderBottom: "2px solid #7c3aed" },
  tabBadge: {
    background: "#7c3aed",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 999,
    padding: "1px 7px",
    minWidth: 18,
    textAlign: "center",
  },

  tabContent: { minHeight: 200 },

  emptyBox: {
    padding: "30px 14px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13.5,
    background: "#fafafa",
    borderRadius: 10,
    border: "1px dashed #e5e7eb",
  },

  reqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: 18,
  },
  reqCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "16px 18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  reqCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  reqFileNo: { fontSize: 11.5, color: "#9ca3af", fontWeight: 600 },
  reqTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    marginTop: 2,
    lineHeight: 1.35,
  },
  reqMeta: { fontSize: 12, color: "#059669", fontWeight: 600, marginTop: 4 },

  partiesRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    background: "#f9fafb",
    border: "1px solid #eef0f2",
    borderRadius: 10,
    padding: "10px 12px",
  },
  partyBox: { flex: 1, minWidth: 0 },
  partyLabel: {
    fontSize: 10.5,
    color: "#9ca3af",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  partyName: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#1f2937",
    marginTop: 2,
  },
  partyDept: { fontSize: 11.5, color: "#6b7280", marginTop: 1 },
  partyArrow: { fontSize: 16, color: "#9ca3af", flexShrink: 0 },

  remarksBox: {
    marginTop: 12,
    fontSize: 12.5,
    color: "#4b5563",
    background: "#f3f4f6",
    borderRadius: 8,
    padding: "8px 12px",
    lineHeight: 1.5,
  },

  actionRow: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
  letterBtn: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  processBtn: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: "#7c3aed",
    color: "#fff",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  trackBtn: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },

  historyList: { display: "flex", flexDirection: "column", gap: 14 },
  historyCard: {
    border: "1px solid #eef0f2",
    borderRadius: 12,
    padding: "14px 16px",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  historyCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  historyProjTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#1f2937",
    maxWidth: 420,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  historyMeta: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

  timelineRow: {
    display: "flex",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 2,
  },
  timelineStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    width: 84,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    border: "2px solid",
    flexShrink: 0,
  },
  timelineLabel: { fontSize: 10, textAlign: "center", fontWeight: 600 },
  timelineBar: { flex: 1, height: 2, marginTop: -18 },

  historySection: { marginTop: 18 },
  historySectionTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 8,
  },
  historyEntry: {
    display: "flex",
    gap: 10,
    fontSize: 12,
    color: "#4b5563",
    padding: "6px 0",
    borderBottom: "1px dashed #eef0f2",
  },
  historyEntryDate: { color: "#9ca3af", flexShrink: 0, width: 76 },
  historyEntryText: { flex: 1 },
  historyEntryRemarks: { color: "#6b7280", fontStyle: "italic" },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,24,39,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalBox: {
    width: 480,
    maxWidth: "92vw",
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #f1f2f4",
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
  },
  modalClose: {
    border: "none",
    background: "transparent",
    fontSize: 16,
    cursor: "pointer",
    color: "#9ca3af",
  },
  modalBody: {
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  modalProjectBox: {
    background: "#f9fafb",
    border: "1px solid #eef0f2",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 12,
  },
  modalProjectFile: { fontSize: 11.5, color: "#9ca3af", fontWeight: 600 },
  modalProjectTitle: {
    fontSize: 13.5,
    fontWeight: 600,
    color: "#1f2937",
    marginTop: 2,
  },
  modalProjectCost: {
    fontSize: 12.5,
    color: "#059669",
    fontWeight: 600,
    marginTop: 4,
  },
  modalProjectParties: { fontSize: 12, color: "#4b5563", marginTop: 6 },
  modalLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#374151",
    marginTop: 10,
    marginBottom: 6,
  },
  modalSelect: {
    padding: "9px 12px",
    borderRadius: 9,
    border: "1px solid #d1d5db",
    fontSize: 13,
    color: "#1f2937",
    background: "#fff",
  },
  modalTextarea: {
    padding: "9px 12px",
    borderRadius: 9,
    border: "1px solid #d1d5db",
    fontSize: 13,
    color: "#1f2937",
    resize: "vertical",
    fontFamily: "inherit",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid #f1f2f4",
    background: "#fafbfc",
    position: "sticky",
    bottom: 0,
  },
  modalCancelBtn: {
    padding: "9px 18px",
    borderRadius: 9,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  modalSubmitBtn: {
    padding: "9px 18px",
    borderRadius: 9,
    border: "none",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
  },

  modeChoices: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 4,
  },
  modeBtnApproval: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
  },
  modeBtnLateral: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1e40af",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
  },
  finalizeNote: {
    fontSize: 12.5,
    color: "#374151",
    background: "#f9fafb",
    border: "1px solid #eef0f2",
    borderRadius: 9,
    padding: "10px 12px",
    lineHeight: 1.5,
    marginTop: 4,
  },
};

export default ProjectTransferRequests;
