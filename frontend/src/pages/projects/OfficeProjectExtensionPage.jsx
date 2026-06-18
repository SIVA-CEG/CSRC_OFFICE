import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficeProjectExtensionPage.css";
import { useProjectContext, PROJECT_STAFF } from "./ProjectContext";
import ProjectApprovalTransferCell, { getProfileSignature } from "./ProjectApprovalTransferCell";
import OfficeProjectReport, { OfficeReportModal, TrackModal } from "./OfficeProjectReport";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const userRole = () => localStorage.getItem("userRole") || "assistant";
const userName = () => localStorage.getItem("userName") || "Office";

/* ─── ensureExtShape ──────────────────────────────────────────────────────── */
function ensureExtShape(item) {
  const base = JSON.parse(JSON.stringify(item));

  base.proceedingNo = base.proceedingNo || base.id || "";
  base.proceedingDate = base.proceedingDate || "18-06-2026";
  base.directorName = base.directorName || "THE DIRECTOR, CSRC";
  base.remarks = base.remarks || "Approved for testing purposes.";

  base.sanctionedDate =
    base.sanctionedDate || "01-01-2024";

  base.originalEndDate =
    base.originalEndDate || "31-12-2025";

  base.duration =
    base.duration || "24 Months";

  base.extensionPeriod =
    base.extensionPeriod || "12 Months";

  base.revisedEndDate =
    base.revisedEndDate || "31-12-2026";

  base.reason =
    base.reason ||
    "Additional time required for project completion, testing and validation.";

  base.agency =
    base.agency || "SERB";

  base.projectId =
    base.projectId || "SERB/2026/001";

  base.pi =
    base.pi || "Dr. Siva Kumar";

  base.department =
    base.department || "Computer Science and Engineering";

  base.hasLetter =
    base.hasLetter ?? true;

  base.transferHistory = base.transferHistory || [];

  return base;
}

/* ─── Transfer Timeline ───────────────────────────────────────────────────── */
function TransferTimeline({ item }) {
  const history = item.transferHistory || [];

  if (history.length === 0) {
    return (
      <div style={{
        color: "#94a3b8", fontSize: "13px", textAlign: "center",
        padding: "28px 0", background: "#f8fafc", borderRadius: "10px",
        border: "1px dashed #cbd5e1",
      }}>
        No transfer history yet. This item is still with the assistant.
      </div>
    );
  }

  const S = {
    wrap: { padding: "8px 0" },
    entry: { display: "flex", gap: "12px", marginBottom: "14px" },
    dotWrap: {
      display: "flex", flexDirection: "column",
      alignItems: "center", minWidth: "28px",
    },
    dot: (approved) => ({
      width: "24px", height: "24px", borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "12px", fontWeight: "bold", flexShrink: 0,
      background: approved ? "#dcfce7" : "#dbeafe",
      color: approved ? "#16a34a" : "#2563eb",
      border: `2px solid ${approved ? "#16a34a" : "#2563eb"}`,
    }),
    line: {
      width: "2px", flex: 1, background: "#e2e8f0",
      marginTop: "4px", minHeight: "14px",
    },
    content: { flex: 1, paddingBottom: "4px" },
    date: { fontSize: "11px", color: "#94a3b8", marginBottom: "2px" },
    transfer: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
    from: { fontSize: "12px", color: "#64748b" },
    arrow: { fontSize: "13px", color: "#94a3b8" },
    to: { fontSize: "12px", fontWeight: 700, color: "#1e293b" },
    roleBadge: (role) => ({
      fontSize: "10px", padding: "1px 7px", borderRadius: "999px", fontWeight: 600,
      background:
        role === "superintendent" ? "#dbeafe" :
        role === "director"       ? "#fce7f3" : "#dcfce7",
      color:
        role === "superintendent" ? "#1d4ed8" :
        role === "director"       ? "#be185d" : "#15803d",
    }),
    statusBadge: (approved) => ({
      marginTop: "4px", fontSize: "10px", padding: "2px 9px",
      borderRadius: "999px", display: "inline-block",
      background: approved ? "#f0fdf4" : "#eff6ff",
      color: approved ? "#16a34a" : "#2563eb",
      border: `1px solid ${approved ? "#bbf7d0" : "#bfdbfe"}`,
    }),
  };

  return (
    <div style={S.wrap}>
      {history.map((entry, i) => {
        const toName   = typeof entry.to   === "object" ? entry.to?.name   : entry.to;
        const toRole   = typeof entry.to   === "object" ? entry.to?.role   : null;
        const fromName = typeof entry.from === "object" ? entry.from?.name : entry.from;
        return (
          <div key={i} style={S.entry}>
            <div style={S.dotWrap}>
              <div style={S.dot(entry.approved)}>
                {entry.approved ? "✔" : "↪"}
              </div>
              {i < history.length - 1 && <div style={S.line} />}
            </div>
            <div style={S.content}>
              <div style={S.date}>{entry.date}</div>
              <div style={S.transfer}>
                <span style={S.from}>{fromName}</span>
                <span style={S.arrow}>→</span>
                <span style={S.to}>{toName}</span>
                {toRole && <span style={S.roleBadge(toRole)}>{toRole}</span>}
              </div>
              <div style={S.statusBadge(entry.approved)}>
                {entry.approved
                  ? "✔ Approved & Forwarded"
                  : "↪ Forwarded (Pending Approval)"}
              </div>
            </div>
          </div>
        );
      })}

      {/* Terminal node */}
      {item.currentHolder ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", background: "#fef9c3", color: "#ca8a04",
            border: "2px solid #ca8a04",
          }}>⏳</div>
          <div style={{ fontSize: "12px", color: "#92400e", fontWeight: 500, paddingTop: "4px" }}>
            Waiting for action from{" "}
            <strong>{item.currentHolder?.name || "Next Approver"}</strong>
            {item.currentHolder?.role && ` (${item.currentHolder.role})`}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", background: "#dcfce7", color: "#16a34a",
            border: "2px solid #16a34a",
          }}>✔</div>
          <div style={{ fontSize: "12px", color: "#15803d", fontWeight: 500, paddingTop: "4px" }}>
            Process Completed — Fully Approved
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stage Badge ─────────────────────────────────────────────────────────── */
function StageBadge({ role }) {
  const map = {
    superintendent: { label: "With Superintendent", bg: "#dbeafe", color: "#1d4ed8" },
    director:       { label: "With Director",       bg: "#fce7f3", color: "#be185d" },
    assistant:      { label: "With Assistant",      bg: "#dcfce7", color: "#15803d" },
  };
  const s = map[role] || { label: "Pending", bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{
      fontSize: "11px", fontWeight: 700, padding: "3px 10px",
      borderRadius: "999px", background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

/* ─── Status Badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    PENDING:     { label: "Pending",     bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
    TRANSFERRED: { label: "Transferred", bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
    COMPLETED:   { label: "Approved",    bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
    approved:    { label: "Approved",    bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
    declined:    { label: "Declined",    bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" },
  };
  const s = map[status] || { label: status, bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "11px", fontWeight: 700, padding: "3px 10px",
      borderRadius: "999px", background: s.bg, color: s.color,
    }}>
      <span style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: s.dot, flexShrink: 0,
      }} />
      {s.label}
    </span>
  );
}

/* ─── Stats Row ───────────────────────────────────────────────────────────── */
function StatsRow({ counts }) {
  const cards = [
    { label: "Total",    value: counts.all,      color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Pending",  value: counts.pending,  color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    { label: "Approved", value: counts.approved, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Declined", value: counts.declined, color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      gap: "12px", marginBottom: "20px",
    }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: c.bg, border: `1px solid ${c.border}`,
          borderRadius: "14px", padding: "14px 18px",
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 700, color: "#64748b",
            textTransform: "uppercase", letterSpacing: "0.6px",
          }}>
            {c.label}
          </div>
          <div style={{
            fontSize: "26px", fontWeight: 800, color: c.color,
            marginTop: "4px", lineHeight: 1,
          }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Timeline Visual (inline in modal) ──────────────────────────────────── */
function TimelineVisual({ sanctionedDate, originalEndDate, duration, revisedEndDate, extensionPeriod }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0",
      background: "#f8fafc", border: "1px solid #e2e8f0",
      borderRadius: "12px", padding: "16px 20px", marginBottom: "16px",
      overflowX: "auto",
    }}>
      {/* Sanctioned */}
      <div style={{ textAlign: "center", minWidth: "90px" }}>
        <div style={{
          width: "14px", height: "14px", borderRadius: "50%",
          background: "#1d4ed8", border: "3px solid #bfdbfe",
          margin: "0 auto 6px",
        }} />
        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Sanctioned</div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginTop: "2px" }}>{sanctionedDate || "—"}</div>
      </div>

      {/* Original bar */}
      <div style={{ flex: 1, position: "relative", height: "40px", minWidth: "80px" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "4px", background: "#93c5fd", transform: "translateY(-50%)", borderRadius: "2px" }} />
        <div style={{
          position: "absolute", top: "2px", left: "50%", transform: "translateX(-50%)",
          fontSize: "10px", fontWeight: 700, color: "#1d4ed8", whiteSpace: "nowrap",
        }}>{duration}</div>
      </div>

      {/* Original End */}
      <div style={{ textAlign: "center", minWidth: "90px" }}>
        <div style={{
          width: "14px", height: "14px", borderRadius: "50%",
          background: "#f59e0b", border: "3px solid #fde68a",
          margin: "0 auto 6px",
        }} />
        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Original End</div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginTop: "2px" }}>{originalEndDate || "—"}</div>
      </div>

      {/* Extension bar */}
      <div style={{ flex: 1, position: "relative", height: "40px", minWidth: "80px" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "4px", background: "#86efac", transform: "translateY(-50%)", borderRadius: "2px" }} />
        <div style={{
          position: "absolute", top: "2px", left: "50%", transform: "translateX(-50%)",
          fontSize: "10px", fontWeight: 700, color: "#15803d", whiteSpace: "nowrap",
        }}>{extensionPeriod}</div>
      </div>

      {/* Revised End */}
      <div style={{ textAlign: "center", minWidth: "90px" }}>
        <div style={{
          width: "14px", height: "14px", borderRadius: "50%",
          background: "#15803d", border: "3px solid #bbf7d0",
          margin: "0 auto 6px",
        }} />
        <div style={{ fontSize: "10px", color: "#15803d", fontWeight: 700, textTransform: "uppercase" }}>Revised End</div>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#15803d", marginTop: "2px" }}>{revisedEndDate || "—"}</div>
      </div>
    </div>
  );
}

/* ─── Section Heading helper ──────────────────────────────────────────────── */
function SectionHeading({ children }) {
  return (
    <h3 style={{
      fontSize: "13px", fontWeight: 700, color: "#475569",
      textTransform: "uppercase", letterSpacing: "0.5px",
      margin: "0 0 12px", paddingBottom: "8px",
      borderBottom: "2px solid #e2e8f0",
    }}>
      {children}
    </h3>
  );
}

/* ─── Info Grid Row ───────────────────────────────────────────────────────── */
function InfoGrid({ fields }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: "12px", marginBottom: "20px",
    }}>
      {fields.map(({ label, val }) => (
        <div key={label}>
          <div style={{
            fontSize: "11px", color: "#94a3b8", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "3px",
          }}>
            {label}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{val || "—"}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Manage Modal ────────────────────────────────────────────────────────── */
function ManageModal({ item, editable, onSave, onClose, onDecide, userRole: role }) {
  const [tab, setTab]             = useState("details");
  const [draft, setDraft]         = useState(() => ensureExtShape(item));
  const [isEditing, setIsEditing] = useState(false);
  const reportRef = useRef(null);

const downloadPDF = () => {
  if (!reportRef.current) return;

  html2pdf()
    .set({
      margin: [8, 8, 8, 8],
      filename: `${draft.id || "Report"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    })
    .from(reportRef.current)
    .save();
};

  const fieldsEditable = editable && isEditing;
  const holderRole     = draft.currentHolder?.role;
  const isCompleted    = !draft.currentHolder && draft.transferHistory?.length > 0;

  const stageColors = {
    superintendent: { bg: "#dbeafe", color: "#1d4ed8" },
    director:       { bg: "#fce7f3", color: "#be185d" },
    assistant:      { bg: "#dcfce7", color: "#15803d" },
  };
  const sc = stageColors[holderRole] || { bg: "#f3f4f6", color: "#374151" };

  const isPending = draft.status === "PENDING" || draft.status === "TRANSFERRED";

  const handleSave = () => { onSave(draft); setIsEditing(false); };

  const tabBtn = (active) => ({
    padding: "12px 16px", border: "none", background: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: 700,
    color: active ? "#1d4ed8" : "#64748b",
    borderBottom: active ? "3px solid #1d4ed8" : "3px solid transparent",
  });

  const inputStyle = (editable) => ({
    width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "13px",
    border: "1px solid #e2e8f0", background: editable ? "#fff" : "#f8fafc",
    color: "#1e293b", boxSizing: "border-box",
    outline: "none", fontFamily: "inherit",
  });

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100000,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "16px",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#f8fafc", borderRadius: "16px",
        width: "min(960px, 96vw)", height: "calc(100vh - 32px)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "14px 20px", background: "#1e293b",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px",
            }}>
              PROJECT EXTENSION — {draft.id}
            </div>
            <div style={{
              fontSize: "14px", fontWeight: 700, color: "#fff",
              lineHeight: 1.3, maxWidth: "640px",
            }}>
              {draft.projectTitle}
            </div>
            {draft.currentHolder ? (
              <div style={{ marginTop: "8px" }}>
                <span style={{
                  fontSize: "12px", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "999px", background: sc.bg, color: sc.color,
                }}>
                  {holderRole === "superintendent" ? "🔵" : holderRole === "director" ? "🔴" : "🟢"}
                  {" "}Currently with {draft.currentHolder?.name} ({holderRole})
                </span>
              </div>
            ) : isCompleted && (
              <div style={{ marginTop: "8px" }}>
                <span style={{
                  fontSize: "12px", fontWeight: 600, padding: "3px 10px",
                  borderRadius: "999px", background: "#dcfce7", color: "#15803d",
                }}>
                  ✔ Completed
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {editable && tab === "details" && !isEditing && (
              <button
                style={{
                  background: "#2563eb", border: "none", color: "#fff",
                  borderRadius: "8px", padding: "6px 13px",
                  cursor: "pointer", fontWeight: 700, fontSize: "12px",
                }}
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit
              </button>
            )}

            {tab === "report" && (
  <button
    onClick={downloadPDF}
    style={{
      background: "#16a34a",
      border: "none",
      color: "#fff",
      borderRadius: "8px",
      padding: "6px 13px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "12px",
    }}
  >
    📄 Download PDF
  </button>
)}
            <button
              style={{
                background: "#ef4444", border: "none", color: "#fff",
                borderRadius: "8px", padding: "6px 13px",
                cursor: "pointer", fontWeight: 700, fontSize: "12px",
              }}
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{
          display: "flex", gap: "4px", padding: "0 20px",
          background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0,
        }}>
          <button style={tabBtn(tab === "details")} onClick={() => setTab("details")}>
            📋 Full Details &amp; Tracking
          </button>
          <button style={tabBtn(tab === "report")} onClick={() => setTab("report")}>
            📄 Proceedings Report
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 24px",
          background: tab === "report" ? "#e5e7eb" : "#f8fafc",
        }}>
          {tab === "details" ? (
            <div>

              {/* Project Details */}
              <SectionHeading>Project Details</SectionHeading>
              <InfoGrid fields={[
                { label: "Request ID",            val: draft.id },
                { label: "Funding Agency",        val: draft.agency },
                { label: "Project ID",            val: draft.projectId },
                { label: "Principal Investigator",val: draft.pi },
                { label: "Department",            val: draft.department?.split(",")[0] },
                { label: "CTDT Proc. No.",        val: draft.procNo },
                { label: "Submitted On",          val: draft.submittedOn },
                { label: "Status",                val: <StatusBadge status={draft.status} /> },
              ]} />

              {/* Extension Timeline visual */}
              <SectionHeading>Extension Timeline</SectionHeading>
              <TimelineVisual
                sanctionedDate={draft.sanctionedDate}
                originalEndDate={draft.originalEndDate}
                duration={draft.duration}
                revisedEndDate={draft.revisedEndDate}
                extensionPeriod={draft.extensionPeriod}
              />
              {/* Summary strip */}
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
                flexWrap: "wrap",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Original End Date</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{draft.originalEndDate || "—"}</div>
                </div>
                <div style={{ fontSize: "20px", color: "#94a3b8" }}>→</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "#15803d", fontWeight: 600, textTransform: "uppercase" }}>Revised End Date</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#15803d" }}>{draft.revisedEndDate || "—"}</div>
                </div>
                <span style={{
                  background: "#dcfce7", color: "#15803d",
                  fontWeight: 700, fontSize: "12px",
                  padding: "4px 12px", borderRadius: "999px",
                  border: "1px solid #bbf7d0",
                }}>
                  +{draft.extensionPeriod}
                </span>
              </div>

              {/* Proceedings & Reference */}
              <SectionHeading>Proceedings &amp; Reference</SectionHeading>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "12px", marginBottom: "20px",
              }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                    Proceeding No
                  </label>
                  <input
                    style={inputStyle(fieldsEditable)}
                    disabled={!fieldsEditable}
                    value={draft.proceedingNo || ""}
                    placeholder="CSRC/CTDT/2026/OBS"
                    onChange={e => setDraft({ ...draft, proceedingNo: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                    Proceeding Date
                  </label>
                  <input
                    style={inputStyle(fieldsEditable)}
                    disabled={!fieldsEditable}
                    value={draft.proceedingDate || ""}
                    placeholder="DD-MM-YYYY"
                    onChange={e => setDraft({ ...draft, proceedingDate: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                    Director Name
                  </label>
                  <input
                    style={inputStyle(fieldsEditable)}
                    disabled={!fieldsEditable}
                    value={draft.directorName || ""}
                    placeholder="THE DIRECTOR, CSRC"
                    onChange={e => setDraft({ ...draft, directorName: e.target.value })}
                  />
                </div>
              </div>

              {/* Reason for Extension */}
              <SectionHeading>Reason for Extension</SectionHeading>
              <div style={{
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: "10px", padding: "14px 16px",
                fontSize: "13px", color: "#374151", lineHeight: 1.6,
                marginBottom: "20px",
                fontStyle: draft.reason ? "normal" : "italic",
              }}>
                {draft.reason || "No reason provided."}
              </div>

              {/* Supporting Document */}
              <SectionHeading>Supporting Document</SectionHeading>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 16px", borderRadius: "10px", marginBottom: "20px",
                background: draft.hasLetter ? "#f0fdf4" : "#fff7ed",
                border: `1px solid ${draft.hasLetter ? "#bbf7d0" : "#fed7aa"}`,
                fontSize: "13px", fontWeight: 600,
                color: draft.hasLetter ? "#15803d" : "#c2410c",
              }}>
                <span style={{ fontSize: "18px" }}>{draft.hasLetter ? "📎" : "⚠️"}</span>
                {draft.hasLetter
                  ? "Funding Agency Request Letter — Attached"
                  : "No supporting letter attached by PI"}
              </div>

              {/* Remarks */}
              <SectionHeading>Remarks</SectionHeading>
              <textarea
                disabled={!fieldsEditable}
                value={draft.remarks || ""}
                onChange={e => setDraft({ ...draft, remarks: e.target.value })}
                rows={3}
                placeholder="Add remarks or conditions (optional)..."
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "10px",
                  border: "1px solid #e2e8f0", fontSize: "13px", resize: "vertical",
                  background: fieldsEditable ? "#fff" : "#f8fafc",
                  color: "#1e293b", boxSizing: "border-box", marginBottom: "20px",
                  fontFamily: "inherit",
                }}
              />

              {/* Decision Record — show when not pending */}
              {!isPending && draft.remarks && (
                <>
                  <SectionHeading>Decision Record</SectionHeading>
                  <div style={{
                    padding: "14px 16px", borderRadius: "10px", marginBottom: "20px",
                    background: draft.status === "COMPLETED" ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${draft.status === "COMPLETED" ? "#bbf7d0" : "#fecaca"}`,
                  }}>
                    <div style={{
                      fontWeight: 700, fontSize: "13px",
                      color: draft.status === "COMPLETED" ? "#15803d" : "#b91c1c",
                      marginBottom: "6px",
                    }}>
                      {draft.status === "COMPLETED" ? "✔ Extension Approved" : "✕ Extension Declined"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#374151" }}>{draft.remarks}</div>
                  </div>
                </>
              )}

              {/* Transfer Tracking */}
              <SectionHeading>Transfer Tracking</SectionHeading>
              <TransferTimeline item={draft} />

              {/* Director Decision Buttons */}
              {editable && !isEditing && role === "director" && isPending && (
                <div style={{
                  marginTop: "20px", padding: "16px", background: "#fff",
                  borderRadius: "12px", border: "1px solid #e2e8f0",
                }}>
                  <div style={{
                    fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "12px",
                  }}>
                    Final Decision
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => onDecide(draft.id, "approved", draft.remarks)}
                      style={{
                        flex: 1, padding: "10px 16px", borderRadius: "8px",
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        color: "#15803d", fontWeight: 700, fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ✓ Approve Extension
                    </button>
                    <button
                      onClick={() => onDecide(draft.id, "declined", draft.remarks)}
                      style={{
                        flex: 1, padding: "10px 16px", borderRadius: "8px",
                        background: "#fef2f2", border: "1px solid #fecaca",
                        color: "#b91c1c", fontWeight: 700, fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ✕ Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Save / Cancel when editing */}
              {editable && isEditing && (
                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button className="btn-approve" onClick={handleSave}>
                    💾 Save Changes
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => { setDraft(ensureExtShape(item)); setIsEditing(false); }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Report Tab ── */
            <div
  ref={reportRef}
  style={{
    width: "210mm",
    background: "#fff",
    margin: "0 auto",
    padding: "15mm",
    boxSizing: "border-box",
  }}
>
  <OfficeProjectReport
    reportLabel="Project Extension Order"
    title={draft.projectTitle}
    refNo={draft.id}
    meta={[
      { label: "Funding Agency", value: draft.agency },
      { label: "Project ID", value: draft.projectId },
      { label: "Principal Investigator", value: draft.pi },
      { label: "Department", value: draft.department?.split(",")[0] },
      { label: "CTDT Proc. No.", value: draft.procNo },
      { label: "Submitted On", value: draft.submittedOn },
      { label: "Proceeding No", value: draft.proceedingNo },
      { label: "Proceeding Date", value: draft.proceedingDate },
      { label: "Supporting Letter", value: draft.hasLetter ? "Attached" : "Not Attached" },
    ]}
    sections={[
      {
        heading: "Extension Timeline",
        columns: ["Milestone", "Date / Period"],
        rows: [
          ["Sanctioned Date", draft.sanctionedDate || "—"],
          ["Original End Date", draft.originalEndDate || "—"],
          ["Extension Period", draft.extensionPeriod || "—"],
          ["Revised End Date", draft.revisedEndDate || "—"],
        ],
      },
    ]}
    notes={[
      {
        label: "Reason for Extension",
        text: draft.reason,
      },
      {
        label: "Decision Remarks",
        text: draft.remarks,
      },
    ]}
    signatures={draft.signatures || {}}
    isCompleted={isCompleted}
  />
</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function OfficeProjectExtensionPage() {
  const navigate  = useNavigate();
  const role      = userRole();
  const [mounted, setMounted] = useState(false);

  const {
    extActive,   setExtActive,
    extTransferred,
    extCompleted,
    ext_transfer,
    ext_complete,
    ext_updateTransferred,
    ext_forwardToDirector,
  } = useProjectContext();

  const [activeTab,  setActiveTab]  = useState("active");
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [manageItem, setManageItem] = useState(null);
  const [toast,      setToast]      = useState(null);

  React.useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── Data source by role & tab ── */
  const myTransferred = useMemo(() =>
    extTransferred.filter(i =>
      role === "superintendent" ? i.currentHolder?.role === "superintendent" :
      role === "director"       ? i.currentHolder?.role === "director"       : true
    ), [extTransferred, role]);

  const sourceData =
    activeTab === "active"      ? (role === "assistant" ? extActive : myTransferred) :
    activeTab === "transferred" ? extTransferred :
    extCompleted;

  const counts = {
    all:      sourceData.length,
    pending:  sourceData.filter(r => r.status === "PENDING" || r.status === "TRANSFERRED").length,
    approved: sourceData.filter(r => r.status === "COMPLETED").length,
    declined: sourceData.filter(r => r.status === "declined").length,
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sourceData.filter(r => {
      const matchFilter =
        filter === "all"      ? true :
        filter === "pending"  ? (r.status === "PENDING" || r.status === "TRANSFERRED") :
        filter === "approved" ? r.status === "COMPLETED" :
        filter === "declined" ? r.status === "declined" : true;
      const matchSearch = !q ||
        r.projectTitle?.toLowerCase().includes(q) ||
        r.pi?.toLowerCase().includes(q) ||
        r.agency?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [sourceData, filter, search]);

  /* ── Date helper ── */
  const today = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

  /* ── Transfer handlers ── */
  const handleApproveTransfer = (item, staff) => {
    const mySig = getProfileSignature(role);
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), [role]: mySig || true },
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: true },
      ],
    };
    ext_transfer(stamped, staff);
    showToast(`Approved & transferred to ${staff.name}`);
  };

  const handlePlainTransfer = (item, staff) => {
    const updated = {
      ...item,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    ext_transfer(updated, staff);
    showToast(`Transferred to ${staff.name}`);
  };

  const handleApproveForward = (item, staff) => {
    const mySig = getProfileSignature(role);
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), [role]: mySig || true },
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: true },
      ],
    };
    ext_forwardToDirector(stamped, staff);
    showToast(`Approved & forwarded to ${staff.name}`);
  };

  const handlePlainForward = (item, staff) => {
    const updated = {
      ...item, currentHolder: staff,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    ext_updateTransferred(updated);
    showToast(`Transferred to ${staff.name}`);
  };

  const handleDecide = (id, decision, remarks) => {
    const item = [...extActive, ...extTransferred].find(r => r.id === id);
    if (!item) return;
    if (decision === "approved") {
      ext_complete({ ...item, remarks });
    } else {
      ext_updateTransferred({ ...item, status: "declined", remarks });
    }
    setManageItem(null);
    showToast(
      `Request ${id} ${decision === "approved" ? "approved ✓" : "declined ✗"}`,
      decision === "approved" ? "success" : "error"
    );
  };

  const handleSaveManaged = (updated) => {
    if (role === "assistant" && activeTab === "active") {
      setExtActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    } else {
      ext_updateTransferred(updated);
    }
    setManageItem(null);
  };

  /* ── Tab definitions ── */
  const tabs =
    role === "assistant"
      ? [
          { key: "active",      label: `New Requests (${extActive.length})` },
          { key: "transferred", label: `Transferred (${extTransferred.length})` },
          { key: "completed",   label: `Completed (${extCompleted.length})` },
        ]
      : role === "superintendent"
      ? [
          { key: "active",      label: `In My Queue (${myTransferred.length})` },
          { key: "transferred", label: `All Transferred (${extTransferred.length})` },
          { key: "completed",   label: `Completed (${extCompleted.length})` },
        ]
      : [
          { key: "active",      label: `Awaiting Approval (${myTransferred.length})` },
          { key: "completed",   label: `Completed (${extCompleted.length})` },
        ];

  return (
    <div className={`project-dashboard ${mounted ? "fs-loaded" : ""}`}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 999999,
          padding: "12px 20px", borderRadius: "10px",
          fontWeight: 700, fontSize: "13px",
          background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
          color:      toast.type === "success" ? "#15803d" : "#b91c1c",
          border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Top Nav */}
      <div className="fs-top-nav">
        <button className="fs-btn-back" onClick={() => navigate("/projects/project-requests")}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="fs-nav-right">
          <span className={`fs-role-chip fs-role-${role}`}>
            {role === "assistant" ? "🟢" : role === "superintendent" ? "🔵" : "🔴"} {role}
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="fs-header">
        <h1 className="fs-header-title">Project Extension Claims</h1>
        <p className="fs-header-sub">
          Review no-cost extension requests and update revised project timelines
        </p>
      </div>

      {/* Stats */}
      <StatsRow counts={counts} />

      {/* Tabs */}
      <div className="tab-switcher">
        {tabs.map(t => (
          <button
            key={t.key}
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div style={{
        display: "flex", gap: "12px", margin: "16px 0",
        flexWrap: "wrap", alignItems: "center",
      }}>
        <div className="fs-search-bar" style={{ flex: 1, margin: 0 }}>
          <div className="fs-search-inner">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by project, PI, agency, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="fs-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "pending", "approved", "declined"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "8px 14px", borderRadius: "8px",
              fontSize: "12px", fontWeight: 700, cursor: "pointer",
              border: filter === f ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
              background: filter === f ? "#eff6ff" : "#fff",
              color: filter === f ? "#1d4ed8" : "#64748b",
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Request ID</th>
            <th>Project / PI</th>
            <th>Agency</th>
            <th>Original End</th>
            <th>Extension</th>
            <th>Revised End</th>
            <th>Letter</th>
            <th>Status</th>
            {(activeTab === "transferred" ||
              (role !== "assistant" && activeTab === "active")) && <th>Stage</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={11} style={{
                textAlign: "center", padding: "40px", color: "#94a3b8",
              }}>
                {search ? `No results for "${search}"` : "No items to display"}
              </td>
            </tr>
          )}
          {filtered.map((item, idx) => (
            <tr key={item.id}>
              <td>{idx + 1}</td>
              <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{item.id}</td>
              <td>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{item.projectTitle}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {item.pi} · {item.department?.split(",")[0]}
                </div>
              </td>
              <td>
                <span style={{
                  background: "#eff6ff", color: "#1d4ed8",
                  padding: "2px 8px", borderRadius: "6px",
                  fontSize: "12px", fontWeight: 600,
                }}>
                  {item.agency}
                </span>
              </td>
              <td style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                {item.originalEndDate}
              </td>
              <td>
                <span style={{
                  background: "#f0fdf4", color: "#15803d",
                  padding: "2px 8px", borderRadius: "6px",
                  fontSize: "12px", fontWeight: 700,
                  border: "1px solid #bbf7d0",
                }}>
                  +{item.extensionPeriod}
                </span>
              </td>
              <td style={{ fontSize: "12px", fontWeight: 700, color: "#15803d" }}>
                {item.revisedEndDate}
              </td>
              <td>
                <span style={{
                  fontSize: "11px", fontWeight: 700,
                  padding: "2px 8px", borderRadius: "6px",
                  background: item.hasLetter ? "#f0fdf4" : "#fff7ed",
                  color: item.hasLetter ? "#15803d" : "#c2410c",
                }}>
                  {item.hasLetter ? "✓ Yes" : "✗ No"}
                </span>
              </td>
              <td><StatusBadge status={item.status} /></td>
              {(activeTab === "transferred" ||
                (role !== "assistant" && activeTab === "active")) && (
                <td><StageBadge role={item.currentHolder?.role} /></td>
              )}
              <td>
                <div className="fs-actions">
                  {/* Single combined View / Edit / Track / Report button */}
                  <button
                    className="btn-view"
                    onClick={() => setManageItem(item)}
                    title="View full details, track progress, edit, and report"
                  >
                    👁 View
                  </button>

                  {/* Assistant: transfer to superintendent */}
                  {role === "assistant" && activeTab === "active" && (
                    <ProjectApprovalTransferCell
                      item={item}
                      userRole={role}
                      onApproveTransfer={handleApproveTransfer}
                      onPlainTransfer={handlePlainTransfer}
                    />
                  )}

                  {/* Superintendent: forward to director */}
                  {role === "superintendent" && activeTab === "active" && (
                    <ProjectApprovalTransferCell
                      item={item}
                      userRole={role}
                      onApproveTransfer={handleApproveForward}
                      onPlainTransfer={handlePlainForward}
                    />
                  )}

                  {/* Director: final approve */}
                  {role === "director" && activeTab === "active" && (
                    <button
                      className="btn-approve"
                      onClick={() => handleDecide(item.id, "approved", item.remarks)}
                    >
                      ✓ Approve
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Manage Modal */}
      {manageItem && (
        <ManageModal
          item={manageItem}
          editable={activeTab === "active"}
          onSave={handleSaveManaged}
          onClose={() => setManageItem(null)}
          onDecide={handleDecide}
          userRole={role}
        />
      )}
    </div>
  );
}