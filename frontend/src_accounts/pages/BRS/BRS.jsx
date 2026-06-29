import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";
import "./BRS.css";
import Layout from "../../components/Layout";

// ─── DUMMY DATA ──────────────────────────────────────────────────────────────
const FINANCIAL_YEARS = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"];
const ACCOUNT_TYPES = ["Revenue", "Project", "MOPR", "TTDF", "Tax"];
const MONTHS = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March",
];

const DUMMY_SUMMARY = {
  openingBalance: 46445114.51,
  receipts: 9040356.0,
  totalReceipts: 55485470.51,
  payments: 2621387.0,
  closingBalance: 52864083.51,
};

const DUMMY_CHEQUES_ISSUED = [
  { date: "29-03-2025", vrNo: "Vr.No.1081", amount: 15980.0 },
  { date: "17-04-2025", vrNo: "Vr.No.18",   amount: 165150.0 },
  { date: "23-04-2025", vrNo: "Vr.No.23",   amount: 10656.0 },
  { date: "25-04-2025", vrNo: "Vr.No.25",   amount: 300.0 },
  { date: "30-04-2025", vrNo: "Vr.No.30",   amount: 1165.0 },
  { date: "30-04-2025", vrNo: "Vr.No.30",   amount: 1165.0 },
  { date: "30-04-2025", vrNo: "Vr.No.30",   amount: 2331.0 },
  { date: "30-04-2025", vrNo: "Vr.No.30",   amount: 8390.0 },
];

const DUMMY_DEBITED_BY_BANK = [
  { date: "16-04-2025", description: "TO TRANSFER : 0505625TP0B02112 00715253000001TF85035389968", amount: 500.0 },
  { date: "16-04-2025", description: "TO TRANSFER : 0505625TP0B02112 00715253000001TF85035389968", amount: 877.0 },
  { date: "16-04-2025", description: "TO TRANSFER : 0505625TP0B02112 00715253000001TF85035389968", amount: 90.0 },
];

const DUMMY_CREDITED_BY_BANK = [
  { date: "19-05-2022", description: "BY TRANSFER NEFT*IOBA0001681*IOBAN22139360480*THE CHAIRMAN, TA", amount: 7000.0 },
  { date: "20-10-2022", description: "BY TRANSFER NEFT*IOBA0001762*IOBAN22293021464*SENSOR ASSISTED", amount: 142730.8 },
  { date: "14-12-2022", description: "BY TRANSFER NEFT*IOBA0001762*IOBAN22348312144*SENSOR ASSISTED", amount: 280.0 },
  { date: "14-12-2022", description: "BY TRANSFER NEFT*IOBA0001762*IOBAN22348313277*SENSOR ASSISTED", amount: 1.0 },
  { date: "05-01-2023", description: "BY TRANSFER NEFT*ICIC0SF0002*30685531621DC*VELLI VENTURES PRIV", amount: 10000.0 },
  { date: "30-04-2025", description: "BY TRANSFER UPI/CR/548676365891/A J KISH/ICIC/kishore.ja/UPI", amount: 1500.0 },
];

const DUMMY_CHEQUE_NOT_REALISED = [
  { date: "09-01-2025", description: "BY TRANSFER UPI/CR/744003844843/Mr PRASA/CIUB/9360188797/Payme", amount: 2360.0 },
  { date: "09-01-2025", description: "BY TRANSFER UPI/CR/569914584119/Ms Seaja/IDIB/seajangini/UPI",  amount: 2360.0 },
  { date: "09-03-0206", description: "BY TRANSFER UPI/CR/602104121404/DHIYANES/KVBL/dhiyanesh8/UPI",  amount: 1180.0 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// Running balance that CARRIES FORWARD from a starting value (continuous ledger,
// matching the real BRS format: each row shows cash-book balance running
// cumulatively through every section, not a per-section reset).
const carryForward = (rows, startValue, sign) => {
  let acc = startValue;
  return rows.map((r) => {
    acc += sign * r.amount;
    return acc;
  });
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function BRS() {
  const [fy, setFy] = useState("2025-2026");
  const [month, setMonth] = useState("April");
  const [accountType, setAccountType] = useState("Project");
  const printRef = useRef(null);

  // ── derived numbers (replace with real calc later) ──
  const summary = DUMMY_SUMMARY;
  const chqIssuedTotal   = DUMMY_CHEQUES_ISSUED.reduce((s, r) => s + r.amount, 0);
  const debitedTotal     = DUMMY_DEBITED_BY_BANK.reduce((s, r) => s + r.amount, 0);
  const creditedTotal    = DUMMY_CREDITED_BY_BANK.reduce((s, r) => s + r.amount, 0);
  const notRealisedTotal = DUMMY_CHEQUE_NOT_REALISED.reduce((s, r) => s + r.amount, 0);

  // Continuous running ledger — each section's running column starts where
  // the previous section's running column left off.
  const chqRunning   = carryForward(DUMMY_CHEQUES_ISSUED, summary.closingBalance, +1);
  const afterChq      = chqRunning[chqRunning.length - 1];

  const debRunning   = carryForward(DUMMY_DEBITED_BY_BANK, afterChq, -1);
  const afterDeb      = debRunning[debRunning.length - 1];

  const credRunning  = carryForward(DUMMY_CREDITED_BY_BANK, afterDeb, +1);
  const afterCred     = credRunning[credRunning.length - 1];

  const notRealRunning = carryForward(DUMMY_CHEQUE_NOT_REALISED, afterCred, -1);
  const closingPassbook = notRealRunning[notRealRunning.length - 1];

  // ── Export to Excel ──
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryRows = [
      ["BANK RECONCILIATION STATEMENT"],
      [`Financial Year: ${fy}   Month: ${month}   Account Type: ${accountType}`],
      [],
      ["Summary"],
      ["Opening Balance", summary.openingBalance],
      ["Receipts", summary.receipts],
      ["Total Receipts", summary.totalReceipts],
      ["Payments", summary.payments],
      ["Closing Balance (Cash Book)", summary.closingBalance],
      [],
      ["Add :- Cheques Issued but not Presented"],
      ["Date", "Voucher No.", "Amount", "Running Balance"],
      ...DUMMY_CHEQUES_ISSUED.map((r, i) => [r.date, r.vrNo, r.amount, chqRunning[i]]),
      ["", "", "Section Total", chqIssuedTotal],
      [],
      ["Less :- Debited by Bank, not Accounted by Us"],
      ["Date", "Description", "Amount", "Running Balance"],
      ...DUMMY_DEBITED_BY_BANK.map((r, i) => [r.date, r.description, r.amount, debRunning[i]]),
      ["", "", "Section Total", debitedTotal],
      [],
      ["Add :- Credited by Bank, not Accounted by Us"],
      ["Date", "Description", "Amount", "Running Balance"],
      ...DUMMY_CREDITED_BY_BANK.map((r, i) => [r.date, r.description, r.amount, credRunning[i]]),
      ["", "", "Section Total", creditedTotal],
      [],
      ["Less :- Cheque Presented but not Realised"],
      ["Date", "Description", "Amount", "Running Balance"],
      ...DUMMY_CHEQUE_NOT_REALISED.map((r, i) => [r.date, r.description, r.amount, notRealRunning[i]]),
      ["", "", "Section Total", notRealisedTotal],
      [],
      ["Closing Balance as per Bank Passbook", closingPassbook],
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryRows);
    ws["!cols"] = [{ wch: 16 }, { wch: 60 }, { wch: 16 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, "BRS");
    XLSX.writeFile(wb, `BRS_${accountType}_${month}_${fy}.xlsx`);
  };

  // ── Export to PDF ──
  const exportPDF = () => {
    const el = printRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `BRS_${accountType}_${month}_${fy}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };
    html2pdf().set(opt).from(el).save();
  };

  // ── Ledger section renderer ──
  // sign: +1 for "Add" sections, -1 for "Less" sections — drives the rail color,
  // the badge glyph, and the running-balance sign treatment.
  const LedgerSection = ({ index, sign, title, rows, running, sectionTotal, descKey }) => (
    <div className={`brs-ledger-section ${sign > 0 ? "is-add" : "is-less"}`}>
      <div className="brs-ledger-section-head">
        <span className="brs-ledger-step">{index}</span>
        <span className="brs-ledger-op">{sign > 0 ? "Add" : "Less"}</span>
        <h3 className="brs-ledger-title">{title}</h3>
        <span className="brs-ledger-section-sum">
          {sign > 0 ? "+" : "−"}₹{fmt(sectionTotal)}
        </span>
      </div>

      <div className="brs-ledger-table-scroll">
        <table className="brs-ledger-table">
          <thead>
            <tr>
              <th className="col-date">Date</th>
              <th className="col-desc">{descKey === "vrNo" ? "Voucher No." : "Description"}</th>
              <th className="col-amt right">Amount (₹)</th>
              <th className="col-run right">Running Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="col-date mono">{r.date}</td>
                <td className="col-desc">
                  {descKey === "vrNo" ? (
                    <span className="brs-vr-chip">{r.vrNo}</span>
                  ) : (
                    <span className="brs-desc-text" title={r.description}>{r.description}</span>
                  )}
                </td>
                <td className="col-amt right mono">{fmt(r.amount)}</td>
                <td className="col-run right mono">{fmt(running[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="brs-ledger-carry">
        <span className="carry-chevron" aria-hidden="true">▸</span>
        Balance carried forward
        <span className="carry-amount mono">₹{fmt(running[running.length - 1])}</span>
      </div>
    </div>
  );

return (
  <Layout
    title="Bank Reconciliation Statement"
    subtitle="Reconcile bank transactions and balances"
  >
    <div className="brs-root">
      {/* ── HEADER ── */}
      <div className="brs-page-header">
        <div className="brs-page-header-left">
          <div className="brs-eyebrow">CSRC · Anna University</div>
          <h1 className="brs-page-title">Bank Reconciliation Statement</h1>
          <p className="brs-page-sub">Cash-book balance reconciled against the bank passbook, section by section.</p>
        </div>
        <div className="brs-actions">
          <button className="brs-btn brs-btn--excel" onClick={exportExcel}>
            <svg viewBox="0 0 20 20" fill="none"><path d="M4 4h7l5 5v7H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 4v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 11l2 2-2 2M10 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Export Excel
          </button>
          <button className="brs-btn brs-btn--pdf" onClick={exportPDF}>
            <svg viewBox="0 0 20 20" fill="none"><path d="M4 4h7l5 5v7H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 4v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="brs-filter-bar">
        <div className="brs-filter-group">
          <label className="brs-filter-label">Financial Year</label>
          <select className="brs-select" value={fy} onChange={(e) => setFy(e.target.value)}>
            {FINANCIAL_YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div className="brs-filter-group">
          <label className="brs-filter-label">Month</label>
          <select className="brs-select" value={month} onChange={(e) => setMonth(e.target.value)}>
            {MONTHS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="brs-filter-group">
          <label className="brs-filter-label">Account Type</label>
          <select className="brs-select brs-select--accent" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
            {ACCOUNT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="brs-status-badge">
          <span className="brs-status-dot"></span>Completed
        </div>
      </div>

      {/* ── PDF PRINTABLE AREA ── */}
      <div ref={printRef} className="brs-print-area">

        {/* ── SUMMARY TABLE ── */}
<div className="brs-summary-table-wrap">
  <table className="brs-summary-table">
    <tbody>
      <tr>
        <td>Opening Balance</td>
        <td className="mono right">₹{fmt(summary.openingBalance)}</td>
      </tr>

      <tr>
        <td>Receipts</td>
        <td className="mono right">₹{fmt(summary.receipts)}</td>
      </tr>

      <tr>
        <td>Total Receipts</td>
        <td className="mono right">₹{fmt(summary.totalReceipts)}</td>
      </tr>

      <tr>
        <td>Payments</td>
        <td className="mono right">₹{fmt(summary.payments)}</td>
      </tr>

      <tr className="closing-row">
        <td>Closing Balance (Cash Book)</td>
        <td className="mono right">₹{fmt(summary.closingBalance)}</td>
      </tr>
    </tbody>
  </table>
</div>

        {/* ── RECONCILIATION LEDGER (signature element) ── */}
        <div className="brs-ledger-spine">

          <div className="brs-ledger-start">
            <span className="brs-ledger-start-label">Closing Balance as per Cash Book</span>
            <span className="brs-ledger-start-value mono">₹{fmt(summary.closingBalance)}</span>
          </div>

          <LedgerSection
            index="01"
            sign={+1}
            title="Cheques Issued but not Presented"
            rows={DUMMY_CHEQUES_ISSUED}
            running={chqRunning}
            sectionTotal={chqIssuedTotal}
            descKey="vrNo"
          />

          <LedgerSection
            index="02"
            sign={-1}
            title="Debited by Bank, not Accounted by Us"
            rows={DUMMY_DEBITED_BY_BANK}
            running={debRunning}
            sectionTotal={debitedTotal}
            descKey="description"
          />

          <LedgerSection
            index="03"
            sign={+1}
            title="Credited by Bank, not Accounted by Us"
            rows={DUMMY_CREDITED_BY_BANK}
            running={credRunning}
            sectionTotal={creditedTotal}
            descKey="description"
          />

          <LedgerSection
            index="04"
            sign={-1}
            title="Cheque Presented but not Realised"
            rows={DUMMY_CHEQUE_NOT_REALISED}
            running={notRealRunning}
            sectionTotal={notRealisedTotal}
            descKey="description"
          />

          {/* ── FINAL BALANCE ── */}
          <div className="brs-final-balance">
            <span className="brs-final-label">Closing Balance as per Bank Passbook</span>
            <span className="brs-final-value mono">₹{fmt(closingPassbook)}</span>
          </div>
        </div>

      </div>{/* end printRef */}
    </div>
    </Layout>
  );
}