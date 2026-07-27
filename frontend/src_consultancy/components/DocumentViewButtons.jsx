// PATH: frontend/src_consultancy/components/DocumentViewButtons.jsx

import React from 'react';

const styles = {
  row: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  btn: (bg, color) => ({
    fontFamily: 'DM Sans, sans-serif', fontSize: 11.5, fontWeight: 700,
    padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', background: bg, color,
  }),
};

const DOC_STYLE = {
  acf: { label: 'ACF', bg: 'rgba(124,31,63,0.1)', color: '#7c1f3f' },
  invoice: { label: 'INVOICE', bg: 'rgba(15,118,110,0.1)', color: '#0f766e' },
  permission: { label: 'PERMISSION', bg: 'rgba(37,99,235,0.1)', color: '#2563eb' },
  proceedings: { label: 'PROCEEDINGS', bg: 'rgba(139,92,246,0.1)', color: '#7c3aed' },
};

/**
 * `docs` is an object like { acf: '2627C11065', invoice: 'IVF-3704' } — one
 * button per key present. `onView(kind, refId)` opens whatever document
 * viewer the parent wants to wire in (e.g. the faculty-side print views).
 */
const DocumentViewButtons = ({ docs = {}, onView }) => (
  <div style={styles.row}>
    {Object.entries(docs).map(([kind, refId]) => {
      const meta = DOC_STYLE[kind] || { label: kind.toUpperCase(), bg: '#f1f5f9', color: '#334155' };
      return (
        <button key={kind} style={styles.btn(meta.bg, meta.color)} onClick={() => onView?.(kind, refId)}>
          👁 {meta.label}
        </button>
      );
    })}
  </div>
);

export default DocumentViewButtons;