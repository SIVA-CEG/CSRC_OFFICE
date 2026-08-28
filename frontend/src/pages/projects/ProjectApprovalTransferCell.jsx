import React, { useState, useEffect } from "react";

// Read the signature saved on the profile page (kept for compatibility with
// any local-storage-based profile signature flow still in use elsewhere).
export function getProfileSignature(role) {
  try {
    const p = JSON.parse(
      sessionStorage.getItem(`csrc_profile_${role}`) || "null",
    );
    return p?.signature || null;
  } catch {
    return null;
  }
}

export default function ProjectApprovalTransferCell({
  item,
  userRole,
  onApproveTransfer,
  onPlainTransfer,
}) {
  const [activeType, setActiveType] = useState(null); // "approve" | "plain" | null
  const [selectedId, setSelectedId] = useState("");
  const [confirming, setConfirming] = useState(false);

  const [supervisors, setSupervisors] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [dds, setDds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5100/api/sanctions/staff/supervisors")
      .then((r) => r.json())
      .then(setSupervisors)
      .catch(console.error);
    fetch("http://localhost:5100/api/sanctions/staff/assistants")
      .then((r) => r.json())
      .then(setAssistants)
      .catch(console.error);
    fetch("http://localhost:5100/api/sanctions/staff/directors")
      .then((r) => r.json())
      .then(setDirectors)
      .catch(console.error);
    fetch("http://localhost:5100/api/sanctions/staff/dd")
      .then((r) => r.json())
      .then(setDds)
      .catch(console.error);
  }, []);

  const approveEligible =
    userRole === "assistant"
      ? supervisors
      : userRole === "superintendent"
        ? dds
        : userRole === "dd"
          ? directors
          : [];

  const plainEligible =
    userRole === "assistant"
      ? assistants
      : userRole === "superintendent"
        ? supervisors
        : userRole === "dd"
          ? supervisors // DD's "no approval" transfer sends it BACK to superviser
          : [];

  const isDirector = userRole === "director";

  const reset = () => {
    setActiveType(null);
    setSelectedId("");
    setConfirming(false);
  };

  const handleOk = () => {
    if (!selectedId) return;
    const allStaff = [...supervisors, ...assistants, ...directors, ...dds];
    const staff = allStaff.find(
      (s) =>
        String(s.id) === String(selectedId) ||
        String(s.username || "") === String(selectedId) ||
        String(s.name || "") === String(selectedId),
    );
    if (activeType === "approve") onApproveTransfer(item, staff);
    if (activeType === "plain") onPlainTransfer(item, staff);
    reset();
  };

  // Director is the final approver — handled by a separate "Final Approve"
  // button in the parent table, so this cell renders nothing for director.
  if (isDirector) {
    return null;
  }

  const approveLabel =
    userRole === "assistant"
      ? "✅ Approve & Transfer to Supervisor"
      : userRole === "superintendent"
        ? "✅ Approve & Transfer to DD"
        : "✅ Approve & Transfer to Director";

  const approvePopupTitle =
    userRole === "assistant"
      ? "Approve & transfer to supervisor:"
      : userRole === "superintendent"
        ? "Approve & transfer to DD:"
        : "Approve & transfer to director:";

  return (
    <div className="fs-transfer-cell">
      {!activeType ? (
        <div className="fs-action-buttons">
          <button
            className="btn-approve"
            onClick={() => setActiveType("approve")}
          >
            {approveLabel}
          </button>
          <button className="btn-edit" onClick={() => setActiveType("plain")}>
            ↪ Transfer Without Approve
          </button>
        </div>
      ) : (
        <div className="fs-transfer-popup">
          <div className="fs-transfer-popup-title">
            {activeType === "approve"
              ? approvePopupTitle
              : userRole === "dd"
                ? "Transfer back to superviser:"
                : "Transfer within current level to:"}
          </div>
          <select
            className="edit-input"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Select Staff --</option>
            {(activeType === "approve" ? approveEligible : plainEligible).map(
              (s) => (
                <option key={s.id} value={s.username || s.name || s.id}>
                  {s.name} ({s.role})
                </option>
              ),
            )}
          </select>
          <div className="fs-transfer-actions">
            <button
              className="btn-approve"
              onClick={() => {
                if (selectedId) setConfirming(true);
              }}
              disabled={!selectedId}
            >
              OK
            </button>
            <button className="btn-edit" onClick={reset}>
              ✕
            </button>
          </div>
          {confirming && (
            <div className="fs-transfer-confirm">
              <span>
                {activeType === "approve"
                  ? "Approve and transfer to "
                  : "Transfer to "}
                <b>
                  {
                    [...supervisors, ...assistants, ...directors, ...dds].find(
                      (s) =>
                        String(s.id) === String(selectedId) ||
                        String(s.username || "") === String(selectedId) ||
                        String(s.name || "") === String(selectedId),
                    )?.name
                  }
                </b>
                ?
              </span>
              <button className="btn-approve" onClick={handleOk}>
                Confirm
              </button>
              <button className="btn-edit" onClick={() => setConfirming(false)}>
                Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
