import React from 'react';
import MasterPage from './MasterPage';

const columns = [
  { key: 'facId', label: 'Faculty ID' },
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { facId: 'F001', name: 'Dr. A. Rajan', department: 'Computer Science', designation: 'Professor', email: 'arajan@csrc.ac.in', status: 'Active' },
  { facId: 'F002', name: 'Dr. S. Kumar', department: 'Physics', designation: 'Associate Professor', email: 'skumar@csrc.ac.in', status: 'Active' },
  { facId: 'F003', name: 'Dr. M. Priya', department: 'Chemistry', designation: 'Assistant Professor', email: 'mpriya@csrc.ac.in', status: 'Active' },
];

export default function Faculties() {
  return (
    <MasterPage
      title="Faculties"
      icon="👨‍🏫"
      description="Manage faculty members across all departments"
      columns={columns}
      sampleRows={sampleRows}
    />
  );
}