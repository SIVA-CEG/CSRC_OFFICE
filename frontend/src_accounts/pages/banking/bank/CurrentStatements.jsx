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

  // Split modal state
  const [splitModal, setSplitModal] = useState(null);
  const [splitStep, setSplitStep] = useState('count'); // 'count' | 'amounts'
  const [splitCount, setSplitCount] = useState('');
  const [splitRows, setSplitRows] = useState([]);

  useEffect(() => {
    const data = JSON.parse(
  localStorage.getItem('current_bank_entries') || '[]'
);
    setEntries(data);
  }, []);

  const save = () => {
    const updated = entries.map(e => e.id === editForm.id ? { ...e, ...editForm } : e);
    setEntries(updated);
    localStorage.setItem(
  'current_bank_entries',
  JSON.stringify(updated)
);
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

  // ── Split helpers ──────────────────────────────────────────────
  const isCreditSplit = splitModal && splitModal.creditAmount > 0;
  const splitSourceAmount = splitModal
    ? (isCreditSplit ? splitModal.creditAmount : splitModal.debitAmount)
    : 0;

  const openSplit = (entry) => {
    setSplitModal(entry);
    setSplitStep('count');
    setSplitCount('');
    setSplitRows([]);
  };

const confirmCount = () => {
  const n = parseInt(splitCount, 10);
  if (!n || n < 2 || n > 100) return;
  setSplitRows(Array.from({ length: n }, (_, i) => ({ id: i, amount: '' })));
  setSplitStep('amounts');
};

  const updateSplitRow = (idx, val) => {
    setSplitRows(prev => prev.map((r, i) => i === idx ? { ...r, amount: val } : r));
  };

  const splitTotal = splitRows.reduce((a, r) => a + (parseFloat(r.amount) || 0), 0);
  const splitRemaining = parseFloat((splitSourceAmount - splitTotal).toFixed(2));
  const splitValid = Math.abs(splitRemaining) < 0.01 && splitRows.every(r => (parseFloat(r.amount) || 0) > 0);

  const applySplit = () => {
    if (!splitValid) return;

    // Find the entry's position in the full list
    const originalIdx = entries.findIndex(e => e.id === splitModal.id);
    const baseEntry = entries[originalIdx];

    // Build the running balance up to (but not including) this entry
    let balanceBefore = 0;
    for (let i = 0; i < originalIdx; i++) {
      balanceBefore += entries[i].creditAmount - entries[i].debitAmount;
    }

    // Build split entries
    const newEntries = splitRows.map((r, i) => ({
      ...baseEntry,
      id: `${baseEntry.id}_split_${i}_${Date.now()}`,
      bankDescription: baseEntry.bankDescription,
splitInfo: `${i + 1}/${splitRows.length}`,
      creditAmount: isCreditSplit ? parseFloat(r.amount) : 0,
      debitAmount: isCreditSplit ? 0 : parseFloat(r.amount),
    }));

    // Replace original entry with split entries
    const updated = [
      ...entries.slice(0, originalIdx),
      ...newEntries,
      ...entries.slice(originalIdx + 1),
    ];

    setEntries(updated);
    localStorage.setItem(
  'current_bank_entries',
  JSON.stringify(updated)
);
    setSplitModal(null);
  };

  // Compute running balance preview for split rows
  const splitPreviewRows = (() => {
    if (splitStep !== 'amounts' || !splitModal) return [];
    const originalIdx = entries.findIndex(e => e.id === splitModal.id);
    let bal = 0;
    for (let i = 0; i < originalIdx; i++) {
      bal += entries[i].creditAmount - entries[i].debitAmount;
    }
    return splitRows.map(r => {
      const amt = parseFloat(r.amount) || 0;
      if (isCreditSplit) bal += amt;
      else bal -= amt;
      return { ...r, runningBalance: bal };
    });
  })();

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
      <div style={s.deleteNote}>
        🔒 Entries can only be deleted from <strong>Original Statements</strong> — deleting there removes the matching entry and all of its split fragments here automatically.
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
              {['Sl.No','Cr. Date','Bank Details','Reference','Debit','Credit','Balance','Actions'].map(h => (
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
                    <div style={s.actionGroup}>
                      <button style={s.editBtn} onClick={() => openEdit(entry)}>Edit</button>
                      <button style={s.splitBtn} onClick={() => openSplit(entry)}>
                        <SplitIcon /> Split
                      </button>
                    </div>
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

      {/* ── Split Modal ─────────────────────────────────────────── */}
      {splitModal && (
        <div style={s.overlay} onClick={() => setSplitModal(null)}>
          <div style={{ ...s.modal, maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            {/* Purple accent for split */}
            <div style={{ ...s.modalAccent, background: 'linear-gradient(90deg,#8b5cf6,#6366f1,transparent)' }} />

            <div style={s.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={sp.splitIconWrap}><SplitIcon size={16} /></div>
                <div>
                  <div style={s.modalTitle}>Split Transaction</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {splitModal.bankDescription}
                  </div>
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setSplitModal(null)}>✕</button>
            </div>

            {/* Source amount pill */}
            <div style={sp.sourcePill}>
              <div style={sp.sourceLabel}>
                {isCreditSplit ? '💰 Credit Amount to Split' : '📤 Debit Amount to Split'}
              </div>
              <div style={{ ...sp.sourceAmount, color: isCreditSplit ? '#10b981' : '#f43f5e' }}>
                ₹ {formatINR(splitSourceAmount)}
              </div>
            </div>

            <div style={s.modalBody}>

              {/* Step 1 — count */}
              {splitStep === 'count' && (
                <div style={sp.stepWrap}>
                  <div style={sp.stepHeader}>
                    <div style={sp.stepBadge}>Step 1</div>
                    <span style={sp.stepTitle}>How many splits?</span>
                  </div>
                  <div style={sp.countRow}>
                    <input
                      type="number" min="2" max="100"
                      placeholder="Enter number (2–100)"
                      style={{ ...s.minput, flex: 1, fontSize: 15 }}
                      value={splitCount}
                      onChange={e => setSplitCount(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && confirmCount()}
                      autoFocus
                    />
                    <button
                      style={{ ...s.saveBtn, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 4px 16px rgba(139,92,246,0.35)', whiteSpace: 'nowrap' }}
                      onClick={confirmCount}
                    >
                      Continue →
                    </button>
                  </div>
                  {splitCount && (parseInt(splitCount) < 2 || parseInt(splitCount) > 100) && (
  <div style={sp.errNote}>
    ⚠ Please enter a number between 2 and 100.
  </div>
)}
                </div>
              )}

              {/* Step 2 — amounts */}
              {splitStep === 'amounts' && (
                <div>
                  <div style={sp.stepHeader}>
                    <div style={sp.stepBadge}>Step 2</div>
                    <span style={sp.stepTitle}>Enter split amounts</span>
                    <button style={sp.backBtn} onClick={() => setSplitStep('count')}>← Back</button>
                  </div>

                  {/* Progress bar */}
                  <div style={sp.progressTrack}>
                    <div style={{
                      ...sp.progressFill,
                      width: `${Math.min(100, (splitTotal / splitSourceAmount) * 100)}%`,
                      background: splitTotal > splitSourceAmount
                        ? 'linear-gradient(90deg,#f43f5e,#e11d48)'
                        : splitTotal === splitSourceAmount
                        ? 'linear-gradient(90deg,#10b981,#059669)'
                        : 'linear-gradient(90deg,#8b5cf6,#6366f1)',
                    }} />
                  </div>
                  <div style={sp.progressLabel}>
                    <span style={{ color: splitTotal > splitSourceAmount ? '#f43f5e' : 'var(--text-muted)' }}>
                      Allocated: ₹ {formatINR(splitTotal)}
                    </span>
                    <span style={{ color: splitRemaining < 0 ? '#f43f5e' : splitRemaining === 0 ? '#10b981' : 'var(--text-muted)' }}>
                      {splitRemaining < 0
                        ? `⚠ Exceeded by ₹ ${formatINR(Math.abs(splitRemaining))}`
                        : splitRemaining === 0
                        ? '✓ Fully allocated'
                        : `Remaining: ₹ ${formatINR(splitRemaining)}`}
                    </span>
                  </div>

                  {/* Split rows */}
                  <div style={sp.splitRowsWrap}>
                    {splitRows.map((row, i) => {
                      const amt = parseFloat(row.amount) || 0;
                      const prevBal = i > 0 ? splitPreviewRows[i - 1]?.runningBalance : (() => {
                        const origIdx = entries.findIndex(e => e.id === splitModal.id);
                        let b = 0;
                        for (let j = 0; j < origIdx; j++) b += entries[j].creditAmount - entries[j].debitAmount;
                        return b;
                      })();
                      const thisBal = splitPreviewRows[i]?.runningBalance;

                      return (
                        <div key={row.id} style={sp.splitRowCard}>
                          <div style={sp.splitRowLeft}>
                            <div style={sp.splitRowNum}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={sp.splitRowTypeTag}>
                                {isCreditSplit ? 'Credit' : 'Debit'}
                              </div>
                              <div style={{ position: 'relative', marginTop: 6 }}>
                                <span style={sp.rupeeSymbol}>₹</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  placeholder="0.00"
                                  style={{
                                    ...s.minput,
                                    paddingLeft: 28,
                                    borderColor: amt > splitSourceAmount ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)',
                                  }}
                                  value={row.amount}
                                  onChange={e => updateSplitRow(i, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Balance preview */}
                          {amt > 0 && thisBal !== undefined && (
                            <div style={sp.balPreview}>
                              <div style={sp.balPreviewLabel}>Balance after</div>
                              <div style={sp.balPreviewVal}>₹ {formatINR(thisBal)}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Over-limit warning */}
                  {splitTotal > splitSourceAmount && (
                    <div style={{ ...sp.errNote, marginBottom: 0 }}>
                      ⚠ Total split amount (₹ {formatINR(splitTotal)}) exceeds the source amount (₹ {formatINR(splitSourceAmount)}). Reduce one or more entries.
                    </div>
                  )}

                  {/* Preview table */}
                  {splitValid && (
                    <div style={sp.previewWrap}>
                      <div style={sp.previewTitle}>Preview — entries after split</div>
                      <table style={{ ...s.table, marginTop: 8 }}>
                        <thead>
                          <tr>
                            {['#', 'Description', isCreditSplit ? 'Credit' : 'Debit', 'Balance'].map(h => (
                              <th key={h} style={{ ...s.th, background: 'rgba(139,92,246,0.18)', fontSize: 11 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {splitPreviewRows.map((r, i) => (
                            <tr key={i}>
                              <td style={{ ...s.td, fontSize: 12 }}>{i + 1}</td>
                              <td style={{ ...s.td, fontSize: 12, maxWidth: 220, wordBreak: 'break-word' }}>
                                {splitModal.bankDescription} <span style={{ color: '#8b5cf6' }}>(Split {i + 1}/{splitRows.length})</span>
                              </td>
                              <td style={{ ...s.td, fontSize: 12, fontWeight: 700, textAlign: 'right', color: isCreditSplit ? '#10b981' : '#f43f5e' }}>
                                ₹ {formatINR(parseFloat(splitRows[i].amount))}
                              </td>
                              <td style={{ ...s.td, fontSize: 12, fontWeight: 700, textAlign: 'right', color: '#06b6d4' }}>
                                ₹ {formatINR(r.runningBalance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                    <button style={s.cancelBtn} onClick={() => setSplitModal(null)}>Cancel</button>
                    <button
                      disabled={!splitValid}
                      style={{
                        ...s.saveBtn,
                        background: splitValid
                          ? 'linear-gradient(135deg,#8b5cf6,#6366f1)'
                          : 'rgba(139,92,246,0.2)',
                        boxShadow: splitValid ? '0 4px 16px rgba(139,92,246,0.35)' : 'none',
                        opacity: splitValid ? 1 : 0.6,
                        cursor: splitValid ? 'pointer' : 'not-allowed',
                      }}
                      onClick={applySplit}
                    >
                      Apply Split
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ── Split icon ────────────────────────────────────────────────────
function SplitIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 8h4M10 4l4-4M10 12l4 4M14 0v4h-4M14 16v-4h-4M6 8c0 0 2-1 4-4M6 8c0 0 2 1 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
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
    background: 'rgba(255, 255, 255, 0.7)', padding: '14px 20px', borderRadius: 14,
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
    background: 'rgba(255, 255, 255, 0.75)', borderRadius: 16, overflow: 'hidden',
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
  actionGroup: { display: 'flex', gap: 6, alignItems: 'center' },
  editBtn: {
    padding: '5px 14px', borderRadius: 7, border: '1px solid rgba(245,158,11,0.4)',
    background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  splitBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 12px', borderRadius: 7,
    border: '1px solid rgba(139,92,246,0.45)',
    background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  summaryBar: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 200,
  },
  modal: {
    background: '#ffffff',
    backgroundImage: 'radial-gradient(ellipse at top left, rgba(139,92,246,0.08), transparent 60%), radial-gradient(ellipse at bottom right, rgba(99,102,241,0.06), transparent 60%)',
    borderRadius: 20, width: '90%', maxWidth: 520,
    border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
    maxHeight: '90vh', overflowY: 'auto',
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
    width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
    flexShrink: 0,
  },
  modalBody: { padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  minput: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 9, padding: '10px 13px', color: 'var(--text-primary)',
    fontSize: 14, fontFamily: 'Sora, sans-serif', outline: 'none', width: '100%',
    colorScheme: 'dark', boxSizing: 'border-box',
  },
  modalNote: {
    padding: '10px 14px', borderRadius: 10,
    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
    fontSize: 12, color: '#fbbf24',
  },
  cancelBtn: {
    padding: '10px 20px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
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

// Split-specific styles
const sp = {
  splitIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa',
    flexShrink: 0,
  },
  sourcePill: {
    margin: '0 24px 4px',
    padding: '14px 18px',
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  sourceLabel: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 },
  sourceAmount: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px' },

  stepWrap: { display: 'flex', flexDirection: 'column', gap: 14 },
  stepHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 },
  stepBadge: {
    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
    background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.3)', letterSpacing: '0.5px',
  },
  stepTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  backBtn: {
    marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#a78bfa',
    background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  countRow: { display: 'flex', gap: 10, alignItems: 'center' },
  errNote: {
    padding: '10px 14px', borderRadius: 9,
    background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
    fontSize: 12, color: '#f87171', marginBottom: 4,
  },

  progressTrack: {
    height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)',
    overflow: 'hidden', marginTop: 8,
  },
  progressFill: { height: '100%', borderRadius: 99, transition: 'width 0.3s ease, background 0.3s ease' },
  progressLabel: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 11, fontWeight: 600, marginTop: 6, marginBottom: 12,
  },

  splitRowsWrap: { display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto', paddingRight: 4 },
  splitRowCard: {
    display: 'flex', alignItems: 'flex-end', gap: 12,
    padding: '14px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
  },
  splitRowLeft: { display: 'flex', alignItems: 'flex-end', gap: 12, flex: 1 },
  splitRowNum: {
    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
    background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#a78bfa',
  },
  splitRowTypeTag: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.6px',
  },
  rupeeSymbol: {
    position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
    fontSize: 13, color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1,
  },
  balPreview: {
    textAlign: 'right', flexShrink: 0, minWidth: 100,
  },
  balPreviewLabel: { fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 },
  balPreviewVal: { fontSize: 13, fontWeight: 700, color: '#06b6d4' },

  previewWrap: {
    borderRadius: 12, overflow: 'hidden',
    border: '1px solid rgba(139,92,246,0.2)',
    background: 'rgba(139,92,246,0.04)',
  },
  previewTitle: {
    fontSize: 11, fontWeight: 700, color: '#a78bfa',
    textTransform: 'uppercase', letterSpacing: '0.6px',
    padding: '10px 14px', borderBottom: '1px solid rgba(139,92,246,0.15)',
  },
  editBadge: {
    padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.25)', alignSelf: 'flex-start',
  },
  deleteNote: {
    fontSize: 12, color: 'var(--text-muted)', marginBottom: 18,
    padding: '10px 14px', borderRadius: 10,
    background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)',
  },
};