// PATH: CSRC_OFFICE/frontend/src_tapal/pages/TrackModalPT.jsx

import React from "react";

export default function TrackModalPT({ item, onClose }) {
  const history = item.transferHistory || [];

  return (
    <div className="et-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="et-modal">
        <div className="et-modal-header">
          <h2>Track Project Transfer</h2>
          <button className="et-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="et-modal-body">
          <div className="et-info-card">
            <div><strong>Tapal ID:</strong> #{item.id}</div>
            <div><strong>File No:</strong> {item.fileNo}</div>
            <div><strong>Project:</strong> {item.projectTitle}</div>
            <div><strong>From PI:</strong> {item.fromFacultyName}</div>
            <div><strong>To PI:</strong> {item.toFacultyName}</div>
            <div><strong>Current Status:</strong> {item.status}</div>
            <div><strong>Assigned To:</strong> {item.assignedTo || "—"}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 10 }}>Movement History</h4>

            {history.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13.5 }}>No movement recorded yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #eef0f2",
                      borderRadius: 10,
                      padding: "10px 12px",
                      background: "#fafbfc",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#1f2937" }}>
                      {h.from} → {h.to}
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 11.5, marginTop: 2 }}>{h.date}</div>
                    {h.remarks && (
                      <div style={{ color: "#4b5563", marginTop: 4, fontStyle: "italic" }}>
                        "{h.remarks}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="et-modal-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}