import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficeReappropriationPage.css"; // reuses shared classes: project-dashboard, fs-*, sanctioned-table, tab-switcher
import { useProjectContext } from "./ProjectContext";
import ProjectApprovalTransferCell, { getProfileSignature } from "./ProjectApprovalTransferCell";
import html2pdf from "html2pdf.js";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const userRole = () => localStorage.getItem("userRole") || "assistant";
const userName = () => localStorage.getItem("userName") || "Office";

const HEADS = [
  { key: "nonRecurring", label: "Non-Recurring (Equipment)" },
  { key: "manpower",     label: "Manpower" },
  { key: "consumables",  label: "Consumables & Accessories" },
  { key: "travel",       label: "Travel" },
  { key: "contingency",  label: "Contingency" },
  { key: "other",        label: "Other Expenses" },
];
const headLabel = (key) => HEADS.find(h => h.key === key)?.label || key || "—";

const fmtINR = (n) => {
  const num = parseFloat(n);
  if (isNaN(num)) return "—";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2 });
};

function toIndianWords(num) {
  const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function words(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + words(n % 100) : "");
    if (n < 100000) return words(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + words(n % 1000) : "");
    if (n < 10000000) return words(Math.floor(n / 100000)) + " lakh" + (n % 100000 ? " " + words(n % 100000) : "");
    return words(Math.floor(n / 10000000)) + " crore" + (n % 10000000 ? " " + words(n % 10000000) : "");
  }
  if (!num) return "zero";
  const w = words(Math.floor(num));
  return w.charAt(0).toUpperCase() + w.slice(1) + " only";
}

const todayDisplay = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const todayDMY = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");

/* ─── Normalize an incoming request (PI submission or seed) into office shape ─── */
function ensureAdvShape(item) {
  const base = JSON.parse(JSON.stringify(item));

  base.proceedingNo   = base.proceedingNo || base.procNo || base.id || "ADV/CSRC/2026/001";
  base.proceedingDate = base.proceedingDate || todayDMY();
  base.directorName   = base.directorName || "DEAN / DIRECTOR / HOD";
  base.remarks        = base.remarks || "";
  base.transferHistory = base.transferHistory || [];

  base.projectTitle = base.projectTitle || "Development of Ti(C,N) based cermets modified by Si3N4, B4C and Cr3C2 for metal cutting application";
  base.fileNo        = base.fileNo        || "2433/CSRC-2/2020";
  base.piName         = base.piName        || "Dr. S. Balasivanandha Prabu";
  base.piDesig        = base.piDesig       || "Professor";
  base.piDept          = base.piDept        || "Department of Mechanical Engineering";
  base.piCampus        = base.piCampus      || "CEG Campus";
  base.agency           = base.agency        || "SERB";
  base.csrcProcNo       = base.csrcProcNo    || "2433/CSRC-2/2020";
  base.csrcProcDate     = base.csrcProcDate  || "10-12-2020";

  base.headKey   = base.headKey   || "consumables";
  base.allotment = base.allotment ?? 400000;
  base.incurred  = base.incurred  ?? 120000;

  base.amount             = base.amount             ?? "25000";
  base.purpose             = base.purpose             || "Conduct of departmental seminar";
  base.beneficiaryName     = base.beneficiaryName     || base.piName;
  base.settlementDate      = base.settlementDate      || "";

  base.letterSubject = base.letterSubject || "Request for release of advance";
  base.letterRef     = base.letterRef     || "";
  base.letterBody    = base.letterBody    ||
    "I am currently undertaking activities under the above project for which an advance is required as detailed below.";

  base.signedFile = base.signedFile || null;
  base.submittedOn = base.submittedOn || todayDisplay();

  return base;
}

/* ─── Convert a PI-submitted Advance Sanction record (from AdvanceSanctionsPage
     localStorage) into the office-side shape. Exported so ProjectContext can
     use it when bridging localStorage → advActive.                          ─── */
export function piAdvanceToOfficeShape(rec) {
  const hb = rec.project?.headBudgets?.[rec.form?.head] || {};
  return {
    id: rec.id,
    procNo: rec.procNo,
    proceedingNo: rec.procNo,
    fileNo: rec.project?.fileNo,
    projectTitle: rec.project?.title,
    piName: rec.project?.pi,
    piDesig: rec.project?.piDesignation,
    piDept: rec.project?.departmentFull,
    piCampus: rec.project?.campus,
    agency: rec.project?.scheme,
    csrcProcNo: rec.project?.csrcProcNo,
    csrcProcDate: rec.project?.csrcProcDate,
    headKey: rec.form?.head,
    allotment: hb.allotment,
    incurred: hb.incurred,
    amount: rec.form?.amount,
    purpose: rec.form?.purpose,
    beneficiaryName: rec.form?.beneficiaryName,
    settlementDate: rec.form?.settlementDate,
    letterSubject: rec.form?.letterSubject,
    letterRef: rec.form?.letterRef,
    letterBody: rec.form?.letterBody,
    signedFile: rec.signedFile || null,
    submittedOn: rec.submittedAt || rec.createdAt,
    status: "PENDING",
    transferHistory: [],
    currentHolder: null,
    signatures: {},
  };
}

/* ─── Shared badges (same visual language as Reap/Ext pages) ─────────────── */
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: s.bg, color: s.color }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />{s.label}
    </span>
  );
}

function StageBadge({ role }) {
  const map = {
    superintendent: { label: "With Superintendent", bg: "#dbeafe", color: "#1d4ed8" },
    director:       { label: "With Director",        bg: "#fce7f3", color: "#be185d" },
    assistant:      { label: "With Assistant",       bg: "#dcfce7", color: "#15803d" },
  };
  const s = map[role] || { label: "Pending", bg: "#f1f5f9", color: "#64748b" };
  return <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", background: s.bg, color: s.color }}>{s.label}</span>;
}

function StatsRow({ counts }) {
  const cards = [
    { label: "Total",    value: counts.all,      color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Pending",  value: counts.pending,  color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    { label: "Approved", value: counts.approved, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Declined", value: counts.declined, color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "14px", padding: "14px 18px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>{c.label}</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: c.color, marginTop: "4px", lineHeight: 1 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

function TransferTimeline({ item }) {
  const history = item.transferHistory || [];
  if (!history.length) return (
    <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "28px 0", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
      No transfer history yet. This item is still with the assistant.
    </div>
  );
  return (
    <div style={{ padding: "8px 0" }}>
      {history.map((entry, i) => {
        const toName   = typeof entry.to   === "object" ? entry.to?.name   : entry.to;
        const toRole   = typeof entry.to   === "object" ? entry.to?.role   : null;
        const fromName = typeof entry.from === "object" ? entry.from?.name : entry.from;
        const ok = entry.approved;
        return (
          <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "28px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0, background: ok ? "#dcfce7" : "#dbeafe", color: ok ? "#16a34a" : "#2563eb", border: `2px solid ${ok ? "#16a34a" : "#2563eb"}` }}>{ok ? "✔" : "↪"}</div>
              {i < history.length - 1 && <div style={{ width: "2px", flex: 1, background: "#e2e8f0", marginTop: "4px", minHeight: "14px" }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: "4px" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "2px" }}>{entry.date}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{fromName}</span>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>→</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{toName}</span>
                {toRole && <span style={{ fontSize: "10px", padding: "1px 7px", borderRadius: "999px", fontWeight: 600, background: toRole === "superintendent" ? "#dbeafe" : toRole === "director" ? "#fce7f3" : "#dcfce7", color: toRole === "superintendent" ? "#1d4ed8" : toRole === "director" ? "#be185d" : "#15803d" }}>{toRole}</span>}
              </div>
              <div style={{ marginTop: "4px", fontSize: "10px", padding: "2px 9px", borderRadius: "999px", display: "inline-block", background: ok ? "#f0fdf4" : "#eff6ff", color: ok ? "#16a34a" : "#2563eb", border: `1px solid ${ok ? "#bbf7d0" : "#bfdbfe"}` }}>{ok ? "✔ Approved & Forwarded" : "↪ Forwarded (Pending Approval)"}</div>
            </div>
          </div>
        );
      })}
      {item.currentHolder ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", background: "#fef9c3", color: "#ca8a04", border: "2px solid #ca8a04" }}>⏳</div>
          <div style={{ fontSize: "12px", color: "#92400e", fontWeight: 500, paddingTop: "4px" }}>Waiting for <strong>{item.currentHolder?.name}</strong>{item.currentHolder?.role && ` (${item.currentHolder.role})`}</div>
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

/* ─── Section heading + editable field (same primitives as Reap/Ext) ─────── */
const SH = ({ children }) => (
  <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
    {children}
  </h3>
);

const EF = ({ label, value, onChange, disabled, placeholder, type = "text", span, rows }) => (
  <div style={span ? { gridColumn: "1 / -1" } : {}}>
    <label style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>{label}</label>
    {rows ? (
      <textarea disabled={disabled} value={value || ""} placeholder={placeholder || ""} onChange={e => onChange(e.target.value)} rows={rows}
        style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "13px", border: "1px solid #e2e8f0", background: disabled ? "#f8fafc" : "#fff", color: "#1e293b", boxSizing: "border-box", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
    ) : (
      <input type={type} disabled={disabled} value={value || ""} placeholder={placeholder || ""} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "13px", border: "1px solid #e2e8f0", background: disabled ? "#f8fafc" : "#fff", color: "#1e293b", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   DOCUMENT A — Advance Sanction Proceedings (live-preview, matches PI-side format)
═══════════════════════════════════════════════════════════════════════════ */
function ReportProceedings({ draft }) {
  const P  = { fontFamily: "Times New Roman, serif", fontSize: "11pt", color: "#000", lineHeight: 1.6 };
  const B  = { fontWeight: "bold" };
  const J  = { textAlign: "justify", marginBottom: "12px" };

  const amount   = Number(draft.amount) || 0;
  const inclThis = (Number(draft.incurred) || 0) + amount;
  const balance  = (Number(draft.allotment) || 0) - inclThis;

  return (
    <div style={{ width: "210mm", background: "#fff", margin: "0 auto 24px", padding: "16mm", boxSizing: "border-box", ...P }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginBottom: "10px" }}>
        <span>Procs. No. {draft.proceedingNo}</span><span>Date: {draft.proceedingDate}</span>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <span style={B}>Sub: </span>{draft.piDept} – Project entitled "{draft.projectTitle}" – {headLabel(draft.headKey)} – Advance – Sanction – Accorded.
      </div>
      <div style={{ marginBottom: "8px" }}>
        <span style={B}>Ref: </span>CSRC Proc. No. {draft.csrcProcNo}, dated {draft.csrcProcDate}.
      </div>

      <div style={{ textAlign: "center", letterSpacing: "6px", margin: "10px 0", fontWeight: "bold" }}>*****</div>

      <div style={J}>
        Sanction is hereby accorded for a sum not exceeding <span style={B}>Rs.{fmtINR(amount)}/- (Rupees {toIndianWords(amount)})</span> towards
        an advance to meet the expenses to be incurred in connection with <span style={B}>{draft.purpose}</span> under the project
        entitled "<span style={B}>{draft.projectTitle}</span>".
      </div>

      <div style={J}>The payment shall be made in the name of "<span style={B}>{draft.beneficiaryName}</span>".</div>

      <div style={{ ...J, fontWeight: "bold" }}>
        The expenditure in this regard is debitable under the Project "{draft.projectTitle}" under the Head of account "{headLabel(draft.headKey)}".
      </div>

      <ul style={{ margin: "16px 0 16px 0", lineHeight: 2, listStyle: "none", padding: 0, maxWidth: "560px" }}>
        <li style={{ display: "flex", justifyContent: "space-between" }}><span>• Amount Allocated in the Head of A/c</span><span>Rs.{fmtINR(draft.allotment)}/-</span></li>
        <li style={{ display: "flex", justifyContent: "space-between" }}><span>• Amount incurred so far (incl. this proceedings)</span><span>Rs.{fmtINR(inclThis)}/-</span></li>
        <li style={{ display: "flex", justifyContent: "space-between" }}><span>• Balance amount available in the Head of A/c</span><span>Rs.{fmtINR(balance)}/-</span></li>
      </ul>

      {draft.settlementDate && (
        <div style={J}>
          The Principal Investigator shall settle this advance by submitting the utilisation details / vouchers on or before{" "}
          <span style={B}>{draft.settlementDate}</span>, failing which the amount is liable to be recovered from the PI's salary.
        </div>
      )}

      <div style={{ textAlign: "right", fontWeight: "bold", marginTop: "60px" }}>
        {draft.directorName}
        <div style={{ fontWeight: "normal", fontSize: "12px", marginTop: "2px" }}>(with seal)</div>
      </div>

      <div style={{ marginTop: "26px", lineHeight: 1.6 }}>
        <div>To</div>
        <div style={B}>Professor &amp; Head</div>
        <div>{draft.piDept}</div>
        <div>{draft.piCampus}, Anna University, Chennai – 600 025</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DOCUMENT B — Covering Letter (PI → CSRC Director; office views the scanned
   signed copy once uploaded, and can preview the generated text separately)
═══════════════════════════════════════════════════════════════════════════ */
function ReportLetter({ draft }) {
  const P = { fontFamily: "Times New Roman, serif", fontSize: "11pt", color: "#000", lineHeight: 1.75 };
  const B = { fontWeight: "bold" };
  const J = { textAlign: "justify", marginBottom: "12px" };
  const amount = Number(draft.amount) || 0;
  const bodyParas = (draft.letterBody || "").split("\n").filter(p => p.trim());

  return (
    <div style={{ width: "210mm", background: "#fff", margin: "0 auto", padding: "16mm", boxSizing: "border-box", ...P }}>
      <div style={{ textAlign: "center", marginBottom: "22px" }}>
        <div style={{ fontSize: "14px", letterSpacing: "0.5px" }}>{draft.piName}</div>
        <div>{draft.piDesig}, {draft.piDept}</div>
        <div>{draft.piCampus}, Anna University, Chennai – 600 025</div>
        <div style={{ borderBottom: "2px solid #000", marginTop: "6px" }} />
      </div>

      <div style={{ textAlign: "right", margin: "14px 0" }}>Date: {draft.submittedOn}</div>

      <div style={{ margin: "14px 0" }}>
        <div>To</div>
        <div style={B}>The Director,</div>
        <div>Centre for Sponsored Research and Consultancy (CSRC),</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      <div style={{ margin: "16px 0 6px" }}><span style={B}>Sub:</span> {draft.letterSubject}</div>
      {draft.letterRef && <div style={{ margin: "0 0 16px" }}><span style={B}>Ref:</span> {draft.letterRef}</div>}

      <div style={{ margin: "16px 0 10px" }}>Respected Sir / Madam,</div>

      {bodyParas.length ? bodyParas.map((p, i) => <div key={i} style={J}>{p}</div>) : <div style={J}>—</div>}

      <div style={J}>
        In this regard, I request the release of an advance amount of <span style={B}>Rs.{fmtINR(amount)}/- (Rupees {toIndianWords(amount)})</span>{" "}
        under the Head of Account "<span style={B}>{headLabel(draft.headKey)}</span>" of the above project, to be paid in favour of
        "<span style={B}>{draft.beneficiaryName}</span>", towards <span style={B}>{draft.purpose}</span>.
      </div>

      <div style={J}>
        I undertake to submit the utilisation certificate / supporting vouchers for the above advance in due course
        {draft.settlementDate ? <>, on or before <span style={B}>{draft.settlementDate}</span>,</> : ""} as per University norms.
      </div>

      <div style={J}>Kindly accord sanction at the earliest and oblige.</div>

      <div style={{ marginTop: "26px" }}>
        <div>Thanking you,</div>
        <div>Yours faithfully,</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "80px" }}>
        <div style={{ width: "44%" }}>
          <div style={{ borderBottom: "1px solid #000", height: "36px" }} />
          <div style={{ fontWeight: "bold", marginTop: "6px" }}>Signature of Principal Investigator</div>
          <div style={{ marginTop: "2px", fontSize: "12.5px" }}>{draft.piName}, {draft.piDesig}</div>
        </div>
        <div style={{ width: "44%" }}>
          <div style={{ borderBottom: "1px solid #000", height: "36px" }} />
          <div style={{ fontWeight: "bold", marginTop: "6px" }}>Countersigned by HOD</div>
          <div style={{ marginTop: "2px", fontSize: "12.5px" }}>{draft.piDept}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MANAGE MODAL — Details & Tracking / Report (both documents)
═══════════════════════════════════════════════════════════════════════════ */
function ManageModal({ item, editable, onSave, onClose, onDecide, userRole: role }) {
  const [tab, setTab]             = useState("details"); // details | report
  const [draft, setDraft]         = useState(() => ensureAdvShape(item));
  const [isEditing, setIsEditing] = useState(false);
  const procRef   = useRef(null);
  const letterRef = useRef(null);
  const fe = editable && isEditing;
  const s = (k) => (v) => setDraft(d => ({ ...d, [k]: v }));

  const holderRole  = draft.currentHolder?.role;
  const isCompleted = !draft.currentHolder && draft.transferHistory?.length > 0;
  const isPending    = draft.status === "PENDING" || draft.status === "TRANSFERRED";
  const sc = { superintendent: { bg: "#dbeafe", color: "#1d4ed8" }, director: { bg: "#fce7f3", color: "#be185d" }, assistant: { bg: "#dcfce7", color: "#15803d" } }[holderRole] || { bg: "#f3f4f6", color: "#374151" };

  const downloadDoc = (ref, filename) => {
    if (!ref.current) return;
    html2pdf().set({ margin: [8, 8, 8, 8], filename, image: { type: "jpeg", quality: 1 }, html2canvas: { scale: 3, useCORS: true, scrollY: 0 }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(ref.current).save();
  };

  const handleSave = () => { onSave(draft); setIsEditing(false); };

  const amountNum = Number(draft.amount) || 0;
  const inclThis  = (Number(draft.incurred) || 0) + amountNum;
  const balance   = (Number(draft.allotment) || 0) - inclThis;

  const tabBtn = (active) => ({ padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: active ? "#1d4ed8" : "#64748b", borderBottom: active ? "3px solid #1d4ed8" : "3px solid transparent" });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#f8fafc", borderRadius: "16px", width: "min(980px, 96vw)", height: "calc(100vh - 32px)", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px", background: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>ADVANCE SANCTION — {draft.id}</div>
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
            <button style={{ background: "#ef4444", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 13px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }} onClick={onClose}>✕ Close</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <button style={tabBtn(tab === "details")} onClick={() => setTab("details")}>📋 Full Details &amp; Tracking</button>
          <button style={tabBtn(tab === "report")}  onClick={() => setTab("report")}>📄 Documents (Proceedings &amp; Letter)</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: tab === "report" ? "#e5e7eb" : "#f8fafc" }}>
          {tab === "details" ? (
            <div>
              <SH>Request Details</SH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {[{ label: "Request ID", val: draft.id }, { label: "Proceeding No.", val: draft.proceedingNo }, { label: "Status", val: <StatusBadge status={draft.status} /> }, { label: "Submitted On", val: draft.submittedOn }].map(({ label, val }) => (
                  <div key={label}><div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "3px" }}>{label}</div><div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{val}</div></div>
                ))}
              </div>

              <SH>PI &amp; Project Info</SH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <EF label="Project Title"   value={draft.projectTitle} onChange={s("projectTitle")} disabled={!fe} span />
                <EF label="File No."        value={draft.fileNo}       onChange={s("fileNo")}       disabled={!fe} />
                <EF label="Funding Agency"  value={draft.agency}       onChange={s("agency")}       disabled={!fe} />
                <EF label="PI Name"         value={draft.piName}       onChange={s("piName")}       disabled={!fe} />
                <EF label="PI Designation"  value={draft.piDesig}      onChange={s("piDesig")}      disabled={!fe} />
                <EF label="Department"      value={draft.piDept}       onChange={s("piDept")}       disabled={!fe} span />
                <EF label="Campus"          value={draft.piCampus}     onChange={s("piCampus")}     disabled={!fe} />
                <EF label="CSRC Proc No."   value={draft.csrcProcNo}   onChange={s("csrcProcNo")}   disabled={!fe} />
                <EF label="CSRC Proc Date"  value={draft.csrcProcDate} onChange={s("csrcProcDate")} disabled={!fe} placeholder="DD-MM-YYYY" />
              </div>

              <SH>Advance Details</SH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Head of Account</label>
                  {fe ? (
                    <select value={draft.headKey} onChange={e => s("headKey")(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "13px", border: "1px solid #e2e8f0", background: "#fff", outline: "none" }}>
                      {HEADS.map(h => <option key={h.key} value={h.key}>{h.label}</option>)}
                    </select>
                  ) : <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", padding: "8px 0" }}>{headLabel(draft.headKey)}</div>}
                </div>
                <EF label="Advance Amount (₹)"    value={draft.amount}    onChange={s("amount")}    disabled={!fe} type="number" />
                <EF label="Beneficiary"           value={draft.beneficiaryName} onChange={s("beneficiaryName")} disabled={!fe} />
                <EF label="Settlement Date"       value={draft.settlementDate}  onChange={s("settlementDate")}  disabled={!fe} placeholder="DD-MM-YYYY" />
                <EF label="Purpose / Expenditure" value={draft.purpose}   onChange={s("purpose")}   disabled={!fe} span />
                <EF label="Allocated in Head (₹)" value={draft.allotment} onChange={s("allotment")} disabled={!fe} type="number" />
                <EF label="Incurred so far (₹)"   value={draft.incurred}  onChange={s("incurred")}  disabled={!fe} type="number" />
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
                <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Incl. this advance</span><div style={{ fontWeight: 700 }}>₹ {fmtINR(inclThis)}</div></div>
                <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>Balance after</span><div style={{ fontWeight: 700, color: balance < 0 ? "#b91c1c" : "#15803d" }}>₹ {fmtINR(balance)}</div></div>
              </div>

              <SH>Covering Letter Content</SH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <EF label="Letter Subject" value={draft.letterSubject} onChange={s("letterSubject")} disabled={!fe} span />
                <EF label="Letter Reference" value={draft.letterRef}   onChange={s("letterRef")}     disabled={!fe} span />
                <EF label="Letter Body" value={draft.letterBody} onChange={s("letterBody")} disabled={!fe} span rows={4} />
              </div>

              <SH>Proceedings Details</SH>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <EF label="Proceeding No"   value={draft.proceedingNo}   onChange={s("proceedingNo")}   disabled={!fe} />
                <EF label="Proceeding Date" value={draft.proceedingDate} onChange={s("proceedingDate")} disabled={!fe} placeholder="DD-MM-YYYY" />
                <EF label="Sanctioning Authority" value={draft.directorName} onChange={s("directorName")} disabled={!fe} span />
              </div>

              <SH>Signed Covering Letter (uploaded by PI)</SH>
              <div style={{ marginBottom: "20px" }}>
                {draft.signedFile ? (
                  draft.signedFile.type?.startsWith("image/") ? (
                    <div>
                      <img src={draft.signedFile.dataUrl} alt="Signed letter" style={{ maxWidth: "260px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "block", marginBottom: "8px" }} />
                      <a href={draft.signedFile.dataUrl} download={draft.signedFile.name} style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 700 }}>⬇ Download Signed Copy</a>
                    </div>
                  ) : (
                    <a href={draft.signedFile.dataUrl} target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: "#1d4ed8", fontWeight: 700 }}>📎 {draft.signedFile.name} — View Signed Copy</a>
                  )
                ) : (
                  <div style={{ color: "#c2410c", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", fontWeight: 600 }}>⚠️ No signed copy uploaded yet by the PI.</div>
                )}
              </div>

              <SH>Transfer Tracking</SH>
              <TransferTimeline item={draft} />

              {editable && !isEditing && role === "director" && isPending && (
                <div style={{ marginTop: "20px", padding: "16px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "12px" }}>Final Decision</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn-approve" onClick={() => onDecide(draft.id, "approved", draft.remarks)} style={{ flex: 1 }}>✓ Approve</button>
                    <button style={{ flex: 1, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "8px", padding: "8px 14px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }} onClick={() => onDecide(draft.id, "declined", draft.remarks)}>✕ Decline</button>
                  </div>
                </div>
              )}

              {editable && isEditing && (
                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button className="btn-approve" onClick={handleSave}>💾 Save Changes</button>
                  <button className="btn-edit" onClick={() => { setDraft(ensureAdvShape(item)); setIsEditing(false); }}>Cancel</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "12px" }}>
                <button onClick={() => downloadDoc(procRef, `Advance_Proceedings_${draft.id}.pdf`)} style={{ background: "#16a34a", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}>📄 Download Proceedings PDF</button>
                <button onClick={() => downloadDoc(letterRef, `Advance_Letter_${draft.id}.pdf`)} style={{ background: "#16a34a", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}>📄 Download Letter PDF</button>
              </div>
              <div ref={procRef}><ReportProceedings draft={draft} /></div>
              <div ref={letterRef}><ReportLetter draft={draft} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function OfficeAdvanceSanctionsPage() {
  const navigate = useNavigate();
  const role     = userRole();
  const [mounted, setMounted] = useState(false);

  const {
    advActive, setAdvActive,
    advTransferred, advCompleted,
    adv_transfer, adv_complete,
    adv_updateTransferred, adv_forwardToDirector,
  } = useProjectContext();

  const [activeTab,  setActiveTab]  = useState("active");
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [manageItem, setManageItem] = useState(null);
  const [toast,      setToast]      = useState(null);

  React.useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  const myTransferred = useMemo(() =>
    advTransferred.filter(i =>
      role === "superintendent" ? i.currentHolder?.role === "superintendent" :
      role === "director"       ? i.currentHolder?.role === "director"       : true
    ), [advTransferred, role]);

  const sourceData =
    activeTab === "active"      ? (role === "assistant" ? advActive : myTransferred) :
    activeTab === "transferred" ? advTransferred :
    advCompleted;

  const counts = {
    all:      sourceData.length,
    pending:  sourceData.filter(r => r.status === "PENDING" || r.status === "TRANSFERRED").length,
    approved: sourceData.filter(r => r.status === "COMPLETED").length,
    declined: sourceData.filter(r => r.status === "declined").length,
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sourceData.filter(r => {
      const mf = filter === "all"      ? true
               : filter === "pending"  ? (r.status === "PENDING" || r.status === "TRANSFERRED")
               : filter === "approved" ? r.status === "COMPLETED"
               : filter === "declined" ? r.status === "declined"
               : true;
      const ms = !q || r.projectTitle?.toLowerCase().includes(q) || r.piName?.toLowerCase().includes(q) || r.beneficiaryName?.toLowerCase().includes(q) || r.id?.toLowerCase().includes(q);
      return mf && ms;
    });
  }, [sourceData, filter, search]);

  const today = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

  const handleApproveTransfer = (item, staff) => {
    const mySig = getProfileSignature(role);
    adv_transfer({ ...item, signatures: { ...(item.signatures || {}), [role]: mySig || true }, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: true }] }, staff);
    showToast(`Approved & transferred to ${staff.name}`);
  };
  const handlePlainTransfer = (item, staff) => {
    adv_transfer({ ...item, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: false }] }, staff);
    showToast(`Transferred to ${staff.name}`);
  };
  const handleApproveForward = (item, staff) => {
    const mySig = getProfileSignature(role);
    adv_forwardToDirector({ ...item, signatures: { ...(item.signatures || {}), [role]: mySig || true }, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: true }] }, staff);
    showToast(`Forwarded to ${staff.name}`);
  };
  const handlePlainForward = (item, staff) => {
    adv_updateTransferred({ ...item, currentHolder: staff, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: false }] });
    showToast(`Transferred to ${staff.name}`);
  };

  const handleDecide = (id, decision, remarks) => {
    const item = [...advActive, ...advTransferred].find(r => r.id === id);
    if (!item) return;
    if (decision === "approved") adv_complete({ ...item, remarks });
    else adv_updateTransferred({ ...item, status: "declined", remarks });
    setManageItem(null);
    showToast(`Request ${id} ${decision === "approved" ? "approved ✓" : "declined ✗"}`, decision === "approved" ? "success" : "error");
  };

  const handleSaveManaged = (updated) => {
    if (role === "assistant" && activeTab === "active") setAdvActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    else adv_updateTransferred(updated);
    setManageItem(null);
  };

  const tabs =
    role === "assistant"
      ? [{ key: "active", label: `New Requests (${advActive.length})` }, { key: "transferred", label: `Transferred (${advTransferred.length})` }, { key: "completed", label: `Completed (${advCompleted.length})` }]
      : role === "superintendent"
      ? [{ key: "active", label: `In My Queue (${myTransferred.length})` }, { key: "transferred", label: `All Transferred (${advTransferred.length})` }, { key: "completed", label: `Completed (${advCompleted.length})` }]
      : [{ key: "active", label: `Awaiting Approval (${myTransferred.length})` }, { key: "completed", label: `Completed (${advCompleted.length})` }];

  return (
    <div className={`project-dashboard ${mounted ? "fs-loaded" : ""}`}>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 999999, padding: "12px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", background: toast.type === "success" ? "#f0fdf4" : "#fef2f2", color: toast.type === "success" ? "#15803d" : "#b91c1c", border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>{toast.msg}</div>
      )}

      <div className="fs-top-nav">
        <button className="fs-btn-back" onClick={() => navigate("/projects/project-requests")}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </button>
        <div className="fs-nav-right">
          <span className={`fs-role-chip fs-role-${role}`}>{role === "assistant" ? "🟢" : role === "superintendent" ? "🔵" : "🔴"} {role}</span>
        </div>
      </div>

      <div className="fs-header">
        <h1 className="fs-header-title">💵 Advance Sanction Requests</h1>
        <p className="fs-header-sub">Review, transfer and approve advance sanction requests submitted by Principal Investigators</p>
      </div>

      <StatsRow counts={counts} />

      <div className="tab-switcher">
        {tabs.map(t => <button key={t.key} className={activeTab === t.key ? "active" : ""} onClick={() => setActiveTab(t.key)}>{t.label}</button>)}
      </div>

      <div style={{ display: "flex", gap: "12px", margin: "16px 0", flexWrap: "wrap", alignItems: "center" }}>
        <div className="fs-search-bar" style={{ flex: 1, margin: 0 }}>
          <div className="fs-search-inner">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by project, PI, beneficiary, ID..." value={search} onChange={e => setSearch(e.target.value)} />
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
            <th>Head</th>
            <th>Amount (₹)</th>
            <th>Beneficiary</th>
            <th>Submitted</th>
            <th>Status</th>
            {(activeTab === "transferred" || (role !== "assistant" && activeTab === "active")) && <th>Stage</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>{search ? `No results for "${search}"` : "No items to display"}</td></tr>
          )}
          {filtered.map((item, idx) => (
            <tr key={item.id}>
              <td>{idx + 1}</td>
              <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{item.procNo || item.id}</td>
              <td>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{item.projectTitle}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{item.piName}</div>
              </td>
              <td><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{headLabel(item.headKey)}</span></td>
              <td style={{ fontWeight: 700 }}>₹ {fmtINR(item.amount)}</td>
              <td style={{ fontSize: "12px", color: "#64748b" }}>{item.beneficiaryName}</td>
              <td style={{ color: "#64748b", fontSize: "12px" }}>{item.submittedOn}</td>
              <td><StatusBadge status={item.status} /></td>
              {(activeTab === "transferred" || (role !== "assistant" && activeTab === "active")) && (
                <td><StageBadge role={item.currentHolder?.role} /></td>
              )}
              <td>
                <div className="fs-actions">
                  <button className="btn-view" onClick={() => setManageItem(item)}>👁 View</button>
                  {role === "assistant"      && activeTab === "active" && <ProjectApprovalTransferCell item={item} userRole={role} onApproveTransfer={handleApproveTransfer} onPlainTransfer={handlePlainTransfer} />}
                  {role === "superintendent" && activeTab === "active" && <ProjectApprovalTransferCell item={item} userRole={role} onApproveTransfer={handleApproveForward}  onPlainTransfer={handlePlainForward} />}
                  {role === "director"       && activeTab === "active" && <button className="btn-approve" onClick={() => handleDecide(item.id, "approved", item.remarks)}>✓ Approve</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {manageItem && (
        <ManageModal item={manageItem} editable={activeTab === "active"} onSave={handleSaveManaged} onClose={() => setManageItem(null)} onDecide={handleDecide} userRole={role} />
      )}
    </div>
  );
}