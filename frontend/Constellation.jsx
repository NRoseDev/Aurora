// Constellation Navigation Dashboard featuring the 4 core collaboration zones

import React, { useState } from 'react';

export default function Constellation() {
  const [activeZone, setActiveZone] = useState('questionnaire');
  const [ndaSigned, setNdaSigned] = useState(false);

  const renderZoneContent = () => {
    switch(activeZone) {
      case 'questionnaire':
        return (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
            <h3>AI Questionnaire Gateway</h3>
            <p>Process your concept to formulate foundational legal documents and active NDA protection.</p>
            <button 
              onClick={() => { setNdaSigned(true); alert("NDA Generated and Signed via AI Vault Integration."); }}
              style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Run AI Questionnaire & Sign NDA
            </button>
          </div>
        );
      case 'vault':
        return (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
            <h3>🔐 The Vault</h3>
            <p style={{ color: ndaSigned ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
              Status: {ndaSigned ? "ACCESS GRANTED (NDA Active)" : "LOCKED - Requires Signed NDA"}
            </p>
            <p>Secure master storage area for core intellectual property and vetted project files.</p>
          </div>
        );
      case 'overflow':
        return (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
            <h3>⚡ Overflow</h3>
            <p>Active development zone for handling ongoing tasks, tracking active code modules, and scaling concepts.</p>
          </div>
        );
      case 'shelf':
        return (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
            <h3>🗄️ IdeaShelf</h3>
            <p>Paused project tracks archived cleanly for later use. Connected directly to InvokeLLM context histories.</p>
          </div>
        );
      case 'bin':
        return (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
            <h3>🗑️ IdeaBin</h3>
            <p>Standalone data ecosystem managing discarded tracks and files separately without altering active system branches.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#f1f5f9' }}>
      
      {/* Constellation Sidebar Links */}
      <div style={{ width: '240px', background: '#0f172a', color: '#fff', padding: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#3b82f6' }}>🌌 Constellation</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li><button onClick={() => setActiveZone('questionnaire')} style={{ background: 'none', border: 'none', color: activeZone === 'questionnaire' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px' }}>AI Questionnaire</button></li>
          <li><button onClick={() => setActiveZone('vault')} style={{ background: 'none', border: 'none', color: activeZone === 'vault' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px' }}>The Vault</button></li>
          <li><button onClick={() => setActiveZone('overflow')} style={{ background: 'none', border: 'none', color: activeZone === 'overflow' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px' }}>Overflow</button></li>
          <li><button onClick={() => setActiveZone('shelf')} style={{ background: 'none', border: 'none', color: activeZone === 'shelf' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px' }}>IdeaShelf</button></li>
          <li><button onClick={() => setActiveZone('bin')} style={{ background: 'none', border: 'none', color: activeZone === 'bin' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px' }}>IdeaBin</button></li>
        </ul>
      </div>

      {/* Main Workspace Display Content */}
      <div style={{ flex: 1, padding: '40px' }}>
        {renderZoneContent()}
      </div>

    </div>
  );
}
