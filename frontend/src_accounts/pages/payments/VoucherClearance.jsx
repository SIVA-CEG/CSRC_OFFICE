import React, { useState, useMemo, useRef } from "react";
import Layout from "../../components/Layout";
import {
  accountsStore,
  useAccountsBills,
  fmt,
} from "../../pages/payments/accountsStore";
import { useNavigate } from "react-router-dom";

/* ───────────────────────── ACCOUNT CONFIG ───────────────────────── */
const ACCOUNT_OPTIONS = [
  { value: "all",     label: "All Accounts" },
  { value: "revenue", label: "Revenue A/c" },
  { value: "project", label: "Project A/c" },
  { value: "mopr",    label: "MOPR A/c" },
  { value: "ttdf",    label: "TTDF A/c" },
  { value: "tax",     label: "Tax A/c" },
];

/* Map a bill's scheme/type to an account bucket.
   Adjust this mapping to match your real data. */
const getAccountType = (bill) => {
  const scheme = String(bill.scheme || "").toLowerCase();
  const head   = String(bill.projectHead || "").toLowerCase();
  if (scheme.includes("mopr"))  return "mopr";
  if (scheme.includes("ttdf"))  return "ttdf";
  if (scheme.includes("tax") || head.includes("tax")) return "tax";
  if (scheme.includes("revenue") || bill._accountType === "revenue") return "revenue";
  return "project"; // default
};

/* Letter number helper — one per account per report batch */
const getLetterNo = (account, batchIndex) => {
  const prefixes = {
    revenue: "INTRA BANK TRANSFER/CSRC",
    project: "PROJECT/CSRC",
    mopr:    "MOPR/CSRC",
    ttdf:    "TTDF/CSRC",
    tax:     "TAX/CSRC",
    all:     "CSRC",
  };
  const yr = new Date().getFullYear();
  return `${batchIndex + 1}/${prefixes[account] || "CSRC"}/${yr}-${yr + 1}`;
};

/* Account-specific bank / account details shown in the report header */
const ACCOUNT_DETAILS = {
  revenue: {
    type: "REVENUE a/c",
    accountNo: "31687782892",
    subject: "CSRC - Transfer of Fund - INTRA BANK TRANSFER - Reg.",
    transferType: "INTRA BANK TRANSFER",
  },
  project: {
    type: "PROJECT a/c",
    accountNo: "31687782893",
    subject: "CSRC - Transfer of Fund - PROJECT ACCOUNT - Reg.",
    transferType: "BANK TRANSFER",
  },
  mopr: {
    type: "MOPR a/c",
    accountNo: "31687782894",
    subject: "CSRC - Transfer of Fund - MOPR ACCOUNT - Reg.",
    transferType: "BANK TRANSFER",
  },
  ttdf: {
    type: "TTDF a/c",
    accountNo: "31687782895",
    subject: "CSRC - Transfer of Fund - TTDF ACCOUNT - Reg.",
    transferType: "BANK TRANSFER",
  },
  tax: {
    type: "TAX a/c",
    accountNo: "31687782896",
    subject: "CSRC - Transfer of Fund - TAX ACCOUNT - Reg.",
    transferType: "BANK TRANSFER",
  },
  all: {
    type: "CSRC a/c",
    accountNo: "—",
    subject: "CSRC - Transfer of Fund - Reg.",
    transferType: "BANK TRANSFER",
  },
};

/* ───────────────────────── STYLES ───────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.vc-wrap { font-family:'Inter',sans-serif; color:#0f172a; }

/* header */
.vc-head h1 {
  font-family:'Sora'; font-size:30px; font-weight:800; margin:0 0 4px;
  background:linear-gradient(90deg,#0f172a,#334155);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.vc-head p { color:#64748b; font-size:14px; margin:0 0 20px; }

/* account filter bar */
.vc-acctbar {
  display:flex; align-items:center; gap:12px; margin-bottom:20px;
  background:#fff; border:1px solid #eef0f5; border-radius:16px;
  padding:14px 18px; box-shadow:0 4px 14px rgba(15,23,42,.04);
  flex-wrap:wrap;
}
.vc-acctbar label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#475569; white-space:nowrap; }
.vc-acctbar select {
  border:1.5px solid #e2e8f0; border-radius:10px; padding:9px 14px;
  font-size:13px; font-family:'Inter'; outline:none; background:#f8fafc;
  color:#0f172a; font-weight:600; transition:.2s; min-width:180px;
}
.vc-acctbar select:focus { border-color:#ea580c; box-shadow:0 0 0 3px rgba(234,88,12,.1); }
.vc-acct-badge {
  padding:5px 14px; border-radius:999px; font-size:11.5px; font-weight:700;
  background:linear-gradient(135deg,#ea580c,#fb923c); color:#fff; white-space:nowrap;
}

/* stats */
.vc-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
@media(max-width:800px){ .vc-stats{grid-template-columns:1fr 1fr;} }
.vc-stat {
  background:#fff; border:1px solid #eef0f5; border-radius:16px;
  padding:16px 18px; box-shadow:0 4px 14px rgba(15,23,42,.04);
}
.vc-stat p { margin:0 0 5px; font-size:11px; text-transform:uppercase; letter-spacing:.8px; color:#94a3b8; }
.vc-stat h4 { margin:0; font-family:'Sora'; font-size:24px; }
.vc-stat h4.o { color:#ea580c; }
.vc-stat h4.g { color:#16a34a; }
.vc-stat h4.v { color:#7c3aed; }
.vc-stat h4.b { color:#2563eb; }

/* section tab cards */
.vc-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
@media(max-width:700px){ .vc-tabs{grid-template-columns:1fr;} }
.vc-tab {
  background:#fff; border:2px solid #eef0f5; border-radius:18px;
  padding:18px 20px; cursor:pointer; transition:.2s;
  box-shadow:0 4px 14px rgba(15,23,42,.04);
  display:flex; flex-direction:column; gap:10px; position:relative; overflow:hidden;
}
.vc-tab:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(15,23,42,.09); }
.vc-tab.active { border-color:transparent; }
.vc-tab.active.s1 { background:linear-gradient(135deg,#fff7ed,#ffedd5); border-color:#fdba74; box-shadow:0 8px 28px rgba(234,88,12,.15); }
.vc-tab.active.s2 { background:linear-gradient(135deg,#eff6ff,#dbeafe); border-color:#93c5fd; box-shadow:0 8px 28px rgba(37,99,235,.15); }
.vc-tab.active.s3 { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-color:#86efac; box-shadow:0 8px 28px rgba(22,163,74,.15); }
.vc-tab-top { display:flex; align-items:center; gap:10px; }
.vc-tab-badge {
  width:32px; height:32px; border-radius:50%; display:flex; align-items:center;
  justify-content:center; font-family:'Sora'; font-weight:800; font-size:14px; flex-shrink:0;
}
.vc-tab-badge.s1 { background:#fff7ed; color:#ea580c; border:2px solid #fed7aa; }
.vc-tab-badge.s2 { background:#eff6ff; color:#2563eb; border:2px solid #bfdbfe; }
.vc-tab-badge.s3 { background:#f0fdf4; color:#16a34a; border:2px solid #bbf7d0; }
.vc-tab.active .vc-tab-badge.s1 { background:#ea580c; color:#fff; border-color:#ea580c; }
.vc-tab.active .vc-tab-badge.s2 { background:#2563eb; color:#fff; border-color:#2563eb; }
.vc-tab.active .vc-tab-badge.s3 { background:#16a34a; color:#fff; border-color:#16a34a; }
.vc-tab-title { font-family:'Sora'; font-size:14px; font-weight:700; color:#0f172a; }
.vc-tab-bottom { display:flex; align-items:baseline; gap:6px; }
.vc-tab-count { font-family:'Sora'; font-size:28px; font-weight:800; }
.vc-tab-count.s1 { color:#ea580c; }
.vc-tab-count.s2 { color:#2563eb; }
.vc-tab-count.s3 { color:#16a34a; }
.vc-tab-sub { font-size:12px; color:#94a3b8; font-weight:500; }
.vc-tab-arrow {
  position:absolute; right:16px; top:50%; transform:translateY(-50%);
  font-size:18px; opacity:.3; transition:.2s;
}
.vc-tab:hover .vc-tab-arrow { opacity:.7; }
.vc-tab.active .vc-tab-arrow { opacity:1; }

/* active section inner header */
.vc-section-inner-hdr {
  display:flex; align-items:center; gap:10px; margin-bottom:14px;
}
.vc-section-inner-hdr h3 { margin:0; font-family:'Sora'; font-size:16px; font-weight:700; color:#0f172a; }
.vc-section-inner-hdr .pill {
  padding:3px 12px; border-radius:999px; font-size:11px; font-weight:700;
}
.vc-section-inner-hdr .pill.s1 { background:#fff7ed; color:#c2410c; }
.vc-section-inner-hdr .pill.s2 { background:#eff6ff; color:#1d4ed8; }
.vc-section-inner-hdr .pill.s3 { background:#f0fdf4; color:#15803d; }

/* selection toolbar (section 1) */
.vc-sel-toolbar {
  background:#fff; border:1px solid #e2e8f0; border-radius:14px;
  padding:12px 16px; margin-bottom:12px;
  display:flex; align-items:center; gap:12px; flex-wrap:wrap;
}
.vc-sel-toolbar label { font-size:12px; font-weight:700; color:#475569; white-space:nowrap; }
.vc-sel-toolbar input[type="number"] {
  width:72px; border:1.5px solid #e2e8f0; border-radius:8px;
  padding:7px 10px; font-size:13px; font-family:'Inter'; outline:none;
  background:#f8fafc; color:#0f172a;
}
.vc-sel-toolbar input[type="number"]:focus { border-color:#ea580c; }
.vc-sel-toolbar .sep { color:#94a3b8; }
.vc-sel-cb { display:flex; align-items:center; gap:6px; cursor:pointer; }
.vc-sel-cb input[type="checkbox"] { width:16px; height:16px; accent-color:#ea580c; }
.vc-sel-cb span { font-size:13px; font-weight:600; color:#334155; }
.vc-sel-count { font-size:12px; font-weight:700; color:#7c3aed; margin-left:auto; }
.vc-gen-btn {
  border:none; cursor:pointer; font-weight:700; font-size:13px;
  padding:10px 20px; border-radius:11px;
  background:linear-gradient(135deg,#ea580c,#fb923c); color:#fff;
  box-shadow:0 6px 18px rgba(234,88,12,.3); transition:.2s;
  display:inline-flex; align-items:center; gap:6px;
}
.vc-gen-btn:hover { transform:translateY(-1px); }
.vc-gen-btn:disabled { opacity:.4; cursor:not-allowed; box-shadow:none; transform:none; }

/* section 3 filters */
.vc-clr-filters {
  background:#fff; border:1px solid #eef0f5; border-radius:14px;
  padding:14px 16px; margin-bottom:12px;
  display:flex; align-items:center; gap:12px; flex-wrap:wrap;
}
.vc-clr-filters label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#94a3b8; }
.vc-clr-filters input[type="date"],
.vc-clr-filters input[type="text"] {
  border:1.5px solid #e2e8f0; border-radius:8px;
  padding:7px 10px; font-size:12px; font-family:'Inter'; outline:none;
  background:#f8fafc; color:#0f172a;
}
.vc-clr-filters input:focus { border-color:#16a34a; }
.vc-clr-clear { border:none; background:#f1f5f9; color:#475569; font-weight:700; font-size:12px; padding:7px 13px; border-radius:8px; cursor:pointer; }

/* table card */
.vc-card {
  background:#fff; border:1px solid #eef0f5; border-radius:20px;
  overflow:hidden; box-shadow:0 12px 40px rgba(15,23,42,.06); margin-bottom:8px;
}
.vc-twrap { overflow-x:auto; }
.vc-table { width:100%; border-collapse:collapse; min-width:900px; }
.vc-table thead th {
  color:#fff; font-family:'Sora'; font-size:11.5px; font-weight:700;
  text-align:left; padding:13px 14px; white-space:nowrap;
}
.vc-table thead.s1 th { background:linear-gradient(135deg,#ea580c,#fb923c); }
.vc-table thead.s2 th { background:linear-gradient(135deg,#2563eb,#60a5fa); }
.vc-table thead.s3 th { background:linear-gradient(135deg,#16a34a,#22c55e); }
.vc-table tbody td {
  padding:12px 14px; border-bottom:1px solid #f1f5f9;
  font-size:13px; color:#334155; vertical-align:middle;
}
.vc-table tbody tr:last-child td { border-bottom:none; }
.vc-table tbody tr:hover td { background:#fafafa; }
.vc-table tbody tr.selected td { background:#fff7ed; }

.vc-chk { accent-color:#ea580c; width:15px; height:15px; cursor:pointer; }
.vc-amount { font-family:'Sora'; font-weight:800; color:#16a34a; white-space:nowrap; }
.vc-muted { font-size:11px; color:#94a3b8; }
.vc-code { font-family:'Sora'; font-weight:700; color:#7c3aed; letter-spacing:.5px; white-space:nowrap; }
.vc-vno { font-weight:700; color:#1e293b; }
.vc-accon { font-family:'Sora'; font-size:11px; font-weight:700; color:#0891b2; }
.vc-empty { text-align:center; padding:40px; color:#94a3b8; font-size:13px; }

/* action group */
.vc-actions { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.vc-btn {
  border:none; cursor:pointer; font-weight:700; font-size:12px;
  padding:7px 12px; border-radius:9px; display:inline-flex;
  align-items:center; justify-content:center; gap:4px; transition:.2s; white-space:nowrap;
}
.vc-btn:hover { transform:translateY(-1px); }
.vc-btn.view { background:linear-gradient(135deg,#0ea5e9,#2563eb); color:#fff; box-shadow:0 4px 12px rgba(37,99,235,.25); }
.vc-btn.account { background:linear-gradient(135deg,#ea580c,#fb923c); color:#fff; box-shadow:0 4px 12px rgba(234,88,12,.28); }

/* ── View modal ── */
.vcm-overlay {
  position:fixed; inset:0; z-index:100000;
  background:rgba(15,23,42,.6); backdrop-filter:blur(3px);
  display:flex; align-items:flex-start; justify-content:center; padding:16px;
}
.vcm-box {
  background:#f8fafc; border-radius:20px; width:min(820px,96vw);
  max-height:calc(100vh - 32px); overflow:hidden;
  display:flex; flex-direction:column;
  box-shadow:0 40px 100px rgba(0,0,0,.45);
}
.vcm-head {
  padding:18px 24px; background:linear-gradient(135deg,#0f172a,#1e293b);
  display:flex; justify-content:space-between; align-items:flex-start;
  gap:12px; flex-wrap:wrap;
}
.vcm-head .lbl { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:rgba(255,255,255,.5); margin-bottom:4px; }
.vcm-head .ttl { font-family:'Sora'; font-size:16px; font-weight:700; color:#fff; }
.vcm-head button { border:none; border-radius:10px; padding:8px 14px; cursor:pointer; font-weight:700; font-size:12px; background:#ef4444; color:#fff; }
.vcm-body { flex:1; overflow-y:auto; padding:22px 26px; }
.vcm-sec { font-family:'Sora'; font-size:14px; font-weight:700; color:#0f172a; margin:20px 0 12px; }
.vcm-sec:first-child { margin-top:0; }
.vcm-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
@media(max-width:600px){ .vcm-grid{grid-template-columns:1fr;} }
.vcm-field label { display:block; font-size:11.5px; font-weight:600; color:#475569; margin-bottom:5px; }
.vcm-field .ro { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 13px; font-size:13px; color:#334155; }

/* ── Account-On modal ── */
.vca-box {
  background:#fff; border-radius:20px; width:min(440px,96vw);
  border:1px solid #e2e8f0; position:relative; overflow:hidden;
  box-shadow:0 32px 80px rgba(0,0,0,.2);
}
.vca-accent { position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#ea580c,#fb923c,transparent); }
.vca-inner { padding:24px; }
.vca-title { font-family:'Sora'; font-size:17px; font-weight:700; color:#0f172a; margin-bottom:4px; }
.vca-sub { font-size:13px; color:#64748b; margin-bottom:20px; line-height:1.5; }
.vca-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#475569; display:block; margin-bottom:7px; }
.vca-datepick { width:100%; box-sizing:border-box; border:2px solid #e2e8f0; border-radius:12px; padding:12px 14px; font-size:14px; font-family:'Inter'; outline:none; transition:.2s; background:#f8fafc; color:#0f172a; }
.vca-datepick:focus { border-color:#ea580c; box-shadow:0 0 0 4px rgba(234,88,12,.12); }
.vca-note { margin-top:16px; padding:11px 14px; border-radius:10px; background:#fff7ed; border:1px solid #fed7aa; font-size:12px; color:#9a3412; line-height:1.5; }
.vca-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
.vca-cancel { padding:10px 20px; border-radius:10px; border:1px solid #e2e8f0; background:transparent; color:#64748b; font-size:13px; font-weight:600; cursor:pointer; font-family:'Inter'; }
.vca-submit { padding:10px 22px; border-radius:10px; border:none; background:linear-gradient(135deg,#ea580c,#fb923c); color:#fff; font-size:13px; font-weight:700; cursor:pointer; font-family:'Inter'; box-shadow:0 4px 16px rgba(234,88,12,.35); transition:.2s; }
.vca-submit:disabled { opacity:.45; cursor:not-allowed; box-shadow:none; }
.vca-submit:not(:disabled):hover { transform:translateY(-1px); }

/* ── PDF Report modal ── */
.rmo { position:fixed; inset:0; z-index:100001; background:rgba(15,23,42,.65); backdrop-filter:blur(3px); display:flex; align-items:flex-start; justify-content:center; padding:16px; }
.rmb { background:#e5e7eb; border-radius:20px; width:min(900px,96vw); height:calc(100vh - 32px); overflow:hidden; display:flex; flex-direction:column; box-shadow:0 40px 100px rgba(0,0,0,.45); }
.rmh { padding:16px 22px; background:#0f172a; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; }
.rmh .t { font-family:'Sora'; font-weight:700; color:#fff; font-size:15px; }
.rmh .btns { display:flex; gap:8px; }
.rmh button { border:none; border-radius:10px; padding:8px 14px; cursor:pointer; font-weight:700; font-size:12px; }
.rmh .pdf-btn { background:#16a34a; color:#fff; }
.rmh .cl-btn  { background:#ef4444; color:#fff; }
.rmbody { flex:1; overflow-y:auto; padding:20px; }

/* Print-friendly report sheet */
.report-sheet {
  background:#fff; padding:36px 44px; border-radius:8px;
  max-width:760px; margin:0 auto; font-size:13px; line-height:1.7;
  color:#111; font-family:'Times New Roman', serif;
}
.rs-top-right { text-align:right; font-weight:700; font-size:14px; margin-bottom:8px; }
.rs-org { text-align:center; margin-bottom:2px; }
.rs-org h2 { font-size:16px; font-weight:700; margin:0; }
.rs-org h3 { font-size:14px; font-weight:700; margin:0; }
.rs-org .addr { font-size:12px; }
.rs-org .advice { font-weight:700; font-size:13px; margin-top:4px; text-decoration:underline; }
.rs-meta { display:flex; justify-content:space-between; margin:14px 0 18px; font-size:12.5px; }
.rs-meta .letter-no { font-weight:700; }
.rs-meta .date-val  { font-weight:700; }
.rs-addr { margin-bottom:14px; font-size:13px; line-height:1.8; }
.rs-sub  { margin-bottom:14px; font-size:13px; }
.rs-sub strong { font-weight:700; }
.rs-body-para { margin-bottom:14px; font-size:13px; line-height:1.7; }
.rs-table { width:100%; border-collapse:collapse; margin:14px 0; font-size:12.5px; }
.rs-table th { border:1px solid #333; padding:7px 10px; background:#f5f5f5; font-weight:700; text-align:center; }
.rs-table td { border:1px solid #333; padding:7px 10px; }
.rs-table td.center { text-align:center; }
.rs-table td.right  { text-align:right; }
.rs-total td { font-weight:700; background:#f8f8f8; }
.rs-words td { text-align:center; font-style:italic; font-size:12px; background:#f8f8f8; }
.rs-note { margin:14px 0; font-size:13px; line-height:1.7; }
.rs-sign-area { display:flex; justify-content:flex-end; margin-top:50px; }
.rs-sign-area div { border-top:1px solid #111; padding-top:6px; min-width:160px; text-align:center; font-size:13px; }

/* ── toast ── */
.vc-toast {
  position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
  background:#0f172a; color:#fff; padding:13px 24px; border-radius:14px;
  font-weight:600; font-size:14px; z-index:200000;
  box-shadow:0 10px 30px rgba(0,0,0,.3); animation:slideUp .25s ease;
}
@keyframes slideUp { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }
`;

/* ───────── number to words (Indian system, up to crores) ───────── */
function numToWords(n) {
  const a = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen",
  ];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n === 0) return "zero";
  const helper = (num) => {
    if (num === 0) return "";
    if (num < 20) return a[num] + " ";
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "") + " ";
    return a[Math.floor(num / 100)] + " hundred " + helper(num % 100);
  };
  let result = "";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh  = Math.floor(n / 100000);   n %= 100000;
  const thou  = Math.floor(n / 1000);     n %= 1000;
  if (crore) result += helper(crore) + "crore ";
  if (lakh)  result += helper(lakh)  + "lakh ";
  if (thou)  result += helper(thou)  + "thousand ";
  result += helper(n);
  const words = result.trim().replace(/\s+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function amountWords(amount) {
  const paisa = Math.round((amount % 1) * 100);
  const rupees = Math.floor(amount);
  let str = "Rupees " + numToWords(rupees);
  if (paisa) str += " and " + numToWords(paisa) + " paise";
  return str + " only";
}

/* ───────────────────────── VIEW MODAL ───────────────────────── */
function ViewModal({ bill, onClose }) {
  const v = bill.voucher;
  return (
    <div className="vcm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vcm-box">
        <div className="vcm-head">
          <div>
            <div className="lbl">VOUCHER · {bill._projectId} — {bill._projectTitle}</div>
            <div className="ttl">{bill.head} · {bill.type}</div>
          </div>
          <button onClick={onClose}>✕ Close</button>
        </div>
        <div className="vcm-body">
          <div className="vcm-sec">Bill Details</div>
          <div className="vcm-grid">
            {[
              ["CSRC Proc No", bill.csrcProcNo],
              ["MH No", bill.mhNo],
              ["Department", bill.dept],
              ["Campus", bill.campus],
              ["Project Head", bill.projectHead],
              ["Scheme", bill.scheme],
              ["Beneficiary", bill.beneficiary],
              ["Amount", fmt(bill.amount)],
            ].map(([lbl, val]) => (
              <div className="vcm-field" key={lbl}>
                <label>{lbl}</label>
                <div className="ro" style={lbl === "Amount" ? { color: "#16a34a", fontWeight: 700 } : {}}>{val || "—"}</div>
              </div>
            ))}
          </div>

          {v && (
            <>
              <div className="vcm-sec">Voucher Entry</div>
              <div className="vcm-grid">
                {[
                  ["9-Digit Code", v.nineDigit],
                  ["Voucher No", v.voucherNo],
                  ["Voucher Date", v.voucherDate],
                  ["Pay Mode", v.payMode],
                  ["Cash Book Page", v.cashBookPage],
                  ["PFMS Voucher No", v.pfmsVoucher],
                  ["PFMS Payment Advisor", v.pfmsAdvisor],
                  ["Entered On", v.enteredOn],
                ].map(([lbl, val]) => (
                  <div className="vcm-field" key={lbl}>
                    <label>{lbl}</label>
                    <div className="ro" style={lbl === "9-Digit Code" ? { color: "#7c3aed", fontFamily: "Sora", fontWeight: 700 } : {}}>{val || "—"}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {bill.accountedOn && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>✅ Accounted On: {bill.accountedOn}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── ACCOUNT-ON MODAL ───────────────────────── */
function AccountOnModal({ bill, onSubmit, onClose }) {
  const [date, setDate] = useState("");
  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <div className="vcm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vca-box">
        <div className="vca-accent" />
        <div className="vca-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div className="vca-title">Set Account-On Date</div>
              <div className="vca-sub">
                Mark voucher <strong>{bill.voucher?.voucherNo}</strong> as accounted.
                <br />Beneficiary: {bill.beneficiary}
              </div>
            </div>
            <button onClick={onClose} style={{ border: "1px solid #e2e8f0", background: "transparent", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#64748b", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>Claim Amount</span>
            <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 18, color: "#16a34a" }}>{fmt(bill.amount)}</span>
          </div>

          <label className="vca-label">📅 Account-On Date *</label>
          <input type="date" className="vca-datepick" max={todayISO} value={date} onChange={(e) => setDate(e.target.value)} />

          <div className="vca-note">
            ⚠ Once submitted, this voucher will be removed from the clearance queue and marked as
            <strong> Voucher Cleared</strong> in Payment Reports.
          </div>

          <div className="vca-actions">
            <button className="vca-cancel" onClick={onClose}>Cancel</button>
            <button className="vca-submit" disabled={!date} onClick={() => onSubmit(bill.id, date)}>
              ✓ Submit Clearance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── PDF REPORT MODAL ───────────────────────── */
function PdfReportModal({ bills, account, letterIndex, onClose }) {
  const sheetRef = useRef(null);
  const acctInfo = ACCOUNT_DETAILS[account] || ACCOUNT_DETAILS.all;
  const letterNo = getLetterNo(account, letterIndex);
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
  const total  = bills.reduce((s, b) => s + (b.amount || 0), 0);

  const downloadPDF = () => {
    const lib = typeof window !== "undefined" && window.html2pdf;
    if (!lib || !sheetRef.current) { window.print(); return; }
    lib()
      .set({
        margin: 10,
        filename: `Advice-Transfer-Credit-${letterNo.replace(/\//g, "-")}.pdf`,
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
          <div className="t">📄 Advice for Transfer Credit — {acctInfo.type}</div>
          <div className="btns">
            <button className="pdf-btn" onClick={downloadPDF}>📄 Download PDF</button>
            <button className="cl-btn" onClick={onClose}>✕ Close</button>
          </div>
        </div>
        <div className="rmbody">
          <div className="report-sheet" ref={sheetRef}>
            {/* Top-right account type — driven by the account dropdown */}
            <div className="rs-top-right">
              {(ACCOUNT_OPTIONS.find((o) => o.value === account)?.label || "All Accounts").toUpperCase()}
            </div>

            {/* Organisation header */}
            <div className="rs-org">
              <h2>Centre for Sponsored Research and Consultancy (CSRC)</h2>
              <h3>(Formerly known as CTDT)</h3>
              <div className="addr">Anna University—Chennai - 600 025.</div>
              <div className="advice">ADVICE FOR TRANSFER CREDIT</div>
            </div>

            {/* Letter no + Date */}
            <div className="rs-meta">
              <div className="letter-no">Letter No.{letterNo}</div>
              <div className="date-val">{today}</div>
            </div>

            {/* Addressee */}
            <div className="rs-addr">
              To<br />
              The Branch Manager<br />
              State Bank of India<br />
              Anna University Branch<br />
              Chennai 600 025.
            </div>

            <div style={{ marginBottom: 14, fontSize: 13 }}>Sir/Madam,</div>

            {/* Subject */}
            <div className="rs-sub">
              <strong>Sub:</strong> {acctInfo.subject}
            </div>

            {/* Body paragraph */}
            <div className="rs-body-para">
              The following transfer of fund may be effected from the Director, CSRC{" "}
              {acctInfo.type}, Account No. {acctInfo.accountNo} through{" "}
              {acctInfo.transferType} as detailed below:
            </div>

            {/* Table */}
            <table className="rs-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Sl. No.</th>
                  <th>IFSC Code</th>
                  <th>Transaction Amount</th>
                  <th>Beneficiary Account</th>
                  <th>Beneficiary Name</th>
                  <th>Voucher Number</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b, i) => (
                  <tr key={b.id}>
                    <td className="center">{i + 1}</td>
                    <td className="center">SBIN0006463</td>
                    <td className="right">{Number(b.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="center">{b.voucher?.pfmsAdvisor || b.mhNo || "—"}</td>
                    <td>{b.beneficiary}</td>
                    <td className="center">{b.voucher?.voucherNo || "—"}</td>
                  </tr>
                ))}
                <tr className="rs-total">
                  <td colSpan={2} style={{ textAlign: "right" }}></td>
                  <td className="right">{Number(total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="rs-words">
                  <td colSpan={6}>({amountWords(total)})</td>
                </tr>
              </tbody>
            </table>

            {/* Note */}
            <div className="rs-note">
              As, the above transfer of funds relates to ANNA UNIVERSITY official purpose, it is
              requested, NOT TO LEVY ANY BANK CHARGES for the above transaction.
            </div>

            <div style={{ marginTop: 8, fontSize: 13 }}>Yours sincerely,</div>

            {/* Signature */}
            <div className="rs-sign-area">
              <div>DIRECTOR, CSRC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── MAIN PAGE ───────────────────────── */
export default function VoucherClearance() {
  const allBills = useAccountsBills();
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  React.useEffect(() => {
    if (role === "director") {
      navigate("/accounts/payments");
    }
  }, []);

  /* ── account filter ── */
  const [account, setAccount] = useState("all");

  /* ── active section tab ── */
  const [activeSection, setActiveSection] = useState("s1");

  /* ── modals ── */
  const [viewItem,    setViewItem]    = useState(null);
  const [accountItem, setAccountItem] = useState(null);
  const [pdfBills,    setPdfBills]    = useState(null); // array of bills for the report
  const [pdfLetterIdx, setPdfLetterIdx] = useState(0);
  const [toast, setToast] = useState("");

  /* ── section 1 selection ── */
  const [selected,  setSelected]  = useState(new Set()); // set of bill ids
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo,   setRangeTo]   = useState("");

  /* ── section 3 cleared filters ── */
  const [clrSearch,    setClrSearch]    = useState("");
  const [clrDateFrom,  setClrDateFrom]  = useState("");
  const [clrDateTo,    setClrDateTo]    = useState("");

  /* ── batch letter counter persisted in module scope (resets on reload) ── */
  const batchCountRef = useRef(0);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  /* Filter bills by account */
  const accountFiltered = useMemo(() => {
    if (account === "all") return allBills.filter((b) => b.voucher);
    return allBills.filter((b) => b.voucher && getAccountType(b) === account);
  }, [allBills, account]);

  /* Section 1: vouchered but NOT yet sent to clearance queue (no reportBatch) */
  const pendingBills = useMemo(
    () => accountFiltered.filter((b) => !b.reportBatch && !b.accountedOn),
    [accountFiltered]
  );

  /* Section 2: sent to clearance queue but NOT yet accounted */
  const queueBills = useMemo(
    () => accountFiltered.filter((b) => b.reportBatch && !b.accountedOn),
    [accountFiltered]
  );

  /* Section 3: accounted */
  const clearedBills = useMemo(() => {
    let list = accountFiltered.filter((b) => b.accountedOn);
    if (clrSearch.trim()) {
      const q = clrSearch.toLowerCase();
      list = list.filter((b) =>
        [b.voucher?.voucherNo, b.beneficiary, b.csrcProcNo, b._projectId, String(b.amount)]
          .some((x) => String(x || "").toLowerCase().includes(q))
      );
    }
    if (clrDateFrom) list = list.filter((b) => b.accountedOn >= clrDateFrom);
    if (clrDateTo)   list = list.filter((b) => b.accountedOn <= clrDateTo);
    return list;
  }, [accountFiltered, clrSearch, clrDateFrom, clrDateTo]);

  /* stats */
  const stats = useMemo(() => ({
    pending: pendingBills.length,
    queue:   queueBills.length,
    cleared: clearedBills.length,
    amount:  pendingBills.reduce((a, b) => a + (b.amount || 0), 0),
  }), [pendingBills, queueBills, clearedBills]);

  /* ── Selection helpers ── */
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = (checked) => {
    setSelected(checked ? new Set(pendingBills.map((b) => b.id)) : new Set());
  };

  const applyRange = () => {
    const from = parseInt(rangeFrom, 10);
    const to   = parseInt(rangeTo,   10);
    if (!from || !to || from > to) { flash("Enter a valid Sl.No range."); return; }
    const ids = pendingBills
      .filter((_, i) => i + 1 >= from && i + 1 <= to)
      .map((b) => b.id);
    setSelected(new Set(ids));
  };

  const allChecked = pendingBills.length > 0 && pendingBills.every((b) => selected.has(b.id));

  /* ── Generate Report: move selected → section 2 ── */
  const handleGenerateReport = () => {
    const sel = pendingBills.filter((b) => selected.has(b.id));
    if (!sel.length) return;

    // Preview the PDF first
    setPdfBills(sel);
    setPdfLetterIdx(batchCountRef.current);
  };

  /* Called when user closes PDF modal — commit the move */
  const handlePdfClose = () => {
    if (pdfBills) {
      const batch = `BATCH-${Date.now()}`;
      pdfBills.forEach((b) => accountsStore.updateBill(b.id, { reportBatch: batch }));
      batchCountRef.current += 1;
      setSelected(new Set());
    }
    setPdfBills(null);
  };

  /* ── Account On ── */
  const handleAccountOn = (id, dateStr) => {
    accountsStore.setAccountedOn(id, dateStr);
    setAccountItem(null);
    flash("Voucher marked as accounted and moved to Cleared.");
  };

  return (
    <Layout title="Voucher Clearance" subtitle="Payments / Voucher Clearance">
      <style>{css}</style>
      <div className="vc-wrap">

        {/* Header */}
        <div className="vc-head">
          <h1>VOUCHER CLEARANCE</h1>
          <p>Generate transfer-credit reports, assign Account-On dates, and track cleared vouchers</p>
        </div>

        {/* Account Filter Bar */}
        <div className="vc-acctbar">
          <label>Filter by Account:</label>
          <select value={account} onChange={(e) => { setAccount(e.target.value); setSelected(new Set()); }}>
            {ACCOUNT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="vc-acct-badge">
            {ACCOUNT_OPTIONS.find((o) => o.value === account)?.label}
          </div>
        </div>

        {/* ── Section Tab Cards ── */}
        <div className="vc-tabs">
          {[
            { key: "s1", sClass: "s1", num: "1", title: "Pending Vouchers",    count: stats.pending, sub: "vouchers to report", amount: fmt(stats.amount) },
            { key: "s2", sClass: "s2", num: "2", title: "Awaiting Account-On", count: stats.queue,   sub: "vouchers in queue",  amount: null },
            { key: "s3", sClass: "s3", num: "3", title: "Cleared Vouchers",    count: stats.cleared, sub: "vouchers cleared",   amount: null },
          ].map(({ key, sClass, num, title, count, sub, amount }) => (
            <div
              key={key}
              className={`vc-tab ${sClass} ${activeSection === key ? "active" : ""}`}
              onClick={() => setActiveSection(key)}
            >
              <div className="vc-tab-top">
                <div className={`vc-tab-badge ${sClass}`}>{num}</div>
                <div className="vc-tab-title">{title}</div>
              </div>
              <div className="vc-tab-bottom">
                <div className={`vc-tab-count ${sClass}`}>{count}</div>
                <div className="vc-tab-sub">{sub}{amount ? ` · ${amount}` : ""}</div>
              </div>
              <div className="vc-tab-arrow">{activeSection === key ? "▼" : "›"}</div>
            </div>
          ))}
        </div>

        {/* ════════════════ SECTION 1 — PENDING ════════════════ */}
        {activeSection === "s1" && (
          <>
            <div className="vc-section-inner-hdr">
              <h3>Pending Vouchers</h3>
              <span className="pill s1">{pendingBills.length} vouchers</span>
            </div>

            {pendingBills.length > 0 && (
              <div className="vc-sel-toolbar">
                <label className="vc-sel-cb">
                  <input type="checkbox" checked={allChecked} onChange={(e) => selectAll(e.target.checked)} />
                  <span>Select All</span>
                </label>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <label>Sl.No From</label>
                <input type="number" min={1} max={pendingBills.length} value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} placeholder="1" />
                <span className="sep">→</span>
                <label>To</label>
                <input type="number" min={1} max={pendingBills.length} value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} placeholder={pendingBills.length} />
                <button className="vc-btn view" style={{ padding: "7px 12px", fontSize: 12 }} onClick={applyRange}>Apply Range</button>
                <span className="vc-sel-count">{selected.size} selected</span>
                <button className="vc-gen-btn" disabled={selected.size === 0} onClick={handleGenerateReport}>📄 Generate Report</button>
              </div>
            )}

            <div className="vc-card">
              <div className="vc-twrap">
                <table className="vc-table">
                  <thead className="s1">
                    <tr>
                      <th style={{ width: 36 }}>☑</th>
                      <th>Sl.No</th><th>Voucher No</th><th>9-Digit Code</th><th>Voucher Date</th>
                      <th>CSRC Proc No</th><th>Dept</th><th>Beneficiary</th><th>Amount</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBills.length === 0 ? (
                      <tr><td colSpan={10}><div className="vc-empty">✅ No pending vouchers — all are queued or cleared.</div></td></tr>
                    ) : pendingBills.map((bill, i) => {
                      const v = bill.voucher;
                      const isSel = selected.has(bill.id);
                      return (
                        <tr key={bill.id} className={isSel ? "selected" : ""}>
                          <td><input type="checkbox" className="vc-chk" checked={isSel} onChange={() => toggleSelect(bill.id)} /></td>
                          <td style={{ color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                          <td className="vc-vno">{v.voucherNo}</td>
                          <td className="vc-code">{v.nineDigit}</td>
                          <td>{v.voucherDate}</td>
                          <td><div style={{ maxWidth: 180, whiteSpace: "normal" }}>{bill.csrcProcNo}</div><div className="vc-muted">{bill._projectId}</div></td>
                          <td>{bill.dept}</td>
                          <td>{bill.beneficiary}</td>
                          <td className="vc-amount">{fmt(bill.amount)}</td>
                          <td><div className="vc-actions"><button className="vc-btn view" onClick={() => setViewItem(bill)}>👁 View</button></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ════════════════ SECTION 2 — AWAITING ACCOUNT-ON ════════════════ */}
        {activeSection === "s2" && (
          <>
            <div className="vc-section-inner-hdr">
              <h3>Awaiting Account-On</h3>
              <span className="pill s2">{queueBills.length} vouchers</span>
            </div>

            <div className="vc-card">
              <div className="vc-twrap">
                <table className="vc-table">
                  <thead className="s2">
                    <tr>
                      <th>Sl.No</th><th>Voucher No</th><th>9-Digit Code</th><th>Voucher Date</th>
                      <th>CSRC Proc No</th><th>Dept</th><th>Beneficiary</th><th>Amount</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueBills.length === 0 ? (
                      <tr><td colSpan={9}><div className="vc-empty">📭 No vouchers awaiting Account-On. Generate a report from Section 1 first.</div></td></tr>
                    ) : queueBills.map((bill, i) => {
                      const v = bill.voucher;
                      return (
                        <tr key={bill.id}>
                          <td style={{ color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                          <td className="vc-vno">{v.voucherNo}</td>
                          <td className="vc-code">{v.nineDigit}</td>
                          <td>{v.voucherDate}</td>
                          <td><div style={{ maxWidth: 180, whiteSpace: "normal" }}>{bill.csrcProcNo}</div><div className="vc-muted">{bill._projectId}</div></td>
                          <td>{bill.dept}</td>
                          <td>{bill.beneficiary}</td>
                          <td className="vc-amount">{fmt(bill.amount)}</td>
                          <td>
                            <div className="vc-actions">
                              <button className="vc-btn view" onClick={() => setViewItem(bill)}>👁 View</button>
                              <button className="vc-btn account" onClick={() => setAccountItem(bill)}>📅 Account On</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ════════════════ SECTION 3 — CLEARED ════════════════ */}
        {activeSection === "s3" && (
          <>
            <div className="vc-section-inner-hdr">
              <h3>Cleared Vouchers</h3>
              <span className="pill s3">{clearedBills.length} vouchers</span>
            </div>

            <div className="vc-clr-filters">
              <label>Search</label>
              <input type="text" placeholder="Voucher No, beneficiary, proc no..." value={clrSearch} onChange={(e) => setClrSearch(e.target.value)} style={{ minWidth: 220 }} />
              <label style={{ marginLeft: 8 }}>Accounted From</label>
              <input type="date" value={clrDateFrom} onChange={(e) => setClrDateFrom(e.target.value)} />
              <label>To</label>
              <input type="date" value={clrDateTo} onChange={(e) => setClrDateTo(e.target.value)} />
              {(clrSearch || clrDateFrom || clrDateTo) && (
                <button className="vc-clr-clear" onClick={() => { setClrSearch(""); setClrDateFrom(""); setClrDateTo(""); }}>✕ Clear</button>
              )}
            </div>

            <div className="vc-card">
              <div className="vc-twrap">
                <table className="vc-table">
                  <thead className="s3">
                    <tr>
                      <th>Sl.No</th><th>Voucher No</th><th>9-Digit Code</th><th>Voucher Date</th>
                      <th>CSRC Proc No</th><th>Dept</th><th>Beneficiary</th><th>Amount</th><th>Accounted On</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clearedBills.length === 0 ? (
                      <tr><td colSpan={10}><div className="vc-empty">📭 No cleared vouchers match your filters.</div></td></tr>
                    ) : clearedBills.map((bill, i) => {
                      const v = bill.voucher;
                      return (
                        <tr key={bill.id}>
                          <td style={{ color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                          <td className="vc-vno">{v.voucherNo}</td>
                          <td className="vc-code">{v.nineDigit}</td>
                          <td>{v.voucherDate}</td>
                          <td><div style={{ maxWidth: 180, whiteSpace: "normal" }}>{bill.csrcProcNo}</div><div className="vc-muted">{bill._projectId}</div></td>
                          <td>{bill.dept}</td>
                          <td>{bill.beneficiary}</td>
                          <td className="vc-amount">{fmt(bill.amount)}</td>
                          <td><div className="vc-accon">📅 {bill.accountedOn}</div></td>
                          <td><div className="vc-actions"><button className="vc-btn view" onClick={() => setViewItem(bill)}>👁 View</button></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Modals */}
      {viewItem && <ViewModal bill={viewItem} onClose={() => setViewItem(null)} />}

      {accountItem && (
        <AccountOnModal
          bill={accountItem}
          onSubmit={handleAccountOn}
          onClose={() => setAccountItem(null)}
        />
      )}

      {pdfBills && (
        <PdfReportModal
          bills={pdfBills}
          account={account}
          letterIndex={pdfLetterIdx}
          onClose={handlePdfClose}
        />
      )}

      {toast && <div className="vc-toast">✓ {toast}</div>}
    </Layout>
  );
}