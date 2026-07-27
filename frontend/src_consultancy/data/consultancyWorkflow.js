// PATH: frontend/src_consultancy/data/consultancyWorkflow.js

/* ---------------------------------------------------------------------- */
/*  Workflow: faculty submits an Acceptance Form (ACF). The office side   */
/*  reviews it through assistant -> superintendent -> deputy_director ->  */
/*  director. Whoever is reviewing picks a routing action alongside the   */
/*  Tapal Date and hits Submit:                                           */
/*    - a forward action ("INVOICE" / "PERMISSION" / "PROCEEDINGS")       */
/*      carries the record to the next role, remembering the decision     */
/*    - "REJECTED" sends it back to faculty with remarks                  */
/*  Once the DIRECTOR submits a forward action, the ACF is complete AND   */
/*  a linked record is spawned into the next section:                    */
/*    acceptance-forms --(INVOICE)--> proforma-invoices                   */
/*    acceptance-forms --(PERMISSION)--> permissions                      */
/*  Proforma Invoice / Permissions records then run through the same      */
/*  4-tier chain with a "PROCEEDINGS" routing action, which (once the     */
/*  director approves) lands in Sanction Proceedings (Department or       */
/*  Centre). Those two sections run through the SAME 4-tier chain         */
/*  (assistant -> superintendent -> deputy_director -> director), with a  */
/*  single terminal "GENERATED" action — once the director submits it,   */
/*  the sanction proceedings record is complete.                          */
/* ---------------------------------------------------------------------- */

export const ROLES = ['assistant', 'superintendent', 'deputy_director', 'director'];

export const ROLE_LABELS = {
  assistant: 'Assistant',
  superintendent: 'Superintendent',
  deputy_director: 'Deputy Director',
  director: 'Director',
};

export const SECTIONS = {
  'acceptance-forms':      { label: 'Acceptance Forms', accent: '#7c1f3f', actions: ['INVOICE', 'PERMISSION'] },
  'proforma-invoices':     { label: 'Proforma Invoice',  accent: '#0f766e', actions: ['PROCEEDINGS'] },
  'permissions':           { label: 'Permissions',       accent: '#2563eb', actions: ['PROCEEDINGS'] },
  'proceedings-department':{ label: 'Sanction Proceedings — Department', accent: '#8b5cf6', actions: ['GENERATED'] },
  'proceedings-centre':    { label: 'Sanction Proceedings — Centre',     accent: '#f97316', actions: ['GENERATED'] },
};

const STORAGE_KEY = 'consultancyQueueV2';

const SEED = [
  /* ------------------------------------------------------------------ */
  /*  ACCEPTANCE FORMS — matches "SUBMITTED ACCEPTANCE FORMS" screenshot */
  /* ------------------------------------------------------------------ */
  { id: '2627C11126', section: 'acceptance-forms', name: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', type: 'Prior Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11126' } },
  { id: '2627C11125', section: 'acceptance-forms', name: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', type: 'Prior Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11125' } },
  { id: '2627C11124', section: 'acceptance-forms', name: 'Mrs.M.NAVAMUNIYAMMAL', deptCampus: 'IRS,CEG', type: 'Prior Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11124' } },
  { id: '2627C11123', section: 'acceptance-forms', name: 'Dr.R.ARULMOZHI', deptCampus: 'CES,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11123' } },
  { id: '2627C11120', section: 'acceptance-forms', name: 'Dr.K. C.PAZHANI', deptCampus: 'CIVIL,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11120' } },
  { id: '2627C11119', section: 'acceptance-forms', name: 'Dr.K. C.PAZHANI', deptCampus: 'CIVIL,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11119' } },
  { id: '2627C11118', section: 'acceptance-forms', name: 'Dr.G.DHINAGARAN', deptCampus: 'CES,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11118' } },
  { id: '2627C11117', section: 'acceptance-forms', name: 'Dr.R.ARULMOZHI', deptCampus: 'CES,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11117' } },
  { id: '2627C11116', section: 'acceptance-forms', name: 'Dr.R.SENTHIL', deptCampus: 'CIVIL,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11116' } },
  { id: '2627C11114', section: 'acceptance-forms', name: 'Dr.R.SENTHIL', deptCampus: 'CIVIL,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11114' } },
  { id: '2627C11099', section: 'acceptance-forms', name: 'Dr.J.THIVYA', deptCampus: 'CIVIL,Dindigul', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11099' } },
  { id: '2627C11094', section: 'acceptance-forms', name: 'Dr.R.SENTHIL', deptCampus: 'CIVIL,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11094' } },
  { id: '2627C11092', section: 'acceptance-forms', name: 'Dr.K. C.PAZHANI', deptCampus: 'CIVIL,CEG', type: 'Permission', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11092' } },
  { id: '2627C11065', section: 'acceptance-forms', name: 'Dr.M.S.KARTHIKEYAN', deptCampus: 'CWR,CEG', type: 'Prior Permission', tapalDate: '18-07-2026', stage: 'completed', routeDecision: 'PERMISSION', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PERMISSION', remarks: '', date: '2026-07-16' },
      { role: 'superintendent', action: 'PERMISSION', remarks: '', date: '2026-07-17' },
      { role: 'deputy_director', action: 'PERMISSION', remarks: '', date: '2026-07-18' },
      { role: 'director', action: 'PERMISSION', remarks: 'Approved.', date: '2026-07-18' },
    ], docs: { acf: '2627C11065' } },
  { id: '1819C2522', section: 'acceptance-forms', name: 'Dr.S.KANNAN', deptCampus: 'ECE,CEG', type: 'Postfacto Permission', tapalDate: '19-01-2019', stage: 'rejected', routeDecision: 'INVOICE', rejectedAt: 'assistant',
    history: [{ role: 'assistant', action: 'REJECTED', remarks: 'GST certificate not attached — please resubmit with the required document.', date: '2026-07-15' }],
    docs: { acf: '1819C2522' } },

  /* ------------------------------------------------------------------ */
  /*  PROFORMA INVOICES — matches "SUBMITTED INVOICE FORMS" screenshot   */
  /* ------------------------------------------------------------------ */
  { id: 'IVF-3704', section: 'proforma-invoices', acfId: '2627C11121', invoiceNo: '3704', consultantName: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', amount: 1180000, acfHcDate: '23-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11121', invoice: 'IVF-3704' } },
  { id: 'IVF-3703', section: 'proforma-invoices', acfId: '2627C11122', invoiceNo: '3703', consultantName: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', amount: 531000, acfHcDate: '23-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11122', invoice: 'IVF-3703' } },
  { id: 'IVF-3702', section: 'proforma-invoices', acfId: '2627C11115', invoiceNo: '3702', consultantName: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', amount: 472000, acfHcDate: '22-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11115', invoice: 'IVF-3702' } },
  { id: 'IVF-3701', section: 'proforma-invoices', acfId: '2627C11113', invoiceNo: '3701', consultantName: 'Dr.C.UDHAYAKUMAR', deptCampus: 'IRS,CEG', amount: 649000, acfHcDate: '22-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11113', invoice: 'IVF-3701' } },
  { id: 'IVF-3700', section: 'proforma-invoices', acfId: '2627C11112', invoiceNo: '3700', consultantName: 'Dr.C.UDHAYAKUMAR', deptCampus: 'IRS,CEG', amount: 826000, acfHcDate: '22-07-2026', tapalDate: '20-07-2026', stage: 'director', routeDecision: 'PROCEEDINGS', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PROCEEDINGS', remarks: '', date: '2026-07-19' },
      { role: 'superintendent', action: 'PROCEEDINGS', remarks: '', date: '2026-07-19' },
      { role: 'deputy_director', action: 'PROCEEDINGS', remarks: '', date: '2026-07-20' },
    ], docs: { acf: '2627C11112', invoice: 'IVF-3700' } },
  { id: 'IVF-3699', section: 'proforma-invoices', acfId: '2627C11111', invoiceNo: '3699', consultantName: 'Dr.M.DHARMENDIRA KUMAR', deptCampus: 'CHEMISTRY,CEG', amount: 7000, acfHcDate: '22-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11111', invoice: 'IVF-3699' } },
  { id: 'IVF-3698', section: 'proforma-invoices', acfId: '2627C11110', invoiceNo: '3698', consultantName: 'Mrs.M.NAVAMUNIYAMMAL', deptCampus: 'IRS,CEG', amount: 472000, acfHcDate: '22-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11110', invoice: 'IVF-3698' } },
  { id: 'IVF-3697', section: 'proforma-invoices', acfId: '2627C11109', invoiceNo: '3697', consultantName: 'Dr.N.ILAVARASAN', deptCampus: 'CIVIL,Tiruchirappalli', amount: 88500, acfHcDate: '20-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11109', invoice: 'IVF-3697' } },
  { id: 'IVF-3696', section: 'proforma-invoices', acfId: '2627C11108', invoiceNo: '3696', consultantName: 'Dr.S.JAYALAKSHMI', deptCampus: 'IRS,CEG', amount: 295000, acfHcDate: '20-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11108', invoice: 'IVF-3696' } },
  { id: 'IVF-3695', section: 'proforma-invoices', acfId: '2627C11107', invoiceNo: '3695', consultantName: 'Dr.S.JAYALAKSHMI', deptCampus: 'IRS,CEG', amount: 1062000, acfHcDate: '20-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11107', invoice: 'IVF-3695' } },
  { id: 'IVF-3694', section: 'proforma-invoices', acfId: '2627C11106', invoiceNo: '3694', consultantName: 'Dr.R.KANMANI SHANMUGA PRIYA', deptCampus: 'IRS,CEG', amount: 826000, acfHcDate: '20-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11106', invoice: 'IVF-3694' } },
  { id: 'IVF-3693', section: 'proforma-invoices', acfId: '2627C11105', invoiceNo: '3693', consultantName: 'Dr.R.KANMANI SHANMUGA PRIYA', deptCampus: 'IRS,CEG', amount: 236000, acfHcDate: '20-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11105', invoice: 'IVF-3693' } },
  { id: 'IVF-3600', section: 'proforma-invoices', acfId: '2526C10379', invoiceNo: '3600', consultantName: 'Ms. Dummy Login', deptCampus: 'ECE,Regional Centre - Madurai', amount: 1033600, acfHcDate: '10-06-2026', tapalDate: '', stage: 'completed', routeDecision: 'PROCEEDINGS', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PROCEEDINGS', remarks: '', date: '2026-06-12' },
      { role: 'superintendent', action: 'PROCEEDINGS', remarks: '', date: '2026-06-13' },
      { role: 'deputy_director', action: 'PROCEEDINGS', remarks: '', date: '2026-06-15' },
      { role: 'director', action: 'PROCEEDINGS', remarks: 'Approved.', date: '2026-06-16' },
    ], docs: { acf: '2526C10379', invoice: 'IVF-3600' } },

  /* ------------------------------------------------------------------ */
  /*  PERMISSIONS — matches "DEPARTMENT PERMISSION" screenshot           */
  /*  (P-<ACF ID> naming, GENERATE column mapped to the docs pill)       */
  /* ------------------------------------------------------------------ */
  { id: 'P-2627C11101', section: 'permissions', acfId: '2627C11101', consultantName: 'Dr.K. C.PAZHANI', deptCampus: 'CIVIL,CEG', amount: 23338, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11101', permission: 'P-2627C11101' } },
  { id: 'P-2627C11090', section: 'permissions', acfId: '2627C11090', consultantName: 'Dr.K P.JAYA', deptCampus: 'CIVIL,CEG', amount: 1884823, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11090', permission: 'P-2627C11090' } },
  { id: 'P-2627C11089', section: 'permissions', acfId: '2627C11089', consultantName: 'Dr.K P.JAYA', deptCampus: 'CIVIL,CEG', amount: 74916, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11089', permission: 'P-2627C11089' } },
  { id: 'P-2627C11088', section: 'permissions', acfId: '2627C11088', consultantName: 'Dr.K P.JAYA', deptCampus: 'CIVIL,CEG', amount: 474238, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11088', permission: 'P-2627C11088' } },
  { id: 'P-2627C11087', section: 'permissions', acfId: '2627C11087', consultantName: 'Dr.K P.JAYA', deptCampus: 'CIVIL,CEG', amount: 895682, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11087', permission: 'P-2627C11087' } },
  { id: 'P-2627C11086', section: 'permissions', acfId: '2627C11086', consultantName: 'Dr.K P.JAYA', deptCampus: 'CIVIL,CEG', amount: 2133821, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11086', permission: 'P-2627C11086' } },
  { id: 'P-2627C11085', section: 'permissions', acfId: '2627C11085', consultantName: 'Dr.K P.JAYA', deptCampus: 'CIVIL,CEG', amount: 561213, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11085', permission: 'P-2627C11085' } },
  { id: 'P-2627C11084', section: 'permissions', acfId: '2627C11084', consultantName: 'Dr.K P.JAYA', deptCampus: 'CIVIL,CEG', amount: 2291720, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11084', permission: 'P-2627C11084' } },
  { id: 'P-2627C11083', section: 'permissions', acfId: '2627C11083', consultantName: 'Dr.K P.JAYA', deptCampus: 'CIVIL,CEG', amount: 6172291, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11083', permission: 'P-2627C11083' } },
  { id: 'P-2627C11076', section: 'permissions', acfId: '2627C11076', consultantName: 'Dr.S.GREESHMA', deptCampus: 'CIVIL,CEG', amount: 41300, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11076', permission: 'P-2627C11076' } },
  { id: 'P-2627C11055', section: 'permissions', acfId: '2627C11055', consultantName: 'Dr.S M.RENUKA', deptCampus: 'CIVIL,CEG', amount: 81200, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11055', permission: 'P-2627C11055' } },
  { id: 'P-2627C11044', section: 'permissions', acfId: '2627C11044', consultantName: 'Dr.K. C.PAZHANI', deptCampus: 'CIVIL,CEG', amount: 106200, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11044', permission: 'P-2627C11044' } },
  { id: 'P-2627C11043', section: 'permissions', acfId: '2627C11043', consultantName: 'Dr.K. C.PAZHANI', deptCampus: 'CIVIL,CEG', amount: 948880, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11043', permission: 'P-2627C11043' } },
  { id: 'P-2627C11041', section: 'permissions', acfId: '2627C11041', consultantName: 'Dr.K. C.PAZHANI', deptCampus: 'CIVIL,CEG', amount: 118000, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11041', permission: 'P-2627C11041' } },
  { id: 'P-2627C11039', section: 'permissions', acfId: '2627C11039', consultantName: 'Dr.V.PONMALAR', deptCampus: 'CIVIL,CEG', amount: 41300, tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C11039', permission: 'P-2627C11039' } },
  { id: 'P-2627C10879', section: 'permissions', acfId: '2627C10879', consultantName: 'Dr.R.ELANGO', deptCampus: 'CIVIL,CEG', amount: 500000, tapalDate: '10-07-2026', stage: 'superintendent', routeDecision: 'PROCEEDINGS', rejectedAt: null,
    history: [{ role: 'assistant', action: 'PROCEEDINGS', remarks: '', date: '2026-07-09' }],
    docs: { acf: '2627C10879', permission: 'P-2627C10879' } },
  { id: 'P-2627C10828', section: 'permissions', acfId: '2627C10828', consultantName: 'Ms.Dummy Login', deptCampus: 'ECE,Regional Centre - Madurai', amount: 2596000, tapalDate: '15-05-2026', stage: 'completed', routeDecision: 'PROCEEDINGS', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PROCEEDINGS', remarks: '', date: '2026-05-01' },
      { role: 'superintendent', action: 'PROCEEDINGS', remarks: '', date: '2026-05-05' },
      { role: 'deputy_director', action: 'PROCEEDINGS', remarks: '', date: '2026-05-10' },
      { role: 'director', action: 'PROCEEDINGS', remarks: 'Approved.', date: '2026-05-15' },
    ], docs: { acf: '2627C10828', permission: 'P-2627C10828' } },

  /* ------------------------------------------------------------------ */
  /*  SANCTION PROCEEDINGS — DEPARTMENT, matches "DEPARTMENT GENERATE   */
  /*  PROCEEDINGS" screenshot. `ctdtRemFlag` / `pcrStatus` are the      */
  /*  read-only indicators shown near the ACF ID / PCR STATUS columns;  */
  /*  `ctdtRem` + `tapalDate` (Proceeding Date) are filled in by the    */
  /*  reviewer at each stage before Submit. Spread across every stage   */
  /*  so List / Transferred / Completed all have rows for every role.   */
  /* ------------------------------------------------------------------ */
  { id: '2627C10840', section: 'proceedings-department', name: 'Dr.K.KARTHIGA', deptCampus: 'CIVIL,CEG', type: 'Prior Permission', amount: 531000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C10840' } },
  { id: '2526C10550', section: 'proceedings-department', name: 'Dr.S M.RENUKA', deptCampus: 'CIVIL,CEG', type: 'Permission', amount: 75600, ctdtRemFlag: '', pcrStatus: 'no', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2526C10550' } },
  { id: '2425C8420', section: 'proceedings-department', name: 'Dr.P.SHOBA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 118000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2425C8420' } },
  { id: '2324C7383', section: 'proceedings-department', name: 'Dr.P.SENTHILKUMAR', deptCampus: 'AUTOMOBILE,MIT', type: 'Prior Permission', amount: 45000, ctdtRemFlag: '', pcrStatus: 'no', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2324C7383' } },
  { id: '2223C5424', section: 'proceedings-department', name: 'Mr.D.EDWIN DAVID RAJ', deptCampus: 'MINING,CEG', type: 'Prior Permission', amount: 250000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5424' } },
  { id: '2223C5332', section: 'proceedings-department', name: 'Mr.S.Venugopal', deptCampus: 'MINING,CEG', type: 'Permission', amount: 236000, ctdtRemFlag: '', pcrStatus: 'yes', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5332' } },

  // — with SUPERINTENDENT (assistant already forwarded) —
  { id: '2223C5209', section: 'proceedings-department', name: 'Dr.T.RAMKUMAR', deptCampus: 'MECH,CEG', type: 'Prior Permission', amount: 162000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '18-07-2026', ctdtRem: 'Yes', stage: 'superintendent', routeDecision: 'GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-17' }],
    docs: { acf: '2223C5209' } },
  { id: '2324C6980', section: 'proceedings-department', name: 'Dr.M.VIJAYALAKSHMI', deptCampus: 'EEE,CEG', type: 'Permission', amount: 88000, ctdtRemFlag: '', pcrStatus: 'no', tapalDate: '19-07-2026', ctdtRem: 'No', stage: 'superintendent', routeDecision: 'GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-18' }],
    docs: { acf: '2324C6980' } },

  // — with DEPUTY DIRECTOR —
  { id: '2223C5150', section: 'proceedings-department', name: 'Dr.A.RAJENDRAN', deptCampus: 'CIVIL,CEG', type: 'Prior Permission', amount: 412000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '15-07-2026', ctdtRem: 'Yes', stage: 'deputy_director', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-13' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-14' },
    ], docs: { acf: '2223C5150' } },

  // — with DIRECTOR (final approval pending) —
  { id: '2223C4990', section: 'proceedings-department', name: 'Dr.S.BALAMURUGAN', deptCampus: 'CSE,CEG', type: 'Permission', amount: 296000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '20-07-2026', ctdtRem: 'Yes', stage: 'director', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-16' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-18' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-07-19' },
    ], docs: { acf: '2223C4990' } },

  // — COMPLETED —
  { id: '2223C4877', section: 'proceedings-department', name: 'Dr.R.ANNADURAI', deptCampus: 'CIVIL,CEG', type: 'Permission', amount: 354000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '12-07-2026', ctdtRem: 'Yes', stage: 'completed', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-08' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-09' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-07-11' },
      { role: 'director', action: 'GENERATED', remarks: 'Proceedings generated.', date: '2026-07-12' },
    ], docs: { acf: '2223C4877' } },
  { id: '2223C4610', section: 'proceedings-department', name: 'Dr.N.KAVITHA', deptCampus: 'IT,MIT', type: 'Prior Permission', amount: 194000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '01-07-2026', ctdtRem: 'Yes', stage: 'completed', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-06-27' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-06-28' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-06-30' },
      { role: 'director', action: 'GENERATED', remarks: 'Approved.', date: '2026-07-01' },
    ], docs: { acf: '2223C4610' } },

  // — REJECTED —
  { id: '2223C4522', section: 'proceedings-department', name: 'Dr.B.SATHYAMOORTHY', deptCampus: 'MECH,CEG', type: 'Permission', amount: 67000, ctdtRemFlag: '', pcrStatus: 'no', tapalDate: '', ctdtRem: '', stage: 'rejected', routeDecision: 'GENERATED', rejectedAt: 'assistant',
    history: [{ role: 'assistant', action: 'REJECTED', remarks: 'PCR not cleared for this ACF — please verify with accounts before resubmitting.', date: '2026-07-10' }],
    docs: { acf: '2223C4522' } },

  /* ------------------------------------------------------------------ */
  /*  SANCTION PROCEEDINGS — CENTRE, matches "CENTRE GENERATE            */
  /*  PROCEEDINGS" screenshot. `pcr` + `ctdtRem` + `tapalDate` are      */
  /*  filled in by the reviewer at each stage before Submit. Spread     */
  /*  across every stage so List / Transferred / Completed all have    */
  /*  rows for every role.                                              */
  /* ------------------------------------------------------------------ */
  { id: '2627C10878', section: 'proceedings-centre', acfId: '2627C10878', consultantName: 'Dr.S.JAYALAKSHMI', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 472000, remAmt: 0, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C10878' } },
  { id: '2324C7074', section: 'proceedings-centre', acfId: '2324C7074', consultantName: 'Mrs.M.NAVAMUNIYAMMAL', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 0, remAmt: '', tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2324C7074' } },
  { id: '2223C6594', section: 'proceedings-centre', acfId: '2223C6594', consultantName: 'Dr.N.SARAVANAN', deptCampus: 'MECH,Nagercoil', type: 'Prior Permission', amount: 62700, remAmt: 372, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C6594' } },
  { id: '2223C6357', section: 'proceedings-centre', acfId: '2223C6357', consultantName: 'Dr.K.SRINIVASAN', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 0, remAmt: '', tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C6357' } },
  { id: '2223C6012', section: 'proceedings-centre', acfId: '2223C6012', consultantName: 'Dr.C.UDHAYAKUMAR', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 159300, remAmt: 945, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C6012' } },
  { id: '2223C5559', section: 'proceedings-centre', acfId: '2223C5559', consultantName: 'Dr.R.MURUGASAN', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 108000, remAmt: 630, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5559' } },
  { id: '2223C5509', section: 'proceedings-centre', acfId: '2223C5509', consultantName: 'Dr.R.KANMANI SHANMUGA PRIYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 354000, remAmt: 2100, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5509' } },
  { id: '2223C5437', section: 'proceedings-centre', acfId: '2223C5437', consultantName: 'Dr.R.KANMANI SHANMUGA PRIYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 354000, remAmt: 2100, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5437' } },
  { id: '2223C5415', section: 'proceedings-centre', acfId: '2223C5415', consultantName: 'Dr.R.KANMANI SHANMUGA PRIYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 324000, remAmt: 1890, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5415' } },
  { id: '2223C5401', section: 'proceedings-centre', acfId: '2223C5401', consultantName: 'Dr.R.VIDHYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 540000, remAmt: 3150, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5401' } },
  { id: '2223C5375', section: 'proceedings-centre', acfId: '2223C5375', consultantName: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 522000, remAmt: 3087, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5375' } },
  { id: '2223C5362', section: 'proceedings-centre', acfId: '2223C5362', consultantName: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 413000, remAmt: 2450, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5362' } },
  { id: '2223C5358', section: 'proceedings-centre', acfId: '2223C5358', consultantName: 'Dr.G.DHINAGARAN', deptCampus: 'CES,CEG', type: 'Prior Permission', amount: 236000, remAmt: 1400, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5358' } },
  { id: '2223C5355', section: 'proceedings-centre', acfId: '2223C5355', consultantName: 'Dr.G.DHINAGARAN', deptCampus: 'CES,CEG', type: 'Prior Permission', amount: 177000, remAmt: 1050, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5355' } },
  { id: '2223C5354', section: 'proceedings-centre', acfId: '2223C5354', consultantName: 'Dr.S.KARTHIKEYAN', deptCampus: 'CES,CEG', type: 'Prior Permission', amount: 177000, remAmt: 1050, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5354' } },
  { id: '2223C5353', section: 'proceedings-centre', acfId: '2223C5353', consultantName: 'Dr.S.AMAL RAJ', deptCampus: 'CES,CEG', type: 'Prior Permission', amount: 177000, remAmt: 1050, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5353' } },

  // — with SUPERINTENDENT —
  { id: '2223C5300', section: 'proceedings-centre', acfId: '2223C5300', consultantName: 'Dr.P.MOHANRAJ', deptCampus: 'MECH,Regional Centre - Coimbatore', type: 'Prior Permission', amount: 265000, remAmt: 1560, tapalDate: '17-07-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'superintendent', routeDecision: 'GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-16' }],
    docs: { acf: '2223C5300' } },
  { id: '2223C5260', section: 'proceedings-centre', acfId: '2223C5260', consultantName: 'Dr.V.LAKSHMI', deptCampus: 'ECE,Regional Centre - Madurai', type: 'Permission', amount: 94000, remAmt: 560, tapalDate: '18-07-2026', pcr: 'No', ctdtRem: 'No', stage: 'superintendent', routeDecision: 'GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-17' }],
    docs: { acf: '2223C5260' } },

  // — with DEPUTY DIRECTOR —
  { id: '2223C5240', section: 'proceedings-centre', acfId: '2223C5240', consultantName: 'Dr.J.SUBASHINI', deptCampus: 'CIVIL,Regional Centre - Coimbatore', type: 'Prior Permission', amount: 388000, remAmt: 2280, tapalDate: '14-07-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'deputy_director', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-12' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-13' },
    ], docs: { acf: '2223C5240' } },

  // — with DIRECTOR —
  { id: '2223C5225', section: 'proceedings-centre', acfId: '2223C5225', consultantName: 'Dr.R.GOPINATH', deptCampus: 'EEE,Regional Centre - Madurai', type: 'Permission', amount: 156000, remAmt: 910, tapalDate: '19-07-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'director', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-15' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-17' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-07-18' },
    ], docs: { acf: '2223C5225' } },

  // — COMPLETED —
  { id: '2223C5210', section: 'proceedings-centre', acfId: '2223C5210', consultantName: 'Dr.R.VIDHYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 295000, remAmt: 1750, tapalDate: '05-07-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'completed', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-01' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-02' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-07-04' },
      { role: 'director', action: 'GENERATED', remarks: 'Proceedings generated.', date: '2026-07-05' },
    ], docs: { acf: '2223C5210' } },
  { id: '2223C5100', section: 'proceedings-centre', acfId: '2223C5100', consultantName: 'Dr.A.KAMALESH', deptCampus: 'MECH,Nagercoil', type: 'Prior Permission', amount: 210000, remAmt: 1240, tapalDate: '28-06-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'completed', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-06-24' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-06-25' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-06-27' },
      { role: 'director', action: 'GENERATED', remarks: 'Approved.', date: '2026-06-28' },
    ], docs: { acf: '2223C5100' } },

  // — REJECTED —
  { id: '2223C5050', section: 'proceedings-centre', acfId: '2223C5050', consultantName: 'Dr.T.BHUVANESH', deptCampus: 'CSE,Regional Centre - Coimbatore', type: 'Permission', amount: 51000, remAmt: 300, tapalDate: '', pcr: 'No', ctdtRem: '', stage: 'rejected', routeDecision: 'GENERATED', rejectedAt: 'superintendent',
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-06' },
      { role: 'superintendent', action: 'REJECTED', remarks: 'PCR shows No — needs reconciliation with the fund transfer entry before proceeding.', date: '2026-07-07' },
    ], docs: { acf: '2223C5050' } },
];

export function loadQueue() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
  return SEED;
}

export function saveQueue(queue) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

const nextRole = (role) => {
  const idx = ROLES.indexOf(role);
  return idx < ROLES.length - 1 ? ROLES[idx + 1] : null;
};

/** Records sitting in this role's Submitted / New-Requests list for a section. */
export function getListRows(queue, section, role) {
  return queue.filter((r) => r.section === section && r.stage === role);
}

/** Records this role has already forwarded onward, for the Transferred view. */
export function getTransferredRows(queue, section, role) {
  return queue.filter((r) => r.section === section &&
    r.history.some((h) => h.role === role && h.action !== 'REJECTED'));
}

/** Fully approved records, visible identically to every role. */
export function getCompletedRows(queue, section) {
  return queue.filter((r) => r.section === section && r.stage === 'completed');
}

let spawnCounter = 1000;

/**
 * Submit an action (a forward decision, or 'REJECTED') for one record at
 * the given role. Returns the updated queue. When the director submits a
 * forward action, the record completes and — for acceptance-forms /
 * proforma-invoices / permissions — a linked record is spawned into the
 * appropriate downstream section.
 *
 * `extra` may include `remarks` and `tapalDate` (both handled specially,
 * as before) plus any other field-specific values a section's review form
 * collects (e.g. `ctdtRem`, `pcr` for the Sanction Proceedings sections) —
 * those are merged directly onto the record so each stage's reviewer can
 * see/update what the previous stage entered.
 */
export function submitAction(queue, section, id, role, action, extra = {}) {
  const { remarks = '', tapalDate = '', ...rest } = extra;
  const today = new Date().toISOString().slice(0, 10);
  let spawned = null;

  const next = queue.map((r) => {
    if (r.section !== section || r.id !== id) return r;

    const record = { ...r, ...rest, tapalDate: tapalDate || r.tapalDate };

    if (action === 'REJECTED') {
      return {
        ...record,
        stage: 'rejected',
        rejectedAt: role,
        history: [...record.history, { role, action: 'REJECTED', remarks, date: today }],
      };
    }

    const nr = nextRole(role);
    const updated = {
      ...record,
      routeDecision: action,
      stage: nr || 'completed',
      history: [...record.history, { role, action, remarks, date: today }],
    };

    if (!nr) {
      // Director just approved — spawn the downstream record.
      if (section === 'acceptance-forms') {
        const target = action === 'INVOICE' ? 'proforma-invoices' : 'permissions';
        spawned = {
          id: `${target === 'proforma-invoices' ? 'IVF' : 'PRM'}-${++spawnCounter}`,
          section: target,
          acfId: updated.id,
          consultantName: updated.name,
          invoiceNo: '',
          deptCampus: updated.deptCampus,
          amount: 0,
          acfHcDate: today,
          tapalDate: '',
          stage: 'assistant',
          routeDecision: null,
          rejectedAt: null,
          history: [],
          docs: { acf: updated.id },
        };
      }
      // proforma-invoices / permissions completing with PROCEEDINGS would
      // spawn into proceedings-department / proceedings-centre once the
      // routing rule (which of the two) is defined — left as a hook.
      // proceedings-department / proceedings-centre are terminal: nothing
      // further to spawn once the director submits GENERATED.
    }

    return updated;
  });

  return spawned ? [...next, spawned] : next;
}