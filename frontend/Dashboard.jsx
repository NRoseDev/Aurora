// This file builds the visual control dashboard where you can see your scheduled posts
import React, { useState, useEffect } from 'react'; 
import CreatorWorkspace from './CreatorWorkspace'; 

export default function Dashboard() { 
  const [caption, setCaption] = useState(''); 
  const [selectedPlatforms, setSelectedPlatforms] = useState([]); 
  
  // =========================================================================
  // UNIVERSAL ACCESSIBILITY STATES & PREFERENCES
  // =========================================================================
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);
  const [inputMode, setInputMode] = useState('type'); // type, speak, asl, external
  const [textToSpeech, setTextToSpeech] = useState(false);

  // Simulated hardware hook for external switch/assistive devices
  useEffect(() => {
    const handleExternalDeviceInput = (e) => {
      if (inputMode === 'external') {
        console.log(`Assistive device mapped keycode detected: ${e.keyCode}`);
        // Handle custom hardware navigation logic here
      }
    };
    window.addEventListener('keydown', handleExternalDeviceInput);
    return () => window.removeEventListener('keydown', handleExternalDeviceInput);
  }, [inputMode]);

  // Dynamic typography style based on accessibility preferences
  const globalFontStyle = isDyslexiaFont ? 'OpenDyslexic, sans-serif' : 'Arial, sans-serif';

  const togglePlatform = (platform) => { 
    if (selectedPlatforms.includes(platform)) { 
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform)); 
    } else { 
      setSelectedPlatforms([...selectedPlatforms, platform]); 
    } 
  }; 

  return ( 
    <div style={{ padding: '20px', fontFamily: globalFontStyle, maxWidth: '800px', margin: '0 auto' }}> 
      
      {/* GLOBAL ACCESSIBILITY CONTROL PANEL */}
      <div style={{ padding: '15px', backgroundColor: '#f5f5f7', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #0070f3' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>♿ Universal Accessibility Controls</h4>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '14px' }}>
          <label>
            <input type="checkbox" checked={isDyslexiaFont} onChange={(e) => setIsDyslexiaFont(e.target.checked)} />
            Dyslexia Font
          </label>
          <label>
            <input type="checkbox" checked={textToSpeech} onChange={(e) => setTextToSpeech(e.target.checked)} />
            Screen Reader (TTS)
          </label>
          <label>
            Input Mode: 
            <select value={inputMode} onChange={(e) => setInputMode(e.target.value)} style={{ marginLeft: '5px' }}>
              <option value="type">Keyboard/Type</option>
              <option value="speak">Voice/Speak-to-Text</option>
              <option value="asl">ASL Camera Tracking</option>
              <option value="external">External Switch Device</option>
            </select>
          </label>
        </div>
      </div>

      <h2>Aurora Creator Engine</h2> 
      <p style={{ color: '#666' }}>Upload once. Post everywhere automatically.</p> 

      {/* 1. Content Input Area */} 
      <div style={{ marginBottom: '20px' }}> 
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
          Your Video Caption {inputMode === 'speak' && '🎙️ (Listening...)'} {inputMode === 'asl' && '📷 (Tracking ASL...)'}
        </label> 
        <textarea 
          placeholder={inputMode === 'type' ? "Write what you want your post to say here..." : `System ready for ${inputMode} stream data...`}
          value={caption} 
          onChange={(e) => setCaption(e.target.value)} 
          style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontFamily: globalFontStyle }} 
        /> 
      </div> 

      {/* 2. Platform Selection Toggles */} 
      <div style={{ marginBottom: '20px' }}> 
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Select Channels to Publish To</label> 
        <div style={{ display: 'flex', gap: '10px' }}> 
          {['TikTok', 'Instagram', 'Facebook'].map((platform) => { 
            const isSelected = selectedPlatforms.includes(platform); 
            return ( 
              <button 
                key={platform} 
                onClick={() => togglePlatform(platform)} 
                style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid #0070f3', backgroundColor: isSelected ? '#0070f3' : '#fff', color: isSelected ? '#fff' : '#0070f3', cursor: 'pointer', fontFamily: globalFontStyle }} 
              > 
                {platform} 
              </button> 
            ); 
          })} 
        </div> 
      </div> 

      {/* 3. Action Button */} 
      <div style={{ marginBottom: '30px' }}> 
        <button 
          onClick={() => alert(`Aurora is processing your post for: ${selectedPlatforms.join(', ')}`)} 
          style={{ width: '100%', padding: '12px', backgroundColor: '#00cc88', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontFamily: globalFontStyle }} 
        > 
          Schedule Autopost 
        </button> 
      </div> 

      {/* =========================================================================
          ADVANCED AUTOMATED ACCOUNTING SPREADSHEET LEDGER
         ========================================================================= */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '20px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '5px' }}>📈 Interactive Accounting Ledger</h3>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '0' }}>Real-time breakdowns of sales metrics, localized taxes, and tiered fees.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f7', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '10px' }}>Period</th>
                <th style={{ padding: '10px' }}>Gross Sales</th>
                <th style={{ padding: '10px' }}>COGS</th>
                <th style={{ padding: '10px' }}>Platform Fee</th>
                <th style={{ padding: '10px' }}>Est. Sales Tax</th>
                <th style={{ padding: '10px' }}>Net Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>Weekly</td>
                <td style={{ padding: '10px' }}>$0.00</td>
                <td style={{ padding: '10px' }}>$0.00</td>
                <td style={{ padding: '10px', color: '#0070f3' }}>5% Base</td>
                <td style={{ padding: '10px' }}>$0.00</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: '#00cc88' }}>$0.00</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>Monthly</td>
                <td style={{ padding: '10px' }}>$0.00</td>
                <td style={{ padding: '10px' }}>$0.00</td>
                <td style={{ padding: '10px', color: '#0070f3' }}>5% Base</td>
                <td style={{ padding: '10px' }}>$0.00</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: '#00cc88' }}>$0.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. New Translation & Translation Framework */} 
      <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}> 
        <CreatorWorkspace /> 
      </div> 
    </div> 
  ); 
};
