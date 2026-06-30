import React, { useState } from 'react';

export default function Incubator() {
  const [roomName, setRoomName] = useState('');
  const [collaborators, setCollaborators] = useState([{ userId: '', share: '', details: '' }]);

  const handleAddCollaborator = () => {
    setCollaborators([...collaborators, { userId: '', share: '', details: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...collaborators];
    updated[index][field] = value;
    setCollaborators(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating Incubator Room:", { roomName, collaborators });
    alert(`Room "${roomName}" created with Synergy & Revenue Share configuration!`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Collective Incubator Setup</h2>
      <p style={{ color: '#666' }}>Configure your room with a Synergy and Revenue Share agreement.</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Room Name:</label>
          <input 
            type="text" 
            value={roomName} 
            onChange={(e) => setRoomName(e.target.value)} 
            placeholder="e.g., Synergy Hub Alpha"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required 
          />
        </div>

        <h3>Collaborators & Revenue Share</h3>
        {collaborators.map((c, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
            <label style={{ display: 'block' }}>User ID:</label>
            <input 
              type="number" 
              value={c.userId} 
              onChange={(e) => handleInputChange(index, 'userId', e.target.value)}
              style={{ width: '100%', padding: '6px', marginBottom: '8px' }}
              required 
            />
            
            <label style={{ display: 'block' }}>Revenue Share %:</label>
            <input 
              type="number" 
              step="0.01"
              value={c.share} 
              onChange={(e) => handleInputChange(index, 'share', e.target.value)}
              placeholder="e.g., 50.00"
              style={{ width: '100%', padding: '6px', marginBottom: '8px' }}
              required 
            />

            <label style={{ display: 'block' }}>Labor Contribution Details:</label>
            <textarea 
              value={c.details} 
              onChange={(e) => handleInputChange(index, 'details', e.target.value)}
              placeholder="Describe tasks/responsibilities..."
              style={{ width: '100%', padding: '6px' }}
            />
          </div>
        ))}

        <button type="button" onClick={handleAddCollaborator} style={{ padding: '8px 12px', marginRight: '10px', cursor: 'pointer' }}>
          + Add Collaborator
        </button>
        
        <button type="submit" style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Create Room Agreement
        </button>
      </form>
    </div>
  );
}
