import html2pdf from "html2pdf.js";
import annaLogo from "../../assets/anna_univ_logo.png";
import csrcLogo from "../../assets/csrc_logo.png";

export default function TapalReport({ tapal, onClose }) {
  if (!tapal) return null;

  const downloadPDF = () => {
    const element = document.getElementById("printable-report");

    const options = {
      margin: 8,
      filename: `${tapal.id}_Tapal_Report.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(options).from(element).save();
  };

  const fields = [
  ["Tapal ID", tapal.id],
  ["Acceptance ID", tapal.acceptanceId || "—"],
  ["M.H./File No.", tapal.mhFileNo || "—"],
  ["Tapal Date", tapal.tapalDate || "—"],
  ["Hard Copy Received Date", tapal.hardCopyReceivedDate || "—"],
  ["Reference No.", tapal.referenceNo || "—"],
  ["Reference Date", tapal.referenceDate || "—"],
  ["CTDT Category", tapal.ctdtCategory || "—"],
  ["Document Type", tapal.documentType || "—"],
  ["Tapal From", tapal.tapalFrom || "—"],
  ["Department", tapal.department || "—"],
  ["Campus", tapal.campus || "—"],
  ["Amount", tapal.amount ? `₹${Number(tapal.amount).toLocaleString("en-IN")}` : "—"],
  ["Tapal Mode", tapal.tapalMode || "—"],
  ["Despatch Date", tapal.despatchDate || "—"],
];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <div>
            <h2>PDF Report Preview</h2>
            <p>{tapal.id}</p>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary btn-sm" onClick={downloadPDF}>
              Download PDF
            </button>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body pdf-preview-area">
          <div id="printable-report" className="pdf-page">
            <div className="report-letterhead">
              <img src={annaLogo} alt="Anna University" />
              <div className="report-title">
                <h2>Centre for Sponsored Research and Consultancy</h2>
                <p>Anna University, Chennai — 600 025</p>
                <h3>Tapal Completion Report</h3>
              </div>
              <img src={csrcLogo} alt="CSRC" />
            </div>

            <div className="report-section-title">Tapal Information</div>

            <div className="report-detail-grid">
              {fields.map(([label, value]) => (
                <div className="report-detail-item" key={label}>
                  <span className="lbl">{label}</span>
                  <span className="val">{value}</span>
                </div>
              ))}
            </div>

            <div className="report-section-title">Subject</div>
            <p className="report-subject">{tapal.subject || "—"}</p>

            <div className="report-section-title">Assignment Details</div>

            <div className="report-detail-grid">
              <div className="report-detail-item">
                <span className="lbl">Assigned To</span>
                <span className="val">{tapal.assignedTo || "—"}</span>
              </div>

              <div className="report-detail-item">
                <span className="lbl">Assigned On</span>
                <span className="val">{tapal.assignedAt || "—"}</span>
              </div>

              <div className="report-detail-item full">
                <span className="lbl">Remarks</span>
                <span className="val">{tapal.remarks || "—"}</span>
              </div>
            </div>

            <div className="report-sign-box">
              <div className="sign-col">
                <div className="sign-line" />
                <div className="sign-name">{tapal.assignedTo || "Staff"}</div>
                <div className="sign-label">Signature of Assigned Staff</div>
              </div>

              <div className="sign-col">
                <div className="sign-line" />
                <div className="sign-name">Director, CSRC</div>
                <div className="sign-label">Authorised Signature</div>
              </div>
            </div>

            <p className="report-generated">
              Generated on {new Date().toLocaleDateString("en-GB")} — CSRC Tapal Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}