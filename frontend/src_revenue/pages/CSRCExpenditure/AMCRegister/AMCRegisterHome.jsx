import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntries } from '../../../utils/expenditureWorkflow';
import { getAmcCounts, getAmcEntries } from '../../../utils/amcWorkflow';
import { theme, fontFaceAndUtilities } from '../../../utils/theme';
import { formatCurrency } from '../../../utils/workflowCore';

export default function AMCRegisterHome() {
  const navigate = useNavigate();
  const accent = theme.violet || '#7C3AED';
  const accentDark = theme.violetDark || '#5B21B6';
  const accentLight = theme.violetLight || '#F3E8FF';

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [amcCounts, setAmcCounts] = useState({ all: 0 });
  const [appliedItemIds, setAppliedItemIds] = useState(new Set());

  useEffect(() => {
    const nonConsumables = getEntries('non_consumables').filter((e) => e.status === 'approved');
    setItems(nonConsumables);
    setAmcCounts(getAmcCounts());
    setAppliedItemIds(new Set(getAmcEntries().map((a) => a.data.linkedItemId)));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((e) =>
      [e.data.manufacturerSupplier, e.data.pageNo, e.data.invoiceNo, ...(e.data.items || []).map((it) => it.description)]
        .join(' ').toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>

      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: accent }} onClick={() => navigate('/revenue/csrc-expenditure')}>
          ← CSRC Expenditure Home
        </button>
        <h1 style={styles.title}>AMC Register</h1>
        <p style={styles.subtitle}>
          Annual Maintenance Contracts against registered Non-Consumable items.
        </p>
      </div>

      <div style={styles.statRow} className="sd-fade-in">
        <div style={{ ...styles.statChip, background: accentLight }}>
          <div style={{ ...styles.statValue, color: accentDark }}>{amcCounts.all || 0}</div>
          <div style={styles.statLabel}>AMC Contracts Applied</div>
        </div>
        <div style={{ ...styles.statChip, background: theme.indigoLight }}>
          <div style={{ ...styles.statValue, color: theme.indigoDark }}>{items.length}</div>
          <div style={styles.statLabel}>Eligible Non-Consumable Items</div>
        </div>
      </div>

      <div style={styles.toolbarRow} className="sd-fade-in">
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            className="sd-input" style={styles.searchInput}
            placeholder="Search by supplier, page no., invoice, item..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="sd-btn" style={{ ...styles.viewAppliedBtn, borderColor: accent, color: accent }}
          onClick={() => navigate('/revenue/csrc-expenditure/amc-register/view')}>
          📋 View AMC Applied Items ({amcCounts.all || 0})
        </button>
      </div>

      <div style={styles.tableWrap} className="sd-fade-in">
        <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
          <div style={{ ...styles.col, flex: 0.5 }}>SI No.</div>
          <div style={{ ...styles.col, flex: 1.8 }}>Manufacturer / Supplier</div>
          <div style={{ ...styles.col, flex: 2 }}>Item(s)</div>
          <div style={{ ...styles.col, flex: 1.1 }}>Total Cost</div>
          <div style={{ ...styles.col, flex: 1 }}>AMC Status</div>
          <div style={{ ...styles.col, flex: 1 }}> </div>
        </div>

        {filtered.length === 0 && <div style={styles.emptyState}>No registered Non-Consumable items found.</div>}

        {filtered.map((e) => {
          const applied = appliedItemIds.has(e.id);
          return (
            <div key={e.id} className="sd-row-hover" style={styles.tableRow}>
              <div style={{ ...styles.col, flex: 0.5, fontWeight: 700, color: theme.textMuted }}>{e.slNo}</div>
              <div style={{ ...styles.col, flex: 1.8, fontWeight: 700, color: theme.textPrimary }}>{e.data.manufacturerSupplier}</div>
              <div style={{ ...styles.col, flex: 2 }}>{(e.data.items || []).map((it) => it.description).join(', ')}</div>
              <div style={{ ...styles.col, flex: 1.1 }}>{formatCurrency(e.data.total)}</div>
              <div style={{ ...styles.col, flex: 1 }}>
                {applied
                  ? <span style={{ ...styles.pill, color: theme.emeraldDark, background: theme.emeraldLight }}>AMC Applied</span>
                  : <span style={{ ...styles.pill, color: theme.textMuted, background: theme.bgAlt }}>Not Applied</span>}
              </div>
              <div style={{ ...styles.col, flex: 1 }}>
                <button
                  className="sd-btn"
                  style={{ ...styles.applyBtn, background: accent }}
                  onClick={() => navigate(`/revenue/csrc-expenditure/amc-register/${e.id}/add`)}
                >
                  {applied ? 'Apply Again' : 'Apply for AMC →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 20 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 28, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 680 },
  statRow: { display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' },
  statChip: { borderRadius: theme.radiusMd, padding: '14px 22px', minWidth: 180 },
  statValue: { fontSize: 24, fontWeight: 800, fontFamily: theme.fontDisplay },
  statLabel: { fontSize: 12, color: theme.textSecondary, marginTop: 2, fontWeight: 600 },
  toolbarRow: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative', flex: 1, minWidth: 260, display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 14, fontSize: 15, opacity: 0.6 },
  searchInput: { width: '100%', padding: '12px 16px 12px 40px', borderRadius: theme.radiusMd, border: `1px solid ${theme.border}`, background: theme.surface, fontSize: 14, color: theme.textPrimary, boxShadow: theme.shadowSm },
  viewAppliedBtn: { border: '1.5px solid', background: theme.surface, padding: '11px 18px', borderRadius: theme.radiusMd, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  tableWrap: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: theme.shadowSm },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${theme.border}` },
  tableHeadRow: { background: theme.bgAlt, fontSize: 12, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' },
  col: { fontSize: 13.5, color: theme.textSecondary, paddingRight: 12 },
  pill: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, display: 'inline-block' },
  applyBtn: { border: 'none', color: '#fff', padding: '8px 14px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 12, cursor: 'pointer' },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted },
};