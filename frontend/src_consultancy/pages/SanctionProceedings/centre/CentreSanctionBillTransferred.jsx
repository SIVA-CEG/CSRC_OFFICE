// PATH: frontend/src_consultancy/pages/SanctionProceedings/Centre/CentreSanctionBillTransferred.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../../components/FilterBar';
import SectionTrackTable from '../../../components/SectionTrackTable';
import { loadQueue, getTransferredRows } from '../../../data/consultancyWorkflow';

const COLUMNS = [
  { key: 'acfId', label: 'ACF ID' },
  { key: 'consultantName', label: 'Consultant Name' },
  { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
  { key: 'pcr', label: 'PCR' },
  { key: 'ctdtRem', label: 'CTDT' },
];

const CentreSanctionBillTransferred = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});

  const allRows = getTransferredRows(queue, 'proceedings-centre-sanction-bill', role);
  const rows = useMemo(() => allRows.filter((r) =>
    !filters.q || `${r.acfId} ${r.consultantName}`.toLowerCase().includes(filters.q.toLowerCase())
  ), [allRows, filters]);

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Centre Sanction Proceedings &amp; Bill — Transferred</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>Items you have reviewed and forwarded onward.</p>
      <FilterBar filters={filters} onChange={setFilters} />
      <SectionTrackTable columns={COLUMNS} rows={rows} onView={handleView} />
    </div>
  );
};

export default CentreSanctionBillTransferred;