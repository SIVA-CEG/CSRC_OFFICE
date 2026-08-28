import React from "react";

/* ════════════════════════════════════════════════════════════════════
   SHARED OFFICE REPORT + TRACK COMPONENTS
   Used by: OfficeReappropriationPage, OfficeProjectExtensionPage, ZBAOfficePage
════════════════════════════════════════════════════════════════════ */

/* ─── Inline styles (no CSS injection needed) ─────────────────────── */
const S = {
  /* Sheet / Paper */
  sheet: {
    background: "#fff",
    borderRadius: "14px",
    padding: "40px 44px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    position: "relative",
    overflow: "hidden",
    maxWidth: "760px",
    margin: "0 auto",
  },

  /* Ribbon */
  ribbon: {
    position: "absolute",
    top: "18px",
    right: "-38px",
    transform: "rotate(40deg)",
    background: "#f59e0b",
    color: "#1c1200",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    padding: "5px 52px",
    textTransform: "uppercase",
    zIndex: 1,
  },

  /* Letterhead */
  letterhead: {
    textAlign: "center",
    paddingBottom: "20px",
    marginBottom: "24px",
    borderBottom: "2.5px solid #1e293b",
  },
  univName: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1e293b",
    letterSpacing: "0.3px",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  deptName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    marginTop: "5px",
  },
  reportTag: {
    display: "inline-block",
    marginTop: "12px",
    padding: "5px 18px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },

  /* Title + Ref row */
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "22px",
    gap: "16px",
    flexWrap: "wrap",
  },
  projTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    maxWidth: "68%",
    lineHeight: 1.4,
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  refBox: {
    textAlign: "right",
    flexShrink: 0,
  },
  refLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "block",
    marginBottom: "3px",
  },
  refValue: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#1e293b",
    display: "block",
  },

  /* Meta grid */
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px 28px",
    marginBottom: "24px",
    padding: "18px 20px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #eef2f6",
  },
  metaLabel: {
    display: "block",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: "3px",
  },
  metaValue: {
    display: "block",
    fontSize: "13px",
    color: "#1e293b",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  /* Section */
  section: { marginBottom: "24px" },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 800,
    color: "#1e293b",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  sectionAccent: {
    width: "4px",
    height: "16px",
    background: "#1d4ed8",
    borderRadius: "2px",
    flexShrink: 0,
  },

  /* Table */
  tableWrap: {
    overflowX: "auto",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "360px",
    fontSize: "13px",
  },
  th: {
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: 700,
    whiteSpace: "nowrap",
    borderBottom: "1px solid #e2e8f0",
  },
  td: (i, total) => ({
    padding: "10px 12px",
    color: "#334155",
    borderBottom: i < total - 1 ? "1px solid #f1f5f9" : "none",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  }),

  /* Divider */
  divider: {
    height: "1px",
    background: "#e2e8f0",
    margin: "22px 0",
  },

  /* Note / remark box */
  noteBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "10px",
    padding: "13px 16px",
    fontSize: "13px",
    color: "#78350f",
    marginBottom: "14px",
    lineHeight: 1.6,
  },
  noteLabel: {
    fontWeight: 800,
    color: "#92400e",
    marginRight: "6px",
  },

  /* Signature row */
  signRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginTop: "28px",
  },
  signBox: (signed) => ({
    border: signed ? "1.5px solid #86efac" : "1.5px dashed #cbd5e1",
    borderRadius: "10px",
    padding: "16px 12px",
    textAlign: "center",
    minHeight: "84px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: "5px",
    background: signed ? "#f0fdf4" : "#fafafa",
  }),
  signMark: {
    fontSize: "22px",
    lineHeight: 1,
  },
  signRole: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    color: "#475569",
  },
  signStatus: (signed) => ({
    fontSize: "11px",
    color: signed ? "#16a34a" : "#94a3b8",
    fontWeight: signed ? 600 : 400,
  }),

  /* Status pill */
  statusPill: (done) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "24px",
    padding: "9px 18px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    background: done ? "#f0fdf4" : "#fffbeb",
    color: done ? "#16a34a" : "#b45309",
    border: `1px solid ${done ? "#bbf7d0" : "#fde68a"}`,
  }),

  /* Footer */
  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "11px",
    color: "#94a3b8",
    lineHeight: 1.6,
  },

  /* Empty state */
  empty: {
    textAlign: "center",
    padding: "18px",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

/* ════════════════════════════════════════════════════════════════════
   OfficeProjectReport — A4-style document placeholder
════════════════════════════════════════════════════════════════════ */
export default function OfficeProjectReport({
  reportLabel = "Office Report",
  title,
  refNo,
  meta = [],
  sections = [],
  notes = [],
  signatures = {},
  showSignatures = true,
  isCompleted = false,
  statusNote,
}) {
  const roles = [
    { key: "assistant", label: "Assistant" },
    { key: "superintendent", label: "Superintendent" },
    { key: "director", label: "Director" },
  ];

  return (
    <div style={S.sheet}>
      {/* Ribbon */}
      <div style={S.ribbon}>PREVIEW</div>

      {/* ── Letterhead ── */}
      <div style={S.letterhead}>
        <div style={S.univName}>Anna University</div>
        <div style={S.deptName}>
          Centre for Sponsored Research &amp; Consultancy
        </div>
        <span style={S.reportTag}>{reportLabel}</span>
      </div>

      {/* ── Title + Ref ── */}
      <div style={S.titleRow}>
        <div style={S.projTitle}>{title || "—"}</div>
        <div style={S.refBox}>
          <span style={S.refLabel}>Reference No.</span>
          <span style={S.refValue}>{refNo || "—"}</span>
        </div>
      </div>

      {/* ── Meta grid ── */}
      {meta.length > 0 && (
        <div style={S.metaGrid}>
          {meta
            .filter(
              (m) =>
                m &&
                m.value !== undefined &&
                m.value !== null &&
                m.value !== "",
            )
            .map((m, i) => (
              <div key={i}>
                <span style={S.metaLabel}>{m.label}</span>
                <span style={S.metaValue}>{m.value ?? "—"}</span>
              </div>
            ))}
        </div>
      )}

      {/* ── Sections (tables) ── */}
      {sections.map((sec, si) => (
        <div key={si} style={S.section}>
          <div style={S.sectionHead}>
            <div style={S.sectionAccent} />
            {sec.heading}
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {(sec.columns || []).map((col, ci) => (
                    <th key={ci} style={S.th}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!sec.rows || sec.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={sec.columns?.length || 1}
                      style={{ ...S.td(0, 1), ...S.empty }}
                    >
                      No entries
                    </td>
                  </tr>
                ) : (
                  sec.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={S.td(ri, sec.rows.length)}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* ── Notes / Remarks ── */}
      {notes
        .filter((n) => n && n.text)
        .map((n, i) => (
          <div key={i} style={S.noteBox}>
            <span style={S.noteLabel}>{n.label}:</span>
            {n.text}
          </div>
        ))}

      <div style={S.divider} />

      {/* ── Signatures or status pill ── */}
      {showSignatures ? (
        <div style={S.signRow}>
          {roles.map((r) => {
            const sign = signatures[r.key];

            return (
              <div key={r.key} style={S.signBox(!!sign)}>
                {sign?.signature && (
                  <img
                    src={`http://localhost:5100/${sign.signature}`}
                    alt="signature"
                    style={{
                      width: "150px",
                      height: "60px",
                      objectFit: "contain",
                      margin: "0 auto 8px",
                      display: "block",
                    }}
                  />
                )}

                <div style={S.signRole}>{r.label}</div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  {sign?.name || ""}
                </div>

                <div style={S.signStatus(!!sign)}>
                  {!!sign ? "Signed" : "Pending"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <span style={S.statusPill(isCompleted)}>
            <span>{isCompleted ? "✔" : "⏳"}</span>
            {isCompleted ? "Settled" : "Awaiting Decision"}
          </span>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={S.footer}>
        {statusNote ||
          (isCompleted
            ? "This request has completed the full approval cycle."
            : "Approval cycle in progress.")}
        <br />
        Layout is a placeholder and will be replaced by the final generated
        report.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Generic Modal Shell
════════════════════════════════════════════════════════════════════ */
export function OfficeReportModal({ title, refLabel, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "24px 16px",
        overflowY: "auto",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "min(880px, 96vw)",
          background: "#f1f5f9",
          borderRadius: "18px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 40px 100px rgba(0,0,0,0.35)",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          maxHeight: "calc(100vh - 48px)",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: "14px 20px",
            background: "#0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>
            <strong style={{ color: "#fff" }}>{title}</strong>
            {refLabel ? ` — ${refLabel}` : ""}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "#ef4444",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              padding: "7px 14px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            ✕ Close
          </button>
        </div>
        {/* Modal body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Transfer Timeline — dot / line visual
════════════════════════════════════════════════════════════════════ */
export function TransferTimeline({ item }) {
  const history = item?.transferHistory || [];

  if (history.length === 0) {
    return (
      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          textAlign: "center",
          padding: "28px 0",
          background: "#f8fafc",
          borderRadius: "10px",
          border: "1px dashed #cbd5e1",
        }}
      >
        No transfer history yet. This item is still with the assistant.
      </div>
    );
  }

  const dot = (approved) => ({
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    flexShrink: 0,
    background: approved ? "#dcfce7" : "#dbeafe",
    color: approved ? "#16a34a" : "#2563eb",
    border: `2px solid ${approved ? "#16a34a" : "#2563eb"}`,
  });

  const roleBadge = (role) => ({
    fontSize: "10px",
    padding: "1px 7px",
    borderRadius: "999px",
    fontWeight: 600,
    background:
      role === "superintendent"
        ? "#dbeafe"
        : role === "director"
          ? "#fce7f3"
          : "#dcfce7",
    color:
      role === "superintendent"
        ? "#1d4ed8"
        : role === "director"
          ? "#be185d"
          : "#15803d",
  });

  const statusBadge = (approved) => ({
    marginTop: "4px",
    fontSize: "10px",
    padding: "2px 9px",
    borderRadius: "999px",
    display: "inline-block",
    background: approved ? "#f0fdf4" : "#eff6ff",
    color: approved ? "#16a34a" : "#2563eb",
    border: `1px solid ${approved ? "#bbf7d0" : "#bfdbfe"}`,
  });

  return (
    <div style={{ padding: "8px 0" }}>
      {history.map((entry, i) => {
        const toName = typeof entry.to === "object" ? entry.to?.name : entry.to;
        const toRole = typeof entry.to === "object" ? entry.to?.role : null;
        const fromName =
          typeof entry.from === "object" ? entry.from?.name : entry.from;

        return (
          <div
            key={i}
            style={{ display: "flex", gap: "12px", marginBottom: "14px" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "28px",
              }}
            >
              <div style={dot(entry.approved)}>
                {entry.approved ? "✔" : "↪"}
              </div>
              {i < history.length - 1 && (
                <div
                  style={{
                    width: "2px",
                    flex: 1,
                    background: "#e2e8f0",
                    marginTop: "4px",
                    minHeight: "14px",
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: "4px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginBottom: "2px",
                }}
              >
                {entry.date}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {fromName}
                </span>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>→</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  {toName}
                </span>
                {toRole && <span style={roleBadge(toRole)}>{toRole}</span>}
              </div>
              <div style={statusBadge(entry.approved)}>
                {entry.approved
                  ? "✔ Approved & Forwarded"
                  : "↪ Forwarded (Pending Approval)"}
              </div>
            </div>
          </div>
        );
      })}

      {/* Terminal node */}
      {item.currentHolder ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              background: "#fef9c3",
              color: "#ca8a04",
              border: "2px solid #ca8a04",
            }}
          >
            ⏳
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#92400e",
              fontWeight: 500,
              paddingTop: "4px",
            }}
          >
            Waiting for action from{" "}
            <strong>{item.currentHolder?.name || "Next Approver"}</strong>
            {item.currentHolder?.role && ` (${item.currentHolder.role})`}
          </div>
        </div>
      ) : history.length > 0 ? (
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              background: "#dcfce7",
              color: "#16a34a",
              border: "2px solid #16a34a",
            }}
          >
            ✔
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#15803d",
              fontWeight: 500,
              paddingTop: "4px",
            }}
          >
            Process Completed — Fully Approved
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Track Modal — visual transfer timeline in a modal
════════════════════════════════════════════════════════════════════ */
export function TrackModal({ item, idLabel, title, onClose }) {
  const holderRole = item?.currentHolder?.role;
  const stageColors = {
    superintendent: { bg: "#dbeafe", color: "#1d4ed8" },
    director: { bg: "#fce7f3", color: "#be185d" },
    assistant: { bg: "#dcfce7", color: "#15803d" },
  };
  const sc = stageColors[holderRole] || { bg: "#f3f4f6", color: "#374151" };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "min(480px, 95vw)",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              TRANSFER TRACKING — {idLabel}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e293b",
                lineHeight: 1.3,
              }}
            >
              {title}
            </div>
            {item?.currentHolder && (
              <div style={{ marginTop: "8px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: sc.bg,
                    color: sc.color,
                  }}
                >
                  {holderRole === "superintendent"
                    ? "🔵"
                    : holderRole === "director"
                      ? "🔴"
                      : "🟢"}{" "}
                  Currently with {item.currentHolder?.name} ({holderRole})
                </span>
              </div>
            )}
            {!item?.currentHolder && item?.transferHistory?.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "999px",
                    background: "#dcfce7",
                    color: "#15803d",
                  }}
                >
                  ✔ Completed
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              fontSize: "14px",
              color: "#64748b",
              borderRadius: "8px",
              padding: "4px 10px",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
          <TransferTimeline item={item} />
        </div>
      </div>
    </div>
  );
}
