import React, { useState } from 'react';
import './MasterPage.css';

export default function MasterPage({ title, icon, description, columns, sampleRows }) {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(sampleRows || []);
  const [showModal, setShowModal] = useState(false);

  const filtered = rows.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mp-root">
      {/* Page header */}
      <div className="mp-header">
        <div className="mp-header-left">
          <div className="mp-header-icon">{icon}</div>
          <div>
            <h1 className="mp-title">{title}</h1>
            <p className="mp-desc">{description}</p>
          </div>
        </div>
        <button className="mp-add-btn" onClick={() => setShowModal(true)}>
          + Add New
        </button>
      </div>

      {/* Stats bar */}
      <div className="mp-stats">
        <div className="mp-stat-item">
          <span className="mp-stat-val">{rows.length}</span>
          <span className="mp-stat-label">Total Records</span>
        </div>
        <div className="mp-stat-item">
          <span className="mp-stat-val">{rows.filter(r => r.status === 'Active').length || rows.length}</span>
          <span className="mp-stat-label">Active</span>
        </div>
        <div className="mp-stat-item">
          <span className="mp-stat-val">{rows.filter(r => r.status === 'Inactive').length || 0}</span>
          <span className="mp-stat-label">Inactive</span>
        </div>
      </div>

      {/* Table card */}
      <div className="mp-card">
        <div className="mp-toolbar">
          <div className="mp-search-wrap">
            <span className="mp-search-icon">🔍</span>
            <input
              className="mp-search"
              type="text"
              placeholder={`Search ${title}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="mp-toolbar-right">
            <button className="mp-icon-btn" title="Export">📤 Export</button>
            <button className="mp-icon-btn" title="Refresh">🔄 Refresh</button>
          </div>
        </div>

        <div className="mp-table-wrap">
          <table className="mp-table">
            <thead>
              <tr>
                <th>#</th>
                {columns.map(col => <th key={col.key}>{col.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="mp-empty">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className="mp-row">
                    <td className="mp-cell-num">{i + 1}</td>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.key === 'status' ? (
                          <span className={`mp-badge ${row[col.key] === 'Active' ? 'mp-badge--active' : 'mp-badge--inactive'}`}>
                            {row[col.key]}
                          </span>
                        ) : row[col.key]}
                      </td>
                    ))}
                    <td>
                      <div className="mp-actions">
                        <button className="mp-action-btn mp-edit" title="Edit">✏️</button>
                        <button className="mp-action-btn mp-delete" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mp-pagination">
          <span className="mp-page-info">Showing {filtered.length} of {rows.length} records</span>
          <div className="mp-page-btns">
            <button className="mp-page-btn" disabled>‹ Prev</button>
            <button className="mp-page-btn mp-page-btn--active">1</button>
            <button className="mp-page-btn" disabled>Next ›</button>
          </div>
        </div>
      </div>

      {/* Modal placeholder */}
      {showModal && (
        <div className="mp-overlay" onClick={() => setShowModal(false)}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3>Add New {title}</h3>
              <button className="mp-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="mp-modal-body">
              {columns.filter(c => c.key !== 'status').map(col => (
                <div className="mp-modal-field" key={col.key}>
                  <label>{col.label}</label>
                  <input type="text" placeholder={`Enter ${col.label}`} />
                </div>
              ))}
            </div>
            <div className="mp-modal-footer">
              <button className="mp-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="mp-modal-save" onClick={() => setShowModal(false)}>Save Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}