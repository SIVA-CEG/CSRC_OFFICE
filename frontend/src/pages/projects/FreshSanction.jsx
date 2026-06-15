import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext, PROJECT_STAFF } from './ProjectContext';
import ProjectApprovalTransferCell, { getProfileSignature } from './ProjectApprovalTransferCell';
import SchemeSelectModal from './SchemeSelectModal';
import './FreshSanction.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const userRole = () => localStorage.getItem('userRole') || 'assistant';
const userName = () => localStorage.getItem('userName') || 'Office';

// ── Edit Form ─────────────────────────────────────────────────────────────────
function EditForm({ item, onSave, onCancel }) {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(item)));

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={onCancel}>← Back</button>
      <div className="detail-card">
        <h2>Edit Fresh Sanction</h2>
        <div className="detail-grid">
          <div>
            <label>Reference No</label>
            <input className="edit-input" value={draft.refNo}
              onChange={e => setDraft({ ...draft, refNo: e.target.value })} />
          </div>
          <div>
            <label>Funding Agency</label>
            <select className="edit-input" value={draft.fundingAgency}
              onChange={e => setDraft({ ...draft, fundingAgency: e.target.value })}>
              {['SERB','DST','DRDO','ISRO','ICMR','CSIR','MeitY','DBT','MNRE'].map(a =>
                <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label>Project Title</label>
            <input className="edit-input" value={draft.title}
              onChange={e => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <label>Total Cost (₹)</label>
            <input className="edit-input" value={draft.cost}
              onChange={e => setDraft({ ...draft, cost: e.target.value })} />
          </div>
          <div>
            <label>PI Name</label>
            <input className="edit-input" value={draft.pi.name}
              onChange={e => setDraft({ ...draft, pi: { ...draft.pi, name: e.target.value } })} />
          </div>
          <div>
            <label>Department</label>
            <input className="edit-input" value={draft.pi.department}
              onChange={e => setDraft({ ...draft, pi: { ...draft.pi, department: e.target.value } })} />
          </div>
          <div>
            <label>Campus</label>
            <select className="edit-input" value={draft.pi.campus}
              onChange={e => setDraft({ ...draft, pi: { ...draft.pi, campus: e.target.value } })}>
              {['CEG Campus','MIT Campus','ACT Campus','SAP Campus'].map(c =>
                <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Project Period</label>
            <input className="edit-input" value={draft.period}
              onChange={e => setDraft({ ...draft, period: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn-approve" onClick={() => onSave(draft)}>💾 Save Changes</button>
          <button className="btn-edit" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── View Page ─────────────────────────────────────────────────────────────────
function ViewPage({ item, onBack }) {
  return (
    <div className="detail-page">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="detail-card">
        <h2>{item.title}</h2>
        <div className="detail-grid">
          <div><span>Reference No</span><strong>{item.refNo}</strong></div>
          <div><span>Funding Agency</span><strong>{item.fundingAgency}</strong></div>
          <div><span>Total Cost</span><strong>₹ {item.cost}</strong></div>
          <div><span>Project Period</span><strong>{item.period}</strong></div>
        </div>
        <h3>Principal Investigator</h3>
        <div className="detail-grid">
          <div><span>Name</span><strong>{item.pi.name}</strong></div>
          <div><span>Department</span><strong>{item.pi.department}</strong></div>
          <div><span>Campus</span><strong>{item.pi.campus}</strong></div>
        </div>
        {item.assignedAccount && (
          <div className="fs-account-badge">
            Account: <strong>{item.assignedAccount}</strong>
            {item.accountCode && <> &nbsp;| Code: <strong>{item.accountCode}</strong></>}
            {item.assignedScheme?.schemeName && (
              <> &nbsp;| Scheme: <strong>{item.assignedScheme.schemeName}</strong></>
            )}
          </div>
        )}
        <div className="sanctioned-inst-card">
          <div className="sanctioned-inst-header"><h3>Installment Wise Sanction</h3></div>
          <table className="sanctioned-table sanctioned-detail-table">
            <thead><tr><th>Installment</th><th>Amount (₹)</th><th>Status</th></tr></thead>
            <tbody>
              {item.installments.map((inst, i) => (
                <tr key={i}>
                  <td>{inst.installmentNo}</td>
                  <td>{inst.amount}</td>
                  <td><span className="pending-badge">Pending Release</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {item.transferHistory?.length > 0 && (
          <div className="fs-history-section">
            <h3>Transfer History</h3>
            {item.transferHistory.map((h, i) => (
              <div key={i} className="fs-history-item">
                <span className="fs-history-date">{h.date}</span>
                <span className="fs-history-arrow">→</span>
                <span className="fs-history-to">{h.to?.name || h.to}</span>
                <span className={`fs-role-badge fs-role-${h.to?.role}`}>{h.to?.role}</span>
                {h.approved === false && <span className="fs-role-badge" style={{ background:'#eef0fb', color:'#2c2a4a' }}>not approved</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stage Badge ───────────────────────────────────────────────────────────────
function StageBadge({ role }) {
  const map = {
    superintendent: { label: 'With Superintendent', cls: 'fs-stage-supdt' },
    director:       { label: 'With Director',       cls: 'fs-stage-dir'   },
    assistant:      { label: 'With Assistant',      cls: 'fs-stage-asst'  },
  };
  const { label, cls } = map[role] || { label: 'Pending', cls: 'fs-stage-asst' };
  return <span className={`fs-stage-badge ${cls}`}>{label}</span>;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FreshSanction() {
  const navigate  = useNavigate();
  const role      = userRole();
  const [mounted, setMounted] = useState(false);

  const {
    freshActive,   setFreshActive,
    freshTransferred,
    freshCompleted,
    fresh_transfer,
    fresh_complete,
    fresh_updateTransferred,
    fresh_forwardToDirector,
  } = useProjectContext();

  const [page, setPage]                   = useState('list');
  const [selectedItem, setSelectedItem]   = useState(null);
  const [editItem, setEditItem]           = useState(null);
  const [search, setSearch]               = useState('');
  const [activeTab, setActiveTab]         = useState('active'); // active | transferred | completed
  const [schemeModalItem, setSchemeModalItem] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // ── Data source by role and tab ────────────────────────────────────────────
  const myTransferred = useMemo(() =>
    freshTransferred.filter(i =>
      role === 'superintendent' ? i.currentHolder?.role === 'superintendent' :
      role === 'director'       ? i.currentHolder?.role === 'director'       :
      true
    ), [freshTransferred, role]);

  const activeSource =
    activeTab === 'active'      ? (role === 'assistant' ? freshActive : myTransferred) :
    activeTab === 'transferred' ? freshTransferred :
    freshCompleted;

  // Search filter
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return activeSource;
    return activeSource.filter(i =>
      i.title?.toLowerCase().includes(s) ||
      i.refNo?.toLowerCase().includes(s) ||
      i.fundingAgency?.toLowerCase().includes(s) ||
      i.pi?.name?.toLowerCase().includes(s)
    );
  }, [activeSource, search]);

  // ── Scheme / Account assignment (assistant, active tab) ─────────────────────
  const handleAssignScheme = (scheme) => {
    if (!schemeModalItem) return;
    const updated = {
      ...schemeModalItem,
      assignedScheme: scheme,
      assignedAccount: scheme.accountType,
      accountCode: scheme.schemeCode,
    };
    setFreshActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    setSchemeModalItem(null);
  };

  // ── Transfer handlers ────────────────────────────────────────────────────────
  const today = () => new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

  // Assistant: Approve & Transfer → superintendent (stamps signature)
  const handleApproveTransfer = (item, staff) => {
    const mySig = getProfileSignature(role);
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), [role]: mySig || true },
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: true },
      ],
    };
    fresh_transfer(stamped, staff);
  };

  // Assistant: Transfer (No Approval) → another assistant, same level
  const handlePlainTransferAssistant = (item, staff) => {
    const updated = {
      ...item,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    fresh_transfer(updated, staff);
  };

  // Superintendent: Approve & Transfer → director (stamps signature)
  const handleApproveForward = (item, staff) => {
    const mySig = getProfileSignature(role);
    const stamped = {
      ...item,
      signatures: { ...(item.signatures || {}), [role]: mySig || true },
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: true },
      ],
    };
    fresh_forwardToDirector(stamped, staff);
  };

  // Superintendent: Transfer (No Approval) → another superintendent, same level
  const handlePlainTransferSuperintendent = (item, staff) => {
    const updated = {
      ...item,
      currentHolder: staff,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    fresh_updateTransferred(updated);
  };

  const handleComplete = (item) => {
    fresh_complete(item);
  };

  const handleSaveEdit = (updated) => {
    if (role === 'assistant') {
      setFreshActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    } else {
      fresh_updateTransferred(updated);
    }
    setPage('list');
    setEditItem(null);
  };

  // ── Render sub-pages ───────────────────────────────────────────────────────
  if (page === 'view' && selectedItem) {
    return <ViewPage item={selectedItem} onBack={() => { setPage('list'); setSelectedItem(null); }} />;
  }
  if (page === 'edit' && editItem) {
    return <EditForm item={editItem}
      onSave={handleSaveEdit}
      onCancel={() => { setPage('list'); setEditItem(null); }} />;
  }

  // ── Tab labels ─────────────────────────────────────────────────────────────
  const tabs =
    role === 'assistant'
      ? [
          { key: 'active',      label: `New Requests (${freshActive.length})` },
          { key: 'transferred', label: `Transferred (${freshTransferred.length})` },
          { key: 'completed',   label: `Completed (${freshCompleted.length})` },
        ]
      : role === 'superintendent'
      ? [
          { key: 'active',      label: `In My Queue (${myTransferred.length})` },
          { key: 'transferred', label: `All Transferred (${freshTransferred.length})` },
          { key: 'completed',   label: `Completed (${freshCompleted.length})` },
        ]
      : [
          { key: 'active',      label: `Awaiting Approval (${myTransferred.length})` },
          { key: 'completed',   label: `Completed (${freshCompleted.length})` },
        ];

  return (
    <div className={`project-dashboard ${mounted ? 'fs-loaded' : ''}`}>
      {/* Top Nav */}
      <div className="fs-top-nav">
        <button className="fs-btn-back" onClick={() => navigate('/projects/dashboard')}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="fs-nav-right">
          <span className={`fs-role-chip fs-role-${role}`}>
            {role === 'assistant' ? '🟢' : role === 'superintendent' ? '🔵' : '🔴'} {role}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="fs-header">
        <h1 className="fs-header-title">Fresh Sanctions</h1>
        <p className="fs-header-sub">First installment sanction requests — review, assign account, and transfer</p>
      </div>

      {/* Tabs */}
      <div className="tab-switcher">
        {tabs.map(t => (
          <button
            key={t.key}
            className={activeTab === t.key ? 'active' : ''}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="fs-search-bar">
        <div className="fs-search-inner">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, ref no, agency, PI name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="fs-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {/* Table */}
      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Ref No</th>
            <th>Project Title</th>
            <th>PI</th>
            <th>Agency</th>
            <th>Cost (₹)</th>
            {/* Assistant-only: scheme/account assignment */}
            {role === 'assistant' && activeTab === 'active' && <th>Account / Scheme</th>}
            {/* Transferred tab: show stage */}
            {(activeTab === 'transferred' || (role !== 'assistant' && activeTab === 'active')) && <th>Stage</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                {search ? `No results for "${search}"` : 'No items to display'}
              </td>
            </tr>
          )}
          {filtered.map((item, idx) => (
            <tr key={item.id}>
              <td>{idx + 1}</td>
              <td>{item.refNo}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{item.pi?.campus}</div>
              </td>
              <td>
                <div>{item.pi?.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{item.pi?.department}</div>
              </td>
              <td>{item.fundingAgency}</td>
              <td>₹ {item.cost}</td>

              {/* Account / Scheme assignment — assistant only, active tab */}
              {role === 'assistant' && activeTab === 'active' && (
                <td>
                  <div className="fs-scheme-cell">
                    {item.assignedScheme ? (
                      <div className="fs-scheme-chip">
                        <div className="fs-scheme-code">{item.assignedScheme.schemeCode}</div>
                        <div className="fs-scheme-name">{item.assignedScheme.schemeName}</div>
                        <div className="fs-scheme-type">{item.assignedScheme.accountType}</div>
                      </div>
                    ) : (
                      <span className="fs-scheme-empty">Not assigned</span>
                    )}
                    <button className="fs-scheme-action-btn" onClick={() => setSchemeModalItem(item)}>
                      {item.assignedScheme ? '✏️ Change' : '➕ Action'}
                    </button>
                  </div>
                </td>
              )}

              {/* Stage column */}
              {(activeTab === 'transferred' || (role !== 'assistant' && activeTab === 'active')) && (
                <td><StageBadge role={item.currentHolder?.role} /></td>
              )}

              {/* Actions */}
              <td>
                <div className="fs-actions">
                  {/* View */}
                  <button className="btn-view"
                    onClick={() => { setSelectedItem(item); setPage('view'); }}>
                    View
                  </button>

                  {/* Edit — assistant on active, superintendent/director on their queue */}
                  {(
                    (role === 'assistant' && activeTab === 'active') ||
                    (role === 'superintendent' && activeTab === 'active') ||
                    (role === 'director' && activeTab === 'active')
                  ) && (
                    <button className="btn-edit"
                      onClick={() => { setEditItem(item); setPage('edit'); }}>
                      Edit
                    </button>
                  )}

                  {/* Assistant: Approve & Transfer / Transfer (No Approval) */}
                  {role === 'assistant' && activeTab === 'active' && (
                    <ProjectApprovalTransferCell
                      item={item}
                      userRole={role}
                      onApproveTransfer={handleApproveTransfer}
                      onPlainTransfer={handlePlainTransferAssistant}
                    />
                  )}

                  {/* Superintendent: Approve & Forward / Transfer (No Approval) */}
                  {role === 'superintendent' && activeTab === 'active' && (
                    <ProjectApprovalTransferCell
                      item={item}
                      userRole={role}
                      onApproveTransfer={handleApproveForward}
                      onPlainTransfer={handlePlainTransferSuperintendent}
                    />
                  )}

                  {/* Complete — director */}
                  {role === 'director' && activeTab === 'active' && (
                    <button className="btn-approve"
                      onClick={() => handleComplete(item)}>
                      ✓ Approve
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Scheme selection modal */}
      <SchemeSelectModal
        open={!!schemeModalItem}
        onClose={() => setSchemeModalItem(null)}
        onSelect={handleAssignScheme}
        currentScheme={schemeModalItem?.assignedScheme}
      />
    </div>
  );
}