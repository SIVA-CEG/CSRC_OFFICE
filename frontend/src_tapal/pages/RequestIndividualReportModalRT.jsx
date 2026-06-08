import React, { useRef } from "react";
import "./RequestIndividualReportModalRT.css";

export default function RequestIndividualReportModalRT({
  item,
  onClose,
}) {
  const reportRef = useRef();

  const downloadPdf = async () => {
    const html2pdf = (
      await import("html2pdf.js")
    ).default;

    html2pdf()
      .set({
        margin: 10,

        filename: `Request_${item.id}.pdf`,

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

  const isReappropriation =
    item.requestType ===
    "REAPPROPRIATION";

  return (
    <div
      className="rir-overlay"
      onClick={(e) =>
        e.target ===
          e.currentTarget &&
        onClose()
      }
    >
      <div className="rir-modal">

        <div className="rir-header">

          <h2>
            Individual Request Report
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
              className="rir-close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

        </div>

        <div className="rir-preview">

          <div
            ref={reportRef}
            className="rir-page"
          >

            <div className="rir-pdf-header">
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
              REQUEST REPORT
            </h2>

            <table className="rir-table">
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
                    Request Type
                  </td>
                  <td>
                    {
                      item.requestType
                    }
                  </td>
                </tr>

                <tr>
                  <td>
                    Project Title
                  </td>
                  <td>
                    {
                      item.projectTitle
                    }
                  </td>
                </tr>

                <tr>
                  <td>
                    PI Name
                  </td>
                  <td>
                    {
                      item.piName
                    }
                  </td>
                </tr>

                <tr>
                  <td>
                    Agency
                  </td>
                  <td>
                    {
                      item.agency
                    }
                  </td>
                </tr>

                <tr>
                  <td>
                    Status
                  </td>
                  <td>
                    {
                      item.status
                    }
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
                    Completed Date
                  </td>
                  <td>
                    {item.completedDate ||
                      "-"}
                  </td>
                </tr>

              </tbody>
            </table>

            {isReappropriation ? (
              <>
                <h3>
                  Reappropriation
                  Details
                </h3>

                <table className="rir-table">
                  <tbody>

                    <tr>
                      <td>
                        Installment
                      </td>
                      <td>
                        {
                          item.installment
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Head Type
                      </td>
                      <td>
                        {
                          item.headType
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        From Head
                      </td>
                      <td>
                        {
                          item.fromHead
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        To Head
                      </td>
                      <td>
                        {
                          item.toHead
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Amount
                      </td>
                      <td>
                        ₹
                        {
                          item.amount
                        }
                      </td>
                    </tr>

                  </tbody>
                </table>
              </>
            ) : (
              <>
                <h3>
                  Extension
                  Details
                </h3>

                <table className="rir-table">
                  <tbody>

                    <tr>
                      <td>
                        Original End
                        Date
                      </td>

                      <td>
                        {
                          item.originalEndDate
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Revised End
                        Date
                      </td>

                      <td>
                        {
                          item.revisedEndDate
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Extension
                        Period
                      </td>

                      <td>
                        {
                          item.extensionPeriod
                        }
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Reason
                      </td>

                      <td>
                        {
                          item.reason
                        }
                      </td>
                    </tr>

                  </tbody>
                </table>
              </>
            )}

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

          </div>

        </div>

      </div>
    </div>
  );
}