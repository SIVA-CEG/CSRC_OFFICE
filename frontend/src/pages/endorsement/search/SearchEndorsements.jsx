import { useState, useEffect } from "react";
import "./SearchEndorsements.css";
import "../components/StatusBadge.css";
import StatusBadge from "../components/StatusBadge";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// ── Data ──────────────────────────────────────────────────────────────────
const FUNDING_AGENCIES = [
  "AICTE",
  "ANRF",
  "ARG",
  "CSIR",
  "CSIR-ASPIRE",
  "DBT",
  "DBT-BIRAC",
  "DRDO",
  "DST",
  "ICMR",
  "ICSSR",
  "IGSTC",
  "ISRO",
  "MeitY",
  "MNRE",
  "NABARD",
  "SERB",
  "SERB POWER",
  "SERB-SURE",
  "SPARC",
  "TANII",
  "UGC",
].sort();

const PROJECT_SCHEMES = [
  "Core Research Grant",
  "CRG",
  "DST SURE",
  "SERB-SURE",
  "CMRG",
  "ANRF MISSION AI",
  "MATRICS",
  "SRG",
  "TARE",
  "RESPOND BASKET",
  "POWER",
  "SPARC",
  "Science Technology Innovation Hub for SC & ST",
].sort();

const CAMPUSES = ["CEG Campus", "ACT Campus", "SAP Campus", "MIT Campus"];
const DEPARTMENTS = {
  "CEG Campus": [
    "Mechanical Engineering",
    "Civil Engineering",
    "Computer Science",
    "Chemistry",
    "Physics",
    "Information Science And Technology",
    "Production Technology",
  ],
  "ACT Campus": [
    "Chemical Engineering",
    "Biotechnology",
    "Crystal Growth Centre",
  ],
  "SAP Campus": ["Architecture", "Planning"],
  "MIT Campus": [
    "Production Technology",
    "Manufacturing Engineering",
    "Automobile Engineering",
  ],
};

const DUMMY_ALL = [
  {
    id: 1895,
    appliedOn: "27-05-2026",
    tapalNo: "",
    piName: "Dr. Shubra Singh",
    piDept: "Crystal Growth Centre",
    piCampus: "ACT Campus",
    fundingAgency: "SERB",
    projectScheme: "Core Research Grant",
    fundingType: "Central Govt",
    calculatedTotal: 4524100,
    status: "PENDING",
  },
  {
    id: 1894,
    appliedOn: "27-05-2026",
    tapalNo: "",
    piName: "Dr. P. Geetha",
    piDept: "Information Science And Technology",
    piCampus: "CEG Campus",
    fundingAgency: "DST",
    projectScheme: "Core Research Grant {CRG}",
    fundingType: "Central Govt",
    calculatedTotal: 2995650,
    status: "PENDING",
  },
  {
    id: 1886,
    appliedOn: "16-05-2026",
    tapalNo: "TL-2026-0042",
    piName: "Dr. V. Mugendiran",
    piDept: "Production Technology",
    piCampus: "MIT Campus",
    fundingAgency: "MeitY",
    projectScheme: "Science Technology Innovation Hub for SC & ST",
    fundingType: "Central Govt",
    calculatedTotal: 29542419,
    status: "PENDING",
  },
  {
    id: 1880,
    appliedOn: "10-05-2026",
    tapalNo: "TL-2026-0039",
    piName: "Dr. R. Kavitha",
    piDept: "Chemistry",
    piCampus: "CEG Campus",
    fundingAgency: "SERB",
    projectScheme: "TARE",
    fundingType: "Central Govt",
    calculatedTotal: 1851000,
    status: "PROCESSING",
  },
  {
    id: 1872,
    appliedOn: "02-05-2026",
    tapalNo: "TL-2026-0031",
    piName: "Dr. S. Anand",
    piDept: "Biotechnology",
    piCampus: "ACT Campus",
    fundingAgency: "DBT-BIRAC",
    projectScheme: "CRG",
    fundingType: "Central Govt",
    calculatedTotal: 6200000,
    status: "APPROVED",
  },
  {
    id: 1865,
    appliedOn: "22-04-2026",
    tapalNo: "TL-2026-0024",
    piName: "Dr. T. Priya",
    piDept: "Architecture",
    piCampus: "SAP Campus",
    fundingAgency: "TANII",
    projectScheme: "TANII",
    fundingType: "State Govt",
    calculatedTotal: 980000,
    status: "APPROVED",
  },
  {
    id: 1850,
    appliedOn: "10-04-2026",
    tapalNo: "TL-2026-0011",
    piName: "Dr. M. Rajan",
    piDept: "Civil Engineering",
    piCampus: "CEG Campus",
    fundingAgency: "ICMR",
    projectScheme: "MATRICS",
    fundingType: "Central Govt",
    calculatedTotal: 3400000,
    status: "RETURNED",
  },
];

function formatCurrency(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function parseDMY(dmy) {
  if (!dmy) return null;
  const [d, m, y] = dmy.split("-");
  return new Date(`${y}-${m}-${d}`);
}

export default function SearchEndorsements({ onBack }) {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    fundingAgency: "",
    projectScheme: "",
    fundingType: "",
    dateFrom: "",
    dateTo: "",
    tapalNo: "",
    facultyName: "",
    department: "",
    campus: "",
  });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [depts, setDepts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const RECORDS_PER_PAGE = 5;
  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const setF = (k, v) => {
    setFilters((f) => ({ ...f, [k]: v }));
    if (k === "campus") setDepts(DEPARTMENTS[v] || []);
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5100/api/endorsements/search",
        {
          params: filters,
        },
      );

      setResults(res.data);
      setCurrentPage(1);
      setSearched(true);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    }
  };

  const handleClear = () => {
    setFilters({
      fundingAgency: "",
      projectScheme: "",
      fundingType: "",
      dateFrom: "",
      dateTo: "",
      tapalNo: "",
      facultyName: "",
      department: "",
      campus: "",
    });
    setResults([]);
    setSearched(false);
    setDepts([]);
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(results.length / RECORDS_PER_PAGE);

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

  const currentRecords = results.slice(
    startIndex,
    startIndex + RECORDS_PER_PAGE,
  );
  return (
    <div className={`se-page ${mounted ? "se-loaded" : ""}`}>
      {/* Top Nav */}
      <div className="se-top-nav">
        <button
          className="se-btn-back"
          onClick={() => navigate("/endorsements/dashboard")}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Page Header */}
      <div className="se-header">
        <h1 className="se-header-title">Search Endorsements</h1>
        <p className="se-header-sub">
          Filter and query all endorsement records across campuses and agencies
        </p>
      </div>

      {/* Filter Panel */}
      <div className="se-filter-panel">
        <div className="se-filter-head">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          Search Filters
        </div>

        <div className="se-filter-grid">
          {/* Funding Agency */}
          <div className="se-field">
            <label className="se-label">Funding Agency</label>
            <select
              className="se-select"
              value={filters.fundingAgency}
              onChange={(e) => setF("fundingAgency", e.target.value)}
            >
              <option value="">All Agencies</option>
              {FUNDING_AGENCIES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Project Scheme */}
          <div className="se-field">
            <label className="se-label">Project Scheme</label>
            <input
              className="se-input"
              placeholder="Type to search scheme..."
              value={filters.projectScheme}
              onChange={(e) => setF("projectScheme", e.target.value)}
              list="scheme-list"
            />
            <datalist id="scheme-list">
              {PROJECT_SCHEMES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* Agency Type */}
          <div className="se-field">
            <label className="se-label">Agency Type</label>
            <select
              className="se-select"
              value={filters.fundingType}
              onChange={(e) => setF("fundingType", e.target.value)}
            >
              <option value="">All Types</option>
              {["Central Govt", "State Govt", "Private", "Individual"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </select>
          </div>

          {/* Tapal No */}
          <div className="se-field">
            <label className="se-label">Tapal No</label>
            <input
              className="se-input"
              placeholder="e.g. TL-2026-0042"
              value={filters.tapalNo}
              onChange={(e) => setF("tapalNo", e.target.value)}
            />
          </div>

          {/* Date From */}
          <div className="se-field">
            <label className="se-label">Proposal Date — From</label>
            <input
              type="date"
              className="se-input"
              value={filters.dateFrom}
              onChange={(e) => setF("dateFrom", e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="se-field">
            <label className="se-label">Proposal Date — To</label>
            <input
              type="date"
              className="se-input"
              value={filters.dateTo}
              onChange={(e) => setF("dateTo", e.target.value)}
            />
          </div>

          {/* Faculty Name */}
          <div className="se-field">
            <label className="se-label">Faculty Name</label>
            <input
              className="se-input"
              placeholder="Dr. Name..."
              value={filters.facultyName}
              onChange={(e) => setF("facultyName", e.target.value)}
            />
          </div>

          {/* Campus */}
          <div className="se-field">
            <label className="se-label">Campus</label>
            <select
              className="se-select"
              value={filters.campus}
              onChange={(e) => setF("campus", e.target.value)}
            >
              <option value="">All Campuses</option>
              {CAMPUSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="se-field">
            <label className="se-label">Department</label>
            {filters.campus ? (
              <select
                className="se-select"
                value={filters.department}
                onChange={(e) => setF("department", e.target.value)}
              >
                <option value="">All Departments</option>
                {depts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            ) : (
              <input
                className="se-input"
                placeholder="Select campus first or type..."
                value={filters.department}
                onChange={(e) => setF("department", e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="se-filter-actions">
          <button className="se-btn-search" onClick={handleSearch}>
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search Records
          </button>
          <button className="se-btn-clear" onClick={handleClear}>
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="se-results">
          <div className="se-results-head">
            <span className="se-results-label">
              {results.length === 0
                ? "No records found"
                : `${results.length} record${results.length > 1 ? "s" : ""} found`}
            </span>
          </div>

          {results.length > 0 && (
            <div className="se-table-wrap">
              <table className="se-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Prop ID</th>
                    <th>Applied On</th>
                    <th>Tapal No</th>
                    <th>PI / Department</th>
                    <th>Campus</th>
                    <th>Funding Agency</th>
                    <th>Scheme</th>

                    <th>Cost (₹)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((row, i) => (
                    <tr key={row.id} className="se-row">
                      <td className="se-sl">{startIndex + i + 1}</td>
                      <td className="se-id">{row.id}</td>

                      <td className="se-date">
                        {row.applied_on
                          ? new Date(row.applied_on).toLocaleDateString("en-GB")
                          : "-"}
                      </td>

                      <td className="se-tapal">
                        {row.reference_number || (
                          <span className="se-empty">—</span>
                        )}
                      </td>

                      <td className="se-pi">
                        <div className="se-pi-name">
                          {row.staff_name || "-"}
                        </div>
                        <div className="se-pi-dept">
                          {row.department || "-"}
                        </div>
                      </td>

                      <td className="se-campus">{row.campus || "-"}</td>

                      <td className="se-agency">{row.funding_agency || "-"}</td>

                      <td className="se-scheme">{row.scheme || "-"}</td>

                      <td className="se-cost">
                        {formatCurrency(row.total_amount)}
                      </td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="se-pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              First
            </button>

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              Last
            </button>
          </div>
          {results.length === 0 && (
            <div className="se-no-results">
              <svg
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                opacity="0.3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p>
                No endorsements match the selected filters. Try broadening your
                search criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
