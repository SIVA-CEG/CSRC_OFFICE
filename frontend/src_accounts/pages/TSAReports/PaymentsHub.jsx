import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fafbff 60%, #fffbeb 100%)',
    padding: '40px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#f59e0b', fontWeight: '600', cursor: 'pointer',
    marginBottom: '24px', background: 'none', border: 'none', padding: 0,
  },
  header: { marginBottom: '40px' },
  breadcrumb: { fontSize: '13px', color: '#94a3b8', marginBottom: '8px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '24px',
    maxWidth: '900px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '32px 24px',
    cursor: 'pointer',
    border: '1.5px solid #fef3c7',
    borderTop: '4px solid #f59e0b',
    boxShadow: '0 4px 20px rgba(245,158,11,0.08)',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  cardUC: {
    borderTop: '4px solid #cbd5e1',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
    opacity: 0.75,
  },
  icon: {
    width: '60px', height: '60px', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
  },
  label: { fontSize: '15px', fontWeight: '700', color: '#0f172a' },
  desc: { fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' },
  badge: {
    fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
    background: '#f1f5f9', color: '#94a3b8', fontWeight: '600',
  },
  arrow: { fontSize: '15px', color: '#f59e0b' },
};

const cards = [
  { key: 'abstract', label: 'Abstract', icon: '📊', iconBg: 'linear-gradient(135deg,#fef3c7,#fde68a)', desc: 'Monthly abstract by scheme code', path: '/accounts/tsa-reports/payments/abstract', uc: false },
  { key: 'compilation', label: 'Compilation', icon: '📁', iconBg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', desc: 'Compiled payments by file and M.H. number', path: '/accounts/tsa-reports/payments/compilation', uc: false },
];

export default function PaymentsHub() {
  const navigate = useNavigate();
  return (
    <Layout title="Payments" subtitle="TSA Reports / Payments">
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/accounts/tsa-reports')}>← Back</button>
      <div style={styles.header}>
        <div style={styles.breadcrumb}>CSRC / TSA Reports / Payments</div>
        <h1 style={styles.title}>Payments Reports</h1>
        <p style={styles.subtitle}>Abstract, compilation and overhead account reports</p>
      </div>
      <div style={styles.grid}>
        {cards.map(c => (
          <div
            key={c.key}
            style={{ ...styles.card, ...(c.uc ? styles.cardUC : {}) }}
            onClick={() => navigate(c.path)}
            onMouseEnter={e => {
              if (!c.uc) {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(245,158,11,0.15)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = c.uc
                ? '0 4px 20px rgba(15,23,42,0.04)'
                : '0 4px 20px rgba(245,158,11,0.08)';
            }}
          >
            <div style={{ ...styles.icon, background: c.iconBg }}>{c.icon}</div>
            <div style={styles.label}>{c.label}</div>
            <div style={styles.desc}>{c.desc}</div>
            {c.uc ? <span style={styles.badge}>Coming Soon</span> : <div style={styles.arrow}>→</div>}
          </div>
        ))}
      </div>
    </div>
    </Layout>
  );
}