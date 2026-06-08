import { useState } from "react";
import SearchableDropdown from "../common/SearchableDropdown";
import { staff } from "../../data/dummyData";

export default function TransferModal({ tapal, onClose, onTransfer }) {
  const [transferTo, setTransferTo] = useState(tapal?.assignedTo || "");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  if (!tapal) return null;

  const handleSubmit = () => {
    if (!transferTo) {
      setError("Please select a staff member.");
      return;
    }

    onTransfer(tapal.id, transferTo, remarks);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal assign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Transfer Assignment</h2>
            <p>Update the staff member handling this tapal.</p>
          </div>

          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="tapal-summary-card blue">
            <div>
              <span>Tapal ID</span>
              <strong>{tapal.id}</strong>
            </div>
            <p>
              Currently assigned to: <b>{tapal.assignedTo || "—"}</b>
            </p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-field">
            <label>
              Transfer to <span className="req">*</span>
            </label>

            <SearchableDropdown
              options={staff.map((person) => person.name)}
              value={transferTo}
              onChange={(value) => {
                setTransferTo(value);
                setError("");
              }}
            />
          </div>

          <div className="form-field">
            <label>Remarks</label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Reason for transfer..."
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Update Assignment
          </button>
        </div>
      </div>
    </div>
  );
}