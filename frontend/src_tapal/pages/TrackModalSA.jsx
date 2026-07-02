import React from "react";

export default function TrackModalSA({ item, onClose }) {
  const history = item.transferHistory || [];

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,15,40,0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 520, padding: "26px 28px", boxShadow: "0 20px 60px rgba(15,15,40,0.2)", maxHeight: "80vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827" }}>
          Transfer Timeline — #{item.id}
        </h3>
        <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 4 }}>{item.staffName}</p>

        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {history.length === 0 ? (
            <div style={{ color: "#9ca3af", fontSize: 13 }}>No transfer history yet.</div>
          ) : (
            history.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4f46e5", marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>
                    {h.from} → {h.to}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6b7280" }}>{h.date}</div>
                  {h.remarks && <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>{h.remarks}</div>}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}