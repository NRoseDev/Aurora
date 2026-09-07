```ts
// src/services/storeMutations.ts

interface UpdatePayload {
  price?: number;
  inventory?: number;
}

export const updateProductOnPlatform = async (
  platform: string,
  productId: string,
  updates: UpdatePayload,
  configs: Record<string, any>
): Promise<boolean> => {
  switch (platform.toLowerCase()) {
    case 'shopify': {
      const config = configs.shopify;
      if (!config) throw new Error('Missing Shopify configuration');

      const response = await fetch(
        `https://${config.shopDomain}/admin/api/2024-01/products/${productId}.json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': config.accessToken,
          },
          body: JSON.stringify({
            product: {
              id: productId,
              variants: updates.price !== undefined
                ? [{ price: updates.price }]
                : undefined,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update Shopify product');
      return true;
    }

    case 'bigcartel': {
      const config = configs.bigCartel;
      if (!config) throw new Error('Missing Big Cartel configuration');

      const response = await fetch(
        `https://api.bigcartel.com/v1/accounts/${config.accountId}/products/${productId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/vnd.api+json',
          },
          body: JSON.stringify({
            data: {
              id: productId,
              type: 'products',
              attributes: {
                ...(updates.price !== undefined && { price: updates.price }),
                ...(updates.inventory !== undefined && {
                  stock: updates.inventory,
                }),
              },
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update Big Cartel product');
      return true;
    }

    case 'woocommerce': {
      const config = configs.woo;
      if (!config) throw new Error('Missing WooCommerce configuration');

      const credentials = `Basic ${btoa(
        `${config.consumerKey}:${config.consumerSecret}`
      )}`;

      const response = await fetch(
        `${config.siteUrl}/wp-json/wc/v3/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: credentials,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...(updates.price !== undefined && {
              regular_price: updates.price.toString(),
            }),
            ...(updates.inventory !== undefined && {
              stock_quantity: updates.inventory,
              manage_stock: true,
            }),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update WooCommerce product');
      return true;
    }

    default:
      throw new Error(
        `Mutation service not implemented for platform: ${platform}`
      );
  }
};
```
