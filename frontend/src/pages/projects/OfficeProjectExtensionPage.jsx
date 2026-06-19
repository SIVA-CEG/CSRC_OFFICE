import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficeProjectExtensionPage.css";
import { useProjectContext, PROJECT_STAFF } from "./ProjectContext";
import ProjectApprovalTransferCell, { getProfileSignature } from "./ProjectApprovalTransferCell";
import html2pdf from "html2pdf.js";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const userRole = () => localStorage.getItem("userRole") || "assistant";
const userName = () => localStorage.getItem("userName") || "Office";

/* ─── ensureExtShape ──────────────────────────────────────────────────────── */
function ensureExtShape(item) {
  const base = JSON.parse(JSON.stringify(item));

  base.proceedingNo   = base.proceedingNo   || base.id     || "";
  base.proceedingDate = base.proceedingDate || "16-02-2026";
  base.directorName   = base.directorName   || "THE DIRECTOR, CSRC";
  base.remarks        = base.remarks        || "";

  base.sanctionedDate    = base.sanctionedDate    || "07-08-2024";
  base.originalEndDate   = base.originalEndDate   || "06-08-2025";
  base.duration          = base.duration          || "12 Months";
  base.extensionPeriod   = base.extensionPeriod   || "6 Months";
  base.revisedEndDate    = base.revisedEndDate    || "28-02-2026";
  base.totalCost         = base.totalCost         || "2,45,000";

  base.reason = base.reason || "The funding agency has extended the duration of the above mentioned project without any additional grant.";

  base.agency      = base.agency      || "BIRAC";
  base.projectId   = base.projectId   || "BIRAC/2024/001";
  base.pi          = base.pi          || { name: "Dr. P. Varalakshmi", designation: "Director", department: "Centre for Artificial Intelligence and Data Science Research & Applications", campus: "CEG Campus" };
  base.department  = base.department  || "Centre for AI and Data Science";
  base.projectScheme = base.projectScheme || "EYUVA";

  // References list
  base.references = base.references || [
    { no: 1, text: "Syndicate Resolution No.172.5.2 dt: 28.12.2005." },
    { no: 2, text: "Email from funding agency, dated 13-12-2024." },
    { no: 3, text: "Email from the funding agency (BIRAC), dated 28-10-2025." },
    { no: 4, text: "Letter No.NIL, dated 16-02-2026 & received on 26-02-2026 from, Anna University." },
  ];

  // Previous extension history table
  base.previousExtensions = base.previousExtensions || [
    { period: "31-12-2025", approval: "email from the funding agency (BIRAC), 28-10-2025" },
  ];

  base.hasLetter     = base.hasLetter ?? true;
  base.transferHistory = base.transferHistory || [];

  // Type-specific defaults
  if (base.extensionType === "with") {
    base.grantAmount      = base.grantAmount      || "";
    base.grantAmountWords = base.grantAmountWords || "";
    base.bankAccount      = base.bankAccount      || "";
    base.ifscCode         = base.ifscCode         || "";
    base.bankBranch       = base.bankBranch       || "";
  }

  return base;
}

/* ─── Transfer Timeline ───────────────────────────────────────────────────── */
function TransferTimeline({ item }) {
  const history = item.transferHistory || [];
  if (history.length === 0) {
    return (
      <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "28px 0", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
        No transfer history yet. This item is still with the assistant.
      </div>
    );
  }
  const S = {
    dot: (ok) => ({ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0, background: ok ? "#dcfce7" : "#dbeafe", color: ok ? "#16a34a" : "#2563eb", border: `2px solid ${ok ? "#16a34a" : "#2563eb"}` }),
    badge: (ok) => ({ marginTop: "4px", fontSize: "10px", padding: "2px 9px", borderRadius: "999px", display: "inline-block", background: ok ? "#f0fdf4" : "#eff6ff", color: ok ? "#16a34a" : "#2563eb", border: `1px solid ${ok ? "#bbf7d0" : "#bfdbfe"}` }),
    roleChip: (r) => ({ fontSize: "10px", padding: "1px 7px", borderRadius: "999px", fontWeight: 600, background: r === "superintendent" ? "#dbeafe" : r === "director" ? "#fce7f3" : "#dcfce7", color: r === "superintendent" ? "#1d4ed8" : r === "director" ? "#be185d" : "#15803d" }),
  };
  return (
    <div style={{ padding: "8px 0" }}>
      {history.map((entry, i) => {
        const toName   = typeof entry.to   === "object" ? entry.to?.name   : entry.to;
        const toRole   = typeof entry.to   === "object" ? entry.to?.role   : null;
        const fromName = typeof entry.from === "object" ? entry.from?.name : entry.from;
        return (
          <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "28px" }}>
              <div style={S.dot(entry.approved)}>{entry.approved ? "✔" : "↪"}</div>
              {i < history.length - 1 && <div style={{ width: "2px", flex: 1, background: "#e2e8f0", marginTop: "4px", minHeight: "14px" }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: "4px" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>{entry.date}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{fromName}</span>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>→</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{toName}</span>
                {toRole && <span style={S.roleChip(toRole)}>{toRole}</span>}
              </div>
              <div style={S.badge(entry.approved)}>{entry.approved ? "✔ Approved & Forwarded" : "↪ Forwarded (Pending Approval)"}</div>
            </div>
          </div>
        );
      })}
      {item.currentHolder ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", background: "#fef9c3", color: "#ca8a04", border: "2px solid #ca8a04" }}>⏳</div>
          <div style={{ fontSize: "12px", color: "#92400e", fontWeight: 500, paddingTop: "4px" }}>Waiting for action from <strong>{item.currentHolder?.name || "Next Approver"}</strong>{item.currentHolder?.role && ` (${item.currentHolder.role})`}</div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", background: "#dcfce7", color: "#16a34a", border: "2px solid #16a34a" }}>✔</div>
          <div style={{ fontSize: "12px", color: "#15803d", fontWeight: 500, paddingTop: "4px" }}>Process Completed — Fully Approved</div>
        </div>
      )}
    </div>
  );
}

/* ─── Badges ──────────────────────────────────────────────────────────────── */
function StageBadge({ role }) {
  const map = { superintendent: { label: "With Superintendent", bg: "#dbeafe", color: "#1d4ed8" }, director: { label: "With Director", bg: "#fce7f3", color: "#be185d" }, assistant: { label: "With Assistant", bg: "#dcfce7", color: "#15803d" } };
  const s = map[role] || { label: "Pending", bg: "#f1f5f9", color: "#64748b" };
  return <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: s.bg, color: s.color }}>{s.label}</span>;
}

function StatusBadge({ status }) {
  const map = { PENDING: { label: "Pending", bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" }, TRANSFERRED: { label: "Transferred", bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" }, COMPLETED: { label: "Approved", bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" }, approved: { label: "Approved", bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" }, declined: { label: "Declined", bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444" } };
  const s = map[status] || { label: status, bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: s.bg, color: s.color }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />{s.label}
    </span>
  );
}

function StatsRow({ counts }) {
  const cards = [
    { label: "Total",    value: counts.all,      color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Pending",  value: counts.pending,  color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    { label: "Approved", value: counts.approved, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Declined", value: counts.declined, color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "14px", padding: "14px 18px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>{c.label}</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: c.color, marginTop: "4px", lineHeight: 1 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Section Heading ─────────────────────────────────────────────────────── */
const SH = ({ children }) => (
  <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
    {children}
  </h3>
);

/* ─── Editable Field ──────────────────────────────────────────────────────── */
const EF = ({ label, value, onChange, disabled, placeholder, type = "text", span = false }) => (
  <div style={span ? { gridColumn: "1 / -1" } : {}}>
    <label style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>{label}</label>
    <input type={type} disabled={disabled} value={value || ""} placeholder={placeholder || ""} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "13px", border: "1px solid #e2e8f0", background: disabled ? "#f8fafc" : "#fff", color: "#1e293b", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
  </div>
);

/* ─── Timeline Visual ─────────────────────────────────────────────────────── */
function TimelineVisual({ sanctionedDate, originalEndDate, duration, revisedEndDate, extensionPeriod }) {
  return (
    <div style={{ display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", overflowX: "auto" }}>
      {[
        { label: "Sanctioned", date: sanctionedDate, dotColor: "#1d4ed8", dotBorder: "#bfdbfe", labelColor: "#64748b" },
      ].map(n => (
        <div key={n.label} style={{ textAlign: "center", minWidth: "90px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: n.dotColor, border: `3px solid ${n.dotBorder}`, margin: "0 auto 6px" }} />
          <div style={{ fontSize: "10px", color: n.labelColor, fontWeight: 600, textTransform: "uppercase" }}>{n.label}</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginTop: "2px" }}>{n.date || "—"}</div>
        </div>
      ))}
      <div style={{ flex: 1, position: "relative", height: "40px", minWidth: "80px" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "4px", background: "#93c5fd", transform: "translateY(-50%)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: "2px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 700, color: "#1d4ed8", whiteSpace: "nowrap" }}>{duration}</div>
      </div>
      <div style={{ textAlign: "center", minWidth: "90px" }}>
        <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#f59e0b", border: "3px solid #fde68a", margin: "0 auto 6px" }} />
        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Original End</div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginTop: "2px" }}>{originalEndDate || "—"}</div>
      </div>
      <div style={{ flex: 1, position: "relative", height: "40px", minWidth: "80px" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "4px", background: "#86efac", transform: "translateY(-50%)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: "2px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", fontWeight: 700, color: "#15803d", whiteSpace: "nowrap" }}>{extensionPeriod}</div>
      </div>
      <div style={{ textAlign: "center", minWidth: "90px" }}>
        <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#15803d", border: "3px solid #bbf7d0", margin: "0 auto 6px" }} />
        <div style={{ fontSize: "10px", color: "#15803d", fontWeight: 700, textTransform: "uppercase" }}>Revised End</div>
        <div style={{ fontSize: "12px", fontWeight: 800, color: "#15803d", marginTop: "2px" }}>{revisedEndDate || "—"}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT COMPONENT — shared by both modal types, controlled by extensionType
═══════════════════════════════════════════════════════════════════════════ */
function ExtensionReport({ draft }) {
  const isWith = draft.extensionType === "with";
  const piName  = typeof draft.pi === "object" ? draft.pi?.name        : draft.pi;
  const piDesig = typeof draft.pi === "object" ? draft.pi?.designation : "";
  const piDept  = typeof draft.pi === "object" ? draft.pi?.department  : draft.department;
  const piCampus= typeof draft.pi === "object" ? draft.pi?.campus      : "";

  const S = {
    page: { width: "210mm", background: "#fff", margin: "0 auto", padding: "14mm 16mm", boxSizing: "border-box", fontFamily: "Times New Roman, serif", fontSize: "11pt", color: "#000", lineHeight: 1.5 },
    center: { textAlign: "center" },
    bold: { fontWeight: "bold" },
    section: { marginBottom: "10px" },
    table: { width: "100%", borderCollapse: "collapse", margin: "10px 0 14px", fontSize: "10.5pt" },
    th: { border: "1px solid #000", padding: "5px 10px", textAlign: "center", fontWeight: "bold", background: "#f5f5f5" },
    td: { border: "1px solid #000", padding: "5px 10px" },
    tdC: { border: "1px solid #000", padding: "5px 10px", textAlign: "center" },
    sub: { marginBottom: "12px" },
    ref: { marginBottom: "12px" },
    body: { textAlign: "justify", marginBottom: "10px" },
    sig: { textAlign: "right", marginTop: "36px", fontWeight: "bold" },
    to: { marginTop: "24px" },
    copy: { marginTop: "16px" },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ ...S.center, marginBottom: "6px" }}>
        <div style={{ ...S.bold, fontSize: "13pt" }}>Centre for Sponsored Research and Consultancy (CSRC)</div>
        <div style={{ fontStyle: "italic" }}>(formerly known as CTDT)</div>
        <div>Anna University, Chennai - 600 025.</div>
      </div>

      {/* Proc No & Date */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div><span style={S.bold}>Proceedings No.{draft.proceedingNo}</span></div>
        <div>{draft.proceedingDate}</div>
      </div>

      {/* Sub */}
      <div style={S.sub}>
        <span style={S.bold}>Sub: </span>Anna University – {draft.agency} Project –{" "}
        <span style={S.bold}>{draft.projectTitle}</span> by{" "}
        <span style={S.bold}>Extension of Project period</span>
        {isWith ? " with additional grant" : ""} – Sanction – Accorded
      </div>

      {/* Ref */}
      <div style={S.ref}>
        <span style={S.bold}>Ref: </span>
        {(draft.references || []).map((r, i) => (
          <div key={i} style={{ paddingLeft: i === 0 ? "0" : "28px" }}>
            {i === 0 ? "" : ""}{r.no || i + 1}.{" "}{r.text}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>* * * * *</div>

      {/* Body paragraph */}
      <div style={S.body}>
        The {draft.agency} has sanctioned a project entitled{" "}
        <span style={S.bold}>"{draft.projectTitle}"</span> under{" "}
        <span style={S.bold}>"{draft.projectScheme}"</span> to{" "}
        <span style={S.bold}>{piName}</span>,{" "}
        {piDesig ? <span>{piDesig}, </span> : null}
        {piDept}
        {piCampus ? `, ${piCampus}` : ""}, as the Principal Investigator for the period of{" "}
        <span style={S.bold}>{draft.duration}</span> from{" "}
        <span style={S.bold}>{draft.sanctionedDate}</span> to{" "}
        <span style={S.bold}>{draft.originalEndDate}</span>
        {draft.totalCost ? <> at a total cost of <span style={S.bold}>Rs.{draft.totalCost}/- </span></> : ""} vide reference second cited above.
      </div>

      {/* Previous extensions table — only if there are any */}
      {(draft.previousExtensions || []).length > 0 && (
        <>
          <div style={S.body}>
            Further, the funding agency has already extended the tenure of the above mentioned project as per the details given below:
          </div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Extension Period</th>
                <th style={S.th}>Funding agency approval</th>
              </tr>
            </thead>
            <tbody>
              {(draft.previousExtensions || []).map((ext, i) => (
                <tr key={i}>
                  <td style={S.tdC}>{ext.period}</td>
                  <td style={S.td}>{ext.approval}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Current extension paragraph */}
      <div style={S.body}>
        Now, the funding agency has <span style={S.bold}>extended the duration of the above mentioned project up to {draft.revisedEndDate}</span>,{" "}
        {isWith
          ? <>with an additional grant of <span style={S.bold}>Rs.{draft.grantAmount}/- ({draft.grantAmountWords})</span> (vide reference {draft.grantRefNo || "cited above"}). </>
          : "without any additional grant (vide reference third cited). "}
        In this connection, permission is hereby accorded to the Principal Investigator,{" "}
        {piName}, {piDesig ? `${piDesig}, ` : ""}
        {piDept}
        {piCampus ? `, ${piCampus}` : ""}, to carry out the project till{" "}
        <span style={S.bold}>{draft.revisedEndDate}</span>.
      </div>

      {/* Bank details paragraph — only for "with" type */}
      {isWith && draft.bankAccount && (
        <div style={S.body}>
          The expenditure for the above project will be debitable under M.H.No. {draft.mhNo || "——"}.
          The amount may be credited to the Bank Account No. <span style={S.bold}>{draft.bankAccount}</span>,
          IFSC Code: <span style={S.bold}>{draft.ifscCode}</span>, {draft.bankBranch}.
        </div>
      )}

      {draft.remarks && (
        <div style={{ ...S.body, fontStyle: "italic", color: "#333" }}>
          <span style={S.bold}>Note: </span>{draft.remarks}
        </div>
      )}

      {/* Signature */}
      <div style={S.sig}>{draft.directorName || "DIRECTOR, CSRC"}</div>

      {/* To */}
      <div style={S.to}>
        <div style={S.bold}>To</div>
        <div>The {piDesig || "Director"},</div>
        <div>{piDept},</div>
        {piCampus && <div>{piCampus},</div>}
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Copy to */}
      <div style={S.copy}>
        <div style={S.bold}>Copy to :</div>
        <div>1. {piName}, {piDesig ? `${piDesig}, ` : ""}{piDept}{piCampus ? `, ${piCampus}` : ""} – MENT.</div>
        <div>2. CSRC – 3</div>
        <div>3. CSRC – 4</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MANAGE MODAL — shared for both types, report reacts to extensionType
═══════════════════════════════════════════════════════════════════════════ */
function ManageModal({ item, editable, onSave, onClose, onDecide, userRole: role }) {
  const [tab, setTab]             = useState("details");
  const [draft, setDraft]         = useState(() => ensureExtShape(item));
  const [isEditing, setIsEditing] = useState(false);
  const reportRef = useRef(null);
  const isWith = draft.extensionType === "with";

  const downloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf().set({ margin: [8, 8, 8, 8], filename: `${draft.id || "Extension"}.pdf`, image: { type: "jpeg", quality: 1 }, html2canvas: { scale: 3, useCORS: true, scrollY: 0 }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(reportRef.current).save();
  };

  const fe = editable && isEditing; // fields editable
  const holderRole  = draft.currentHolder?.role;
  const isCompleted = !draft.currentHolder && draft.transferHistory?.length > 0;
  const isPending   = draft.status === "PENDING" || draft.status === "TRANSFERRED";
  const sc = { superintendent: { bg: "#dbeafe", color: "#1d4ed8" }, director: { bg: "#fce7f3", color: "#be185d" }, assistant: { bg: "#dcfce7", color: "#15803d" } }[holderRole] || { bg: "#f3f4f6", color: "#374151" };

  const set = (key) => (val) => setDraft(d => ({ ...d, [key]: val }));
  const setPI = (key) => (val) => setDraft(d => ({ ...d, pi: typeof d.pi === "object" ? { ...d.pi, [key]: val } : val }));

  // Reference helpers
  const patchRef = (i, val) => setDraft(d => ({ ...d, references: d.references.map((r, idx) => idx === i ? { ...r, text: val } : r) }));
  const addRef   = () => setDraft(d => ({ ...d, references: [...d.references, { no: d.references.length + 1, text: "" }] }));
  const delRef   = (i) => setDraft(d => ({ ...d, references: d.references.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, no: idx + 1 })) }));

  // Previous extensions helpers
  const patchPrevExt  = (i, patch) => setDraft(d => ({ ...d, previousExtensions: d.previousExtensions.map((e, idx) => idx === i ? { ...e, ...patch } : e) }));
  const addPrevExt    = () => setDraft(d => ({ ...d, previousExtensions: [...(d.previousExtensions || []), { period: "", approval: "" }] }));
  const delPrevExt    = (i) => setDraft(d => ({ ...d, previousExtensions: d.previousExtensions.filter((_, idx) => idx !== i) }));

  const handleSave = () => { onSave(draft); setIsEditing(false); };

  const tabBtn = (active) => ({ padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: active ? "#1d4ed8" : "#64748b", borderBottom: active ? "3px solid #1d4ed8" : "3px solid transparent" });
  const piName = typeof draft.pi === "object" ? draft.pi?.name : draft.pi;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#f8fafc", borderRadius: "16px", width: "min(960px, 96vw)", height: "calc(100vh - 32px)", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px", background: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
              PROJECT EXTENSION ({isWith ? "WITH" : "WITHOUT"} FINANCIAL SUPPORT) — {draft.id}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: 1.3, maxWidth: "640px" }}>{draft.projectTitle}</div>
            {draft.currentHolder ? (
              <div style={{ marginTop: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: sc.bg, color: sc.color }}>
                  {holderRole === "superintendent" ? "🔵" : holderRole === "director" ? "🔴" : "🟢"} Currently with {draft.currentHolder?.name} ({holderRole})
                </span>
              </div>
            ) : isCompleted && (
              <div style={{ marginTop: "8px" }}><span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#dcfce7", color: "#15803d" }}>✔ Completed</span></div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {editable && tab === "details" && !isEditing && <button style={{ background: "#2563eb", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 13px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }} onClick={() => setIsEditing(true)}>✏️ Edit</button>}
            {tab === "report" && <button onClick={downloadPDF} style={{ background: "#16a34a", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 13px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}>📄 Download PDF</button>}
            <button style={{ background: "#ef4444", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 13px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }} onClick={onClose}>✕ Close</button>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: "4px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <button style={tabBtn(tab === "details")} onClick={() => setTab("details")}>📋 Full Details &amp; Tracking</button>
          <button style={tabBtn(tab === "report")}  onClick={() => setTab("report")}>📄 Proceedings Report</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: tab === "report" ? "#e5e7eb" : "#f8fafc" }}>
          {tab === "details" ? (
            <div>
              {/* Project Details */}
              <SH>Project Details</SH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <EF label="Request ID"            value={draft.id}          onChange={() => {}} disabled />
                <EF label="Funding Agency"        value={draft.agency}      onChange={set("agency")}      disabled={!fe} />
                <EF label="Project Scheme"        value={draft.projectScheme} onChange={set("projectScheme")} disabled={!fe} />
                <EF label="Total Cost (₹)"        value={draft.totalCost}   onChange={set("totalCost")}   disabled={!fe} />
                <EF label="PI Name"               value={typeof draft.pi === "object" ? draft.pi?.name        : draft.pi}          onChange={setPI("name")}        disabled={!fe} span />
                <EF label="PI Designation"        value={typeof draft.pi === "object" ? draft.pi?.designation : ""}                onChange={setPI("designation")} disabled={!fe} />
                <EF label="Department"            value={typeof draft.pi === "object" ? draft.pi?.department  : draft.department}   onChange={setPI("department")}  disabled={!fe} span />
                <EF label="Campus"                value={typeof draft.pi === "object" ? draft.pi?.campus      : ""}                onChange={setPI("campus")}      disabled={!fe} />
                <div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "3px" }}>Status</div>
                  <StatusBadge status={draft.status} />
                </div>
              </div>

              {/* Extension Timeline Visual */}
              <SH>Extension Timeline</SH>
              <TimelineVisual sanctionedDate={draft.sanctionedDate} originalEndDate={draft.originalEndDate} duration={draft.duration} revisedEndDate={draft.revisedEndDate} extensionPeriod={draft.extensionPeriod} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Original End Date</div><div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{draft.originalEndDate || "—"}</div></div>
                <div style={{ fontSize: "20px", color: "#94a3b8" }}>→</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: "11px", color: "#15803d", fontWeight: 600, textTransform: "uppercase" }}>Revised End Date</div><div style={{ fontSize: "14px", fontWeight: 800, color: "#15803d" }}>{draft.revisedEndDate || "—"}</div></div>
                <span style={{ background: "#dcfce7", color: "#15803d", fontWeight: 700, fontSize: "12px", padding: "4px 12px", borderRadius: "999px", border: "1px solid #bbf7d0" }}>+{draft.extensionPeriod}</span>
              </div>

              {/* Timeline dates — editable */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <EF label="Sanctioned / Start Date" value={draft.sanctionedDate}  onChange={set("sanctionedDate")}  disabled={!fe} placeholder="DD-MM-YYYY" />
                <EF label="Original End Date"        value={draft.originalEndDate} onChange={set("originalEndDate")} disabled={!fe} placeholder="DD-MM-YYYY" />
                <EF label="Original Duration"        value={draft.duration}        onChange={set("duration")}        disabled={!fe} placeholder="e.g. 12 Months" />
                <EF label="Extension Period"         value={draft.extensionPeriod} onChange={set("extensionPeriod")} disabled={!fe} placeholder="e.g. 6 Months" />
                <EF label="Revised End Date"         value={draft.revisedEndDate}  onChange={set("revisedEndDate")}  disabled={!fe} placeholder="DD-MM-YYYY" />
              </div>

              {/* Proceedings */}
              <SH>Proceedings &amp; Reference</SH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <EF label="Proceeding No"   value={draft.proceedingNo}   onChange={set("proceedingNo")}   disabled={!fe} placeholder="CSRC/CTDT/2026/OBS" />
                <EF label="Proceeding Date" value={draft.proceedingDate} onChange={set("proceedingDate")} disabled={!fe} placeholder="DD-MM-YYYY" />
                <EF label="Director Name"   value={draft.directorName}   onChange={set("directorName")}   disabled={!fe} placeholder="THE DIRECTOR, CSRC" />
              </div>

              {/* References */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                <div style={{ padding: "10px 14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>References</div>
                {(draft.references || []).map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#94a3b8", fontWeight: 700, minWidth: "20px", fontSize: "12px" }}>{r.no}.</span>
                    {fe ? (
                      <>
                        <input value={r.text} onChange={e => patchRef(i, e.target.value)}
                          style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", background: "#fff", color: "#1e293b", outline: "none", fontFamily: "inherit" }} />
                        <button onClick={() => delRef(i)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", cursor: "pointer" }}>✕</button>
                      </>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#374151" }}>{r.text}</span>
                    )}
                  </div>
                ))}
                {fe && <div style={{ padding: "10px 14px" }}><button onClick={addRef} style={{ border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>➕ Add Reference</button></div>}
              </div>

              {/* Previous Extensions Table */}
              <SH>Previous Extensions (if any)</SH>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead><tr style={{ background: "#f8fafc" }}>
                    {["Extension Period", "Funding Agency Approval", fe ? "Actions" : ""].filter(Boolean).map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {(draft.previousExtensions || []).map((ext, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 14px" }}>
                          {fe ? <input value={ext.period} onChange={e => patchPrevExt(i, { period: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", background: "#fff", outline: "none", fontFamily: "inherit" }} /> : <span style={{ fontWeight: 600 }}>{ext.period}</span>}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {fe ? <input value={ext.approval} onChange={e => patchPrevExt(i, { approval: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", background: "#fff", outline: "none", fontFamily: "inherit" }} /> : <span style={{ color: "#64748b" }}>{ext.approval}</span>}
                        </td>
                        {fe && <td style={{ padding: "10px 14px" }}><button onClick={() => delPrevExt(i)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", cursor: "pointer" }}>🗑</button></td>}
                      </tr>
                    ))}
                    {(draft.previousExtensions || []).length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "12px" }}>No previous extensions</td></tr>}
                  </tbody>
                </table>
                {fe && <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9" }}><button onClick={addPrevExt} style={{ border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>➕ Add Previous Extension</button></div>}
              </div>

              {/* Financial Support fields — only for "with" type */}
              {isWith && (
                <>
                  <SH>Additional Grant Details</SH>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    <EF label="Grant Amount (₹)"      value={draft.grantAmount}      onChange={set("grantAmount")}      disabled={!fe} placeholder="e.g. 5,00,000" />
                    <EF label="Amount in Words"       value={draft.grantAmountWords} onChange={set("grantAmountWords")} disabled={!fe} placeholder="Rupees Five Lakhs Only" span />
                    <EF label="Grant Reference No."   value={draft.grantRefNo}       onChange={set("grantRefNo")}       disabled={!fe} placeholder="vide reference no." />
                    <EF label="M.H. No. (Account)"   value={draft.mhNo}             onChange={set("mhNo")}             disabled={!fe} placeholder="M.H.No." />
                  </div>
                  <SH>Bank Details</SH>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    <EF label="Bank Account No." value={draft.bankAccount} onChange={set("bankAccount")} disabled={!fe} />
                    <EF label="IFSC Code"         value={draft.ifscCode}   onChange={set("ifscCode")}   disabled={!fe} />
                    <EF label="Bank Branch"       value={draft.bankBranch} onChange={set("bankBranch")} disabled={!fe} span />
                  </div>
                </>
              )}

              {/* Supporting Document */}
              <SH>Supporting Document</SH>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", background: draft.hasLetter ? "#f0fdf4" : "#fff7ed", border: `1px solid ${draft.hasLetter ? "#bbf7d0" : "#fed7aa"}`, fontSize: "13px", fontWeight: 600, color: draft.hasLetter ? "#15803d" : "#c2410c" }}>
                <span style={{ fontSize: "18px" }}>{draft.hasLetter ? "📎" : "⚠️"}</span>
                {draft.hasLetter ? "Funding Agency Request Letter — Attached" : "No supporting letter attached by PI"}
              </div>

              {/* Remarks / Note */}
              <SH>Remarks / Additional Note</SH>
              <textarea disabled={!fe} value={draft.remarks || ""} onChange={e => setDraft({ ...draft, remarks: e.target.value })} rows={3} placeholder="Add remarks or conditions (optional)..." style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", resize: "vertical", background: fe ? "#fff" : "#f8fafc", color: "#1e293b", boxSizing: "border-box", marginBottom: "20px", fontFamily: "inherit" }} />

              {/* Transfer Tracking */}
              <SH>Transfer Tracking</SH>
              <TransferTimeline item={draft} />

              {/* Director Decision */}
              {editable && !isEditing && role === "director" && isPending && (
                <div style={{ marginTop: "20px", padding: "16px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "12px" }}>Final Decision</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => onDecide(draft.id, "approved", draft.remarks)} style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>✓ Approve Extension</button>
                    <button onClick={() => onDecide(draft.id, "declined", draft.remarks)} style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>✕ Decline</button>
                  </div>
                </div>
              )}

              {editable && isEditing && (
                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button className="btn-approve" onClick={handleSave}>💾 Save Changes</button>
                  <button className="btn-edit" onClick={() => { setDraft(ensureExtShape(item)); setIsEditing(false); }}>Cancel</button>
                </div>
              )}
            </div>
          ) : (
            /* Report Tab — live-preview, reacts to draft edits */
            <div ref={reportRef}>
              <ExtensionReport draft={draft} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING — Type Selection Cards
═══════════════════════════════════════════════════════════════════════════ */
function TypeSelectionLanding({ onSelect }) {
  const cards = [
    {
      type: "without",
      icon: "📅",
      title: "Extension without Financial Support",
      subtitle: "No-cost extension",
      description: "The funding agency extends the project duration without releasing any additional grant. Only the project period is revised.",
      features: [
        "Project period extension sanction",
        "No additional grant amount",
        "\"without any additional grant\" wording in report",
        "Full CSRC proceedings with previous extension history",
      ],
      accent: "#0369a1",
      accentLight: "#f0f9ff",
      accentBorder: "#bae6fd",
      tag: "No Additional Grant",
      tagBg: "#e0f2fe",
      tagColor: "#0369a1",
    },
    {
      type: "with",
      icon: "💰",
      title: "Extension with Financial Support",
      subtitle: "Extension with additional grant",
      description: "The funding agency extends the project duration along with an additional grant amount to be credited to the PI's bank account.",
      features: [
        "Project period extension sanction",
        "Additional grant amount & bank details",
        "\"with an additional grant of Rs.X/-\" wording",
        "Full CSRC proceedings with bank credit details",
      ],
      accent: "#15803d",
      accentLight: "#f0fdf4",
      accentBorder: "#bbf7d0",
      tag: "With Additional Grant",
      tagBg: "#dcfce7",
      tagColor: "#15803d",
    },
  ];

  return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>CSRC — Project Extension Module</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "0 0 12px", lineHeight: 1.2 }}>Select Extension Type</h1>
        <p style={{ fontSize: "15px", color: "#64748b", margin: 0, maxWidth: "500px" }}>Both types generate official CSRC extension proceedings. Choose based on whether the funding agency is releasing additional funds.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", maxWidth: "760px", width: "100%" }}>
        {cards.map(card => (
          <button key={card.type} onClick={() => onSelect(card.type)}
            style={{ background: "#fff", border: `2px solid ${card.accentBorder}`, borderRadius: "20px", padding: "32px", textAlign: "left", cursor: "pointer", transition: "all 0.18s ease", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = card.accent; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = card.accentBorder; }}>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: card.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>{card.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: card.tagBg, color: card.tagColor }}>{card.tag}</span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{card.title}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{card.subtitle}</div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>{card.description}</p>

            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {card.features.map(f => (
                <li key={f} style={{ fontSize: "12px", color: "#475569", marginBottom: "5px", display: "flex", alignItems: "flex-start", gap: "7px" }}>
                  <span style={{ color: card.accent, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px", borderTop: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: card.accent }}>Get Started →</span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>CSRC Proceedings</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function OfficeProjectExtensionPage() {
  const navigate = useNavigate();
  const role     = userRole();
  const [mounted, setMounted] = useState(false);

  // null = show landing; "without" | "with" = show sub-page
  const [extType, setExtType] = useState(null);

  const {
    extActive, setExtActive,
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

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  const myTransferred = useMemo(() =>
    extTransferred.filter(i =>
      role === "superintendent" ? i.currentHolder?.role === "superintendent" :
      role === "director"       ? i.currentHolder?.role === "director"       : true
    ), [extTransferred, role]);

  const sourceData =
    activeTab === "active"      ? (role === "assistant" ? extActive : myTransferred) :
    activeTab === "transferred" ? extTransferred :
    extCompleted;

  // Filter by extType if selected
  const typeFilteredSource = extType
    ? sourceData.filter(r => (r.extensionType || "without") === extType)
    : sourceData;

  const counts = {
    all:      typeFilteredSource.length,
    pending:  typeFilteredSource.filter(r => r.status === "PENDING" || r.status === "TRANSFERRED").length,
    approved: typeFilteredSource.filter(r => r.status === "COMPLETED").length,
    declined: typeFilteredSource.filter(r => r.status === "declined").length,
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return typeFilteredSource.filter(r => {
      const matchFilter = filter === "all" ? true : filter === "pending" ? (r.status === "PENDING" || r.status === "TRANSFERRED") : filter === "approved" ? r.status === "COMPLETED" : filter === "declined" ? r.status === "declined" : true;
      const matchSearch = !q || r.projectTitle?.toLowerCase().includes(q) || r.pi?.name?.toLowerCase().includes(q) || (typeof r.pi === "string" && r.pi.toLowerCase().includes(q)) || r.agency?.toLowerCase().includes(q) || r.id?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [typeFilteredSource, filter, search]);

  const today = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

  const handleApproveTransfer = (item, staff) => {
    const mySig = getProfileSignature(role);
    const stamped = { ...item, signatures: { ...(item.signatures || {}), [role]: mySig || true }, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: true }] };
    ext_transfer(stamped, staff); showToast(`Approved & transferred to ${staff.name}`);
  };
  const handlePlainTransfer = (item, staff) => {
    const updated = { ...item, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: false }] };
    ext_transfer(updated, staff); showToast(`Transferred to ${staff.name}`);
  };
  const handleApproveForward = (item, staff) => {
    const mySig = getProfileSignature(role);
    const stamped = { ...item, signatures: { ...(item.signatures || {}), [role]: mySig || true }, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: true }] };
    ext_forwardToDirector(stamped, staff); showToast(`Approved & forwarded to ${staff.name}`);
  };
  const handlePlainForward = (item, staff) => {
    const updated = { ...item, currentHolder: staff, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: false }] };
    ext_updateTransferred(updated); showToast(`Transferred to ${staff.name}`);
  };
  const handleDecide = (id, decision, remarks) => {
    const item = [...extActive, ...extTransferred].find(r => r.id === id);
    if (!item) return;
    if (decision === "approved") ext_complete({ ...item, remarks });
    else ext_updateTransferred({ ...item, status: "declined", remarks });
    setManageItem(null);
    showToast(`Request ${id} ${decision === "approved" ? "approved ✓" : "declined ✗"}`, decision === "approved" ? "success" : "error");
  };
  const handleSaveManaged = (updated) => {
    if (role === "assistant" && activeTab === "active") setExtActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    else ext_updateTransferred(updated);
    setManageItem(null);
  };

  const tabs = role === "assistant"
    ? [{ key: "active", label: `New Requests (${extActive.length})` }, { key: "transferred", label: `Transferred (${extTransferred.length})` }, { key: "completed", label: `Completed (${extCompleted.length})` }]
    : role === "superintendent"
    ? [{ key: "active", label: `In My Queue (${myTransferred.length})` }, { key: "transferred", label: `All Transferred (${extTransferred.length})` }, { key: "completed", label: `Completed (${extCompleted.length})` }]
    : [{ key: "active", label: `Awaiting Approval (${myTransferred.length})` }, { key: "completed", label: `Completed (${extCompleted.length})` }];

  const isWith = extType === "with";

  /* ── Landing ── */
  if (!extType) {
    return (
      <div className={`project-dashboard ${mounted ? "fs-loaded" : ""}`}>
        <div className="fs-top-nav">
          <button className="fs-btn-back" onClick={() => navigate("/projects/project-requests")}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </button>
          <div className="fs-nav-right">
            <span className={`fs-role-chip fs-role-${role}`}>{role === "assistant" ? "🟢" : role === "superintendent" ? "🔵" : "🔴"} {role}</span>
          </div>
        </div>
        <TypeSelectionLanding onSelect={setExtType} />
      </div>
    );
  }

  /* ── Sub-page ── */
  return (
    <div className={`project-dashboard ${mounted ? "fs-loaded" : ""}`}>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 999999, padding: "12px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", background: toast.type === "success" ? "#f0fdf4" : "#fef2f2", color: toast.type === "success" ? "#15803d" : "#b91c1c", border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>{toast.msg}</div>
      )}

      <div className="fs-top-nav">
        <button className="fs-btn-back" onClick={() => setExtType(null)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Extension Type
        </button>
        <div className="fs-nav-right">
          <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px", background: isWith ? "#dcfce7" : "#e0f2fe", color: isWith ? "#15803d" : "#0369a1" }}>
            {isWith ? "💰 With Financial Support" : "📅 Without Financial Support"}
          </span>
          <span className={`fs-role-chip fs-role-${role}`}>{role === "assistant" ? "🟢" : role === "superintendent" ? "🔵" : "🔴"} {role}</span>
        </div>
      </div>

      <div className="fs-header">
        <h1 className="fs-header-title">{isWith ? "💰 Extension with Financial Support" : "📅 Extension without Financial Support"}</h1>
        <p className="fs-header-sub">{isWith ? "Project period extension with an additional grant release" : "No-cost extension — project period revised without additional funding"}</p>
      </div>

      <StatsRow counts={counts} />

      <div className="tab-switcher">
        {tabs.map(t => <button key={t.key} className={activeTab === t.key ? "active" : ""} onClick={() => setActiveTab(t.key)}>{t.label}</button>)}
      </div>

      <div style={{ display: "flex", gap: "12px", margin: "16px 0", flexWrap: "wrap", alignItems: "center" }}>
        <div className="fs-search-bar" style={{ flex: 1, margin: 0 }}>
          <div className="fs-search-inner">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by project, PI, agency, ID..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="fs-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "pending", "approved", "declined"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", border: filter === f ? "2px solid #1d4ed8" : "1px solid #e2e8f0", background: filter === f ? "#eff6ff" : "#fff", color: filter === f ? "#1d4ed8" : "#64748b" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

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
            {isWith && <th>Grant (₹)</th>}
            <th>Letter</th>
            <th>Status</th>
            {(activeTab === "transferred" || (role !== "assistant" && activeTab === "active")) && <th>Stage</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={12} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>{search ? `No results for "${search}"` : "No items to display"}</td></tr>
          )}
          {filtered.map((item, idx) => {
            const piName = typeof item.pi === "object" ? item.pi?.name : item.pi;
            const piDept = typeof item.pi === "object" ? item.pi?.department : item.department;
            return (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{item.id}</td>
                <td>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{item.projectTitle}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{piName}{piDept ? ` · ${piDept?.split(",")[0]}` : ""}</div>
                </td>
                <td><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{item.agency}</span></td>
                <td style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{item.originalEndDate}</td>
                <td><span style={{ background: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, border: "1px solid #bbf7d0" }}>+{item.extensionPeriod}</span></td>
                <td style={{ fontSize: "12px", fontWeight: 700, color: "#15803d" }}>{item.revisedEndDate}</td>
                {isWith && <td style={{ fontSize: "12px", fontWeight: 700, color: "#15803d" }}>{item.grantAmount ? `₹ ${item.grantAmount}` : "—"}</td>}
                <td><span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: item.hasLetter ? "#f0fdf4" : "#fff7ed", color: item.hasLetter ? "#15803d" : "#c2410c" }}>{item.hasLetter ? "✓ Yes" : "✗ No"}</span></td>
                <td><StatusBadge status={item.status} /></td>
                {(activeTab === "transferred" || (role !== "assistant" && activeTab === "active")) && <td><StageBadge role={item.currentHolder?.role} /></td>}
                <td>
                  <div className="fs-actions">
                    <button className="btn-view" onClick={() => setManageItem(item)}>👁 View</button>
                    {role === "assistant" && activeTab === "active" && <ProjectApprovalTransferCell item={item} userRole={role} onApproveTransfer={handleApproveTransfer} onPlainTransfer={handlePlainTransfer} />}
                    {role === "superintendent" && activeTab === "active" && <ProjectApprovalTransferCell item={item} userRole={role} onApproveTransfer={handleApproveForward} onPlainTransfer={handlePlainForward} />}
                    {role === "director" && activeTab === "active" && <button className="btn-approve" onClick={() => handleDecide(item.id, "approved", item.remarks)}>✓ Approve</button>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {manageItem && (
        <ManageModal item={manageItem} editable={activeTab === "active"} onSave={handleSaveManaged} onClose={() => setManageItem(null)} onDecide={handleDecide} userRole={role} />
      )}
    </div>
  );
}