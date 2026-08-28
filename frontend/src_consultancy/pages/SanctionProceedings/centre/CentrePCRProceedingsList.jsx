// PATH: frontend/src_consultancy/pages/SanctionProceedings/Centre/CentrePCRProceedingsList.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../../components/FilterBar';
import SectionListTable from '../../../components/SectionListTable';
import { loadQueue, saveQueue, getListRows, submitAction } from '../../../data/consultancyWorkflow';

const CentrePCRProceedingsList = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue, setQueue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});

  const allRows = getListRows(queue, 'proceedings-centre-pcr-proceedings', role);
  const rows = useMemo(() => allRows.filter((r) =>
    !filters.q || `${r.acfId} ${r.consultantName}`.toLowerCase().includes(filters.q.toLowerCase())
  ), [allRows, filters]);

  const columns = [
    { key: 'acfId', label: 'ACF ID' },
    { key: 'ctdtRem', label: 'CTDT Rem', render: (r) => r.ctdtRem || '' },
    { key: 'consultantName', label: 'Consultant Name' },
    { key: 'deptCampus', label: 'Dept-Campus' },
    { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
    { key: 'pcrStatus', label: 'PCR Status', render: (r) => r.pcrStatus || '' },
    { key: 'processedDate', label: 'Processed Date', render: (r) => r.processedDate || '-' },
  ];

  const handleSubmit = (row, action, extra) => {
    const next = submitAction(queue, 'proceedings-centre-pcr-proceedings', row.id, role, action, extra);
    setQueue(next);
    saveQueue(next);
  };

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Centre PCR Proceedings</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>
        Final stage. The Tapal Date field below doubles as PCR Date.
      </p>
      <FilterBar filters={filters} onChange={setFilters} />
      <SectionListTable columns={columns} rows={rows} actionOptions={['PROCESSED']} onSubmit={handleSubmit} onView={handleView} />
    </div>
  );
};

export default CentrePCRProceedingsList;