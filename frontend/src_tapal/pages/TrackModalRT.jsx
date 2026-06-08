import React from "react";
import "./TrackModalRT.css";

export default function TrackModalRT({
  item,
  onClose,
}) {
  const history =
    item?.transferHistory || [];

  return (
    <div
      className="trt-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="trt-modal">

        <div className="trt-header">

          <div>
            <h2>
              Request Tracking
            </h2>

            <p>
              Request #{item.id}
            </p>
          </div>

          <button
            className="trt-close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className="trt-body">

          <div className="trt-summary">

            <div>
              <strong>
                Project
              </strong>
              <br />
              {item.projectTitle}
            </div>

            <div>
              <strong>
                PI Name
              </strong>
              <br />
              {item.piName}
            </div>

            <div>
              <strong>
                Status
              </strong>
              <br />
              {item.status}
            </div>

          </div>

          <div className="trt-timeline">

            <div className="trt-node completed">
              <div className="trt-dot"></div>

              <div className="trt-card">
                <h4>
                  Request Submitted
                </h4>

                <p>
                  Faculty submitted
                  request
                </p>

                <span>
                  {item.date}
                </span>
              </div>
            </div>

            {history.map(
              (
                step,
                index
              ) => (
                <div
                  key={index}
                  className="trt-node completed"
                >
                  <div className="trt-dot"></div>

                  <div className="trt-card">
                    <h4>
                      Assigned
                    </h4>

                    <p>
                      {step.from}
                      {" → "}
                      {step.to}
                    </p>

                    <span>
                      {step.date}
                    </span>

                    {step.remarks && (
                      <div className="trt-remarks">
                        {
                          step.remarks
                        }
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {item.status ===
              "COMPLETED" && (
              <div className="trt-node completed">

                <div className="trt-dot"></div>

                <div className="trt-card">

                  <h4>
                    Request
                    Completed
                  </h4>

                  <p>
                    Processing
                    Finished
                  </p>

                  <span>
                    {
                      item.completedDate
                    }
                  </span>

                </div>

              </div>
            )}

          </div>

          <div className="trt-footer">

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