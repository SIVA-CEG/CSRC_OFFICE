import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Completed.css";
import html2pdf from "html2pdf.js";

// ── Endorsement Report Renderer (Read-Only Final Version) ─────────────────────
function FinalEndorsementReport({ form, signatures }) {
  const finalDate = form.completedOn || new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

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
      <>The PI will assume full responsibility of implementing the project as PI as per the proposed objective, deliverable and timeline.</>,
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

  // Grabbing the signatures passed down from the history
  const assistantSig      = signatures?.assistant      || null;
  const superintendentSig = signatures?.superintendent || null;
  const directorSig       = signatures?.director       || null;

  return (
    <div className="cmp-er-a4" id="printable-report">
      <div className="cmp-er-header">

  <div className="cmp-er-logo-left">
    <img
      src="/src/assets/anna-university-logo.png"
      alt="Anna University"
      className="cmp-er-logo"
    />
  </div>

  <div className="cmp-er-header-center">
    <div className="cmp-er-center-title">
      Centre for Sponsored Research and Consultancy
    </div>

    <div className="cmp-er-center-sub">
      (Formerly Centre for Technology Development and Transfer)
    </div>

    <div className="cmp-er-center-univ">
      Anna University, Chennai 600 025.
    </div>
  </div>

  <div className="cmp-er-logo-right">
    <img
      src="/src/assets/csrc-logo.png"
      alt="CSRC"
      className="cmp-er-logo"
    />
  </div>

</div>
      <div className="cmp-er-director-line">
        <div className="cmp-er-dir-name">{form.directorName || "Dr. S. BALASIVANANDHA PRABU"}</div>
        <div className="cmp-er-dir-role">PROFESSOR AND DIRECTOR</div>
      </div>
      <hr className="cmp-er-divider"/>

      <div className="cmp-er-doc-title">ENDORSEMENT</div>

      <div className="cmp-er-ref-row">
        <span>Ref.No.{form.refNo || "XXXX/CSRC-2"}</span>
        <span>Date: {finalDate}</span>
      </div>

      <div className="cmp-er-proj-title-wrap">
        <span className="cmp-er-proj-label">Project Title:</span>
        <span className="cmp-er-proj-value">"{form.title || "[Project Title]"}"</span>
      </div>

      <p className="cmp-er-certify">This is to certify that:</p>

      <ol className="cmp-er-clauses">
        {items.map((clause, i) => (
          <li key={i}>{clause}</li>
        ))}
      </ol>

      <div className="cmp-er-footer">
        <div className="cmp-er-footer-left">
          <div><span className="cmp-er-foot-label">Date:</span> {finalDate}</div>
          <div><span className="cmp-er-foot-label">Place:</span> Chennai-25.</div>
        </div>
        <div className="cmp-er-sig-block">

  <div className="cmp-er-sig-item">
    {directorSig?.image ? (
      <img
        src={directorSig.image}
        alt="Director Signature"
        className="cmp-er-sig-img"
      />
    ) : (
      <div className="cmp-er-sig-blank" />
    )}

    <div className="cmp-er-sig-role">
      DIRECTOR
    </div>
  </div>

</div>
      </div>

      <div className="cmp-er-page-footer">
        CSRC, Kalanjiyam Building, III Floor, Ph: +91-44-2235 7929/7930; e-mail:- directorctdt@gmail.com, directorctdt@annauniv.edu
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function CompletedModal({ item, onClose }) {
  const [tab, setTab] = useState("details");

  // Map signatures securely from transfer history for the report
  const signatures = {};
  (item.transferHistory || []).forEach(t => {
    if (t.signature && t.fromRole) signatures[t.fromRole] = { image: t.signature, name: t.from };
  });

  const handleDownloadPDF = () => {
  const element = document.getElementById("printable-report");

  html2pdf()
    .set({
      margin: 5,
      filename: `Completed_Endorsement_${item.id}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 4,
        useCORS: true
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      }
    })
    .from(element)
    .save();
};

  return (
    <div className="cmp-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cmp-modal">
        <div className="cmp-modal-header">
          <div>
            <div className="cmp-modal-title">Completed Endorsement — Prop #{item.id}</div>
            <div className="cmp-modal-sub">Approved on {item.completedOn} · {item.fundingAgency}</div>
          </div>
          <button className="cmp-close" onClick={onClose}>✕</button>
        </div>

        <div className="cmp-tabs-header">
          <div className="cmp-tabs">
            <button className={`cmp-tab ${tab === "details" ? "cmp-tab-active" : ""}`} onClick={() => setTab("details")}>
              📋 Full Details
            </button>
            <button className={`cmp-tab ${tab === "endorsement" ? "cmp-tab-active" : ""}`} onClick={() => setTab("endorsement")}>
              📄 Final Endorsement Report
            </button>
          </div>
          {tab === "endorsement" && (
            <button className="cmp-download-btn" onClick={handleDownloadPDF}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download PDF
            </button>
          )}
        </div>

        <div className="cmp-body">
          {tab === "details" && (
            <div className="cmp-details-grid">
              <DetailRow label="Proposal ID"    value={item.id}/>
              <DetailRow label="Applied On"     value={item.appliedOn}/>
              <DetailRow label="Completed On"   value={item.completedOn}/>
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
              <div className="cmp-full-row">
                <div className="cmp-label">Project Title</div>
                <div className="cmp-value cmp-title-val">"{item.title}"</div>
              </div>

              {/* Complete Transfer History */}
              <div className="cmp-full-row">
                <div className="cmp-label">Complete Workflow History</div>
                <div className="cmp-value">
                  {(item.transferHistory || []).map((t, i) => (
                    <div key={i} className="cmp-transfer-hist">
                      <span className="cmp-hist-date">{t.date}</span>
                      <span className="cmp-hist-arrow">→</span>
                      <span className="cmp-hist-to">
                        {t.to?.name || t.to} {t.to?.role && <em>({t.to?.role})</em>}
                      </span>
                      {t.signature && <span className="cmp-hist-signed">✔ Signed by {t.from}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "endorsement" && (
            <div className="cmp-report-wrap">
              <FinalEndorsementReport form={item} signatures={signatures}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="cmp-detail-row">
      <div className="cmp-label">{label}</div>
      <div className="cmp-value">{value}</div>
    </div>
  );
}

// ── Dummy Completed Items ─────────────────────────────────────────────────────
const DUMMY_COMPLETED = [
  {
    id: 1880,
    appliedOn: "10-05-2026",
    completedOn: "25-05-2026",
    tapalNo: "1190",
    piName: "Dr. K. V. Radha",
    piDesignation: "Professor",
    piDept: "Department of Chemical Engineering",
    piCampus: "ACT Campus",
    fundingAgency: "DST",
    projectScheme: "Core Research Grant",
    title: "Development of novel highly efficient photo-catalysts for sustainable wastewater treatment",
    refNo: "2526ACT0542/CSRC-1",
    calculatedTotal: 4700000,
    dueDate: "01-06-2026",
    endorsementFormat: "DST",
    status: "COMPLETED",
    transferHistory: [
      { from: "PI", fromRole: null, to: { name: "Mr. R. Senthilkumar", role: "assistant" }, date: "10-05-2026", signature: null },
      { from: "Mr. R. Senthilkumar", fromRole: "assistant", to: { name: "Mrs. S. Meenakshi", role: "superintendent" }, date: "15-05-2026", signature: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiPjx0ZXh0IHk9IjIwIiBmaWxsPSJibHVlIiBmb250LWZhbWlseT0iY3Vyc2l2ZSIgZm9udC1zaXplPSIyMCI+U2VudGhpbDkyPC90ZXh0Pjwvc3ZnPg==" },
      { from: "Mrs. S. Meenakshi", fromRole: "superintendent", to: { name: "Dr. S. Balasivanandha Prabu", role: "director" }, date: "20-05-2026", signature: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiPjx0ZXh0IHk9IjIwIiBmaWxsPSJyZWQiIGZvbnQtZmFtaWx5PSJjdXJzaXZlIiBmb250LXNpemU9IjIwIj5NZWVuYWtzaGk8L3RleHQ+PC9zdmc+" },
      { from: "Dr. S. Balasivanandha Prabu", fromRole: "director", to: { name: "Completed", role: "completed" }, date: "25-05-2026", signature: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiPjx0ZXh0IHk9IjIwIiBmaWxsPSJncmVlbiIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iMjAiPkRpcmVjdG9yLUNTUkM8L3RleHQ+PC9zdmc+" }
    ],
  }
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function Completed({ completedItems = [] }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([...DUMMY_COMPLETED, ...completedItems]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const rowsPerPage = 15;

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // Merge in new completed items seamlessly
  useEffect(() => {
    if (completedItems.length > 0) {
      setItems(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = completedItems.filter(n => !existingIds.has(n.id));
        return [...toAdd, ...prev]; 
      });
    }
  }, [completedItems]);

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

  return (
    <div className={`cmp-page ${mounted ? "cmp-loaded" : ""}`}>
      {/* Top Nav */}
      <div className="cmp-top-nav">
        <button className="cmp-btn-back" onClick={() => navigate("/endorsements/dashboard")}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="cmp-nav-right">
          <span className="cmp-count-pill">{items.length} Completed</span>
        </div>
      </div>

      {/* Header */}
      <div className="cmp-header">
        <div>
          <h1 className="cmp-header-title">Completed Endorsements</h1>
          <p className="cmp-header-sub">Successfully verified and approved proposals with final digital signatures</p>
        </div>
      </div>

      {/* Table */}
      <div className="cmp-table-wrap">
        <div className="cmp-search-bar">
          <input
            type="text"
            placeholder="🔍 Search by PI Name, Proposal ID, or Agency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="cmp-table">
          <thead>
            <tr>
              <th>Sl.No.</th>
              <th>Completed On</th>
              <th>Prop ID</th>
              <th>PI</th>
              <th>Project Title</th>
              <th>Agency</th>
              <th>Cost (₹)</th>
              <th>Status</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={9} className="cmp-empty-row">No completed items found</td></tr>
            )}
            {currentRows.map((row, i) => (
              <tr key={row.id} className="cmp-row">
                <td><div className="cmp-sl">{(currentPage - 1) * rowsPerPage + i + 1}</div></td>
                <td className="cmp-date">{row.completedOn}</td>
                <td className="cmp-id">#{row.id}</td>
                <td className="cmp-pi-cell">
                  <div className="cmp-pi-name">{row.piName}</div>
                  <div className="cmp-pi-meta">{row.piDept}</div>
                </td>
                <td className="cmp-title-cell">
                  <div className="cmp-title-text">{row.title}</div>
                </td>
                <td className="cmp-agency">{row.fundingAgency}</td>
                <td className="cmp-cost">
                  {Number(row.calculatedTotal || 0).toLocaleString("en-IN")}
                </td>
                <td><span className="cmp-stage-badge">Approved</span></td>
                <td>
                  <button className="cmp-view-btn" onClick={() => setSelected(row)} title="View Final Document">
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
        <CompletedModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}