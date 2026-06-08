import React, {
  useMemo,
  useRef,
  useState,
} from "react";

export default function OverallReportModal({
  endorsements,
  onClose,
}) {
  const pdfRef = useRef();

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const filteredData =
    useMemo(() => {
      if (
        !fromDate &&
        !toDate
      )
        return endorsements;

      return endorsements.filter(
        (item) => {
          const d =
            new Date(
              item.date
                .split("-")
                .reverse()
                .join("-")
            );

          const from =
            fromDate
              ? new Date(
                  fromDate
                )
              : null;

          const to =
            toDate
              ? new Date(
                  toDate
                )
              : null;

          if (
            from &&
            d < from
          )
            return false;

          if (
            to &&
            d > to
          )
            return false;

          return true;
        }
      );
    }, [
      endorsements,
      fromDate,
      toDate,
    ]);

  const stats =
    useMemo(() => {
      return {
        total:
          filteredData.length,

        pending:
          filteredData.filter(
            (x) =>
              x.status ===
              "PENDING"
          ).length,

        assigned:
          filteredData.filter(
            (x) =>
              x.status ===
              "ASSIGNED"
          ).length,

        completed:
          filteredData.filter(
            (x) =>
              x.status ===
              "COMPLETED"
          ).length,
      };
    }, [filteredData]);

  const downloadPdf =
    async () => {
      const html2pdf = (
        await import(
          "html2pdf.js"
        )
      ).default;

      html2pdf()
        .set({
          margin: 8,

          filename:
            "Overall_Endorsement_Report.pdf",

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
        .from(pdfRef.current)
        .save();
    };

  return (
    <div
      className="et-overlay"
      onClick={(e) =>
        e.target ===
          e.currentTarget &&
        onClose()
      }
    >
      <div className="et-overall-report">

        <div className="et-modal-header">
          <h2>
            Overall Endorsement
            Report
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
              className="et-close-btn"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* FILTERS */}

        <div className="report-filters">

          <div>
            <label>
              From Date
            </label>

            <input
              type="date"
              value={
                fromDate
              }
              onChange={(
                e
              ) =>
                setFromDate(
                  e.target
                    .value
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
              onChange={(
                e
              ) =>
                setToDate(
                  e.target
                    .value
                )
              }
            />
          </div>

          <button
            className="btn btn-outline"
            onClick={() => {
              setFromDate(
                ""
              );
              setToDate("");
            }}
          >
            Clear
          </button>

        </div>

        {/* PREVIEW */}

        <div className="report-preview">

          <div
            ref={pdfRef}
            className="pdf-page-landscape"
          >
            <div className="pdf-header">
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

              <hr />
            </div>

            <h2
              style={{
                textAlign:
                  "center",
              }}
            >
              OVERALL
              ENDORSEMENT
              REPORT
            </h2>

            <div
              className="stats-grid"
            >
              <div className="stat-card">
                <h3>
                  {
                    stats.total
                  }
                </h3>
                <p>
                  Total
                </p>
              </div>

              <div className="stat-card">
                <h3>
                  {
                    stats.pending
                  }
                </h3>
                <p>
                  Pending
                </p>
              </div>

              <div className="stat-card">
                <h3>
                  {
                    stats.assigned
                  }
                </h3>
                <p>
                  Assigned
                </p>
              </div>

              <div className="stat-card">
                <h3>
                  {
                    stats.completed
                  }
                </h3>
                <p>
                  Completed
                </p>
              </div>
            </div>

            <table className="report-table">
              <thead>
                <tr>
                  <th>
                    Sl.No
                  </th>
                  <th>
                    Proposal ID
                  </th>
                  <th>
                    File No
                  </th>
                  <th>
                    Date
                  </th>
                  <th>
                    Applicant
                  </th>
                  <th>
                    Category
                  </th>
                  <th>
                    Assigned To
                  </th>
                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredData.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={
                        row.id
                      }
                    >
                      <td>
                        {index +
                          1}
                      </td>

                      <td>
                        {
                          row.id
                        }
                      </td>

                      <td>
                        {
                          row.fileNo
                        }
                      </td>

                      <td>
                        {
                          row.date
                        }
                      </td>

                      <td>
                        {
                          row.from
                        }
                      </td>

                      <td>
                        {
                          row.category
                        }
                      </td>

                      <td>
                        {row.assignedTo ||
                          "-"}
                      </td>

                      <td>
                        {
                          row.status
                        }
                      </td>
                    </tr>
                  )
                )}

              </tbody>
            </table>

            <div
              style={{
                marginTop: 30,
                textAlign:
                  "right",
                fontSize: 12,
              }}
            >
              Generated On:
              {" "}
              {new Date().toLocaleDateString()}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}