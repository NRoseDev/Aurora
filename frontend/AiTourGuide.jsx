import React, { useState } from 'react';

export default function AiTourGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

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

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#111827',
      border: '1px solid #374151',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      maxWidth: '360px',
      zIndex: 9999,
      fontFamily: 'sans-serif',
      color: '#f3f4f6'
    }}>
      {/* Header with Constellation Star Tracker SVG */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <h4 style={{ margin: 0, color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
            {tourSteps[currentStep].title}
          </h4>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#9ca3af' }}>✕</button>
      </div>
      
      <p style={{ fontSize: '14px', color: '#d1d5db', lineHeight: '1.6', margin: '0 0 20px 0' }}>
        {tourSteps[currentStep].text}
      </p>

      {/* Control Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #374151', paddingTop: '14px' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          Step {currentStep + 1} of {tourSteps.length}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {currentStep > 0 && (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff', cursor: 'pointer', fontSize: '13px' }}
            >
              Back
            </button>
          )}
          {currentStep < tourSteps.length - 1 ? (
            <button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Next
            </button>
          ) : (
            <button 
              onClick={() => setIsOpen(false)}
              style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#60a5fa', color: '#111827', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Finish Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
