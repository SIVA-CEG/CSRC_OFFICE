// PATH: frontend/src_consultancy/components/SectionTrackTable.jsx

import React, { useState } from 'react';
import DocumentViewButtons from './DocumentViewButtons';
import TrackingTimeline from './TrackingTimeline';

const styles = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: 11, fontWeight: 700, color: '#6b7280', textAlign: 'left', padding: '12px 14px', background: '#f9fafb', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' },
  td: { fontSize: 13, color: '#111827', padding: '12px 14px', borderTop: '1px solid #f1f5f9', verticalAlign: 'top' },
  idCell: { fontWeight: 700, color: '#7c1f3f' },
  statusBadge: (color, bg) => ({ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 999, padding: '4px 10px', display: 'inline-block' }),
  trackBtn: { fontSize: 12, fontWeight: 700, color: '#334155', background: '#f1f5f9', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer' },
  empty: { fontSize: 13.5, color: '#9ca3af', padding: '46px 20px', textAlign: 'center' },
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 20 },
  modalCard: { background: '#fff', borderRadius: 16, width: 460, maxWidth: '100%', boxShadow: '0 24px 60px rgba(15,23,42,0.3)' },
  modalHeader: { padding: '16px 20px', borderBottom: '1px solid #eef0f3', fontWeight: 700, fontSize: 14.5, display: 'flex', justifyContent: 'space-between' },
  modalClose: { border: 'none', background: 'transparent', fontSize: 18, color: '#9ca3af', cursor: 'pointer' },
  modalBody: { padding: '18px 20px' },
};

const STAGE_META = {
  completed: { label: 'Completed', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  assistant: { label: 'With Assistant', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  superintendent: { label: 'With Superintendent', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  deputy_director: { label: 'With Deputy Director', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  director: { label: 'With Director', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
};

/** Read-only table for Transferred / Completed views, with tracking + document viewing. */
const SectionTrackTable = ({ columns, rows, onView }) => {
  const [trackRow, setTrackRow] = useState(null);

  return (
    <div style={styles.card}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key} style={styles.th}>{c.label}</th>)}
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Docs</th>
            <th style={styles.th}>Tracking</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const meta = STAGE_META[row.stage] || STAGE_META.assistant;
            return (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key} style={c.key === columns[0].key ? { ...styles.td, ...styles.idCell } : styles.td}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                <td style={styles.td}><span style={styles.statusBadge(meta.color, meta.bg)}>{meta.label}</span></td>
                <td style={styles.td}><DocumentViewButtons docs={row.docs} onView={onView} /></td>
                <td style={styles.td}>
                  <button style={styles.trackBtn} onClick={() => setTrackRow(row)}>📍 Track</button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td style={styles.td} colSpan={columns.length + 3}><div style={styles.empty}>Nothing here yet.</div></td></tr>
          )}
        </tbody>
      </table>

      {trackRow && (
        <div style={styles.modalBackdrop} onClick={() => setTrackRow(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              Tracking — {trackRow.id}
              <button style={styles.modalClose} onClick={() => setTrackRow(null)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <TrackingTimeline history={trackRow.history} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionTrackTable;