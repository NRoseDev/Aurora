// src/components/StoreDashboard.tsx
import React, { useState, useMemo } from 'react';
import { useStoreAggregator } from '../hooks/useStoreAggregator';

interface StoreDashboardProps {
  shopifyConfig?: { shopDomain: string; accessToken: string };
  bigCartelConfig?: { accountId: string; accessToken: string };
  etsyConfig?: { accessToken: string; shopId: string };
  pinterestConfig?: { accessToken: string };
  amazonConfig?: { clientId: string; clientSecret: string; refreshToken: string };
  tiktokConfig?: { accessToken: string; shopId: string };
  walmartConfig?: { clientId: string; clientSecret: string };
  ebayConfig?: { accessToken: string };
  wooConfig?: { siteUrl: string; consumerKey: string; consumerSecret: string };
}

export const StoreDashboard: React.FC<StoreDashboardProps> = ({
  shopifyConfig,
  bigCartelConfig,
  etsyConfig,
  pinterestConfig,
  amazonConfig,
  tiktokConfig,
  walmartConfig,
  ebayConfig,
  wooConfig,
}) => {
  const { products, loading, error, refetch } = useStoreAggregator({
    shopify: shopifyConfig,
    bigCartel: bigCartelConfig,
    etsy: etsyConfig,
    pinterest: pinterestConfig,
    amazon: amazonConfig,
    tiktok: tiktokConfig,
    walmart: walmartConfig,
    ebay: ebayConfig,
    woo: wooConfig,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'price-asc' | 'price-desc' | 'inventory'>('title');

  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
        return matchesSearch && matchesPlatform;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'inventory') return b.inventory - a.inventory;
        return 0;
      });
  }, [products, searchQuery, selectedPlatform, sortBy]);

  const availablePlatforms = useMemo(() => {
    const set = new Set(products.map(p => p.platform));
    return Array.from(set);
  }, [products]);

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen rounded-xl border border-slate-800 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unified Store Command</h2>
          <p className="text-sm text-slate-400">Live multi-platform product and inventory pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
            {products.length} Products Synced
          </span>
          <button
            onClick={refetch}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg hover:bg-slate-700 transition"
          >
            Sync Now
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search products across stores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
        />

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-slate-500 capitalize"
          >
            <option value="all">All Platforms</option>
            {availablePlatforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-slate-500"
          >
            <option value="title">Sort by Title</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="inventory">Inventory: High to Low</option>
          </select>
        </div>
      </div>

      {loading && products.length === 0 && (
        <div className="flex justify-center items-center py-20 text-slate-400">
          Syncing connected storefronts...
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No products found matching your criteria.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
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
              <span className="text-lg font-bold text-emerald-400">
                {product.currency} {product.price.toFixed(2)}
              </span>
              {product.inventory !== undefined && (
                <span className={`text-xs ${product.inventory === 0 ? 'text-rose-400 font-medium' : 'text-slate-400'}`}>
                  Stock: {product.inventory}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
