import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import ReceiptEditDrawer from "./ReceiptEditDrawer";

import {
  getReceipts,
  filterReceipts,
  calculateTotals,
  buildUnicode,
} from "./ReceiptReportService";

import {
  exportToCSV,
  previewPDF,
  downloadPDF,
} from "./ReceiptExportService";    

const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const FINANCIAL_YEARS = [
  "",
  "2023-2024",
  "2024-2025",
  "2025-2026",
  "2026-2027",
];

const ACCOUNTS = [
  "",
  "Project",
  "Revenue",
  "MOPR",
  "TTDF",
  "Tax",
];

export default function MonthWiseReceiptReport() {
    const navigate = useNavigate();
  const [month, setMonth] = useState("");
  const [financialYear, setFinancialYear] =
  useState("");

  const [account, setAccount] =
  useState("");

  const [search, setSearch] =
    useState("");

  const [rows, setRows] =
    useState([]);

useEffect(() => {
  const load = () => {
    setRows(getReceipts());
  };

  load();

  window.addEventListener(
    "receipt-created",
    load
  );

  return () =>
    window.removeEventListener(
      "receipt-created",
      load
    );
}, []);

  const [selectedReceipt, setSelectedReceipt] =
  useState(null);

const [drawerOpen, setDrawerOpen] =
  useState(false);

  const openEditor = row => {
  setSelectedReceipt(row);
  setDrawerOpen(true);
};

const saveReceipt = updated => {
  const updatedRows = rows.map(r =>
    r.id === updated.id
      ? updated
      : r
  );

  setRows(updatedRows);

  localStorage.setItem(
    "receipt_entries",
    JSON.stringify(
      updatedRows
    )
  );

  setDrawerOpen(false);
};



const filteredRows = useMemo(
  () =>
    filterReceipts({
      receipts: rows,
      account,
      month,
      financialYear,
      search,
    }),
  [
    rows,
    account,
    month,
    financialYear,
    search,
  ]
);

const totals =
  calculateTotals(filteredRows);

  return (
    <Layout
      title="Month Wise Report"
      subtitle="Receipts / Reports"
    >
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <h1 style={styles.heading}>
              Receipt Reports
            </h1>

            <p style={styles.desc}>
              Analyze receipts by
              month, financial
              year and account.
            </p>
          </div>
        </div>

        <div style={styles.filterCard}>
          <div style={styles.filterGrid}>
            <Select
              label="Month"
              value={month}
              onChange={setMonth}
              options={MONTHS}
            />

            <Select
              label="Financial Year"
              value={
                financialYear
              }
              onChange={
                setFinancialYear
              }
              options={
                FINANCIAL_YEARS
              }
            />

            <Select
              label="Account"
              value={account}
              onChange={setAccount}
              options={ACCOUNTS}
            />

            <div>
              <label
                style={
                  styles.label
                }
              >
                Search
              </label>

              <input
                style={
                  styles.input
                }
                value={search}
                onChange={e =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search..."
              />
            </div>
          </div>
        </div>

        <div style={styles.cards}>
          <StatCard
  title="Receipts"
  value={totals.count}
/>

<StatCard
  title="Amount"
  value={`₹ ${totals.amount.toLocaleString("en-IN")}`}
/>

<StatCard
  title="Project"
  value={totals.project}
/>

<StatCard
  title="Revenue"
  value={totals.revenue}
/>

<StatCard
  title="MOPR"
  value={totals.mopr}
/>

<StatCard
  title="TTDF"
  value={totals.ttdf}
/>

<StatCard
  title="Tax"
  value={totals.tax}
/>

        </div>

        <div style={styles.actionBar}>
  <button
    style={styles.exportBtn}
    onClick={() =>
      exportToCSV(filteredRows)
    }
  >
    Export CSV
  </button>

<button
  style={styles.previewBtn}
  onClick={() =>
    previewPDF(filteredRows)
  }
>
  Preview PDF
</button>

<button
  style={styles.downloadBtn}
  onClick={() =>
    downloadPDF(filteredRows)
  }
>
  Download PDF
</button>
</div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Sl.No
                </th>

                <th style={styles.th}>
                  Head
                </th>

                <th style={styles.th}>
                  Unicode
                </th>

                <th style={styles.th}>
                  Txn Date
                </th>

                <th style={styles.th}>
                  M.H.No
                </th>

                <th style={styles.th}>
                  File No
                </th>

                <th style={styles.th}>
                  Acct On
                </th>

                <th style={styles.th}>
                  Amount
                </th>

                <th style={styles.th}>
                  Remarks
                </th>

                <th style={styles.th}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map(
                (row, idx) => (
                  <tr
                    key={row.id}
                  >
                    <td
                      style={
                        styles.td
                      }
                    >
                      {idx + 1}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {
                        row.receiptHead
                      }
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {buildUnicode(row)}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {
                        row.transactionDate
                      }
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {row.mhNo}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {
                        row.fileNo
                      }
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {
                        row.accountOn
                      }
                    </td>

                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 700,
                        textAlign:
                          "right",
                      }}
                    >
                      ₹
                      {Number(
                        row.amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >
                      {
                        row.remarks
                      }
                    </td>

                    <td
                      style={
                        styles.td
                      }
                    >

                    
<div style={styles.actionBtns}>
<button
  style={styles.viewBtn}
  onClick={() =>
    navigate(
      `/accounts/receipts/report/${row.id}`
    )
  }
>
  View
</button>

  <button
    style={styles.editBtn}
    onClick={() =>
      openEditor(row)
    }
  >
    Edit
  </button>
</div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptEditDrawer
  open={drawerOpen}
  receipt={selectedReceipt}
  onClose={() =>
    setDrawerOpen(false)
  }
  onSave={saveReceipt}
/>
    </Layout>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label style={styles.label}>
        {label}
      </label>

      <select
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        style={styles.input}
      >
        {options.map(option => (
  <option
    key={option || "all"}
    value={option}
  >
    {option || "All"}
  </option>
))}
      </select>
    </div>
  );
}

function StatCard({
  title,
  value,
}) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statTitle}>
        {title}
      </span>

      <span style={styles.statValue}>
        {value}
      </span>
    </div>
  );
}



const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  hero: {
    background:
      "linear-gradient(135deg,#0f172a,#1e3a8a)",
    color: "white",
    padding: 28,
    borderRadius: 24,
  },

  heading: {
    fontSize: 30,
    fontWeight: 800,
  },

  desc: {
    opacity: .8,
    marginTop: 6,
  },

  filterCard: {
    background: "white",
    borderRadius: 20,
    padding: 20,
    boxShadow:
      "0 8px 30px rgba(0,0,0,.08)",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4,1fr)",
    gap: 20,
  },

cards: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
},

statCard: {
  background: "#ffffff",
  borderRadius: 16,
  padding: "14px 18px",
  minHeight: 82,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(15,23,42,.05)",
  transition: "all .2s ease",
},

statTitle: {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: ".5px",
},

statValue: {
  fontSize: 24,
  fontWeight: 800,
  marginTop: 6,
  color: "#0f172a",
},

  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 600,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
  },

  tableCard: {
    background: "white",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow:
      "0 8px 30px rgba(0,0,0,.08)",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  th: {
    background: "#0f172a",
    color: "white",
    padding: 14,
    textAlign: "left",
  },

  td: {
    padding: 14,
    borderBottom:
      "1px solid #e2e8f0",
  },

  editBtn: {
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
    border: "none",
    color: "white",
    padding:
      "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
  actionBar: {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
},

exportBtn: {
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  color: "white",
  fontWeight: 700,
  background:
    "linear-gradient(135deg,#10b981,#059669)",
},

previewBtn: {
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  fontWeight: 700,
  background:
    "linear-gradient(135deg,#7c3aed,#6d28d9)",
},

downloadBtn: {
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  fontWeight: 700,
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
},

actionBtns: {
  display: "flex",
  gap: 8,
},

viewBtn: {
  background:
    "linear-gradient(135deg,#64748b,#475569)",
  border: "none",
  color: "white",
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
},
};