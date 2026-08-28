// PATH: CSRC_OFFICE/frontend/src_tapal/pages/ProjectTransferDetailModalPT.jsx

import React from "react";

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-GB");
};

// Same normalization logic as ProjectTransferTapal.jsx's viewSignedLetter —
// letter_path may contain Windows-style backslashes from multer, so this
// strips down to the "uploads/..." portion and builds an absolute URL.
const letterUrl = (letterPath) => {
  if (!letterPath) return null;
  const normalized = letterPath.replace(/\\/g, "/");
  const idx = normalized.indexOf("uploads/");
  const rel = idx !== -1 ? normalized.slice(idx) : normalized;
  return `http://localhost:5100/${rel}`;
};

export default function ProjectTransferDetailModalPT({ item, onClose }) {
  const url = letterUrl(item.letter_path);
  // Prefer reject_remarks when the transfer was rejected, otherwise fall
  // back to assign_remarks (recorded at the tapal Assign step).
  const remarksToShow = item.reject_remarks || item.assign_remarks || null;

  return (
    <div
      className="et-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="et-modal">
        <div className="et-modal-header">
          <h2>Project Transfer Details</h2>
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
              <strong>Project Title:</strong> {item.title}
            </div>
            <div>
              <strong>Funding Agency:</strong> {item.funding_agency}
            </div>
            <div>
              <strong>Sanctioned Cost:</strong> ₹{" "}
              {Number(item.cost || 0).toLocaleString("en-IN")}
            </div>
            <div>
              <strong>Submitted:</strong> {fmtDate(item.created_at)}
            </div>
            <div>
              <strong>Status:</strong> {item.status}
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
            <div
              style={{
                flex: 1,
                background: "#f9fafb",
                border: "1px solid #eef0f2",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                From (Current PI)
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>
                {item.from_name}
              </div>
              <div style={{ fontSize: 12.5, color: "#6b7280" }}>
                {item.from_dept}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#f9fafb",
                border: "1px solid #eef0f2",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                To (Incoming PI)
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>
                {item.to_name}
              </div>
              <div style={{ fontSize: 12.5, color: "#6b7280" }}>
                {item.to_dept}
              </div>
            </div>
          </div>

          {remarksToShow && (
            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                color: "#4b5563",
                background: "#f3f4f6",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <strong>Remarks:</strong> {remarksToShow}
            </div>
          )}

          {item.assigned_to && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: "#374151" }}>
              <strong>Assigned To:</strong> {item.assigned_to}{" "}
              {item.assigned_date ? `(${fmtDate(item.assigned_date)})` : ""}
            </div>
          )}

          {item.completed_date && (
            <div style={{ marginTop: 6, fontSize: 12.5, color: "#166534" }}>
              <strong>Completed On:</strong> {fmtDate(item.completed_date)}
            </div>
          )}

          <div className="et-modal-actions" style={{ marginTop: 18 }}>
            <button
              className="btn btn-outline"
              disabled={!url}
              onClick={() => url && window.open(url, "_blank")}
              title={url ? "" : "No signed letter uploaded yet"}
            >
              📄 View Transfer Letter
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
