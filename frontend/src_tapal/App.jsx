import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./components/layout/Layout";

// ── Existing pages ──────────────────────────────────────────────────────
import NewTapal from "./pages/NewTapal";
import AssignedTapal from "./pages/AssignedTapal";
import CompletedTapal from "./pages/CompletedTapal";
import TapalView from "./pages/TapalView";
import TapalSearch from "./pages/TapalSearch";

// ── New hierarchy pages ─────────────────────────────────────────────────
import TapalHome from "./pages/TapalHome";
import ProjectHome from "./pages/ProjectHome";
import EndorsementTapal from "./pages/EndorsementTapal";
import SanctionTapal from "./pages/SanctionTapal";
import BillsTapal from "./pages/BillsTapal";
import RequestTapal from "./pages/RequestTapal";
import UnderConstruction from "./pages/UnderConstruction";

// ── API ─────────────────────────────────────────────────────────────────
import {
  getTapals,
  assignTapal,
  transferTapal,
  completeTapal,
  markHardCopyReceived,
} from "./api/tapalApi";

// ── Helpers ─────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");
};

const mapTapal = (t) => ({
  id: t.tapal_no,
  acceptanceId: t.acceptance_id,
  tapalDate: formatDate(t.tapal_date),
  referenceDate: formatDate(t.reference_date),
  referenceNo: t.reference_no,
  mhFileNo: t.mh_file_no,
  ctdtCategory: t.ctdt_category,
  documentType: t.document_type,
  tapalFrom: t.tapal_from,
  department: t.department,
  campus: t.campus,
  amount: t.amount,
  tapalMode: t.tapal_mode,
  subject: t.subject,
  status: t.status,
  assignedTo: t.assigned_to,
  assignedAt: formatDate(t.assigned_at),
  remarks: t.remarks,
  despatchDate: formatDate(t.despatch_date),
  billUrl: t.bill_file
    ? `http://localhost:5000${t.bill_file}`
    : "/dummy-bill.pdf",
  billFileName: t.bill_file,
  hardCopyReceivedDate: formatDate(t.hard_copy_received_date),
  hardCopyReceivedDateRaw: t.hard_copy_received_date
    ? t.hard_copy_received_date.split("T")[0]
    : "",
});

// ── Under-construction wrappers ─────────────────────────────────────────
const ConsultancyUC = () => <UnderConstruction title="Consultancy" />;
const TestingUC     = () => <UnderConstruction title="Testing" />;
const TrainingUC    = () => <UnderConstruction title="Training" />;
const WorkshopsUC   = () => <UnderConstruction title="Workshops" />;

// ── Root app with shared tapal state ────────────────────────────────────
function AppRoutes() {
  const [tapals, setTapals] = useState([]);

  const loadTapals = async () => {
    const data = await getTapals();
    setTapals(data.map(mapTapal));
  };

  useEffect(() => {
    loadTapals();
  }, []);

  const onAdd = async () => {
    await loadTapals();
  };

  const onAssign = async (id, assignedTo, remarks) => {
    await assignTapal(id, { assignedTo, remarks });
    await loadTapals();
  };

  const onTransfer = async (id, transferTo, remarks) => {
    await transferTapal(id, { transferTo, remarks });
    await loadTapals();
  };

  const onComplete = async (id) => {
    await completeTapal(id);
    await loadTapals();
  };

  const onHardCopyReceived = async (id, hardCopyReceivedDate) => {
    await markHardCopyReceived(id, hardCopyReceivedDate);
    await loadTapals();
  };

  const counts = {
    new:       tapals.filter((t) => t.status === "new").length,
    assigned:  tapals.filter((t) => t.status === "assigned").length,
    completed: tapals.filter((t) => t.status === "completed").length,
  };

  return (
    <Routes>
      <Route path="/" element={<Layout counts={counts} />}>

        {/* Default redirect */}
        <Route index element={<Navigate to="/tapal" replace />} />

        {/* ── Top-level tapal home ── */}
        <Route path="tapal" element={<TapalHome />} />

        {/* ── Under-construction categories ── */}
        <Route path="tapal/consultancy/construction" element={<ConsultancyUC />} />
        <Route path="tapal/testing/construction"     element={<TestingUC />} />
        <Route path="tapal/training/construction"    element={<TrainingUC />} />
        <Route path="tapal/workshops/construction"   element={<WorkshopsUC />} />

        {/* ── Projects sub-tree ── */}
        <Route path="tapal/projects"             element={<ProjectHome />} />
        <Route path="tapal/projects/endorsement" element={<EndorsementTapal />} />
        <Route path="tapal/projects/sanction"    element={<SanctionTapal />} />
        <Route path="tapal/projects/bills"       element={<BillsTapal />} />
        <Route path="tapal/projects/requests"    element={<RequestTapal />} />

        {/* ── Legacy tapal pages (preserved, still functional) ── */}
        <Route
          path="tapal/legacy/new"
          element={
            <NewTapal
              tapals={tapals}
              onAssign={onAssign}
              onAdd={onAdd}
              onHardCopyReceived={onHardCopyReceived}
            />
          }
        />
        <Route
          path="tapal/legacy/assigned"
          element={
            <AssignedTapal
              tapals={tapals}
              onTransfer={onTransfer}
              onComplete={onComplete}
            />
          }
        />
        <Route
          path="tapal/legacy/completed"
          element={<CompletedTapal tapals={tapals} />}
        />
        <Route
          path="tapal/legacy/view"
          element={<TapalView tapals={tapals} />}
        />
        <Route
          path="tapal/legacy/search"
          element={<TapalSearch tapals={tapals} />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/tapal" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}