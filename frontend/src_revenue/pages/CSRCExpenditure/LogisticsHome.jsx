import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentActor,
  getVehicles,
  addVehicle,
  getCounts,
  getPendingCountForRole,
  isApproverRole,
} from '../../utils/logisticsWorkflow';
import { theme, fontFaceAndUtilities } from '../../utils/theme';
import { Field, GroupTitle } from '../../utils/sharedRegisterUI';

const ACCENT = theme.amber || theme.indigo;
const ACCENT_DARK = theme.amberDark || theme.indigoDark;
const ACCENT_LIGHT = theme.amberLight || theme.indigoLight;

const EMPTY_VEHICLE = { vehicleNumber: '', makeModel: '', type: '', fuelType: 'Diesel', registeredOwner: '', remarks: '' };

export default function LogisticsHome() {
  const navigate = useNavigate();
  const [actor, setActor] = useState({ role: 'assistant', name: '' });
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_VEHICLE);

  const refresh = () => setVehicles(getVehicles());
  useEffect(() => { setActor(getCurrentActor()); refresh(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAddVehicle = () => {
    if (!form.vehicleNumber.trim()) return;
    addVehicle(form, actor);
    setForm(EMPTY_VEHICLE);
    setShowForm(false);
    refresh();
  };

  return (
    <div style={styles.root}>
      <style>{fontFaceAndUtilities}</style>
      <div style={styles.header} className="sd-fade-in">
        <button style={{ ...styles.backLink, color: ACCENT }} onClick={() => navigate('/revenue/csrc-expenditure')}>
          ← CSRC Revenue Home
        </button>
        <h1 style={styles.title}>Logistics Register</h1>
        <p style={styles.subtitle}>Vehicle usage, fuel &amp; mileage register — add a vehicle, then log trips and fuel issues against it.</p>
      </div>

      <div style={styles.toolbarRow} className="sd-fade-in">
        <h3 style={styles.sectionTitle}>Fleet ({vehicles.length})</h3>
        <button className="sd-btn" style={{ ...styles.addBtn, background: ACCENT }} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard} className="sd-fade-in">
          <GroupTitle accent={ACCENT}>New Vehicle</GroupTitle>
          <div style={styles.fieldGrid}>
            <Field label="Vehicle Number" value={form.vehicleNumber} onChange={(v) => set('vehicleNumber', v)} placeholder="e.g. TN 09 XX 1234" />
            <Field label="Make / Model" value={form.makeModel} onChange={(v) => set('makeModel', v)} />
            <Field label="Vehicle Type" value={form.type} onChange={(v) => set('type', v)} placeholder="e.g. Car, Van" />
            <Field label="Fuel Type" type="select" value={form.fuelType} onChange={(v) => set('fuelType', v)} options={[{ value: 'Diesel', label: 'Diesel' }, { value: 'Petrol', label: 'Petrol' }, { value: 'CNG', label: 'CNG' }, { value: 'Electric', label: 'Electric' }]} />
            <Field label="Registered Owner / Dept." value={form.registeredOwner} onChange={(v) => set('registeredOwner', v)} placeholder="e.g. CSRC, Anna University" />
            <Field label="Remarks" value={form.remarks} onChange={(v) => set('remarks', v)} wide />
          </div>
          <button className="sd-btn" style={{ ...styles.submitBtn, background: ACCENT }} onClick={handleAddVehicle}>Save Vehicle</button>
        </div>
      )}

      {vehicles.length === 0 && !showForm && (
        <div style={styles.emptyState} className="sd-fade-in">No vehicles registered yet. Click "+ Add Vehicle" to get started.</div>
      )}

      <div style={styles.grid}>
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} actor={actor} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, actor, navigate }) {
  const [pendingMine, setPendingMine] = useState(0);
  const [stats, setStats] = useState({ all: 0, registered: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    setStats(getCounts(vehicle.id));
    if (isApproverRole(actor.role)) setPendingMine(getPendingCountForRole(actor.role, vehicle.id));
  }, [vehicle.id, actor.role]);

  return (
    <div className="sd-card-hover sd-fade-in" style={{ ...styles.card, borderColor: ACCENT_LIGHT }}>
      <div style={{ ...styles.cardIconWrap, background: ACCENT_LIGHT }}>
        <span style={{ fontSize: 26 }}>🚗</span>
      </div>
      {isApproverRole(actor.role) && pendingMine > 0 && <span style={{ ...styles.badge, background: ACCENT }}>{pendingMine} pending</span>}
      <h3 style={{ ...styles.cardTitle, color: ACCENT_DARK }}>{vehicle.vehicleNumber}</h3>
      <p style={styles.cardSubtitle}>{vehicle.makeModel || vehicle.type || '—'} {vehicle.fuelType ? `· ${vehicle.fuelType}` : ''}</p>
      <div style={styles.statRow}>
        <MiniStat label="Trips" value={stats.all} color={ACCENT} bg={ACCENT_LIGHT} />
        <MiniStat label="Logged" value={stats.registered} color={theme.emeraldDark} bg={theme.emeraldLight} />
        <MiniStat label="Pending" value={stats.pending} color={theme.amberDark} bg={theme.amberLight} />
      </div>
      <div style={styles.cardActions}>
        <button className="sd-btn" style={{ ...styles.smallBtn, background: ACCENT }} onClick={() => navigate(`/revenue/csrc-expenditure/logistics/${vehicle.id}/add`)}>
          {isApproverRole(actor.role) ? 'View Trips' : '+ Log Trip'}
        </button>
        <button className="sd-btn" style={styles.smallBtnOutline} onClick={() => navigate(`/revenue/csrc-expenditure/logistics/${vehicle.id}/view`)}>
          View &amp; Report
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color, bg }) {
  return (
    <div style={{ ...styles.miniStat, background: bg }}>
      <div style={{ ...styles.miniStatValue, color }}>{value}</div>
      <div style={styles.miniStatLabel}>{label}</div>
    </div>
  );
}

const styles = {
  root: { minHeight: '100%', background: theme.bg, padding: '32px 40px 56px', fontFamily: theme.fontBody },
  header: { marginBottom: 22 },
  backLink: { border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10 },
  title: { fontFamily: theme.fontDisplay, fontSize: 30, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  subtitle: { color: theme.textSecondary, marginTop: 6, fontSize: 14.5, maxWidth: 640 },
  toolbarRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 800, color: theme.textPrimary, margin: 0 },
  addBtn: { border: 'none', color: '#fff', padding: '10px 18px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 13, cursor: 'pointer' },
  formCard: { background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, padding: 24, boxShadow: theme.shadowSm, marginBottom: 24 },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 18 },
  submitBtn: { border: 'none', color: '#fff', padding: '12px 24px', borderRadius: theme.radiusMd, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: theme.textMuted, background: theme.surface, borderRadius: theme.radiusLg, border: `1px solid ${theme.border}` },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  card: { position: 'relative', textAlign: 'left', background: theme.surface, border: '1px solid', borderRadius: theme.radiusLg, padding: 24, boxShadow: theme.shadowSm, fontFamily: theme.fontBody },
  cardIconWrap: { width: 50, height: 50, borderRadius: theme.radiusMd, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  badge: { position: 'absolute', top: 20, right: 20, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 },
  cardTitle: { fontFamily: theme.fontDisplay, fontSize: 18, fontWeight: 700, margin: '0 0 4px' },
  cardSubtitle: { fontSize: 13, color: theme.textSecondary, margin: '0 0 14px' },
  statRow: { display: 'flex', gap: 8, marginBottom: 16 },
  miniStat: { borderRadius: theme.radiusSm, padding: '7px 10px', flex: 1 },
  miniStatValue: { fontSize: 16, fontWeight: 800, fontFamily: theme.fontDisplay },
  miniStatLabel: { fontSize: 10, color: theme.textSecondary, fontWeight: 600 },
  cardActions: { display: 'flex', gap: 8 },
  smallBtn: { flex: 1, border: 'none', color: '#fff', padding: '10px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' },
  smallBtnOutline: { flex: 1, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textSecondary, padding: '10px', borderRadius: theme.radiusSm, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' },
};