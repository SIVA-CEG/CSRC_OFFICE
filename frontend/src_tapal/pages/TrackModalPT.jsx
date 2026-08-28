// PATH: CSRC_OFFICE/frontend/src_tapal/pages/TrackModalPT.jsx

import React from "react";

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-GB");
};

export default function TrackModalPT({ item, onClose }) {
  // `project_transfers` only stores flat columns (assigned_to,
  // assign_remarks, assigned_date) — there's no assign-history table for
  // this feature yet (unlike faculty_assign_history / installment_assign_
  // history elsewhere in the app), so we can't show every past
  // reassignment. What we CAN show honestly: the initial submission
  // (sender → recipient) and the current office assignment, if any.
  const history = [];

  history.push({
    from: item.from_name,
    to: item.to_name,
    date: fmtDate(item.created_at),
    remarks: item.reason || null,
    label: "Transfer submitted",
  });

  if (item.assigned_to) {
    history.push({
      from: "CSRC Office",
      to: item.assigned_to,
      date: fmtDate(item.assigned_date),
      remarks: item.assign_remarks || null,
      label: "Assigned within office",
    });
  }

  if (item.status === "completed" && item.completed_date) {
    history.push({
      from: item.assigned_to || "CSRC Office",
      to: "Completed",
      date: fmtDate(item.completed_date),
      remarks: null,
      label: "Transfer completed",
    });
  }

  return (
    <div
      className="et-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="et-modal">
        <div className="et-modal-header">
          <h2>Track Project Transfer</h2>
          <button className="et-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="et-modal-body">
          <div className="et-info-card">
            <div>
              <strong>Tapal ID:</strong> #{item.id}
            </div>
            <div>
              <strong>File No:</strong> {item.file_no || "-"}
            </div>
            <div>
              <strong>Project:</strong> {item.title}
            </div>
            <div>
              <strong>From PI:</strong> {item.from_name}
            </div>
            <div>
              <strong>To PI:</strong> {item.to_name}
            </div>
            <div>
              <strong>Current Status:</strong> {item.status}
            </div>
            <div>
              <strong>Assigned To:</strong> {item.assigned_to || "—"}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 10 }}>Movement History</h4>

            {history.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 13.5 }}>
                No movement recorded yet.
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
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
                    <div
                      style={{
                        fontSize: 11,
                        color: "#7c3aed",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {h.label}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#1f2937",
                        marginTop: 2,
                      }}
                    >
                      {h.from} → {h.to}
                    </div>
                    <div
                      style={{ color: "#9ca3af", fontSize: 11.5, marginTop: 2 }}
                    >
                      {h.date}
                    </div>
                    {h.remarks && (
                      <div
                        style={{
                          color: "#4b5563",
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                      >
                        "{h.remarks}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="et-modal-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
