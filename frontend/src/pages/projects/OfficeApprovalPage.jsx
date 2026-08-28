import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import "./ProjectStaffPage.css";

// ─────────────────────────────────────────────────────────
//  API CONFIG — adjust to match how the router is mounted
// ─────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5100/api/sanctions";
// File paths stored in the DB (e.g. "uploads/appointmentMinutes/xxx.pdf")
// are relative to the BACKEND, not the frontend. Used bare in an <a href>,
// the browser resolves them against http://localhost:5173/... (the Vite
// dev server), which has no such file, so the doc viewer's link 404s /
// does nothing. Prefix with the backend's origin instead.
const SERVER_ORIGIN = "http://localhost:5100";
const fileUrl = (path) => (path ? `${SERVER_ORIGIN}/${path}` : "");

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `GET ${path} failed (${res.status})`);
  }
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `PUT ${path} failed (${res.status})`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────
//  SAFE PORTAL TARGET — avoids "Target container is not a DOM element"
// ─────────────────────────────────────────────────────────
function usePortalTarget() {
  const [target, setTarget] = useState(null);
  useEffect(() => {
    setTarget(document.body);
  }, []);
  return target;
}

// ─────────────────────────────────────────────────────────
//  DOCUMENT DEFINITIONS — keyed to actual DB columns
// ─────────────────────────────────────────────────────────
// project_faculty_details only has these 3 file columns (no advertisement /
// passbook columns exist in the schema, so those were dropped from the mock).
const APPT_DOCS = [
  {
    key: "minutes_of_meeting_path",
    label: "Minutes of Meeting",
    required: true,
  },
  {
    key: "appointment_letter_path",
    label: "Appointment Letter",
    required: true,
  },
  { key: "joining_letter_path", label: "Joining Letter", required: true },
];

// project_faculty_extensions has all 3 of these.
const EXTN_DOCS = [
  { key: "appraisal_path", label: "Performance Appraisal", required: true },
  { key: "extension_letter_path", label: "Extension Letter", required: true },
  { key: "rejoining_letter_path", label: "Rejoining Letter", required: true },
];

// ─────────────────────────────────────────────────────────
//  FIELD DEFINITIONS FOR MANAGE MODAL — snake_case, matches API response directly
// ─────────────────────────────────────────────────────────
const FIELD_DEFS = {
  appointment: [
    ["staff_name", "Staff Name", "text"],
    ["designation", "Designation", "text"],
    ["appointment_order_no", "Order No", "text"],
    ["appointment_order_date", "Order Date", "date"],
    ["contract_period_from", "Contract From", "date"],
    ["contract_period_upto", "Contract To", "date"],
    ["joining_due_date", "Joining Due", "date"],
    ["fixed_salary", "Fixed Salary (₹)", "number"],
    ["hra", "HRA (₹)", "number"],
  ],
  extension: [
    ["staff_name", "Staff Name", "text"],
    ["designation", "Designation", "text"],
    ["extension_order_no", "Extn Order No", "text"],
    ["extension_order_date", "Order Date", "date"],
    ["extension_from", "Extension From", "date"],
    ["extension_upto", "Extension To", "date"],
    ["rejoin_due_date", "Rejoining Due", "date"],
    ["fixed_salary", "Fixed Salary (₹)", "number"],
    ["hra", "HRA (₹)", "number"],
  ],
};

// ─────────────────────────────────────────────────────────
//  WORKFLOW CONFIG — 4-tier: assistant → superintendent → dd → director
// ─────────────────────────────────────────────────────────
const ROLE_LABELS = {
  assistant: "Assistant",
  superintendent: "Superviser",
  dd: "Deputy Director",
  director: "Director",
};

const STAFF_ROLE_ENDPOINT = {
  assistant: "/staff/assistants",
  superintendent: "/staff/supervisors",
  dd: "/staff/dd",
  director: "/staff/directors",
};

// Per-role: which queue endpoint to poll, and what the two action buttons do.
// approveTargets is a list of { role, action } — most stages only have one
// next role to approve into, but superviser can send an appointment
// straight to DD *or* straight to Director, so it lists both.
const STAGE_CONFIG = {
  assistant: {
    queuePath: "assigned-to-me",
    approveTargets: [{ role: "superintendent", action: "approve-and-assign" }],
    plainToRole: "assistant",
    plainAction: "transfer",
  },
  superintendent: {
    queuePath: "assigned-to-supervisor",
    approveTargets: [
      { role: "dd", action: "approve-and-assign-dd" },
      { role: "director", action: "approve-and-assign-director" },
    ],
    plainToRole: "superintendent",
    plainAction: "transfer",
  },
  dd: {
    queuePath: "assigned-to-dd",
    approveTargets: [
      { role: "director", action: "approve-and-assign-director" },
    ],
    plainToRole: "superintendent", // sends it BACK to superviser
    plainAction: "transfer-to-supervisor",
  },
  director: {
    queuePath: "assigned-to-director",
    // no transfer options — only final approve
  },
};

const STATUS_LABELS = {
  ASSIGNED: "With Assistant",
  "ASSIGNED TO SUPERVISOR": "With Superviser",
  "ASSIGNED TO DD": "With Deputy Director",
  "ASSIGNED TO DIRECTOR": "With Director",
  COMPLETED: "Completed",
};

const STATUS_BADGE_CLASS = {
  ASSIGNED: "pending",
  "ASSIGNED TO SUPERVISOR": "new",
  "ASSIGNED TO DD": "new",
  "ASSIGNED TO DIRECTOR": "danger-badge",
  COMPLETED: "verified",
};

const ACTION_LABELS = {
  APPROVE_AND_ASSIGN: "Approved & sent to Superviser",
  APPROVE_AND_ASSIGN_DD: "Approved & sent to Deputy Director",
  APPROVE_AND_ASSIGN_DIRECTOR: "Approved & sent to Director",
  TRANSFER: "Transferred (no approval)",
  TRANSFER_TO_SUPERVISOR: "Sent back to Superviser (no approval)",
  FINAL_APPROVE: "Final Approved — Completed",
};

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "—";
  const s = typeof d === "string" ? d : String(d);
  if (s.includes("-") && s.length >= 10 && s[4] === "-") {
    const [y, m, day] = s.slice(0, 10).split("-");
    return `${parseInt(day)}-${parseInt(m)}-${y}`;
  }
  return s;
};

const fmtDateTime = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const projectLabel = (r) =>
  r.project_title || r.sanction_reference_no || r.funding_agency || "—";

const fileBaseName = (path) => {
  if (!path) return "";
  const parts = String(path).split("/");
  return parts[parts.length - 1];
};

const userRole = () => sessionStorage.getItem("userRole") || "assistant";
const userName = () => sessionStorage.getItem("userName") || "Office";

// ─────────────────────────────────────────────────────────
//  SHARED ACTION-BUTTON STYLES (labeled pill buttons)
// ─────────────────────────────────────────────────────────
const baseActionBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  width: "100%",
  padding: "8px 14px",
  borderRadius: 999,
  border: "none",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const ActionBtnStyles = {
  view: {
    ...baseActionBtn,
    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  viewDocs: {
    ...baseActionBtn,
    background: "#eef2ff",
    color: "#4338ca",
    border: "1.5px solid rgba(67,56,202,0.18)",
  },
  approve: {
    ...baseActionBtn,
    background: "#dcfce7",
    color: "#15803d",
    border: "1.5px solid rgba(21,128,61,0.22)",
  },
  transferNoApproval: {
    ...baseActionBtn,
    background: "#eef1f6",
    color: "#334155",
    border: "1.5px solid #dfe3ea",
  },
};

// ─────────────────────────────────────────────────────────
//  DIRECTOR APPROVE BUTTON
// ─────────────────────────────────────────────────────────
const DirectorApproveButton = ({ item, onFinalApprove }) => {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        style={ActionBtnStyles.approve}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ width: 14, height: 14 }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Approve
      </button>
      {confirming && (
        <ConfirmDialog
          title="Final Approval"
          message="This is the final approval step. The request will move to Completed for all roles. Continue?"
          confirmLabel="✓ Confirm Approval"
          confirmColor="#059669"
          onConfirm={() => {
            onFinalApprove(item);
            setConfirming(false);
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
//  STAGE BADGE
// ─────────────────────────────────────────────────────────
const StageBadge = ({ item }) => {
  const status = (item.status || "").toUpperCase().trim();
  const label = STATUS_LABELS[status] || item.status || "Unknown";
  const cls = STATUS_BADGE_CLASS[status] || "pending";
  return (
    <span className={`ps-badge ${cls}`}>
      <span className="ps-badge-dot" />
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────
//  DOCUMENT VIEWER MODAL
// ─────────────────────────────────────────────────────────
const DocViewerModal = ({ item, docDefs, onClose }) => {
  const total = docDefs.length;
  const done = docDefs.filter((d) => !!item[d.key]).length;
  const allDone = done === total;

  const portalTarget = usePortalTarget();
  if (!portalTarget) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,15,40,0.5)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "20px",
        paddingTop: "60px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 680,
          boxShadow: "0 24px 64px rgba(15,15,40,0.22)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "24px 28px 20px",
            borderBottom: "1.5px solid #f0f1f6",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
            borderRadius: "20px 20px 0 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Document Status
              </div>
              <div
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12.5,
                  color: "#6b7280",
                  marginTop: 4,
                }}
              >
                {item.staff_name} · {projectLabel(item)}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                padding: 4,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 20, height: 20 }}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: "10px 16px",
              borderRadius: 10,
              background: allDone ? "#ecfdf5" : "#fffbeb",
              border: `1.5px solid ${allDone ? "rgba(5,150,105,0.2)" : "rgba(217,119,6,0.2)"}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {allDone ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                style={{ width: 15, height: 15, flexShrink: 0 }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                style={{ width: 15, height: 15, flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
                color: allDone ? "#065f46" : "#92400e",
              }}
            >
              {done} of {total} documents uploaded
              {allDone ? " — All complete." : ""}
            </span>
          </div>
        </div>

        <div style={{ padding: "20px 28px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {docDefs.map((def, idx) => {
              const path = item[def.key];
              const uploaded = !!path;
              return (
                <div
                  key={def.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 18px",
                    borderRadius: 12,
                    background: uploaded ? "#f0fdf4" : "#fafafa",
                    border: `1.5px solid ${uploaded ? "rgba(5,150,105,0.18)" : "#e5e7eb"}`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: uploaded ? "rgba(5,150,105,0.12)" : "#f0f0f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      color: uploaded ? "#059669" : "#9ca3af",
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      flexShrink: 0,
                      background: uploaded
                        ? "rgba(5,150,105,0.10)"
                        : "rgba(156,163,175,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={uploaded ? "#059669" : "#9ca3af"}
                      strokeWidth="2"
                      style={{ width: 16, height: 16 }}
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {def.label}
                      {def.required && (
                        <span
                          style={{
                            color: "#dc2626",
                            marginLeft: 3,
                            fontSize: 11,
                          }}
                        >
                          *
                        </span>
                      )}
                    </div>
                    {uploaded ? (
                      <div
                        style={{
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: 11.5,
                          color: "#6b7280",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fileBaseName(path)}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: 11.5,
                          color: "#d97706",
                          marginTop: 2,
                        }}
                      >
                        Not yet uploaded by faculty
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    {uploaded ? (
                      <>
                        <span
                          style={{
                            background: "#ecfdf5",
                            color: "#059669",
                            border: "1.5px solid rgba(5,150,105,0.22)",
                            fontFamily: "DM Sans, sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 20,
                          }}
                        >
                          ✓ Uploaded
                        </span>
                        <a
                          href={fileUrl(path)}
                          target="_blank"
                          rel="noreferrer"
                          title="View file"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: "1.5px solid rgba(2,132,199,0.2)",
                            background: "#e0f2fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth="2"
                            style={{ width: 13, height: 13 }}
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </a>
                      </>
                    ) : (
                      <span
                        style={{
                          background: "#fffbeb",
                          color: "#d97706",
                          border: "1.5px solid rgba(217,119,6,0.22)",
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20,
                        }}
                      >
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

// ─────────────────────────────────────────────────────────
//  TRANSFER TIMELINE (Track tab) — built from faculty_assign_history rows
// ─────────────────────────────────────────────────────────
const TransferTimeline = ({ item, history, loading }) => {
  const S = {
    wrap: { padding: "8px 0" },
    entry: { display: "flex", gap: 12, marginBottom: 14 },
    dotWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: 28,
    },
    dot: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: "bold",
      flexShrink: 0,
      background: "#dbeafe",
      color: "#2563eb",
      border: "2px solid #2563eb",
    },
    line: {
      width: 2,
      flex: 1,
      background: "#e2e8f0",
      marginTop: 4,
      minHeight: 14,
    },
    content: { flex: 1, paddingBottom: 4 },
    date: { fontSize: 11, color: "#888", marginBottom: 2 },
    transfer: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
    },
    from: { fontSize: 12, color: "#555" },
    arrow: { fontSize: 13, color: "#999" },
    to: { fontSize: 12, fontWeight: 600, color: "#1e293b" },
    actionBadge: {
      marginTop: 4,
      fontSize: 10,
      padding: "1px 8px",
      borderRadius: 999,
      background: "#eff6ff",
      color: "#2563eb",
      border: "1px solid #bfdbfe",
      display: "inline-block",
    },
    pendingEntry: { display: "flex", gap: 12 },
    pendingDot: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      background: "#fef9c3",
      color: "#ca8a04",
      border: "2px solid #ca8a04",
      flexShrink: 0,
    },
    pendingLabel: {
      fontSize: 12,
      color: "#92400e",
      fontWeight: 500,
      paddingTop: 4,
    },
  };

  if (loading) {
    return (
      <div
        style={{
          color: "#9ca3af",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          textAlign: "center",
          padding: "24px 0",
        }}
      >
        Loading history…
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div
        style={{
          color: "#9ca3af",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          textAlign: "center",
          padding: "24px 0",
        }}
      >
        No transfer history yet. This request is still with the assistant.
      </div>
    );
  }

  const status = (item.status || "").toUpperCase().trim();
  const completed = status === "COMPLETED";

  return (
    <div style={S.wrap}>
      {history.map((entry, i) => (
        <div key={entry.id || i} style={S.entry}>
          <div style={S.dotWrap}>
            <div style={S.dot}>
              {entry.action === "FINAL_APPROVE" ? "✔" : "↪"}
            </div>
            {i < history.length - 1 && <div style={S.line} />}
          </div>
          <div style={S.content}>
            <div style={S.date}>{fmtDateTime(entry.created_at)}</div>
            <div style={S.transfer}>
              <span style={S.from}>{entry.assigned_from}</span>
              <span style={S.arrow}>→</span>
              <span style={S.to}>{entry.assigned_to}</span>
            </div>
            <div style={S.actionBadge}>
              {ACTION_LABELS[entry.action] || entry.action}
            </div>
            {entry.remarks && (
              <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 3 }}>
                “{entry.remarks}”
              </div>
            )}
          </div>
        </div>
      ))}
      {completed ? (
        <div style={S.pendingEntry}>
          <div
            style={{
              ...S.pendingDot,
              background: "#dcfce7",
              color: "#16a34a",
              border: "2px solid #16a34a",
            }}
          >
            ✔
          </div>
          <div style={{ ...S.pendingLabel, color: "#15803d" }}>
            Process Completed — Fully Approved
          </div>
        </div>
      ) : (
        <div style={S.pendingEntry}>
          <div style={S.pendingDot}>⏳</div>
          <div style={S.pendingLabel}>
            Waiting for action from <strong>{item.assigned_to || "—"}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  CONFIRM DIALOG
// ─────────────────────────────────────────────────────────
const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}) => {
  const portalTarget = usePortalTarget();
  if (!portalTarget) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(15,15,40,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 380,
          padding: "24px 26px",
          boxShadow: "0 24px 64px rgba(15,15,40,0.28)",
        }}
      >
        <div
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            color: "#6b7280",
            marginBottom: 22,
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#6b7280",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              background: confirmColor,
              color: "#fff",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

// ─────────────────────────────────────────────────────────
//  TRANSFER CONTROL — 2 pill buttons; dropdown fetched from the API on demand
// ─────────────────────────────────────────────────────────
const TransferControl = ({
  item,
  role,
  stage,
  onApproveTransfer,
  onPlainTransfer,
}) => {
  const [mode, setMode] = useState(null); // null | 'approve' | 'plain'
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // { staff } | null

  // approveTargets is a list because some stages (e.g. superviser on
  // appointments) can send the request to more than one next role —
  // straight to DD, or straight to Director.
  const approveTargets = stage.approveTargets || [];
  const isMultiApprove = approveTargets.length > 1;

  useEffect(() => {
    if (!mode) return;
    let cancelled = false;
    setOptionsLoading(true);
    setOptions([]);

    if (mode === "approve") {
      Promise.all(
        approveTargets.map((t) =>
          apiGet(STAFF_ROLE_ENDPOINT[t.role]).then((rows) =>
            rows.map((s) => ({
              ...s,
              _targetRole: t.role,
              _targetAction: t.action,
            })),
          ),
        ),
      )
        .then((groups) => {
          if (!cancelled) setOptions(groups.flat());
        })
        .catch((err) => {
          console.error(err);
          if (!cancelled) setOptions([]);
        })
        .finally(() => {
          if (!cancelled) setOptionsLoading(false);
        });
    } else {
      apiGet(STAFF_ROLE_ENDPOINT[stage.plainToRole])
        .then((rows) => {
          if (cancelled) return;
          const filtered = rows
            .filter((s) => s.name !== userName())
            .map((s) => ({
              ...s,
              _targetRole: stage.plainToRole,
              _targetAction: stage.plainAction,
            }));
          setOptions(filtered);
        })
        .catch((err) => {
          console.error(err);
          if (!cancelled) setOptions([]);
        })
        .finally(() => {
          if (!cancelled) setOptionsLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const openPicker = (m) => {
    setMode(m);
    setSelectedKey("");
  };
  const closePicker = () => {
    setMode(null);
    setSelectedKey("");
  };

  const handleSelect = (e) => {
    const key = e.target.value;
    setSelectedKey(key);
    const staff = options.find((o) => `${o._targetRole}-${o.id}` === key);
    if (staff) setConfirmAction({ staff });
  };

  const runConfirmed = () => {
    if (!confirmAction) return;
    const { staff } = confirmAction;
    if (mode === "approve") {
      onApproveTransfer(item, staff, staff._targetAction);
    } else {
      onPlainTransfer(item, staff, staff._targetAction);
    }
    setConfirmAction(null);
    closePicker();
  };

  if (mode) {
    const pickerLabel =
      mode === "approve"
        ? isMultiApprove
          ? "Select Staff"
          : `Select ${ROLE_LABELS[approveTargets[0]?.role]}`
        : `Select ${ROLE_LABELS[stage.plainToRole]}`;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 10.5,
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          {pickerLabel}
        </div>
        <select
          value={selectedKey}
          onChange={handleSelect}
          autoFocus
          disabled={optionsLoading}
          style={{
            width: "100%",
            padding: "7px 10px",
            borderRadius: 8,
            border: "1.5px solid #e5e7eb",
            background: "#fff",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          <option value="" disabled>
            {optionsLoading ? "Loading…" : "Choose staff…"}
          </option>
          {mode === "approve" && isMultiApprove
            ? approveTargets.map((t) => {
                const group = options.filter((o) => o._targetRole === t.role);
                if (group.length === 0) return null;
                return (
                  <optgroup key={t.role} label={ROLE_LABELS[t.role]}>
                    {group.map((s) => (
                      <option
                        key={`${t.role}-${s.id}`}
                        value={`${t.role}-${s.id}`}
                      >
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })
            : options.map((s) => (
                <option
                  key={`${s._targetRole}-${s.id}`}
                  value={`${s._targetRole}-${s.id}`}
                >
                  {s.name}
                </option>
              ))}
        </select>
        <button
          onClick={closePicker}
          style={{
            ...baseActionBtn,
            background: "#fff",
            color: "#6b7280",
            border: "1.5px solid #e5e7eb",
          }}
        >
          Cancel
        </button>

        {confirmAction && (
          <ConfirmDialog
            title={
              mode === "approve"
                ? "Approve & Transfer"
                : "Transfer (No Approval)"
            }
            message={
              mode === "approve"
                ? `This will mark your approval and send this request to ${confirmAction.staff.name} (${ROLE_LABELS[confirmAction.staff._targetRole]}). Continue?`
                : `This will forward this request to ${confirmAction.staff.name} (${ROLE_LABELS[confirmAction.staff._targetRole]}) without recording your approval. Continue?`
            }
            confirmLabel={
              mode === "approve" ? "✓ Confirm Approval" : "↪ Confirm Transfer"
            }
            confirmColor={mode === "approve" ? "#059669" : "#475569"}
            onConfirm={runConfirmed}
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        style={ActionBtnStyles.approve}
        title={`Approve & transfer to ${approveTargets.map((t) => ROLE_LABELS[t.role]).join(" / ")}`}
        onClick={() => openPicker("approve")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ width: 14, height: 14 }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Approve &amp; Transfer
      </button>

      <button
        style={ActionBtnStyles.transferNoApproval}
        title={`Transfer to another ${ROLE_LABELS[stage.plainToRole]} (no approval)`}
        onClick={() => openPicker("plain")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ width: 14, height: 14 }}
        >
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
        Transfer (No Approval)
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  MANAGE MODAL — Details (view/edit) + Track, per role
// ─────────────────────────────────────────────────────────
const ManageModal = ({
  item,
  type,
  editable,
  onClose,
  typePrefix,
  onSaved,
}) => {
  const [tab, setTab] = useState("details");
  const [draft, setDraft] = useState(item);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fieldsEditable = editable && isEditing;
  const fields = FIELD_DEFS[type];

  const portalTarget = usePortalTarget();

  useEffect(() => {
    setDraft(item);
  }, [item]);

  useEffect(() => {
    if (tab !== "track") return;
    let cancelled = false;
    setHistoryLoading(true);
    apiGet(`${typePrefix}/assign-history/${item.id}`)
      .then((rows) => {
        if (!cancelled) setHistory(rows);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, item.id, typePrefix]);

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(15,15,40,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "20px",
    paddingTop: "60px",
    overflowY: "auto",
  };
  const modalStyle = {
    background: "#f8fafc",
    borderRadius: 20,
    width: "min(720px, 96vw)",
    maxHeight: "calc(100vh - 40px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 30px 80px rgba(15,15,40,0.28)",
  };
  const headerStyle = {
    padding: "20px 26px 16px",
    background: "#1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  };
  const tabBarStyle = {
    display: "flex",
    gap: 4,
    padding: "0 20px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
  };
  const tabBtnStyle = (active) => ({
    padding: "12px 16px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    color: active ? "#4f46e5" : "#64748b",
    borderBottom: active ? "3px solid #4f46e5" : "3px solid transparent",
    fontFamily: "DM Sans, sans-serif",
  });
  const bodyStyle = { flex: 1, overflowY: "auto", padding: "22px 26px" };

  const handleSaveClick = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const payload = {};
      fields.forEach(([key]) => {
        payload[key] = draft[key];
      });
      const res = await apiPut(`${typePrefix}/${item.id}/details`, payload);
      setIsEditing(false);
      onSaved?.(res.record);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!portalTarget) return null;

  return createPortal(
    <div
      style={overlayStyle}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <div
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 4,
              }}
            >
              {type === "appointment" ? "NEW APPOINTMENT" : "EXTENSION"} · #
              {item.id}
            </div>
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {item.staff_name}
            </div>
            <div
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                marginTop: 3,
              }}
            >
              {projectLabel(item)} · Created {fmtDate(item.created_at)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {editable && tab === "details" && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: "#2563eb",
                  border: "none",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "6px 13px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                ✏️ Edit
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "#ef4444",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 13px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div style={tabBarStyle}>
          <button
            style={tabBtnStyle(tab === "details")}
            onClick={() => setTab("details")}
          >
            📋 Details
          </button>
          <button
            style={tabBtnStyle(tab === "track")}
            onClick={() => setTab("track")}
          >
            🔄 Track
          </button>
        </div>

        <div style={bodyStyle}>
          {tab === "details" ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: 4,
                    }}
                  >
                    Faculty / PI
                  </div>
                  <div className="ps-input" style={{ background: "#f1f2f6" }}>
                    {item.pi_name || "—"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: 4,
                    }}
                  >
                    Project
                  </div>
                  <div className="ps-input" style={{ background: "#f1f2f6" }}>
                    {projectLabel(item)}
                  </div>
                </div>
                {fields.map(([key, label, kind]) => (
                  <div key={key}>
                    <label
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.6px",
                        textTransform: "uppercase",
                        color: "#9ca3af",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </label>
                    <input
                      className="ps-input"
                      type={
                        kind === "number"
                          ? "number"
                          : kind === "date"
                            ? "date"
                            : "text"
                      }
                      disabled={!fieldsEditable}
                      value={
                        kind === "date"
                          ? String(draft[key] || "").slice(0, 10)
                          : (draft[key] ?? "")
                      }
                      onChange={(e) =>
                        setDraft({ ...draft, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>

              {editable && isEditing && (
                <div>
                  {saveError && (
                    <div
                      style={{
                        color: "#dc2626",
                        fontSize: 12.5,
                        marginBottom: 10,
                      }}
                    >
                      {saveError}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="ps-btn-primary"
                      onClick={handleSaveClick}
                      disabled={saving}
                    >
                      {saving ? "Saving…" : "💾 Save Changes"}
                    </button>
                    <button
                      className="ps-back-btn"
                      disabled={saving}
                      onClick={() => {
                        setDraft(item);
                        setIsEditing(false);
                        setSaveError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <TransferTimeline
              item={item}
              history={history}
              loading={historyLoading}
            />
          )}
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

// ─────────────────────────────────────────────────────────
//  TAB BAR
// ─────────────────────────────────────────────────────────
const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
    {tabs.map((t) => {
      const isActive = active === t.key;
      return (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            fontWeight: isActive ? 700 : 500,
            border: `1.5px solid ${isActive ? t.color + "55" : "#e5e7eb"}`,
            background: isActive ? t.color + "14" : "#fff",
            color: isActive ? t.color : "#6b7280",
            transition: "all 0.18s",
            boxShadow: isActive ? `0 2px 8px ${t.color}22` : "none",
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: isActive ? t.color : "#e5e7eb",
              color: isActive ? "#fff" : "#9ca3af",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 800,
              flexShrink: 0,
              transition: "all 0.18s",
            }}
          >
            {t.count}
          </span>
          {t.label}
        </button>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────
//  REQUEST TABLE
// ─────────────────────────────────────────────────────────
const RequestTable = ({
  rows,
  type,
  role,
  stage,
  tab,
  onViewDocs,
  onManage,
  onApproveTransfer,
  onPlainTransfer,
  onFinalApprove,
}) => {
  const isNew = type === "appointment";
  const isActionableTab = tab === "new"; // "New Requests" / "In My Queue" / "Awaiting Approval"

  if (rows.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "52px 20px",
          color: "#9ca3af",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 14,
        }}
      >
        No records in this category.
      </div>
    );
  }

  return (
    <div className="ps-table-wrap">
      <table className="ps-table" style={{ minWidth: 900 }}>
        <thead>
          <tr>
            <th className="ps-sl-num">Sl.</th>
            <th>Staff Name</th>
            <th>Designation</th>
            <th>Project</th>
            <th>{isNew ? "Contract From" : "Extn From"}</th>
            <th>{isNew ? "Contract To" : "Extn To"}</th>
            <th>Salary</th>
            <th>Stage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td className="ps-sl-num">{i + 1}</td>
              <td className="ps-name-cell">{r.staff_name}</td>
              <td style={{ fontSize: 12.5 }}>{r.designation}</td>
              <td style={{ fontSize: 12, color: "#6b7280" }}>
                {projectLabel(r)}
              </td>
              <td
                style={{
                  fontVariantNumeric: "tabular-nums",
                  color: "#4b5563",
                  fontSize: 12.5,
                }}
              >
                {fmtDate(isNew ? r.contract_period_from : r.extension_from)}
              </td>
              <td
                style={{
                  fontVariantNumeric: "tabular-nums",
                  color: "#4b5563",
                  fontSize: 12.5,
                }}
              >
                {fmtDate(isNew ? r.contract_period_upto : r.extension_upto)}
              </td>
              <td style={{ color: "#374151", fontSize: 13 }}>
                ₹{parseInt(r.fixed_salary || 0).toLocaleString("en-IN")}
              </td>
              <td>
                <StageBadge item={r} />
              </td>
              <td>
                <div
                  className="ps-action-group"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    minWidth: 190,
                  }}
                >
                  <button
                    style={ActionBtnStyles.viewDocs}
                    title="View Documents"
                    onClick={() => onViewDocs(r)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: 15, height: 15 }}
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    View Documents
                  </button>

                  <button
                    style={ActionBtnStyles.view}
                    title="View / Edit / Track"
                    onClick={() => onManage(r)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: 15, height: 15 }}
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                  </button>

                  {isActionableTab && role !== "director" && (
                    <TransferControl
                      item={r}
                      role={role}
                      stage={stage}
                      onApproveTransfer={onApproveTransfer}
                      onPlainTransfer={onPlainTransfer}
                    />
                  )}

                  {isActionableTab && role === "director" && (
                    <DirectorApproveButton
                      item={r}
                      onFinalApprove={onFinalApprove}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  SHARED PANEL LOGIC — used by both Appointments & Extensions
// ─────────────────────────────────────────────────────────
function useFacultyWorkflow(typePrefix, stageOverride = null) {
  const role = userRole();
  const stage =
    stageOverride?.[role] || STAGE_CONFIG[role] || STAGE_CONFIG.assistant;
  const [tab, setTab] = useState("new");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manageItem, setManageItem] = useState(null);
  const [docItem, setDocItem] = useState(null);

  const loadRows = async (currentTab) => {
    setLoading(true);
    setError("");
    try {
      let path;
      if (currentTab === "new") path = `${typePrefix}/${stage.queuePath}`;
      else if (currentTab === "transferred")
        path = `${typePrefix}/transferred-by-me`;
      else path = `${typePrefix}/completed-by-me`;

      const data = await apiGet(
        `${path}?username=${encodeURIComponent(userName())}`,
      );
      setRows(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load records.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, typePrefix, role]);

  const refresh = () => loadRows(tab);

  const handleApproveTransfer = async (item, staffOption, action) => {
    try {
      await apiPut(
        `${typePrefix}/${item.id}/${action || stage.approveTargets?.[0]?.action}`,
        {
          assigned_to: staffOption.name,
          assigned_from: userName(),
          remarks: "",
        },
      );
      refresh();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to approve & transfer.");
    }
  };

  const handlePlainTransfer = async (item, staffOption, action) => {
    try {
      await apiPut(`${typePrefix}/${item.id}/${action || stage.plainAction}`, {
        assigned_to: staffOption.name,
        assigned_from: userName(),
        remarks: "",
      });
      refresh();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to transfer.");
    }
  };

  const handleFinalApprove = async (item) => {
    try {
      await apiPut(`${typePrefix}/${item.id}/final-approve`, {
        assigned_from: userName(),
        remarks: "",
      });
      refresh();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to approve.");
    }
  };

  const tabs =
    role === "director"
      ? [
          {
            key: "new",
            label: "Awaiting Approval",
            count: tab === "new" ? rows.length : undefined,
            color: "#dc2626",
          },
          {
            key: "completed",
            label: "Completed",
            count: tab === "completed" ? rows.length : undefined,
            color: "#059669",
          },
        ]
      : [
          {
            key: "new",
            label:
              role === "assistant"
                ? "New Requests"
                : role === "superintendent"
                  ? "In My Queue"
                  : "In My Queue",
            count: tab === "new" ? rows.length : undefined,
            color: "#4f46e5",
          },
          {
            key: "transferred",
            label: role === "assistant" ? "Transferred" : "All Transferred",
            count: tab === "transferred" ? rows.length : undefined,
            color: "#a78bfa",
          },
          {
            key: "completed",
            label: "Completed",
            count: tab === "completed" ? rows.length : undefined,
            color: "#059669",
          },
        ];

  return {
    role,
    stage,
    tab,
    setTab,
    tabs,
    rows,
    loading,
    error,
    manageItem,
    setManageItem,
    docItem,
    setDocItem,
    handleApproveTransfer,
    handlePlainTransfer,
    handleFinalApprove,
    refresh,
  };
}

// ─────────────────────────────────────────────────────────
//  APPOINTMENTS PANEL
// ─────────────────────────────────────────────────────────
const AppointmentsPanel = () => {
  const p = useFacultyWorkflow("/appointments");

  return (
    <>
      <TabBar tabs={p.tabs} active={p.tab} onChange={p.setTab} />
      <div className="ps-table-card">
        {p.error && (
          <div style={{ padding: 16, color: "#dc2626", fontSize: 13 }}>
            {p.error}
          </div>
        )}
        {p.loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "52px 20px",
              color: "#9ca3af",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        ) : (
          <RequestTable
            rows={p.rows}
            type="appointment"
            role={p.role}
            stage={p.stage}
            tab={p.tab}
            onViewDocs={p.setDocItem}
            onManage={p.setManageItem}
            onApproveTransfer={p.handleApproveTransfer}
            onPlainTransfer={p.handlePlainTransfer}
            onFinalApprove={p.handleFinalApprove}
          />
        )}
      </div>

      {p.manageItem && (
        <ManageModal
          item={p.manageItem}
          type="appointment"
          editable={p.tab === "new"}
          typePrefix="/appointments"
          onClose={() => p.setManageItem(null)}
          onSaved={(updated) => {
            p.setManageItem(updated);
            p.refresh();
          }}
        />
      )}
      {p.docItem && (
        <DocViewerModal
          item={p.docItem}
          docDefs={APPT_DOCS}
          onClose={() => p.setDocItem(null)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
//  EXTENSIONS PANEL
// ─────────────────────────────────────────────────────────
const ExtensionsPanel = () => {
  const EXTN_STAGE_CONFIG = {
    assistant: {
      queuePath: "assigned-to-me",
      approveTargets: [
        { role: "superintendent", action: "approve-and-assign" },
      ],
      plainToRole: "assistant",
      plainAction: "transfer",
    },
    superintendent: {
      queuePath: "assigned-to-supervisor",
      approveTargets: [
        { role: "dd", action: "approve-and-assign-dd" },
        { role: "director", action: "approve-and-assign-director" },
      ],
      plainToRole: "superintendent",
      plainAction: "transfer",
    },
    dd: {
      queuePath: "assigned-to-dd",
      approveTargets: [
        { role: "director", action: "approve-and-assign-director" },
      ],
      plainToRole: "superintendent",
      plainAction: "transfer-to-supervisor",
    },
    director: {
      queuePath: "assigned-to-director",
    },
  };
  const p = useFacultyWorkflow("/faculty-extensions", EXTN_STAGE_CONFIG);

  return (
    <>
      <TabBar tabs={p.tabs} active={p.tab} onChange={p.setTab} />
      <div className="ps-table-card">
        {p.error && (
          <div style={{ padding: 16, color: "#dc2626", fontSize: 13 }}>
            {p.error}
          </div>
        )}
        {p.loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "52px 20px",
              color: "#9ca3af",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        ) : (
          <RequestTable
            rows={p.rows}
            type="extension"
            role={p.role}
            stage={p.stage}
            tab={p.tab}
            onViewDocs={p.setDocItem}
            onManage={p.setManageItem}
            onApproveTransfer={p.handleApproveTransfer}
            onPlainTransfer={p.handlePlainTransfer}
            onFinalApprove={p.handleFinalApprove}
          />
        )}
      </div>

      {p.manageItem && (
        <ManageModal
          item={p.manageItem}
          type="extension"
          editable={p.tab === "new"}
          typePrefix="/faculty-extensions"
          onClose={() => p.setManageItem(null)}
          onSaved={(updated) => {
            p.setManageItem(updated);
            p.refresh();
          }}
        />
      )}
      {p.docItem && (
        <DocViewerModal
          item={p.docItem}
          docDefs={EXTN_DOCS}
          onClose={() => p.setDocItem(null)}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
//  ENTRY CARDS
// ─────────────────────────────────────────────────────────
const OfficeEntryCards = ({ onNew, onExtension }) => (
  <>
    <div className="ps-inner-header">
      <div className="ps-inner-title-wrap">
        <div className="ps-inner-title">Appointment Approvals</div>
        <div className="ps-inner-sub">
          Office verification and approval of faculty-submitted requests
        </div>
      </div>
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 20,
        maxWidth: 700,
      }}
    >
      <div
        className="ps-sub-card"
        style={{ "--sc": "#4f46e5", "--sg": "rgba(79,70,229,0.15)" }}
        onClick={onNew}
      >
        <div className="ps-card-top">
          <div className="ps-card-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 13h6M9 17h4" />
            </svg>
          </div>
          <div className="ps-card-arrow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
        <div className="ps-card-body">
          <div className="ps-card-title">New Appointment Approvals</div>
          <div className="ps-card-desc">
            Review and approve new staff appointment orders submitted by
            faculty.
          </div>
        </div>
        <div className="ps-card-glow-bar" />
      </div>

      <div
        className="ps-sub-card"
        style={{ "--sc": "#a78bfa", "--sg": "rgba(167,139,250,0.15)" }}
        onClick={onExtension}
      >
        <div className="ps-card-top">
          <div className="ps-card-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </div>
          <div className="ps-card-arrow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
        <div className="ps-card-body">
          <div className="ps-card-title">Extension Approvals</div>
          <div className="ps-card-desc">
            Review and approve staff appointment extensions submitted by
            faculty.
          </div>
        </div>
        <div className="ps-card-glow-bar" />
      </div>
    </div>
  </>
);

// ─────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────
const OfficeApprovalsPage = ({ onBack, onNavigate, defaultView }) => {
  const [view, setView] = useState(defaultView || "entry");
  const role = userRole();
  const roleLabel = ROLE_LABELS[role] || role;

  return (
    <div className="ps-inner">
      <div style={{ marginBottom: 20 }}>
        <button
          className="ps-back-btn"
          onClick={() => {
            if (view !== "entry") setView("entry");
            else onBack && onBack();
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {view === "entry" ? "Projects" : "Approval Home"}
        </button>
      </div>

      {view === "entry" && (
        <OfficeEntryCards
          onNew={() => setView("appointments")}
          onExtension={() => setView("extensions")}
        />
      )}

      {view === "appointments" && (
        <>
          <div className="ps-inner-header">
            <div className="ps-inner-title-wrap">
              <div className="ps-inner-title">New Appointment Approvals</div>
              <div className="ps-inner-sub">
                Assistant → Superviser → Deputy Director → Director workflow ·
                Logged in as {roleLabel}
              </div>
            </div>
          </div>
          <AppointmentsPanel />
        </>
      )}

      {view === "extensions" && (
        <>
          <div className="ps-inner-header">
            <div className="ps-inner-title-wrap">
              <div className="ps-inner-title">Extension Approvals</div>
              <div className="ps-inner-sub">
                Assistant → Superviser → Deputy Director → Director workflow ·
                Logged in as {roleLabel}
              </div>
            </div>
          </div>
          <ExtensionsPanel />
        </>
      )}
    </div>
  );
};

export default OfficeApprovalsPage;
