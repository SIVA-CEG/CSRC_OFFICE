// PATH: CSRC_OFFICE/frontend/src_tapal/pages/AssignModalPT.jsx

import React, { useState } from "react";

const STAFF_LIST = [
  { id: 1, name: "Mr. R. Senthilkumar", role: "Assistant" },
  { id: 2, name: "Ms. P. Lakshmi", role: "Assistant" },
  { id: 3, name: "Mr. T. Anbarasan", role: "Superintendent" },
  { id: 4, name: "Mrs. S. Meenakshi", role: "Superintendent" },
  { id: 5, name: "Dr. S. Balasivanandha Prabu", role: "Director" },
];

export default function AssignModalPT({ item, onClose, onAssign }) {
  const [staffId, setStaffId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [confirming, setConfirming] = useState(false);

  const selectedStaff = STAFF_LIST.find((s) => s.id === parseInt(staffId));

  const handleConfirm = () => {
    if (!selectedStaff) return;
    onAssign(item.id, selectedStaff, remarks);
  };

  return (
    <div
      className="et-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="et-modal">
        <div className="et-modal-header">
          <h2>Assign Project Transfer</h2>
          <button className="et-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="et-modal-body">
          <div className="et-info-card">
            <div>
              <strong>Tapal ID:</strong> #{item.id}
            </div>
            <div>
              <strong>File No:</strong> {item.file_no || "-"}
            </div>
            <div>
              <strong>From PI:</strong> {item.from_name}
            </div>
            <div>
              <strong>To PI:</strong> {item.to_name}
            </div>
            <div>
              <strong>Agency:</strong> {item.funding_agency}
            </div>
          </div>

          <div className="et-form-group">
            <label>Assign To</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            >
              <option value="">Select Staff</option>
              {STAFF_LIST.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.role}
                </option>
              ))}
            </select>
          </div>

          <div className="et-form-group">
            <label>Remarks</label>
            <textarea
              rows={4}
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {!confirming ? (
            <div className="et-modal-actions">
              <button className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!staffId}
                onClick={() => setConfirming(true)}
              >
                Assign
              </button>
            </div>
          ) : (
            <div className="et-confirm-box">
              <p>
                Assign Project Transfer #{item.id} to{" "}
                <strong>{selectedStaff?.name}</strong>?
              </p>
              <div className="et-modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setConfirming(false)}
                >
                  Back
                </button>
                <button className="btn btn-primary" onClick={handleConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
