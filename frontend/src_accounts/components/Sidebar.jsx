import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import csrcLogo from "../assets/csrc-logo.png";


const NAV = [
  {
  label: 'Dashboard',
  icon: '📊',
  path: '/accounts'
},
{
  label: 'Master',
  icon: '🗂️',
  path: '/accounts/master',
  children: [
    { label: 'Campus', path: '/accounts/master/campus' },
    { label: 'Departments', path: '/accounts/master/departments' },
    { label: 'Designation', path: '/accounts/master/designation' },
    { label: 'Faculties', path: '/accounts/master/faculties' },
    { label: 'Beneficiaries', path: '/accounts/master/beneficiaries' },
    { label: 'Schemes', path: '/accounts/master/schemes' },
    { label: 'PI Roles', path: '/accounts/master/pi-roles' },
    { label: 'User Activation', path: '/accounts/master/user-activation' },
  ]
},
{
  label: 'Budget',
  icon: '💰',
  path: '/accounts/budget'
},
{
  label: 'Banking',
  icon: '🏦',
  path: '/accounts/banking',
  children: [
    {
      label: 'Bank',
      icon: '💳',
      path: '/accounts/banking/bank',
      children: [
        { label: 'New Entry', path: '/accounts/banking/bank/new-entry' },
        { label: 'Original Statements', path: '/accounts/banking/bank/original-statements' },
        { label: 'Current Statements', path: '/accounts/banking/bank/current-statements' },
      ]
    },
    {
      label: 'Fund Transfer',
      icon: '🔄',
      path: '/accounts/banking/fund-transfer',
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
  label: 'Receipts',
  icon: '🧾',
  path: '/accounts/receipts',
  children: [
    { label: 'Receipt Accounts', path: '/accounts/receipts/receipts-accounts' },
    { label: 'Receipt Abstract', path: '/accounts/receipts/receipt-abstract' },
    { label: 'Receipt Lock', path: '/accounts/receipts/receipt-lock' },
    { label: 'Month Wise Report', path: '/accounts/receipts/month-wise-report' }
  ]
},
  {
    label: 'Payments', icon: '💳', path: '/accounts/payments',
    children: [
      { label: 'Voucher Processing', path: '/accounts/payments/voucher-processing' },
      { label: 'Voucher Clearance', path: '/accounts/payments/voucher-clearance' },
      { label: 'Bank Clearance', path: '/accounts/payments/bank-clearance' },
      { label: 'Payment Processing', path: '/accounts/payments/reports' },
      { label: 'Payment Reports', path : '/accounts/payments/payment-report'},
    ]
  },
  {
  label: 'Bank Reconciliation Statement',
  icon: '🏦',
  path: '/accounts/brs'
},
  {
  label: 'Statement Of Expenditure',
  icon: '🧾',
  path: '/accounts/statement-of-expenditure'
},
  {
    label: 'TSA Reports',
    icon: '📑',
    path: '/accounts/tsa-reports',
    children: [
      {
        label: 'Receipts',
        path: '/accounts/tsa-reports/receipts',
        children: [
          { label: 'ASSG Abstract', path: '/accounts/tsa-reports/receipts/assg-abstract' },
        ],
      },
      {
        label: 'General',
        path: '/accounts/tsa-reports/general',
        children: [
          { label: 'PFMS Allocation', path: '/accounts/tsa-reports/general/pfms-allocation' },
          { label: 'Compilation', path: '/accounts/tsa-reports/general/compilation' },
        ],
      },
      {
        label: 'Payments',
        path: '/accounts/tsa-reports/payments',
        children: [
          { label: 'Abstract', path: '/accounts/tsa-reports/payments/abstract' },
          { label: 'Compilation', path: '/accounts/tsa-reports/payments/compilation' },
        ],
      },
    ],
  },
];

const DIRECTOR_HIDDEN_PATHS = [
  '/accounts/receipts/receipts-accounts',
  '/accounts/receipts/receipt-lock',
  '/accounts/payments/voucher-processing',
  '/accounts/payments/voucher-clearance',
  '/accounts/payments/bank-clearance',
];

function getNavForRole(role) {
  if (role !== 'director') return NAV;

  return NAV.map(item => {
    // Banking: director only sees the collective report — strip all sub-menus
    if (item.path === '/accounts/banking') {
      const { children, ...rest } = item;
      return rest;
    }

    // Other sections: drop specific processing-only children
    if (item.children) {
      const filteredChildren = item.children
        .filter(child => !DIRECTOR_HIDDEN_PATHS.includes(child.path))
        .map(child => {
          if (child.children) {
            return {
              ...child,
              children: child.children.filter(
                gc => !DIRECTOR_HIDDEN_PATHS.includes(gc.path)
              ),
            };
          }
          return child;
        });

      return { ...item, children: filteredChildren };
    }

    return item;
  });
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('userRole') || 'assistant';
  const navItems = getNavForRole(role);
const userName = localStorage.getItem('userName') || 'Admin User';

const handleLogout = () => {
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  navigate('/accounts-login');
};
const [openGroups, setOpenGroups] = useState(() => {
  const initial = {};

  navItems.forEach(item => {
    const hasMatch = item.children?.some(child =>
      location.pathname.startsWith(child.path) ||
      child.children?.some(gc =>
        location.pathname.startsWith(gc.path)
      )
    );

    if (hasMatch) {
      initial[item.label] = true;
    }
  });

  return initial;
});
  const [openSubs, setOpenSubs] = useState(() => {
    const initial = {};
    navItems.forEach(item => {
      item.children?.forEach(child => {
        const hasMatch = child.children?.some(gc => location.pathname.startsWith(gc.path));
        if (hasMatch) initial[child.label] = true;
      });
    });
    return initial;
  });

  const toggle = (label) => setOpenGroups(p => ({ ...p, [label]: !p[label] }));
  const toggleSub = (label) => setOpenSubs(p => ({ ...p, [label]: !p[label] }));
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside style={sideStyles.sidebar}>
      
      {/* Logo */}
      <div style={sideStyles.logoArea}>
        <div style={sideStyles.logoIcon}>
          <img src={csrcLogo} alt="Logo"
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
        {navItems.map(item => (
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
  if (item.children) {
    toggle(item.label);
    navigate(item.path);  // ← add this line
  } else {
    navigate(item.path);
  }
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
            {item.children &&
 (openGroups[item.label] ||
  item.children.some(child => location.pathname.startsWith(child.path))) && (
              <div style={sideStyles.childGroup}>
                {item.children.map(child => (
                  <div key={child.label}>
                    <div
                      style={{
                        ...sideStyles.childItem,
                        ...(isActive(child.path) ? sideStyles.childActive : {}),
                      }}
                      onClick={() => {
  if (child.children) {
    toggleSub(child.label);
    navigate(child.path);  // ← add this line
  } else {
    navigate(child.path);
  }
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
                    {child.children &&
 (openSubs[child.label] ||
  child.children.some(gc => location.pathname.startsWith(gc.path))) && (
                      <div style={sideStyles.grandchildGroup}>
                        {child.children.map(gc => (
  <div
    key={gc.label}
    style={{
      ...sideStyles.grandchildItem,
      ...(location.pathname === gc.path || location.pathname.startsWith(gc.path + '/')
        ? sideStyles.grandchildActive
        : {}),
    }}
    onMouseEnter={(e) => {
      if (location.pathname !== gc.path) {
        e.currentTarget.style.background =
          'rgba(255,255,255,0.12)';
      }
    }}
    onMouseLeave={(e) => {
      if (location.pathname !== gc.path) {
        e.currentTarget.style.background =
          'transparent';
      }
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
  <div style={sideStyles.userAvatar}>{userName.charAt(0).toUpperCase()}</div>
  <div style={{ flex: 1 }}>
    <div style={sideStyles.userName}>{userName}</div>
    <div style={sideStyles.userRole}>
      {role === 'director' ? 'Director' : 'Accounts Office'}
    </div>
  </div>
  <button
    onClick={handleLogout}
    title="Logout"
    style={sideStyles.logoutBtn}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
  >
    ⏻
  </button>
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
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
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
  grandchildGroup: {
  marginLeft: '20px',
  paddingLeft: '16px',
  borderLeft: '1px solid rgba(255,255,255,0.18)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: '8px',
},
  grandchildItem: {
  padding: '10px 14px',
  fontSize: '14px',
  fontWeight: '500',
  color: 'rgba(255,255,255,0.85)',
  cursor: 'pointer',
  borderRadius: '10px',
  transition: 'all 0.25s ease',
  userSelect: 'none',
},
  grandchildActive: {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08))',
  color: '#fff',
  fontWeight: '600',
  border: '1px solid rgba(255,255,255,0.2)',
},
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
  logoutBtn: {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.12)',
  color: '#fff',
  fontSize: 15,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 0.2s ease',
},
};