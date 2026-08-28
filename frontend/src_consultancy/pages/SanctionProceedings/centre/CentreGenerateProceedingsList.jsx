// PATH: frontend/src_consultancy/pages/SanctionProceedings/Centre/CentreGenerateProceedingsList.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../../components/FilterBar';
import SectionListTable from '../../../components/SectionListTable';
import { loadQueue, saveQueue, getListRows, submitAction } from '../../../data/consultancyWorkflow';

const selectStyle = { fontSize: 12.5, padding: '7px 10px', borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', minWidth: 100 };

const CentreGenerateProceedingsList = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue, setQueue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});
  const [edits, setEdits] = useState({}); // { [id]: { pcr, ctdtRem } }

  const setEdit = (id, patch) => setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const allRows = getListRows(queue, 'proceedings-centre-generate', role);
  const rows = useMemo(() => allRows.filter((r) => {
    if (filters.q && !`${r.id} ${r.consultantName}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.deptCampus && r.deptCampus !== filters.deptCampus) return false;
    if (filters.type && r.type !== filters.type) return false;
    return true;
  }), [allRows, filters]);

  const deptCampusOptions = [...new Set(allRows.map((r) => r.deptCampus))];
  const typeOptions = [...new Set(allRows.map((r) => r.type))];

  const columns = [
    { key: 'id', label: 'ACF ID' },
    { key: 'consultantName', label: 'Consultant Name' },
    { key: 'deptCampus', label: 'Department-Campus' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
    { key: 'remAmt', label: 'Rem Amt', render: (r) => (r.remAmt === '' || r.remAmt == null ? '' : Number(r.remAmt).toLocaleString('en-IN')) },
    {
      key: 'pcr', label: 'PCR',
      render: (r) => (
        <select style={selectStyle} value={edits[r.id]?.pcr ?? r.pcr ?? ''} onChange={(e) => setEdit(r.id, { pcr: e.target.value })}>
          <option value="">--SELECT--</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ),
    },
    {
      key: 'ctdtRem', label: 'CTDT Rem',
      render: (r) => (
        <select style={selectStyle} value={edits[r.id]?.ctdtRem ?? r.ctdtRem ?? ''} onChange={(e) => setEdit(r.id, { ctdtRem: e.target.value })}>
          <option value="">--SELECT--</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ),
    },
  ];

  const handleSubmit = (row, action, extra) => {
    const edit = edits[row.id] || {};
    const next = submitAction(queue, 'proceedings-centre-generate', row.id, role, action, {
      ...extra, pcr: edit.pcr ?? row.pcr, ctdtRem: edit.ctdtRem ?? row.ctdtRem,
    });
    setQueue(next);
    saveQueue(next);
    setEdits((prev) => { const p = { ...prev }; delete p[row.id]; return p; });
  };

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Centre Generate Proceedings</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>
        Review approved permissions/invoices for centre &amp; other campuses and generate sanction proceedings.
      </p>
      <FilterBar filters={filters} onChange={setFilters} deptCampusOptions={deptCampusOptions} typeOptions={typeOptions} />
      <SectionListTable columns={columns} rows={rows} actionOptions={['GENERATED']} onSubmit={handleSubmit} onView={handleView} />
    </div>
  );
};

export default CentreGenerateProceedingsList;