import { useMemo, useState } from "react";
import TapalDetailModal from "../components/tapal/TapalDetailModal";
import StatusBadge from "../components/common/StatusBadge";

export default function TapalView({ tapals }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const search = query.toLowerCase();

    return tapals.filter(
      (tapal) =>
        tapal.id?.toLowerCase().includes(search) ||
        tapal.tapalFrom?.toLowerCase().includes(search) ||
        tapal.subject?.toLowerCase().includes(search)
    );
  }, [tapals, query]);

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Tapal View</h2>
          <p className="page-subtitle">Browse and view individual tapal details</p>
        </div>
      </div>

      <div className="card">
        <div className="search-panel">
          <label>Search Tapals</label>
          <input
            placeholder="Search by Tapal ID, sender, or subject..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="tapal-card-grid">
          {filtered.map((tapal) => (
            <button
              key={tapal.id}
              className="tapal-view-card"
              onClick={() => setSelected(tapal)}
            >
              <div className="tapal-card-top">
                <div>
                  <span className="tapal-card-id">{tapal.id}</span>
                  <StatusBadge status={tapal.status} />
                </div>

                <div className="tapal-card-date">
                  <span>{tapal.tapalDate || "—"}</span>
                  <small>{tapal.campus || "—"}</small>
                </div>
                <div style={{ marginTop: 2 }}>
  Hard Copy: {tapal.hardCopyReceivedDate || "—"}
</div>
              </div>

              <p className="tapal-card-subject">{tapal.subject || "—"}</p>

              <div className="tapal-card-meta">
                <span>From</span>
                <strong>{tapal.tapalFrom || "—"}</strong>
              </div>

              {tapal.assignedTo && (
                <div className="tapal-card-meta">
                  <span>Assigned To</span>
                  <strong>{tapal.assignedTo}</strong>
                </div>
              )}

              <div className="tapal-card-footer">
                {tapal.ctdtCategory || "—"} · {tapal.documentType || "—"}
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔎</div>
              <h4>No tapals match your search</h4>
              <p>Try searching with a different Tapal ID, sender, or subject.</p>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <TapalDetailModal tapal={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}