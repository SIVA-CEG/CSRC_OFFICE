import React from 'react';
import MasterPage from './MasterPage';

const columns = [
  { key: 'schemeCode', label: 'Scheme Code' },
  { key: 'schemeName', label: 'Scheme Name' },
  { key: 'fundingAgency', label: 'Funding Agency' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { schemeCode: 'SCH001', schemeName: 'DST INSPIRE', fundingAgency: 'DST', category: 'Research Fellowship', status: 'Active' },
  { schemeCode: 'SCH002', schemeName: 'SERB Core Research', fundingAgency: 'SERB', category: 'Research Grant', status: 'Active' },
  { schemeCode: 'SCH003', schemeName: 'Women Scientist Scheme', fundingAgency: 'DST', category: 'Women Empowerment', status: 'Active' },
  { schemeCode: 'SCH004', schemeName: 'UGC Minor Research', fundingAgency: 'UGC', category: 'Minor Research', status: 'Inactive' },
];

export default function Schemes() {
  return (
    <MasterPage
      title="Schemes"
      icon="📄"
      description="Manage research schemes and funding programmes"
      columns={columns}
      sampleRows={sampleRows}
    />
  );
}