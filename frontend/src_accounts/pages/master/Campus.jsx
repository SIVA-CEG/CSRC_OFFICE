import React, { useState } from "react";
import "./Campus.css";

export default function Campus() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [campuses, setCampuses] = useState([
    { campus: "ACT Campus", abbr: "ACT Campus" },
    { campus: "Anna University Regional Campus Madurai", abbr: "Madurai" },
    { campus: "Anna University Regional Centre, Tirunelveli", abbr: "RC Tirunelveli" },
    { campus: "Bharathidasan Institute of Technology (BIT) Campus", abbr: "BIT Campus" },
    { campus: "Bharathidasan Institute of Technology (BIT) Campus", abbr: "BITS" },
    { campus: "CEG Campus", abbr: "CEG Campus" },
    { campus: "Main Campus", abbr: "Main Campus" },
    { campus: "MIT Campus", abbr: "MIT Campus" },
    { campus: "Regional Campus Coimbatore", abbr: "RC Coimbatore" },
    { campus: "SAP Campus", abbr: "SAP Campus" },

    {
      campus:
        "University College of Engineering (VOC College of Engg.), Tuticorin",
      abbr: "UCE Tuticorin",
    },
    {
      campus:
        "University College of Engineering - Bharathidasan Institute of Technology, Tiruchirappalli",
      abbr: "UCE-BIT Campus",
    },
    {
      campus: "University College of Engineering - Dindigul",
      abbr: "UCE Dindigul",
    },
    {
      campus: "University College of Engineering - Kanchipuram",
      abbr: "UCE Kanchipuram",
    },
    {
      campus: "University College of Engineering Villupuram",
      abbr: "Villupuram",
    },
    {
      campus: "University College of Engineering, Ariyalur",
      abbr: "UCE Ariyalur",
    },
    {
      campus: "University College of Engineering, Arni",
      abbr: "UCE Arni",
    },
    {
      campus: "University College of Engineering, Dindugal",
      abbr: "UCE Dingual",
    },
    {
      campus: "University College of Engineering, Madurai",
      abbr: "UCE Madurai",
    },
    {
      campus: "University College of Engineering, Nagercoil",
      abbr: "UCE Nagercoil",
    },
    {
      campus: "University College of Engineering, Panruti",
      abbr: "UCE Panruti",
    },
    {
      campus: "University College of Engineering, Pattukottai",
      abbr: "UCE Pattukottai",
    },
    {
      campus: "University College of Engineering, Ramanathapuram",
      abbr: "UCE Ramanathapuram",
    },
    {
      campus: "University College of Engineering, Thirukkuvalai",
      abbr: "UCE Thirukkuvalai",
    },
    {
      campus: "University College of Engineering, Tindivanam",
      abbr: "UCE Tindivanam",
    },
    {
      campus: "University College of Engineering, Tirunelveli",
      abbr: "UCE Tirunelveli",
    },
    {
      campus: "University College of Engineering, Trichy",
      abbr: "UCE Trichy",
    },
    {
      campus: "University College of Engineering, Villupuram",
      abbr: "UCE Villupuram",
    },
  ]);

  const [newCampus, setNewCampus] = useState({
    campus: "",
    abbr: "",
  });

  const addCampus = () => {
    setError("");

    if (!newCampus.campus.trim() || !newCampus.abbr.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    const campusExists = campuses.some(
      (item) =>
        item.campus.trim().toLowerCase() ===
        newCampus.campus.trim().toLowerCase()
    );

    if (campusExists) {
      setError("Campus already exists.");
      return;
    }

    const abbrExists = campuses.some(
      (item) =>
        item.abbr.trim().toLowerCase() ===
        newCampus.abbr.trim().toLowerCase()
    );

    if (abbrExists) {
      setError("Campus abbreviation already exists.");
      return;
    }

    setCampuses([
      ...campuses,
      {
        campus: newCampus.campus.trim(),
        abbr: newCampus.abbr.trim(),
      },
    ]);

    setNewCampus({
      campus: "",
      abbr: "",
    });

    setShowModal(false);
  };

  const filteredCampuses = campuses.filter(
    (item) =>
      item.campus.toLowerCase().includes(search.toLowerCase()) ||
      item.abbr.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="campus-page">
      <div className="campus-header">
        <div>
          <h1>🏫 Campus Management</h1>
          <p>
            Manage Anna University campuses and affiliated engineering colleges
          </p>
        </div>

        <button
          className="add-campus-btn"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          + Add Campus
        </button>
      </div>

      <div className="campus-stats">
        <div className="stat-card">
          <h2>{campuses.length}</h2>
          <p>Total Campuses</p>
        </div>

        <div className="stat-card">
          <h2>{filteredCampuses.length}</h2>
          <p>Displayed Results</p>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search Campus Name or Abbreviation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="campus-table">
          <thead>
            <tr>
              <th>Campus</th>
              <th>Abbreviation</th>
            </tr>
          </thead>

          <tbody>
            {filteredCampuses.map((item, index) => (
              <tr key={index}>
                <td>{item.campus}</td>
                <td>{item.abbr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Add New Campus</h2>

            <input
              type="text"
              placeholder="Campus Name"
              value={newCampus.campus}
              onChange={(e) =>
                setNewCampus({
                  ...newCampus,
                  campus: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Campus Abbreviation"
              value={newCampus.abbr}
              onChange={(e) =>
                setNewCampus({
                  ...newCampus,
                  abbr: e.target.value,
                })
              }
            />

            {error && (
              <div className="campus-error">
                ⚠ {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={addCampus}
              >
                Save Campus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}