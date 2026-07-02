import React from "react";

export default function StaffOverallReportModalSA({ requests, onClose }) {
  const completed = requests.filter((r) => r.status === "COMPLETED");

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,15,40,0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 680, padding: "26px 28px", boxShadow: "0 20px 60px rgba(15,15,40,0.2)", maxHeight: "82vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>
          Overall Completed Report
        </h3>
        <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 4 }}>{completed.length} completed requests</p>

        <table className="data-table" style={{ marginTop: 18 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Staff Name</th>
              <th>Type</th>
              <th>Assigned To</th>
              <th>Completed Date</th>
            </tr>
          </thead>
          <tbody>
            {completed.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.staffName}</td>
                <td>{r.requestType}</td>
                <td>{r.assignedTo || "—"}</td>
                <td>{r.completedDate || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>Print</button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}