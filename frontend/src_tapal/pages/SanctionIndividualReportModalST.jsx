import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import "./SanctionIndividualReportModalST.css";

export default function SanctionIndividualReportModalST({
  item,
  onClose,
}) {
  const reportRef = useRef();

  const downloadPdf = () => {
    html2pdf()
      .set({
        margin: 10,
        filename: `Sanction_Report_${item.id}.pdf`,
        image: {
          type: "jpeg",
          quality: 1,
        },
        html2canvas: {
          scale: 2,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(reportRef.current)
      .save();
  };

  return (
    <div
      className="sirst-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="sirst-modal">

        <div className="sirst-header">

          <h2>
            Sanction Report
          </h2>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              className="btn btn-primary"
              onClick={downloadPdf}
            >
              Download PDF
            </button>

            <button
              className="sirst-close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

        </div>

        <div className="sirst-preview">

          <div
            ref={reportRef}
            className="sirst-report"
          >

            <div className="sirst-title">

              <h1>
                CENTRE FOR SPONSORED
                RESEARCH &
                CONSULTANCY
              </h1>

              <h3>
                Anna University,
                Chennai - 600025
              </h3>

              <h2>
                SANCTION
                PROCEEDINGS REPORT
              </h2>

            </div>

            <div className="sirst-section">

              <h3>
                Basic Information
              </h3>

              <table className="sirst-table">
                <tbody>

                  <tr>
                    <td>
                      Request ID
                    </td>
                    <td>
                      {item.id}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Project Title
                    </td>
                    <td>
                      {item.projectTitle}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      PI Name
                    </td>
                    <td>
                      {item.piName}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Funding Agency
                    </td>
                    <td>
                      {item.agency}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Proceeding No
                    </td>
                    <td>
                      {item.proceedingNo}
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

                </tbody>
              </table>

            </div>

            <div className="sirst-section">

              <h3>
                Financial Details
              </h3>

              <table className="sirst-table">
                <tbody>

                  <tr>
                    <td>
                      Total Amount
                    </td>
                    <td>
                      ₹
                      {item.totalAmount?.toLocaleString()}
                    </td>
                  </tr>

                </tbody>
              </table>

            </div>

            <div className="sirst-section">

              <h3>
                Installment Details
              </h3>

              <table className="sirst-table">

                <thead>
                  <tr>
                    <th>
                      Installment
                    </th>
                    <th>
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {item.installments?.map(
                    (
                      ins,
                      index
                    ) => (
                      <tr key={index}>
                        <td>
                          {ins.name}
                        </td>

                        <td>
                          ₹
                          {ins.amount?.toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="sirst-section">

              <h3>
                Assignment Details
              </h3>

              <table className="sirst-table">
                <tbody>

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
                      Assigned Date
                    </td>

                    <td>
                      {item.assignedDate ||
                        "-"}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Completed Date
                    </td>

                    <td>
                      {item.completedDate ||
                        "-"}
                    </td>
                  </tr>

                </tbody>
              </table>

            </div>

            <div
              style={{
                marginTop: 40,
              }}
            >
              <p>
                Generated on:
                {" "}
                {new Date().toLocaleString()}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}