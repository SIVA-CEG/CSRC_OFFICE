import React, { useState, useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { EndorsementProvider } from "./pages/endorsement/EndorsementContext";

// ── Cross-tab auth warning banner ─────────────────────────────────────────────
// When a different user logs in on another browser tab, this banner appears
// in the current tab so the user knows. Their own session is unaffected.
const authChannel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("csrc_auth")
    : null;

function TabAuthBanner() {
  const [banner, setBanner] = useState(null);
  // banner: { type: "LOGIN", name: string } | null

  useEffect(() => {
    if (!authChannel) return;
    const handler = (event) => {
      const { type, user } = event.data || {};
      if (type === "LOGIN") {
        setBanner({ type: "LOGIN", name: user?.name || "Another user" });
      }
    };
    authChannel.addEventListener("message", handler);
    return () => authChannel.removeEventListener("message", handler);
  }, []);

  if (!banner) return null;

  const handleLogoutThisTab = () => {
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("proceedings_user");
    setBanner(null);
    // Redirect to the root — adjust path to your login page if different
    window.location.href = "/";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        background: "#fefce8",
        borderBottom: "3px solid #fde047",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "13px",
        fontWeight: 500,
        color: "#1e293b",
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
      }}
    >
      <span style={{ fontSize: "18px" }}>🔄</span>
      <span style={{ flex: 1 }}>
        Another tab just logged in as <strong>"{banner.name}"</strong>. This tab
        still uses your own session — you are unaffected.
      </span>
      <button
        onClick={handleLogoutThisTab}
        style={{
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "5px 12px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        Log out this tab too
      </button>
      <button
        onClick={() => setBanner(null)}
        style={{
          background: "transparent",
          border: "1px solid #94a3b8",
          borderRadius: "6px",
          padding: "5px 10px",
          cursor: "pointer",
          fontSize: "12px",
          color: "#475569",
          whiteSpace: "nowrap",
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <EndorsementProvider>
      {/* Banner sits outside the router so it's always visible */}
      <TabAuthBanner />
      <AppRouter />
    </EndorsementProvider>
  );
}

export default App;
