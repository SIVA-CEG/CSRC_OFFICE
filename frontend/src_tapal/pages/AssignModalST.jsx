import React, { useState } from "react";
import "./AssignModalST.css";

const STAFF_LIST = [
  {
    id: 1,
    name: "Mr. T. Anbarasan",
    designation: "Assistant",
  },
  {
    id: 2,
    name: "Mrs. R. Priya",
    designation: "Section Officer",
  },
  {
    id: 3,
    name: "Mr. K. Kumar",
    designation: "Administrative Officer",
  },
];

export default function AssignModalST({
  item,
  onClose,
  onAssign,
}) {
  const [selectedStaff, setSelectedStaff] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const handleAssign = () => {
    const staff =
      STAFF_LIST.find(
        (s) =>
          String(s.id) ===
          selectedStaff
      );

    if (!staff) {
      alert(
        "Please select a staff member"
      );
      return;
    }

    onAssign(
      item.id,
      staff,
      remarks
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            Assign Sanction Request
          </h3>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              marginBottom: 16,
            }}
          >
            <label>
              Request ID
            </label>

            <input
              value={item.id}
              readOnly
              className="form-input"
            />
          </div>

          <div
            style={{
              marginBottom: 16,
            }}
          >
            <label>
              Project Title
            </label>

            <input
              value={
                item.projectTitle
              }
              readOnly
              className="form-input"
            />
          </div>

          <div
            style={{
              marginBottom: 16,
            }}
          >
            <label>
              Assign To
            </label>

            <select
              value={
                selectedStaff
              }
              onChange={(e) =>
                setSelectedStaff(
                  e.target.value
                )
              }
              className="form-input"
            >
              <option value="">
                Select Staff
              </option>

              {STAFF_LIST.map(
                (staff) => (
                  <option
                    key={
                      staff.id
                    }
                    value={
                      staff.id
                    }
                  >
                    {staff.name} (
                    {
                      staff.designation
                    }
                    )
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label>
              Remarks
            </label>

            <textarea
              rows="4"
              value={remarks}
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
              className="form-input"
              placeholder="Enter remarks..."
            />
          </div>
        </div>

        <div
          className="modal-footer"
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: 10,
          }}
        >
          <button
            className="btn btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={
              handleAssign
            }
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}