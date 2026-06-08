import React from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    key: "projects",
    label: "Projects",
    icon: "🗂️",
    description: "Manage sponsored research project tapals",
    color: "#0f766e",
    bg: "linear-gradient(135deg,#ccfbf1,#f0fdfa)",
    border: "#99f6e4",
    available: true,
  },
  {
    key: "consultancy",
    label: "Consultancy",
    icon: "💼",
    description: "Consultancy correspondence and documents",
    color: "#1d4ed8",
    bg: "linear-gradient(135deg,#dbeafe,#eff6ff)",
    border: "#bfdbfe",
    available: false,
  },
  {
    key: "testing",
    label: "Testing",
    icon: "🔬",
    description: "Testing services tapal management",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    border: "#ddd6fe",
    available: false,
  },
  {
    key: "training",
    label: "Training",
    icon: "🎓",
    description: "Training programs and related tapals",
    color: "#b45309",
    bg: "linear-gradient(135deg,#fef3c7,#fffbeb)",
    border: "#fde68a",
    available: false,
  },
  {
    key: "workshops",
    label: "Workshops",
    icon: "🛠️",
    description: "Workshop events and correspondence",
    color: "#be185d",
    bg: "linear-gradient(135deg,#fce7f3,#fdf2f8)",
    border: "#fbcfe8",
    available: false,
  },
];

export default function TapalHome() {
  const navigate = useNavigate();

  return (
    <div className="page-body">
      <div className="page-stack">
        <div>
          <div className="page-title">Tapal Management</div>
          <div className="page-subtitle">
            Select a category to manage correspondence
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 22,
          }}
        >
          {SECTIONS.map((sec) => (
            <button
              key={sec.key}
              onClick={() =>
                sec.available
                  ? navigate(`/tapal/${sec.key}`)
                  : navigate(`/tapal/${sec.key}/construction`)
              }
              style={{
                background: sec.bg,
                border: `1.5px solid ${sec.border}`,
                borderRadius: 22,
                padding: "30px 26px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.25s ease",
                position: "relative",
                overflow: "hidden",
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
              {!sec.available && (
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "#f3f4f6",
                    color: "#6b7280",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 999,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Coming Soon
                </span>
              )}
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
                style={{ fontSize: 14, color: "#4b5563", fontWeight: 600, lineHeight: 1.5 }}
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
                {sec.available ? "Open Section" : "Under Construction"}{" "}
                <span style={{ fontSize: 16 }}>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}