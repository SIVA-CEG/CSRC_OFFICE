import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProjectApprovalTransferCell from "./ProjectApprovalTransferCell";
import "./FreshSanction.css";
import html2pdf from "html2pdf.js";
import CSRCProceedingsReport, {
  assembleReportData,
} from "./CSRCProceedingsReport";
// ── Helpers ───────────────────────────────────────────────────────────────────
const userRole = () => sessionStorage.getItem("userRole") || "assistant";
const currentUser = () => {
  try {
    const u = JSON.parse(sessionStorage.getItem("proceedings_user") || "{}");
    return u.name || userRole();
  } catch {
    return userRole();
  }
};

const fmtINRStrict = (n) => {
  const num = parseFloat(n) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fmtDateGB = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB");
};

const today = () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

const sumAmounts = (items, key) =>
  (items || []).reduce((acc, it) => acc + (parseFloat(it[key]) || 0), 0);

// ── Transfer Timeline ─────────────────────────────────────────────────────────
function TransferTimeline({ history, currentHolder, isCompleted }) {
  const timelineStyle = {
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
    date: { fontSize: "11px", color: "#888", marginBottom: "2px" },
    transfer: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      flexWrap: "wrap",
    },
    from: { fontSize: "12px", color: "#555" },
    arrow: { fontSize: "13px", color: "#999" },
    to: { fontSize: "12px", fontWeight: 600, color: "#1e293b" },
    statusBadge: (approved) => ({
      marginTop: "4px",
      fontSize: "10px",
      padding: "1px 8px",
      borderRadius: "999px",
      background: approved ? "#f0fdf4" : "#eff6ff",
      color: approved ? "#16a34a" : "#2563eb",
      border: `1px solid ${approved ? "#bbf7d0" : "#bfdbfe"}`,
      display: "inline-block",
    }),
    pendingEntry: { display: "flex", gap: "12px" },
    pendingDot: {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      background: "#fef9c3",
      color: "#ca8a04",
      border: "2px solid #ca8a04",
      flexShrink: 0,
    },
    pendingLabel: {
      fontSize: "12px",
      color: "#92400e",
      fontWeight: 500,
      paddingTop: "4px",
    },
  };

  if (!history || history.length === 0) {
    return (
      <div
        style={{
          color: "#888",
          fontSize: "13px",
          textAlign: "center",
          padding: "24px 0",
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
    <div style={timelineStyle.wrap}>
      {history.map((entry, i) => {
        const approved = isApprovedAction(entry.action);
        return (
          <div key={entry.id || i} style={timelineStyle.entry}>
            <div style={timelineStyle.dotWrap}>
              <div style={timelineStyle.dot(approved)}>
                {approved ? "✔" : "↪"}
              </div>
              {i < history.length - 1 && <div style={timelineStyle.line} />}
            </div>
            <div style={timelineStyle.content}>
              <div style={timelineStyle.date}>
                {fmtDateGB(entry.created_at)}
              </div>
              <div style={timelineStyle.transfer}>
                <span style={timelineStyle.from}>{entry.assigned_from}</span>
                <span style={timelineStyle.arrow}>→</span>
                <span style={timelineStyle.to}>{entry.assigned_to}</span>
              </div>
              <div style={timelineStyle.statusBadge(approved)}>
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
        <div style={timelineStyle.pendingEntry}>
          <div style={timelineStyle.pendingDot}>⏳</div>
          <div style={timelineStyle.pendingLabel}>
            Waiting for action from{" "}
            <strong>{currentHolder || "Next Approver"}</strong>
          </div>
        </div>
      ) : (
        <div style={timelineStyle.pendingEntry}>
          <div
            style={{
              ...timelineStyle.pendingDot,
              background: "#dcfce7",
              color: "#16a34a",
              border: "2px solid #16a34a",
            }}
          >
            ✔
          </div>
          <div style={{ ...timelineStyle.pendingLabel, color: "#15803d" }}>
            Process Completed — Fully Approved
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stage Badge ───────────────────────────────────────────────────────────────
function StageBadge({ status }) {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED")
    return <span className="fs-stage-badge fs-stage-completed">Completed</span>;
  if (s === "ASSIGNED TO DIRECTOR")
    return <span className="fs-stage-badge fs-stage-dir">With Director</span>;
  if (s === "ASSIGNED TO SUPERVISOR")
    return (
      <span className="fs-stage-badge fs-stage-supdt">With Supervisor</span>
    );
  if (s === "ASSIGNED")
    return <span className="fs-stage-badge fs-stage-asst">With Assistant</span>;
  return <span className="fs-stage-badge fs-stage-asst">{status}</span>;
}

// ── Manage Modal ──────────────────────────────────────────────────────────────
function ManageModal({ installmentId, editable, onClose, onSaved }) {
  const [tab, setTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [signatures, setSignatures] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Separate draft state for each editable table so amounts can be changed
  const [draft, setDraft] = useState(null); // installment row
  const [draftRecurring, setDraftRecurring] = useState(null); // recurring_heads row
  const [draftOverhead, setDraftOverhead] = useState(null); // overheads row
  const [draftEquipment, setDraftEquipment] = useState([]);
  const [draftManpower, setDraftManpower] = useState([]);
  // ── FIX 3: history is fetched separately so tracking always works even if
  // the detail endpoint doesn't join/return installment_assign_history rows.
  const [history, setHistory] = useState([]);

  const reportRef = useRef(null);

  useEffect(() => {
    loadDetail();
  }, [installmentId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const [detailRes, sigRes, histRes] = await Promise.all([
        fetch(
          `http://localhost:5100/api/renewal-sanctions/detail/${installmentId}`,
        ),
        fetch(
          `http://localhost:5100/api/renewal-sanctions/signatures/${installmentId}`,
        ),
        // ── FIX 3: separate history fetch ──────────────────────────────────
        fetch(
          `http://localhost:5100/api/renewal-sanctions/assign-history/${installmentId}`,
        ),
      ]);
      const detail = await detailRes.json();
      const sigs = await sigRes.json();
      const hist = await histRes.json();

      setData(detail);
      setSignatures(sigs);
      setHistory(Array.isArray(hist) ? hist : detail.history || []);

      // ── FIX 1: initialise all three draft states ───────────────────────
      setDraft({ ...detail.installment });
      setDraftRecurring({ ...(detail.recurringHeads?.[0] || {}) });
      setDraftOverhead({ ...(detail.overheads?.[0] || {}) });

      setDraftEquipment(detail.nonRecurring || []);
      setDraftManpower(detail.manpower || []);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to load installment detail", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportRef.current) return;

    html2pdf()
      .set({
        margin: [5, 5, 5, 5],

        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
        filename: `${inst.sanction_reference_no || "Proceedings"}.pdf`,

        image: {
          type: "jpeg",
          quality: 1,
        },

        html2canvas: {
          scale: 1,
          useCORS: true,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(reportRef.current)
      .save();
  };

  const handleSaveClick = async () => {
    try {
      // Save the main installment row
      await fetch(
        `http://localhost:5100/api/renewal-sanctions/${installmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      for (const eq of draftEquipment) {
        await fetch(
          `http://localhost:5100/api/renewal-sanctions/equipment/${eq.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eq),
          },
        );
      }
      for (const mp of draftManpower) {
        await fetch(
          `http://localhost:5100/api/renewal-sanctions/manpower/${mp.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mp),
          },
        );
      }
      // ── FIX 1: also persist recurring heads and overheads if they exist ──
      if (draftRecurring?.id) {
        await fetch(
          `http://localhost:5100/api/renewal-sanctions/recurring-heads/${draftRecurring.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draftRecurring),
          },
        );
      }
      if (draftOverhead?.id) {
        await fetch(
          `http://localhost:5100/api/renewal-sanctions/overheads/${draftOverhead.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draftOverhead),
          },
        );
      }

      setIsEditing(false);
      await loadDetail();
      onSaved && onSaved();
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save changes");
    }
  };

  // ── Derived totals — always recalculate from the current draft values so
  // they update live as the user types in edit mode. ─────────────────────────
  const nonRecurringTotal = sumAmounts(data?.nonRecurring, "amount");
  const manpowerTotal = sumAmounts(data?.manpower, "amount");

  const consumables = parseFloat(draftRecurring?.consumables) || 0;
  const travel = parseFloat(draftRecurring?.travel) || 0;
  const contingency = parseFloat(draftRecurring?.contingency) || 0;
  const ssrBudget = parseFloat(draftRecurring?.ssr_budget) || 0;
  const overheadAmt = parseFloat(draftOverhead?.total_overhead) || 0;

  const recurringTotal = manpowerTotal + consumables + travel + contingency;

  // ── FIX 2: Grand total ────────────────────────────────────────────────────
  const grandTotal =
    nonRecurringTotal + recurringTotal + ssrBudget + overheadAmt;

  // ── Styles ────────────────────────────────────────────────────────────────
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 100000,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "16px",
  };
  const modalStyle = {
    background: "#f8fafc",
    borderRadius: "16px",
    width: "min(960px, 96vw)",
    height: "calc(100vh - 32px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
  };
  const headerStyle = {
    padding: "14px 20px",
    background: "#1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    flexShrink: 0,
  };
  const tabBarStyle = {
    display: "flex",
    gap: "4px",
    padding: "0 20px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  };
  const tabBtnStyle = (active) => ({
    padding: "12px 16px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    color: active ? "#1d4ed8" : "#64748b",
    borderBottom: active ? "3px solid #1d4ed8" : "3px solid transparent",
  });
  const bodyStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    background: tab === "report" ? "#e5e7eb" : "#f8fafc",
  };
  const closeBtnStyle = {
    background: "#ef4444",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    padding: "6px 13px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  };
  const editBtnStyle = {
    background: "#2563eb",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    padding: "6px 13px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "12px",
  };

  if (loading || !data) {
    return (
      <div
        style={overlayStyle}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          style={{
            ...modalStyle,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <div style={{ color: "#64748b", fontWeight: 600 }}>Loading...</div>
        </div>
      </div>
    );
  }

  const inst = data.installment;
  const isCompleted = (inst.status || "").toUpperCase() === "COMPLETED";
  const installmentIndexMap = {
    I: 0,
    II: 1,
    III: 2,
    IV: 3,
    V: 4,
  };

  const currentInstallmentIndex = installmentIndexMap[inst.installment] || 0;
  const reportData = {
    ...assembleReportData(
      {
        name: inst.pi_name,
        designation: inst.pi_designation,
        department: inst.pi_dept,
        campus: inst.pi_campus,
      },
      {
        title: inst.project_title,
        fundingAgency: inst.funding_agency,
      },
      {
        installments:
          data.allInstallments?.map((x) => ({
            installmentNo: x.installment,

            equipment: (x.non_recurring || []).map((n) => ({
              name: n.equipment,
              amount: Number(n.amount || 0),
            })),

            manpowerList: (x.manpower || []).map((m) => ({
              type: m.manpower_type,
              amount: Number(m.amount || 0),
            })),

            consumables: Number(x.recurring?.consumables || 0),
            travel: Number(x.recurring?.travel || 0),
            contingency: Number(x.recurring?.contingency || 0),
            ssrBudget: Number(x.recurring?.ssr_budget || 0),

            overheadTotal: Number(x.overhead?.total_overhead || 0),

            releasedDate: x.created_at,
          })) || [],

        proceedingNo: inst.sanction_reference_no,
        proceedingDate: today(),
      },
      currentInstallmentIndex,
    ),

    assistantApproved: [
      "ASSIGNED TO SUPERVISOR",
      "ASSIGNED TO DIRECTOR",
      "COMPLETED",
      "APPROVED",
    ].includes((inst.status || "").toUpperCase()),

    superintendentApproved: [
      "ASSIGNED TO DIRECTOR",
      "COMPLETED",
      "APPROVED",
    ].includes((inst.status || "").toUpperCase()),

    directorApproved: ["COMPLETED", "APPROVED"].includes(
      (inst.status || "").toUpperCase(),
    ),
  };
  return (
    <div
      style={overlayStyle}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              OTHER SANCTION —{" "}
              {inst.sanction_reference_no || `Installment #${inst.id}`}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.3,
                maxWidth: "640px",
              }}
            >
              {inst.project_title}
            </div>
            <div style={{ marginTop: "8px" }}>
              <StageBadge status={inst.status} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {editable && tab === "details" && !isEditing && (
              <button style={editBtnStyle} onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </button>
            )}
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
            <button style={closeBtnStyle} onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={tabBarStyle}>
          <button
            style={tabBtnStyle(tab === "details")}
            onClick={() => setTab("details")}
          >
            📋 Full Details &amp; Tracking
          </button>
          <button
            style={tabBtnStyle(tab === "report")}
            onClick={() => setTab("report")}
          >
            📄 Proceedings Report
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {tab === "details" ? (
            <div
              className="detail-card"
              style={{
                boxShadow: "none",
                padding: 0,
                background: "transparent",
              }}
            >
              {/* ── Project Details ── */}
              <h3 style={{ marginTop: 0 }}>Project Details</h3>
              <div className="detail-grid">
                <div>
                  <label>Sanction Reference No</label>
                  <input
                    className="edit-input"
                    disabled={!isEditing}
                    value={draft.sanction_reference_no || ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        sanction_reference_no: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Funding Agency</label>
                  <input
                    className="edit-input"
                    disabled
                    value={inst.funding_agency || ""}
                    readOnly
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label>Project Title</label>
                  <input
                    className="edit-input"
                    disabled
                    value={inst.project_title || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label>PI Name</label>
                  <input
                    className="edit-input"
                    disabled
                    value={inst.pi_name || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label>PI Designation</label>
                  <input
                    className="edit-input"
                    disabled
                    value={inst.pi_designation || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label>Department</label>
                  <input
                    className="edit-input"
                    disabled
                    value={inst.pi_dept || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label>Campus</label>
                  <input
                    className="edit-input"
                    disabled
                    value={inst.pi_campus || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label>Project Start Date</label>
                  <input
                    type="date"
                    className="edit-input"
                    disabled={!isEditing}
                    value={
                      draft.project_start_date
                        ? draft.project_start_date.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setDraft({ ...draft, project_start_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Project End Date</label>
                  <input
                    type="date"
                    className="edit-input"
                    disabled={!isEditing}
                    value={
                      draft.project_end_date
                        ? draft.project_end_date.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setDraft({ ...draft, project_end_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Installment</label>
                  <input
                    className="edit-input"
                    disabled
                    value={inst.installment || ""}
                    readOnly
                  />
                </div>
              </div>

              {/* ── Budget Breakdown (FIX 1 + FIX 2) ── */}
              <h3>Installment Budget Breakdown</h3>
              <div className="detail-grid">
                {/* Manpower — derived from manpower sub-table, always read-only */}
                <div>
                  <label>
                    Manpower (₹){" "}
                    <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                      — from Manpower
                    </span>
                  </label>
                  <input
                    className="edit-input"
                    disabled
                    value={fmtINRStrict(manpowerTotal)}
                  />
                </div>

                {/* ── FIX 1: recurring fields now use draftRecurring and respect isEditing ── */}
                <div>
                  <label>Consumables &amp; Accessories (₹)</label>
                  <input
                    className="edit-input"
                    type="number"
                    disabled={!isEditing}
                    value={draftRecurring?.consumables ?? ""}
                    onChange={(e) =>
                      setDraftRecurring({
                        ...draftRecurring,
                        consumables: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Travel (₹)</label>
                  <input
                    className="edit-input"
                    type="number"
                    disabled={!isEditing}
                    value={draftRecurring?.travel ?? ""}
                    onChange={(e) =>
                      setDraftRecurring({
                        ...draftRecurring,
                        travel: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Contingency (₹)</label>
                  <input
                    className="edit-input"
                    type="number"
                    disabled={!isEditing}
                    value={draftRecurring?.contingency ?? ""}
                    onChange={(e) =>
                      setDraftRecurring({
                        ...draftRecurring,
                        contingency: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>SSR Budget (₹)</label>
                  <input
                    className="edit-input"
                    type="number"
                    disabled={!isEditing}
                    value={draftRecurring?.ssr_budget ?? ""}
                    onChange={(e) =>
                      setDraftRecurring({
                        ...draftRecurring,
                        ssr_budget: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ── FIX 1: overhead field now uses draftOverhead and respects isEditing ── */}
              </div>

              {/* ── FIX 2: Grand Total row ── */}

              {/* Equipment + Manpower breakdowns */}
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Equipment Items{" "}
                    <span style={{ fontWeight: 700, color: "#1d4ed8" }}>
                      (₹ {fmtINRStrict(nonRecurringTotal)})
                    </span>
                  </label>
                  {(data.nonRecurring || []).length === 0 ? (
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      None added
                    </div>
                  ) : (
                    draftEquipment.map((eq, i) => (
                      <div
                        key={eq.id || i}
                        style={{
                          display: "flex",
                          gap: "10px",
                          padding: "4px 0",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <input
                          disabled={!isEditing}
                          value={eq.equipment || ""}
                          onChange={(e) => {
                            const temp = [...draftEquipment];
                            temp[i].equipment = e.target.value;
                            setDraftEquipment(temp);
                          }}
                          style={{ flex: 1 }}
                        />

                        <input
                          type="number"
                          disabled={!isEditing}
                          value={eq.amount || ""}
                          onChange={(e) => {
                            const temp = [...draftEquipment];
                            temp[i].amount = e.target.value;
                            setDraftEquipment(temp);
                          }}
                          style={{ width: "120px" }}
                        />
                      </div>
                    ))
                  )}
                </div>
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Manpower Types{" "}
                    <span style={{ fontWeight: 700, color: "#1d4ed8" }}>
                      (₹ {fmtINRStrict(manpowerTotal)})
                    </span>
                  </label>
                  {(data.manpower || []).length === 0 ? (
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      None added
                    </div>
                  ) : (
                    draftManpower.map((mp, i) => (
                      <div
                        key={mp.id || i}
                        style={{
                          display: "flex",
                          gap: "10px",
                          padding: "4px 0",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <input
                          disabled={!isEditing}
                          value={mp.manpower_type || ""}
                          onChange={(e) => {
                            const temp = [...draftManpower];
                            temp[i].manpower_type = e.target.value;
                            setDraftManpower(temp);
                          }}
                          style={{ flex: 1 }}
                        />

                        <input
                          type="number"
                          disabled={!isEditing}
                          value={mp.amount || ""}
                          onChange={(e) => {
                            const temp = [...draftManpower];
                            temp[i].amount = e.target.value;
                            setDraftManpower(temp);
                          }}
                          style={{ width: "120px" }}
                        />
                      </div>
                    ))
                  )}
                </div>
                {/* Non-Recurring — derived from equipment sub-table, always read-only */}
              </div>
              <br />
              <div>
                <label>
                  Non-Recurring Total (₹){" "}
                  <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                    — from Equipment
                  </span>
                </label>
                <input
                  className="edit-input"
                  disabled
                  value={fmtINRStrict(nonRecurringTotal)}
                />
              </div>
              <br />
              <div>
                <label>
                  Recurring Heads Total (₹){" "}
                  <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                    — auto
                  </span>
                </label>
                <input
                  className="edit-input"
                  disabled
                  value={fmtINRStrict(recurringTotal)}
                />
              </div>
              <br />
              <div>
                <label>Overhead Total (₹)</label>
                <input
                  className="edit-input"
                  type="number"
                  disabled={!isEditing}
                  value={draftOverhead?.total_overhead ?? ""}
                  onChange={(e) =>
                    setDraftOverhead({
                      ...draftOverhead,
                      total_overhead: e.target.value,
                    })
                  }
                />
              </div>
              <div
                style={{
                  marginTop: "12px",
                  padding: "14px 16px",
                  background: "#1e293b",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#94a3b8",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  Grand Total (Non-Recurring + Recurring + SSR + Overhead)
                </span>
                <span
                  style={{
                    color: "#34d399",
                    fontWeight: 800,
                    fontSize: "17px",
                    letterSpacing: "0.5px",
                  }}
                >
                  ₹ {fmtINRStrict(grandTotal)}
                </span>
              </div>
              {/* ── FIX 3: Transfer Tracking — now uses separately-fetched history ── */}
              <h3>Transfer Tracking</h3>
              <TransferTimeline
                history={history}
                currentHolder={inst.assigned_to}
                isCompleted={isCompleted}
              />

              {editable && isEditing && (
                <div
                  style={{ display: "flex", gap: "12px", marginTop: "20px" }}
                >
                  <button className="btn-approve" onClick={handleSaveClick}>
                    💾 Save Changes
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setDraft({ ...inst });
                      setDraftRecurring({
                        ...(data.recurringHeads?.[0] || {}),
                      });
                      setDraftOverhead({ ...(data.overheads?.[0] || {}) });
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div ref={reportRef}>
              <CSRCProceedingsReport
                reportData={reportData}
                signatures={{
                  assistant: signatures.asstSig
                    ? `http://localhost:5100/${signatures.asstSig.replace(/\\/g, "/")}`
                    : null,

                  superintendent: signatures.supdtSig
                    ? `http://localhost:5100/${signatures.supdtSig.replace(/\\/g, "/")}`
                    : null,

                  dd: signatures.ddSig
                    ? `http://localhost:5100/${signatures.ddSig.replace(/\\/g, "/")}`
                    : null,

                  director: signatures.dirSig
                    ? `http://localhost:5100/${signatures.dirSig.replace(/\\/g, "/")}`
                    : null,
                }}
                isCompleted={isCompleted}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FreshSanction() {
  const navigate = useNavigate();
  const role = userRole();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [tabCounts, setTabCounts] = useState({
    active: 0,
    transferred: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [manageId, setManageId] = useState(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  useEffect(() => {
    loadRows();
    loadCounts();
  }, [role, activeTab]);
  const loadCounts = async () => {
    try {
      const name = currentUser();

      const activeUrl =
        role === "assistant"
          ? `http://localhost:5100/api/renewal-sanctions/assigned-to-me?username=${encodeURIComponent(name)}`
          : role === "superintendent"
            ? `http://localhost:5100/api/renewal-sanctions/assigned-to-supervisor?username=${encodeURIComponent(name)}`
            : role === "dd"
              ? `http://localhost:5100/api/renewal-sanctions/assigned-to-dd?username=${encodeURIComponent(name)}`
              : `http://localhost:5100/api/renewal-sanctions/assigned-to-director?username=${encodeURIComponent(name)}`;

      const transferredUrl = `http://localhost:5100/api/renewal-sanctions/transferred-by-me?username=${encodeURIComponent(name)}`;

      const completedUrl = `http://localhost:5100/api/renewal-sanctions/completed-by-me?username=${encodeURIComponent(name)}`;

      const [a, t, c] = await Promise.all([
        fetch(activeUrl).then((r) => r.json()),
        fetch(transferredUrl).then((r) => r.json()),
        fetch(completedUrl).then((r) => r.json()),
      ]);

      setTabCounts({
        active: Array.isArray(a) ? a.length : 0,
        transferred: Array.isArray(t) ? t.length : 0,
        completed: Array.isArray(c) ? c.length : 0,
      });
    } catch (err) {
      console.error(err);
    }
  };
  const loadRows = async () => {
    try {
      setLoading(true);
      const name = currentUser();
      let url = "";

      if (activeTab === "active") {
        url =
          role === "assistant"
            ? `http://localhost:5100/api/renewal-sanctions/assigned-to-me?username=${encodeURIComponent(name)}`
            : role === "superintendent"
              ? `http://localhost:5100/api/renewal-sanctions/assigned-to-supervisor?username=${encodeURIComponent(name)}`
              : role === "dd"
                ? `http://localhost:5100/api/renewal-sanctions/assigned-to-dd?username=${encodeURIComponent(name)}`
                : `http://localhost:5100/api/renewal-sanctions/assigned-to-director?username=${encodeURIComponent(name)}`;
      } else if (activeTab === "transferred") {
        url = `http://localhost:5100/api/renewal-sanctions/transferred-by-me?username=${encodeURIComponent(name)}`;
      } else {
        url = `http://localhost:5100/api/renewal-sanctions/completed-by-me?username=${encodeURIComponent(name)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load installments", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (i) =>
        i.project_title?.toLowerCase().includes(s) ||
        i.sanction_reference_no?.toLowerCase().includes(s) ||
        i.funding_agency?.toLowerCase().includes(s) ||
        i.pi_name?.toLowerCase().includes(s),
    );
  }, [rows, search]);

  const handleApproveTransfer = async (item, staff) => {
    try {
      const endpoint =
        role === "superintendent"
          ? `http://localhost:5100/api/renewal-sanctions/${item.id}/approve-and-assign-dd`
          : role === "dd"
            ? `http://localhost:5100/api/renewal-sanctions/${item.id}/approve-and-assign-director`
            : `http://localhost:5100/api/renewal-sanctions/${item.id}/approve-and-assign`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: staff ? staff.name : "APPROVED",
          assigned_from: currentUser(),
          remarks: "",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      loadRows();
    } catch (err) {
      console.error("Failed to approve and transfer", err);
      alert(err.message || "Failed to approve and transfer.");
    }
  };

  const handlePlainTransfer = async (item, staff) => {
    try {
      // DD's "no approval" transfer sends the record BACK a stage to the
      // superviser; every other role's plain transfer stays at the same
      // stage and just reassigns who holds it.
      const endpoint =
        role === "dd"
          ? `http://localhost:5100/api/renewal-sanctions/${item.id}/transfer-to-supervisor`
          : `http://localhost:5100/api/renewal-sanctions/${item.id}/transfer`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: staff.name,
          assigned_from: currentUser(),
          remarks: "",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      loadRows();
    } catch (err) {
      console.error("Failed to transfer", err);
      alert(err.message || "Failed to transfer.");
    }
  };

  const handleFinalApprove = async (item) => {
    try {
      await fetch(
        `http://localhost:5100/api/renewal-sanctions/${item.id}/final-approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assigned_from: currentUser(),
            remarks: "",
          }),
        },
      );
      loadRows();
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
        : role === "dd"
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
      <div className="fs-top-nav">
        <button
          className="fs-btn-back"
          onClick={() => navigate("/projects/dashboard")}
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
        <h1 className="fs-header-title">Other Sanctions</h1>
        <p className="fs-header-sub">
          First installment sanction requests — review, assign account, and
          transfer
        </p>
      </div>

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
            placeholder="Search by title, ref no, agency, PI name..."
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
            <th>Ref No</th>
            <th>Project Title</th>
            <th>PI</th>
            <th>Agency</th>
            <th>Cost (₹)</th>
            <th>Scheme</th>
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
                colSpan={8}
                style={{ textAlign: "center", padding: "32px", color: "#888" }}
              >
                Loading...
              </td>
            </tr>
          )}
          {!loading && filtered.length === 0 && (
            <tr>
              <td
                colSpan={8}
                style={{ textAlign: "center", padding: "32px", color: "#888" }}
              >
                {search ? `No results for "${search}"` : "No items to display"}
              </td>
            </tr>
          )}
          {!loading &&
            filtered.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.sanction_reference_no || "—"}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.project_title}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {item.pi_campus}
                  </div>
                </td>
                <td>
                  <div>{item.pi_name}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {item.pi_dept}
                  </div>
                </td>
                <td>{item.funding_agency}</td>
                <td>₹ {fmtINRStrict(item.total_amount)}</td>
                <td>{item.scheme || "-"}</td>
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
                      title="View full details, track progress, and edit"
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
                        ✓ Final Approve
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
          installmentId={manageId}
          editable={activeTab === "active"}
          onClose={() => setManageId(null)}
          onSaved={loadRows}
        />
      )}
    </div>
  );
}
