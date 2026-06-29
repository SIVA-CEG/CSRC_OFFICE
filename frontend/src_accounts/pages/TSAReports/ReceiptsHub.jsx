import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #fafbff 60%, #f0fdf4 100%)',
    padding: '40px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#10b981',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    background: 'none',
    border: 'none',
    padding: 0,
  },
  header: { marginBottom: '40px' },
  breadcrumb: { fontSize: '13px', color: '#94a3b8', marginBottom: '8px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
    maxWidth: '600px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '36px 28px',
    cursor: 'pointer',
    border: '1.5px solid #d1fae5',
    borderTop: '4px solid #10b981',
    boxShadow: '0 4px 20px rgba(16,185,129,0.08)',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '14px',
  },
  icon: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
  },
  label: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  desc: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' },
  arrow: { fontSize: '16px', color: '#10b981' },
};

export default function ReceiptsHub() {
  const navigate = useNavigate();

  return (
    <Layout title="Receipts" subtitle="TSA Reports / Receipts">
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/accounts/tsa-reports')}>
        ← Back
      </button>
      <div style={styles.header}>
        <div style={styles.breadcrumb}>CSRC / TSA Reports / Receipts</div>
        <h1 style={styles.title}>Receipts Reports</h1>
        <p style={styles.subtitle}>Monthly grant abstracts and summaries</p>
      </div>
      <div style={styles.grid}>
        <div
          style={styles.card}
          onClick={() => navigate('/accounts/tsa-reports/receipts/assg-abstract')}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(16,185,129,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.08)';
          }}
        >
          <div style={styles.icon}>📊</div>
          <div style={styles.label}>ASSG Abstract</div>
          <div style={styles.desc}>Monthly abstract for TSA Assigned grant by scheme code</div>
          <div style={styles.arrow}>→</div>
        </div>
      </div>
    </div>
    </Layout>
  );
}