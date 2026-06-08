import { useMemo, useState } from "react";
import DataTable from "../components/common/DataTable";
import TapalDetailModal from "../components/tapal/TapalDetailModal";
import { ctdtCategories, campuses } from "../data/dummyData";

const initialFilters = {
  id: "",
  category: "",
  campus: "",
  status: "",
  from: "",
};

export default function TapalSearch({ tapals }) {
  const [filters, setFilters] = useState(initialFilters);
  const [detail, setDetail] = useState(null);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const results = useMemo(() => {
    return tapals.filter((tapal) => {
      if (filters.id && !tapal.id?.toLowerCase().includes(filters.id.toLowerCase())) return false;
      if (filters.category && tapal.ctdtCategory !== filters.category) return false;
      if (filters.campus && tapal.campus !== filters.campus) return false;
      if (filters.status && tapal.status !== filters.status) return false;
      if (filters.from && !tapal.tapalFrom?.toLowerCase().includes(filters.from.toLowerCase())) return false;
      return true;
    });
  }, [tapals, filters]);

  const rowsWithIdx = results.map((tapal, index) => ({
    ...tapal,
    slNo: index + 1,
  }));

  const columns = [
    { key: "slNo", label: "Sl.No." },
    {
      key: "id",
      label: "Tapal ID",
      render: (tapal) => (
        <button className="tapal-id-link" onClick={() => setDetail(tapal)}>
          {tapal.id}
        </button>
      ),
    },
    { key: "mhFileNo", label: "M.H.No / File No." },
    { key: "tapalDate", label: "Date" },
    { key: "ctdtCategory", label: "Category" },
    { key: "documentType", label: "Type" },
    { key: "tapalFrom", label: "Tapal From" },
    { key: "campus", label: "Campus" },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (tapal) => tapal.assignedTo || "—",
    },
    {
  key: "bill",
  label: "View Bill",
  render: (tapal) => (
    <button
      className="btn btn-outline btn-sm"
      onClick={() => window.open(tapal.billUrl || "/dummy-bill.pdf", "_blank")}
    >
      View Bill
    </button>
  ),
},
    {
      key: "despatchDate",
      label: "Despatch",
      render: (tapal) => tapal.despatchDate || "—",
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Tapal Search</h2>
          <p className="page-subtitle">Filter and find tapals across all sections</p>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="form-field">
            <label>Tapal ID</label>
            <input
              placeholder="Search Tapal ID..."
              value={filters.id}
              onChange={(e) => updateFilter("id", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {ctdtCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Campus</label>
            <select
              value={filters.campus}
              onChange={(e) => updateFilter("campus", e.target.value)}
            >
              <option value="">All Campuses</option>
              {campuses.map((campus) => (
                <option key={campus}>{campus}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-field">
            <label>Tapal From</label>
            <input
              placeholder="Search sender..."
              value={filters.from}
              onChange={(e) => updateFilter("from", e.target.value)}
            />
          </div>

          <button
            className="btn btn-outline filter-clear-btn"
            onClick={() => setFilters(initialFilters)}
          >
            Clear
          </button>
        </div>

        <DataTable
          columns={columns}
          rows={rowsWithIdx}
          totalLabel={`${results.length} of ${tapals.length} records`}
        />
      </div>

      {detail && <TapalDetailModal tapal={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}