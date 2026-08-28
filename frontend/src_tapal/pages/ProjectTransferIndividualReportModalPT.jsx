// PATH: CSRC_OFFICE/frontend/src_tapal/pages/ProjectTransferIndividualReportModalPT.jsx

import React, { useRef } from "react";

const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-GB");
};

export default function ProjectTransferIndividualReportModalPT({
  item,
  onClose,
}) {
  const reportRef = useRef();

  const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .set({
        margin: 10,
        filename: `Project_Transfer_${item.id}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(reportRef.current)
      .save();
  };

  // Prefer reject_remarks when the transfer was rejected, otherwise fall
  // back to assign_remarks (what the tapal Assign step recorded).
  const remarksToShow = item.reject_remarks || item.assign_remarks || null;

  return (
    <div
      className="et-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="et-report-modal">
        <div className="et-modal-header">
          <h2>Project Transfer Report</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={handleDownload}>
              Download PDF
            </button>
            <button className="et-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="et-report-preview">
          <div ref={reportRef} className="pdf-page">
            <div className="pdf-header">
              <h1>CENTRE FOR SPONSORED RESEARCH & CONSULTANCY</h1>
              <h3>Anna University, Chennai</h3>
              <hr />
            </div>

            <h2 style={{ textAlign: "center" }}>PROJECT TRANSFER REPORT</h2>

            <table className="report-table">
              <tbody>
                <tr>
                  <td>Tapal ID</td>
                  <td>#{item.id}</td>
                </tr>
                <tr>
                  <td>File No</td>
                  <td>{item.file_no || "-"}</td>
                </tr>
                <tr>
                  <td>Project Title</td>
                  <td>{item.title}</td>
                </tr>
                <tr>
                  <td>Funding Agency</td>
                  <td>{item.funding_agency}</td>
                </tr>
                <tr>
                  <td>Sanctioned Cost</td>
                  <td>₹ {Number(item.cost || 0).toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>From (Current PI)</td>
                  <td>
                    {item.from_name} — {item.from_dept}
                  </td>
                </tr>
                <tr>
                  <td>To (Incoming PI)</td>
                  <td>
                    {item.to_name} — {item.to_dept}
                  </td>
                </tr>
                <tr>
                  <td>Submitted Date</td>
                  <td>{fmtDate(item.created_at)}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>{item.status}</td>
                </tr>
                <tr>
                  <td>Assigned To</td>
                  <td>{item.assigned_to || "-"}</td>
                </tr>
                <tr>
                  <td>Completed On</td>
                  <td>{fmtDate(item.completed_date)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 30 }}>
              <h3>Remarks</h3>
              <p>{remarksToShow || "No remarks available"}</p>
            </div>

            <div
              style={{
                marginTop: 60,
                display: "flex",
                justifyContent: "space-between",
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

            <div style={{ marginTop: 50, textAlign: "right", fontSize: 12 }}>
              Generated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
