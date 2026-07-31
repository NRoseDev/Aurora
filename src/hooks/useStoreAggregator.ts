// src/hooks/useStoreAggregator.ts
import { useState, useEffect } from 'react';
import { ShopifyService } from '../services/shopifyService';
import { BigCartelService } from '../services/bigCartelService';

export interface UnifiedProduct {
  id: string;
  platform: 'amazon' | 'etsy' | 'shopify' | 'bigcartel';
  title: string;
  price: string;
  status: string;
  inventory?: number;
  url?: string;
}

export interface StoreAggregatorState {
  products: UnifiedProduct[];
  loading: boolean;
  error: string | null;
}

export function useStoreAggregator(credentials?: {
  shopify?: { shopDomain: string; accessToken: string };
  bigCartel?: { accountId: string; accessToken: string };
}) {
  const [state, setState] = useState<StoreAggregatorState>({
    products: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    async function fetchAllStores() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const aggregatedProducts: UnifiedProduct[] = [];

      try {
        // 1. Fetch Shopify Products if credentials provided
        if (credentials?.shopify) {
          const shopify = new ShopifyService(credentials.shopify);
          const shopifyProducts = await shopify.fetchProducts();
          
          shopifyProducts.forEach((p) => {
            const variant = p.variants.edges[0]?.node;
            aggregatedProducts.push({
              id: `shopify-${p.id}`,
              platform: 'shopify',
              title: p.title,
              price: variant ? variant.price : '0.00',
              status: p.status,
              inventory: variant ? variant.inventoryQuantity : 0,
            });
          });
        }

        // 2. Fetch Big Cartel Products if credentials provided
        if (credentials?.bigCartel) {
          const bigCartel = new BigCartelService(credentials.bigCartel);
          const bigCartelProducts = await bigCartel.fetchProducts();

          bigCartelProducts.forEach((p) => {
            aggregatedProducts.push({
              id: `bigcartel-${p.id}`,
              platform: 'bigcartel',
              title: p.attributes.name,
              price: p.attributes.default_price,
              status: p.attributes.status,
            });
          });
        }

        // Amazon & Etsy placeholders can be injected here similarly

        setState({
          products: aggregatedProducts,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setState({
          products: [],
          loading: false,
          error: err.message || 'Failed to sync connected storefronts',
        });
      }
    }

    fetchAllStores();
  }, [credentials?.shopify?.shopDomain, credentials?.bigCartel?.accountId]);

  return state;
}
