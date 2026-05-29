import { useState, useEffect } from "react";
import "./NewRequests.css";
import "../components/StatusBadge.css";
import StatusBadge from "../components/StatusBadge";
import EndorsementDetailModal from "./EndorsementDetailModal";
import { useNavigate } from "react-router-dom";

// ── Dummy Data (all fields from NewEndorsementPage) ──────────────────────────
const DUMMY_ENDORSEMENTS = [
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
  },
];

function formatCurrency(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function NewRequests({ onBack, onNavigate }) {
  const navigate = useNavigate();
  
  const [endorsements, setEndorsements] = useState(DUMMY_ENDORSEMENTS);
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleView = (item) => setSelected(item);
  const handleClose = () => setSelected(null);

  const handleUpdate = (updatedItem) => {
    setEndorsements((prev) =>
      prev.map((e) => (e.id === updatedItem.id ? updatedItem : e))
    );
    setSelected(null);
  };

  return (
    <div className={`nr-page ${mounted ? "nr-loaded" : ""}`}>
      {/* Top Nav */}
      <div className="nr-top-nav">
        <button
  className="nr-btn-back"
  onClick={() => navigate("/endorsements/dashboard")}
>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {endorsements.map((row, i) => (
              <tr key={row.id} className="nr-row">
                <td>
                  <div className="nr-sl">
                    <span className="nr-radio" />
                    {i + 1}
                  </div>
                </td>
                <td className="nr-date">{row.appliedOn}</td>
                <td className="nr-id">{row.id}</td>
                <td className="nr-tapal">{row.tapalNo || <span className="nr-empty">—</span>}</td>
                <td className="nr-pi-cell">
                  <div className="nr-pi-name">{row.piName},</div>
                  <div className="nr-pi-meta">{row.piDesignation},</div>
                  <div className="nr-pi-meta">{row.piDept}, {row.piCampus},</div>
                </td>
                <td className="nr-scheme">{row.projectScheme}</td>
                <td className="nr-agency">{row.fundingAgency}</td>
                <td className="nr-cost">{formatCurrency(row.calculatedTotal)}</td>
                <td>
                  <button className="nr-view-btn" onClick={() => handleView(row)} title="View Details">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
          {/* Repeat header at bottom as shown in screenshot */}
          <tfoot>
            <tr className="nr-foot-row">
              <th>Sl.No.</th>
              <th>Applied On</th>
              <th>Applied On</th>
              <th>Prop ID</th>
              <th>PI</th>
              <th colSpan="2">Scheme</th>
              <th>Cost (₹)</th>
              <th>View</th>
              <th>Status</th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <EndorsementDetailModal
          item={selected}
          onClose={handleClose}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}