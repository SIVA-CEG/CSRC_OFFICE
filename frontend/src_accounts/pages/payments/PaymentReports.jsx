import React, { useState, useMemo, useRef } from "react";
import Layout from "../../components/Layout";
import { useAccountsBills, fmt } from "../../pages/payments/accountsStore";

/* ───────────────────────── STYLES ───────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
.rpt-wrap { font-family:'Inter',sans-serif; color:#0f172a; }
.rpt-head h1 { font-family:'Sora'; font-size:30px; font-weight:800; margin:0 0 4px;
  background:linear-gradient(90deg,#0f172a,#334155); -webkit-background-clip:text; background-clip:text; color:transparent; }
.rpt-head p { color:#64748b; font-size:14px; margin:0 0 20px; }

.rpt-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:20px; }
@media(max-width:900px){ .rpt-stats{grid-template-columns:repeat(3,1fr);} }
@media(max-width:580px){ .rpt-stats{grid-template-columns:repeat(2,1fr);} }
.rpt-stat { background:#fff; border:1px solid #eef0f5; border-radius:16px; padding:16px 18px; box-shadow:0 4px 14px rgba(15,23,42,.04); }
.rpt-stat p { margin:0 0 5px; font-size:11px; text-transform:uppercase; letter-spacing:.8px; color:#94a3b8; }
.rpt-stat h4 { margin:0; font-family:'Sora'; font-size:22px; }
.rpt-stat h4.b{color:#2563eb}.rpt-stat h4.g{color:#16a34a}.rpt-stat h4.v{color:#7c3aed}
.rpt-stat h4.o{color:#ea580c}.rpt-stat h4.c{color:#0891b2}

/* filter panel */
.rpt-filters { background:#fff; border:1px solid #eef0f5; border-radius:18px; padding:18px 20px;
  margin-bottom:20px; box-shadow:0 6px 20px rgba(15,23,42,.05); }
.rpt-filters .row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
@media(max-width:900px){ .rpt-filters .row{grid-template-columns:repeat(2,1fr);} }
@media(max-width:540px){ .rpt-filters .row{grid-template-columns:1fr;} }
.rpt-fld label { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#94a3b8; margin-bottom:6px; }
.rpt-fld input, .rpt-fld select {
  width:100%; box-sizing:border-box; border:1px solid #e2e8f0; border-radius:11px; padding:10px 12px;
  font-size:13px; font-family:'Inter'; outline:none; background:#fff; transition:.2s; }
.rpt-fld input:focus, .rpt-fld select:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,.1); }
.rpt-search { position:relative; }
.rpt-search .si { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; }
.rpt-search input { padding-left:38px; }
.rpt-filter-foot { display:flex; justify-content:space-between; align-items:center; margin-top:14px; flex-wrap:wrap; gap:10px; }
.rpt-clear { border:none; background:#f1f5f9; color:#475569; font-weight:700; font-size:12.5px; padding:9px 16px; border-radius:11px; cursor:pointer; }
.rpt-clear:hover { background:#e2e8f0; }
.rpt-result-count { font-size:13px; color:#64748b; font-weight:600; }

/* table */
.rpt-card { background:#fff; border:1px solid #eef0f5; border-radius:20px; overflow:hidden; box-shadow:0 12px 40px rgba(15,23,42,.06); }
.rpt-twrap { overflow-x:auto; }
.rpt-table { width:100%; border-collapse:collapse; min-width:1280px; }
.rpt-table thead th { background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; font-family:'Sora';
  font-size:11.5px; font-weight:700; text-align:left; padding:14px 16px; white-space:nowrap; }
.rpt-table tbody td { padding:13px 16px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#334155; vertical-align:middle; }
.rpt-table tbody tr:last-child td { border-bottom:none; }
.rpt-table tbody tr:hover td { background:#faf5ff; }
.rpt-amount { font-family:'Sora'; font-weight:800; color:#16a34a; white-space:nowrap; }
.rpt-muted { font-size:11px; color:#94a3b8; }
.rpt-code { font-family:'Sora'; font-weight:700; color:#7c3aed; letter-spacing:.5px; white-space:nowrap; }
.rpt-vno { font-weight:700; color:#1e293b; }
.rpt-paymode { padding:3px 9px; border-radius:999px; font-size:10.5px; font-weight:700; }
.rpt-paymode.direct { background:#dbeafe; color:#1d4ed8; } .rpt-paymode.contra { background:#fef3c7; color:#b45309; }

/* clearance status badge */
.rpt-clr { padding:4px 10px; border-radius:999px; font-size:10.5px; font-weight:700; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; }
.rpt-clr.cleared { background:#dcfce7; color:#15803d; }
.rpt-clr.pending { background:#fef3c7; color:#b45309; }

/* accounted-on chip */
.rpt-accon { font-family:'Sora'; font-size:11px; font-weight:700; color:#0891b2; margin-top:4px; }

.rpt-viewbtn { border:none; cursor:pointer; font-weight:700; font-size:12px; padding:8px 14px; border-radius:10px;
  background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; box-shadow:0 6px 16px rgba(124,58,237,.25); transition:.2s; }
.rpt-viewbtn:hover { transform:translateY(-1px); }
.rpt-empty { text-align:center; padding:50px; color:#94a3b8; }

/* report modal */
.rmo { position:fixed; inset:0; z-index:100000; background:rgba(15,23,42,.6); backdrop-filter:blur(3px);
  display:flex; align-items:flex-start; justify-content:center; padding:16px; }
.rmb { background:#e5e7eb; border-radius:20px; width:min(880px,96vw); height:calc(100vh - 32px);
  overflow:hidden; display:flex; flex-direction:column; box-shadow:0 40px 100px rgba(0,0,0,.45); }
.rmh { padding:16px 22px; background:#0f172a; display:flex; justify-content:space-between; align-items:center; gap:10px; }
.rmh .t { font-family:'Sora'; font-weight:700; color:#fff; font-size:15px; }
.rmh button { border:none; border-radius:10px; padding:8px 14px; cursor:pointer; font-weight:700; font-size:12px; }
.rmh .pdf { background:#16a34a; color:#fff; } .rmh .cl { background:#ef4444; color:#fff; }
.rmh div { display:flex; gap:8px; }
.rmbody { flex:1; overflow-y:auto; padding:20px; }
.report-sheet { background:#fff; padding:34px 40px; border-radius:8px; max-width:760px; margin:0 auto;
  font-size:13px; line-height:1.6; color:#111; }
.report-sheet h2 { font-family:'Sora'; margin:0; text-align:center; }
.report-sheet .rs-sub { text-align:center; color:#555; font-size:12px; margin-bottom:4px; }
.report-sheet .rs-divider { border:none; border-top:2px solid #111; margin:14px 0 18px; }
.report-sheet table { width:100%; border-collapse:collapse; margin-bottom:18px; }
.report-sheet td { border:1px solid #d1d5db; padding:9px 12px; }
.report-sheet td.k { background:#f8fafc; font-weight:700; width:38%; }
.report-sheet .rs-sec { font-family:'Sora'; font-weight:700; font-size:14px; margin:18px 0 8px; color:#7c3aed; }
.report-sheet .rs-code { font-family:'Sora'; font-weight:800; font-size:22px; color:#7c3aed; letter-spacing:2px; text-align:center; padding:10px; background:#faf5ff; border-radius:8px; margin-bottom:16px; }
.report-sheet .rs-sign { display:flex; justify-content:space-between; margin-top:46px; }
.report-sheet .rs-sign div { border-top:1px solid #111; padding-top:6px; min-width:150px; text-align:center; }
.report-sheet .rs-clr-badge {
  display:inline-block; padding:5px 14px; border-radius:999px;
  font-weight:700; font-size:13px; margin-bottom:16px;
}
.report-sheet .rs-clr-badge.cleared { background:#dcfce7; color:#15803d; }
.report-sheet .rs-clr-badge.pending { background:#fef3c7; color:#b45309; }
`;

/* ───────────────────────── REPORT SHEET ───────────────────────── */
function ReportModal({ bill, onClose }) {
  const v = bill.voucher || {};
  const sheetRef = useRef(null);
  const isCleared = !!bill.accountedOn;

  const downloadPDF = () => {
    const lib =
      (typeof window !== "undefined" && window.html2pdf) ||
      (() => { try { return require("html2pdf.js"); } catch { return null; } })();
    if (!lib || !sheetRef.current) { window.print(); return; }
    lib()
      .set({
        margin: 10,
        filename: `Voucher-${v.voucherNo || bill.id}-Report.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(sheetRef.current)
      .save();
  };

  return (
    <div className="rmo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rmb">
        <div className="rmh">
          <div className="t">📄 Voucher Report · {v.voucherNo || bill.id}</div>
          <div>
            <button className="pdf" onClick={downloadPDF}>📄 Download PDF</button>
            <button className="cl" onClick={onClose}>✕ Close</button>
          </div>
        </div>
        <div className="rmbody">
          <div className="report-sheet" ref={sheetRef}>
            <h2>VOUCHER ENTRY REPORT</h2>
            <div className="rs-sub">{bill._projectTitle} ({bill._projectId})</div>
            <hr className="rs-divider" />

            {/* clearance status banner */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span className={`rs-clr-badge ${isCleared ? "cleared" : "pending"}`}>
                {isCleared ? `✅ Voucher Cleared — Accounted On: ${bill.accountedOn}` : "⏳ Voucher Pending Clearance"}
              </span>
            </div>

            <div className="rs-sec">9-Digit Account Code</div>
            <div className="rs-code">{v.nineDigit || "—"}</div>

            <div className="rs-sec">Voucher Details</div>
            <table>
              <tbody>
                {[
                  ["Voucher No.", v.voucherNo],
                  ["Voucher Date", v.voucherDate],
                  ["Pay Mode", v.payMode],
                  ["Cash Book Page No.", v.cashBookPage],
                  ["PFMS Voucher No.", v.pfmsVoucher],
                  ["PFMS Payment Advisor No.", v.pfmsAdvisor],
                  ["Entered On", v.enteredOn],
                  ["Account-On Date", bill.accountedOn || "Not yet accounted"],
                ].map(([k, val]) => (
                  <tr key={k}><td className="k">{k}</td><td>{val || "—"}</td></tr>
                ))}
              </tbody>
            </table>

            <div className="rs-sec">Project & Bill Details</div>
            <table>
              <tbody>
                {[
                  ["CSRC Proc No", bill.csrcProcNo],
                  ["MH No", bill.mhNo],
                  ["Department", bill.dept],
                  ["Campus", bill.campus],
                  ["Project Head", bill.projectHead],
                  ["Scheme", bill.scheme],
                  ["Beneficiary", bill.beneficiary],
                  ["Claim Amount", fmt(bill.amount)],
                  ["Claim Date", bill.date],
                ].map(([k, val]) => (
                  <tr key={k}><td className="k">{k}</td><td>{val || "—"}</td></tr>
                ))}
              </tbody>
            </table>

            <div className="rs-sign">
              <div>Accountant</div>
              <div>Superintendent</div>
              <div>Director</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── MAIN PAGE ───────────────────────── */
const EMPTY_FILTERS = {
  q: "", scheme: "", dept: "", payMode: "", code67: "",
  dateFrom: "", dateTo: "", clearanceStatus: "",
};

export default function Reports() {
  const bills = useAccountsBills();
  const vouchered = useMemo(() => bills.filter((b) => b.voucher), [bills]);

  const [f, setF] = useState(EMPTY_FILTERS);
  const [report, setReport] = useState(null);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const schemes = useMemo(() => [...new Set(vouchered.map((b) => b.scheme).filter(Boolean))], [vouchered]);
  const depts = useMemo(() => [...new Set(vouchered.map((b) => b.dept).filter(Boolean))], [vouchered]);

  const filtered = useMemo(() => {
    return vouchered.filter((b) => {
      const v = b.voucher;
      if (f.q.trim()) {
        const q = f.q.toLowerCase();
        const hay = [
          b.csrcProcNo, b.mhNo, b.dept, b.campus, b.projectHead, b.scheme,
          b.beneficiary, b._projectId, b._projectTitle, String(b.amount),
          v.voucherNo, v.nineDigit, v.pfmsVoucher, v.pfmsAdvisor, v.cashBookPage, v.voucherDate,
        ].map((x) => String(x || "").toLowerCase());
        if (!hay.some((x) => x.includes(q))) return false;
      }
      if (f.scheme && b.scheme !== f.scheme) return false;
      if (f.dept && b.dept !== f.dept) return false;
      if (f.payMode && v.payMode !== f.payMode) return false;
      if (f.code67 && v.digit67 !== f.code67) return false;
      if (f.dateFrom && v.voucherDate && v.voucherDate < f.dateFrom) return false;
      if (f.dateTo && v.voucherDate && v.voucherDate > f.dateTo) return false;

      // clearance status filter
      if (f.clearanceStatus === "cleared" && !b.accountedOn) return false;
      if (f.clearanceStatus === "pending" && b.accountedOn) return false;

      return true;
    });
  }, [vouchered, f]);

  const stats = useMemo(() => ({
    total: vouchered.length,
    shown: filtered.length,
    amount: filtered.reduce((a, b) => a + (b.amount || 0), 0),
    direct: filtered.filter((b) => b.voucher.payMode === "Direct").length,
    cleared: vouchered.filter((b) => b.accountedOn).length,
  }), [vouchered, filtered]);

  const active = JSON.stringify(f) !== JSON.stringify(EMPTY_FILTERS);

  const LEDGER_OPTS = [
    { v: "11", l: "11 – Manpower" }, { v: "12", l: "12 – Consumables" },
    { v: "13", l: "13 – Travel" }, { v: "14", l: "14 – Contingency" },
    { v: "15", l: "15 – Non-Recurring" },
  ];

  return (
    <Layout title="Reports" subtitle="Accounts · Voucher Reports">
      <style>{css}</style>
      <div className="rpt-wrap">
        <div className="rpt-head">
          <h1>VOUCHER REPORTS</h1>
          <p>All recorded voucher entries — search, filter and generate reports</p>
        </div>

        {/* Stats — now 5 chips */}
        <div className="rpt-stats">
          <div className="rpt-stat"><p>Total Vouchers</p><h4 className="b">{stats.total}</h4></div>
          <div className="rpt-stat"><p>Matching Filter</p><h4 className="v">{stats.shown}</h4></div>
          <div className="rpt-stat"><p>Direct Payments</p><h4 className="o">{stats.direct}</h4></div>
          <div className="rpt-stat"><p>Voucher Cleared</p><h4 className="g">{stats.cleared}</h4></div>
          <div className="rpt-stat"><p>Filtered Amount</p><h4 className="c">{fmt(stats.amount)}</h4></div>
        </div>

        {/* FILTER PANEL */}
        <div className="rpt-filters">
          <div className="row">
            <div className="rpt-fld rpt-search" style={{ gridColumn: "1 / -1" }}>
              <label>Search (voucher / project data)</label>
              <span className="si">
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                placeholder="Voucher No, 9-digit code, PFMS, Proc No, beneficiary, amount..."
                value={f.q}
                onChange={(e) => set("q", e.target.value)}
              />
            </div>
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <div className="rpt-fld">
              <label>Scheme</label>
              <select value={f.scheme} onChange={(e) => set("scheme", e.target.value)}>
                <option value="">All Schemes</option>
                {schemes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="rpt-fld">
              <label>Department</label>
              <select value={f.dept} onChange={(e) => set("dept", e.target.value)}>
                <option value="">All Depts</option>
                {depts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="rpt-fld">
              <label>Pay Mode</label>
              <select value={f.payMode} onChange={(e) => set("payMode", e.target.value)}>
                <option value="">All</option>
                <option>Direct</option>
                <option>Contra</option>
              </select>
            </div>
            <div className="rpt-fld">
              <label>Ledger Group (6&7)</label>
              <select value={f.code67} onChange={(e) => set("code67", e.target.value)}>
                <option value="">All Ledgers</option>
                {LEDGER_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <div className="rpt-fld">
              <label>Voucher Date From</label>
              <input type="date" value={f.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} />
            </div>
            <div className="rpt-fld">
              <label>Voucher Date To</label>
              <input type="date" value={f.dateTo} onChange={(e) => set("dateTo", e.target.value)} />
            </div>
            {/* ── NEW: clearance status filter ── */}
            <div className="rpt-fld">
              <label>Clearance Status</label>
              <select value={f.clearanceStatus} onChange={(e) => set("clearanceStatus", e.target.value)}>
                <option value="">All Statuses</option>
                <option value="cleared">✅ Voucher Cleared</option>
                <option value="pending">⏳ Pending Clearance</option>
              </select>
            </div>
          </div>

          <div className="rpt-filter-foot">
            <span className="rpt-result-count">
              Showing {filtered.length} of {vouchered.length} vouchers
            </span>
            {active && (
              <button className="rpt-clear" onClick={() => setF(EMPTY_FILTERS)}>
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="rpt-card">
          <div className="rpt-twrap">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Voucher No</th>
                  <th>9-Digit Code</th>
                  <th>Voucher Date</th>
                  <th>CSRC Proc No</th>
                  <th>Dept</th>
                  <th>Beneficiary</th>
                  <th>Amount</th>
                  <th>Scheme</th>
                  <th>Pay Mode</th>
                  <th>PFMS Vou</th>
                  <th>Clearance</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13}>
                      <div className="rpt-empty">📭 No vouchers match your filters.</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((b, i) => {
                    const v = b.voucher;
                    const isCleared = !!b.accountedOn;
                    return (
                      <tr key={b.id}>
                        <td style={{ color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                        <td className="rpt-vno">{v.voucherNo}</td>
                        <td className="rpt-code">{v.nineDigit}</td>
                        <td>{v.voucherDate}</td>
                        <td>
                          <div style={{ maxWidth: 180, whiteSpace: "normal" }}>{b.csrcProcNo}</div>
                          <div className="rpt-muted">{b._projectId}</div>
                        </td>
                        <td>{b.dept}</td>
                        <td>{b.beneficiary}</td>
                        <td className="rpt-amount">{fmt(b.amount)}</td>
                        <td>{b.scheme}</td>
                        <td>
                          <span className={`rpt-paymode ${v.payMode === "Direct" ? "direct" : "contra"}`}>
                            {v.payMode}
                          </span>
                        </td>
                        <td>{v.pfmsVoucher}</td>

                        {/* ── clearance status column ── */}
                        <td>
                          <span className={`rpt-clr ${isCleared ? "cleared" : "pending"}`}>
                            {isCleared ? "✅ Cleared" : "⏳ Pending"}
                          </span>
                          {isCleared && (
                            <div className="rpt-accon">📅 {b.accountedOn}</div>
                          )}
                        </td>

                        <td>
                          <button className="rpt-viewbtn" onClick={() => setReport(b)}>
                            📄 Report
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {report && <ReportModal bill={report} onClose={() => setReport(null)} />}
      </div>
    </Layout>
  );
}