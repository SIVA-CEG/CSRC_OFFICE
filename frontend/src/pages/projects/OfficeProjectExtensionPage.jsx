import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./OfficeProjectExtensionPage.css";
import ProjectApprovalTransferCell from "./ProjectApprovalTransferCell";
import OfficeProjectReport from "./OfficeProjectReport";
import html2pdf from "html2pdf.js";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const userRole = () => sessionStorage.getItem("userRole") || "assistant";
const currentUser = () => {
  try {
    const u = JSON.parse(sessionStorage.getItem("proceedings_user") || "{}");
    return u.name || userRole();
  } catch {
    return userRole();
  }
};

const fmtDateGB = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB");
};

const API = "http://localhost:5100/api/sanctions/extensions";

/* ─── Transfer Timeline — reads extension_assign_history rows ───────────── */
function TransferTimeline({ history, currentHolder, isCompleted }) {
  const S = {
    wrap: { padding: "8px 0" },
    entry: { display: "flex", gap: "12px", marginBottom: "14px" },
    dotWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: "28px",
    },
    dot: (approved) => ({
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
    }),
    line: {
      width: "2px",
      flex: 1,
      background: "#e2e8f0",
      marginTop: "4px",
      minHeight: "14px",
    },
    content: { flex: 1, paddingBottom: "4px" },
    date: { fontSize: "11px", color: "#94a3b8", marginBottom: "2px" },
    transfer: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      flexWrap: "wrap",
    },
    from: { fontSize: "12px", color: "#64748b" },
    arrow: { fontSize: "13px", color: "#94a3b8" },
    to: { fontSize: "12px", fontWeight: 700, color: "#1e293b" },
    statusBadge: (approved) => ({
      marginTop: "4px",
      fontSize: "10px",
      padding: "2px 9px",
      borderRadius: "999px",
      display: "inline-block",
      background: approved ? "#f0fdf4" : "#eff6ff",
      color: approved ? "#16a34a" : "#2563eb",
      border: `1px solid ${approved ? "#bbf7d0" : "#bfdbfe"}`,
    }),
  };

  if (!history || history.length === 0) {
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

  const actionLabel = (action) => {
    if (action === "APPROVE_AND_ASSIGN")
      return "Approved & Forwarded to Supervisor";
    if (action === "APPROVE_AND_ASSIGN_DIRECTOR")
      return "Approved & Forwarded to Director";
    if (action === "FINAL_APPROVE") return "Final Approved — Completed";
    if (action === "TRANSFER") return "Forwarded (Pending Approval)";
    return action;
  };

  const isApprovedAction = (action) =>
    [
      "APPROVE_AND_ASSIGN",
      "APPROVE_AND_ASSIGN_DIRECTOR",
      "FINAL_APPROVE",
    ].includes(action);

  return (
    <div style={S.wrap}>
      {history.map((entry, i) => {
        const approved = isApprovedAction(entry.action);
        return (
          <div key={entry.id || i} style={S.entry}>
            <div style={S.dotWrap}>
              <div style={S.dot(approved)}>{approved ? "✔" : "↪"}</div>
              {i < history.length - 1 && <div style={S.line} />}
            </div>
            <div style={S.content}>
              <div style={S.date}>{fmtDateGB(entry.created_at)}</div>
              <div style={S.transfer}>
                <span style={S.from}>{entry.assigned_from}</span>
                <span style={S.arrow}>→</span>
                <span style={S.to}>{entry.assigned_to}</span>
              </div>
              <div style={S.statusBadge(approved)}>
                {approved
                  ? `✔ ${actionLabel(entry.action)}`
                  : `↪ ${actionLabel(entry.action)}`}
              </div>
              {entry.remarks && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    marginTop: "2px",
                  }}
                >
                  Remarks: {entry.remarks}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!isCompleted ? (
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
            <strong>{currentHolder || "Next Approver"}</strong>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}

/* ─── Stage Badge ─────────────────────────────────────────────────────────── */
function StageBadge({ status }) {
  const s = (status || "").toUpperCase();
  const map = {
    "ASSIGNED TO SUPERVISOR": {
      label: "With Superintendent",
      bg: "#dbeafe",
      color: "#1d4ed8",
    },
    "ASSIGNED TO DIRECTOR": {
      label: "With Director",
      bg: "#fce7f3",
      color: "#be185d",
    },
    ASSIGNED: { label: "With Assistant", bg: "#dcfce7", color: "#15803d" },
    COMPLETED: { label: "Completed", bg: "#f0fdf4", color: "#15803d" },
  };
  const m = map[s] || { label: status, bg: "#f1f5f9", color: "#64748b" };
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: "999px",
        background: m.bg,
        color: m.color,
      }}
    >
      {m.label}
    </span>
  );
}

/* ─── Status Badge (Under Review / Completed) ────────────────────────────── */
function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const map = {
    "UNDER REVIEW": {
      label: "Under Review",
      bg: "#fffbeb",
      color: "#b45309",
      dot: "#f59e0b",
    },
    "ASSIGNED TO SUPERVISOR": {
      label: "With Superintendent",
      bg: "#eff6ff",
      color: "#1d4ed8",
      dot: "#3b82f6",
    },
    "ASSIGNED TO DIRECTOR": {
      label: "With Director",
      bg: "#eff6ff",
      color: "#1d4ed8",
      dot: "#3b82f6",
    },
    ASSIGNED: {
      label: "Assigned",
      bg: "#eff6ff",
      color: "#1d4ed8",
      dot: "#3b82f6",
    },
    COMPLETED: {
      label: "Approved",
      bg: "#f0fdf4",
      color: "#15803d",
      dot: "#22c55e",
    },
  };
  const m = map[s] || {
    label: status,
    bg: "#f1f5f9",
    color: "#64748b",
    dot: "#94a3b8",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: "999px",
        background: m.bg,
        color: m.color,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: m.dot,
          flexShrink: 0,
        }}
      />
      {m.label}
    </span>
  );
}

/* ─── Stats Row ───────────────────────────────────────────────────────────── */
function StatsRow({ counts }) {
 const cards = [
   {
     label: "Total",
     value: counts.total,
     color: "#1d4ed8",
     bg: "#eff6ff",
     border: "#bfdbfe",
   },
   {
     label: "New Requests",
     value: counts.new,
     color: "#b45309",
     bg: "#fffbeb",
     border: "#fde68a",
   },
   {
     label: "Transferred",
     value: counts.transferred,
     color: "#7c3aed",
     bg: "#f5f3ff",
     border: "#ddd6fe",
   },
   {
     label: "Completed",
     value: counts.completed,
     color: "#15803d",
     bg: "#f0fdf4",
     border: "#bbf7d0",
   },
 ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: "14px",
            padding: "14px 18px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            {c.label}
          </div>
          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: c.color,
              marginTop: "4px",
              lineHeight: 1,
            }}
          >
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
function ExtensionReport({ draft }) {
  const isWith = draft.extensionType === "with";
  const piName = typeof draft.pi === "object" ? draft.pi?.name : draft.pi;
  const piDesig = typeof draft.pi === "object" ? draft.pi?.designation : "";
  const piDept =
    typeof draft.pi === "object" ? draft.pi?.department : draft.department;
  const piCampus = typeof draft.pi === "object" ? draft.pi?.campus : "";

  const S = {
    page: {
      width: "210mm",
      background: "#fff",
      margin: "0 auto",
      padding: "14mm 16mm",
      boxSizing: "border-box",
      fontFamily: "Times New Roman, serif",
      fontSize: "11pt",
      color: "#000",
      lineHeight: 1.5,
    },
    center: { textAlign: "center" },
    bold: { fontWeight: "bold" },
    section: { marginBottom: "10px" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      margin: "10px 0 14px",
      fontSize: "10.5pt",
    },
    th: {
      border: "1px solid #000",
      padding: "5px 10px",
      textAlign: "center",
      fontWeight: "bold",
      background: "#f5f5f5",
    },
    td: { border: "1px solid #000", padding: "5px 10px" },
    tdC: { border: "1px solid #000", padding: "5px 10px", textAlign: "center" },
    sub: { marginBottom: "12px" },
    ref: { marginBottom: "12px" },
    body: { textAlign: "justify", marginBottom: "10px" },
    sig: { textAlign: "right", marginTop: "36px", fontWeight: "bold" },
    to: { marginTop: "24px" },
    copy: { marginTop: "16px" },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ ...S.center, marginBottom: "6px" }}>
        <div style={{ ...S.bold, fontSize: "13pt" }}>
          Centre for Sponsored Research and Consultancy (CSRC)
        </div>
        <div style={{ fontStyle: "italic" }}>(formerly known as CTDT)</div>
        <div>Anna University, Chennai - 600 025.</div>
      </div>

      {/* Proc No & Date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div>
          <span style={S.bold}>Proceedings No.{draft.proceedingNo}</span>
        </div>
        <div>{draft.proceedingDate}</div>
      </div>

      {/* Sub */}
      <div style={S.sub}>
        <span style={S.bold}>Sub: </span>Anna University – {draft.agency}{" "}
        Project – <span style={S.bold}>{draft.projectTitle}</span> by{" "}
        <span style={S.bold}>Extension of Project period</span>
        {isWith ? " with additional grant" : ""} – Sanction – Accorded
      </div>

      {/* Ref */}
      <div style={S.ref}>
        <span style={S.bold}>Ref: </span>
        {(draft.references || []).map((r, i) => (
          <div key={i} style={{ paddingLeft: i === 0 ? "0" : "28px" }}>
            {i === 0 ? "" : ""}
            {r.no || i + 1}. {r.text}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>* * * * *</div>

      {/* Body paragraph */}
      <div style={S.body}>
        The {draft.agency} has sanctioned a project entitled{" "}
        <span style={S.bold}>"{draft.projectTitle}"</span> under{" "}
        <span style={S.bold}>"{draft.projectScheme}"</span> to{" "}
        <span style={S.bold}>{piName}</span>,{" "}
        {piDesig ? <span>{piDesig}, </span> : null}
        {piDept}
        {piCampus ? `, ${piCampus}` : ""}, as the Principal Investigator for the
        period of <span style={S.bold}>{draft.duration}</span> from{" "}
        <span style={S.bold}>{draft.sanctionedDate}</span> to{" "}
        <span style={S.bold}>{draft.originalEndDate}</span>
        {draft.totalCost ? (
          <>
            {" "}
            at a total cost of{" "}
            <span style={S.bold}>Rs.{draft.totalCost}/- </span>
          </>
        ) : (
          ""
        )}{" "}
        vide reference second cited above.
      </div>

      {/* Previous extensions table — only if there are any */}
      {(draft.previousExtensions || []).length > 0 && (
        <>
          <div style={S.body}>
            Further, the funding agency has already extended the tenure of the
            above mentioned project as per the details given below:
          </div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Extension Period</th>
                <th style={S.th}>Funding agency approval</th>
              </tr>
            </thead>
            <tbody>
              {(draft.previousExtensions || []).map((ext, i) => (
                <tr key={i}>
                  <td style={S.tdC}>{ext.period}</td>
                  <td style={S.td}>{ext.approval}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Current extension paragraph */}
      <div style={S.body}>
        Now, the funding agency has{" "}
        <span style={S.bold}>
          extended the duration of the above mentioned project up to{" "}
          {draft.revisedEndDate}
        </span>
        ,{" "}
        {isWith ? (
          <>
            with an additional grant of{" "}
            <span style={S.bold}>
              Rs.{draft.grantAmount}/- ({draft.grantAmountWords})
            </span>{" "}
            (vide reference {draft.grantRefNo || "cited above"}).{" "}
          </>
        ) : (
          "without any additional grant (vide reference third cited). "
        )}
        In this connection, permission is hereby accorded to the Principal
        Investigator, {piName}, {piDesig ? `${piDesig}, ` : ""}
        {piDept}
        {piCampus ? `, ${piCampus}` : ""}, to carry out the project till{" "}
        <span style={S.bold}>{draft.revisedEndDate}</span>.
      </div>

      {/* Bank details paragraph — only for "with" type */}
      {isWith && draft.bankAccount && (
        <div style={S.body}>
          The expenditure for the above project will be debitable under M.H.No.{" "}
          {draft.mhNo || "——"}. The amount may be credited to the Bank Account
          No. <span style={S.bold}>{draft.bankAccount}</span>, IFSC Code:{" "}
          <span style={S.bold}>{draft.ifscCode}</span>, {draft.bankBranch}.
        </div>
      )}

      {draft.remarks && (
        <div style={{ ...S.body, fontStyle: "italic", color: "#333" }}>
          <span style={S.bold}>Note: </span>
          {draft.remarks}
        </div>
      )}

      {/* Signature */}
      <div style={S.sig}>
        {draft.status?.toUpperCase() === "COMPLETED" &&
          draft.directorSignature && (
            <img
              src={`http://localhost:5100/${draft.directorSignature}`}
              alt="Director Signature"
              style={{
                height: "70px",
                objectFit: "contain",
                marginBottom: "-10px",
              }}
            />
          )}

        <div>{draft.directorName}</div>

        <div>DIRECTOR, CSRC</div>
      </div>
      {/* To */}
      <div style={S.to}>
        <div style={S.bold}>To</div>
        <div>The {piDesig || "Director"},</div>
        <div>{piDept},</div>
        {piCampus && <div>{piCampus},</div>}
        <div>Anna University, Chennai – 600 025.</div>
      </div>

      {/* Copy to */}
      <div style={S.copy}>
        <div style={S.bold}>Copy to :</div>
        <div>
          1. {piName}, {piDesig ? `${piDesig}, ` : ""}
          {piDept}
          {piCampus ? `, ${piCampus}` : ""} – MENT.
        </div>
        <div>2. CSRC – 3</div>
        <div>3. CSRC – 4</div>
      </div>
    </div>
  );
}

/* ─── Manage Modal — View / Edit / Track / Report ───────────────────────── */
function ManageModal({ extensionId, editable, onClose, onActed, role }) {
  const [tab, setTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [history, setHistory] = useState([]);
  const reportRef = useRef(null);

  useEffect(() => {
    load();
  }, [extensionId]);

  const load = async () => {
    try {
      setLoading(true);
      const [detailRes, histRes] = await Promise.all([
        fetch(`${API}/${extensionId}`),
        fetch(`${API}/assign-history/${extensionId}`),
      ]);
      
      const detail = await detailRes.json();
      console.log("DETAIL", detail);
      const hist = await histRes.json();
      setItem(detail);
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (err) {
      console.error("Failed to load extension detail", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportRef.current) return;
    html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: `Extension_${extensionId}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  };

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100000,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div style={{ color: "#fff", fontWeight: 700 }}>Loading...</div>
      </div>
    );
  }

  const isCompleted = history.some((h) => h.action === "FINAL_APPROVE");
  const lastH = history[history.length - 1];
  const currentHolder = lastH?.assigned_to || "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "16px",
          width: "min(900px, 96vw)",
          height: "calc(100vh - 32px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            background: "#1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              PROJECT EXTENSION — #{extensionId}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
              {isCompleted
                ? "Completed"
                : `With ${currentHolder || "Assistant"}`}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {tab === "report" && (
              <button
                onClick={downloadPDF}
                style={{
                  background: "#16a34a",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px 13px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                📄 Download PDF
              </button>
            )}
            <button
              style={{
                background: "#ef4444",
                border: "none",
                color: "#fff",
                borderRadius: "8px",
                padding: "6px 13px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "12px",
              }}
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "0 20px",
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
          }}
        >
          <button
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 700,
              color: tab === "details" ? "#1d4ed8" : "#64748b",
              borderBottom:
                tab === "details"
                  ? "3px solid #1d4ed8"
                  : "3px solid transparent",
            }}
            onClick={() => setTab("details")}
          >
            📋 Tracking
          </button>
          <button
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 700,
              color: tab === "report" ? "#1d4ed8" : "#64748b",
              borderBottom:
                tab === "report"
                  ? "3px solid #1d4ed8"
                  : "3px solid transparent",
            }}
            onClick={() => setTab("report")}
          >
            📄 Report
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            background: tab === "report" ? "#e5e7eb" : "#f8fafc",
          }}
        >
          {tab === "details" ? (
            <div>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Project Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: 24,
                }}
              >
                {[
                  ["Project Title", item?.project_title],
                  ["Funding Agency", item?.funding_agency],
                  ["Scheme", item?.scheme],
                  ["Sanction Ref No", item?.sanction_reference_no],
                  ["PI Name", item?.pi_name],
                  ["PI Designation", item?.pi_designation],
                  ["Department", item?.pi_dept],
                  ["Campus", item?.pi_campus],
                  ["Original End Date", fmtDateGB(item?.original_end_date)],
                  ["Revised End Date", fmtDateGB(item?.revised_end_date)],
                  ["Extension Period", item?.extension_period],
                  ["Reason", item?.reason],
                  ["Status", item?.status],
                  ["Assigned To", item?.assigned_to],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        marginBottom: 3,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {val || "—"}
                    </div>
                  </div>
                ))}
              </div>

              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Transfer Tracking
              </h3>
              <TransferTimeline
                history={history}
                currentHolder={currentHolder}
                isCompleted={isCompleted}
              />
            </div>
          ) : (
            <div ref={reportRef}>
              <ExtensionReport
                draft={{
                  status: item.status,
                  extensionType: item.extension_type,

                  proceedingNo: item.proceeding_no,
                  proceedingDate: fmtDateGB(item.proceeding_date),

                  agency: item.funding_agency,
                  projectTitle: item.project_title,
                  projectScheme: item.scheme,

                  pi: {
                    name: item.pi_name,
                    designation: item.pi_designation,
                    department: item.pi_dept,
                    campus: item.pi_campus,
                  },

                  sanctionedDate: fmtDateGB(item.project_start_date),
                  originalEndDate: fmtDateGB(item.original_end_date),
                  revisedEndDate: fmtDateGB(item.revised_end_date),

                  duration: item.project_duration,

                  totalCost: item.total_cost,

                  directorName: item.director_name,
                  directorSignature: item.director_signature,

                  remarks: item.assign_remarks,

                  grantAmount: item.grant_amount,
                  grantAmountWords: item.grant_amount_words,
                  grantRefNo: item.grant_reference_no,

                  mhNo: item.mh_no,
                  bankAccount: item.bank_account,
                  bankBranch: item.bank_branch,
                  ifscCode: item.ifsc_code,

                  references:
                    typeof item.references_json === "string"
                      ? JSON.parse(item.references_json)
                      : item.references_json || [],

                  previousExtensions: item.previous_extensions || [],
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function OfficeProjectExtensionPage() {
  const navigate = useNavigate();
  const role = userRole();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    new: 0,
    transferred: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [manageId, setManageId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);
const loadCounts = async () => {
  try {
    const res = await fetch(
      `${API}/dashboard-counts?username=${encodeURIComponent(
        currentUser(),
      )}&role=${role}`,
    );

    const data = await res.json();

    console.log("Dashboard API:", data);

    setCounts(data);
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
    loadRows();
    loadCounts();
  }, [role, activeTab]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadRows = async () => {
    try {
      setLoading(true);
      const name = currentUser();
      let url = "";

      if (activeTab === "active") {
        url =
          role === "assistant"
            ? `${API}/assigned-to-me?username=${encodeURIComponent(name)}`
            : role === "superintendent"
              ? `${API}/assigned-to-supervisor?username=${encodeURIComponent(name)}`
              : `${API}/assigned-to-director?username=${encodeURIComponent(name)}`;
      } else if (activeTab === "transferred") {
        url = `${API}/transferred-by-me?username=${encodeURIComponent(name)}`;
      } else {
        url = `${API}/completed-by-me?username=${encodeURIComponent(name)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load extensions", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

 

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.project_title?.toLowerCase().includes(q) ||
        r.pi_name?.toLowerCase().includes(q) ||
        r.funding_agency?.toLowerCase().includes(q) ||
        String(r.id).includes(q),
    );
  }, [rows, search]);
  const tabCounts = {
    active: counts.new,
    transferred: counts.transferred,
    completed: counts.completed,
  };
  /* ── Action handlers — hit real backend, then reload ── */
  const handleApproveTransfer = async (item, staff) => {
    try {
      const endpoint =
        role === "superintendent"
          ? `${API}/${item.id}/approve-and-assign-director`
          : `${API}/${item.id}/approve-and-assign`;
      await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: staff ? staff.name : "APPROVED",
          assigned_from: currentUser(),
          remarks: "",
        }),
      });
      showToast(`Approved & transferred to ${staff?.name || "next level"}`);
      await loadRows();
      await loadCounts();
    } catch (err) {
      console.error("Failed to approve and transfer", err);
    }
  };

  const handlePlainTransfer = async (item, staff) => {
    try {
      await fetch(`${API}/${item.id}/transfer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: staff.name,
          assigned_from: currentUser(),
          remarks: "",
        }),
      });
      showToast(`Transferred to ${staff.name}`);
      await loadRows();
      await loadCounts();
    } catch (err) {
      console.error("Failed to transfer", err);
    }
  };

  const handleFinalApprove = async (item) => {
    try {
      await fetch(`${API}/${item.id}/final-approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_from: currentUser(),
          remarks: "",
        }),
      });
      showToast(`Extension #${item.id} approved ✓`);
      await loadRows();
      await loadCounts();
    } catch (err) {
      console.error("Failed to final approve", err);
    }
  };

  const tabs =
    role === "assistant"
      ? [
          { key: "active", label: "New Requests" },
          { key: "transferred", label: "Transferred" },
          { key: "completed", label: "Completed" },
        ]
      : role === "superintendent"
        ? [
            { key: "active", label: "In My Queue" },
            { key: "transferred", label: "All Transferred" },
            { key: "completed", label: "Completed" },
          ]
        : [
            { key: "active", label: "Awaiting Approval" },
            { key: "completed", label: "Completed" },
          ];

  return (
    <div className={`project-dashboard ${mounted ? "fs-loaded" : ""}`}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 999999,
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "13px",
            background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
            color: toast.type === "success" ? "#15803d" : "#b91c1c",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          }}
        >
          {toast.msg}
        </div>
      )}

      <div className="fs-top-nav">
        <button
          className="fs-btn-back"
          onClick={() => navigate("/projects/project-requests")}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </button>
        <div className="fs-nav-right">
          <span className={`fs-role-chip fs-role-${role}`}>
            {role === "assistant"
              ? "🟢"
              : role === "superintendent"
                ? "🔵"
                : "🔴"}{" "}
            {role}
          </span>
        </div>
      </div>

      <div className="fs-header">
        <h1 className="fs-header-title">Project Extension Claims</h1>
        <p className="fs-header-sub">
          Review no-cost extension requests and update revised project timelines
        </p>
      </div>

      <StatsRow counts={counts} />

      <div className="tab-switcher">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label} ({tabCounts[t.key] || 0})
          </button>
        ))}
      </div>

      <div className="fs-search-bar">
        <div className="fs-search-inner">
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by project, PI, agency, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="fs-search-clear" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Request ID</th>
            <th>Project / PI</th>
            <th>Agency</th>
            <th>Original End</th>
            <th>Extension</th>
            <th>Revised End</th>
            <th>Status</th>
            {(activeTab === "transferred" || activeTab === "active") && (
              <th>Stage</th>
            )}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={10}
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#94a3b8",
                }}
              >
                Loading...
              </td>
            </tr>
          )}
          {!loading && filtered.length === 0 && (
            <tr>
              <td
                colSpan={10}
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#94a3b8",
                }}
              >
                {search ? `No results for "${search}"` : "No items to display"}
              </td>
            </tr>
          )}
          {!loading &&
            filtered.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td style={{ fontWeight: 700, color: "#1d4ed8" }}>
                  #{item.id}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>
                    {item.project_title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {item.pi_name}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {item.funding_agency}
                  </span>
                </td>
                <td
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                >
                  {fmtDateGB(item.original_end_date)}
                </td>
                <td>
                  <span
                    style={{
                      background: "#f0fdf4",
                      color: "#15803d",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    {item.extension_period}
                  </span>
                </td>
                <td
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#15803d",
                  }}
                >
                  {fmtDateGB(item.revised_end_date)}
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                {(activeTab === "transferred" || activeTab === "active") && (
                  <td>
                    <StageBadge status={item.status} />
                  </td>
                )}
                <td>
                  <div className="fs-actions">
                    <button
                      className="btn-view"
                      onClick={() => setManageId(item.id)}
                      title="View tracking and report"
                    >
                      👁 View
                    </button>

                    {role !== "director" && activeTab === "active" && (
                      <ProjectApprovalTransferCell
                        item={item}
                        userRole={role}
                        onApproveTransfer={handleApproveTransfer}
                        onPlainTransfer={handlePlainTransfer}
                      />
                    )}

                    {role === "director" && activeTab === "active" && (
                      <button
                        className="btn-approve"
                        onClick={() => handleFinalApprove(item)}
                      >
                        ✓ Approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {manageId && (
        <ManageModal
          extensionId={manageId}
          editable={activeTab === "active"}
          onClose={() => setManageId(null)}
          onActed={() => {
            loadRows();
            loadCounts();
          }}
          role={role}
        />
      )}
    </div>
  );
}
