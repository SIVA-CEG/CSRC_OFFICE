import React, { useState, useEffect } from "react";
import "./NewRequests.css";
import EndorsementDetailModal from "./EndorsementDetailModal";
import { useNavigate } from "react-router-dom";

// ── Shared Staff List (Can be moved to a context/util later) ─────────────────
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
      { campus: "ACT Campus", department: "Crystal Growth Centre", facultyId: "101", name: "Dr. C. Anchana Devi", designation: "Assistant Professor", role: "COPI", dob: "10-03-1981", dos: "22-07-2010", superannuation: "10-03-2041" }
    ],
    extInvs: [
      { name: "Dr. C. Anchana Devi", designation: "Assistant Professor", institute: "Women's Christian College, Chennai" }
    ],
    files: { proposal: "proposal_copy.pdf", writeup: "writeup_signed.pdf", budget: "budget_signed.pdf", endorsementFile: "endorsement_fmt.pdf", overhead: null },
    status: "PENDING",
    remarks: "",
    overheadExemption: "",
    transferHistory: [],
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
    files: { proposal: "proposal_dst.pdf", writeup: "writeup_dst.pdf", budget: "budget_dst.pdf", endorsementFile: null, overhead: null },
    status: "PENDING",
    remarks: "",
    overheadExemption: "",
    transferHistory: [],
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
      { campus: "MIT Campus", department: "Department of Manufacturing Engineering", facultyId: "202", name: "Dr. K. Rajkumar", designation: "Professor", role: "COPI", dob: "20-11-1970", dos: "15-03-2001", superannuation: "20-11-2030" },
    ],
    extInvs: [],
    files: { proposal: "proposal_meity.pdf", writeup: "writeup_meity.pdf", budget: "budget_meity.pdf", endorsementFile: "fmt_csrc.pdf", overhead: "overhead_exemption.pdf" },
    status: "PENDING",
    remarks: "",
    overheadExemption: "Exemption letter attached",
    transferHistory: [],
  },
];

function formatCurrency(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// ── Transfer Cell Component ───────────────────────────────────────────────────
function TransferCell({ row, onTransfer, userRole }) {
  const [open, setOpen]         = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Logic: Assistants can transfer to other Assistants or Superintendents.
  // Superintendents transfer to Director.
  const eligible = userRole === "superintendent" 
    ? STAFF_LIST.filter(s => s.role === "director")
    : STAFF_LIST.filter(s => s.role === "assistant" || s.role === "superintendent");

  const handleOk = () => {
    if (!selectedId) return;
    const staff = STAFF_LIST.find(s => s.id === parseInt(selectedId));
    onTransfer(row.id, staff);
    setOpen(false);
    setSelectedId("");
    setConfirming(false);
  };

  return (
    <div className="nr-transfer-cell">
      {!open ? (
        <button className="nr-transfer-btn" onClick={() => setOpen(true)} title="Initiate Processing">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          Transfer
        </button>
      ) : (
        <div className="nr-transfer-popup">
          <select
            className="nr-transfer-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">-- Select {userRole === 'superintendent' ? 'Director' : 'Staff'} --</option>
            {eligible.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>
          <div className="nr-transfer-actions">
            <button
              className="nr-transfer-ok"
              onClick={() => { if (selectedId) setConfirming(true); }}
              disabled={!selectedId}
            >OK</button>
            <button className="nr-transfer-cancel" onClick={() => { setOpen(false); setSelectedId(""); }}>✕</button>
          </div>
          {confirming && (
            <div className="nr-transfer-confirm">
              <span>Transfer to <b>{STAFF_LIST.find(s => s.id === parseInt(selectedId))?.name}</b>?</span>
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
export default function NewRequests({ onTransferToProcessing }) {
  const navigate = useNavigate();
  const [endorsements, setEndorsements] = useState(DUMMY_ENDORSEMENTS);
  const [selected, setSelected]         = useState(null);
  const [mounted, setMounted]           = useState(false);
  
  // Get the logged in user's role from local storage
  const [userRole, setUserRole] = useState("assistant");

  useEffect(() => { 
    setTimeout(() => setMounted(true), 50); 
    const role = localStorage.getItem('userRole') || 'assistant';
    setUserRole(role);
  }, []);

  const handleTransfer = (id, staff) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    setEndorsements(prev => {
      const item = prev.find(e => e.id === id);
      if (!item) return prev;
      const updated = {
        ...item,
        status: "PROCESSING",
        transferHistory: [
          ...(item.transferHistory || []),
          // Initial transfer marks the start of processing
          { from: "PI", fromRole: null, to: staff, date: today, signature: null }
        ],
        currentHolder: staff,
      };
      
      if (onTransferToProcessing) onTransferToProcessing(updated);
      
      return prev.filter(e => e.id !== id);
    });
  };

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
        <table className="nr-table">
          <thead>
            <tr>
              <th>Sl.No.</th>
              <th>Applied On</th>
              <th>Prop ID</th>
              <th>Tapal No</th>
              <th>PI</th>
              <th>Scheme</th>
              <th>Funding Agency</th>
              <th>Cost (₹)</th>
              <th>View</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {endorsements.length === 0 && (
              <tr><td colSpan={10} className="nr-empty-row">No pending requests</td></tr>
            )}
            {endorsements.map((row, i) => (
              <tr key={row.id} className="nr-row">
                <td>
                  <div className="nr-sl">
                    <span className="nr-radio"/>
                    {i + 1}
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
                  <TransferCell row={row} onTransfer={handleTransfer} userRole={userRole}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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