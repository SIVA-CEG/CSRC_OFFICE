import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssignModalST from "./AssignModalST";
import TrackModalST from "./TrackModalST";
import SanctionDetailModalST from "./SanctionDetailModalST";
import SanctionIndividualReportModalST from "./SanctionIndividualReportModalST";
import SanctionOverallReportModalST from "./SanctionOverallReportModalST";
import {
  getPendingSanctions,
  getAssignedSanctions,
  getCompletedSanctions,
  assignSanction,
} from "../api/tapalApi";

const SUB_TABS = [
  {
    key: "pending",
    label: "Pending Sanctions",
    icon: "⏳",
    color: "#92400e",
    bg: "#fef3c7",
  },
  {
    key: "assigned",
    label: "Assigned Sanctions",
    icon: "📌",
    color: "#1e40af",
    bg: "#dbeafe",
  },
  {
    key: "completed",
    label: "Completed Sanctions",
    icon: "✅",
    color: "#166534",
    bg: "#dcfce7",
  },
];

const DUMMY_SANCTIONS = [
  {
    id: 2001,
    requestType: "SANCTION",

    projectTitle: "Development of Ti(C,N) Based Cermets",

    piName: "Dr. S. Balasivanandha Prabu",

    agency: "SERB",

    totalAmount: 4364360,

    proceedingNo: "CSRC/2026/001",

    submittedDate: "05-06-2026",

    status: "PENDING",

    installments: [
      {
        name: "1st Installment",
        amount: 2510000,
      },
      {
        name: "2nd Installment",
        amount: 1864360,
      },
    ],
  },

  {
    id: 2002,

    requestType: "SANCTION",

    projectTitle: "AI Driven Drug Discovery",

    piName: "Dr. P. Anbalagan",

    agency: "DST",

    totalAmount: 2510000,

    proceedingNo: "CSRC/2026/002",

    submittedDate: "06-06-2026",

    status: "PENDING",
  },
];

function SanctionSection() {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    async function loadSanctions() {
      try {
        const [pending, assigned, completed] = await Promise.all([
          getPendingSanctions(),
          getAssignedSanctions(),
          getCompletedSanctions(),
        ]);
        console.log("Raw pending:", pending[0]);
        const mappedPending = Array.isArray(pending)
          ? pending.map((item) => ({
              id: item.id,
              projectTitle: item.project_title || "",
              piName: item.pi_name || "",
              agency: item.funding_agency || "",
              submittedDate: item.created_at
                ? new Date(item.created_at).toLocaleDateString("en-GB")
                : "",
              status: "PENDING",
              assignedTo: null,
              totalAmount: parseFloat(item.total_amount) || 0,
              installments: [
                {
                  name: item.installment || "Installment",
                  amount: parseFloat(item.total_amount) || 0,
                },
              ],
            }))
          : [];

        const mappedAssigned = Array.isArray(assigned)
          ? assigned.map((item) => ({
              id: item.id,
              projectTitle: item.project_title || "",
              piName: item.pi_name || "",
              agency: item.funding_agency || "",
              submittedDate: item.created_at
                ? new Date(item.created_at).toLocaleDateString("en-GB")
                : "",
              status: "ASSIGNED",
              assignedTo: item.assigned_to || "",
              totalAmount: parseFloat(item.total_amount) || 0,
              installments: [
                {
                  name: item.installment || "Installment",
                  amount: parseFloat(item.total_amount) || 0,
                },
              ],
            }))
          : [];

        const mappedCompleted = Array.isArray(completed)
          ? completed.map((item) => ({
              id: item.id,
              projectTitle: item.project_title || "",
              piName: item.pi_name || "",
              agency: item.funding_agency || "",
              submittedDate: item.created_at
                ? new Date(item.created_at).toLocaleDateString("en-GB")
                : "",
              status: "COMPLETED",
              assignedTo: item.assigned_to || "",
              totalAmount: parseFloat(item.total_amount) || 0,
              installments: [
                {
                  name: item.installment || "Installment",
                  amount: parseFloat(item.total_amount) || 0,
                },
              ],
            }))
          : [];

        setRequests([...mappedPending, ...mappedAssigned, ...mappedCompleted]);
      } catch (err) {
        console.error("Failed to load sanctions", err);
      }
    }
    loadSanctions();
  }, []);
  const [activeTab, setActiveTab] = useState("pending");

  const [assignItem, setAssignItem] = useState(null);

  const [trackItem, setTrackItem] = useState(null);

  const [viewItem, setViewItem] = useState(null);

  const [reportItem, setReportItem] = useState(null);

  const [overallReportOpen, setOverallReportOpen] = useState(false);

  const [search, setSearch] = useState("");

  const handleAssign = async (id, staff, remarks) => {
    try {
      await assignSanction(id, staff.name, remarks);
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
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);
  const handleComplete = (id) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    setRequests((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "COMPLETED",
              completedDate: today,

              transferHistory: [
                ...(item.transferHistory || []),

                {
                  from: item.assignedTo || "Assigned Staff",

                  to: "Completed",

                  date: today,

                  remarks: "Sanction completed",
                },
              ],
            }
          : item,
      ),
    );
  };

  const filteredRequests = requests.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.projectTitle?.toLowerCase().includes(q) ||
      item.piName?.toLowerCase().includes(q) ||
      item.agency?.toLowerCase().includes(q) ||
      String(item.id).includes(q)
    );
  });
  const currentTabData = filteredRequests.filter((item) => {
    if (activeTab === "pending") return item.status === "PENDING";
    if (activeTab === "assigned") return item.status === "ASSIGNED";
    return item.status === "COMPLETED";
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
    <div style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search sanctions..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Sub-tabs */}
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}
      >
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 18px",
              borderRadius: 14,
              border: `1.5px solid ${activeTab === tab.key ? "var(--primary)" : "var(--border)"}`,
              background:
                activeTab === tab.key
                  ? "linear-gradient(135deg,#ccfbf1,#f0fdfa)"
                  : "#ffffff",
              color: activeTab === tab.key ? "var(--primary-dark)" : "#4b5563",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease",
              boxShadow:
                activeTab === tab.key
                  ? "0 6px 16px rgba(15,118,110,0.12)"
                  : "none",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ margin: 0 }}>
        <div className="card-header">
          <div>
            <h3>{SUB_TABS.find((t) => t.key === activeTab)?.label}</h3>
            <p>
              {activeTab === "pending" && "Sanction tapals awaiting processing"}
              {activeTab === "assigned" &&
                "Sanction tapals under active review"}
              {activeTab === "completed" && "Fully processed sanction tapals"}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            {activeTab === "completed" && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setOverallReportOpen(true)}
              >
                Overall Report
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sl.No.</th>
                <th>Tapal ID</th>
                <th>Project Title</th>
                <th>PI Name</th>
                <th>Agency</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td>{row.id}</td>
                  <td>{row.projectTitle}</td>
                  <td>{row.piName}</td>
                  <td>{row.agency}</td>
                  <td>{row.submittedDate}</td>
                  <td>{row.status}</td>

                  <td
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setViewItem(row)}
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
        <div className="table-footer">{currentTabData.length} records</div>
      </div>

      {assignItem && (
        <AssignModalST
          item={assignItem}
          onClose={() => setAssignItem(null)}
          onAssign={handleAssign}
        />
      )}

      {trackItem && (
        <TrackModalST item={trackItem} onClose={() => setTrackItem(null)} />
      )}

      {viewItem && (
        <SanctionDetailModalST
          item={viewItem}
          onClose={() => setViewItem(null)}
        />
      )}

      {reportItem && (
        <SanctionIndividualReportModalST
          item={reportItem}
          onClose={() => setReportItem(null)}
        />
      )}

      {overallReportOpen && (
        <SanctionOverallReportModalST
          requests={requests}
          onClose={() => setOverallReportOpen(false)}
        />
      )}
    </div>
  );
}

export default function SanctionTapal() {
  const navigate = useNavigate();

  return (
    <div className="page-body">
      <div className="page-stack">
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/tapal/projects")}
            style={{ marginBottom: 14 }}
          >
            ← Back to Projects
          </button>

          <div className="page-title">Project Sanction Tapals</div>

          <div className="page-subtitle">
            Manage project sanction tapals across all stages
          </div>
        </div>

        <SanctionSection />
      </div>
    </div>
  );
}
