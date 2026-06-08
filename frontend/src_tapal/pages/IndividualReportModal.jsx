import React, { useRef } from "react";

export default function IndividualReportModal({
  item,
  onClose,
}) {
  const reportRef = useRef();

  const handleDownload =
    async () => {
      const html2pdf = (
        await import(
          "html2pdf.js"
        )
      ).default;

      html2pdf()
        .set({
          margin: 10,
          filename: `Endorsement_${item.id}.pdf`,
          html2canvas: {
            scale: 2,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation:
              "portrait",
          },
        })
        .from(reportRef.current)
        .save();
    };

  return (
    <div
      className="et-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="et-report-modal">

        <div className="et-modal-header">
          <h2>
            Endorsement Report
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
                handleDownload
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

        <div
          className="et-report-preview"
        >
          <div
            ref={reportRef}
            className="pdf-page"
          >
            {/* HEADER */}

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
              ENDORSEMENT
              REPORT
            </h2>

            <table
              className="report-table"
            >
              <tbody>

                <tr>
                  <td>
                    Proposal ID
                  </td>
                  <td>
                    #{item.id}
                  </td>
                </tr>

                <tr>
                  <td>
                    File No
                  </td>
                  <td>
                    {item.fileNo}
                  </td>
                </tr>

                <tr>
                  <td>
                    Applicant
                  </td>
                  <td>
                    {item.from}
                  </td>
                </tr>

                <tr>
                  <td>
                    Category
                  </td>
                  <td>
                    {item.category}
                  </td>
                </tr>

                <tr>
                  <td>
                    Date
                  </td>
                  <td>
                    {item.date}
                  </td>
                </tr>

                <tr>
                  <td>
                    Status
                  </td>
                  <td>
                    {item.status}
                  </td>
                </tr>

                <tr>
                  <td>
                    Assigned To
                  </td>
                  <td>
                    {item.assignedTo ||
                      "-"}
                  </td>
                </tr>

                <tr>
                  <td>
                    Completed On
                  </td>
                  <td>
                    {item.completedDate ||
                      "-"}
                  </td>
                </tr>

              </tbody>
            </table>

            <div
              style={{
                marginTop: 30,
              }}
            >
              <h3>
                Remarks
              </h3>

              <p>
                {item.remarks ||
                  "No remarks available"}
              </p>
            </div>

            <div
              style={{
                marginTop: 60,
                display:
                  "flex",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                __________________
                <br />
                Assistant
              </div>

              <div>
                __________________
                <br />
                Superintendent
              </div>

              <div>
                __________________
                <br />
                Director
              </div>
            </div>

            <div
              style={{
                marginTop: 50,
                textAlign:
                  "right",
                fontSize: 12,
              }}
            >
              Generated:
              {" "}
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}