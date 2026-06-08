import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EndorsementDetailModal from "./EndorsementDetailModal";
import AssignModal from "./AssignModal";
import TrackModal from "./TrackModal";
import IndividualReportModal from "./IndividualReportModal";
import OverallReportModal from "./OverallReportModal";


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

export default function EndorsementTapal() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const [endorsements, setEndorsements] = useState(DUMMY_DATA);
  const [assignItem, setAssignItem] =
  useState(null);
  const [trackItem, setTrackItem] =
  useState(null);

  const [reportItem,
setReportItem] =
useState(null);

const [
  showOverallReport,
  setShowOverallReport,
] = useState(false);

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

  const newItems = filtered.filter((x) => x.status === "PENDING");
  const assignedItems = filtered.filter((x) => x.status === "ASSIGNED");
  const completedItems = filtered.filter((x) => x.status === "COMPLETED");

  const currentData =
    activeTab === "new"
      ? newItems
      : activeTab === "assigned"
      ? assignedItems
      : completedItems;

  const handleAssign = (
  id,
  staff,
  remarks
) => {
  const today =
    new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

  setEndorsements((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "ASSIGNED",
            assignedTo:
              staff.name,

            assignedDate:
              today,

            transferHistory: [
              ...(item.transferHistory ||
                []),

              {
                from: "Office",
                to: staff.name,
                date: today,
                remarks,
              },
            ],
          }
        : item
    )
  );

  setAssignItem(null);
};

  const handleComplete = (
  id
) => {
  const today =
    new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

  setEndorsements((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            status:
              "COMPLETED",
            completedDate:
              today,
          }
        : item
    )
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
  onClick={() =>
    setShowOverallReport(true)
  }
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
            <h3>
              {tabs.find((x) => x.key === activeTab)?.label}
            </h3>
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

                  {activeTab !== "new" && (
                    <th>Assigned To</th>
                  )}

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <EmptyState
                        label={
                          tabs.find(
                            (x) => x.key === activeTab
                          )?.label
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  currentData.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.id}</td>
                      <td>{row.fileNo}</td>
                      <td>{row.date}</td>
                      <td>{row.category}</td>
                      <td>{row.from}</td>
                      <td>{row.status}</td>

                      {activeTab !== "new" && (
                        <td>{row.assignedTo}</td>
                      )}

                      <td
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelected(row)}
                        >
                          👁 View
                        </button>

                        {activeTab === "new" && (
                          <button
  className="btn btn-primary btn-sm"
  onClick={() =>
    setAssignItem(row)
  }
>
  Assign
</button>
                        )}

                        {activeTab === "assigned" && (
                          <>
                            <button
  className="btn btn-outline btn-sm"
  onClick={() =>
    setTrackItem(row)
  }
>
  📍 Track
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

          <div className="table-footer">
            {currentData.length} Records
          </div>

        </div>
      </div>

      {selected && (
        <EndorsementDetailModal
          item={selected}
          readOnly={true}
          onClose={() => setSelected(null)}
        />
      )}

      {
  assignItem && (
    <AssignModal
      item={assignItem}
      onClose={() =>
        setAssignItem(null)
      }
      onAssign={handleAssign}
    />
  )
}

{
  trackItem && (
    <TrackModal
      item={trackItem}
      onClose={() =>
        setTrackItem(null)
      }
    />
  )
}

{
  reportItem && (
    <IndividualReportModal
      item={reportItem}
      onClose={() =>
        setReportItem(null)
      }
    />
  )
}

{
  showOverallReport && (
    <OverallReportModal
      endorsements={
        endorsements
      }
      onClose={() =>
        setShowOverallReport(
          false
        )
      }
    />
  )
}
    </div>
  );
}