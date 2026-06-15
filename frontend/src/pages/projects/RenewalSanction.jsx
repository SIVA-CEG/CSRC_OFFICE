import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext, PROJECT_STAFF } from './ProjectContext';
import ProjectApprovalTransferCell, { getProfileSignature } from './ProjectApprovalTransferCell';
import './FreshSanction.css'; // reuse same base styles

const userRole = () => localStorage.getItem('userRole') || 'assistant';
const userName = () => localStorage.getItem('userName') || 'Office';

// ── Stage Badge ───────────────────────────────────────────────────────────────
function StageBadge({ role }) {
  const map = {
    superintendent: { label: 'With Superintendent', cls: 'fs-stage-supdt' },
    director:       { label: 'With Director',       cls: 'fs-stage-dir'   },
  };
  const { label, cls } = map[role] || { label: 'Pending', cls: 'fs-stage-asst' };
  return <span className={`fs-stage-badge ${cls}`}>{label}</span>;
}

// ── Scheme reflection (read-only, mirrors Fresh Sanction assignment) ───────────
function SchemeReflect({ item }) {
  if (item.assignedScheme) {
    return (
      <div className="rn-scheme-reflect">
        <span className="rn-scheme-code">{item.assignedScheme.schemeCode}</span>
        <span className="rn-scheme-name">{item.assignedScheme.schemeName}</span>
      </div>
    );
  }
  if (item.assignedAccount) {
    return (
      <div className="rn-scheme-reflect">
        <span className="rn-scheme-code">{item.assignedAccount}</span>
        {item.accountCode && <span className="rn-scheme-name">Code: {item.accountCode}</span>}
      </div>
    );
  }
  return <span className="rn-scheme-empty">Not assigned</span>;
}

// ── View Page ─────────────────────────────────────────────────────────────────
function ViewPage({ item, onBack }) {
  const [expanded, setExpanded] = useState(null);
  const current = item.installments[item.currentInstallment - 1];

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="detail-card">
        <h2>{item.title}</h2>
        <div className="detail-grid">
          <div><span>Reference No</span><strong>{item.refNo}</strong></div>
          <div><span>Funding Agency</span><strong>{item.fundingAgency}</strong></div>
          <div><span>PI Name</span><strong>{item.pi.name}</strong></div>
          <div><span>Department</span><strong>{item.pi.department}</strong></div>
          <div><span>Campus</span><strong>{item.pi.campus}</strong></div>
        </div>

        {(item.assignedScheme || item.assignedAccount) && (
          <div className="fs-account-badge">
            Account: <strong>{item.assignedAccount || item.assignedScheme?.accountType}</strong>
            {item.accountCode && <> &nbsp;| Code: <strong>{item.accountCode}</strong></>}
            {item.assignedScheme?.schemeName && (
              <> &nbsp;| Scheme: <strong>{item.assignedScheme.schemeName}</strong></>
            )}
          </div>
        )}

        {/* Previous installments */}
        {item.installments.filter((_, i) => i < item.currentInstallment - 1).length > 0 && (
          <>
            <h3>Previous Installments</h3>
            {item.installments
              .filter((_, i) => i < item.currentInstallment - 1)
              .map((inst, idx) => (
                <div key={idx} className="sanctioned-inst-card">
                  <button className="btn-view"
                    onClick={() => setExpanded(expanded === idx ? null : idx)}>
                    {inst.installmentNo}
                  </button>
                  {expanded === idx && (
                    <table className="sanctioned-table">
                      <thead><tr><th>Head</th><th>Amount</th></tr></thead>
                      <tbody>
                        {inst.heads.map((h, i) => (
                          <tr key={i}><td>{h.head}</td><td>{h.amount}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
          </>
        )}

        <h3>Current Installment — {current.installmentNo}</h3>
        <table className="sanctioned-table sanctioned-detail-table">
          <thead><tr><th>Head</th><th>Amount (₹)</th></tr></thead>
          <tbody>
            {current.heads.map((h, i) => (
              <tr key={i}><td>{h.head}</td><td>{h.amount}</td></tr>
            ))}
          </tbody>
        </table>

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

// ── Edit Form ─────────────────────────────────────────────────────────────────
function EditForm({ item, onSave, onCancel }) {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(item)));
  const current = draft.installments[draft.currentInstallment - 1];

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={onCancel}>← Back</button>
      <div className="detail-card">
        <h2>Edit Renewal — {current.installmentNo}</h2>
        <div className="detail-grid">
          <div>
            <label>Funding Agency</label>
            <select className="edit-input" value={draft.fundingAgency}
              onChange={e => setDraft({ ...draft, fundingAgency: e.target.value })}>
              {['SERB','DST','DRDO','ISRO','ICMR','CSIR','MeitY','DBT','MNRE'].map(a =>
                <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label>PI Name</label>
            <input className="edit-input" value={draft.pi.name}
              onChange={e => setDraft({ ...draft, pi: { ...draft.pi, name: e.target.value } })} />
          </div>
        </div>
        <h3>Current Installment Heads</h3>
        <div className="detail-grid">
          {current.heads.map((head, i) => (
            <div key={i}>
              <label>{head.head}</label>
              <input className="edit-input" value={head.amount}
                onChange={e => {
                  const updated = JSON.parse(JSON.stringify(draft.installments));
                  updated[draft.currentInstallment - 1].heads[i].amount = e.target.value;
                  setDraft({ ...draft, installments: updated });
                }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn-approve" onClick={() => onSave(draft)}>💾 Save Changes</button>
          <button className="btn-edit" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RenewalSanction() {
  const navigate = useNavigate();
  const role     = userRole();
  const [mounted, setMounted] = useState(false);

  const {
    renewalActive,   setRenewalActive,
    renewalTransferred,
    renewalCompleted,
    renewal_transfer,
    renewal_complete,
    renewal_updateTransferred,
    renewal_forwardToDirector,
  } = useProjectContext();

  const [page, setPage]                 = useState('list');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItem, setEditItem]         = useState(null);
  const [search, setSearch]             = useState('');
  const [activeTab, setActiveTab]       = useState('active');

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const myTransferred = useMemo(() =>
    renewalTransferred.filter(i =>
      role === 'superintendent' ? i.currentHolder?.role === 'superintendent' :
      role === 'director'       ? i.currentHolder?.role === 'director' : true
    ), [renewalTransferred, role]);

  const activeSource =
    activeTab === 'active'      ? (role === 'assistant' ? renewalActive : myTransferred) :
    activeTab === 'transferred' ? renewalTransferred :
    renewalCompleted;

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

  // ── Transfer handlers (mirrors Fresh Sanction) ───────────────────────────────
  const today = () => new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

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
    renewal_transfer(stamped, staff);
  };

  const handlePlainTransferAssistant = (item, staff) => {
    const updated = {
      ...item,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    renewal_transfer(updated, staff);
  };

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
    renewal_forwardToDirector(stamped, staff);
  };

  const handlePlainTransferSuperintendent = (item, staff) => {
    const updated = {
      ...item,
      currentHolder: staff,
      transferHistory: [
        ...(item.transferHistory || []),
        { from: userName(), fromRole: role, to: staff, date: today(), approved: false },
      ],
    };
    renewal_updateTransferred(updated);
  };

  const handleComplete = (item) => renewal_complete(item);

  const handleSaveEdit = (updated) => {
    if (role === 'assistant') {
      setRenewalActive(prev => prev.map(i => i.id === updated.id ? updated : i));
    } else {
      renewal_updateTransferred(updated);
    }
    setPage('list');
    setEditItem(null);
  };

  if (page === 'view' && selectedItem)
    return <ViewPage item={selectedItem} onBack={() => { setPage('list'); setSelectedItem(null); }} />;
  if (page === 'edit' && editItem)
    return <EditForm item={editItem}
      onSave={handleSaveEdit}
      onCancel={() => { setPage('list'); setEditItem(null); }} />;

  const tabs =
    role === 'assistant'
      ? [
          { key: 'active',      label: `New Requests (${renewalActive.length})` },
          { key: 'transferred', label: `Transferred (${renewalTransferred.length})` },
          { key: 'completed',   label: `Completed (${renewalCompleted.length})` },
        ]
      : role === 'superintendent'
      ? [
          { key: 'active',      label: `In My Queue (${myTransferred.length})` },
          { key: 'transferred', label: `All Transferred (${renewalTransferred.length})` },
          { key: 'completed',   label: `Completed (${renewalCompleted.length})` },
        ]
      : [
          { key: 'active',      label: `Awaiting Approval (${myTransferred.length})` },
          { key: 'completed',   label: `Completed (${renewalCompleted.length})` },
        ];

  return (
    <div className={`project-dashboard ${mounted ? 'fs-loaded' : ''}`}>
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

      <div className="fs-header">
        <h1 className="fs-header-title">Other Sanctions</h1>
        <p className="fs-header-sub">2nd–nth installment requests — review, edit, and transfer</p>
      </div>

      <div className="tab-switcher">
        {tabs.map(t => (
          <button key={t.key}
            className={activeTab === t.key ? 'active' : ''}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="fs-search-bar">
        <div className="fs-search-inner">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Search by title, ref no, agency, PI..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="fs-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Ref No</th>
            <th>Project Title</th>
            <th>PI</th>
            <th>Agency</th>
            <th>Installment</th>
            <th>Amount (₹)</th>
            <th>Account / Scheme</th>
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
          {filtered.map((item, idx) => {
            const current = item.installments[item.currentInstallment - 1];
            return (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.refNo}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{item.pi?.campus}</div>
                </td>
                <td>{item.pi?.name}</td>
                <td>{item.fundingAgency}</td>
                <td>{current?.installmentNo}</td>
                <td>{current?.amount}</td>
                <td><SchemeReflect item={item} /></td>
                {(activeTab === 'transferred' || (role !== 'assistant' && activeTab === 'active')) && (
                  <td><StageBadge role={item.currentHolder?.role} /></td>
                )}
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="btn-view"
                      onClick={() => { setSelectedItem(item); setPage('view'); }}>
                      View
                    </button>
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
                    {role === 'assistant' && activeTab === 'active' && (
                      <ProjectApprovalTransferCell
                        item={item}
                        userRole={role}
                        onApproveTransfer={handleApproveTransfer}
                        onPlainTransfer={handlePlainTransferAssistant}
                      />
                    )}
                    {role === 'superintendent' && activeTab === 'active' && (
                      <ProjectApprovalTransferCell
                        item={item}
                        userRole={role}
                        onApproveTransfer={handleApproveForward}
                        onPlainTransfer={handlePlainTransferSuperintendent}
                      />
                    )}
                    {role === 'director' && activeTab === 'active' && (
                      <button className="btn-approve" onClick={() => handleComplete(item)}>
                        ✓ Approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}