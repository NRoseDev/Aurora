import React, { useState } from 'react';

export default function AiTourGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const tourSteps = [
    {
      title: "Welcome to Aurora 🚀🌌",
      text: "Aurora is split into two primary worlds built completely around protecting you: 'Snap 2 Fit' for high-volume product commerce, and 'Constellation' for legally secure project incubation."
    },
    {
      title: "Snap 2 Fit (Image Optimization Engine) 🎨",
      text: "Our AI Smart Automation engine automatically pixelates, sharpens, upscales, and resizes your designs onto multiple store products (shirts, mugs, phone cases) simultaneously—eliminating hours of manual entry."
    },
    {
      title: "Hands-Free Dropshipping Profit 💰",
      text: "When an order drops on your fast link-in-bio storefront, our fulfillment engine separates manufacturing costs for suppliers and routes remaining product profits instantly straight into your wallet."
    },
    {
      title: "Constellation (Idea Incubator Safety) 🔒",
      text: "Before pitching concepts to partners, our platform enforces automated, platform-wide Non-Disclosure Agreements (NDAs). Your ideas live in 'The Vault' under immediate, digital timestamp watermarking."
    },
    {
      title: "The Idea Tracker Framework 📁",
      text: "Never experience creator block. 'IdeaShelf' cleanly archives and pauses project tracks using inline LLMs, while 'IdeaBin' isolates discarded concepts so they never break your core system dependencies."
    }
  ];

  return (
    <>
      {/* Custom Floating Tour Button — Fully Branded to your Aurora Half-Infinity Logo */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#0D1117', // Match the #0D1117 black slate from the palette
          border: '2px solid #3BAEFF', // Branded electric blue border
          boxShadow: '0 0 20px rgba(59, 174, 255, 0.6), inset 0 0 10px rgba(30, 58, 89, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Take Platform Tour"
      >
        {/* Custom SVG Drawing the Half-Infinity Flow and the central blue light ray */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Central Blue Light Ray */}
          <line x1="12" y1="2" x2="12" y2="22" stroke="#3BAEFF" strokeWidth="2.5" strokeDasharray="1 1" opacity="0.9" />
          {/* Half-Infinity Flowing S-Curve Curve Layer 1 (Silver) */}
          <path d="M12,2 C16,6 18,10 12,14 C6,18 8,22 12,22" stroke="#C0C0C0" strokeWidth="2" />
          {/* Half-Infinity Secondary Wave Layer 2 (Navy/Cyan blend) */}
          <path d="M12,2 C8,6 6,10 12,14 C18,18 16,22 12,22" stroke="#1E3A59" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          backgroundColor: '#0D1117',
          border: '1px solid #1E3A59',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 174, 255, 0.2)',
          maxWidth: '360px',
          zIndex: 9999,
          fontFamily: 'sans-serif',
          color: '#f3f4f6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: '#ffffff', fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              {tourSteps[currentStep].title}
            </h4>
            <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#80868B', marginLeft: 'auto' }}>✕</button>
          </div>
          
          <p style={{ fontSize: '14px', color: '#d1d5db', lineHeight: '1.6', margin: '0 0 20px 0' }}>
            {tourSteps[currentStep].text}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1E3A59', paddingTop: '14px' }}>
            <span style={{ fontSize: '12px', color: '#80868B' }}>
              Step {currentStep + 1} of {tourSteps.length}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentStep > 0 && (
                <button 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #1E3A59', background: '#121824', color: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  Back
                </button>
              )}
              {currentStep < tourSteps.length - 1 ? (
                <button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#3BAEFF', color: '#0D1117', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={() => setIsOpen(false)}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#C0C0C0', color: '#0D1117', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
