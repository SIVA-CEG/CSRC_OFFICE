import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';

const CARDS = [
  { label: 'New Entry', icon: '✚', desc: 'Add new bank transaction entries', path: '/accounts/banking/bank/new-entry', color: '#10b981' },
  { label: 'Original Statements', icon: '📄', desc: 'View and manage original bank statements', path: '/accounts/banking/bank/original-statements', color: '#06b6d4' },
  { label: 'Current Statements', icon: '📊', desc: 'Current period bank statement records', path: '/accounts/banking/bank/current-statements', color: '#f59e0b' },
];

export default function Bank() {
  const navigate = useNavigate();
  return (
    <Layout title="Bank" subtitle="Banking / Bank">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Dashboard / Banking / Bank</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Bank</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 30 }}>Manage entries and bank statements.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
        {CARDS.map(c => <SimpleCard key={c.label} card={c} onClick={() => navigate(c.path)} />)}
      </div>
    </Layout>
  );
}

function SimpleCard({ card, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: 'rgba(30,41,59,0.75)', borderRadius: 18, padding: '24px 20px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transition: 'all 0.2s', transform: h ? 'translateY(-3px)' : 'none',
        boxShadow: h ? `0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px ${card.color}44` : '0 6px 24px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${card.color},transparent)` }} />
      <div style={{ fontSize: 28, marginBottom: 12, color: card.color }}>{card.icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{card.label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>{card.desc}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: card.color }}>Open →</div>
    </div>
  );
}