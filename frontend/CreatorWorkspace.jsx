import React, { useState } from "react";

export default function CreatorWorkspace() {
const [credits, setCredits] = useState(1100);
const [languages, setLanguages] = useState([]);

const handleLanguageToggle = (lang) => {
if (languages.includes(lang)) {
setLanguages(languages.filter((l) => l !== lang));
} else {
setLanguages([...languages, lang]);
}
};

const creatorTools = [
"Product Creation",
"AI Tools",
"Media Library",
"Publishing",
"Analytics",
];

return (
<div
style={{
padding: "24px",
fontFamily: "sans-serif",
maxWidth: "900px",
margin: "0 auto",
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "center",
borderBottom: "1px solid #eee",
paddingBottom: "16px",
}}
> <div>
<h1 style={{ fontSize: "24px", margin: 0 }}>
Aurora Creator Workspace </h1>
<p style={{ color: "#666", margin: "4px 0 0" }}>
Create, publish, and grow your digital business. </p> </div>

```
    <div
      style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        padding: "8px 16px",
        borderRadius: "8px",
        textAlign: "right",
      }}
    >
      <div style={{ fontWeight: "bold", color: "#16a34a" }}>
        {credits} Credits Available
      </div>
      <small style={{ color: "#666" }}>
        Baseline Subscription Tier
      </small>
    </div>
  </div>

  <div style={{ marginTop: "24px" }}>
    <h3>Creator Tools</h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "12px",
      }}
    >
      {creatorTools.map((tool) => (
        <div
          key={tool}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "16px",
            background: "#fff",
          }}
        >
          {tool}
        </div>
      ))}
    </div>
  </div>

  <div
    style={{
      marginTop: "24px",
      border: "2px dashed #cbd5e1",
      borderRadius: "12px",
      padding: "40px",
      textAlign: "center",
      background: "#f8fafc",
    }}
  >
    <p style={{ fontSize: "18px", fontWeight: "500" }}>
      Drag and drop your video or audio assets here
    </p>
    <p style={{ color: "#64748b", fontSize: "14px" }}>
      Supports MP4, MOV, and MP3 files
    </p>
  </div>

  <div style={{ marginTop: "24px" }}>
    <h3 style={{ fontSize: "16px" }}>
      Select Target Languages (AI Dubbing)
    </h3>

    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {["Spanish", "French", "German", "Japanese", "Mandarin"].map(
        (lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageToggle(lang)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #cbd5e1",
              cursor: "pointer",
              background: languages.includes(lang)
                ? "#2563eb"
                : "#fff",
              color: languages.includes(lang)
                ? "#fff"
                : "#000",
            }}
          >
            {lang}
          </button>
        )
      )}
    </div>
  </div>

  <div
    style={{
      marginTop: "32px",
      padding: "16px",
      borderRadius: "8px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
    }}
  >
    <h3 style={{ marginTop: 0 }}>Store Integration Ready</h3>
    <p style={{ color: "#64748b" }}>
      Connect Shopify, Etsy, Amazon, Pinterest, and future commerce
      platforms through Store Connections.
    </p>

    <button
      style={{
        padding: "10px 16px",
        borderRadius: "6px",
        border: "none",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      Manage Store Connections
    </button>
  </div>
</div>
```

);
}
