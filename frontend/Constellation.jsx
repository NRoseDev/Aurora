// Constellation Navigation Dashboard featuring the 4 core collaboration zones 
import React, { useState, useEffect } from 'react'; 

export default function Constellation() { 
  const [activeZone, setActiveZone] = useState('questionnaire'); 
  const [ndaSigned, setNdaSigned] = useState(false); 

  // =========================================================================
  // UNIVERSAL ACCESSIBILITY STATES & PREFERENCES
  // =========================================================================
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);
  const [inputMode, setInputMode] = useState('type'); // type, speak, asl, external
  const [textToSpeech, setTextToSpeech] = useState(false);

  // Monitor external hardware switch device entries
  useEffect(() => {
    const handleConstellationHardwareInput = (e) => {
      if (inputMode === 'external') {
        console.log(`Constellation interface logged keycode input: ${e.keyCode}`);
      }
    };
    window.addEventListener('keydown', handleConstellationHardwareInput);
    return () => window.removeEventListener('keydown', handleConstellationHardwareInput);
  }, [inputMode]);

  const globalFontStyle = isDyslexiaFont ? 'OpenDyslexic, sans-serif' : 'Arial, sans-serif';

  const renderZoneContent = () => { 
    switch(activeZone) { 
      case 'questionnaire': 
        return ( 
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}> 
            <h3>AI Questionnaire Gateway {inputMode === 'speak' && '🎙️'} {inputMode === 'asl' && '📷'}</h3> 
            <p>Process your concept to formulate foundational legal documents and active NDA protection.</p> 
            <button 
              onClick={() => { 
                setNdaSigned(true); 
                alert("NDA Generated and Signed via AI Vault Integration."); 
              }} 
              style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontFamily: globalFontStyle }} 
            > 
              Run AI Questionnaire & Sign NDA 
            </button> 
          </div> 
        ); 
      case 'vault': 
        return ( 
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}> 
            <h3>🔒 The Vault</h3> 
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: globalFontStyle, backgroundColor: '#f1f5f9' }}> 
      
      {/* Constellation Sidebar Links */} 
      <div style={{ width: '240px', background: '#0f172a', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}> 
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#3b82f6' }}>🌌 Constellation</h2> 
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}> 
            <li><button onClick={() => setActiveZone('questionnaire')} style={{ background: 'none', border: 'none', color: activeZone === 'questionnaire' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px', fontFamily: globalFontStyle }}>AI Questionnaire</button></li> 
            <li><button onClick={() => setActiveZone('vault')} style={{ background: 'none', border: 'none', color: activeZone === 'vault' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px', fontFamily: globalFontStyle }}>The Vault</button></li> 
            <li><button onClick={() => setActiveZone('overflow')} style={{ background: 'none', border: 'none', color: activeZone === 'overflow' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px', fontFamily: globalFontStyle }}>Overflow</button></li> 
            <li><button onClick={() => setActiveZone('shelf')} style={{ background: 'none', border: 'none', color: activeZone === 'shelf' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px', fontFamily: globalFontStyle }}>IdeaShelf</button></li> 
            <li><button onClick={() => setActiveZone('bin')} style={{ background: 'none', border: 'none', color: activeZone === 'bin' ? '#3b82f6' : '#fff', cursor: 'pointer', fontSize: '16px', fontFamily: globalFontStyle }}>IdeaBin</button></li> 
          </ul> 
        </div>

        {/* INTEGRATED SIDEBAR ACCESSIBILITY SYSTEM OVERLAYS */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '15px', fontSize: '12px', color: '#94a3b8' }}>
          <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#fff' }}>♿ Accessibility</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label><input type="checkbox" checked={isDyslexiaFont} onChange={(e) => setIsDyslexiaFont(e.target.checked)} /> Dyslexia Font</label>
            <label><input type="checkbox" checked={textToSpeech} onChange={(e) => setTextToSpeech(e.target.checked)} /> Screen Audio</label>
            <select value={inputMode} onChange={(e) => setInputMode(e.target.value)} style={{ width: '100%', fontSize: '11px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px', fontFamily: globalFontStyle }}>
              <option value="type">Type Control</option>
              <option value="speak">Voice Command</option>
              <option value="asl">ASL Tracking</option>
              <option value="external">Switch Hardware</option>
            </select>
          </div>
        </div>
      </div> 

      {/* Main Workspace Display Content */} 
      <div style={{ flex: 1, padding: '40px' }}> 
        {renderZoneContent()} 
      </div> 
    </div> 
  ); 
}
