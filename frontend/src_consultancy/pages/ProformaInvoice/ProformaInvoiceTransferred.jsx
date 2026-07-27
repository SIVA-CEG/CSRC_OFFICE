// PATH: frontend/src_consultancy/pages/ProformaInvoice/ProformaInvoiceTransferred.jsx

import React, { useMemo, useState } from 'react';
import FilterBar from '../../components/FilterBar';
import SectionTrackTable from '../../components/SectionTrackTable';
import { loadQueue, getTransferredRows } from '../../data/consultancyWorkflow';

const COLUMNS = [
  { key: 'id', label: 'ACF ID', render: (r) => r.acfId },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'consultantName', label: 'Consultant Name' },
  { key: 'amount', label: 'Amount', render: (r) => Number(r.amount || 0).toLocaleString('en-IN') },
];

const ProformaInvoiceTransferred = () => {
  const role = sessionStorage.getItem('consultancyUserRole');
  const [queue] = useState(() => loadQueue());
  const [filters, setFilters] = useState({});

  const allRows = getTransferredRows(queue, 'proforma-invoices', role);
  const rows = useMemo(() => allRows.filter((r) =>
    !filters.q || `${r.id} ${r.consultantName}`.toLowerCase().includes(filters.q.toLowerCase())
  ), [allRows, filters]);

  const handleView = (kind, refId) => alert(`Opening ${kind.toUpperCase()} document for ${refId}.`);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Proforma Invoice — Transferred</h1>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 18px' }}>Items you have reviewed and forwarded onward.</p>
      <FilterBar filters={filters} onChange={setFilters} />
      <SectionTrackTable columns={COLUMNS} rows={rows} onView={handleView} />
    </div>
  );
};

export default ProformaInvoiceTransferred;