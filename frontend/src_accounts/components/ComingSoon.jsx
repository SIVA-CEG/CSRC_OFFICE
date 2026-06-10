export default function ComingSoon({ title, color = '#06b6d4' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 420, textAlign: 'center',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20, marginBottom: 24,
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 36,
        boxShadow: `0 0 40px ${color}22`,
      }}>
        🚧
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 340 }}>
        This module is currently under development. It will be available soon.
      </p>
      <div style={{
        padding: '6px 18px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        background: `${color}18`, color,
      }}>
        Under Construction
      </div>
    </div>
  );
}