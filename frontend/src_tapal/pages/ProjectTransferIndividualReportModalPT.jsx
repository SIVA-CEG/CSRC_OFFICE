// PATH: CSRC_OFFICE/frontend/src_tapal/pages/ProjectTransferIndividualReportModalPT.jsx

import React, { useRef } from "react";

export default function ProjectTransferIndividualReportModalPT({ item, onClose }) {
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

  return (
    <div className="et-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="et-report-modal">
        <div className="et-modal-header">
          <h2>Project Transfer Report</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={handleDownload}>Download PDF</button>
            <button className="et-close-btn" onClick={onClose}>✕</button>
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
                <tr><td>Tapal ID</td><td>#{item.id}</td></tr>
                <tr><td>File No</td><td>{item.fileNo}</td></tr>
                <tr><td>Project Title</td><td>{item.projectTitle}</td></tr>
                <tr><td>Funding Agency</td><td>{item.agency}</td></tr>
                <tr><td>Sanctioned Cost</td><td>₹ {Number(item.totalAmount || 0).toLocaleString("en-IN")}</td></tr>
                <tr><td>From (Current PI)</td><td>{item.fromFacultyName} — {item.fromFacultyDept}</td></tr>
                <tr><td>To (Incoming PI)</td><td>{item.toFacultyName} — {item.toFacultyDept}</td></tr>
                <tr><td>Submitted Date</td><td>{item.submittedDate}</td></tr>
                <tr><td>Status</td><td>{item.status}</td></tr>
                <tr><td>Assigned To</td><td>{item.assignedTo || "-"}</td></tr>
                <tr><td>Completed On</td><td>{item.completedDate || "-"}</td></tr>
              </tbody>
            </table>

            <div style={{ marginTop: 30 }}>
              <h3>Remarks</h3>
              <p>{item.remarks || "No remarks available"}</p>
            </div>

            <div style={{ marginTop: 60, display: "flex", justifyContent: "space-between" }}>
              <div>__________________<br />Assistant</div>
              <div>__________________<br />Superintendent</div>
              <div>__________________<br />Director</div>
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