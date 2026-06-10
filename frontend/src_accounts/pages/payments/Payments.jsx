import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const CARDS = [
  { label: 'Revenue A/c', icon: '💰', desc: 'Revenue account payment entries', path: '/payments/revenue-ac', color: '#06b6d4' },
  { label: 'Project A/c', icon: '📁', desc: 'Project account payment records', path: '/payments/project-ac', color: '#10b981' },
  { label: 'MOPR A/c', icon: '🏛️', desc: 'MOPR account payments management', path: '/payments/mopr-ac', color: '#8b5cf6' },
  { label: 'TTDF A/c', icon: '🔬', desc: 'TTDF account payment transactions', path: '/payments/ttdf-ac', color: '#f59e0b' },
  { label: 'Tax A/c', icon: '🧾', desc: 'Tax account payment and deductions', path: '/payments/tax-ac', color: '#f43f5e' },
  { label: 'Unspent Amount', icon: '🏦', desc: 'Track and manage unspent fund amounts', path: '/payments/unspent-amount', color: '#0ea5e9' },
  { label: 'Adv Settlement', icon: '📋', desc: 'Advance payment settlement records', path: '/payments/adv-settlement', color: '#a78bfa' },
  { label: 'Bank Clearance', icon: '✅', desc: 'Bank payment clearance management', path: '/payments/bank-clearance', color: '#34d399' },
  { label: 'Voucher Clearance', icon: '🗂️', desc: 'Voucher-based payment clearance', path: '/payments/voucher-clearance', color: '#fb923c' },
  { label: 'Payment Types', icon: '🏷️', desc: 'Configure and manage payment type categories', path: '/payments/payment-types', color: '#e879f9' },
  { label: 'Sub-head Types', icon: '📑', desc: 'Sub-head classification for payments', path: '/payments/subhead-types', color: '#38bdf8' },
  { label: 'Payment Lock', icon: '🔒', desc: 'Lock and finalise payment period entries', path: '/payments/payment-lock', color: '#f472b6' },
];

export default function Payments() {
  const navigate = useNavigate();
  return (
    <Layout title="Payments" subtitle="Payment management across all accounts">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Dashboard / Payments
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Payments</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 30 }}>
        Manage all payment types, settlements, clearances and account-wise payment records.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
        {CARDS.map(c => <PaymentCard key={c.label} card={c} onClick={() => navigate(c.path)} />)}
      </div>
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
        background: 'rgba(30,41,59,0.75)', borderRadius: 18, padding: '22px 18px',
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