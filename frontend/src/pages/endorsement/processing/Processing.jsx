import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Processing.css";

// ── Endorsement Report Renderer (Read-Only Preview) ──────────────────────────
function InProgressEndorsementReport({ form, signatures }) {
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

  const pi        = form.piName        || "The Principal Investigator";
  const piDesig   = form.piDesignation || "Professor";
  const piDept    = form.piDept        || "Department";
  const piCampus  = form.piCampus      || "CEG Campus";
  const agency    = form.fundingAgency || "[Funding Agency]";
  const yrs       = form.yearsService  || "__";
  const fmt       = (form.endorsementFormat || "CSRC").toUpperCase();

  let copiName = "Co-Investigator", copiDesig = "Professor", copiInst = "Institute";
  if (form.extInvs?.[0]?.name) {
    copiName = form.extInvs[0].name;
    copiDesig = form.extInvs[0].designation || "Professor";
    copiInst  = form.extInvs[0].institute   || "Institute";
  } else if (form.coPIs?.[0]?.faculty || form.coPIs?.[0]?.name) {
    copiName  = form.coPIs[0].faculty || form.coPIs[0].name;
    copiDesig = form.coPIs[0].role    || form.coPIs[0].designation || "Professor";
    copiInst  = form.coPIs[0].department
      ? `Dept. of ${form.coPIs[0].department}, ${form.coPIs[0].campus}`
      : (form.coPIs[0].campus || "Anna University");
  }

  const clauses = {
    CSRC: [
      <>The University welcomes the participation <b>{pi}, {piDesig}, {piDept}, {piCampus}</b> as Principal Investigator will assume the responsibility of the fruitful completion of the project.</>,
      <>The PI, <b>{pi}</b>, is a permanent / regular employee of this University and has <b><u>&nbsp;{yrs}&nbsp;</u></b> years of regular service left before superannuation.</>,
      <>The PI will assume full responsibility of implementing the project as PI as per the proposed objective, deliverable and timeline. The PI will also take the primary responsibility of submitting the progress report, utilization certificate, and statement of expenditure as stipulated by <b>{agency}</b>.</>,
      <>The project starts from the date on which the University receives the grant from <b>{agency}</b>.</>,
    ],
    DST: [
      <>The University welcomes the participation <b>{pi}, {piDesig}, {piDept}, {piCampus}</b> as Principal Investigator and <b>{copiName}, {copiDesig}, {copiInst}</b> as Co-Investigator(s) will assume the responsibility of the fruitful completion of the project.</>,
      <>The PI, <b>{pi}</b>, is a permanent / regular employee of this University and has <b><u>&nbsp;{yrs}&nbsp;</u></b> years of regular service left before superannuation.</>,
      <>The PI will assume full responsibility of implementing the project as PI as per the proposed objective, deliverable and timeline.</>,
    ],
    ANRF: [
      <>The University welcomes the participation <b>{pi}, {piDesig}, {piDept}, {piCampus}</b> as Principal Investigator and that in the unforeseen event of discontinuance by the Principal Investigator, the Co-Investigator will assume the responsibility of the fruitful completion of the project.</>,
      <>The PI, <b>{pi}</b>, is an employee of this University.</>,
      <>The project starts from the date on which the University receives the grant from <b>Anusandhan National Research Foundation</b>.</>,
    ],
  };

  const items = clauses[fmt] || clauses["CSRC"];

  const assistantSig      = signatures?.assistant      || null;
  const superintendentSig = signatures?.superintendent || null;

  return (
    <div className="ps-er-a4">
      <div className="ps-er-header">
        <div className="ps-er-logo-placeholder ps-er-logo-left">AU</div>
        <div className="ps-er-header-center">
          <div className="ps-er-center-title">Centre for Sponsored Research and Consultancy</div>
          <div className="ps-er-center-sub">(Formerly Centre for Technology Development and Transfer)</div>
          <div className="ps-er-center-univ">Anna University, Chennai 600 025.</div>
        </div>
        <div className="ps-er-logo-placeholder ps-er-logo-right">CSRC</div>
      </div>
      <div className="ps-er-director-line">
        <div className="ps-er-dir-name">{form.directorName || "Dr. S. BALASIVANANDHA PRABU"}</div>
        <div className="ps-er-dir-role">PROFESSOR AND DIRECTOR</div>
      </div>
      <hr className="ps-er-divider"/>

      <div className="ps-er-doc-title">ENDORSEMENT (DRAFT)</div>

      <div className="ps-er-ref-row">
        <span>Ref.No.{form.refNo || "XXXX/CSRC-2"}</span>
        <span>Date: {today}</span>
      </div>

      <div className="ps-er-proj-title-wrap">
        <span className="ps-er-proj-label">Project Title:</span>
        <span className="ps-er-proj-value">"{form.title || "[Project Title]"}"</span>
      </div>

      <p className="ps-er-certify">This is to certify that:</p>

      <ol className="ps-er-clauses">
        {items.map((clause, i) => (
          <li key={i}>{clause}</li>
        ))}
      </ol>

      <div className="ps-er-footer">
        <div className="ps-er-footer-left">
          <div><span className="ps-er-foot-label">Date:</span> {today}</div>
          <div><span className="ps-er-foot-label">Place:</span> Chennai-25.</div>
        </div>
        <div className="ps-er-sig-block">
          {assistantSig && (
            <div className="ps-er-sig-item">
              {assistantSig.image ? <img src={assistantSig.image} alt="Asst. Sig" className="ps-er-sig-img"/> : <div className="ps-er-sig-blank"/>}
              <div className="ps-er-sig-role">SUPDT</div>
            </div>
          )}
          {superintendentSig && (
            <div className="ps-er-sig-item">
              {superintendentSig.image ? <img src={superintendentSig.image} alt="Supdt. Sig" className="ps-er-sig-img"/> : <div className="ps-er-sig-blank"/>}
              <div className="ps-er-sig-role">SUPDT</div>
            </div>
          )}
          {/* Director signature is omitted here as per requirements; only in Completed */}
          <div className="ps-er-sig-item">
            <div className="ps-er-sig-blank" style={{ opacity: 0.3 }}>[Pending Approval]</div>
            <div className="ps-er-sig-role">DIRECTOR</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail View Modal ────────────────────────────────────────────────────────
function ProcessingModal({ item, onClose }) {
  const [tab, setTab] = useState("details");

  // Build signatures map from transfer history
  const signatures = {};
  (item.transferHistory || []).forEach(t => {
    if (t.signature && t.fromRole) signatures[t.fromRole] = { image: t.signature, name: t.from };
  });

  return (
    <div className="ps-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ps-modal">
        <div className="ps-modal-header">
          <div>
            <div className="ps-modal-title">In-Progress Proposal #{item.id}</div>
            <div className="ps-modal-sub">Submitted by {item.piName} · {item.fundingAgency}</div>
          </div>
          <button className="ps-close" onClick={onClose}>✕</button>
        </div>

        <div className="ps-tabs">
          <button className={`ps-tab ${tab === "details" ? "ps-tab-active" : ""}`} onClick={() => setTab("details")}>
            📋 Full Details & Tracking
          </button>
          <button className={`ps-tab ${tab === "endorsement" ? "ps-tab-active" : ""}`} onClick={() => setTab("endorsement")}>
            📄 Draft Endorsement Report
          </button>
        </div>

        <div className="ps-body">
          {tab === "details" && (
            <div className="ps-details-grid">
              <DetailRow label="Proposal ID"    value={item.id}/>
              <DetailRow label="Applied On"     value={item.appliedOn}/>
              <DetailRow label="Tapal No"       value={item.tapalNo || "—"}/>
              <DetailRow label="Ref No"         value={item.refNo}/>
              <DetailRow label="PI Name"        value={item.piName}/>
              <DetailRow label="Designation"    value={item.piDesignation}/>
              <DetailRow label="Department"     value={item.piDept}/>
              <DetailRow label="Campus"         value={item.piCampus}/>
              <DetailRow label="Funding Agency" value={item.fundingAgency}/>
              <DetailRow label="Scheme"         value={item.projectScheme}/>
              <DetailRow label="Format"         value={item.endorsementFormat}/>
              <DetailRow label="Due Date"       value={item.dueDate}/>
              <DetailRow label="Total Cost"     value={`₹ ${Number(item.calculatedTotal||0).toLocaleString("en-IN")}`}/>
              
              <div className="ps-full-row">
                <div className="ps-label">Project Title</div>
                <div className="ps-value ps-title-val">"{item.title}"</div>
              </div>

              {/* Complete Transfer History */}
              <div className="ps-full-row">
                <div className="ps-label">Current Processing History</div>
                <div className="ps-value">
                  {(item.transferHistory || []).map((t, i) => (
                    <div key={i} className="ps-transfer-hist">
                      <span className="ps-hist-date">{t.date}</span>
                      <span className="ps-hist-arrow">→</span>
                      <span className="ps-hist-to">
                        {t.to?.name || t.to} {t.to?.role && <em>({t.to?.role})</em>}
                      </span>
                      {t.signature && <span className="ps-hist-signed">✔ Signed by {t.from}</span>}
                    </div>
                  ))}
                  <div className="ps-pending-state">⏳ Waiting for action from {item.currentHolder?.name || "Next Approver"}</div>
                </div>
              </div>
            </div>
          )}

          {tab === "endorsement" && (
            <div className="ps-report-wrap">
              <InProgressEndorsementReport form={item} signatures={signatures}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="ps-detail-row">
      <div className="ps-label">{label}</div>
      <div className="ps-value">{value}</div>
    </div>
  );
}

// ── Dummy Processing Items ───────────────────────────────────────────────────
const DUMMY_PROCESSING = [
  {
    id: 1893,
    appliedOn: "27-05-2026",
    tapalNo: "1203",
    piName: "Dr. M. A. Bhagyaveni",
    piDesignation: "Professor",
    piDept: "Department of Electronics And Communication Engineering",
    piCampus: "CEG Campus",
    piDob: "12-05-1970",
    piService: "01-08-1998",
    piSuperannuation: "31-05-2030",
    piRole: "PI",
    yearsService: "4",
    fundingAgency: "SERB",
    projectScheme: "Core Research Grant",
    fundingType: "Central Govt",
    projectType: "Academic",
    title: "Indigenous Multi-Mission Medical UAV with NavIC-Based Autonomous Navigation and Ruggedized Multi-Link Tactical Ground Control Unit",
    refNo: "2526CEG0810/CSRC-1",
    nonRecurring: "12000000",
    recurring: "8275000",
    calculatedTotal: 20527500,
    dueDate: "10-06-2026",
    endorsementFormat: "DST",
    status: "PROCESSING",
    transferHistory: [
      { from: "PI", fromRole: null, to: { name: "Mr. R. Senthilkumar", role: "assistant" }, date: "27-05-2026", signature: null }
    ],
    currentHolder: { name: "Mr. R. Senthilkumar", role: "assistant" },
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function Processing({ processingItems = [] }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([...DUMMY_PROCESSING, ...processingItems]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const rowsPerPage = 15;

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // Merge in new items seamlessly
  useEffect(() => {
    if (processingItems.length > 0) {
      setItems(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = processingItems.filter(n => !existingIds.has(n.id));
        return [...toAdd, ...prev]; 
      });
    }
  }, [processingItems]);

  const filteredItems = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter(item => 
      item.piName?.toLowerCase().includes(s) || 
      item.id?.toString().includes(s) || 
      item.fundingAgency?.toLowerCase().includes(s)
    );
  }, [items, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const currentRows = filteredItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getStageBadge = (role) => {
    switch(role) {
      case 'assistant': return <span className="ps-stage-badge ps-asst">With Assistant</span>;
      case 'superintendent': return <span className="ps-stage-badge ps-supdt">With Superintendent</span>;
      case 'director': return <span className="ps-stage-badge ps-dir">With Director</span>;
      default: return <span className="ps-stage-badge ps-asst">Processing</span>;
    }
  };

  return (
    <div className={`ps-page ${mounted ? "ps-loaded" : ""}`}>
      {/* Top Nav */}
      <div className="ps-top-nav">
        <button className="ps-btn-back" onClick={() => navigate("/endorsements/dashboard")}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="ps-nav-right">
          <span className="ps-count-pill">{items.length} In Progress</span>
        </div>
      </div>

      {/* Header */}
      <div className="ps-header">
        <div>
          <h1 className="ps-header-title">Processing Endorsements</h1>
          <p className="ps-header-sub">Track the real-time status of proposals moving through the office workflow</p>
        </div>
      </div>

      {/* Table */}
      <div className="ps-table-wrap">
        <div className="ps-search-bar">
          <input
            type="text"
            placeholder="🔍 Search by PI Name, Proposal ID, or Agency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="ps-table">
          <thead>
            <tr>
              <th>Sl.No.</th>
              <th>Applied On</th>
              <th>Prop ID</th>
              <th>PI</th>
              <th>Project Title</th>
              <th>Agency</th>
              <th>Format</th>
              <th>Cost (₹)</th>
              <th>Current Stage</th>
              <th>Track</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={10} className="ps-empty-row">No items currently in processing</td></tr>
            )}
            {currentRows.map((row, i) => (
              <tr key={row.id} className="ps-row">
                <td><div className="ps-sl">{(currentPage - 1) * rowsPerPage + i + 1}</div></td>
                <td className="ps-date">{row.appliedOn}</td>
                <td className="ps-id">#{row.id}</td>
                <td className="ps-pi-cell">
                  <div className="ps-pi-name">{row.piName}</div>
                  <div className="ps-pi-meta">{row.piDept}</div>
                </td>
                <td className="ps-title-cell">
                  <div className="ps-title-text">{row.title}</div>
                </td>
                <td className="ps-agency">{row.fundingAgency}</td>
                <td><span className="ps-fmt-badge">{row.endorsementFormat}</span></td>
                <td className="ps-cost">
                  {Number(row.calculatedTotal || 0).toLocaleString("en-IN")}
                </td>
                <td>{getStageBadge(row.currentHolder?.role)}</td>
                <td>
                  <button className="ps-view-btn" onClick={() => setSelected(row)} title="Track Status">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <span className="pagination-text">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredItems.length)} of {filteredItems.length}
            </span>
            <div className="pagination-buttons">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="cancel-btn page-btn"
              >
                Prev
              </button>
              <div className="page-indicator">
                {currentPage} of {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="cancel-btn page-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <ProcessingModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}