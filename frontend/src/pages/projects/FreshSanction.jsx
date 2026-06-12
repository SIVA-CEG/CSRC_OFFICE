import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectContext, PROJECT_STAFF } from './ProjectContext';
import './FreshSanction.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const userRole = () => localStorage.getItem('userRole') || 'assistant';
const userName = () => localStorage.getItem('userName') || 'Office';

// ── Transfer Cell (mirrors endorsement pattern) ───────────────────────────────
function TransferCell({ item, onTransfer }) {
  const role = userRole();
  const [open, setOpen]         = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [confirming, setConfirming] = useState(false);

  const eligible = role === 'superintendent'
    ? PROJECT_STAFF.filter(s => s.role === 'director')
    : PROJECT_STAFF.filter(s => s.role === 'superintendent');

  const handleOk = () => {
    const staff = PROJECT_STAFF.find(s => s.id === parseInt(selectedId));
    if (!staff) return;
    onTransfer(item, staff);
    setOpen(false);
    setSelectedId('');
    setConfirming(false);
  };

  return (
    <div className="fs-transfer-cell">
      {!open ? (
        <button className="fs-transfer-btn" onClick={() => setOpen(true)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          Transfer
        </button>
      ) : (
        <div className="fs-transfer-popup">
          <select
            className="fs-transfer-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">-- Select Staff --</option>
            {eligible.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
          <div className="fs-transfer-actions">
            <button className="fs-transfer-ok"
              onClick={() => { if (selectedId) setConfirming(true); }}
              disabled={!selectedId}>OK</button>
            <button className="fs-transfer-cancel"
              onClick={() => { setOpen(false); setSelectedId(''); }}>✕</button>
          </div>
          {confirming && (
            <div className="fs-transfer-confirm">
              <span>Transfer to <b>{PROJECT_STAFF.find(s => s.id === parseInt(selectedId))?.name}</b>?</span>
              <button className="fs-transfer-ok" onClick={handleOk}>Confirm</button>
              <button className="fs-transfer-cancel" onClick={() => setConfirming(false)}>Back</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
  const [assignments, setAssignments]     = useState({});
  const [assignmentCodes, setAssignmentCodes] = useState({});

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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTransfer = (item, toStaff) => {
    const withAccount = {
      ...item,
      assignedAccount: assignments[item.id] || item.assignedAccount || '',
      accountCode:     assignmentCodes[item.id] || item.accountCode || '',
    };
    fresh_transfer(withAccount, toStaff);
  };

  const handleForwardToDirector = (item, toStaff) => {
    fresh_forwardToDirector(item, toStaff);
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
            {/* Assistant-only: account assignment */}
            {role === 'assistant' && activeTab === 'active' && <th>Account</th>}
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

              {/* Account assignment — assistant only, active tab */}
              {role === 'assistant' && activeTab === 'active' && (
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <select
                      className="edit-input"
                      value={assignments[item.id] || item.assignedAccount || ''}
                      onChange={e => setAssignments({ ...assignments, [item.id]: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="ZBA">ZBA</option>
                      <option value="TSA(H)">TSA(H)</option>
                      <option value="CMRG">CMRG</option>
                    </select>
                    {(assignments[item.id] || item.assignedAccount) && (
                      <input
                        type="text"
                        className="edit-input"
                        placeholder={`Enter ${assignments[item.id] || item.assignedAccount} Code`}
                        value={assignmentCodes[item.id] || item.accountCode || ''}
                        onChange={e => setAssignmentCodes({ ...assignmentCodes, [item.id]: e.target.value })}
                      />
                    )}
                  </div>
                </td>
              )}

              {/* Stage column */}
              {(activeTab === 'transferred' || (role !== 'assistant' && activeTab === 'active')) && (
                <td><StageBadge role={item.currentHolder?.role} /></td>
              )}

              {/* Actions */}
              <td>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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

                  {/* Transfer — assistant → superintendent */}
                  {role === 'assistant' && activeTab === 'active' && (
                    <TransferCell item={item} onTransfer={handleTransfer} />
                  )}

                  {/* Forward — superintendent → director */}
                  {role === 'superintendent' && activeTab === 'active' && (
                    <TransferCell item={item} onTransfer={handleForwardToDirector} />
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
    </div>
  );
}