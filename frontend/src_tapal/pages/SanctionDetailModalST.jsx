import React from "react";
import "./SanctionDetailModalST.css";

export default function SanctionDetailModalST({
  item,
  onClose,
}) {
  if (!item) return null;

  return (
    <div
      className="sdmst-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="sdmst-modal">

        <div className="sdmst-header">
          <div>
            <h2>
              Sanction Details
            </h2>

            <p>
              Request ID #{item.id}
            </p>
          </div>

          <button
            className="sdmst-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="sdmst-body">

          <div className="sdmst-banner">
            Read Only View
          </div>

          <div className="sdmst-summary">
            <div className="sdmst-summary-title">
              {item.projectTitle}
            </div>

            <div className="sdmst-summary-sub">
              {item.piName}
            </div>
          </div>

          <div className="sdmst-grid">

            <div className="sdmst-item">
              <label>
                Request Type
              </label>
              <span>
                SANCTION
              </span>
            </div>

            <div className="sdmst-item">
              <label>
                Date
              </label>
              <span>
                {item.submittedDate}
              </span>
            </div>

            <div className="sdmst-item">
              <label>
                Status
              </label>
              <span>
                {item.status}
              </span>
            </div>

            <div className="sdmst-item">
              <label>
                PI Name
              </label>
              <span>
                {item.piName}
              </span>
            </div>

            <div className="sdmst-item">
              <label>
                Agency
              </label>
              <span>
                {item.agency}
              </span>
            </div>

            <div className="sdmst-item">
              <label>
                Assigned To
              </label>
              <span>
                {item.assignedTo ||
                  "-"}
              </span>
            </div>

            <div className="sdmst-item">
              <label>
                Proceeding No
              </label>
              <span>
                {item.proceedingNo}
              </span>
            </div>

            <div className="sdmst-item">
              <label>
                Total Amount
              </label>
              <span>
                ₹
                {item.totalAmount?.toLocaleString()}
              </span>
            </div>

          </div>

          <div className="sdmst-section">

            <h3>
              Installment Details
            </h3>

            <div className="sdmst-grid">

              {item.installments?.map(
                (
                  installment,
                  index
                ) => (
                  <div
                    key={index}
                    className="sdmst-item"
                  >
                    <label>
                      {
                        installment.name
                      }
                    </label>

                    <span>
                      ₹
                      {installment.amount?.toLocaleString()}
                    </span>
                  </div>
                )
              )}

            </div>

          </div>

          <div className="sdmst-footer">

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