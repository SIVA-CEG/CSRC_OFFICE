import React, { useState, useEffect, useRef, useMemo } from "react";
import "./NewRequests.css";
import EndorsementDetailModal from "./EndorsementDetailModal";
import { useNavigate } from "react-router-dom";
import { useEndorsementContext } from "../EndorsementContext";
import { EndorsementReport } from "../transferred/Transferred";
import html2pdf from "html2pdf.js";
// ── Shared Staff List ─────────────────────────────────────────────────────────
export const STAFF_LIST = [
  { id: 1, name: "Mr. R. Senthilkumar", role: "assistant" },
  { id: 2, name: "Mrs. K. Priya", role: "assistant" },
  { id: 3, name: "Mr. T. Anbarasan", role: "superintendent" },
  { id: 4, name: "Mrs. S. Meenakshi", role: "superintendent" },
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
    title:
      "Make in India Bio-Polymer Based Composite (BBC) Adhesive Technology: An Integrated Platform for Histopathology microscopic slides",
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
      {
        campus: "ACT Campus",
        department: "Crystal Growth Centre",
        name: "Dr. C. Anchana Devi",
        designation: "Assistant Professor",
        role: "COPI",
      },
    ],
    extInvs: [
      {
        name: "Dr. C. Anchana Devi",
        designation: "Assistant Professor",
        institute: "Women's Christian College, Chennai",
      },
    ],
    files: {
      proposal: "proposal_copy.pdf",
      writeup: "writeup_signed.pdf",
      budget: "budget_signed.pdf",
    },
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
    title:
      "AI-Assisted Real-Time Two-Wheeler Safety and Risk Monitoring System",
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
    files: {
      proposal: "proposal_dst.pdf",
      writeup: "writeup_dst.pdf",
      budget: "budget_dst.pdf",
    },
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
    title:
      "Establishment of Science Technology and Innovation (STI) Hub for Manufacturing of High-Performance 3D Printing Filaments to Enhance Sustainable Livelihoods of SC Communities in Selected Blocks of Tamil Nadu",
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
      {
        campus: "MIT Campus",
        department: "Department of Manufacturing Engineering",
        name: "Dr. K. Rajkumar",
        designation: "Professor",
        role: "COPI",
      },
    ],
    extInvs: [],
    files: {
      proposal: "proposal_meity.pdf",
      writeup: "writeup_meity.pdf",
      budget: "budget_meity.pdf",
    },
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
    const p = JSON.parse(
      sessionStoragegegege.getItem(`csrc_profile_${role}`) || "null",
    );
    return p?.signature || null;
  } catch {
    return null;
  }
}

// ── Approve & Transfer / Same-Level Transfer Cell ─────────────────────────────
function ApprovalTransferCell({
  row,
  onApproveTransfer,
  onPlainTransfer,
  userRole,
}) {
  const [activeType, setActiveType] = useState(null); // "approve" | "plain" | null
  const [selectedId, setSelectedId] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Who you can Approve & Transfer to (next level up)
  const [supervisors, setSupervisors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [dds, setDds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5100/api/endorsements/staff/supervisors")
      .then((r) => r.json())
      .then(setSupervisors)
      .catch(console.error);
    fetch("http://localhost:5100/api/endorsements/staff/assistants")
      .then((r) => r.json())
      .then(setAssistants)
      .catch(console.error);
    fetch("http://localhost:5100/api/endorsements/staff/directors")
      .then((r) => r.json())
      .then(setDirectors)
      .catch(console.error);
    fetch("http://localhost:5100/api/endorsements/staff/dd")
      .then((r) => r.json())
      .then(setDds)
      .catch(console.error);
  }, []);

  const approveEligible =
    userRole === "assistant"
      ? supervisors
      : userRole === "superintendent"
        ? dds
        : userRole === "dd"
          ? directors
          : [];

  const plainEligible =
    userRole === "assistant"
      ? assistants
      : userRole === "superintendent"
        ? supervisors
        : userRole === "dd"
          ? dds
          : [];

  const isDirector = userRole === "director";

  const reset = () => {
    setActiveType(null);
    setSelectedId("");
    setConfirming(false);
  };

  const handleOk = () => {
    if (!selectedId) return;
    const allStaff = [...supervisors, ...assistants, ...directors, ...dds];
    const staff = allStaff.find((s) => s.id === parseInt(selectedId));
    if (activeType === "approve") onApproveTransfer(row.id, staff);
    if (activeType === "plain") onPlainTransfer(row.id, staff);
    reset();
  };

  // Director is the final approver — no one to transfer to
  if (isDirector) {
    return (
      <div className="nr-transfer-cell">
        <button
          className="nr-approve-final-btn"
          onClick={() => {
            const ok = window.confirm(
              "Are you sure you want to final approve this endorsement?",
            );
            if (ok) onApproveTransfer(row.id, null);
          }}
        >
          ✅ Final Approve
        </button>
      </div>
    );
  }

  return (
    <div className="nr-transfer-cell">
      {!activeType ? (
        <div className="nr-action-buttons">
          <button
            className="nr-approve-btn"
            onClick={() => setActiveType("approve")}
          >
            ✅ Approve &amp; Transfer
          </button>
          <button
            className="nr-plain-transfer-btn"
            onClick={() => setActiveType("plain")}
          >
            ↪ Transfer (No Approval)
          </button>
        </div>
      ) : (
        <div className="nr-transfer-popup">
          <div className="nr-transfer-popup-title">
            {activeType === "approve"
              ? "Approve & Transfer to:"
              : "Transfer (same level) to:"}
          </div>
          <select
            className="nr-transfer-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Select Staff --</option>
            {(activeType === "approve" ? approveEligible : plainEligible).map(
              (s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ),
            )}
          </select>
          <div className="nr-transfer-actions">
            <button
              className="nr-transfer-ok"
              onClick={() => {
                if (selectedId) setConfirming(true);
              }}
              disabled={!selectedId}
            >
              OK
            </button>
            <button className="nr-transfer-cancel" onClick={reset}>
              ✕
            </button>
          </div>
          {confirming && (
            <div className="nr-transfer-confirm">
              <span>
                {activeType === "approve"
                  ? "Approve and transfer to "
                  : "Transfer to "}
                <b>
                  {
                    [...supervisors, ...assistants, ...directors, ...dds].find(
                      (s) => s.id === parseInt(selectedId),
                    )?.name
                  }
                </b>
                ?
              </span>
              <button className="nr-transfer-ok" onClick={handleOk}>
                Confirm
              </button>
              <button
                className="nr-transfer-cancel"
                onClick={() => setConfirming(false)}
              >
                Back
              </button>
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

  const { activeRequests, addTransferred } = useEndorsementContext();

  const [endorsements, setEndorsements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState("assistant");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [draftPreview, setDraftPreview] = useState(null);
  const [directorReport, setDirectorReport] = useState(null);
  const directorReportRef = useRef(null);

  const rowsPerPage = 5;

  useEffect(() => {
    if (!directorReport) return;

    let cancelled = false;

    const run = async () => {
      try {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const element = directorReportRef.current;
        if (!element) return;

        const options = {
          margin: 5,
          image: { type: "jpeg", quality: 1 },
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

        const output = await html2pdf()
          .set(options)
          .from(element)
          .outputPdf("blob");
        const pdfBlob =
          output instanceof Blob
            ? output
            : new Blob([output], { type: "application/pdf" });

        const formData = new FormData();
        formData.append("endorsementId", directorReport.id);
        formData.append(
          "report_pdf",
          pdfBlob,
          `Endorsement_${directorReport.id}_Final.pdf`,
        );

        await fetch("http://localhost:5100/api/endorsements/save-report", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error("Failed to generate/save final report", err);
      } finally {
        if (!cancelled) {
          setDirectorReport(null);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [directorReport]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    const role =
      sessionStorage.getItem("userRole") ||
      sessionStoragegegege.getItem("userRole") ||
      "assistant";
    setUserRole(role);

    async function loadAssigned() {
      try {
        const user = JSON.parse(
          sessionStorage.getItem("proceedings_user") ||
            sessionStorage.getItem("proceedings_user") ||
            "{}",
        );
        const name = user.name || "";
        const role =
          sessionStorage.getItem("userRole") ||
          sessionStorage.getItem("userRole") ||
          "assistant";
        const endpoint =
          role === "director"
            ? `http://localhost:5100/api/endorsements/assigned-to-director?username=${encodeURIComponent(name)}`
            : role === "dd"
              ? `http://localhost:5100/api/endorsements/assigned-to-dd?username=${encodeURIComponent(name)}`
              : role === "superintendent"
                ? `http://localhost:5100/api/endorsements/assigned-to-supervisor?username=${encodeURIComponent(name)}`
                : `http://localhost:5100/api/endorsements/assigned-to-me?username=${encodeURIComponent(name)}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((item) => ({
            id: item.id,
            appliedOn: item.applied_on
              ? new Date(item.applied_on).toLocaleDateString("en-GB")
              : "",
            tapalNo: item.reference_number || "",
            piName: item.pi_name || "",
            piDesignation: "",
            piDept: "",
            piCampus: "",
            fundingAgency: item.funding_agency || "",
            projectScheme: item.scheme || "",
            title: item.full_project_title || "",
            calculatedTotal: parseFloat(item.total_amount) || 0,
            status: item.status || "",
            assignedTo: item.assigned_to || "",
            coPIs: [],
            extInvs: [],
            files: {},
          }));
          setEndorsements(mapped);
        }
      } catch (err) {
        console.error("Failed to load assigned endorsements", err);
      }
    }

    loadAssigned();
  }, []);

  // Approve & Transfer → stamps the current user's profile signature
  const handleApproveAndTransfer = async (id, staff) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const item = endorsements.find((e) => e.id === id);
    if (!item) return;

    const currentUser = JSON.parse(
      sessionStorage.getItem("proceedings_user") ||
        sessionStorage.getItem("proceedings_user") ||
        "{}",
    );

    try {
      const endpoint =
        userRole === "director"
          ? `http://localhost:5100/api/endorsements/${id}/final-approve`
          : userRole === "dd"
            ? `http://localhost:5100/api/endorsements/${id}/approve-and-assign-director`
            : userRole === "superintendent"
              ? `http://localhost:5100/api/endorsements/${id}/approve-and-assign-dd`
              : `http://localhost:5100/api/endorsements/${id}/approve-and-assign`;
      await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: staff ? staff.name : "APPROVED",
          assigned_from: currentUser.name || userRole,
          remarks: "",
        }),
      });

      if (userRole === "director") {
        const [detailRes, sigRes] = await Promise.all([
          fetch(`http://localhost:5100/api/endorsements/${id}`),
          fetch(`http://localhost:5100/api/endorsements/signatures/${id}`),
        ]);
        const detail = await detailRes.json();
        const sigs = await sigRes.json();
        const e = detail.endorsement || detail;

        let yearsService = "__";
        if (e.pi_superannuation) {
          const todayDate = new Date();
          const superDate = new Date(e.pi_superannuation);
          const diffMs = superDate - todayDate;
          yearsService = Math.max(
            0,
            Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)),
          ).toString();
        }

        setDirectorReport({
          id: e.id,
          completedOn: new Date().toLocaleDateString("en-GB"),
          refNo: e.reference_number || "",
          piName: e.pi_name || "",
          piDesignation: e.pi_designation || "",
          piDept: e.pi_dept || "",
          piCampus: e.pi_campus || "",
          fundingAgency: e.funding_agency || "",
          projectScheme: e.scheme || "",
          title: e.full_project_title || "",
          calculatedTotal: e.total_amount || 0,
          endorsementFormat: e.endorsement_format || "",
          yearsService,
          coPIs: (detail.copi || []).map((c) => ({
            name: c.copi_name || "",
            designation: c.copi_designation || "",
            department: c.copi_dept || "",
            campus: c.copi_campus || "",
          })),
          extInvs: (detail.external_investigators || []).map((ext) => ({
            name: ext.full_name || "",
            designation: ext.designation || "",
            institute: ext.institute || "",
          })),
          signatures: {
            assistant: null,
            superintendent: null,
            dd: null,
            director: sigs.dirSig
              ? `http://localhost:5100/${sigs.dirSig}`
              : null,
          },
          directorName: currentUser.name || "Dr. S. BALASIVANANDHA PRABU",
        });
      }
    } catch (err) {
      console.error("Failed to approve and assign", err);
    }

    const updated = {
      ...item,
      status:
        userRole === "director"
          ? "APPROVED"
          : userRole === "dd"
            ? staff
              ? "ASSIGNED TO DIRECTOR"
              : "APPROVED"
            : userRole === "superintendent"
              ? staff
                ? "ASSIGNED TO DD"
                : "APPROVED"
              : staff
                ? "ASSIGNED TO SUPERVISOR"
                : "APPROVED",
      transferredTo: staff,
      transferHistory: [
        ...(item.transferHistory || []),
        {
          from: currentUser.name,
          fromRole: userRole,
          to: staff,
          date: today,
          approved: true,
        },
      ],
    };

    if (userRole !== "director") {
      addTransferred(updated);
    }
    setEndorsements((prev) => prev.filter((e) => e.id !== id));
  };

  // Transfer without approval → same-level handoff, no signature applied
  const handlePlainTransfer = async (id, staff) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const item = endorsements.find((e) => e.id === id);
    if (!item) return;

    const currentUser = JSON.parse(
      sessionStorage.getItem("proceedings_user") ||
        sessionStorage.getItem("proceedings_user") ||
        "{}",
    );

    try {
      await fetch(`http://localhost:5100/api/endorsements/${id}/transfer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: staff.name,
          assigned_from: currentUser.name || userRole,
          remarks: "",
        }),
      });
    } catch (err) {
      console.error("Failed to transfer", err);
    }

    const updated = {
      ...item,
      assignedTo: staff.name,
      transferHistory: [
        ...(item.transferHistory || []),
        {
          from: currentUser.name,
          fromRole: userRole,
          to: staff,
          date: today,
          approved: false,
        },
      ],
    };

    setEndorsements((prev) => prev.filter((e) => e.id !== id));
    addTransferred(updated);
  };

  // Search filter
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return endorsements;
    return endorsements.filter(
      (e) =>
        e.piName?.toLowerCase().includes(s) ||
        String(e.id).includes(s) ||
        e.fundingAgency?.toLowerCase().includes(s) ||
        e.tapalNo?.toLowerCase().includes(s),
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

  return (
    <div className={`nr-page ${mounted ? "nr-loaded" : ""}`}>
      {/* Top Nav */}
      <div className="nr-top-nav">
        <button
          className="nr-btn-back"
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
        <div className="nr-nav-right">
          <span className="nr-count-pill">{endorsements.length} Pending</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="nr-header">
        <div>
          <h1 className="nr-header-title">New Requests</h1>
          <p className="nr-header-sub">
            Endorsement proposals submitted by PI — awaiting office review
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="nr-table-wrap">
        {/* Search Bar */}
        <div className="nr-search-bar">
          <div className="nr-search-inner">
            <svg
              className="nr-search-icon"
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
              <button className="nr-search-clear" onClick={() => setSearch("")}>
                ✕
              </button>
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
              {userRole === "director" && <th>Signatures</th>}
              {userRole === "director" && <th>Draft Report</th>}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={10} className="nr-empty-row">
                  {search
                    ? `No results for "${search}"`
                    : "No pending requests"}
                </td>
              </tr>
            )}
            {currentRows.map((row, i) => (
              <tr key={row.id} className="nr-row">
                <td>
                  <div className="nr-sl">
                    <span className="nr-radio" />
                    {(currentPage - 1) * rowsPerPage + i + 1}
                  </div>
                </td>
                <td className="nr-date">{row.appliedOn}</td>
                <td className="nr-id">#{row.id}</td>
                <td className="nr-tapal">
                  {row.tapalNo || <span className="nr-empty">—</span>}
                </td>
                <td className="nr-pi-cell">
                  <div className="nr-pi-name">{row.piName}</div>
                  <div className="nr-pi-meta">{row.piDesignation}</div>
                  <div className="nr-pi-meta">
                    {row.piDept}, {row.piCampus}
                  </div>
                </td>
                <td className="nr-scheme">{row.projectScheme}</td>
                <td className="nr-agency">{row.fundingAgency}</td>
                <td className="nr-cost">
                  {formatCurrency(row.calculatedTotal)}
                </td>
                <td>
                  <button
                    className="nr-view-btn"
                    title="View Details"
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `http://localhost:5100/api/endorsements/${row.id}`,
                        );
                        const data = await res.json();
                        const endorsement = data.endorsement || data;
                        const mapped = {
                          id: endorsement.id,
                          appliedOn: endorsement.applied_on
                            ? new Date(
                                endorsement.applied_on,
                              ).toLocaleDateString("en-GB")
                            : "",
                          tapalNo:
                            endorsement.tapal_no ||
                            endorsement.reference_number ||
                            "",
                          piName: endorsement.pi_name || "",
                          piDesignation: endorsement.pi_designation || "",
                          piDept: endorsement.pi_dept || "",
                          piCampus: endorsement.pi_campus || "",
                          piDob: endorsement.pi_dob
                            ? new Date(endorsement.pi_dob).toLocaleDateString(
                                "en-GB",
                              )
                            : "",
                          piService: endorsement.pi_dos
                            ? new Date(endorsement.pi_dos).toLocaleDateString(
                                "en-GB",
                              )
                            : "",
                          piSuperannuation: endorsement.pi_superannuation
                            ? new Date(
                                endorsement.pi_superannuation,
                              ).toLocaleDateString("en-GB")
                            : "",
                          fundingAgency: endorsement.funding_agency || "",
                          projectScheme: endorsement.scheme || "",
                          fundingType: endorsement.funding_agency_type || "",
                          projectType: endorsement.project_type || "",
                          title: endorsement.full_project_title || "",
                          refNo: endorsement.reference_number || "",
                          nonRecurring: endorsement.non_recurring || 0,
                          recurring: endorsement.recurring || 0,
                          overheadPct: endorsement.overhead_percent || 0,
                          gst: endorsement.gst_added ? "yes" : "no",
                          calculatedTotal: endorsement.total_amount || 0,
                          dueDate: endorsement.submission_due_date
                            ? new Date(
                                endorsement.submission_due_date,
                              ).toLocaleDateString("en-GB")
                            : "",
                          isPIRegular: endorsement.is_pi_regular_faculty
                            ? "yes"
                            : "no",
                          endorsementRequired: endorsement.endorsement_required
                            ? "yes"
                            : "no",
                          endorsementFormat:
                            endorsement.endorsement_format || "",
                          status: (endorsement.status || "").toUpperCase(),
                          assignedTo: endorsement.assigned_to || "",
                          coPIs: (data.copi || []).map((c) => ({
                            name: c.copi_name || "",
                            role: c.role,
                            designation: c.copi_designation || "",
                            department: c.copi_dept || "",
                            campus: c.copi_campus || "",
                            dob: c.copi_dob
                              ? new Date(c.copi_dob).toLocaleDateString("en-GB")
                              : "",
                            dos: c.copi_dos
                              ? new Date(c.copi_dos).toLocaleDateString("en-GB")
                              : "",
                            superannuation: c.copi_superannuation
                              ? new Date(
                                  c.copi_superannuation,
                                ).toLocaleDateString("en-GB")
                              : "",
                          })),
                          extInvs: (data.external_investigators || []).map(
                            (ext) => ({
                              name: ext.full_name || "",
                              designation: ext.designation || "",
                              institute: ext.institute || "",
                            }),
                          ),
                          files:
                            data.documents && data.documents.length > 0
                              ? {
                                  proposal: data.documents[0].proposal_copy,
                                  writeup: data.documents[0].signed_writeup,
                                  budget: data.documents[0].signed_budget,
                                  endorsementFile:
                                    data.documents[0].endorsement_format_file,
                                  overhead:
                                    data.documents[0].overhead_exemption_file,
                                }
                              : {},
                          transferHistory: [],
                          signatures: {},
                        };
                        setSelected(mapped);
                      } catch (err) {
                        console.error(
                          "Failed to load endorsement details",
                          err,
                        );
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

                {userRole === "director" && (
                  <td>
                    <div className="tr-sig-indicators">
                      <span
                        className="tr-sig-dot tr-sig-done"
                        title="Assistant"
                      >
                        A
                      </span>
                      <span
                        className="tr-sig-dot tr-sig-done"
                        title="Superintendent"
                      >
                        S
                      </span>
                      <span className="tr-sig-dot tr-sig-done" title="DD">
                        DD
                      </span>
                      <span className="tr-sig-dot tr-sig-none" title="Director">
                        D
                      </span>
                    </div>
                  </td>
                )}
                {userRole === "director" && (
                  <td>
                    <button
                      className="nr-view-btn"
                      title="View Draft Endorsement Report"
                      onClick={async () => {
                        try {
                          const [detailRes, sigRes] = await Promise.all([
                            fetch(
                              `http://localhost:5100/api/endorsements/${row.id}`,
                            ),
                            fetch(
                              `http://localhost:5100/api/endorsements/signatures/${row.id}`,
                            ),
                          ]);
                          const detail = await detailRes.json();
                          const sigs = await sigRes.json();
                          const e = detail.endorsement || detail;

                          let yearsService = "__";
                          if (e.pi_superannuation) {
                            const today = new Date();
                            const superDate = new Date(e.pi_superannuation);
                            const diffMs = superDate - today;
                            yearsService = Math.max(
                              0,
                              Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)),
                            ).toString();
                          }

                          setDraftPreview({
                            id: e.id,
                            piName: e.pi_name || "",
                            piDesignation: e.pi_designation || "",
                            piDept: e.pi_dept || "",
                            piCampus: e.pi_campus || "",
                            fundingAgency: e.funding_agency || "",
                            title: e.full_project_title || "",
                            refNo: e.reference_number || "",
                            endorsementFormat: e.endorsement_format || "",
                            yearsService,
                            coPIs: (detail.copi || []).map((c) => ({
                              name: c.copi_name || "",
                              designation: c.copi_designation || "",
                              department: c.copi_dept || "",
                              campus: c.copi_campus || "",
                            })),
                            extInvs: (detail.external_investigators || []).map(
                              (ext) => ({
                                name: ext.full_name || "",
                                designation: ext.designation || "",
                                institute: ext.institute || "",
                              }),
                            ),
                            signatures: {
                              assistant: sigs.asstSig
                                ? `http://localhost:5100/${sigs.asstSig}`
                                : null,
                              superintendent: sigs.supdtSig
                                ? `http://localhost:5100/${sigs.supdtSig}`
                                : null,
                              dd: sigs.ddSig
                                ? `http://localhost:5100/${sigs.ddSig}`
                                : null,
                              director: null,
                            },
                          });
                        } catch (err) {
                          console.error("Failed to load draft report", err);
                        }
                      }}
                    >
                      📄 View
                    </button>
                  </td>
                )}
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
        <div className="nr-pagination">
          <span className="nr-page-text">
            Showing{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–
            {Math.min(currentPage * rowsPerPage, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="nr-page-btns">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="nr-page-btn"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="nr-page-btn"
            >
              Prev
            </button>
            <span className="nr-page-indicator">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="nr-page-btn"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="nr-page-btn"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <EndorsementDetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setEndorsements((prev) =>
              prev.map((e) => (e.id === updated.id ? updated : e)),
            );
            setSelected(null);
          }}
        />
      )}

      {draftPreview && (
        <div
          className="edm-overlay"
          onClick={(e) => e.target === e.currentTarget && setDraftPreview(null)}
        >
          <div className="edm-modal" style={{ maxWidth: 720 }}>
            <div className="edm-modal-head">
              <div>
                <div className="edm-modal-id">Proposal #{draftPreview.id}</div>
                <h2 className="edm-modal-title">Draft Endorsement Report</h2>
              </div>
              <button
                className="edm-btn-close"
                onClick={() => setDraftPreview(null)}
              >
                ✕
              </button>
            </div>
            <div className="edm-body">
              <EndorsementReport
                form={draftPreview}
                onSignatureUpload={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {directorReport && (
        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: "210mm",
            height: "auto",
          }}
        >
          <EndorsementReport
            form={directorReport}
            mode="director-only"
            showToolbar={false}
            captureRef={directorReportRef}
          />
        </div>
      )}
    </div>
  );
}