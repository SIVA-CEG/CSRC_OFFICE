import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import './MasterLayout.css';

export default function MasterLayout() {
  return (
    <div className="master-root">
      <Sidebar />
      <div className="master-main">
        <Navbar />
        <div className="master-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}