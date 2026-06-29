import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAccountsBills, fmt } from './accountsStore';

const MONTHS = ['April','May','June','July','August','Sept','Oct','Nov','Dec','Jan','Feb','March'];

// Full month names — index-aligned with MONTHS above, used for matching
// against the month parsed out of voucher dates.
const MONTHS_FULL = ['April','May','June','July','August','September','October','November','December','January','February','March'];

const ACCOUNT_TYPES = [
  { value: '', label: 'All Accounts' },
  { value: 'revenue', label: 'Revenue A/c' },
  { value: 'project', label: 'Project A/c' },
  { value: 'mopr', label: 'MOPR A/c' },
  { value: 'ttdf', label: 'TTDF A/c' },
  { value: 'tax', label: 'Tax A/c' },
];

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '32px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  left: {},
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#10b981',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '0 0 10px 0',
  },
  title: { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 },
  breadcrumb: { fontSize: '13px', color: '#94a3b8' },
  actions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  filterSelect: {
    padding: '9px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    color: '#334155',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
  },
  downloadBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tableWrap: {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    background: '#1e7d55',
    color: '#fff',
    padding: '13px 14px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '12px',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },
  thCenter: {
    background: '#1e7d55',
    color: '#fff',
    padding: '13px 10px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  tdCode: {
    padding: '11px 14px',
    borderBottom: '1px solid #f1f5f9',
    color: '#0f172a',
    fontWeight: '700',
    verticalAlign: 'middle',
  },
  tdAmount: {
    padding: '11px 10px',
    borderBottom: '1px solid #f1f5f9',
    color: '#374151',
    textAlign: 'right',
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
    verticalAlign: 'middle',
  },
  tdTotal: {
    padding: '11px 10px',
    borderBottom: '1px solid #f1f5f9',
    color: '#10b981',
    fontWeight: '700',
    textAlign: 'right',
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
  },
  evenRow: { background: '#fafafa' },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
};

function formatAmount(value) {
  if (!value) return '.00';

  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// voucherDate comes from <input type="date"> -> "YYYY-MM-DD"
function getFinancialYear(voucherDate) {
  if (!voucherDate) return '';

  const [yearStr, monthStr] = voucherDate.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!year || !month) return '';

  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function getMonthFullName(voucherDate) {
  if (!voucherDate) return '';

  const month = Number(voucherDate.split('-')[1]);
  if (!month || month < 1 || month > 12) return '';

  // MONTHS_FULL is in financial-year order (April..March), so map
  // calendar month (1=Jan..12=Dec) to that array.
  const calendarToFull = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  return calendarToFull[month - 1];
}

function currentFinancialYear() {
  const now = new Date();
  return getFinancialYear(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  );
}

export default function PaymentAbstract() {
  const navigate = useNavigate();
  const bills = useAccountsBills();

  const vouchered = useMemo(
    () => bills.filter(b => b.voucher && b.voucher.voucherDate),
    [bills]
  );

  const yearOptions = useMemo(() => {
    const years = new Set();

    vouchered.forEach(b => {
      const fy = getFinancialYear(b.voucher.voucherDate);
      if (fy) years.add(fy);
    });

    const cfy = currentFinancialYear();
    if (cfy) years.add(cfy);

    return Array.from(years).sort().reverse();
  }, [vouchered]);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedHead, setSelectedHead] = useState('');

  const effectiveYear = selectedYear || yearOptions[0] || '';

  const scoped = useMemo(() => {
    return vouchered.filter(b => {
      const fy = getFinancialYear(b.voucher.voucherDate);
      if (effectiveYear && fy !== effectiveYear) return false;
      if (selectedAccount && b._accountType !== selectedAccount) return false;
      return true;
    });
  }, [vouchered, effectiveYear, selectedAccount]);

  // Row list: whichever expenditure heads actually exist in scope.
  const headRows = useMemo(() => {
    const heads = new Set(scoped.map(b => b.head).filter(Boolean));
    return Array.from(heads).sort();
  }, [scoped]);

  const filteredHeadRows = selectedHead
    ? headRows.filter(h => h === selectedHead)
    : headRows;

  // matrix[head][monthFull] = amount
  const matrix = useMemo(() => {
    const result = {};

    headRows.forEach(head => {
      result[head] = {};
      MONTHS_FULL.forEach(month => {
        result[head][month] = 0;
      });
    });

    scoped.forEach(b => {
      const head = b.head || 'Uncategorised';
      const month = getMonthFullName(b.voucher.voucherDate);

      if (!result[head]) {
        result[head] = {};
        MONTHS_FULL.forEach(m => (result[head][m] = 0));
      }

      if (month) {
        result[head][month] += Number(b.amount || 0);
      }
    });

    return result;
  }, [scoped, headRows]);

  const rowTotals = useMemo(() => {
    const totals = {};

    headRows.forEach(head => {
      totals[head] = MONTHS_FULL.reduce(
        (sum, month) => sum + (matrix[head]?.[month] || 0),
        0
      );
    });

    return totals;
  }, [matrix, headRows]);

  const handleDownload = () => {
    const tableEl = document.getElementById('payment-abstract-table');
    if (!tableEl) return;

    const opt = {
      margin: 0.5,
      filename: `Payment_Abstract_${effectiveYear || 'all'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' },
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(tableEl).save();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      window.html2pdf().set(opt).from(tableEl).save();
    };
    document.head.appendChild(script);
  };

  return (
    <Layout title="Payment Abstract" subtitle="Accounts / Payments / Payment Abstract">
      <div style={styles.page}>
        <div style={styles.topBar}>
          <div style={styles.left}>
            <button style={styles.backBtn} onClick={() => navigate('/accounts/payments')}>
              ← Back
            </button>
            <div style={styles.breadcrumb}>CSRC / Accounts / Payments / Payment Abstract</div>
            <h1 style={styles.title}>Monthly Abstract – Payments</h1>
          </div>

          <div style={styles.actions}>
            <select
              style={styles.filterSelect}
              value={effectiveYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              {yearOptions.length === 0 && (
                <option value="">No data available</option>
              )}

              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              style={styles.filterSelect}
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
            >
              {ACCOUNT_TYPES.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>

            <select
              style={styles.filterSelect}
              value={selectedHead}
              onChange={e => setSelectedHead(e.target.value)}
            >
              <option value="">All Heads</option>
              {headRows.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <button style={styles.downloadBtn} onClick={handleDownload}>
              ⬇ Download PDF
            </button>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <div id="payment-abstract-table">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Head of Accounts</th>
                  {MONTHS.map(m => (
                    <th key={m} style={styles.thCenter}>{m}</th>
                  ))}
                  <th style={{ ...styles.thCenter, background: '#155e3d' }}>Total</th>
                </tr>
              </thead>

              <tbody>
                {filteredHeadRows.length === 0 ? (
                  <tr>
                    <td colSpan={MONTHS.length + 2} style={styles.emptyState}>
                      No vouchered payments found for this selection.
                    </td>
                  </tr>
                ) : (
                  filteredHeadRows.map((head, i) => (
                    <tr key={head} style={i % 2 === 1 ? styles.evenRow : {}}>
                      <td style={styles.tdCode}>{head}</td>

                      {MONTHS_FULL.map(monthFull => (
                        <td key={monthFull} style={styles.tdAmount}>
                          {formatAmount(matrix[head]?.[monthFull])}
                        </td>
                      ))}

                      <td style={styles.tdTotal}>
                        {formatAmount(rowTotals[head])}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}