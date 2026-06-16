import { useMemo } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import Layout from "../../components/Layout";



export default function ReceiptReportView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const receipt = useMemo(() => {
    const data = JSON.parse(
      localStorage.getItem(
        "receipt_entries"
      ) || "[]"
    );

    return data.find(
      x => String(x.id) === String(id)
    );
  }, [id]);

  if (!receipt) {
    return (
      <Layout title="Receipt">
        <div style={styles.empty}>
          Receipt not found
        </div>
      </Layout>
    );
  }

  const unicode =
    `${receipt.digit1}-${receipt.digit23}-${receipt.digit45}-${receipt.digit67}-${receipt.digit89}`;

  return (
    <Layout
      title="Receipt Details"
      subtitle={`Receipt #${receipt.id}`}
    >
      <div style={styles.page}>
        <div style={styles.hero}>
  <div>
    <button
      style={styles.backBtn}
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>

    <h1 style={styles.title}>
      Receipt Details
    </h1>

    <p style={styles.subtitle}>
      {receipt.account}
    </p>
  </div>

  <div style={styles.amount}>
    ₹ {Number(receipt.amount)
      .toLocaleString("en-IN")}
  </div>
</div>

        <div style={styles.grid}>
          <Card title="Receipt Information">
            <Row
              label="Receipt Head"
              value={receipt.receiptHead}
            />

            <Row
              label="Fund Type"
              value={receipt.fundType}
            />

            <Row
              label="Pay Mode"
              value={receipt.payMode}
            />

            <Row
              label="Account On"
              value={receipt.accountOn}
            />

            <Row
              label="Transaction Date"
              value={receipt.transactionDate}
            />
          </Card>

          <Card title="Accounting Information">
            <Row
              label="Digit 1"
              value={receipt.digit1}
            />

            <Row
              label="Digit 2&3"
              value={receipt.digit23}
            />

            <Row
              label="Digit 4&5"
              value={receipt.digit45}
            />

            <Row
              label="Digit 6&7"
              value={receipt.digit67}
            />

            <Row
              label="Digit 8&9"
              value={receipt.digit89}
            />

            <Row
              label="Unicode"
              value={unicode}
            />
          </Card>

          <Card title="Administrative">
            <Row
              label="M.H.No"
              value={receipt.mhNo}
            />

            <Row
              label="File No"
              value={receipt.fileNo}
            />

            <Row
              label="Department"
              value={receipt.department}
            />

            <Row
              label="Campus"
              value={receipt.campus}
            />

            <Row
              label="Remarks"
              value={receipt.remarks}
            />
          </Card>

          {receipt.account === "Revenue" && (
            <Card title="Revenue Register">
              <Row
                label="Register Sl.No"
                value={receipt.registerSlNo}
              />

              <Row
                label="Page No"
                value={receipt.pageNo}
              />

              <Row
                label="Vol No"
                value={receipt.volNo}
              />
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Card({ title, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>
        {title}
      </h3>

      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    background:
      "linear-gradient(135deg,#0f172a,#2563eb)",
    color: "white",
  },

  title: {
    fontSize: 30,
    fontWeight: 800,
  },

  subtitle: {
    opacity: .8,
  },

  amount: {
    fontSize: 32,
    fontWeight: 800,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(350px,1fr))",
    gap: 24,
  },

  card: {
    background: "white",
    borderRadius: 20,
    padding: 24,
    boxShadow:
      "0 8px 30px rgba(0,0,0,.08)",
  },

  cardTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 700,
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom:
      "1px solid #e2e8f0",
  },

  empty: {
    padding: 60,
    textAlign: "center",
  },
  backBtn: {
  border: "none",
  background: "rgba(255,255,255,.15)",
  color: "#fff",
  padding: "10px 18px",
  borderRadius: 12,
  cursor: "pointer",
  marginBottom: 16,
  fontWeight: 600,
},
};