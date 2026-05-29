import React from 'react';
import MasterPage from './MasterPage';

const columns = [
  { key: 'campusCode', label: 'Campus Code' },
  { key: 'campusName', label: 'Campus Name' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { campusCode: 'CMP001', campusName: 'Main Campus', location: 'Chennai', status: 'Active' },
  { campusCode: 'CMP002', campusName: 'North Campus', location: 'Delhi', status: 'Active' },
  { campusCode: 'CMP003', campusName: 'South Campus', location: 'Bangalore', status: 'Inactive' },
];

export default function Campus() {
  return (
    <MasterPage
      title="Campus"
      icon="🏫"
      description="Manage all campus locations and their details"
      columns={columns}
      sampleRows={sampleRows}
    />
  );
}