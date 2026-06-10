import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div style={styles.root}>
      {/* Animated background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.card}>
        {/* Logo area */}
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>
            <img src="/logo-placeholder.png" alt="AU Logo"
              style={styles.logoImg}
              onError={e => { e.target.style.display='none'; }}
            />
            <span style={styles.logoFallback}>AU</span>
          </div>
          <div>
            <div style={styles.logoTitle}>CSRC Accounts</div>
            <div style={styles.logoSub}>Anna University, Chennai</div>
          </div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.heading}>Welcome Back</h2>
        <p style={styles.subheading}>Sign in to the Accounts Management System</p>

        <div style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button style={styles.btn} onClick={handleLogin}
            onMouseEnter={e => e.target.style.opacity = '0.88'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Sign In →
          </button>
        </div>

        <div style={styles.footer}>
          Centre for Sponsored Research and Consultancy · Anna University
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--navy)', position: 'relative', overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
    top: -150, left: -150, pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    bottom: -100, right: -100, pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
    top: '50%', right: '20%', pointerEvents: 'none',
  },
  card: {
    width: 420, background: 'rgba(30,41,59,0.85)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 24, padding: '40px 36px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.08)',
    position: 'relative', zIndex: 1,
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  logoBox: {
    width: 52, height: 52, borderRadius: 14,
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 20px var(--accent-glow)', flexShrink: 0, overflow: 'hidden',
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  logoFallback: { color: '#fff', fontWeight: 700, fontSize: 18, fontFamily: 'Sora' },
  logoTitle: { fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.3px' },
  logoSub: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 },
  divider: { height: 1, background: 'var(--border)', marginBottom: 28 },
  heading: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 },
  subheading: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)',
    fontSize: 14, fontFamily: 'Sora', outline: 'none', transition: 'border-color 0.2s',
    width: '100%',
  },
  btn: {
    marginTop: 8, padding: '13px', borderRadius: 12,
    background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    border: 'none', color: '#fff', fontWeight: 700, fontSize: 15,
    fontFamily: 'Sora', cursor: 'pointer', transition: 'opacity 0.2s',
    boxShadow: '0 4px 20px rgba(6,182,212,0.35)',
  },
  footer: { marginTop: 28, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' },
};