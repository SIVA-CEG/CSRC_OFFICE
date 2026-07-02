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

const FINANCIAL_YEARS = ['2023-24', '2024-25', '2025-26'];

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '32px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#6366f1', fontWeight: '600', cursor: 'pointer',
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
  schemeFilterSelect: {
    padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
    fontSize: '14px', color: '#334155', background: '#fff', cursor: 'pointer',
    outline: 'none', fontFamily: 'inherit', maxWidth: '260px',
  },
  addBtn: {
    padding: '10px 20px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#fff', fontWeight: '700', fontSize: '14px',
    border: 'none', cursor: 'pointer',
  },
  addBtnDisabled: {
    padding: '10px 20px', borderRadius: '10px',
    background: '#c7c9f5',
    color: '#fff', fontWeight: '700', fontSize: '14px',
    border: 'none', cursor: 'not-allowed',
  },
  downloadBtn: {
    padding: '10px 20px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff', fontWeight: '700', fontSize: '14px',
    border: 'none', cursor: 'pointer',
  },
  tableWrap: {
    background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
    overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: {
    background: '#4f46e5', color: '#fff', padding: '13px 16px',
    textAlign: 'left', fontWeight: '600', fontSize: '12px', letterSpacing: '0.3px',
  },
  td: {
    padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
    color: '#374151', verticalAlign: 'middle',
  },
  editBtn: {
    padding: '6px 14px', borderRadius: '8px', background: '#eff6ff',
    color: '#3b82f6', border: '1px solid #bfdbfe', cursor: 'pointer',
    fontSize: '12px', fontWeight: '600', marginRight: '8px',
  },
  delBtn: {
    padding: '6px 14px', borderRadius: '8px', background: '#fff1f2',
    color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer',
    fontSize: '12px', fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center', padding: '60px 20px',
    color: '#94a3b8', fontSize: '15px',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: '20px', padding: '36px',
    width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(15,23,42,0.18)',
  },
  modalTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  modalScheme: {
    fontSize: '13px', color: '#6366f1', fontWeight: '600', marginBottom: '24px',
  },
  field: { marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', color: '#0f172a',
  },
  textarea: {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px', color: '#0f172a',
  },
  errMsg: { color: '#ef4444', fontSize: '13px', marginBottom: '12px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  cancelBtn: {
    padding: '10px 20px', borderRadius: '10px', background: '#f1f5f9',
    color: '#64748b', fontWeight: '600', fontSize: '14px',
    border: 'none', cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 24px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#fff', fontWeight: '700', fontSize: '14px',
    border: 'none', cursor: 'pointer',
  },
};

const empty = { allocationDate: '', allocatedFund: '', fileName: '', remarks: '' };

export default function PFMSAllocation() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [selectedScheme, setSelectedScheme] = useState('');

  // Merge local storage schemes with master (same source as ASSG Abstract page)
  const allSchemes = useMemo(() => {
    try {
      const saved = localStorage.getItem('tsa_schemes_extra');
      const extra = saved ? JSON.parse(saved) : [];
      return [...MASTER_SCHEMES, ...extra];
    } catch {
      return MASTER_SCHEMES;
    }
  }, []);

  const schemeNameFor = (code) => {
    const s = allSchemes.find(s => s.schemeCode === code);
    return s ? s.schemeName : '';
  };

  const filteredRecords = selectedScheme
    ? records.filter(r => r.schemeCode === selectedScheme)
    : records;

  const openAdd = () => {
    if (!selectedScheme) return;
    setForm(empty); setEditId(null); setErr(''); setShowModal(true);
  };
  const openEdit = (r) => { setForm({ ...r }); setEditId(r.id); setErr(''); setShowModal(true); };

  const save = () => {
    setErr('');
    if (!form.allocationDate || !form.allocatedFund || !form.fileName) {
      setErr('Please fill all required fields.'); return;
    }
    if (editId !== null) {
      setRecords(prev => prev.map(r => r.id === editId ? { ...form, id: editId, schemeCode: r.schemeCode } : r));
    } else {
      setRecords(prev => [...prev, { ...form, id: Date.now(), schemeCode: selectedScheme }]);
    }
    setShowModal(false);
  };

  const del = (id) => {
    if (window.confirm('Delete this allocation?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDownload = () => {
    const el = document.getElementById('pfms-table');
    if (!el) return;
    const loadAndPrint = () => {
      const opt = {
        margin: 0.5,
        filename: `PFMS_Allocation_${selectedYear}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      };
      window.html2pdf().set(opt).from(el).save();
    };
    if (window.html2pdf) { loadAndPrint(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.onload = loadAndPrint;
    document.head.appendChild(s);
  };

  return (
    <Layout title="PFMS Allocation" subtitle="TSA Reports / General / PFMS Allocation">
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/accounts/tsa-reports/general')}>← Back</button>
      <div style={styles.topBar}>
        <div>
          <div style={styles.breadcrumb}>CSRC / TSA Reports / General / PFMS Allocation</div>
          <h1 style={styles.title}>PFMS Fund Allocation</h1>
        </div>
        <div style={styles.actions}>
          <select style={styles.filterSelect} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {FINANCIAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            style={styles.schemeFilterSelect}
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
          <button style={styles.downloadBtn} onClick={handleDownload}>⬇ PDF</button>
          <button
            style={selectedScheme ? styles.addBtn : styles.addBtnDisabled}
            onClick={openAdd}
            disabled={!selectedScheme}
            title={!selectedScheme ? 'Select a scheme first' : ''}
          >
            + New Fund Allocation
          </button>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <div id="pfms-table">
          <table style={styles.table}>
            <thead>
              <tr>
                {['#', 'Scheme', 'Allocation Date', 'Allocated Fund (₹)', 'File Name', 'Remarks', 'Action'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.emptyState}>
                    {selectedScheme
                      ? <>No allocations yet for this scheme. Click <strong>+ New Fund Allocation</strong> to add one.</>
                      : <>Select a scheme above to view or add allocations.</>}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r.id} style={i % 2 === 1 ? { background: '#fafafa' } : {}}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{r.schemeCode}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{schemeNameFor(r.schemeCode).slice(0, 40)}</div>
                    </td>
                    <td style={styles.td}>{r.allocationDate}</td>
                    <td style={{ ...styles.td, fontWeight: '600', color: '#4f46e5' }}>
                      ₹{parseFloat(r.allocatedFund || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>{r.fileName}</td>
                    <td style={styles.td}>{r.remarks || '—'}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => openEdit(r)}>✏️ Edit</button>
                      <button style={styles.delBtn} onClick={() => del(r.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>{editId !== null ? 'Edit Allocation' : 'New Fund Allocation'}</div>
            <div style={styles.modalScheme}>
              {form.schemeCode || selectedScheme} – {schemeNameFor(form.schemeCode || selectedScheme)}
            </div>

            {[
              { key: 'allocationDate', label: 'Allocation Date *', type: 'date' },
              { key: 'allocatedFund', label: 'Allocated Fund (₹) *', type: 'number', placeholder: 'e.g. 500000' },
              { key: 'fileName', label: 'File Name *', type: 'text', placeholder: 'File name' },
            ].map(f => (
              <div key={f.key} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <input
                  style={styles.input}
                  type={f.type}
                  placeholder={f.placeholder || ''}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div style={styles.field}>
              <label style={styles.label}>Remarks</label>
              <textarea
                style={styles.textarea}
                placeholder="Optional remarks..."
                value={form.remarks}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
              />
            </div>
            {err && <div style={styles.errMsg}>⚠️ {err}</div>}
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={save}>Save Allocation</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}