// This file builds the "Better-than-Beacons" link-in-bio storefront landing page
import React, { useState, useEffect } from 'react'; 

export default function Storefront() { 
  // Mock data representing the creator's profile and active products 
  const creatorProfile = { 
    name: "Healing Community Hub", 
    bio: "Empowering non-profits and creators to heal the world.", 
    avatar: "https://placeholder.com" 
  }; 

  const [products] = useState([ 
    { id: 1, name: "Classic Unification T-Shirt", price: "$29.99", image: "https://placeholder.com", type: "apparel" }, 
    { id: 2, name: "Daily Alignment Coffee Mug", price: "$18.50", image: "https://placeholder.com", type: "accessory" }, 
    { id: 3, name: "Arcturian Energy Phone Case", price: "$22.00", image: "https://placeholder.com", type: "accessory" } 
  ]); 

  // =========================================================================
  // UNIVERSAL ACCESSIBILITY STATES & PREFERENCES
  // =========================================================================
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);
  const [inputMode, setInputMode] = useState('type'); // type, speak, asl, external
  const [textToSpeech, setTextToSpeech] = useState(false);

  // Hardcoded Size Protocol Metrics for apparel items
  const [selectedSizes, setSelectedSizes] = useState({});

  // Hardware listener for physical external switch/assistive devices
  useEffect(() => {
    const handleHardwareDeviceInput = (e) => {
      if (inputMode === 'external') {
        console.log(`Storefront hardware key logged: ${e.keyCode}`);
      }
    };
    window.addEventListener('keydown', handleHardwareDeviceInput);
    return () => window.removeEventListener('keydown', handleHardwareDeviceInput);
  }, [inputMode]);

  const globalFontStyle = isDyslexiaFont ? 'OpenDyslexic, sans-serif' : 'Arial, sans-serif';

  const handleSizeChange = (productId, size) => {
    setSelectedSizes({ ...selectedSizes, [productId]: size });
  };

  const handlePurchase = (product) => { 
    const sizeInfo = product.type === 'apparel' ? ` (Size: ${selectedSizes[product.id] || 'Not Selected'})` : '';
    alert(`Redirecting to secure Stripe checkout for: ${product.name}${sizeInfo}`); 
  }; 

  return ( 
    <div style={{ padding: '25px', fontFamily: globalFontStyle, maxWidth: '480px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh', borderRadius: '15px' }}> 
      
      {/* UNIVERSAL ACCESSIBILITY NAVIGATION OVERLAY */}
      <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eaeaea', fontSize: '13px' }}>
        <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>♿ Accessibility Tools</span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label><input type="checkbox" checked={isDyslexiaFont} onChange={(e) => setIsDyslexiaFont(e.target.checked)} /> Dyslexia Font</label>
          <label><input type="checkbox" checked={textToSpeech} onChange={(e) => setTextToSpeech(e.target.checked)} /> Audio Reader</label>
          <select value={inputMode} onChange={(e) => setInputMode(e.target.value)} style={{ fontSize: '12px', fontFamily: globalFontStyle }}>
            <option value="type">Mode: Typing</option>
            <option value="speak">Mode: Speaking</option>
            <option value="asl">Mode: ASL Track</option>
            <option value="external">Mode: Switch Dev</option>
          </select>
        </div>
      </div>

      {/* 1. Creator Header / Bio Area */} 
      <div style={{ textAlign: 'center', marginBottom: '30px' }}> 
        <img src={creatorProfile.avatar} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', border: '3px solid #00cc88' }} /> 
        <h2 style={{ margin: '5px 0' }}>{creatorProfile.name}</h2> 
        <p style={{ color: '#555', fontSize: '14px', margin: '0' }}>{creatorProfile.bio}</p> 
      </div> 

      {/* 2. Embedded Dynamic Product Grid */} 
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px' }}>Official Shop</h3> 
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}> 
        {products.map((product) => ( 
          <div key={product.id} style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} > 
            <div>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '120px', objectFit: 'contain', marginBottom: '10px', borderRadius: '5px' }} /> 
              <h4 style={{ fontSize: '13px', margin: '0 0 5px 0', height: '36px', overflow: 'hidden' }}>{product.name}</h4> 
              <p style={{ fontWeight: 'bold', color: '#00cc88', margin: '0 0 10px 0', fontSize: '14px' }}>{product.price}</p> 
              
              {/* EMBEDDED SIZE PROTOCOL CONNECTION */}
              {product.type === 'apparel' && (
                <div style={{ marginBottom: '10px' }}>
                  <select 
                    value={selectedSizes[product.id] || ''} 
                    onChange={(e) => handleSizeChange(product.id, e.target.value)}
                    style={{ width: '100%', padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: globalFontStyle }}
                  >
                    <option value="">Select Size...</option>
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                  </select>
                </div>
              )}
            </div>

            <button onClick={() => handlePurchase(product)} style={{ width: '100%', padding: '8px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', fontFamily: globalFontStyle }} > 
              Buy Now 
            </button> 
          </div> 
        ))} 
      </div> 

      {/* 3. Social & Important Resource Links */} 
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px', marginTop: '30px' }}>Resources</h3> 
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}> 
        <a href="#community" style={{ display: 'block', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', textDecoration: 'none', color: '#333', fontWeight: 'bold', textAlign: 'center', border: '1px solid #eaeaea' }}> ✨ Join Our Healing Portal </a> 
        <a href="#donation" style={{ display: 'block', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', textDecoration: 'none', color: '#333', fontWeight: 'bold', textAlign: 'center', border: '1px solid #eaeaea' }}> 💖 Support Our Non-Profit Channels </a> 
      </div> 
    </div> 
  ); 
}
