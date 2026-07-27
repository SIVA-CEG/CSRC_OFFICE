// PATH: frontend/src_consultancy/pages/Permissions/PermissionsList.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../components/FilterBar';
import SectionListTable from '../../components/SectionListTable';
import { loadQueue, saveQueue, getListRows, submitAction } from '../../data/consultancyWorkflow';

const COLUMNS = [
  { key: 'id', label: 'ACF ID', render: (r) => r.acfId },
  { key: 'consultantName', label: 'Consultant Name' },
  { key: 'deptCampus', label: 'Department-Campus' },
  { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
];

const PermissionsList = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue, setQueue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});

  const allRows = getListRows(queue, 'permissions', role);
  const rows = useMemo(() => allRows.filter((r) =>
    !filters.q || `${r.id} ${r.consultantName}`.toLowerCase().includes(filters.q.toLowerCase())
  ), [allRows, filters]);

  const deptCampusOptions = [...new Set(allRows.map((r) => r.deptCampus))];

  const handleSubmit = (row, action, extra) => {
    const next = submitAction(queue, 'permissions', row.id, role, action, extra);
    setQueue(next);
    saveQueue(next);
  };

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Submitted Permission Forms</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>
        Review permission-type consultancies and route them to Sanction Proceedings.
      </p>
      <FilterBar filters={filters} onChange={setFilters} deptCampusOptions={deptCampusOptions} />
      <SectionListTable
        columns={COLUMNS}
        rows={rows}
        actionOptions={['PROCEEDINGS']}
        onSubmit={handleSubmit}
        onView={handleView}
      />
    </div>
  );
};

export default PermissionsList;