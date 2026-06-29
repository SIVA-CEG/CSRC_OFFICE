import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.ppr-wrap { font-family:'Inter',sans-serif; color:#0f172a; }
.ppr-head h1 { font-family:'Sora'; font-size:30px; font-weight:800; margin:0 0 4px;
  background:linear-gradient(90deg,#0f172a,#334155); -webkit-background-clip:text; background-clip:text; color:transparent; }
.ppr-head p { color:#64748b; font-size:14px; margin:0 0 28px; }

.ppr-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:18px; }
@media(max-width:1100px){ .ppr-grid{grid-template-columns:repeat(3,1fr);} }
@media(max-width:720px){ .ppr-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:480px){ .ppr-grid{grid-template-columns:1fr;} }

.ppr-card { background:#fff; border:1px solid #eef0f5; border-radius:18px; padding:28px 20px;
  display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center;
  cursor:pointer; box-shadow:0 6px 20px rgba(15,23,42,.05); transition:.2s; }
.ppr-card:hover { transform:translateY(-3px); box-shadow:0 14px 32px rgba(15,23,42,.1); border-color:#d8f0e3; }
.ppr-icon { width:56px; height:56px; border-radius:16px; display:flex; align-items:center; justify-content:center;
  font-size:26px; background:linear-gradient(135deg,#16a34a,#22c55e); box-shadow:0 8px 20px rgba(34,197,94,.25); }
.ppr-title { font-family:'Sora'; font-size:15px; font-weight:700; color:#0f172a; }
.ppr-sub { font-size:12px; color:#94a3b8; line-height:1.4; }
.ppr-badge { font-size:10px; font-weight:700; letter-spacing:.5px; text-transform:uppercase;
  padding:3px 9px; border-radius:999px; background:#fef3c7; color:#b45309; }
`;

export default function PaymentProcessing() {
  const navigate = useNavigate();

  const reports = [
    {
      title: "Payment Abstract",
      sub: "Month-wise totals by head of account",
      path: "/accounts/payments/abstract",
      icon: "📊",
    },
    {
      title: "Compilation",
      sub: "Voucher-wise register with running total",
      path: "/accounts/payments/compilation",
      icon: "📑",
    },
    {
      title: "TDS",
      sub: "Tax deducted at source",
      path: "/accounts/payments/tds",
      icon: "🧮",
      underConstruction: true,
    },
    {
      title: "TDS on GST",
      sub: "TDS deducted on GST component",
      path: "/accounts/payments/tds-on-gst",
      icon: "🧾",
      underConstruction: true,
    },
    {
      title: "GST",
      sub: "Goods & Services Tax register",
      path: "/accounts/payments/gst",
      icon: "💹",
      underConstruction: true,
    },
  ];

  return (
    <Layout
      title="Payment Processing"
      subtitle="Reports and compilations for processed payments"
    >
      <style>{css}</style>
      <div className="ppr-wrap">
        <div className="ppr-head">
          <h1>PAYMENT REPORTS</h1>
          <p>Select a report to view</p>
        </div>

        <div className="ppr-grid">
          {reports.map((item) => (
            <div
              key={item.path}
              className="ppr-card"
              onClick={() => navigate(item.path)}
            >
              <div className="ppr-icon">{item.icon}</div>
              <div className="ppr-title">{item.title}</div>
              <div className="ppr-sub">{item.sub}</div>
              {item.underConstruction && (
                <span className="ppr-badge">Coming Soon</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}