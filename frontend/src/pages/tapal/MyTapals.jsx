import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./MyTapals.css";

const staffList = [
  "Dr. Shubra Singh",
  "Mr. B. Vigneshwaran",
  "Mr. D. Murali",
  "Mr. E. Gangadurai",
  "Dr. Renuka Devi",
];

const initialAssigned = [
  {
    id: 1,
    tapalId: "2627ET1080",
    acceptanceId: "0",
    date: "20-05-2026",
    category: "GIAN",
    type: "SANCTION",
    from: "Dr. M. Yuvaraju, EEE (RC Coimbatore)",
    subject: "Project approval document",
    status: "Assigned",
  },
  {
    id: 2,
    tapalId: "2627ET0324",
    acceptanceId: "0",
    date: "10-04-2026",
    category: "PROJECT",
    type: "SETTLEMENT",
    from: "Dr. S. Uja Priyadharini, ECE (RC Tirunelveli)",
    subject: "Settlement bill verification",
    status: "Assigned",
  },
];

const initialTransferred = [
  {
    id: 101,
    tapalId: "2425ET047",
    acceptanceId: "0",
    date: "02-04-2024",
    category: "PROJECT",
    type: "PROJECT",
    from: "Dr. K. Senthil Kumar, CASR (MIT Campus)",
    subject: "Transferred project tapal",
    transferredFrom: "Mr. Venkatesh",
    status: "Transferred",
  },
];

export default function MyTapals({ defaultTab = "new" }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [assigned, setAssigned] = useState(initialAssigned);
  const [transferred, setTransferred] = useState(initialTransferred);
  const [completed, setCompleted] = useState([]);
  const [selectedTapal, setSelectedTapal] = useState(null);
  const [transferTo, setTransferTo] = useState("");
  const [remarks, setRemarks] = useState("");

  // Advanced Search States
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const transferTapal = () => {
    if (!selectedTapal || !transferTo) {
      alert("Please select staff to transfer");
      return;
    }

    const completedTapal = {
      ...selectedTapal,
      transferredTo: transferTo,
      remarks,
      completedDate: new Date().toLocaleDateString("en-GB"),
      status: "Completed",
    };

    setCompleted((prev) => [completedTapal, ...prev]);
    setAssigned((prev) => prev.filter((t) => t.id !== selectedTapal.id));
    setTransferred((prev) => prev.filter((t) => t.id !== selectedTapal.id));

    setSelectedTapal(null);
    setTransferTo("");
    setRemarks("");

    navigate("/my-tapals/completed");
  };

  const allTapals = [...assigned, ...transferred, ...completed];

  // Helper function to parse "DD-MM-YYYY" into a comparable Date object
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
  };

  // Advanced Filtering Logic
  const filteredTapals = useMemo(() => {
    return allTapals.filter((t) => {
      // 1. General Text Search
      const matchesSearch = Object.values(t).join(" ").toLowerCase().includes(search.toLowerCase());
      
      // 2. Category Filter
      const matchesCategory = filterCategory === "" || t.category === filterCategory;
      
      // 3. Type Filter
      const matchesType = filterType === "" || t.type === filterType;

      // 4. Date Range Filter
      let matchesDate = true;
      if (fromDate || toDate) {
        const tapalDate = parseDateString(t.date);
        
        if (tapalDate) {
          const start = fromDate ? new Date(fromDate) : null;
          const end = toDate ? new Date(toDate) : null;

          // Set time to midnight for accurate day comparison
          if (start) start.setHours(0, 0, 0, 0);
          if (end) end.setHours(23, 59, 59, 999);

          if (start && end) {
            matchesDate = tapalDate >= start && tapalDate <= end;
          } else if (start) {
            matchesDate = tapalDate >= start;
          } else if (end) {
            matchesDate = tapalDate <= end;
          }
        } else {
          matchesDate = false; // Exclude if date format is invalid and a date filter is applied
        }
      }

      return matchesSearch && matchesCategory && matchesType && matchesDate;
    });
  }, [allTapals, search, filterCategory, filterType, fromDate, toDate]);


  // Extract unique categories and types for the dropdowns
  const uniqueCategories = [...new Set(allTapals.map(t => t.category))].filter(Boolean);
  const uniqueTypes = [...new Set(allTapals.map(t => t.type))].filter(Boolean);


  return (
    <div className="mytapal-page">
      <div className="tapal-header">
        <div>
          <h1>My Tapals</h1>
          <p>Manage internal, assigned, transferred and completed tapals</p>
        </div>
      </div>

      {activeTab === "new" && (
        <div className="tapal-card">
          <h2>New Internal Tapal Entry</h2>

          <div className="form-grid">
            <div>
              <label>Tapal Date</label>
              <input type="date" />
            </div>

            <div>
              <label>CSRC Category Type *</label>
              <select>
                <option>Admin</option>
                <option>Consultancy</option>
                <option>CTDT Maintenance</option>
                <option>CTDT Purchase</option>
                <option>General</option>
                <option>GIAN</option>
                <option>Project</option>
              </select>
            </div>

            <div>
              <label>Document Type *</label>
              <select>
                <option>1 INSTALLMENT</option>
                <option>2ND INSTALLMENT</option>
                <option>3RD INSTALLMENT</option>
                <option>TSA CLAIM BILL</option>
                <option>SANCTION</option>
                <option>SETTLEMENT</option>
              </select>
            </div>

            <div>
              <label>Subject *</label>
              <input placeholder="Subject" />
            </div>

            <div>
              <label>Assigned To *</label>
              <input value="Mr. Venkatesh" disabled />
            </div>
          </div>

          <button className="primary-btn">Add Tapal</button>
        </div>
      )}

      {activeTab === "assigned" && (
        <TapalTable
          title="Tapals Assigned To Me"
          data={assigned}
          onTransfer={(tapal) => setSelectedTapal(tapal)}
        />
      )}

      {activeTab === "transfer" && (
        <TapalTable
          title="Tapals Transferred To Me"
          data={transferred}
          onTransfer={(tapal) => setSelectedTapal(tapal)}
          showTransferredFrom
        />
      )}

      {activeTab === "completed" && (
        <TapalTable title="Completed Tapals" data={completed} completed />
      )}

      {activeTab === "search" && (
        <div className="tapal-card">
          <h2>Advanced Tapal Search</h2>

          {/* Advanced Filter Layout */}
          <div className="search-filters-grid" style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "16px", 
            marginBottom: "24px",
            background: "#f8fafc",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0"
          }}>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>
                General Search
              </label>
              <input
                placeholder="Search by ID, from, subject, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>
                Category
              </label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff" }}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>
                Tapal Type
              </label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff" }}
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#475569" }}>
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
               <button 
                onClick={() => {
                  setSearch("");
                  setFilterCategory("");
                  setFilterType("");
                  setFromDate("");
                  setToDate("");
                }}
                style={{
                  padding: "10px 16px",
                  background: "#e2e8f0",
                  color: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          <TapalTable title={`Search Results (${filteredTapals.length})`} data={filteredTapals} completed />
        </div>
      )}

      {selectedTapal && (
        <div className="modal-overlay">
          <div className="transfer-modal">
            <button className="close-btn" onClick={() => setSelectedTapal(null)}>
              ×
            </button>

            <h2>Transfer Tapal</h2>
            <p className="modal-subtitle">{selectedTapal.tapalId}</p>

            <label>Remarks</label>
            <textarea
              placeholder="My action..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <label>Tapal Transfer To</label>
            <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
              <option value="">-- Select Staff --</option>
              {staffList.map((staff) => (
                <option key={staff}>{staff}</option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="primary-btn" onClick={transferTapal}>
                Save Transfer
              </button>
              <button className="danger-btn" onClick={() => setSelectedTapal(null)}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TapalTable({ title, data, onTransfer, completed, showTransferredFrom }) {
  const colSpan = showTransferredFrom ? 11 : completed ? 10 : 10;

  return (
    <div className="tapal-card">
      <h2>{title}</h2>

      <div className="table-wrap">
        <table className="tapal-table">
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Tapal ID</th>
              <th>Acceptance ID</th>
              <th>Date</th>
              <th>Category</th>
              <th>Tapal Type</th>
              <th>Tapal From</th>
              {showTransferredFrom && <th>Transferred From</th>}
              <th>Subject</th>
              <th>Status</th>
              {!completed && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="empty-row">
                  No tapals found
                </td>
              </tr>
            ) : (
              data.map((tapal, index) => (
                <tr key={tapal.id}>
                  <td>{index + 1}</td>
                  <td className="tapal-link">{tapal.tapalId}</td>
                  <td>{tapal.acceptanceId}</td>
                  <td>{tapal.date}</td>
                  <td>{tapal.category}</td>
                  <td>{tapal.type}</td>
                  <td>{tapal.from}</td>
                  {showTransferredFrom && <td>{tapal.transferredFrom}</td>}
                  <td>{tapal.subject}</td>
                  <td>
                    <span className={`status ${tapal.status.toLowerCase()}`}>
                      {tapal.status}
                    </span>
                  </td>
                  {!completed && (
                    <td>
                      <button className="action-btn" onClick={() => onTransfer(tapal)}>
                        Transfer
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}