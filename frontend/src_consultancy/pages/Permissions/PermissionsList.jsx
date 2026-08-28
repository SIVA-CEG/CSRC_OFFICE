// PATH: frontend/src_consultancy/pages/Permissions/PermissionsList.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../components/FilterBar';
import SectionListTable from '../../components/SectionListTable';
import { loadQueue, saveQueue, getListRows, submitAction } from '../../data/consultancyWorkflow';

const dateStyle = { fontSize: 12.5, padding: '6px 9px', borderRadius: 7, border: '1px solid #d1d5db' };

const PermissionsList = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue, setQueue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});
  const [edits, setEdits] = useState({}); // { [id]: { permissionDate } }

  const setEdit = (id, patch) => setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const allRows = getListRows(queue, 'permissions', role);
  const rows = useMemo(() => allRows.filter((r) =>
    !filters.q || `${r.id} ${r.consultantName}`.toLowerCase().includes(filters.q.toLowerCase())
  ), [allRows, filters]);

  const deptCampusOptions = [...new Set(allRows.map((r) => r.deptCampus))];

  const columns = [
    { key: 'id', label: 'ACF ID', render: (r) => r.acfId },
    { key: 'consultantName', label: 'Consultant Name' },
    { key: 'deptCampus', label: 'Department-Campus' },
    { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
    {
      key: 'permissionDate', label: 'Permission Date',
      render: (r) => (
        <input type="date" style={dateStyle} value={edits[r.id]?.permissionDate ?? r.permissionDate ?? ''}
          onChange={(e) => setEdit(r.id, { permissionDate: e.target.value })} />
      ),
    },
  ];

  const handleSubmit = (row, action, extra) => {
    const edit = edits[row.id] || {};
    const next = submitAction(queue, 'permissions', row.id, role, action, {
      ...extra, permissionDate: edit.permissionDate ?? row.permissionDate,
    });
    setQueue(next);
    saveQueue(next);
    setEdits((prev) => { const p = { ...prev }; delete p[row.id]; return p; });
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
        columns={columns}
        rows={rows}
        actionOptions={['PROCEEDINGS']}
        onSubmit={handleSubmit}
        onView={handleView}
      />
    </div>
  );
};

export default PermissionsList;