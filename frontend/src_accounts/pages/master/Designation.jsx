import React, { useState, useMemo } from "react";
import "./Designation.css";

export default function Designation() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15; // Set to 15 to demonstrate pagination with 41 records

  // Your full dataset
  const [designations, setDesignations] = useState([
    { "id": "32", "designation": "Adjunct Faculty", "abbr": "Adj.fac" },
    { "id": "29", "designation": "Adjunct Professor", "abbr": "Adj.pro" },
    { "id": "1", "designation": "Assistant Professor", "abbr": "Asst. Prof." },
    { "id": "36", "designation": "Assistant Professor (SI.Gr) & DEPUTY Chairman", "abbr": "Asst. Prof. (Sl.Gr.)" },
    { "id": "35", "designation": "Assistant Professor (SI.Gr) & DEPUTY Chairman", "abbr": "Asst. Prof. (Sl.Gr.)" },
    { "id": "37", "designation": "Assistant Professor (SI.Gr) & DEPUTY Chairman", "abbr": "Asst. Prof. (Sl.Gr.)" },
    { "id": "4", "designation": "Assistant Professor (Sl. Gr.)", "abbr": "Asst. Prof. (Sl.Gr.)" },
    { "id": "38", "designation": "Assistant Professor (Sl.Gr ) & Deputy chairman", "abbr": "Asst. Prof. (Sl.Gr.)" },
    { "id": "40", "designation": "Assistant Professor (Sr. Gr.)", "abbr": "Asst. Prof. (Sr. Gr.)" },
    { "id": "25", "designation": "Assistant professor (Sr.Gr)", "abbr": "Asst.Prof.(Sr.Gr)" },
    { "id": "17", "designation": "Assistant Professor of Practice", "abbr": "Asst. Prof." },
    { "id": "2", "designation": "Associate Professor", "abbr": "Asso. Prof." },
    { "id": "5", "designation": "Associate Professor (Sl.Gr.)", "abbr": "Asso. Prof. (Sl.Gr.)" },
    { "id": "28", "designation": "Consultant Project", "abbr": "Cons Proj" },
    { "id": "23", "designation": "CSIR Research Associate", "abbr": "Research Asso" },
    { "id": "20", "designation": "Director", "abbr": "Director" },
    { "id": "15", "designation": "DST INSPIRE Fellow", "abbr": "DST INSPIRE Fellow" },
    { "id": "18", "designation": "DST-Inspire Faculty", "abbr": "DST-Inspire Faculty" },
    { "id": "24", "designation": "Head", "abbr": "head" },
    { "id": "6", "designation": "Lecturer", "abbr": "Lect." },
    { "id": "30", "designation": "Ph.D . Student", "abbr": "Ph.D . Student" },
    { "id": "31", "designation": "Ph.D. Student", "abbr": "Ph.D. Student" },
    { "id": "27", "designation": "Professional Assistant II", "abbr": "PA-II" },
    { "id": "3", "designation": "Professor", "abbr": "Prof." },
    { "id": "16", "designation": "Professor", "abbr": "Director" },
    { "id": "26", "designation": "Professor and Head", "abbr": "Prof & Head" },
    { "id": "34", "designation": "Professor of Eminence", "abbr": "Prof. Emi" },
    { "id": "33", "designation": "Professor of Practice", "abbr": "Pro.Prac" },
    { "id": "39", "designation": "Project Scholar", "abbr": "Pro. Sch" },
    { "id": "13", "designation": "Research Professor, Faculty Scientist", "abbr": "Research Sci." },
    { "id": "9", "designation": "RESEARCH SCHOLAR", "abbr": "Res. Sch." },
    { "id": "10", "designation": "SCIENTIST", "abbr": "Scientist" },
    { "id": "22", "designation": "Studentship", "abbr": "Studentship" },
    { "id": "41", "designation": "Teaching Fellow", "abbr": "Te. Fe" },
    { "id": "21", "designation": "test", "abbr": "demo" },
    { "id": "14", "designation": "The Controller of Examination", "abbr": "CoE" },
    { "id": "19", "designation": "The Coordinator", "abbr": "Prof." },
    { "id": "12", "designation": "UGC-Assistant Professor", "abbr": "UGC Asst. Prof." },
    { "id": "11", "designation": "UGC-FRP Assistant Professor", "abbr": "UGC FRP Asst. Prof." },
    { "id": "7", "designation": "Women Scientist", "abbr": "Women Sci." },
    { "id": "8", "designation": "Young Scientist", "abbr": "Young. Sci." }
  ]);

  const [currentDesignation, setCurrentDesignation] = useState({
    id: "", designation: "", abbr: "",
  });

  const openAddModal = () => {
    setEditIndex(null);
    setError("");
    // Generate a quick ID based on current length + 1 (can be customized)
    const nextId = (Math.max(...designations.map(d => parseInt(d.id) || 0)) + 1).toString();
    setCurrentDesignation({ id: nextId, designation: "", abbr: "" });
    setShowModal(true);
  };

  const openEditModal = (item, actualIndex) => {
    setEditIndex(actualIndex);
    setError("");
    setCurrentDesignation(item);
    setShowModal(true);
  };

  const saveDesignation = () => {
    setError("");

    if (!currentDesignation.designation.trim() || !currentDesignation.abbr.trim() || !currentDesignation.id.trim()) {
      setError("Please fill in ID, Designation, and Abbreviation.");
      return;
    }

    // Check for duplicate designation name
    const desigExists = designations.some(
      (item, idx) => idx !== editIndex && item.designation.trim().toLowerCase() === currentDesignation.designation.trim().toLowerCase()
    );

    if (desigExists) {
      setError("This designation already exists.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...designations];
      updated[editIndex] = currentDesignation;
      setDesignations(updated);
    } else {
      setDesignations([...designations, {
        id: currentDesignation.id.trim(),
        designation: currentDesignation.designation.trim(),
        abbr: currentDesignation.abbr.trim(),
      }]);
    }
    setShowModal(false);
  };

  const deleteDesignation = (actualIndex) => {
    if (!window.confirm("Are you sure you want to delete this designation?")) return;
    setDesignations(designations.filter((_, idx) => idx !== actualIndex));
  };

  // 1. Filter the data based on search
  const filteredDesignations = useMemo(() => {
    const searchLower = search.toLowerCase();
    return designations.filter((item) => {
      if (!item) return false;
      return (
        (item.designation ?? "").toLowerCase().includes(searchLower) ||
        (item.abbr ?? "").toLowerCase().includes(searchLower) ||
        (item.id ?? "").toLowerCase().includes(searchLower)
      );
    });
  }, [designations, search]);

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 2. Calculate Pagination data
  const totalPages = Math.ceil(filteredDesignations.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredDesignations.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="desig-page">
      <div className="desig-header">
        <div>
          <h1>🎖️ Designation Management</h1>
          <p>Manage staff and faculty designation categories</p>
        </div>
        <button className="add-desig-btn" onClick={openAddModal}>+ Add Designation</button>
      </div>

      <div className="desig-stats">
        <div className="stat-card">
          <h2>{designations.length}</h2>
          <span>Total Designations</span>
        </div>
        <div className="stat-card">
          <h2>{filteredDesignations.length}</h2>
          <span>Displayed Results</span>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search by ID, Designation, or Abbreviation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="desig-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Designation</th>
              <th>Abbreviation</th>
              <th style={{ width: "160px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((item, index) => {
                const actualIndex = designations.indexOf(item);
                
                return (
                  <tr key={index}>
                    <td style={{ fontWeight: "600", color: "#64748b" }}>#{item.id}</td>
                    <td style={{ fontWeight: "600", color: "#166534" }}>{item.designation}</td>
                    <td>{item.abbr}</td>
                    <td>
                      <div className="table-actions">
                        <button className="save-btn" onClick={() => openEditModal(item, actualIndex)}>
                          ✏️ Edit
                        </button>
                        <button className="cancel-btn" onClick={() => deleteDesignation(actualIndex)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="empty-state">No designations found</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <span className="pagination-text">
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredDesignations.length)} of {filteredDesignations.length}
            </span>
            <div className="pagination-buttons">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="cancel-btn page-btn"
              >
                Previous
              </button>
              <div className="page-indicator">
                Page {currentPage} of {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="cancel-btn page-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{editIndex !== null ? "Edit Designation" : "Add Designation"}</h2>
            <div className="modal-grid">
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="modal-label">Designation ID</label>
                <input 
                  type="text" 
                  placeholder="ID (e.g. 42)" 
                  value={currentDesignation.id} 
                  onChange={(e) => setCurrentDesignation({ ...currentDesignation, id: e.target.value })} 
                />
              </div>
              <div>
                <label className="modal-label">Designation Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Guest Lecturer" 
                  value={currentDesignation.designation} 
                  onChange={(e) => setCurrentDesignation({ ...currentDesignation, designation: e.target.value })} 
                />
              </div>
              <div>
                <label className="modal-label">Abbreviation</label>
                <input 
                  type="text" 
                  placeholder="e.g. Guest Lect." 
                  value={currentDesignation.abbr} 
                  onChange={(e) => setCurrentDesignation({ ...currentDesignation, abbr: e.target.value })} 
                />
              </div>
            </div>
            {error && <div className="desig-error">⚠ {error}</div>}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => { setShowModal(false); setError(""); }}>Cancel</button>
              <button className="save-btn" onClick={saveDesignation}>{editIndex !== null ? "Update Details" : "Save Designation"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}