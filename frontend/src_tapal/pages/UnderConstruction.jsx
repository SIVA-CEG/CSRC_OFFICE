import React from "react";
import { useNavigate } from "react-router-dom";

export default function UnderConstruction({ title = "This Section" }) {
  const navigate = useNavigate();
  return (
    <div className="page-body">
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <div style={{ fontSize: 64 }}>🚧</div>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "var(--primary-dark)",
          }}
        >
          {title}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 420 }}>
          This section is currently under construction. Check back soon — it
          will be ready shortly.
        </p>
        <button
          className="btn btn-outline"
          onClick={() => navigate(-1)}
          style={{ marginTop: 8 }}
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}