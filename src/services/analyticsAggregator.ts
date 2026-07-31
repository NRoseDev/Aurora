// src/services/analyticsAggregator.ts
import { fetchAllOrders, UnifiedOrder } from './orderAggregator';
import { fetchAllProducts, UnifiedProduct } from './storeAggregator';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  platformBreakdown: {
    platform: string;
    revenue: number;
    orderCount: number;
  }[];
}

interface ConfigProps {
  shopify?: { shopDomain: string; accessToken: string };
  woo?: { siteUrl: string; consumerKey: string; consumerSecret: string };
  bigCartel?: { accountId: string; accessToken: string };
}

export async function fetchAnalyticsSummary(configs: ConfigProps): Promise<AnalyticsSummary> {
  const [orders, products] = await Promise.all([
    fetchAllOrders(configs),
    fetchAllProducts(configs),
  ]);

  let totalRevenue = 0;
  const platformMap: { [key: string]: { revenue: number; orderCount: number } } = {};

  orders.forEach((order: UnifiedOrder) => {
    totalRevenue += order.total;
    if (!platformMap[order.platform]) {
      platformMap[order.platform] = { revenue: 0, orderCount: 0 };
    }
    platformMap[order.platform].revenue += order.total;
    platformMap[order.platform].orderCount += 1;
  });

  const lowStockCount = products.filter((p: UnifiedProduct) => p.inventory <= 5).length;

  const platformBreakdown = Object.keys(platformMap).map((platform) => ({
    platform,
    revenue: platformMap[platform].revenue,
    orderCount: platformMap[platform].orderCount,
  }));

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    lowStockCount,
    platformBreakdown,
  };
}
