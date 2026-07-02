import React from "react";

export default function StaffDetailModalSA({ item, onClose }) {
  const rows = [
    ["Request Type", item.requestType],
    ["Staff Name", item.staffName],
    ["Designation", item.designation],
    ["Project", item.projectTitle],
    ["PI Name", item.piName],
    ["Order No", item.orderNo],
    ["Date", item.date],
    ["Status", item.status],
    ["Assigned To", item.assignedTo || "—"],
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,15,40,0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 560, padding: "26px 28px", boxShadow: "0 20px 60px rgba(15,15,40,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>
          Request Details — #{item.id}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px", marginTop: 20 }}>
          {rows.map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "#9ca3af" }}>
                {label}
              </div>
              <div style={{ fontSize: 13.5, color: "#111827", fontWeight: 500, marginTop: 3 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}