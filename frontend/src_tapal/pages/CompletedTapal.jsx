import { useMemo, useState } from "react";
import DataTable from "../components/common/DataTable";
import TapalDetailModal from "../components/tapal/TapalDetailModal";
import TapalReport from "../components/tapal/TapalReport";
import OverallTapalReport from "../components/tapal/OverallTapalReport";

export default function CompletedTapal({ tapals }) {
  const [detail, setDetail] = useState(null);
  const [report, setReport] = useState(null);
  const [overallReport, setOverallReport] = useState(false);

  const completed = useMemo(
    () => tapals.filter((tapal) => tapal.status === "completed"),
    [tapals]
  );

  const rowsWithIdx = completed.map((tapal, index) => ({
    ...tapal,
    slNo: index + 1,
  }));

  const columns = [
    { key: "slNo", label: "Sl.No." },
    {
      key: "id",
      label: "Tapal No.",
      render: (tapal) => (
        <button className="tapal-id-link" onClick={() => setDetail(tapal)}>
          {tapal.id}
        </button>
      ),
    },
    { key: "mhFileNo", label: "M.H.No / File No." },
    { key: "tapalDate", label: "Date" },
    {
      key: "hardCopyReceivedDate",
      label: "Hard Copy Received Date",
      render: (tapal) => tapal.hardCopyReceivedDate || "—",
    },
    { key: "ctdtCategory", label: "Category" },
    { key: "documentType", label: "Tapal Type" },
    { key: "tapalFrom", label: "Tapal From" },
    { key: "assignedTo", label: "Assigned To" },
    {
      key: "bill",
      label: "View Bill",
      render: (tapal) => (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => window.open(tapal.billUrl || "/dummy-bill.pdf", "_blank")}
        >
          View Bill
        </button>
      ),
    },
    { key: "despatchDate", label: "Despatch Date" },
    {
      key: "action",
      label: "Action",
      render: (tapal) => (
        <div className="btn-group">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setDetail(tapal)}
          >
            View
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setReport(tapal)}
          >
            Report
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-header-row completed-header">
        <div>
          <h2 className="page-title">Completed Tapals</h2>
          <p className="page-subtitle">
            Despatched tapals with preview and report options
          </p>
        </div>

        <button
          className="btn btn-primary overall-report-btn"
          onClick={() => setOverallReport(true)}
        >
          Overall Report
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Completed Records</h3>
            <p>{completed.length} tapals have been completed</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rowsWithIdx}
          totalLabel={`${completed.length} record${
            completed.length !== 1 ? "s" : ""
          }`}
        />
      </div>

      {detail && (
        <TapalDetailModal tapal={detail} onClose={() => setDetail(null)} />
      )}

      {report && (
        <TapalReport tapal={report} onClose={() => setReport(null)} />
      )}

      {overallReport && (
        <OverallTapalReport
          tapals={completed}
          onClose={() => setOverallReport(false)}
        />
      )}
    </div>
  );
}