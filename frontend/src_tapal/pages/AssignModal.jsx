import React, { useState } from "react";

const STAFF_LIST = [
  {
    id: 1,
    name: "Mr. R. Senthilkumar",
    role: "Assistant",
  },
  {
    id: 2,
    name: "Mrs. K. Priya",
    role: "Assistant",
  },
  {
    id: 3,
    name: "Mr. T. Anbarasan",
    role: "Superintendent",
  },
  {
    id: 4,
    name: "Mrs. S. Meenakshi",
    role: "Superintendent",
  },
  {
    id: 5,
    name: "Dr. S. Balasivanandha Prabu",
    role: "Director",
  },
];

export default function AssignModal({
  item,
  onClose,
  onAssign,
}) {
  const [staffId, setStaffId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [confirming, setConfirming] =
    useState(false);

  const selectedStaff = STAFF_LIST.find(
    (s) => s.id === parseInt(staffId)
  );

  const handleConfirm = () => {
    if (!selectedStaff) return;

    onAssign(
      item.id,
      selectedStaff,
      remarks
    );
  };

  return (
    <div
      className="et-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="et-modal">
        <div className="et-modal-header">
          <h2>Assign Endorsement</h2>

          <button
            className="et-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="et-modal-body">

          <div className="et-info-card">
            <div>
              <strong>
                Proposal ID:
              </strong>{" "}
              #{item.id}
            </div>

            <div>
              <strong>
                Applicant:
              </strong>{" "}
              {item.from}
            </div>

            <div>
              <strong>
                Category:
              </strong>{" "}
              {item.category}
            </div>
          </div>

          <div className="et-form-group">
            <label>
              Assign To
            </label>

            <select
              value={staffId}
              onChange={(e) =>
                setStaffId(e.target.value)
              }
            >
              <option value="">
                Select Staff
              </option>

              {STAFF_LIST.map((staff) => (
                <option
                  key={staff.id}
                  value={staff.id}
                >
                  {staff.name}
                  {" - "}
                  {staff.role}
                </option>
              ))}
            </select>
          </div>

          <div className="et-form-group">
            <label>
              Remarks
            </label>

            <textarea
              rows={4}
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
            />
          </div>

          {!confirming ? (
            <div className="et-modal-actions">
              <button
                className="btn btn-outline"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                disabled={!staffId}
                onClick={() =>
                  setConfirming(true)
                }
              >
                Assign
              </button>
            </div>
          ) : (
            <div className="et-confirm-box">

              <p>
                Assign Proposal #
                {item.id}
                {" to "}
                <strong>
                  {
                    selectedStaff?.name
                  }
                </strong>
                ?
              </p>

              <div className="et-modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    setConfirming(false)
                  }
                >
                  Back
                </button>

                <button
                  className="btn btn-primary"
                  onClick={
                    handleConfirm
                  }
                >
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