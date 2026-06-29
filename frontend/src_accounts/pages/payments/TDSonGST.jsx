import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.uc-wrap { font-family:'Inter',sans-serif; color:#0f172a; display:flex; flex-direction:column; align-items:center;
  justify-content:center; min-height:60vh; text-align:center; gap:18px; }
.uc-back { align-self:flex-start; display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#16a34a;
  font-weight:700; cursor:pointer; background:none; border:none; margin-bottom:10px; }
.uc-icon { width:84px; height:84px; border-radius:24px; display:flex; align-items:center; justify-content:center;
  font-size:38px; background:linear-gradient(135deg,#16a34a,#22c55e); box-shadow:0 14px 32px rgba(34,197,94,.28); }
.uc-title { font-family:'Sora'; font-size:24px; font-weight:800; margin:0; }
.uc-sub { color:#64748b; font-size:14px; max-width:420px; line-height:1.6; margin:0; }
.uc-badge { font-size:11px; font-weight:700; letter-spacing:.6px; text-transform:uppercase; padding:5px 14px;
  border-radius:999px; background:#fef3c7; color:#b45309; }
`;

export default function TDSonGST() {
  const navigate = useNavigate();

  return (
    <Layout title="TDS on GST" subtitle="Accounts / Payments / TDS on GST">
      <style>{css}</style>
      <div>
        <button className="uc-back" onClick={() => navigate("/accounts/payments")}>
          ← Back
        </button>

        <div className="uc-wrap">
          <div className="uc-icon">🧾</div>
          <h1 className="uc-title">TDS on GST</h1>
          <span className="uc-badge">Coming Soon</span>
          <p className="uc-sub">
            The TDS-on-GST report is under construction. This page will show
            tax deducted on the GST component of payments once the module
            is built.
          </p>
        </div>
      </div>
    </Layout>
  );
}