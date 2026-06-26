// Screen for choosing and upgrading Aurora subscription packages (Basic to Enterprise)

import React, { useState } from 'react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const tiers = [
    {
      name: 'Basic',
      price: '$19',
      features: ['20 Snap 2 Fit Product Generations', 'Standard Mockup Engine', 'Multi-Channel Social Queue'],
      color: '#475569'
    },
    {
      name: 'Advanced',
      price: '$49',
      features: ['100 Snap 2 Fit Product Generations', 'Advanced AI Image Upscaling', 'Better-Than-Beacons Custom Storefront', 'Full Constellation Zone Access'],
      color: '#3b82f6',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      features: ['Unlimited Snap 2 Fit Creations', 'Full Bulk Batch Processing', 'Custom Storefront Domain', 'Priority Constellation Matching'],
      color: '#1e1b4b'
    }
  ];

  const handleUpgrade = (tierName, method) => {
    alert(`Connecting to ${method} gateway hub to activate Aurora ${tierName} package...`);
  };

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Upgrade Your Aurora Creator Level</h2>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Unlock more automated Snap 2 Fit volume and deep Constellation access.</p>

      {/* Billing Cycle Toggle */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={() => setBillingCycle('monthly')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #3b82f6', backgroundColor: billingCycle === 'monthly' ? '#3b82f6' : '#fff', color: billingCycle === 'monthly' ? '#fff' : '#3b82f6', cursor: 'pointer' }}>Monthly</button>
        <button onClick={() => setBillingCycle('annually')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #3b82f6', backgroundColor: billingCycle === 'annually' ? '#3b82f6' : '#fff', color: billingCycle === 'annually' ? '#fff' : '#3b82f6', cursor: 'pointer' }}>Annually (Save 20%)</button>
      </div>

      {/* Pricing Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{ backgroundColor: '#fff', border: tier.popular ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '15px', padding: '30px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            {tier.popular && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>MOST POPULAR</span>}
            
            <h3 style={{ margin: '0 0 10px 0', color: tier.color }}>{tier.name}</h3>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '20px' }}>{tier.price}<span style={{ fontSize: '16px', color: '#64748b' }}>/mo</span></div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', textAlign: 'left', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
              {tier.features.map((feat, idx) => (
                <li key={idx}>✅ {feat}</li>
              ))}
            </ul>

            {/* Payment Method Selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => handleUpgrade(tier.name, 'Stripe/Cards')} style={{ width: '100%', padding: '10px', backgroundColor: tier.color, color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Pay with Card / Pay</button>
              <button onClick={() => handleUpgrade(tier.name, 'PayPal')} style={{ width: '100%', padding: '10px', backgroundColor: '#ffc439', color: '#003087', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>PayPal Checkout</button>
              <button onClick={() => handleUpgrade(tier.name, 'Klarna')} style={{ width: '100%', padding: '10px', backgroundColor: '#ffb3c7', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Slice with Klarna</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
