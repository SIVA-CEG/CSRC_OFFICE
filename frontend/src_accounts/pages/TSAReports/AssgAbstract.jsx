import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

/* ── shared schemes master (same data as master/Schemes.jsx) ── */
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

const MONTHS = ['April','May','June','July','August','Sept','Oct','Nov','Dec','Jan','Feb','March'];

const FINANCIAL_YEARS = ['2023-24','2024-25','2025-26'];

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
};

export default function AssgAbstract() {
  const navigate = useNavigate();
  const [selectedScheme, setSelectedScheme] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024-25');

  // Merge local storage schemes with master
  const allSchemes = useMemo(() => {
    try {
      const saved = localStorage.getItem('tsa_schemes_extra');
      const extra = saved ? JSON.parse(saved) : [];
      return [...MASTER_SCHEMES, ...extra];
    } catch {
      return MASTER_SCHEMES;
    }
  }, []);

  const filtered = selectedScheme
    ? allSchemes.filter(s => s.schemeCode === selectedScheme)
    : allSchemes;

  const handleDownload = () => {
    const tableEl = document.getElementById('abstract-table');
    if (!tableEl) return;
    import('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js').then(() => {
      const opt = {
        margin: 0.5,
        filename: `TSA_ASSG_Abstract_${selectedYear}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' },
      };
      window.html2pdf().set(opt).from(tableEl).save();
    }).catch(() => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        const opt = {
          margin: 0.5,
          filename: `TSA_ASSG_Abstract_${selectedYear}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' },
        };
        window.html2pdf().set(opt).from(tableEl).save();
      };
      document.head.appendChild(script);
    });
  };

  return (
    <Layout title="ASSG Abstract" subtitle="TSA Reports / Receipts / ASSG Abstract">
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.left}>
          <button style={styles.backBtn} onClick={() => navigate('/accounts/tsa-reports/receipts')}>
            ← Back
          </button>
          <div style={styles.breadcrumb}>CSRC / TSA Reports / Receipts / ASSG Abstract</div>
          <h1 style={styles.title}>Monthly Abstract – TSA Assigned Grant</h1>
        </div>
        <div style={styles.actions}>
          <select
            style={styles.filterSelect}
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            {FINANCIAL_YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            style={styles.filterSelect}
            value={selectedScheme}
            onChange={e => setSelectedScheme(e.target.value)}
          >
            <option value="">All Schemes</option>
            {allSchemes.map(s => (
              <option key={s.schemeCode} value={s.schemeCode}>
                {s.schemeCode} – {s.schemeName.slice(0, 40)}
              </option>
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
                <th style={styles.th}>Sch Code</th>
                {MONTHS.map(m => (
                  <th key={m} style={styles.thCenter}>{m}</th>
                ))}
                <th style={{ ...styles.thCenter, background: '#155e3d' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.schemeCode} style={i % 2 === 1 ? styles.evenRow : {}}>
                  <td style={styles.tdCode}>{s.schemeCode}</td>
                  {MONTHS.map(m => (
                    <td key={m} style={styles.tdAmount}>.00</td>
                  ))}
                  <td style={styles.tdTotal}>.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Layout>
  );
}