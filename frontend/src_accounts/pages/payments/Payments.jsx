import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAccountsBills, fmt, getPaymentsSummary } from './accountsStore';

const CARDS = [
  {
    label: "Voucher Processing",
    icon: "📝",
    desc: "Create, verify and process payment vouchers",
    path: "/accounts/payments/voucher-processing",
    color: "#2563eb",
  },
  {
    label: "Voucher Clearance",
    icon: "🗂️",
    desc: "Clear and approve processed vouchers",
    path: "/accounts/payments/voucher-clearance",
    color: "#8b5cf6",
  },
  {
    label: "Bank Clearance",
    icon: "🏦",
    desc: "Manage bank clearance and reconciliation",
    path: "/accounts/payments/bank-clearance",
    color: "#06b6d4",
  },
  {
    label: "Payment Processing",
    icon: "💳",
    desc: "Payment processing reports and summaries",
    path: "/accounts/payments/reports",
    color: "#10b981",
  },
  {
    label: "Payment Reports",
    icon: "📊",
    desc: "View payment reports and analytics",
    path: "/accounts/payments/payment-report",
    color: "#f59e0b",
  },
];

export default function Payments() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const isDirector = role === 'director';
  return (
    <Layout title="Payments" subtitle="Payment management across all accounts">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Dashboard / Payments
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Payments</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 30 }}>
        Manage all payment types, settlements, clearances and account-wise payment records.
      </p>
      {isDirector ? (
        <DirectorPaymentsReport />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
          {CARDS.map(c => <PaymentCard key={c.label} card={c} onClick={() => navigate(c.path)} />)}
        </div>
      )}
    </Layout>
  );
}

function PaymentCard({ card, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: 'rgb(255, 255, 255)', borderRadius: 18, padding: '22px 18px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
        transform: h ? 'translateY(-3px)' : 'none',
        boxShadow: h
          ? `0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px ${card.color}44`
          : '0 6px 24px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,${card.color},transparent)`
      }} />
      <div style={{
        width: 46, height: 46, borderRadius: 12, marginBottom: 12,
        background: `${card.color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20,
        boxShadow: h ? `0 0 18px ${card.color}33` : 'none',
        transition: 'box-shadow 0.22s',
      }}>
        {card.icon}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>{card.label}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{card.desc}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: card.color }}>Open →</div>
    </div>
  );
}

function DirectorPaymentsReport() {
  const navigate = useNavigate();
  const bills = useAccountsBills();
  const summary = getPaymentsSummary(bills);

  const accountLabels = {
    project: 'Project A/c',
    revenue: 'Revenue A/c',
    mopr: 'MOPR A/c',
    ttdf: 'TTDF A/c',
    tax: 'Tax A/c',
  };

  const accountColors = {
    project: '#2563eb',
    revenue: '#10b981',
    mopr: '#8b5cf6',
    ttdf: '#f59e0b',
    tax: '#f43f5e',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        padding: 24, borderRadius: 20,
        background: 'linear-gradient(135deg,#0f172a,#1e3a8a)',
        color: '#fff', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 12, opacity: .75, textTransform: 'uppercase', letterSpacing: .5 }}>
            Collective Overview
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
            Total Bills: {summary.totalCount}
          </div>
          <div style={{ fontSize: 13, opacity: .8, marginTop: 6 }}>
            Vouchered: {summary.totalVouchered} &nbsp;·&nbsp; Pending Voucher: {summary.totalPendingVoucher} &nbsp;·&nbsp; Cleared: {summary.totalCleared}
          </div>
        </div>
        <div style={{ fontSize: 30, fontWeight: 800 }}>
          {fmt(summary.totalAmount)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
        {Object.entries(summary.accounts).map(([acc, data]) => (
          <div key={acc} style={{
            background: '#fff', borderRadius: 16, padding: 20,
            borderLeft: `4px solid ${accountColors[acc] || '#64748b'}`,
            boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              {accountLabels[acc] || acc}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              {fmt(data.amount)}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {data.count} bills &nbsp;·&nbsp; {data.vouchered} vouchered &nbsp;·&nbsp; {data.cleared} cleared
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/accounts/payments/reports')}
          style={{
            padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0',
            background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#0f172a',
          }}
        >
          📊 Payment Processing Reports →
        </button>
        <button
          onClick={() => navigate('/accounts/payments/payment-report')}
          style={{
            padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0',
            background: '#fff', fontWeight: 700, cursor: 'pointer', color: '#0f172a',
          }}
        >
          📑 Payment Reports →
        </button>
      </div>
    </div>
  );
}