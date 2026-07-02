// PATH: src_accounts/pages/receipts/ReceiptAccounts.jsx
import { useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../payments/VoucherProcessing.css";

export default function ReceiptAccounts() {
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");

  useEffect(() => {
    if (role === "director") {
      navigate("/accounts/receipts");
    }
  }, []);

  const accounts = [
    {
      title: "Project A/c",
      path: "/accounts/receipts/project-account",
      icon: "📁",
    },
    {
      title: "MOPR A/c",
      path: "/accounts/receipts/mopr-account",
      icon: "📊",
    },
    {
      title: "TTDF A/c",
      path: "/accounts/receipts/ttdf-account",
      icon: "📄",
    },
    {
      title: "Revenue A/c",
      path: "/accounts/receipts/revenue-account",
      icon: "💰",
    },
    {
      title: "Tax A/c",
      path: "/accounts/receipts/tax-account",
      icon: "🧾",
    },
  ];

  return (
    <Layout
      title="Receipts"
      subtitle="Select an account to enter receipt details"
    >
      <div className="voucher-page">
        <div className="voucher-header">
          <h2>Receipt Accounts</h2>
          <p>Select an Account</p>
        </div>

        <div className="voucher-grid">
          {accounts.map((item) => (
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