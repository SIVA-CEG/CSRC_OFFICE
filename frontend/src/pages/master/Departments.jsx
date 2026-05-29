import React from 'react';
import MasterPage from './MasterPage';

const columns = [
  { key: 'deptCode', label: 'Dept Code' },
  { key: 'deptName', label: 'Department Name' },
  { key: 'campus', label: 'Campus' },
  { key: 'hod', label: 'Head of Dept' },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { deptCode: 'D001', deptName: 'Computer Science', campus: 'Main Campus', hod: 'Dr. A. Rajan', status: 'Active' },
  { deptCode: 'D002', deptName: 'Physics', campus: 'Main Campus', hod: 'Dr. S. Kumar', status: 'Active' },
  { deptCode: 'D003', deptName: 'Chemistry', campus: 'North Campus', hod: 'Dr. M. Priya', status: 'Active' },
  { deptCode: 'D004', deptName: 'Mathematics', campus: 'South Campus', hod: 'Dr. R. Nair', status: 'Inactive' },
];

export default function Departments() {
  return (
    <MasterPage
      title="Departments"
      icon="🏢"
      description="Manage all academic and administrative departments"
      columns={columns}
      sampleRows={sampleRows}
    />
  );
}