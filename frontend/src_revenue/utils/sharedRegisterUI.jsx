// src_revenue/utils/sharedRegisterUI.jsx
// ─────────────────────────────────────────────────────────────────────────
// Presentational building blocks shared by every register (Non-Consumables,
// Consumables, Service Register, Logistics Register) so the four sets of
// pages don't reimplement the same Field/Section/Drawer/Filter markup.
// Pure UI — no data logic lives here.
// ─────────────────────────────────────────────────────────────────────────
import React from 'react';
import { theme } from './theme';
import { formatDate, roleLabel } from './workflowCore';

export function Field({ label, type = 'text', value, onChange, placeholder, wide, options }) {
  return (
    <div style={{ ...styles.field, gridColumn: wide ? '1 / -1' : undefined }}>
      <label style={styles.fieldLabel}>{label}</label>
      {type === 'select' ? (
        <select className="sd-input" style={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
          {(options || []).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          className="sd-textarea" style={{ ...styles.input, minHeight: 72, resize: 'vertical' }}
          value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="sd-input" style={styles.input} type={type}
          value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function StaticField({ label, value }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      <div style={styles.staticValue}>{value || '—'}</div>
    </div>
  );
}

export function TotalRow({ label, value, bold, color, formatCurrency }) {
  return (
    <div style={styles.totalRow}>
      <span style={{ fontWeight: bold ? 800 : 600, color: color || theme.textSecondary }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: color || theme.textPrimary }}>{formatCurrency(value)}</span>
    </div>
  );
}

export function Section({ title, children, right }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeadRow}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {right}
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

export function GroupTitle({ children, accent }) {
  return <h3 style={{ ...styles.groupTitle, color: accent }}>{children}</h3>;
}

export function UploadBox({ docs, onFiles, onRemove, accent, label }) {
  return (
    <>
      <label style={{ ...styles.uploadBox, borderColor: docs.length ? accent : theme.border }}>
        <input type="file" multiple style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />
        <span style={{ fontSize: 22 }}>⬆️</span>
        <span style={styles.uploadLabel}>{label || 'Click to upload document(s)'}</span>
        <span style={styles.uploadStatus}>PDF, JPG or PNG — multiple files allowed</span>
      </label>
      {docs.length > 0 && (
        <div style={styles.docsGrid}>
          {docs.map((d, i) => (
            <div key={i} style={styles.docChip}>
              <span style={{ fontSize: 16 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.docChipName} title={d.name}>{d.name}</div>
                <div style={styles.docChipMeta}>{Math.round((d.size || 0) / 1024)} KB</div>
              </div>
              {onRemove && <button type="button" style={styles.docRemoveBtn} onClick={() => onRemove(i)}>✕</button>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function DocsList({ docs }) {
  return (
    <div style={styles.docsGrid}>
      {(!docs || docs.length === 0) && <div style={styles.emptyRow}>No documents attached.</div>}
      {(docs || []).map((d, i) => (
        <div key={i} style={styles.docChip}>
          <span style={{ fontSize: 16 }}>📄</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.docChipName} title={d.name}>{d.name}</div>
            <div style={styles.docChipMeta}>{Math.round((d.size || 0) / 1024)} KB</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HistoryTrail({ history, title }) {
  if (!history?.length) return null;
  return (
    <div style={styles.historyBlock}>
      <h4 style={styles.historyTitle}>{title || 'Approval Trail'}</h4>
      {history.map((h, i) => (
        <div key={i} style={styles.historyRow}>
          <span>{roleLabel(h.role)} · {h.name} — {h.action.replace('_', ' ')}{h.comment ? ` (${h.comment})` : ''}</span>
          <span style={styles.historyMeta}>{formatDate(h.date)}</span>
        </div>
      ))}
    </div>
  );
}

// Generic status pill for a workflow status string like 'pending_director' | 'approved' | 'rejected'
export function StatusPill({ status, holderLabel }) {
  const meta = status === 'approved'
    ? { color: theme.emeraldDark, bg: theme.emeraldLight, label: holderLabel || 'Registered' }
    : status === 'rejected'
    ? { color: theme.roseDark, bg: theme.roseLight, label: holderLabel || 'Rejected' }
    : { color: theme.amberDark, bg: theme.amberLight, label: holderLabel || 'Pending' };
  return <span style={{ ...styles.statusPill, color: meta.color, background: meta.bg }}>{meta.label}</span>;
}

// Working / Defective pill for item-condition status
export function ConditionPill({ value }) {
  const working = value !== 'defective';
  return (
    <span style={{
      ...styles.statusPill,
      color: working ? theme.emeraldDark : theme.roseDark,
      background: working ? theme.emeraldLight : theme.roseLight,
    }}>
      {working ? 'Working' : 'Defective'}
    </span>
  );
}

// Panel shown inside the entry drawer for requesting / approving a Working ⇄ Defective change.
// props:
//   currentValue, pendingChange ({ proposedValue, status, chain, history } | undefined)
//   actor, accent
//   onRequest(newValue, comment) — assistant/anyone raises a change request
//   onApproveChange(comment) / onRejectChange(comment) — approver actions when it's their turn
export function ConditionChangeBlock({ currentValue, pendingChange, actor, accent, onRequest, onApproveChange, onRejectChange }) {
  const [proposed, setProposed] = React.useState(currentValue === 'defective' ? 'working' : 'defective');
  const [comment, setComment] = React.useState('');

  const actionableByMe = pendingChange && pendingChange.status === `pending_${actor.role}`;

  return (
    <div style={styles.conditionBlock}>
      <div style={styles.conditionRow}>
        <span style={styles.fieldLabel}>Current Condition</span>
        <ConditionPill value={currentValue} />
      </div>

      {pendingChange && pendingChange.status !== 'applied' ? (
        <div style={styles.pendingChangeNotice}>
          <div style={{ fontSize: 12.5, color: theme.amberDark, fontWeight: 700 }}>
            Change requested → <ConditionPill value={pendingChange.proposedValue} /> · {pendingChange.status.replace('pending_', 'awaiting ').replace('_', ' ')}
          </div>
          {actionableByMe && onApproveChange && (
            <div style={{ marginTop: 10 }}>
              <textarea
                className="sd-textarea" style={styles.commentBoxSmall} placeholder="Optional comment..."
                value={comment} onChange={(e) => setComment(e.target.value)}
              />
              <div style={styles.actionRow}>
                <button className="sd-btn" style={{ ...styles.approveBtnSmall, background: accent }} onClick={() => onApproveChange(comment)}>
                  ✓ Approve Change
                </button>
                <button className="sd-btn" style={styles.rejectBtnSmall} onClick={() => onRejectChange(comment)}>✕ Reject Change</button>
              </div>
            </div>
          )}
          <HistoryTrail history={pendingChange.history} title="Change Request Trail" />
        </div>
      ) : (
        onRequest && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ ...styles.field, minWidth: 160 }}>
                <label style={styles.fieldLabel}>Mark item as</label>
                <select className="sd-input" style={styles.input} value={proposed} onChange={(e) => setProposed(e.target.value)}>
                  <option value="working">Working</option>
                  <option value="defective">Defective</option>
                </select>
              </div>
              <button className="sd-btn" style={{ ...styles.approveBtnSmall, background: accent, flex: 'none', padding: '10px 18px' }}
                onClick={() => onRequest(proposed, comment)}>
                Submit for Approval
              </button>
            </div>
            <textarea
              className="sd-textarea" style={{ ...styles.commentBoxSmall, marginTop: 8 }} placeholder="Optional note (e.g. reason for defect)..."
              value={comment} onChange={(e) => setComment(e.target.value)}
            />
          </div>
        )
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Filter bar — from/to date, month, year, status, free text search       */
/* ---------------------------------------------------------------------- */
const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function FilterBar({ filters, setFilters, statusOptions, extraFields, accent, onDownloadReport }) {
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const years = React.useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => y - i);
  }, []);

  return (
    <div style={styles.filterBar}>
      <div style={styles.filterGrid}>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>From Date</label>
          <input className="sd-input" style={styles.input} type="date" value={filters.fromDate || ''} onChange={(e) => set('fromDate', e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>To Date</label>
          <input className="sd-input" style={styles.input} type="date" value={filters.toDate || ''} onChange={(e) => set('toDate', e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Month</label>
          <select className="sd-input" style={styles.input} value={filters.month || ''} onChange={(e) => set('month', e.target.value)}>
            <option value="">Any month</option>
            {MONTHS.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Year</label>
          <select className="sd-input" style={styles.input} value={filters.year || ''} onChange={(e) => set('year', e.target.value)}>
            <option value="">Any year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {statusOptions && (
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Status</label>
            <select className="sd-input" style={styles.input} value={filters.status || 'all'} onChange={(e) => set('status', e.target.value)}>
              {statusOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        )}
        {extraFields}
      </div>
      {onDownloadReport && (
        <button className="sd-btn" style={{ ...styles.reportBtn, background: accent }} onClick={onDownloadReport}>
          ⬇ Download Report (PDF)
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
export const styles = {
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: theme.textSecondary },
  input: { padding: '10px 14px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary, background: theme.surface, width: '100%' },
  staticValue: { fontSize: 13.5, color: theme.textPrimary, fontWeight: 600 },

  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13.5 },

  section: { marginBottom: 28 },
  sectionHeadRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 12, flexWrap: 'wrap' },
  sectionTitle: { fontSize: 14, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  sectionBody: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: theme.shadowSm },

  groupTitle: { fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` },

  uploadBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: '2px dashed', borderRadius: theme.radiusMd, padding: '26px 14px', cursor: 'pointer', background: theme.bgAlt, textAlign: 'center' },
  uploadLabel: { fontSize: 13, fontWeight: 700, color: theme.textPrimary },
  uploadStatus: { fontSize: 12, color: theme.textMuted },
  docsGrid: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  docChip: { display: 'flex', alignItems: 'center', gap: 8, background: theme.bgAlt, borderRadius: theme.radiusSm, padding: '10px 12px', minWidth: 200, border: `1px solid ${theme.border}` },
  docChipName: { fontSize: 12.5, color: theme.textPrimary, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  docChipMeta: { fontSize: 11, color: theme.textMuted },
  docRemoveBtn: { border: 'none', background: 'transparent', color: theme.roseDark, cursor: 'pointer', fontSize: 13 },
  emptyRow: { padding: '24px 20px', color: theme.textMuted, fontSize: 13.5 },

  historyBlock: { marginTop: 16, paddingTop: 14, borderTop: `1px solid ${theme.border}` },
  historyTitle: { fontSize: 12.5, fontWeight: 800, color: theme.textPrimary, margin: '0 0 8px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: theme.textSecondary, padding: '5px 0', textTransform: 'capitalize', gap: 10 },
  historyMeta: { color: theme.textMuted, fontSize: 11.5, whiteSpace: 'nowrap' },

  statusPill: { fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 999, display: 'inline-block', textTransform: 'capitalize' },

  conditionBlock: { marginTop: 22, paddingTop: 18, borderTop: `1px solid ${theme.border}` },
  conditionRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pendingChangeNotice: { background: theme.amberLight, borderRadius: theme.radiusSm, padding: '12px 14px', marginTop: 10 },
  commentBoxSmall: { width: '100%', minHeight: 52, padding: 10, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 12.5, resize: 'vertical', fontFamily: theme.fontBody },
  actionRow: { display: 'flex', gap: 10, marginTop: 10 },
  approveBtnSmall: { flex: 1, border: 'none', color: '#fff', padding: '10px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 12.5, cursor: 'pointer' },
  rejectBtnSmall: { flex: 1, border: `1px solid ${theme.rose}`, background: theme.roseLight, color: theme.roseDark, padding: '10px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 12.5, cursor: 'pointer' },

  filterBar: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusLg, padding: 18, marginBottom: 20, boxShadow: theme.shadowSm },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 14 },
  reportBtn: { border: 'none', color: '#fff', padding: '11px 20px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 13, cursor: 'pointer' },
};