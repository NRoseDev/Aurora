import React from "react";

export default function Sidebar({ currentView, onViewChange }) {
  const menuItems = [
    { id: "dashboard", label: "📊 Main Dashboard", category: "core" },
    { id: "creator-workspace", label: "✨ Creator Workspace", category: "commerce" },
    { id: "studio", label: "🎨 Snap 2 Fit Studio", category: "commerce" },
    { id: "storefront", label: "🛍️ My Storefront", category: "commerce" },
    { id: "store-connections", label: "🔗 Store Connections", category: "commerce" },
    { id: "pricing", label: "💳 Creator Pricing Tiers", category: "commerce" },
    { id: "constellation", label: "🌌 Constellation Hub", category: "incubator" },
    { id: "incubator", label: "🌱 Collective Incubator", category: "incubator" },
  ];

  const renderMenu = (category) =>
    menuItems
      .filter(
        (item) =>
          item.category === category ||
          (category === "commerce" && item.category === "core")
      )
      .map((item) => {
        const isActive = currentView === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px 15px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: isActive ? "#1e293b" : "transparent",
              color: isActive ? "#3b82f6" : "#94a3b8",
              fontSize: "14px",
              fontWeight: isActive ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        );
      });

  return (
    <div
      style={{
        width: "260px",
        backgroundColor: "#0f172a",
        color: "#fff",
        minHeight: "100vh",
        padding: "25px 15px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "35px", paddingLeft: "10px" }}>
        <h1 style={{ fontSize: "22px", margin: 0 }}>
          Aurora<span style={{ color: "#3b82f6" }}>.</span>
        </h1>
        <p
          style={{
            fontSize: "11px",
            color: "#64748b",
            textTransform: "uppercase",
          }}
        >
          All-In-One Ecosystem
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "25px", flexGrow: 1 }}>
        <div>
          <p style={{ fontSize: "11px", color: "#475569", marginLeft: "10px" }}>
            Product & Selling
          </p>
          {renderMenu("commerce")}
        </div>

        <div>
          <p style={{ fontSize: "11px", color: "#475569", marginLeft: "10px" }}>
            Idea Incubator
          </p>
          {renderMenu("incubator")}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #1e293b",
          paddingTop: "15px",
          paddingLeft: "10px",
        }}
      >
        <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>
          Creator Workspace
        </p>
        <p style={{ fontSize: "11px", color: "#64748b" }}>
          Advanced Tier Active
        </p>
      </div>
    </div>
  );
}
