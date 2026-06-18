/**
 * CSRCProceedingsReport.jsx
 *
 * Renders the official "Request Sanctioned Project" proceedings letter in A4
 * format, matching the CSRC document format.
 *
 * NEW: signature block now shows 3-stage approval status (assistant → superintendent → director)
 *      - During workflow: all 3 slots visible; signed slots show ✔/image, unsigned show "Pending"
 *      - After director final approval (isCompleted=true): only director signature shown
 *        (matches FinalEndorsementReport in Completed.jsx)
 *
 * NEW: Equipment items and Manpower types now each carry their own amount.
 *      - Non-Recurring Total = sum of equipment item amounts
 *      - Manpower Total      = sum of manpower item amounts
 *      Both feed into the budget table and the Recurring/Non-Recurring/Overhead
 *      group-row labels now show the group's total in brackets, e.g.
 *      "Non-Recurring Heads (₹ 5,00,000.00)".
 *
 * Props:
 *   reportData  — assembled object (see assembleReportData helper below)
 *   signatures  — { assistant, superintendent, director } — each value is a dataURL string,
 *                 true (approved without image), or null/undefined (not yet signed)
 *   isCompleted — bool — if true, only show director signature (final doc mode)
 */

import React from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const dummyReportData = {
  projectTitle: "AI-Based Smart Agriculture Monitoring System",
  fundingAgency: "SERB",
  piName: "Dr. Siva Kumar",
  piDesignation: "Professor",
  piDept: "Department of Computer Science and Engineering",
  piCampus: "CEG Campus",

  proceedingNo: "CSRC/2026/001",
  proceedingDate: "2026-06-18",
  sanctionRef: "CSRC/2026/001, dated 18-06-2026",

  refNo: "SERB/AGRI/2026/001",
  refDate: "2026-06-15",

  instLabel: "1st Installment",
  projectScheme: "Core Research Grant",
  projectPeriod: "3 Years",

  equipmentItems: [
    {
      name: "High-End AI Workstation",
      amount: 300000,
    },
    {
      name: "NVIDIA GPU Server",
      amount: 500000,
    },
  ],

  manpowerItems: [
    {
      type: "Project Associate-I",
      amount: 240000,
    },
    {
      type: "Junior Research Fellow",
      amount: 180000,
    },
  ],

  heads: {
    nr: 800000, // Equipment Total
    man: 420000,
    con: 100000,
    trv: 50000,
    cnt: 30000,
    ssr: 25000,

    recurringTotal: 600000,

    oh: {
      total: 180000,
      registrar: 60000,
      dean: 48000,
      csrc: 48000,
      pdf: 24000,
    },

    grand: 1605000,
  },

  bankAccount: "123456789012",
  ifsCode: "SBIN0001234",
  bankBranch: "Anna University Branch",

  directorName: "THE DIRECTOR, CSRC",

  toAddress:
    "The Director\nCrystal Growth Centre, ACT Campus\nAnna University",

  copyTo: [
    "Dr. Siva Kumar",
    "CSRC – 3",
    "CSRC – 4",
    "PDF Register",
    "Bill",
  ],

  previousInstallments: [
    {
      label: "1st Installment",
      releasedDate: "10-01-2026",
      heads: {
        grand: 1200000,
      },
    },
  ],
};



const fmtINR = (n) => {
  const num = parseFloat(n);
  if (isNaN(num) || num === 0) return '—';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Same formatting as fmtINR but always renders a value (defaults to 0.00),
// used for the bracketed group-total labels so they never show an em-dash.
const fmtINRStrict = (n) => {
  const num = parseFloat(n) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (d) => {
  if (!d) return '___________';
  const isoMatch = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
  return d;
};

const todayStr = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const splitOverhead = (total) => {
  const oh = parseFloat(total) || 0;
  return {
    registrar: oh * (5 / 15),
    dean:      oh * (4 / 15),
    csrc:      oh * (4 / 15),
    pdf:       oh * (2 / 15),
    total:     oh,
  };
};

// Sum the `amount` field across an items array (equipment[] or manpowerList[]).
const sumAmounts = (items) =>
  (items || []).reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);

const calcHeads = (inst) => {
  const equipmentItems = inst.equipment || [];
  const manpowerItems  = inst.manpowerList || [];

  // Non-Recurring Total and Manpower are now derived from their item lists.
  // Fall back to any legacy stored value only if the item lists are empty,
  // so old records without per-item amounts still render sensibly.
  const equipmentSum = sumAmounts(equipmentItems);
  const manpowerSum  = sumAmounts(manpowerItems);

  const nr  = equipmentItems.length > 0 ? equipmentSum : (parseFloat(inst.nonRecurringTotal) || 0);
  const man = manpowerItems.length  > 0 ? manpowerSum  : (parseFloat(inst.manpower)          || 0);

  const con = parseFloat(inst.consumables)       || 0;
  const trv = parseFloat(inst.travel)            || 0;
  const cnt = parseFloat(inst.contingency)       || 0;
  const ssr = parseFloat(inst.ssrBudget)         || 0;
  const oh  = splitOverhead(inst.overheadTotal);

  // Recurring Heads = Manpower + Consumables + Travel + Contingency
  const recurringTotal = man + con + trv + cnt;

  const grand = nr + recurringTotal + oh.total + ssr;
  return { nr, man, con, trv, cnt, ssr, oh, grand, recurringTotal };
};

// ─── Data Assembler ──────────────────────────────────────────────────────────

export function assembleReportData(
  profile        = {},
  endorsement    = {},
  sanctionedForm = {},
  instIndex      = 0,
  previousInstallmentsOverride = [],
) {
  const allInstallments = sanctionedForm.installments || [];
  const inst = allInstallments[instIndex] || {};

  const piName        = profile.name        || endorsement.piName        || 'Dr. S. Balasivanandha Prabu';
  const piDesignation = profile.designation || endorsement.piDesignation || 'Professor';
  const piDept        = profile.department  || endorsement.piDept        || 'Department of Mechanical Engineering';
  const piCampus      = profile.campus      || endorsement.piCampus      || 'CEG Campus';

  const projectTitle   = endorsement.title        || sanctionedForm.projectTitle   || 'Untitled Project';
  const fundingAgency  = endorsement.fundingAgency || sanctionedForm.fundingAgency || 'Funding Agency';
  const projectScheme  = endorsement.projectScheme || 'SPC';
  const projectPeriod  = endorsement.period        || sanctionedForm.period        || '';

  const refNo            = endorsement.refNo          || sanctionedForm.refNo   || '';
  const refDate          = endorsement.refDate        || sanctionedForm.refDate || '';
  const proceedingNo     = sanctionedForm.proceedingNo     || `CSRC/CTDT/${new Date().getFullYear()}/OBS`;
  const proceedingDate   = sanctionedForm.proceedingDate   || todayStr();

  const sanctionRef   = sanctionedForm.sanctionRef  || `${proceedingNo}, dated ${proceedingDate}`;

  const installmentNumber = instIndex + 1;
  const instLabel         = inst.label || inst.installmentNo || `${ordinal(installmentNumber)} Installment`;
  const heads             = calcHeads(inst);

  const equipmentItems = (inst.equipment || []).filter(e => e.name);
  const manpowerItems  = (inst.manpowerList || []).filter(m => m.type);

const bankAccount =
  sanctionedForm.bankAccount ||
  profile.accountNumber ||
  '123456789012';

const ifsCode =
  sanctionedForm.ifscCode ||
  profile.ifscCode ||
  'SBIN0006756';

const bankBranch =
  sanctionedForm.bankBranch ||
  profile.bankBranch ||
  'Anna University Branch';

  const directorName = endorsement.directorName || 'THE DIRECTOR, CSRC';

  const toAddress = sanctionedForm.toDean
    ? `The Director\n${piDept}\n${piCampus}\nAnna University`
    : `The Director\nCrystal Growth Centre, ACT Campus\nAnna University`;

  const copyTo = [piName, 'CSRC – 3', 'CSRC – 4', 'PDF Register', 'Bill'];

  // ── Previous installments (1 .. n-1) ─────────────────────────────────────
  // Auto-derived straight from the same installments[] array that backs the
  // "Details" tab, so the "Previous Installment(s) Summary" table always
  // reflects whatever is actually saved/edited for this project — no
  // separate bookkeeping needed. A Fresh Sanction is always instIndex 0, so
  // this naturally comes out empty and the table is skipped entirely
  // (see PrevInstallmentsTable / its caller below).
  const previousInstallments = (previousInstallmentsOverride && previousInstallmentsOverride.length > 0)
    ? previousInstallmentsOverride
    : allInstallments.slice(0, instIndex).map((pInst, idx) => ({
        label: pInst.label || pInst.installmentNo || `${ordinal(idx + 1)} Installment`,
        heads: calcHeads(pInst),
        releasedDate: pInst.releasedDate || pInst.proceedingDate || '—',
      }));

  return {
    reportDate: todayStr(),
    proceedingNo,
    proceedingDate,
    sanctionRef,
    refNo,
    refDate,
    piName, piDesignation, piDept, piCampus,
    projectTitle,
    fundingAgency,
    projectScheme,
    projectPeriod,
    installmentNumber,
    instLabel,
    equipmentItems,
    manpowerItems,
    heads,
    bankAccount,
    ifsCode,
    bankBranch,
    directorName,
    toAddress,
    copyTo,
    previousInstallments,
    inst,
  };
}

// ─── Inline styles ───────────────────────────────────────────────────────────

const S = {
  page: {
    width: '210mm',
    minHeight: '297mm',
    margin: '0 auto',
    background: '#fff',
    padding: '14mm 14mm 14mm 20mm',
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '11pt',
    lineHeight: 1.5,
    color: '#000',
    boxSizing: 'border-box',
  },
  header: { textAlign: 'center', marginBottom: '6px' },
  headerTitle: { fontWeight: 'bold', fontSize: '13pt', margin: 0, textDecoration: 'underline' },
  headerSub: { fontSize: '11pt', margin: '2px 0' },
  headerAddr: { fontSize: '11pt', margin: 0 },
  divider: { borderTop: '1.5px solid #000', margin: '6px 0 4px' },
  proceedingRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11pt' },
  stars: { textAlign: 'center', letterSpacing: '4px', margin: '6px 0', fontSize: '11pt' },
  subject: { marginTop: '10px', textAlign: 'justify', fontSize: '11pt' },
  para: { marginTop: '10px', textAlign: 'justify', fontSize: '11pt' },
  tableWrap: { marginTop: '10px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt' },
  th: { border: '1px solid #000', padding: '3px 5px', textAlign: 'center', fontWeight: 'bold', background: '#f5f5f5' },
  td: { border: '1px solid #000', padding: '2px 5px', verticalAlign: 'top' },
  tdRight: { border: '1px solid #000', padding: '2px 5px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'top' },
  tdCenter: { border: '1px solid #000', padding: '2px 5px', textAlign: 'center', verticalAlign: 'top' },
  groupRow: { fontWeight: 'bold', background: '#fafafa' },
  totalRow: { fontWeight: 'bold', background: '#f0f0f0' },
  signature: { marginTop: '48px', textAlign: 'right', fontWeight: 'bold', fontSize: '11pt' },
  toSection: { marginTop: '14px', fontSize: '11pt' },
  copySection: { marginTop: '8px', fontSize: '11pt' },
  note: { marginTop: '10px', fontSize: '10.5pt', textAlign: 'justify' },
};

// ─── Previous Installments Summary ──────────────────────────────────────────

function PrevInstallmentsTable({ previousInstallments }) {
  if (!previousInstallments || previousInstallments.length === 0) return null;
  return (
    <div style={S.tableWrap}>
      <p style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '10.5pt' }}>
        Previous Installment(s) Summary:
      </p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Sl. No.</th>
            <th style={S.th}>Installment</th>
            <th style={S.th}>Amount Sanctioned (₹)</th>
            <th style={S.th}>Released Date</th>
          </tr>
        </thead>
        <tbody>
          {previousInstallments.map((pi, i) => (
            <tr key={i}>
              <td style={S.tdCenter}>{i + 1}</td>
              <td style={S.td}>{pi.label}</td>
              <td style={S.tdRight}>{fmtINR(pi.heads?.grand ?? pi.amount)}</td>
              <td style={S.tdCenter}>{pi.releasedDate || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Budget Table ────────────────────────────────────────────────────────────

function BudgetTable({ data }) {
  const { heads, equipmentItems, manpowerItems } = data;

  const rows = [
    {
      sl: 'A',
      head: `Non-Recurring Heads (₹ ${fmtINRStrict(heads.nr)})`,
      amount: null,
      group: true,
    },
    {
      sl: '1', group: false,
      head: (
        <span>
          Equipment
          {equipmentItems.length > 0 && (
            <span>{equipmentItems.map((e, i) => (
              <span key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px', gap: '12px' }}>
                <span>• {e.name}</span>
                <span style={{ whiteSpace: 'nowrap' }}>₹ {fmtINRStrict(e.amount)}</span>
              </span>
            ))}</span>
          )}
          <br />
          <span style={{ fontSize: '10pt' }}>No. of equipment types: {equipmentItems.length}</span>
        </span>
      ),
      amount: heads.nr,
    },
    {
      sl: 'B',
      head: `Recurring Heads (₹ ${fmtINRStrict(heads.recurringTotal)})`,
      amount: null,
      group: true,
    },
    {
      sl: '1', group: false,
      head: (
        <span>
          Manpower
          {manpowerItems.length > 0 && (
            <span>{manpowerItems.map((m, i) => (
              <span key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px', gap: '12px' }}>
                <span>• {m.type}</span>
                <span style={{ whiteSpace: 'nowrap' }}>₹ {fmtINRStrict(m.amount)}</span>
              </span>
            ))}</span>
          )}
          <br />
          <span style={{ fontSize: '10pt' }}>No. of manpower types: {manpowerItems.length}</span>
        </span>
      ),
      amount: heads.man,
    },
    { sl: '2', head: 'Consumables & Accessories', amount: heads.con, group: false },
    { sl: '3', head: 'Travel',                    amount: heads.trv, group: false },
    { sl: '4', head: 'Contingency',               amount: heads.cnt, group: false },
    {
      sl: 'C',
      head: `Overhead (₹ ${fmtINRStrict(heads.oh.total)})`,
      amount: heads.oh.total,
      group: true,
    },
    { sl: '5', head: 'i) The Registrar A/C, Chennai 5%',       amount: heads.oh.registrar, group: false, indent: true },
    { sl: '6', head: 'ii) CSRC Revenue, Chennai 4%',           amount: heads.oh.csrc,      group: false, indent: true },
    { sl: '7', head: 'iii) The Dean, Campus A/C 4%',           amount: heads.oh.dean,      group: false, indent: true },
    { sl: '8', head: 'iv) The Principal Investigator PDF 2%',  amount: heads.oh.pdf,       group: false, indent: true },
    { sl: 'D', head: 'Scientific Social Responsibility Budget Detail', amount: heads.ssr, group: false },
  ];

  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: '52px' }}>Sl. No.</th>
            <th style={S.th}>Head of Account</th>
            <th style={{ ...S.th, width: '160px' }}>Amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={r.group ? S.groupRow : {}}>
              <td style={S.tdCenter}>{r.sl}</td>
              <td style={{ ...S.td, ...(r.indent ? { paddingLeft: '24px' } : {}) }}>{r.head}</td>
              <td style={S.tdRight}>{r.amount !== null ? fmtINR(r.amount) : ''}</td>
            </tr>
          ))}
          <tr style={S.totalRow}>
            <td colSpan={2} style={{ ...S.td, textAlign: 'right', fontWeight: 'bold' }}>Total Amount</td>
            <td style={{ ...S.tdRight, fontWeight: 'bold' }}>{fmtINR(heads.grand)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Signature Block ─────────────────────────────────────────────────────────
// Mirrors the endorsement pattern exactly:
//   - isCompleted=true  → only director slot (final doc, like Completed.jsx)
//   - isCompleted=false → all 3 slots; signed = image/✔, unsigned = "Pending"

function SignatureBlock({ signatures = {}, isCompleted = false }) {
  const sigStyle = {
    wrap: {
      display: 'flex',
      justifyContent: isCompleted ? 'flex-end' : 'flex-end',
      gap: '32px',
      marginTop: '40px',
      paddingTop: '12px',
      borderTop: '1px solid #ccc',
    },
    item: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      minWidth: '90px',
    },
    imgBox: {
      width: '90px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    img: { maxHeight: '36px', maxWidth: '90px', objectFit: 'contain' },
    approved: {
      fontSize: '11pt',
      color: '#1a6e2e',
      fontWeight: 'bold',
      border: '1px solid #1a6e2e',
      padding: '2px 8px',
      borderRadius: '4px',
    },
    pending: {
      fontSize: '10pt',
      color: '#999',
      border: '1px dashed #ccc',
      padding: '2px 10px',
      borderRadius: '4px',
    },
    role: {
      fontSize: '9.5pt',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#333',
      marginTop: '2px',
    },
    checkmark: { fontSize: '9pt', color: '#1a6e2e' },
  };

  const renderSig = (sig) => {
    if (!sig) return <div style={sigStyle.pending}>Pending</div>;
    if (typeof sig === 'string' && sig.startsWith('data:')) {
      return <img src={sig} alt="Signature" style={sigStyle.img} />;
    }
    return <div style={sigStyle.approved}>✔ Approved</div>;
  };

  if (isCompleted) {
    // Final doc: only director signature
    return (
      <div style={sigStyle.wrap}>
        <div style={sigStyle.item}>
          <div style={sigStyle.imgBox}>{renderSig(signatures.director)}</div>
          <div style={sigStyle.role}>DIRECTOR, CSRC</div>
          {signatures.director && <div style={sigStyle.checkmark}>✔ Signed</div>}
        </div>
      </div>
    );
  }

  // Workflow mode: all 3 slots
  const slots = [
    { key: 'assistant',      label: 'ASST. (Office)' },
    { key: 'superintendent', label: 'SUPDT'          },
    { key: 'director',       label: 'DIRECTOR, CSRC' },
  ];

  return (
    <div style={sigStyle.wrap}>
      {slots.map(({ key, label }) => (
        <div key={key} style={sigStyle.item}>
          <div style={sigStyle.imgBox}>{renderSig(signatures[key])}</div>
          <div style={sigStyle.role}>{label}</div>
          {signatures[key] && <div style={sigStyle.checkmark}>✔ Signed</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Main Report Component ───────────────────────────────────────────────────

export default function CSRCProceedingsReport({ reportData, signatures = {}, isCompleted = false }) {
  // Fallback dummy data for standalone preview
  const d = reportData || {
    projectTitle: 'AI Based Crop Monitoring System',
    fundingAgency: 'SERB',
    piName: 'Dr. Siva Kumar',
    piDesignation: 'Professor',
    piDept: 'Mechanical Engineering',
    piCampus: 'CEG Campus',
    proceedingNo: 'CSRC/2026/001',
    proceedingDate: '17-06-2026',
    sanctionRef: 'CSRC/2026/001, dated 17-06-2026',
    refNo: 'SERB/AI/2026/01',
    refDate: '15-06-2026',
    instLabel: '1st Installment',
    projectScheme: 'SPC',
    projectPeriod: '3 Years',
    heads: {
      nr: 500000, man: 300000, con: 150000, trv: 50000, cnt: 25000, ssr: 30000,
      oh: { total: 120000, registrar: 40000, dean: 32000, csrc: 32000, pdf: 16000 },
      grand: 1175000,
      recurringTotal: 525000,
    },
    equipmentItems: [
      { name: 'High Performance Workstation', amount: 300000 },
      { name: 'GPU Server', amount: 200000 },
    ],
    manpowerItems: [
      { type: 'Project Associate-I', amount: 200000 },
      { type: 'Junior Research Fellow', amount: 100000 },
    ],
    bankAccount: '1234567890',
    ifsCode: 'SBIN0006756',
    directorName: 'THE DIRECTOR, CSRC',
    toAddress: 'The Director\nCrystal Growth Centre, ACT Campus\nAnna University',
    copyTo: ['Dr. Siva Kumar', 'CSRC – 3', 'CSRC – 4', 'PDF Register', 'Bill'],
    previousInstallments: [],
  };

  return (
    <div style={S.page}>

      {/* ── Letterhead ── */}
      <div style={S.header}>
        <p style={S.headerTitle}>Centre for Sponsored Research and Consultancy (CSRC)</p>
        <p style={S.headerSub}><em>(formerly known as CTDT)</em></p>
        <p style={S.headerAddr}>Anna University, Chennai – 600 025.</p>
      </div>

      <div style={S.divider} />

      {/* ── Proceedings No & Date ── */}
      <div style={S.proceedingRow}>
        <span><strong>Proceedings No: </strong>{d.proceedingNo}</span>
        <span><strong>Date: </strong>{fmtDate(d.proceedingDate) || todayStr()}</span>
      </div>

      {/* ── Reference chain ── */}
      <div style={{ fontSize: '11pt', marginBottom: '4px' }}>
        <p style={{ margin: '2px 0' }}><strong>Ref:</strong></p>
        <ol style={{ margin: '2px 0 2px 18px', padding: 0 }}>
          <li style={{ marginBottom: '2px' }}>
            Anna University — SERB — SRC — Syndicate Resolution No. 172 S.D. dt. 28.12.2016 —&nbsp;
            <em>Transfer of Funds — Sanction — Accorded.</em>
          </li>
          <li style={{ marginBottom: '2px' }}>
            Sanction No. SRC/2021/002867 (G) &amp; (C), dated 24-06-2022.
          </li>
          <li style={{ marginBottom: '2px' }}>
            Sanction Proceedings No. &amp; Date:&nbsp;
            <strong>{d.sanctionRef}</strong>
          </li>
          <li style={{ marginBottom: '2px' }}>
            {d.refNo
              ? `Letter No. ${d.refNo}${d.refDate ? `, dated ${fmtDate(d.refDate)}` : ''}`
              : 'Letter No. ___________'}
          </li>
        </ol>
      </div>

      <div style={S.stars}>* * * * *</div>

      {/* ── Subject ── */}
      <p style={S.subject}>
        <strong>Sub:</strong>&nbsp;
        {d.fundingAgency} — Initiation of project&nbsp;
        <strong>"{d.projectTitle}"</strong>&nbsp;
        {d.projectScheme ? `under "${d.projectScheme}" ` : ''}
        under Principal Investigator&nbsp;
        <strong>{d.piName}</strong>,&nbsp;
        {d.piDept}, {d.piCampus} as the Principal Investigator for the project&nbsp;
        {d.projectPeriod && <>for the period <strong>{d.projectPeriod}</strong></>}
        — Prior sanction approval — reg.
      </p>

      {/* ── Body ── */}
      <p style={S.para}>
        The Science and Engineering Research Board, New Delhi has sanctioned a project entitled&nbsp;
        <strong>"{d.projectTitle}"</strong>&nbsp;
        under <strong>"{d.projectScheme || d.fundingAgency}"</strong>&nbsp;
        to <strong>{d.piName}</strong>,&nbsp;
        <strong>{d.piDesignation}</strong>,&nbsp;
        <strong>{d.piDept}</strong>, {d.piCampus}, as the Principal Investigator for the above said project.&nbsp;
        The funding agency has already been released by the funding agency and the necessary sanction proceedings had
        also been issued for the implementation of the above said project, as per the details given below.
      </p>

      {/* ── Previous installments — only present for the 2nd+ installment
           of a Renewal Sanction (rows 1..n-1). A Fresh Sanction is always
           the 1st installment, so previousInstallments is empty and this
           is skipped entirely. ── */}
      <PrevInstallmentsTable previousInstallments={d.previousInstallments} />

      {/* ── Transfer paragraphs ── */}
      <p style={S.para}>
        Now, funding agency has released the&nbsp;
        <strong>{d.instLabel}</strong>&nbsp;
        of Rs. <strong>{fmtINR(d.heads.grand)}</strong>&nbsp;
        (Rupees <em>{d.heads.grand ? '[amount in words]' : '___________'}</em>)
        vide the reference third cited above.
      </p>

      <p style={S.para}>
        In the reference fourth cited above, <strong>{d.piName}</strong>, Principal Investigator of the Project,&nbsp;
        has requested to transfer the Project grant to The Director after deducting Overhead charges as per the CSRC norms.
      </p>

      <p style={S.para}>
        Crystal Growth Centre, ACT Campus, Anna University, Account No.&nbsp;
        <strong>{d.bankAccount}</strong>, IFS Code: <strong>{d.ifsCode}</strong>,&nbsp;
        to meet the expenses related to the above project, after deducting Overhead charges as per the CSRC norms.
      </p>

      <p style={S.para}>
        In view of the above and as per the powers delegated in the reference first cited above, sanction is hereby accorded&nbsp;
        to transfer an amount not exceeding&nbsp;
        <strong>Rs. {fmtINR(d.heads.grand)}</strong>&nbsp;
        ({d.instLabel}) being the Project grant and Overhead charges to the respective account, as detailed below.
      </p>

      {/* ── Budget table ── */}
      <BudgetTable data={d} />

      {/* ── Notes ── */}
      <p style={S.note}>
        The CSRC overhead charges 6(ii) along with PDF amount 8(iv) are retained in the Revenue a/c of CSRC.
      </p>
      <p style={S.note}>
        The amount allocated under PDF a/c... can be utilized by the individual, as per the norms prescribed in the CSRC Guidelines.
      </p>
      <p style={S.note}>
        The expenditure for the above project will be debitable to T/F – SERB Project&nbsp;
        <strong>"{d.projectTitle}"</strong>&nbsp;
        by <strong>{d.piName}</strong>, <strong>{d.piDesignation}</strong>,&nbsp;
        {d.piDept}, {d.piCampus}.
      </p>
      <p style={S.note}>
        The above sanction has been entered in the Project Sanction Register Vol. · VIIIB vide Sl. No. 2 at Page No. 98.
      </p>
      <p style={S.note}>
        The expenditure in this regard is debitable from <strong>"CSRC Project Account"</strong>&nbsp;
        under the Head of account "Project".
      </p>

      <p style={S.para}>
        The items and consumables as detailed in your project may be purchased by following the University guidelines / rules
        in force at Anna University. The utilization of Contingency and Travel shall be as per the rules and regulations
        specified by Anna University.
      </p>

      {/* ── Signature block (3-stage or director-only) ── */}
      <SignatureBlock signatures={signatures} isCompleted={isCompleted} />

      {/* ── To / Copy ── */}
      <div style={S.toSection}>
        <strong>To</strong><br />
        {d.toAddress.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
      </div>

      <div style={S.copySection}>
        <strong>Copy to:</strong>
        <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
          {d.copyTo.map((c, i) => <li key={i}>{c}</li>)}
        </ol>
      </div>

    </div>
  );
}

// ─── Print helper ────────────────────────────────────────────────────────────

export function printCSRCReport(reportData, signatures, isCompleted) {
  const ReactDOM = require('react-dom/server');
  const html = ReactDOM.renderToStaticMarkup(
    <CSRCProceedingsReport reportData={reportData} signatures={signatures} isCompleted={isCompleted} />
  );
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>CSRC Proceedings — ${reportData?.projectTitle || 'Report'}</title>
  <style>
    body { margin: 0; background: #e5e5e5; display: flex; justify-content: center; }
    @page { size: A4; margin: 0; }
    @media print { body { background: #fff; display: block; } }
  </style>
</head>
<body>${html}</body>
</html>`);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
}