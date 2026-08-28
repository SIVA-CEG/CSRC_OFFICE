// PATH: frontend/src_consultancy/pages/SanctionProceedings/Department/DepartmentSanctionBillList.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../../components/FilterBar';
import SectionListTable from '../../../components/SectionListTable';
import { loadQueue, saveQueue, getListRows, submitAction } from '../../../data/consultancyWorkflow';

const DepartmentSanctionBillList = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue, setQueue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});

  const allRows = getListRows(queue, 'proceedings-department-sanction-bill', role);
  const rows = useMemo(() => allRows.filter((r) => {
    if (filters.q && !`${r.acfId} ${r.name}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.deptCampus && r.deptCampus !== filters.deptCampus) return false;
    if (filters.type && r.type !== filters.type) return false;
    return true;
  }), [allRows, filters]);

  const deptCampusOptions = [...new Set(allRows.map((r) => r.deptCampus))];
  const typeOptions = [...new Set(allRows.map((r) => r.type))];

  const columns = [
    { key: 'acfId', label: 'ACF ID' },
    { key: 'generateDate', label: 'Generate Date' },
    { key: 'name', label: 'Name' },
    { key: 'deptCampus', label: 'Dept-Campus' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
    { key: 'pcrStatus', label: 'PCR Status', render: (r) => r.pcrStatus || '' },
    { key: 'ctdtRem', label: 'CTDT Rem', render: (r) => r.ctdtRem || '' },
  ];

  const handleSubmit = (row, action, extra) => {
    const next = submitAction(queue, 'proceedings-department-sanction-bill', row.id, role, action, extra);
    setQueue(next);
    saveQueue(next);
  };

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Department Sanction Proceedings &amp; Bill</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>
        Final stage for department records. The Tapal Date field below doubles as Processed Date.
      </p>
      <FilterBar filters={filters} onChange={setFilters} deptCampusOptions={deptCampusOptions} typeOptions={typeOptions} />
      <SectionListTable columns={columns} rows={rows} actionOptions={['SANCTIONED']} onSubmit={handleSubmit} onView={handleView} />
    </div>
  );
};

export default DepartmentSanctionBillList;