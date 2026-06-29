import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  getReceipts,
  getFinancialYear,
  getMonthName,
  getReceiptAmount,
} from './ReceiptReportService';

/* ── receipt heads (same data as ReceiptForm.jsx) ── */
const RECEIPT_HEADS = [
  'Project Receipt',
  'Consultancy Receipt',
  'Interest Receipt',
  'Grant Receipt',
  'Donation Receipt',
];

const MONTHS = ['April','May','June','July','August','Sept','Oct','Nov','Dec','Jan','Feb','March'];

// Full month names, used for matching against getMonthName() output
const MONTHS_FULL = ['April','May','June','July','August','September','October','November','December','January','February','March'];

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
  td: {
    padding: '11px 14px',
    borderBottom: '1px solid #f1f5f9',
    color: '#374151',
    verticalAlign: 'middle',
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

function buildFinancialYearOptions(receipts) {
  const years = new Set();

  receipts.forEach(r => {
    const fy = getFinancialYear(r.accountOn);
    if (fy) years.add(fy);
  });

  const currentFY = getFinancialYear(new Date().toISOString());
  if (currentFY) years.add(currentFY);

  return Array.from(years).sort().reverse();
}

export default function ReceiptAbstract() {
  const navigate = useNavigate();

  const [allReceipts, setAllReceipts] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedHead, setSelectedHead] = useState('');

  useEffect(() => {
    const data = getReceipts();
    setAllReceipts(data);

    const fyOptions = buildFinancialYearOptions(data);
    if (fyOptions.length > 0) {
      setSelectedYear(fyOptions[0]);
    }
  }, []);

  const yearOptions = useMemo(
    () => buildFinancialYearOptions(allReceipts),
    [allReceipts]
  );

  const receiptsForYear = useMemo(() => {
    if (!selectedYear) return [];

    return allReceipts.filter(
      r => getFinancialYear(r.accountOn) === selectedYear
    );
  }, [allReceipts, selectedYear]);

  // Row list: master RECEIPT_HEADS first, then any extra heads found in data
  const headRows = useMemo(() => {
    const headsInData = new Set(
      receiptsForYear.map(r => r.receiptHead).filter(Boolean)
    );

    const extras = Array.from(headsInData)
      .filter(h => !RECEIPT_HEADS.includes(h))
      .sort();

    return [...RECEIPT_HEADS, ...extras];
  }, [receiptsForYear]);

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

    receiptsForYear.forEach(r => {
      const head = r.receiptHead || 'Uncategorised';
      const month = getMonthName(r.accountOn);

      if (!result[head]) {
        result[head] = {};
        MONTHS_FULL.forEach(m => (result[head][m] = 0));
      }

      if (month && MONTHS_FULL.includes(month)) {
        result[head][month] += getReceiptAmount(r);
      }
    });

    return result;
  }, [receiptsForYear, headRows]);

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
    const tableEl = document.getElementById('abstract-table');
    if (!tableEl) return;

    const opt = {
      margin: 0.5,
      filename: `Receipt_Abstract_${selectedYear}.pdf`,
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
    <Layout title="Receipt Abstract" subtitle="TSA Reports / Receipts / Receipt Abstract">
      <div style={styles.page}>
        <div style={styles.topBar}>
          <div style={styles.left}>
            <button style={styles.backBtn} onClick={() => navigate('/accounts/receipts')}>
              ← Back
            </button>
            <div style={styles.breadcrumb}>CSRC / TSA Reports / Receipts / Receipt Abstract</div>
            <h1 style={styles.title}>Monthly Abstract – Receipts</h1>
          </div>

          <div style={styles.actions}>
            <select
              style={styles.filterSelect}
              value={selectedYear}
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
          <div id="abstract-table">
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
                      No receipt entries found for this selection.
                    </td>
                  </tr>
                ) : (
                  filteredHeadRows.map((head, i) => (
                    <tr key={head} style={i % 2 === 1 ? styles.evenRow : {}}>
                      <td style={styles.tdCode}>{head}</td>

                      {MONTHS_FULL.map((monthFull, idx) => (
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