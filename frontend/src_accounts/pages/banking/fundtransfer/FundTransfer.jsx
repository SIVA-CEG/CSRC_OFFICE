import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';

const CARDS = [
  { label: 'Revenue Account', icon: '💰', desc: 'Manage revenue account fund transfers', path: '/banking/fund-transfer/revenue-account', color: '#06b6d4' },
  { label: 'Project Account', icon: '📁', desc: 'Project-wise fund transfer operations', path: '/banking/fund-transfer/project-account', color: '#10b981' },
  { label: 'MOPR Account', icon: '🏛️', desc: 'MOPR account transfers and records', path: '/banking/fund-transfer/mopr-account', color: '#8b5cf6' },
  { label: 'TTDF Account', icon: '🔬', desc: 'TTDF fund transfer management', path: '/banking/fund-transfer/ttdf-account', color: '#f59e0b' },
  { label: 'Consultancy Account', icon: '💼', desc: 'Consultancy account fund transfers', path: '/banking/fund-transfer/consultancy-account', color: '#f43f5e' },
  { label: 'TEC Account', icon: '⚙️', desc: 'TEC account transfers and entries', path: '/banking/fund-transfer/tec-account', color: '#0ea5e9' },
  { label: 'TAX Account', icon: '🧾', desc: 'Tax account fund transfer records', path: '/banking/fund-transfer/tax-account', color: '#a78bfa' },
];

export default function FundTransfer() {
  const navigate = useNavigate();
  return (
    <Layout title="Fund Transfer" subtitle="Banking / Fund Transfer">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Dashboard / Banking / Fund Transfer
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Fund Transfer</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 30 }}>
        Transfer funds between revenue, project, and other CSRC accounts.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
        {CARDS.map(c => <FTCard key={c.label} card={c} onClick={() => navigate(c.path)} />)}
      </div>
    </Layout>
  );
}

function FTCard({ card, onClick }) {
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