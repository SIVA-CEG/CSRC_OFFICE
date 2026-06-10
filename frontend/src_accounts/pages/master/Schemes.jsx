import React, { useState } from "react";
import "./Schemes.css";

const initialSchemes = [
  {
    schemeCode: "4211",
    schemeName: "Advanced Research Grant (ARG) Program",
    accountType: "TSA(H)",
    bank: "UNION BANK OF INDIA",
    accountNo: "349902010052015",
    mobile: "0",
  },
  {
    schemeCode: "0150",
    schemeName: "BIOTECH RESEARCH AND DEVELOPMENT",
    accountType: "ZBA",
    bank: "ICICI BANK",
    accountNo: "000105037681",
    mobile: "0",
  },
  {
    schemeCode: "4306",
    schemeName:
      "Biotechnology Research Innovation and Entrepreneurship Development (Bio-Ride)",
    accountType: "ZBA",
    bank: "ICICI BANK",
    accountNo: "000105037681",
    mobile: "0",
  },
  {
    schemeCode: "1827",
    schemeName: "Capacity Building and Human Resources Development",
    accountType: "TSA(H)",
    bank: "STATE BANK OF INDIA",
    accountNo: "43549381038",
    mobile: "0",
  },
  {
    schemeCode: "4197",
    schemeName: "Capacity Building and Skill Development Scheme",
    accountType: "ZBA",
    bank: "RESERVE BANK OF INDIA",
    accountNo: "10687701262",
    mobile: "0",
  },
  {
    schemeCode: "3989",
    schemeName:
      "CONSERVATION DEVELOPMENT AND SUSTAINABLE MANAGEMENT OF MEDICINAL PLANTS",
    accountType: "ZBA",
    bank: "STATE BANK OF INDIA",
    accountNo: "41676562772",
    mobile: "0",
  },
  {
    schemeCode: "1023",
    schemeName: "Core Research Grant (erstwhile SERB Scheme)",
    accountType: "TSA(H)",
    bank: "UNION BANK OF INDIA, SDA",
    accountNo: "349902010052378",
    mobile: "0",
  },
  {
    schemeCode: "0538",
    schemeName: "Cyber Security Projects (NCCC & Others)",
    accountType: "ZBA",
    bank: "RESERVE BANK OF INDIA",
    accountNo: "10687701461",
    mobile: "0",
  },
  {
    schemeCode: "1819",
    schemeName: "Innovation, Technology, Development and Deployment",
    accountType: "ZBA",
    bank: "UNION BANK OF INDIA",
    accountNo: "70312010000105",
    mobile: "0",
  },
  {
    schemeCode: "3655",
    schemeName: "O-SMART",
    accountType: "ZBA",
    bank: "CANARA BANK",
    accountNo: "110114748456",
    mobile: "0",
  },
  {
    schemeCode: "4308",
    schemeName: "Prithvi Vighyan (Prithvi)",
    accountType: "ZBA",
    bank: "CANARA BANK",
    accountNo: "110114748456",
    mobile: "0",
  },
  {
    schemeCode: "3943",
    schemeName: "PUBLIC HEALTH ENGINEERING (PHE) SECTOR DEPARTMENT",
    accountType: "ZBA",
    bank: "INDIAN BANK",
    accountNo: "7454683896",
    mobile: "0",
  },
  {
    schemeCode: "2354",
    schemeName: "R and D in IT/Electronics/CCBT",
    accountType: "ZBA",
    bank: "RESERVE BANK OF INDIA",
    accountNo: "10687701067",
    mobile: "0",
  },
  {
    schemeCode: "3237",
    schemeName: "Research & Development",
    accountType: "ZBA",
    bank: "BANK OF MAHARASHTRA",
    accountNo: "60421798582",
    mobile: "0",
  },
  {
    schemeCode: "1166",
    schemeName:
      "Research & Development Programme in Water Sector and Implementation of National Water Mission",
    accountType: "ZBA",
    bank: "STATE BANK OF INDIA",
    accountNo: "41394101312",
    mobile: "0",
  },
  {
    schemeCode: "1166A",
    schemeName:
      "Research and Development and Implementation of National Water Mission",
    accountType: "ZBA",
    bank: "STATE BANK OF INDIA",
    accountNo: "41394401312",
    mobile: "0",
  },
  {
    schemeCode: "1817",
    schemeName: "S & T Institutional And Human Capacity Building",
    accountType: "ZBA",
    bank: "BANK OF MAHARASHTRA",
    accountNo: "60424806080",
    mobile: "0",
  },
  {
    schemeCode: "3668",
    schemeName:
      "Scheme for Transformation and Advanced Research in Sciences",
    accountType: "ZBA",
    bank: "STATE BANK OF INDIA",
    accountNo: "41119661474",
    mobile: "0",
  },
  {
    schemeCode: "2792",
    schemeName: "Space Science Promotion",
    accountType: "ZBA",
    bank: "STATE BANK OF INDIA",
    accountNo: "42804026343",
    mobile: "0",
  },
  {
    schemeCode: "3614",
    schemeName: "SPARC",
    accountType: "ZBA",
    bank: "STATE BANK OF INDIA",
    accountNo: "41257726976",
    mobile: "0",
  },
  {
    schemeCode: "4305",
    schemeName: "Vigyan Dhara",
    accountType: "ZBA",
    bank: "UNION BANK OF INDIA",
    accountNo: "070312010000105",
    mobile: "0",
  },
];

export default function Schemes() {
  const [schemes, setSchemes] = useState(initialSchemes);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [newScheme, setNewScheme] = useState({
    schemeCode: "",
    schemeName: "",
    accountType: "",
    bank: "",
    accountNo: "",
    mobile: "",
  });

  const addScheme = () => {
    setError("");

    if (
      !newScheme.schemeCode ||
      !newScheme.schemeName ||
      !newScheme.accountType ||
      !newScheme.bank
    ) {
      setError("Please fill all required fields");
      return;
    }

    const codeExists = schemes.some(
      (item) =>
        item.schemeCode.trim().toLowerCase() ===
        newScheme.schemeCode.trim().toLowerCase()
    );

    if (codeExists) {
      setError("Scheme code already exists");
      return;
    }

    const nameExists = schemes.some(
      (item) =>
        item.schemeName.trim().toLowerCase() ===
        newScheme.schemeName.trim().toLowerCase()
    );

    if (nameExists) {
      setError("Scheme name already exists");
      return;
    }

    setSchemes([...schemes, newScheme]);

    setNewScheme({
      schemeCode: "",
      schemeName: "",
      accountType: "",
      bank: "",
      accountNo: "",
      mobile: "",
    });

    setShowModal(false);
  };

  const deleteScheme = (code) => {
    if (window.confirm("Delete this scheme?")) {
      setSchemes(schemes.filter((s) => s.schemeCode !== code));
    }
  };

  const filteredSchemes = schemes.filter(
    (item) =>
      item.schemeCode.toLowerCase().includes(search.toLowerCase()) ||
      item.schemeName.toLowerCase().includes(search.toLowerCase()) ||
      item.bank.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="scheme-page">
      <div className="scheme-header">
        <div>
          <h1>📄 Scheme Management</h1>
          <p>Manage research schemes and funding programmes</p>
        </div>

        <button
          className="add-scheme-btn"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          + Add Scheme
        </button>
      </div>

      <div className="scheme-stats">
        <div className="stat-card">
          <h2>{schemes.length}</h2>
          <p>Total Schemes</p>
        </div>

        <div className="stat-card">
          <h2>{filteredSchemes.length}</h2>
          <p>Search Results</p>
        </div>

        <div className="stat-card">
          <h2>{[...new Set(schemes.map((s) => s.bank))].length}</h2>
          <p>Banks</p>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search Scheme..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="scheme-table-container">
        <table className="scheme-table">
          <thead>
            <tr>
              <th>Scheme Code</th>
              <th>Scheme Name</th>
              <th>A/C Type</th>
              <th>Bank</th>
              <th>A/C No.</th>
              <th>Mobile</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredSchemes.map((item) => (
              <tr key={item.schemeCode}>
                <td>{item.schemeCode}</td>
                <td>{item.schemeName}</td>
                <td>{item.accountType}</td>
                <td>{item.bank}</td>
                <td>{item.accountNo}</td>
                <td>{item.mobile}</td>

                <td>
                  <button className="edit-btn">✏️</button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteScheme(item.schemeCode)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Add New Scheme</h2>

            <input
              placeholder="Scheme Code"
              value={newScheme.schemeCode}
              onChange={(e) =>
                setNewScheme({
                  ...newScheme,
                  schemeCode: e.target.value,
                })
              }
            />

            <input
              placeholder="Scheme Name"
              value={newScheme.schemeName}
              onChange={(e) =>
                setNewScheme({
                  ...newScheme,
                  schemeName: e.target.value,
                })
              }
            />

            <input
              placeholder="A/C Type"
              value={newScheme.accountType}
              onChange={(e) =>
                setNewScheme({
                  ...newScheme,
                  accountType: e.target.value,
                })
              }
            />

            <input
              placeholder="Bank"
              value={newScheme.bank}
              onChange={(e) =>
                setNewScheme({
                  ...newScheme,
                  bank: e.target.value,
                })
              }
            />

            <input
              placeholder="Account Number"
              value={newScheme.accountNo}
              onChange={(e) =>
                setNewScheme({
                  ...newScheme,
                  accountNo: e.target.value,
                })
              }
            />

            <input
              placeholder="Mobile"
              value={newScheme.mobile}
              onChange={(e) =>
                setNewScheme({
                  ...newScheme,
                  mobile: e.target.value,
                })
              }
            />

            {error && (
              <div className="scheme-error">
                ⚠️ {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={addScheme}
              >
                Save Scheme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}