// PATH: frontend/src_consultancy/components/SectionListTable.jsx

import React, { useState } from 'react';
import DocumentViewButtons from './DocumentViewButtons';

const styles = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflowX: 'auto', overflowY: 'hidden' },
  table: { width: '100%', minWidth: 920, borderCollapse: 'collapse' },
  th: { fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'left', padding: '12px 14px', background: '#fef9c3', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' },
  td: { fontSize: 13, color: '#111827', padding: '12px 14px', borderTop: '1px solid #f1f5f9', verticalAlign: 'middle' },
  idCell: { fontWeight: 700, color: '#7c1f3f' },
  dateInput: { fontSize: 12.5, padding: '6px 9px', borderRadius: 7, border: '1px solid #d1d5db' },
  select: { fontSize: 12.5, padding: '7px 10px', borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', minWidth: 130 },
  submitBtn: { fontSize: 12, fontWeight: 700, color: '#fff', background: '#ef4444', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer' },
  empty: { fontSize: 13.5, color: '#9ca3af', padding: '46px 20px', textAlign: 'center' },

  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 },
  modalCard: { background: '#fff', borderRadius: 16, width: 440, maxWidth: '100%', boxShadow: '0 24px 60px rgba(15,23,42,0.3)' },
  modalHeader: { padding: '16px 20px', borderBottom: '1px solid #eef0f3', fontWeight: 700, fontSize: 14.5 },
  modalBody: { padding: '18px 20px' },
  textarea: { width: '100%', minHeight: 80, boxSizing: 'border-box', fontSize: 13, padding: '9px 12px', borderRadius: 9, border: '1px solid #d1d5db', fontFamily: 'DM Sans, sans-serif' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderTop: '1px solid #eef0f3' },
  btnGhost: { fontSize: 12.5, fontWeight: 700, padding: '9px 16px', borderRadius: 9, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer' },
  btnDanger: { fontSize: 12.5, fontWeight: 700, padding: '9px 16px', borderRadius: 9, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' },
};

/**
 * Shared "Submitted / New Requests" table — matches the office screenshots:
 * a row of identifying columns, a document-view button, an editable Tapal
 * Date, an action select (forward options + REJECTED), and a Submit button.
 *
 * columns: [{ key, label, render?(row) }]  — identifying columns only;
 *          Tapal Date / Action / Submit are built in.
 * actionOptions: forward-only options, e.g. ['INVOICE','PERMISSION']
 *          ("REJECTED" is appended automatically).
 * onSubmit(row, action, { remarks, tapalDate })
 */
const SectionListTable = ({ columns, rows, actionOptions, onSubmit, onView }) => {
  const [pending, setPending] = useState({}); // { [id]: { action, tapalDate } }
  const [rejectTarget, setRejectTarget] = useState(null);
  const [remarks, setRemarks] = useState('');

  const setPendingField = (id, field, value) =>
    setPending((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));

  const handleSubmitClick = (row) => {
    const state = pending[row.id] || {};
    if (!state.action) return;
    if (state.action === 'REJECTED') {
      setRejectTarget(row);
      setRemarks('');
      return;
    }
    onSubmit(row, state.action, { tapalDate: state.tapalDate || row.tapalDate });
    setPending((p) => ({ ...p, [row.id]: undefined }));
  };

  const confirmReject = () => {
    if (!remarks.trim()) return;
    const state = pending[rejectTarget.id] || {};
    onSubmit(rejectTarget, 'REJECTED', { remarks, tapalDate: state.tapalDate || rejectTarget.tapalDate });
    setPending((p) => ({ ...p, [rejectTarget.id]: undefined }));
    setRejectTarget(null);
  };

  return (
    <div style={styles.card}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key} style={styles.th}>{c.label}</th>)}
            <th style={styles.th}>Docs</th>
            <th style={styles.th}>Tapal Date</th>
            <th style={styles.th}>Action</th>
            <th style={styles.th}>Submit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const state = pending[row.id] || {};
            return (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key} style={c.key === columns[0].key ? { ...styles.td, ...styles.idCell } : styles.td}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                <td style={styles.td}><DocumentViewButtons docs={row.docs} onView={onView} /></td>
                <td style={styles.td}>
                  <input
                    type="date" style={styles.dateInput}
                    value={state.tapalDate ?? ''}
                    onChange={(e) => setPendingField(row.id, 'tapalDate', e.target.value)}
                  />
                </td>
                <td style={styles.td}>
                  <select
                    style={styles.select}
                    value={state.action || ''}
                    onChange={(e) => setPendingField(row.id, 'action', e.target.value)}
                  >
                    <option value="">--SELECT--</option>
                    {actionOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <button style={styles.submitBtn} onClick={() => handleSubmitClick(row)}>SUBMIT</button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td style={styles.td} colSpan={columns.length + 4}><div style={styles.empty}>Nothing pending here.</div></td></tr>
          )}
        </tbody>
      </table>

      {rejectTarget && (
        <div style={styles.modalBackdrop} onClick={() => setRejectTarget(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>Reject {rejectTarget.id}</div>
            <div style={styles.modalBody}>
              <textarea
                style={styles.textarea}
                placeholder="Remarks — sent back to the faculty"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnGhost} onClick={() => setRejectTarget(null)}>Cancel</button>
              <button style={styles.btnDanger} disabled={!remarks.trim()} onClick={confirmReject}>✕ Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionListTable;