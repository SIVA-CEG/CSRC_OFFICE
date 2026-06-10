import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = ['2023-2024','2024-2025','2025-2026','2026-2027'];
const ACCOUNTS = ['Revenue','Project','MOPR','TTDF','Tax'];

export default function CurrentStatements() {
  const [entries, setEntries] = useState([]);
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState('2025-2026');
  const [account, setAccount] = useState('Revenue');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('bank_entries') || '[]');
    setEntries(data);
  }, []);

  const save = () => {
    const updated = entries.map(e => e.id === editForm.id ? { ...e, ...editForm } : e);
    setEntries(updated);
    localStorage.setItem('bank_entries', JSON.stringify(updated));
    setEditModal(null);
  };

  const filtered = entries.filter(e => e.account === account);
  let balance = 0;
  const withBalance = filtered.map(e => {
    balance = balance + e.creditAmount - e.debitAmount;
    return { ...e, runningBalance: balance };
  });

  const formatINR = n => Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const openEdit = (entry) => {
    setEditForm({ ...entry });
    setEditModal(entry);
  };

  return (
    <Layout title="Current Statements" subtitle="Banking / Bank / Current Statements">
      <div style={s.breadcrumb}>Dashboard / Banking / Bank / Current Statements</div>

      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>Current Bank Statement</h2>
          <p style={s.pageSub}>Editable working copy — changes do not affect original statements</p>
        </div>
        <div style={s.editBadge}>✏️ Editable</div>
      </div>

      {/* Filters */}
      <div style={s.filterBar}>
        <span style={s.filterLabel}>Select the Month</span>
        <select style={s.select} value={month} onChange={e => setMonth(e.target.value)}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select style={s.select} value={year} onChange={e => setYear(e.target.value)}>
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
        <select style={s.select} value={account} onChange={e => setAccount(e.target.value)}>
          {ACCOUNTS.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Sl.No','Cr. Date','Bank Details','Reference','Debit','Credit','Balance','Action'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {withBalance.length === 0 ? (
              <tr>
                <td colSpan={8} style={s.empty}>
                  <div style={s.emptyInner}>
                    <span style={{ fontSize: 32 }}>📊</span>
                    <div>No entries found for {account} account</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Add entries via Bank New Entry
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              withBalance.map((entry, i) => (
                <tr key={entry.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={s.td}>{i + 1}</td>
                  <td style={s.td}>{entry.transactionDate}</td>
                  <td style={{ ...s.td, maxWidth: 260, wordBreak: 'break-word' }}>{entry.bankDescription}</td>
                  <td style={{ ...s.td, maxWidth: 200, wordBreak: 'break-word' }}>{entry.bankReference || '—'}</td>
                  <td style={{ ...s.td, color: '#f43f5e', fontWeight: 600, textAlign: 'right' }}>
                    {entry.debitAmount > 0 ? formatINR(entry.debitAmount) : ''}
                  </td>
                  <td style={{ ...s.td, color: '#10b981', fontWeight: 600, textAlign: 'right' }}>
                    {entry.creditAmount > 0 ? formatINR(entry.creditAmount) : ''}
                  </td>
                  <td style={{ ...s.td, color: '#06b6d4', fontWeight: 700, textAlign: 'right' }}>
                    {formatINR(entry.runningBalance)}
                  </td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                    <button style={s.editBtn} onClick={() => openEdit(entry)}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {withBalance.length > 0 && (
        <div style={s.summaryBar}>
          <SummaryChip label="Total Entries" val={withBalance.length} color="#06b6d4" />
          <SummaryChip label="Total Debit" val={`₹ ${formatINR(filtered.reduce((a,e)=>a+e.debitAmount,0))}`} color="#f43f5e" />
          <SummaryChip label="Total Credit" val={`₹ ${formatINR(filtered.reduce((a,e)=>a+e.creditAmount,0))}`} color="#10b981" />
          <SummaryChip label="Closing Balance" val={`₹ ${formatINR(withBalance[withBalance.length-1]?.runningBalance||0)}`} color="#f59e0b" />
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div style={s.overlay} onClick={() => setEditModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalAccent} />
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>Edit Transaction</div>
              <button style={s.closeBtn} onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div style={s.modalBody}>
              <MField label="Transaction Date">
                <input type="date" style={s.minput} value={editForm.transactionDate}
                  onChange={e => setEditForm(p => ({ ...p, transactionDate: e.target.value }))} />
              </MField>
              <MField label="Bank Description">
                <input type="text" style={s.minput} value={editForm.bankDescription}
                  onChange={e => setEditForm(p => ({ ...p, bankDescription: e.target.value }))} />
              </MField>
              <MField label="Bank Reference">
                <input type="text" style={s.minput} value={editForm.bankReference}
                  onChange={e => setEditForm(p => ({ ...p, bankReference: e.target.value }))} />
              </MField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <MField label="Debit Amount">
                  <input type="number" step="0.01" style={s.minput} value={editForm.debitAmount}
                    onChange={e => setEditForm(p => ({ ...p, debitAmount: parseFloat(e.target.value)||0 }))} />
                </MField>
                <MField label="Credit Amount">
                  <input type="number" step="0.01" style={s.minput} value={editForm.creditAmount}
                    onChange={e => setEditForm(p => ({ ...p, creditAmount: parseFloat(e.target.value)||0 }))} />
                </MField>
              </div>
              <div style={s.modalNote}>
                ✏️ Changes apply to current statements only. Original records remain unchanged.
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button style={s.cancelBtn} onClick={() => setEditModal(null)}>Cancel</button>
                <button style={s.saveBtn} onClick={save}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
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

function MField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</label>
      {children}
    </div>
  );
}

const s = {
  breadcrumb: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 4 },
  pageSub: { fontSize: 13, color: 'var(--text-secondary)' },
  editBadge: {
    padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.25)', alignSelf: 'flex-start',
  },
  filterBar: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22,
    background: 'rgba(30,41,59,0.7)', padding: '14px 20px', borderRadius: 14,
    border: '1px solid var(--border)', flexWrap: 'wrap',
  },
  filterLabel: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginRight: 4 },
  select: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer',
    colorScheme: 'dark',
  },
  tableWrap: {
    background: 'rgba(30,41,59,0.75)', borderRadius: 16, overflow: 'hidden',
    border: '1px solid var(--border)', marginBottom: 18,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff', padding: '13px 14px', fontSize: 12, fontWeight: 700,
    textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)',
    borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top',
  },
  empty: { padding: '60px 20px', textAlign: 'center' },
  emptyInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14 },
  editBtn: {
    padding: '5px 14px', borderRadius: 7, border: '1px solid rgba(245,158,11,0.4)',
    background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  summaryBar: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 200,
  },
  modal: {
    background: '#1e293b', borderRadius: 20, width: '90%', maxWidth: 520,
    border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
  },
  modalAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    background: 'linear-gradient(90deg,#f59e0b,#d97706,transparent)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '22px 24px 16px',
  },
  modalTitle: { fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' },
  closeBtn: {
    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
  },
  modalBody: { padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  minput: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9, padding: '10px 13px', color: 'var(--text-primary)',
    fontSize: 14, fontFamily: 'Sora, sans-serif', outline: 'none', width: '100%',
    colorScheme: 'dark',
  },
  modalNote: {
    padding: '10px 14px', borderRadius: 10,
    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
    fontSize: 12, color: '#fbbf24',
  },
  cancelBtn: {
    padding: '10px 20px', borderRadius: 9, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  saveBtn: {
    padding: '10px 24px', borderRadius: 9, border: 'none',
    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    color: '#fff', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
  },
};