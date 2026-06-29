import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const styles = {
  page: {
    minHeight: '100vh', background: '#f8fafc', padding: '32px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex', flexDirection: 'column',
  },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', color: '#f59e0b', fontWeight: '600', cursor: 'pointer',
    background: 'none', border: 'none', padding: '0 0 10px 0', alignSelf: 'flex-start',
  },
  center: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px',
  },
  icon: { fontSize: '72px', marginBottom: '8px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  desc: { fontSize: '15px', color: '#64748b', maxWidth: '360px', lineHeight: '1.6' },
  badge: {
    padding: '8px 20px', borderRadius: '20px', background: '#fef3c7',
    color: '#b45309', fontWeight: '700', fontSize: '13px', border: '1px solid #fde68a',
  },
};

export default function PaymentsUnderConstruction({ module = 'This Page' }) {
  const navigate = useNavigate();
  return (
    <Layout title={module} subtitle={`TSA Reports / Payments / ${module}`}>
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/accounts/tsa-reports/payments')}>← Back</button>
      <div style={styles.center}>
        <div style={styles.icon}>🚧</div>
        <h1 style={styles.title}>{module}</h1>
        <div style={styles.desc}>
          This section is currently under construction and will be available in a future update.
        </div>
        <span style={styles.badge}>Coming Soon</span>
      </div>
    </div>
    </Layout>
  );
}