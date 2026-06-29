import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const MASTER_SCHEMES = [
  { schemeCode: '4211', schemeName: 'Advanced Research Grant (ARG) Program' },
  { schemeCode: '0150', schemeName: 'BIOTECH RESEARCH AND DEVELOPMENT' },
  { schemeCode: '4306', schemeName: 'Biotechnology Research Innovation and Entrepreneurship Development (Bio-Ride)' },
  { schemeCode: '1827', schemeName: 'Capacity Building and Human Resources Development' },
  { schemeCode: '4197', schemeName: 'Capacity Building and Skill Development Scheme' },
  { schemeCode: '3989', schemeName: 'CONSERVATION DEVELOPMENT AND SUSTAINABLE MANAGEMENT OF MEDICINAL PLANTS' },
  { schemeCode: '1023', schemeName: 'Core Research Grant (erstwhile SERB Scheme)' },
  { schemeCode: '0538', schemeName: 'Cyber Security Projects (NCCC & Others)' },
  { schemeCode: '1819', schemeName: 'Innovation, Technology, Development and Deployment' },
  { schemeCode: '3655', schemeName: 'O-SMART' },
  { schemeCode: '4308', schemeName: 'Prithvi Vighyan (Prithvi)' },
  { schemeCode: '3943', schemeName: 'PUBLIC HEALTH ENGINEERING (PHE) SECTOR DEPARTMENT' },
  { schemeCode: '2354', schemeName: 'R and D in IT/Electronics/CCBT' },
  { schemeCode: '3237', schemeName: 'Research & Development' },
  { schemeCode: '1166', schemeName: 'Research & Development Programme in Water Sector' },
  { schemeCode: '1166A', schemeName: 'Research and Development and Implementation of National Water Mission' },
  { schemeCode: '1817', schemeName: 'S & T Institutional And Human Capacity Building' },
  { schemeCode: '3668', schemeName: 'Scheme for Transformation and Advanced Research in Sciences' },
  { schemeCode: '2792', schemeName: 'Space Science Promotion' },
  { schemeCode: '3614', schemeName: 'SPARC' },
  { schemeCode: '4305', schemeName: 'Vigyan Dhara' },
];

const FINANCIAL_YEARS = ['2023-24', '2024-25', '2025-26'];

const styles = {
  page: {
    minHeight: '100vh', background: '#f8fafc', padding: '32px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#f59e0b', fontWeight: '600', cursor: 'pointer',
    background: 'none', border: 'none', padding: '0 0 10px 0',
  },
  topBar: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
  },
  title: { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 },
  breadcrumb: { fontSize: '13px', color: '#94a3b8', marginBottom: '4px' },
  actions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  filterSelect: {
    padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '14px', color: '#334155', background: '#fff', cursor: 'pointer',
    outline: 'none', fontFamily: 'inherit',
  },
  filterInput: {
    padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '14px', color: '#334155', background: '#fff',
    outline: 'none', fontFamily: 'inherit', width: '180px',
  },
  downloadBtn: {
    padding: '10px 20px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer',
  },
  ledgerWrap: {
    background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
    overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
  },
  ledgerHeader: {
    padding: '24px', textAlign: 'center',
    borderBottom: '2px solid #e2e8f0',
  },
  instName: {
    fontSize: '16px', fontWeight: '800', color: '#0f172a',
    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px',
    textDecoration: 'underline',
  },
  fileLine: {
    fontSize: '13px', color: '#374151', fontWeight: '600',
  },
  ledgerBody: { display: 'flex', minHeight: '300px' },
  receiptCol: {
    flex: 1, borderRight: '2px solid #e2e8f0', padding: '0',
  },
  paymentCol: { flex: 2, padding: '0' },
  colHeader: {
    padding: '12px 16px', background: '#f8fafc',
    fontWeight: '800', color: '#0f172a', fontSize: '13px',
    borderBottom: '1px solid #e2e8f0', textAlign: 'center',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    padding: '10px 12px', background: '#f1f5f9',
    color: '#374151', fontWeight: '700', fontSize: '11px',
    borderBottom: '1px solid #e2e8f0', textAlign: 'left',
  },
  td: {
    padding: '10px 12px', borderBottom: '1px solid #f8fafc',
    color: '#374151', fontSize: '13px',
  },
  tdAmt: {
    padding: '10px 12px', borderBottom: '1px solid #f8fafc',
    color: '#374151', fontSize: '13px', textAlign: 'right',
    fontFamily: 'monospace',
  },
  emptyLedger: {
    padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px',
  },
};

export default function PaymentsCompilation() {
  const navigate = useNavigate();
  const [selectedScheme, setSelectedScheme] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [fileNo, setFileNo] = useState('');
  const [mhNo, setMhNo] = useState('');
  const [titleFilter, setTitleFilter] = useState('');

  const allSchemes = useMemo(() => {
    try {
      const saved = localStorage.getItem('tsa_schemes_extra');
      const extra = saved ? JSON.parse(saved) : [];
      return [...MASTER_SCHEMES, ...extra];
    } catch { return MASTER_SCHEMES; }
  }, []);

  const hasFilter = fileNo || mhNo || titleFilter || selectedScheme;

  const handleDownload = () => {
    const el = document.getElementById('pay-compilation');
    if (!el) return;
    const go = () => {
      window.html2pdf().set({
        margin: 0.5, filename: `Payments_Compilation_${selectedYear}.pdf`,
        image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      }).from(el).save();
    };
    if (window.html2pdf) { go(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.onload = go; document.head.appendChild(s);
  };

  const selectedSchemeName = selectedScheme
    ? allSchemes.find(s => s.schemeCode === selectedScheme)?.schemeName || ''
    : '';

  return (
    <Layout title="Compilation" subtitle="TSA Reports / Payments / Compilation">
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/accounts/tsa-reports/payments')}>← Back</button>
      <div style={styles.topBar}>
        <div>
          <div style={styles.breadcrumb}>CSRC / TSA Reports / Payments / Compilation</div>
          <h1 style={styles.title}>Payments Compilation</h1>
        </div>
        <div style={styles.actions}>
          <select style={styles.filterSelect} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {FINANCIAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select style={styles.filterSelect} value={selectedScheme} onChange={e => setSelectedScheme(e.target.value)}>
            <option value="">All Schemes</option>
            {allSchemes.map(s => (
              <option key={s.schemeCode} value={s.schemeCode}>
                {s.schemeCode} – {s.schemeName.slice(0, 35)}
              </option>
            ))}
          </select>
          <input
            style={styles.filterInput} placeholder="File No."
            value={fileNo} onChange={e => setFileNo(e.target.value)}
          />
          <input
            style={styles.filterInput} placeholder="M.H. No."
            value={mhNo} onChange={e => setMhNo(e.target.value)}
          />
          <input
            style={styles.filterInput} placeholder="Title"
            value={titleFilter} onChange={e => setTitleFilter(e.target.value)}
          />
          <button style={styles.downloadBtn} onClick={handleDownload}>⬇ PDF</button>
        </div>
      </div>

      <div style={styles.ledgerWrap}>
        <div id="pay-compilation">
          <div style={styles.ledgerHeader}>
            <div style={styles.instName}>Centre for Sponsored Research and Consultancy</div>
            <div style={styles.fileLine}>
              File No.: {fileNo || '—'} &nbsp;|&nbsp; M.H. No.: {mhNo || '—'} &nbsp;|&nbsp;
              Title: {titleFilter || selectedSchemeName || ':'}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ ...styles.colHeader, flex: 1, borderRight: '2px solid #e2e8f0' }}>Receipts</div>
            <div style={{ ...styles.colHeader, flex: 2 }}>Payments</div>
          </div>
          {hasFilter ? (
            <div style={styles.ledgerBody}>
              <div style={styles.receiptCol}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Allocated</th>
                      <th style={styles.th}>Assigned</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.td}>—</td>
                      <td style={styles.td}>—</td>
                      <td style={styles.tdAmt}>0.00</td>
                    </tr>
                    <tr style={{ fontWeight: '700', background: '#f8fafc' }}>
                      <td colSpan={2} style={{ ...styles.td, fontWeight: '700' }}>Total</td>
                      <td style={styles.tdAmt}>0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={styles.paymentCol}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Head</th>
                      <th style={styles.th}>Vou. Date</th>
                      <th style={styles.th}>Vou. No.</th>
                      <th style={styles.th}>Beneficiary</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Prog. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                        No payment records for selected filters.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={styles.emptyLedger}>
              Apply filters above (Scheme, File No., M.H. No., or Title) to view compilation data.
            </div>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
}