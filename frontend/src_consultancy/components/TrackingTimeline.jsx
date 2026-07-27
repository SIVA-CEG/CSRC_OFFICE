// PATH: frontend/src_consultancy/components/TrackingTimeline.jsx

import React from 'react';
import { ROLE_LABELS } from '../data/consultancyWorkflow';

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 },
  step: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  dot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }),
  body: { fontSize: 12, color: '#374151', lineHeight: 1.5 },
  role: { fontWeight: 700, color: '#111827' },
  meta: { color: '#9ca3af' },
  remarks: { color: '#ef4444', fontStyle: 'italic' },
};

const dotColor = (action) => (action === 'REJECTED' ? '#ef4444' : '#16a34a');

/** Used on every Transferred / Completed view to show the approval trail. */
const TrackingTimeline = ({ history = [] }) => {
  if (history.length === 0) return <span style={{ fontSize: 12, color: '#9ca3af' }}>No activity yet.</span>;
  return (
    <div style={styles.wrap}>
      {history.map((h, i) => (
        <div key={i} style={styles.step}>
          <span style={styles.dot(dotColor(h.action))} />
          <span style={styles.body}>
            <span style={styles.role}>{ROLE_LABELS[h.role] || h.role}</span>{' '}
            — {h.action.toLowerCase()} <span style={styles.meta}>({h.date})</span>
            {h.remarks && <><br /><span style={styles.remarks}>{h.remarks}</span></>}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TrackingTimeline;