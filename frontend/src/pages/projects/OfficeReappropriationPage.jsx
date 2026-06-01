import React, { useState } from "react";
import "./OfficeReappropriationPage.css";

/* ─── Seed Data ──────────────────────────────────────────── */
const SEED_REQUESTS = [
  {
    id: "REAP-2024-001",
    submittedOn: "12-05-2024",
    agency: "SERB",
    projectName: "Development of Ti(C,N) based cermets modified by Si3N4, B4C and Cr3C2",
    pi: "Dr. S. Balasivanandha Prabu",
    department: "Department of Mechanical Engineering, CEG Campus",
    procNo: "2433/CTDT-2/2020, dated 10-12-2020",
    installment: "2",
    headType: "recurring",
    reapRows: [
      { from: "Consumables", to: "Travel", amount: "20000" },
      { from: "Contingency", to: "Manpower", amount: "15000" },
    ],
    heads: {
      nonRecurring: [
        { label: "Equipment 1", amount: 450000 },
        { label: "Equipment 2", amount: 200000 },
      ],
      recurring: [
        { label: "Manpower", subItems: [{ name: "JRF Salary", amount: 370080 }] },
        { label: "Consumables", amount: 80000 },
        { label: "Travel", amount: 40000 },
        { label: "Contingency", amount: 59920 },
      ],
    },
    status: "pending",
    remarks: "",
    decidedOn: "",
    decidedBy: "",
  },
  {
    id: "REAP-2024-002",
    submittedOn: "03-04-2024",
    agency: "DST",
    projectName: "Design and Development of Smart Sensor Networks for Structural Health Monitoring",
    pi: "Dr. K. Rajeswari",
    department: "Department of Electronics & Communication Engineering, CEG Campus",
    procNo: "1892/CTDT-5/2021, dated 15-03-2021",
    installment: "1",
    headType: "nonRecurring",
    reapRows: [
      { from: "Equipment 1", to: "Equipment 3", amount: "50000" },
    ],
    heads: {
      nonRecurring: [
        { label: "Equipment 1", amount: 600000 },
        { label: "Equipment 2", amount: 250000 },
        { label: "Equipment 3", amount: 150000 },
      ],
      recurring: [
        { label: "Manpower", subItems: [{ name: "JRF Salary", amount: 310000 }] },
        { label: "Consumables", amount: 60000 },
        { label: "Travel", amount: 30000 },
        { label: "Contingency", amount: 40000 },
      ],
    },
    status: "approved",
    remarks: "Fund transfer within non-recurring heads is justified. Approved.",
    decidedOn: "08-04-2024",
    decidedBy: "Dr. A. Murugesan",
  },
  {
    id: "REAP-2024-003",
    submittedOn: "20-03-2024",
    agency: "DBT",
    projectName: "AI-driven Drug Discovery Framework for Tropical Disease Management",
    pi: "Dr. P. Anbalagan",
    department: "Department of Biotechnology, ACT Campus",
    procNo: "3011/CTDT-1/2022, dated 22-07-2022",
    installment: "3",
    headType: "recurring",
    reapRows: [
      { from: "Travel", to: "Consumables", amount: "25000" },
    ],
    heads: {
      nonRecurring: [
        { label: "Equipment 1", amount: 500000 },
      ],
      recurring: [
        { label: "Manpower", subItems: [{ name: "SRF Salary", amount: 420000 }] },
        { label: "Consumables", amount: 90000 },
        { label: "Travel", amount: 50000 },
        { label: "Contingency", amount: 40000 },
      ],
    },
    status: "declined",
    remarks: "Travel allocation is critical for field work. Reallocation not advisable at this stage.",
    decidedOn: "25-03-2024",
    decidedBy: "Dr. A. Murugesan",
  },
  {
    id: "REAP-2024-004",
    submittedOn: "18-05-2024",
    agency: "MNRE",
    projectName: "Renewable Energy Integration in Microgrids: Stability and Control",
    pi: "Dr. T. Vijayakumar",
    department: "Department of Electrical Engineering, CEG Campus",
    procNo: "0774/CTDT-3/2020, dated 05-09-2020",
    installment: "2",
    headType: "recurring",
    reapRows: [
      { from: "Contingency", to: "Consumables", amount: "10000" },
      { from: "Travel", to: "Manpower", amount: "8000" },
    ],
    heads: {
      nonRecurring: [
        { label: "Equipment 1", amount: 700000 },
      ],
      recurring: [
        { label: "Manpower", subItems: [{ name: "JRF Salary", amount: 350000 }] },
        { label: "Consumables", amount: 70000 },
        { label: "Travel", amount: 45000 },
        { label: "Contingency", amount: 55000 },
      ],
    },
    status: "pending",
    remarks: "",
    decidedOn: "",
    decidedBy: "",
  },
  {
    id: "REAP-2024-005",
    submittedOn: "02-02-2024",
    agency: "ICMR",
    projectName: "Novel Biomarkers for Early Detection of Diabetic Nephropathy",
    pi: "Dr. S. Meenakshi",
    department: "Department of Biomedical Engineering, SAP Campus",
    procNo: "1120/CTDT-2/2021, dated 10-05-2021",
    installment: "1",
    headType: "nonRecurring",
    reapRows: [
      { from: "Equipment 2", to: "Equipment 1", amount: 35000 },
    ],
    heads: {
      nonRecurring: [
        { label: "Equipment 1", amount: 300000 },
        { label: "Equipment 2", amount: 180000 },
      ],
      recurring: [
        { label: "Manpower", subItems: [{ name: "JRF Salary", amount: 280000 }] },
        { label: "Consumables", amount: 95000 },
        { label: "Travel", amount: 25000 },
        { label: "Contingency", amount: 30000 },
      ],
    },
    status: "approved",
    remarks: "Equipment procurement revised as per latest quotation. Approved.",
    decidedOn: "10-02-2024",
    decidedBy: "Dr. A. Murugesan",
  },
];

/* ─── Helpers ──────────────────────────────────────────────── */
const toINR = (n) =>
  n === undefined || n === null || n === "" ? "—"
    : `₹ ${Number(n).toLocaleString("en-IN")}`;

const sumHead = (h) =>
  h.subItems ? h.subItems.reduce((s, i) => s + (i.amount || 0), 0) : h.amount || 0;

const STATUS_LABEL = { pending: "Pending", approved: "Approved", declined: "Declined" };

/* ─── Sub-components ─────────────────────────────────────── */
function StatusBadge({ status }) {
  return (
    <span className={`orq-badge orq-badge-${status}`}>
      <span className="orq-badge-dot" />
      {STATUS_LABEL[status]}
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

/* ─── Detail Drawer ──────────────────────────────────────── */
function DetailDrawer({ req, onClose, onDecide }) {
  const [remarksInput, setRemarksInput] = useState(req.remarks || "");
  const [deciding, setDeciding] = useState(false);
  const isPending = req.status === "pending";

  // Compute updated amounts
  const allHeads = [...req.heads.nonRecurring, ...req.heads.recurring].map((h) => {
    let amt = sumHead(h);
    req.reapRows.forEach((r) => {
      if (r.from === h.label) amt -= parseFloat(r.amount) || 0;
      if (r.to   === h.label) amt += parseFloat(r.amount) || 0;
    });
    return { label: h.label, original: sumHead(h), revised: amt };
  });

  const handleDecide = (decision) => {
    setDeciding(true);
    setTimeout(() => {
      onDecide(req.id, decision, remarksInput);
      setDeciding(false);
    }, 600);
  };

  return (
    <div className="orq-drawer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="orq-drawer">
        {/* Drawer header */}
        <div className="orq-drawer-header">
          <div>
            <div className="orq-drawer-id">{req.id}</div>
            <div className="orq-drawer-title">{req.projectName}</div>
          </div>
          <div className="orq-drawer-header-right">
            <StatusBadge status={req.status} />
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
              <div><span>Head Type</span><strong>{req.headType === "nonRecurring" ? "Non-Recurring" : "Recurring"}</strong></div>
            </div>
          </section>

          {/* Re-appropriation entries */}
          <section className="orq-section">
            <div className="orq-section-title">Re-appropriation Entries</div>
            <table className="orq-table">
              <thead>
                <tr><th>Sl.</th><th>From Head</th><th>To Head</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {req.reapRows.map((r, i) => (
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
            <div className="orq-section-title">Budget Impact (Revised vs Original)</div>
            <table className="orq-table">
              <thead>
                <tr><th>Head</th><th>Original</th><th>Change</th><th>Revised</th></tr>
              </thead>
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

          {/* Decision (if already decided) */}
          {!isPending && (
            <section className="orq-section">
              <div className="orq-section-title">Decision Record</div>
              <div className={`orq-decision-box orq-decision-${req.status}`}>
                <div className="orq-decision-icon">
                  {req.status === "approved"
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  }
                </div>
                <div>
                  <div className="orq-decision-title">
                    {req.status === "approved" ? "Approved" : "Declined"} — {req.decidedOn}
                  </div>
                  <div className="orq-decision-by">by {req.decidedBy}</div>
                  {req.remarks && <div className="orq-decision-remarks">{req.remarks}</div>}
                </div>
              </div>
            </section>
          )}

          {/* Action panel for pending */}
          {isPending && (
            <section className="orq-section orq-action-section">
              <div className="orq-section-title">Decision</div>
              <textarea
                className="orq-remarks-input"
                rows={3}
                placeholder="Add remarks (optional)..."
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
              />
              <div className="orq-action-btns">
                <button
                  className="orq-btn orq-btn-approve"
                  onClick={() => handleDecide("approved")}
                  disabled={deciding}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  {deciding ? "Processing…" : "Approve"}
                </button>
                <button
                  className="orq-btn orq-btn-decline"
                  onClick={() => handleDecide("declined")}
                  disabled={deciding}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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

/* ─── Main Page ──────────────────────────────────────────── */
export default function OfficeReappropriationPage({ onNavigate }) {
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
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
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
      r.projectName.toLowerCase().includes(q) ||
      r.pi.toLowerCase().includes(q) ||
      r.agency.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const selectedReq = selected ? requests.find((r) => r.id === selected) : null;

  return (
    <div className="orq-page">
      {/* Toast */}
      {toast && (
        <div className={`orq-toast orq-toast-${toast.type}`}>
          {toast.type === "success"
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="orq-header">
        <div className="page-breadcrumb">
          Home /{" "}
          <span onClick={() => onNavigate && onNavigate("project-requests")}>Project Requests</span> /{" "}
          <span>Reappropriation Claims</span>
        </div>
        <h1 className="orq-title">Reappropriation Claims</h1>
        <p className="orq-subtitle">Review and decide on fund re-allocation requests from Principal Investigators</p>
      </div>

      {/* Filters + Search */}
      <div className="orq-toolbar">
        <div className="orq-filters">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
            All <span className="orq-filter-count">{counts.all}</span>
          </FilterBtn>
          <FilterBtn active={filter === "pending"} onClick={() => setFilter("pending")}>
            Pending <span className="orq-filter-count pending">{counts.pending}</span>
          </FilterBtn>
          <FilterBtn active={filter === "approved"} onClick={() => setFilter("approved")}>
            Approved <span className="orq-filter-count approved">{counts.approved}</span>
          </FilterBtn>
          <FilterBtn active={filter === "declined"} onClick={() => setFilter("declined")}>
            Declined <span className="orq-filter-count declined">{counts.declined}</span>
          </FilterBtn>
        </div>
        <div className="orq-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="orq-search-icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="orq-search-input"
            placeholder="Search by project, PI, agency, or ID..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
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
                  <td className="orq-center">{r.reapRows.length}</td>
                  <td>{r.submittedOn}</td>
                  <td><StatusBadge status={r.status} /></td>
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

      {/* History panel */}
      {requests.filter((r) => r.status !== "pending").length > 0 && (
        <div className="orq-history-section">
          <div className="orq-history-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            Decision History
          </div>
          <div className="orq-history-list">
            {requests
              .filter((r) => r.status !== "pending")
              .sort((a, b) => (b.decidedOn > a.decidedOn ? 1 : -1))
              .map((r) => (
                <div key={r.id} className={`orq-history-item orq-hist-${r.status}`} onClick={() => setSelected(r.id)}>
                  <div className={`orq-hist-icon orq-hist-icon-${r.status}`}>
                    {r.status === "approved"
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    }
                  </div>
                  <div className="orq-hist-body">
                    <div className="orq-hist-top">
                      <span className="orq-hist-id">{r.id}</span>
                      <span className="orq-hist-date">{r.decidedOn}</span>
                    </div>
                    <div className="orq-hist-proj">{r.projectName}</div>
                    <div className="orq-hist-pi">{r.pi} · {r.agency}</div>
                    {r.remarks && <div className="orq-hist-remarks">"{r.remarks}"</div>}
                  </div>
                  <div className={`orq-hist-status ${r.status}`}>
                    {r.status === "approved" ? "Approved" : "Declined"}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Drawer */}
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