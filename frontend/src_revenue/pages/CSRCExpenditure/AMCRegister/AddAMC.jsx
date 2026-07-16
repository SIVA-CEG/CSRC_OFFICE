import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEntryById } from '../../../utils/expenditureWorkflow';
import { getCurrentActor, submitAmcEntry } from '../../../utils/amcWorkflow';
import { theme, fontFaceAndUtilities } from '../../../utils/theme';
import { Field, GroupTitle } from '../../../utils/sharedRegisterUI';
import { formatCurrency } from '../../../utils/workflowCore';

const EMPTY_FORM = {
  slNo: '', particulars: '', poNo: '', itemQty: '',
  amcFrom: '', amcTo: '',
  contractNo: '', contractDate: '',
  ctdtNo: '', ctdtDate: '',
  vendorName: '', amount: '',
};

export default function AddAMC() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const accent = theme.violet || '#7C3AED';

  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [linkedItem, setLinkedItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setActor(getCurrentActor());
    const item = getEntryById(itemId);
    setLinkedItem(item);
    if (item) {
      setForm((f) => ({
        ...f,
        particulars: (item.data.items || []).map((it) => it.description).join(', '),
        poNo: item.data.indentPoNo || '',
        itemQty: (item.data.items || []).map((it) => it.articles || it.quantity).filter(Boolean).join(', '),
      }));
    }
  }, [itemId]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.slNo.trim()) { setError('Please enter the S. No. from the AMC register.'); return; }
    if (!form.particulars.trim()) { setError('Please enter the Particulars / item description.'); return; }
    if (!form.contractNo.trim() || !form.contractDate) { setError('Please enter the AMC Contract No. and Date.'); return; }
    if (!form.amcFrom || !form.amcTo) { setError('Please enter the AMC Period From and To dates.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid Amount.'); return; }
    setError('');
    submitAmcEntry(
      { ...form, linkedItemId: itemId, linkedItemSlNo: linkedItem?.slNo, linkedItemSupplier: linkedItem?.data?.manufacturerSupplier },
      actor
    );
    setSubmitted(true);
    setTimeout(() => navigate('/revenue/csrc-expenditure/amc-register/view'), 900);
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: accent }} onClick={() => navigate('/revenue/csrc-expenditure/amc-register')}>
          ← AMC Register Home
        </button>
        <h1 style={styles.title}>Apply for AMC</h1>
        <p style={styles.subtitle}>
          {linkedItem ? `For item: ${linkedItem.data.manufacturerSupplier} — SI No. ${linkedItem.slNo}` : 'Loading linked item...'}
        </p>
      </div>

      <div style={styles.formCard} className="sd-fade-in">
        {submitted && <div style={styles.successBanner}>✓ AMC contract submitted and added to AMC Applied Items.</div>}
        {error && <div style={styles.errorBanner}>{error}</div>}

        <div style={styles.group}>
          <GroupTitle accent={accent}>Item Reference</GroupTitle>
          <div style={styles.fieldGrid}>
            <Field label="S. No." value={form.slNo} onChange={(v) => set('slNo', v)} placeholder="e.g. 06" />
            <Field label="Particulars" value={form.particulars} onChange={(v) => set('particulars', v)} wide />
            <Field label="P.O. No." value={form.poNo} onChange={(v) => set('poNo', v)} />
            <Field label="No. of Items" value={form.itemQty} onChange={(v) => set('itemQty', v)} placeholder="e.g. 14 Nos." />
          </div>
        </div>

        <div style={styles.group}>
          <GroupTitle accent={accent}>AMC Period</GroupTitle>
          <div style={styles.fieldGrid}>
            <Field label="AMC Period From" type="date" value={form.amcFrom} onChange={(v) => set('amcFrom', v)} />
            <Field label="AMC Period To" type="date" value={form.amcTo} onChange={(v) => set('amcTo', v)} />
          </div>
        </div>

        <div style={styles.group}>
          <GroupTitle accent={accent}>Contract / CTDT Reference</GroupTitle>
          <div style={styles.fieldGrid}>
            <Field label="Comprehensive AMC Contract No." value={form.contractNo} onChange={(v) => set('contractNo', v)} />
            <Field label="Contract Date" type="date" value={form.contractDate} onChange={(v) => set('contractDate', v)} />
            <Field label="CTDT No." value={form.ctdtNo} onChange={(v) => set('ctdtNo', v)} />
            <Field label="CTDT Date" type="date" value={form.ctdtDate} onChange={(v) => set('ctdtDate', v)} />
          </div>
        </div>

        <div style={styles.group}>
          <GroupTitle accent={accent}>Vendor &amp; Amount</GroupTitle>
          <div style={styles.fieldGrid}>
            <Field label="M/s. (Vendor Name & Place)" value={form.vendorName} onChange={(v) => set('vendorName', v)} wide placeholder="e.g. M/s. AC Care, Chennai-87" />
            <Field label="Amount (₹)" type="number" value={form.amount} onChange={(v) => set('amount', v)} />
          </div>
          {form.amount && <div style={styles.amountPreview}>Amount: {formatCurrency(form.amount)}</div>}
        </div>

        <button className="sd-btn" style={{ ...styles.submitBtn, background: accent }} onClick={handleSubmit}>
          Submit AMC Contract →
        </button>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 24 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5 },
  formCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 28, boxShadow: theme.shadowSm },
  group: { marginBottom: 28 },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  successBanner: { background: theme.emeraldLight, color: theme.emeraldDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  errorBanner: { background: theme.roseLight, color: theme.roseDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  amountPreview: { marginTop: 10, fontSize: 13.5, fontWeight: 700, color: theme.textPrimary },
  submitBtn: { border: 'none', color: '#fff', padding: '14px 28px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 14.5, cursor: 'pointer' },
};