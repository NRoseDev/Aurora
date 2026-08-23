// Screen for choosing and upgrading Aurora subscription packages

import React, { useState } from 'react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const tiers = [
    {
      name: 'Aurora Free',
      price: '$0',
      period: '33 days',
      description: 'Explore Aurora and discover what you can create.',
      features: [
        '33-day free access',
        'Daily creation allowance',
        'Return unused creation capacity when creations are rejected',
        'Explore Aurora creator tools'
      ],
      color: '#64748b'
    },
    {
      name: 'Creator',
      price: '$3.33',
      period: '/mo',
      description: 'Start creating with Aurora.',
      features: [
        'Daily creation allowance',
        'Creator tools',
        'Core Aurora features',
        'Rejected creations return to your daily pool'
      ],
      color: '#475569'
    },
    {
      name: 'Collab',
      price: '$5.55',
      period: '/mo',
      description: 'Start connecting and collaborating.',
      features: [
        'Everything in Creator',
        'Collaboration access',
        'Connect with other creators',
        'Daily creation allowance'
      ],
      color: '#8b5cf6',
      popular: true
    },
    {
      name: 'Creator Plus',
      price: '$9.99',
      period: '/mo',
      description: 'More room to create.',
      features: [
        'Everything in Collab',
        'Expanded daily creation allowance',
        'Expanded creator tools',
        'Collaboration features'
      ],
      color: '#6366f1'
    },
    {
      name: 'Connected',
      price: '$14.99',
      period: '/mo',
      description: 'Connect to the other side of Aurora.',
      features: [
        'Access to both Aurora sides',
        'Connection to the other platform',
        'Daily creation allowance',
        'Usage limits apply'
      ],
      color: '#3b82f6'
    },
    {
      name: 'Creator Pro',
      price: '$19.99',
      period: '/mo',
      description: 'More freedom with fewer limits.',
      features: [
        'Expanded access to both sides',
        'Higher daily creation allowance',
        'Fewer usage limits',
        'Advanced creator tools',
        'Collaboration access'
      ],
      color: '#2563eb'
    },
    {
      name: 'Aurora Complete',
      price: '$24.99',
      period: '/mo',
      description: 'Both sides of Aurora with no standard usage limits.',
      features: [
        'Full access to both Aurora sides',
        'No standard usage limits',
        'Expanded creator tools',
        'Full collaboration access',
        'Daily creation system with returned capacity'
      ],
      color: '#1e1b4b'
    },
    {
      name: 'Aurora Inner Circle',
      price: '$33',
      period: '/mo',
      description: 'Everything in Aurora — plus help shape what comes next.',
      features: [
        'Everything in Aurora Complete',
        'Full Aurora ecosystem access',
        'Founding Creator community',
        'Connect and collaborate with creators worldwide',
        'Help shape future Aurora features',
        'Submit and vote on platform ideas',
        'Early access to new libraries and updates',
        'Member bonuses and opportunities',
        'Exclusive Inner Circle experiences'
      ],
      color: '#7c3aed'
    }
  ];

  const handleUpgrade = (tierName, method) => {
    alert(
      `Connecting to ${method} gateway hub to activate Aurora ${tierName} package...`
    );
  };

  return (
    <div
      style={{
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}
    >
      <h2>Choose Your Aurora Creator Level</h2>

      <p style={{ color: '#64748b', marginBottom: '10px' }}>
        Create. Connect. Collaborate. Build what comes next.
      </p>

      <p
        style={{
          color: '#7c3aed',
          marginBottom: '30px',
          fontWeight: 'bold'
        }}
      >
        Start with 33 days free.
      </p>

      {/* Billing Cycle Toggle */}
      <div
        style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        <button
          onClick={() => setBillingCycle('monthly')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #3b82f6',
            backgroundColor:
              billingCycle === 'monthly' ? '#3b82f6' : '#fff',
            color: billingCycle === 'monthly' ? '#fff' : '#3b82f6',
            cursor: 'pointer'
          }}
        >
          Monthly
        </button>

        <button
          onClick={() => setBillingCycle('annually')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #3b82f6',
            backgroundColor:
              billingCycle === 'annually' ? '#3b82f6' : '#fff',
            color: billingCycle === 'annually' ? '#fff' : '#3b82f6',
            cursor: 'pointer'
          }}
        >
          Annually
        </button>
      </div>

      {/* Pricing Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}
      >
        {tiers.map((tier) => (
          <div
            key={tier.name}
            style={{
              backgroundColor: '#fff',
              border: tier.popular
                ? '2px solid #8b5cf6'
                : '1px solid #e2e8f0',
              borderRadius: '15px',
              padding: '30px',
              position: 'relative',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {tier.popular && (
              <span
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#8b5cf6',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                START COLLABORATING
              </span>
            )}

            <h3
              style={{
                margin: '0 0 10px 0',
                color: tier.color
              }}
            >
              {tier.name}
            </h3>

            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}
            >
              {tier.price}
              <span
                style={{
                  fontSize: '16px',
                  color: '#64748b'
                }}
              >
                {tier.period}
              </span>
            </div>

            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                minHeight: '42px'
              }}
            >
              {tier.description}
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 30px 0',
                textAlign: 'left',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '14px',
                color: '#334155'
              }}
            >
              {tier.features.map((feat, idx) => (
                <li key={idx}>✅ {feat}</li>
              ))}
            </ul>

            {/* Payment Methods */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <button
                onClick={() =>
                  handleUpgrade(tier.name, 'Stripe/Cards')
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: tier.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Pay with Card
              </button>

              <button
                onClick={() =>
                  handleUpgrade(tier.name, 'PayPal')
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#ffc439',
                  color: '#003087',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                PayPal Checkout
              </button>

              <button
                onClick={() =>
                  handleUpgrade(tier.name, 'Klarna')
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#ffb3c7',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Split with Klarna
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
