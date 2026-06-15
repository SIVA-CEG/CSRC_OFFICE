import React, { useState, useEffect, useRef, useMemo } from "react";
import "./NewRequests.css";
import EndorsementDetailModal from "./EndorsementDetailModal";
import { useNavigate } from "react-router-dom";
import { useEndorsementContext } from "../EndorsementContext";

// ── Shared Staff List ─────────────────────────────────────────────────────────
export const STAFF_LIST = [
  { id: 1, name: "Mr. R. Senthilkumar", role: "assistant" },
  { id: 2, name: "Mrs. K. Priya",       role: "assistant" },
  { id: 3, name: "Mr. T. Anbarasan",    role: "superintendent" },
  { id: 4, name: "Mrs. S. Meenakshi",   role: "superintendent" },
  { id: 5, name: "Dr. S. Balasivanandha Prabu", role: "director" },
];

// ── Dummy Data ────────────────────────────────────────────────────────────────
export const DUMMY_ENDORSEMENTS = [
  {
    id: 1895,
    appliedOn: "27-05-2026",
    tapalNo: "",
    piName: "Dr. Shubra Singh",
    piDesignation: "Assistant Professor",
    piDept: "Crystal Growth Centre",
    piCampus: "ACT Campus",
    piDob: "13-11-1979",
    piService: "19-01-2016",
    piSuperannuation: "18-01-2045",
    piRole: "PI",
    yearsService: "18",
    fundingAgency: "SERB",
    projectScheme: "Core Research Grant",
    fundingType: "Central Govt",
    projectType: "Academic",
    title: "Make in India Bio-Polymer Based Composite (BBC) Adhesive Technology: An Integrated Platform for Histopathology microscopic slides",
    refNo: "2526ET0937/CSRC-2",
    nonRecurring: "1200000",
    recurring: "2734000",
    overheadPct: 15,
    gst: "no",
    calculatedTotal: 4524100,
    dueDate: "10-06-2026",
    isPIRegular: "yes",
    endorsementRequired: "yes",
    endorsementFormat: "ANRF",
    coPIs: [
      { campus: "ACT Campus", department: "Crystal Growth Centre", name: "Dr. C. Anchana Devi", designation: "Assistant Professor", role: "COPI" }
    ],
    extInvs: [
      { name: "Dr. C. Anchana Devi", designation: "Assistant Professor", institute: "Women's Christian College, Chennai" }
    ],
    files: { proposal: "proposal_copy.pdf", writeup: "writeup_signed.pdf", budget: "budget_signed.pdf" },
    status: "PENDING",
    transferHistory: [],
    signatures: {},
  },
  {
    id: 1894,
    appliedOn: "27-05-2026",
    tapalNo: "",
    piName: "Dr. P. Geetha",
    piDesignation: "Associate Professor",
    piDept: "Department of Information Science And Technology",
    piCampus: "CEG Campus",
    piDob: "05-07-1975",
    piService: "12-08-2004",
    piSuperannuation: "05-07-2035",
    piRole: "PI",
    yearsService: "9",
    fundingAgency: "DST",
    projectScheme: "Core Research Grant {CRG}",
    fundingType: "Central Govt",
    projectType: "Academic",
    title: "AI-Assisted Real-Time Two-Wheeler Safety and Risk Monitoring System",
    refNo: "2526CEG0841/CSRC-1",
    nonRecurring: "800000",
    recurring: "1800000",
    overheadPct: 15,
    gst: "no",
    calculatedTotal: 2995650,
    dueDate: "15-06-2026",
    isPIRegular: "yes",
    endorsementRequired: "yes",
    endorsementFormat: "DST",
    coPIs: [],
    extInvs: [],
    files: { proposal: "proposal_dst.pdf", writeup: "writeup_dst.pdf", budget: "budget_dst.pdf" },
    status: "PENDING",
    transferHistory: [],
    signatures: {},
  },
  {
    id: 1886,
    appliedOn: "16-05-2026",
    tapalNo: "TL-2026-0042",
    piName: "Dr. V. Mugendiran",
    piDesignation: "Assistant Professor (Sr.Gr)",
    piDept: "Department of Production Technology",
    piCampus: "MIT Campus",
    piDob: "14-09-1978",
    piService: "01-06-2006",
    piSuperannuation: "14-09-2038",
    piRole: "PI",
    yearsService: "12",
    fundingAgency: "MeitY",
    projectScheme: "Science Technology Innovation Hub for SC & ST",
    fundingType: "Central Govt",
    projectType: "Collaborative",
    title: "Establishment of Science Technology and Innovation (STI) Hub for Manufacturing of High-Performance 3D Printing Filaments to Enhance Sustainable Livelihoods of SC Communities in Selected Blocks of Tamil Nadu",
    refNo: "2526MIT0712/CSRC-5",
    nonRecurring: "8000000",
    recurring: "14000000",
    overheadPct: 15,
    gst: "no",
    calculatedTotal: 29542419,
    dueDate: "30-06-2026",
    isPIRegular: "yes",
    endorsementRequired: "yes",
    endorsementFormat: "CSRC",
    coPIs: [
      { campus: "MIT Campus", department: "Department of Manufacturing Engineering", name: "Dr. K. Rajkumar", designation: "Professor", role: "COPI" }
    ],
    extInvs: [],
    files: { proposal: "proposal_meity.pdf", writeup: "writeup_meity.pdf", budget: "budget_meity.pdf" },
    status: "PENDING",
    transferHistory: [],
    signatures: {},
  },
];
function formatCurrency(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// ── Read the signature saved on the profile page ──────────────────────────────
function getProfileSignature(role) {
  try {
    const p = JSON.parse(localStorage.getItem(`csrc_profile_${role}`) || "null");
    return p?.signature || null;
  } catch {
    return null;
  }
}

// ── Approve & Transfer / Same-Level Transfer Cell ─────────────────────────────
function ApprovalTransferCell({ row, onApproveTransfer, onPlainTransfer, userRole }) {
  const [activeType, setActiveType] = useState(null); // "approve" | "plain" | null
  const [selectedId, setSelectedId] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Who you can Approve & Transfer to (next level up)
  const approveEligible =
    userRole === "assistant"      ? STAFF_LIST.filter(s => s.role === "superintendent") :
    userRole === "superintendent" ? STAFF_LIST.filter(s => s.role === "director") :
    [];

  // Who you can transfer to at the same level, without approving
  const plainEligible =
    userRole === "assistant"      ? STAFF_LIST.filter(s => s.role === "assistant") :
    userRole === "superintendent" ? STAFF_LIST.filter(s => s.role === "superintendent") :
    [];

  const isDirector = userRole === "director";

  const reset = () => { setActiveType(null); setSelectedId(""); setConfirming(false); };

  const handleOk = () => {
    if (!selectedId) return;
    const staff = STAFF_LIST.find(s => s.id === parseInt(selectedId));
    if (activeType === "approve") onApproveTransfer(row.id, staff);
    if (activeType === "plain")   onPlainTransfer(row.id, staff);
    reset();
  };

  // Director is the final approver — no one to transfer to
  if (isDirector) {
    return (
      <div className="nr-transfer-cell">
        <button className="nr-approve-final-btn" onClick={() => onApproveTransfer(row.id, null)}>
          ✅ Final Approve
        </button>
      </div>
    );
  }

  return (
    <div className="nr-transfer-cell">
      {!activeType ? (
        <div className="nr-action-buttons">
          <button className="nr-approve-btn" onClick={() => setActiveType("approve")}>
            ✅ Approve &amp; Transfer
          </button>
          <button className="nr-plain-transfer-btn" onClick={() => setActiveType("plain")}>
            ↪ Transfer (No Approval)
          </button>
        </div>
      ) : (
        <div className="nr-transfer-popup">
          <div className="nr-transfer-popup-title">
            {activeType === "approve" ? "Approve & Transfer to:" : "Transfer (same level) to:"}
          </div>
          <select
            className="nr-transfer-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">-- Select Staff --</option>
            {(activeType === "approve" ? approveEligible : plainEligible).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
          <div className="nr-transfer-actions">
            <button className="nr-transfer-ok" onClick={() => { if (selectedId) setConfirming(true); }} disabled={!selectedId}>OK</button>
            <button className="nr-transfer-cancel" onClick={reset}>✕</button>
          </div>
          {confirming && (
            <div className="nr-transfer-confirm">
              <span>
                {activeType === "approve" ? "Approve and transfer to " : "Transfer to "}
                <b>{STAFF_LIST.find(s => s.id === parseInt(selectedId))?.name}</b>?
              </span>
              <button className="nr-transfer-ok" onClick={handleOk}>Confirm</button>
              <button className="nr-transfer-cancel" onClick={() => setConfirming(false)}>Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NewRequests() {
  const navigate = useNavigate();

  const {
    activeRequests,
    addTransferred,
  } = useEndorsementContext();

  const [endorsements, setEndorsements] = useState(activeRequests);
  const [selected, setSelected]         = useState(null);
  const [mounted, setMounted]           = useState(false);
  const [userRole, setUserRole]         = useState("assistant");
  const [search, setSearch]             = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    const role = localStorage.getItem("userRole") || "assistant";
    setUserRole(role);
  }, []);

  useEffect(() => {
    setEndorsements(activeRequests);
  }, [activeRequests]);

  // Approve & Transfer → stamps the current user's profile signature
  const handleApproveAndTransfer = (id, staff) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const item = endorsements.find(e => e.id === id);
    if (!item) return;

    const mySig  = getProfileSignature(userRole);
    const toEntry = staff || { name: "Completed", role: userRole };

    const updated = {
      ...item,
      status: staff ? "TRANSFERRED" : "APPROVED",
      transferredTo: staff,
      signatures: {
        ...(item.signatures || {}),
        [userRole]: mySig || item.signatures?.[userRole] || true,
      },
      transferHistory: [
        ...(item.transferHistory || []),
        { from: "Office", fromRole: userRole, to: toEntry, date: today, approved: true },
      ],
      currentHolder: toEntry,
    };

    addTransferred(updated);
  };

  // Transfer without approval → same-level handoff, no signature applied
  const handlePlainTransfer = (id, staff) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const item = endorsements.find(e => e.id === id);
    if (!item) return;

    const updated = {
      ...item,
      status: "TRANSFERRED",
      transferredTo: staff,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: "Office", fromRole: userRole, to: staff, date: today, approved: false },
      ],
      currentHolder: staff,
    };

    addTransferred(updated);
  };

  // Search filter
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return endorsements;
    return endorsements.filter(e =>
      e.piName?.toLowerCase().includes(s) ||
      String(e.id).includes(s) ||
      e.fundingAgency?.toLowerCase().includes(s) ||
      e.tapalNo?.toLowerCase().includes(s)
    );
  }, [endorsements, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);
  const totalPages  = Math.ceil(filtered.length / rowsPerPage);
  const currentRows = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className={`nr-page ${mounted ? "nr-loaded" : ""}`}>
      {/* Top Nav */}
      <div className="nr-top-nav">
        <button className="nr-btn-back" onClick={() => navigate("/endorsements/dashboard")}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="nr-nav-right">
          <span className="nr-count-pill">{endorsements.length} Pending</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="nr-header">
        <div>
          <h1 className="nr-header-title">New Requests</h1>
          <p className="nr-header-sub">Endorsement proposals submitted by PI — awaiting office review</p>
        </div>
      </div>

      {/* Table */}
      <div className="nr-table-wrap">
        {/* Search Bar */}
        <div className="nr-search-bar">
          <div className="nr-search-inner">
            <svg className="nr-search-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by PI Name, Proposal ID, Agency or Tapal No..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="nr-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>

        <table className="nr-table">
          <thead>
            <tr>
              <th>Sl.No.</th>
              <th>Applied On</th>
              <th>Prop ID</th>
              <th>Tapal No</th>
              <th>PI</th>
              <th>Scheme</th>
              <th>Agency</th>
              <th>Cost (₹)</th>
              <th>View</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={10} className="nr-empty-row">
                  {search ? `No results for "${search}"` : "No pending requests"}
                </td>
              </tr>
            )}
            {currentRows.map((row, i) => (
              <tr key={row.id} className="nr-row">
                <td>
                  <div className="nr-sl">
                    <span className="nr-radio"/>
                    {(currentPage - 1) * rowsPerPage + i + 1}
                  </div>
                </td>
                <td className="nr-date">{row.appliedOn}</td>
                <td className="nr-id">#{row.id}</td>
                <td className="nr-tapal">{row.tapalNo || <span className="nr-empty">—</span>}</td>
                <td className="nr-pi-cell">
                  <div className="nr-pi-name">{row.piName}</div>
                  <div className="nr-pi-meta">{row.piDesignation}</div>
                  <div className="nr-pi-meta">{row.piDept}, {row.piCampus}</div>
                </td>
                <td className="nr-scheme">{row.projectScheme}</td>
                <td className="nr-agency">{row.fundingAgency}</td>
                <td className="nr-cost">{formatCurrency(row.calculatedTotal)}</td>
                <td>
                  <button className="nr-view-btn" onClick={() => setSelected(row)} title="View Details">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </td>
                <td>
                  <ApprovalTransferCell
                    row={row}
                    onApproveTransfer={handleApproveAndTransfer}
                    onPlainTransfer={handlePlainTransfer}
                    userRole={userRole}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="nr-pagination">
            <span className="nr-page-text">
              Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
            </span>
            <div className="nr-page-btns">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="nr-page-btn">Prev</button>
              <span className="nr-page-indicator">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="nr-page-btn">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <EndorsementDetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setEndorsements(prev => prev.map(e => e.id === updated.id ? updated : e));
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}








