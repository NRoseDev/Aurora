// This file builds the visual control dashboard where you can see your scheduled posts

import React, { useState } from 'react';
import CreatorWorkspace from './CreatorWorkspace';

export default function Dashboard() {
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const togglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Aurora Creator Engine</h2>
      <p style={{ color: '#666' }}>Upload once. Post everywhere automatically.</p>
      
      {/* 1. Content Input Area */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Your Video Caption</label>
        <textarea 
          placeholder="Write what you want your post to say here..." 
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
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
                style={{
                  padding: '10px 15px',
                  borderRadius: '20px',
                  border: '1px solid #0070f3',
                  backgroundColor: isSelected ? '#0070f3' : '#fff',
                  color: isSelected ? '#fff' : '#0070f3',
                  cursor: 'pointer'
                }}
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
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#00cc88',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Schedule Autopost
        </button>
      </div>

      {/* 4. New Translation & Translation Framework */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <CreatorWorkspace />
      </div>
    </div>
  );
};
