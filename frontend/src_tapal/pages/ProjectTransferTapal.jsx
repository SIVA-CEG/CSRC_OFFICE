// PATH: CSRC_OFFICE/frontend/src_tapal/pages/ProjectTransferTapal.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AssignModalPT from "./AssignModalPT";
import TrackModalPT from "./TrackModalPT";
import ProjectTransferDetailModalPT from "./ProjectTransferDetailModalPT";
import ProjectTransferIndividualReportModalPT from "./ProjectTransferIndividualReportModalPT";
import ProjectTransferOverallReportModalPT from "./ProjectTransferOverallReportModalPT";

const SUB_TABS = [
  { key: "pending", label: "Pending Transfers", icon: "⏳", color: "#92400e", bg: "#fef3c7" },
  { key: "assigned", label: "Assigned Transfers", icon: "📌", color: "#1e40af", bg: "#dbeafe" },
  { key: "completed", label: "Completed Transfers", icon: "✅", color: "#166534", bg: "#dcfce7" },
];

// Dummy data mirrors the shape produced once a faculty-side transfer is
// accepted (see ProjectTransferRequests.jsx DUMMY_TRANSFERS) — the tapal
// system picks it up from there for staff assignment/tracking.
const DUMMY_TRANSFERS = [
  {
    id: 3001,
    fileNo: "CSRC/PRJ/2024/0021",
    projectTitle: "AI-Based Crop Disease Detection System",
    fromFacultyName: "Dr. M. Kumar",
    fromFacultyDept: "Dept. of CSE",
    toFacultyName: "Dr. R. Anand",
    toFacultyDept: "Dept. of IT",
    agency: "DST",
    totalAmount: 1850000,
    submittedDate: "01-07-2026",
    status: "PENDING",
    remarks: "Relocating to a new department; requesting smooth handover of ongoing grant.",
  },
  {
    id: 3002,
    fileNo: "CSRC/PRJ/2023/0087",
    projectTitle: "Low-Cost Water Quality Sensor Network",
    fromFacultyName: "Dr. S. Priya",
    fromFacultyDept: "Dept. of Civil Engg.",
    toFacultyName: "Dr. M. Kumar",
    toFacultyDept: "Dept. of CSE",
    agency: "SERB",
    totalAmount: 1200000,
    submittedDate: "28-06-2026",
    status: "PENDING",
    remarks: "Co-PI taking over as sole PI following faculty transfer.",
  },
];

function ProjectTransferSection() {
  const [requests, setRequests] = useState(DUMMY_TRANSFERS);
  const [activeTab, setActiveTab] = useState("pending");

  const [assignItem, setAssignItem] = useState(null);
  const [trackItem, setTrackItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [reportItem, setReportItem] = useState(null);
  const [overallReportOpen, setOverallReportOpen] = useState(false);

  const [search, setSearch] = useState("");

  const handleAssign = (id, staff, remarks) => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    setRequests((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "ASSIGNED",
              assignedTo: staff.name,
              assignedDate: today,
              remarks: remarks || item.remarks,
              transferHistory: [
                ...(item.transferHistory || []),
                {
                  from: "Project Transfer Tapal",
                  to: staff.name,
                  date: today,
                  remarks: remarks || "Assigned for processing",
                },
              ],
            }
          : item
      )
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
              transferHistory: [
                ...(item.transferHistory || []),
                {
                  from: item.assignedTo || "Assigned Staff",
                  to: "Completed",
                  date: today,
                  remarks: "Project transfer processing completed",
                },
              ],
            }
          : item
      )
    );
  };

  const filteredRequests = requests.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.projectTitle?.toLowerCase().includes(q) ||
      item.fromFacultyName?.toLowerCase().includes(q) ||
      item.toFacultyName?.toLowerCase().includes(q) ||
      item.agency?.toLowerCase().includes(q) ||
      String(item.id).includes(q)
    );
  });

  const rowsForTab = filteredRequests.filter((item) => {
    if (activeTab === "pending") return item.status === "PENDING";
    if (activeTab === "assigned") return item.status === "ASSIGNED";
    return item.status === "COMPLETED";
  });

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search project transfers..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 18px",
              borderRadius: 14,
              border: `1.5px solid ${activeTab === tab.key ? "var(--primary)" : "var(--border)"}`,
              background: activeTab === tab.key
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
              boxShadow: activeTab === tab.key ? "0 6px 16px rgba(15,118,110,0.12)" : "none",
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
              {activeTab === "pending" && "Project transfers awaiting staff assignment"}
              {activeTab === "assigned" && "Project transfers under active processing"}
              {activeTab === "completed" && "Fully processed project transfers"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {activeTab === "completed" && (
              <button className="btn btn-primary btn-sm" onClick={() => setOverallReportOpen(true)}>
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
                <th>File No</th>
                <th>Project Title</th>
                <th>From PI</th>
                <th>To PI</th>
                <th>Agency</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rowsForTab.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "26px 0", color: "#9ca3af" }}>
                    No records found.
                  </td>
                </tr>
              ) : (
                rowsForTab.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.id}</td>
                    <td>{row.fileNo}</td>
                    <td>{row.projectTitle}</td>
                    <td>{row.fromFacultyName}</td>
                    <td>{row.toFacultyName}</td>
                    <td>{row.agency}</td>
                    <td>{row.submittedDate}</td>
                    <td>{row.status}</td>
                    <td style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setViewItem(row)}>
                        View
                      </button>

                      {activeTab === "pending" && (
                        <button className="btn btn-primary btn-sm" onClick={() => setAssignItem(row)}>
                          Assign
                        </button>
                      )}

                      {activeTab === "assigned" && (
                        <>
                          <button className="btn btn-outline btn-sm" onClick={() => setTrackItem(row)}>
                            Track
                          </button>
                          <button className="btn btn-success btn-sm" onClick={() => handleComplete(row.id)}>
                            Complete
                          </button>
                        </>
                      )}

                      {activeTab === "completed" && (
                        <button className="btn btn-warning btn-sm" onClick={() => setReportItem(row)}>
                          Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">{rowsForTab.length} records</div>
      </div>

      {assignItem && (
        <AssignModalPT item={assignItem} onClose={() => setAssignItem(null)} onAssign={handleAssign} />
      )}

      {trackItem && <TrackModalPT item={trackItem} onClose={() => setTrackItem(null)} />}

      {viewItem && (
        <ProjectTransferDetailModalPT item={viewItem} onClose={() => setViewItem(null)} />
      )}

      {reportItem && (
        <ProjectTransferIndividualReportModalPT item={reportItem} onClose={() => setReportItem(null)} />
      )}

      {overallReportOpen && (
        <ProjectTransferOverallReportModalPT
          requests={requests}
          onClose={() => setOverallReportOpen(false)}
        />
      )}
    </div>
  );
}

export default function ProjectTransferTapal() {
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

          <div className="page-title">Project Transfer Tapals</div>
          <div className="page-subtitle">
            Manage PI-to-PI project transfer requests across all stages
          </div>
        </div>

        <ProjectTransferSection />
      </div>
    </div>
  );
}