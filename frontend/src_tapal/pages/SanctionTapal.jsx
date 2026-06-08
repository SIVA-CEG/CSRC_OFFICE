import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AssignModalST from "./AssignModalST";
import TrackModalST from "./TrackModalST";
import SanctionDetailModalST from "./SanctionDetailModalST";
import SanctionIndividualReportModalST from "./SanctionIndividualReportModalST";
import SanctionOverallReportModalST from "./SanctionOverallReportModalST";


const SUB_TABS = [
  { key: "pending", label: "Pending Sanctions", icon: "⏳", color: "#92400e", bg: "#fef3c7" },
  { key: "assigned", label: "Assigned Sanctions", icon: "📌", color: "#1e40af", bg: "#dbeafe" },
  { key: "completed", label: "Completed Sanctions", icon: "✅", color: "#166534", bg: "#dcfce7" },
];

const DUMMY_SANCTIONS = [
  {
    id: 2001,
    requestType: "SANCTION",

    projectTitle:
      "Development of Ti(C,N) Based Cermets",

    piName:
      "Dr. S. Balasivanandha Prabu",

    agency: "SERB",

    totalAmount: 4364360,

    proceedingNo:
      "CSRC/2026/001",

    submittedDate:
      "05-06-2026",

    status: "PENDING",

    installments: [
      {
        name: "1st Installment",
        amount: 2500000,
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

    projectTitle:
      "AI Driven Drug Discovery",

    piName:
      "Dr. P. Anbalagan",

    agency: "DST",

    totalAmount: 2500000,

    proceedingNo:
      "CSRC/2026/002",

    submittedDate:
      "06-06-2026",

    status: "PENDING",
  },
];

function SanctionSection() {

  const [requests, setRequests] =
  useState(DUMMY_SANCTIONS);

const [activeTab, setActiveTab] =
  useState("pending");

const [assignItem, setAssignItem] =
  useState(null);

const [trackItem, setTrackItem] =
  useState(null);

const [viewItem, setViewItem] =
  useState(null);

const [reportItem, setReportItem] =
  useState(null);

const [
  overallReportOpen,
  setOverallReportOpen
] = useState(false);

const [search, setSearch] =
  useState("");


const handleAssign = (
  id,
  staff,
  remarks
) => {
  const today = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  setRequests((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "ASSIGNED",
            assignedTo: staff.name,
            assignedDate: today,
            remarks,

            transferHistory: [
              ...(item.transferHistory || []),

              {
                from: "Sanction Tapal",
                to: staff.name,
                date: today,
                remarks:
                  remarks ||
                  "Assigned for processing",
              },
            ],
          }
        : item
    )
  );

  setAssignItem(null);
};



const handleComplete = (id) => {
  const today = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

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
                from:
                  item.assignedTo ||
                  "Assigned Staff",

                to: "Completed",

                date: today,

                remarks:
                  "Sanction completed",
              },
            ],
          }
        : item
    )
  );
};


const filteredRequests =
  requests.filter((item) => {
    const q =
      search.toLowerCase();

    return (
      item.projectTitle
        ?.toLowerCase()
        .includes(q) ||
      item.piName
        ?.toLowerCase()
        .includes(q) ||
      item.agency
        ?.toLowerCase()
        .includes(q) ||
      String(item.id).includes(q)
    );
  });




  return (
    <div style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16 }}>
  <input
    type="text"
    placeholder="Search sanctions..."
    className="search-input"
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
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
            <h3>
              {SUB_TABS.find((t) => t.key === activeTab)?.label}
            </h3>
            <p>
              {activeTab === "pending" && "Sanction tapals awaiting processing"}
              {activeTab === "assigned" && "Sanction tapals under active review"}
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
      onClick={() =>
        setOverallReportOpen(true)
      }
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
  {filteredRequests
    .filter((item) => {
      if (activeTab === "pending")
        return item.status === "PENDING";

      if (activeTab === "assigned")
        return item.status === "ASSIGNED";

      return item.status === "COMPLETED";
    })
    .map((row, index) => (
      <tr key={row.id}>
        <td>{index + 1}</td>
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

              <button
                className="btn btn-success btn-sm"
                onClick={() =>
                  handleComplete(row.id)
                }
              >
                Complete
              </button>
            </>
          )}

          {activeTab === "completed" && (
            <button
              className="btn btn-warning btn-sm"
              onClick={() =>
                setReportItem(row)
              }
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
        <div className="table-footer">
  {
    requests.filter((item) => {
      if (activeTab === "pending")
        return item.status === "PENDING";

      if (activeTab === "assigned")
        return item.status === "ASSIGNED";

      return item.status === "COMPLETED";
    }).length
  } records
</div>
      </div>

      {assignItem && (
  <AssignModalST
    item={assignItem}
    onClose={() => setAssignItem(null)}
    onAssign={handleAssign}
  />
)}

{trackItem && (
  <TrackModalST
    item={trackItem}
    onClose={() => setTrackItem(null)}
  />
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
    onClose={() =>
      setOverallReportOpen(false)
    }
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

        <div className="page-title">
          Project Sanction Tapals
        </div>

        <div className="page-subtitle">
          Manage project sanction tapals across all stages
        </div>
      </div>

      <SanctionSection />

      
    </div>
  </div>
);
}