// PATH: frontend/src_consultancy/pages/SanctionProceedings/Centre/CentreGeneratePCRList.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../../components/FilterBar';
import SectionListTable from '../../../components/SectionListTable';
import { loadQueue, saveQueue, getListRows, submitAction } from '../../../data/consultancyWorkflow';

const dateStyle = { fontSize: 12.5, padding: '6px 9px', borderRadius: 7, border: '1px solid #d1d5db' };

const CentreGeneratePCRList = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue, setQueue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});
  const [edits, setEdits] = useState({}); // { [id]: { genPcrDate } }

  const setEdit = (id, patch) => setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const allRows = getListRows(queue, 'proceedings-centre-generate-pcr', role);
  const rows = useMemo(() => allRows.filter((r) =>
    !filters.q || `${r.acfId} ${r.consultantName}`.toLowerCase().includes(filters.q.toLowerCase())
  ), [allRows, filters]);

  const columns = [
    { key: 'acfId', label: 'ACF ID' },
    { key: 'sanctionBillDate', label: 'Sanction Bill Date' },
    { key: 'consultantName', label: 'Consultant Name' },
    { key: 'deptCampus', label: 'Dept-Campus' },
    { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
    { key: 'pcrStatus', label: 'PCR Status', render: (r) => r.pcrStatus || '' },
    { key: 'ctdtRem', label: 'CTDT Rem', render: (r) => r.ctdtRem || '' },
    {
      key: 'genPcrDate', label: 'Gen PCR Date',
      render: (r) => (
        <input type="date" style={dateStyle} value={edits[r.id]?.genPcrDate ?? r.genPcrDate ?? ''}
          onChange={(e) => setEdit(r.id, { genPcrDate: e.target.value })} />
      ),
    },
  ];

  const handleSubmit = (row, action, extra) => {
    const edit = edits[row.id] || {};
    const next = submitAction(queue, 'proceedings-centre-generate-pcr', row.id, role, action, {
      ...extra, genPcrDate: edit.genPcrDate ?? row.genPcrDate,
    });
    setQueue(next);
    saveQueue(next);
    setEdits((prev) => { const p = { ...prev }; delete p[row.id]; return p; });
  };

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Centre Generate PCR Proceedings</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>
        Records where PCR was No at Sanction &amp; Bill stage. The Tapal Date field below doubles as PCR HC Date.
      </p>
      <FilterBar filters={filters} onChange={setFilters} />
      <SectionListTable columns={columns} rows={rows} actionOptions={['PCR_GENERATED']} onSubmit={handleSubmit} onView={handleView} />
    </div>
  );
};

export default CentreGeneratePCRList;