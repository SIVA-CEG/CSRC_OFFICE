import React from "react";
import { useNavigate } from "react-router-dom";

const SUB_SECTIONS = [
  {
    key: "endorsement",
    label: "Endorsement Tapals",
    icon: "📋",
    description: "Track and process endorsement requests for sponsored projects",
    color: "#0f766e",
    bg: "linear-gradient(135deg,#ccfbf1,#f0fdfa)",
    border: "#99f6e4",
  },
  {
    key: "sanction",
    label: "Project Sanction Tapals",
    icon: "✅",
    description: "Fresh and renewal sanction letters and approvals",
    color: "#1d4ed8",
    bg: "linear-gradient(135deg,#dbeafe,#eff6ff)",
    border: "#bfdbfe",
  },
  {
    key: "bills",
    label: "Bills",
    icon: "🧾",
    description: "Recurring and non-recurring expense bills and claims",
    color: "#b45309",
    bg: "linear-gradient(135deg,#fef3c7,#fffbeb)",
    border: "#fde68a",
  },
  {
    key: "requests",
    label: "Request Tapals",
    icon: "📨",
    description: "Reappropriation and project extension requests",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    border: "#ddd6fe",
  },
];

export default function ProjectHome() {
  const navigate = useNavigate();

  return (
    <div className="page-body">
      <div className="page-stack">
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/tapal")}
            style={{ marginBottom: 14 }}
          >
            ← Back to Categories
          </button>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">
            Select a tapal type to manage project correspondence
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 22,
          }}
        >
          {SUB_SECTIONS.map((sec) => (
            <button
              key={sec.key}
              onClick={() => navigate(`/tapal/projects/${sec.key}`)}
              style={{
                background: sec.bg,
                border: `1.5px solid ${sec.border}`,
                borderRadius: 22,
                padding: "30px 26px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 18px 40px ${sec.border}aa`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 14 }}>{sec.icon}</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: sec.color,
                  marginBottom: 6,
                }}
              >
                {sec.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#4b5563",
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {sec.description}
              </div>
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: sec.color,
                  fontSize: 13.5,
                  fontWeight: 800,
                }}
              >
                Open <span style={{ fontSize: 16 }}>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}