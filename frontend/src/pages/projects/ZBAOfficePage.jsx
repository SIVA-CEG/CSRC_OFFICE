import React, { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════ */
const officeCss = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

.office-page { animation: officeFade 0.4s ease both; }
@keyframes officeFade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes officeSlide { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }

.office-card {
  background: rgba(255,255,255,0.028);
  border: 1px solid rgba(255,255,255,0.075);
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 24px;
  box-shadow: 0 20px 45px rgba(0,0,0,0.18);
}
.office-card h2 {
  font-family: 'Syne', sans-serif;
  color: rgba(255,255,255,0.9);
  font-size: 18px;
  margin: 0 0 6px;
}
.office-card .office-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: rgba(255,255,255,0.45); margin: 0 0 18px;
}

/* breadcrumb */
.office-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  color: rgba(255,255,255,0.45); margin-bottom: 18px; flex-wrap: wrap;
}
.office-breadcrumb .bc-link { color: #38bdf8; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.office-breadcrumb .bc-sep { color: rgba(255,255,255,0.2); }
.office-breadcrumb .bc-cur { color: rgba(255,255,255,0.7); font-weight: 600; }

/* back button */
.office-back-btn {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.55); border-radius: 10px;
  padding: 8px 16px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 18px;
}
.office-back-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }

/* top-level category grid (Non-Recurring / Recurring / History) */
.office-cat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 8px;
}
@media (max-width: 900px) { .office-cat-grid { grid-template-columns: 1fr; } }

.office-cat-card {
  border-radius: 18px; padding: 28px 24px;
  cursor: pointer; transition: all 0.25s;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  text-align: center; position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
}
.office-cat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,0.25); }
.office-cat-card.nr { background: linear-gradient(135deg, rgba(56,189,248,0.12), rgba(56,189,248,0.04)); border-color: rgba(56,189,248,0.25); }
.office-cat-card.nr:hover { border-color: rgba(56,189,248,0.55); }
.office-cat-card.rec { background: linear-gradient(135deg, rgba(167,139,250,0.12), rgba(167,139,250,0.04)); border-color: rgba(167,139,250,0.25); }
.office-cat-card.rec:hover { border-color: rgba(167,139,250,0.55); }
.office-cat-card.hist { background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04)); border-color: rgba(34,197,94,0.25); }
.office-cat-card.hist:hover { border-color: rgba(34,197,94,0.55); }
.office-cat-card .oc-icon { font-size: 40px; }
.office-cat-card .oc-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; color: rgba(255,255,255,0.92); }
.office-cat-card .oc-sub { font-family: 'DM Sans', sans-serif; font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }
.office-cat-card .oc-count {
  margin-top: 4px; font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff;
}
.office-cat-card .oc-arr { font-size: 20px; margin-top: 2px; color: rgba(255,255,255,0.3); }

/* recurring sub-head grid */
.office-sub-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px; margin-top: 8px;
}
.office-sub-card {
  border-radius: 16px; padding: 20px 16px;
  cursor: pointer; transition: all 0.22s;
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; text-align: center;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  position: relative;
}
.office-sub-card:hover {
  transform: translateY(-3px);
  border-color: rgba(167,139,250,0.4);
  background: rgba(167,139,250,0.08);
  box-shadow: 0 10px 28px rgba(167,139,250,0.12);
}
.office-sub-card .osc-icon { font-size: 32px; }
.office-sub-card .osc-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; color: rgba(255,255,255,0.85); line-height: 1.3; }
.office-sub-card .osc-badge {
  position: absolute; top: 10px; right: 10px;
  background: rgba(251,191,36,0.15); color: #fbbf24;
  border: 1px solid rgba(251,191,36,0.3);
  border-radius: 999px; padding: 1px 8px; font-size: 11px; font-weight: 700;
  font-family: 'Syne', sans-serif;
}
.office-sub-card .osc-badge.zero { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); border-color: rgba(255,255,255,0.08); }

/* status tabs */
.office-tabs { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
.office-tab {
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  border-radius: 10px; padding: 8px 16px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 13px; transition: 0.2s;
  display: flex; align-items: center; gap: 6px;
}
.office-tab.active-all { border-color: rgba(56,189,248,0.4); background: rgba(56,189,248,0.08); color: #38bdf8; }
.office-tab.active-pending { border-color: rgba(251,191,36,0.4); background: rgba(251,191,36,0.08); color: #fbbf24; }
.office-tab.active-approved { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.08); color: #22c55e; }
.office-tab.active-rejected { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); color: #ef4444; }
.office-tab-count {
  background: rgba(255,255,255,0.12);
  border-radius: 999px; padding: 1px 7px;
  font-size: 11px; font-weight: 700;
}

/* search bar */
.office-search-row {
  display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; align-items: center;
}
.office-search-wrap {
  position: relative; flex: 1; min-width: 220px;
}
.office-search-wrap input {
  width: 100%; background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px; padding: 11px 14px 11px 38px;
  color: rgba(255,255,255,0.86);
  font-family: 'DM Sans', sans-serif; font-size: 14px;
  outline: none; transition: 0.2s; box-sizing: border-box;
}
.office-search-wrap input:focus {
  border-color: rgba(56,189,248,0.65);
  background: rgba(56,189,248,0.06);
  box-shadow: 0 0 0 3px rgba(56,189,248,0.11);
}
.office-search-wrap .search-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.35); font-size: 14px; pointer-events: none;
}
.office-filter-select {
  background: rgba(255,255,255,0.055);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 12px; padding: 11px 14px;
  color: rgba(255,255,255,0.86);
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  outline: none; cursor: pointer;
}
.office-filter-select option { background: #111827; color: #fff; }

/* claims table */
.office-table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid rgba(255,255,255,0.07); }
.office-table { width: 100%; border-collapse: collapse; min-width: 880px; }
.office-table th {
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.38);
  font-family: 'Syne', sans-serif; font-size: 10px;
  text-transform: uppercase; letter-spacing: 1px;
  padding: 12px 14px; text-align: left; white-space: nowrap;
}
.office-table td {
  padding: 13px 14px; color: rgba(255,255,255,0.7);
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  white-space: nowrap;
}
.office-table tr:last-child td { border-bottom: none; }
.office-table tr:hover td { background: rgba(255,255,255,0.02); }

.office-amount { color: #22c55e; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; }
.office-type-badge {
  background: rgba(56,189,248,0.1); color: #38bdf8;
  border: 1px solid rgba(56,189,248,0.2);
  padding: 3px 9px; border-radius: 999px;
  font-size: 11px; font-family: 'Syne', sans-serif; font-weight: 700;
}
.office-head-badge {
  background: rgba(167,139,250,0.1); color: #a78bfa;
  border: 1px solid rgba(167,139,250,0.2);
  padding: 3px 9px; border-radius: 999px;
  font-size: 11px; font-family: 'DM Sans', sans-serif;
}
.office-proj-badge {
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 3px 9px; border-radius: 999px;
  font-size: 11px; font-family: 'DM Sans', sans-serif;
}

.office-status-pending {
  background: rgba(251,191,36,0.12); color: #fbbf24;
  border: 1px solid rgba(251,191,36,0.3);
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700; font-family: 'Syne', sans-serif;
}
.office-status-approved {
  background: rgba(34,197,94,0.12); color: #22c55e;
  border: 1px solid rgba(34,197,94,0.3);
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700; font-family: 'Syne', sans-serif;
}
.office-status-rejected {
  background: rgba(239,68,68,0.12); color: #ef4444;
  border: 1px solid rgba(239,68,68,0.3);
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700; font-family: 'Syne', sans-serif;
}

.office-action-group { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.office-preview-btn {
  border: 1px solid rgba(56,189,248,0.3); background: rgba(56,189,248,0.08);
  color: #38bdf8; border-radius: 8px; padding: 6px 11px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; transition: 0.2s;
}
.office-preview-btn:hover { background: rgba(56,189,248,0.18); }
.office-download-btn {
  border: 1px solid rgba(34,197,94,0.3); background: rgba(34,197,94,0.08);
  color: #22c55e; border-radius: 8px; padding: 6px 11px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; transition: 0.2s;
}
.office-download-btn:hover { background: rgba(34,197,94,0.18); }
.office-approve-btn {
  border: 1px solid rgba(34,197,94,0.35); background: rgba(34,197,94,0.1);
  color: #22c55e; border-radius: 8px; padding: 6px 11px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; transition: 0.2s;
}
.office-approve-btn:hover { background: rgba(34,197,94,0.2); }
.office-reject-btn {
  border: 1px solid rgba(239,68,68,0.35); background: rgba(239,68,68,0.1);
  color: #ef4444; border-radius: 8px; padding: 6px 11px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; transition: 0.2s;
}
.office-reject-btn:hover { background: rgba(239,68,68,0.2); }
.office-undo-btn {
  border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.6); border-radius: 8px; padding: 6px 11px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; transition: 0.2s;
}
.office-undo-btn:hover { background: rgba(255,255,255,0.1); }

/* empty state */
.office-empty {
  text-align: center; padding: 50px 24px;
  color: rgba(255,255,255,0.3); font-family: 'DM Sans', sans-serif; font-size: 14px;
}
.office-empty .empty-icon { font-size: 40px; margin-bottom: 12px; }

/* summary stats row */
.office-stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;
}
@media (max-width: 800px) { .office-stats-row { grid-template-columns: repeat(2, 1fr); } }
.office-stat-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 14px 16px;
}
.office-stat-card p {
  margin: 0 0 4px; font-family: 'DM Sans', sans-serif;
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.9px; color: rgba(255,255,255,0.35);
}
.office-stat-card h4 { margin: 0; font-family: 'Syne', sans-serif; font-size: 20px; color: #fff; }
.office-stat-card h4.yellow { color: #fbbf24; }
.office-stat-card h4.green { color: #22c55e; }
.office-stat-card h4.red { color: #ef4444; }
.office-stat-card h4.blue { color: #38bdf8; }

/* History filters row */
.history-filter-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 18px;
}
@media (max-width: 800px) { .history-filter-grid { grid-template-columns: 1fr; } }
.history-filter-grid label {
  display: block; font-family: 'Syne', sans-serif; font-size: 10px;
  text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.38); margin-bottom: 6px;
}

/* PDF/HTML Preview Modal */
.office-pdf-overlay {
  position: fixed; inset: 0; z-index: 1000000;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 16px 24px;
}
.office-pdf-box {
  width: min(900px,96vw); height: calc(100vh - 32px);
  background: #111827; border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 40px 100px rgba(0,0,0,0.7);
}
.office-pdf-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 18px; background: #0f172a;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0; gap: 10px; flex-wrap: wrap;
}
.office-pdf-head span { color: rgba(255,255,255,0.7); font-family: 'DM Sans', sans-serif; font-size: 13px; }
.office-pdf-head div { display: flex; gap: 8px; }
.office-pdf-head button {
  border-radius: 9px; padding: 7px 13px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
  border: none;
}
.office-pdf-head .btn-cl { background: #ef4444; color: #fff; }
.office-pdf-frame { flex: 1; width: 100%; border: none; background: #fff; }
`;

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */
function fmt(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

const RECURRING_HEAD_LABELS = {
  "Manpower": { icon: "👥" },
  "Travel": { icon: "✈️" },
  "Consumables & Accessories": { icon: "🧪" },
  "Contingency": { icon: "📦" },
  "Other Expenses": { icon: "💰" },
};

const RECURRING_SUB_HEADS = [
  { key: "Manpower", label: "Manpower", icon: "👥", sub: "Salary claims for JRF/SRF/RA" },
  { key: "Travel", label: "Travel", icon: "✈️", sub: "Conference, field work, official visits" },
  { key: "Consumables & Accessories", label: "Consumables & Accessories", icon: "🧪", sub: "Lab materials, chemicals, supplies" },
  { key: "Contingency", label: "Contingency", icon: "📦", sub: "Postage, printing, stationery, misc" },
  { key: "Other Expenses", label: "Other Expenses", icon: "💰", sub: "Publications, patents, other misc." },
];

/** Normalize a claim's status. Claims in faculty store use "review"|"approved".
 * Office page adds "rejected" support via the same status field. */
function statusOf(c) {
  if (c.status === "approved") return "approved";
  if (c.status === "rejected") return "rejected";
  return "pending"; // covers "review" and undefined
}

function statusBadge(status) {
  if (status === "approved") return <span className="office-status-approved">✓ Approved</span>;
  if (status === "rejected") return <span className="office-status-rejected">✕ Rejected</span>;
  return <span className="office-status-pending">⏳ Pending</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   CLAIMS TABLE (shared by all sections)
═══════════════════════════════════════════════════════════════════ */
function ClaimsTable({ claims, onPreview, onDownload, onApprove, onReject, onRevert, showProject }) {
  if (claims.length === 0) {
    return (
      <div className="office-empty">
        <div className="empty-icon">📭</div>
        No claims found.
      </div>
    );
  }
  return (
    <div className="office-table-wrap">
      <table className="office-table">
        <thead>
          <tr>
            <th>#</th>
            {showProject && <th>Project</th>}
            <th>Date</th><th>Type</th><th>Head</th>
            <th>Amount</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c, i) => {
            const st = statusOf(c);
            return (
              <tr key={c.id}>
                <td style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>{i + 1}</td>
                {showProject && (
                  <td><span className="office-proj-badge">{c._projectId} — {c._projectTitle}</span></td>
                )}
                <td>{c.date}</td>
                <td><span className="office-type-badge">{c.type}</span></td>
                <td><span className="office-head-badge">{c.head}</span></td>
                <td className="office-amount">{fmt(c.amount)}</td>
                <td>{statusBadge(st)}</td>
                <td>
                  <div className="office-action-group">
                    <button className="office-preview-btn" onClick={() => onPreview(c)}>👁 Preview</button>
                    <button className="office-download-btn" onClick={() => onDownload(c)}>⬇ Download</button>
                    {st === "pending" && (
                      <>
                        <button className="office-approve-btn" onClick={() => onApprove(c)}>✓ Approve</button>
                        <button className="office-reject-btn" onClick={() => onReject(c)}>✕ Reject</button>
                      </>
                    )}
                    {st !== "pending" && onRevert && (
                      <button className="office-undo-btn" onClick={() => onRevert(c)}>↺ Revert</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GENERIC "CLAIMS LIST" SCREEN — tabs + search + table
   Used for: Non-Recurring, and each Recurring sub-head
═══════════════════════════════════════════════════════════════════ */
function ClaimsListScreen({ title, icon, sub, claims, onBack, onPreview, onDownload, onApprove, onReject, onRevert, showProject }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => ({
    all: claims.length,
    pending: claims.filter(c => statusOf(c) === "pending").length,
    approved: claims.filter(c => statusOf(c) === "approved").length,
    rejected: claims.filter(c => statusOf(c) === "rejected").length,
  }), [claims]);

  const filtered = useMemo(() => {
    let list = claims;
    if (tab !== "all") list = list.filter(c => statusOf(c) === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        (c.head || "").toLowerCase().includes(q) ||
        (c.type || "").toLowerCase().includes(q) ||
        (c.date || "").toLowerCase().includes(q) ||
        String(c.amount || "").includes(q) ||
        (c._projectTitle || "").toLowerCase().includes(q) ||
        (c._projectId || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [claims, tab, search]);

  return (
    <div className="office-card" style={{ animation: "officeSlide 0.3s ease" }}>
      <button className="office-back-btn" onClick={onBack}>← Back</button>
      <h2>{icon} {title}</h2>
      <p className="office-sub">{sub}</p>

      <div className="office-stats-row">
        <div className="office-stat-card"><p>Total Claims</p><h4 className="blue">{counts.all}</h4></div>
        <div className="office-stat-card"><p>Pending</p><h4 className="yellow">{counts.pending}</h4></div>
        <div className="office-stat-card"><p>Approved</p><h4 className="green">{counts.approved}</h4></div>
        <div className="office-stat-card"><p>Rejected</p><h4 className="red">{counts.rejected}</h4></div>
      </div>

      <div className="office-tabs">
        <button className={`office-tab ${tab === "all" ? "active-all" : ""}`} onClick={() => setTab("all")}>
          📋 All <span className="office-tab-count">{counts.all}</span>
        </button>
        <button className={`office-tab ${tab === "pending" ? "active-pending" : ""}`} onClick={() => setTab("pending")}>
          ⏳ Pending <span className="office-tab-count">{counts.pending}</span>
        </button>
        <button className={`office-tab ${tab === "approved" ? "active-approved" : ""}`} onClick={() => setTab("approved")}>
          ✅ Approved <span className="office-tab-count">{counts.approved}</span>
        </button>
        <button className={`office-tab ${tab === "rejected" ? "active-rejected" : ""}`} onClick={() => setTab("rejected")}>
          ❌ Rejected <span className="office-tab-count">{counts.rejected}</span>
        </button>
      </div>

      <div className="office-search-row">
        <div className="office-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by head, type, project, date, amount..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ClaimsTable
        claims={filtered}
        onPreview={onPreview}
        onDownload={onDownload}
        onApprove={onApprove}
        onReject={onReject}
        onRevert={onRevert}
        showProject={showProject}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HISTORY SCREEN
═══════════════════════════════════════════════════════════════════ */
function HistoryScreen({ allClaims, onBack, onPreview, onDownload, onApprove, onReject, onRevert }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "Non-Recurring" | "Recurring"
  const [headFilter, setHeadFilter] = useState("all"); // specific head name or "all"
  const [search, setSearch] = useState("");

  const counts = useMemo(() => ({
    all: allClaims.length,
    pending: allClaims.filter(c => statusOf(c) === "pending").length,
    approved: allClaims.filter(c => statusOf(c) === "approved").length,
    rejected: allClaims.filter(c => statusOf(c) === "rejected").length,
  }), [allClaims]);

  const headOptions = useMemo(() => {
    const heads = new Set();
    allClaims.forEach(c => {
      if (typeFilter === "all" || c.type === typeFilter) heads.add(c.head);
    });
    return Array.from(heads).sort();
  }, [allClaims, typeFilter]);

  const filtered = useMemo(() => {
    let list = allClaims;
    if (statusFilter !== "all") list = list.filter(c => statusOf(c) === statusFilter);
    if (typeFilter !== "all") list = list.filter(c => c.type === typeFilter);
    if (headFilter !== "all") list = list.filter(c => c.head === headFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        (c.head || "").toLowerCase().includes(q) ||
        (c.type || "").toLowerCase().includes(q) ||
        (c.date || "").toLowerCase().includes(q) ||
        String(c.amount || "").includes(q) ||
        (c._projectTitle || "").toLowerCase().includes(q) ||
        (c._projectId || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allClaims, statusFilter, typeFilter, headFilter, search]);

  return (
    <div className="office-card" style={{ animation: "officeSlide 0.3s ease" }}>
      <button className="office-back-btn" onClick={onBack}>← Back</button>
      <h2>🗂️ Claims History</h2>
      <p className="office-sub">Complete record of all claims across every project, category and head</p>

      <div className="office-stats-row">
        <div className="office-stat-card"><p>Total Claims</p><h4 className="blue">{counts.all}</h4></div>
        <div className="office-stat-card"><p>Pending</p><h4 className="yellow">{counts.pending}</h4></div>
        <div className="office-stat-card"><p>Approved</p><h4 className="green">{counts.approved}</h4></div>
        <div className="office-stat-card"><p>Rejected</p><h4 className="red">{counts.rejected}</h4></div>
      </div>

      <div className="office-tabs">
        <button className={`office-tab ${statusFilter === "all" ? "active-all" : ""}`} onClick={() => setStatusFilter("all")}>
          📋 All <span className="office-tab-count">{counts.all}</span>
        </button>
        <button className={`office-tab ${statusFilter === "pending" ? "active-pending" : ""}`} onClick={() => setStatusFilter("pending")}>
          ⏳ Pending <span className="office-tab-count">{counts.pending}</span>
        </button>
        <button className={`office-tab ${statusFilter === "approved" ? "active-approved" : ""}`} onClick={() => setStatusFilter("approved")}>
          ✅ Approved <span className="office-tab-count">{counts.approved}</span>
        </button>
        <button className={`office-tab ${statusFilter === "rejected" ? "active-rejected" : ""}`} onClick={() => setStatusFilter("rejected")}>
          ❌ Rejected <span className="office-tab-count">{counts.rejected}</span>
        </button>
      </div>

      <div className="history-filter-grid">
        <div>
          <label>Category</label>
          <select className="office-filter-select" style={{ width: "100%" }}
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setHeadFilter("all"); }}>
            <option value="all">All Categories</option>
            <option value="Non-Recurring">Non-Recurring</option>
            <option value="Recurring">Recurring</option>
          </select>
        </div>
        <div>
          <label>Head / Sub-type</label>
          <select className="office-filter-select" style={{ width: "100%" }}
            value={headFilter}
            onChange={e => setHeadFilter(e.target.value)}>
            <option value="all">All Heads</option>
            {headOptions.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label>Search</label>
          <div className="office-search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search project, date, amount..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <ClaimsTable
        claims={filtered}
        onPreview={onPreview}
        onDownload={onDownload}
        onApprove={onApprove}
        onReject={onReject}
        onRevert={onRevert}
        showProject
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN OFFICE PAGE
═══════════════════════════════════════════════════════════════════ */
/**
 * Props:
 *  - claimsStore: { [projectId]: [claim, ...] }   — same shape as faculty side
 *  - projects: [{ id, title, ... }]               — PROJECTS array
 *  - onApprove(projectId, claimId)
 *  - onReject(projectId, claimId)
 *  - onRevert(projectId, claimId)                 — sets status back to "review"
 *  - generateReportPDF(claim, mode)               — same fn used on faculty side
 */
export default function ZBAOfficePage({
  claimsStore = {},
  projects = [],
  onApprove,
  onReject,
  onRevert,
  generateReportPDF,
}) {
  // screen: "home" | "nonRecurring" | "recurringHeads" | "recurringHead" | "history"
  const [screen, setScreen] = useState("home");
  const [activeHead, setActiveHead] = useState(null);

  const [pdfPreview, setPdfPreview] = useState(null);

  /* Flatten claims with project context attached */
  const allClaims = useMemo(() => {
    const list = [];
    Object.entries(claimsStore).forEach(([pid, claims]) => {
      const proj = projects.find(p => p.id === pid);
      (claims || []).forEach(c => {
        list.push({
          ...c,
          _projectId: pid,
          _projectTitle: proj ? proj.title : pid,
        });
      });
    });
    // sort newest first
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [claimsStore, projects]);

  const nonRecurringClaims = useMemo(
    () => allClaims.filter(c => c.type === "Non-Recurring"),
    [allClaims]
  );

  const recurringClaims = useMemo(
    () => allClaims.filter(c => c.type === "Recurring"),
    [allClaims]
  );

  const recurringByHead = useMemo(() => {
    const map = {};
    RECURRING_SUB_HEADS.forEach(h => { map[h.key] = []; });
    recurringClaims.forEach(c => {
      if (!map[c.head]) map[c.head] = [];
      map[c.head].push(c);
    });
    return map;
  }, [recurringClaims]);

  const pendingCount = (list) => list.filter(c => statusOf(c) === "pending").length;

  /* ─── action handlers ─── */
  const handlePreview = (c) => setPdfPreview({ name: `${c.head}_report.html`, html: c.reportHTML });
  const handleDownload = (c) => {
    if (generateReportPDF) generateReportPDF(c, "download");
  };
  const handleApprove = (c) => onApprove && onApprove(c._projectId, c.id);
  const handleReject = (c) => onReject && onReject(c._projectId, c.id);
  const handleRevert = (c) => onRevert && onRevert(c._projectId, c.id);

  /* ─── HOME SCREEN ─── */
  const renderHome = () => (
    <div className="office-card">
      <h2>🏢 ZBA Office — Claims Management</h2>
      <p className="office-sub">Review, approve, and track all project claims across categories</p>

      <div className="office-stats-row">
        <div className="office-stat-card"><p>Total Claims</p><h4 className="blue">{allClaims.length}</h4></div>
        <div className="office-stat-card"><p>Pending</p><h4 className="yellow">{pendingCount(allClaims)}</h4></div>
        <div className="office-stat-card"><p>Approved</p><h4 className="green">{allClaims.filter(c => statusOf(c) === "approved").length}</h4></div>
        <div className="office-stat-card"><p>Rejected</p><h4 className="red">{allClaims.filter(c => statusOf(c) === "rejected").length}</h4></div>
      </div>

      <div className="office-cat-grid">
        <div className="office-cat-card nr" onClick={() => setScreen("nonRecurring")}>
          <div className="oc-icon">🔧</div>
          <div className="oc-title">Non-Recurring Requests</div>
          <div className="oc-sub">Equipment & one-time capital expenditure claims</div>
          <div className="oc-count">{nonRecurringClaims.length}</div>
          {pendingCount(nonRecurringClaims) > 0 && (
            <div className="office-tab-count" style={{ background: "rgba(251,191,36,0.18)", color: "#fbbf24" }}>
              {pendingCount(nonRecurringClaims)} pending
            </div>
          )}
          <div className="oc-arr">→</div>
        </div>

        <div className="office-cat-card rec" onClick={() => setScreen("recurringHeads")}>
          <div className="oc-icon">🔄</div>
          <div className="oc-title">Recurring Requests</div>
          <div className="oc-sub">Manpower, travel, consumables, contingency & other expenses</div>
          <div className="oc-count">{recurringClaims.length}</div>
          {pendingCount(recurringClaims) > 0 && (
            <div className="office-tab-count" style={{ background: "rgba(251,191,36,0.18)", color: "#fbbf24" }}>
              {pendingCount(recurringClaims)} pending
            </div>
          )}
          <div className="oc-arr">→</div>
        </div>

        <div className="office-cat-card hist" onClick={() => setScreen("history")}>
          <div className="oc-icon">🗂️</div>
          <div className="oc-title">History</div>
          <div className="oc-sub">Full searchable record across all projects & categories</div>
          <div className="oc-count">{allClaims.length}</div>
          <div className="oc-arr">→</div>
        </div>
      </div>
    </div>
  );

  /* ─── NON-RECURRING SCREEN ─── */
  const renderNonRecurring = () => (
    <>
      <div className="office-breadcrumb">
        <span className="bc-link" onClick={() => setScreen("home")}>Office</span>
        <span className="bc-sep">›</span>
        <span className="bc-cur">Non-Recurring Requests</span>
      </div>
      <ClaimsListScreen
        title="Non-Recurring Requests"
        icon="🔧"
        sub="Equipment purchase proceedings submitted by faculty"
        claims={nonRecurringClaims}
        onBack={() => setScreen("home")}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onApprove={handleApprove}
        onReject={handleReject}
        onRevert={handleRevert}
        showProject
      />
    </>
  );

  /* ─── RECURRING HEADS SELECTION SCREEN ─── */
  const renderRecurringHeads = () => (
    <div className="office-card" style={{ animation: "officeSlide 0.3s ease" }}>
      <div className="office-breadcrumb">
        <span className="bc-link" onClick={() => setScreen("home")}>Office</span>
        <span className="bc-sep">›</span>
        <span className="bc-cur">Recurring Requests</span>
      </div>
      <button className="office-back-btn" onClick={() => setScreen("home")}>← Back</button>
      <h2>🔄 Recurring Requests</h2>
      <p className="office-sub">Select a head to review its claims</p>

      <div className="office-stats-row">
        <div className="office-stat-card"><p>Total Claims</p><h4 className="blue">{recurringClaims.length}</h4></div>
        <div className="office-stat-card"><p>Pending</p><h4 className="yellow">{pendingCount(recurringClaims)}</h4></div>
        <div className="office-stat-card"><p>Approved</p><h4 className="green">{recurringClaims.filter(c => statusOf(c) === "approved").length}</h4></div>
        <div className="office-stat-card"><p>Rejected</p><h4 className="red">{recurringClaims.filter(c => statusOf(c) === "rejected").length}</h4></div>
      </div>

      <div className="office-sub-grid">
        {RECURRING_SUB_HEADS.map(h => {
          const list = recurringByHead[h.key] || [];
          const pend = pendingCount(list);
          return (
            <div key={h.key} className="office-sub-card" onClick={() => { setActiveHead(h.key); setScreen("recurringHead"); }}>
              {pend > 0
                ? <div className="osc-badge">{pend} pending</div>
                : <div className="osc-badge zero">{list.length}</div>}
              <div className="osc-icon">{h.icon}</div>
              <div className="osc-title">{h.label}</div>
              <div className="oc-sub" style={{ fontSize: 11 }}>{h.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ─── RECURRING HEAD DETAIL SCREEN ─── */
  const renderRecurringHead = () => {
    const cfg = RECURRING_SUB_HEADS.find(h => h.key === activeHead);
    const list = recurringByHead[activeHead] || [];
    return (
      <>
        <div className="office-breadcrumb">
          <span className="bc-link" onClick={() => setScreen("home")}>Office</span>
          <span className="bc-sep">›</span>
          <span className="bc-link" onClick={() => setScreen("recurringHeads")}>Recurring Requests</span>
          <span className="bc-sep">›</span>
          <span className="bc-cur">{cfg?.label}</span>
        </div>
        <ClaimsListScreen
          title={cfg?.label}
          icon={cfg?.icon}
          sub={`${cfg?.label} claims submitted by faculty across all projects`}
          claims={list}
          onBack={() => setScreen("recurringHeads")}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onApprove={handleApprove}
          onReject={handleReject}
          onRevert={handleRevert}
          showProject
        />
      </>
    );
  };

  /* ─── HISTORY SCREEN ─── */
  const renderHistory = () => (
    <>
      <div className="office-breadcrumb">
        <span className="bc-link" onClick={() => setScreen("home")}>Office</span>
        <span className="bc-sep">›</span>
        <span className="bc-cur">History</span>
      </div>
      <HistoryScreen
        allClaims={allClaims}
        onBack={() => setScreen("home")}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onApprove={handleApprove}
        onReject={handleReject}
        onRevert={handleRevert}
      />
    </>
  );

  return (
    <>
      <style>{officeCss}</style>
      <div className="office-page">
        {screen === "home" && renderHome()}
        {screen === "nonRecurring" && renderNonRecurring()}
        {screen === "recurringHeads" && renderRecurringHeads()}
        {screen === "recurringHead" && renderRecurringHead()}
        {screen === "history" && renderHistory()}

        {/* Preview Modal */}
        {pdfPreview && (
          <div className="office-pdf-overlay" onClick={e => { if (e.target === e.currentTarget) setPdfPreview(null); }}>
            <div className="office-pdf-box">
              <div className="office-pdf-head">
                <span>{pdfPreview.name}</span>
                <div>
                  <button className="btn-cl" onClick={() => setPdfPreview(null)}>✕ Close</button>
                </div>
              </div>
              <iframe className="office-pdf-frame" srcDoc={pdfPreview.html} title={pdfPreview.name} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}