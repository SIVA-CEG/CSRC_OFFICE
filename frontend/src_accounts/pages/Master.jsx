import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Master() {
  const navigate = useNavigate();

  const cards = [
    { title: 'Campus', icon: '🏫', route: '/accounts/master/campus' },
    { title: 'Departments', icon: '🏢', route: '/accounts/master/departments' },
    { title: 'Designation', icon: '👔', route: '/accounts/master/designation' },
    { title: 'Faculties', icon: '👨‍🏫', route: '/accounts/master/faculties' },
    { title: 'Beneficiaries', icon: '👥', route: '/accounts/master/beneficiaries' },
    { title: 'Schemes', icon: '📋', route: '/accounts/master/schemes' },
    { title: 'PI Roles', icon: '🔐', route: '/accounts/master/pi-roles' },
    { title: 'User Activation', icon: '✅', route: '/accounts/master/user-activation' },
  ];

  return (
    <Layout
      title="Master"
      subtitle="Master Data & Configuration"
    >
      <div style={styles.container}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={styles.card}
            onClick={() => navigate(card.route)}
          >
            <div style={styles.icon}>{card.icon}</div>
            <h3 style={styles.title}>{card.title}</h3>
            <p style={styles.description}>
              Manage {card.title.toLowerCase()} details
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '24px',
    padding: '10px',
  },

  card: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '28px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },

  icon: {
    fontSize: '42px',
    marginBottom: '16px',
  },

  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },

  description: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
};