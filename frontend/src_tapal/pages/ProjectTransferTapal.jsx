// PATH: CSRC_OFFICE/frontend/src_tapal/pages/ProjectTransferTapal.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AssignModalPT from "./AssignModalPT";
import TrackModalPT from "./TrackModalPT";
import ProjectTransferDetailModalPT from "./ProjectTransferDetailModalPT";
import ProjectTransferIndividualReportModalPT from "./ProjectTransferIndividualReportModalPT";
import ProjectTransferOverallReportModalPT from "./ProjectTransferOverallReportModalPT";

const API = "http://localhost:5100/api/project-transfer";

const SUB_TABS = [
  {
    key: "pending",
    label: "Pending Transfers",
    icon: "⏳",
    color: "#92400e",
    bg: "#fef3c7",
  },
  {
    key: "assigned",
    label: "Assigned Transfers",
    icon: "📌",
    color: "#1e40af",
    bg: "#dbeafe",
  },
  {
    key: "completed",
    label: "Completed Transfers",
    icon: "✅",
    color: "#166534",
    bg: "#dcfce7",
  },
];

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
};

const StatusBadge = ({ status }) => {
  const map = {
    accepted_by_faculty: {
      label: "Accepted by Faculty",
      color: "#1e40af",
      bg: "#dbeafe",
    },
    assigned: { label: "Assigned", color: "#166534", bg: "#dcfce7" },
    assigned_supervisor: {
      label: "With Supervisor",
      color: "#5b21b6",
      bg: "#ede9fe",
    },
    assigned_dd: { label: "With DD", color: "#92400e", bg: "#fef3c7" },
    assigned_director: {
      label: "With Director",
      color: "#065f46",
      bg: "#d1fae5",
    },
    completed: { label: "Completed", color: "#166534", bg: "#dcfce7" },
  };
  const s = map[status] || { label: status, color: "#374151", bg: "#f3f4f6" };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "DM Sans, sans-serif",
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
};

function ProjectTransferSection() {
  const [activeTab, setActiveTab] = useState("pending");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [assignItem, setAssignItem] = useState(null);
  const [trackItem, setTrackItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [reportItem, setReportItem] = useState(null);
  const [overallReportOpen, setOverallReportOpen] = useState(false);

  const loadRows = async (tab) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tapal/${tab}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(activeTab);
  }, [activeTab]);

  const handleAssign = async (id, staff, remarks) => {
    try {
      await fetch(`${API}/tapal/${id}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to_name: staff.name,
          assigned_to_role: staff.role,
          remarks,
        }),
      });
      setAssignItem(null);
      loadRows(activeTab);
    } catch (err) {
      console.error(err);
      alert("Failed to assign");
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this transfer as completed?")) return;
    try {
      await fetch(`${API}/tapal/${id}/complete`, { method: "PUT" });
      loadRows(activeTab);
    } catch (err) {
      console.error(err);
      alert("Failed to complete");
    }
  };

  const filtered = rows.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.from_name?.toLowerCase().includes(q) ||
      item.to_name?.toLowerCase().includes(q) ||
      item.funding_agency?.toLowerCase().includes(q) ||
      String(item.id).includes(q)
    );
  });

  const viewSignedLetter = (t) => {
    if (!t.letter_path) return;
    const normalized = t.letter_path.replace(/\\/g, "/");
    const idx = normalized.indexOf("uploads/");
    const rel = idx !== -1 ? normalized.slice(idx) : normalized;
    window.open(`http://localhost:5100/${rel}`, "_blank");
  };

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
              {activeTab === "pending" &&
                "Project transfers accepted by faculty — awaiting staff assignment"}
              {activeTab === "assigned" &&
                "Project transfers under active processing"}
              {activeTab === "completed" && "Fully processed project transfers"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
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
                <th>ID</th>
                <th>File No</th>
                <th>Project Title</th>
                <th>From PI</th>
                <th>To PI</th>
                <th>Agency</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{
                      textAlign: "center",
                      padding: "26px 0",
                      color: "#9ca3af",
                    }}
                  >
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{
                      textAlign: "center",
                      padding: "26px 0",
                      color: "#9ca3af",
                    }}
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>PT-{row.id}</td>
                    <td>{row.file_no || "—"}</td>
                    <td
                      style={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.title}
                    </td>
                    <td>
                      {row.from_name}
                      <br />
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {row.from_dept}
                      </span>
                    </td>
                    <td>
                      {row.to_name}
                      <br />
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {row.to_dept}
                      </span>
                    </td>
                    <td>{row.funding_agency}</td>
                    <td>{fmtDate(row.letter_upload_date || row.created_at)}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setViewItem(row)}
                      >
                        View
                      </button>

                      {row.letter_path && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => viewSignedLetter(row)}
                        >
                          📄 Letter
                        </button>
                      )}

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
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleComplete(row.id)}
                          >
                            Complete
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">{filtered.length} records</div>
      </div>

      {assignItem && (
        <AssignModalPT
          item={assignItem}
          onClose={() => setAssignItem(null)}
          onAssign={handleAssign}
        />
      )}

      {trackItem && (
        <TrackModalPT item={trackItem} onClose={() => setTrackItem(null)} />
      )}

      {viewItem && (
        <ProjectTransferDetailModalPT
          item={viewItem}
          onClose={() => setViewItem(null)}
        />
      )}

      {reportItem && (
        <ProjectTransferIndividualReportModalPT
          item={reportItem}
          onClose={() => setReportItem(null)}
        />
      )}

      {overallReportOpen && (
        <ProjectTransferOverallReportModalPT
          requests={rows}
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
