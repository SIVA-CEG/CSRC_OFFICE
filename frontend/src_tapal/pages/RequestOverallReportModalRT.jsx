import React, { useMemo, useRef, useState } from "react";
import "./RequestOverallReportModalRT.css";

export default function RequestOverallReportModalRT({
  requests = [],
  onClose,
}) {
  const reportRef = useRef();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (!fromDate && !toDate) return true;

      const reqDate = req.date
        ?.split("-")
        ?.reverse()
        ?.join("-");

      if (fromDate && reqDate < fromDate)
        return false;

      if (toDate && reqDate > toDate)
        return false;

      return true;
    });
  }, [requests, fromDate, toDate]);

  const stats = useMemo(() => {
    return {
      total: filteredRequests.length,

      pending:
        filteredRequests.filter(
          (r) =>
            r.status === "PENDING"
        ).length,

      assigned:
        filteredRequests.filter(
          (r) =>
            r.status === "ASSIGNED"
        ).length,

      completed:
        filteredRequests.filter(
          (r) =>
            r.status === "COMPLETED"
        ).length,
    };
  }, [filteredRequests]);

  const downloadPdf = async () => {
    const html2pdf = (
      await import("html2pdf.js")
    ).default;

    html2pdf()
      .set({
        margin: 8,

        filename:
          "Request_Overall_Report.pdf",

        html2canvas: {
          scale: 2,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation:
            "landscape",
        },
      })
      .from(reportRef.current)
      .save();
  };

  return (
    <div
      className="rort-overlay"
      onClick={(e) =>
        e.target ===
          e.currentTarget &&
        onClose()
      }
    >
      <div className="rort-modal">

        <div className="rort-header">

          <h2>
            Overall Request Report
          </h2>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              className="btn btn-primary"
              onClick={
                downloadPdf
              }
            >
              Download PDF
            </button>

            <button
              className="rort-close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

        </div>

        <div className="rort-filters">

          <div>
            <label>
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
            />
          </div>

          <div>
            <label>
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
            />
          </div>

        </div>

        <div className="rort-preview">

          <div
            ref={reportRef}
            className="rort-page"
          >

            <div className="rort-title">

              <h1>
                CENTRE FOR
                SPONSORED
                RESEARCH &
                CONSULTANCY
              </h1>

              <h3>
                Anna University,
                Chennai
              </h3>

              <h2>
                OVERALL REQUEST
                REPORT
              </h2>

            </div>

            <div className="rort-stats">

              <div className="rort-stat">
                <h3>
                  {stats.total}
                </h3>
                <p>Total</p>
              </div>

              <div className="rort-stat">
                <h3>
                  {stats.pending}
                </h3>
                <p>Pending</p>
              </div>

              <div className="rort-stat">
                <h3>
                  {stats.assigned}
                </h3>
                <p>Assigned</p>
              </div>

              <div className="rort-stat">
                <h3>
                  {stats.completed}
                </h3>
                <p>Completed</p>
              </div>

            </div>

            <table className="rort-table">

              <thead>
                <tr>
                  <th>Sl.No.</th>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Project Title</th>
                  <th>PI Name</th>
                  <th>Agency</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                </tr>
              </thead>

              <tbody>

                {filteredRequests.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={row.id}
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {row.id}
                      </td>

                      <td>
                        {
                          row.requestType
                        }
                      </td>

                      <td>
                        {
                          row.projectTitle
                        }
                      </td>

                      <td>
                        {
                          row.piName
                        }
                      </td>

                      <td>
                        {
                          row.agency
                        }
                      </td>

                      <td>
                        {row.date}
                      </td>

                      <td>
                        {
                          row.status
                        }
                      </td>

                      <td>
                        {row.assignedTo ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </div>
  );
}