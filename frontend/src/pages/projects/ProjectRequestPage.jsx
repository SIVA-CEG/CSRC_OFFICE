import React from "react";
import "./ProjectRequestPage.css";

const STATS = {
  reappropriation: { pending: 4, approved: 11, declined: 2 },
  extension: { pending: 3, approved: 8, declined: 1 },
};

export default function ProjectRequestsPage({ onNavigate }) {
  return (
    <div className="prq-page">
      {/* Header */}
      <div className="prq-header">
        <div className="page-breadcrumb">
          Home / <span onClick={() => onNavigate && onNavigate("dashboard")}>Dashboard</span> /{" "}
          <span>Project Requests</span>
        </div>
        <h1 className="prq-title">Project Requests</h1>
        <p className="prq-subtitle">
          Review, approve, and track all incoming project requests from Principal Investigators
        </p>
      </div>

      {/* Summary strip */}
      <div className="prq-summary-strip">
        <div className="prq-strip-item">
          <span className="prq-strip-num pending">{STATS.reappropriation.pending + STATS.extension.pending}</span>
          <span className="prq-strip-label">Pending Review</span>
        </div>
        <div className="prq-strip-divider" />
        <div className="prq-strip-item">
          <span className="prq-strip-num approved">{STATS.reappropriation.approved + STATS.extension.approved}</span>
          <span className="prq-strip-label">Approved</span>
        </div>
        <div className="prq-strip-divider" />
        <div className="prq-strip-item">
          <span className="prq-strip-num declined">{STATS.reappropriation.declined + STATS.extension.declined}</span>
          <span className="prq-strip-label">Declined</span>
        </div>
        <div className="prq-strip-divider" />
        <div className="prq-strip-item">
          <span className="prq-strip-num total">
            {Object.values(STATS).reduce((s, v) => s + v.pending + v.approved + v.declined, 0)}
          </span>
          <span className="prq-strip-label">Total Requests</span>
        </div>
      </div>

      {/* Cards */}
      <div className="prq-cards">
        {/* Reappropriation */}
        <div className="prq-card" onClick={() => onNavigate && onNavigate("office-reappropriation")}>
          <div className="prq-card-accent reap-accent" />
          <div className="prq-card-body">
            <div className="prq-card-icon reap-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 014-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
            </div>
            <div className="prq-card-content">
              <h2 className="prq-card-title">Reappropriation Claims</h2>
              <p className="prq-card-desc">
                Review fund reallocation requests submitted by PIs. Approve or decline transfers
                between sanctioned budget heads.
              </p>
              <div className="prq-card-stats">
                <span className="prq-stat pending">
                  <span className="prq-stat-dot" />
                  {STATS.reappropriation.pending} Pending
                </span>
                <span className="prq-stat approved">
                  <span className="prq-stat-dot" />
                  {STATS.reappropriation.approved} Approved
                </span>
                <span className="prq-stat declined">
                  <span className="prq-stat-dot" />
                  {STATS.reappropriation.declined} Declined
                </span>
              </div>
            </div>
            <div className="prq-card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>

        {/* Project Extension */}
        <div className="prq-card" onClick={() => onNavigate && onNavigate("office-extension")}>
          <div className="prq-card-accent ext-accent" />
          <div className="prq-card-body">
            <div className="prq-card-icon ext-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M12 14v4M10 16h4" />
              </svg>
            </div>
            <div className="prq-card-content">
              <h2 className="prq-card-title">Project Extension Claims</h2>
              <p className="prq-card-desc">
                Review no-cost extension requests from PIs. Approve revised project end dates and
                maintain extension history.
              </p>
              <div className="prq-card-stats">
                <span className="prq-stat pending">
                  <span className="prq-stat-dot" />
                  {STATS.extension.pending} Pending
                </span>
                <span className="prq-stat approved">
                  <span className="prq-stat-dot" />
                  {STATS.extension.approved} Approved
                </span>
                <span className="prq-stat declined">
                  <span className="prq-stat-dot" />
                  {STATS.extension.declined} Declined
                </span>
              </div>
            </div>
            <div className="prq-card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}