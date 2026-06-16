import { useEffect, useState } from "react";

export default function ReceiptEditDrawer({
  open,
  receipt,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (receipt) {
      setForm(receipt);
    }
  }, [receipt]);

  if (!open) return null;

  const update = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <>
      <div
        style={styles.backdrop}
        onClick={onClose}
      />

      <div style={styles.drawer}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              Edit Receipt
            </h2>

            <div style={styles.subTitle}>
              Receipt #{receipt?.id}
            </div>
          </div>

          <button
            style={styles.closeBtn}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={styles.body}>
          <Field
            label="Receipt Head"
            value={form.receiptHead}
            onChange={v =>
              update(
                "receiptHead",
                v
              )
            }
          />

          <Field
            label="M.H.No"
            value={form.mhNo}
            onChange={v =>
              update("mhNo", v)
            }
          />

          <Field
            label="File No"
            value={form.fileNo}
            onChange={v =>
              update(
                "fileNo",
                v
              )
            }
          />

          <Field
            label="Amount"
            value={form.amount}
            onChange={v =>
              update(
                "amount",
                v
              )
            }
          />

          <Field
            label="Remarks"
            value={form.remarks}
            onChange={v =>
              update(
                "remarks",
                v
              )
            }
          />

          <Field
            label="Department"
            value={form.department}
            onChange={v =>
              update(
                "department",
                v
              )
            }
          />

          <Field
            label="Campus"
            value={form.campus}
            onChange={v =>
              update(
                "campus",
                v
              )
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
            style={styles.saveBtn}
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
      </label>

      <input
        value={value || ""}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,0,0,.45)",
    zIndex: 999,
  },

  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: 520,
    height: "100vh",
    background: "#fff",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "-10px 0 40px rgba(0,0,0,.15)",
  },

  header: {
    padding: 24,
    borderBottom:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent:
      "space-between",
  },

  title: {
    fontSize: 24,
    fontWeight: 800,
  },

  subTitle: {
    color: "#64748b",
    marginTop: 4,
  },

  closeBtn: {
    border: "none",
    background: "#f1f5f9",
    width: 40,
    height: 40,
    borderRadius: 10,
    cursor: "pointer",
  },

  body: {
    flex: 1,
    overflowY: "auto",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  label: {
    fontWeight: 600,
    color: "#334155",
  },

  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
  },

  footer: {
    padding: 24,
    borderTop:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelBtn: {
    padding:
      "12px 18px",
    borderRadius: 12,
    border:
      "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer",
  },

  saveBtn: {
    padding:
      "12px 18px",
    borderRadius: 12,
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
};