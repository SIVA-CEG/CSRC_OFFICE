import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginHub from '../pages/LoginHub';
import ProceedingsLogin from '../pages/ProceedingsLogin';
import Dashboard from '../pages/Dashboard';


/* =======================
   TAPAL IMPORTS
======================= */
import TapalLogin       from '../pages/TapalLogin';
import TapalLayout      from '../../src_tapal/components/layout/Layout';
import TapalHome        from '../../src_tapal/pages/TapalHome';
import ProjectHome      from '../../src_tapal/pages/ProjectHome';
import EndorsementTapal from '../../src_tapal/pages/EndorsementTapal';
import SanctionTapal    from '../../src_tapal/pages/SanctionTapal';
import BillsTapal       from '../../src_tapal/pages/BillsTapal';
import RequestTapal     from '../../src_tapal/pages/RequestTapal';
import NewTapal         from '../../src_tapal/pages/NewTapal';
import AssignedTapal    from '../../src_tapal/pages/AssignedTapal';
import CompletedTapal   from '../../src_tapal/pages/CompletedTapal';
import TapalSearch      from '../../src_tapal/pages/TapalSearch';


/* =======================
   MASTER IMPORTS
======================= */
import MasterLayout    from '../pages/master/MasterLayout';
import Campus          from '../pages/master/Campus';
import Departments     from '../pages/master/Departments';
import Beneficiaries   from '../pages/master/Beneficiaries';
import Designation     from '../pages/master/Designation';
import Faculties       from '../pages/master/Faculties';
import UserActivation  from '../pages/master/UserActivation';
import PIRoles         from '../pages/master/PIRoles';
import Schemes         from '../pages/master/Schemes';

import UnderConstruction from '../components/UnderConstruction';
import MyTapals          from '../pages/tapal/MyTapals';


/* =======================
   ENDORSEMENT IMPORTS
======================= */
import EndorsementDashboard from '../pages/endorsement/EndorsementDashboard';
import NewRequests          from '../pages/endorsement/new-requests/NewRequests';
import Transferred          from '../pages/endorsement/transferred/Transferred';
import Completed            from '../pages/endorsement/completed/Completed';
import SearchEndorsements   from '../pages/endorsement/search/SearchEndorsements';
import NewEndorsementPage   from '../pages/endorsement/create/NewEndorsementPage';


/* =======================
   PROJECT IMPORTS
======================= */
import ProjectDashboard    from '../pages/projects/ProjectDashboard';
import FreshSanction       from '../pages/projects/FreshSanction';
import RenewalSanction     from '../pages/projects/RenewalSanction';
import ProjectRequestsPage from '../pages/projects/ProjectRequestPage';
import OfficeReappropriation from '../pages/projects/OfficeReappropriationPage';
import ProjectExtension    from '../pages/projects/OfficeProjectExtensionPage';
import ZBAClaims           from '../pages/projects/ZBAOfficePage';
import TSAClaims           from '../pages/projects/TSAHOfficePage';
import CMRGClaims          from '../pages/projects/CMRGOfficePage';
import SearchProjects      from '../pages/projects/Search';
import Reports             from '../pages/projects/Reports';


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/"                  element={<LoginHub />} />
        <Route path="/tapal-login"       element={<TapalLogin />} />
        <Route path="/proceedings-login" element={<ProceedingsLogin />} />
        <Route path="/dashboard"         element={<Dashboard />} />

        {/* ── TAPAL MODULE (own layout, no backend for now) ── */}
        <Route path="/tapal" element={<TapalLayout counts={{ new: 0, assigned: 0, completed: 0 }} />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home"                 element={<TapalHome />} />
          <Route path="projects"             element={<ProjectHome />} />
          <Route path="projects/endorsement" element={<EndorsementTapal />} />
          <Route path="projects/sanction"    element={<SanctionTapal />} />
          <Route path="projects/bills"       element={<BillsTapal />} />
          <Route path="projects/requests"    element={<RequestTapal />} />
          <Route path="legacy/new"           element={<NewTapal tapals={[]} />} />
          <Route path="legacy/assigned"      element={<AssignedTapal tapals={[]} />} />
          <Route path="legacy/completed"     element={<CompletedTapal tapals={[]} />} />
          <Route path="legacy/search"        element={<TapalSearch tapals={[]} />} />
        </Route>

        {/* ── MASTER ── */}
        <Route path="/master" element={<MasterLayout />}>
          <Route index element={<Navigate to="campus" replace />} />
          <Route path="campus"          element={<Campus />} />
          <Route path="departments"     element={<Departments />} />
          <Route path="beneficiaries"   element={<Beneficiaries />} />
          <Route path="designation"     element={<Designation />} />
          <Route path="faculties"       element={<Faculties />} />
          <Route path="user-activation" element={<UserActivation />} />
          <Route path="pi-roles"        element={<PIRoles />} />
          <Route path="schemes"         element={<Schemes />} />
        </Route>

        {/* ── MY TAPALS ── */}
        <Route path="/my-tapals" element={<MasterLayout />}>
          <Route index element={<Navigate to="new-internal" replace />} />
          <Route path="new-internal" element={<MyTapals defaultTab="new" />} />
          <Route path="assigned"     element={<MyTapals defaultTab="assigned" />} />
          <Route path="transfer"     element={<MyTapals defaultTab="transfer" />} />
          <Route path="completed"    element={<MyTapals defaultTab="completed" />} />
          <Route path="search"       element={<MyTapals defaultTab="search" />} />
        </Route>

        {/* ── ENDORSEMENTS ── */}
        <Route path="/endorsements" element={<MasterLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<EndorsementDashboard />} />
          <Route path="new-requests" element={<NewRequests />} />
          <Route path="Transferred"  element={<Transferred />} />
          <Route path="completed"    element={<Completed />} />
          <Route path="create"       element={<NewEndorsementPage />} />
          <Route path="search"       element={<SearchEndorsements />} />
        </Route>

        {/* ── PROJECTS ── */}
        <Route path="/projects" element={<MasterLayout />}>
          <Route index                         element={<ProjectDashboard />} />
          <Route path="fresh-sanction"         element={<FreshSanction />} />
          <Route path="renewal-sanction"       element={<RenewalSanction />} />
          <Route path="project-requests"       element={<ProjectRequestsPage />} />
          <Route path="office-reappropriation" element={<OfficeReappropriation />} />
          <Route path="project-extension"      element={<ProjectExtension />} />
          <Route path="zba-claims"             element={<ZBAClaims />} />
          <Route path="tsa-claims"             element={<TSAClaims />} />
          <Route path="cmrg-claims"            element={<CMRGClaims />} />
          <Route path="search"                 element={<SearchProjects />} />
          <Route path="reports"                element={<Reports />} />
        </Route>

        {/* ── OTHER MODULES ── */}
        <Route path="/dst-inspire"         element={<UnderConstruction module="DST INSPIRE" />} />
        <Route path="/dst-inspire-faculty" element={<UnderConstruction module="DST INSPIRE Faculty" />} />
        <Route path="/women-scientist"     element={<UnderConstruction module="Women Scientist" />} />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}