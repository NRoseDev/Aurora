// src/hooks/useStoreAggregator.ts

import { useCallback, useEffect, useState } from 'react';
import {
  fetchAllProducts,
  UnifiedProduct,
} from '../services/storeAggregator';

export interface StoreAggregatorState {
  products: UnifiedProduct[];
  loading: boolean;
  error: string | null;
}

export interface StoreAggregatorConfigs {
  shopify?: {
    shopDomain: string;
    accessToken: string;
  };
  bigCartel?: {
    accountId: string;
    accessToken: string;
  };
  etsy?: {
    accessToken: string;
    shopId: string;
  };
  pinterest?: {
    accessToken: string;
    merchantId: string;
  };
  amazon?: {
    sellerId: string;
    mwsAuthToken: string;
    marketplaceId: string;
  };
  tiktok?: {
    accessToken: string;
    shopId: string;
  };
  walmart?: {
    clientId: string;
    clientSecret: string;
  };
  ebay?: {
    accessToken: string;
  };
  woo?: {
    siteUrl: string;
    consumerKey: string;
    consumerSecret: string;
  };
}

export function useStoreAggregator(
  credentials?: StoreAggregatorConfigs
) {
  const [state, setState] = useState<StoreAggregatorState>({
    products: [],
    loading: false,
    error: null,
  });

  const loadProducts = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const products = await fetchAllProducts(credentials || {});

      setState({
        products,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      setState({
        products: [],
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : 'Failed to sync connected storefronts',
      });
    }
  }, [credentials]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return {
    ...state,
    refetch: loadProducts,
  };
}
