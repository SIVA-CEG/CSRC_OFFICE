import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import budgetData from "../assets/budgetData.json";
import "./Budget.css";

const PAGE_SIZE = 10;

const REQUESTS_KEY = "budgetChangeRequests";
const OVERRIDES_KEY = "budgetApprovedOverrides";
const VIEWS = ["digit23", "digit45", "digit67", "digit89"];

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; }
  catch { return {}; }
}

function loadRequests() {
  try { return JSON.parse(localStorage.getItem(REQUESTS_KEY)) || []; }
  catch { return []; }
}

function baseData() {
  return {
    digit23: budgetData.digit23 || [],
    digit45: budgetData.digit45 || [],
    digit67: budgetData.digit67 || [],
    digit89: budgetData.digit89 || [],
  };
}

function applyOverrides(base, overrides) {
  const cloned = structuredClone(base);
  VIEWS.forEach((v) => {
    const vOverrides = overrides[v] || {};
    Object.entries(vOverrides).forEach(([key, val]) => {
      const [r, c] = key.split("-").map(Number);
      if (cloned[v][r]) cloned[v][r][c] = val;
    });
  });
  return cloned;
}

export default function Budget() {
  const [view, setView] = useState("23");
  const [search, setSearch] = useState("");

  const [digit23Filter, setDigit23Filter] = useState("");
  const [digit67Filter, setDigit67Filter] = useState("");

  const [page, setPage] = useState(1);

    const [isEditing, setIsEditing] = useState(false);
const role = localStorage.getItem("userRole") || "assistant";
const userName = localStorage.getItem("userName") || "ast1";

const [dataState, setDataState] = useState(() =>
  applyOverrides(baseData(), loadOverrides())
);
const [pendingRequests, setPendingRequests] = useState(loadRequests);




const digit23 = dataState.digit23;
const digit45 = dataState.digit45;
const digit67 = dataState.digit67;
const digit89 = dataState.digit89;

const pendingCellMap = useMemo(() => {
  const map = {};
  pendingRequests
    .filter((r) => r.status === "pending")
    .forEach((r) =>
      r.changes.forEach((c) => {
        map[`${c.view}-${c.rowIndex}-${c.colIndex}`] = req;
      })
    );
  return map;
}, [pendingRequests]);


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

const renderYN = (value, rowIndex, colIndex) => {
  const val = value === "Y" ? "Y" : "N";
  const isPending = !!pendingCellMap[`${view}-${rowIndex}-${colIndex}`];

  return (
    <button
      type="button"
      disabled={!isEditing}
      className={`yn-badge ${val === "Y" ? "yes" : "no"} ${isEditing ? "editable" : ""}`}
      onClick={() => toggleValue(rowIndex, colIndex)}
      style={isPending ? { outline: "2px solid #f59e0b", outlineOffset: 2 } : undefined}
      title={isPending ? "Pending director approval" : undefined}
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
  <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
) : (
  <>
    <button
      className="save-btn"
      onClick={() => {
        if (role === "director") {
          const overrides = loadOverrides();
          VIEWS.forEach((v) => {
            overrides[v] = overrides[v] || {};
            dataState[v].forEach((row, rIdx) =>
              row.forEach((cell, cIdx) => {
                if (cell === "Y" || cell === "N") overrides[v][`${rIdx}-${cIdx}`] = cell;
              })
            );
          });
          localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
        } else {
          const baseline = applyOverrides(baseData(), loadOverrides());
          const changes = [];
          VIEWS.forEach((v) =>
            dataState[v].forEach((row, rIdx) =>
              row.forEach((cell, cIdx) => {
                const oldVal = baseline[v]?.[rIdx]?.[cIdx];
                if ((cell === "Y" || cell === "N") && cell !== oldVal) {
                  changes.push({ view: v, rowIndex: rIdx, colIndex: cIdx, oldValue: oldVal, newValue: cell });
                }
              })
            )
          );
          if (changes.length > 0) {
            const newRequest = {
              id: Date.now(),
              requestedBy: userName,
              timestamp: new Date().toISOString(),
              status: "pending",
              changes,
            };
            const updated = [...pendingRequests, newRequest];
            setPendingRequests(updated);
            localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
          }
          setDataState(baseline); // revert visible values until approved
        }
        setIsEditing(false);
      }}
    >
      {role === "director" ? "Save" : "Submit for Approval"}
    </button>

    <button
      className="cancel-btn"
      onClick={() => {
        setDataState(applyOverrides(baseData(), loadOverrides()));
        setIsEditing(false);
      }}
    >
      Cancel
    </button>
  </>
)}

</div>

{role === "director" && (
  <div style={{ margin: "16px 0", padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fafafa" }}>
    <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>
      Pending Budget Edit Requests
      {pendingRequests.filter((r) => r.status === "pending").length > 0 &&
        ` (${pendingRequests.filter((r) => r.status === "pending").length})`}
    </h3>

    {pendingRequests.filter((r) => r.status === "pending").length === 0 ? (
      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>No pending requests.</p>
    ) : (
      pendingRequests.filter((r) => r.status === "pending").map((req) => (
        <div key={req.id} style={{ padding: "10px 0", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            <strong>{req.requestedBy}</strong> requested {req.changes.length} change(s) ·{" "}
            <span style={{ color: "#9ca3af" }}>{new Date(req.timestamp).toLocaleString()}</span>
          </div>
          <ul style={{ margin: "0 0 8px", paddingLeft: 18, fontSize: 12, color: "#4b5563" }}>
            {req.changes.map((c, i) => (
              <li key={i}>[{c.view}] Row {c.rowIndex + 1}, Col {c.colIndex + 1}: {c.oldValue || "N"} → {c.newValue}</li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="save-btn"
              onClick={() => {
                const overrides = loadOverrides();
                req.changes.forEach((c) => {
                  overrides[c.view] = overrides[c.view] || {};
                  overrides[c.view][`${c.rowIndex}-${c.colIndex}`] = c.newValue;
                });
                localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
                const updated = pendingRequests.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r));
                setPendingRequests(updated);
                localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
                setDataState((prev) => applyOverrides(prev, overrides));
              }}
            >
              Approve
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                const updated = pendingRequests.map((r) => (r.id === req.id ? { ...r, status: "rejected" } : r));
                setPendingRequests(updated);
                localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ))
    )}
  </div>
)}

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