// Master Application Root uniting the Sidebar Navigation, Creator Workspace, Snap 2 Fit, and Constellation hubs

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Storefront from "./Storefront";
import Pricing from "./Pricing";
import Constellation from "./Constellation";
import Incubator from "./Incubator";
import StoreConnections from "./StoreConnections";
import CreatorWorkspace from "./CreatorWorkspace";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderActiveView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;

      case "creator-workspace":
        return <CreatorWorkspace />;

      case "storefront":
        return <Storefront />;

      case "store-connections":
        return <StoreConnections />;

      case "pricing":
        return <Pricing />;

      case "constellation":
        return <Constellation />;

      case "incubator":
        return <Incubator />;

      case "studio":
        return (
          <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
            <h2>🎨 Snap 2 Fit Studio</h2>
            <p style={{ color: "#64748b" }}>
              Upload your master asset. AI will optimize, re-pixelate, and
              auto-fit your designs across products.
            </p>

            <div
              style={{
                padding: "40px",
                border: "2px dashed #cbd5e1",
                borderRadius: "12px",
                textAlign: "center",
                background: "#fff",
                marginTop: "20px",
              }}
            >
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Upload Master Image
              </button>
            </div>
          </div>
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {renderActiveView()}
      </main>
    </div>
  );
}
