import React, { useState } from "react";
import { PROJECT_STAFF } from "./ProjectContext";
import "./FreshSanction.css";

// ── Read the signature saved on the profile page ──────────────────────────────
export function getProfileSignature(role) {
  try {
    const p = JSON.parse(localStorage.getItem(`csrc_profile_${role}`) || "null");
    return p?.signature || null;
  } catch {
    return null;
  }
}

// ── Approve & Transfer / Same-Level Transfer Cell (shared across project pages) ─
export default function ProjectApprovalTransferCell({ item, onApproveTransfer, onPlainTransfer, userRole }) {
  const [activeType, setActiveType] = useState(null); // "approve" | "plain" | null
  const [selectedId, setSelectedId] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Who you can Approve & Transfer to (next level up)
  const approveEligible =
    userRole === "assistant"      ? PROJECT_STAFF.filter(s => s.role === "superintendent") :
    userRole === "superintendent" ? PROJECT_STAFF.filter(s => s.role === "director") :
    [];

  // Who you can transfer to at the same level, without approving
  const plainEligible =
    userRole === "assistant"      ? PROJECT_STAFF.filter(s => s.role === "assistant") :
    userRole === "superintendent" ? PROJECT_STAFF.filter(s => s.role === "superintendent") :
    [];

  // Director is the final approver in these pages — handled outside this cell
  if (userRole === "director") return null;

  const reset = () => { setActiveType(null); setSelectedId(""); setConfirming(false); };

  const handleOk = () => {
    if (!selectedId) return;
    const staff = PROJECT_STAFF.find(s => s.id === parseInt(selectedId));
    if (activeType === "approve") onApproveTransfer(item, staff);
    if (activeType === "plain")   onPlainTransfer(item, staff);
    reset();
  };

  return (
    <div className="fs-transfer-cell">
      {!activeType ? (
        <div className="fs-action-buttons">
          <button className="fs-approve-btn" onClick={() => setActiveType("approve")}>
            ✅ Approve &amp; Transfer
          </button>
          <button className="fs-plain-transfer-btn" onClick={() => setActiveType("plain")}>
            ↪ Transfer (No Approval)
          </button>
        </div>
      ) : (
        <div className="fs-transfer-popup">
          <div className="fs-transfer-popup-title">
            {activeType === "approve" ? "Approve & Transfer to:" : "Transfer (same level) to:"}
          </div>
          <select
            className="fs-transfer-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">-- Select Staff --</option>
            {(activeType === "approve" ? approveEligible : plainEligible).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
          <div className="fs-transfer-actions">
            <button className="fs-transfer-ok" onClick={() => { if (selectedId) setConfirming(true); }} disabled={!selectedId}>OK</button>
            <button className="fs-transfer-cancel" onClick={reset}>✕</button>
          </div>
          {confirming && (
            <div className="fs-transfer-confirm">
              <span>
                {activeType === "approve" ? "Approve and transfer to " : "Transfer to "}
                <b>{PROJECT_STAFF.find(s => s.id === parseInt(selectedId))?.name}</b>?
              </span>
              <button className="fs-transfer-ok" onClick={handleOk}>Confirm</button>
              <button className="fs-transfer-cancel" onClick={() => setConfirming(false)}>Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}