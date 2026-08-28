import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RequestTapal.css";
import AssignModalRT from "./AssignModalRT";
import TrackModalRT from "./TrackModalRT";
import RequestIndividualReportModalRT from "./RequestIndividualReportModalRT";
import RequestDetailModalRT from "./RequestDetailModalRT";
import RequestOverallReportModalRT from "./RequestOverallReportModalRT";
import {
  getPendingReappropriations,
  getAssignedReappropriations,
  getCompletedReappropriations,
  assignReappropriation,
  getReappropriationById,
  getExtensionById,
  getPendingExtensions,
  getAssignedExtensions,
  getCompletedExtensions,
  assignExtension,
} from "../api/tapalApi";
const REQUEST_TYPES = [
  {
    key: "reappropriation",
    label: "Reappropriation Requests",
    icon: "🔀",
    description: "Requests to reallocate funds between budget heads",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    border: "#ddd6fe",
  },
  {
    key: "extension",
    label: "Project Extension Requests",
    icon: "📅",
    description: "Requests for extending the duration of ongoing projects",
    color: "#be185d",
    bg: "linear-gradient(135deg,#fce7f3,#fdf2f8)",
    border: "#fbcfe8",
  },
];

const DUMMY_REQUESTS = [
  {
    id: 1001,
    requestType: "REAPPROPRIATION",
    projectTitle: "Development of Ti(C,N) Based Cermets",
    piName: "Dr. S. Balasivanandha Prabu",
    agency: "SERB",
    fromHead: "Equipment",
    toHead: "Consumables",
    amount: 51000,
    installment: "2",
    headType: "Recurring",
    date: "05-06-2026",
    status: "PENDING",
  },

  {
    id: 1002,
    requestType: "EXTENSION",
    projectTitle: "AI Driven Drug Discovery",
    piName: "Dr. P. Anbalagan",
    agency: "DST",
    originalEndDate: "01-07-2026",
    revisedEndDate: "01-01-2027",
    extensionPeriod: "6 Months",
    reason: "Project activities pending",
    date: "04-06-2026",
    status: "PENDING",
  },
];

const TABS = [
  {
    key: "pending",
    label: "Pending Requests",
    icon: "⏳",
  },
  {
    key: "assigned",
    label: "Assigned Requests",
    icon: "📌",
  },
  {
    key: "completed",
    label: "Completed Requests",
    icon: "✅",
  },
];

export default function RequestTapal() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [assignItem, setAssignItem] = useState(null);
  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("pending");

  const [trackItem, setTrackItem] = useState(null);

  const [reportItem, setReportItem] = useState(null);

  const [viewItem, setViewItem] = useState(null);

  const [overallReportOpen, setOverallReportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, selected]);

  useEffect(() => {
    async function loadRequests() {
      try {
        const [
          pendingReapp,
          assignedReapp,
          completedReapp,
          pendingExt,
          assignedExt,
          completedExt,
        ] = await Promise.all([
          getPendingReappropriations(),
          getAssignedReappropriations(),
          getCompletedReappropriations(),
          getPendingExtensions(),
          getAssignedExtensions(),
          getCompletedExtensions(),
        ]);
        console.log("pendingExt:", pendingExt);
        console.log("pendingReapp:", pendingReapp);
        const mapReapp = (item, status) => ({
          id: item.reappropriation_id,
          requestType: "REAPPROPRIATION",
          projectTitle: item.project_title || "",
          piName: item.pi_name || "",
          agency: item.funding_agency || "",
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-GB")
            : "",
          status,
          assignedTo: item.assigned_to || null,
        });

        const mapExt = (item, status) => ({
          id: item.id,
          requestType: "EXTENSION",
          projectTitle: item.project_title || "",
          piName: item.pi_name || "",
          agency: item.funding_agency || "",
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-GB")
            : "",
          status,
          assignedTo: item.assigned_to || null,
          originalEndDate: item.original_end_date
            ? new Date(item.original_end_date).toLocaleDateString("en-GB")
            : "",
          revisedEndDate: item.revised_end_date
            ? new Date(item.revised_end_date).toLocaleDateString("en-GB")
            : "",
          extensionPeriod: item.extension_period || "",
          reason: item.reason || "",
        });

        setRequests([
          ...(Array.isArray(pendingReapp)
            ? pendingReapp.map((i) => mapReapp(i, "PENDING"))
            : []),
          ...(Array.isArray(assignedReapp)
            ? assignedReapp.map((i) => mapReapp(i, "ASSIGNED"))
            : []),
          ...(Array.isArray(completedReapp)
            ? completedReapp.map((i) => mapReapp(i, "COMPLETED"))
            : []),
          ...(Array.isArray(pendingExt)
            ? pendingExt.map((i) => mapExt(i, "PENDING"))
            : []),
          ...(Array.isArray(assignedExt)
            ? assignedExt.map((i) => mapExt(i, "ASSIGNED"))
            : []),
          ...(Array.isArray(completedExt)
            ? completedExt.map((i) => mapExt(i, "COMPLETED"))
            : []),
        ]);
      } catch (err) {
        console.error("Failed to load requests", err);
      }
    }
    loadRequests();
  }, []);
  const handleAssign = async (id, staff, remarks) => {
    try {
      const item = requests.find((r) => r.id === id);
      if (item?.requestType === "EXTENSION") {
        await assignExtension(id, staff.name, remarks);
      } else {
        await assignReappropriation(id, staff.name, remarks);
      }
    } catch (err) {
      console.error("Failed to save assignment", err);
    }
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    setRequests((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "ASSIGNED",
              assignedTo: staff.name,
              assignedDate: today,
              remarks,
            }
          : item,
      ),
    );
    setAssignItem(null);
  };

  const handleComplete = (id) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    setRequests((prev) =>
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

  const filtered = requests.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.projectTitle?.toLowerCase().includes(q) ||
      item.piName?.toLowerCase().includes(q) ||
      item.agency?.toLowerCase().includes(q) ||
      String(item.id).includes(q)
    );
  });

  const currentTabData = filtered.filter((item) => {
    const statusMatch =
      activeTab === "pending"
        ? item.status === "PENDING"
        : activeTab === "assigned"
          ? item.status === "ASSIGNED"
          : item.status === "COMPLETED";

    const typeMatch =
      selected === "reappropriation"
        ? item.requestType === "REAPPROPRIATION"
        : item.requestType === "EXTENSION";

    return statusMatch && typeMatch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(currentTabData.length / rowsPerPage),
  );
  const currentRows = currentTabData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="page-body">
      <div className="page-stack">
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() =>
              selected ? setSelected(null) : navigate("/tapal/projects")
            }
            style={{ marginBottom: 14 }}
          >
            ← {selected ? "Back to Request Types" : "Back to Projects"}
          </button>
          <div className="page-title">Request Tapals</div>
          <div className="page-subtitle">
            {selected
              ? REQUEST_TYPES.find((r) => r.key === selected)?.label
              : "Select a request type to continue"}
          </div>
          {selected && (
            <>
              <div style={{ marginTop: 20 }}>
                <input
                  type="text"
                  placeholder="Search Requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    className={`tab-btn ${
                      activeTab === tab.key ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {!selected && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 22,
            }}
          >
            {REQUEST_TYPES.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelected(type.key)}
                style={{
                  background: type.bg,
                  border: `1.5px solid ${type.border}`,
                  borderRadius: 22,
                  padding: "30px 26px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 18px 40px ${type.border}aa`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 42, marginBottom: 14 }}>
                  {type.icon}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: type.color,
                    marginBottom: 6,
                  }}
                >
                  {type.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#4b5563",
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {type.description}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: type.color,
                    fontSize: 13.5,
                    fontWeight: 800,
                  }}
                >
                  Open <span style={{ fontSize: 16 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="card">
            <div className="card-header">
              <div>
                <h3>
                  {activeTab === "pending" && "Pending Requests"}
                  {activeTab === "assigned" && "Assigned Requests"}
                  {activeTab === "completed" && "Completed Requests"}
                </h3>
              </div>

              {activeTab === "completed" && (
                <button
                  className="btn btn-primary"
                  onClick={() => setOverallReportOpen(true)}
                >
                  Overall Report
                </button>
              )}
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sl.No.</th>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Project</th>
                    <th>PI</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRows
                    .filter((r) =>
                      selected === "reappropriation"
                        ? r.requestType === "REAPPROPRIATION"
                        : r.requestType === "EXTENSION",
                    )
                    .map((row, index) => (
                      <tr key={row.id}>
                        <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                        <td>{row.id}</td>
                        <td>{row.requestType}</td>
                        <td>{row.projectTitle}</td>
                        <td>{row.piName}</td>
                        <td>{row.date}</td>
                        <td>{row.status}</td>

                        <td>
                          <div
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
                                  if (row.requestType === "EXTENSION") {
                                    const r = await getExtensionById(row.id);
                                    setViewItem({
                                      id: r.id,
                                      requestType: "EXTENSION",
                                      projectTitle: r.project_title || "",
                                      piName: r.pi_name || "",
                                      agency: r.funding_agency || "",
                                      date: r.created_at
                                        ? new Date(
                                            r.created_at,
                                          ).toLocaleDateString("en-GB")
                                        : "",
                                      status: r.status || "",
                                      assignedTo: r.assigned_to || "",
                                      originalEndDate: r.original_end_date
                                        ? new Date(
                                            r.original_end_date,
                                          ).toLocaleDateString("en-GB")
                                        : "",
                                      revisedEndDate: r.revised_end_date
                                        ? new Date(
                                            r.revised_end_date,
                                          ).toLocaleDateString("en-GB")
                                        : "",
                                      extensionPeriod: r.extension_period || "",
                                      reason: r.reason || "",
                                    });
                                  } else {
                                    const data = await getReappropriationById(
                                      row.id,
                                    );
                                    const r = data.request;
                                    const details = data.details || [];
                                    setViewItem({
                                      id: r.reappropriation_id,
                                      requestType: "REAPPROPRIATION",
                                      projectTitle: r.project_title || "",
                                      piName: r.pi_name || "",
                                      agency: r.funding_agency || "",
                                      date: r.created_at
                                        ? new Date(
                                            r.created_at,
                                          ).toLocaleDateString("en-GB")
                                        : "",
                                      status: r.status || "",
                                      assignedTo: r.assigned_to || "",
                                      installment: r.installment || "",
                                      headType:
                                        details[0]?.head_type || "Recurring",
                                      fromHead: details[0]?.from_head || "",
                                      toHead: details[0]?.to_head || "",
                                      amount: details[0]?.amount || 0,
                                    });
                                  }
                                } catch (err) {
                                  console.error(
                                    "Failed to load request details",
                                    err,
                                  );
                                  setViewItem(row);
                                }
                              }}
                            >
                              View
                            </button>

                            {activeTab === "pending" && (
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
                                  onClick={() => setTrackItem(row)}
                                >
                                  Track
                                </button>
                              </>
                            )}

                            {activeTab === "completed" && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => setReportItem(row)}
                              >
                                Report
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
            <div className="table-footer">{currentTabData.length} records</div>
          </div>
        )}

        {assignItem && (
          <AssignModalRT
            item={assignItem}
            onClose={() => setAssignItem(null)}
            onAssign={handleAssign}
          />
        )}

        {trackItem && (
          <TrackModalRT item={trackItem} onClose={() => setTrackItem(null)} />
        )}

        {reportItem && (
          <RequestIndividualReportModalRT
            item={reportItem}
            onClose={() => setReportItem(null)}
          />
        )}

        {viewItem && (
          <RequestDetailModalRT
            item={viewItem}
            onClose={() => setViewItem(null)}
          />
        )}

        {overallReportOpen && (
          <RequestOverallReportModalRT
            requests={requests}
            onClose={() => setOverallReportOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
