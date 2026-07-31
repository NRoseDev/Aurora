// src/components/StoreDashboard.tsx
import React from 'react';
import { useStoreAggregator } from '../hooks/useStoreAggregator';

interface StoreDashboardProps {
  shopifyConfig?: { shopDomain: string; accessToken: string };
  bigCartelConfig?: { accountId: string; accessToken: string };
}

export const StoreDashboard: React.FC<StoreDashboardProps> = ({
  shopifyConfig,
  bigCartelConfig,
}) => {
  const { products, loading, error } = useStoreAggregator({
    shopify: shopifyConfig,
    bigCartel: bigCartelConfig,
  });

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen rounded-xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unified Store Command</h2>
          <p className="text-sm text-slate-400">Live multi-platform product and inventory pipeline</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
            {products.length} Products Synced
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20 text-slate-400">
          Syncing connected storefronts...
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No stores connected. Provide API credentials to initialize data flow.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-4 flex flex-col justify-between hover:border-slate-600 transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {product.platform}
                </span>
                <span className="text-xs text-slate-400 font-mono">{product.status}</span>
              </div>
              <h3 className="font-medium text-slate-200 line-clamp-2 mb-2">{product.title}</h3>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700/40">
              <span className="text-lg font-bold text-emerald-400">${product.price}</span>
              {product.inventory !== undefined && (
                <span className="text-xs text-slate-400">Stock: {product.inventory}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
