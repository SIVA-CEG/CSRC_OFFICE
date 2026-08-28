import React, { useEffect, useState } from "react";

function actionLabel(action) {
  switch (action) {
    case "ASSIGN":
      return "Assigned by Office";
    case "APPROVE_AND_ASSIGN":
      return "Approved by Assistant & forwarded to Superintendent";
    case "APPROVE_AND_ASSIGN_DIRECTOR":
      return "Approved by Superintendent & forwarded to Director";
    case "FINAL_APPROVE":
      return "Final approval granted by Director";
    case "TRANSFER":
      return "Transferred without approval";
    default:
      return action || "Action recorded";
  }
}

export default function TrackModal({ item, onClose }) {
  const [history, setHistory] = useState(item.transferHistory || []);
  const [loading, setLoading] = useState(history.length === 0);
  const [error, setError] = useState("");

  const fallbackHistory =
    history.length > 0 || !item.assignedTo
      ? history
      : [
          {
            from: "Office",
            to: item.assignedTo,
            date: item.created_at
              ? new Date(item.created_at).toLocaleDateString("en-GB")
              : "",
            remarks: item.assign_remarks || item.remarks || "Assigned",
            action: "ASSIGN",
          },
        ];

  const currentStep = fallbackHistory[fallbackHistory.length - 1] || null;
  const currentStage = currentStep?.action
    ? actionLabel(currentStep.action)
    : item.status || "Assigned";
  const currentHolder = currentStep?.to || item.assignedTo || "";
  const normalizedStage =
    currentStep?.action === "APPROVE_AND_ASSIGN"
      ? `With Supervisor (${currentHolder})`
      : currentStep?.action === "APPROVE_AND_ASSIGN_DIRECTOR"
        ? `With Director (${currentHolder})`
        : currentStep?.action === "FINAL_APPROVE"
          ? "Completed"
          : currentStep?.action === "ASSIGN"
            ? `With Assistant (${currentHolder})`
            : item.status || "Assigned";

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (item.transferHistory?.length) return;
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:5100/api/endorsements/assign-history/${item.id}`,
        );

        if (!res.ok) {
          throw new Error(`Failed to load tracking history (${res.status})`);
        }

        const data = await res.json();
        const mapped = Array.isArray(data)
          ? data.map((step) => ({
              from: step.assigned_from,
              to: step.assigned_to,
              date: new Date(step.created_at).toLocaleDateString("en-GB"),
              remarks: step.remarks,
              action: step.action,
            }))
          : [];

        if (!cancelled) {
          setHistory(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load tracking history");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [item.id, item.transferHistory]);

  return (
    <div
      className="et-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="et-modal et-track-modal">
        <div className="et-modal-header">
          <h2>Track Endorsement</h2>

          <button className="et-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="et-modal-body">
          <div className="track-summary">
            <div>
              <strong>Proposal ID:</strong> #{item.id}
            </div>

            <div>
              <strong>Applicant:</strong> {item.from}
            </div>

            <div>
              <strong>Current Status:</strong> {normalizedStage}
            </div>

            <div>
              <strong>Assigned To:</strong> {item.assignedTo}
            </div>

            <div>
              <strong>Next Action:</strong>{" "}
              {currentStep?.action === "FINAL_APPROVE"
                ? "Process completed"
                : currentHolder
                  ? `Waiting for action from ${currentHolder}`
                  : currentStage}
            </div>
          </div>

          <div className="track-timeline">
            {loading ? (
              <div className="track-empty">Loading tracking history...</div>
            ) : error ? (
              <div className="track-empty">{error}</div>
            ) : fallbackHistory.length === 0 ? (
              <div className="track-empty">No movement history found</div>
            ) : (
              fallbackHistory.map((step, index) => (
                <div className="track-item" key={index}>
                  <div className="track-dot" />

                  <div className="track-content">
                    {step.action && (
                      <div className="track-remarks">
                        {actionLabel(step.action)}
                      </div>
                    )}

                    <div className="track-title">
                      {step.from}
                      {" → "}
                      {step.to}
                    </div>

                    <div className="track-date">{step.date}</div>

                    {step.remarks && (
                      <div className="track-remarks">{step.remarks}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
