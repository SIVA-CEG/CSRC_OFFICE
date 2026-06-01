import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginHub from '../pages/LoginHub';
import ProceedingsLogin from '../pages/ProceedingsLogin';
import Dashboard from '../pages/Dashboard';

/* =======================
   MASTER IMPORTS
======================= */
import MasterLayout from '../pages/master/MasterLayout';
import Campus from '../pages/master/Campus';
import Departments from '../pages/master/Departments';
import Beneficiaries from '../pages/master/Beneficiaries';
import Designation from '../pages/master/Designation';
import Faculties from '../pages/master/Faculties';
import UserActivation from '../pages/master/UserActivation';
import PIRoles from '../pages/master/PIRoles';
import Schemes from '../pages/master/Schemes';

import UnderConstruction from '../components/UnderConstruction';
import MyTapals from '../pages/tapal/MyTapals';


/* =======================
   ENDORSEMENT IMPORTS
======================= */
import EndorsementDashboard from '../pages/endorsement/EndorsementDashboard';
import NewRequests from '../pages/endorsement/new-requests/NewRequests';
import Transferred from '../pages/endorsement/transferred/Transferred'; 
import Completed from '../pages/endorsement/completed/Completed'; 
import SearchEndorsements from '../pages/endorsement/search/SearchEndorsements';
import NewEndorsementPage from '../pages/endorsement/create/NewEndorsementPage';


/* =======================
   PROJECT IMPORTS
======================= */

import ProjectDashboard from '../pages/projects/ProjectDashboard';
import FreshSanction from '../pages/projects/FreshSanction';
import RenewalSanction from '../pages/projects/RenewalSanction';
import ProjectRequestsPage from '../pages/projects/ProjectRequestPage';
import OfficeReappropriation from '../pages/projects/OfficeReappropriationPage';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginHub />} />
        <Route path="/proceedings-login" element={<ProceedingsLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* MASTER */}
        <Route path="/master" element={<MasterLayout />}>
          <Route index element={<Navigate to="campus" replace />} />
          <Route path="campus" element={<Campus />} />
          <Route path="departments" element={<Departments />} />
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="designation" element={<Designation />} />
          <Route path="faculties" element={<Faculties />} />
          <Route path="user-activation" element={<UserActivation />} />
          <Route path="pi-roles" element={<PIRoles />} />
          <Route path="schemes" element={<Schemes />} />
        </Route>

        {/* TAPALS */}
        <Route path="/my-tapals" element={<MasterLayout />}>
          <Route index element={<Navigate to="new-internal" replace />} />
          <Route path="new-internal" element={<MyTapals defaultTab="new" />} />
          <Route path="assigned" element={<MyTapals defaultTab="assigned" />} />
          <Route path="transfer" element={<MyTapals defaultTab="transfer" />} />
          <Route path="completed" element={<MyTapals defaultTab="completed" />} />
          <Route path="search" element={<MyTapals defaultTab="search" />} />
        </Route>

        {/* ENDORSEMENTS */}
        <Route path="/endorsements" element={<MasterLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<EndorsementDashboard />} />
          <Route path="new-requests" element={<NewRequests />} />
          <Route path="transferred" element={<Transferred />} />
          <Route path="completed" element={<Completed />} />
          <Route path="create" element={<NewEndorsementPage />} />
          <Route path="search" element={<SearchEndorsements />} />
        </Route>

        {/* PROJECTS */}

        <Route path="/projects" element={<MasterLayout />}>
          <Route index element={<ProjectDashboard />} />
          <Route path="fresh-sanction" element={<FreshSanction />} />
          <Route path="renewal-sanction" element={<RenewalSanction />} />
          <Route path="project-requests" element={<ProjectRequestsPage />} />
          <Route path="office-reappropriation" element={<OfficeReappropriation />} />
        </Route>

        {/* OTHER MODULES */}

        <Route
          path="/dst-inspire"
          element={<UnderConstruction module="DST INSPIRE" />}
        />

        <Route
          path="/dst-inspire-faculty"
          element={<UnderConstruction module="DST INSPIRE Faculty" />}
        />

        <Route
          path="/women-scientist"
          element={<UnderConstruction module="Women Scientist" />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}