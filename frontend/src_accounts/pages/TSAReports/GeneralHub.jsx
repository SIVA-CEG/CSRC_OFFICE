import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eef2ff 0%, #fafbff 60%, #eef2ff 100%)',
    padding: '40px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#6366f1', fontWeight: '600', cursor: 'pointer',
    marginBottom: '24px', background: 'none', border: 'none', padding: 0,
  },
  header: { marginBottom: '40px' },
  breadcrumb: { fontSize: '13px', color: '#94a3b8', marginBottom: '8px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
    maxWidth: '620px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '36px 28px',
    cursor: 'pointer',
    border: '1.5px solid #e0e7ff',
    borderTop: '4px solid #6366f1',
    boxShadow: '0 4px 20px rgba(99,102,241,0.08)',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '14px',
  },
  icon: {
    width: '64px', height: '64px', borderRadius: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
  },
  label: { fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  desc: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' },
  arrow: { fontSize: '16px', color: '#6366f1' },
};

const cards = [
  {
    key: 'pfms',
    label: 'PFMS Allocation',
    icon: '🏦',
    iconBg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    desc: 'Manage and track PFMS fund allocations',
    path: '/accounts/tsa-reports/general/pfms-allocation',
  },
  {
    key: 'compilation',
    label: 'Compilation',
    icon: '📁',
    iconBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    desc: 'View compiled financial statements by scheme and year',
    path: '/accounts/tsa-reports/general/compilation',
  },
];

export default function GeneralHub() {
  const navigate = useNavigate();
  return (
    <Layout title="General" subtitle="TSA Reports / General">
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/accounts/tsa-reports')}>← Back</button>
      <div style={styles.header}>
        <div style={styles.breadcrumb}>CSRC / TSA Reports / General</div>
        <h1 style={styles.title}>General Reports</h1>
        <p style={styles.subtitle}>PFMS allocations and compiled financial data</p>
      </div>
      <div style={styles.grid}>
        {cards.map(c => (
          <div
            key={c.key}
            style={styles.card}
            onClick={() => navigate(c.path)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(99,102,241,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.08)';
            }}
          >
            <div style={{ ...styles.icon, background: c.iconBg }}>{c.icon}</div>
            <div style={styles.label}>{c.label}</div>
            <div style={styles.desc}>{c.desc}</div>
            <div style={styles.arrow}>→</div>
          </div>
        ))}
      </div>
    </div>
    </Layout>
  );
}