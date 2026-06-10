import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const CARDS = [
  { label: 'Project A/c', icon: '📁', desc: 'Project account receipt entries and records', path: '/receipts/project-ac', color: '#06b6d4' },
  { label: 'MoPR A/c', icon: '🏛️', desc: 'Ministry of Panchayati Raj receipt management', path: '/receipts/mopr-ac', color: '#8b5cf6' },
  { label: 'TTDF A/c', icon: '🔬', desc: 'TTDF account receipts and transactions', path: '/receipts/ttdf-ac', color: '#f59e0b' },
  { label: 'Revenue A/c', icon: '💰', desc: 'Revenue account receipt tracking', path: '/receipts/revenue-ac', color: '#10b981' },
  { label: 'Tax A/c', icon: '🧾', desc: 'Tax account receipts and deductions', path: '/receipts/tax-ac', color: '#f43f5e' },
  { label: 'Receipt Lock', icon: '🔒', desc: 'Lock and finalise receipt period entries', path: '/receipts/receipt-lock', color: '#a78bfa' },
];

export default function Receipts() {
  const navigate = useNavigate();
  return (
    <Layout title="Receipts" subtitle="Receipt management across all accounts">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Dashboard / Receipts
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Receipts</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 30 }}>
        Manage receipts for project, revenue, tax and other CSRC accounts.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
        {CARDS.map(c => <ReceiptCard key={c.label} card={c} onClick={() => navigate(c.path)} />)}
      </div>
    </Layout>
  );
}

function ReceiptCard({ card, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: 'rgba(30,41,59,0.75)', borderRadius: 18, padding: '24px 20px',
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
        width: 50, height: 50, borderRadius: 13, marginBottom: 14,
        background: `${card.color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 22,
        boxShadow: h ? `0 0 20px ${card.color}33` : 'none',
        transition: 'box-shadow 0.22s',
      }}>
        {card.icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{card.label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>{card.desc}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: card.color }}>Open →</div>
    </div>
  );
}