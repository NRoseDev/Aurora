// Sidebar component that links the separate Snap 2 Fit and Constellation sections

import React from 'react';

export default function Sidebar({ currentView, onViewChange }) {
  const menuItems = [
    { id: 'dashboard', label: '📊 Main Dashboard', category: 'core' },
    { id: 'studio', label: '🎨 Snap 2 Fit Studio', category: 'commerce' },
    { id: 'storefront', label: '🛍️ My Storefront', category: 'commerce' },
    { id: 'pricing', label: '💳 Creator Pricing Tiers', category: 'commerce' },
    { id: 'constellation', label: '🌌 Constellation Hub', category: 'incubator' },
    { id: 'incubator', label: '🌱 Collective Incubator', category: 'incubator' }
  ];

  return (
    <div style={{ width: '260px', backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh', padding: '25px 15px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Brand Header */}
      <div style={{ marginBottom: '35px', paddingLeft: '10px' }}>
        <h1 style={{ fontSize: '22px', margin: 0, fontWeight: 'bold', letterSpacing: '0.5px' }}>
          Aurora<span style={{ color: '#3b82f6' }}>.</span>
        </h1>
        <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '1px' }}>All-In-One Ecosystem</p>
      </div>

      {/* Navigation Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', flexGrow: 1 }}>
        
        {/* Commerce Branch */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', margin: '0 0 10px 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Product & Selling</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.filter(item => item.category === 'core' || item.category === 'commerce').map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 15px', borderRadius: '8px', border: 'none', backgroundColor: isActive ? '#1e293b' : 'transparent', color: isActive ? '#3b82f6' : '#94a3b8', fontSize: '14px', fontWeight: isActive ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Incubation Branch */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', margin: '0 0 10px 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Idea Incubator</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.filter(item => item.category === 'incubator').map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 15px', borderRadius: '8px', border: 'none', backgroundColor: isActive ? '#1e293b' : 'transparent', color: isActive ? '#3b82f6' : '#94a3b8', fontSize: '14px', fontWeight: isActive ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* User Footer Context */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '15px', paddingLeft: '10px' }}>
        <p style={{ fontSize: '12px', margin: 0, color: '#94a3b8', fontWeight: 'bold' }}>Nichole's Workspace</p>
        <p style={{ fontSize: '11px', margin: '2px 0 0 0', color: '#64748b' }}>Advanced Tier Active</p>
      </div>
    </div>
  );
}
