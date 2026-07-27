// PATH: frontend/src_consultancy/components/FilterBar.jsx

import React from 'react';

const styles = {
  wrap: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 },
  search: {
    fontSize: 13.5, padding: '9px 14px', borderRadius: 9, border: '1px solid #d1d5db',
    minWidth: 240, outline: 'none',
  },
  select: {
    fontSize: 13, padding: '8px 12px', borderRadius: 9, border: '1px solid #d1d5db',
    background: '#fff', outline: 'none', color: '#374151',
  },
  advBtn: {
    fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 9,
    border: '1px solid #d1d5db', background: '#fff', color: '#334155', cursor: 'pointer',
  },
};

/**
 * Shared search + filter bar used identically by every section's List /
 * Transferred / Completed table. `filters` / `onChange` are controlled by
 * the parent page; `deptCampusOptions` and `typeOptions` are derived by the
 * parent from whatever rows are currently loaded.
 */
const FilterBar = ({ filters, onChange, deptCampusOptions = [], typeOptions = [], onAdvancedSearch }) => {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div style={styles.wrap}>
      <input
        style={styles.search}
        placeholder="Search by ID, name, firm…"
        value={filters.q || ''}
        onChange={set('q')}
      />
      {deptCampusOptions.length > 0 && (
        <select style={styles.select} value={filters.deptCampus || ''} onChange={set('deptCampus')}>
          <option value="">All Dept / Campus</option>
          {deptCampusOptions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
      {typeOptions.length > 0 && (
        <select style={styles.select} value={filters.type || ''} onChange={set('type')}>
          <option value="">All Types</option>
          {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
      <input type="date" style={styles.select} value={filters.fromDate || ''} onChange={set('fromDate')} />
      <input type="date" style={styles.select} value={filters.toDate || ''} onChange={set('toDate')} />
      {onAdvancedSearch && (
        <button style={styles.advBtn} onClick={onAdvancedSearch}>🔍 Advanced Search</button>
      )}
    </div>
  );
};

export default FilterBar;