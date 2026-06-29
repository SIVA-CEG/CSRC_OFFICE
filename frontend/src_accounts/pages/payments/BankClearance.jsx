import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

export default function BankClearance() {
  const [entries, setEntries] = useState([]);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("current_bank_entries") || "[]"
    );
    // Only debit entries that haven't been cleared yet
    const debits = data.filter(
      x => x.debitAmount > 0 && !x.cleared
    );
    setEntries(debits);
  }, []);

  const formatAmount = n =>
    Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const handleClear = (entry) => {
    // Mark as cleared in current_bank_entries
    const all = JSON.parse(
      localStorage.getItem("current_bank_entries") || "[]"
    );
    const updated = all.map(e =>
      e.id === entry.id ? { ...e, cleared: true } : e
    );
    localStorage.setItem("current_bank_entries", JSON.stringify(updated));

    // Remove from local display list
    setEntries(prev => prev.filter(e => e.id !== entry.id));
    setConfirmTarget(null);
  };

  return (
    <Layout title="Bank Clearance" subtitle="Payments / Bank Clearance">
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Bank Clearance</h2>
            <p style={styles.subtitle}>Debit entries pending clearance</p>
          </div>
          <div style={styles.stat}>{entries.length} Entries</div>
        </div>

        {/* Table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sl.No</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Account</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Reference</th>
                <th style={styles.th}>Debit Amount</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.empty}>
                    No debit entries pending clearance
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={entry.id} style={{ background: idx % 2 === 0 ? "#f8fafc" : "white" }}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>{entry.transactionDate}</td>
                    <td style={styles.td}>
                      <span style={styles.accountBadge}>{entry.account}</span>
                    </td>
                    <td style={{ ...styles.td, maxWidth: 260, wordBreak: "break-word" }}>
                      {entry.bankDescription}
                    </td>
                    <td style={styles.td}>{entry.bankReference || "—"}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: "#f43f5e" }}>
                      ₹ {formatAmount(entry.debitAmount)}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.clearBtn}
                        onClick={() => setConfirmTarget(entry)}
                      >
                        Clear
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmTarget && (
        <div style={styles.overlay} onClick={() => setConfirmTarget(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalAccent} />

            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Confirm Clearance</div>
              <button style={styles.closeBtn} onClick={() => setConfirmTarget(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalDesc}>
                Are you sure you want to clear this debit entry?
              </div>

              {/* Entry summary */}
              <div style={styles.entrySummary}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Date</span>
                  <span style={styles.summaryVal}>{confirmTarget.transactionDate}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Account</span>
                  <span style={styles.summaryVal}>{confirmTarget.account}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Description</span>
                  <span style={styles.summaryVal}>{confirmTarget.bankDescription}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Debit Amount</span>
                  <span style={{ ...styles.summaryVal, color: "#f43f5e", fontWeight: 700 }}>
                    ₹ {formatAmount(confirmTarget.debitAmount)}
                  </span>
                </div>
              </div>

              <div style={styles.modalNote}>
                ⚠️ This action will mark the entry as cleared. It cannot be undone from this screen.
              </div>

              <div style={styles.modalActions}>
                <button style={styles.cancelBtn} onClick={() => setConfirmTarget(null)}>
                  Cancel
                </button>
                <button style={styles.confirmBtn} onClick={() => handleClear(confirmTarget)}>
                  ✓ Confirm Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

  title: { fontSize: 28, fontWeight: 700 },

  subtitle: { color: "#64748b", marginTop: 4 },

  stat: {
    padding: "10px 16px",
    borderRadius: 12,
    background: "#34d399",
    color: "white",
    fontWeight: 700,
  },

  tableCard: {
    background: "white",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,.08)",
  },

  table: { width: "100%", borderCollapse: "collapse" },

  th: {
    background: "#0f172a",
    color: "white",
    padding: 16,
    textAlign: "left",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 13,
    color: "#334155",
  },

  empty: {
    textAlign: "center",
    padding: 40,
    color: "#94a3b8",
  },

  accountBadge: {
    padding: "3px 10px",
    borderRadius: 6,
    background: "rgba(52,211,153,0.12)",
    color: "#059669",
    fontSize: 11,
    fontWeight: 700,
    border: "1px solid rgba(52,211,153,0.3)",
  },

  clearBtn: {
    background: "linear-gradient(135deg,#34d399,#10b981)",
    border: "none",
    color: "white",
    padding: "9px 20px",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    boxShadow: "0 3px 12px rgba(52,211,153,0.35)",
  },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },

  modal: {
    background: "#ffffff",
    borderRadius: 20,
    width: "90%",
    maxWidth: 460,
    border: "1px solid #e2e8f0",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },

  modalAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    background: "linear-gradient(90deg,#34d399,#10b981,transparent)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "22px 24px 16px",
  },

  modalTitle: { fontSize: 17, fontWeight: 700, color: "#0f172a" },

  closeBtn: {
    width: 30, height: 30, borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: 13,
  },

  modalBody: {
    padding: "0 24px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  modalDesc: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.6,
  },

  entrySummary: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    flexShrink: 0,
  },

  summaryVal: {
    fontSize: 13,
    color: "#334155",
    textAlign: "right",
  },

  modalNote: {
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.2)",
    fontSize: 12,
    color: "#b45309",
  },

  modalActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 4,
  },

  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 9,
    border: "1px solid #e2e8f0",
    background: "transparent",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  confirmBtn: {
    padding: "10px 22px",
    borderRadius: 9,
    border: "none",
    background: "linear-gradient(135deg,#34d399,#10b981)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(52,211,153,0.35)",
  },
};