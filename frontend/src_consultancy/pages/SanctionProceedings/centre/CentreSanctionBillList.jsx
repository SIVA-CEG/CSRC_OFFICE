// PATH: frontend/src_consultancy/pages/SanctionProceedings/Centre/CentreSanctionBillList.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../../components/FilterBar';
import SectionListTable from '../../../components/SectionListTable';
import { loadQueue, saveQueue, getListRows, submitAction } from '../../../data/consultancyWorkflow';

const CentreSanctionBillList = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue, setQueue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});

  const allRows = getListRows(queue, 'proceedings-centre-sanction-bill', role);
  const rows = useMemo(() => allRows.filter((r) => {
    if (filters.q && !`${r.acfId} ${r.consultantName}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.deptCampus && r.deptCampus !== filters.deptCampus) return false;
    if (filters.type && r.type !== filters.type) return false;
    return true;
  }), [allRows, filters]);

  const deptCampusOptions = [...new Set(allRows.map((r) => r.deptCampus))];
  const typeOptions = [...new Set(allRows.map((r) => r.type))];

  const columns = [
    { key: 'acfId', label: 'ACF ID' },
    { key: 'consultantName', label: 'Consultant Name' },
    { key: 'deptCampus', label: 'Dept, Cam' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
    { key: 'pcr', label: 'PCR', render: (r) => r.pcr || '' },
    { key: 'ctdtRem', label: 'CTDT', render: (r) => r.ctdtRem || '' },
  ];

  const handleSubmit = (row, action, extra) => {
    const next = submitAction(queue, 'proceedings-centre-sanction-bill', row.id, role, action, extra);
    setQueue(next);
    saveQueue(next);
  };

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Centre Sanction Proceedings &amp; Bill</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>
        Generate sanction proceedings and bill. If PCR is <strong>Yes</strong> the record completes here; if PCR is <strong>No</strong> it moves to Generate PCR once the Director approves.
      </p>
      <FilterBar filters={filters} onChange={setFilters} deptCampusOptions={deptCampusOptions} typeOptions={typeOptions} />
      <SectionListTable columns={columns} rows={rows} actionOptions={['SANCTIONED']} onSubmit={handleSubmit} onView={handleView} />
    </div>
  );
};

export default CentreSanctionBillList;