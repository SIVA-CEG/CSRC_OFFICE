import React from 'react';
import MasterPage from './MasterPage';

const columns = [
  { key: 'benId', label: 'Beneficiary ID' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'scheme', label: 'Scheme' },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { benId: 'B001', name: 'Dr. Priya Sharma', category: 'Faculty', scheme: 'DST INSPIRE', status: 'Active' },
  { benId: 'B002', name: 'Dr. Ravi Kumar', category: 'Researcher', scheme: 'CSRC Grant', status: 'Active' },
  { benId: 'B003', name: 'Ms. Anitha R', category: 'Scholar', scheme: 'Women Scientist', status: 'Active' },
];

export default function Beneficiaries() {
  return (
    <MasterPage
      title="Beneficiaries"
      icon="👥"
      description="Manage beneficiaries across all schemes and grants"
      columns={columns}
      sampleRows={sampleRows}
    />
  );
}