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
  'proceedings-centre-generate':        { label: 'Centre — Generate Proceedings',      accent: '#f97316', actions: ['GENERATED'] },
  'proceedings-centre-sanction-bill':   { label: 'Centre — Sanction Proceedings & Bill', accent: '#fb923c', actions: ['SANCTIONED'] },
  'proceedings-centre-generate-pcr':    { label: 'Centre — Generate PCR Proceedings',   accent: '#ea580c', actions: ['PCR_GENERATED'] },
  'proceedings-centre-pcr-proceedings': { label: 'Centre — PCR Proceedings',            accent: '#c2410c', actions: ['PROCESSED'] },

  'proceedings-department-generate':      { label: 'Department — Generate Proceedings',       accent: '#8b5cf6', actions: ['GENERATED'] },
  'proceedings-department-sanction-bill': { label: 'Department — Sanction Proceedings & Bill', accent: '#a78bfa', actions: ['SANCTIONED'] },
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
  /*  SANCTION PROCEEDINGS — DEPARTMENT, STAGE 1: Generate Proceedings.  */
  /*  matches "DEPARTMENT GENERATE PROCEEDINGS" screenshot.              */
  /*  `ctdtRemFlag` / `pcrStatus` are the read-only indicators shown     */
  /*  near the ACF ID / PCR STATUS columns; `ctdtRem` + `tapalDate`      */
  /*  (Proceeding Date) are filled in by the reviewer at each stage      */
  /*  before Submit. Spread across every stage so List / Transferred /  */
  /*  Completed all have rows for every role.                           */
  /* ------------------------------------------------------------------ */
  { id: '2627C10840', section: 'proceedings-department-generate', name: 'Dr.K.KARTHIGA', deptCampus: 'CIVIL,CEG', type: 'Prior Permission', amount: 531000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C10840' } },
  { id: '2526C10550', section: 'proceedings-department-generate', name: 'Dr.S M.RENUKA', deptCampus: 'CIVIL,CEG', type: 'Permission', amount: 75600, ctdtRemFlag: '', pcrStatus: 'no', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2526C10550' } },
  { id: '2425C8420', section: 'proceedings-department-generate', name: 'Dr.P.SHOBA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 118000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2425C8420' } },
  { id: '2324C7383', section: 'proceedings-department-generate', name: 'Dr.P.SENTHILKUMAR', deptCampus: 'AUTOMOBILE,MIT', type: 'Prior Permission', amount: 45000, ctdtRemFlag: '', pcrStatus: 'no', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2324C7383' } },
  { id: '2223C5424', section: 'proceedings-department-generate', name: 'Mr.D.EDWIN DAVID RAJ', deptCampus: 'MINING,CEG', type: 'Prior Permission', amount: 250000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5424' } },
  { id: '2223C5332', section: 'proceedings-department-generate', name: 'Mr.S.Venugopal', deptCampus: 'MINING,CEG', type: 'Permission', amount: 236000, ctdtRemFlag: '', pcrStatus: 'yes', tapalDate: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5332' } },

  // — with SUPERINTENDENT (assistant already forwarded) —
  { id: '2223C5209', section: 'proceedings-department-generate', name: 'Dr.T.RAMKUMAR', deptCampus: 'MECH,CEG', type: 'Prior Permission', amount: 162000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '18-07-2026', ctdtRem: 'Yes', stage: 'superintendent', routeDecision: 'GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-17' }],
    docs: { acf: '2223C5209' } },
  { id: '2324C6980', section: 'proceedings-department-generate', name: 'Dr.M.VIJAYALAKSHMI', deptCampus: 'EEE,CEG', type: 'Permission', amount: 88000, ctdtRemFlag: '', pcrStatus: 'no', tapalDate: '19-07-2026', ctdtRem: 'No', stage: 'superintendent', routeDecision: 'GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-18' }],
    docs: { acf: '2324C6980' } },

  // — with DEPUTY DIRECTOR —
  { id: '2223C5150', section: 'proceedings-department-generate', name: 'Dr.A.RAJENDRAN', deptCampus: 'CIVIL,CEG', type: 'Prior Permission', amount: 412000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '15-07-2026', ctdtRem: 'Yes', stage: 'deputy_director', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-13' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-14' },
    ], docs: { acf: '2223C5150' } },

  // — with DIRECTOR (final approval pending) —
  { id: '2223C4990', section: 'proceedings-department-generate', name: 'Dr.S.BALAMURUGAN', deptCampus: 'CSE,CEG', type: 'Permission', amount: 296000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '20-07-2026', ctdtRem: 'Yes', stage: 'director', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-16' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-18' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-07-19' },
    ], docs: { acf: '2223C4990' } },

  // — COMPLETED —
  { id: '2223C4877', section: 'proceedings-department-generate', name: 'Dr.R.ANNADURAI', deptCampus: 'CIVIL,CEG', type: 'Permission', amount: 354000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '12-07-2026', ctdtRem: 'Yes', stage: 'completed', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-08' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-09' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-07-11' },
      { role: 'director', action: 'GENERATED', remarks: 'Proceedings generated.', date: '2026-07-12' },
    ], docs: { acf: '2223C4877' } },
  { id: '2223C4610', section: 'proceedings-department-generate', name: 'Dr.N.KAVITHA', deptCampus: 'IT,MIT', type: 'Prior Permission', amount: 194000, ctdtRemFlag: 'yes', pcrStatus: 'yes', tapalDate: '01-07-2026', ctdtRem: 'Yes', stage: 'completed', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-06-27' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-06-28' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-06-30' },
      { role: 'director', action: 'GENERATED', remarks: 'Approved.', date: '2026-07-01' },
    ], docs: { acf: '2223C4610' } },

  // — REJECTED —
  { id: '2223C4522', section: 'proceedings-department-generate', name: 'Dr.B.SATHYAMOORTHY', deptCampus: 'MECH,CEG', type: 'Permission', amount: 67000, ctdtRemFlag: '', pcrStatus: 'no', tapalDate: '', ctdtRem: '', stage: 'rejected', routeDecision: 'GENERATED', rejectedAt: 'assistant',
    history: [{ role: 'assistant', action: 'REJECTED', remarks: 'PCR not cleared for this ACF — please verify with accounts before resubmitting.', date: '2026-07-10' }],
    docs: { acf: '2223C4522' } },

  /* ------------------------------------------------------------------ */
  /*  SANCTION PROCEEDINGS — DEPARTMENT, STAGE 2: Sanction Proceedings & */
  /*  Bill. Terminal stage for the Department flow — once the Director  */
  /*  submits SANCTIONED here, the record is done. `generateDate` shows */
  /*  the date the previous stage completed on.                         */
  /* ------------------------------------------------------------------ */
  { id: '3001', section: 'proceedings-department-sanction-bill', acfId: '2223C4877', name: 'Dr.R.ANNADURAI', deptCampus: 'CIVIL,CEG', type: 'Permission', amount: 354000, pcrStatus: 'yes', ctdtRem: 'Yes', generateDate: '12-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C4877', sanction: '3001', claim: '3001' } },
  { id: '3002', section: 'proceedings-department-sanction-bill', acfId: '2223C4610', name: 'Dr.N.KAVITHA', deptCampus: 'IT,MIT', type: 'Prior Permission', amount: 194000, pcrStatus: 'yes', ctdtRem: 'Yes', generateDate: '01-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C4610', sanction: '3002', claim: '3002' } },
  { id: '3003', section: 'proceedings-department-sanction-bill', acfId: '2324C6801', name: 'Dr.M.VIJAYALAKSHMI', deptCampus: 'EEE,CEG', type: 'Permission', amount: 88000, pcrStatus: 'no', ctdtRem: 'No', generateDate: '19-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2324C6801', sanction: '3003', claim: '3003' } },
  { id: '3004', section: 'proceedings-department-sanction-bill', acfId: '2223C5209', name: 'Dr.T.RAMKUMAR', deptCampus: 'MECH,CEG', type: 'Prior Permission', amount: 162000, pcrStatus: 'yes', ctdtRem: 'Yes', generateDate: '18-07-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5209', sanction: '3004', claim: '3004' } },

  // — with SUPERINTENDENT —
  { id: '2998', section: 'proceedings-department-sanction-bill', acfId: '2223C5150', name: 'Dr.A.RAJENDRAN', deptCampus: 'CIVIL,CEG', type: 'Prior Permission', amount: 412000, pcrStatus: 'yes', ctdtRem: 'Yes', generateDate: '15-07-2026', tapalDate: '20-07-2026', stage: 'superintendent', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-19' }],
    docs: { acf: '2223C5150', sanction: '2998', claim: '2998' } },

  // — with DEPUTY DIRECTOR —
  { id: '2997', section: 'proceedings-department-sanction-bill', acfId: '2223C4990', name: 'Dr.S.BALAMURUGAN', deptCampus: 'CSE,CEG', type: 'Permission', amount: 296000, pcrStatus: 'yes', ctdtRem: 'Yes', generateDate: '20-07-2026', tapalDate: '22-07-2026', stage: 'deputy_director', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-21' },
      { role: 'superintendent', action: 'SANCTIONED', remarks: '', date: '2026-07-22' },
    ], docs: { acf: '2223C4990', sanction: '2997', claim: '2997' } },

  // — with DIRECTOR —
  { id: '2996', section: 'proceedings-department-sanction-bill', acfId: '2223C4800', name: 'Dr.P.LAKSHMANAN', deptCampus: 'CIVIL,CEG', type: 'Permission', amount: 178000, pcrStatus: 'no', ctdtRem: 'No', generateDate: '10-07-2026', tapalDate: '24-07-2026', stage: 'director', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-19' },
      { role: 'superintendent', action: 'SANCTIONED', remarks: '', date: '2026-07-21' },
      { role: 'deputy_director', action: 'SANCTIONED', remarks: '', date: '2026-07-23' },
    ], docs: { acf: '2223C4800', sanction: '2996', claim: '2996' } },

  // — COMPLETED —
  { id: '2995', section: 'proceedings-department-sanction-bill', acfId: '2223C4700', name: 'Dr.V.SARAVANAN', deptCampus: 'EEE,CEG', type: 'Prior Permission', amount: 132000, pcrStatus: 'yes', ctdtRem: 'Yes', generateDate: '02-07-2026', tapalDate: '09-07-2026', stage: 'completed', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-03' },
      { role: 'superintendent', action: 'SANCTIONED', remarks: '', date: '2026-07-05' },
      { role: 'deputy_director', action: 'SANCTIONED', remarks: '', date: '2026-07-07' },
      { role: 'director', action: 'SANCTIONED', remarks: 'Sanction & bill approved.', date: '2026-07-09' },
    ], docs: { acf: '2223C4700', sanction: '2995', claim: '2995' } },
  { id: '2994', section: 'proceedings-department-sanction-bill', acfId: '2223C4600', name: 'Dr.K.MURALI', deptCampus: 'MECH,CEG', type: 'Permission', amount: 210000, pcrStatus: 'yes', ctdtRem: 'Yes', generateDate: '20-06-2026', tapalDate: '27-06-2026', stage: 'completed', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-06-21' },
      { role: 'superintendent', action: 'SANCTIONED', remarks: '', date: '2026-06-23' },
      { role: 'deputy_director', action: 'SANCTIONED', remarks: '', date: '2026-06-25' },
      { role: 'director', action: 'SANCTIONED', remarks: 'Approved.', date: '2026-06-27' },
    ], docs: { acf: '2223C4600', sanction: '2994', claim: '2994' } },

  // — REJECTED —
  { id: '2993', section: 'proceedings-department-sanction-bill', acfId: '2223C4550', name: 'Dr.J.PRAKASH', deptCampus: 'CSE,CEG', type: 'Permission', amount: 92000, pcrStatus: 'no', ctdtRem: '', generateDate: '05-07-2026', tapalDate: '', stage: 'rejected', routeDecision: 'SANCTIONED', rejectedAt: 'assistant',
    history: [{ role: 'assistant', action: 'REJECTED', remarks: 'Bill amount does not match the sanction order — please recheck before resubmitting.', date: '2026-07-06' }],
    docs: { acf: '2223C4550', sanction: '2993', claim: '2993' } },

  /* ------------------------------------------------------------------ */
  /*  SANCTION PROCEEDINGS — CENTRE, STAGE 1: Generate Proceedings.      */
  /*  matches "CENTRE GENERATE PROCEEDINGS" screenshot. `pcr` +          */
  /*  `ctdtRem` + `tapalDate` are filled in by the reviewer at each      */
  /*  stage before Submit. Spread across every stage so List /          */
  /*  Transferred / Completed all have rows for every role.              */
  /* ------------------------------------------------------------------ */
  { id: '2627C10878', section: 'proceedings-centre-generate', acfId: '2627C10878', consultantName: 'Dr.S.JAYALAKSHMI', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 472000, remAmt: 0, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2627C10878' } },
  { id: '2324C7074', section: 'proceedings-centre-generate', acfId: '2324C7074', consultantName: 'Mrs.M.NAVAMUNIYAMMAL', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 0, remAmt: '', tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2324C7074' } },
  { id: '2223C6594', section: 'proceedings-centre-generate', acfId: '2223C6594', consultantName: 'Dr.N.SARAVANAN', deptCampus: 'MECH,Nagercoil', type: 'Prior Permission', amount: 62700, remAmt: 372, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C6594' } },
  { id: '2223C6357', section: 'proceedings-centre-generate', acfId: '2223C6357', consultantName: 'Dr.K.SRINIVASAN', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 0, remAmt: '', tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C6357' } },
  { id: '2223C6012', section: 'proceedings-centre-generate', acfId: '2223C6012', consultantName: 'Dr.C.UDHAYAKUMAR', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 159300, remAmt: 945, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C6012' } },
  { id: '2223C5559', section: 'proceedings-centre-generate', acfId: '2223C5559', consultantName: 'Dr.R.MURUGASAN', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 108000, remAmt: 630, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5559' } },
  { id: '2223C5509', section: 'proceedings-centre-generate', acfId: '2223C5509', consultantName: 'Dr.R.KANMANI SHANMUGA PRIYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 354000, remAmt: 2100, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5509' } },
  { id: '2223C5437', section: 'proceedings-centre-generate', acfId: '2223C5437', consultantName: 'Dr.R.KANMANI SHANMUGA PRIYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 354000, remAmt: 2100, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5437' } },
  { id: '2223C5415', section: 'proceedings-centre-generate', acfId: '2223C5415', consultantName: 'Dr.R.KANMANI SHANMUGA PRIYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 324000, remAmt: 1890, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5415' } },
  { id: '2223C5401', section: 'proceedings-centre-generate', acfId: '2223C5401', consultantName: 'Dr.R.VIDHYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 540000, remAmt: 3150, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5401' } },
  { id: '2223C5375', section: 'proceedings-centre-generate', acfId: '2223C5375', consultantName: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 522000, remAmt: 3087, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5375' } },
  { id: '2223C5362', section: 'proceedings-centre-generate', acfId: '2223C5362', consultantName: 'Dr.K.SRINIVASA RAJU', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 413000, remAmt: 2450, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5362' } },
  { id: '2223C5358', section: 'proceedings-centre-generate', acfId: '2223C5358', consultantName: 'Dr.G.DHINAGARAN', deptCampus: 'CES,CEG', type: 'Prior Permission', amount: 236000, remAmt: 1400, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5358' } },
  { id: '2223C5355', section: 'proceedings-centre-generate', acfId: '2223C5355', consultantName: 'Dr.G.DHINAGARAN', deptCampus: 'CES,CEG', type: 'Prior Permission', amount: 177000, remAmt: 1050, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5355' } },
  { id: '2223C5354', section: 'proceedings-centre-generate', acfId: '2223C5354', consultantName: 'Dr.S.KARTHIKEYAN', deptCampus: 'CES,CEG', type: 'Prior Permission', amount: 177000, remAmt: 1050, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5354' } },
  { id: '2223C5353', section: 'proceedings-centre-generate', acfId: '2223C5353', consultantName: 'Dr.S.AMAL RAJ', deptCampus: 'CES,CEG', type: 'Prior Permission', amount: 177000, remAmt: 1050, tapalDate: '', pcr: '', ctdtRem: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5353' } },

  // — with SUPERINTENDENT —
  { id: '2223C5300', section: 'proceedings-centre-generate', acfId: '2223C5300', consultantName: 'Dr.P.MOHANRAJ', deptCampus: 'MECH,Regional Centre - Coimbatore', type: 'Prior Permission', amount: 265000, remAmt: 1560, tapalDate: '17-07-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'superintendent', routeDecision: 'GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-16' }],
    docs: { acf: '2223C5300' } },
  { id: '2223C5260', section: 'proceedings-centre-generate', acfId: '2223C5260', consultantName: 'Dr.V.LAKSHMI', deptCampus: 'ECE,Regional Centre - Madurai', type: 'Permission', amount: 94000, remAmt: 560, tapalDate: '18-07-2026', pcr: 'No', ctdtRem: 'No', stage: 'superintendent', routeDecision: 'GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-17' }],
    docs: { acf: '2223C5260' } },

  // — with DEPUTY DIRECTOR —
  { id: '2223C5240', section: 'proceedings-centre-generate', acfId: '2223C5240', consultantName: 'Dr.J.SUBASHINI', deptCampus: 'CIVIL,Regional Centre - Coimbatore', type: 'Prior Permission', amount: 388000, remAmt: 2280, tapalDate: '14-07-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'deputy_director', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-12' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-13' },
    ], docs: { acf: '2223C5240' } },

  // — with DIRECTOR —
  { id: '2223C5225', section: 'proceedings-centre-generate', acfId: '2223C5225', consultantName: 'Dr.R.GOPINATH', deptCampus: 'EEE,Regional Centre - Madurai', type: 'Permission', amount: 156000, remAmt: 910, tapalDate: '19-07-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'director', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-15' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-17' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-07-18' },
    ], docs: { acf: '2223C5225' } },

  // — COMPLETED —
  { id: '2223C5210', section: 'proceedings-centre-generate', acfId: '2223C5210', consultantName: 'Dr.R.VIDHYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 295000, remAmt: 1750, tapalDate: '05-07-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'completed', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-01' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-07-02' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-07-04' },
      { role: 'director', action: 'GENERATED', remarks: 'Proceedings generated.', date: '2026-07-05' },
    ], docs: { acf: '2223C5210' } },
  { id: '2223C5100', section: 'proceedings-centre-generate', acfId: '2223C5100', consultantName: 'Dr.A.KAMALESH', deptCampus: 'MECH,Nagercoil', type: 'Prior Permission', amount: 210000, remAmt: 1240, tapalDate: '28-06-2026', pcr: 'Yes', ctdtRem: 'Yes', stage: 'completed', routeDecision: 'GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-06-24' },
      { role: 'superintendent', action: 'GENERATED', remarks: '', date: '2026-06-25' },
      { role: 'deputy_director', action: 'GENERATED', remarks: '', date: '2026-06-27' },
      { role: 'director', action: 'GENERATED', remarks: 'Approved.', date: '2026-06-28' },
    ], docs: { acf: '2223C5100' } },

  // — REJECTED —
  { id: '2223C5050', section: 'proceedings-centre-generate', acfId: '2223C5050', consultantName: 'Dr.T.BHUVANESH', deptCampus: 'CSE,Regional Centre - Coimbatore', type: 'Permission', amount: 51000, remAmt: 300, tapalDate: '', pcr: 'No', ctdtRem: '', stage: 'rejected', routeDecision: 'GENERATED', rejectedAt: 'superintendent',
    history: [
      { role: 'assistant', action: 'GENERATED', remarks: '', date: '2026-07-06' },
      { role: 'superintendent', action: 'REJECTED', remarks: 'PCR shows No — needs reconciliation with the fund transfer entry before proceeding.', date: '2026-07-07' },
    ], docs: { acf: '2223C5050' } },

  /* ------------------------------------------------------------------ */
  /*  SANCTION PROCEEDINGS — CENTRE, STAGE 2: Sanction Proceedings &     */
  /*  Bill. PCR = Yes ends the flow here permanently; PCR = No moves on */
  /*  to Generate PCR once the Director approves.                       */
  /* ------------------------------------------------------------------ */
  { id: '4001', section: 'proceedings-centre-sanction-bill', acfId: '2223C5210', consultantName: 'Dr.R.VIDHYA', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 295000, pcr: 'Yes', ctdtRem: 'Yes', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5210', sanction: '4001', bill: '4001' } },
  { id: '4002', section: 'proceedings-centre-sanction-bill', acfId: '2223C5100', consultantName: 'Dr.A.KAMALESH', deptCampus: 'MECH,Nagercoil', type: 'Prior Permission', amount: 210000, pcr: 'Yes', ctdtRem: 'Yes', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5100', sanction: '4002', bill: '4002' } },
  { id: '4003', section: 'proceedings-centre-sanction-bill', acfId: '2223C5225', consultantName: 'Dr.R.GOPINATH', deptCampus: 'EEE,Regional Centre - Madurai', type: 'Permission', amount: 156000, pcr: 'No', ctdtRem: 'Yes', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5225', sanction: '4003', bill: '4003' } },
  { id: '4004', section: 'proceedings-centre-sanction-bill', acfId: '2223C5240', consultantName: 'Dr.J.SUBASHINI', deptCampus: 'CIVIL,Regional Centre - Coimbatore', type: 'Prior Permission', amount: 388000, pcr: 'No', ctdtRem: 'Yes', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { acf: '2223C5240', sanction: '4004', bill: '4004' } },

  // — with SUPERINTENDENT —
  { id: '3998', section: 'proceedings-centre-sanction-bill', acfId: '2223C5260', consultantName: 'Dr.V.LAKSHMI', deptCampus: 'ECE,Regional Centre - Madurai', type: 'Permission', amount: 94000, pcr: 'No', ctdtRem: 'No', tapalDate: '19-07-2026', stage: 'superintendent', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-18' }],
    docs: { acf: '2223C5260', sanction: '3998', bill: '3998' } },

  // — with DEPUTY DIRECTOR —
  { id: '3997', section: 'proceedings-centre-sanction-bill', acfId: '2223C5300', consultantName: 'Dr.P.MOHANRAJ', deptCampus: 'MECH,Regional Centre - Coimbatore', type: 'Prior Permission', amount: 265000, pcr: 'Yes', ctdtRem: 'Yes', tapalDate: '18-07-2026', stage: 'deputy_director', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-16' },
      { role: 'superintendent', action: 'SANCTIONED', remarks: '', date: '2026-07-17' },
    ], docs: { acf: '2223C5300', sanction: '3997', bill: '3997' } },

  // — with DIRECTOR —
  { id: '3996', section: 'proceedings-centre-sanction-bill', acfId: '2223C5150', consultantName: 'Dr.G.RAVICHANDRAN', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 189000, pcr: 'No', ctdtRem: 'Yes', tapalDate: '21-07-2026', stage: 'director', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-17' },
      { role: 'superintendent', action: 'SANCTIONED', remarks: '', date: '2026-07-19' },
      { role: 'deputy_director', action: 'SANCTIONED', remarks: '', date: '2026-07-20' },
    ], docs: { acf: '2223C5150', sanction: '3996', bill: '3996' } },

  // — COMPLETED (PCR = Yes ends here permanently) —
  { id: '3995', section: 'proceedings-centre-sanction-bill', acfId: '2223C4980', consultantName: 'Dr.S.NANDHINI', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 472000, pcr: 'Yes', ctdtRem: 'Yes', tapalDate: '10-07-2026', stage: 'completed', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-06' },
      { role: 'superintendent', action: 'SANCTIONED', remarks: '', date: '2026-07-07' },
      { role: 'deputy_director', action: 'SANCTIONED', remarks: '', date: '2026-07-09' },
      { role: 'director', action: 'SANCTIONED', remarks: 'PCR clear — sanction & bill finalised.', date: '2026-07-10' },
    ], docs: { acf: '2223C4980', sanction: '3995', bill: '3995' } },
  // — COMPLETED (PCR = No — has already moved on to Generate PCR) —
  { id: '3994', section: 'proceedings-centre-sanction-bill', acfId: '2223C4870', consultantName: 'Dr.B.SELVAKUMAR', deptCampus: 'MECH,Nagercoil', type: 'Permission', amount: 62000, pcr: 'No', ctdtRem: 'No', tapalDate: '28-06-2026', stage: 'completed', routeDecision: 'SANCTIONED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-06-24' },
      { role: 'superintendent', action: 'SANCTIONED', remarks: '', date: '2026-06-25' },
      { role: 'deputy_director', action: 'SANCTIONED', remarks: '', date: '2026-06-27' },
      { role: 'director', action: 'SANCTIONED', remarks: 'Approved — routed to Generate PCR.', date: '2026-06-28' },
    ], docs: { acf: '2223C4870', sanction: '3994', bill: '3994' } },

  // — REJECTED —
  { id: '3993', section: 'proceedings-centre-sanction-bill', acfId: '2223C4800', consultantName: 'Dr.M.ARIVAZHAGAN', deptCampus: 'IRS,CEG', type: 'Prior Permission', amount: 118000, pcr: '', ctdtRem: '', tapalDate: '', stage: 'rejected', routeDecision: 'SANCTIONED', rejectedAt: 'superintendent',
    history: [
      { role: 'assistant', action: 'SANCTIONED', remarks: '', date: '2026-07-05' },
      { role: 'superintendent', action: 'REJECTED', remarks: 'Bill figure exceeds the sanctioned amount — needs correction.', date: '2026-07-06' },
    ], docs: { acf: '2223C4800', sanction: '3993', bill: '3993' } },

  /* ------------------------------------------------------------------ */
  /*  SANCTION PROCEEDINGS — CENTRE, STAGE 3: Generate PCR Proceedings.  */
  /*  Only PCR = No records from Sanction & Bill reach here.             */
  /*  `sanctionBillDate` echoes the date the previous stage completed;  */
  /*  `genPcrDate` is filled in by the reviewer before Submit.           */
  /* ------------------------------------------------------------------ */
  { id: '5001', section: 'proceedings-centre-generate-pcr', acfId: '2223C4870', consultantName: 'Dr.B.SELVAKUMAR', deptCampus: 'MECH,Nagercoil', amount: 62000, pcrStatus: 'No', ctdtRem: 'No', sanctionBillDate: '28-06-2026', genPcrDate: '', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { pcr: '5001', sanction: '3994' } },
  { id: '5002', section: 'proceedings-centre-generate-pcr', acfId: '2223C4750', consultantName: 'Dr.N.VENKATESH', deptCampus: 'CIVIL,Regional Centre - Coimbatore', amount: 84000, pcrStatus: 'No', ctdtRem: 'No', sanctionBillDate: '25-06-2026', genPcrDate: '', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { pcr: '5002', sanction: '3990' } },

  // — with SUPERINTENDENT —
  { id: '4998', section: 'proceedings-centre-generate-pcr', acfId: '2223C4600', consultantName: 'Dr.K.SIVAKUMAR', deptCampus: 'EEE,Regional Centre - Madurai', amount: 47000, pcrStatus: 'No', ctdtRem: 'Yes', sanctionBillDate: '15-06-2026', genPcrDate: '22-06-2026', tapalDate: '22-06-2026', stage: 'superintendent', routeDecision: 'PCR_GENERATED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'PCR_GENERATED', remarks: '', date: '2026-06-21' }],
    docs: { pcr: '4998', sanction: '3985' } },

  // — with DEPUTY DIRECTOR —
  { id: '4997', section: 'proceedings-centre-generate-pcr', acfId: '2223C4500', consultantName: 'Dr.P.RAJASEKAR', deptCampus: 'IRS,CEG', amount: 128000, pcrStatus: 'No', ctdtRem: 'No', sanctionBillDate: '10-06-2026', genPcrDate: '18-06-2026', tapalDate: '19-06-2026', stage: 'deputy_director', routeDecision: 'PCR_GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PCR_GENERATED', remarks: '', date: '2026-06-17' },
      { role: 'superintendent', action: 'PCR_GENERATED', remarks: '', date: '2026-06-18' },
    ], docs: { pcr: '4997', sanction: '3980' } },

  // — with DIRECTOR —
  { id: '4996', section: 'proceedings-centre-generate-pcr', acfId: '2223C4400', consultantName: 'Dr.L.MEENAKSHI', deptCampus: 'CES,CEG', amount: 96000, pcrStatus: 'No', ctdtRem: 'Yes', sanctionBillDate: '05-06-2026', genPcrDate: '14-06-2026', tapalDate: '15-06-2026', stage: 'director', routeDecision: 'PCR_GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PCR_GENERATED', remarks: '', date: '2026-06-12' },
      { role: 'superintendent', action: 'PCR_GENERATED', remarks: '', date: '2026-06-13' },
      { role: 'deputy_director', action: 'PCR_GENERATED', remarks: '', date: '2026-06-14' },
    ], docs: { pcr: '4996', sanction: '3975' } },

  // — COMPLETED —
  { id: '4995', section: 'proceedings-centre-generate-pcr', acfId: '2223C4300', consultantName: 'Dr.C.RAMESHBABU', deptCampus: 'MECH,Nagercoil', amount: 71000, pcrStatus: 'No', ctdtRem: 'Yes', sanctionBillDate: '28-05-2026', genPcrDate: '05-06-2026', tapalDate: '06-06-2026', stage: 'completed', routeDecision: 'PCR_GENERATED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PCR_GENERATED', remarks: '', date: '2026-06-02' },
      { role: 'superintendent', action: 'PCR_GENERATED', remarks: '', date: '2026-06-03' },
      { role: 'deputy_director', action: 'PCR_GENERATED', remarks: '', date: '2026-06-05' },
      { role: 'director', action: 'PCR_GENERATED', remarks: 'PCR proceedings generated.', date: '2026-06-06' },
    ], docs: { pcr: '4995', sanction: '3970' } },

  // — REJECTED —
  { id: '4994', section: 'proceedings-centre-generate-pcr', acfId: '2223C4200', consultantName: 'Dr.S.DEVIKA', deptCampus: 'CIVIL,CEG', amount: 39000, pcrStatus: 'No', ctdtRem: '', sanctionBillDate: '20-05-2026', genPcrDate: '', tapalDate: '', stage: 'rejected', routeDecision: 'PCR_GENERATED', rejectedAt: 'assistant',
    history: [{ role: 'assistant', action: 'REJECTED', remarks: 'Sanction bill date missing on the linked document — please attach and resubmit.', date: '2026-05-25' }],
    docs: { pcr: '4994', sanction: '3965' } },

  /* ------------------------------------------------------------------ */
  /*  SANCTION PROCEEDINGS — CENTRE, STAGE 4: PCR Proceedings. Final     */
  /*  stage of the Centre flow — once the Director submits PROCESSED    */
  /*  here, the record is complete.                                     */
  /* ------------------------------------------------------------------ */
  { id: '6001', section: 'proceedings-centre-pcr-proceedings', acfId: '2223C4300', consultantName: 'Dr.C.RAMESHBABU', deptCampus: 'MECH,Nagercoil', amount: 71000, ctdtRem: 'Yes', pcrStatus: 'No', processedDate: '06-06-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { pcr: '4995', invoice: '2223C4300', sanction: '3970', claim: '6001' } },
  { id: '6002', section: 'proceedings-centre-pcr-proceedings', acfId: '2223C4100', consultantName: 'Dr.R.KAVIYA', deptCampus: 'ECE,Regional Centre - Madurai', amount: 55000, ctdtRem: 'No', pcrStatus: 'No', processedDate: '02-06-2026', tapalDate: '', stage: 'assistant', routeDecision: null, rejectedAt: null, history: [], docs: { pcr: '4990', invoice: '2223C4100', sanction: '3960', claim: '6002' } },

  // — with SUPERINTENDENT —
  { id: '5998', section: 'proceedings-centre-pcr-proceedings', acfId: '2223C4000', consultantName: 'Dr.V.GOPI', deptCampus: 'IRS,CEG', amount: 143000, ctdtRem: 'Yes', pcrStatus: 'No', processedDate: '25-05-2026', tapalDate: '30-05-2026', stage: 'superintendent', routeDecision: 'PROCESSED', rejectedAt: null,
    history: [{ role: 'assistant', action: 'PROCESSED', remarks: '', date: '2026-05-29' }],
    docs: { pcr: '4985', invoice: '2223C4000', sanction: '3955', claim: '5998' } },

  // — with DEPUTY DIRECTOR —
  { id: '5997', section: 'proceedings-centre-pcr-proceedings', acfId: '2223C3900', consultantName: 'Dr.A.THANGAVEL', deptCampus: 'CES,CEG', amount: 89000, ctdtRem: 'No', pcrStatus: 'No', processedDate: '18-05-2026', tapalDate: '24-05-2026', stage: 'deputy_director', routeDecision: 'PROCESSED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PROCESSED', remarks: '', date: '2026-05-21' },
      { role: 'superintendent', action: 'PROCESSED', remarks: '', date: '2026-05-23' },
    ], docs: { pcr: '4980', invoice: '2223C3900', sanction: '3950', claim: '5997' } },

  // — with DIRECTOR —
  { id: '5996', section: 'proceedings-centre-pcr-proceedings', acfId: '2223C3800', consultantName: 'Dr.M.SUGANYA', deptCampus: 'MECH,Nagercoil', amount: 67000, ctdtRem: 'Yes', pcrStatus: 'No', processedDate: '10-05-2026', tapalDate: '17-05-2026', stage: 'director', routeDecision: 'PROCESSED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PROCESSED', remarks: '', date: '2026-05-13' },
      { role: 'superintendent', action: 'PROCESSED', remarks: '', date: '2026-05-15' },
      { role: 'deputy_director', action: 'PROCESSED', remarks: '', date: '2026-05-16' },
    ], docs: { pcr: '4975', invoice: '2223C3800', sanction: '3945', claim: '5996' } },

  // — COMPLETED (end of Centre flow) —
  { id: '5995', section: 'proceedings-centre-pcr-proceedings', acfId: '2223C3700', consultantName: 'Dr.K.DEEPA', deptCampus: 'CIVIL,Regional Centre - Coimbatore', amount: 112000, ctdtRem: 'Yes', pcrStatus: 'No', processedDate: '05-05-2026', tapalDate: '12-05-2026', stage: 'completed', routeDecision: 'PROCESSED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PROCESSED', remarks: '', date: '2026-05-08' },
      { role: 'superintendent', action: 'PROCESSED', remarks: '', date: '2026-05-09' },
      { role: 'deputy_director', action: 'PROCESSED', remarks: '', date: '2026-05-11' },
      { role: 'director', action: 'PROCESSED', remarks: 'PCR proceedings finalised — end of Centre flow.', date: '2026-05-12' },
    ], docs: { pcr: '4970', invoice: '2223C3700', sanction: '3940', claim: '5995' } },
  { id: '5994', section: 'proceedings-centre-pcr-proceedings', acfId: '2223C3600', consultantName: 'Dr.J.ANITHA', deptCampus: 'EEE,Regional Centre - Madurai', amount: 58000, ctdtRem: 'No', pcrStatus: 'No', processedDate: '20-04-2026', tapalDate: '27-04-2026', stage: 'completed', routeDecision: 'PROCESSED', rejectedAt: null,
    history: [
      { role: 'assistant', action: 'PROCESSED', remarks: '', date: '2026-04-23' },
      { role: 'superintendent', action: 'PROCESSED', remarks: '', date: '2026-04-24' },
      { role: 'deputy_director', action: 'PROCESSED', remarks: '', date: '2026-04-26' },
      { role: 'director', action: 'PROCESSED', remarks: 'Approved.', date: '2026-04-27' },
    ], docs: { pcr: '4965', invoice: '2223C3600', sanction: '3935', claim: '5994' } },

  // — REJECTED —
  { id: '5993', section: 'proceedings-centre-pcr-proceedings', acfId: '2223C3500', consultantName: 'Dr.P.KANNAN', deptCampus: 'CSE,Regional Centre - Coimbatore', amount: 44000, ctdtRem: '', pcrStatus: 'No', processedDate: '', tapalDate: '', stage: 'rejected', routeDecision: 'PROCESSED', rejectedAt: 'deputy_director',
    history: [
      { role: 'assistant', action: 'PROCESSED', remarks: '', date: '2026-04-10' },
      { role: 'superintendent', action: 'PROCESSED', remarks: '', date: '2026-04-12' },
      { role: 'deputy_director', action: 'REJECTED', remarks: 'Claim reference does not match the PCR invoice — please reverify.', date: '2026-04-14' },
    ], docs: { pcr: '4960', invoice: '2223C3500', sanction: '3930', claim: '5993' } },
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
      // spawn into proceedings-department-generate / proceedings-centre-generate
      // once the routing rule (which of the two) is defined — left as a hook.

      /* ---- CENTRE: Generate -> Sanction & Bill -> (PCR branch) -> Generate PCR -> PCR Proceedings ---- */
      if (section === 'proceedings-centre-generate') {
        spawned = {
          id: `${++spawnCounter}`,
          section: 'proceedings-centre-sanction-bill',
          acfId: updated.acfId || updated.id,
          consultantName: updated.consultantName,
          deptCampus: updated.deptCampus,
          type: updated.type,
          amount: updated.amount,
          pcr: updated.pcr,
          ctdtRem: updated.ctdtRem,
          tapalDate: '',
          stage: 'assistant',
          routeDecision: null,
          rejectedAt: null,
          history: [],
          docs: { acf: updated.acfId || updated.id, sanction: updated.id, bill: updated.id },
        };
      }

      if (section === 'proceedings-centre-sanction-bill') {
        // PCR = Yes ends the flow here. PCR = No continues to Generate PCR.
        if ((updated.pcr || '').toLowerCase() !== 'yes') {
          spawned = {
            id: `${++spawnCounter}`,
            section: 'proceedings-centre-generate-pcr',
            acfId: updated.acfId,
            consultantName: updated.consultantName,
            deptCampus: updated.deptCampus,
            amount: updated.amount,
            pcrStatus: updated.pcr,
            ctdtRem: updated.ctdtRem,
            sanctionBillDate: updated.tapalDate,
            tapalDate: '',
            genPcrDate: '',
            stage: 'assistant',
            routeDecision: null,
            rejectedAt: null,
            history: [],
            docs: { pcr: updated.id, sanction: updated.id },
          };
        }
      }

      if (section === 'proceedings-centre-generate-pcr') {
        spawned = {
          id: `${++spawnCounter}`,
          section: 'proceedings-centre-pcr-proceedings',
          acfId: updated.acfId,
          consultantName: updated.consultantName,
          deptCampus: updated.deptCampus,
          amount: updated.amount,
          pcrStatus: updated.pcrStatus,
          ctdtRem: updated.ctdtRem,
          processedDate: updated.genPcrDate || today,
          tapalDate: '',
          stage: 'assistant',
          routeDecision: null,
          rejectedAt: null,
          history: [],
          docs: { pcr: updated.id, invoice: updated.acfId, sanction: updated.id, claim: updated.id },
        };
      }
      // proceedings-centre-pcr-proceedings is terminal: nothing further to spawn.

      /* ---------------- DEPARTMENT: Generate -> Sanction & Bill ---------------- */
      if (section === 'proceedings-department-generate') {
        spawned = {
          id: `${++spawnCounter}`,
          section: 'proceedings-department-sanction-bill',
          acfId: updated.id,
          name: updated.name,
          deptCampus: updated.deptCampus,
          type: updated.type,
          amount: updated.amount,
          pcrStatus: updated.pcrStatus,
          ctdtRem: updated.ctdtRem,
          generateDate: updated.tapalDate,
          tapalDate: '',
          stage: 'assistant',
          routeDecision: null,
          rejectedAt: null,
          history: [],
          docs: { acf: updated.id, sanction: updated.id, claim: updated.id },
        };
      }
      // proceedings-department-sanction-bill is terminal: nothing further to spawn.
    }

    return updated;
  });

  return spawned ? [...next, spawned] : next;
}