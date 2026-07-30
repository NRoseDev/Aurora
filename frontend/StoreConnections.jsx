import React from "react";

const stores = [
  {
    name: "Shopify",
    description: "Connect your Shopify store to sync products and manage your storefront.",
    status: "Not Connected",
  },
  {
    name: "Etsy",
    description: "Connect your Etsy shop to organize listings and marketplace products.",
    status: "Not Connected",
  },
  {
    name: "Amazon",
    description: "Connect your Amazon Seller account to manage marketplace listings.",
    status: "Not Connected",
  },
  {
    name: "Pinterest",
    description: "Connect your Pinterest Business account to share products and visual content.",
    status: "Not Connected",
  },
];

export default function StoreConnections() {
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Store Connections</h1>

      <p style={{ color: "#666", marginBottom: "32px" }}>
        Connect your favorite commerce platforms so Aurora can help you organize,
        publish, and grow your business.
      </p>

      {stores.map((store) => (
        <div
          key={store.name}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0 }}>{store.name}</h2>

          <p>{store.description}</p>

          <p>
            <strong>Status:</strong> 🔴 {store.status}
          </p>

          <button
            style={{
              padding: "10px 18px",
              borderRadius: "6px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Connect {store.name}
          </button>
        </div>
      ))}
    </div>
  );
}
