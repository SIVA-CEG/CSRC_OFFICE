import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';

const YEARS = ['2023-2024','2024-2025','2025-2026','2026-2027'];

export default function RevenueAccount() {
  return <FundTransferPage accountName="Revenue Account" storageKey="ft_revenue" color="#06b6d4" />;
}

export function FundTransferPage({ accountName, storageKey, color }) {
  const [transfers, setTransfers] = useState([]);
  const [year, setYear] = useState('2026-2027');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ transactionDate: '', beneficiaries: 1, transferType: 'NEFT TRANSFER' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTransfers(JSON.parse(localStorage.getItem(storageKey) || '[]'));
  }, [storageKey]);

  const validate = () => {
    const e = {};
    if (!form.transactionDate) e.transactionDate = 'Required';
    if (!form.beneficiaries || form.beneficiaries < 0) e.beneficiaries = 'Required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    const newT = {
      id: Date.now(),
      trnsId: Math.floor(Math.random() * 90) + 10,
      transactionDate: form.transactionDate,
      transferType: form.transferType,
      beneficiaries: parseInt(form.beneficiaries),
      amount: parseFloat((Math.random() * 25000 + 500).toFixed(2)), // placeholder
      year,
      timestamp: new Date().toISOString(),
    };
    const updated = [newT, ...transfers];
    setTransfers(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setTimeout(() => {
      setSubmitting(false);
      setShowForm(false);
      setForm({ transactionDate: '', beneficiaries: 1, transferType: 'NEFT TRANSFER' });
    }, 500);
  };

  const glow = color + '28';

  return (
    <Layout title={accountName} subtitle={`Banking / Fund Transfer / ${accountName}`}>
      <div style={s.breadcrumb}>Dashboard / Banking / Fund Transfer / {accountName}</div>

      {/* Header row */}
      <div style={s.pageHeader}>
        <div>
          <div style={s.eyebrow}>Fund Transfer</div>
          <h2 style={s.pageTitle}>{accountName}</h2>
          <div style={s.subLine}>
            <span style={s.yearTag}>
              {accountName} — List of Bank Transfers for the year
            </span>
            <select style={{ ...s.select, borderColor: color + '44' }} value={year} onChange={e => setYear(e.target.value)}>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button
          style={{ ...s.newBtn, background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 18px ${glow}` }}
          onClick={() => setShowForm(true)}
          onMouseEnter={e => e.target.style.opacity = '0.88'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          + New Transfer
        </button>
      </div>

      {/* New Transfer Form */}
      {showForm && (
        <div style={{ ...s.formCard, borderColor: color + '40', boxShadow: `0 8px 40px ${glow}` }}>
          <div style={{ ...s.formAccent, background: `linear-gradient(90deg,${color},transparent)` }} />
          <div style={s.formTitle}>
            <span style={{ ...s.formTitleIcon, background: color + '20', color }}>✚</span>
            New Bank Transfer — {accountName}
          </div>
          <div style={s.formGrid}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={s.label}>Transaction Date <span style={{ color: '#f43f5e' }}>*</span></label>
              <input
                type="date"
                style={{ ...s.input, ...(errors.transactionDate ? { borderColor: '#f43f5e' } : {}), colorScheme: 'dark' }}
                value={form.transactionDate}
                onChange={e => { setForm(p => ({ ...p, transactionDate: e.target.value })); setErrors(p => ({ ...p, transactionDate: '' })); }}
                onFocus={e => e.target.style.borderColor = color}
                onBlur={e => e.target.style.borderColor = errors.transactionDate ? '#f43f5e' : 'rgba(255,255,255,0.1)'}
              />
              {errors.transactionDate && <span style={s.errMsg}>{errors.transactionDate}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={s.label}>Transfer Type</label>
              <select
                style={{ ...s.input, colorScheme: 'dark' }}
                value={form.transferType}
                onChange={e => setForm(p => ({ ...p, transferType: e.target.value }))}
                onFocus={e => e.target.style.borderColor = color}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                <option>NEFT TRANSFER</option>
                <option>INTRA BANK TRANSFER</option>
                <option>RTGS TRANSFER</option>
                <option>IMPS TRANSFER</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={s.label}>No. of Beneficiaries <span style={{ color: '#f43f5e' }}>*</span></label>
              <input
                type="number"
                min="0"
                style={{ ...s.input, ...(errors.beneficiaries ? { borderColor: '#f43f5e' } : {}) }}
                value={form.beneficiaries}
                onChange={e => { setForm(p => ({ ...p, beneficiaries: e.target.value })); setErrors(p => ({ ...p, beneficiaries: '' })); }}
                onFocus={e => e.target.style.borderColor = color}
                onBlur={e => e.target.style.borderColor = errors.beneficiaries ? '#f43f5e' : 'rgba(255,255,255,0.1)'}
              />
              {errors.beneficiaries && <span style={s.errMsg}>{errors.beneficiaries}</span>}
            </div>
          </div>

          <div style={s.formActions}>
            <button style={s.cancelBtn} onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</button>
            <button
              style={{ ...s.submitBtn, background: `linear-gradient(135deg,${color},${color}cc)`, boxShadow: `0 4px 16px ${glow}`, opacity: submitting ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Transfer →'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Sl. No.','Trns. Date','Trns. ID','Trns. Type','No. of Bnfs','Amount','Action'].map(h => (
                <th key={h} style={{ ...s.th, background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transfers.filter(t => t.year === year).length === 0 ? (
              <tr>
                <td colSpan={7} style={s.empty}>
                  <div style={s.emptyInner}>
                    <span style={{ fontSize: 32 }}>⇄</span>
                    <div>No transfers for {year}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Click "New Transfer" to add one</div>
                  </div>
                </td>
              </tr>
            ) : (
              transfers.filter(t => t.year === year).map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={s.td}>{i + 1}</td>
                  <td style={s.td}>{t.transactionDate}</td>
                  <td style={{ ...s.td, fontWeight: 700, color }}>{t.trnsId}</td>
                  <td style={s.td}>
                    <span style={{ ...s.typeBadge, background: color + '15', color }}>
                      {t.transferType}
                    </span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{t.beneficiaries}</td>
                  <td style={{ ...s.td, fontWeight: 700, color: '#10b981', textAlign: 'right' }}>
                    {t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                    <ActionRow color={color} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {transfers.filter(t => t.year === year).length > 0 && (
        <div style={s.summaryBar}>
          <SummaryChip label="Transfers" val={transfers.filter(t => t.year === year).length} color={color} />
          <SummaryChip
            label="Total Amount"
            val={`₹ ${transfers.filter(t=>t.year===year).reduce((a,t)=>a+t.amount,0).toLocaleString('en-IN',{minimumFractionDigits:2})}`}
            color="#10b981"
          />
          <SummaryChip
            label="Total Beneficiaries"
            val={transfers.filter(t=>t.year===year).reduce((a,t)=>a+t.beneficiaries,0)}
            color="#f59e0b"
          />
        </div>
      )}
    </Layout>
  );
}

function ActionRow({ color }) {
  const [hEdit, setHEdit] = useState(false);
  const [hLock, setHLock] = useState(false);
  const [hPrint, setHPrint] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button style={{ ...actionBtn(color, hEdit) }} onMouseEnter={() => setHEdit(true)} onMouseLeave={() => setHEdit(false)}>Edit</button>
      <button style={{ ...actionBtn('#f43f5e', hLock) }} onMouseEnter={() => setHLock(true)} onMouseLeave={() => setHLock(false)}>Lock</button>
      <button style={{ ...actionBtn('#10b981', hPrint) }} onMouseEnter={() => setHPrint(true)} onMouseLeave={() => setHPrint(false)}>Print</button>
    </div>
  );
}

const actionBtn = (color, hovered) => ({
  padding: '4px 11px', borderRadius: 6, fontSize: 11, fontWeight: 600,
  border: `1px solid ${color}44`, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  background: hovered ? color + '25' : color + '12', color,
  transition: 'all 0.15s',
});

function SummaryChip({ label, val, color }) {
  return (
    <div style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 12, padding: '12px 20px' }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
    </div>
  );
}

const s = {
  breadcrumb: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  eyebrow: { fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 10 },
  subLine: { display: 'flex', alignItems: 'center', gap: 10 },
  yearTag: { fontSize: 13, fontWeight: 600, color: '#06b6d4' },
  select: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '7px 12px', color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer',
    colorScheme: 'dark',
  },
  newBtn: {
    padding: '11px 22px', borderRadius: 11, border: 'none', color: '#fff',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    transition: 'opacity 0.15s', alignSelf: 'flex-start', whiteSpace: 'nowrap',
  },
  formCard: {
    background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(16px)',
    borderRadius: 18, padding: '28px 28px 24px', marginBottom: 24,
    border: '1px solid', position: 'relative', overflow: 'hidden',
  },
  formAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  formTitle: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 22,
  },
  formTitleIcon: {
    width: 28, height: 28, borderRadius: 7, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 13,
  },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '18px 22px', marginBottom: 22 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9, padding: '10px 13px', color: 'var(--text-primary)',
    fontSize: 14, fontFamily: 'Sora, sans-serif', outline: 'none',
    transition: 'border-color 0.2s', width: '100%',
  },
  errMsg: { fontSize: 11, color: '#f43f5e', marginTop: -3 },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: {
    padding: '10px 20px', borderRadius: 9, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  submitBtn: {
    padding: '10px 24px', borderRadius: 9, border: 'none', color: '#fff',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    transition: 'all 0.2s',
  },
  tableWrap: {
    background: 'rgba(30,41,59,0.75)', borderRadius: 16, overflow: 'hidden',
    border: '1px solid var(--border)', marginBottom: 18,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    color: '#fff', padding: '13px 14px', fontSize: 12, fontWeight: 700,
    textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)',
    borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle',
  },
  empty: { padding: '60px 20px', textAlign: 'center' },
  emptyInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14 },
  typeBadge: {
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    display: 'inline-block',
  },
  summaryBar: { display: 'flex', gap: 12, flexWrap: 'wrap' },
};