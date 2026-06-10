import React, { useState } from "react";
import "./Departments.css";

export default function Departments() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");

  const [departments, setDepartments] = useState([
  {
    "department": "Anna University Sports Board",
    "abbr": "AUSB"
  },
  {
    "department": "AU-FRG Institute for CAD/CAM",
    "abbr": "AU-FRG"
  },
  {
    "department": "AU-KBC Research Centre",
    "abbr": "AU-KBC"
  },
  {
    "department": "Building Technology Centre",
    "abbr": "BTC"
  },
  {
    "department": "Centralized Procurement Office",
    "abbr": "CPO"
  },
  {
    "department": "CENTRE FOR ADMISSIONS",
    "abbr": "CFA"
  },
  {
    "department": "Centre for AeroSpace Research",
    "abbr": "CASR"
  },
  {
    "department": "Centre for Alumni Relations and Corporate Affairs",
    "abbr": "CARCA"
  },
  {
    "department": "Centre for Artificial Intelligence and Data Science Researchh & Applications",
    "abbr": "CAInDRA"
  },
  {
    "department": "Centre for Biotechnology",
    "abbr": "CBT"
  },
  {
    "department": "Centre for Blended Learning and Human Empowerment",
    "abbr": "CBLHE"
  },
  {
    "department": "Centre for Climate Change and Adaptation Research",
    "abbr": "CCCAR"
  },
  {
    "department": "Centre for Climate Change and Adaptation Research",
    "abbr": "CCCDM"
  },
  {
    "department": "Centre for Climate Change and Disaster Management",
    "abbr": "CCCDM"
  },
  {
    "department": "Centre for Climate Change and Disaster Management",
    "abbr": "CCC"
  },
  {
    "department": "Centre for Composite Materials",
    "abbr": "CCM"
  },
  {
    "department": "Centre for Crystal Growth Centre",
    "abbr": "CGC"
  },
  {
    "department": "Centre for Cyber Security",
    "abbr": "CCS"
  },
  {
    "department": "Centre for Development of Tamil in Engineering and Technology",
    "abbr": "CDT"
  },
  {
    "department": "Centre for Disaster Mitigation and Management",
    "abbr": "CDMM"
  },
  {
    "department": "Centre for Distance Education",
    "abbr": "CDE"
  },
  {
    "department": "Centre for E-Vehicle Technology",
    "abbr": "CEVT"
  },
  {
    "department": "Centre for Energy Storage Technologies",
    "abbr": "Centre for Ener"
  },
  {
    "department": "Centre for Energy Storage Technologies",
    "abbr": "CEST"
  },
  {
    "department": "Centre for Energy Storage Technology",
    "abbr": "Centre for Ener"
  },
  {
    "department": "Centre for Entrance Examinations",
    "abbr": "CEE"
  },
  {
    "department": "Centre for Entreprenurship Development",
    "abbr": "CED"
  },
  {
    "department": "Centre for Environmental Studies",
    "abbr": "CES"
  },
  {
    "department": "Centre for Excellence Building",
    "abbr": "CEB"
  },
  {
    "department": "Centre for Excellence in Nanobio Translational Research",
    "abbr": "CENTR"
  },
  {
    "department": "Centre for Faculty & Professional Development",
    "abbr": "CFPD"
  },
  {
    "department": "Centre for facuty Development programme",
    "abbr": "CFPD"
  },
  {
    "department": "Centre for Food Technology",
    "abbr": "Food Tech"
  },
  {
    "department": "Centre for Human Settlement",
    "abbr": "CHS"
  },
  {
    "department": "Centre for Immersive Technologies",
    "abbr": "CIT"
  },
  {
    "department": "Centre for Industrial Safety",
    "abbr": "CIS"
  },
  {
    "department": "Centre for Intellectural Property Rights",
    "abbr": "IPR"
  },
  {
    "department": "Centre for International Relations",
    "abbr": "Centre for Inte"
  },
  {
    "department": "Centre for Internet of things",
    "abbr": "CIOT"
  },
  {
    "department": "Centre for Liberal Arit for science Engineeing Tevhnology",
    "abbr": "CLASET"
  },
  {
    "department": "Centre for Materials Informatics c-main",
    "abbr": "C-MaIn"
  },
  {
    "department": "Centre for Medical Electronics",
    "abbr": "CME"
  },
  {
    "department": "Centre for Multi Disciplinary System Research",
    "abbr": "CMDSR"
  },
  {
    "department": "Centre for Nanoscience And Technology",
    "abbr": "Nano Tech"
  },
  {
    "department": "Centre For Research",
    "abbr": "CR"
  },
  {
    "department": "Centre for Robotics and Automation",
    "abbr": "CRA"
  },
  {
    "department": "Centre for Sponsored Research and Consultancy",
    "abbr": "CSRC"
  },
  {
    "department": "Centre for Survey Training and Research",
    "abbr": "CSTAR"
  },
  {
    "department": "Centre for Technology in Traditional Medicine",
    "abbr": "CTTM"
  },
  {
    "department": "Centre for University - Industry Collaboration",
    "abbr": "CUIC"
  },
  {
    "department": "Centre for Water Resources",
    "abbr": "CWR"
  },
  {
    "department": "Centre for Wireless System Design",
    "abbr": "CWST"
  },
  {
    "department": "Centre for Wireless System Design",
    "abbr": "CWiSD"
  },
  {
    "department": "CETRE FOR EXCELLECE IN AUTOMOBILE TECHNOLOGY",
    "abbr": "CEAT"
  },
  {
    "department": "Concurrent Audit",
    "abbr": "CA"
  },
  {
    "department": "Crystal Growth Centre",
    "abbr": "CGC"
  },
  {
    "department": "Dean",
    "abbr": "Dean"
  },
  {
    "department": "DEAN CEG",
    "abbr": "CEG"
  },
  {
    "department": "Department of Aerospace Engineering",
    "abbr": "Aero"
  },
  {
    "department": "Department of Applied Science and Humanities",
    "abbr": "DAP"
  },
  {
    "department": "Department of Applied Science And Technology",
    "abbr": "DAST"
  },
  {
    "department": "Department of Architecture",
    "abbr": "Architecture"
  },
  {
    "department": "Department of Automobile Engineering",
    "abbr": "Auto"
  },
  {
    "department": "Department of Bio-Technology",
    "abbr": "Bio Tech"
  },
  {
    "department": "Department of Biochemistry",
    "abbr": "Biochem"
  },
  {
    "department": "Department of Biomedical Engineering",
    "abbr": "Biomedical"
  },
  {
    "department": "Department of Ceramic Technology",
    "abbr": "Ceramic"
  },
  {
    "department": "Department of Chemical Engineering",
    "abbr": "Chemical"
  },
  {
    "department": "Department of Chemistry",
    "abbr": "Chemistry"
  },
  {
    "department": "Department of Chemistry, Dindigul",
    "abbr": "Department of S"
  },
  {
    "department": "Department of Civil Engineering",
    "abbr": "Civil"
  },
  {
    "department": "Department of Computer Application",
    "abbr": "Computer Appl"
  },
  {
    "department": "Department of Computer Science and Engineering",
    "abbr": "CSE"
  },
  {
    "department": "Department of Computer Technology",
    "abbr": "Comp Tech"
  },
  {
    "department": "Department of Electrical And Electronics Engineering",
    "abbr": "EEE"
  },
  {
    "department": "Department of Electronics And Communication Engineering",
    "abbr": "ECE"
  },
  {
    "department": "Department of Electronics Engineering",
    "abbr": "EE"
  },
  {
    "department": "Department of English",
    "abbr": "English"
  },
  {
    "department": "Department of Geology",
    "abbr": "Geology"
  },
  {
    "department": "Department of Industrial Engineering",
    "abbr": "Industrial"
  },
  {
    "department": "Department of Information Science And Technology",
    "abbr": "DIST"
  },
  {
    "department": "Department of Information Technology",
    "abbr": "I T"
  },
  {
    "department": "Department of Instrumentation Engineering",
    "abbr": "Instrumention"
  },
  {
    "department": "Department of Management Studies",
    "abbr": "DMS"
  },
  {
    "department": "Department of Management Studies",
    "abbr": "MBA"
  },
  {
    "department": "Department of Manufacutring Engineering",
    "abbr": "Manufacturing"
  },
  {
    "department": "Department of Mathematics",
    "abbr": "Maths"
  },
  {
    "department": "Department of Mechanical Engineering",
    "abbr": "Mech"
  },
  {
    "department": "Department of Media Science",
    "abbr": "Media Science"
  },
  {
    "department": "Department of Medical Physics",
    "abbr": "DMP"
  },
  {
    "department": "Department of Mining Engineering",
    "abbr": "Minning"
  },
  {
    "department": "Department of NanoTechnology",
    "abbr": "Nano"
  },
  {
    "department": "Department of Petrochemical Technology",
    "abbr": "Petro"
  },
  {
    "department": "Department of Pharmaceutical Technology",
    "abbr": "Pharma"
  },
  {
    "department": "Department of Physics",
    "abbr": "Physics"
  },
  {
    "department": "Department of Planning",
    "abbr": "Planning"
  },
  {
    "department": "Department of Printing and Packaging Technology",
    "abbr": "Printing"
  },
  {
    "department": "Department of Production Technology",
    "abbr": "Production Tech"
  },
  {
    "department": "Department of Rubber and Plastic Technology",
    "abbr": "RPT"
  },
  {
    "department": "Department of Science & Humanities",
    "abbr": "DSH"
  },
  {
    "department": "Department of Textile Technology",
    "abbr": "Textile"
  },
  {
    "department": "Division of Nanoscience and Technology",
    "abbr": "DNT"
  },
  {
    "department": "Dr. Kalam Computing Centre",
    "abbr": "KCC"
  },
  {
    "department": "Educational Multimedia Research Centre",
    "abbr": "EMMRC"
  },
  {
    "department": "Energy Environment&Sustainability",
    "abbr": "ANIHEES"
  },
  {
    "department": "Engineering College Hostels",
    "abbr": "ECH"
  },
  {
    "department": "Entrepreneurship Development and Innovation Council",
    "abbr": "EDIC"
  },
  {
    "department": "Finance Office",
    "abbr": "FO"
  },
  {
    "department": "Institute for Energy Studies",
    "abbr": "IES"
  },
  {
    "department": "Institute of Catalysis and Petroleum Technology",
    "abbr": "ICPT"
  },
  {
    "department": "Institute of Ocean Management",
    "abbr": "IOM"
  },
  {
    "department": "Institute of Remote Sensing",
    "abbr": "IRS"
  },
  {
    "department": "Internal Audit-1",
    "abbr": "IA-1"
  },
  {
    "department": "internal Quality Assurance cell",
    "abbr": "IQAC"
  },
  {
    "department": "Knowledge Data Centre",
    "abbr": "KDC"
  },
  {
    "department": "Legal Office",
    "abbr": "LO"
  },
  {
    "department": "Naan Mudhalvan",
    "abbr": "NM"
  },
  {
    "department": "National Hub for Healthcare Instrumentation Development",
    "abbr": "NHHID"
  },
  {
    "department": "NHHID",
    "abbr": "NHHID"
  },
  {
    "department": "Planning & Development",
    "abbr": "P&D"
  },
  {
    "department": "Ramanujan Computing Centre",
    "abbr": "RCC"
  },
  {
    "department": "registrar",
    "abbr": "registrar"
  },
  {
    "department": "Siemens Centre of Excellence",
    "abbr": "SCoE"
  },
  {
    "department": "TEC",
    "abbr": "TEC"
  },
  {
    "department": "Technology Enabling Centre",
    "abbr": "TEC"
  },
  {
    "department": "The Controller of Examinations",
    "abbr": "CoE"
  },
  {
    "department": "University Library",
    "abbr": "UL"
  },
  {
    "department": "Vice Chancellor - Anna University",
    "abbr": "VC"
  }
]
);

  console.log(
  departments.filter(
    (item) => !item.department || !item.abbr
  )
);

  const [currentDepartment, setCurrentDepartment] = useState({
    department: "",
    abbr: "",
  });

  const openAddModal = () => {
    setEditIndex(null);
    setError("");

    setCurrentDepartment({
      department: "",
      abbr: "",
    });

    setShowModal(true);
  };

  const openEditModal = (item, index) => {
    setEditIndex(index);
    setError("");
    setCurrentDepartment(item);
    setShowModal(true);
  };

  const saveDepartment = () => {
    setError("");

    if (
      !currentDepartment.department.trim() ||
      !currentDepartment.abbr.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const deptExists = departments.some(
      (item, idx) =>
        idx !== editIndex &&
        item.department.trim().toLowerCase() ===
          currentDepartment.department.trim().toLowerCase()
    );

    if (deptExists) {
      setError("Department already exists.");
      return;
    }

    const abbrExists = departments.some(
      (item, idx) =>
        idx !== editIndex &&
        item.abbr.trim().toLowerCase() ===
          currentDepartment.abbr.trim().toLowerCase()
    );

    if (abbrExists) {
      setError("Department abbreviation already exists.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...departments];
      updated[editIndex] = currentDepartment;
      setDepartments(updated);
    } else {
      setDepartments([
        ...departments,
        {
          department: currentDepartment.department.trim(),
          abbr: currentDepartment.abbr.trim(),
        },
      ]);
    }

    setShowModal(false);
    setCurrentDepartment({
      department: "",
      abbr: "",
    });
  };

  const deleteDepartment = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    setDepartments(
      departments.filter((_, idx) => idx !== index)
    );
  };

  const filteredDepartments = departments.filter((item) => {
  if (!item) return false;

  return (
    (item.department ?? "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (item.abbr ?? "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
});

  return (
    <div className="dept-page">
      <div className="dept-header">
        <div>
          <h1>🏢 Department Management</h1>
          <p>
            Manage Anna University Departments, Centres
            and Administrative Units
          </p>
        </div>

        <button
          className="add-dept-btn"
          onClick={openAddModal}
        >
          + Add Department
        </button>
      </div>

      <div className="dept-stats">
        <div className="stat-card">
          <h2>{departments.length}</h2>
          <span>Total Departments</span>
        </div>

        <div className="stat-card">
          <h2>{filteredDepartments.length}</h2>
          <span>Displayed Results</span>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search Department or Abbreviation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="dept-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Abbreviation</th>
              <th style={{ width: "180px" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map(
                (item, index) => (
                  <tr key={index}>
                    <td>{item.department}</td>

                    <td>{item.abbr}</td>

                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn"
                          onClick={() =>
                            openEditModal(
                              item,
                              departments.findIndex(
                                (d) =>
                                  d.department ===
                                    item.department &&
                                  d.abbr === item.abbr
                              )
                            )
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button className="delete-btn"
                          onClick={() =>
                            deleteDepartment(
                              departments.findIndex(
                                (d) =>
                                  d.department ===
                                    item.department &&
                                  d.abbr === item.abbr
                              )
                            )
                          }
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#64748b",
                  }}
                >
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>
              {editIndex !== null
                ? "Edit Department"
                : "Add Department"}
            </h2>

            <input
              type="text"
              placeholder="Department Name"
              value={currentDepartment.department}
              onChange={(e) =>
                setCurrentDepartment({
                  ...currentDepartment,
                  department: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Department Abbreviation"
              value={currentDepartment.abbr}
              onChange={(e) =>
                setCurrentDepartment({
                  ...currentDepartment,
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
                onClick={saveDepartment}
              >
                {editIndex !== null
                  ? "Update Department"
                  : "Save Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}