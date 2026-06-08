import React, { useState } from "react";
import "./OfficeProjectExtensionPage.css";

/* ─── Helpers ─────────────────────────────────────────────── */
const parseDMY = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
};

const durationBetween = (startStr, endStr) => {
  const start = parseDMY(startStr);
  const end = parseDMY(endStr);
  if (!start || !end) return "";
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  if (months <= 0) return "";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
  if (rem > 0) parts.push(`${rem} Month${rem > 1 ? "s" : ""}`);
  return "+" + parts.join(" ");
};

/* ─── Seed Data ───────────────────────────────────────────── */
const SEED_REQUESTS = [
  {
    id: "EXT-2024-001",
    submittedOn: "02-05-2024",
    projectId: "P001",
    projectTitle: "Development of Ti(C,N) based cermets modified by Si3N4, B4C and Cr3C2",
    pi: "Dr. S. Balasivanandha Prabu",
    department: "Department of Mechanical Engineering, CEG Campus",
    agency: "SERB",
    procNo: "2433/CTDT-2/2020, dated 10-12-2020",
    sanctionedDate: "10-12-2020",
    originalEndDate: "09-12-2023",
    duration: "3 Years",
    revisedEndDate: "09-06-2024",
    extensionPeriod: "+6 Months",
    reason:
      "Procurement of key equipment was delayed due to supply-chain disruptions post-COVID. Two JRF positions were vacant for 4 months causing delays in experimental work. Additional time is required to complete characterization and submit the final report.",
    hasLetter: true,
    status: "approved",
    remarks:
      "Extension approved as per funding agency concurrence. Project to be completed by revised end date without additional cost.",
    decidedOn: "12-05-2024",
    decidedBy: "Dr. A. Murugesan",
  },
  {
    id: "EXT-2024-002",
    submittedOn: "15-04-2024",
    projectId: "P002",
    projectTitle: "Design and Development of Smart Sensor Networks for Structural Health Monitoring",
    pi: "Dr. K. Rajeswari",
    department: "Department of Electronics & Communication Engineering, CEG Campus",
    agency: "DST",
    procNo: "1892/CTDT-5/2021, dated 15-03-2021",
    sanctionedDate: "15-03-2021",
    originalEndDate: "14-03-2024",
    duration: "3 Years",
    revisedEndDate: "14-09-2024",
    extensionPeriod: "+6 Months",
    reason:
      "Field deployment of sensors at two bridge sites was delayed due to permissions from NHAI. Lab testing is complete but field validation is critical for the final report.",
    hasLetter: false,
    status: "pending",
    remarks: "",
    decidedOn: "",
    decidedBy: "",
  },
  {
    id: "EXT-2024-003",
    submittedOn: "20-03-2024",
    projectId: "P003",
    projectTitle: "AI-driven Drug Discovery Framework for Tropical Disease Management",
    pi: "Dr. P. Anbalagan",
    department: "Department of Biotechnology, ACT Campus",
    agency: "DBT",
    procNo: "3011/CTDT-1/2022, dated 22-07-2022",
    sanctionedDate: "22-07-2022",
    originalEndDate: "21-07-2025",
    duration: "3 Years",
    revisedEndDate: "21-01-2026",
    extensionPeriod: "+6 Months",
    reason: "Additional clinical validation data is required for regulatory submission.",
    hasLetter: false,
    status: "declined",
    remarks:
      "Project end date is still in the future. Extension request is premature. Please resubmit closer to the end date with detailed progress report and agency concurrence letter.",
    decidedOn: "03-04-2024",
    decidedBy: "Dr. A. Murugesan",
  },
  {
    id: "EXT-2024-004",
    submittedOn: "10-05-2024",
    projectId: "P004",
    projectTitle: "Renewable Energy Integration in Microgrids: Stability and Control",
    pi: "Dr. T. Vijayakumar",
    department: "Department of Electrical Engineering, CEG Campus",
    agency: "MNRE",
    procNo: "0774/CTDT-3/2020, dated 05-09-2020",
    sanctionedDate: "05-09-2020",
    originalEndDate: "04-09-2023",
    duration: "3 Years",
    revisedEndDate: "04-03-2024",
    extensionPeriod: "+6 Months",
    reason:
      "Prototype microgrid testing at the TNEB substation was delayed due to grid maintenance shutdowns. Final results and thesis submission require additional time.",
    hasLetter: true,
    status: "pending",
    remarks: "",
    decidedOn: "",
    decidedBy: "",
  },
];

/* ─── Status Badge ────────────────────────────────────────── */
function StatusBadge({ status }) {
  return (
    <span className={`oex-badge oex-badge-${status}`}>
      <span className="oex-badge-dot" />
      {{ pending: "Pending", approved: "Approved", declined: "Declined" }[status]}
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
function DetailDrawer({ req, onClose, onDecide }) {
  const [remarksInput, setRemarksInput] = useState(req.remarks || "");
  const [deciding, setDeciding] = useState(false);
  const isPending = req.status === "pending";

  const handleDecide = (decision) => {
    setDeciding(true);
    setTimeout(() => {
      onDecide(req.id, decision, remarksInput);
      setDeciding(false);
    }, 600);
  };

  return (
    <div className="oex-drawer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="oex-drawer">
        {/* Header */}
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
          {/* Project Details */}
          <section className="oex-section">
            <div className="oex-section-title">Project Details</div>
            <div className="oex-info-grid">
              <div><span>Funding Agency</span><strong>{req.agency}</strong></div>
              <div><span>Project ID</span><strong>{req.projectId}</strong></div>
              <div><span>Principal Investigator</span><strong>{req.pi}</strong></div>
              <div><span>Department</span><strong>{req.department.split(",")[0]}</strong></div>
              <div><span>CTDT Proc. No.</span><strong>{req.procNo}</strong></div>
              <div><span>Submitted On</span><strong>{req.submittedOn}</strong></div>
              <div><span>Sanctioned Date</span><strong>{req.sanctionedDate}</strong></div>
              <div><span>Original Duration</span><strong>{req.duration}</strong></div>
            </div>
          </section>

          {/* Timeline */}
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

          {/* Reason */}
          {req.reason && (
            <section className="oex-section">
              <div className="oex-section-title">Reason for Extension</div>
              <div className="oex-reason-box">{req.reason}</div>
            </section>
          )}

          {/* Letter status */}
          <section className="oex-section">
            <div className="oex-section-title">Supporting Document</div>
            <div className={`oex-letter-box ${req.hasLetter ? "has-letter" : "no-letter"}`}>
              {req.hasLetter ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Funding Agency Request Letter — Attached
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  No supporting letter attached by PI
                </>
              )}
            </div>
          </section>

          {/* Decision record (if decided) */}
          {!isPending && (
            <section className="oex-section">
              <div className="oex-section-title">Decision Record</div>
              <div className={`oex-decision-box oex-decision-${req.status}`}>
                <div className="oex-decision-icon">
                  {req.status === "approved"
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  }
                </div>
                <div>
                  <div className="oex-decision-title">
                    {req.status === "approved" ? "Extension Approved" : "Extension Declined"} — {req.decidedOn}
                  </div>
                  <div className="oex-decision-by">by {req.decidedBy}</div>
                  {req.remarks && <div className="oex-decision-remarks">{req.remarks}</div>}
                </div>
              </div>
            </section>
          )}

          {/* Action panel */}
          {isPending && (
            <section className="oex-section oex-action-section">
              <div className="oex-section-title">Decision</div>
              <textarea
                className="oex-remarks-input"
                rows={3}
                placeholder="Add remarks or conditions (optional)..."
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
              />
              <div className="oex-action-btns">
                <button
                  className="oex-btn oex-btn-approve"
                  onClick={() => handleDecide("approved")}
                  disabled={deciding}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {deciding ? "Processing…" : "Approve Extension"}
                </button>
                <button
                  className="oex-btn oex-btn-decline"
                  onClick={() => handleDecide("declined")}
                  disabled={deciding}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {deciding ? "Processing…" : "Decline"}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function OfficeProjectExtensionPage({ onNavigate }) {
  const [requests, setRequests] = useState(SEED_REQUESTS);
  const [filter, setFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleDecide = (id, decision, remarks) => {
    const now = new Date();
    const dateStr = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      now.getFullYear(),
    ].join("-");
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: decision, remarks, decidedOn: dateStr, decidedBy: "Dr. A. Murugesan" }
          : r
      )
    );
    setSelected(null);
    showToast(
      `Request ${id} has been ${decision === "approved" ? "approved ✓" : "declined ✗"}`,
      decision === "approved" ? "success" : "error"
    );
  };

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    declined: requests.filter((r) => r.status === "declined").length,
  };

  const filtered = requests.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const q = searchQ.toLowerCase();
    const matchSearch =
      !q ||
      r.projectTitle.toLowerCase().includes(q) ||
      r.pi.toLowerCase().includes(q) ||
      r.agency.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.projectId.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const selectedReq = selected ? requests.find((r) => r.id === selected) : null;

  return (
    <div className="oex-page">
      {/* Toast */}
      {toast && (
        <div className={`oex-toast oex-toast-${toast.type}`}>
          {toast.type === "success"
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="oex-header">
        <div className="page-breadcrumb">
          Home /{" "}
          <span onClick={() => onNavigate && onNavigate("project-requests")}>Project Requests</span> /{" "}
          <span>Project Extension Claims</span>
        </div>
        <h1 className="oex-title">Project Extension Claims</h1>
        <p className="oex-subtitle">
          Review no-cost extension requests and update revised project timelines
        </p>
      </div>

      {/* Filters + Search */}
      <div className="oex-toolbar">
        <div className="oex-filters">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
            All <span className="oex-filter-count">{counts.all}</span>
          </FilterBtn>
          <FilterBtn active={filter === "pending"} onClick={() => setFilter("pending")}>
            Pending <span className="oex-filter-count pending">{counts.pending}</span>
          </FilterBtn>
          <FilterBtn active={filter === "approved"} onClick={() => setFilter("approved")}>
            Approved <span className="oex-filter-count approved">{counts.approved}</span>
          </FilterBtn>
          <FilterBtn active={filter === "declined"} onClick={() => setFilter("declined")}>
            Declined <span className="oex-filter-count declined">{counts.declined}</span>
          </FilterBtn>
        </div>
        <div className="oex-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="oex-search-icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="oex-search-input"
            placeholder="Search by project, PI, agency, or ID..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
      </div>

      {/* Cards grid */}
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
            <div
              key={r.id}
              className={`oex-card oex-card-${r.status}`}
              onClick={() => setSelected(r.id)}
            >
              {/* Card top strip */}
              <div className="oex-card-top">
                <span className="oex-card-id">{r.id}</span>
                <StatusBadge status={r.status} />
              </div>

              {/* Project title + PI */}
              <div className="oex-card-title-text">{r.projectTitle}</div>
              <div className="oex-card-pi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                {r.pi}
              </div>

              {/* Meta row */}
              <div className="oex-card-meta">
                <span className="oex-card-agency">{r.agency}</span>
                <span className="oex-card-dept">{r.department.split(",")[0]}</span>
              </div>

              {/* Timeline mini */}
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

              {/* Letter tag */}
              <div className="oex-card-footer">
                <span className={`oex-letter-tag ${r.hasLetter ? "has" : "no"}`}>
                  {r.hasLetter ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      Letter Attached
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      No Letter
                    </>
                  )}
                </span>
                <span className="oex-card-submitted">Submitted {r.submittedOn}</span>
                <button className="oex-card-view-btn">
                  Review
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              {/* Decided banner (for non-pending) */}
              {r.status !== "pending" && r.remarks && (
                <div className={`oex-card-decision-strip ${r.status}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {r.status === "approved"
                      ? <polyline points="20 6 9 17 4 12" />
                      : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    }
                  </svg>
                  <span>{r.remarks.length > 90 ? r.remarks.slice(0, 90) + "…" : r.remarks}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* History Section */}
      {requests.filter((r) => r.status !== "pending").length > 0 && (
        <div className="oex-history-section">
          <div className="oex-history-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Decision History
          </div>
          <div className="oex-history-table-card">
            <table className="oex-history-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Project / PI</th>
                  <th>Agency</th>
                  <th>Original End</th>
                  <th>Extension</th>
                  <th>Revised End</th>
                  <th>Decision</th>
                  <th>Decided On</th>
                  <th>Decided By</th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .filter((r) => r.status !== "pending")
                  .sort((a, b) => (b.decidedOn > a.decidedOn ? 1 : -1))
                  .map((r) => (
                    <tr key={r.id} className="oex-hist-row" onClick={() => setSelected(r.id)}>
                      <td className="oex-hist-id">{r.id}</td>
                      <td>
                        <div className="oex-hist-proj">{r.projectTitle}</div>
                        <div className="oex-hist-pi">{r.pi}</div>
                      </td>
                      <td><span className="oex-agency-tag">{r.agency}</span></td>
                      <td>{r.originalEndDate}</td>
                      <td><span className="oex-ext-tag">{r.extensionPeriod}</span></td>
                      <td><strong>{r.revisedEndDate}</strong></td>
                      <td>
                        <span className={`oex-hist-decision ${r.status}`}>
                          {r.status === "approved" ? "✓ Approved" : "✗ Declined"}
                        </span>
                      </td>
                      <td>{r.decidedOn}</td>
                      <td>{r.decidedBy}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedReq && (
        <DetailDrawer
          req={selectedReq}
          onClose={() => setSelected(null)}
          onDecide={handleDecide}
        />
      )}
    </div>
  );
}