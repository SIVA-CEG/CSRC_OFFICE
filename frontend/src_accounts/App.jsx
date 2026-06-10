import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
   MASTER IMPORTS
======================= */
import AccountsMasterLayout    from '../../src_accounts/pages/master/MasterLayout';
import AccountsCampus          from '../../src_accounts/pages/master/Campus';
import AccountsDepartments     from '../../src_accounts/pages/master/Departments';
import AccountsBeneficiaries   from '../../src_accounts/pages/master/Beneficiaries';
import AccountsDesignation     from '../../src_accounts/pages/master/Designation';
import AccountsFaculties       from '../../src_accounts/pages/master/Faculties';
import AccountsUserActivation  from '../../src_accounts/pages/master/UserActivation';
import AccountsPIRoles         from '../../src_accounts/pages/master/PIRoles';
import AccountsSchemes         from '../../src_accounts/pages/master/Schemes';




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/master" element={<Master />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/banking" element={<Banking />} />
        <Route path="/banking/bank" element={<Bank />} />
        <Route path="/banking/bank/new-entry" element={<NewEntry />} />
        <Route path="/banking/bank/original-statements" element={<OriginalStatements />} />
        <Route path="/banking/bank/current-statements" element={<CurrentStatements />} />
        <Route path="/banking/fund-transfer" element={<FundTransfer />} />
        <Route path="/banking/fund-transfer/revenue-account" element={<RevenueAccount />} />
        <Route path="/banking/fund-transfer/project-account" element={<ProjectAccount />} />
        <Route path="/banking/fund-transfer/mopr-account" element={<MOPRAccount />} />
        <Route path="/banking/fund-transfer/ttdf-account" element={<TTDFAccount />} />
        <Route path="/banking/fund-transfer/consultancy-account" element={<ConsultancyAccount />} />
        <Route path="/banking/fund-transfer/tec-account" element={<TECAccount />} />
        <Route path="/banking/fund-transfer/tax-account" element={<TAXAccount />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/receipts/project-ac" element={<ProjectAcR />} />
        <Route path="/receipts/mopr-ac" element={<MoPRAc />} />
        <Route path="/receipts/ttdf-ac" element={<TTDFAcR />} />
        <Route path="/receipts/revenue-ac" element={<RevenueAcR />} />
        <Route path="/receipts/tax-ac" element={<TaxAcR />} />
        <Route path="/receipts/receipt-lock" element={<ReceiptLock />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payments/revenue-ac" element={<RevenueAcP />} />
        <Route path="/payments/project-ac" element={<ProjectAcP />} />
        <Route path="/payments/mopr-ac" element={<MOPRAcP />} />
        <Route path="/payments/ttdf-ac" element={<TTDFAcP />} />
        <Route path="/payments/tax-ac" element={<TaxAcP />} />
        <Route path="/payments/unspent-amount" element={<UnspentAmount />} />
        <Route path="/payments/adv-settlement" element={<AdvSettlement />} />
        <Route path="/payments/bank-clearance" element={<BankClearance />} />
        <Route path="/payments/voucher-clearance" element={<VoucherClearance />} />
        <Route path="/payments/payment-types" element={<PaymentTypes />} />
        <Route path="/payments/subhead-types" element={<SubheadTypes />} />
        <Route path="/payments/payment-lock" element={<PaymentLock />} />

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
      </Routes>
    </BrowserRouter>
  );
}