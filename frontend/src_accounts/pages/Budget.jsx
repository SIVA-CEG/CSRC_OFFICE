import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import budgetData from "../assets/budgetData.json";
import "./Budget.css";

const PAGE_SIZE = 10;

export default function Budget() {
  const [view, setView] = useState("23");
  const [search, setSearch] = useState("");

  const [digit23Filter, setDigit23Filter] = useState("");
  const [digit67Filter, setDigit67Filter] = useState("");

  const [page, setPage] = useState(1);

    const [isEditing, setIsEditing] = useState(false);
const [dataState, setDataState] = useState({
  digit23: budgetData.digit23 || [],
  digit45: budgetData.digit45 || [],
  digit67: budgetData.digit67 || [],
  digit89: budgetData.digit89 || [],
});




const digit23 = dataState.digit23;
const digit45 = dataState.digit45;
const digit67 = dataState.digit67;
const digit89 = dataState.digit89;


const toggleValue = (rowIndex, colIndex) => {
  if (!isEditing) return;

  const updated = structuredClone(dataState);

  let target;

  switch (view) {
    case "23":
      target = updated.digit23;
      break;
    case "45":
      target = updated.digit45;
      break;
    case "67":
      target = updated.digit67;
      break;
    case "89":
      target = updated.digit89;
      break;
    default:
      return;
  }

  const current = target[rowIndex][colIndex];

  target[rowIndex][colIndex] =
    current === "Y" ? "N" : "Y";

  setDataState(updated);
};


  const columns = {
    "23": [
      "Digit 2&3",
      "Digit 2&3 Title",
      "In Tally",
      "Revn",
      "Proj",
      "TSA",
      "CMRG",
      "MoPR",
      "TTDF",
    ],
    "45": [
      "Digit 2&3",
      "Digit 4&5",
      "Digit 4&5 Title",
      "In Tally",
      "Revn",
      "Proj",
      "TSA",
      "CMRG",
      "MoPR",
      "TTDF",
    ],
    "67": [
      "Digit 6&7",
      "Digit 6&7 Title",
      "In Tally",
      "Revn",
      "Proj",
      "TSA",
      "CMRG",
      "MoPR",
      "TTDF",
    ],
    "89": [
      "Digit 6&7",
      "Digit 8&9",
      "Digit 8&9 Title",
      "In Tally",
      "Revn",
      "Proj",
      "TSA",
      "CMRG",
      "MoPR",
      "TTDF",
    ],
  };

  const filteredData = useMemo(() => {
    let data = [];

    switch (view) {
      case "23":
        data = digit23;
        break;

      case "45":
        data = digit45.filter(
          (r) => !digit23Filter || r[0] === digit23Filter
        );
        break;

      case "67":
        data = digit67;
        break;

      case "89":
        data = digit89.filter(
          (r) => !digit67Filter || r[0] === digit67Filter
        );
        break;

      default:
        break;
    }

    if (search.trim()) {
      data = data.filter((row) =>
        row.join(" ").toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [
    view,
    search,
    digit23,
    digit45,
    digit67,
    digit89,
    digit23Filter,
    digit67Filter,
  ]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const pagedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const renderYN = (
  value,
  rowIndex,
  colIndex
) => {
  const val = value === "Y" ? "Y" : "N";

  return (
    <button
      type="button"
      disabled={!isEditing}
      className={`yn-badge ${val === "Y" ? "yes" : "no"} ${
        isEditing ? "editable" : ""
      }`}
      onClick={() =>
        toggleValue(rowIndex, colIndex)
      }
    >
      {val}
    </button>
  );
};

const renderRow = (row, rowIndex) => {
  return row.map((cell, idx) => {

    if (
      typeof cell === "string" &&
      (cell === "Y" ||
        cell === "N" ||
        cell === "")
    ) {
      return (
        <td key={idx}>
          {renderYN(cell, rowIndex, idx)}
        </td>
      );
    }

    return <td key={idx}>{cell}</td>;
  });
};

  return (
    <Layout title="Budget" subtitle="Budget Master Management">
      <div className="budget-page">

        <div className="budget-switcher">

  <div
    className={`budget-card ${view === "23" ? "active" : ""}`}
    onClick={() => {
      setView("23");
      setPage(1);
    }}
  >
    Digit 2&3
  </div>

  <div
    className={`budget-card ${view === "45" ? "active" : ""}`}
    onClick={() => {
      setView("45");
      setPage(1);
    }}
  >
    Digit 4&5
  </div>

  <div
    className={`budget-card ${view === "67" ? "active" : ""}`}
    onClick={() => {
      setView("67");
      setPage(1);
    }}
  >
    Digit 6&7
  </div>

  <div
    className={`budget-card ${view === "89" ? "active" : ""}`}
    onClick={() => {
      setView("89");
      setPage(1);
    }}
  >
    Digit 8&9
  </div>

</div>

        <div className="budget-toolbar">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          {view === "45" && (
            <select
              value={digit23Filter}
              onChange={(e) => setDigit23Filter(e.target.value)}
            >
              <option value="">All Digit 2&3</option>

              {digit23.map((d) => (
                <option key={d[0]} value={d[0]}>
                  {d[0]} - {d[1]}
                </option>
              ))}
            </select>
          )}

          {view === "89" && (
            <select
              value={digit67Filter}
              onChange={(e) => setDigit67Filter(e.target.value)}
            >
              <option value="">All Digit 6&7</option>

              {digit67.map((d) => (
                <option key={d[0]} value={d[0]}>
                  {d[0]} - {d[1]}
                </option>
              ))}
            </select>
          )}
        </div>

<div className="budget-actions">

  {!isEditing ? (
    <button
      className="edit-btn"
      onClick={() => setIsEditing(true)}
    >
      Edit
    </button>
  ) : (
    <>
      <button
        className="save-btn"
        onClick={() => {
          console.log(dataState);
          setIsEditing(false);
        }}
      >
        Save
      </button>

      <button
        className="cancel-btn"
        onClick={() => {
          setDataState({
            digit23: budgetData.digit23 || [],
            digit45: budgetData.digit45 || [],
            digit67: budgetData.digit67 || [],
            digit89: budgetData.digit89 || [],
          });

          setIsEditing(false);
        }}
      >
        Cancel
      </button>
    </>
  )}

</div>

<div className="budget-table-wrapper">
          <table className="budget-table">
            <thead>
              <tr>
                {columns[view].map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>

            <tbody>
{pagedData.map((row, index) => {
  const actualIndex = (page - 1) * PAGE_SIZE + index;

  return (
    <tr key={actualIndex}>
      {renderRow(row, actualIndex)}
    </tr>
  );
})}
</tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} / {Math.max(totalPages, 1)}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

      </div>
    </Layout>
  );
}