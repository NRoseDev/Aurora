```ts
// src/services/orderAggregator.ts

export interface UnifiedOrder {
  id: string;
  orderNumber: string;
  platform: string;
  createdAt: string;
  total: number;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  customerName: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderAggregatorConfigs {
  shopify?: { shopDomain: string; accessToken: string };
  woo?: { siteUrl: string; consumerKey: string; consumerSecret: string };
  bigCartel?: { accountId: string; accessToken: string };
  [key: string]: any;
}

export const fetchAllOrders = async (
  configs: OrderAggregatorConfigs
): Promise<UnifiedOrder[]> => {
  const orderPromises: Promise<UnifiedOrder[]>[] = [];

  // Shopify Orders
  if (configs.shopify) {
    orderPromises.push(
      fetch(
        `https://${configs.shopify.shopDomain}/admin/api/2024-01/orders.json?status=any`,
        {
          headers: {
            'X-Shopify-Access-Token': configs.shopify.accessToken,
          },
        }
      )
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch Shopify orders');
          const data = await res.json();

          return data.orders.map(
            (order: any): UnifiedOrder => ({
              id: order.id.toString(),
              orderNumber: order.name,
              platform: 'shopify',
              createdAt: order.created_at,
              total: parseFloat(order.total_price),
              currency: order.currency,
              financialStatus: order.financial_status,
              fulfillmentStatus:
                order.fulfillment_status || 'unfulfilled',
              customerName: order.customer
                ? `${order.customer.first_name} ${order.customer.last_name}`
                : 'Guest',
              items: order.line_items.map((item: any) => ({
                title: item.name,
                quantity: item.quantity,
                price: parseFloat(item.price),
              })),
            })
          );
        })
        .catch((err) => {
          console.error('Shopify Orders Error:', err);
          return [];
        })
    );
  }

  // WooCommerce Orders
  if (configs.woo) {
    const credentials = `Basic ${btoa(
      `${configs.woo.consumerKey}:${configs.woo.consumerSecret}`
    )}`;

    orderPromises.push(
      fetch(`${configs.woo.siteUrl}/wp-json/wc/v3/orders`, {
        headers: {
          Authorization: credentials,
          'Content-Type': 'application/json',
        },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch WooCommerce orders');
          const data = await res.json();

          return data.map(
            (order: any): UnifiedOrder => ({
              id: order.id.toString(),
              orderNumber: order.number,
              platform: 'woocommerce',
              createdAt: order.date_created,
              total: parseFloat(order.total),
              currency: order.currency,
              financialStatus: order.status,
              fulfillmentStatus: order.status,
              customerName: `${order.billing.first_name} ${order.billing.last_name}`,
              items: order.line_items.map((item: any) => ({
                title: item.name,
                quantity: item.quantity,
                price: parseFloat(item.price),
              })),
            })
          );
        })
        .catch((err) => {
          console.error('WooCommerce Orders Error:', err);
          return [];
        })
    );
  }

  const results = await Promise.all(orderPromises);

  return results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
};
```
