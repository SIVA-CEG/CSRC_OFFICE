import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BILL_TYPES = [
  {
    key: "recurring",
    label: "Recurring Bills",
    icon: "🔁",
    description: "Periodic and repeating expense bills (salaries, rent, utilities)",
    color: "#0f766e",
    bg: "linear-gradient(135deg,#ccfbf1,#f0fdfa)",
    border: "#99f6e4",
  },
  {
    key: "non-recurring",
    label: "Non-Recurring Bills",
    icon: "📄",
    description: "One-time expenses across multiple budget heads",
    color: "#b45309",
    bg: "linear-gradient(135deg,#fef3c7,#fffbeb)",
    border: "#fde68a",
  },
];

const RECURRING_HEADS = [
  { key: "manpower", label: "Manpower", icon: "👥", color: "#0f766e", bg: "linear-gradient(135deg,#ccfbf1,#f0fdfa)", border: "#99f6e4" },
  { key: "consumables", label: "Consumables", icon: "🧪", color: "#1d4ed8", bg: "linear-gradient(135deg,#dbeafe,#eff6ff)", border: "#bfdbfe" },
  { key: "contingency", label: "Contingency", icon: "🛡️", color: "#7c3aed", bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)", border: "#ddd6fe" },
  { key: "travel", label: "Travel", icon: "✈️", color: "#b45309", bg: "linear-gradient(135deg,#fef3c7,#fffbeb)", border: "#fde68a" },
  { key: "other", label: "Other", icon: "📦", color: "#be185d", bg: "linear-gradient(135deg,#fce7f3,#fdf2f8)", border: "#fbcfe8" },
];

function BillTable({ title }) {
  return (
    <div className="card" style={{ margin: 0 }}>
      <div className="card-header">
        <div>
          <h3>{title}</h3>
          <p>Bills recorded under this budget head</p>
        </div>
        <button className="btn btn-primary btn-sm">+ Add Bill</button>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sl.No.</th>
              <th>Bill ID</th>
              <th>Project Title</th>
              <th>PI Name</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-icon">🧾</div>
                  <h4>No bills found</h4>
                  <p>Records will appear here once added.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="table-footer">0 records</div>
    </div>
  );
}

function RecurringSection() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      {selected && (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setSelected(null)}
          style={{ marginBottom: 16 }}
        >
          ← Back to Budget Heads
        </button>
      )}

      {!selected && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--primary-dark)" }}>
  Recurring Bills
</div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
              Select a budget head to view bills
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {RECURRING_HEADS.map((head) => (
              <button
                key={head.key}
                onClick={() => setSelected(head.key)}
                style={{
                  background: head.bg,
                  border: `1.5px solid ${head.border}`,
                  borderRadius: 18,
                  padding: "22px 20px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 14px 30px ${head.border}bb`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{head.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: head.color }}>
                  {head.label}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12.5,
                    color: head.color,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  View Bills →
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {selected && (
        <BillTable
          title={`${RECURRING_HEADS.find((h) => h.key === selected)?.label} Bills`}
        />
      )}
    </div>
  );
}

export default function BillsTapal() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-body">
      <div className="page-stack">
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() =>
              selected ? setSelected(null) : navigate("/tapal/projects")
            }
            style={{ marginBottom: 14 }}
          >
            ← {selected ? "Back to Bill Types" : "Back to Projects"}
          </button>
          <div className="page-title">Bills</div>
          <div className="page-subtitle">
            {selected
              ? `Managing: ${BILL_TYPES.find((b) => b.key === selected)?.label}`
              : "Select a bill category to continue"}
          </div>
        </div>

        {!selected && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 22,
            }}
          >
            {BILL_TYPES.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelected(type.key)}
                style={{
                  background: type.bg,
                  border: `1.5px solid ${type.border}`,
                  borderRadius: 22,
                  padding: "30px 26px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 18px 40px ${type.border}aa`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 42, marginBottom: 14 }}>{type.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: type.color, marginBottom: 6 }}>
                  {type.label}
                </div>
                <div style={{ fontSize: 14, color: "#4b5563", fontWeight: 600, lineHeight: 1.5 }}>
                  {type.description}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: type.color,
                    fontSize: 13.5,
                    fontWeight: 800,
                  }}
                >
                  Open <span style={{ fontSize: 16 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected === "recurring" && <RecurringSection />}
{selected === "non-recurring" && (
  <BillTable title="Non-Recurring Bills" />
)}
      </div>
    </div>
  );
}