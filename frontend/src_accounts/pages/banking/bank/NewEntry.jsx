import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';

const ACCOUNT_TYPES = ['Revenue', 'Project', 'MOPR', 'TTDF', 'Tax'];

export default function NewEntry() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    account: 'Revenue',
    transactionDate: '',
    bankDescription: '',
    bankReference: '',
    debitAmount: '',
    creditAmount: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.transactionDate) e.transactionDate = 'Date is required';
    if (!form.bankDescription.trim()) e.bankDescription = 'Description is required';
    if (!form.debitAmount && !form.creditAmount) {
  e.debitAmount = 'Enter either debit or credit amount';
}

if (form.debitAmount && form.creditAmount) {
  e.debitAmount = 'Only one amount can be entered';
  e.creditAmount = 'Only one amount can be entered';
}
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);

    const entry = {
      id: Date.now(),
      account: form.account,
      transactionDate: form.transactionDate,
      bankDescription: form.bankDescription,
      bankReference: form.bankReference,
      debitAmount: parseFloat(form.debitAmount) || 0,
      creditAmount: parseFloat(form.creditAmount) || 0,
      timestamp: new Date().toISOString(),
    };

// Save to Original Statements
const originalEntries = JSON.parse(
  localStorage.getItem('original_bank_entries') || '[]'
);
originalEntries.unshift(entry);
localStorage.setItem(
  'original_bank_entries',
  JSON.stringify(originalEntries)
);

// Save to Current Statements (editable copy)
const currentEntries = JSON.parse(
  localStorage.getItem('current_bank_entries') || '[]'
);
currentEntries.unshift({ ...entry });
localStorage.setItem(
  'current_bank_entries',
  JSON.stringify(currentEntries)
);

    setTimeout(() => {
      setSubmitting(false);
      navigate('/accounts/banking/bank/current-statements');
    }, 600);
  };

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  return (
    <Layout title="Bank New Entries" subtitle="Banking / Bank / New Entry">
      <div style={s.breadcrumb}>Dashboard / Banking / Bank / New Entry</div>

      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>CSRC A/c — Bank New Entries</h2>
          <p style={s.pageSub}>Record a new bank transaction against a selected account</p>
        </div>
        {/* Account selector pill */}
        <div style={s.accountSelector}>
          {ACCOUNT_TYPES.map(acc => (
            <button
              key={acc}
              onClick={() => set('account', acc)}
              style={{
                ...s.accBtn,
                ...(form.account === acc ? s.accBtnActive : {}),
              }}
            >
              {acc}
            </button>
          ))}
        </div>
      </div>

      <div style={s.card}>
        {/* Accent top bar */}
        <div style={s.cardAccent} />

        <div style={s.cardTitle}>
          <span style={s.cardTitleIcon}>✚</span>
          New Transaction Entry
          <span style={s.accountBadge}>{form.account} Account</span>
        </div>

        <div style={s.formGrid}>
          {/* Transaction Date */}
          <Field label="Transaction Date" error={errors.transactionDate} required>
            <input
              type="date"
              style={{ ...s.input, ...(errors.transactionDate ? s.inputError : {}) }}
              value={form.transactionDate}
              onChange={e => set('transactionDate', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#06b6d4'}
              onBlur={e => e.target.style.borderColor = errors.transactionDate ? '#f43f5e' : 'rgba(255,255,255,0.1)'}
            />
          </Field>

          {/* Bank Description */}
          <Field label="Bank Description" error={errors.bankDescription} required span={2}>
            <input
              type="text"
              placeholder="e.g. TO TRANSFER NEFT UTR NO: SBIN..."
              style={{ ...s.input, ...(errors.bankDescription ? s.inputError : {}) }}
              value={form.bankDescription}
              onChange={e => set('bankDescription', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#06b6d4'}
              onBlur={e => e.target.style.borderColor = errors.bankDescription ? '#f43f5e' : 'rgba(255,255,255,0.1)'}
            />
          </Field>

          {/* Bank Reference */}
          <Field label="Bank Reference" span={2}>
            <input
              type="text"
              placeholder="e.g. TRANSFER TO 4697156044308 V VENKATESAN"
              style={s.input}
              value={form.bankReference}
              onChange={e => set('bankReference', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#06b6d4'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </Field>

          {/* Debit Amount */}
          <Field label="Debit Amount" error={errors.debitAmount}>
            <div style={s.amountWrapper}>
              <span style={s.amountPrefix}>₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                style={{ ...s.input, ...s.amountInput, ...(errors.debitAmount ? s.inputError : {}) }}
                value={form.debitAmount}
                disabled={!!form.creditAmount}
                onChange={e => {
  set('debitAmount', e.target.value);

  if (e.target.value) {
    setForm(p => ({
      ...p,
      debitAmount: e.target.value,
      creditAmount: '',
    }));
  }
}}
                onFocus={e => e.target.style.borderColor = '#f43f5e'}
                onBlur={e => e.target.style.borderColor = errors.debitAmount ? '#f43f5e' : 'rgba(255,255,255,0.1)'}
              />
            </div>
          </Field>

          {/* Credit Amount */}
          <Field label="Credit Amount">
            <div style={s.amountWrapper}>
              <span style={{ ...s.amountPrefix, color: '#10b981' }}>₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                style={{ ...s.input, ...s.amountInput }}
                value={form.creditAmount}
                disabled={!!form.debitAmount}
                onChange={e => {
  set('creditAmount', e.target.value);

  if (e.target.value) {
    setForm(p => ({
      ...p,
      creditAmount: e.target.value,
      debitAmount: '',
    }));
  }
}}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </Field>
        </div>

        {/* Summary preview */}
        {(form.debitAmount || form.creditAmount) && (
          <div style={s.preview}>
            <div style={s.previewItem}>
              <span style={s.previewLabel}>Debit</span>
              <span style={{ ...s.previewVal, color: '#f43f5e' }}>
                ₹ {parseFloat(form.debitAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={s.previewDivider} />
            <div style={s.previewItem}>
              <span style={s.previewLabel}>Credit</span>
              <span style={{ ...s.previewVal, color: '#10b981' }}>
                ₹ {parseFloat(form.creditAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={s.previewDivider} />
            <div style={s.previewItem}>
              <span style={s.previewLabel}>Net</span>
              <span style={{ ...s.previewVal, color: '#06b6d4' }}>
                ₹ {(parseFloat(form.creditAmount || 0) - parseFloat(form.debitAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={() => navigate('/accounts/banking/bank')}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}>
            Cancel
          </button>
          <button
            style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={submitting}
            onMouseEnter={e => !submitting && (e.target.style.boxShadow = '0 6px 28px rgba(6,182,212,0.45)')}
            onMouseLeave={e => e.target.style.boxShadow = '0 4px 18px rgba(6,182,212,0.3)'}
          >
            {submitting ? 'Submitting…' : 'Submit Entry →'}
          </button>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, children, error, required, span }) {
  return (
    <div style={{ gridColumn: span === 2 ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={s.label}>
        {label}
        {required && <span style={{ color: '#f43f5e', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <span style={s.errorMsg}>{error}</span>}
    </div>
  );
}

const s = {
  breadcrumb: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 },
  pageHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 16, marginBottom: 28,
  },
  pageTitle: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 4 },
  pageSub: { fontSize: 13, color: 'var(--text-secondary)' },
  accountSelector: {
    display: 'flex', gap: 6, flexWrap: 'wrap',
    background: 'rgba(255,255,255,0.04)', padding: 5, borderRadius: 12,
    border: '1px solid var(--border)',
  },
  accBtn: {
    padding: '7px 14px', borderRadius: 8, border: 'none',
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Sora, sans-serif', transition: 'all 0.15s',
  },
  accBtnActive: {
    background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    color: '#fff', boxShadow: '0 3px 12px rgba(6,182,212,0.35)',
  },
card: {
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(16px)',
  borderRadius: 20,
  padding: '32px 32px 28px',
  border: '1px solid var(--border)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
  maxWidth: 780,
  width: '100%',
  margin: '0 auto',
},
  cardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    background: 'linear-gradient(90deg, #06b6d4, #0ea5e9, transparent)',
  },
  cardTitle: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
    marginBottom: 28,
  },
  cardTitleIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: 'rgba(6,182,212,0.15)', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#06b6d4',
  },
  accountBadge: {
    marginLeft: 'auto', fontSize: 11, fontWeight: 600,
    padding: '4px 12px', borderRadius: 20,
    background: 'rgba(6,182,212,0.15)', color: '#06b6d4',
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px',
  },
  label: {
    fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.7px',
  },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgb(0, 0, 0)',
    borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)',
    fontSize: 14, fontFamily: 'Sora, sans-serif', outline: 'none',
    transition: 'border-color 0.2s', width: '100%',
    colorScheme: 'dark',
  },
  inputError: { borderColor: '#f43f5e' },
  amountWrapper: { position: 'relative' },
  amountPrefix: {
    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
    color: '#f43f5e', fontWeight: 700, fontSize: 14, zIndex: 1,
  },
  amountInput: { paddingLeft: 28 },
  errorMsg: { fontSize: 11, color: '#f43f5e', marginTop: -3 },
  preview: {
    marginTop: 24, display: 'flex', alignItems: 'center', gap: 0,
    background: 'rgba(255,255,255,0.03)', borderRadius: 12,
    border: '1px solid var(--border)', overflow: 'hidden',
  },
  previewItem: {
    flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 4,
  },
  previewLabel: { fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' },
  previewVal: { fontSize: 18, fontWeight: 700 },
  previewDivider: { width: 1, alignSelf: 'stretch', background: 'var(--border)' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 },
  cancelBtn: {
    padding: '11px 22px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Sora, sans-serif', transition: 'background 0.15s',
  },
  submitBtn: {
    padding: '11px 28px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    color: '#fff', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    boxShadow: '0 4px 18px rgba(6,182,212,0.3)', transition: 'all 0.2s',
  },
};