// app/page.tsx
'use client';

import React, { useState } from 'react';
import { StoreDashboard } from '@/components/StoreDashboard';
import { OrdersTab } from '@/components/OrdersTab';
import { AnalyticsTab } from '@/components/AnalyticsTab';
import { Navigation } from '@/components/Navigation';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'analytics'>('dashboard');

  const shopifyConfig = {
    shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || '',
    accessToken: process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN || '',
  };

  const wooConfig = {
    siteUrl: process.env.NEXT_PUBLIC_WOO_SITE_URL || '',
    consumerKey: process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY || '',
    consumerSecret: process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET || '',
  };

  const bigCartelConfig = {
    accountId: process.env.NEXT_PUBLIC_BIG_CARTEL_ACCOUNT_ID || '',
    accessToken: process.env.NEXT_PUBLIC_BIG_CARTEL_ACCESS_TOKEN || '',
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Aurora Unified Command</h1>
          <p className="text-sm text-slate-400">Multi-platform commerce management system</p>
        </header>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main>
          {activeTab === 'dashboard' && (
            <StoreDashboard
              shopifyConfig={shopifyConfig}
              wooConfig={wooConfig}
              bigCartelConfig={bigCartelConfig}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              shopifyConfig={shopifyConfig}
              wooConfig={wooConfig}
              bigCartelConfig={bigCartelConfig}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              shopifyConfig={shopifyConfig}
              wooConfig={wooConfig}
              bigCartelConfig={bigCartelConfig}
            />
          )}
        </main>
      </div>
    </div>
  );
}
