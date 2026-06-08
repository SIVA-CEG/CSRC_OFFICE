import React from "react";

export default function TrackModal({
  item,
  onClose,
}) {
  const history =
    item.transferHistory || [];

  return (
    <div
      className="et-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="et-modal et-track-modal">

        <div className="et-modal-header">
          <h2>
            Track Endorsement
          </h2>

          <button
            className="et-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="et-modal-body">

          <div className="track-summary">
            <div>
              <strong>
                Proposal ID:
              </strong>{" "}
              #{item.id}
            </div>

            <div>
              <strong>
                Applicant:
              </strong>{" "}
              {item.from}
            </div>

            <div>
              <strong>
                Current Status:
              </strong>{" "}
              {item.status}
            </div>

            <div>
              <strong>
                Assigned To:
              </strong>{" "}
              {item.assignedTo}
            </div>
          </div>

          <div className="track-timeline">

            {history.length === 0 ? (
              <div className="track-empty">
                No movement history found
              </div>
            ) : (
              history.map(
                (step, index) => (
                  <div
                    className="track-item"
                    key={index}
                  >
                    <div className="track-dot" />

                    <div className="track-content">
                      <div className="track-title">
                        {step.from}
                        {" → "}
                        {step.to}
                      </div>

                      <div className="track-date">
                        {step.date}
                      </div>

                      {step.remarks && (
                        <div className="track-remarks">
                          {step.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            )}

          </div>

        </div>
      </div>
    </div>
  );
}