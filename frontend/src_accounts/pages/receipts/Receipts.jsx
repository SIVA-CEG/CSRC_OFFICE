import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';
import { getReceipts, calculateAccountWiseTotals } from './ReceiptReportService';


const CARDS = [
  {
    label: 'Project A/c',
    icon: '📁',
    desc: 'Project account receipt entries and records',
    path: '/accounts/receipts/project-account',
    color: '#06b6d4'
  },

  {
    label: 'MoPR A/c',
    icon: '🏛️',
    desc: 'Ministry of Panchayati Raj receipt management',
    path: '/accounts/receipts/mopr-account',
    color: '#8b5cf6'
  },

  {
    label: 'TTDF A/c',
    icon: '🔬',
    desc: 'TTDF account receipts and transactions',
    path: '/accounts/receipts/ttdf-account',
    color: '#f59e0b'
  },

  {
    label: 'Revenue A/c',
    icon: '💰',
    desc: 'Revenue account receipt tracking',
    path: '/accounts/receipts/revenue-account',
    color: '#10b981'
  },

  {
    label: 'Tax A/c',
    icon: '🧾',
    desc: 'Tax account receipts and deductions',
    path: '/accounts/receipts/tax-account',
    color: '#f43f5e'
  },

  {
    label: 'Receipt Lock',
    icon: '🔒',
    desc: 'Lock and finalise receipt period entries',
    path: '/accounts/receipts/receipt-lock',
    color: '#a78bfa'
  }
];

export default function Receipts() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const isDirector = role === 'director';
  return (
    <Layout title="Receipts" subtitle="Receipt management across all accounts">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
        Dashboard / Receipts
      </div>
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  flexWrap: 'wrap',
  gap: 16
}}>
  <div>
    <h2 style={{
      fontSize: 28,
      fontWeight: 800,
      color: 'var(--text-primary)',
      marginBottom: 8
    }}>
      Receipt Management
    </h2>

    <p style={{
      fontSize: 14,
      color: 'var(--text-secondary)'
    }}>
      Process bank statement entries into account receipts
    </p>
  </div>

  <div style={{
    padding: '10px 16px',
    borderRadius: 12,
    background: 'rgba(16,185,129,.12)',
    border: '1px solid rgba(16,185,129,.2)',
    color: '#10b981',
    fontWeight: 700
  }}>
    5 Account Types
  </div>
</div>
      {isDirector ? (
        <DirectorReceiptsReport />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
          {CARDS.map(c => <ReceiptCard key={c.label} card={c} onClick={() => navigate(c.path)} />)}
        </div>
      )}
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
        background: 'rgba(255, 255, 255, 0.75)', borderRadius: 18, padding: '24px 20px',
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

function DirectorReceiptsReport() {
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalAmount: 0,
    accounts: {},
  });

  useEffect(() => {
    const load = () => {
      setSummary(calculateAccountWiseTotals(getReceipts()));
    };
    load();
    window.addEventListener('receipt-created', load);
    return () => window.removeEventListener('receipt-created', load);
  }, []);

  const accountColors = {
    Project: '#06b6d4',
    Revenue: '#10b981',
    MOPR: '#8b5cf6',
    TTDF: '#f59e0b',
    Tax: '#f43f5e',
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
            Total Receipts: {summary.totalCount}
          </div>
        </div>
        <div style={{ fontSize: 30, fontWeight: 800 }}>
          ₹ {summary.totalAmount.toLocaleString('en-IN')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
        {Object.entries(summary.accounts).map(([acc, data]) => (
          <div key={acc} style={{
            background: 'rgba(255,255,255,0.85)', borderRadius: 16, padding: 20,
            borderLeft: `4px solid ${accountColors[acc] || '#64748b'}`,
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              {acc} A/c
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              ₹ {data.amount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {data.count} receipts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}