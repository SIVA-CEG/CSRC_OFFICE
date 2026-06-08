import StatusBadge from "../common/StatusBadge";

export default function TapalDetailModal({ tapal, onClose }) {
  if (!tapal) return null;

  const formatAmount = (amount) => {
    if (!amount) return "—";
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const fields = [
    { label: "Tapal ID", value: tapal.id },
    { label: "Acceptance ID", value: tapal.acceptanceId || "—" },
    { label: "M.H./File No.", value: tapal.mhFileNo || "—" },
    { label: "Tapal Date", value: tapal.tapalDate || "—" },
    {
  label: "Hard Copy Received Date",
  value: tapal.hardCopyReceivedDate || "—",
},
    { label: "Reference No.", value: tapal.referenceNo || "—" },
    { label: "Reference Date", value: tapal.referenceDate || "—" },
    { label: "CTDT Category", value: tapal.ctdtCategory || "—" },
    { label: "Document Type", value: tapal.documentType || "—" },
    { label: "Tapal From", value: tapal.tapalFrom || "—" },
    { label: "Department", value: tapal.department || "—" },
    { label: "Campus", value: tapal.campus || "—" },
    { label: "Amount", value: formatAmount(tapal.amount) },
    { label: "Tapal Mode", value: tapal.tapalMode || "—" },
    { label: "Status", value: <StatusBadge status={tapal.status} /> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Tapal Details</h2>
            <p>Complete information for {tapal.id}</p>
          </div>

          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            {fields.map((field) => (
              <div className="detail-item" key={field.label}>
                <label>{field.label}</label>
                <span>{field.value}</span>
              </div>
            ))}
          </div>

          <div className="detail-subject">
            <label>Subject</label>
            <p>{tapal.subject || "—"}</p>
          </div>

          {tapal.assignedTo && (
            <div className="assigned-info-card">
              <div>
                <label>Assigned To</label>
                <strong>{tapal.assignedTo}</strong>
                <span>on {tapal.assignedAt || "—"}</span>
              </div>

              {tapal.remarks && <p>Remarks: {tapal.remarks}</p>}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}