import { useState } from "react";
import "./EndorsementDetailModal.css";


const FUNDING_AGENCIES = [
  "AICTE","ANRF","ARG","CSIR","DBT","DRDO","DST","ICMR","ISRO","MeitY","MNRE","NABARD","SERB","UGC",
].sort();

const PROJECT_SCHEMES = [
  "Core Research Grant","CRG","DST SURE","SERB-SURE","CMRG","ANRF MISSION AI","MATRICS","SRG","TARE","RESPOND BASKET"
].sort();

const ENDORSEMENT_FORMATS = ["CSRC","DST","CMRG","ANRF","New Format"];
const CO_PI_ROLES = ["COPI","PI","MENT","NOMI","INDU","STUD","GUDE","SUB-CON","OI","PART","PC"];
const STATUS_OPTIONS = ["SUPDT","DEPUTY","DIRECTOR","Not-Verified","Return"];

function formatCurrency(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function EndorsementDetailModal({
  item,
  onClose,
  onUpdate,
  readOnly = false
}) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...item });
  const [statusDecision, setStatusDecision] = useState("Return");

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Derived financial
  const nrAmount = parseFloat(form.nonRecurring) || 0;
  const rAmount  = parseFloat(form.recurring) || 0;
  const base     = nrAmount + rAmount;
  const ovhAmt   = base * ((parseFloat(form.overheadPct) || 0) / 100);
  const sub      = base + ovhAmt;
  const gstAmt   = form.gst === "yes" ? sub * 0.18 : 0;
  const total    = sub + gstAmt;

  const handleSave = () => {
    onUpdate({ ...form, calculatedTotal: total });
  };

  return (
    <div className="edm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="edm-modal">
        {/* Header */}
        <div className="edm-modal-head">
          <div>
            <div className="edm-modal-id">Proposal #{item.id}</div>
            <h2 className="edm-modal-title">Project Proposal Details</h2>
          </div>
          <div className="edm-head-right">
            <span className="edm-status-badge">
  {item.status}
</span>
            {!readOnly && (
  <>
    {!editMode ? (
      <button
        className="edm-btn edm-btn--edit"
        onClick={() =>
          setEditMode(true)
        }
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Edit
      </button>
    ) : (
      <>
        <button
          className="edm-btn edm-btn--save"
          onClick={handleSave}
        >
          Save
        </button>

        <button
          className="edm-btn edm-btn--cancel"
          onClick={() => {
            setForm({ ...item });
            setEditMode(false);
          }}
        >
          Cancel
        </button>
      </>
    )}
  </>
)}
            <button className="edm-btn-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="edm-body">
          {/* ── Row 1: Funding + Types + GST ── */}

          {readOnly && (
  <div className="edm-readonly-banner">
    Viewing Endorsement Details
  </div>
)}

          <div className="edm-section">
            <div className="edm-grid-4">
              <div className="edm-field">
                <label className="edm-label">Funding Agency</label>
                {editMode ? (
                  <select className="edm-select" value={form.fundingAgency} onChange={e => setField("fundingAgency", e.target.value)}>
                    <option value="">-- Select --</option>
                    {FUNDING_AGENCIES.map(a => <option key={a}>{a}</option>)}
                  </select>
                ) : <div className="edm-val">{form.fundingAgency}</div>}
              </div>
              <div className="edm-field">
                <label className="edm-label">Project Scheme</label>
                {editMode ? (
                  <select className="edm-select" value={form.projectScheme} onChange={e => setField("projectScheme", e.target.value)}>
                    <option value="">-- Select --</option>
                    {PROJECT_SCHEMES.map(s => <option key={s}>{s}</option>)}
                  </select>
                ) : <div className="edm-val">{form.projectScheme}</div>}
              </div>

              <div className="edm-field">
                <label className="edm-label">Funding Agency Types</label>
                <div className="edm-radio-row">
                  {["Central Govt","State Govt","Private","Individual"].map(opt => (
                    <label key={opt} className="edm-radio-label">
                      <input type="radio" name="ftype" value={opt} checked={form.fundingType === opt}
                        onChange={() => editMode && setField("fundingType", opt)} disabled={!editMode}/>
                      <span className="edm-radio-dot" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="edm-field">
                <label className="edm-label">Project Types</label>
                <div className="edm-radio-row">
                  {["Academic","Collaborative","International"].map(opt => (
                    <label key={opt} className="edm-radio-label">
                      <input type="radio" name="ptype" value={opt} checked={form.projectType === opt}
                        onChange={() => editMode && setField("projectType", opt)} disabled={!editMode}/>
                      <span className="edm-radio-dot" />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="edm-field">
                <label className="edm-label">GST@18%</label>
                <div className="edm-radio-row">
                  {["yes","no"].map(opt => (
                    <label key={opt} className="edm-radio-label">
                      <input type="radio" name="gst" value={opt} checked={form.gst === opt}
                        onChange={() => editMode && setField("gst", opt)} disabled={!editMode}/>
                      <span className="edm-radio-dot" />
                      {opt === "yes" ? "Yes" : "No"}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="edm-divider" />

          {/* ── Row 2: Tapal, End Date ── */}
          <div className="edm-grid-3">
            <div className="edm-field">
              <label className="edm-label">Tapal No</label>
              {editMode
                ? <input className="edm-input" value={form.tapalNo} onChange={e => setField("tapalNo", e.target.value)} placeholder="Tapal No."/>
                : <div className="edm-val">{form.tapalNo || <span className="edm-empty">Not assigned</span>}</div>}
            </div>
            <div className="edm-field">
              <label className="edm-label">Endt. Date (Due Date)</label>
              {editMode
                ? <input type="date" className="edm-input" value={form.dueDate} onChange={e => setField("dueDate", e.target.value)}/>
                : <div className="edm-val">{form.dueDate}</div>}
            </div>
          </div>

          <div className="edm-divider" />

          {/* ── Row 3: Financials ── */}
          <div className="edm-grid-6">
            {[
              ["Non-Recurring","nonRecurring"],
              ["Recurring","recurring"],
              ["Overhead %","overheadPct"],
            ].map(([label, key]) => (
              <div className="edm-field" key={key}>
                <label className="edm-label">{label}</label>
                {editMode
                  ? <input type="number" className="edm-input" value={form[key]} onChange={e => setField(key, e.target.value)}/>
                  : <div className="edm-val edm-val--num">{form[key]}</div>}
              </div>
            ))}
            <div className="edm-field">
              <label className="edm-label">Overhead Amount</label>
              <div className="edm-val edm-val--num edm-val--computed">{formatCurrency(ovhAmt)}</div>
            </div>
            <div className="edm-field">
              <label className="edm-label">GST@18%</label>
              <div className="edm-val edm-val--num edm-val--computed">{formatCurrency(gstAmt)}</div>
            </div>
            <div className="edm-field">
              <label className="edm-label">Total Project Amount</label>
              <div className="edm-val edm-val--num edm-val--total">{formatCurrency(total)}</div>
            </div>
          </div>

          <div className="edm-divider" />

          {/* ── Title ── */}
          <div className="edm-field edm-full-width">
            <label className="edm-label">Title</label>
            {editMode
              ? <textarea className="edm-textarea" value={form.title} onChange={e => setField("title", e.target.value)} rows={3}/>
              : <div className="edm-val edm-val--title">{form.title}</div>}
          </div>

          <div className="edm-divider" />

          {/* ── Due Date / PI Regular / Endorsement ── */}
          <div className="edm-grid-4">
            <div className="edm-field">
              <label className="edm-label">Due Date for submission</label>
              {editMode
                ? <input type="date" className="edm-input" value={form.dueDate} onChange={e => setField("dueDate", e.target.value)}/>
                : <div className="edm-val">{form.dueDate}</div>}
            </div>
            <div className="edm-field">
              <label className="edm-label">Is PI Regular Faculty?</label>
              <div className="edm-radio-row">
                {["yes","no"].map(opt => (
                  <label key={opt} className="edm-radio-label">
                    <input type="radio" name="piReg" value={opt} checked={form.isPIRegular === opt}
                      onChange={() => editMode && setField("isPIRegular", opt)} disabled={!editMode}/>
                    <span className="edm-radio-dot" />
                    {opt === "yes" ? "Yes" : "No"}
                  </label>
                ))}
              </div>
            </div>
            <div className="edm-field">
              <label className="edm-label">Endorsement Required?</label>
              <div className="edm-radio-row">
                {["yes","no"].map(opt => (
                  <label key={opt} className="edm-radio-label">
                    <input type="radio" name="endReq" value={opt} checked={form.endorsementRequired === opt}
                      onChange={() => editMode && setField("endorsementRequired", opt)} disabled={!editMode}/>
                    <span className="edm-radio-dot" />
                    {opt === "yes" ? "Yes" : "No"}
                  </label>
                ))}
              </div>
            </div>
            <div className="edm-field">
              <label className="edm-label">Endorsement Formats</label>
              {editMode ? (
                <select className="edm-select" value={form.endorsementFormat} onChange={e => setField("endorsementFormat", e.target.value)}>
                  <option value="">-- Select --</option>
                  {ENDORSEMENT_FORMATS.map(f => <option key={f}>{f}</option>)}
                </select>
              ) : <div className="edm-val">{form.endorsementFormat || <span className="edm-empty">None</span>}</div>}
            </div>
          </div>

          <div className="edm-divider" />

          {/* ── Investigators (AU Faculty) — PI row ── */}
          <div className="edm-section-head">Investigators (Anna University Faculty)</div>
          <div className="edm-inv-table-wrap">
            <table className="edm-inv-table">
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Name of the PIs</th>
                  <th>DoB</th>
                  <th>Service</th>
                  <th>Superannuation</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {/* PI Row */}
                <tr>
                  <td>1</td>
                  <td>
                    {editMode
                      ? <input className="edm-input-sm" value={form.piName} onChange={e => setField("piName", e.target.value)}/>
                      : `${form.piName}, ${form.piDesignation} (${form.piCampus})`}
                  </td>
                  <td>
                    {editMode
                      ? <input type="date" className="edm-input-sm" value={form.piDob} onChange={e => setField("piDob", e.target.value)}/>
                      : form.piDob}
                  </td>
                  <td>
                    {editMode
                      ? <input type="date" className="edm-input-sm" value={form.piService} onChange={e => setField("piService", e.target.value)}/>
                      : form.piService}
                  </td>
                  <td>
                    {editMode
                      ? <input type="date" className="edm-input-sm" value={form.piSuperannuation} onChange={e => setField("piSuperannuation", e.target.value)}/>
                      : form.piSuperannuation}
                  </td>
                  <td>
                    {editMode ? (
                      <select className="edm-select-sm">
                        <option>PI</option>
                      </select>
                    ) : <span className="edm-role-badge">PI</span>}
                  </td>
                </tr>
                {/* Co-PI rows */}
                {form.coPIs && form.coPIs.map((co, i) => (
                  <tr key={i}>
                    <td>{i + 2}</td>
                    <td>{co.name || co.facultyId}</td>
                    <td>{co.dob || "—"}</td>
                    <td>{co.dos || "—"}</td>
                    <td>{co.superannuation || "—"}</td>
                    <td><span className="edm-role-badge">{co.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="edm-divider" />

          {/* ── External Investigators ── */}
          <div className="edm-section-head">Investigators, Other than Anna University Faculty</div>
          <div className="edm-inv-table-wrap">
            <table className="edm-inv-table">
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Name of the PIs</th>
                  <th>Institute</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {form.extInvs && form.extInvs.length > 0
                  ? form.extInvs.map((ext, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        {editMode ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <input className="edm-input-sm" value={ext.name} onChange={e => {
                              const u = [...form.extInvs]; u[i].name = e.target.value; setField("extInvs", u);
                            }}/>
                            <input className="edm-input-sm" placeholder="Designation" value={ext.designation} onChange={e => {
                              const u = [...form.extInvs]; u[i].designation = e.target.value; setField("extInvs", u);
                            }}/>
                          </div>
                        ) : `${ext.name}, ${ext.designation}`}
                      </td>
                      <td>
                        {editMode
                          ? <input className="edm-input-sm" value={ext.institute} onChange={e => {
                            const u = [...form.extInvs]; u[i].institute = e.target.value; setField("extInvs", u);
                          }}/>
                          : ext.institute}
                      </td>
                      <td><span className="edm-role-badge">COPI</span></td>
                    </tr>
                  ))
                  : <tr><td colSpan={4} className="edm-empty-row">No external investigators</td></tr>
                }
              </tbody>
            </table>
          </div>

          <div className="edm-divider" />

          {/* ── Documents ── */}
          <div className="edm-docs-section">
            {[
              ["Proposal called intimation copy", "proposal"],
              ["Duly signed one Page writeup about this proposal", "writeup"],
              ["Duly signed head-wise budget", "budget"],
              ["Endorsement format, if any", "endorsementFile"],
              ["Overhead exemption, if any", "overhead"],
            ].map(([label, key]) => (
              <div key={key} className="edm-doc-row">
                <span className="edm-doc-label">{label}</span>
                {form.files?.[key] ? (
                  <button className="edm-doc-view">View</button>
                ) : (
                  <span className="edm-doc-none">No File uploaded</span>
                )}
              </div>
            ))}
          </div>

          <div className="edm-divider" />

          {/* ── Remarks + Decision ── */}
          <div className="edm-remarks-section">
            <div className="edm-field edm-full-width">
  <label className="edm-label">
    Remarks
  </label>

  {readOnly ? (
    <div className="edm-val">
      {form.remarks || "No Remarks"}
    </div>
  ) : (
    <textarea
      className="edm-textarea"
      rows={3}
      placeholder="Remarks ..."
      value={form.remarks || ""}
      onChange={(e) =>
        setField("remarks", e.target.value)
      }
    />
  )}
</div>

            {!readOnly && (
  <div className="edm-decision-row">
    {STATUS_OPTIONS.map(opt => (
      <label
        key={opt}
        className="edm-decision-label"
      >
        <input
          type="radio"
          name="decision"
          value={opt}
          checked={statusDecision === opt}
          onChange={() =>
            setStatusDecision(opt)
          }
        />

        <span className="edm-decision-dot" />
        {opt}
      </label>
    ))}
  </div>
)}
          </div>

          {!readOnly ? (
  <div className="edm-action-row">

    <button
      className="edm-btn-update"
      onClick={handleSave}
    >
      Update
    </button>

    <button className="edm-btn-lock">
      Lock
    </button>

    <button
      className="edm-btn-close-modal"
      onClick={onClose}
    >
      Close
    </button>

  </div>
) : (
  <div className="edm-action-row">

    <button
      className="edm-btn-close-modal"
      onClick={onClose}
    >
      Close
    </button>

  </div>
)}
        </div>
      </div>
    </div>
  );
}