import React from 'react';
import MasterPage from './MasterPage';

const columns = [
  { key: 'userId', label: 'User ID' },
  { key: 'name', label: 'Full Name' },
  { key: 'role', label: 'Role' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

const sampleRows = [
  { userId: 'USR001', name: 'Admin User', role: 'Super Admin', email: 'admin@csrc.ac.in', status: 'Active' },
  { userId: 'USR002', name: 'Dr. Ravi Kumar', role: 'Faculty', email: 'ravi@csrc.ac.in', status: 'Active' },
  { userId: 'USR003', name: 'Mr. Siva G', role: 'Staff', email: 'siva@csrc.ac.in', status: 'Inactive' },
];

export default function UserActivation() {
  return (
    <MasterPage
      title="User Activation"
      icon="✅"
      description="Manage user accounts and activation status"
      columns={columns}
      sampleRows={sampleRows}
    />
  );
}