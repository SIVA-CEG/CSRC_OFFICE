// PATH: frontend/src_consultancy/pages/AcceptanceForms/AcceptanceFormsCompleted.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../components/FilterBar';
import SectionTrackTable from '../../components/SectionTrackTable';
import { loadQueue, getCompletedRows } from '../../data/consultancyWorkflow';

const COLUMNS = [
  { key: 'id', label: 'ACF ID' },
  { key: 'name', label: 'Name' },
  { key: 'deptCampus', label: 'Dept-Campus' },
  { key: 'type', label: 'Type' },
  { key: 'routeDecision', label: 'Routed To' },
];

const AcceptanceFormsCompleted = () => {
  const [queue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});

  const allRows = getCompletedRows(queue, 'acceptance-forms');
  const rows = useMemo(() => allRows.filter((r) =>
    !filters.q || `${r.id} ${r.name}`.toLowerCase().includes(filters.q.toLowerCase())
  ), [allRows, filters]);

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Acceptance Forms — Completed</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>Fully approved by the Director, visible to all roles.</p>
      <FilterBar filters={filters} onChange={setFilters} />
      <SectionTrackTable columns={COLUMNS} rows={rows} onView={handleView} />
    </div>
  );
};

export default AcceptanceFormsCompleted;