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



/* =======================
   ACCOUNTS IMPORTS
======================= */

import AccountsLogin from '../pages/AccountsLogin';
import AccountsDashboard from '../../src_accounts/pages/Dashboard';
import Master from '../../src_accounts/pages/Master';
import Budget from '../../src_accounts/pages/Budget';
import Banking from '../../src_accounts/pages/banking/Banking';
import Bank from '../../src_accounts/pages/banking/bank/Bank';
import NewEntry from '../../src_accounts/pages/banking/bank/NewEntry';
import OriginalStatements from '../../src_accounts/pages/banking/bank/OriginalStatements';
import CurrentStatements from '../../src_accounts/pages/banking/bank/CurrentStatements';
import FundTransfer from '../../src_accounts/pages/banking/fundtransfer/FundTransfer';
import RevenueAccount from '../../src_accounts/pages/banking/fundtransfer/RevenueAccount';
import ProjectAccount from '../../src_accounts/pages/banking/fundtransfer/ProjectAccount';
import MOPRAccount from '../../src_accounts/pages/banking/fundtransfer/MOPRAccount';
import TTDFAccount from '../../src_accounts/pages/banking/fundtransfer/TTDFAccount';
import ConsultancyAccount from '../../src_accounts/pages/banking/fundtransfer/ConsultancyAccount';
import TECAccount from '../../src_accounts/pages/banking/fundtransfer/TECAccount';
import TAXAccount from '../../src_accounts/pages/banking/fundtransfer/TAXAccount';
import Receipts from '../../src_accounts/pages/receipts/Receipts';
import ProjectAcR from '../../src_accounts/pages/receipts/ProjectAc';
import MoPRAc from '../../src_accounts/pages/receipts/MoPRAc';
import TTDFAcR from '../../src_accounts/pages/receipts/TTDFAc';
import RevenueAcR from '../../src_accounts/pages/receipts/RevenueAc';
import TaxAcR from '../../src_accounts/pages/receipts/TaxAc';
import ReceiptLock from '../../src_accounts/pages/receipts/ReceiptLock';
import Payments from '../../src_accounts/pages/payments/Payments';
import RevenueAcP from '../../src_accounts/pages/payments/RevenueAc';
import ProjectAcP from '../../src_accounts/pages/payments/ProjectAc';
import MOPRAcP from '../../src_accounts/pages/payments/MOPRAc';
import TTDFAcP from '../../src_accounts/pages/payments/TTDFAc';
import TaxAcP from '../../src_accounts/pages/payments/TaxAc';
import UnspentAmount from '../../src_accounts/pages/payments/UnspentAmount';
import AdvSettlement from '../../src_accounts/pages/payments/AdvSettlement';
import BankClearance from '../../src_accounts/pages/payments/BankClearance';
import VoucherClearance from '../../src_accounts/pages/payments/VoucherClearance';
import PaymentTypes from '../../src_accounts/pages/payments/PaymentTypes';
import SubheadTypes from '../../src_accounts/pages/payments/SubheadTypes';
import PaymentLock from '../../src_accounts/pages/payments/PaymentLock';



/* =======================
  ACCOUNTS MASTER IMPORTS
======================= */

import AccountsCampus          from '../../src_accounts/pages/master/Campus';
import AccountsDepartments     from '../../src_accounts/pages/master/Departments';
import AccountsBeneficiaries   from '../../src_accounts/pages/master/Beneficiaries';
import AccountsDesignation     from '../../src_accounts/pages/master/Designation';
import AccountsFaculties       from '../../src_accounts/pages/master/Faculties';
import AccountsUserActivation  from '../../src_accounts/pages/master/UserActivation';
import AccountsPIRoles         from '../../src_accounts/pages/master/PIRoles';
import AccountsSchemes         from '../../src_accounts/pages/master/Schemes';



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


        {/* ── ACCOUNTS ── */}

<Route path="/accounts-login" element={<AccountsLogin />} />

<Route path="/accounts" element={<AccountsDashboard />} />

<Route path="/accounts/master" element={<Master />} />
<Route path="/accounts/budget" element={<Budget />} />


{/* Accounts Master */}
<Route path="/accounts/master/campus" element={<AccountsCampus />} />
<Route path="/accounts/master/departments" element={<AccountsDepartments />} />
<Route path="/accounts/master/beneficiaries" element={<AccountsBeneficiaries />} />
<Route path="/accounts/master/designation" element={<AccountsDesignation />} />
<Route path="/accounts/master/faculties" element={<AccountsFaculties />} />
<Route path="/accounts/master/user-activation" element={<AccountsUserActivation />} />
<Route path="/accounts/master/pi-roles" element={<AccountsPIRoles />} />
<Route path="/accounts/master/schemes" element={<AccountsSchemes />} />


{/* Banking */}
<Route path="/accounts/banking" element={<Banking />} />
<Route path="/accounts/banking/bank" element={<Bank />} />
<Route path="/accounts/banking/bank/new-entry" element={<NewEntry />} />
<Route path="/accounts/banking/bank/original-statements" element={<OriginalStatements />} />
<Route path="/accounts/banking/bank/current-statements" element={<CurrentStatements />} />

<Route path="/accounts/banking/fund-transfer" element={<FundTransfer />} />
<Route path="/accounts/banking/fund-transfer/revenue-account" element={<RevenueAccount />} />
<Route path="/accounts/banking/fund-transfer/project-account" element={<ProjectAccount />} />
<Route path="/accounts/banking/fund-transfer/mopr-account" element={<MOPRAccount />} />
<Route path="/accounts/banking/fund-transfer/ttdf-account" element={<TTDFAccount />} />
<Route path="/accounts/banking/fund-transfer/consultancy-account" element={<ConsultancyAccount />} />
<Route path="/accounts/banking/fund-transfer/tec-account" element={<TECAccount />} />
<Route path="/accounts/banking/fund-transfer/tax-account" element={<TAXAccount />} />

{/* Receipts */}
<Route path="/accounts/receipts" element={<Receipts />} />
<Route path="/accounts/receipts/project-account" element={<ProjectAcR />} />
<Route path="/accounts/receipts/mopr-account" element={<MoPRAc />} />
<Route path="/accounts/receipts/ttdf-account" element={<TTDFAcR />} />
<Route path="/accounts/receipts/revenue-account" element={<RevenueAcR />} />
<Route path="/accounts/receipts/tax-account" element={<TaxAcR />} />
<Route path="/accounts/receipts/receipt-lock" element={<ReceiptLock />} />

{/* Payments */}
<Route path="/accounts/payments" element={<Payments />} />
<Route path="/accounts/payments/revenue-account" element={<RevenueAcP />} />
<Route path="/accounts/payments/project-account" element={<ProjectAcP />} />
<Route path="/accounts/payments/mopr-account" element={<MOPRAcP />} />
<Route path="/accounts/payments/ttdf-account" element={<TTDFAcP />} />
<Route path="/accounts/payments/tax-account" element={<TaxAcP />} />
<Route path="/accounts/payments/unspent-amount" element={<UnspentAmount />} />
<Route path="/accounts/payments/advance-settlement" element={<AdvSettlement />} />
<Route path="/accounts/payments/bank-clearance" element={<BankClearance />} />
<Route path="/accounts/payments/voucher-clearance" element={<VoucherClearance />} />
<Route path="/accounts/payments/payment-types" element={<PaymentTypes />} />
<Route path="/accounts/payments/subhead-types" element={<SubheadTypes />} />
<Route path="/accounts/payments/payment-lock" element={<PaymentLock />} />



        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}