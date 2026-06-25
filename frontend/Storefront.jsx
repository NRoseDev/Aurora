// This file builds the "Better-than-Beacons" link-in-bio storefront landing page

import React, { useState } from 'react';

export default function Storefront() {
  // Mock data representing the creator's profile and active products
  const creatorProfile = {
    name: "Healing Community Hub",
    bio: "Empowering non-profits and creators to heal the world.",
    avatar: "https://placeholder.com"
  };

  const [products] = useState([
    { id: 1, name: "Classic Unification T-Shirt", price: "$29.99", image: "https://placeholder.com" },
    { id: 2, name: "Daily Alignment Coffee Mug", price: "$18.50", image: "https://placeholder.com" },
    { id: 3, name: "Arcturian Energy Phone Case", price: "$22.00", image: "https://placeholder.com" }
  ]);

  const handlePurchase = (productName) => {
    alert(`Redirecting to secure Stripe checkout for: ${productName}`);
  };

  return (
    <div style={{ padding: '25px', fontFamily: 'Arial, sans-serif', maxWidth: '480px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh', borderRadius: '15px' }}>
      
      {/* 1. Creator Header / Bio Area */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img 
          src={creatorProfile.avatar} 
          alt="Avatar" 
          style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', border: '3px solid #00cc88' }} 
        />
        <h2 style={{ margin: '5px 0' }}>{creatorProfile.name}</h2>
        <p style={{ color: '#555', fontSize: '14px', margin: '0' }}>{creatorProfile.bio}</p>
      </div>

      {/* 2. Embedded Dynamic Product Grid */}
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px' }}>Official Shop</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {products.map((product) => (
          <div 
            key={product.id} 
            style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}
          >
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '120px', objectFit: 'contain', marginBottom: '10px', borderRadius: '5px' }} />
            <h4 style={{ fontSize: '13px', margin: '0 0 5px 0', height: '36px', overflow: 'hidden' }}>{product.name}</h4>
            <p style={{ fontWeight: 'bold', color: '#00cc88', margin: '0 0 10px 0', fontSize: '14px' }}>{product.price}</p>
            <button 
              onClick={() => handlePurchase(product.name)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* 3. Social & Important Resource Links */}
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px', marginTop: '30px' }}>Resources</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a href="#community" style={{ display: 'block', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', textDecoration: 'none', color: '#333', fontWeight: 'bold', textAlign: 'center', border: '1px solid #eaeaea' }}>
          ✨ Join Our Healing Portal
        </a>
        <a href="#donation" style={{ display: 'block', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', textDecoration: 'none', color: '#333', fontWeight: 'bold', textAlign: 'center', border: '1px solid #eaeaea' }}>
          💖 Support Our Non-Profit Channels
        </a>
      </div>

    </div>
  );
}
