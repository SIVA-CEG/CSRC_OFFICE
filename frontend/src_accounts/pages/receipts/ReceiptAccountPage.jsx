import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import ReceiptForm from "./ReceiptForm";
import { useNavigate } from "react-router-dom";

export default function ReceiptAccountPage({
  accountName,
}) {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] =
    useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    if (role === "director") {
      navigate("/accounts/receipts");
    }
  }, []);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem(
        "current_bank_entries"
      ) || "[]"
    );

    const filtered = data.filter(
      x =>
        x.account === accountName &&
        !x.receiptCreated &&
        x.creditAmount > 0          // ← only credit entries
    );

    setEntries(filtered);
  }, [accountName]);

  const formatAmount = entry =>
    (entry.creditAmount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });

  return (
    <Layout
      title={`${accountName} Receipts`}
      subtitle={`Receipts / ${accountName}`}
    >
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              {accountName} Receipts
            </h2>

            <p style={styles.subtitle}>
              Bank entries awaiting receipt
              processing
            </p>
          </div>

          <div style={styles.stat}>
            {entries.length} Entries
          </div>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sl.No</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Reference</th>
                <th style={styles.th}>Credit Amount</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.empty}>
                    No credit entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>{entry.transactionDate}</td>
                    <td style={styles.td}>{entry.bankDescription}</td>
                    <td style={styles.td}>{entry.bankReference || "—"}</td>
                    <td
                      style={{
                        ...styles.td,
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#10b981",
                      }}
                    >
                      ₹ {formatAmount(entry)}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        Create Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedEntry && (
          <ReceiptForm
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>
    </Layout>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
  },

  subtitle: {
    color: "#64748b",
    marginTop: 4,
  },

  stat: {
    padding: "10px 16px",
    borderRadius: 12,
    background: "#10b981",
    color: "white",
    fontWeight: 700,
  },

  tableCard: {
    background: "white",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#0f172a",
    color: "white",
    padding: 16,
    textAlign: "left",
  },

  td: {
    padding: 16,
    borderBottom: "1px solid #e2e8f0",
  },

  empty: {
    textAlign: "center",
    padding: 40,
    color: "#94a3b8",
  },

  actionBtn: {
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    border: "none",
    color: "white",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
};