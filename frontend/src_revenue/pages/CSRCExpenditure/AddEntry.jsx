import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  CATEGORIES,
  getCurrentActor,
  isApproverRole,
  submitEntry,
  getEntries,
  approveEntry,
  rejectEntry,
  requestItemStatusChange,
  approveItemStatusChange,
  rejectItemStatusChange,
  isStatusChangeActionable,
  currentHolderLabel,
  formatDate,
  formatCurrency,
  itemAmount,
  computeGrandTotal,
  fileToMeta,
  markBuybackApplied,
} from '../../utils/expenditureWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';
import {
  Field, StaticField, TotalRow, Section, GroupTitle, UploadBox, DocsList,
  HistoryTrail, ConditionChangeBlock, styles as shared,
} from '../../utils/sharedRegisterUI';

const EMPTY_ITEM = () => ({ id: `it_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, description: '', articles: '', quantity: '', unitPrice: '' });

const EMPTY_FORM = {
  slNo: '',
  pageNo: '',
  indentPoNo: '',
  indentDate: '',
  dateOfReceipt: '',
  manufacturerSupplier: '',
  invoiceNo: '',
  invoiceDate: '',
  csrcProceedingsNo: '',
  csrcProceedingsDate: '',
  location: '',
  remarks: '',
  cgstPct: '',
  sgstPct: '',
  igstPct: '',
  discount: '',
  roundOff: '',
  warrantyFrom: '',
  warrantyTo: '',
};

export default function AddEntry({ category }) {
  const navigate = useNavigate();
  const location = useLocation();
  const meta = CATEGORIES[category];
  const accent = category === 'non_consumables' ? theme.indigo : theme.emerald;
  const accentDark = category === 'non_consumables' ? theme.indigoDark : theme.emeraldDark;
  const [actor, setActor] = useState({ role: 'assistant', name: '' });

  useEffect(() => { setActor(getCurrentActor()); }, []);

  const basePath = `/revenue/csrc-expenditure/${category === 'non_consumables' ? 'non-consumables' : 'consumables'}`;

  // Present when navigated here from "Buyback" in ViewEntries.jsx
  const buybackOf = location.state?.buybackOf || null;
  const buybackSummary = location.state?.buybackSummary || null;

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: accent }} onClick={() => navigate(basePath)}>
          ← {meta.label} Home
        </button>
        <h1 style={styles.title}>
          {isApproverRole(actor.role)
            ? `${meta.label} Entries`
            : buybackOf ? `Buyback — Add Replacement ${meta.label} Entry` : `Add ${meta.label} Entry`}
        </h1>
        <p style={styles.subtitle}>
          {isApproverRole(actor.role)
            ? 'View all stock entries submitted by the Assistant.'
            : buybackOf
            ? 'Register the new item replacing the old one. The old item moves to the Buyback list once submitted.'
            : 'Register a new stock entry from the physical ledger — registered immediately.'}
        </p>
      </div>

      {isApproverRole(actor.role) ? (
        <ApprovalQueue actor={actor} category={category} accent={accent} accentDark={accentDark} meta={meta} />
      ) : (
        <EntryForm
          actor={actor} category={category} accent={accent} accentDark={accentDark}
          buybackOf={buybackOf} buybackSummary={buybackSummary}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Assistant view — creation form                                      */
/* ------------------------------------------------------------------ */
function EntryForm({ actor, category, accent, accentDark, buybackOf, buybackSummary }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([EMPTY_ITEM()]);
  const [docs, setDocs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setItem = (id, key, value) => {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  };
  const addItem = () => setItems((list) => [...list, EMPTY_ITEM()]);
  const removeItem = (id) => setItems((list) => (list.length > 1 ? list.filter((it) => it.id !== id) : list));

  const totals = useMemo(() => computeGrandTotal({ items, ...form }), [items, form]);

  const handleFiles = (fileList) => {
    const metas = Array.from(fileList || []).map(fileToMeta);
    setDocs((d) => [...d, ...metas]);
  };
  const removeDoc = (idx) => setDocs((d) => d.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    const validItems = items.filter((it) => it.description.trim());
    if (validItems.length === 0) {
      setError('Please add at least one item with a description.');
      return;
    }
    if (!form.slNo.trim()) {
      setError('Please enter the Sl. No. from the physical register.');
      return;
    }
    if (!form.pageNo.trim()) {
      setError('Please enter the Page No. from the physical register.');
      return;
    }
    if (!form.manufacturerSupplier.trim()) {
      setError('Please enter the Name of the Manufacturer / Supplier.');
      return;
    }
    if (!form.invoiceNo.trim() || !form.invoiceDate) {
      setError('Please enter the Invoice Number and Invoice Date.');
      return;
    }
    if (docs.length === 0) {
      setError('Please upload at least one invoice / bill copy.');
      return;
    }
    setError('');
    const newEntry = submitEntry(
      category,
      { ...form, items: validItems, ...totals, buybackOf: buybackOf || null },
      docs,
      actor
    );
    if (buybackOf && newEntry) {
      markBuybackApplied(buybackOf, newEntry.id, actor, `Replaced by new item (SI No. ${newEntry.slNo})`);
    }
    setSubmitted(true);
    setForm(EMPTY_FORM);
    setItems([EMPTY_ITEM()]);
    setDocs([]);
    setTimeout(() => setSubmitted(false), 3200);
  };

  return (
    <div style={styles.formCard} className="sd-fade-in">
      {submitted && (
        <div style={styles.successBanner}>✓ Entry submitted and registered.</div>
      )}
      {error && <div style={styles.errorBanner}>{error}</div>}

      {buybackOf && (
        <div style={styles.buybackBanner}>
          🔄 Buyback in progress — replacing <strong>SI No. {buybackSummary?.slNo || '—'}</strong>
          {buybackSummary?.manufacturerSupplier ? ` (${buybackSummary.manufacturerSupplier}` : ''}
          {buybackSummary?.invoiceNo ? `, Invoice ${buybackSummary.invoiceNo})` : buybackSummary?.manufacturerSupplier ? ')' : ''}.
          Fill in the new item below — the old item moves to the Buyback list automatically on submit.
        </div>
      )}

      {/* Register reference fields */}
      <div style={styles.group}>
        <GroupTitle accent={accent}>Register Reference</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Sl. No." value={form.slNo} onChange={(v) => set('slNo', v)} placeholder="e.g. 07" />
          <Field label="Page No." value={form.pageNo} onChange={(v) => set('pageNo', v)} placeholder="e.g. 12" />
          <Field label="Indent / PO No." value={form.indentPoNo} onChange={(v) => set('indentPoNo', v)} />
          <Field label="Indent Date" type="date" value={form.indentDate} onChange={(v) => set('indentDate', v)} />
          <Field label="Date of Receipt" type="date" value={form.dateOfReceipt} onChange={(v) => set('dateOfReceipt', v)} />
          <Field label="Location" value={form.location} onChange={(v) => set('location', v)} placeholder="e.g. CSRC Server Room" />
        </div>
      </div>

      {/* Warranty */}
      <div style={styles.group}>
        <GroupTitle accent={accent}>Warranty Information</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Warranty From" type="date" value={form.warrantyFrom} onChange={(v) => set('warrantyFrom', v)} />
          <Field label="Warranty To" type="date" value={form.warrantyTo} onChange={(v) => set('warrantyTo', v)} />
        </div>
      </div>

      {/* Supplier / invoice */}
      <div style={styles.group}>
        <GroupTitle accent={accent}>Manufacturer / Supplier &amp; Invoice</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="Name of Manufacturer / Supplier" value={form.manufacturerSupplier} onChange={(v) => set('manufacturerSupplier', v)} wide />
          <Field label="Invoice No." value={form.invoiceNo} onChange={(v) => set('invoiceNo', v)} />
          <Field label="Invoice Date" type="date" value={form.invoiceDate} onChange={(v) => set('invoiceDate', v)} />
        </div>
      </div>

      {/* CSRC proceedings */}
      <div style={styles.group}>
        <GroupTitle accent={accent}>CSRC Proceedings</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="CSRC Proceedings No." value={form.csrcProceedingsNo} onChange={(v) => set('csrcProceedingsNo', v)} />
          <Field label="CSRC Proceedings Date" type="date" value={form.csrcProceedingsDate} onChange={(v) => set('csrcProceedingsDate', v)} />
        </div>
      </div>

      {/* Items table */}
      <div style={styles.group}>
        <GroupTitle accent={accent}>Items / Description</GroupTitle>
        <div style={styles.itemsTableWrap}>
          <div style={styles.itemsHeadRow}>
            <div style={{ flex: 3 }}>Description</div>
            <div style={{ flex: 1.2 }}>No. of Articles</div>
            <div style={{ flex: 1 }}>Quantity</div>
            <div style={{ flex: 1.2 }}>Unit Price (₹)</div>
            <div style={{ flex: 1.2 }}>Amount (₹)</div>
            <div style={{ width: 34 }} />
          </div>
          {items.map((it) => (
            <div key={it.id} style={styles.itemsRow}>
              <input
                className="sd-input" style={{ ...styles.itemInput, flex: 3 }}
                placeholder="e.g. Computer Server (Model, S/N, warranty...)"
                value={it.description} onChange={(e) => setItem(it.id, 'description', e.target.value)}
              />
              <input
                className="sd-input" style={{ ...styles.itemInput, flex: 1.2 }}
                placeholder="e.g. 1 No." value={it.articles} onChange={(e) => setItem(it.id, 'articles', e.target.value)}
              />
              <input
                className="sd-input" style={{ ...styles.itemInput, flex: 1 }} type="number"
                placeholder="Qty" value={it.quantity} onChange={(e) => setItem(it.id, 'quantity', e.target.value)}
              />
              <input
                className="sd-input" style={{ ...styles.itemInput, flex: 1.2 }} type="number"
                placeholder="0.00" value={it.unitPrice} onChange={(e) => setItem(it.id, 'unitPrice', e.target.value)}
              />
              <div style={{ ...styles.itemAmountCell, flex: 1.2 }}>{formatCurrency(itemAmount(it))}</div>
              <button type="button" style={styles.removeItemBtn} onClick={() => removeItem(it.id)}>✕</button>
            </div>
          ))}
        </div>
        <button type="button" style={{ ...styles.addItemBtn, color: accent, borderColor: accent }} onClick={addItem}>
          + Add Item Row
        </button>
      </div>

      {/* Cost split */}
      <div style={styles.group}>
        <GroupTitle accent={accent}>Cost Split</GroupTitle>
        <div style={styles.fieldGrid}>
          <Field label="CGST %" type="number" value={form.cgstPct} onChange={(v) => set('cgstPct', v)} />
          <Field label="SGST %" type="number" value={form.sgstPct} onChange={(v) => set('sgstPct', v)} />
          <Field label="IGST %" type="number" value={form.igstPct} onChange={(v) => set('igstPct', v)} />
          <Field label="Discount (₹)" type="number" value={form.discount} onChange={(v) => set('discount', v)} />
          <Field label="Round Off (₹)" type="number" value={form.roundOff} onChange={(v) => set('roundOff', v)} />
        </div>

        <div style={styles.totalsBox}>
          <TotalRow label="Sub Total" value={totals.subTotal} formatCurrency={formatCurrency} />
          <TotalRow label="CGST" value={totals.cgst} formatCurrency={formatCurrency} />
          <TotalRow label="SGST" value={totals.sgst} formatCurrency={formatCurrency} />
          <TotalRow label="IGST" value={totals.igst} formatCurrency={formatCurrency} />
          <TotalRow label="Grand Total" value={totals.total} bold color={accentDark} formatCurrency={formatCurrency} />
        </div>
      </div>

      {/* Documents */}
      <div style={styles.group}>
        <GroupTitle accent={accent}>Invoice / Bill Uploads</GroupTitle>
        <UploadBox docs={docs} onFiles={handleFiles} onRemove={removeDoc} accent={accent} label="Click to upload invoice(s) / bill(s)" />
      </div>

      {/* Remarks */}
      <div style={styles.group}>
        <GroupTitle accent={accent}>Remarks</GroupTitle>
        <textarea
          className="sd-textarea" style={styles.remarksBox}
          placeholder="Include project / to which they relate, disposal notes, etc."
          value={form.remarks} onChange={(e) => set('remarks', e.target.value)}
        />
      </div>

      <button className="sd-btn" style={{ ...styles.submitBtn, background: accent }} onClick={handleSubmit}>
        Submit &amp; Register →
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Approver view                                                       */
/* ------------------------------------------------------------------ */
function ApprovalQueue({ actor, category, accent, accentDark, meta }) {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [flash, setFlash] = useState('');

  const refresh = () => setEntries(getEntries(category));
  useEffect(() => { refresh(); }, [category]);

  const pendingMine = useMemo(() => entries.filter((e) => e.status === `pending_${actor.role}`), [entries, actor.role]);
  const others = useMemo(() => entries.filter((e) => e.status !== `pending_${actor.role}`), [entries, actor.role]);

  const open = (e) => { setSelected(e); setComment(''); };
  const close = () => setSelected(null);

  const handleApprove = () => {
    approveEntry(selected.id, actor, null, comment || undefined);
    setFlash('✓ Approved and forwarded'); close(); refresh(); setTimeout(() => setFlash(''), 2500);
  };
  const handleReject = () => {
    rejectEntry(selected.id, actor, comment || 'Rejected');
    setFlash('Entry rejected'); close(); refresh(); setTimeout(() => setFlash(''), 2500);
  };

  return (
    <div className="sd-fade-in">
      {flash && <div style={styles.successBanner}>{flash}</div>}

      <Section title={`All ${meta.label.toLowerCase()} entries`}>
        {others.length === 0 && <div style={shared.emptyRow}>No other entries yet.</div>}
        {others.map((e) => <EntryRow key={e.id} entry={e} onClick={() => open(e)} />)}
      </Section>

      {selected && createPortal(
        <EntryDrawer
          entry={selected}
          onClose={close}
          actor={actor}
          accent={accent}
          accentDark={accentDark}
          comment={comment}
          setComment={setComment}
          onApprove={handleApprove}
          onReject={handleReject}
          onRefresh={refresh}
        />,
        document.body
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared drawer (used by ApprovalQueue here and re-exported for View) */
/* ------------------------------------------------------------------ */
export function EntryDrawer({ entry, onClose, actor, accent, accentDark, comment, setComment, onApprove, onReject, onRefresh }) {
  const [localEntry, setLocalEntry] = useState(entry);
  useEffect(() => { setLocalEntry(entry); }, [entry]);

  const actionable = actor && localEntry.status === `pending_${actor.role}`;

  const pendingStatusChange = localEntry.pendingChanges && localEntry.pendingChanges.itemStatus;

  const refreshLocal = () => {
    onRefresh && onRefresh();
    // pull the freshest copy so the drawer reflects the change immediately
    setLocalEntry((prev) => ({ ...prev }));
  };

  const handleRequestStatus = (proposedValue, noteComment) => {
    requestItemStatusChange(localEntry.id, actor, proposedValue, noteComment);
    refreshLocal();
    setLocalEntry((prev) => ({
      ...prev,
      data: { ...prev.data, itemStatus: proposedValue },
    }));
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} className="sd-scroll" onClick={(e) => e.stopPropagation()}>
        <div style={styles.drawerHeader}>
          <div>
            <div style={{ ...styles.slBadge, background: `${accent}22`, color: accentDark }}>SI No. {localEntry.data.slNo || '—'} · Page {localEntry.data.pageNo || '—'}</div>
            <h2 style={styles.drawerTitle}>{localEntry.data.manufacturerSupplier}</h2>
            <p style={styles.drawerSub}>{currentHolderLabel(localEntry)}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.fieldGrid}>
          <StaticField label="Sl. No." value={localEntry.data.slNo} />
          <StaticField label="Page No." value={localEntry.data.pageNo} />
          <StaticField label="Indent / PO No." value={localEntry.data.indentPoNo} />
          <StaticField label="Indent Date" value={formatDate(localEntry.data.indentDate)} />
          <StaticField label="Date of Receipt" value={formatDate(localEntry.data.dateOfReceipt)} />
          <StaticField label="Location" value={localEntry.data.location} />
          <StaticField label="Invoice No." value={localEntry.data.invoiceNo} />
          <StaticField label="Invoice Date" value={formatDate(localEntry.data.invoiceDate)} />
          <StaticField label="CSRC Proceedings No." value={localEntry.data.csrcProceedingsNo} />
          <StaticField label="CSRC Proceedings Date" value={formatDate(localEntry.data.csrcProceedingsDate)} />
          <StaticField label="Warranty From" value={formatDate(localEntry.data.warrantyFrom)} />
          <StaticField label="Warranty To" value={formatDate(localEntry.data.warrantyTo)} />
        </div>

        {localEntry.data.buybackOf && (
          <div style={styles.buybackNotice}>
            ↺ This item was registered as a <strong>buyback replacement</strong>.
          </div>
        )}
        {localEntry.buyback && (
          <div style={styles.buybackNotice}>
            🔁 This item was <strong>replaced via buyback</strong> on {formatDate(localEntry.buyback.date)}.
          </div>
        )}

        <h4 style={styles.drawerSectionTitle}>Items</h4>
        <div style={styles.itemsTableWrap}>
          <div style={styles.itemsHeadRow}>
            <div style={{ flex: 3 }}>Description</div>
            <div style={{ flex: 1 }}>Articles</div>
            <div style={{ flex: 1 }}>Qty</div>
            <div style={{ flex: 1.2 }}>Unit Price</div>
            <div style={{ flex: 1.2 }}>Amount</div>
          </div>
          {(localEntry.data.items || []).map((it) => (
            <div key={it.id} style={styles.itemsRowStatic}>
              <div style={{ flex: 3 }}>{it.description}</div>
              <div style={{ flex: 1 }}>{it.articles || '—'}</div>
              <div style={{ flex: 1 }}>{it.quantity || '—'}</div>
              <div style={{ flex: 1.2 }}>{formatCurrency(it.unitPrice)}</div>
              <div style={{ flex: 1.2 }}>{formatCurrency(itemAmount(it))}</div>
            </div>
          ))}
        </div>

        <div style={styles.totalsBox}>
          <TotalRow label="Sub Total" value={localEntry.data.subTotal} formatCurrency={formatCurrency} />
          <TotalRow label="CGST" value={localEntry.data.cgst} formatCurrency={formatCurrency} />
          <TotalRow label="SGST" value={localEntry.data.sgst} formatCurrency={formatCurrency} />
          <TotalRow label="IGST" value={localEntry.data.igst} formatCurrency={formatCurrency} />
          <TotalRow label="Grand Total" value={localEntry.data.total} bold color={accentDark} formatCurrency={formatCurrency} />
        </div>

        {localEntry.data.remarks && (
          <>
            <h4 style={styles.drawerSectionTitle}>Remarks</h4>
            <p style={styles.remarksText}>{localEntry.data.remarks}</p>
          </>
        )}

        <h4 style={styles.drawerSectionTitle}>Invoice / Bill Documents</h4>
        <DocsList docs={localEntry.documents} />

        <HistoryTrail history={localEntry.history} />

        {actionable && onApprove && (
          <div style={styles.actionBlock}>
            <textarea
              className="sd-textarea" style={styles.commentBox} placeholder="Optional comment..."
              value={comment} onChange={(e) => setComment(e.target.value)}
            />
            <div style={styles.actionRow}>
              <button className="sd-btn" style={{ ...styles.approveBtn, background: accent }} onClick={onApprove}>✓ Approve &amp; Forward</button>
              <button className="sd-btn" style={styles.rejectBtn} onClick={onReject}>✕ Reject</button>
            </div>
          </div>
        )}

        {/* Working / Defective condition — only available once the entry is fully registered */}
        {localEntry.status === 'approved' && (
          <ConditionChangeBlock
            currentValue={localEntry.data.itemStatus}
            pendingChange={pendingStatusChange}
            actor={actor}
            accent={accent}
            onRequest={handleRequestStatus}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* small local bits                                                    */
/* ------------------------------------------------------------------ */
function EntryRow({ entry, onClick, highlight, accent }) {
  return (
    <div className="sd-row-hover" style={{ ...styles.entryRow, ...(highlight ? { background: `${accent}14` } : {}) }} onClick={onClick}>
      <div style={{ flex: 0.5, fontWeight: 700, color: theme.textMuted }}>#{entry.data.slNo || '—'}</div>
      <div style={{ flex: 0.6, fontSize: 12.5, color: theme.textMuted }}>Pg {entry.data.pageNo || '—'}</div>
      <div style={{ flex: 2, fontWeight: 700, color: theme.textPrimary }}>{entry.data.manufacturerSupplier}</div>
      <div style={{ flex: 1.6, fontSize: 13, color: theme.textMuted }}>Invoice {entry.data.invoiceNo}</div>
      <div style={{ flex: 1.2, fontSize: 13.5, color: theme.textSecondary }}>{formatCurrency(entry.data.total)}</div>
      <div style={{ flex: 1.6, fontSize: 13, color: theme.textMuted }}>{currentHolderLabel(entry)}</div>
      <div style={{ flex: 1, fontSize: 12, color: theme.textMuted }}>{formatDate(entry.createdBy.date)}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 24 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 680 },

  successBanner: { background: theme.emeraldLight, color: theme.emeraldDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },
  buybackBanner: { background: theme.indigoLight || '#EEF2FF', color: theme.indigoDark || '#3730A3', padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13, marginBottom: 18, lineHeight: 1.5 },
  buybackNotice: { background: theme.amberLight, color: theme.amberDark, padding: '10px 14px', borderRadius: theme.radiusSm, fontSize: 12.5, fontWeight: 600, marginTop: 14 },
  errorBanner: { background: theme.roseLight, color: theme.roseDark, padding: '12px 16px', borderRadius: theme.radiusSm, fontWeight: 600, fontSize: 13.5, marginBottom: 18 },

  formCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 28, boxShadow: theme.shadowSm },
  group: { marginBottom: 28 },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },

  itemsTableWrap: { background: theme.bgAlt, borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, overflow: 'hidden', marginBottom: 12 },
  itemsHeadRow: { display: 'flex', gap: 10, padding: '10px 14px', fontSize: 11.5, fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: `1px solid ${theme.border}` },
  itemsRow: { display: 'flex', gap: 10, padding: '10px 14px', alignItems: 'center', borderBottom: `1px solid ${theme.border}` },
  itemsRowStatic: { display: 'flex', gap: 10, padding: '10px 14px', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, fontSize: 13.5, color: theme.textPrimary },
  itemInput: { padding: '8px 10px', borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13, color: theme.textPrimary, background: theme.surface },
  itemAmountCell: { fontSize: 13.5, fontWeight: 700, color: theme.textPrimary, textAlign: 'right', paddingRight: 6 },
  removeItemBtn: { width: 26, height: 26, border: 'none', borderRadius: '50%', background: theme.roseLight, color: theme.roseDark, cursor: 'pointer', fontSize: 12 },
  addItemBtn: { border: '1.5px dashed', background: 'transparent', padding: '8px 16px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 13, cursor: 'pointer' },

  totalsBox: { background: theme.bgAlt, borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, padding: '14px 18px', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 },

  remarksBox: { width: '100%', minHeight: 72, padding: 12, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13, resize: 'vertical', fontFamily: theme.fontBody },
  remarksText: { fontSize: 13.5, color: theme.textSecondary, lineHeight: 1.6, background: theme.bgAlt, padding: '12px 14px', borderRadius: theme.radiusSm },

  submitBtn: { border: 'none', color: '#fff', padding: '14px 28px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 14.5, cursor: 'pointer' },

  entryRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(30,33,64,0.35)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 },
  drawer: { width: 620, maxWidth: '100%', height: '100%', background: theme.surface, padding: '28px 28px 60px', overflowY: 'auto', boxShadow: '-20px 0 50px rgba(30,33,64,0.15)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  slBadge: { display: 'inline-block', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, marginBottom: 8 },
  drawerTitle: { fontFamily: theme.fontDisplay, fontSize: 21, fontWeight: 800, margin: 0, color: theme.textPrimary },
  drawerSub: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  drawerSectionTitle: { fontSize: 13, fontWeight: 800, color: theme.textPrimary, margin: '22px 0 10px' },
  closeBtn: { border: 'none', background: theme.bgAlt, width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: theme.textSecondary },

  actionBlock: { marginTop: 24, paddingTop: 18, borderTop: `1px solid ${theme.border}` },
  commentBox: { width: '100%', minHeight: 64, padding: 12, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: 13, resize: 'vertical', fontFamily: theme.fontBody },
  actionRow: { display: 'flex', gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, border: 'none', color: '#fff', padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' },
  rejectBtn: { flex: 1, border: `1px solid ${theme.rose}`, background: theme.roseLight, color: theme.roseDark, padding: '12px', borderRadius: theme.radiusSm, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' },
};