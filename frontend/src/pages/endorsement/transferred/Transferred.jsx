import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Transferred.css";
import { useEndorsementContext } from "../EndorsementContext";
import html2pdf from "html2pdf.js";
// ── Endorsement Report ────────────────────────────────────────────────────────
// Signatures shown here always come from the signed-in admin_users record of
// whoever performed each workflow step (assistant / superintendent / director).
// There is no manual "upload a signature for this document" step anymore.
export function EndorsementReport({
  form,
  mode = "full",
  showToolbar = true,
  captureRef = null,
}) {
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  const fmt = (form.endorsementFormat || "CSRC").toUpperCase();
  const reportRef = useRef(null);

  const pi = form.piName || "The Principal Investigator";
  const piDesig = form.piDesignation || "Professor";
  const piDept = form.piDept || "Department";
  const piCampus = form.piCampus || "CEG Campus";
  const agency = form.fundingAgency || "[Funding Agency]";
  const yrs = form.yearsService || "__";

  let copiName = "Co-Investigator",
    copiDesig = "Professor",
    copiInst = "Institute";
  if (form.extInvs?.[0]?.name) {
    copiName = form.extInvs[0].name;
    copiDesig = form.extInvs[0].designation || "Professor";
    copiInst = form.extInvs[0].institute || "Institute";
  } else if (form.coPIs?.[0]?.name) {
    copiName = form.coPIs[0].name;
    copiDesig = form.coPIs[0].designation || "Professor";
    copiInst = form.coPIs[0].department
      ? `Dept. of ${form.coPIs[0].department}, ${form.coPIs[0].campus}`
      : "Anna University";
  }

  const clauses = {
    CSRC: [
      <>
        The University welcomes the participation{" "}
        <b>
          {pi}, {piDesig}, {piDept}, {piCampus}
        </b>{" "}
        as Principal Investigator will assume the responsibility of the fruitful
        completion of the project.
      </>,
      <>
        The PI, <b>{pi}</b>, is a permanent / regular employee of this
        University and has{" "}
        <b>
          <u>&nbsp;{yrs}&nbsp;</u>
        </b>{" "}
        years of regular service left before superannuation.
      </>,
      <>
        The PI will assume full responsibility of implementing the project as PI
        as per the proposed objective, deliverable and timeline. The PI will
        also take the primary responsibility of submitting the progress report,
        utilization certificate, and statement of expenditure as stipulated by{" "}
        <b>{agency}</b>.
      </>,
      <>
        The project starts from the date on which the University receives the
        grant from <b>{agency}</b>.
      </>,
    ],
    DST: [
      <>
        The University welcomes the participation{" "}
        <b>
          {pi}, {piDesig}, {piDept}, {piCampus}
        </b>{" "}
        as Principal Investigator and{" "}
        <b>
          {copiName}, {copiDesig}, {copiInst}
        </b>{" "}
        as Co-Investigator(s) will assume the responsibility of the fruitful
        completion of the project.
      </>,
      <>
        The PI, <b>{pi}</b>, is a permanent / regular employee of this
        University and has{" "}
        <b>
          <u>&nbsp;{yrs}&nbsp;</u>
        </b>{" "}
        years of regular service left before superannuation.
      </>,
      <>
        The PI will assume full responsibility of implementing the project as PI
        as per the proposed objective, deliverable and timeline.
      </>,
    ],
    ANRF: [
      <>
        The University welcomes the participation{" "}
        <b>
          {pi}, {piDesig}, {piDept}, {piCampus}
        </b>{" "}
        as Principal Investigator and that in the unforeseen event of
        discontinuance by the Principal Investigator, the Co-Investigator will
        assume the responsibility of the fruitful completion of the project.
      </>,
      <>
        The PI, <b>{pi}</b>, is an employee of this University.
      </>,
      <>
        The project starts from the date on which the University receives the
        grant from <b>Anusandhan National Research Foundation</b>.
      </>,
    ],
  };

  const items = clauses[fmt] || clauses["CSRC"];
  const asstSig = form.signatures?.assistant || null;
  const supdtSig = form.signatures?.superintendent || null;
  const ddSig = form.signatures?.dd || null;
  const dirSig = form.signatures?.director || null;

  const handleDownloadPDF = () => {
    const element = reportRef.current;

    const options = {
      margin: 5,
      filename: `Endorsement_${form.id}.pdf`,
      image: {
        type: "jpeg",
        quality: 1,
      },
      html2canvas: {
        scale: 4,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="tr-report-wrap">
      {showToolbar && (
        <div className="tr-report-toolbar">
          <button className="tr-download-btn" onClick={handleDownloadPDF}>
            📥 Download PDF
          </button>
        </div>
      )}

      <div className="tr-er-a4" ref={captureRef || reportRef}>
        <div className="tr-er-header">
          <div className="tr-er-logo-left">
            <img
              src="/src/assets/anna-university-logo.png"
              alt="Anna University Logo"
              className="tr-er-logo"
            />
          </div>

          <div className="tr-er-header-center">
            <div className="tr-er-center-title">
              Centre for Sponsored Research and Consultancy
            </div>

            <div className="tr-er-center-sub">
              (Formerly Centre for Technology Development and Transfer)
            </div>

            <div className="tr-er-center-univ">
              Anna University, Chennai 600 025.
            </div>
          </div>

          <div className="tr-er-logo-right">
            <img
              src="/src/assets/csrc-logo.png"
              alt="CSRC Logo"
              className="tr-er-logo"
            />
          </div>
        </div>
        <div className="tr-er-director-line">
          <div className="tr-er-dir-name">
            {form.directorName || "Dr. S. BALASIVANANDHA PRABU"}
          </div>
          <div className="tr-er-dir-role">PROFESSOR AND DIRECTOR</div>
        </div>
        <hr className="tr-er-divider" />
        <div className="tr-er-doc-title">
          {mode === "director-only" ? "ENDORSEMENT" : "ENDORSEMENT (DRAFT)"}
        </div>
        <div className="tr-er-ref-row">
          <span>Ref.No.{form.refNo || "XXXX/CSRC-2"}</span>
          <span>Date: {today}</span>
        </div>
        <div className="tr-er-proj-title-wrap">
          <span className="tr-er-proj-label">Project Title:</span>
          <span className="tr-er-proj-value">
            "{form.title || "[Project Title]"}"
          </span>
        </div>
        <p className="tr-er-certify">This is to certify that:</p>
        <ol className="tr-er-clauses">
          {items.map((clause, i) => (
            <li key={i}>{clause}</li>
          ))}
        </ol>
        <div className="tr-er-footer">
          <div className="tr-er-footer-left">
            <div>
              <span className="tr-er-foot-label">Date:</span> {today}
            </div>
            <div>
              <span className="tr-er-foot-label">Place:</span> Chennai-25.
            </div>
          </div>
          <div className="tr-er-sig-block">
            {mode !== "director-only" && (
              <>
                <div className="tr-er-sig-item">
                  {asstSig ? (
                    <img
                      src={asstSig}
                      alt="Asst Sig"
                      className="tr-er-sig-img"
                    />
                  ) : (
                    <div className="tr-er-sig-blank tr-sig-pending">
                      Pending
                    </div>
                  )}
                  <div className="tr-er-sig-role">ASST. (Office)</div>
                  {asstSig && (
                    <div className="tr-er-sig-checkmark">✔ Signed</div>
                  )}
                </div>
                <div className="tr-er-sig-item">
                  {supdtSig ? (
                    <img
                      src={supdtSig}
                      alt="Supdt Sig"
                      className="tr-er-sig-img"
                    />
                  ) : (
                    <div className="tr-er-sig-blank tr-sig-pending">
                      Pending
                    </div>
                  )}
                  <div className="tr-er-sig-role">SUPDT</div>
                  {supdtSig && (
                    <div className="tr-er-sig-checkmark">✔ Signed</div>
                  )}
                </div>
                <div className="tr-er-sig-item">
                  {ddSig ? (
                    <img src={ddSig} alt="DD Sig" className="tr-er-sig-img" />
                  ) : (
                    <div className="tr-er-sig-blank tr-sig-pending">
                      Pending
                    </div>
                  )}
                  <div className="tr-er-sig-role">DD</div>
                  {ddSig && <div className="tr-er-sig-checkmark">✔ Signed</div>}
                </div>
              </>
            )}
            <div className="tr-er-sig-item">
              {dirSig ? (
                <img src={dirSig} alt="Dir Sig" className="tr-er-sig-img" />
              ) : (
                <div className="tr-er-sig-blank tr-sig-pending">Pending</div>
              )}
              <div className="tr-er-sig-role">DIRECTOR</div>
              {dirSig && <div className="tr-er-sig-checkmark">✔ Signed</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransferTimeline({ item }) {
  const history = item.transferHistory || [];

  return (
    <div className="tr-timeline">
      {history.map((entry, i) => {
        const toName = typeof entry.to === "object" ? entry.to.name : entry.to;
        const toRole = typeof entry.to === "object" ? entry.to.role : null;
        const fromName =
          typeof entry.from === "object" ? entry.from.name : entry.from;

        return (
          <div key={i} className="tr-timeline-entry">
            <div className="tr-tl-dot-wrap">
              <div
                className={`tr-tl-dot ${entry.approved ? "tr-tl-approved" : "tr-tl-forwarded"}`}
              >
                {entry.approved ? "✔" : "↪"}
              </div>
              {i < history.length - 1 && <div className="tr-tl-line" />}
            </div>
            <div className="tr-tl-content">
              <div className="tr-tl-date">{entry.date}</div>
              <div className="tr-tl-transfer">
                <span className="tr-tl-from">{fromName}</span>
                <span className="tr-tl-arrow">→</span>
                <span className="tr-tl-to">{toName}</span>
                {toRole && (
                  <span className={`tr-tl-role-badge tr-role-${toRole}`}>
                    {toRole}
                  </span>
                )}
              </div>
              <div
                className={`tr-tl-status-badge ${entry.approved ? "tr-tl-approved-badge" : "tr-tl-forward-badge"}`}
              >
                {entry.approved
                  ? "✔ Approved & Forwarded"
                  : "↪ Forwarded (Pending Approval)"}
              </div>
            </div>
          </div>
        );
      })}

      {item.status === "APPROVED" ? (
        <div className="tr-timeline-entry tr-tl-pending-entry">
          <div className="tr-tl-dot-wrap">
            <div className="tr-tl-dot tr-tl-approved">✔</div>
          </div>
          <div className="tr-tl-content">
            <div className="tr-tl-pending-label">
              Process Completed — Fully Approved
            </div>
          </div>
        </div>
      ) : (
        <div className="tr-timeline-entry tr-tl-pending-entry">
          <div className="tr-tl-dot-wrap">
            <div className="tr-tl-dot tr-tl-pending">⏳</div>
          </div>
          <div className="tr-tl-content">
            <div className="tr-tl-pending-label">
              Waiting for action from{" "}
              {item.currentHolder?.name || "Next Approver"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function TransferredModal({ item, onClose, onUpdate }) {
  const [tab, setTab] = useState("details");
  const [localItem, setLocalItem] = useState({ ...item });
  const userRole =
    sessionStorage.getItem("userRole") ||
    sessionStorage.getItem("userRole") ||
    "assistant";

  useEffect(() => {
    setLocalItem({ ...item });
  }, [item]);

  const currentHolder = localItem.currentHolder;
  const s = (localItem.status || "").toUpperCase();
  const isCompleted = s === "APPROVED" || s === "COMPLETED";
  const stageBadgeClass = isCompleted
    ? "tr-stage-completed"
    : s === "ASSIGNED TO DIRECTOR"
      ? "tr-stage-dir"
      : s === "ASSIGNED TO DD"
        ? "tr-stage-dd"
        : s === "ASSIGNED TO SUPERVISOR"
          ? "tr-stage-supdt"
          : "tr-stage-asst";
  const stageLabel = isCompleted
    ? "Completed"
    : s === "ASSIGNED TO DIRECTOR"
      ? `With Director (${localItem.assignedTo || ""})`
      : s === "ASSIGNED TO DD"
        ? `With DD (${localItem.assignedTo || ""})`
        : s === "ASSIGNED TO SUPERVISOR"
          ? `With Supervisor (${localItem.assignedTo || ""})`
          : `With Assistant (${localItem.assignedTo || ""})`;

  return (
    <div
      className="tr-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="tr-modal">
        <div className="tr-modal-header">
          <div>
            <div className="tr-modal-badge">TRANSFERRED</div>
            <div className="tr-modal-title">Proposal #{localItem.id}</div>
            <div className="tr-modal-sub">
              Submitted by {localItem.piName} · {localItem.fundingAgency}
            </div>
          </div>
          <button className="tr-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="tr-tabs">
          <button
            className={`tr-tab ${tab === "details" ? "tr-tab-active" : ""}`}
            onClick={() => setTab("details")}
          >
            📋 Full Details & Tracking
          </button>
          <button
            className={`tr-tab ${tab === "endorsement" ? "tr-tab-active" : ""}`}
            onClick={() => setTab("endorsement")}
          >
            📄 Draft Endorsement Report
          </button>
        </div>
        <div className="tr-body">
          {tab === "details" && (
            <div className="tr-details-grid">
              {[
                ["Proposal ID", localItem.id],
                ["Applied On", localItem.appliedOn],
                ["Tapal No", localItem.tapalNo || "—"],
                ["Ref No", localItem.refNo],
                ["PI Name", localItem.piName],
                ["Designation", localItem.piDesignation],
                ["Department", localItem.piDept],
                ["Campus", localItem.piCampus],
                ["Funding Agency", localItem.fundingAgency],
                ["Scheme", localItem.projectScheme],
                ["Format", localItem.endorsementFormat],
                ["Due Date", localItem.dueDate],
                [
                  "Total Cost",
                  `₹ ${Number(localItem.calculatedTotal || 0).toLocaleString("en-IN")}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="tr-detail-row">
                  <div className="tr-label">{label}</div>
                  <div className="tr-value">{value}</div>
                </div>
              ))}
              <div className="tr-detail-row">
                <div className="tr-label">Current Stage</div>
                <div className="tr-value">
                  <span className={`tr-stage-badge ${stageBadgeClass}`}>
                    {stageLabel}
                  </span>
                </div>
              </div>
              <div className="tr-full-row">
                <div className="tr-label">Project Title</div>
                <div className="tr-value tr-title-val">"{localItem.title}"</div>
              </div>
              <div className="tr-full-row">
                <div className="tr-label">Current Processing History</div>
                <div className="tr-value">
                  <TransferTimeline item={localItem} />
                </div>
              </div>
            </div>
          )}
          {tab === "endorsement" && <EndorsementReport form={localItem} />}
        </div>
      </div>
    </div>
  );
}

function StageBadge({ status, assignedTo }) {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "COMPLETED")
    return <span className="tr-stage-badge tr-stage-completed">Completed</span>;
  if (s === "ASSIGNED TO DIRECTOR")
    return (
      <span className="tr-stage-badge tr-stage-dir">
        With Director ({assignedTo})
      </span>
    );
  if (s === "ASSIGNED TO DD")
    return (
      <span className="tr-stage-badge tr-stage-dd">With DD ({assignedTo})</span>
    );
  if (s === "ASSIGNED TO SUPERVISOR")
    return (
      <span className="tr-stage-badge tr-stage-supdt">
        With Supervisor ({assignedTo})
      </span>
    );
  if (s === "ASSIGNED")
    return (
      <span className="tr-stage-badge tr-stage-asst">
        With Assistant ({assignedTo})
      </span>
    );
  return <span className="tr-stage-badge tr-stage-asst">{status}</span>;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Transferred() {
  const navigate = useNavigate();
  const userRole =
    sessionStorage.getItem("userRole") ||
    sessionStorage.getItem("userRole") ||
    "assistant";

  // Read directly from shared context — always in sync with NewRequests transfers
  const { transferredItems, updateTransferred } = useEndorsementContext();

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [endorsements, setEndorsements] = useState([]);
  const rowsPerPage = 5;

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    async function loadTransferred() {
      try {
        const user = JSON.parse(
          sessionStorage.getItem("proceedings_user") ||
            sessionStorage.getItem("proceedings_user") ||
            "{}",
        );
        const name = user.name || "";
        const res = await fetch(
          `http://localhost:5100/api/endorsements/transferred-by-me?username=${encodeURIComponent(name)}`,
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setEndorsements(
            data.map((item) => ({
              id: item.id,
              appliedOn: item.applied_on
                ? new Date(item.applied_on).toLocaleDateString("en-GB")
                : "",
              tapalNo: item.reference_number || "",
              piName: item.pi_name || "",
              piDesignation: item.pi_designation || "",
              piDept: item.pi_dept || "",
              piCampus: item.pi_campus || "",
              fundingAgency: item.funding_agency || "",
              projectScheme: item.scheme || "",
              title: item.full_project_title || "",
              calculatedTotal: parseFloat(item.total_amount) || 0,
              status: item.status || "",
              assignedTo: item.assigned_to || "",
              endorsementFormat: item.endorsement_format || "",
              dueDate: item.submission_due_date
                ? new Date(item.submission_due_date).toLocaleDateString("en-GB")
                : "",
              transferHistory: [],
              signatures: {},
              currentHolder: { name: item.current_holder || "", role: "" },
              lastAction: item.last_action || "",
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load transferred endorsements", err);
      }
    }
    loadTransferred();
  }, []);

  // Directors don't forward proposals onward — this page isn't relevant to
  // their role, so send them back to the dashboard instead of rendering it.
  useEffect(() => {
    if (userRole === "director") {
      navigate("/endorsements/dashboard", { replace: true });
    }
  }, [userRole, navigate]);

  const handleUpdate = (updated) => {
    updateTransferred(updated);
    setSelected(updated);
  };

  // Role filter: superintendent only sees items sent to them
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return endorsements;
    return endorsements.filter(
      (item) =>
        item.piName?.toLowerCase().includes(s) ||
        item.id?.toString().includes(s) ||
        item.fundingAgency?.toLowerCase().includes(s) ||
        item.tapalNo?.toLowerCase().includes(s),
    );
  }, [endorsements, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const currentRows = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const pageTitle =
    userRole === "superintendent" || userRole === "dd"
      ? "Transferred to Me"
      : "Transferred Endorsements";
  const pageSubtitle =
    userRole === "superintendent"
      ? "Proposals transferred by you — verified details, uploaded your signature & forwarded to DD"
      : userRole === "dd"
        ? "Proposals transferred by you — verified details, uploaded your signature & forwarded to Director"
        : "Proposals you have forwarded — track their current stage and endorsement progress";

  // Keep selected in sync with latest data from context
  const selectedItem = selected;

  // Directors are redirected away above; avoid rendering the page for them.
  if (userRole === "director") return null;

  return (
    <div className={`tr-page ${mounted ? "tr-loaded" : ""}`}>
      <div className="tr-top-nav">
        <button
          className="tr-btn-back"
          onClick={() => navigate("/endorsements/dashboard")}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </button>
        <div className="tr-nav-right">
          <span className="tr-role-chip">
            {userRole === "superintendent"
              ? "🔵 Superintendent View"
              : userRole === "dd"
                ? "🟠 DD View"
                : "🟢 Assistant View"}
          </span>
          <span className="tr-count-pill">
            {filtered.length}{" "}
            {userRole === "superintendent" || userRole === "dd"
              ? "Awaiting Review"
              : "Transferred"}
          </span>
        </div>
      </div>

      <div className="tr-header">
        <h1 className="tr-header-title">{pageTitle}</h1>
        <p className="tr-header-sub">{pageSubtitle}</p>
      </div>

      <div className="tr-table-wrap">
        <div className="tr-search-bar">
          <div className="tr-search-inner">
            <svg
              className="tr-search-icon"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by PI Name, Proposal ID, Agency or Tapal No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="tr-search-clear" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
        </div>

        <table className="tr-table">
          <thead>
            <tr>
              <th>Sl.No.</th>
              <th>Applied On</th>
              <th>Prop ID</th>
              <th>Tapal No</th>
              <th>PI</th>
              <th>Scheme</th>
              <th>Agency</th>
              <th>Format</th>
              <th>Cost (₹)</th>
              <th>Current Stage</th>
              <th>Signatures</th>
              <th>Track</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={12} className="tr-empty-row">
                  {search
                    ? `No results for "${search}"`
                    : "No proposals have been transferred yet"}
                </td>
              </tr>
            )}
            {currentRows.map((row, i) => {
              const sigs = row.signatures || {};
              return (
                <tr key={row.id} className="tr-row">
                  <td>
                    <div className="tr-sl">
                      {(currentPage - 1) * rowsPerPage + i + 1}
                    </div>
                  </td>
                  <td className="tr-date">{row.appliedOn}</td>
                  <td className="tr-id">#{row.id}</td>
                  <td className="tr-tapal">
                    {row.tapalNo || <span className="tr-empty-dash">—</span>}
                  </td>
                  <td className="tr-pi-cell">
                    <div className="tr-pi-name">{row.piName}</div>
                    <div className="tr-pi-meta">{row.piDesignation}</div>
                    <div className="tr-pi-meta">
                      {row.piDept}, {row.piCampus}
                    </div>
                  </td>
                  <td className="tr-scheme">{row.projectScheme}</td>
                  <td className="tr-agency">{row.fundingAgency}</td>
                  <td>
                    <span className="tr-fmt-badge">
                      {row.endorsementFormat}
                    </span>
                  </td>
                  <td className="tr-cost">
                    {Number(row.calculatedTotal || 0).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <StageBadge
                      status={row.status}
                      assignedTo={row.assignedTo}
                    />
                  </td>
                  <td>
                    <div className="tr-sig-indicators">
                      <span
                        className={`tr-sig-dot ${
                          [
                            "ASSIGNED TO SUPERVISOR",
                            "ASSIGNED TO DD",
                            "ASSIGNED TO DIRECTOR",
                            "APPROVED",
                            "COMPLETED",
                          ].includes((row.status || "").toUpperCase())
                            ? "tr-sig-done"
                            : "tr-sig-none"
                        }`}
                        title="Assistant"
                      >
                        A
                      </span>
                      <span
                        className={`tr-sig-dot ${
                          [
                            "ASSIGNED TO DD",
                            "ASSIGNED TO DIRECTOR",
                            "APPROVED",
                            "COMPLETED",
                          ].includes((row.status || "").toUpperCase())
                            ? "tr-sig-done"
                            : "tr-sig-none"
                        }`}
                        title="Superintendent"
                      >
                        S
                      </span>
                      <span
                        className={`tr-sig-dot ${
                          [
                            "ASSIGNED TO DIRECTOR",
                            "APPROVED",
                            "COMPLETED",
                          ].includes((row.status || "").toUpperCase())
                            ? "tr-sig-done"
                            : "tr-sig-none"
                        }`}
                        title="DD"
                      >
                        DD
                      </span>
                      <span
                        className={`tr-sig-dot ${
                          ["APPROVED", "COMPLETED"].includes(
                            (row.status || "").toUpperCase(),
                          )
                            ? "tr-sig-done"
                            : "tr-sig-none"
                        }`}
                        title="Director"
                      >
                        D
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="tr-view-btn"
                      title="Track & View"
                      onClick={async () => {
                        try {
                          const [detailRes, historyRes, sigRes] =
                            await Promise.all([
                              fetch(
                                `http://localhost:5100/api/endorsements/${row.id}`,
                              ),
                              fetch(
                                `http://localhost:5100/api/endorsements/assign-history/${row.id}`,
                              ),
                              fetch(
                                `http://localhost:5100/api/endorsements/signatures/${row.id}`,
                              ),
                            ]);
                          const detail = await detailRes.json();
                          const history = await historyRes.json();
                          const sigs = await sigRes.json();

                          const e = detail.endorsement || detail;

                          // Years of service from superannuation_date
                          let yearsService = "__";
                          if (e.pi_superannuation) {
                            const today = new Date();
                            const superDate = new Date(e.pi_superannuation);
                            const diffMs = superDate - today;
                            const years = Math.floor(
                              diffMs / (1000 * 60 * 60 * 24 * 365),
                            );
                            yearsService = Math.max(0, years).toString();
                          }

                          // Current stage from last history entry
                          const lastH =
                            Array.isArray(history) && history.length > 0
                              ? history[history.length - 1]
                              : null;

                          const currentHolderName =
                            lastH?.assigned_to || e.assigned_to || "";
                          const lastAction = lastH?.action || "";

                          let currentStage = (e.status || "").toUpperCase();
                          if (lastAction === "APPROVE_AND_ASSIGN")
                            currentStage = "ASSIGNED TO SUPERVISOR";
                          if (lastAction === "APPROVE_AND_ASSIGN_DD")
                            currentStage = "ASSIGNED TO DD";
                          if (lastAction === "APPROVE_AND_ASSIGN_DIRECTOR")
                            currentStage = "ASSIGNED TO DIRECTOR";

                          setSelected({
                            ...row,
                            piName: e.pi_name || row.piName,
                            piDesignation: e.pi_designation || "",
                            piDept: e.pi_dept || "",
                            piCampus: e.pi_campus || "",
                            refNo: e.reference_number || row.tapalNo || "",
                            piDob: e.pi_dob
                              ? new Date(e.pi_dob).toLocaleDateString("en-GB")
                              : "",
                            piService: e.pi_dos
                              ? new Date(e.pi_dos).toLocaleDateString("en-GB")
                              : "",
                            piSuperannuation: e.pi_superannuation
                              ? new Date(
                                  e.pi_superannuation,
                                ).toLocaleDateString("en-GB")
                              : "",
                            yearsService,
                            fundingAgency: e.funding_agency || "",
                            projectScheme: e.scheme || "",
                            title: e.full_project_title || "",
                            nonRecurring: e.non_recurring || 0,
                            recurring: e.recurring || 0,
                            overheadPct: e.overhead_percent || 0,
                            gst: e.gst_added ? "yes" : "no",
                            calculatedTotal: e.total_amount || 0,
                            endorsementFormat: e.endorsement_format || "",
                            status: currentStage,
                            assignedTo: currentHolderName,
                            coPIs: (detail.copi || []).map((c) => ({
                              name: c.copi_name || "",
                              role: c.role,
                              designation: c.copi_designation || "",
                              dos: c.copi_dos
                                ? new Date(c.copi_dos).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "",
                              dob: c.copi_dob
                                ? new Date(c.copi_dob).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "",
                              superannuation: c.copi_superannuation
                                ? new Date(
                                    c.copi_superannuation,
                                  ).toLocaleDateString("en-GB")
                                : "",
                            })),
                            extInvs: (detail.external_investigators || []).map(
                              (ext) => ({
                                name: ext.full_name || "",
                                designation: ext.designation || "",
                                institute: ext.institute || "",
                              }),
                            ),
                            transferHistory: Array.isArray(history)
                              ? history.map((h) => ({
                                  from: h.assigned_from,
                                  to: h.assigned_to,
                                  date: new Date(
                                    h.created_at,
                                  ).toLocaleDateString("en-GB"),
                                  approved:
                                    h.action === "APPROVE_AND_ASSIGN" ||
                                    h.action === "APPROVE_AND_ASSIGN_DD" ||
                                    h.action === "APPROVE_AND_ASSIGN_DIRECTOR",
                                  action: h.action,
                                  remarks: h.remarks,
                                }))
                              : [],
                            // Signatures are always pulled from each
                            // approver's admin_users.signature_path on the
                            // backend (see /signatures/:id) — never manually
                            // uploaded per document.
                            signatures: {
                              assistant: sigs.asstSig
                                ? `http://localhost:5100/${sigs.asstSig.replace(/\\/g, "/")}`
                                : null,
                              superintendent: sigs.supdtSig
                                ? `http://localhost:5100/${sigs.supdtSig.replace(/\\/g, "/")}`
                                : null,
                              dd: sigs.ddSig
                                ? `http://localhost:5100/${sigs.ddSig.replace(/\\/g, "/")}`
                                : null,
                              director: sigs.dirSig
                                ? `http://localhost:5100/${sigs.dirSig.replace(/\\/g, "/")}`
                                : null,
                            },
                            currentHolder: {
                              name: currentHolderName,
                              role: "",
                            },
                          });
                        } catch (err) {
                          console.error("Failed to load details", err);
                          setSelected(row);
                        }
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="tr-pagination">
          <span className="tr-page-text">
            Showing{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
            {Math.min(currentPage * rowsPerPage, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="tr-page-btns">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="tr-page-btn"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="tr-page-btn"
            >
              Prev
            </button>
            <span className="tr-page-indicator">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="tr-page-btn"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="tr-page-btn"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {selectedItem && (
        <TransferredModal
          item={selectedItem}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
