import React, { useState, useMemo, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  accountsStore,
  useAccountsBills,
  fmt,
  today,
  CODE_OPTIONS,
  buildNineDigit,
} from "../../pages/payments/accountsStore";

import { useNavigate } from "react-router-dom";

/* ───────────────────────── STYLES ───────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
.pac-wrap { font-family:'Inter',sans-serif; color:#0f172a; }
.pac-head h1 { font-family:'Sora'; font-size:30px; font-weight:800; margin:0 0 4px;
  background:linear-gradient(90deg,#0f172a,#334155); -webkit-background-clip:text; background-clip:text; color:transparent; }
.pac-head p { color:#64748b; font-size:14px; margin:0 0 20px; }

.pac-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
@media(max-width:800px){ .pac-stats{grid-template-columns:repeat(2,1fr);} }
.pac-stat { background:#fff; border:1px solid #eef0f5; border-radius:16px; padding:16px 18px; box-shadow:0 4px 14px rgba(15,23,42,.04); }
.pac-stat p { margin:0 0 5px; font-size:11px; text-transform:uppercase; letter-spacing:.8px; color:#94a3b8; }
.pac-stat h4 { margin:0; font-family:'Sora'; font-size:24px; }
.pac-stat h4.b{color:#2563eb}.pac-stat h4.g{color:#16a34a}.pac-stat h4.v{color:#7c3aed}.pac-stat h4.o{color:#ea580c}

.pac-search { position:relative; margin-bottom:18px; }
.pac-search input { width:100%; box-sizing:border-box; border:1px solid #e2e8f0; border-radius:14px;
  padding:13px 14px 13px 44px; font-size:14px; outline:none; background:#fff; box-shadow:0 2px 10px rgba(15,23,42,.04); transition:.2s; }
.pac-search input:focus { border-color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,.1); }
.pac-search .si { position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#94a3b8; }

.pac-card { background:#fff; border:1px solid #eef0f5; border-radius:20px; overflow:hidden; box-shadow:0 12px 40px rgba(15,23,42,.06); }
.pac-twrap { overflow-x:auto; }
.pac-table { width:100%; border-collapse:collapse; min-width:1100px; }
.pac-table thead th { background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; font-family:'Sora';
  font-size:11.5px; font-weight:700; text-align:left; padding:14px 16px; white-space:nowrap; }
.pac-table tbody td { padding:13px 16px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#334155; vertical-align:middle; }
.pac-table tbody tr:last-child td { border-bottom:none; }
.pac-table tbody tr:hover td { background:#f7fef9; }
.pac-amount { font-family:'Sora'; font-weight:800; color:#16a34a; white-space:nowrap; }
.pac-muted { font-size:11px; color:#94a3b8; }
.pac-procno { font-weight:600; color:#1e293b; max-width:200px; white-space:normal; }
.pac-vstatus { padding:4px 10px; border-radius:999px; font-size:10.5px; font-weight:700; white-space:nowrap; }
.pac-vstatus.pending { background:#fef3c7; color:#b45309; }
.pac-vstatus.done { background:#dcfce7; color:#15803d; }

.pac-actions { display:flex; flex-direction:column; gap:6px; min-width:140px; }
.pac-btn { border:none; cursor:pointer; font-weight:700; font-size:12px; padding:8px 12px; border-radius:10px;
  display:inline-flex; align-items:center; justify-content:center; gap:6px; transition:.2s; }
.pac-btn:hover { transform:translateY(-1px); }
.pac-btn.view { background:linear-gradient(135deg,#0ea5e9,#2563eb); color:#fff; box-shadow:0 6px 16px rgba(37,99,235,.25); }
.pac-btn.edit { background:#fff3ed; color:#ea580c; border:1px solid #fed7aa; }
.pac-btn.voucher { background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; box-shadow:0 6px 16px rgba(34,197,94,.28); }
.pac-btn.voucher.done { background:#f1f5f9; color:#64748b; box-shadow:none; }

.pac-empty { text-align:center; padding:50px; color:#94a3b8; }

/* ── modal shared ── */
.pm-overlay { position:fixed; inset:0; z-index:100000; background:rgba(15,23,42,.6); backdrop-filter:blur(3px);
  display:flex; align-items:flex-start; justify-content:center; padding:16px; }
.pm-box { background:#f8fafc; border-radius:20px; width:min(900px,96vw); max-height:calc(100vh - 32px);
  overflow:hidden; display:flex; flex-direction:column; box-shadow:0 40px 100px rgba(0,0,0,.45); }
.pm-head { padding:18px 24px; background:linear-gradient(135deg,#0f172a,#1e293b);
  display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; }
.pm-head .lbl { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:rgba(255,255,255,.55); margin-bottom:5px; }
.pm-head .ttl { font-family:'Sora'; font-size:16px; font-weight:700; color:#fff; }
.pm-head button { border:none; border-radius:10px; padding:8px 14px; cursor:pointer; font-weight:700; font-size:12px; background:#ef4444; color:#fff; }
.pm-body { flex:1; overflow-y:auto; padding:22px 26px; }
.pm-sec { font-family:'Sora'; font-size:14px; font-weight:700; color:#0f172a; margin:20px 0 12px; }
.pm-sec:first-child { margin-top:0; }
.pm-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
@media(max-width:640px){ .pm-grid{grid-template-columns:1fr;} }
.pm-field label { display:block; font-size:11.5px; font-weight:600; color:#475569; margin-bottom:6px; }
.pm-field .ro { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 13px; font-size:13px; color:#334155; }
.pm-field input, .pm-field select, .pm-field textarea {
  width:100%; box-sizing:border-box; border:1px solid #e2e8f0; border-radius:10px; padding:10px 13px;
  font-size:13px; font-family:'Inter'; outline:none; background:#fff; transition:.2s; }
.pm-field input:focus, .pm-field select:focus, .pm-field textarea:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
.pm-bill { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:13px; }
.pm-bill:last-child { border-bottom:none; }
.pm-bill .amt { font-family:'Sora'; font-weight:700; color:#16a34a; }
.pm-save { display:flex; gap:12px; margin-top:20px; }
.pm-save button { border:none; border-radius:11px; padding:11px 22px; font-weight:700; cursor:pointer; }
.pm-save .s { background:#16a34a; color:#fff; } .pm-save .c { background:#f1f5f9; color:#475569; }
`;

/* ───────────────────────── VIEW MODAL ───────────────────────── */
function ViewModal({ bill, onClose }) {
  const v = bill.voucher;
  return (
    <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-box">
        <div className="pm-head">
          <div>
            <div className="lbl">BILL · {bill._projectId} — {bill._projectTitle}</div>
            <div className="ttl">{bill.head} · {bill.type}</div>
          </div>
          <button onClick={onClose}>✕ Close</button>
        </div>
        <div className="pm-body">
          <div className="pm-sec">Bill Details</div>
          <div className="pm-grid">
            <div className="pm-field"><label>CSRC Proc No</label><div className="ro">{bill.csrcProcNo}</div></div>
            <div className="pm-field"><label>MH No</label><div className="ro">{bill.mhNo}</div></div>
            <div className="pm-field"><label>Department</label><div className="ro">{bill.dept}</div></div>
            <div className="pm-field"><label>Campus</label><div className="ro">{bill.campus}</div></div>
            <div className="pm-field"><label>Project Head</label><div className="ro">{bill.projectHead}</div></div>
            <div className="pm-field"><label>Scheme</label><div className="ro">{bill.scheme}</div></div>
            <div className="pm-field"><label>Beneficiary</label><div className="ro">{bill.beneficiary}</div></div>
            <div className="pm-field"><label>Amount</label><div className="ro" style={{ color: "#16a34a", fontWeight: 700 }}>{fmt(bill.amount)}</div></div>
          </div>

          <div className="pm-sec">Supporting Bills</div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 }}>
            {(bill.bills || []).map((b, i) => (
              <div className="pm-bill" key={i}>
                <span>{b.name} · <span className="pac-muted">{b.ref} · {b.date}</span></span>
                <span className="amt">{fmt(b.amount)}</span>
              </div>
            ))}
          </div>

          {v && (
            <>
              <div className="pm-sec">Voucher Entry</div>
              <div className="pm-grid">
                <div className="pm-field"><label>9-Digit Code</label><div className="ro">{v.nineDigit}</div></div>
                <div className="pm-field"><label>Voucher No</label><div className="ro">{v.voucherNo}</div></div>
                <div className="pm-field"><label>Voucher Date</label><div className="ro">{v.voucherDate}</div></div>
                <div className="pm-field"><label>Pay Mode</label><div className="ro">{v.payMode}</div></div>
                <div className="pm-field"><label>Cash Book Page</label><div className="ro">{v.cashBookPage}</div></div>
                <div className="pm-field"><label>PFMS Voucher No</label><div className="ro">{v.pfmsVoucher}</div></div>
                <div className="pm-field"><label>PFMS Payment Advisor</label><div className="ro">{v.pfmsAdvisor}</div></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* (Edit + Voucher modals come in Part 3) */

/* ───────────────────────── EDIT MODAL ───────────────────────── */
function EditModal({ bill, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...bill }));
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-box">
        <div className="pm-head">
          <div>
            <div className="lbl">EDIT BILL · {bill._projectId}</div>
            <div className="ttl">{bill.head} · {bill.type}</div>
          </div>
          <button onClick={onClose}>✕ Close</button>
        </div>
        <div className="pm-body">
          <div className="pm-sec">Editable Bill Details</div>
          <div className="pm-grid">
            <div className="pm-field" style={{ gridColumn: "1 / -1" }}>
              <label>CSRC Proc No</label>
              <input value={draft.csrcProcNo || ""} onChange={(e) => set("csrcProcNo", e.target.value)} />
            </div>
            <div className="pm-field"><label>MH No</label>
              <input value={draft.mhNo || ""} onChange={(e) => set("mhNo", e.target.value)} /></div>
            <div className="pm-field"><label>Department</label>
              <input value={draft.dept || ""} onChange={(e) => set("dept", e.target.value)} /></div>
            <div className="pm-field"><label>Campus</label>
              <input value={draft.campus || ""} onChange={(e) => set("campus", e.target.value)} /></div>
            <div className="pm-field"><label>Project Head</label>
              <input value={draft.projectHead || ""} onChange={(e) => set("projectHead", e.target.value)} /></div>
            <div className="pm-field"><label>Scheme</label>
              <input value={draft.scheme || ""} onChange={(e) => set("scheme", e.target.value)} /></div>
            <div className="pm-field"><label>Beneficiary</label>
              <input value={draft.beneficiary || ""} onChange={(e) => set("beneficiary", e.target.value)} /></div>
            <div className="pm-field"><label>Amount (₹)</label>
              <input type="number" value={draft.amount ?? ""} onChange={(e) => set("amount", e.target.value)} /></div>
            <div className="pm-field"><label>Claim Date</label>
              <input value={draft.date || ""} placeholder="DD-MM-YYYY" onChange={(e) => set("date", e.target.value)} /></div>
            <div className="pm-field"><label>Head</label>
              <input value={draft.head || ""} onChange={(e) => set("head", e.target.value)} /></div>
          </div>

          <div className="pm-save">
            <button className="s" onClick={() => onSave({ ...draft, amount: Number(draft.amount) })}>💾 Save Changes</button>
            <button className="c" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── VOUCHER ENTRY MODAL ───────────────────────── */
function VoucherModal({ bill, onSubmit, onClose }) {
  const ex = bill.voucher || {};
  const [v, setV] = useState({
    digit1: ex.digit1 || "1",
    digit23: ex.digit23 || "",
    digit45: ex.digit45 || "",
    digit67: ex.digit67 || "",
    digit89: ex.digit89 || "",
    voucherDate: ex.voucherDate || "",
    voucherNo: ex.voucherNo || "",
    payMode: ex.payMode || "Direct",
    cashBookPage: ex.cashBookPage || "",
    pfmsVoucher: ex.pfmsVoucher || "",
    pfmsAdvisor: ex.pfmsAdvisor || "",
  });
  const set = (k, val) => setV((p) => ({ ...p, [k]: val }));
  const nineDigit = buildNineDigit(v);

  const submit = () => {
    if (!v.voucherNo.trim()) return alert("Voucher No. is required.");
    if (!v.voucherDate) return alert("Voucher Date is required.");
    if (!v.cashBookPage.trim()) return alert("Cash Book Page No. is required.");
    if (!v.pfmsVoucher.trim()) return alert("PFMS Voucher No. is required.");
    if (!v.pfmsAdvisor.trim()) return alert("PFMS Payment Advisor No. is required.");
    onSubmit({ ...v, nineDigit, enteredOn: today() });
  };

  const Sel = ({ label, k, opts }) => (
    <div className="pm-field">
      <label>{label}</label>
      <select value={v[k]} onChange={(e) => set(k, e.target.value)}>
        <option value="">-- Select --</option>
        {opts.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-box">
        <div className="pm-head">
          <div>
            <div className="lbl">NEW VOUCHER ENTRY · {bill._projectId}</div>
            <div className="ttl">{bill.head} · {fmt(bill.amount)}</div>
          </div>
          <button onClick={onClose}>✕ Close</button>
        </div>
        <div className="pm-body">
          <div className="pm-sec">9-Digit Account Code</div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12,
            padding: "12px 16px", marginBottom: 14, fontFamily: "Sora", fontWeight: 800,
            fontSize: 20, color: "#1d4ed8", letterSpacing: 1 }}>
            {nineDigit}
          </div>
          <div className="pm-grid">
            <Sel label="Digit 1 (Transaction Type)" k="digit1" opts={CODE_OPTIONS.digit1} />
            <Sel label="Digit 2&3 (Primary Cost Centre)" k="digit23" opts={CODE_OPTIONS.digit23} />
            <Sel label="Digit 4&5 (Secondary Cost Centre)" k="digit45" opts={CODE_OPTIONS.digit45} />
            <Sel label="Digit 6&7 (Ledger Group)" k="digit67" opts={CODE_OPTIONS.digit67} />
            <Sel label="Digit 8&9 (General Ledger)" k="digit89" opts={CODE_OPTIONS.digit89} />
          </div>

          <div className="pm-sec">Voucher Details</div>
          <div className="pm-grid">
            <div className="pm-field"><label>Voucher Date *</label>
              <input type="date" value={v.voucherDate} onChange={(e) => set("voucherDate", e.target.value)} /></div>
            <div className="pm-field"><label>Voucher No. *</label>
              <input placeholder="Vou No." value={v.voucherNo} onChange={(e) => set("voucherNo", e.target.value)} /></div>
            <div className="pm-field"><label>Beneficiary</label>
              <div className="ro">{bill.beneficiary}</div></div>
            <div className="pm-field"><label>Claim Amount (₹)</label>
              <div className="ro" style={{ color: "#16a34a", fontWeight: 700 }}>{fmt(bill.amount)}</div></div>
            <div className="pm-field"><label>Pay Mode *</label>
              <select value={v.payMode} onChange={(e) => set("payMode", e.target.value)}>
                <option>Direct</option><option>Contra</option>
              </select></div>
            <div className="pm-field"><label>Cash Book Page No. *</label>
              <input placeholder="Page No." value={v.cashBookPage} onChange={(e) => set("cashBookPage", e.target.value)} /></div>
            <div className="pm-field"><label>PFMS Voucher No. *</label>
              <input placeholder="BP-" value={v.pfmsVoucher} onChange={(e) => set("pfmsVoucher", e.target.value)} /></div>
            <div className="pm-field"><label>PFMS Payment Advisor No. *</label>
              <input placeholder="C0" value={v.pfmsAdvisor} onChange={(e) => set("pfmsAdvisor", e.target.value)} /></div>
          </div>

          <div className="pm-save">
            <button className="s" onClick={submit}>✓ Submit & Send to Reports</button>
            <button className="c" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── MAIN PAGE ───────────────────────── */
export default function ProjectAc() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    if (role === "director") {
      navigate("/accounts/payments");
    }
  }, []);
  const bills = useAccountsBills();
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [voucherItem, setVoucherItem] = useState(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return bills;
    const q = search.toLowerCase();
    return bills.filter((b) =>
      [b.csrcProcNo, b.mhNo, b.dept, b.campus, b.projectHead, b.scheme,
       b.beneficiary, b._projectId, b._projectTitle, b.date, String(b.amount)]
        .some((x) => String(x || "").toLowerCase().includes(q))
    );
  }, [bills, search]);

  const stats = useMemo(() => ({
    total: bills.length,
    vouchered: bills.filter((b) => b.voucher).length,
    pending: bills.filter((b) => !b.voucher).length,
    amount: bills.reduce((a, b) => a + (b.amount || 0), 0),
  }), [bills]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleSaveEdit = (updated) => {
    accountsStore.updateBill(updated.id, updated);
    setEditItem(null);
    flash("Bill details updated.");
  };

  const handleVoucher = (voucher) => {
    accountsStore.setVoucher(voucherItem.id, voucher);
    flash(`Voucher ${voucher.voucherNo} recorded. View it in Reports →`);
    setVoucherItem(null);
  };

  return (
    <Layout title="Project A/c" subtitle="Accounts · Voucher Processing">
      <style>{css}</style>
      <div className="pac-wrap">
        <div className="pac-head">
          <h1>VOUCHER PROCESSING</h1>
          <p>Completed bills from office approval — record voucher entries</p>
        </div>

        <div className="pac-stats">
          <div className="pac-stat"><p>Completed Bills</p><h4 className="b">{stats.total}</h4></div>
          <div className="pac-stat"><p>Voucher Pending</p><h4 className="o">{stats.pending}</h4></div>
          <div className="pac-stat"><p>Vouchered</p><h4 className="g">{stats.vouchered}</h4></div>
          <div className="pac-stat"><p>Total Amount</p><h4 className="v">{fmt(stats.amount)}</h4></div>
        </div>

        <div className="pac-search">
          <span className="si">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input placeholder="Search by Proc No, MH No, dept, beneficiary, scheme, amount..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="pac-card">
          <div className="pac-twrap">
            <table className="pac-table">
              <thead>
                <tr>
                  <th>Sl.No</th><th>CSRC Proc No</th><th>MH No</th><th>Dept</th><th>Campus</th>
                  <th>Project Head</th><th>Beneficiary</th><th>Amount</th><th>Scheme</th>
                  <th>Voucher</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={11}><div className="pac-empty">📭 No completed bills found.</div></td></tr>
                ) : filtered.map((b, i) => (
                  <tr key={b.id}>
                    <td style={{ color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                    <td><div className="pac-procno">{b.csrcProcNo}</div>
                      <div className="pac-muted">{b._projectId} · {b.date}</div></td>
                    <td>{b.mhNo}</td>
                    <td>{b.dept}</td>
                    <td>{b.campus}</td>
                    <td>{b.projectHead}</td>
                    <td>{b.beneficiary}</td>
                    <td className="pac-amount">{fmt(b.amount)}</td>
                    <td>{b.scheme}</td>
                    <td><span className={`pac-vstatus ${b.voucher ? "done" : "pending"}`}>
                      {b.voucher ? "✓ Entered" : "⏳ Pending"}</span></td>
                    <td>
                      <div className="pac-actions">
                        <button className="pac-btn view" onClick={() => setViewItem(b)}>👁 View</button>
                        <button className="pac-btn edit" onClick={() => setEditItem(b)}>✏️ Edit</button>
                        <button className={`pac-btn voucher ${b.voucher ? "done" : ""}`}
                          onClick={() => setVoucherItem(b)}>
                          🧾 {b.voucher ? "Edit Voucher" : "Voucher Entry"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {viewItem && <ViewModal bill={viewItem} onClose={() => setViewItem(null)} />}
        {editItem && <EditModal bill={editItem} onSave={handleSaveEdit} onClose={() => setEditItem(null)} />}
        {voucherItem && <VoucherModal bill={voucherItem} onSubmit={handleVoucher} onClose={() => setVoucherItem(null)} />}

        {toast && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: "#0f172a", color: "#fff", padding: "13px 24px", borderRadius: 14,
            fontWeight: 600, fontSize: 14, zIndex: 200000, boxShadow: "0 10px 30px rgba(0,0,0,.3)" }}>
            ✓ {toast}
          </div>
        )}
      </div>
    </Layout>
  );
}