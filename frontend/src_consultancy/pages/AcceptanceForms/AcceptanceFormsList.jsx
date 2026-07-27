// PATH: frontend/src_consultancy/pages/AcceptanceForms/AcceptanceFormsList.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../components/FilterBar';
import SectionListTable from '../../components/SectionListTable';
import { loadQueue, saveQueue, getListRows, submitAction } from '../../data/consultancyWorkflow';

const COLUMNS = [
  { key: 'id', label: 'ACF ID' },
  { key: 'name', label: 'Name' },
  { key: 'deptCampus', label: 'Dept-Campus' },
  { key: 'type', label: 'Type' },
];

const AcceptanceFormsList = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue, setQueue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});

  const allRows = getListRows(queue, 'acceptance-forms', role);
  const rows = useMemo(() => allRows.filter((r) => {
    if (filters.q && !`${r.id} ${r.name}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.deptCampus && r.deptCampus !== filters.deptCampus) return false;
    if (filters.type && r.type !== filters.type) return false;
    return true;
  }), [allRows, filters]);

  const deptCampusOptions = [...new Set(allRows.map((r) => r.deptCampus))];
  const typeOptions = [...new Set(allRows.map((r) => r.type))];

  const handleSubmit = (row, action, extra) => {
    const next = submitAction(queue, 'acceptance-forms', row.id, role, action, extra);
    setQueue(next);
    saveQueue(next);
  };

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId} (wire to the faculty-side print view here).`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Submitted Acceptance Forms</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>
        Review each ACF and route it to Proforma Invoice or Permissions, or reject it back to faculty.
      </p>
      <FilterBar filters={filters} onChange={setFilters} deptCampusOptions={deptCampusOptions} typeOptions={typeOptions} />
      <SectionListTable
        columns={COLUMNS}
        rows={rows}
        actionOptions={['INVOICE', 'PERMISSION']}
        onSubmit={handleSubmit}
        onView={handleView}
      />
    </div>
  );
};

export default AcceptanceFormsList;