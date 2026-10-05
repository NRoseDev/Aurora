// src/components/Navigation.tsx
import React from 'react';

interface NavigationProps {
  activeTab: 'dashboard' | 'orders' | 'analytics' | 'scrapbook' | 'snap2fit';
  setActiveTab: (tab: 'dashboard' | 'orders' | 'analytics' | 'scrapbook' | 'snap2fit') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-slate-800 mb-6">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'dashboard'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        Products & Inventory
      </button>
      <button
        onClick={() => setActiveTab('orders')}
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'orders'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        Sales & Orders
      </button>
      <button
        onClick={() => setActiveTab('analytics')}
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'analytics'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        Analytics
      </button>
      <button
        onClick={() => setActiveTab('scrapbook')}
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'scrapbook'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        Scrapbook
      </button>
      <button
        onClick={() => setActiveTab('snap2fit')}
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'snap2fit'
            ? 'border-emerald-500 text-emerald-400'
            : 'border-transparent text-slate-400 hover:text-slate-200'
        }`}
      >
        Snap 2 Fit
      </button>
    </div>
  );
};
