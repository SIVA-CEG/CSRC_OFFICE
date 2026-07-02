import React from "react";

export default function StaffIndividualReportModalSA({ item, onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,15,40,0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 520, padding: "26px 28px", boxShadow: "0 20px 60px rgba(15,15,40,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>
          Completion Report — #{item.id}
        </h3>

        <div style={{ marginTop: 16, fontSize: 13.5, color: "#374151", lineHeight: 1.8 }}>
          <div><strong>Staff:</strong> {item.staffName}</div>
          <div><strong>Project:</strong> {item.projectTitle}</div>
          <div><strong>Assigned To:</strong> {item.assignedTo || "—"}</div>
          <div><strong>Assigned Date:</strong> {item.assignedDate || "—"}</div>
          <div><strong>Completed Date:</strong> {item.completedDate || "—"}</div>
          <div><strong>Remarks:</strong> {item.remarks || "—"}</div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>Print</button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}