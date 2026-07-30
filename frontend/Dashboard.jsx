import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);
  const [inputMode, setInputMode] = useState("type");
  const [textToSpeech, setTextToSpeech] = useState(false);

  useEffect(() => {
    const handleExternalDeviceInput = (e) => {
      if (inputMode === "external") {
        console.log(`Assistive device key detected: ${e.keyCode}`);
      }
    };

    window.addEventListener("keydown", handleExternalDeviceInput);

    return () => window.removeEventListener("keydown", handleExternalDeviceInput);
  }, [inputMode]);

  const globalFontStyle = isDyslexiaFont
    ? "OpenDyslexic, sans-serif"
    : "Arial, sans-serif";

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: globalFontStyle,
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          padding: "15px",
          backgroundColor: "#f5f5f7",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h4>♿ Universal Accessibility Controls</h4>

        <label>
          <input
            type="checkbox"
            checked={isDyslexiaFont}
            onChange={(e) => setIsDyslexiaFont(e.target.checked)}
          />
          Dyslexia Font
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={textToSpeech}
            onChange={(e) => setTextToSpeech(e.target.checked)}
          />
          Screen Reader (TTS)
        </label>

        <br />

        <label>
          Input Mode:
          <select
            value={inputMode}
            onChange={(e) => setInputMode(e.target.value)}
          >
            <option value="type">Keyboard/Type</option>
            <option value="speak">Voice</option>
            <option value="asl">ASL Tracking</option>
            <option value="external">External Device</option>
          </select>
        </label>
      </div>

      <h2>Aurora Creator Engine</h2>
      <p style={{ color: "#666" }}>
        Upload once. Create, publish, and manage your creator ecosystem.
      </p>

      <textarea
        placeholder="Write your post content..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        style={{
          width: "100%",
          height: "100px",
          padding: "10px",
          marginBottom: "20px",
          fontFamily: globalFontStyle,
        }}
      />

      <h3>Publishing Channels</h3>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {["TikTok", "Instagram", "Facebook"].map((platform) => (
          <button
            key={platform}
            onClick={() => togglePlatform(platform)}
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              cursor: "pointer",
              background: selectedPlatforms.includes(platform)
                ? "#2563eb"
                : "#fff",
              color: selectedPlatforms.includes(platform)
                ? "#fff"
                : "#2563eb",
            }}
          >
            {platform}
          </button>
        ))}
      </div>

      <button
        onClick={() =>
          alert(
            `Publishing to: ${selectedPlatforms.join(", ")}`
          )
        }
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "12px",
          background: "#00cc88",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Schedule Autopost
      </button>

      <div style={{ marginTop: "30px" }}>
        <h3>📈 Analytics & Revenue Tracking</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td>Weekly Sales</td>
              <td>$0.00</td>
            </tr>
            <tr>
              <td>Monthly Sales</td>
              <td>$0.00</td>
            </tr>
            <tr>
              <td>Platform Fees</td>
              <td>5% Base</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
