import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficeProjectExtensionPage.css";
import { useProjectContext, PROJECT_STAFF } from "./ProjectContext";

/* ─── Helpers ─────────────────────────────────────────────── */
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
              onClick={() => { if (selectedId) setConfirming(true); }} disabled={!selectedId}>OK</button>
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

/* ─── Status Badge ────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    PENDING:     { label: "Pending",     cls: "pending"  },
    TRANSFERRED: { label: "Transferred", cls: "pending"  },
    COMPLETED:   { label: "Approved",    cls: "approved" },
    approved:    { label: "Approved",    cls: "approved" },
    declined:    { label: "Declined",    cls: "declined" },
    pending:     { label: "Pending",     cls: "pending"  },
  };
  const { label, cls } = map[status] || { label: status, cls: "pending" };
  return (
    <span className={`oex-badge oex-badge-${cls}`}>
      <span className="oex-badge-dot" />
      {label}
    </span>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button className={`oex-filter-btn ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

/* ─── Timeline Visual ─────────────────────────────────────── */
function TimelineVisual({ sanctionedDate, originalEndDate, duration, revisedEndDate, extensionPeriod }) {
  return (
    <div className="oex-timeline">
      <div className="oex-tl-block original">
        <div className="oex-tl-dot" />
        <div className="oex-tl-label">Sanctioned</div>
        <div className="oex-tl-date">{sanctionedDate}</div>
      </div>
      <div className="oex-tl-track">
        <div className="oex-tl-bar original-bar" />
        <div className="oex-tl-dur">{duration}</div>
      </div>
      <div className="oex-tl-block mid">
        <div className="oex-tl-dot mid-dot" />
        <div className="oex-tl-label">Original End</div>
        <div className="oex-tl-date">{originalEndDate}</div>
      </div>
      <div className="oex-tl-track ext-track">
        <div className="oex-tl-bar ext-bar" />
        <div className="oex-tl-dur ext-dur">{extensionPeriod}</div>
      </div>
      <div className="oex-tl-block revised">
        <div className="oex-tl-dot revised-dot" />
        <div className="oex-tl-label">Revised End</div>
        <div className="oex-tl-date revised-date">{revisedEndDate}</div>
      </div>
    </div>
  );
}

/* ─── Detail Drawer ───────────────────────────────────────── */
function DetailDrawer({ req, onClose, onDecide, onTransfer, onForward, userRole }) {
  const [remarksInput, setRemarksInput] = useState(req.remarks || "");
  const [deciding, setDeciding] = useState(false);
  const isPending = req.status === "PENDING" || req.status === "TRANSFERRED";
  const isMyQueue =
    (userRole === "superintendent" && req.currentHolder?.role === "superintendent") ||
    (userRole === "director"       && req.currentHolder?.role === "director")       ||
    (userRole === "assistant"      && !req.currentHolder);

  const handleDecide = (decision) => {
    setDeciding(true);
    setTimeout(() => { onDecide(req.id, decision, remarksInput); setDeciding(false); }, 600);
  };

  return (
    <div className="oex-drawer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="oex-drawer">
        <div className="oex-drawer-header">
          <div className="oex-drawer-header-left">
            <div className="oex-drawer-id">{req.id}</div>
            <div className="oex-drawer-title">{req.projectTitle}</div>
          </div>
          <div className="oex-drawer-header-right">
            <StatusBadge status={req.status} />
            <button className="oex-drawer-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="oex-drawer-body">
          <section className="oex-section">
            <div className="oex-section-title">Project Details</div>
            <div className="oex-info-grid">
              <div><span>Funding Agency</span><strong>{req.agency}</strong></div>
              <div><span>Project ID</span><strong>{req.projectId}</strong></div>
              <div><span>Principal Investigator</span><strong>{req.pi}</strong></div>
              <div><span>Department</span><strong>{req.department?.split(",")[0]}</strong></div>
              <div><span>CTDT Proc. No.</span><strong>{req.procNo}</strong></div>
              <div><span>Submitted On</span><strong>{req.submittedOn}</strong></div>
            </div>
          </section>

          <section className="oex-section">
            <div className="oex-section-title">Extension Timeline</div>
            <TimelineVisual
              sanctionedDate={req.sanctionedDate}
              originalEndDate={req.originalEndDate}
              duration={req.duration}
              revisedEndDate={req.revisedEndDate}
              extensionPeriod={req.extensionPeriod}
            />
            <div className="oex-ext-summary">
              <div className="oex-ext-cell">
                <span>Original End Date</span>
                <strong>{req.originalEndDate}</strong>
              </div>
              <div className="oex-ext-arrow">→</div>
              <div className="oex-ext-cell highlight">
                <span>Revised End Date</span>
                <strong>{req.revisedEndDate}</strong>
              </div>
              <div className="oex-ext-pill">{req.extensionPeriod}</div>
            </div>
          </section>

          {req.reason && (
            <section className="oex-section">
              <div className="oex-section-title">Reason for Extension</div>
              <div className="oex-reason-box">{req.reason}</div>
            </section>
          )}

          <section className="oex-section">
            <div className="oex-section-title">Supporting Document</div>
            <div className={`oex-letter-box ${req.hasLetter ? "has-letter" : "no-letter"}`}>
              {req.hasLetter
                ? "✓ Funding Agency Request Letter — Attached"
                : "⚠ No supporting letter attached by PI"}
            </div>
          </section>

          {/* Transfer history */}
          {req.transferHistory?.length > 0 && (
            <section className="oex-section">
              <div className="oex-section-title">Transfer History</div>
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

          {/* Decision record */}
          {!isPending && req.remarks && (
            <section className="oex-section">
              <div className="oex-section-title">Decision Record</div>
              <div className={`oex-decision-box oex-decision-${req.status === "COMPLETED" ? "approved" : req.status}`}>
                <div className="oex-decision-title">
                  {req.status === "COMPLETED" ? "Extension Approved" : "Extension Declined"}
                </div>
                {req.remarks && <div className="oex-decision-remarks">{req.remarks}</div>}
              </div>
            </section>
          )}

          {/* Role-gated actions */}
          {isPending && isMyQueue && (
            <section className="oex-section oex-action-section">
              <div className="oex-section-title">Actions</div>

              {userRole === "assistant" && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                    Transfer to Superintendent for review:
                  </div>
                  <TransferCell item={req} onTransfer={(item, staff) => {
                    onTransfer(item, staff); onClose();
                  }} />
                </div>
              )}

              {userRole === "superintendent" && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                    Forward to Director for final approval:
                  </div>
                  <TransferCell item={req} onTransfer={(item, staff) => {
                    onForward(item, staff); onClose();
                  }} />
                </div>
              )}

              {userRole === "director" && (
                <>
                  <textarea
                    className="oex-remarks-input"
                    rows={3}
                    placeholder="Add remarks or conditions (optional)..."
                    value={remarksInput}
                    onChange={(e) => setRemarksInput(e.target.value)}
                  />
                  <div className="oex-action-btns">
                    <button className="oex-btn oex-btn-approve"
                      onClick={() => handleDecide("approved")} disabled={deciding}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {deciding ? "Processing…" : "Approve Extension"}
                    </button>
                    <button className="oex-btn oex-btn-decline"
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

/* ─── Main Page ───────────────────────────────────────────── */
export default function OfficeProjectExtensionPage() {
  const navigate  = useNavigate();
  const userRole  = localStorage.getItem("userRole") || "assistant";

  const {
    extActive,
    extTransferred,
    extCompleted,
    ext_transfer,
    ext_complete,
    ext_updateTransferred,
    ext_forwardToDirector,
  } = useProjectContext();

  const [filter,    setFilter]    = useState("all");
  const [searchQ,   setSearchQ]   = useState("");
  const [selected,  setSelected]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const myTransferred = useMemo(() =>
    extTransferred.filter(i =>
      userRole === "superintendent" ? i.currentHolder?.role === "superintendent" :
      userRole === "director"       ? i.currentHolder?.role === "director"       : true
    ), [extTransferred, userRole]);

  const sourceData =
    activeTab === "active"      ? (userRole === "assistant" ? extActive : myTransferred) :
    activeTab === "transferred" ? extTransferred :
    extCompleted;

  const counts = {
    all:      sourceData.length,
    pending:  sourceData.filter(r => r.status === "PENDING" || r.status === "TRANSFERRED").length,
    approved: sourceData.filter(r => r.status === "COMPLETED").length,
    declined: sourceData.filter(r => r.status === "declined").length,
  };

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase();
    return sourceData.filter(r => {
      const matchFilter =
        filter === "all" ? true :
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
  }, [sourceData, filter, searchQ]);

  const handleDecide = (id, decision, remarks) => {
    const item = [...extActive, ...extTransferred].find(r => r.id === id);
    if (!item) return;
    if (decision === "approved") {
      ext_complete({ ...item, remarks });
    } else {
      ext_updateTransferred({ ...item, status: "declined", remarks });
    }
    setSelected(null);
    showToast(`Request ${id} ${decision === "approved" ? "approved ✓" : "declined ✗"}`,
      decision === "approved" ? "success" : "error");
  };

  const handleTransfer = (item, staff) => {
    ext_transfer(item, staff);
    showToast(`Transferred to ${staff.name}`);
  };

  const handleForward = (item, staff) => {
    ext_forwardToDirector(item, staff);
    showToast(`Forwarded to ${staff.name}`);
  };

  const selectedReq = selected
    ? [...extActive, ...extTransferred, ...extCompleted].find(r => r.id === selected)
    : null;

  const tabs =
    userRole === "assistant"
      ? [
          { key: "active",      label: `New Requests (${extActive.length})` },
          { key: "transferred", label: `Transferred (${extTransferred.length})` },
          { key: "completed",   label: `Completed (${extCompleted.length})` },
        ]
      : userRole === "superintendent"
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
    <div className="oex-page">
      {toast && (
        <div className={`oex-toast oex-toast-${toast.type}`}>{toast.msg}</div>
      )}

      <div className="oex-header">
        <div className="page-breadcrumb">
          Home /{" "}
          <span onClick={() => navigate("/projects/project-requests")}>Project Requests</span> /{" "}
          <span>Project Extension Claims</span>
        </div>
        <h1 className="oex-title">Project Extension Claims</h1>
        <p className="oex-subtitle">Review no-cost extension requests and update revised project timelines</p>
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

      <div className="oex-toolbar">
        <div className="oex-filters">
          <FilterBtn active={filter === "all"}      onClick={() => setFilter("all")}>All <span className="oex-filter-count">{counts.all}</span></FilterBtn>
          <FilterBtn active={filter === "pending"}  onClick={() => setFilter("pending")}>Pending <span className="oex-filter-count pending">{counts.pending}</span></FilterBtn>
          <FilterBtn active={filter === "approved"} onClick={() => setFilter("approved")}>Approved <span className="oex-filter-count approved">{counts.approved}</span></FilterBtn>
          <FilterBtn active={filter === "declined"} onClick={() => setFilter("declined")}>Declined <span className="oex-filter-count declined">{counts.declined}</span></FilterBtn>
        </div>
        <div className="oex-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="oex-search-icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="oex-search-input"
            placeholder="Search by project, PI, agency, or ID..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)} />
        </div>
      </div>

      <div className="oex-cards-grid">
        {filtered.length === 0 ? (
          <div className="oex-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>No extension requests found.</span>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id}
              className={`oex-card oex-card-${r.status === "PENDING" || r.status === "TRANSFERRED" ? "pending" : r.status === "COMPLETED" ? "approved" : r.status}`}
              onClick={() => setSelected(r.id)}>
              <div className="oex-card-top">
                <span className="oex-card-id">{r.id}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="oex-card-title-text">{r.projectTitle}</div>
              <div className="oex-card-pi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                {r.pi}
              </div>
              <div className="oex-card-meta">
                <span className="oex-card-agency">{r.agency}</span>
                <span className="oex-card-dept">{r.department?.split(",")[0]}</span>
              </div>
              <div className="oex-card-timeline">
                <div className="oex-ct-item">
                  <span>Original End</span>
                  <strong>{r.originalEndDate}</strong>
                </div>
                <div className="oex-ct-arrow">
                  <div className="oex-ct-line" />
                  <span className="oex-ct-pill">{r.extensionPeriod}</span>
                  <div className="oex-ct-line" />
                </div>
                <div className="oex-ct-item revised">
                  <span>Revised End</span>
                  <strong>{r.revisedEndDate}</strong>
                </div>
              </div>
              <div className="oex-card-footer">
                <span className={`oex-letter-tag ${r.hasLetter ? "has" : "no"}`}>
                  {r.hasLetter ? "✓ Letter Attached" : "✗ No Letter"}
                </span>
                <span className="oex-card-submitted">Submitted {r.submittedOn}</span>
                <button className="oex-card-view-btn">
                  Review
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
              {r.currentHolder && (
                <div style={{
                  fontSize: "11px", padding: "4px 12px", background: "#f0f4ff",
                  color: "#1a237e", fontWeight: 600,
                }}>
                  {r.currentHolder.role === "superintendent" ? "🔵" : "🔴"} With {r.currentHolder.name}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedReq && (
        <DetailDrawer
          req={selectedReq}
          onClose={() => setSelected(null)}
          onDecide={handleDecide}
          onTransfer={handleTransfer}
          onForward={handleForward}
          userRole={userRole}
        />
      )}
    </div>
  );
}