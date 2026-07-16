import React from 'react';
import annaLogo from "../../assets/anna_univ_logo.png";
import csrcLogo from "../../assets/csrc_logo.png";

// ============================================================
// CSRCPDFSanctionLetter.jsx
// Renders the official CSRC "Reimbursement/Payment from PDF
// Account" proceedings letter, built entirely from:
//   - the faculty's original PDF request (fetched, read-only)
//   - the few office-entered fields (MH No, Head, Subhead,
//     Sanction Register S.No, Page No, Proceedings No/Date)
// Matches the printed letterhead layout: dual logos, centered
// title block, Procs No / Date row, Sub, Ref, body, signature
// block, To / Copy to.
// ============================================================

// ─── Number → words (Indian numbering system) ───────────────
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return TENS[t] + (o ? ' ' + ONES[o] : '');
}
function threeDigits(n) {
  const h = Math.floor(n / 100), r = n % 100;
  return (h ? ONES[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? twoDigits(r) : '');
}
export function numberToIndianWords(num) {
  let n = Math.round(Math.abs(parseFloat(num) || 0));
  if (n === 0) return 'Zero';
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const hundred = n;
  let parts = [];
  if (crore) parts.push(threeDigits(crore) + ' Crore');
  if (lakh) parts.push(threeDigits(lakh) + ' Lakh');
  if (thousand) parts.push(threeDigits(thousand) + ' Thousand');
  if (hundred) parts.push(threeDigits(hundred));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
export function fmtINR(n) {
  const num = parseFloat(n) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
export const amountInWords = (n) => `Rupees ${numberToIndianWords(n)} only`;

// ─── Salutation helper (Dr./Mr./Ms. inferred from stored title, default Dr.) ─
const salutedName = (name, gender) => {
  if (!name) return '';
  if (/^(dr|mr|ms|mrs|prof)\.?\s/i.test(name)) return name;
  return `Dr. ${name}`;
};

// ─── Build Sub / Ref / body copy purely from the request's own data ─────────
export function buildLetterCopy(request) {
  const acc = request.account || {};
  const name = salutedName(acc.accountHolder || request.facultyName);
  const designation = request.designation || 'Professor';
  const department = request.department || 'Department';
  const campus = request.campus ? `${request.campus} Campus, ` : '';
  const cf = request.categoryFields || {};
  const reqType = request.requestType || 'Reimbursement';
  const category = request.category || '';

  const verbByType = {
    'Reimbursement': 'issue reimbursement sanction',
    'Vendor Payment': 'issue sanction for direct vendor payment',
    'Advance Payment': 'issue sanction for advance payment',
  }[reqType] || 'issue sanction';

  let expenditureClause = '';
  switch (category) {
    case 'Travel':
      expenditureClause = `having undertaken travel from ${cf.fromDate || '_____'} to ${cf.toDate || '_____'} for the purpose of ${cf.purpose || 'official work'}`;
      break;
    case 'Membership Fee':
      expenditureClause = `having paid the membership fee to ${cf.professionalBody || 'the professional body'}${cf.purpose ? ` for ${cf.purpose}` : ''}`;
      break;
    case 'Purchase of Non-Consumables':
    case 'Purchase of Consumables':
      expenditureClause = `having purchased ${cf.description || 'the item(s) as per the enclosed bills'}`;
      break;
    case 'Registration Fee':
      expenditureClause = `having paid the registration fee${cf.purpose ? ` for ${cf.purpose}` : ''}`;
      break;
    case 'Patent Filing Charges':
      expenditureClause = `having paid the patent filing charges towards ${cf.description || 'the patent application'}`;
      break;
    default:
      expenditureClause = cf.description || cf.otherType || 'the expenditure as per the enclosed documents';
  }

  const sub = `CSRC – ${reqType} from PDF Account – ${name}, ${designation}, ${department} – Sanction – Accorded – Reg.`;
  const ref2 = `Letter from ${name}, ${designation}, ${department}, AU. Received on ${request.submittedAt || '_____'}`;
  const bodyPara1 = `In the reference second cited above, ${name}, ${designation}, ${department}, ${campus}has requested to ${verbByType} for an amount of Rs. ${fmtINR(request.amount)}/- from his/her Professional Development Fund retained in the CSRC Revenue Account for ${expenditureClause}.`;

  return { name, designation, department, campus, sub, ref2, bodyPara1 };
}

// ============================================================
// Styles — mirrors an A4 letterhead print layout
// ============================================================
const S = {
  page: {
    background: '#fff',
    width: '100%',
    maxWidth: '820px',
    margin: '0 auto',
    padding: '34px 46px 46px',
    fontFamily: 'Georgia, "Times New Roman", serif',
    color: '#1a1a1a',
    fontSize: '13.5px',
    lineHeight: 1.55,
    boxShadow: '0 0 0 1px #d8dee8',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderBottom: '2px solid #1a1a1a',
    paddingBottom: 10,
    marginBottom: 6,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: '20%',
    border: '1.5px  #94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
    flexShrink: 0,
    fontFamily: 'Arial, sans-serif',
  },
  titleBlock: { textAlign: 'center', flex: 1, padding: '0 8px' },
  orgTitle: { fontSize: 18, fontWeight: 700, letterSpacing: 0.3, margin: 0 },
  orgSubtitle: { fontSize: 11.5, fontStyle: 'italic', margin: '3px 0' },
  orgAddress: { fontSize: 12.5, fontWeight: 600, margin: 0 },
  directorTag: { fontSize: 10.5, fontWeight: 700, marginBottom: 2 },
  directorTagSub: { fontSize: 9.5, color: '#444' },

  metaRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    fontSize: 12.5, margin: '14px 0 4px',
  },
  metaLabel: { fontWeight: 700 },

  subBlock: { display: 'flex', gap: 8, margin: '14px 0 6px' },
  subLabel: { fontWeight: 700, flexShrink: 0 },

  refBlock: { display: 'flex', gap: 8, margin: '2px 0 14px' },
  refLabel: { fontWeight: 700, flexShrink: 0 },
  refList: { margin: 0, paddingLeft: 18 },

  divider: { textAlign: 'center', letterSpacing: 6, margin: '10px 0 16px', color: '#444' },

  para: { margin: '0 0 14px', textAlign: 'justify' },
  bold: { fontWeight: 700 },
  highlight: { background: '#f1f3f6', padding: '0 2px' },

  sigRow: { display: 'flex', justifyContent: 'flex-end', marginTop: 28 },
  sigBlock: { textAlign: 'center', minWidth: 180 },
  sigImgPlaceholder: {
    height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#94a3b8', fontStyle: 'italic', fontFamily: 'Arial, sans-serif',
  },
  sigLabel: { fontWeight: 700, fontSize: 12.5, borderTop: '1px solid #1a1a1a', paddingTop: 4 },

  toBlock: { marginTop: 30, fontSize: 12.5 },
  toLabel: { fontWeight: 700, marginBottom: 4 },
  toAddress: { lineHeight: 1.5 },

  copyBlock: { marginTop: 18, fontSize: 12.5 },
  copyLabel: { fontWeight: 700, marginBottom: 4 },
  copyList: { margin: 0, paddingLeft: 18 },

  draftWatermark: {
    position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%) rotate(-28deg)',
    fontSize: 64, fontWeight: 800, color: 'rgba(220,38,38,0.14)', letterSpacing: 8,
    pointerEvents: 'none', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap',
  },
  directorInfo: {
  margin: "12px 0 10px",
  lineHeight: 1.35,
},
directorName: {
  fontWeight: 700,
  fontSize: 13,
},
directorDesignation: {
  fontSize: 12,
},
};

// ============================================================
// Main component
// ============================================================
export default function CSRCPDFSanctionLetter({ request, officeFields = {}, availableBalanceAfter, isCompleted }) {
  const copy = buildLetterCopy(request);
  const director = officeFields.directorName || 'Dr. S. Balasivanandha Prabu';

  return (
    <div style={{ position: 'relative', background: '#e5e7eb', padding: '24px 8px' }}>
      <div style={S.page}>
        {!isCompleted && <div style={S.draftWatermark}>DRAFT</div>}

        {/* Header: logos + org block */}
        <div style={S.headerRow}>
  <img
    src={annaLogo}
    alt="Anna University Logo"
    style={S.logo}
  />

  <div style={S.titleBlock}>
    <h1 style={S.orgTitle}>
      CENTRE FOR SPONSORED RESEARCH AND CONSULTANCY
    </h1>
    <p style={S.orgSubtitle}>
      (Formerly Centre for Technology Development and Transfer)
    </p>
    <p style={S.orgAddress}>
      ANNA UNIVERSITY, CHENNAI - 600 025
    </p>
  </div>

    <img
    src={csrcLogo}
    alt="CSRC Logo"
    style={S.logo}
  />


</div>

{/* Director Details */}
<div style={S.directorInfo}>
  <div style={S.directorName}>{director.toUpperCase()}</div>
  <div style={S.directorDesignation}>
    PROFESSOR AND DIRECTOR
  </div>
</div>

{/* Meta row */}
<div style={S.metaRow}>
  <div>
    <span style={S.metaLabel}>Procs. No: </span>
    {officeFields.proceedingNo || "________________"}
  </div>

  <div>
    <span style={S.metaLabel}>Date: </span>
    {officeFields.proceedingDate || "__________"}
  </div>
</div>


        {/* Sub */}
        <div style={S.subBlock}>
          <span style={S.subLabel}>Sub:</span>
          <span>{copy.sub}</span>
        </div>

        {/* Ref */}
        <div style={S.refBlock}>
          <span style={S.refLabel}>Ref:</span>
          <ol style={S.refList}>
            <li>Syndicate Resolution No.172.5.2 dated 28.12.2005</li>
            <li>{copy.ref2}</li>
          </ol>
        </div>

        <div style={S.divider}>*****</div>

        {/* Body */}
        <p style={S.para}>{copy.bodyPara1}</p>

        <p style={S.para}>
          The balance amount available in his/her Professional Development fund is{' '}
          <span style={S.bold}>Rs. {fmtINR(availableBalanceAfter)}/-</span> ({amountInWords(availableBalanceAfter)}).
        </p>

        <p style={S.para}>
          In view of the above and as per the powers delegated in the reference first cited above, sanction is
          hereby accorded to {copy.name}, {copy.designation}, {copy.department}, {copy.campus}Anna University to
          claim an amount of <span style={S.bold}>Rs. {fmtINR(request.amount)}/-</span> ({amountInWords(request.amount)}) for
          the above said expenditure by following the University norms.
        </p>

        <p style={S.para}>
          The expenditure in this regard is debitable from the CSRC Revenue Account under the Head of Account{' '}
          <span style={S.highlight}>
            "M.H.No. {officeFields.mhNo || '_____'} – {officeFields.head || '_____'}: {officeFields.subhead || '_____'}"
          </span>. Necessary entry about this sanction has been made in the CSRC Revenue Account Sanction Register
          Vide S.No. <span style={S.bold}>{officeFields.sNo || '___'}</span> at Page No. <span style={S.bold}>{officeFields.pageNo || '___'}</span>.
        </p>

        {/* Signature */}
        <div style={S.sigRow}>
          <div style={S.sigBlock}>
            <div style={S.sigImgPlaceholder}>{isCompleted ? '[ signature ]' : '\u00A0'}</div>
            <div style={S.sigLabel}>DIRECTOR, CSRC</div>
          </div>
        </div>

        {/* To */}
        <div style={S.toBlock}>
          <div style={S.toLabel}>To</div>
          <div style={S.toAddress}>
            {copy.name}, {copy.designation},<br />
            {copy.department}, {copy.campus}<br />
            Anna University, Chennai – 25.
          </div>
        </div>

        {/* Copy to */}
        <div style={S.copyBlock}>
          <div style={S.copyLabel}>Copy to:</div>
          <ol style={S.copyList}>
            <li>The HOD, {copy.department}, {copy.campus}Anna University, Chennai – 25.</li>
            <li>Bill</li>
          </ol>
        </div>
      </div>
    </div>
  );
}