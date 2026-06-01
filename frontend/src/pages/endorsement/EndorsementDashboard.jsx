import { useState, useEffect } from "react";
import "./EndorsementDashboard.css";
import { useNavigate } from "react-router-dom";

const CARDS = [
  {
    id: "new-requests",
    icon: "📥",
    title: "New Requests",
    subtitle: "Pending PI submissions",
    color: "amber",
    count: 3,
  },
  {
    id: "transferred",
    icon: "🔄",
    title: "Transferred",
    subtitle: "In transition between offices",
    color: "blue",
    count: 7,
  },
  {
    id: "completed",
    icon: "✅",
    title: "Completed",
    subtitle: "Approved & closed",
    color: "green",
    count: 24,
  },
  {
    id: "create",
    icon: "✏️",
    title: "Create Endorsement",
    subtitle: "New proposal entry",
    color: "purple",
  },
  {
    id: "search",
    icon: "🔍",
    title: "Search",
    subtitle: "Query all records",
    color: "teal",
  },
];

export default function EndorsementDashboard({ onNavigate }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleCardClick = (id) => {
  switch (id) {
    case "new-requests":
      navigate("/endorsements/new-requests");
      break;

    case "search":
      navigate("/endorsements/search");
      break;

    case "create":
      navigate("/endorsements/create");
      break;

    case "transferred":
      navigate("/endorsements/transferred");
      break;

    case "completed":
      navigate("/endorsements/completed");
      break;

    default:
      break;
  }
};


  return (
    <div className={`edb-page ${mounted ? "edb-loaded" : ""}`}>
      {/* Header */}
      <div className="edb-header">
        <div className="edb-header-inner">
          <div className="edb-logo-mark">
            <span>CSRC</span>
          </div>
          <div>
            <h1 className="edb-title">Endorsement Management</h1>
            <p className="edb-subtitle">
              Centre for Sponsored Research &amp; Consultancy — Anna University
            </p>
          </div>
        </div>
        <div className="edb-header-stripe" />
      </div>

      {/* Stats bar */}
      <div className="edb-stats-bar">
        <div className="edb-stat">
          <span className="edb-stat-val">3</span>
          <span className="edb-stat-label">Awaiting Review</span>
        </div>
        <div className="edb-stat-div" />
        <div className="edb-stat">
          <span className="edb-stat-val">7</span>
          <span className="edb-stat-label">In Process</span>
        </div>
        <div className="edb-stat-div" />
        <div className="edb-stat">
          <span className="edb-stat-val">24</span>
          <span className="edb-stat-label">Completed</span>
        </div>
        <div className="edb-stat-div" />
        <div className="edb-stat">
          <span className="edb-stat-val">34</span>
          <span className="edb-stat-label">Total</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="edb-cards-grid">
        {CARDS.map((card, i) => (
          <div
            key={card.id}
            className={`edb-card edb-card--${card.color} edb-card--anim-${i + 1} ${
              card.underConstruction ? "edb-card--uc" : ""
            }`}
            onClick={() => handleCardClick(card.id)}
            style={{ cursor: card.underConstruction ? "not-allowed" : "pointer" }}
          >
            {card.underConstruction && (
              <div className="edb-uc-ribbon">Coming Soon</div>
            )}
            <div className="edb-card-top">
              <div className={`edb-card-icon edb-icon--${card.color}`}>
                <span>{card.icon}</span>
              </div>
              {card.count !== undefined && (
                <div className={`edb-card-badge edb-badge--${card.color}`}>
                  {card.count}
                </div>
              )}
            </div>
            <div className="edb-card-body">
              <h2 className="edb-card-title">{card.title}</h2>
              <p className="edb-card-sub">{card.subtitle}</p>
            </div>
            <div className="edb-card-footer">
              {card.underConstruction ? (
                <span className="edb-card-action edb-card-action--disabled">
                  Under Construction
                </span>
              ) : (
                <span className="edb-card-action">
                  Open <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </div>
            <div className="edb-card-glow" />
          </div>
        ))}
      </div>
    </div>
  );
}