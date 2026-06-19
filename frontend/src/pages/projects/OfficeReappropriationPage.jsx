import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficeReappropriationPage.css";
import { useProjectContext } from "./ProjectContext";
import ProjectApprovalTransferCell, { getProfileSignature } from "./ProjectApprovalTransferCell";
import html2pdf from "html2pdf.js";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const userRole = () => localStorage.getItem("userRole") || "assistant";
const userName = () => localStorage.getItem("userName") || "Office";

const fmtAmt = (n) => {
  const num = parseFloat(n) || 0;
  return num ? `${num.toLocaleString("en-IN")}/-` : "-";
};

/* ─── Default data — WITHOUT installment ─────────────────────────────────── */
function ensureReapShape(item) {
  const base = JSON.parse(JSON.stringify(item));

  base.proceedingNo = base.proceedingNo || base.id || "CSRC/REAP/2026/001";
  base.proceedingDate = base.proceedingDate || "18-06-2026";
  base.directorName = base.directorName || "DIRECTOR, CSRC";
  base.remarks = base.remarks || "";
  base.transferHistory = base.transferHistory || [];

  base.projectName =
    base.projectName ||
    "Development of Ti(C,N) based cermets";

  base.agency =
    base.agency ||
    "SERB";

  base.piName =
    base.piName ||
    (typeof base.pi === "string"
      ? base.pi
      : base.pi?.name || "Dr. S. Balasivanandha Prabu");

  base.piDesig =
    base.piDesig ||
    "Associate Professor";

  base.piDept =
    base.piDept ||
    "Department of Information Science and Technology";

  base.piCampus =
    base.piCampus ||
    "CEG Campus";

  base.projectScheme =
    base.projectScheme ||
    "CRG";

  base.totalCost =
    base.totalCost ||
    "2500000";

  base.totalCostWords =
    base.totalCostWords ||
    "Twenty Five Lakh";

  base.startDate =
    base.startDate ||
    "01-01-2025";

  base.endDate =
    base.endDate ||
    "31-12-2027";

  base.duration =
    base.duration ||
    "thirty six months";

  base.reapAmount =
    base.reapAmount ||
    "250000";

  base.reapAmountWords =
    base.reapAmountWords ||
    "Two Lakh Fifty Thousand";

  base.reapFromHead =
    base.reapFromHead ||
    "Manpower";

  base.reapToHead =
    base.reapToHead ||
    "Contingency";

  base.reapRefCited =
    base.reapRefCited ||
    "fourth";

  base.mhNo =
    base.mhNo ||
    "M.H.No.15.1.34";

  base.expenditureNote =
    base.expenditureNote ||
    "";

  base.sanctionRegVol =
    base.sanctionRegVol ||
    "VIII";

  base.sanctionRegSl =
    base.sanctionRegSl ||
    "124";

  base.sanctionRegPage =
    base.sanctionRegPage ||
    "56";

  base.references =
    base.references?.length > 0
      ? base.references
      : [
          { no: 1, text: "Syndicate Resolution No.172.5.2 dt: 28.12.2005." },
          { no: 2, text: "SERB Sanction Order No.CRG/2025/101 dated 01-01-2025." },
          { no: 3, text: "CSRC Proceedings No.101 dated 10-01-2025." },
          { no: 4, text: "PI Re-appropriation Request dated 15-06-2026." },
        ];

  base.previousInstallments =
    base.previousInstallments?.length > 0
      ? base.previousInstallments
      : [
          {
            no: "I Instalment",
            amount: "1250000",
            releasedDate: "15-03-2025",
            procNo: "CSRC/SERB/2025/101 Dt.15-03-2025",
          },
        ];

  base.reapHeads =
    base.reapHeads?.length > 0
      ? base.reapHeads
      : [
          {
            head: "Manpower",
            unspent: "500000",
            afterReap: "250000",
          },
          {
            head: "Contingency",
            unspent: "100000",
            afterReap: "350000",
          },
        ];

  return base;
}

/* ─── Default data — WITH installment ────────────────────────────────────── */
function ensureReapWithInstShape(item) {
  const base = JSON.parse(JSON.stringify(item));

  base.proceedingNo = base.proceedingNo || base.id || "CSRC/REAP/2026/005";
  base.proceedingDate = base.proceedingDate || "18-06-2026";
  base.directorName = base.directorName || "DIRECTOR, CSRC";
  base.remarks = base.remarks || "";
  base.transferHistory = base.transferHistory || [];

  base.projectName =
    base.projectName ||
    "Technology Enabling Centre";

  base.agency =
    base.agency ||
    "DST";

  base.piName =
    base.piName ||
    (typeof base.pi === "string"
      ? base.pi
      : base.pi?.name || "Dr. R. Kumar");

  base.piDesig =
    base.piDesig ||
    "Coordinator";

  base.piDept =
    base.piDept ||
    "Technology Enabling Centre";

  base.piCampus =
    base.piCampus ||
    "ACT Campus";

  base.projectScheme =
    base.projectScheme ||
    "TEC";

  base.totalCost =
    base.totalCost ||
    "4500000";

  base.totalCostWords =
    base.totalCostWords ||
    "Forty Five Lakh";

  base.startDate =
    base.startDate ||
    "01-04-2023";

  base.endDate =
    base.endDate ||
    "31-03-2028";

  base.duration =
    base.duration ||
    "sixty months";

  base.extendedUpto =
    base.extendedUpto ||
    "31-03-2028";

  base.currentInstallmentNo =
    base.currentInstallmentNo ||
    "IV Instalment";

  base.currentInstallmentAmount =
    base.currentInstallmentAmount ||
    "2200000";

  base.currentInstallmentWords =
    base.currentInstallmentWords ||
    "Twenty Two Lakh";

  base.pfmsRefNo =
    base.pfmsRefNo ||
    "PFMS/2026/TEC/445";

  base.pfmsRefCited =
    base.pfmsRefCited ||
    "fifth";

  base.bankName =
    base.bankName ||
    "UNION BANK OF INDIA";

  base.tsa =
    base.tsa ||
    "TSA-2026-445";

  base.tsaRefCited =
    base.tsaRefCited ||
    "sixth";

  base.reapRefCited =
    base.reapRefCited ||
    "seventh";

  base.toDesig =
    base.toDesig ||
    "Coordinator";

  base.mhNo =
    base.mhNo ||
    "M.H.No.21.4.55";

  base.sanctionRegVol =
    base.sanctionRegVol ||
    "X";

  base.sanctionRegSl =
    base.sanctionRegSl ||
    "212";

  base.sanctionRegPage =
    base.sanctionRegPage ||
    "88";

  base.references =
    base.references?.length > 0
      ? base.references
      : [
          { no: 1, text: "Syndicate Resolution No.172.5.2 dt: 28.12.2005." },
          { no: 2, text: "DST Sanction Order TEC/2023/001." },
          { no: 3, text: "CSRC Proceedings dated 01-04-2023." },
          { no: 4, text: "Project Extension Order dated 01-04-2025." },
          { no: 5, text: "PFMS Release Advice dated 10-06-2026." },
          { no: 6, text: "TSA Request dated 12-06-2026." },
          { no: 7, text: "Reappropriation Request dated 14-06-2026." },
        ];

  base.previousInstallments =
    base.previousInstallments?.length > 0
      ? base.previousInstallments
      : [
          {
            no: "I Instalment",
            amount: "1000000",
            releasedDate: "15-01-2024",
            procNo: "CSRC/DST/2024/101",
          },
          {
            no: "II Instalment",
            amount: "1500000",
            releasedDate: "20-08-2024",
            procNo: "CSRC/DST/2024/225",
          },
          {
            no: "III Instalment",
            amount: "1800000",
            releasedDate: "12-03-2025",
            procNo: "CSRC/DST/2025/067",
          },
        ];

  base.installmentHeads =
    base.installmentHeads?.length > 0
      ? base.installmentHeads
      : [
          {
            head: "Manpower",
            unspent: "400000",
            installmentAmount: "900000",
          },
          {
            head: "Travel",
            unspent: "100000",
            installmentAmount: "250000",
          },
          {
            head: "Contingency",
            unspent: "150000",
            installmentAmount: "450000",
          },
          {
            head: "Training Program",
            unspent: "50000",
            installmentAmount: "600000",
          },
        ];

  return base;
}

/* ─── Shared UI primitives ───────────────────────────────────────────────── */
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
    { label: "Total",   value: counts.all,      color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Pending", value: counts.pending,   color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    { label: "Approved",value: counts.approved,  color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Declined",value: counts.declined,  color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
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
      No transfer history yet.
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

/* ─── Section heading ─────────────────────────────────────────────────────── */
const SH = ({ children, extra }) => (
  <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span>{children}</span>{extra && <span>{extra}</span>}
  </h3>
);

/* ─── Edit field ──────────────────────────────────────────────────────────── */
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

/* ─── References editor ───────────────────────────────────────────────────── */
function RefEditor({ refs, fe, onChange }) {
  const patch = (i, val) => onChange(refs.map((r, idx) => idx === i ? { ...r, text: val } : r));
  const add   = () => onChange([...refs, { no: refs.length + 1, text: "" }]);
  const del   = (i) => onChange(refs.filter((_, idx) => idx !== i).map((r, ix) => ({ ...r, no: ix + 1 })));
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
      {refs.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 14px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ color: "#94a3b8", fontWeight: 700, minWidth: "20px", fontSize: "12px", paddingTop: "6px" }}>{r.no}.</span>
          {fe ? (
            <>
              <textarea value={r.text} onChange={e => patch(i, e.target.value)} rows={2}
                style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", background: "#fff", color: "#1e293b", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
              <button onClick={() => del(i)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", cursor: "pointer", marginTop: "2px" }}>✕</button>
            </>
          ) : (
            <span style={{ fontSize: "12px", color: "#374151", paddingTop: "4px" }}>{r.text || <em style={{ color: "#cbd5e1" }}>—</em>}</span>
          )}
        </div>
      ))}
      {fe && (
        <div style={{ padding: "10px 14px" }}>
          <button onClick={add} style={{ border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>➕ Add Reference</button>
        </div>
      )}
    </div>
  );
}

/* ─── Previous instalments editor ────────────────────────────────────────── */
function PrevInstEditor({ insts, fe, onChange }) {
  const patch = (i, p) => onChange(insts.map((r, idx) => idx === i ? { ...r, ...p } : r));
  const add   = () => onChange([...insts, { no: "", amount: "", releasedDate: "", procNo: "" }]);
  const del   = (i) => onChange(insts.filter((_, idx) => idx !== i));
  const inp   = (val, onCh, ph) =>
    fe ? <input value={val || ""} onChange={e => onCh(e.target.value)} placeholder={ph}
      style={{ width: "100%", padding: "5px 7px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
    : <span style={{ fontSize: "12px", color: "#374151" }}>{val}</span>;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["Sl.", "Instalment", "Amount (₹)", "Released Date", "Sanction Proc. No. & Date"].map(h => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
            ))}
            {fe && <th style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}></th>}
          </tr>
        </thead>
        <tbody>
          {insts.map((inst, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 14px", color: "#94a3b8", width: "32px" }}>{i + 1}</td>
              <td style={{ padding: "8px" }}>{inp(inst.no,          v => patch(i, { no: v }),          "e.g. I Instalment")}</td>
              <td style={{ padding: "8px" }}>{inp(inst.amount,      v => patch(i, { amount: v }),      "e.g. 22,75,400")}</td>
              <td style={{ padding: "8px" }}>{inp(inst.releasedDate,v => patch(i, { releasedDate: v }),"PFMS Portal / Date")}</td>
              <td style={{ padding: "8px" }}>{inp(inst.procNo,      v => patch(i, { procNo: v }),      "No. & Date")}</td>
              {fe && <td style={{ padding: "8px" }}><button onClick={() => del(i)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "6px", padding: "4px 7px", fontSize: "11px", cursor: "pointer" }}>🗑</button></td>}
            </tr>
          ))}
          {insts.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "12px" }}>No previous instalments</td></tr>}
        </tbody>
      </table>
      {fe && (
        <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={add} style={{ border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>➕ Add Instalment</button>
        </div>
      )}
    </div>
  );
}

/* ─── Shared modal shell ──────────────────────────────────────────────────── */
function ModalShell({ title, draft, tab, setTab, isEditing, setIsEditing, editable, onClose, downloadPDF, children }) {
  const holderRole  = draft.currentHolder?.role;
  const isCompleted = !draft.currentHolder && draft.transferHistory?.length > 0;
  const sc = { superintendent: { bg: "#dbeafe", color: "#1d4ed8" }, director: { bg: "#fce7f3", color: "#be185d" }, assistant: { bg: "#dcfce7", color: "#15803d" } }[holderRole] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#f8fafc", borderRadius: "16px", width: "min(980px, 96vw)", height: "calc(100vh - 32px)", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 40px 100px rgba(0,0,0,0.4)" }}>
        {/* Header */}
        <div style={{ padding: "14px 20px", background: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{title}</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: 1.3, maxWidth: "640px" }}>{draft.projectName}</div>
            {draft.currentHolder ? (
              <div style={{ marginTop: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: sc.bg, color: sc.color }}>
                  {holderRole === "superintendent" ? "🔵" : holderRole === "director" ? "🔴" : "🟢"} Currently with {draft.currentHolder?.name} ({holderRole})
                </span>
              </div>
            ) : isCompleted && (
              <div style={{ marginTop: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#dcfce7", color: "#15803d" }}>✔ Completed</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {editable && tab === "details" && !isEditing && <button style={{ background: "#2563eb", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 13px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }} onClick={() => setIsEditing(true)}>✏️ Edit</button>}
            {tab === "report" && <button onClick={downloadPDF} style={{ background: "#16a34a", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 13px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}>📄 Download PDF</button>}
            <button style={{ background: "#ef4444", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 13px", cursor: "pointer", fontWeight: 700, fontSize: "12px" }} onClick={onClose}>✕ Close</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          {[["details", "📋 Full Details & Tracking"], ["report", "📄 Proceedings Report"]].map(([k, l]) => (
            <button key={k} style={{ padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: tab === k ? "#1d4ed8" : "#64748b", borderBottom: tab === k ? "3px solid #1d4ed8" : "3px solid transparent" }} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: tab === "report" ? "#e5e7eb" : "#f8fafc" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT A — Without Installment
   Matches Image 1 & 2 exactly:
   Sub | Ref list | ***** | Para1 (project sanction) | Para2 (prev inst) |
   Inst table | Para3 (reap request) | Para4 (sanction accorded) |
   3-col reap table | Expenditure note | Sanction register | Signature | To | Copy to
═══════════════════════════════════════════════════════════════════════════ */
function ReportWithout({ draft }) {
  const P  = { fontFamily: "Times New Roman, serif", fontSize: "11pt", color: "#000" };
  const th = { border: "1px solid #000", padding: "5px 8px", textAlign: "center", fontWeight: "bold", background: "#fff" };
  const td = { border: "1px solid #000", padding: "5px 8px" };
  const tdR = { border: "1px solid #000", padding: "5px 8px", textAlign: "right" };
  const tdC = { border: "1px solid #000", padding: "5px 8px", textAlign: "center" };
  const J  = { textAlign: "justify", marginBottom: "10px", lineHeight: "1.6" };
  const B  = { fontWeight: "bold" };

  const totalUnspent = (draft.reapHeads || []).reduce((s, h) => s + (parseFloat(h.unspent) || 0), 0);
  const totalAfter   = (draft.reapHeads || []).reduce((s, h) => s + (parseFloat(h.afterReap) || 0), 0);

  return (
    <div style={{ width: "210mm", background: "#fff", margin: "0 auto", padding: "14mm 16mm", boxSizing: "border-box", ...P }}>
      {/* Letterhead */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div style={{ ...B, fontSize: "13pt" }}>Centre for Sponsored Research and Consultancy (CSRC)</div>
        <div style={{ fontStyle: "italic" }}>(formerly known as CTDT)</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Proc No & Date */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={B}>Proceedings No.{draft.proceedingNo}</div>
        <div>{draft.proceedingDate}</div>
      </div>

      {/* Sub */}
      <div style={{ marginBottom: "10px", lineHeight: "1.6" }}>
        <span style={B}>Sub: </span>Anna University – {draft.agency || "——"} Project –{" "}
        {draft.projectScheme ? `${draft.projectScheme} –` : ""}{" "}
        "{draft.projectName || "——"}" by {draft.piName || "——"} – Re-appropriation – Sanction – Accorded
      </div>

      {/* Ref */}
      {(draft.references || []).length > 0 && (
        <div style={{ marginBottom: "10px", lineHeight: "1.7" }}>
          <span style={B}>Ref: </span>
          {draft.references.map((r, i) => (
            <div key={i} style={{ paddingLeft: i === 0 ? "0" : "32px" }}>
              {r.no}.{" "}{r.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", margin: "10px 0" }}>* * * * *</div>

      {/* Para 1 — project sanctioned */}
      <div style={J}>
        The {draft.agency || "funding agency"} has sanctioned a project entitled{" "}
        <span style={B}>"{draft.projectName || "——"}"</span>{" "}
        {draft.projectScheme ? <>under <span style={B}>"{draft.projectScheme}"</span>{" "}</> : ""}
        to <span style={B}>{draft.piName || "——"}, {draft.piDesig || "——"}, {draft.piDept || "——"}, {draft.piCampus || "——"}</span>,
        as the Principal Investigator for the period of <span style={B}>{draft.duration}</span> from{" "}
        <span style={B}>{draft.startDate || "——"}</span> to <span style={B}>{draft.endDate || "——"}</span> at a total cost of{" "}
        <span style={B}>Rs.{draft.totalCost || "——"}/- ({draft.totalCostWords || "——"})</span> vide reference second cited above.
      </div>

      {/* Para 2 — previous instalments */}
      {(draft.previousInstallments || []).length > 0 && (
        <>
          <div style={J}>
            Further, a sum of{" "}
            <span style={B}>Rs.{draft.previousInstallments.map(i => i.amount).filter(Boolean).join(" + ") || "——"}/- </span>
            has already been allotted by the funding agency and the necessary sanction proceedings was issued
            for the implementation of the above said project, as per the details given below:
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", fontSize: "10.5pt" }}>
            <thead>
              <tr>
                {["Sl.No.", "Instalment", "Amount (Rs.)", "Released Date", "Sanction Proceedings No.&Date"].map(h =>
                  <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {draft.previousInstallments.map((inst, i) => (
                <tr key={i}>
                  <td style={tdC}>{i + 1}</td>
                  <td style={td}>{inst.no}</td>
                  <td style={tdR}>{inst.amount ? `${inst.amount}/-` : "—"}</td>
                  <td style={tdC}>{inst.releasedDate || "—"}</td>
                  <td style={td}>{inst.procNo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Para 3 — reap request */}
      <div style={J}>
        In the reference {draft.reapRefCited || "fourth"} cited above, {draft.piName || "——"}, Principal Investigator of the Project,
        has requested to accord sanction for reappropriation to the tune of{" "}
        Rs.{draft.reapAmount || "——"}/- ({draft.reapAmountWords || "——"}) from "{draft.reapFromHead || "——"}" head
        to "{draft.reapToHead || "——"}" head of the above mentioned project.
      </div>

      {/* Para 4 — sanction accorded */}
      <div style={J}>
        Accordingly, and as per the powers delegated reference first cited above, an administrative sanction
        is hereby accorded for re-appropriate a sum of{" "}
        <span style={B}>Rs.{draft.reapAmount || "——"}/- ({draft.reapAmountWords || "——"})</span>{" "}
        available funds from "{draft.reapFromHead || "——"}" head to "{draft.reapToHead || "——"}" head as detailed below.
      </div>

      {/* Main 4-col reap table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", fontSize: "10.5pt" }}>
        <thead>
          <tr>
            <th style={th}>Sl. No.</th>
            <th style={th}>Head of Account</th>
            <th style={th}>Unspent Amount Available (Rs.)</th>
            <th style={th}>Amount Available after Re-appropriation (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {(draft.reapHeads || []).map((h, i) => (
            <tr key={i}>
              <td style={tdC}>{i + 1}</td>
              <td style={td}>{h.head}</td>
              <td style={tdR}>{h.unspent ? fmtAmt(h.unspent) : "—"}</td>
              <td style={tdR}>{h.afterReap ? fmtAmt(h.afterReap) : "—"}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold" }}>
            <td colSpan={2} style={{ ...td, textAlign: "right" }}>Total Amount</td>
            <td style={tdR}>{totalUnspent ? fmtAmt(totalUnspent) : "—"}</td>
            <td style={tdR}>{totalAfter ? fmtAmt(totalAfter) : "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* Expenditure note */}
      <div style={J}>
        {draft.expenditureNote ||
          `The expenditure for the above project will be debitable to ${draft.mhNo || "M.H.No.——"} – ${draft.agency || "——"} Project "${draft.projectName || "——"}" by ${draft.piName || "——"}, ${draft.piDesig || "——"}, ${draft.piDept || "——"}, ${draft.piCampus || "——"}.`}
      </div>

      {/* Sanction register */}
      {(draft.sanctionRegVol || draft.sanctionRegSl) && (
        <div style={{ ...J, marginBottom: "24px" }}>
          The above sanction has been entered in the Project Sanction Register Vol – {draft.sanctionRegVol} C vide Sl.No.{draft.sanctionRegSl} at Page No.{draft.sanctionRegPage}.
        </div>
      )}

      {/* Signature */}
      <div style={{ textAlign: "right", marginBottom: "28px", marginTop: "24px" }}>
        <div style={{ marginBottom: "40px" }}></div>
        <div style={B}>{draft.directorName || "DIRECTOR, CSRC"}</div>
      </div>

      {/* To */}
      <div style={{ marginBottom: "14px" }}>
        <div style={B}>To</div>
        <div>The Professor and Head,</div>
        <div>{draft.piDept || "——"},</div>
        <div>{draft.piCampus || "——"},</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Copy to */}
      <div>
        <div style={B}>Copy to:</div>
        <div>1. {draft.piName || "——"}, {draft.piDesig || "——"}, {draft.piDept || "——"}, {draft.piCampus || "——"} – PI</div>
        <div>2. CSRC – 3</div>
        <div>3. CSRC – 4</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT B — With Installment
   Matches Image 3 exactly:
   Sub | Ref list | ***** | Para1 | Para2 (prev inst table) |
   Para3 (new inst PFMS) | Para4 (TSA + reap request) |
   Para5 (sanction accorded) | 6-col table |
   Expenditure note | Sanction register | Signature | To | Copy to
═══════════════════════════════════════════════════════════════════════════ */
function ReportWith({ draft }) {
  const P  = { fontFamily: "Times New Roman, serif", fontSize: "11pt", color: "#000" };
  const th = { border: "1px solid #000", padding: "5px 7px", textAlign: "center", fontWeight: "bold", background: "#fff", fontSize: "9.5pt" };
  const td = { border: "1px solid #000", padding: "5px 7px", fontSize: "10pt" };
  const tdR = { border: "1px solid #000", padding: "5px 7px", textAlign: "right", fontSize: "10pt" };
  const tdC = { border: "1px solid #000", padding: "5px 7px", textAlign: "center", fontSize: "10pt" };
  const J   = { textAlign: "justify", marginBottom: "10px", lineHeight: "1.6" };
  const B   = { fontWeight: "bold" };

  const heads = draft.installmentHeads || [];
  const totalUnspent = heads.reduce((s, h) => s + (parseFloat(h.unspent) || 0), 0);
  const totalInst    = heads.reduce((s, h) => s + (parseFloat(h.installmentAmount) || 0), 0);
  const totalAvail   = heads.reduce((s, h) => s + (parseFloat(h.unspent) || 0) + (parseFloat(h.installmentAmount) || 0), 0);
  // "after reap" = total (reappropriation shifts within same total pool)
  const totalAfter   = totalAvail;

  return (
    <div style={{ width: "210mm", background: "#fff", margin: "0 auto", padding: "14mm 16mm", boxSizing: "border-box", ...P }}>
      {/* Letterhead */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div style={{ ...B, fontSize: "13pt" }}>Centre for Sponsored Research and Consultancy (CSRC)</div>
        <div style={{ fontStyle: "italic" }}>(formerly known as CTDT)</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Proc No & Date */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={B}>Proceedings No.{draft.proceedingNo}</div>
        <div>{draft.proceedingDate}</div>
      </div>

      {/* Sub */}
      <div style={{ marginBottom: "10px", lineHeight: "1.6" }}>
        <span style={B}>Sub: </span>Anna University – {draft.agency || "——"} Project –{" "}
        {draft.projectScheme ? `${draft.projectScheme} –` : ""}{" "}
        "{draft.projectName || "——"}" by {draft.piName || "——"} – {draft.currentInstallmentNo} &amp; Re-appropriation – Administrative sanction – Accorded
      </div>

      {/* Ref */}
      {(draft.references || []).length > 0 && (
        <div style={{ marginBottom: "10px", lineHeight: "1.7" }}>
          <span style={B}>Ref: </span>
          {draft.references.map((r, i) => (
            <div key={i} style={{ paddingLeft: i === 0 ? "0" : "32px" }}>
              {r.no}.{" "}{r.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", margin: "10px 0" }}>* * * * *</div>

      {/* Para 1 — project sanctioned */}
      <div style={J}>
        The {draft.agency || "funding agency"} has sanctioned a project entitled{" "}
        <span style={B}>"{draft.projectName || "——"}"</span>{" "}
        {draft.projectScheme ? <>under <span style={B}>"{draft.projectScheme}"</span>{" "}</> : ""}
        to <span style={B}>{draft.piName || "——"}</span>, {draft.piDesig || "——"}, {draft.piDept || "——"}, {draft.piCampus || "——"},
        as the Principal Investigator for the period of {draft.duration} from{" "}
        <span style={B}>{draft.startDate || "——"}</span> to <span style={B}>{draft.endDate || "——"}</span>.
        {draft.extendedUpto ? ` Further the funding agency has extended the duration of the project period upto ${draft.extendedUpto}.` : ""}
      </div>

      {/* Para 2 — previous instalments */}
      {(draft.previousInstallments || []).length > 0 && (
        <>
          <div style={J}>
            Further, a sum of{" "}
            <span style={B}>Rs.{draft.totalCost || "——"}/- ({draft.totalCostWords || "——"})</span>{" "}
            has already been released by the funding agency and the necessary sanction proceedings were issued
            for the implementation of the above said project, as per the details given below:
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", fontSize: "10.5pt" }}>
            <thead>
              <tr>
                {["Sl.No.", "Instalment", "Amount (Rs.)", "Released Date", "Sanction Proceedings No.&Date"].map(h =>
                  <th key={h} style={{ ...th, fontSize: "10pt" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {draft.previousInstallments.map((inst, i) => (
                <tr key={i}>
                  <td style={tdC}>{i + 1}</td>
                  <td style={td}>{inst.no}</td>
                  <td style={tdR}>{inst.amount ? `${inst.amount}/-` : "—"}</td>
                  <td style={tdC}>{inst.releasedDate || "—"}</td>
                  <td style={td}>{inst.procNo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Para 3 — new installment PFMS */}
      <div style={J}>
        Now, the funding agency has assigned the{" "}
        <span style={B}>{draft.currentInstallmentNo}</span> of{" "}
        <span style={B}>Rs.{draft.currentInstallmentAmount || "——"}/- ({draft.currentInstallmentWords || "——"})</span>{" "}
        to THE DIRECTOR CSRC {draft.projectScheme ? `${draft.projectScheme.toUpperCase()},` : ""}{" "}
        {draft.bankName || "UNION BANK OF INDIA"} A/c No.{draft.pfmsRefNo || "——"} through{" "}
        <span style={B}>PFMS Portal</span>, vide reference {draft.pfmsRefCited || "fifth"} cited.
      </div>

      {/* Para 4 — TSA & reap request */}
      <div style={J}>
        In the reference {draft.tsaRefCited || "sixth"} cited above, {draft.piName || "——"},{" "}
        {draft.piDesig || "——"} of the Project, has requested to accord administrative sanction for the
        above amount of Rs.{draft.currentInstallmentAmount || "——"}/- and by following CSRC norms.
        {draft.tsa ? ` [${draft.tsa}].` : ""}{" "}
        Also, requested for reappropriation vide reference {draft.reapRefCited || "seventh"} cited.
      </div>

      {/* Para 5 — sanction accorded */}
      <div style={J}>
        Accordingly, as per the powers delegated in the reference first cited above, an administrative
        sanction is hereby accorded to {draft.toDesig || `The ${draft.piDesig || "——"}`},{" "}
        {draft.piDept || "——"}, {draft.piCampus || "——"} for the {draft.currentInstallmentNo} amount of{" "}
        <span style={B}>Rs.{draft.currentInstallmentAmount || "——"}/- ({draft.currentInstallmentWords || "——"})</span>{" "}
        and reappropriation of available funds towards implementation of the above project as detailed below.
      </div>

      {/* 6-col main table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
        <thead>
          <tr>
            <th style={th}>Sl. No.</th>
            <th style={th}>Head of Account</th>
            <th style={th}>Unspent Amount Available (Rs.)</th>
            <th style={th}>{draft.currentInstallmentNo} Amount</th>
            <th style={th}>Total Amount Available</th>
            <th style={th}>Total Amount available after Re-appropriation and {draft.currentInstallmentNo} (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {heads.map((h, i) => {
            const unspent = parseFloat(h.unspent) || 0;
            const inst    = parseFloat(h.installmentAmount) || 0;
            const total   = unspent + inst;
            return (
              <tr key={i}>
                <td style={tdC}>{i + 1}</td>
                <td style={td}>{h.head}</td>
                <td style={tdR}>{unspent ? `${unspent.toLocaleString("en-IN")}/-` : "-"}</td>
                <td style={tdR}>{inst ? `${inst.toLocaleString("en-IN")}/-` : "-"}</td>
                <td style={tdR}>{total ? `${total.toLocaleString("en-IN")}/-` : "-"}</td>
                <td style={tdR}>{total ? `${total.toLocaleString("en-IN")}/-` : "-"}</td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: "bold" }}>
            <td colSpan={2} style={{ ...td, textAlign: "right" }}>Total Amount</td>
            <td style={tdR}>{totalUnspent ? `${totalUnspent.toLocaleString("en-IN")}/-` : "-"}</td>
            <td style={tdR}>{totalInst ? `${totalInst.toLocaleString("en-IN")}/-` : "-"}</td>
            <td style={tdR}>{totalAvail ? `${totalAvail.toLocaleString("en-IN")}/-` : "-"}</td>
            <td style={tdR}>{totalAfter ? `${totalAfter.toLocaleString("en-IN")}/-` : "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Expenditure note */}
      <div style={J}>
        {draft.expenditureNote ||
          `The expenditure for the above project will be debitable under ${draft.mhNo || "M.H.No.——"} – ${draft.agency || "——"} Project "${draft.projectName || "——"}" by ${draft.piName || "——"}, ${draft.piDesig || "——"}, ${draft.piDept || "——"}, ${draft.piCampus || "——"}.`}
      </div>

      {/* Sanction register */}
      {(draft.sanctionRegVol || draft.sanctionRegSl) && (
        <div style={{ ...J, marginBottom: "24px" }}>
          The above sanction has been entered in the Project Sanction Register Vol – {draft.sanctionRegVol} C vide Sl.No.{draft.sanctionRegSl} at Page No.{draft.sanctionRegPage}.
        </div>
      )}

      {/* Signature */}
      <div style={{ textAlign: "right", marginBottom: "28px", marginTop: "24px" }}>
        <div style={{ marginBottom: "40px" }}></div>
        <div style={B}>{draft.directorName || "DIRECTOR, CSRC"}</div>
      </div>

      {/* To */}
      <div style={{ marginBottom: "14px" }}>
        <div style={B}>To</div>
        <div>The {draft.toDesig || draft.piDesig || "——"},</div>
        <div>{draft.piDept || "——"},</div>
        <div>{draft.piCampus || "——"},</div>
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Copy to */}
      <div>
        <div style={B}>Copy to:</div>
        <div>1. CSRC 3 &amp; 4</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL A — Without Installment (Details + Report tabs)
═══════════════════════════════════════════════════════════════════════════ */
function ManageModalWithout({ item, editable, onSave, onClose, onDecide, userRole: role }) {
  const [tab, setTab]             = useState("details");
  const [draft, setDraft]         = useState(() => ensureReapShape(item));
  const [isEditing, setIsEditing] = useState(false);
  const reportRef = useRef(null);
  const fe = editable && isEditing;
  const s  = (k) => (v) => setDraft(d => ({ ...d, [k]: v }));

  const downloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf().set({ margin: [8, 8, 8, 8], filename: `${draft.id || "Reap"}.pdf`, image: { type: "jpeg", quality: 1 }, html2canvas: { scale: 3, useCORS: true, scrollY: 0 }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(reportRef.current).save();
  };

  const patchHead = (i, p) => setDraft(d => ({ ...d, reapHeads: d.reapHeads.map((h, idx) => idx === i ? { ...h, ...p } : h) }));
  const delHead   = (i) => setDraft(d => ({ ...d, reapHeads: d.reapHeads.filter((_, idx) => idx !== i) }));
  const handleSave = () => { onSave(draft); setIsEditing(false); };

  const totalUnspent = (draft.reapHeads || []).reduce((s, h) => s + (parseFloat(h.unspent) || 0), 0);
  const totalAfter   = (draft.reapHeads || []).reduce((s, h) => s + (parseFloat(h.afterReap) || 0), 0);

  return (
    <ModalShell title={`REAPPROPRIATION (WITHOUT INSTALMENT) — ${draft.id}`} draft={draft} tab={tab} setTab={setTab} isEditing={isEditing} setIsEditing={setIsEditing} editable={editable} onClose={onClose} downloadPDF={downloadPDF}>
      {tab === "details" ? (
        <div>
          {/* Project info */}
          <SH>Project Details</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {[{ label: "Request ID", val: draft.id }, { label: "Funding Agency", val: draft.agency }, { label: "Status", val: <StatusBadge status={draft.status} /> }, { label: "Submitted On", val: draft.submittedOn }].map(({ label, val }) => (
              <div key={label}><div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "3px" }}>{label}</div><div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{val}</div></div>
            ))}
          </div>

          {/* PI & Project Info */}
          <SH>PI & Project Info</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <EF label="PI Name"            value={draft.piName}        onChange={s("piName")}        disabled={!fe} />
            <EF label="PI Designation"     value={draft.piDesig}       onChange={s("piDesig")}       disabled={!fe} />
            <EF label="Department"         value={draft.piDept}        onChange={s("piDept")}        disabled={!fe} span />
            <EF label="Campus"             value={draft.piCampus}      onChange={s("piCampus")}      disabled={!fe} />
            <EF label="Project Scheme"     value={draft.projectScheme} onChange={s("projectScheme")} disabled={!fe} span />
            <EF label="Total Cost (₹)"     value={draft.totalCost}     onChange={s("totalCost")}     disabled={!fe} />
            <EF label="Total Cost in Words" value={draft.totalCostWords} onChange={s("totalCostWords")} disabled={!fe} span />
            <EF label="Start Date"         value={draft.startDate}     onChange={s("startDate")}     disabled={!fe} placeholder="DD-MM-YYYY" />
            <EF label="End Date"           value={draft.endDate}       onChange={s("endDate")}       disabled={!fe} placeholder="DD-MM-YYYY" />
            <EF label="Duration (words)"   value={draft.duration}      onChange={s("duration")}      disabled={!fe} placeholder="e.g. thirty six months" />
          </div>

          {/* Proceedings */}
          <SH>Proceedings Details</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <EF label="Proceeding No"   value={draft.proceedingNo}   onChange={s("proceedingNo")}   disabled={!fe} />
            <EF label="Proceeding Date" value={draft.proceedingDate} onChange={s("proceedingDate")} disabled={!fe} placeholder="DD-MM-YYYY" />
            <EF label="Director Name"   value={draft.directorName}   onChange={s("directorName")}   disabled={!fe} />
          </div>

          {/* References */}
          <SH>References (Ref: list in proceedings)</SH>
          <RefEditor refs={draft.references || []} fe={fe} onChange={s("references")} />

          {/* Previous instalments */}
          <SH>Previous Instalments</SH>
          <PrevInstEditor insts={draft.previousInstallments || []} fe={fe} onChange={s("previousInstallments")} />

          {/* Reappropriation details */}
          <SH>Re-appropriation Details</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <EF label="Re-appropriation Amount (₹)"  value={draft.reapAmount}      onChange={s("reapAmount")}      disabled={!fe} />
            <EF label="Amount in Words"              value={draft.reapAmountWords} onChange={s("reapAmountWords")} disabled={!fe} span />
            <EF label="From Head"                    value={draft.reapFromHead}    onChange={s("reapFromHead")}    disabled={!fe} />
            <EF label="To Head"                      value={draft.reapToHead}      onChange={s("reapToHead")}      disabled={!fe} />
            <EF label="Request Reference Cited (e.g. fourth)" value={draft.reapRefCited} onChange={s("reapRefCited")} disabled={!fe} />
          </div>

          {/* Budget heads table */}
          <SH extra={<span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}>Total unspent: {totalUnspent ? totalUnspent.toLocaleString("en-IN") : "—"} | After: {totalAfter ? totalAfter.toLocaleString("en-IN") : "—"}</span>}>
            Budget Heads Table (for report)
          </SH>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Sl.", "Head of Account", "Unspent Amount (₹)", "After Re-appropriation (₹)"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                  {fe && <th style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}></th>}
                </tr>
              </thead>
              <tbody>
                {(draft.reapHeads || []).map((h, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{i + 1}</td>
                    <td style={{ padding: "8px 14px" }}>{fe ? <input value={h.head} onChange={e => patchHead(i, { head: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", outline: "none" }} /> : <span style={{ fontWeight: 600 }}>{h.head}</span>}</td>
                    <td style={{ padding: "8px 14px" }}>{fe ? <input type="number" value={h.unspent} onChange={e => patchHead(i, { unspent: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", outline: "none" }} /> : <span>{h.unspent ? `${Number(h.unspent).toLocaleString("en-IN")}/-` : "—"}</span>}</td>
                    <td style={{ padding: "8px 14px" }}>{fe ? <input type="number" value={h.afterReap} onChange={e => patchHead(i, { afterReap: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", outline: "none" }} /> : <span style={{ fontWeight: 600, color: "#1d4ed8" }}>{h.afterReap ? `${Number(h.afterReap).toLocaleString("en-IN")}/-` : "—"}</span>}</td>
                    {fe && <td style={{ padding: "8px 14px" }}><button onClick={() => delHead(i)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", cursor: "pointer" }}>🗑</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {fe && (
              <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9" }}>
                <button onClick={() => setDraft(d => ({ ...d, reapHeads: [...(d.reapHeads || []), { head: "", unspent: "", afterReap: "" }] }))} style={{ border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>➕ Add Head</button>
              </div>
            )}
          </div>

          {/* Expenditure & Register */}
          <SH>Expenditure & Register Details</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <EF label="M.H. No."                       value={draft.mhNo}            onChange={s("mhNo")}            disabled={!fe} placeholder="e.g. M.H.No.15.1.34" />
            <EF label="Sanction Register Vol"           value={draft.sanctionRegVol}  onChange={s("sanctionRegVol")}  disabled={!fe} placeholder="e.g. VIII" />
            <EF label="Sl. No."                        value={draft.sanctionRegSl}   onChange={s("sanctionRegSl")}   disabled={!fe} />
            <EF label="Page No."                       value={draft.sanctionRegPage} onChange={s("sanctionRegPage")} disabled={!fe} />
            <EF label="Expenditure Note (leave blank for auto)" value={draft.expenditureNote} onChange={s("expenditureNote")} disabled={!fe} span rows={3} />
          </div>

          {/* Tracking */}
          <SH>Transfer Tracking</SH>
          <TransferTimeline item={draft} />

          {/* Director decision */}
          {editable && !isEditing && role === "director" && (draft.status === "PENDING" || draft.status === "TRANSFERRED") && (
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
              <button className="btn-edit" onClick={() => { setDraft(ensureReapShape(item)); setIsEditing(false); }}>Cancel</button>
            </div>
          )}
        </div>
      ) : (
        <div ref={reportRef}><ReportWithout draft={draft} /></div>
      )}
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL B — With Installment (Details + Report tabs)
═══════════════════════════════════════════════════════════════════════════ */
function ManageModalWith({ item, editable, onSave, onClose, onDecide, userRole: role }) {
  const [tab, setTab]             = useState("details");
  const [draft, setDraft]         = useState(() => ensureReapWithInstShape(item));
  const [isEditing, setIsEditing] = useState(false);
  const reportRef = useRef(null);
  const fe = editable && isEditing;
  const s  = (k) => (v) => setDraft(d => ({ ...d, [k]: v }));

  const downloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf().set({ margin: [8, 8, 8, 8], filename: `${draft.id || "Reap"}.pdf`, image: { type: "jpeg", quality: 1 }, html2canvas: { scale: 3, useCORS: true, scrollY: 0 }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(reportRef.current).save();
  };

  const patchHead = (i, p) => setDraft(d => ({ ...d, installmentHeads: d.installmentHeads.map((h, idx) => idx === i ? { ...h, ...p } : h) }));
  const delHead   = (i) => setDraft(d => ({ ...d, installmentHeads: d.installmentHeads.filter((_, idx) => idx !== i) }));
  const handleSave = () => { onSave(draft); setIsEditing(false); };

  const heads = draft.installmentHeads || [];
  const totalUnspent = heads.reduce((s, h) => s + (parseFloat(h.unspent) || 0), 0);
  const totalInst    = heads.reduce((s, h) => s + (parseFloat(h.installmentAmount) || 0), 0);
  const totalAvail   = totalUnspent + totalInst;

  return (
    <ModalShell title={`REAPPROPRIATION (WITH INSTALMENT) — ${draft.id}`} draft={draft} tab={tab} setTab={setTab} isEditing={isEditing} setIsEditing={setIsEditing} editable={editable} onClose={onClose} downloadPDF={downloadPDF}>
      {tab === "details" ? (
        <div>
          {/* Project info */}
          <SH>Project Details</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {[{ label: "Request ID", val: draft.id }, { label: "Funding Agency", val: draft.agency }, { label: "Status", val: <StatusBadge status={draft.status} /> }, { label: "Submitted On", val: draft.submittedOn }].map(({ label, val }) => (
              <div key={label}><div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "3px" }}>{label}</div><div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{val}</div></div>
            ))}
          </div>

          {/* PI & Project Info */}
          <SH>PI & Project Info</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <EF label="PI Name"              value={draft.piName}        onChange={s("piName")}        disabled={!fe} />
            <EF label="PI Designation"       value={draft.piDesig}       onChange={s("piDesig")}       disabled={!fe} />
            <EF label="Department"           value={draft.piDept}        onChange={s("piDept")}        disabled={!fe} span />
            <EF label="Campus"               value={draft.piCampus}      onChange={s("piCampus")}      disabled={!fe} />
            <EF label="Project Scheme"       value={draft.projectScheme} onChange={s("projectScheme")} disabled={!fe} span />
            <EF label="Total Cost (₹)"       value={draft.totalCost}     onChange={s("totalCost")}     disabled={!fe} />
            <EF label="Total Cost in Words"  value={draft.totalCostWords} onChange={s("totalCostWords")} disabled={!fe} span />
            <EF label="Start Date"           value={draft.startDate}     onChange={s("startDate")}     disabled={!fe} placeholder="DD-MM-YYYY" />
            <EF label="End Date"             value={draft.endDate}       onChange={s("endDate")}       disabled={!fe} placeholder="DD-MM-YYYY" />
            <EF label="Duration (words)"     value={draft.duration}      onChange={s("duration")}      disabled={!fe} placeholder="e.g. sixty months" />
            <EF label="Extended Upto"        value={draft.extendedUpto}  onChange={s("extendedUpto")}  disabled={!fe} placeholder="DD-MM-YYYY" />
          </div>

          {/* Proceedings */}
          <SH>Proceedings Details</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <EF label="Proceeding No"   value={draft.proceedingNo}   onChange={s("proceedingNo")}   disabled={!fe} />
            <EF label="Proceeding Date" value={draft.proceedingDate} onChange={s("proceedingDate")} disabled={!fe} placeholder="DD-MM-YYYY" />
            <EF label="Director Name"   value={draft.directorName}   onChange={s("directorName")}   disabled={!fe} />
          </div>

          {/* References */}
          <SH>References (Ref: list in proceedings)</SH>
          <RefEditor refs={draft.references || []} fe={fe} onChange={s("references")} />

          {/* Previous instalments */}
          <SH>Previous Instalments</SH>
          <PrevInstEditor insts={draft.previousInstallments || []} fe={fe} onChange={s("previousInstallments")} />

          {/* Current instalment */}
          <SH>Current Instalment</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <EF label="Instalment No."           value={draft.currentInstallmentNo}     onChange={s("currentInstallmentNo")}     disabled={!fe} placeholder="e.g. IV Instalment" />
            <EF label="Amount (₹)"               value={draft.currentInstallmentAmount} onChange={s("currentInstallmentAmount")} disabled={!fe} />
            <EF label="Amount in Words"          value={draft.currentInstallmentWords}  onChange={s("currentInstallmentWords")}  disabled={!fe} span />
            <EF label="Bank Name"                value={draft.bankName}                 onChange={s("bankName")}                 disabled={!fe} placeholder="UNION BANK OF INDIA" />
            <EF label="PFMS A/c No."             value={draft.pfmsRefNo}                onChange={s("pfmsRefNo")}                disabled={!fe} />
            <EF label="PFMS Ref Cited (e.g. fifth)"  value={draft.pfmsRefCited}         onChange={s("pfmsRefCited")}             disabled={!fe} />
            <EF label="TSA Account String"       value={draft.tsa}                      onChange={s("tsa")}                      disabled={!fe} span placeholder="TSA A/c – Receipt – Income – 1-40-46-20[17]" />
            <EF label="TSA Ref Cited (e.g. sixth)"   value={draft.tsaRefCited}          onChange={s("tsaRefCited")}              disabled={!fe} />
            <EF label="Reap Ref Cited (e.g. seventh)" value={draft.reapRefCited}        onChange={s("reapRefCited")}             disabled={!fe} />
            <EF label="To Designation"           value={draft.toDesig}                  onChange={s("toDesig")}                  disabled={!fe} placeholder="e.g. The Coordinator" />
          </div>

          {/* Budget heads table */}
          <SH extra={<span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}>Total available: {totalAvail ? totalAvail.toLocaleString("en-IN") : "—"}/-</span>}>
            Budget Heads & Instalment Allocation
          </SH>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Sl.", "Head of Account", "Unspent (₹)", `${draft.currentInstallmentNo || "Instalment"} (₹)`, "Total Available (₹)"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                  {fe && <th style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0" }}></th>}
                </tr>
              </thead>
              <tbody>
                {heads.map((h, i) => {
                  const u = parseFloat(h.unspent) || 0;
                  const a = parseFloat(h.installmentAmount) || 0;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 8px", color: "#94a3b8" }}>{i + 1}</td>
                      <td style={{ padding: "8px" }}>{fe ? <input value={h.head} onChange={e => patchHead(i, { head: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", outline: "none" }} /> : <span style={{ fontWeight: 600 }}>{h.head}</span>}</td>
                      <td style={{ padding: "8px" }}>{fe ? <input type="number" value={h.unspent} onChange={e => patchHead(i, { unspent: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", outline: "none" }} /> : <span>{u ? `${u.toLocaleString("en-IN")}/-` : "—"}</span>}</td>
                      <td style={{ padding: "8px" }}>{fe ? <input type="number" value={h.installmentAmount} onChange={e => patchHead(i, { installmentAmount: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", outline: "none" }} /> : <span style={{ color: "#1d4ed8", fontWeight: 600 }}>{a ? `${a.toLocaleString("en-IN")}/-` : "—"}</span>}</td>
                      <td style={{ padding: "8px", fontWeight: 700 }}>{(u + a) ? `${(u + a).toLocaleString("en-IN")}/-` : "—"}</td>
                      {fe && <td style={{ padding: "8px" }}><button onClick={() => delHead(i)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", cursor: "pointer" }}>🗑</button></td>}
                    </tr>
                  );
                })}
                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                  <td colSpan={2} style={{ padding: "10px 14px", textAlign: "right" }}>Total</td>
                  <td style={{ padding: "10px 14px" }}>{totalUnspent ? `${totalUnspent.toLocaleString("en-IN")}/-` : "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#1d4ed8" }}>{totalInst ? `${totalInst.toLocaleString("en-IN")}/-` : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>{totalAvail ? `${totalAvail.toLocaleString("en-IN")}/-` : "—"}</td>
                  {fe && <td />}
                </tr>
              </tbody>
            </table>
            {fe && (
              <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9" }}>
                <button onClick={() => setDraft(d => ({ ...d, installmentHeads: [...(d.installmentHeads || []), { head: "", unspent: "", installmentAmount: "" }] }))} style={{ border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>➕ Add Head</button>
              </div>
            )}
          </div>

          {/* Expenditure & Register */}
          <SH>Expenditure & Register Details</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <EF label="M.H. No."                         value={draft.mhNo}            onChange={s("mhNo")}            disabled={!fe} placeholder="e.g. M.H.No.15.1.11" />
            <EF label="Sanction Register Vol"             value={draft.sanctionRegVol}  onChange={s("sanctionRegVol")}  disabled={!fe} placeholder="e.g. VIII" />
            <EF label="Sl. No."                          value={draft.sanctionRegSl}   onChange={s("sanctionRegSl")}   disabled={!fe} />
            <EF label="Page No."                         value={draft.sanctionRegPage} onChange={s("sanctionRegPage")} disabled={!fe} />
            <EF label="Expenditure Note (leave blank for auto)" value={draft.expenditureNote} onChange={s("expenditureNote")} disabled={!fe} span rows={3} />
          </div>

          {/* Tracking */}
          <SH>Transfer Tracking</SH>
          <TransferTimeline item={draft} />

          {/* Director decision */}
          {editable && !isEditing && role === "director" && (draft.status === "PENDING" || draft.status === "TRANSFERRED") && (
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
              <button className="btn-edit" onClick={() => { setDraft(ensureReapWithInstShape(item)); setIsEditing(false); }}>Cancel</button>
            </div>
          )}
        </div>
      ) : (
        <div ref={reportRef}><ReportWith draft={draft} /></div>
      )}
    </ModalShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING — Type Selection Cards
═══════════════════════════════════════════════════════════════════════════ */
function TypeSelectionLanding({ onSelect }) {
  const cards = [
    {
      type: "without", icon: "🔄",
      title: "Re-appropriation without Instalment",
      description: "Re-allocate funds between budget heads from the existing unspent balance. No new instalment amount involved.",
      features: [
        "Sub, Ref list, and body paragraphs",
        "Previous instalments table",
        "Unspent | After Re-appropriation (4-col table)",
        "Expenditure note and sanction register line",
      ],
      accent: "#7c3aed", accentLight: "#f5f3ff", accentBorder: "#ddd6fe",
    },
    {
      type: "with", icon: "📦",
      title: "Re-appropriation with Instalment",
      description: "Combine a new instalment release with re-appropriation of available funds across budget heads.",
      features: [
        "Sub, Ref list, and body paragraphs",
        "Previous instalments + new instalment (PFMS) details",
        "6-col table (Unspent | Instalment | Total | After Reap)",
        "TSA account string and sanction register entry",
      ],
      accent: "#0369a1", accentLight: "#f0f9ff", accentBorder: "#bae6fd",
    },
  ];
  return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>CSRC — Re-appropriation Module</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "0 0 12px", lineHeight: 1.2 }}>Select Claim Type</h1>
        <p style={{ fontSize: "15px", color: "#64748b", margin: 0, maxWidth: "480px" }}>Both types generate official CSRC proceedings in the correct format matching the sanction documents.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", maxWidth: "760px", width: "100%" }}>
        {cards.map(card => (
          <button key={card.type} onClick={() => onSelect(card.type)}
            style={{ background: "#fff", border: `2px solid ${card.accentBorder}`, borderRadius: "20px", padding: "32px", textAlign: "left", cursor: "pointer", transition: "all 0.18s ease", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = card.accent; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = card.accentBorder; }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: card.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{card.icon}</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{card.title}</div>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>{card.description}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {card.features.map(f => (
                <li key={f} style={{ fontSize: "12px", color: "#475569", marginBottom: "5px", display: "flex", alignItems: "flex-start", gap: "7px" }}>
                  <span style={{ color: card.accent, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <span style={{ fontSize: "13px", fontWeight: 700, color: card.accent }}>Get Started →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function OfficeReappropriationPage() {
  const navigate = useNavigate();
  const role     = userRole();
  const [mounted,   setMounted]   = useState(false);
  const [claimType, setClaimType] = useState(null);

  const {
    reapActive, setReapActive,
    reapTransferred, reapCompleted,
    reap_transfer, reap_complete,
    reap_updateTransferred, reap_forwardToDirector,
  } = useProjectContext();

  const [activeTab,  setActiveTab]  = useState("active");
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [manageItem, setManageItem] = useState(null);
  const [toast,      setToast]      = useState(null);

  React.useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };

  const myTransferred = useMemo(() =>
    reapTransferred.filter(i =>
      role === "superintendent" ? i.currentHolder?.role === "superintendent" :
      role === "director"       ? i.currentHolder?.role === "director"       : true
    ), [reapTransferred, role]);

  const sourceData =
    activeTab === "active"      ? (role === "assistant" ? reapActive : myTransferred) :
    activeTab === "transferred" ? reapTransferred :
    reapCompleted;

  const typeFiltered = claimType
    ? sourceData.filter(r => (r.claimType || "without") === claimType)
    : sourceData;

  const counts = {
    all:      typeFiltered.length,
    pending:  typeFiltered.filter(r => r.status === "PENDING" || r.status === "TRANSFERRED").length,
    approved: typeFiltered.filter(r => r.status === "COMPLETED").length,
    declined: typeFiltered.filter(r => r.status === "declined").length,
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return typeFiltered.filter(r => {
      const mf = filter === "all"      ? true
               : filter === "pending"  ? (r.status === "PENDING" || r.status === "TRANSFERRED")
               : filter === "approved" ? r.status === "COMPLETED"
               : filter === "declined" ? r.status === "declined"
               : true;
      const ms = !q || r.projectName?.toLowerCase().includes(q) || r.pi?.toLowerCase().includes(q) || r.agency?.toLowerCase().includes(q) || r.id?.toLowerCase().includes(q);
      return mf && ms;
    });
  }, [typeFiltered, filter, search]);

  const today = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

  const handleApproveTransfer = (item, staff) => {
    const mySig = getProfileSignature(role);
    reap_transfer({ ...item, signatures: { ...(item.signatures || {}), [role]: mySig || true }, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: true }] }, staff);
    showToast(`Approved & transferred to ${staff.name}`);
  };
  const handlePlainTransfer = (item, staff) => {
    reap_transfer({ ...item, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: false }] }, staff);
    showToast(`Transferred to ${staff.name}`);
  };
  const handleApproveForward = (item, staff) => {
    const mySig = getProfileSignature(role);
    reap_forwardToDirector({ ...item, signatures: { ...(item.signatures || {}), [role]: mySig || true }, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: true }] }, staff);
    showToast(`Forwarded to ${staff.name}`);
  };
  const handlePlainForward = (item, staff) => {
    reap_updateTransferred({ ...item, currentHolder: staff, transferHistory: [...(item.transferHistory || []), { from: userName(), fromRole: role, to: staff, date: today(), approved: false }] });
    showToast(`Transferred to ${staff.name}`);
  };

  const handleDecide = (id, decision, remarks) => {
    const item = [...reapActive, ...reapTransferred].find(r => r.id === id);
    if (!item) return;
    if (decision === "approved") reap_complete({ ...item, remarks });
    else reap_updateTransferred({ ...item, status: "declined", remarks });
    setManageItem(null);
    showToast(`Request ${id} ${decision === "approved" ? "approved ✓" : "declined ✗"}`, decision === "approved" ? "success" : "error");
  };

  const handleSaveManaged = (updated) => {
    if (role === "assistant" && activeTab === "active") setReapActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    else reap_updateTransferred(updated);
    setManageItem(null);
  };

  const tabs =
    role === "assistant"
      ? [{ key: "active", label: `New Requests (${reapActive.length})` }, { key: "transferred", label: `Transferred (${reapTransferred.length})` }, { key: "completed", label: `Completed (${reapCompleted.length})` }]
      : role === "superintendent"
      ? [{ key: "active", label: `In My Queue (${myTransferred.length})` }, { key: "transferred", label: `All Transferred (${reapTransferred.length})` }, { key: "completed", label: `Completed (${reapCompleted.length})` }]
      : [{ key: "active", label: `Awaiting Approval (${myTransferred.length})` }, { key: "completed", label: `Completed (${reapCompleted.length})` }];

  const isWithInst  = claimType === "with";
  const accentColor = isWithInst ? "#0369a1" : "#7c3aed";

  /* ─── Landing ─────────────────────────────────────────────────────────── */
  if (!claimType) {
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
        <TypeSelectionLanding onSelect={setClaimType} />
      </div>
    );
  }

  /* ─── Sub-page ────────────────────────────────────────────────────────── */
  return (
    <div className={`project-dashboard ${mounted ? "fs-loaded" : ""}`}>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 999999, padding: "12px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "13px", background: toast.type === "success" ? "#f0fdf4" : "#fef2f2", color: toast.type === "success" ? "#15803d" : "#b91c1c", border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>{toast.msg}</div>
      )}

      {/* Top Nav */}
      <div className="fs-top-nav">
        <button className="fs-btn-back" onClick={() => setClaimType(null)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Claim Type
        </button>
        <div className="fs-nav-right">
          <span style={{ fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px", background: isWithInst ? "#e0f2fe" : "#f5f3ff", color: accentColor }}>
            {isWithInst ? "📦" : "🔄"} {isWithInst ? "With Instalment" : "Without Instalment"}
          </span>
          <span className={`fs-role-chip fs-role-${role}`}>{role === "assistant" ? "🟢" : role === "superintendent" ? "🔵" : "🔴"} {role}</span>
        </div>
      </div>

      {/* Header */}
      <div className="fs-header">
        <h1 className="fs-header-title">{isWithInst ? "📦" : "🔄"} {isWithInst ? "Re-appropriation with Instalment" : "Re-appropriation without Instalment"}</h1>
        <p className="fs-header-sub">{isWithInst ? "Instalment release + fund re-allocation across budget heads" : "Re-allocate existing unspent funds between budget heads"}</p>
      </div>

      <StatsRow counts={counts} />

      {/* Tabs */}
      <div className="tab-switcher">
        {tabs.map(t => <button key={t.key} className={activeTab === t.key ? "active" : ""} onClick={() => setActiveTab(t.key)}>{t.label}</button>)}
      </div>

      {/* Search + Filter */}
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

      {/* Table */}
      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Request ID</th>
            <th>Project / PI</th>
            <th>Agency</th>
            {isWithInst && <th>Instalment</th>}
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
              <td style={{ fontWeight: 700, color: "#1d4ed8" }}>{item.id}</td>
              <td>
                <div style={{ fontWeight: 600, color: "#1e293b" }}>{item.projectName}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{typeof item.pi === "string" ? item.pi : item.pi?.name}</div>
              </td>
              <td><span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{item.agency}</span></td>
              {isWithInst && <td><span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{item.currentInstallmentNo || "—"}</span></td>}
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

      {/* Modals */}
      {manageItem && !isWithInst && (
        <ManageModalWithout item={manageItem} editable={activeTab === "active"} onSave={handleSaveManaged} onClose={() => setManageItem(null)} onDecide={handleDecide} userRole={role} />
      )}
      {manageItem && isWithInst && (
        <ManageModalWith item={manageItem} editable={activeTab === "active"} onSave={handleSaveManaged} onClose={() => setManageItem(null)} onDecide={handleDecide} userRole={role} />
      )}
    </div>
  );
}