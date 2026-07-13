// PATH: CSRC_OFFICE/frontend/src_tapal/pages/ProjectTransferOverallReportModalPT.jsx

import React, { useMemo, useRef, useState } from "react";
import "./ProjectTransferOverallReportModalPT.css";

export default function ProjectTransferOverallReportModalPT({ requests = [], onClose }) {
  const reportRef = useRef();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      if (!fromDate && !toDate) return true;
      const reqDate = req.submittedDate?.split("-")?.reverse()?.join("-");
      if (fromDate && reqDate < fromDate) return false;
      if (toDate && reqDate > toDate) return false;
      return true;
    });
  }, [requests, fromDate, toDate]);

  const stats = useMemo(() => ({
    total: filtered.length,
    pending: filtered.filter((r) => r.status === "PENDING").length,
    assigned: filtered.filter((r) => r.status === "ASSIGNED").length,
    completed: filtered.filter((r) => r.status === "COMPLETED").length,
  }), [filtered]);

  const downloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .set({
        margin: 8,
        filename: "Project_Transfer_Overall_Report.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .from(reportRef.current)
      .save();
  };

  return (
    <div className="ptort-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ptort-modal">
        <div className="ptort-header">
          <h2>Overall Project Transfer Report</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={downloadPdf}>Download PDF</button>
            <button className="ptort-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="ptort-filters">
          <div>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label>To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        <div className="ptort-preview">
          <div ref={reportRef} className="ptort-page">
            <div className="ptort-title">
              <h1>CENTRE FOR SPONSORED RESEARCH & CONSULTANCY</h1>
              <h3>Anna University, Chennai</h3>
              <h2>OVERALL PROJECT TRANSFER REPORT</h2>
            </div>

            <div className="ptort-stats">
              <div className="ptort-stat"><h3>{stats.total}</h3><p>Total</p></div>
              <div className="ptort-stat"><h3>{stats.pending}</h3><p>Pending</p></div>
              <div className="ptort-stat"><h3>{stats.assigned}</h3><p>Assigned</p></div>
              <div className="ptort-stat"><h3>{stats.completed}</h3><p>Completed</p></div>
            </div>

            <table className="ptort-table">
              <thead>
                <tr>
                  <th>Sl.No.</th>
                  <th>ID</th>
                  <th>File No</th>
                  <th>Project Title</th>
                  <th>From PI</th>
                  <th>To PI</th>
                  <th>Agency</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.id}</td>
                    <td>{row.fileNo}</td>
                    <td>{row.projectTitle}</td>
                    <td>{row.fromFacultyName}</td>
                    <td>{row.toFacultyName}</td>
                    <td>{row.agency}</td>
                    <td>{row.submittedDate}</td>
                    <td>{row.status}</td>
                    <td>{row.assignedTo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}