import { useState } from "react";

const RECEIPT_HEADS = [
  "Project Receipt",
  "Consultancy Receipt",
  "Interest Receipt",
  "Grant Receipt",
  "Donation Receipt"
];

const FUND_TYPES = [
  "Project",
  "Revenue",
  "TTDF",
  "MOPR",
  "Tax"
];

const PAY_MODES = [
  "NEFT",
  "RTGS",
  "UPI",
  "Cheque",
  "Cash"
];

const FILE_NUMBERS = [
  "FILE-001",
  "FILE-002",
  "FILE-003"
];

const DIGIT1_OPTIONS = [
  "Receipt",
  "Payment",
  "Journal",
  "Contra"
];

const COST_CENTRES_PRIMARY = [
  "01",
  "02",
  "03",
  "04"
];

const COST_CENTRES_SECONDARY = [
  "11",
  "12",
  "13",
  "14"
];

const LEDGER_GROUPS = [
  "21",
  "22",
  "23",
  "24"
];

const GENERAL_LEDGERS = [
  "31",
  "32",
  "33",
  "34"
];

const DEPARTMENTS = [
  "IT",
  "CSE",
  "ECE",
  "EEE",
  "MECH"
];

const CAMPUSES = [
  "Main Campus",
  "Research Park",
  "Extension Centre"
];

function Select({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div style={styles.field}>
      <label>{label}</label>

      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={styles.input}
      >
        <option value="">
          -- Select --
        </option>

        {options.map(option => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ReceiptForm({ entry, onClose }) {
  const [form, setForm] = useState({
  accountOn: "",
  receiptHead: "",
  fundType: "",
  payMode: "",
  fileNo: "",
  mhNo: "",

  digit1: "",

  registerSlNo: "",
  pageNo: "",
  volNo: "",

  digit23: "",
  digit45: "",
  digit67: "",
  digit89: "",

  department: "",
  campus: "",

  remarks: "",
});

  const update = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };





const submit = () => {
  if (!form.receiptHead) {
  alert("Select Receipt Head");
  return;
}

if (!form.fundType) {
  alert("Select Fund Type");
  return;
}

if (!form.accountOn) {
  alert("Select Account On Date");
  return;
}
  const receipts = JSON.parse(
    localStorage.getItem("receipt_entries") || "[]"
  );

  const amount =
    Number(entry.creditAmount || 0) ||
    Number(entry.debitAmount || 0);

  const receipt = {
    id: Date.now(),

    account: entry.account,

    transactionDate:
      entry.transactionDate,

    bankDescription:
      entry.bankDescription,

    bankReference:
      entry.bankReference,

    amount,

    receiptHead:
      form.receiptHead,

    fundType:
      form.fundType,

    payMode:
      form.payMode,

    fileNo:
      form.fileNo,

    mhNo:
      form.mhNo,

    accountOn:
      form.accountOn,

    digit1:
      form.digit1,

    digit23:
      form.digit23,

    digit45:
      form.digit45,

    digit67:
      form.digit67,

    digit89:
      form.digit89,

    department:
      form.department,

    campus:
      form.campus,

    registerSlNo:
      form.registerSlNo,

    pageNo:
      form.pageNo,

    volNo:
      form.volNo,

    remarks:
      form.remarks,

    createdAt:
      new Date().toISOString(),
  };

  receipts.unshift(receipt);

  localStorage.setItem(
  "receipt_entries",
  JSON.stringify(receipts)
);

const currentEntries = JSON.parse(
  localStorage.getItem(
    "current_bank_entries"
  ) || "[]"
);

const updatedEntries =
  currentEntries.map(row =>
    row.id === entry.id
      ? {
          ...row,
          receiptCreated: true,
        }
      : row
  );

localStorage.setItem(
  "current_bank_entries",
  JSON.stringify(updatedEntries)
);

  alert("Receipt Saved Successfully");
  window.dispatchEvent(
  new Event("receipt-created")
);

  onClose?.();
};


  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>Receipt Entry</h2>

          <button
            style={styles.closeBtn}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={styles.summaryCard}>
          <h3>Selected Bank Entry</h3>

          <div style={styles.summaryGrid}>
            <Info
  label="Date"
  value={new Date(entry.transactionDate)
    .toLocaleDateString("en-IN")}
/>

            <Info
              label="Amount"
              value={`₹ ${Number(
  entry.creditAmount ||
  entry.debitAmount ||
  0
).toLocaleString("en-IN")}`}
            />

            <Info
              label="Account"
              value={entry.account}
            />
          </div>

          <div style={styles.block}>
            <b>Description</b>
            <p>{entry.bankDescription}</p>
          </div>

          <div style={styles.block}>
            <b>Reference</b>
            <p>{entry.bankReference}</p>
          </div>
        </div>

        <div style={styles.formGrid}>
          <Select
  label="Receipt Head"
  value={form.receiptHead}
  onChange={v => update("receiptHead", v)}
  options={RECEIPT_HEADS}
/>

          <Select
  label="Fund Type"
  value={form.fundType}
  onChange={v => update("fundType", v)}
  options={FUND_TYPES}
/>

          <Select
  label="Pay Mode"
  value={form.payMode}
  onChange={v => update("payMode", v)}
  options={PAY_MODES}
/>

          <Select
  label="File Number"
  value={form.fileNo}
  onChange={v => update("fileNo", v)}
  options={FILE_NUMBERS}
/>

          <Input
            label="MH Number"
            value={form.mhNo}
            onChange={v => update("mhNo", v)}
          />

          <Input
            label="Account On"
            type="date"
            value={form.accountOn}
            onChange={v => update("accountOn", v)}
          />

          <Select
  label="Digit 1"
  value={form.digit1}
  onChange={v => update("digit1", v)}
  options={DIGIT1_OPTIONS}
/>

          <Select
  label="Digit 2&3 (Primary Cost Centre)"
  value={form.digit23}
  onChange={v => update("digit23", v)}
  options={COST_CENTRES_PRIMARY}
/>

          <Select
  label="Digit 4&5 (Secondary Cost Centre)"
  value={form.digit45}
  onChange={v => update("digit45", v)}
  options={COST_CENTRES_SECONDARY}
/>

          <Select
  label="Digit 6&7 (Ledger Group)"
  value={form.digit67}
  onChange={v => update("digit67", v)}
  options={LEDGER_GROUPS}
/>

          <Select
  label="Digit 8&9 (General Ledger)"
  value={form.digit89}
  onChange={v => update("digit89", v)}
  options={GENERAL_LEDGERS}
/>

          <Select
  label="Department"
  value={form.department}
  onChange={v => update("department", v)}
  options={DEPARTMENTS}
/>

          <Select
  label="Campus"
  value={form.campus}
  onChange={v => update("campus", v)}
  options={CAMPUSES}
/>  

{entry.account === "Revenue" && (
  <div style={styles.revenueSection}>
    <div style={styles.revenueTitle}>
      Revenue Register Details
    </div>

    <div style={styles.revenueGrid}>
      <Input
        label="Register Sl.No."
        value={form.registerSlNo}
        onChange={v => update("registerSlNo", v)}
      />

      <Input
        label="Page No."
        value={form.pageNo}
        onChange={v => update("pageNo", v)}
      />

      <Input
        label="Vol. No."
        value={form.volNo}
        onChange={v => update("volNo", v)}
      />
    </div>
  </div>
)}


        </div>

        <div style={styles.remarkSection}>
          <label>Remarks</label>

          <textarea
            style={styles.textarea}
            value={form.remarks}
            onChange={e =>
              update("remarks", e.target.value)
            }
          />
        </div>

        <div style={styles.footer}>
          <button
            style={styles.cancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            style={styles.submitBtn}
            onClick={submit}
          >
            Submit Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div style={styles.field}>
      <label>{label}</label>

      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={styles.infoLabel}>
        {label}
      </div>

      <div style={styles.infoValue}>
        {value}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "95%",
    maxWidth: 1200,
    maxHeight: "95vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 20,
    padding: 24,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  closeBtn: {
    border: "none",
    background: "#eee",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },

  summaryCard: {
    padding: 20,
    background: "#f8fafc",
    borderRadius: 16,
    marginBottom: 20,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 16,
  },

  block: {
    marginTop: 15,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 20,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  input: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
  },

  remarkSection: {
    marginTop: 20,
  },

  textarea: {
    width: "100%",
    minHeight: 120,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },

  cancelBtn: {
    padding: "12px 20px",
  },

  submitBtn: {
    padding: "12px 20px",
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 12,
  },

  infoValue: {
    fontWeight: 600,
    marginTop: 4,
  },
  revenueSection: {
  gridColumn: "1 / -1",
  padding: 20,
  borderRadius: 16,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
},

revenueTitle: {
  fontSize: 16,
  fontWeight: 700,
  color: "#9a3412",
  marginBottom: 16,
},

revenueGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 20,
},
};