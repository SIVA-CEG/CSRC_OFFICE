import React, { useState } from "react";

const STAFF_OPTIONS = [
  { id: "s1", name: "Mr. R. Kumaresan" },
  { id: "s2", name: "Ms. Lakshmi Priya" },
  { id: "s3", name: "Mr. S. Ganesan" },
];

export default function AssignModalSA({ item, onClose, onAssign }) {
  const [staffId, setStaffId] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {
    const staff = STAFF_OPTIONS.find((s) => s.id === staffId);
    if (!staff) return;
    onAssign(item.id, staff, remarks);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,15,40,0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 460, padding: "26px 28px", boxShadow: "0 20px 60px rgba(15,15,40,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>
          Assign Request — #{item.id}
        </h3>
        <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 4 }}>
          {item.staffName} · {item.projectTitle}
        </p>

        <div style={{ marginTop: 18 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151" }}>Assign To</label>
          <select
            className="ps-select"
            style={{ width: "100%", marginTop: 6 }}
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          >
            <option value="">-- Select Staff --</option>
            {STAFF_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151" }}>Remarks</label>
          <textarea
            className="ps-input"
            style={{ width: "100%", marginTop: 6, minHeight: 70, resize: "vertical" }}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Optional remarks..."
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={!staffId} onClick={handleSubmit}>
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}