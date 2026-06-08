import { useMemo, useState } from "react";
import html2pdf from "html2pdf.js";

const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  const [dd, mm, yyyy] = dateStr.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

const toDisplayDate = (inputDate) => {
  if (!inputDate) return "";
  const [yyyy, mm, dd] = inputDate.split("-");
  return `${dd}-${mm}-${yyyy}`;
};

const inDateRange = (tapalDate, fromDate, toDate) => {
  const date = toInputDate(tapalDate);
  if (fromDate && date < fromDate) return false;
  if (toDate && date > toDate) return false;
  return true;
};

export default function OverallTapalReport({ tapals, onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [showPreview, setShowPreview] = useState(false);

  const filteredTapals = useMemo(() => {
    return tapals.filter((tapal) =>
      inDateRange(tapal.tapalDate, fromDate, toDate)
    );
  }, [tapals, fromDate, toDate]);

  const downloadPDF = () => {
    setShowPreview(true);

    setTimeout(() => {
      const element = document.getElementById("overall-report-pdf");

      const options = {
        margin: 0,
        filename: `Overall_Tapal_Report_${toDisplayDate(fromDate)}_to_${toDisplayDate(toDate)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      html2pdf().set(options).from(element).save();
    }, 200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal overall-report-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header no-print">
          <div>
            <h2>Overall Tapal Report</h2>
            <p>Select date range, preview and download landscape PDF</p>
          </div>

          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="overall-report-controls no-print">
            <div className="form-field">
              <label>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <button
              className="btn btn-outline"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>

            <button className="btn btn-primary" onClick={downloadPDF}>
              Download PDF
            </button>
          </div>

          {showPreview && (
            <div className="overall-preview-wrapper">
              <div id="overall-report-pdf" className="overall-pdf-page">
                <h2 className="overall-main-title">
                  CENTRE FOR SPONSORED RESEARCH AND CONSULTANCY
                </h2>

                <h3 className="overall-title">
                  List of tapals received From {toDisplayDate(fromDate)} To{" "}
                  {toDisplayDate(toDate)}
                </h3>

                <table className="overall-report-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Date</th>
                      <th>Hard Copy Received Date</th>
                      <th>M.H.No / File No.</th>
                      <th>Document Type</th>
                      <th>Subject</th>
                      <th>Amount</th>
                      <th>Reference</th>
                      <th>From</th>
                      <th>Assigned</th>
                      <th className="signature-col">Signature</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTapals.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="overall-empty">
                          No tapals found for selected date range
                        </td>
                      </tr>
                    ) : (
                      filteredTapals.map((tapal, index) => (
                        <tr key={tapal.id}>
                          <td>{index + 1}</td>
                          <td>{tapal.tapalDate || "—"}</td>
                          <td>{tapal.hardCopyReceivedDate || "—"}</td>
                          <td>{tapal.mhFileNo || "—"}</td>
                          <td>{tapal.documentType || "—"}</td>
                          <td>{tapal.subject || "—"}</td>
                          <td>
                            {tapal.amount
                              ? `${Number(tapal.amount).toLocaleString(
                                  "en-IN"
                                )}/-`
                              : "—"}
                          </td>
                          <td>{tapal.referenceNo || "NIL"}</td>
                          <td>{tapal.tapalFrom || "—"}</td>
                          <td>{tapal.assignedTo || "—"}</td>
                          <td className="signature-col"></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}