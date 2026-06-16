import Sidebar from './Sidebar';
import annaLogo from "../assets/anna-university-logo.png";

export default function Layout({ children, title, subtitle }) {
  return (
<div style={{
  display: 'flex',
  minHeight: '100vh',
  background: '#ffffff'
}}>      <Sidebar />
<div
  style={{
    marginLeft: '260px',
    width: 'calc(100vw - 260px)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  }}
>   {/* Top Navbar */}
        <header style={navStyles.bar}>
  <div></div>

  <div style={navStyles.center}>
    <div style={navStyles.title}>{title}</div>
    {subtitle && <div style={navStyles.sub}>{subtitle}</div>}
  </div>

  <div style={navStyles.right}>
    <div style={navStyles.badge}>Anna University</div>
    <div style={navStyles.logoBox}>
  <img
    src={annaLogo}
    alt="Anna University Logo"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
      borderRadius: "12px",
    }}
  />
</div>
  </div>
</header>
<main
  style={{
    flex: 1,
    width: '100%',
    padding: '24px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  }}
>          {children}
        </main>
      </div>
    </div>
  );
}

const navStyles = {
  bar: {
  height: '72px',
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  alignItems: 'center',
  padding: '0 24px',
  background: '#ffffff',
  borderBottom: '3px solid rgb(0, 0, 0)',
  position: 'sticky',
  top: 0,
  zIndex: 50,
},
  title: { fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.3px' },
  sub: { fontSize: 11, color: 'var(--text-muted)', marginTop: 1 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  badge: {
    fontSize: 11, color: 'var(--text-secondary)', background: 'var(--surface)',
    border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 20,
  },
  logoBox: {
    width: 36, height: 36, borderRadius: 8, overflow: 'hidden', position: 'relative',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  center: {
  textAlign: 'center',
},

right: {
  justifySelf: 'end',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
},
};