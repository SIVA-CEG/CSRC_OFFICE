import React, { useState, useMemo } from "react";
import { SCHEMES_LIST } from "../master/Schemes";
import "./SchemeSelectModal.css";

export default function SchemeSelectModal({ open, onClose, onSelect, currentScheme }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return SCHEMES_LIST;
    return SCHEMES_LIST.filter(sc =>
      sc.schemeCode.toLowerCase().includes(s) ||
      sc.schemeName.toLowerCase().includes(s)
    );
  }, [search]);

  if (!open) return null;

  return (
    <div className="ssm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ssm-modal">
        <div className="ssm-header">
          <h3>Select Account / Scheme</h3>
          <button className="ssm-close" onClick={onClose}>✕</button>
        </div>

        <div className="ssm-search">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by scheme code or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          {search && <button className="ssm-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        <div className="ssm-list">
          {filtered.length === 0 && (
            <div className="ssm-empty">No schemes match "{search}"</div>
          )}
          {filtered.map(sc => (
            <div
              key={sc.schemeCode}
              className={`ssm-item ${currentScheme?.schemeCode === sc.schemeCode ? "ssm-item-active" : ""}`}
              onClick={() => { onSelect(sc); onClose(); }}
            >
              <div className="ssm-item-main">
                <span className="ssm-item-code">{sc.schemeCode}</span>
                <span className="ssm-item-name">{sc.schemeName}</span>
              </div>
              <div className="ssm-item-meta">
                <span className="ssm-item-type">{sc.accountType}</span>
                <span className="ssm-item-bank">{sc.bank}</span>
                <span className="ssm-item-acc">A/C: {sc.accountNo}</span>
              </div>
              {currentScheme?.schemeCode === sc.schemeCode && (
                <div className="ssm-item-check">✔ Selected</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}