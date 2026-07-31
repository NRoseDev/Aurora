// src/components/OrdersTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllOrders, UnifiedOrder } from '../services/orderAggregator';

interface OrdersTabProps {
  shopifyConfig?: { shopDomain: string; accessToken: string };
  wooConfig?: { siteUrl: string; consumerKey: string; consumerSecret: string };
  bigCartelConfig?: { accountId: string; accessToken: string };
  [key: string]: any;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  shopifyConfig,
  wooConfig,
  bigCartelConfig,
}) => {
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllOrders({
        shopify: shopifyConfig,
        woo: wooConfig,
        bigCartel: bigCartelConfig,
      });
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [shopifyConfig, wooConfig, bigCartelConfig]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || order.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen rounded-xl border border-slate-800 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unified Sales & Orders</h2>
          <p className="text-sm text-slate-400">Real-time incoming orders across all connected storefronts</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
            {orders.length} Total Orders
          </span>
          <button
            onClick={loadOrders}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg hover:bg-slate-700 transition"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search by order # or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
        />

        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-slate-500 capitalize w-full md:w-auto"
        >
          <option value="all">All Platforms</option>
          <option value="shopify">Shopify</option>
          <option value="woocommerce">WooCommerce</option>
        </select>
      </div>

      {loading && orders.length === 0 && (
        <div className="flex justify-center items-center py-20 text-slate-400">
          Syncing order history...
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No orders found.
        </div>
      )}

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-600 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {order.platform}
                </span>
                <span className="font-bold text-slate-200">Order #{order.orderNumber}</span>
                <span className="text-xs text-slate-400">({new Date(order.createdAt).toLocaleString()})</span>
              </div>
              <div className="text-sm text-slate-300">
                Customer: <span className="font-medium text-slate-100">{order.customerName}</span>
              </div>
              <div className="text-xs text-slate-400">
                Items: {order.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-1">
              <span className="text-lg font-bold text-emerald-400">
                {order.currency.toUpperCase()} {order.total.toFixed(2)}
              </span>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/50 capitalize">
                  Payment: {order.financialStatus}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/50 capitalize">
                  Fulfillment: {order.fulfillmentStatus}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
