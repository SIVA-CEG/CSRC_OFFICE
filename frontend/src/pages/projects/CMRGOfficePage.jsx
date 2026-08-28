import React, { useState, useMemo } from "react";
import "./CMRGOfficePage.css";

const PROJECTS = [
  {
    id: "CMR001",
    title: "AI Based Research Project",
    pi: "Dr. Kumar",
    department: "IT",
    sanctionedAmount: 510000,
  },
];

const INITIAL_CLAIMS = [
  {
    ref: "CMR001-CLM001",
    projectId: "CMR001",
    date: "01 Jun 2025",
    section: "A",
    title: "Non-Recurring Heads",
    head: "Equipment 1",
    amount: 45100,
    fileName: "invoice_eq1.pdf",
    fileURL: null,
    status: "pending",
    note: "",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const today = () =>
  new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const STATUS_META = {
  pending: {
    label: "Pending Review",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    icon: "⏳",
  },
  approved: {
    label: "Approved",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.3)",
    icon: "✓",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    icon: "✕",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="cmrg-stat-card" style={{ "--accent": accent }}>
      <div className="cmrg-stat-icon">{icon}</div>
      <div>
        <p className="cmrg-stat-label">{label}</p>
        <h3 className="cmrg-stat-value">{value}</h3>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status];
  return (
    <span
      className="cmrg-status-badge"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}
    >
      {m.icon} {m.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Review Drawer
// ─────────────────────────────────────────────────────────────────────────────
function ReviewDrawer({ claim, project, onClose, onDecide }) {
  const [note, setNote] = useState(claim.note || "");
  const [deciding, setDeciding] = useState(null);

  const handle = (action) => {
    setDeciding(action);
    setTimeout(() => {
      onDecide(claim.ref, action, note);
      setDeciding(null);
    }, 600);
  };

  if (!claim) return null;

  return (
    <div
      className="cmrg-drawer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cmrg-drawer">
        {/* Header */}
        <div className="cmrg-drawer-head">
          <div>
            <span className="cmrg-drawer-eyebrow">Claim Review</span>
            <h2 className="cmrg-drawer-title">{claim.ref}</h2>
          </div>
          <button className="cmrg-drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Project strip */}
        <div className="cmrg-drawer-project-strip">
          <div className="cmrg-dps-item">
            <span>Project</span>
            <b>{project?.id}</b>
          </div>
          <div className="cmrg-dps-item">
            <span>PI</span>
            <b>{project?.pi}</b>
          </div>
          <div className="cmrg-dps-item">
            <span>Dept</span>
            <b>{project?.department}</b>
          </div>
          <div className="cmrg-dps-item">
            <span>Sanctioned</span>
            <b>{fmt(project?.sanctionedAmount)}</b>
          </div>
        </div>

        {/* Claim detail grid */}
        <div className="cmrg-drawer-section">
          <h4 className="cmrg-drawer-section-title">📄 Claim Details</h4>
          <div className="cmrg-detail-grid">
            <div className="cmrg-detail-item">
              <label>Date Filed</label>
              <span>{claim.date}</span>
            </div>
            <div className="cmrg-detail-item">
              <label>Section</label>
              <span className="cmrg-section-pill">{claim.section}</span>
            </div>
            <div className="cmrg-detail-item">
              <label>Head Category</label>
              <span>{claim.title}</span>
            </div>
            <div className="cmrg-detail-item">
              <label>Item / Equipment</label>
              <span>{claim.head}</span>
            </div>
            <div className="cmrg-detail-item cmrg-detail-full">
              <label>Claimed Amount</label>
              <span className="cmrg-amount-large">{fmt(claim.amount)}</span>
            </div>
          </div>
        </div>

        {/* Bill file */}
        <div className="cmrg-drawer-section">
          <h4 className="cmrg-drawer-section-title">🗂️ Supporting Document</h4>
          {claim.fileURL ? (
            <div className="cmrg-bill-file-card">
              <div className="cmrg-bill-file-icon">📎</div>
              <div className="cmrg-bill-file-info">
                <strong>{claim.fileName}</strong>
                <span>Uploaded bill / invoice</span>
              </div>
              <div className="cmrg-bill-file-actions">
                <button
                  className="cmrg-file-btn preview"
                  onClick={() => window.open(claim.fileURL, "_blank")}
                >
                  👁 Preview
                </button>
                <a
                  className="cmrg-file-btn download"
                  href={claim.fileURL}
                  download={claim.fileName}
                >
                  ⬇ Download
                </a>
              </div>
            </div>
          ) : (
            <div className="cmrg-no-file">
              <span>⚠️</span> No bill document uploaded by claimant.
            </div>
          )}
        </div>

        {/* Office note */}
        <div className="cmrg-drawer-section">
          <h4 className="cmrg-drawer-section-title">
            📝 Office Note / Remarks
          </h4>
          <textarea
            className="cmrg-note-input"
            placeholder="Add verification remarks, queries, or approval conditions…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={claim.status !== "pending"}
            rows={4}
          />
        </div>

        {/* Action buttons */}
        {claim.status === "pending" ? (
          <div className="cmrg-drawer-actions">
            <button
              className={`cmrg-action-btn reject ${deciding === "rejected" ? "deciding" : ""}`}
              onClick={() => handle("rejected")}
              disabled={!!deciding}
            >
              {deciding === "rejected" ? "⏳ Rejecting…" : "✕ Reject Claim"}
            </button>
            <button
              className={`cmrg-action-btn approve ${deciding === "approved" ? "deciding" : ""}`}
              onClick={() => handle("approved")}
              disabled={!!deciding}
            >
              {deciding === "approved" ? "⏳ Approving…" : "✓ Approve Claim"}
            </button>
          </div>
        ) : (
          <div className="cmrg-drawer-verdict">
            <StatusBadge status={claim.status} />
            {claim.note && <p className="cmrg-verdict-note">"{claim.note}"</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// History Modal
// ─────────────────────────────────────────────────────────────────────────────
function HistoryModal({ claims, projects, onClose, onPreview }) {
  const [filterProject, setFilterProject] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      claims.filter((c) => {
        const matchProj =
          filterProject === "ALL" || c.projectId === filterProject;
        const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          c.ref.toLowerCase().includes(q) ||
          c.head.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q);
        return matchProj && matchStatus && matchSearch;
      }),
    [claims, filterProject, filterStatus, search],
  );

  const totals = {
    approved: filtered
      .filter((c) => c.status === "approved")
      .reduce((s, c) => s + c.amount, 0),
    rejected: filtered
      .filter((c) => c.status === "rejected")
      .reduce((s, c) => s + c.amount, 0),
    pending: filtered.filter((c) => c.status === "pending").length,
  };

  return (
    <div
      className="cmrg-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cmrg-modal">
        {/* Modal header */}
        <div className="cmrg-modal-head">
          <div>
            <h2 className="cmrg-modal-title">📚 Full Claims History</h2>
            <p className="cmrg-modal-sub">
              {filtered.length} records · all projects
            </p>
          </div>
          <button className="cmrg-drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="cmrg-modal-filters">
          <input
            className="cmrg-filter-input"
            placeholder="🔍 Search ref, head, item…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="cmrg-filter-select"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.title}
              </option>
            ))}
          </select>
          <select
            className="cmrg-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Mini summary */}
        <div className="cmrg-modal-summary">
          <div className="cmrg-ms-card green">
            <p>Approved Value</p>
            <h4>{fmt(totals.approved)}</h4>
          </div>
          <div className="cmrg-ms-card red">
            <p>Rejected Value</p>
            <h4>{fmt(totals.rejected)}</h4>
          </div>
          <div className="cmrg-ms-card yellow">
            <p>Pending Count</p>
            <h4>{totals.pending}</h4>
          </div>
        </div>

        {/* Table */}
        <div className="cmrg-modal-table-wrap">
          {filtered.length === 0 ? (
            <div className="cmrg-empty">
              <div className="cmrg-empty-icon">🗂️</div>No matching records
              found.
            </div>
          ) : (
            <table className="cmrg-hist-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Reference</th>
                  <th>Project</th>
                  <th>Date</th>
                  <th>Section</th>
                  <th>Head / Item</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Bill</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const proj = projects.find((p) => p.id === c.projectId);
                  return (
                    <tr key={c.ref}>
                      <td className="cmrg-row-num">{i + 1}</td>
                      <td>
                        <span className="cmrg-ref-badge">{c.ref}</span>
                      </td>
                      <td>
                        <div className="cmrg-proj-cell">
                          <strong>{c.projectId}</strong>
                          <span>{proj?.pi}</span>
                        </div>
                      </td>
                      <td className="cmrg-muted">{c.date}</td>
                      <td>
                        <span className="cmrg-sec-badge">{c.section}</span>
                      </td>
                      <td>
                        <div className="cmrg-head-cell">
                          <span>{c.head}</span>
                          <small>{c.title}</small>
                        </div>
                      </td>
                      <td className="cmrg-amount-cell">{fmt(c.amount)}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="cmrg-note-cell">
                        {c.note || <span className="cmrg-muted">—</span>}
                      </td>
                      <td>
                        {c.fileURL ? (
                          <button
                            className="cmrg-file-btn preview"
                            onClick={() => onPreview(c)}
                          >
                            👁
                          </button>
                        ) : (
                          <span className="cmrg-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Office Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CMRGOfficePage() {
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [activeProject, setActiveProject] = useState("ALL");
  const [projectDirectory, setProjectDirectory] = useState(true);
  const [projectSearch, setProjectSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [reviewClaim, setReviewClaim] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Stats ────────────────────────────────────────────────────────────────
  const currentClaims = useMemo(() => {
    if (activeProject === "ALL") {
      return claims;
    }

    return claims.filter((c) => c.projectId === activeProject);
  }, [claims, activeProject]);

  const stats = useMemo(
    () => ({
      total: currentClaims.length,

      pending: currentClaims.filter((c) => c.status === "pending").length,

      approved: currentClaims.filter((c) => c.status === "approved").length,

      rejected: currentClaims.filter((c) => c.status === "rejected").length,

      totalAmt: currentClaims
        .filter((c) => c.status === "approved")
        .reduce((s, c) => s + c.amount, 0),
    }),
    [currentClaims],
  );

  // ── Filtered claims list ──────────────────────────────────────────────────
  const visible = useMemo(
    () =>
      claims.filter((c) => {
        const matchProj =
          activeProject === "ALL" || c.projectId === activeProject;
        const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
        return matchProj && matchStatus;
      }),
    [claims, activeProject, filterStatus],
  );

  // ── Decision handler ─────────────────────────────────────────────────────
  const handleDecide = (ref, action, note) => {
    setClaims((prev) =>
      prev.map((c) => (c.ref === ref ? { ...c, status: action, note } : c)),
    );
    setReviewClaim(null);
    const label =
      action === "approved" ? "✓ Claim Approved" : "✕ Claim Rejected";
    const color = action === "approved" ? "#22c55e" : "#ef4444";
    setToast({ label, color });
    setTimeout(() => setToast(null), 2500);
  };

  const reviewProject = reviewClaim
    ? PROJECTS.find((p) => p.id === reviewClaim.projectId)
    : null;

  // ── Project utilization ───────────────────────────────────────────────────
  const projectStats = useMemo(
    () =>
      PROJECTS.map((p) => {
        const pClaims = claims.filter((c) => c.projectId === p.id);
        const approved = pClaims
          .filter((c) => c.status === "approved")
          .reduce((s, c) => s + c.amount, 0);
        const pending = pClaims
          .filter((c) => c.status === "pending")
          .reduce((s, c) => s + c.amount, 0);
        const pct = Math.min(
          100,
          Math.round((approved / p.sanctionedAmount) * 100),
        );
        return { ...p, approved, pending, pct, totalClaims: pClaims.length };
      }),
    [claims, PROJECTS],
  );

  return (
    <div className="cmrg-root">
      {/* ── Ambient background ─────────────────────────────────────── */}
      <div className="cmrg-bg-orbs" aria-hidden="true">
        <div className="cmrg-orb cmrg-orb-1" />
        <div className="cmrg-orb cmrg-orb-2" />
        <div className="cmrg-orb cmrg-orb-3" />
      </div>

      <header className="cmrg-nav">
        <div className="cmrg-nav-brand">
          <div className="cmrg-brand-mark">cmrg</div>

          <div className="cmrg-brand-name">
            Office <span>Claims Portal</span>
          </div>
        </div>

        <div className="cmrg-nav-tabs">
          {[
            { key: "ALL", label: "All Claims", count: stats.total },
            { key: "pending", label: "Pending", count: stats.pending },
            { key: "approved", label: "Approved", count: stats.approved },
            { key: "rejected", label: "Rejected", count: stats.rejected },
          ].map((item) => (
            <button
              key={item.key}
              className={`cmrg-nav-tab ${
                filterStatus === item.key ? "active" : ""
              }`}
              onClick={() => setFilterStatus(item.key)}
            >
              {item.label}
              <span className="cmrg-tab-count">{item.count}</span>
            </button>
          ))}
        </div>

        <div className="cmrg-nav-right">
          <button
            className="cmrg-history-btn"
            onClick={() => setShowHistory(true)}
          >
            📚 History
          </button>

          <div className="cmrg-officer-chip">
            <div className="cmrg-officer-avatar">OF</div>

            <div>
              <strong>Finance Officer</strong>
              <span>Grants Division</span>
            </div>
          </div>
        </div>
      </header>

      <main className="cmrg-page">
        <div className="cmrg-header">
          <div>
            <div className="cmrg-header-eyebrow">Research Grants Office</div>

            <h1 className="cmrg-page-title">
              {projectDirectory
                ? "Research Projects"
                : `${activeProject} Dashboard`}
            </h1>

            <p className="cmrg-page-sub">
              Office of Research Grants · {today()}
            </p>
            {!projectDirectory && (
              <button
                className="cmrg-back-btn"
                onClick={() => {
                  setProjectDirectory(true);
                  setActiveProject("ALL");
                }}
              >
                ← Back to All Projects
              </button>
            )}
          </div>

          <div className="cmrg-project-toolbar">
            {projectDirectory && (
              <input
                type="text"
                placeholder="🔍 Search Project / PI / Department"
                className="cmrg-search-project"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="cmrg-stats-grid">
          <StatCard
            icon="📋"
            label="Total Claims"
            value={stats.total}
            accent="#38bdf8"
          />
          <StatCard
            icon="⏳"
            label="Pending Review"
            value={stats.pending}
            accent="#f59e0b"
          />
          <StatCard
            icon="✓"
            label="Approved"
            value={stats.approved}
            accent="#22c55e"
          />
          <StatCard
            icon="₹"
            label="Approved Amount"
            value={fmt(stats.totalAmt)}
            accent="#a78bfa"
          />
        </div>

        {projectDirectory && activeProject === "ALL" && (
          <>
            <div className="cmrg-directory-heading">
              <h2>Research Projects</h2>
              <span>{PROJECTS.length} Projects Available</span>
            </div>

            <div className="cmrg-project-directory">
              {PROJECTS.filter((project) => {
                const q = projectSearch.toLowerCase();

                return (
                  project.id.toLowerCase().includes(q) ||
                  project.title.toLowerCase().includes(q) ||
                  project.pi.toLowerCase().includes(q) ||
                  project.department.toLowerCase().includes(q)
                );
              }).map((project) => {
                const projectClaims = claims.filter(
                  (c) => c.projectId === project.id,
                );

                const approved = projectClaims
                  .filter((c) => c.status === "approved")
                  .reduce((s, c) => s + c.amount, 0);

                const pending = projectClaims.filter(
                  (c) => c.status === "pending",
                ).length;

                return (
                  <div key={project.id} className="cmrg-project-card">
                    <div className="cmrg-project-top">
                      <div>
                        <h3>{project.id}</h3>

                        <p>{project.title}</p>
                      </div>

                      <div className="cmrg-card-right">
                        <span className="cmrg-dept-badge">
                          {project.department}
                        </span>

                        {pending > 0 && (
                          <div className="cmrg-pending-badge">
                            <div className="cmrg-notification-icon">
                              🔔
                              <span>{pending}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="cmrg-project-info">
                      <span>
                        <strong>PI:</strong> {project.pi}
                      </span>

                      <span>
                        <strong>Department:</strong> {project.department}
                      </span>

                      <span>
                        <strong>Total Claims:</strong> {projectClaims.length}
                      </span>

                      <span>
                        <strong>Pending Claims:</strong> {pending}
                      </span>

                      <span>
                        <strong>Sanctioned Amount:</strong>
                        {fmt(project.sanctionedAmount)}
                      </span>
                    </div>

                    <div className="cmrg-project-progress">
                      <div className="cmrg-progress-head">
                        <span>Utilization</span>

                        <span>
                          {Math.min(
                            100,
                            Math.round(
                              (approved / project.sanctionedAmount) * 100,
                            ),
                          )}
                          %
                        </span>
                      </div>

                      <div className="cmrg-progress-track">
                        <div
                          className="cmrg-progress-fill"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (approved / project.sanctionedAmount) * 100,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="cmrg-project-footer">
                      <span>Approved: {fmt(approved)}</span>

                      <button
                        className="cmrg-open-project"
                        onClick={() => {
                          setActiveProject(project.id);
                          setProjectDirectory(false);
                        }}
                      >
                        Open Project →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Claims table */}
        {!projectDirectory && (
          <div className="cmrg-table-card">
            <div className="cmrg-table-head">
              <h3>
                {filterStatus === "ALL"
                  ? "All Claims"
                  : filterStatus === "pending"
                    ? "⏳ Pending Review"
                    : filterStatus === "approved"
                      ? "✓ Approved Claims"
                      : "✕ Rejected Claims"}
                <span className="cmrg-table-count">{visible.length}</span>
              </h3>
            </div>

            {visible.length === 0 ? (
              <div className="cmrg-empty">
                <div className="cmrg-empty-icon">🗂️</div>
                No claims matching the current filter.
              </div>
            ) : (
              <div className="cmrg-table-wrap">
                <table className="cmrg-claims-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Reference</th>
                      <th>Project</th>
                      <th>Date</th>
                      <th>Section</th>
                      <th>Head / Item</th>
                      <th>Amount</th>
                      <th>Bill</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((claim, i) => {
                      const proj = PROJECTS.find(
                        (p) => p.id === claim.projectId,
                      );
                      return (
                        <tr
                          key={claim.ref}
                          className={`cmrg-tr-${claim.status}`}
                        >
                          <td className="cmrg-row-num">{i + 1}</td>
                          <td>
                            <span className="cmrg-ref-badge">{claim.ref}</span>
                          </td>
                          <td>
                            <div className="cmrg-proj-cell">
                              <strong>{claim.projectId}</strong>
                              <span>{proj?.pi}</span>
                            </div>
                          </td>
                          <td className="cmrg-muted">{claim.date}</td>
                          <td>
                            <span className="cmrg-sec-badge">
                              {claim.section}
                            </span>
                          </td>
                          <td>
                            <div className="cmrg-head-cell">
                              <span>{claim.head}</span>
                              <small>{claim.title}</small>
                            </div>
                          </td>
                          <td className="cmrg-amount-cell">
                            {fmt(claim.amount)}
                          </td>
                          <td>
                            {claim.fileURL ? (
                              <button
                                className="cmrg-file-btn preview"
                                onClick={() => setPdfPreview(claim)}
                              >
                                👁
                              </button>
                            ) : (
                              <span className="cmrg-muted">—</span>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={claim.status} />
                          </td>
                          <td>
                            <button
                              className={`cmrg-review-btn ${claim.status !== "pending" ? "viewed" : ""}`}
                              onClick={() => setReviewClaim(claim)}
                            >
                              {claim.status === "pending"
                                ? "Review →"
                                : "View →"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Review Drawer ───────────────────────────────────────────── */}
      {reviewClaim && (
        <ReviewDrawer
          claim={reviewClaim}
          project={reviewProject}
          onClose={() => setReviewClaim(null)}
          onDecide={handleDecide}
        />
      )}

      {/* ── History Modal ───────────────────────────────────────────── */}
      {showHistory && (
        <HistoryModal
          claims={claims}
          projects={PROJECTS}
          onClose={() => setShowHistory(false)}
          onPreview={(c) => setPdfPreview(c)}
        />
      )}

      {/* ── File Preview ────────────────────────────────────────────── */}
      {pdfPreview && (
        <div
          className="cmrg-pdf-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPdfPreview(null);
          }}
        >
          <div className="cmrg-pdf-box">
            <div className="cmrg-pdf-head">
              <span>{pdfPreview.fileName || "Document Preview"}</span>
              <div style={{ display: "flex", gap: 8 }}>
                {pdfPreview.fileURL && (
                  <a
                    href={pdfPreview.fileURL}
                    download={pdfPreview.fileName}
                    style={{
                      background: "#38bdf8",
                      color: "#001018",
                      borderRadius: 8,
                      padding: "7px 13px",
                      fontFamily: "inherit",
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    ⬇ Download
                  </a>
                )}
                <button
                  onClick={() => setPdfPreview(null)}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 13px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            {pdfPreview.fileURL ? (
              pdfPreview.fileName
                ?.toLowerCase()
                .match(/\.(png|jpg|jpeg|webp)$/) ? (
                <img
                  src={pdfPreview.fileURL}
                  alt={pdfPreview.fileName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#fff",
                  }}
                />
              ) : (
                <iframe
                  src={pdfPreview.fileURL}
                  title={pdfPreview.fileName}
                  style={{
                    flex: 1,
                    width: "100%",
                    border: "none",
                    background: "#fff",
                  }}
                />
              )
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                No file available for preview.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────── */}
      {toast && (
        <div className="cmrg-toast" style={{ "--toast-color": toast.color }}>
          {toast.label}
        </div>
      )}
    </div>
  );
}
