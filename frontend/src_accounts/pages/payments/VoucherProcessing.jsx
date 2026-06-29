// PATH: src_accounts/pages/payments/VoucherProcessing.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "./VoucherProcessing.css";
import Layout from "../../components/Layout";

export default function VoucherProcessing() {
  const navigate = useNavigate();

  const vouchers = [
    {
      title: "Revenue A/c",
      path: "/accounts/payments/revenue-account",
      icon: "💰",
    },
    {
      title: "Project A/c",
      path: "/accounts/payments/project-account",
      icon: "📁",
    },
    {
      title: "MOPR A/c",
      path: "/accounts/payments/mopr-account",
      icon: "📊",
    },
    {
      title: "TTDF A/c",
      path: "/accounts/payments/ttdf-account",
      icon: "📄",
    },
    {
      title: "Tax A/c",
      path: "/accounts/payments/tax-account",
      icon: "🧾",
    },
  ];

return (
  <Layout
    title="Voucher Processing"
    subtitle="Completed bills from office approval — record voucher entries"
  >
    <div className="voucher-page">
      <div className="voucher-header">
        <h2>Voucher Processing</h2>
        <p>Select an Account</p>
      </div>

      <div className="voucher-grid">
        {vouchers.map((item) => (
          <div
            key={item.path}
            className="voucher-card"
            onClick={() => navigate(item.path)}
          >
            <div className="voucher-icon">{item.icon}</div>
            <div className="voucher-title">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
    </Layout>
  );
}