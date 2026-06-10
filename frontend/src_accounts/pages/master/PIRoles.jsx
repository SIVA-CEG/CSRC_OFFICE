import React, { useState, useMemo } from "react";
import "./PIRoles.css";

export default function PIRoles() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Matches the 10 rows per page shown in your screenshots

  // Extracted data from the provided images
  const [roles, setRoles] = useState([
    { id: "1", roleName: "Co Principal Investigator", abbr: "COPI" },
    { id: "2", roleName: "DST Inspire Faculty", abbr: "DST Inspir" },
    { id: "3", roleName: "Guide", abbr: "GUDE" },
    { id: "4", roleName: "Industrialist", abbr: "INDU" },
    { id: "5", roleName: "Key Investigator", abbr: "KI" },
    { id: "6", roleName: "Mentor", abbr: "MENT" },
    { id: "7", roleName: "Nominator", abbr: "NOMI" },
    { id: "8", roleName: "Other Investigator", abbr: "OI" },
    { id: "9", roleName: "Partner", abbr: "PART" },
    { id: "10", roleName: "Principal Investigator", abbr: "PI" },
    { id: "11", roleName: "Project Coordinator", abbr: "PC" },
    { id: "12", roleName: "Project Study Advisor", abbr: "PRO-ADV" },
    { id: "13", roleName: "Research Scholar", abbr: "RES-SCH" },
    { id: "14", roleName: "Student", abbr: "STUD" },
    { id: "15", roleName: "Sub-Contractor", abbr: "SUB-CON" },
    { id: "16", roleName: "test", abbr: "tst" }
  ]);

  const [currentRole, setCurrentRole] = useState({
    id: "", roleName: "", abbr: "",
  });

  const openAddModal = () => {
    setEditIndex(null);
    setError("");
    // Auto-generate the next ID
    const nextId = (Math.max(...roles.map(r => parseInt(r.id) || 0)) + 1).toString();
    setCurrentRole({ id: nextId, roleName: "", abbr: "" });
    setShowModal(true);
  };

  const openEditModal = (item, actualIndex) => {
    setEditIndex(actualIndex);
    setError("");
    setCurrentRole(item);
    setShowModal(true);
  };

  const saveRole = () => {
    setError("");

    if (!currentRole.roleName.trim() || !currentRole.abbr.trim() || !currentRole.id.trim()) {
      setError("Please fill in ID, Role Name, and Abbreviation.");
      return;
    }

    // Check for duplicate Role Name
    const roleExists = roles.some(
      (item, idx) => idx !== editIndex && item.roleName.trim().toLowerCase() === currentRole.roleName.trim().toLowerCase()
    );

    if (roleExists) {
      setError("This Role Name already exists.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...roles];
      updated[editIndex] = currentRole;
      setRoles(updated);
    } else {
      setRoles([...roles, {
        id: currentRole.id.trim(),
        roleName: currentRole.roleName.trim(),
        abbr: currentRole.abbr.trim(),
      }]);
    }
    setShowModal(false);
  };

  const deleteRole = (actualIndex) => {
    if (!window.confirm("Are you sure you want to delete this PI Role?")) return;
    setRoles(roles.filter((_, idx) => idx !== actualIndex));
  };

  // 1. Filter the data based on search
  const filteredRoles = useMemo(() => {
    const searchLower = search.toLowerCase();
    return roles.filter((item) => {
      if (!item) return false;
      return (
        (item.roleName ?? "").toLowerCase().includes(searchLower) ||
        (item.abbr ?? "").toLowerCase().includes(searchLower) ||
        (item.id ?? "").toLowerCase().includes(searchLower)
      );
    });
  }, [roles, search]);

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 2. Calculate Pagination data
  const totalPages = Math.ceil(filteredRoles.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRoles.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="pi-role-page">
      <div className="pi-role-header">
        <div>
          <h1>🧑‍🔬 PI Roles Management</h1>
          <p>Manage Principal Investigator and related project roles</p>
        </div>
        <button className="add-pi-role-btn" onClick={openAddModal}>+ Add Role</button>
      </div>

      <div className="pi-role-stats">
        <div className="stat-card">
          <h2>{roles.length}</h2>
          <span>Total Roles</span>
        </div>
        <div className="stat-card">
          <h2>{filteredRoles.length}</h2>
          <span>Displayed Results</span>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search by ID, Role Name, or Abbreviation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="pi-role-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Role Name</th>
              <th>Abbreviation</th>
              <th style={{ width: "160px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((item, index) => {
                const actualIndex = roles.indexOf(item);
                
                return (
                  <tr key={index}>
                    <td style={{ fontWeight: "600", color: "#64748b" }}>{item.id}</td>
                    <td style={{ fontWeight: "600", color: "#166534" }}>{item.roleName}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "14px" }}>{item.abbr}</td>
                    <td>
                      <div className="table-actions">
                        <button className="save-btn" onClick={() => openEditModal(item, actualIndex)}>
                          ✏️ Edit
                        </button>
                        <button className="cancel-btn" onClick={() => deleteRole(actualIndex)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="empty-state">No roles found</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <span className="pagination-text">
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredRoles.length)} of {filteredRoles.length} records
            </span>
            <div className="pagination-buttons">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="cancel-btn page-btn"
              >
                Prev
              </button>
              <div className="page-indicator">
                {currentPage} of {totalPages}
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
            <h2>{editIndex !== null ? "Edit Role" : "Add PI Role"}</h2>
            <div className="modal-grid">
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="modal-label">Role ID</label>
                <input 
                  type="text" 
                  placeholder="ID (e.g. 17)" 
                  value={currentRole.id} 
                  onChange={(e) => setCurrentRole({ ...currentRole, id: e.target.value })} 
                />
              </div>
              <div>
                <label className="modal-label">Role Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Co-Investigator" 
                  value={currentRole.roleName} 
                  onChange={(e) => setCurrentRole({ ...currentRole, roleName: e.target.value })} 
                />
              </div>
              <div>
                <label className="modal-label">Abbreviation</label>
                <input 
                  type="text" 
                  placeholder="e.g. CO-INV" 
                  value={currentRole.abbr} 
                  onChange={(e) => setCurrentRole({ ...currentRole, abbr: e.target.value })} 
                />
              </div>
            </div>
            {error && <div className="pi-role-error">⚠ {error}</div>}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => { setShowModal(false); setError(""); }}>Cancel</button>
              <button className="save-btn" onClick={saveRole}>{editIndex !== null ? "Update Role" : "Save Role"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}