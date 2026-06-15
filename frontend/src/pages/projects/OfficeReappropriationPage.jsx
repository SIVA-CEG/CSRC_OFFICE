import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficeReappropriationPage.css";
import { useProjectContext, PROJECT_STAFF } from "./ProjectContext";
import ProjectApprovalTransferCell, { getProfileSignature } from "./ProjectApprovalTransferCell";

/* ─── Helpers ──────────────────────────────────────────────── */
const toINR = (n) =>
  n === undefined || n === null || n === ""
    ? "—"
    : `₹ ${Number(n).toLocaleString("en-IN")}`;

const sumHead = (h) =>
  h.subItems ? h.subItems.reduce((s, i) => s + (i.amount || 0), 0) : h.amount || 0;

const STATUS_LABEL = { PENDING: "Pending", TRANSFERRED: "Transferred", COMPLETED: "Completed" };

/* ─── Transfer Cell ──────────────────────────────────────────── */
function TransferCell({ item, onTransfer }) {
  const role = localStorage.getItem("userRole") || "assistant";
  const [open, setOpen]         = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [confirming, setConfirming] = useState(false);

  const eligible = role === "superintendent"
    ? PROJECT_STAFF.filter(s => s.role === "director")
    : PROJECT_STAFF.filter(s => s.role === "superintendent");

  const handleOk = () => {
    const staff = PROJECT_STAFF.find(s => s.id === parseInt(selectedId));
    if (!staff) return;
    onTransfer(item, staff);
    setOpen(false); setSelectedId(""); setConfirming(false);
  };

  return (
    <div className="fs-transfer-cell">
      {!open ? (
        <button className="fs-transfer-btn" onClick={() => setOpen(true)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          Transfer
        </button>
      ) : (
        <div className="fs-transfer-popup">
          <select className="fs-transfer-select" value={selectedId}
            onChange={e => setSelectedId(e.target.value)}>
            <option value="">-- Select Staff --</option>
            {eligible.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
          <div className="fs-transfer-actions">
            <button className="fs-transfer-ok"
              onClick={() => { if (selectedId) setConfirming(true); }}
              disabled={!selectedId}>OK</button>
            <button className="fs-transfer-cancel"
              onClick={() => { setOpen(false); setSelectedId(""); }}>✕</button>
          </div>
          {confirming && (
            <div className="fs-transfer-confirm">
              <span>Transfer to <b>{PROJECT_STAFF.find(s => s.id === parseInt(selectedId))?.name}</b>?</span>
              <button className="fs-transfer-ok" onClick={handleOk}>Confirm</button>
              <button className="fs-transfer-cancel" onClick={() => setConfirming(false)}>Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    PENDING:     { label: "Pending",     cls: "pending"     },
    TRANSFERRED: { label: "Transferred", cls: "pending"     },
    COMPLETED:   { label: "Approved",    cls: "approved"    },
    approved:    { label: "Approved",    cls: "approved"    },
    declined:    { label: "Declined",    cls: "declined"    },
    pending:     { label: "Pending",     cls: "pending"     },
  };
  const { label, cls } = map[status] || { label: status, cls: "pending" };
  return (
    <span className={`orq-badge orq-badge-${cls}`}>
      <span className="orq-badge-dot" />
      {label}
    </span>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button className={`orq-filter-btn ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function StageBadge({ role }) {
  const map = {
    superintendent: "🔵 With Superintendent",
    director:       "🔴 With Director",
    assistant:      "🟢 With Assistant",
  };
  return (
    <span style={{ fontSize: "12px", fontWeight: 600, color: "#555" }}>
      {map[role] || "Pending"}
    </span>
  );
}

/* ─── Detail Drawer ──────────────────────────────────────── */
function DetailDrawer({ req, onClose, onDecide, onApproveTransfer, onPlainTransfer, onApproveForward, onPlainForward, userRole }) {
  const [remarksInput, setRemarksInput] = useState(req.remarks || "");
  const [deciding, setDeciding] = useState(false);
  const isPending = req.status === "PENDING" || req.status === "TRANSFERRED";
  const isMyQueue =
    (userRole === "superintendent" && req.currentHolder?.role === "superintendent") ||
    (userRole === "director"       && req.currentHolder?.role === "director")       ||
    (userRole === "assistant"      && !req.currentHolder);

  const allHeads = [...(req.heads?.nonRecurring || []), ...(req.heads?.recurring || [])].map((h) => {
    let amt = sumHead(h);
    (req.reapRows || []).forEach((r) => {
      if (r.from === h.label) amt -= parseFloat(r.amount) || 0;
      if (r.to   === h.label) amt += parseFloat(r.amount) || 0;
    });
    return { label: h.label, original: sumHead(h), revised: amt };
  });

  const handleDecide = (decision) => {
    setDeciding(true);
    setTimeout(() => { onDecide(req.id, decision, remarksInput); setDeciding(false); }, 600);
  };

  return (
    <div className="orq-drawer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orq-drawer">
        <div className="orq-drawer-header">
          <div>
            <div className="orq-drawer-id">{req.id}</div>
            <div className="orq-drawer-title">{req.projectName}</div>
          </div>
          <div className="orq-drawer-header-right">
            <StatusBadge status={req.status} />
            {req.currentHolder && <StageBadge role={req.currentHolder.role} />}
            <button className="orq-drawer-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="orq-drawer-body">
          {/* Project info */}
          <section className="orq-section">
            <div className="orq-section-title">Project Details</div>
            <div className="orq-info-grid">
              <div><span>Funding Agency</span><strong>{req.agency}</strong></div>
              <div><span>PI</span><strong>{req.pi}</strong></div>
              <div><span>Department</span><strong>{req.department}</strong></div>
              <div><span>CTDT Proc. No.</span><strong>{req.procNo}</strong></div>
              <div><span>Installment</span><strong>{req.installment}</strong></div>
              <div><span>Submitted On</span><strong>{req.submittedOn}</strong></div>
            </div>
          </section>

          {/* Re-appropriation entries */}
          <section className="orq-section">
            <div className="orq-section-title">Re-appropriation Entries</div>
            <table className="orq-table">
              <thead><tr><th>Sl.</th><th>From Head</th><th>To Head</th><th>Amount</th></tr></thead>
              <tbody>
                {(req.reapRows || []).map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><span className="orq-from-tag">{r.from}</span></td>
                    <td><span className="orq-to-tag">{r.to}</span></td>
                    <td><strong>{toINR(parseFloat(r.amount))}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Budget impact */}
          <section className="orq-section">
            <div className="orq-section-title">Budget Impact</div>
            <table className="orq-table">
              <thead><tr><th>Head</th><th>Original</th><th>Change</th><th>Revised</th></tr></thead>
              <tbody>
                {allHeads.map((h) => {
                  const diff = h.revised - h.original;
                  return (
                    <tr key={h.label}>
                      <td>{h.label}</td>
                      <td>{toINR(h.original)}</td>
                      <td className={diff > 0 ? "orq-pos" : diff < 0 ? "orq-neg" : ""}>
                        {diff > 0 ? `+${toINR(diff)}` : diff < 0 ? `-${toINR(Math.abs(diff))}` : "—"}
                      </td>
                      <td className={h.revised < 0 ? "orq-neg" : ""}>{toINR(h.revised)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Transfer history */}
          {req.transferHistory?.length > 0 && (
            <section className="orq-section">
              <div className="orq-section-title">Transfer History</div>
              {req.transferHistory.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ color: "#888" }}>{h.date}</span>
                  <span>→</span>
                  <span style={{ fontWeight: 600 }}>{h.to?.name}</span>
                  <span style={{ color: "#888" }}>({h.to?.role})</span>
                </div>
              ))}
            </section>
          )}

          {/* Actions — role-gated */}
          {isPending && isMyQueue && (
            <section className="orq-section orq-action-section">
              <div className="orq-section-title">Actions</div>

              {/* Transfer — assistant → superintendent */}
{userRole === "assistant" && (
  <div style={{ marginBottom: "16px" }}>
    <ProjectApprovalTransferCell
      item={req}
      userRole={userRole}
      onApproveTransfer={(item, staff) => { onApproveTransfer(item, staff); onClose(); }}
      onPlainTransfer={(item, staff) => { onPlainTransfer(item, staff); onClose(); }}
    />
  </div>
)}

{/* Forward — superintendent → director */}
{userRole === "superintendent" && (
  <div style={{ marginBottom: "16px" }}>
    <ProjectApprovalTransferCell
      item={req}
      userRole={userRole}
      onApproveTransfer={(item, staff) => { onApproveForward(item, staff); onClose(); }}
      onPlainTransfer={(item, staff) => { onPlainForward(item, staff); onClose(); }}
    />
  </div>
)}

              {/* Approve/Decline — director only */}
              {userRole === "director" && (
                <>
                  <textarea
                    className="orq-remarks-input"
                    rows={3}
                    placeholder="Add remarks (optional)..."
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                  />
                  <div className="orq-action-btns">
                    <button className="orq-btn orq-btn-approve"
                      onClick={() => handleDecide("approved")} disabled={deciding}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {deciding ? "Processing…" : "Approve"}
                    </button>
                    <button className="orq-btn orq-btn-decline"
                      onClick={() => handleDecide("declined")} disabled={deciding}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      {deciding ? "Processing…" : "Decline"}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function OfficeReappropriationPage() {
  const navigate  = useNavigate();
  const userRole  = localStorage.getItem("userRole") || "assistant";

  const {
    reapActive,
    reapTransferred,
    reapCompleted,
    reap_transfer,
    reap_complete,
    reap_updateTransferred,
    reap_forwardToDirector,
  } = useProjectContext();

  const [filter,   setFilter]   = useState("all");
  const [searchQ,  setSearchQ]  = useState("all");
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Data source ────────────────────────────────────────────────────────────
  const myTransferred = useMemo(() =>
    reapTransferred.filter(i =>
      userRole === "superintendent" ? i.currentHolder?.role === "superintendent" :
      userRole === "director"       ? i.currentHolder?.role === "director"       : true
    ), [reapTransferred, userRole]);

  const sourceData =
    activeTab === "active"      ? (userRole === "assistant" ? reapActive : myTransferred) :
    activeTab === "transferred" ? reapTransferred :
    reapCompleted;

  const counts = {
    all:      sourceData.length,
    pending:  sourceData.filter(r => r.status === "PENDING" || r.status === "TRANSFERRED").length,
    approved: sourceData.filter(r => r.status === "COMPLETED").length,
    declined: sourceData.filter(r => r.status === "declined").length,
  };

  const filtered = useMemo(() => {
    const matchFilter = (r) => {
      if (filter === "all") return true;
      if (filter === "pending")  return r.status === "PENDING" || r.status === "TRANSFERRED";
      if (filter === "approved") return r.status === "COMPLETED";
      if (filter === "declined") return r.status === "declined";
      return true;
    };
    const q = (searchQ === "all" ? "" : searchQ).toLowerCase();
    return sourceData.filter(r =>
      matchFilter(r) &&
      (!q ||
        r.projectName?.toLowerCase().includes(q) ||
        r.pi?.toLowerCase().includes(q) ||
        r.agency?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q))
    );
  }, [sourceData, filter, searchQ]);

  const handleDecide = (id, decision, remarks) => {
    const item = [...reapActive, ...reapTransferred].find(r => r.id === id);
    if (!item) return;
    if (decision === "approved") {
      reap_complete({ ...item, remarks });
    } else {
      reap_updateTransferred({ ...item, status: "declined", remarks });
    }
    setSelected(null);
    showToast(`Request ${id} ${decision === "approved" ? "approved ✓" : "declined ✗"}`,
      decision === "approved" ? "success" : "error");
  };

const today = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

const handleApproveTransfer = (item, staff) => {
  const mySig = getProfileSignature(userRole);
  const stamped = {
    ...item,
    signatures: { ...(item.signatures || {}), [userRole]: mySig || true },
    transferHistory: [
      ...(item.transferHistory || []),
      { from: "Office", fromRole: userRole, to: staff, date: today(), approved: true },
    ],
  };
  reap_transfer(stamped, staff);
  showToast(`Approved & transferred to ${staff.name}`);
};

const handlePlainTransfer = (item, staff) => {
  const updated = {
    ...item,
    transferHistory: [
      ...(item.transferHistory || []),
      { from: "Office", fromRole: userRole, to: staff, date: today(), approved: false },
    ],
  };
  reap_transfer(updated, staff);
  showToast(`Transferred to ${staff.name} (no approval)`);
};

const handleApproveForward = (item, staff) => {
  const mySig = getProfileSignature(userRole);
  const stamped = {
    ...item,
    signatures: { ...(item.signatures || {}), [userRole]: mySig || true },
    transferHistory: [
      ...(item.transferHistory || []),
      { from: "Office", fromRole: userRole, to: staff, date: today(), approved: true },
    ],
  };
  reap_forwardToDirector(stamped, staff);
  showToast(`Approved & forwarded to ${staff.name}`);
};

const handlePlainForward = (item, staff) => {
  const updated = {
    ...item,
    currentHolder: staff,
    transferHistory: [
      ...(item.transferHistory || []),
      { from: "Office", fromRole: userRole, to: staff, date: today(), approved: false },
    ],
  };
  reap_updateTransferred(updated);
  showToast(`Transferred to ${staff.name} (no approval)`);
};

  const selectedReq = selected
    ? [...reapActive, ...reapTransferred, ...reapCompleted].find(r => r.id === selected)
    : null;

  const tabs =
    userRole === "assistant"
      ? [
          { key: "active",      label: `New Requests (${reapActive.length})` },
          { key: "transferred", label: `Transferred (${reapTransferred.length})` },
          { key: "completed",   label: `Completed (${reapCompleted.length})` },
        ]
      : userRole === "superintendent"
      ? [
          { key: "active",      label: `In My Queue (${myTransferred.length})` },
          { key: "transferred", label: `All Transferred (${reapTransferred.length})` },
          { key: "completed",   label: `Completed (${reapCompleted.length})` },
        ]
      : [
          { key: "active",      label: `Awaiting Approval (${myTransferred.length})` },
          { key: "completed",   label: `Completed (${reapCompleted.length})` },
        ];

  return (
    <div className="orq-page">
      {toast && (
        <div className={`orq-toast orq-toast-${toast.type}`}>{toast.msg}</div>
      )}

      <div className="orq-header">
        <div className="page-breadcrumb">
          Home /{" "}
          <span onClick={() => navigate("/projects/project-requests")}>Project Requests</span> /{" "}
          <span>Reappropriation Claims</span>
        </div>
        <h1 className="orq-title">Reappropriation Claims</h1>
        <p className="orq-subtitle">Review and decide on fund re-allocation requests</p>
      </div>

      {/* Tabs */}
      <div className="tab-switcher" style={{ marginBottom: "16px" }}>
        {tabs.map(t => (
          <button key={t.key}
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="orq-toolbar">
        <div className="orq-filters">
          <FilterBtn active={filter === "all"}      onClick={() => setFilter("all")}>All <span className="orq-filter-count">{counts.all}</span></FilterBtn>
          <FilterBtn active={filter === "pending"}  onClick={() => setFilter("pending")}>Pending <span className="orq-filter-count pending">{counts.pending}</span></FilterBtn>
          <FilterBtn active={filter === "approved"} onClick={() => setFilter("approved")}>Approved <span className="orq-filter-count approved">{counts.approved}</span></FilterBtn>
          <FilterBtn active={filter === "declined"} onClick={() => setFilter("declined")}>Declined <span className="orq-filter-count declined">{counts.declined}</span></FilterBtn>
        </div>
        <div className="orq-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="orq-search-icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="orq-search-input"
            placeholder="Search by project, PI, agency, or ID..."
            value={searchQ === "all" ? "" : searchQ}
            onChange={e => setSearchQ(e.target.value || "all")} />
        </div>
      </div>

      <div className="orq-table-card">
        {filtered.length === 0 ? (
          <div className="orq-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>No requests found.</span>
          </div>
        ) : (
          <table className="orq-main-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Project / PI</th>
                <th>Agency</th>
                <th>Installment</th>
                <th>Head Type</th>
                <th>Entries</th>
                <th>Submitted</th>
                <th>Status</th>
                {activeTab !== "active" && <th>Stage</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="orq-row" onClick={() => setSelected(r.id)}>
                  <td className="orq-id-cell">{r.id}</td>
                  <td>
                    <div className="orq-proj-name">{r.projectName}</div>
                    <div className="orq-proj-pi">{r.pi}</div>
                  </td>
                  <td><span className="orq-agency-pill">{r.agency}</span></td>
                  <td className="orq-center">Inst. {r.installment}</td>
                  <td>
                    <span className={`orq-head-pill ${r.headType === "nonRecurring" ? "nr" : "rec"}`}>
                      {r.headType === "nonRecurring" ? "Non-Recurring" : "Recurring"}
                    </span>
                  </td>
                  <td className="orq-center">{r.reapRows?.length}</td>
                  <td>{r.submittedOn}</td>
                  <td><StatusBadge status={r.status} /></td>
                  {activeTab !== "active" && (
                    <td><StageBadge role={r.currentHolder?.role} /></td>
                  )}
                  <td>
                    <button className="orq-view-btn">
                      View
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedReq && (
        <DetailDrawer
  req={selectedReq}
  onClose={() => setSelected(null)}
  onDecide={handleDecide}
  onApproveTransfer={handleApproveTransfer}
  onPlainTransfer={handlePlainTransfer}
  onApproveForward={handleApproveForward}
  onPlainForward={handlePlainForward}
  userRole={userRole}
/>
      )}
    </div>
  );
}