import { useState } from "react";
import { addTapal } from "../../api/tapalApi";
import {
  ctdtCategories,
  documentTypes,
  departments,
  campuses,
  tapalModes,
} from "../../data/dummyData";

const empty = {
  tapalDate: "",
  hardCopyReceivedDate: "",
  acceptanceId: "",
  mhFileNo: "",
  ctdtCategory: "",
  documentType: "",
  tapalFrom: "",
  department: "",
  campus: "",
  referenceNo: "",
  referenceDate: "",
  amount: "",
  tapalMode: "",
  subject: "",
  billFile: null,
};

const tapalFromOptions = [
  "Dr. P. Renuka Devi, DSH (RC Coimbatore)",
  "Dr. M. Sasikala, NHHID (CEG Campus)",
  "Dr. R. Vidhya, IRS (CEG Campus)",
  "Dr. M.C. Sashikkumar, Civil (UCE Dindigul)",
  "Dr. V.K. Stalin, Civil (CEG Campus)",
  "Internal Audit - I Anna University",
];

const FormField = ({ label, required, children }) => (
  <div className="form-field">
    <label>
      {label}
      {required && <span className="req">*</span>}
    </label>
    {children}
  </div>
);

const SelectField = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">Select option</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

export default function TapalForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      "mhFileNo",
      "ctdtCategory",
      "documentType",
      "tapalFrom",
      "department",
      "campus",
      "referenceNo",
      "amount",
      "subject",
    ];

    for (const key of required) {
      if (!form[key]) {
        alert(`Please fill: ${key}`);
        return;
      }
    }

    const today = new Date().toISOString().split("T")[0];

    const fd = new FormData();
    fd.append("tapalNo", `TEMP${Date.now()}`);
    fd.append("acceptanceId", form.acceptanceId || "");
    fd.append("tapalDate", form.tapalDate || today);
    fd.append("hardCopyReceivedDate", form.hardCopyReceivedDate || "");
    fd.append("referenceDate", form.referenceDate || today);
    fd.append("referenceNo", form.referenceNo);
    fd.append("mhFileNo", form.mhFileNo);
    fd.append("ctdtCategory", form.ctdtCategory);
    fd.append("documentType", form.documentType);
    fd.append("tapalFrom", form.tapalFrom);
    fd.append("department", form.department);
    fd.append("campus", form.campus);
    fd.append("amount", form.amount);
    fd.append("tapalMode", form.tapalMode || "");
    fd.append("subject", form.subject);

    if (form.billFile) {
      fd.append("bill", form.billFile);
    }

    await addTapal(fd);
    onAdd();
  };

  return (
    <form className="tapal-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h4>Basic Information</h4>

        <div className="form-grid form-grid-4">
          <FormField label="Tapal Date">
            <input
              type="date"
              value={form.tapalDate}
              onChange={(e) => updateField("tapalDate", e.target.value)}
            />
          </FormField>

          <FormField label="Hard Copy Received Date">
            <input
              type="date"
              value={form.hardCopyReceivedDate}
              onChange={(e) =>
                updateField("hardCopyReceivedDate", e.target.value)
              }
            />
          </FormField>

          <FormField label="Acceptance ID">
            <input
              placeholder="Enter acceptance ID"
              value={form.acceptanceId}
              onChange={(e) => updateField("acceptanceId", e.target.value)}
            />
          </FormField>

          <FormField label="M.H.No / File No." required>
            <input
              placeholder="Enter file number"
              value={form.mhFileNo}
              onChange={(e) => updateField("mhFileNo", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <h4>Tapal Classification</h4>

        <div className="form-grid form-grid-2">
          <FormField label="CTDT Category Type" required>
            <SelectField
              value={form.ctdtCategory}
              onChange={(value) => updateField("ctdtCategory", value)}
              options={ctdtCategories}
            />
          </FormField>

          <FormField label="Document Type" required>
            <SelectField
              value={form.documentType}
              onChange={(value) => updateField("documentType", value)}
              options={documentTypes}
            />
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <h4>Sender Details</h4>

        <div className="form-grid form-grid-3">
          <FormField label="Tapal From" required>
            <SelectField
              value={form.tapalFrom}
              onChange={(value) => updateField("tapalFrom", value)}
              options={tapalFromOptions}
            />
          </FormField>

          <FormField label="Department" required>
            <SelectField
              value={form.department}
              onChange={(value) => updateField("department", value)}
              options={departments}
            />
          </FormField>

          <FormField label="Campus" required>
            <SelectField
              value={form.campus}
              onChange={(value) => updateField("campus", value)}
              options={campuses}
            />
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <h4>Reference Details</h4>

        <div className="form-grid form-grid-4">
          <FormField label="Reference No." required>
            <input
              placeholder="Enter reference number"
              value={form.referenceNo}
              onChange={(e) => updateField("referenceNo", e.target.value)}
            />
          </FormField>

          <FormField label="Reference Date">
            <input
              type="date"
              value={form.referenceDate}
              onChange={(e) => updateField("referenceDate", e.target.value)}
            />
          </FormField>

          <FormField label="Amount" required>
            <input
              type="number"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => updateField("amount", e.target.value)}
            />
          </FormField>

          <FormField label="Tapal Mode">
            <SelectField
              value={form.tapalMode}
              onChange={(value) => updateField("tapalMode", value)}
              options={tapalModes}
            />
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <h4>Bill Upload</h4>

        <FormField label="Upload Bill PDF">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              updateField("billFile", e.target.files[0] || null)
            }
          />
        </FormField>
      </div>

      <div className="form-section">
        <h4>Subject</h4>

        <FormField label="Subject" required>
          <input
            placeholder="Enter tapal subject"
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
          />
        </FormField>
      </div>

      <div className="form-actions form-actions-left">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="btn btn-primary">
          Save Tapal
        </button>
      </div>
    </form>
  );
}