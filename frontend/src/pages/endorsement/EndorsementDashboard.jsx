import { useState, useEffect } from "react";
import "./EndorsementDashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    id: "Transferred",
    icon: "🔄",
    title: "Transferred",
    subtitle: "Items transferred to you",
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
  const [counts, setCounts] = useState({
    pending: 0,
    transferred: 0,
    completed: 0,
    total: 0,
  });
  const storedUser = JSON.parse(
    sessionStorage.getItem("proceedings_user") ||
      sessionStorage.getItem("proceedings_user") ||
      "{}",
  );
  const role = (storedUser.role || "").toLowerCase();
  const awaitingLabel =
    role.includes("assistant") || role.includes("super") || role === "dd"
      ? "Pending With You"
      : role.includes("director")
        ? "Awaiting In Tapal"
        : "Awaiting In Tapal";
  useEffect(() => {
    setTimeout(() => setMounted(true), 50);

    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const user = JSON.parse(
        sessionStorage.getItem("proceedings_user") ||
          sessionStorage.getItem("proceedings_user") ||
          "{}",
      );

      const username = user?.username;

      console.log("USERNAME:", username);

      console.log("USERNAME:", username);

      const res = await axios.get(
        "http://localhost:5100/api/endorsements/dashboard-counts",
        {
          params: { username },
        },
      );

      setCounts(res.data);
    } catch (err) {
      console.error(err);

      if (err.response) {
        console.log("STATUS:", err.response.status);
        console.log("DATA:", err.response.data);
      }
    }
  };
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

      case "Transferred":
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
          <span className="edb-stat-val">{counts.awaiting || 0}</span>
          <span className="edb-stat-label">{awaitingLabel}</span>
        </div>
        <div className="edb-stat-div" />
        <div className="edb-stat">
          <span className="edb-stat-val">{counts.pending || 0}</span>
          <span className="edb-stat-label">In Process</span>
        </div>
        <div className="edb-stat-div" />
        <div className="edb-stat">
          <span className="edb-stat-val">{counts.completed || 0}</span>
          <span className="edb-stat-label">Completed</span>
        </div>
        <div className="edb-stat-div" />
        <div className="edb-stat">
          <span className="edb-stat-val">{counts.total || 0}</span>
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
            style={{
              cursor: card.underConstruction ? "not-allowed" : "pointer",
            }}
          >
            {card.underConstruction && (
              <div className="edb-uc-ribbon">Coming Soon</div>
            )}
            <div className="edb-card-top">
              <div className={`edb-card-icon edb-icon--${card.color}`}>
                <span>{card.icon}</span>
              </div>
              {card.countKey && (
                <div className={`edb-card-badge edb-badge--${card.color}`}>
                  {counts[card.countKey]}
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
                  Open{" "}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
