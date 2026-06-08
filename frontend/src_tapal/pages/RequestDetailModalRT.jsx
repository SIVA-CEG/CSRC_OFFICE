import React from "react";
import "./RequestDetailModalRT.css";

export default function RequestDetailModalRT({
  item,
  onClose,
}) {
  if (!item) return null;

  const isReappropriation =
    item.requestType === "REAPPROPRIATION";

  return (
    <div
      className="rdmrt-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="rdmrt-modal">

        <div className="rdmrt-header">
          <div>
            <h2>
              Request Details
            </h2>

            <p>
              Request ID #{item.id}
            </p>
          </div>

          <button
            className="rdmrt-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="rdmrt-body">

          <div className="rdmrt-banner">
            Read Only View
          </div>

          <div className="rdmrt-summary">

            <div className="rdmrt-summary-title">
              {item.projectTitle}
            </div>

            <div className="rdmrt-summary-sub">
              {item.piName}
            </div>

          </div>

          <div className="rdmrt-grid">

            <div className="rdmrt-item">
              <label>
                Request Type
              </label>
              <span>
                {item.requestType}
              </span>
            </div>

            <div className="rdmrt-item">
              <label>
                Date
              </label>
              <span>
                {item.date}
              </span>
            </div>

            <div className="rdmrt-item">
              <label>
                Status
              </label>
              <span>
                {item.status}
              </span>
            </div>

            <div className="rdmrt-item">
              <label>
                PI Name
              </label>
              <span>
                {item.piName}
              </span>
            </div>

            <div className="rdmrt-item">
              <label>
                Agency
              </label>
              <span>
                {item.agency}
              </span>
            </div>

            {item.assignedTo && (
              <div className="rdmrt-item">
                <label>
                  Assigned To
                </label>
                <span>
                  {item.assignedTo}
                </span>
              </div>
            )}

          </div>

          {/* REAPPROPRIATION */}

          {isReappropriation && (
            <>
              <div className="rdmrt-section">

                <h3>
                  Reappropriation Details
                </h3>

                <div className="rdmrt-grid">

                  <div className="rdmrt-item">
                    <label>
                      Installment
                    </label>
                    <span>
                      {item.installment}
                    </span>
                  </div>

                  <div className="rdmrt-item">
                    <label>
                      Head Type
                    </label>
                    <span>
                      {item.headType}
                    </span>
                  </div>

                  <div className="rdmrt-item">
                    <label>
                      From Head
                    </label>
                    <span>
                      {item.fromHead}
                    </span>
                  </div>

                  <div className="rdmrt-item">
                    <label>
                      To Head
                    </label>
                    <span>
                      {item.toHead}
                    </span>
                  </div>

                  <div className="rdmrt-item">
                    <label>
                      Amount
                    </label>
                    <span>
                      ₹ {item.amount}
                    </span>
                  </div>

                </div>

              </div>
            </>
          )}

          {/* EXTENSION */}

          {!isReappropriation && (
            <>
              <div className="rdmrt-section">

                <h3>
                  Extension Details
                </h3>

                <div className="rdmrt-grid">

                  <div className="rdmrt-item">
                    <label>
                      Original End Date
                    </label>
                    <span>
                      {item.originalEndDate}
                    </span>
                  </div>

                  <div className="rdmrt-item">
                    <label>
                      Revised End Date
                    </label>
                    <span>
                      {item.revisedEndDate}
                    </span>
                  </div>

                  <div className="rdmrt-item">
                    <label>
                      Extension Period
                    </label>
                    <span>
                      {item.extensionPeriod}
                    </span>
                  </div>

                </div>

                <div className="rdmrt-item-full">
                  <label>
                    Reason
                  </label>

                  <div>
                    {item.reason ||
                      "No reason provided"}
                  </div>
                </div>

              </div>
            </>
          )}

          <div className="rdmrt-footer">

            <button
              className="btn btn-outline"
              onClick={onClose}
            >
              Close
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}