import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAccountsBills, fmt } from "./accountsStore";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.cmp-wrap { font-family:'Inter',sans-serif; color:#0f172a; }
.cmp-head h1 { font-family:'Sora'; font-size:30px; font-weight:800; margin:0 0 4px;
  background:linear-gradient(90deg,#0f172a,#334155); -webkit-background-clip:text; background-clip:text; color:transparent; }
.cmp-head p { color:#64748b; font-size:14px; margin:0 0 20px; }

.cmp-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:14px; }
.cmp-back { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#16a34a; font-weight:700;
  cursor:pointer; background:none; border:none; padding:0 0 10px 0; }

.cmp-banner { background:linear-gradient(135deg,#8a6d1f,#6b5417); color:#fff; border-radius:14px;
  padding:14px 22px; font-family:'Sora'; font-weight:700; font-size:16px; margin-bottom:22px;
  box-shadow:0 10px 26px rgba(106,84,23,.25); }

.cmp-filters { background:#fff; border:1px solid #eef0f5; border-radius:18px; padding:20px 22px;
  margin-bottom:20px; box-shadow:0 6px 20px rgba(15,23,42,.05); display:flex; gap:18px; flex-wrap:wrap; align-items:flex-end; }
.cmp-fld { display:flex; flex-direction:column; gap:6px; min-width:220px; }
.cmp-fld label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#94a3b8; }
.cmp-fld select {
  width:100%; box-sizing:border-box; border:1px solid #e2e8f0; border-radius:11px; padding:11px 13px;
  font-size:14px; font-family:'Inter'; font-weight:600; color:#7c2d12; outline:none; background:#fff; transition:.2s; cursor:pointer; }
.cmp-fld select:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,.12); }

.cmp-dlbtn { padding:11px 20px; border-radius:11px; background:linear-gradient(135deg,#16a34a,#22c55e);
  color:#fff; font-weight:700; font-size:14px; border:none; cursor:pointer; display:flex; align-items:center; gap:6px;
  box-shadow:0 8px 20px rgba(34,197,94,.25); }

.cmp-card { background:#fff; border:1px solid #eef0f5; border-radius:20px; overflow:hidden; box-shadow:0 12px 40px rgba(15,23,42,.06); }
.cmp-twrap { overflow-x:auto; }
.cmp-table { width:100%; border-collapse:collapse; min-width:1100px; }
.cmp-table thead th { background:#f5f015; color:#7c2d12; font-family:'Sora'; font-size:11.5px; font-weight:700;
  text-align:left; padding:13px 14px; white-space:nowrap; border-bottom:2px solid #e9e215; }
.cmp-table thead th.c { text-align:center; }
.cmp-table thead th.r { text-align:right; }
.cmp-table tbody td { padding:12px 14px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#334155; vertical-align:middle; }
.cmp-table tbody tr:nth-child(even) td { background:#e8e4c9; }
.cmp-table tbody tr:hover td { background:#f7fef9; }
.cmp-sl { text-align:center; color:#94a3b8; font-weight:700; }
.cmp-vno { text-align:center; font-weight:700; color:#1e293b; }
.cmp-vdate { text-align:center; white-space:nowrap; }
.cmp-payee { font-weight:600; color:#0f172a; }
.cmp-amount { text-align:right; font-family:'Courier New',monospace; font-weight:700; color:#374151; white-space:nowrap; }
.cmp-progtotal { text-align:right; font-family:'Courier New',monospace; font-weight:800; color:#16a34a; white-space:nowrap; }
.cmp-empty { text-align:center; padding:50px; color:#94a3b8; }
.cmp-grandrow td { background:#dcfce7 !important; font-weight:800; color:#15803d; }
`;

// Same FY-month logic as PaymentAbstract.jsx, derived from voucher date (YYYY-MM-DD)
function getFinancialYear(voucherDate) {
  if (!voucherDate) return "";
  const [yearStr, monthStr] = voucherDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return "";
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function currentFinancialYear() {
  const now = new Date();
  return getFinancialYear(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  );
}

function formatDate(voucherDate) {
  if (!voucherDate) return "—";
  const [y, m, d] = voucherDate.split("-");
  if (!y || !m || !d) return voucherDate;
  return `${d}-${m}-${y}`;
}

export default function Compilation() {
  const navigate = useNavigate();
  const bills = useAccountsBills();

  const vouchered = useMemo(
    () => bills.filter((b) => b.voucher && b.voucher.voucherDate),
    [bills]
  );

  const yearOptions = useMemo(() => {
    const years = new Set();
    vouchered.forEach((b) => {
      const fy = getFinancialYear(b.voucher.voucherDate);
      if (fy) years.add(fy);
    });
    const cfy = currentFinancialYear();
    if (cfy) years.add(cfy);
    return Array.from(years).sort().reverse();
  }, [vouchered]);

  const [selectedYear, setSelectedYear] = useState("");
  const effectiveYear = selectedYear || yearOptions[0] || "";

  const headOptions = useMemo(() => {
    const inYear = vouchered.filter(
      (b) => getFinancialYear(b.voucher.voucherDate) === effectiveYear
    );
    return Array.from(new Set(inYear.map((b) => b.head).filter(Boolean))).sort();
  }, [vouchered, effectiveYear]);

  const [selectedHead, setSelectedHead] = useState("");
  const effectiveHead = selectedHead || headOptions[0] || "";

  // Filtered + chronologically sorted (oldest first, so "Prog. Total" accumulates correctly)
  const rows = useMemo(() => {
    return vouchered
      .filter((b) => getFinancialYear(b.voucher.voucherDate) === effectiveYear)
      .filter((b) => !effectiveHead || b.head === effectiveHead)
      .sort((a, b) =>
        a.voucher.voucherDate.localeCompare(b.voucher.voucherDate)
      );
  }, [vouchered, effectiveYear, effectiveHead]);

  let runningTotal = 0;
  const rowsWithProgTotal = rows.map((b) => {
    runningTotal += Number(b.amount || 0);
    return { ...b, _progTotal: runningTotal };
  });

  const grandTotal = runningTotal;

  const handleDownload = () => {
    const tableEl = document.getElementById("compilation-table");
    if (!tableEl) return;

    const opt = {
      margin: 0.5,
      filename: `Compilation_${effectiveHead || "All"}_${effectiveYear || "all"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a3", orientation: "landscape" },
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(tableEl).save();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => {
      window.html2pdf().set(opt).from(tableEl).save();
    };
    document.head.appendChild(script);
  };

  return (
    <Layout title="Compilation" subtitle="Accounts / Payments / Compilation">
      <style>{css}</style>
      <div className="cmp-wrap">
        <div className="cmp-topbar">
          <button className="cmp-back" onClick={() => navigate("/accounts/payments")}>
            ← Back
          </button>
        </div>

        <div className="cmp-banner">
          Project — Payment — Compilation — {effectiveYear || "—"}
        </div>

        <div className="cmp-filters">
          <div className="cmp-fld">
            <label>Financial Year</label>
            <select
              value={effectiveYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedHead("");
              }}
            >
              {yearOptions.length === 0 && <option value="">No data</option>}
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="cmp-fld">
            <label>Select the Head of Account</label>
            <select
              value={effectiveHead}
              onChange={(e) => setSelectedHead(e.target.value)}
            >
              {headOptions.length === 0 && <option value="">No heads available</option>}
              {headOptions.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <button className="cmp-dlbtn" onClick={handleDownload}>
            ⬇ Download PDF
          </button>
        </div>

        <div className="cmp-card">
          <div className="cmp-twrap">
            <table className="cmp-table" id="compilation-table">
              <thead>
                <tr>
                  <th className="c">Sl. No</th>
                  <th className="c">Voucher No.</th>
                  <th className="c">Voucher Date</th>
                  <th>Name of Payee</th>
                  <th>Subhead</th>
                  <th>Payment ID</th>
                  <th className="r">Amount</th>
                  <th className="r">Prog. Total</th>
                </tr>
              </thead>

              <tbody>
                {rowsWithProgTotal.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="cmp-empty">📭 No vouchered payments found for this selection.</div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {rowsWithProgTotal.map((b, i) => (
                      <tr key={b.id}>
                        <td className="cmp-sl">{i + 1}</td>
                        <td className="cmp-vno">{b.voucher.voucherNo}</td>
                        <td className="cmp-vdate">{formatDate(b.voucher.voucherDate)}</td>
                        <td className="cmp-payee">{b.beneficiary}</td>
                        <td>{b.subhead || b.head}</td>
                        <td>{b.paymentId || b.scheme}</td>
                        <td className="cmp-amount">{fmt(b.amount).replace("₹ ", "")}</td>
                        <td className="cmp-progtotal">{fmt(b._progTotal).replace("₹ ", "")}</td>
                      </tr>
                    ))}

                    <tr className="cmp-grandrow">
                      <td colSpan={6} style={{ textAlign: "right" }}>Grand Total</td>
                      <td className="cmp-amount" style={{ color: "#15803d" }}>
                        {fmt(grandTotal).replace("₹ ", "")}
                      </td>
                      <td className="cmp-progtotal">{fmt(grandTotal).replace("₹ ", "")}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}