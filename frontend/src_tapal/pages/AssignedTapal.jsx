import { useMemo, useState } from "react";
import DataTable from "../components/common/DataTable";
import TapalDetailModal from "../components/tapal/TapalDetailModal";
import TransferModal from "../components/tapal/TransferModal";

export default function AssignedTapal({ tapals, onTransfer, onComplete }) {
  const [detail, setDetail] = useState(null);
  const [transfer, setTransfer] = useState(null);

  const assigned = useMemo(
    () => tapals.filter((tapal) => tapal.status === "assigned"),
    [tapals]
  );

  const rowsWithIdx = assigned.map((tapal, index) => ({
    ...tapal,
    slNo: index + 1,
  }));

  const handleComplete = async (tapal) => {
    const ok = window.confirm(`Mark ${tapal.id} as completed?`);
    if (!ok) return;
    await onComplete(tapal.id);
  };

  const columns = [
    { key: "slNo", label: "Sl.No." },
    {
      key: "id",
      label: "Tapal ID",
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
    { key: "assignedAt", label: "Assigned On" },
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
    {
      key: "action",
      label: "Action",
      render: (tapal) => (
        <div className="btn-group">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setTransfer(tapal)}
          >
            Transfer
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleComplete(tapal)}
          >
            Complete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Assigned Tapals</h2>
          <p className="page-subtitle">
            Tapals currently assigned to staff members
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Assigned Records</h3>
            <p>{assigned.length} tapals are currently under processing</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rowsWithIdx}
          totalLabel={`${assigned.length} record${assigned.length !== 1 ? "s" : ""}`}
        />
      </div>

      {detail && (
        <TapalDetailModal tapal={detail} onClose={() => setDetail(null)} />
      )}

      {transfer && (
        <TransferModal
          tapal={transfer}
          onClose={() => setTransfer(null)}
          onTransfer={onTransfer}
        />
      )}
    </div>
  );
}