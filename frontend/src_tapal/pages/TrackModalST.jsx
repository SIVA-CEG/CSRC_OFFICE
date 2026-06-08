import React from "react";

export default function TrackModalST({
  item,
  onClose,
}) {
  const history =
    item.transferHistory || [];

  return (
    <div className="modal-overlay">
      <div
        className="modal-card"
        style={{
          width: "850px",
          maxWidth: "95vw",
        }}
      >
        <div className="modal-header">
          <h3>
            Sanction Request Tracking
          </h3>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">

          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 12,
              background:
                "#f8fafc",
            }}
          >
            <h4>
              Request Information
            </h4>

            <p>
              <strong>
                Request ID:
              </strong>{" "}
              {item.id}
            </p>

            <p>
              <strong>
                Project:
              </strong>{" "}
              {
                item.projectTitle
              }
            </p>

            <p>
              <strong>
                PI Name:
              </strong>{" "}
              {item.piName}
            </p>

            <p>
              <strong>
                Agency:
              </strong>{" "}
              {item.agency}
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}
              {item.status}
            </p>
          </div>

          <h4
            style={{
              marginBottom: 15,
            }}
          >
            Movement History
          </h4>

          {history.length ===
          0 ? (
            <div
              style={{
                padding: 20,
                textAlign:
                  "center",
                background:
                  "#f8fafc",
                borderRadius: 12,
              }}
            >
              No tracking history
              available
            </div>
          ) : (
            history.map(
              (
                step,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    display:
                      "flex",
                    gap: 15,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius:
                        "50%",
                      background:
                        "#0f766e",
                      color:
                        "#fff",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      border:
                        "1px solid #e5e7eb",
                      borderRadius:
                        12,
                      padding: 15,
                    }}
                  >
                    <div>
                      <strong>
                        From:
                      </strong>{" "}
                      {
                        step.from
                      }
                    </div>

                    <div>
                      <strong>
                        To:
                      </strong>{" "}
                      {
                        step.to
                      }
                    </div>

                    <div>
                      <strong>
                        Date:
                      </strong>{" "}
                      {
                        step.date
                      }
                    </div>

                    <div>
                      <strong>
                        Remarks:
                      </strong>{" "}
                      {
                        step.remarks
                      }
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        <div
          className="modal-footer"
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <button
            className="btn btn-outline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}