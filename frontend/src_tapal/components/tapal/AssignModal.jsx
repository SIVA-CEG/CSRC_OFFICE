import { useState } from "react";
import SearchableDropdown from "../common/SearchableDropdown";
import { staff } from "../../data/dummyData";

export default function AssignModal({ tapal, onClose, onAssign }) {
  const [assignedTo, setAssignedTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  if (!tapal) return null;

  const handleSubmit = () => {
    if (!assignedTo) {
      setError("Please select a staff member.");
      return;
    }

    onAssign(tapal.id, assignedTo, remarks);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal assign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Assign Tapal</h2>
            <p>Select the staff member responsible for this tapal.</p>
          </div>

          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="tapal-summary-card">
            <div>
              <span>Tapal ID</span>
              <strong>{tapal.id}</strong>
            </div>
            <p>{tapal.subject}</p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-field">
            <label>
              Assigned to <span className="req">*</span>
            </label>

            <SearchableDropdown
              options={staff.map((person) => person.name)}
              value={assignedTo}
              onChange={(value) => {
                setAssignedTo(value);
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
              placeholder="Enter optional remarks..."
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>

          <button className="btn btn-primary" onClick={handleSubmit}>
            Assign Tapal
          </button>
        </div>
      </div>
    </div>
  );
}