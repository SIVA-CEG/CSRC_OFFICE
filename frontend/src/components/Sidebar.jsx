import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const masterItems = [
  { label: 'Campus',          path: '/master/campus',          icon: '🏫' },
  { label: 'Departments',     path: '/master/departments',     icon: '🏢' },
  { label: 'Beneficiaries',   path: '/master/beneficiaries',   icon: '👥' },
  { label: 'Designation',     path: '/master/designation',     icon: '🎖️' },
  { label: 'Faculties',       path: '/master/faculties',       icon: '👨‍🏫' },
  { label: 'User Activation', path: '/master/user-activation', icon: '✅' },
  { label: 'PI Roles',        path: '/master/pi-roles',        icon: '🔑' },
  { label: 'Schemes',         path: '/master/schemes',         icon: '📄' },
];

const tapalItems = [
  { label: 'New Internal Tapal', path: '/my-tapals/new-internal', icon: '📝' },
  { label: 'Tapals Assigned',    path: '/my-tapals/assigned',     icon: '📥' },
  { label: 'Tapals Transfer',    path: '/my-tapals/transfer',     icon: '🔁' },
  { label: 'Tapals Completed',   path: '/my-tapals/completed',    icon: '✅' },
  { label: 'Tapal Search',       path: '/my-tapals/search',       icon: '🔍' },
];

const endorsementItems = [
  { label: 'Dashboard',          path: '/endorsements/dashboard',    icon: '📊' },
  { label: 'New Requests',       path: '/endorsements/new-requests', icon: '📥' },
  { label: 'Transferred',        path: '/endorsements/transferred',  icon: '🔄' },
  { label: 'Completed',          path: '/endorsements/completed',    icon: '✅' },
  { label: 'Create Endorsement', path: '/endorsements/create',       icon: '📝' },
  { label: 'Search',             path: '/endorsements/search',       icon: '🔍' },
];

const projectItems = [
  { label: 'Dashboard',        path: '/projects',                  icon: '📊' },
  { label: 'Initial Sanctions', path: '/projects/fresh-sanction',  icon: '✨' },
  { label: 'Other Sanctions',  path: '/projects/renewal-sanction', icon: '🔄' },
  {
    label: 'Project Requests',
    path: '/projects/project-requests',
    icon: '📩',
    children: [
      { label: 'Reappropriation Claims', path: '/projects/office-reappropriation', icon: '💼' },
      { label: 'Project Extension',      path: '/projects/project-extension',      icon: '⏳' },
    ],
  },
  { label: 'Bill Claim Requests', path: '/projects/zba-claims', icon: '🏦' },
  {
    label: 'Project Staff Approvals',
    path: '/projects/staff-approvals',
    icon: '👨‍💼',
  },
  { label: 'Search',  path: '/projects/search',  icon: '🔍' },
  { label: 'Reports', path: '/projects/reports', icon: '📑' },
];

const navSections = [
  { label: 'Master',               icon: '⚙️',  path: '/master',      children: masterItems },
  { label: 'My Tapals',            icon: '📬',  path: '/my-tapals',   children: tapalItems },
  { label: 'Endorsements',         icon: '📑',  path: '/endorsements',children: endorsementItems },
  { label: 'Projects',             icon: '🔬',  path: '/projects',    children: projectItems },
  { label: 'DST INSPIRE',          icon: '🌟',  path: '/dst-inspire' },
  { label: 'DST INSPIRE Faculty',  icon: '👨‍🏫', path: '/dst-inspire-faculty' },
  { label: 'Women Scientist',      icon: '👩‍🔬', path: '/women-scientist' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [openSection, setOpenSection] = useState(null);

  // Track which level-2 accordion is open (keyed by child path)
  const [openChildKey, setOpenChildKey] = useState(null);

  // Auto-expand top-level section on navigation
  useEffect(() => {
    if (location.pathname.startsWith('/master'))        setOpenSection('Master');
    else if (location.pathname.startsWith('/my-tapals'))    setOpenSection('My Tapals');
    else if (location.pathname.startsWith('/endorsements')) setOpenSection('Endorsements');
    else if (location.pathname.startsWith('/projects'))     setOpenSection('Projects');
    else setOpenSection(null);
  }, [location.pathname]);

  // Auto-expand level-2 accordion when navigating directly via URL
  useEffect(() => {
    if (
      location.pathname.startsWith('/projects/office-reappropriation') ||
      location.pathname.startsWith('/projects/project-extension')
    ) {
      setOpenChildKey('/projects/project-requests');
    } else if (
      location.pathname.startsWith('/projects/staff-approvals')
    ) {
      setOpenChildKey('/projects/staff-approvals');
    }
  }, [location.pathname]);

  const toggleSection = (label, path, hasChildren) => {
    if (hasChildren) {
      setOpenSection(openSection === label ? null : label);
      if (label === 'My Tapals'    && !location.pathname.startsWith('/my-tapals'))    navigate('/my-tapals/new-internal');
      if (label === 'Master'       && !location.pathname.startsWith('/master'))       navigate('/master/campus');
      if (label === 'Endorsements' && !location.pathname.startsWith('/endorsements')) navigate('/endorsements/dashboard');
      if (label === 'Projects'     && !location.pathname.startsWith('/projects'))     navigate('/projects');
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
        <span className="sidebar-logo-icon">🎓</span>
        <div>
          <div className="sidebar-brand">CSRC</div>
          <div className="sidebar-brand-sub">Proceedings</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => {
          const hasChildren = Boolean(section.children);
          const isOpen   = openSection === section.label;
          const isActive = location.pathname.startsWith(section.path);

          return (
            <div key={section.label} className="sidebar-section">
              <div
                className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
                onClick={() => toggleSection(section.label, section.path, hasChildren)}
              >
                <span className="sidebar-item-icon">{section.icon}</span>
                <span className="sidebar-item-label">{section.label}</span>
                {hasChildren && (
                  <span className={`sidebar-chevron ${isOpen ? 'open' : ''}`}>▾</span>
                )}
              </div>

              {hasChildren && isOpen && (
                <div className="sidebar-children">
                  {section.children.map((child) => {
                    const hasGrandchildren = Boolean(child.children);
                    const isChildOpen = openChildKey === child.path;
                    const childActive =
                      location.pathname === child.path ||
                      (hasGrandchildren &&
                        child.children.some((sub) =>
                          location.pathname.startsWith(sub.path)
                        ));

                    return (
                      <div key={child.path}>
                        <div
                          className={`sidebar-child ${childActive ? 'sidebar-child--active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasGrandchildren) {
                              // Toggle this accordion; navigate to parent path on first open
                              const willOpen = openChildKey !== child.path;
                              setOpenChildKey(willOpen ? child.path : null);
                              if (willOpen && !location.pathname.startsWith(child.path)) {
                                navigate(child.path);
                              }
                            } else {
                              navigate(child.path);
                            }
                          }}
                        >
                          <span className="sidebar-child-icon">{child.icon}</span>
                          <span className="sidebar-child-label">{child.label}</span>
                          {hasGrandchildren && (
                            <span className={`sidebar-chevron ${isChildOpen ? 'open' : ''}`}>▾</span>
                          )}
                        </div>

                        {hasGrandchildren && isChildOpen && (
                          <div className="sidebar-grandchildren">
                            {child.children.map((sub) => (
                              <div
                                key={sub.path}
                                className={`sidebar-child sidebar-grandchild ${
                                  location.pathname.startsWith(sub.path) ? 'sidebar-child--active' : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(sub.path);
                                }}
                              >
                                <span className="sidebar-child-icon">{sub.icon}</span>
                                {sub.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">A</div>
          <div>
            <div className="sidebar-username">Admin User</div>
            <div className="sidebar-role">Proceedings Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}