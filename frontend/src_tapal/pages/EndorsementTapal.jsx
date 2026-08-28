import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EndorsementDetailModal from "./EndorsementDetailModal";
import AssignModal from "./AssignModal";
import TrackModal from "./TrackModal";
import IndividualReportModal from "./IndividualReportModal";
import OverallReportModal from "./OverallReportModal";
import {
  getEndorsementById,
  getPendingEndorsements,
  getAssignedEndorsements,
  getCompletedEndorsements,
} from "../../src_tapal/api/endorsementApi";
// ── Date formatting helper ────────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const DUMMY_DATA = [
  {
    id: 1895,
    fileNo: "2526ET0937/CSRC-2",
    date: "27-05-2026",
    category: "SERB",
    from: "Dr. Shubra Singh",
    status: "PENDING",
    assignedTo: null,
  },
  {
    id: 1894,
    fileNo: "2526CEG0841/CSRC-1",
    date: "27-05-2026",
    category: "DST",
    from: "Dr. P. Geetha",
    status: "PENDING",
    assignedTo: null,
  },
  {
    id: 1886,
    fileNo: "2526MIT0712/CSRC-5",
    date: "16-05-2026",
    category: "MeitY",
    from: "Dr. V. Mugendiran",
    status: "ASSIGNED",
    assignedTo: "Mr. T. Anbarasan",
  },
  {
    id: 1880,
    fileNo: "2526CEG0680/CSRC-3",
    date: "10-05-2026",
    category: "ISRO",
    from: "Dr. R. Kavitha",
    status: "COMPLETED",
    assignedTo: "Mrs. S. Meenakshi",
  },
];

function EmptyState({ label }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <h4>No {label}</h4>
      <p>Records will appear here once available.</p>
    </div>
  );
}

//import { getPendingEndorsements } from "../../src/api/endorsementApi";

export default function EndorsementTapal() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const [endorsements, setEndorsements] = useState([]);
  const [assignItem, setAssignItem] = useState(null);
  const [trackItem, setTrackItem] = useState(null);

  const [reportItem, setReportItem] = useState(null);

  const [showOverallReport, setShowOverallReport] = useState(false);

  const filtered = useMemo(() => {
    return endorsements.filter((item) => {
      const q = search.toLowerCase();

      return (
        item.from.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.fileNo.toLowerCase().includes(q) ||
        String(item.id).includes(q)
      );
    });
  }, [endorsements, search]);

  useEffect(() => {
    let mounted = true;
    async function loadPending() {
      try {
        const [pending, assigned] = await Promise.all([
          getPendingEndorsements(),
          getAssignedEndorsements(),
        ]);

        const mappedPending = Array.isArray(pending)
          ? pending.map((item) => ({
              id: item.id,
              fileNo: item.reference_number || item.endorsement_id || "",
              date: item.applied_on
                ? new Date(item.applied_on).toLocaleDateString("en-GB")
                : "",
              category: item.funding_agency || "",
              from: item.pi_name || "",
              status: "PENDING",
              assignedTo: null,
              created_at: item.created_at,
            }))
          : [];

        const mappedAssigned = Array.isArray(assigned)
          ? assigned.map((item) => ({
              id: item.id,
              fileNo: item.reference_number || item.endorsement_id || "",
              date: item.applied_on
                ? new Date(item.applied_on).toLocaleDateString("en-GB")
                : "",
              category: item.funding_agency || "",
              from: item.pi_name || "",
              status: (item.status || "ASSIGNED").toUpperCase(),
              assignedTo: item.assigned_to || "",
              created_at: item.created_at,
            }))
          : [];

        const completed = await getCompletedEndorsements();

        const mappedCompleted = Array.isArray(completed)
          ? completed.map((item) => ({
              id: item.id,
              fileNo: item.reference_number || item.endorsement_id || "",
              date: item.applied_on
                ? new Date(item.applied_on).toLocaleDateString("en-GB")
                : "",
              category: item.funding_agency || "",
              from: item.pi_name || "",
              status: "COMPLETED",
              assignedTo: item.assigned_to || "",
              created_at: item.created_at,
            }))
          : [];

        if (mounted) {
          setEndorsements([
            ...mappedPending,
            ...mappedAssigned,
            ...mappedCompleted,
          ]);
        }
      } catch (err) {
        console.error("Failed to load tapal endorsements", err);
      }
    }

    loadPending();

    return () => {
      mounted = false;
    };
  }, []);

  const newItems = filtered.filter((x) => x.status === "PENDING");
  const assignedItems = filtered.filter((x) =>
    [
      "ASSIGNED",
      "ASSIGNED TO SUPERVISOR",
      "ASSIGNED TO DIRECTOR",
      "ASSIGNED_WITH_SUPERVISER",
      "ASSIGNED_WITH_DIRECTOR",
    ].includes((x.status || "").toUpperCase()),
  );
  const completedItems = filtered.filter((x) => x.status === "COMPLETED");

  const currentData =
    activeTab === "new"
      ? newItems
      : activeTab === "assigned"
        ? assignedItems
        : completedItems;

  const handleAssign = async (id, staff, remarks) => {
    const currentUser = JSON.parse(
      sessionStorage.getItem("proceedings_user") ||
        sessionStorage.getItem("tapal_user") ||
        "{}",
    );

    try {
      await fetch(`http://localhost:5100/api/endorsements/${id}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: staff.name,
          assign_remarks: remarks,
          assigned_from: currentUser.name || currentUser.username || "Office",
        }),
      });
    } catch (err) {
      console.error("Failed to save assignment", err);
    }

    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    setEndorsements((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "ASSIGNED",
              assignedTo: staff.name,
              assignedDate: today,
              transferHistory: [
                ...(item.transferHistory || []),
                { from: "Office", to: staff.name, date: today, remarks },
              ],
            }
          : item,
      ),
    );
    setAssignItem(null);
  };

  const handleComplete = (id) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    setEndorsements((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "COMPLETED",
              completedDate: today,
            }
          : item,
      ),
    );
  };

  const tabs = [
    {
      key: "new",
      label: "New Endorsements",
      icon: "🆕",
      count: newItems.length,
      color: "#0369a1",
      bg: "#e0f2fe",
    },
    {
      key: "assigned",
      label: "Assigned Endorsements",
      icon: "📌",
      count: assignedItems.length,
      color: "#92400e",
      bg: "#fef3c7",
    },
    {
      key: "completed",
      label: "Completed Endorsements",
      icon: "✅",
      count: completedItems.length,
      color: "#166534",
      bg: "#dcfce7",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const totalPages = Math.max(1, Math.ceil(currentData.length / rowsPerPage));
  const currentRows = currentData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="page-body">
      <div className="page-stack">
        <div className="page-header">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/tapal/projects")}
          >
            ← Back to Projects
          </button>

          <div>
            <div className="page-title">Endorsement Tapals</div>
            <div className="page-subtitle">
              Manage endorsement requests across all stages
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowOverallReport(true)}
          >
            📊 Overall Reports
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by PI, File No, Agency, Proposal ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={activeTab === tab.key ? "tab active" : "tab"}
            >
              {tab.icon} {tab.label}
              <span
                style={{
                  background: tab.bg,
                  color: tab.color,
                  borderRadius: 999,
                  padding: "2px 10px",
                  fontSize: 12,
                  marginLeft: 8,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>{tabs.find((x) => x.key === activeTab)?.label}</h3>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Proposal ID</th>
                  <th>File No</th>
                  <th>Date</th>
                  <th>Agency</th>
                  <th>PI Name</th>
                  <th>Status</th>

                  {activeTab !== "new" && <th>Assigned To</th>}

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <EmptyState
                        label={tabs.find((x) => x.key === activeTab)?.label}
                      />
                    </td>
                  </tr>
                ) : (
                  currentRows.map((row, index) => (
                    <tr key={row.id}>
                      <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td>{row.id}</td>
                      <td>{row.fileNo}</td>
                      <td>{row.date}</td>
                      <td>{row.category}</td>
                      <td>{row.from}</td>
                      <td>{row.status}</td>

                      {activeTab !== "new" && <td>{row.assignedTo}</td>}

                      <td
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={async () => {
                            try {
                              const { getEndorsementById } =
                                await import("../api/endorsementApi");
                              const data = await getEndorsementById(row.id);
                              const endorsement = data.endorsement || data;
                              const mapped = {
                                id: endorsement.id,
                                appliedOn: formatDate(endorsement.applied_on),
                                tapalNo:
                                  endorsement.tapal_no ||
                                  endorsement.tapalNo ||
                                  "",
                                piName:
                                  endorsement.pi_name ||
                                  endorsement.staff_name ||
                                  "",
                                piDesignation:
                                  endorsement.pi_designation ||
                                  endorsement.designation ||
                                  "",
                                piDept:
                                  endorsement.pi_dept ||
                                  endorsement.department ||
                                  "",
                                piCampus:
                                  endorsement.pi_campus ||
                                  endorsement.campus ||
                                  "",
                                piDob: formatDate(
                                  endorsement.pi_dob || endorsement.dob || "",
                                ),
                                piService: formatDate(
                                  endorsement.pi_dos || endorsement.dos || "",
                                ),
                                piSuperannuation: formatDate(
                                  endorsement.pi_superannuation ||
                                    endorsement.superannuation_date ||
                                    "",
                                ),
                                fundingAgency: endorsement.funding_agency || "",
                                projectScheme: endorsement.scheme || "",
                                fundingType:
                                  endorsement.funding_agency_type || "",
                                projectType: endorsement.project_type || "",
                                title:
                                  endorsement.full_project_title ||
                                  endorsement.title ||
                                  "",
                                refNo:
                                  endorsement.reference_number ||
                                  endorsement.endorsement_id ||
                                  "",
                                nonRecurring:
                                  endorsement.non_recurring ||
                                  endorsement.nonRecurring ||
                                  0,
                                recurring:
                                  endorsement.recurring ||
                                  endorsement.recurring ||
                                  0,
                                overheadPct:
                                  endorsement.overhead_percent ||
                                  endorsement.overheadPct ||
                                  0,
                                gst: endorsement.gst_added ? "yes" : "no",
                                calculatedTotal: endorsement.total_amount || 0,
                                dueDate: formatDate(
                                  endorsement.submission_due_date ||
                                    endorsement.dueDate ||
                                    "",
                                ),
                                isPIRegular: endorsement.is_pi_regular_faculty
                                  ? "yes"
                                  : "no",
                                endorsementRequired:
                                  endorsement.endorsement_required
                                    ? "yes"
                                    : "no",
                                endorsementFormat:
                                  endorsement.endorsement_format || "",
                                coPIs:
                                  (data.copi || []).map((c) => ({
                                    name: c.copi_name || c.copi_user_id,
                                    role: c.role,
                                    designation: c.copi_designation,
                                    department: c.copi_dept,
                                    campus: c.copi_campus,
                                    dob: formatDate(c.copi_dob || ""),
                                    dos: formatDate(c.copi_dos || ""),
                                    superannuation: formatDate(
                                      c.copi_superannuation || "",
                                    ),
                                  })) || [],
                                extInvs:
                                  (data.external_investigators || []).map(
                                    (ext) => ({
                                      name: ext.full_name || ext.name,
                                      designation: ext.designation,
                                      institute: ext.institute,
                                    }),
                                  ) || [],
                                files:
                                  data.documents && data.documents.length > 0
                                    ? {
                                        proposal:
                                          data.documents[0].proposal_copy,
                                        writeup:
                                          data.documents[0].signed_writeup,
                                        budget: data.documents[0].signed_budget,
                                        endorsementFile:
                                          data.documents[0]
                                            .endorsement_format_file,
                                        overhead:
                                          data.documents[0]
                                            .overhead_exemption_file,
                                      }
                                    : {},
                                status: (
                                  endorsement.status || ""
                                ).toUpperCase(),
                                transferHistory:
                                  endorsement.transfer_history || [],
                                _raw: data,
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
                          👁 View
                        </button>

                        {activeTab === "new" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setAssignItem(row)}
                          >
                            Assign
                          </button>
                        )}

                        {activeTab === "assigned" && (
                          <>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={async () => {
                                try {
                                  const [detailRes, historyRes] =
                                    await Promise.all([
                                      getEndorsementById(row.id),
                                      fetch(
                                        `http://localhost:5100/api/endorsements/assign-history/${row.id}`,
                                      ).then((res) => res.json()),
                                    ]);

                                  const endorsement =
                                    detailRes.endorsement || detailRes;
                                  const currentHistory = Array.isArray(
                                    historyRes,
                                  )
                                    ? historyRes
                                    : [];

                                  setTrackItem({
                                    ...row,
                                    piName:
                                      endorsement.pi_name || row.from || "",
                                    piDesignation:
                                      endorsement.pi_designation || "",
                                    piDept: endorsement.pi_dept || "",
                                    piCampus: endorsement.pi_campus || "",
                                    refNo:
                                      endorsement.reference_number ||
                                      row.fileNo ||
                                      "",
                                    assignedTo:
                                      endorsement.assigned_to || row.assignedTo,
                                    status: endorsement.status || row.status,
                                    transferHistory: currentHistory.map(
                                      (h) => ({
                                        from: h.assigned_from,
                                        to: h.assigned_to,
                                        date: new Date(
                                          h.created_at,
                                        ).toLocaleDateString("en-GB"),
                                        remarks: h.remarks,
                                        action: h.action,
                                      }),
                                    ),
                                  });
                                } catch (err) {
                                  console.error(
                                    "Failed to load endorsement tracking",
                                    err,
                                  );
                                  setTrackItem(row);
                                }
                              }}
                            >
                              📍 Track
                            </button>
                          </>
                        )}

                        {activeTab === "completed" && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => setReportItem(row)}
                          >
                            📄 Report
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div
            className="pagination"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 0",
            }}
          >
            <button
              className="btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>

          <div className="table-footer">{currentData.length} Records</div>
        </div>
      </div>

      {selected && (
        <EndorsementDetailModal
          item={selected}
          readOnly={true}
          onClose={() => setSelected(null)}
        />
      )}

      {assignItem && (
        <AssignModal
          item={assignItem}
          onClose={() => setAssignItem(null)}
          onAssign={handleAssign}
        />
      )}

      {trackItem && (
        <TrackModal item={trackItem} onClose={() => setTrackItem(null)} />
      )}

      {reportItem && (
        <IndividualReportModal
          item={reportItem}
          onClose={() => setReportItem(null)}
        />
      )}

      {showOverallReport && (
        <OverallReportModal
          endorsements={endorsements}
          onClose={() => setShowOverallReport(false)}
        />
      )}
    </div>
  );
}
