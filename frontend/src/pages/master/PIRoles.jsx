import React from 'react';
import MasterPage from './MasterPage';

const columns = [
  { key: 'roleCode', label: 'Role Code' },
  { key: 'roleName', label: 'PI Role' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { roleCode: 'PIR001', roleName: 'Principal Investigator', description: 'Lead researcher for the project', status: 'Active' },
  { roleCode: 'PIR002', roleName: 'Co-Principal Investigator', description: 'Supporting PI in research activities', status: 'Active' },
  { roleCode: 'PIR003', roleName: 'Project Associate', description: 'Research associate under PI', status: 'Active' },
  { roleCode: 'PIR004', roleName: 'Student Researcher', description: 'PhD/PG students under PI', status: 'Active' },
];

export default function PIRoles() {
  return (
    <MasterPage
      title="PI Roles"
      icon="🔑"
      description="Manage Principal Investigator roles and permissions"
      columns={columns}
      sampleRows={sampleRows}
    />
  );
}