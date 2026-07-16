import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  getCurrentActor,
  isApproverRole,
  getRequestsByType,
  submitRequest,
  approveRequest,
  rejectRequest,
  currentHolderLabel,
  formatDate,
} from '../../utils/staffWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';

const EMPTY_FORM = {
  department: 'Centre for Sponsored Research and Consultancy',
  employeeCode: '',
  appellation: 'Thiru',
  gender: 'Male',
  firstName: '',
  lastName: '',
  designation: '',
  mobile: '',
  staffType: 'Regular',
  tenureFrom: '',
  tenureTo: '',
  email: '',
  dob: '',
  doj: '',
  allotmentYear: '',
  orderNumber: '',
  orderDate: '',
  salaryType: 'Consolidated Pay',
  bankAccountNumber: '',
  ifscCode: '',
  bankName: 'State Bank of India',
};

const FIELD_GROUPS = [
  {
    title: 'Identity',
    fields: [
      ['department', 'Department', 'text'],
      ['employeeCode', 'Employee Code', 'text'],
      ['appellation', 'Appellation', 'select', ['Thiru', 'Tmt', 'Selvi', 'Dr']],
      ['gender', 'Gender', 'select', ['Male', 'Female', 'Transgender']],
      ['firstName', 'First Name', 'text'],
      ['lastName', 'Last Name', 'text'],
    ],
  },
  {
    title: 'Role & Contact',
    fields: [
      ['designation', 'Designation', 'text'],
      ['mobile', 'Mobile No (Personal)', 'text'],
      ['staffType', 'Regular / Temporary', 'select', ['Regular', 'Temporary']],
      ['email', 'Email ID', 'email'],
    ],
  },
  {
    title: 'Tenure',
    fields: [
      ['tenureFrom', 'Tenure From', 'date'],
      ['tenureTo', 'Tenure To / Completion', 'date'],
    ],
  },
  {
    title: 'Service Record',
    fields: [
      ['dob', 'Date of Birth', 'date'],
      ['doj', 'Date of Joining', 'date'],
      ['allotmentYear', 'Allotment Year', 'text'],
      ['orderNumber', 'Order Number (Proceedings)', 'text'],
      ['orderDate', 'Order Date', 'date'],
    ],
  },
  {
  title: 'Salary & Bank Details',
  fields: [
    ['salaryType', 'Salary Type', 'select', ['Consolidated Pay', 'Daily Wages', 'Daily Wages with Rate Factor']],
    ['bankName', 'Bank Name', 'select', [
      'State Bank of India', 'Indian Bank', 'Canara Bank', 'City Union Bank',
      'Indian Overseas Bank', 'Bank of Baroda', 'Punjab National Bank',
      'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Union Bank of India',
    ]],
    ['bankAccountNumber', 'Bank Account Number', 'text'],
    ['ifscCode', 'IFSC Code', 'text'],
  ],
},
];

const SELECT_OPTIONS = {
  salaryType: ['Consolidated Pay', 'Daily Wages', 'Daily Wages with Rate Factor'],
  bankName: ['State Bank of India', 'Indian Bank', 'Canara Bank', 'City Union Bank', 'Indian Overseas Bank', 'Bank of Baroda', 'Punjab National Bank', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Union Bank of India'],
};

export default function StaffNewAppointment() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });

  useEffect(() => { setActor(getCurrentActor()); }, []);

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={styles.backLink} onClick={() => navigate('/revenue/staff')}>
          ← Staff Details Home
        </button>
        <h1 style={styles.title}>Staff New Appointment</h1>
        <p style={styles.subtitle}>
          {isApproverRole(actor.role)
            ? 'View all appointment requests submitted by the Assistant.'
            : 'Onboard a new staff member — this is submitted and applied immediately.'}
        </p>
      </div>

      {isApproverRole(actor.role) ? (
        <ApprovalQueue actor={actor} />
      ) : (
        <AppointmentForm actor={actor} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Assistant view — the creation form                                  */
/* ------------------------------------------------------------------ */
function AppointmentForm({ actor }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [docs, setDocs] = useState({ joiningLetter: null, vcApproval: null });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFile = (key, file) => {
    setDocs((d) => ({ ...d, [key]: file ? { name: file.name, size: file.size, type: file.type } : null }));
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.employeeCode || !form.designation) {
      setError('Please fill Employee Code, First Name and Designation at minimum.');
      return;
    }
    if (!docs.joiningLetter || !docs.vcApproval) {
      setError('Both the Joining Letter and VC / CC Approval copy are required.');
      return;
    }
    setError('');
    submitRequest('appointment', form, docs, actor);
    setSubmitted(true);
    setForm(EMPTY_FORM);
    setDocs({ joiningLetter: null, vcApproval: null });
    setTimeout(() => setSubmitted(false), 3200);
  };

  return (
    <div style={styles.formCard} className="sd-fade-in">
      {submitted && (
        <div style={styles.successBanner}>
          ✓ Appointment submitted and registered.
        </div>
      )}
      {error && <div style={styles.errorBanner}>{error}</div>}

      {FIELD_GROUPS.map((group) => (
        <div key={group.title} style={styles.group}>
          <h3 style={styles.groupTitle}>{group.title}</h3>
          <div style={styles.fieldGrid}>
            {group.fields.map(([key, label, type, options]) => (
              <FormField
                key={key}
                label={label}
                type={type}
                value={form[key]}
                options={options}
                onChange={(v) => set(key, v)}
              />
            ))}
          </div>
        </div>
      ))}

      <div style={styles.group}>
        <h3 style={styles.groupTitle}>Documents</h3>
        <div style={styles.uploadGrid}>
          <UploadBox
            label="Joining Letter"
            file={docs.joiningLetter}
            onChange={(f) => handleFile('joiningLetter', f)}
            accent={theme.emerald}
          />
          <UploadBox
            label="VC / CC Approval Copy"
            file={docs.vcApproval}
            onChange={(f) => handleFile('vcApproval', f)}
            accent={theme.emerald}
          />
        </div>
      </div>

      <button className="sd-btn" style={styles.submitBtn} onClick={handleSubmit}>
        Submit & Register →
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Approver view — queue for superintendent / DD / director            */
/* ------------------------------------------------------------------ */
function ApprovalQueue({ actor }) {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState({});
  const [comment, setComment] = useState('');
  const [flash, setFlash] = useState('');

  const refresh = () => setRequests(getRequestsByType('appointment'));
  useEffect(() => { refresh(); }, []);

  const pendingMine = useMemo(
    () => requests.filter((r) => r.status === `pending_${actor.role}`),
    [requests, actor.role]
  );
  const others = useMemo(
    () => requests.filter((r) => r.status !== `pending_${actor.role}`),
    [requests, actor.role]
  );

  const open = (r) => { setSelected(r); setEditData(r.data); setComment(''); };
  const close = () => setSelected(null);

  const handleApprove = () => {
    approveRequest(selected.id, actor, editData, comment || undefined);
    setFlash('✓ Approved and forwarded');
    close();
    refresh();
    setTimeout(() => setFlash(''), 2500);
  };

  const handleReject = () => {
    rejectRequest(selected.id, actor, comment || 'Rejected');
    setFlash('Request rejected');
    close();
    refresh();
    setTimeout(() => setFlash(''), 2500);
  };

  return (
    <div className="sd-fade-in">
      {flash && <div style={styles.successBanner}>{flash}</div>}

      

      <Section title="All appointment requests">
        {others.length === 0 && <EmptyRow text="No other requests yet." />}
        {others.map((r) => (
          <RequestRow key={r.id} req={r} onClick={() => open(r)} />
        ))}
      </Section>

      {selected && createPortal(
        <div style={styles.overlay} onClick={close}>
          <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>{selected.data.firstName} {selected.data.lastName}</h2>
                <p style={styles.drawerSub}>{selected.data.designation} · {currentHolderLabel(selected)}</p>
              </div>
              <button style={styles.closeBtn} onClick={close}>✕</button>
            </div>

            <div style={styles.detailGrid}>
              {Object.entries(EMPTY_FORM).map(([key, _]) => {
                const isDate = ['tenureFrom', 'tenureTo', 'dob', 'doj', 'orderDate'].includes(key);
                const isActionable = selected.status === `pending_${actor.role}`;
                return isActionable ? (
                  <EditableDetailField
                    key={key}
                    label={fieldLabel(key)}
                    type={isDate ? 'date' : 'text'}
                    value={editData[key]}
                    options={SELECT_OPTIONS[key]}
                    onChange={(v) => setEditData((d) => ({ ...d, [key]: v }))}
                    />
                ) : (
                  <StaticField key={key} label={fieldLabel(key)} value={isDate ? formatDate(selected.data[key]) : selected.data[key]} />
                );
              })}
            </div>

            <div style={styles.docsRow}>
              <DocChip label="Joining Letter" doc={selected.documents?.joiningLetter} />
              <DocChip label="VC / CC Approval" doc={selected.documents?.vcApproval} />
            </div>

            <HistoryTrail history={selected.history} />

            {selected.status === `pending_${actor.role}` && (
              <div style={styles.actionBlock}>
                <textarea
                  className="sd-textarea"
                  style={styles.commentBox}
                  placeholder="Optional comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div style={styles.actionRow}>
                  <button className="sd-btn" style={styles.approveBtn} onClick={handleApprove}>
                    ✓ Approve & Forward
                  </button>
                  <button className="sd-btn" style={styles.rejectBtn} onClick={handleReject}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared small components                                             */
/* ------------------------------------------------------------------ */
function FormField({ label, type, value, options, onChange }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      {type === 'select' ? (
        <select className="sd-select" style={styles.input} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input className="sd-input" style={styles.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function UploadBox({ label, file, onChange, accent }) {
  return (
    <label style={{ ...styles.uploadBox, borderColor: file ? accent : theme.border }}>
      <input
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <span style={{ fontSize: 22 }}>{file ? '📎' : '⬆️'}</span>
      <span style={styles.uploadLabel}>{label}</span>
      <span style={{ ...styles.uploadStatus, color: file ? accent : theme.textMuted }}>
        {file ? file.name : 'Click to upload'}
      </span>
    </label>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function RequestRow({ req, onClick, highlight }) {
  return (
    <div
      className="sd-row-hover"
      style={{ ...styles.requestRow, ...(highlight ? styles.requestRowHighlight : {}) }}
      onClick={onClick}
    >
      <div style={{ flex: 2, fontWeight: 700, color: theme.textPrimary }}>
        {req.data.firstName} {req.data.lastName}
      </div>
      <div style={{ flex: 1.4, color: theme.textSecondary, fontSize: 13.5 }}>{req.data.designation}</div>
      <div style={{ flex: 1.6, fontSize: 13, color: theme.textMuted }}>{currentHolderLabel(req)}</div>
      <div style={{ flex: 1, fontSize: 12, color: theme.textMuted }}>{formatDate(req.createdBy.date)}</div>
    </div>
  );
}

function EmptyRow({ text }) {
  return <div style={styles.emptyRow}>{text}</div>;
}

function StaticField({ label, value }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      <div style={styles.staticValue}>{value || '—'}</div>
    </div>
  );
}

function EditableDetailField({ label, type, value, options, onChange }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      {options ? (
        <select className="sd-select" style={styles.input} value={value || ''} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input className="sd-input" style={styles.input} type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function DocChip({ label, doc }) {
  return (
    <div style={styles.docChip}>
      <span style={{ fontSize: 16 }}>📄</span>
      <div>
        <div style={styles.docChipLabel}>{label}</div>
        <div style={styles.docChipName}>{doc ? doc.name : 'Not provided'}</div>
      </div>
    </div>
  );
}

function HistoryTrail({ history }) {
  if (!history?.length) return null;
  return (
    <div style={styles.historyBlock}>
      <h4 style={styles.historyTitle}>Approval Trail</h4>
      {history.map((h, i) => (
        <div key={i} style={styles.historyRow}>
          <span>{h.role.replace('_', ' ')} · {h.name} — {h.action}</span>
          <span style={styles.historyMeta}>{formatDate(h.date)}</span>
        </div>
      ))}
    </div>
  );
}

function fieldLabel(key) {
  const map = {
    department: 'Department', employeeCode: 'Employee Code', appellation: 'Appellation',
    gender: 'Gender', firstName: 'First Name', lastName: 'Last Name', designation: 'Designation',
    mobile: 'Mobile No', staffType: 'Regular / Temporary', tenureFrom: 'Tenure From',
    tenureTo: 'Tenure To', email: 'Email ID', dob: 'Date of Birth', doj: 'Date of Joining',
    allotmentYear: 'Allotment Year', orderNumber: 'Order Number', orderDate: 'Order Date',
    salaryType: 'Salary Type', bankName: 'Bank Name',
    bankAccountNumber: 'Bank Account Number', ifscCode: 'IFSC Code',
  };
  return map[key] || key;
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 24 },
  backLink: { border: 'none', background: 'none', color: theme.emerald, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 640 },

  formCard: {
    background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`,
    padding: 28, boxShadow: theme.shadowSm,
  },
  successBanner: {
    background: theme.emeraldLight, color: theme.emeraldDark, padding: '12px 16px',
    borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18,
  },
  errorBanner: {
    background: theme.roseLight, color: theme.roseDark, padding: '12px 16px',
    borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18,
  },
  group: { marginBottom: 26 },
  groupTitle: {
    fontSize: 12, fontWeight: 800, color: theme.emerald, textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${theme.border}`,
  },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: theme.textSecondary },
  input: {
    padding: '10px 14px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`,
    fontSize: 13.5, color: theme.textPrimary, background: theme.surface,
  },
  uploadGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  uploadBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 6, border: '2px dashed', borderRadius: theme.radiusMd, padding: '22px 14px',
    cursor: 'pointer', background: theme.bgAlt, textAlign: 'center',
  },
  uploadLabel: { fontSize: 13, fontWeight: 700, color: theme.textPrimary },
  uploadStatus: { fontSize: 12 },
  submitBtn: {
    border: 'none', background: theme.emerald, color: '#fff', padding: '14px 28px',
    borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 14.5, marginTop: 6,
  },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 14, fontWeight: 800, color: theme.textPrimary, marginBottom: 10 },
  sectionBody: {
    background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`,
    overflow: 'hidden', boxShadow: theme.shadowSm,
  },
  requestRow: {
    display: 'flex', alignItems: 'center', padding: '14px 20px', cursor: 'pointer',
    borderBottom: `1px solid ${theme.border}`,
  },
  requestRowHighlight: { background: theme.emeraldLight },
  emptyRow: { padding: '24px 20px', color: theme.textMuted, fontSize: 13.5 },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 520, maxWidth: '100%', height: '100%', background: theme.surface, padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 21, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  closeBtn: { border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: theme.textSecondary },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20 },
  staticValue: { fontSize: 13.5, color: theme.textPrimary, fontWeight: 600 },

  docsRow: { display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' },
  docChip: { display: 'flex', alignItems: 'center', gap: 8, background: theme.bgAlt, borderRadius: theme.radiusSm, padding: '10px 14px', flex: 1, minWidth: 180 },
  docChipLabel: { fontSize: 11, color: theme.textMuted, fontWeight: 700 },
  docChipName: { fontSize: 12.5, color: theme.textPrimary, fontWeight: 600 },

  historyBlock: { marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.border}` },
  historyTitle: { fontSize: 13, fontWeight: 800, color: theme.textPrimary, margin: '0 0 10px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: theme.textSecondary, padding: '6px 0', textTransform: 'capitalize' },
  historyMeta: { color: theme.textMuted, fontSize: 12 },

  actionBlock: { marginTop: 24, paddingTop: 18, borderTop: `1px solid ${theme.border}` },
  commentBox: {
    width: '100%', minHeight: 64, padding: 12, borderRadius: theme.radiusSm,
    border: `1px solid ${theme.border}`, fontSize: 13, resize: 'vertical', fontFamily: theme.fontBody,
  },
  actionRow: { display: 'flex', gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, border: 'none', background: theme.emerald, color: '#fff', padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5 },
  rejectBtn: { flex: 1, border: `1px solid ${theme.rose}`, background: theme.roseLight, color: theme.roseDark, padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5 },
};