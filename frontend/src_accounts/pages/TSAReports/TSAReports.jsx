import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%)',
    padding: '40px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    marginBottom: '48px',
  },
  breadcrumb: {
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '8px',
    letterSpacing: '0.4px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    marginTop: '6px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '28px',
    maxWidth: '960px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '40px 32px',
    cursor: 'pointer',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '18px',
    position: 'relative',
    overflow: 'hidden',
  },
  cardReceipts: {
    borderTop: '4px solid #10b981',
  },
  cardGeneral: {
    borderTop: '4px solid #6366f1',
  },
  cardPayments: {
    borderTop: '4px solid #f59e0b',
  },
  iconWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
  },
  iconReceipts: { background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
  iconGeneral: { background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' },
  iconPayments: { background: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  cardLabel: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.2px',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  arrow: {
    fontSize: '18px',
    color: '#cbd5e1',
    marginTop: '4px',
  },
};

export default function TSAReports() {
  const navigate = useNavigate();

  const cards = [
    {
      key: 'receipts',
      label: 'Receipts',
      icon: '🧾',
      desc: 'Monthly abstract, assigned grant summaries',
      iconStyle: styles.iconReceipts,
      borderStyle: styles.cardReceipts,
      path: '/accounts/tsa-reports/receipts',
    },
    {
      key: 'general',
      label: 'General',
      icon: '📋',
      desc: 'PFMS allocation, compilation reports',
      iconStyle: styles.iconGeneral,
      borderStyle: styles.cardGeneral,
      path: '/accounts/tsa-reports/general',
    },
    {
      key: 'payments',
      label: 'Payments',
      icon: '💳',
      desc: 'Abstract, compilation, overhead accounts',
      iconStyle: styles.iconPayments,
      borderStyle: styles.cardPayments,
      path: '/accounts/tsa-reports/payments',
    },
  ];

  return (
    <Layout title="TSA Reports" subtitle="TSA Reports">
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.breadcrumb}>CSRC / Accounts / TSA Reports</div>
        <h1 style={styles.title}>TSA Reports</h1>
        <p style={styles.subtitle}>Select a report category to begin</p>
      </div>
      <div style={styles.grid}>
        {cards.map(c => (
          <div
            key={c.key}
            style={{ ...styles.card, ...c.borderStyle }}
            onClick={() => navigate(c.path)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(15,23,42,0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(15,23,42,0.06)';
            }}
          >
            <div style={{ ...styles.iconWrap, ...c.iconStyle }}>{c.icon}</div>
            <div style={styles.cardLabel}>{c.label}</div>
            <div style={styles.cardDesc}>{c.desc}</div>
            <div style={styles.arrow}>→</div>
          </div>
        ))}
      </div>
    </div>
    </Layout>
  );
}