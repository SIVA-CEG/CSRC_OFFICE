import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { label: 'Dashboard', icon: '⊞', path: '/accounts' },
  {
    label: 'Master', icon: '◈', path: '/master',
    children: [
      { label: 'Campus', path: '/master/campus' },
      { label: 'Departments', path: '/master/departments' },
      { label: 'Designation', path: '/master/designation' },
      { label: 'Faculties', path: '/master/faculties' },
      { label: 'Beneficiaries', path: '/master/beneficiaries' },
      { label: 'Schemes', path: '/master/schemes' },
      { label: 'PI Roles', path: '/master/pi-roles' },
      { label: 'User Activation', path: '/master/user-activation' },
    ]
  },
  { label: 'Budget', icon: '◉', path: '/accounts/budget' },
  {
    label: 'Banking', icon: '⬡', path: '/accounts/banking',
    children: [
      {
        label: 'Bank', icon: '○', path: '/accounts/banking/bank',
        children: [
          { label: 'New Entry', path: '/accounts/banking/bank/new-entry' },
          { label: 'Original Statements', path: '/accounts/banking/bank/original-statements' },
          { label: 'Current Statements', path: '/accounts/banking/bank/current-statements' },
        ]
      },
      {
        label: 'Fund Transfer', icon: '○', path: '/accounts/banking/fund-transfer',
        children: [
          { label: 'Revenue Account', path: '/accounts/banking/fund-transfer/revenue-account' },
          { label: 'Project Account', path: '/accounts/banking/fund-transfer/project-account' },
          { label: 'MOPR Account', path: '/accounts/banking/fund-transfer/mopr-account' },
          { label: 'TTDF Account', path: '/accounts/banking/fund-transfer/ttdf-account' },
          { label: 'Consultancy Account', path: '/accounts/banking/fund-transfer/consultancy-account' },
          { label: 'TEC Account', path: '/accounts/banking/fund-transfer/tec-account' },
          { label: 'TAX Account', path: '/accounts/banking/fund-transfer/tax-account' },
        ]
      },
    ]
  },
  {
    label: 'Receipts', icon: '◎', path: '/accounts/receipts',
    children: [
      { label: 'Project A/c', path: '/accounts/receipts/project-ac' },
      { label: 'MoPR A/c', path: '/accounts/receipts/mopr-ac' },
      { label: 'TTDF A/c', path: '/accounts/receipts/ttdf-ac' },
      { label: 'Revenue A/c', path: '/accounts/receipts/revenue-ac' },
      { label: 'Tax A/c', path: '/accounts/receipts/tax-ac' },
      { label: 'Receipt Lock', path: '/accounts/receipts/receipt-lock' },
    ]
  },
  {
    label: 'Payments', icon: '◐', path: '/accounts/payments',
    children: [
      { label: 'Revenue A/c', path: '/accounts/payments/revenue-ac' },
      { label: 'Project A/c', path: '/accounts/payments/project-ac' },
      { label: 'MOPR A/c', path: '/accounts/payments/mopr-ac' },
      { label: 'TTDF A/c', path: '/accounts/payments/ttdf-ac' },
      { label: 'Tax A/c', path: '/accounts/payments/tax-ac' },
      { label: 'Unspent Amount', path: '/accounts/payments/unspent-amount' },
      { label: 'Adv Settlement', path: '/accounts/payments/adv-settlement' },
      { label: 'Bank Clearance', path: '/accounts/payments/bank-clearance' },
      { label: 'Voucher Clearance', path: '/accounts/payments/voucher-clearance' },
      { label: 'Payment Types', path: '/accounts/payments/payment-types' },
      { label: 'Sub-head Types', path: '/accounts/payments/subhead-types' },
      { label: 'Payment Lock', path: '/accounts/payments/payment-lock' },
    ]
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});
  const [openSubs, setOpenSubs] = useState({});

  const toggle = (label) => setOpenGroups(p => ({ ...p, [label]: !p[label] }));
  const toggleSub = (label) => setOpenSubs(p => ({ ...p, [label]: !p[label] }));
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside style={sideStyles.sidebar}>
      
      {/* Logo */}
      <div style={sideStyles.logoArea}>
        <div style={sideStyles.logoIcon}>
          <img src="src/assets/csrc-logo.png" alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <span style={sideStyles.logoText}>C</span>
        </div>
        <div>
          <div style={sideStyles.brandName}>CSRC</div>
          <div style={sideStyles.brandSub}>Accounts System</div>
        </div>
      </div>

      <div style={sideStyles.divider} />

      <nav style={sideStyles.nav}>
        {NAV.map(item => (
          <div key={item.label}>
            <div
  style={{
    ...sideStyles.navItem,
    ...(isActive(item.path) ? sideStyles.navActive : {}),
  }}
  onMouseEnter={(e) => {
    if (!isActive(item.path)) {
      e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
      e.currentTarget.style.transform = 'translateX(4px)';
    }
  }}
  onMouseLeave={(e) => {
    if (!isActive(item.path)) {
      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      e.currentTarget.style.transform = 'translateX(0px)';
    }
  }}
  onClick={() => {
    if (item.children) toggle(item.label);
    else navigate(item.path);
  }}
>
              <span style={sideStyles.navIcon}>{item.icon}</span>
              <span style={sideStyles.navLabel}>{item.label}</span>
              {item.children && (
                <span style={sideStyles.chevron}>
                  {openGroups[item.label] ? '▾' : '▸'}
                </span>
              )}
            </div>

            {/* Level-1 children */}
            {item.children && openGroups[item.label] && (
              <div style={sideStyles.childGroup}>
                {item.children.map(child => (
                  <div key={child.label}>
                    <div
                      style={{
                        ...sideStyles.childItem,
                        ...(isActive(child.path) ? sideStyles.childActive : {}),
                      }}
                      onClick={() => {
                        if (child.children) toggleSub(child.label);
                        else navigate(child.path);
                      }}
                    >
                      <span style={sideStyles.dot}>○</span>
                      <span>{child.label}</span>
                      {child.children && (
                        <span style={sideStyles.chevronSm}>
                          {openSubs[child.label] ? '▾' : '▸'}
                        </span>
                      )}
                    </div>

                    {/* Level-2 children */}
                    {child.children && openSubs[child.label] && (
                      <div style={sideStyles.grandchildGroup}>
                        {child.children.map(gc => (
                          <div
                            key={gc.label}
                            style={{
                              ...sideStyles.grandchildItem,
                              ...(location.pathname === gc.path ? sideStyles.grandchildActive : {}),
                            }}
                            onClick={() => navigate(gc.path)}
                          >
                            — {gc.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom user chip */}
      <div style={sideStyles.userChip}>
        <div style={sideStyles.userAvatar}>A</div>
        <div>
          <div style={sideStyles.userName}>Admin User</div>
          <div style={sideStyles.userRole}>Accounts Office</div>
        </div>
      </div>
    </aside>
  );
}

const sideStyles = {
  sidebar: {
  width: '280px',
  minHeight: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,

  background:
  'linear-gradient(180deg, #081420 0%, #45ace0 60%, #6ebe87 100%)',

  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',

  borderRight: '1px solid rgba(255,255,255,0.08)',

  boxShadow:
    '0 0 40px rgba(0,0,0,0.25)',

  overflowY: 'auto',
  zIndex: 999,

  display: 'flex',
  flexDirection: 'column',
},
  logoArea: {
  padding: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginBottom: '10px',
},
  logoIcon: {
  width: '58px',
  height: '58px',
  borderRadius: '18px',

  background: 'rgba(255,255,255,0.08)',

  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',

  border: '1px solid rgba(255,255,255,0.12)',

  boxShadow:
    '0 8px 30px rgba(0,0,0,.25)',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},
  logoText: { color: '#fff', fontWeight: 800, fontSize: 17, position: 'absolute' },
  brandName:{
  color:'#fff',
  fontWeight:'800',
  fontSize:'18px',
  letterSpacing:'0.5px'
},

brandSub:{
  color:'rgba(255,255,255,.65)',
  fontSize:'11px'
},
  divider: { height: 1, background: 'var(--border)', margin: '0 14px 10px' },
  nav: { flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',

  padding: '14px 18px',
  marginBottom: '8px',

  borderRadius: '16px',
  cursor: 'pointer',

  color: '#ffffff',
  fontWeight: '500',

  background: 'rgba(255,255,255,0.05)',

  border: '1px solid rgba(255,255,255,0.08)',

  transition: 'all 0.3s ease',

  backdropFilter: 'blur(12px)',
},
  navActive: {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.12))',

  border:
    '1px solid rgba(255,255,255,0.35)',

  color: '#ffffff',

  boxShadow:
    '0 10px 30px rgba(255,255,255,0.18)',

  transform: 'translateX(4px)',
},
navIcon: {
  width: '42px',
  height: '42px',

  borderRadius: '14px',

  background:
    'linear-gradient(135deg, #ffffff, #dbeafe)',

  color: '#0f172a',

  fontSize: '18px',
  fontWeight: '700',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  flexShrink: 0,

  boxShadow:
    '0 6px 18px rgba(255,255,255,0.25)',
},
  navLabel: { flex: 1 },
  chevron: { fontSize: 10, marginLeft: 'auto', color: 'var(--text-muted)' },
  childGroup: {
  marginLeft: '18px',
  paddingLeft: '18px',

  borderLeft:
    '2px solid rgba(255,255,255,0.15)',
},
  childItem: {
  padding: '11px 14px',
  borderRadius: '12px',

  color: 'rgba(255,255,255,0.85)',

  cursor: 'pointer',
  transition: 'all 0.25s ease',
},
  childActive: {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08))',

  color: '#ffffff',

  border: '1px solid rgba(255,255,255,0.2)',

  boxShadow:
    '0 4px 15px rgba(255,255,255,0.12)',
},
  dot: { fontSize: 9, color: 'var(--text-muted)' },
  chevronSm: { fontSize: 9, marginLeft: 'auto', color: 'var(--text-muted)' },
  grandchildGroup: { paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 2 },
  grandchildItem: {
    padding: '6px 8px', fontSize: 11.5, color: 'var(--text-muted)',
    cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s', userSelect: 'none',
  },
  grandchildActive: { color: 'var(--accent-glow)', color: 'var(--accent)' },
  userChip: {
  margin: '18px',
  padding: '16px',

  borderRadius: '20px',

  background:
    'rgba(255,255,255,0.12)',

  border:
    '1px solid rgba(255,255,255,0.15)',

  backdropFilter: 'blur(20px)',

  boxShadow:
    '0 10px 30px rgba(0,0,0,0.2)',

  display: 'flex',
  alignItems: 'center',
  gap: '12px',
},
  userAvatar: {
  width: '48px',
  height: '48px',

  borderRadius: '16px',

  background:
    'linear-gradient(135deg,#ffffff,#e0f2fe)',

  color: '#0f172a',

  fontWeight: '700',
  fontSize: '18px',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  boxShadow:
    '0 8px 20px rgba(255,255,255,0.25)',
},
  userName: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' },
  userRole: { fontSize: 10, color: 'var(--text-muted)' },
};