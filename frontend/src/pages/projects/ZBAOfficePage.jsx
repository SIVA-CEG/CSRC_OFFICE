import React, { useState, useEffect, useMemo, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   ROLE / STAFF HELPERS  (swap with your ProjectContext when wiring up)
═══════════════════════════════════════════════════════════════════ */
const userRole = () => localStorage.getItem("userRole") || "assistant";
const userName = () => localStorage.getItem("userName") || "Office Assistant";

const STAFF = {
  assistant: [
    { name: "Office Assistant", role: "assistant" },
    { name: "M. Lakshmi", role: "assistant" },
    { name: "R. Karthik", role: "assistant" },
  ],
  superintendent: [
    { name: "S. Ramesh", role: "superintendent" },
    { name: "P. Devi", role: "superintendent" },
  ],
  director: [{ name: "Dr. K. Anand", role: "director" }],
};
const today = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
const fmt = (n) => "₹ " + Number(n || 0).toLocaleString("en-IN");

/* Lazy html2pdf loader (works whether or not the package is installed) */
function getHtml2Pdf() {
  if (typeof window !== "undefined" && window.html2pdf) return window.html2pdf;
  try { return require("html2pdf.js"); } catch { return null; }
}

/* ═══════════════════════════════════════════════════════════════════
   STYLES — premium light theme
═══════════════════════════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.zba-page {
  font-family:'Inter',sans-serif;
  color:#0f172a;
  background: #f8fafc;   /* Add this */
  min-height: 100vh;     /* Add this */
  padding: 24px;         /* Optional */
  animation:zbaFade .4s ease both;
}
@keyframes zbaFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

.zba-top-nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; flex-wrap:wrap; gap:12px; }
.zba-back {
  display:inline-flex; align-items:center; gap:8px; border:none; cursor:pointer;
  background:linear-gradient(135deg,#1e3a8a,#2563eb); color:#fff; font-weight:700; font-size:14px;
  padding:11px 20px; border-radius:14px; box-shadow:0 8px 20px rgba(37,99,235,.28); transition:.2s;
}
.zba-back:hover { transform:translateY(-1px); box-shadow:0 10px 26px rgba(37,99,235,.4); }
.zba-role-chip { display:inline-flex; align-items:center; gap:7px; font-weight:700; font-size:13px;
  padding:8px 16px; border-radius:999px; text-transform:capitalize; }
.role-assistant { background:#dcfce7; color:#15803d; }
.role-superintendent { background:#dbeafe; color:#1d4ed8; }
.role-director { background:#fce7f3; color:#be185d; }

.zba-header h1 { font-family:'Sora',sans-serif; font-size:34px; font-weight:800; margin:0 0 6px;
  background:linear-gradient(90deg,#0f172a,#334155); -webkit-background-clip:text; background-clip:text; color:transparent; }
.zba-header p { color:#64748b; font-size:14.5px; margin:0 0 22px; }

/* tabs */
.zba-tabs { display:flex; gap:10px; margin-bottom:22px; flex-wrap:wrap; }
.zba-tab { border:1px solid #e2e8f0; background:#fff; color:#475569; font-weight:700; font-size:14px;
  padding:11px 22px; border-radius:14px; cursor:pointer; transition:.2s; box-shadow:0 2px 8px rgba(15,23,42,.04); }
.zba-tab:hover { border-color:#bfdbfe; }
.zba-tab.active { background:linear-gradient(135deg,#1e3a8a,#2563eb); color:#fff; border-color:transparent;
  box-shadow:0 8px 20px rgba(37,99,235,.32); }

/* search */
.zba-search { position:relative; max-width:100%; margin-bottom:20px; }
.zba-search input { width:100%; box-sizing:border-box; border:1px solid #e2e8f0; border-radius:16px;
  padding:14px 16px 14px 46px; font-size:15px; font-family:'Inter'; outline:none; background:#fff;
  box-shadow:0 2px 10px rgba(15,23,42,.04); transition:.2s; }
.zba-search input:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,.1); }
.zba-search .si { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8; }
.zba-search .sc { position:absolute; right:14px; top:50%; transform:translateY(-50%); border:none;
  background:#f1f5f9; color:#64748b; width:26px; height:26px; border-radius:8px; cursor:pointer; }

/* category quick-nav (replaces non-recurring/recurring split as filter pills) */
.zba-cat-bar { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
.zba-cat-pill { border:1px solid #e2e8f0; background:#fff; padding:9px 16px; border-radius:12px; cursor:pointer;
  font-weight:600; font-size:13px; color:#475569; display:flex; align-items:center; gap:7px; transition:.2s; }
.zba-cat-pill:hover { border-color:#c4b5fd; }
.zba-cat-pill.active { background:#eef2ff; border-color:#a5b4fc; color:#4338ca; }
.zba-cat-pill .cnt { background:#eef2f7; padding:1px 8px; border-radius:999px; font-size:11px; }
.zba-cat-pill.active .cnt { background:#e0e7ff; color:#4338ca; }

/* table */
.zba-table-card { background:#fff; border:1px solid #eef0f5; border-radius:20px; overflow:hidden;
  box-shadow:0 12px 40px rgba(15,23,42,.06); }
.zba-table-wrap { overflow-x:auto; }
.zba-table { width:100%; border-collapse:collapse; min-width:960px; }
.zba-table thead th { background:linear-gradient(135deg,#1e3a8a,#2563eb); color:#fff; font-family:'Sora';
  font-size:12px; font-weight:700; text-align:left; padding:16px 18px; white-space:nowrap; }
.zba-table tbody td { padding:15px 18px; border-bottom:1px solid #f1f5f9; font-size:13.5px; color:#334155; vertical-align:middle; }
.zba-table tbody tr:last-child td { border-bottom:none; }
.zba-table tbody tr:hover td { background:#fafbff; }
.zba-amount { font-family:'Sora'; font-weight:800; color:#16a34a; }
.zba-muted { font-size:12px; color:#94a3b8; }
.zba-type { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; }
.zba-type.nr { background:#eff6ff; color:#2563eb; }
.zba-type.rec { background:#f5f3ff; color:#7c3aed; }
.zba-head-badge { background:#f1f5f9; color:#475569; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; white-space: nowrap; }

.zba-stage {
  padding:5px 12px;
  border-radius:999px;
  font-size:11px;
  font-weight:700;

  white-space: nowrap;
  display: inline-block;
  text-align: center;
}
.zba-stage.supdt { background:#dbeafe; color:#1d4ed8; }
.zba-stage.dir { background:#fce7f3; color:#be185d; }
.zba-stage.asst { background:#dcfce7; color:#15803d; }
.zba-stage.done { background:#dcfce7; color:#15803d; }

.zba-status { padding:5px 12px; border-radius:999px; font-size:11px; font-weight:700; white-space: nowrap;}
.zba-status.pending { background:#fef3c7; color:#b45309; }
.zba-status.approved { background:#dcfce7; color:#15803d; }
.zba-status.rejected { background:#fee2e2; color:#b91c1c; }

/* action buttons (vertical stack like screenshot) */
.zba-actions { display:flex; flex-direction:column; gap:7px; align-items:stretch; min-width:170px; }
.zba-btn { border:none; cursor:pointer; font-weight:700; font-size:12.5px; padding:9px 14px;
  border-radius:11px; display:inline-flex; align-items:center; justify-content:center; gap:6px; transition:.2s; }
.zba-btn:hover { transform:translateY(-1px); }
.zba-btn.view { background:linear-gradient(135deg,#0ea5e9,#2563eb); color:#fff; box-shadow:0 6px 16px rgba(37,99,235,.28); }
.zba-btn.approve { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
.zba-btn.transfer { background:#eef2ff; color:#4338ca; border:1px solid #c7d2fe; }
.zba-btn.reject { background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }
.zba-btn.finalize { background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; box-shadow:0 6px 16px rgba(34,197,94,.3); }
.zba-btn.revert { background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; }

.zba-empty { text-align:center; padding:50px 24px; color:#94a3b8; }
.zba-empty .ico { font-size:42px; margin-bottom:10px; }

/* stats */
.zba-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
@media(max-width:800px){ .zba-stats{ grid-template-columns:repeat(2,1fr);} .zba-actions{min-width:0;} }
.zba-stat { background:#fff; border:1px solid #eef0f5; border-radius:16px; padding:16px 18px; box-shadow:0 4px 14px rgba(15,23,42,.04); }
.zba-stat p { margin:0 0 5px; font-size:11px; text-transform:uppercase; letter-spacing:.8px; color:#94a3b8; }
.zba-stat h4 { margin:0; font-family:'Sora'; font-size:24px; }
.zba-stat h4.b{color:#2563eb}.zba-stat h4.y{color:#d97706}.zba-stat h4.g{color:#16a34a}.zba-stat h4.r{color:#dc2626}

/* ───── MODAL ───── */
.zm-overlay { position:fixed; inset:0; z-index:100000; background:rgba(15,23,42,.6); backdrop-filter:blur(3px);
  display:flex; align-items:flex-start; justify-content:center; padding:16px; }
.zm-box { background:#f8fafc; border-radius:20px; width:min(980px,96vw); height:calc(100vh - 32px);
  overflow:hidden; display:flex; flex-direction:column; box-shadow:0 40px 100px rgba(0,0,0,.45); }
.zm-head { padding:18px 24px; background:linear-gradient(135deg,#0f172a,#1e293b);
  display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; }
.zm-head .lbl { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:rgba(255,255,255,.55); margin-bottom:5px; }
.zm-head .ttl { font-family:'Sora'; font-size:16px; font-weight:700; color:#fff; }
.zm-head .pill { display:inline-block; margin-top:9px; font-size:12px; font-weight:600; padding:4px 12px; border-radius:999px; }
.zm-headbtns { display:flex; gap:8px; }
.zm-hbtn { border:none; border-radius:10px; padding:8px 14px; cursor:pointer; font-weight:700; font-size:12px; }
.zm-hbtn.edit { background:#2563eb; color:#fff; }
.zm-hbtn.pdf { background:#16a34a; color:#fff; }
.zm-hbtn.close { background:#ef4444; color:#fff; }
.zm-tabbar { display:flex; gap:6px; padding:0 24px; background:#fff; border-bottom:1px solid #e2e8f0; }
.zm-tab { border:none; background:none; cursor:pointer; padding:14px 18px; font-weight:700; font-size:13.5px;
  color:#64748b; border-bottom:3px solid transparent; }
.zm-tab.active { color:#2563eb; border-bottom-color:#2563eb; }
.zm-body { flex:1; overflow-y:auto; padding:22px 26px; }
.zm-body.report { background:#e5e7eb; }

.zm-sec { font-family:'Sora'; font-size:15px; font-weight:700; color:#0f172a; margin:22px 0 12px; }
.zm-sec:first-child { margin-top:0; }
.zm-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
@media(max-width:640px){ .zm-grid{grid-template-columns:1fr;} }
.zm-field label { display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:6px; }
.zm-field input, .zm-field select, .zm-field textarea {
  width:100%; box-sizing:border-box; border:1px solid #e2e8f0; border-radius:10px; padding:10px 13px;
  font-size:13.5px; font-family:'Inter'; outline:none; background:#fff; transition:.2s; }
.zm-field input:disabled { background:#f8fafc; color:#475569; }
.zm-field input:focus, .zm-field select:focus, .zm-field textarea:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.1); }

/* bills */
.zm-bill-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:16px; margin-bottom:14px; box-shadow:0 4px 14px rgba(15,23,42,.04); }
.zm-bill-row { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f1f5f9; }
.zm-bill-row:last-child { border-bottom:none; }
.zm-bill-name { font-weight:600; font-size:13.5px; color:#334155; }
.zm-bill-amt { font-family:'Sora'; font-weight:700; color:#16a34a; }

.zm-save { display:flex; gap:12px; margin-top:20px; }
.zm-save .s { background:#16a34a; color:#fff; }
.zm-save .c { background:#f1f5f9; color:#475569; }
.zm-save button { border:none; border-radius:11px; padding:10px 20px; font-weight:700; cursor:pointer; }

/* timeline */
.tl-entry { display:flex; gap:12px; margin-bottom:14px; }
.tl-dotwrap { display:flex; flex-direction:column; align-items:center; min-width:28px; }
.tl-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; }
.tl-line { width:2px; flex:1; background:#e2e8f0; margin-top:4px; min-height:14px; }
.tl-date { font-size:11px; color:#94a3b8; margin-bottom:3px; }
.tl-row { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
.tl-from { font-size:12.5px; color:#64748b; }
.tl-to { font-size:12.5px; font-weight:700; color:#1e293b; }
.tl-rb { font-size:10px; padding:1px 7px; border-radius:999px; font-weight:600; }
.tl-status { margin-top:4px; display:inline-block; font-size:10px; padding:2px 9px; border-radius:999px; }

/* dialog */
.zd-box { width:min(460px,94vw); background:#fff; border-radius:20px; overflow:hidden; margin-top:9vh; box-shadow:0 40px 100px rgba(0,0,0,.4); }
.zd-head { padding:18px 22px; font-family:'Sora'; font-weight:700; font-size:17px; border-bottom:1px solid #f1f5f9; }
.zd-body { padding:20px 22px; }
.zd-body label { display:block; font-size:12.5px; font-weight:600; color:#475569; margin-bottom:7px; }
.zd-body select, .zd-body textarea { width:100%; box-sizing:border-box; border:1px solid #e2e8f0; border-radius:11px;
  padding:11px 13px; font-size:13.5px; font-family:'Inter'; outline:none; resize:vertical; }
.zd-body select:focus, .zd-body textarea:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
.zd-info { background:#f8fafc; border:1px solid #eef0f5; border-radius:12px; padding:12px 14px; margin-bottom:16px; font-size:13px; color:#475569; }
.zd-foot { padding:16px 22px; display:flex; gap:10px; justify-content:flex-end; border-top:1px solid #f1f5f9; }
.zd-btn { border:none; border-radius:12px; padding:10px 20px; font-weight:700; cursor:pointer; font-size:13.5px; }
.zd-cancel { background:#f1f5f9; color:#475569; }
.zd-ok { background:linear-gradient(135deg,#1e3a8a,#2563eb); color:#fff; }
.zd-ok.danger { background:linear-gradient(135deg,#b91c1c,#ef4444); }
.zd-ok:disabled { opacity:.5; cursor:not-allowed; }
`;

/* ═══════════════════════════════════════════════════════════════════
   SMALL COMPONENTS
═══════════════════════════════════════════════════════════════════ */
function statusOf(c) {
  if (c.status === "approved") return "approved";
  if (c.status === "rejected") return "rejected";
  return "pending";
}
function StatusBadge({ st }) {
  const map = { approved: ["approved", "✓ Approved"], rejected: ["rejected", "✕ Rejected"], pending: ["pending", "⏳ Pending"] };
  const [cls, txt] = map[st];
  return <span className={`zba-status ${cls}`}>{txt}</span>;
}
function StageBadge({ role }) {
  const map = {
    superintendent: ["supdt", "With Superintendent"],
    director: ["dir", "With Director"],
    assistant: ["asst", "With Assistant"],
  };
  const [cls, txt] = map[role] || ["done", "Completed"];
  return <span className={`zba-stage ${cls}`}>{txt}</span>;
}

function TransferTimeline({ item }) {
  const history = item.transferHistory || [];
  const rbColor = (r) => r === "superintendent" ? { bg: "#dbeafe", c: "#1d4ed8" } : r === "director" ? { bg: "#fce7f3", c: "#be185d" } : { bg: "#dcfce7", c: "#15803d" };
  if (!history.length) {
    return <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
      No transfer history yet. This claim is still with the assistant.</div>;
  }
  return (
    <div style={{ padding: "8px 0" }}>
      {history.map((e, i) => {
        const toName = typeof e.to === "object" ? e.to?.name : e.to;
        const toRole = typeof e.to === "object" ? e.to?.role : null;
        const fromName = typeof e.from === "object" ? e.from?.name : e.from;
        const ok = e.approved;
        return (
          <div className="tl-entry" key={i}>
            <div className="tl-dotwrap">
              <div className="tl-dot" style={{ background: ok ? "#dcfce7" : "#dbeafe", color: ok ? "#16a34a" : "#2563eb", border: `2px solid ${ok ? "#16a34a" : "#2563eb"}` }}>{ok ? "✔" : "↪"}</div>
              {i < history.length - 1 && <div className="tl-line" />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="tl-date">{e.date}</div>
              <div className="tl-row">
                <span className="tl-from">{fromName}</span>
                <span style={{ color: "#cbd5e1" }}>→</span>
                <span className="tl-to">{toName}</span>
                {toRole && toRole !== "completed" && toRole !== "rejected" &&
                  <span className="tl-rb" style={{ background: rbColor(toRole).bg, color: rbColor(toRole).c }}>{toRole}</span>}
              </div>
              <div className="tl-status" style={{ background: ok ? "#f0fdf4" : "#eff6ff", color: ok ? "#16a34a" : "#2563eb", border: `1px solid ${ok ? "#bbf7d0" : "#bfdbfe"}` }}>
                {e.remark ? `✕ Rejected — ${e.remark}` : ok ? "✔ Approved & Forwarded" : "↪ Forwarded (Pending Approval)"}
              </div>
            </div>
          </div>
        );
      })}
      <div className="tl-entry">
        {item.currentHolder ? (
          <>
            <div className="tl-dot" style={{ background: "#fef9c3", color: "#ca8a04", border: "2px solid #ca8a04" }}>⏳</div>
            <div style={{ fontSize: 12.5, color: "#92400e", fontWeight: 500, paddingTop: 4 }}>
              Waiting for action from <strong>{item.currentHolder.name}</strong> ({item.currentHolder.role})
            </div>
          </>
        ) : (
          <>
            <div className="tl-dot" style={{ background: "#dcfce7", color: "#16a34a", border: "2px solid #16a34a" }}>✔</div>
            <div style={{ fontSize: 12.5, color: "#15803d", fontWeight: 600, paddingTop: 4 }}>
              {statusOf(item) === "rejected" ? "Process Closed — Rejected" : "Process Completed — Fully Approved"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════════════
   MANAGE MODAL — Details & Tracking + Bills + Report (html2pdf)
═══════════════════════════════════════════════════════════════════ */
function ManageModal({ claim, editable, onSave, onClose }) {
  const [tab, setTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(claim)));
  const reportRef = useRef(null);

  useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(claim)));
    setIsEditing(false);
  }, [claim]);

  const fieldsEditable = editable && isEditing;
  const st = statusOf(draft);
  const holderRole = draft.currentHolder?.role;
  const isCompleted = !draft.currentHolder && (draft.transferHistory?.length > 0);

  const bills = draft.bills || [];
  const billsTotal = bills.reduce((a, b) => a + (parseFloat(b.amount) || 0), 0);

  const patch = (p) => setDraft((d) => ({ ...d, ...p }));

  const downloadPDF = () => {
    const lib = getHtml2Pdf();
    if (!lib || !reportRef.current) {
      window.print();
      return;
    }
    lib()
      .set({
        margin: 10,
        filename: `${draft.head || "Claim"}-${draft._projectId || ""}-Report.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  };

  const handleSaveClick = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const sc = holderRole === "superintendent"
    ? { bg: "#dbeafe", c: "#1d4ed8" }
    : holderRole === "director"
    ? { bg: "#fce7f3", c: "#be185d" }
    : { bg: "#dcfce7", c: "#15803d" };

  return (
    <div className="zm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="zm-box">
        {/* Header */}
        <div className="zm-head">
          <div>
            <div className="lbl">CLAIM · {draft._projectId} — {draft._projectTitle}</div>
            <div className="ttl">{draft.head} · {draft.type}</div>
            {draft.currentHolder ? (
              <span className="pill" style={{ background: sc.bg, color: sc.c }}>
                {holderRole === "superintendent" ? "🔵" : holderRole === "director" ? "🔴" : "🟢"}{" "}
                Currently with {draft.currentHolder.name} ({holderRole})
              </span>
            ) : st === "rejected" ? (
              <span className="pill" style={{ background: "#fee2e2", color: "#b91c1c" }}>✕ Rejected</span>
            ) : draft.transferHistory?.length > 0 ? (
              <span className="pill" style={{ background: "#dcfce7", color: "#15803d" }}>✔ Completed</span>
            ) : null}
          </div>
          <div className="zm-headbtns">
            {editable && tab === "details" && !isEditing && (
              <button className="zm-hbtn edit" onClick={() => setIsEditing(true)}>✏️ Edit</button>
            )}
            {tab === "report" && (
              <button className="zm-hbtn pdf" onClick={downloadPDF}>📄 Download PDF</button>
            )}
            <button className="zm-hbtn close" onClick={onClose}>✕ Close</button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="zm-tabbar">
          <button className={`zm-tab ${tab === "details" ? "active" : ""}`} onClick={() => setTab("details")}>
            📋 Details &amp; Tracking
          </button>
          <button className={`zm-tab ${tab === "report" ? "active" : ""}`} onClick={() => setTab("report")}>
            📄 Report
          </button>
        </div>

        {/* Body */}
        <div className={`zm-body ${tab === "report" ? "report" : ""}`}>
          {/* ── DETAILS & TRACKING ── */}
          {tab === "details" && (
            <>
              <div className="zm-sec">Claim Details</div>
              <div className="zm-grid">
                <div className="zm-field">
                  <label>Category</label>
                  <select disabled={!fieldsEditable} value={draft.type || ""}
                    onChange={(e) => patch({ type: e.target.value })}>
                    <option>Non-Recurring</option>
                    <option>Recurring</option>
                  </select>
                </div>
                <div className="zm-field">
                  <label>Head</label>
                  <input disabled={!fieldsEditable} value={draft.head || ""}
                    onChange={(e) => patch({ head: e.target.value })} />
                </div>
                <div className="zm-field">
                  <label>Claim Date</label>
                  <input disabled={!fieldsEditable} value={draft.date || ""}
                    placeholder="DD-MM-YYYY"
                    onChange={(e) => patch({ date: e.target.value })} />
                </div>
                <div className="zm-field">
                  <label>Amount (₹)</label>
                  <input type="number" disabled={!fieldsEditable} value={draft.amount ?? ""}
                    onChange={(e) => patch({ amount: e.target.value })} />
                </div>
                <div className="zm-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Project</label>
                  <input disabled value={`${draft._projectId} — ${draft._projectTitle}`} />
                </div>
                {st === "rejected" && draft.rejectionRemark && (
                  <div className="zm-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Rejection Remark</label>
                    <textarea disabled rows={2} value={draft.rejectionRemark} />
                  </div>
                )}
              </div>

              <div className="zm-sec">Transfer Tracking</div>
              <TransferTimeline item={draft} />

              {editable && isEditing && (
                <div className="zm-save">
                  <button className="s" onClick={handleSaveClick}>💾 Save Changes</button>
                  <button className="c" onClick={() => { setDraft(JSON.parse(JSON.stringify(claim))); setIsEditing(false); }}>
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── REPORT (printed via html2pdf) ── */}
          {tab === "report" && (
            <div ref={reportRef} style={{ background: "#fff", padding: "30px 36px", borderRadius: 8, maxWidth: 820, margin: "0 auto", fontSize: 13, lineHeight: 1.6, color: "#111" }}>
              <div style={{ textAlign: "center", borderBottom: "2px solid #111", paddingBottom: 12, marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontFamily: "Sora,serif" }}>CLAIM SANCTION PROCEEDINGS</h2>
                <div style={{ fontSize: 12, color: "#555" }}>{draft._projectTitle} ({draft._projectId})</div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
                <tbody>
                  {[
                    ["Category", draft.type],
                    ["Head", draft.head],
                    ["Claim Date", draft.date],
                    ["Amount", fmt(draft.amount)],
                    ["Status", st.toUpperCase()],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ border: "1px solid #ccc", padding: "8px 12px", fontWeight: 700, background: "#f8fafc", width: "35%" }}>{k}</td>
                      <td style={{ border: "1px solid #ccc", padding: "8px 12px" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderTop: "1px solid #111", paddingTop: 6, minWidth: 160 }}>Superintendent</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderTop: "1px solid #111", paddingTop: 6, minWidth: 160 }}>Director</div>
                </div>
              </div>
              {isCompleted && (
                <div style={{ marginTop: 24, textAlign: "center", color: "#16a34a", fontWeight: 700 }}>
                  ✔ Fully Approved &amp; Sanctioned
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CLAIMS TABLE — two separate transfer buttons (Approve & Transfer +
   Transfer No Approval), per role + stage
═══════════════════════════════════════════════════════════════════ */
function ClaimsTable({
  claims, role, tab, showStage,
  onView, onApproveTransfer, onPlainTransfer, onReject, onComplete, onRevert,
}) {
  if (!claims.length) {
    return <div className="zba-empty"><div className="ico">📭</div>No claims to display.</div>;
  }

  const isActive = tab === "active";

  return (
    <div className="zba-table-card">
      <div className="zba-table-wrap">
        <table className="zba-table">
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Project</th>
              <th>Date</th>
              <th>Category</th>
              <th>Head</th>
              <th>Amount (₹)</th>
              {showStage && <th>Stage</th>}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c, i) => {
              const st = statusOf(c);
              return (
                <tr key={c.id}>
                  <td style={{ color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c._projectId}</div>
                    <div className="zba-muted">{c._projectTitle}</div>
                  </td>
                  <td>{c.date}</td>
                  <td>
                    <span className={`zba-type ${c.type === "Non-Recurring" ? "nr" : "rec"}`}>{c.type}</span>
                  </td>
                  <td><span className="zba-head-badge">{c.head}</span></td>
                  <td className="zba-amount">{fmt(c.amount)}</td>
                  {showStage && <td><StageBadge role={c.currentHolder?.role} /></td>}
                  <td><StatusBadge st={st} /></td>
                  <td>
                    <div className="zba-actions">
                      <button className="zba-btn view" onClick={() => onView(c)}>👁 View</button>

                      {/* Assistant / Superintendent — active queue: 2 transfer buttons */}
                      {isActive && (role === "assistant" || role === "superintendent") && st === "pending" && (
                        <>
                          <button className="zba-btn approve" onClick={() => onApproveTransfer(c)}>
                            ✓ {role === "assistant" ? "Approve & Transfer" : "Approve & Forward"}
                          </button>
                          <button className="zba-btn transfer" onClick={() => onPlainTransfer(c)}>
                            ↪ Transfer (No Approval)
                          </button>
                          <button className="zba-btn reject" onClick={() => onReject(c)}>✕ Reject</button>
                        </>
                      )}

                      {/* Director — final approve */}
                      {isActive && role === "director" && st === "pending" && (
                        <>
                          <button className="zba-btn finalize" onClick={() => onComplete(c)}>✓ Final Approve</button>
                          <button className="zba-btn reject" onClick={() => onReject(c)}>✕ Reject</button>
                        </>
                      )}

                      {/* Completed / history revert */}
                      {tab === "completed" && st !== "pending" && onRevert && (
                        <button className="zba-btn revert" onClick={() => onRevert(c)}>↺ Revert</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TRANSFER DIALOG
═══════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════
   TRANSFER DIALOG
   - Approve & Transfer  → forward to NEXT HIGHER level
   - Transfer (No Approval) → transfer to SAME level
═══════════════════════════════════════════════════════════════════ */
function TransferDialog({ claim, role, mode, onConfirm, onClose }) {
  const approve = mode === "approve";

  // Approve & Transfer → next higher level. Plain transfer → same level.
  const targetRoleKey = approve
    ? (role === "assistant" ? "superintendent" : "director")
    : role;

  const targetRoleLabel = {
    assistant: "Assistant",
    superintendent: "Superintendent",
    director: "Director",
  }[targetRoleKey];

  const staffList = STAFF[targetRoleKey] || [];
  const [staffName, setStaffName] = useState(staffList[0]?.name || "");

  return (
    <div className="zm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="zd-box">
        <div className="zd-head">
          {approve
            ? `Approve & ${role === "assistant" ? "Transfer" : "Forward"}`
            : "Transfer (No Approval)"}
        </div>
        <div className="zd-body">
          <div className="zd-info">
            <strong>{claim.head}</strong> · {fmt(claim.amount)} · {claim._projectId}
            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
              {approve
                ? `Forwarding to the next level → ${targetRoleLabel}`
                : `Transferring within the same level → ${targetRoleLabel}`}
            </div>
          </div>
          <label>Send to {targetRoleLabel}</label>
          <select value={staffName} onChange={(e) => setStaffName(e.target.value)}>
            {staffList.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="zd-foot">
          <button className="zd-btn zd-cancel" onClick={onClose}>Cancel</button>
          <button className="zd-btn zd-ok" disabled={!staffName}
            onClick={() => {
              const staff = staffList.find((s) => s.name === staffName) || staffList[0];
              onConfirm(staff, approve);
            }}>
            {approve ? "Approve & Send" : "Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REJECT DIALOG
═══════════════════════════════════════════════════════════════════ */
function RejectDialog({ claim, onConfirm, onClose }) {
  const [remark, setRemark] = useState("");
  return (
    <div className="zm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="zd-box">
        <div className="zd-head">Reject Claim</div>
        <div className="zd-body">
          <div className="zd-info">
            <strong>{claim.head}</strong> · {fmt(claim.amount)} · {claim._projectId}
          </div>
          <label>Reason for rejection <span style={{ color: "#dc2626" }}>*</span></label>
          <textarea rows={4} value={remark} onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. Missing supporting documents, amount exceeds sanctioned head..." />
        </div>
        <div className="zd-foot">
          <button className="zd-btn zd-cancel" onClick={onClose}>Cancel</button>
          <button className="zd-btn zd-ok danger" disabled={!remark.trim()}
            onClick={() => onConfirm(remark)}>✕ Confirm Reject</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DUMMY DATA
═══════════════════════════════════════════════════════════════════ */
const DUMMY_PROJECTS = [
  { id: "ZBA001", title: "AI Based Research Project" },
  { id: "ZBA002", title: "IoT Smart Monitoring System" },
  { id: "ZBA003", title: "Smart Agriculture Analytics" },
];

const seedBills = (n) =>
  Array.from({ length: n }, (_, i) => ({
    name: `Voucher ${i + 1}`, ref: `BILL-${1000 + i}`, date: today(),
    amount: Math.round(5000 + Math.random() * 20000),
  }));

const DUMMY_CLAIMS_STORE = {
  ZBA001: [
    { id: 1, date: "18-06-2026", type: "Non-Recurring", head: "Equipment", amount: 250000, status: "review", bills: seedBills(2), currentHolder: { name: userName(), role: "assistant" }, transferHistory: [] },
    { id: 2, date: "19-06-2026", type: "Recurring", head: "Manpower", amount: 38440, status: "review", bills: seedBills(1), currentHolder: { name: userName(), role: "assistant" }, transferHistory: [] },
    { id: 3, date: "20-06-2026", type: "Recurring", head: "Travel", amount: 25000, status: "review", bills: seedBills(3), currentHolder: { name: userName(), role: "assistant" }, transferHistory: [] },
  ],
  ZBA002: [
    { id: 4, date: "17-06-2026", type: "Recurring", head: "Consumables & Accessories", amount: 85000, status: "review", bills: seedBills(2), currentHolder: { name: "S. Ramesh", role: "superintendent" }, transferHistory: [{ from: userName(), fromRole: "assistant", to: { name: "S. Ramesh", role: "superintendent" }, date: today(), approved: true }] },
    { id: 6, date: "14-06-2026", type: "Recurring", head: "Other Expenses", amount: 30000, status: "rejected", rejectionRemark: "Insufficient supporting documents", bills: seedBills(1), currentHolder: null, transferHistory: [{ from: userName(), fromRole: "assistant", to: { name: "Rejected", role: "rejected" }, date: today(), approved: false, remark: "Insufficient supporting documents" }] },
  ],
  ZBA003: [
    { id: 8, date: "12-06-2026", type: "Recurring", head: "Manpower", amount: 55000, status: "approved", bills: seedBills(2), currentHolder: null, transferHistory: [{ from: userName(), fromRole: "assistant", to: { name: "S. Ramesh", role: "superintendent" }, date: today(), approved: true }, { from: "S. Ramesh", fromRole: "superintendent", to: { name: "Dr. K. Anand", role: "director" }, date: today(), approved: true }, { from: "Dr. K. Anand", fromRole: "director", to: { name: "Completed", role: "completed" }, date: today(), approved: true }] },
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function ZBAOfficePage({
  claimsStore: initialStore = DUMMY_CLAIMS_STORE,
  projects = DUMMY_PROJECTS,
  onBack,
}) {
  const role = userRole();
  const [store, setStore] = useState(initialStore);
  const [activeTab, setActiveTab] = useState("active"); // active | transferred | completed
  const [catFilter, setCatFilter] = useState("all"); // all | Non-Recurring | Recurring
  const [search, setSearch] = useState("");

  const [manageItem, setManageItem] = useState(null);
  const [transferTarget, setTransferTarget] = useState(null); // { claim, mode }
  const [rejectTarget, setRejectTarget] = useState(null);

  /* flatten with project context */
  const allClaims = useMemo(() => {
    const list = [];
    Object.entries(store).forEach(([pid, claims]) => {
      const proj = projects.find((p) => p.id === pid);
      (claims || []).forEach((c) =>
        list.push({ ...c, _projectId: pid, _projectTitle: proj ? proj.title : pid })
      );
    });
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [store, projects]);

  /* role-scoped buckets */
/* role-scoped buckets */
const activeClaims = useMemo(
  () =>
    allClaims.filter((c) => {
      if (statusOf(c) !== "pending") return false;
      // Must be MY queue: same role AND I am the specific current holder.
      // (Same-level transfers keep the role but change the holder name,
      //  so matching by name removes it from the sender's New Requests.)
      return (
        c.currentHolder?.role === role &&
        c.currentHolder?.name === userName()
      );
    }),
  [allClaims, role]
);

  const transferredClaims = useMemo(
    () => allClaims.filter((c) => statusOf(c) === "pending" && (c.transferHistory?.length > 0)),
    [allClaims]
  );

  const completedClaims = useMemo(
    () => allClaims.filter((c) => statusOf(c) === "approved" || statusOf(c) === "rejected"),
    [allClaims]
  );

  const source =
    activeTab === "active" ? activeClaims :
    activeTab === "transferred" ? transferredClaims :
    completedClaims;

  const filtered = useMemo(() => {
    let list = source;
    if (catFilter !== "all") list = list.filter((c) => c.type === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (c.head || "").toLowerCase().includes(q) ||
        (c.type || "").toLowerCase().includes(q) ||
        (c._projectTitle || "").toLowerCase().includes(q) ||
        (c._projectId || "").toLowerCase().includes(q) ||
        (c.date || "").includes(q) ||
        String(c.amount || "").includes(q)
      );
    }
    return list;
  }, [source, catFilter, search]);

  /* stats */
  const stats = useMemo(() => ({
    total: allClaims.length,
    pending: allClaims.filter((c) => statusOf(c) === "pending").length,
    approved: allClaims.filter((c) => statusOf(c) === "approved").length,
    rejected: allClaims.filter((c) => statusOf(c) === "rejected").length,
  }), [allClaims]);

  /* store mutation */
  const patchClaim = (projectId, claimId, patch) => {
    setStore((prev) => ({
      ...prev,
      [projectId]: prev[projectId].map((c) => (c.id === claimId ? { ...c, ...patch } : c)),
    }));
  };

  /* handlers */
  const handleSaveManaged = (updated) => {
    patchClaim(updated._projectId, updated.id, updated);
    setManageItem(null);
  };

  const confirmTransfer = (staff, approved) => {
  const c = transferTarget.claim;
  // approved → escalate to next higher level; otherwise → same level (staff carries its own role)
  const nextRole = approved
    ? (role === "assistant" ? "superintendent" : "director")
    : staff.role; // same-level transfer keeps the staff member's own role

  patchClaim(c._projectId, c.id, {
    currentHolder: { name: staff.name, role: nextRole },
    transferHistory: [
      ...(c.transferHistory || []),
      { from: userName(), fromRole: role, to: { ...staff, role: nextRole }, date: today(), approved },
    ],
  });
  setTransferTarget(null);
};

  const handleComplete = (c) => {
    patchClaim(c._projectId, c.id, {
      status: "approved",
      currentHolder: null,
      transferHistory: [
        ...(c.transferHistory || []),
        { from: userName(), fromRole: role, to: { name: "Completed", role: "completed" }, date: today(), approved: true },
      ],
    });
  };

  const confirmReject = (remark) => {
    const c = rejectTarget;
    patchClaim(c._projectId, c.id, {
      status: "rejected",
      rejectionRemark: remark,
      currentHolder: null,
      transferHistory: [
        ...(c.transferHistory || []),
        { from: userName(), fromRole: role, to: { name: "Rejected", role: "rejected" }, date: today(), approved: false, remark },
      ],
    });
    setRejectTarget(null);
  };

  const handleRevert = (c) => {
    patchClaim(c._projectId, c.id, {
      status: "review",
      rejectionRemark: undefined,
      currentHolder: { name: userName(), role },
    });
  };

  /* tabs by role */
  const tabs =
    role === "assistant"
      ? [
          { key: "active", label: `New Requests (${activeClaims.length})` },
          { key: "transferred", label: `Transferred (${transferredClaims.length})` },
          { key: "completed", label: `Completed (${completedClaims.length})` },
        ]
      : role === "superintendent"
      ? [
          { key: "active", label: `In My Queue (${activeClaims.length})` },
          { key: "transferred", label: `All Transferred (${transferredClaims.length})` },
          { key: "completed", label: `Completed (${completedClaims.length})` },
        ]
      : [
          { key: "active", label: `Awaiting Approval (${activeClaims.length})` },
          { key: "completed", label: `Completed (${completedClaims.length})` },
        ];

  const cats = [
    { key: "all", label: "All", count: source.length },
    { key: "Non-Recurring", label: "🔧 Non-Recurring", count: source.filter((c) => c.type === "Non-Recurring").length },
    { key: "Recurring", label: "🔄 Recurring", count: source.filter((c) => c.type === "Recurring").length },
  ];

  const showStage = activeTab === "transferred" || (role !== "assistant" && activeTab === "active");

  return (
    <>
      <style>{css}</style>
      <div className="zba-page">
        {/* Top nav */}
        <div className="zba-top-nav">
          <button className="zba-back" onClick={() => (onBack ? onBack() : window.history.back())}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <span className={`zba-role-chip role-${role}`}>
            {role === "assistant" ? "🟢" : role === "superintendent" ? "🔵" : "🔴"} {role}
          </span>
        </div>

        {/* Header */}
        <div className="zba-header">
          <h1>BILL PROCESSING</h1>
          <p>Bill claim requests — review and transfer</p>
        </div>

        {/* Stats */}
        <div className="zba-stats">
          <div className="zba-stat"><p>Total Claims</p><h4 className="b">{stats.total}</h4></div>
          <div className="zba-stat"><p>Pending</p><h4 className="y">{stats.pending}</h4></div>
          <div className="zba-stat"><p>Approved</p><h4 className="g">{stats.approved}</h4></div>
          <div className="zba-stat"><p>Rejected</p><h4 className="r">{stats.rejected}</h4></div>
        </div>

        {/* Tabs */}
        <div className="zba-tabs">
          {tabs.map((t) => (
            <button key={t.key} className={`zba-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="zba-cat-bar">
          {cats.map((c) => (
            <button key={c.key} className={`zba-cat-pill ${catFilter === c.key ? "active" : ""}`}
              onClick={() => setCatFilter(c.key)}>
              {c.label} <span className="cnt">{c.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="zba-search">
          <span className="si">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input placeholder="Search by head, category, project, date, amount..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="sc" onClick={() => setSearch("")}>✕</button>}
        </div>

        {/* Table */}
        <ClaimsTable
          claims={filtered}
          role={role}
          tab={activeTab}
          showStage={showStage}
          onView={(c) => setManageItem(c)}
          onApproveTransfer={(c) => setTransferTarget({ claim: c, mode: "approve" })}
          onPlainTransfer={(c) => setTransferTarget({ claim: c, mode: "plain" })}
          onReject={(c) => setRejectTarget(c)}
          onComplete={handleComplete}
          onRevert={handleRevert}
        />

        {/* Modals */}
        {manageItem && (
          <ManageModal
            claim={manageItem}
            editable={activeTab === "active"}
            onSave={handleSaveManaged}
            onClose={() => setManageItem(null)}
          />
        )}

        {transferTarget && (
          <TransferDialog
            claim={transferTarget.claim}
            role={role}
            mode={transferTarget.mode}
            onConfirm={confirmTransfer}
            onClose={() => setTransferTarget(null)}
          />
        )}

        {rejectTarget && (
          <RejectDialog
            claim={rejectTarget}
            onConfirm={confirmReject}
            onClose={() => setRejectTarget(null)}
          />
        )}
      </div>
    </>
  );
}