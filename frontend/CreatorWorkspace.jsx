import React, { useState } from 'react';

export default function CreatorWorkspace() {
  const [credits, setCredits] = useState(1100); // Rule 1: 1,100 Baseline Credits
  const [isDebugging, setIsDebugging] = useState(false); // Rule 2: Zero-penalty tracking
  const [languages, setLanguages] = useState([]);

  const handleLanguageToggle = (lang) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Header Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Aurora Creator Workspace</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>Authentic Creator Tools & Media Translation</p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 16px', borderRadius: '8px', textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', color: '#16a34a' }}>{credits} Credits Available</div>
          <small style={{ color: '#666' }}>Baseline Subscription Tier</small>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <div style={{ marginTop: '24px', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '40px', textAlign: 'center', background: '#f8fafc' }}>
        <p style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 8px 0' }}>Drag and drop your video or audio assets here</p>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Supports MP4, MOV, and MP3 files</p>
      </div>

      {/* Language Selector Pipeline */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Select Target Languages (Artlist-Style AI Dubbing):</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['Spanish', 'French', 'German', 'Japanese', 'Mandarin'].map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageToggle(lang)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                background: languages.includes(lang) ? '#2563eb' : '#fff',
                color: languages.includes(lang) ? '#fff' : '#000',
                transition: 'all 0.2s'
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Rule 2 Debugging Toggle Demonstration */}
      <div style={{ marginTop: '32px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#b45309' }}>Smart Refund Engine Terminal Sim</h4>
        <p style={{ fontSize: '14px', margin: '0 0 12px 0', color: '#78350f' }}>
          Simulate a broken code file or runtime compilation error to verify zero-penalty loops.
        </p>
        <button
          onClick={() => {
            setIsDebugging(!isDebugging);
            if (!isDebugging) {
              alert("Error detected! Zero-Penalty mode is now ACTIVE. Consecutive fixes cost 0 credits.");
            }
          }}
          style={{
            padding: '8px 12px',
            background: isDebugging ? '#dc2626' : '#d97706',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {isDebugging ? 'Disable Debug Mode (Stabilized)' : 'Trigger Code Execution Error Flag'}
        </button>
      </div>
    </div>
  );
}
