import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';

const CARDS = [
  { label: 'New Entry', icon: '✚', desc: 'Add new bank transaction entries', path: '/accounts/banking/bank/new-entry', color: '#10b981' },
  { label: 'Original Statements', icon: '📄', desc: 'View and manage original bank statements', path: '/accounts/banking/bank/original-statements', color: '#06b6d4' },
  { label: 'Current Statements', icon: '📊', desc: 'Current period bank statement records', path: '/accounts/banking/bank/current-statements', color: '#f59e0b' },
];

const ACCOUNTS = ['Revenue', 'Project', 'MOPR', 'TTDF', 'Tax'];

export default function Bank() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole') || 'assistant';

  if (role === 'director') {
    return <DirectorBankReport />;
  }

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

function DirectorBankReport() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('current_bank_entries') || '[]');
    setEntries(data);
  }, []);

  const formatINR = n => Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const perAccount = ACCOUNTS.map(acc => {
    const rows = entries.filter(e => e.account === acc);
    const debit = rows.reduce((a, e) => a + e.debitAmount, 0);
    const credit = rows.reduce((a, e) => a + e.creditAmount, 0);
    return { account: acc, count: rows.length, debit, credit, balance: credit - debit };
  });

  const grand = perAccount.reduce(
    (a, r) => ({
      count: a.count + r.count,
      debit: a.debit + r.debit,
      credit: a.credit + r.credit,
      balance: a.balance + r.balance,
    }),
    { count: 0, debit: 0, credit: 0, balance: 0 }
  );

  return (
    <Layout title="Bank — Collective Report" subtitle="Banking / Bank (Director View)">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Dashboard / Banking / Bank</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Collective Bank Report</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 26 }}>
        Aggregated view across all account types. Individual entry management is handled by the Accounts Office.
      </p>

      {/* Grand total summary */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <SummaryChip label="Total Entries" val={grand.count} color="#06b6d4" />
        <SummaryChip label="Total Debit" val={`₹ ${formatINR(grand.debit)}`} color="#f43f5e" />
        <SummaryChip label="Total Credit" val={`₹ ${formatINR(grand.credit)}`} color="#10b981" />
        <SummaryChip label="Net Position" val={`₹ ${formatINR(grand.balance)}`} color="#f59e0b" />
      </div>

      {/* Per-account breakdown */}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Account', 'Entries', 'Total Debit', 'Total Credit', 'Net Balance'].map(h => (
                <th key={h} style={{
                  background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: '#fff',
                  padding: '13px 16px', fontSize: 12, fontWeight: 700, textAlign: 'left',
                  textTransform: 'uppercase', letterSpacing: '0.6px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perAccount.map((r, i) => (
              <tr key={r.account} style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.015)' : 'transparent' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.account}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{r.count}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#f43f5e', fontWeight: 600, textAlign: 'right' }}>₹ {formatINR(r.debit)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#10b981', fontWeight: 600, textAlign: 'right' }}>₹ {formatINR(r.credit)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#06b6d4', fontWeight: 700, textAlign: 'right' }}>₹ {formatINR(r.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(37,99,235,0.06)' }}>
              <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700 }}>Grand Total</td>
              <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700 }}>{grand.count}</td>
              <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#f43f5e', textAlign: 'right' }}>₹ {formatINR(grand.debit)}</td>
              <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#10b981', textAlign: 'right' }}>₹ {formatINR(grand.credit)}</td>
              <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#06b6d4', textAlign: 'right' }}>₹ {formatINR(grand.balance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Layout>
  );
}

function SummaryChip({ label, val, color }) {
  return (
    <div style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 12, padding: '12px 20px' }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
    </div>
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
        background: 'rgb(255, 255, 255)', borderRadius: 18, padding: '24px 20px',
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