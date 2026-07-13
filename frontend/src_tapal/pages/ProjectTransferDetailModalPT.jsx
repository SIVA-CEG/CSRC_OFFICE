// PATH: CSRC_OFFICE/frontend/src_tapal/pages/ProjectTransferDetailModalPT.jsx

import React from "react";

export default function ProjectTransferDetailModalPT({ item, onClose }) {
  return (
    <div className="et-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="et-modal">
        <div className="et-modal-header">
          <h2>Project Transfer Details</h2>
          <button className="et-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="et-modal-body">
          <div className="et-info-card">
            <div><strong>Tapal ID:</strong> #{item.id}</div>
            <div><strong>File No:</strong> {item.fileNo}</div>
            <div><strong>Project Title:</strong> {item.projectTitle}</div>
            <div><strong>Funding Agency:</strong> {item.agency}</div>
            <div><strong>Sanctioned Cost:</strong> ₹ {Number(item.totalAmount || 0).toLocaleString("en-IN")}</div>
            <div><strong>Submitted:</strong> {item.submittedDate}</div>
            <div><strong>Status:</strong> {item.status}</div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
            <div style={{ flex: 1, background: "#f9fafb", border: "1px solid #eef0f2", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>From (Current PI)</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{item.fromFacultyName}</div>
              <div style={{ fontSize: 12.5, color: "#6b7280" }}>{item.fromFacultyDept}</div>
            </div>
            <div style={{ flex: 1, background: "#f9fafb", border: "1px solid #eef0f2", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>To (Incoming PI)</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{item.toFacultyName}</div>
              <div style={{ fontSize: 12.5, color: "#6b7280" }}>{item.toFacultyDept}</div>
            </div>
          </div>

          {item.remarks && (
            <div style={{ marginTop: 14, fontSize: 13, color: "#4b5563", background: "#f3f4f6", borderRadius: 8, padding: "10px 12px" }}>
              <strong>Remarks:</strong> {item.remarks}
            </div>
          )}

          {item.assignedTo && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: "#374151" }}>
              <strong>Assigned To:</strong> {item.assignedTo} {item.assignedDate ? `(${item.assignedDate})` : ""}
            </div>
          )}

          {item.completedDate && (
            <div style={{ marginTop: 6, fontSize: 12.5, color: "#166534" }}>
              <strong>Completed On:</strong> {item.completedDate}
            </div>
          )}

          <div className="et-modal-actions" style={{ marginTop: 18 }}>
            <button
              className="btn btn-outline"
              onClick={() => window.open(item.transferLetterUrl || "/dummy-transfer-letter.pdf", "_blank")}
            >
              📄 View Transfer Letter
            </button>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}