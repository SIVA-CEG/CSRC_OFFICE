import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const CARDS = [
  {
    label: 'Bank',
    icon: '🏦',
    description: 'New entries, original & current bank statements',
    path: '/accounts/banking/bank',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.22)',
    sub: ['New Entry', 'Original Statements', 'Current Statements'],
  },
  {
    label: 'Fund Transfer',
    icon: '⇄',
    description: 'Transfer between revenue, project & other accounts',
    path: '/accounts/banking/fund-transfer',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.22)',
    sub: ['Revenue', 'Project', 'MOPR', 'TTDF', 'Consultancy', 'TEC', 'TAX'],
  },
];

export default function Banking() {
  const navigate = useNavigate();
  return (
    <Layout title="Banking" subtitle="Bank accounts and fund transfer operations">
      <div style={styles.breadcrumb}>Dashboard / Banking</div>
      <h2 style={styles.heading}>Banking Module</h2>
      <p style={styles.sub}>Manage bank entries, statements and inter-account fund transfers.</p>
      <div style={styles.grid}>
        {CARDS.map(card => <BankCard key={card.label} card={card} onClick={() => navigate(card.path)} />)}
      </div>
    </Layout>
  );
}

function BankCard({ card, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      style={{
        ...styles.card,
        boxShadow: h ? `0 20px 60px ${card.glow}, 0 0 0 1px ${card.color}33` : '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px var(--border)',
        transform: h ? 'translateY(-4px)' : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div style={{ ...styles.accent, background: `linear-gradient(90deg,${card.color},transparent)` }} />
      <div style={{ ...styles.iconBox, background: `${card.color}18` }}>
        <span style={{ fontSize: 30 }}>{card.icon}</span>
      </div>
      <div style={styles.label}>{card.label}</div>
      <div style={styles.desc}>{card.description}</div>
      <div style={styles.pills}>
        {card.sub.map(s => (
          <span key={s} style={{ ...styles.pill, background: `${card.color}15`, color: card.color }}>{s}</span>
        ))}
      </div>
      <div style={{ ...styles.link, color: card.color }}>Open →</div>
    </div>
  );
}

const styles = {
  breadcrumb: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 },
  heading: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 },
  sub: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 22 },
  card: {
    background: 'rgba(30,41,59,0.75)', backdropFilter: 'blur(16px)',
    borderRadius: 20, padding: '28px 24px', cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(.4,0,.2,1)', position: 'relative', overflow: 'hidden',
  },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  iconBox: {
    width: 58, height: 58, borderRadius: 15, display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  label: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  desc: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 },
  pills: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  pill: { fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20 },
  link: { fontSize: 13, fontWeight: 600 },
};