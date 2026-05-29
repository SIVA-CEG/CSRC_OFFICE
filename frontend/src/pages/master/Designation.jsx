import React from 'react';
import MasterPage from './MasterPage';

const columns = [
  { key: 'desigCode', label: 'Code' },
  { key: 'designation', label: 'Designation' },
  { key: 'level', label: 'Level' },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { desigCode: 'DG001', designation: 'Professor', level: 'Senior', status: 'Active' },
  { desigCode: 'DG002', designation: 'Associate Professor', level: 'Mid', status: 'Active' },
  { desigCode: 'DG003', designation: 'Assistant Professor', level: 'Junior', status: 'Active' },
  { desigCode: 'DG004', designation: 'Research Associate', level: 'Junior', status: 'Active' },
  { desigCode: 'DG005', designation: 'Technical Officer', level: 'Mid', status: 'Inactive' },
];

export default function Designation() {
  return (
    <MasterPage
      title="Designation"
      icon="🎖️"
      description="Manage staff and faculty designation categories"
      columns={columns}
      sampleRows={sampleRows}
    />
  );
}