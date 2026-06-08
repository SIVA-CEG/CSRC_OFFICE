import React, { useState } from "react";
import "./AssignModalRT.css";

const STAFFS = [
  {
    id: 1,
    name: "Mr. T. Anbarasan",
    designation: "Superintendent",
  },
  {
    id: 2,
    name: "Mrs. S. Meenakshi",
    designation: "Assistant",
  },
  {
    id: 3,
    name: "Mr. R. Senthilkumar",
    designation: "Assistant",
  },
  {
    id: 4,
    name: "Dr. S. Balasivanandha Prabu",
    designation: "Director",
  },
];

export default function AssignModalRT({
  item,
  onClose,
  onAssign,
}) {
  const [staffId, setStaffId] = useState("");
  const [remarks, setRemarks] = useState("");

  const selectedStaff = STAFFS.find(
    (s) => s.id === Number(staffId)
  );

  const handleAssign = () => {
    if (!selectedStaff) return;

    onAssign(
      item.id,
      selectedStaff,
      remarks
    );
  };

  return (
    <div
      className="art-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="art-modal">

        <div className="art-header">
          <div>
            <h2>
              Assign Request
            </h2>

            <p>
              Request #{item.id}
            </p>
          </div>

          <button
            className="art-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="art-body">

          <div className="art-request-card">

            <div>
              <strong>
                Project
              </strong>
              <br />
              {item.projectTitle}
            </div>

            <div>
              <strong>
                PI Name
              </strong>
              <br />
              {item.piName}
            </div>

            <div>
              <strong>
                Request Type
              </strong>
              <br />
              {item.requestType}
            </div>

          </div>

          <div className="art-group">
            <label>
              Assign To
            </label>

            <select
              value={staffId}
              onChange={(e) =>
                setStaffId(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Staff
              </option>

              {STAFFS.map(
                (staff) => (
                  <option
                    key={staff.id}
                    value={
                      staff.id
                    }
                  >
                    {
                      staff.name
                    }
                    {" - "}
                    {
                      staff.designation
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="art-group">
            <label>
              Remarks
            </label>

            <textarea
              rows={4}
              value={remarks}
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
              placeholder="Enter remarks..."
            />
          </div>

          <div className="art-actions">

            <button
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              disabled={
                !selectedStaff
              }
              onClick={
                handleAssign
              }
            >
              Assign
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}