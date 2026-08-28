import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "./ProjectContext";
import "./ProjectDashboard.css";

export default function ProjectDashboard() {
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem("userRole") || "assistant";
  const userName = sessionStorage.getItem("userName") || "";

  const {
    freshActive,
    freshTransferred,
    freshCompleted,
    renewalActive,
    renewalTransferred,
    renewalCompleted,
    reapActive,
    reapTransferred,
    reapCompleted,
    extActive,
    extTransferred,
    extCompleted,
  } = useProjectContext();

  // ── Role-aware counts ──────────────────────────────────────────────────────
  const myTransferred = (list) =>
    list.filter((i) =>
      userRole === "superintendent"
        ? i.currentHolder?.role === "superintendent"
        : userRole === "director"
          ? i.currentHolder?.role === "director"
          : true,
    );

  const counts = {
    freshPending:
      userRole === "assistant"
        ? freshActive.length
        : myTransferred(freshTransferred).length,
    renewalPending:
      userRole === "assistant"
        ? renewalActive.length
        : myTransferred(renewalTransferred).length,
    reapPending:
      userRole === "assistant"
        ? reapActive.length
        : myTransferred(reapTransferred).length,
    extPending:
      userRole === "assistant"
        ? extActive.length
        : myTransferred(extTransferred).length,
  };

  // ── Module definitions ─────────────────────────────────────────────────────
  const modules = [
    {
      label: "Fresh Sanctions",
      icon: "✨",
      path: "fresh-sanction",
      count: counts.freshPending,
      desc: "First installment sanction requests",
      color: "#2e7d32",
    },
    {
      label: "Other Sanctions",
      icon: "🔄",
      path: "renewal-sanction",
      count: counts.renewalPending,
      desc: "2nd–nth installment renewals",
      color: "#1565c0",
    },
    {
      label: "Project Requests",
      icon: "📩",
      path: "project-requests",
      count: counts.reapPending + counts.extPending,
      desc: "Reappropriation & extension claims",
      color: "#6a1b9a",
    },
    {
      label: "ZBA Claim Requests",
      icon: "🏦",
      path: "zba-claims",
      count: null,
      desc: "ZBA account claim management",
      color: "#e65100",
    },
    {
      label: "TSA(H) Claim Requests",
      icon: "🏥",
      path: "tsa-claims",
      count: null,
      desc: "TSA(H) account claim management",
      color: "#00695c",
    },
    {
      label: "CMRG Claim Requests",
      icon: "📊",
      path: "cmrg-claims",
      count: null,
      desc: "CMRG account claim management",
      color: "#37474f",
    },
    {
      label: "Search",
      icon: "🔍",
      path: "search",
      count: null,
      desc: "Search across all projects",
      color: "#455a64",
    },
    {
      label: "Reports",
      icon: "📑",
      path: "reports",
      count: null,
      desc: "Generate and export reports",
      color: "#4e342e",
    },
  ];

  const roleLabel =
    {
      assistant: "🟢 Assistant View",
      superintendent: "🔵 Superintendent View",
      director: "🔴 Director View",
    }[userRole] || "";

  return (
    <div className="project-dashboard">
      <header className="project-header">
        <div className="project-header-top">
          <div>
            <h1>Projects Dashboard</h1>
            <p>
              Manage and track all project-related sanctions, requests,
              proceedings, and claims.
            </p>
          </div>
          <div className="project-role-chip">{roleLabel}</div>
        </div>

        {/* Summary bar */}
        <div className="project-summary-bar">
          <div className="psb-item">
            <span className="psb-num">{counts.freshPending}</span>
            <span className="psb-label">Fresh sanctions Pending</span>
          </div>
          <div className="psb-divider" />
          <div className="psb-item">
            <span className="psb-num">{counts.renewalPending}</span>
            <span className="psb-label">Other sanctions Pending</span>
          </div>
          <div className="psb-divider" />
          <div className="psb-item">
            <span className="psb-num">
              {counts.reapPending + counts.extPending}
            </span>
            <span className="psb-label">Requests Pending</span>
          </div>
          <div className="psb-divider" />
          <div className="psb-item">
            <span className="psb-num">
              {freshCompleted.length +
                renewalCompleted.length +
                reapCompleted.length +
                extCompleted.length}
            </span>
            <span className="psb-label">Completed</span>
          </div>
        </div>
      </header>

      <div className="project-grid">
        {modules.map((item) => (
          <div
            key={item.path}
            className="project-card"
            onClick={() => navigate(`/projects/${item.path}`)}
            style={{ "--card-accent": item.color }}
          >
            <div className="card-accent-bar" />
            <div className="card-icon">{item.icon}</div>
            <h3>{item.label}</h3>
            <p className="card-desc">{item.desc}</p>
            {item.count !== null && item.count > 0 && (
              <span className="card-badge">{item.count} pending</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
